"""
Cliente HTTP resiliente para el despacho de telemetría de personas afectadas a la red de emergencia (EmerRed).
Diseñado para operar en condiciones de conectividad inestable o nula (común en áreas con baja señal móvil).
"""

from __future__ import annotations
import json
import logging
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import httpx

from synth.config import settings
from synth.models.schemas import AfectadoReportInput, AfectadoReportResponse

logger = logging.getLogger("synth.tools.emergency_client")


class EmerRedClient:
    """
    Cliente para comunicación con la API de EmerRed (ej. https://api.emerred.org.co/afectado).
    Implementa reintentos con retroceso exponencial y buffer local para contingencia offline.
    """

    def __init__(
        self,
        api_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: Optional[float] = None,
        max_retries: Optional[int] = None,
        offline_buffer_enabled: Optional[bool] = None,
        buffer_path: Optional[Path] = None,
    ):
        self.api_url = (api_url or settings.emerred_api_url).rstrip("/")
        self.api_key = api_key if api_key is not None else settings.emerred_api_key
        self.timeout = timeout if timeout is not None else settings.emerred_timeout_seconds
        self.max_retries = max_retries if max_retries is not None else settings.emerred_max_retries
        self.offline_buffer_enabled = (
            offline_buffer_enabled
            if offline_buffer_enabled is not None
            else settings.emerred_offline_buffer_enabled
        )
        self.buffer_path = buffer_path or settings.emerred_buffer_path
        
        # Asegurar directorio del buffer
        self.buffer_path.parent.mkdir(parents=True, exist_ok=True)

    def _get_headers(self) -> Dict[str, str]:
        """Construye las cabeceras HTTP de la petición."""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": settings.user_agent,
        }
        if self.api_key and not self.api_key.startswith("tu_token"):
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["X-API-Key"] = self.api_key
        return headers

    def parse_input(self, raw_input: Union[str, Dict[str, Any], AfectadoReportInput]) -> AfectadoReportInput:
        """Parsea y valida cualquier formato de entrada (cadena JSON, dict o instancia Pydantic)."""
        if isinstance(raw_input, AfectadoReportInput):
            return raw_input
        
        if isinstance(raw_input, str):
            try:
                data = json.loads(raw_input)
            except json.JSONDecodeError as exc:
                raise ValueError(f"El input provisto no es un JSON válido: {exc}") from exc
        elif isinstance(raw_input, dict):
            data = raw_input
        else:
            raise ValueError(f"Tipo de entrada no soportado: {type(raw_input)}")

        return AfectadoReportInput.from_raw_json(data)

    def _save_to_offline_buffer(self, report: AfectadoReportInput, reason: str = "") -> str:
        """Almacena el reporte en el buffer local cuando no hay conexión disponible."""
        now_utc = datetime.now(timezone.utc)
        offline_id = f"OFFLINE-{now_utc.strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        record = {
            "offline_id": offline_id,
            "created_at": now_utc.isoformat(),
            "reason": reason,
            "report_payload": report.to_emerred_payload(),
        }

        buffer_data = self._read_buffer_records()
        buffer_data.append(record)

        with open(self.buffer_path, "w", encoding="utf-8") as f:
            json.dump(buffer_data, f, ensure_ascii=False, indent=2)

        logger.warning(f"Reporte guardado en buffer offline: {offline_id}. Causa: {reason}")
        return offline_id

    def _read_buffer_records(self) -> List[Dict[str, Any]]:
        """Lee los registros pendientes almacenados en el archivo local de buffer."""
        if not self.buffer_path.exists():
            return []
        try:
            with open(self.buffer_path, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return []
                data = json.loads(content)
                return data if isinstance(data, list) else []
        except Exception as exc:
            logger.error(f"Error al leer buffer local ({self.buffer_path}): {exc}")
            return []

    def get_pending_buffer_count(self) -> int:
        """Retorna el total de reportes pendientes de sincronización."""
        return len(self._read_buffer_records())

    def send_report(
        self,
        report_data: Union[str, Dict[str, Any], AfectadoReportInput],
        client: Optional[httpx.Client] = None,
    ) -> AfectadoReportResponse:
        """
        Valida y despacha el reporte de telemetría al endpoint de EmerRed.
        
        Si la red no está disponible y el buffer offline está activo, el reporte se
        almacena localmente con éxito diferido (código 202).
        """
        # 1. Parseo y Validación
        report = self.parse_input(report_data)
        payload = report.to_emerred_payload()
        headers = self._get_headers()

        attempt = 0
        last_error = ""

        # Usar cliente provisto o crear uno nuevo con timeouts
        owns_client = client is None
        http_client = client or httpx.Client(timeout=httpx.Timeout(self.timeout))

        try:
            while attempt < self.max_retries:
                attempt += 1
                try:
                    logger.info(f"Enviando reporte a {self.api_url} (Intento {attempt}/{self.max_retries})...")
                    response = http_client.post(
                        self.api_url,
                        json=payload,
                        headers=headers,
                    )

                    # Si el servidor responde 200 o 201
                    if response.status_code in (200, 201, 202):
                        resp_data = {}
                        try:
                            resp_data = response.json()
                        except Exception:
                            resp_data = {"raw_text": response.text}

                        incident_id = (
                            resp_data.get("id_incidente")
                            or resp_data.get("id")
                            or resp_data.get("ticket")
                            or resp_data.get("incident_id")
                            or f"INC-{uuid.uuid4().hex[:8]}"
                        )

                        return AfectadoReportResponse(
                            exito=True,
                            codigo_estado=response.status_code,
                            id_incidente=str(incident_id),
                            mensaje_servidor=resp_data.get("mensaje") or "Reporte de afectado registrado correctamente.",
                            enviado_a=self.api_url,
                            es_offline_buffer=False,
                            detalles=resp_data,
                        )

                    # Si hay error 4xx del cliente (ej. 400 Bad Request, 401 Unauthorized, 422 Unprocessable)
                    if 400 <= response.status_code < 500:
                        try:
                            err_details = response.json()
                        except Exception:
                            err_details = {"error_body": response.text}

                        return AfectadoReportResponse(
                            exito=False,
                            codigo_estado=response.status_code,
                            id_incidente=None,
                            mensaje_servidor=f"Error {response.status_code} devuelto por EmerRed: {response.text[:200]}",
                            enviado_a=self.api_url,
                            es_offline_buffer=False,
                            detalles=err_details,
                        )

                    # Errores de servidor (5xx): ameritan reintento
                    last_error = f"HTTP {response.status_code}: {response.text[:150]}"
                    logger.warning(f"Fallo del servidor EmerRed ({last_error}). Reintentando...")

                except (httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError) as net_err:
                    last_error = f"Error de conectividad: {type(net_err).__name__} ({str(net_err)})"
                    logger.warning(f"Error de red al conectar con EmerRed: {last_error}")

                except Exception as ex:
                    last_error = f"Excepción imprevista: {str(ex)}"
                    logger.exception(f"Error inesperado al contactar EmerRed: {ex}")

                # Retroceso exponencial antes del siguiente intento
                if attempt < self.max_retries:
                    sleep_time = 0.5 * (2 ** (attempt - 1))
                    time.sleep(sleep_time)

        finally:
            if owns_client:
                http_client.close()

        # Si agotó todos los reintentos
        if self.offline_buffer_enabled:
            offline_id = self._save_to_offline_buffer(report, reason=last_error)
            return AfectadoReportResponse(
                exito=True,
                codigo_estado=202,
                id_incidente=offline_id,
                mensaje_servidor=(
                    f"Sin conexión inmediata con {self.api_url}. Reporte almacenado en cola offline local ({offline_id}) "
                    f"para sincronización automática al recuperar cobertura."
                ),
                enviado_a="LOCAL_OFFLINE_BUFFER",
                es_offline_buffer=True,
                detalles={
                    "ultimo_error": last_error,
                    "intentos_realizados": attempt,
                    "offline_id": offline_id,
                    "archivo_buffer": str(self.buffer_path),
                },
            )

        # Si el buffer está desactivado y falló
        return AfectadoReportResponse(
            exito=False,
            codigo_estado=0,
            id_incidente=None,
            mensaje_servidor=f"No se pudo establecer comunicación con EmerRed tras {attempt} intentos. Causa: {last_error}",
            enviado_a=self.api_url,
            es_offline_buffer=False,
            detalles={"ultimo_error": last_error, "intentos_realizados": attempt},
        )

    def flush_offline_buffer(self, client: Optional[httpx.Client] = None) -> Dict[str, Any]:
        """
        Intenta sincronizar y despachar todos los reportes acumulados en el buffer offline.
        Los reportes transmitidos exitosamente se remueven del buffer.
        """
        records = self._read_buffer_records()
        if not records:
            return {
                "total_pendientes": 0,
                "sincronizados": 0,
                "fallidos": 0,
                "mensaje": "No hay reportes pendientes en el buffer offline.",
            }

        sincronizados = 0
        fallidos = 0
        remaining_records = []

        owns_client = client is None
        http_client = client or httpx.Client(timeout=httpx.Timeout(self.timeout))

        # Desactivar temporalmente el buffer recursivo durante el flush
        original_buffer_state = self.offline_buffer_enabled
        self.offline_buffer_enabled = False

        try:
            for record in records:
                payload = record.get("report_payload", {})
                offline_id = record.get("offline_id", "DESCONOCIDO")
                try:
                    resp = self.send_report(payload, client=http_client)
                    if resp.exito and not resp.es_offline_buffer:
                        sincronizados += 1
                        logger.info(f"Reporte offline {offline_id} sincronizado exitosamente con ID {resp.id_incidente}")
                    else:
                        fallidos += 1
                        remaining_records.append(record)
                except Exception as exc:
                    logger.error(f"Error al retransmitir reporte offline {offline_id}: {exc}")
                    fallidos += 1
                    remaining_records.append(record)
        finally:
            self.offline_buffer_enabled = original_buffer_state
            if owns_client:
                http_client.close()

            # Guardar registros restantes
            with open(self.buffer_path, "w", encoding="utf-8") as f:
                json.dump(remaining_records, f, ensure_ascii=False, indent=2)

        return {
            "total_procesados": len(records),
            "sincronizados": sincronizados,
            "fallidos": fallidos,
            "restantes_en_cola": len(remaining_records),
            "mensaje": f"Sincronización completada: {sincronizados} enviados, {len(remaining_records)} pendientes.",
        }


# Instancia singleton preconfigurada
emergency_client = EmerRedClient()
