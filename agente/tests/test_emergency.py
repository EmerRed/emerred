"""
Pruebas unitarias para el modelo de datos, cliente HTTP de telemetría y buffer offline de EmerRed.
"""

import json
import pytest
import httpx
from pathlib import Path
from unittest.mock import patch, MagicMock

from synth.models.schemas import (
    Coordenadas,
    PotenciaRed,
    AfectadoReportInput,
    AfectadoReportResponse,
)
from synth.tools.emergency_client import EmerRedClient


# ==========================================
# 1. Pruebas de Validación de Esquemas
# ==========================================

def test_schema_valid_nested():
    """Verifica el parseo correcto de un JSON anidado estándar con coneccion_mesh."""
    raw_data = {
        "coordenadas": {
            "lat": 4.60971,
            "long": -74.08175,
            "precision_metros": 10.0,
        },
        "numero_celular": "+57 300 123 4567",
        "potencia_red_movil": {
            "valor_dbm": -82,
            "tipo_red": "4G_LTE",
            "operador": "Claro",
        },
        "coneccion_mesh": True,
        "nivel_bateria": 85,
    }

    report = AfectadoReportInput.from_raw_json(raw_data)
    assert report.lat == pytest.approx(4.60971)
    assert report.long == pytest.approx(-74.08175)
    assert report.numero_celular == "+573001234567"
    assert report.potencia_red_movil_dbm == -82
    assert report.tipo_red == "4G_LTE"
    assert report.calidad_red == "Buena"
    assert report.coneccion_mesh is True
    assert report.nivel_bateria == 85

    payload = report.to_emerred_payload()
    assert payload["coordenadas"]["lat"] == pytest.approx(4.60971)
    assert payload["numero_celular"] == "+573001234567"
    assert payload["potencia_red_movil"]["valor_dbm"] == -82
    assert payload["coneccion_mesh"] is True
    assert "mensaje" not in payload


def test_schema_valid_flat():
    """Verifica el parseo flexible de un JSON plano con alias de campos."""
    raw_data = {
        "lat": 6.2442,
        "long": -75.5812,
        "celular": "3109876543",
        "potencia_red": -68,
        "tipo_red": "5G",
        "coneccion_mesh": False,
    }

    report = AfectadoReportInput.from_raw_json(raw_data)
    assert report.lat == pytest.approx(6.2442)
    assert report.long == pytest.approx(-75.5812)
    assert report.numero_celular == "3109876543"
    assert report.potencia_red_movil_dbm == -68
    assert report.calidad_red == "Excelente"
    assert report.coneccion_mesh is False


def test_schema_coneccion_mesh_boolean_parsing():
    """Verifica que coneccion_mesh soporte booleanos, strings y defaults."""
    # Test True como string
    r1 = AfectadoReportInput.from_raw_json({
        "lat": 4.0, "long": -74.0, "celular": "3001234567", "potencia_red": -80,
        "coneccion_mesh": "true"
    })
    assert r1.coneccion_mesh is True

    # Test False por omisión
    r2 = AfectadoReportInput.from_raw_json({
        "lat": 4.0, "long": -74.0, "celular": "3001234567", "potencia_red": -80
    })
    assert r2.coneccion_mesh is False

    # Test alias conexion_mesh (con x)
    r3 = AfectadoReportInput.from_raw_json({
        "lat": 4.0, "long": -74.0, "celular": "3001234567", "potencia_red": -80,
        "conexion_mesh": True
    })
    assert r3.coneccion_mesh is True


def test_schema_invalid_latitude():
    """Verifica que latitudes fuera de [-90, 90] disparen error de validación."""
    raw_data = {
        "lat": 95.1234,  # Fuera de rango
        "long": -74.0,
        "celular": "3001234567",
        "potencia_red": -80,
    }
    with pytest.raises(Exception):
        AfectadoReportInput.from_raw_json(raw_data)


def test_schema_invalid_longitude():
    """Verifica que longitudes fuera de [-180, 180] disparen error de validación."""
    raw_data = {
        "lat": 4.0,
        "long": -195.0,  # Fuera de rango
        "celular": "3001234567",
        "potencia_red": -80,
    }
    with pytest.raises(Exception):
        AfectadoReportInput.from_raw_json(raw_data)


def test_schema_invalid_phone():
    """Verifica que números telefónicos con caracteres no numéricos fallen."""
    raw_data = {
        "lat": 4.0,
        "long": -74.0,
        "celular": "abc-no-phone",
        "potencia_red": -80,
    }
    with pytest.raises(ValueError, match="Número celular inválido"):
        AfectadoReportInput.from_raw_json(raw_data)


def test_schema_invalid_signal_dbm():
    """Verifica que valores absurdos de señal dBm sean rechazados."""
    raw_data = {
        "lat": 4.0,
        "long": -74.0,
        "celular": "+573001234567",
        "potencia_red": 50,  # Señales móviles estándar no son positivas
    }
    with pytest.raises(Exception):
        AfectadoReportInput.from_raw_json(raw_data)


# ==========================================
# 2. Pruebas del Cliente HTTP EmerRed
# ==========================================

def test_client_send_report_success_200(tmp_path):
    """Verifica el despacho exitoso cuando el servidor responde 200/201."""
    buffer_file = tmp_path / "test_buffer.json"
    client = EmerRedClient(
        api_url="https://api.emerred.org.co/afectado",
        max_retries=1,
        buffer_path=buffer_file,
    )

    mock_transport = httpx.MockTransport(
        lambda req: httpx.Response(
            201,
            json={
                "id_incidente": "INC-2026-9988",
                "mensaje": "Reporte registrado en la central de emergencias",
                "estado": "ACTIVO",
            },
        )
    )

    http_client = httpx.Client(transport=mock_transport)
    
    input_data = {
        "lat": 4.60971,
        "long": -74.08175,
        "numero_celular": "+573001234567",
        "potencia_red_movil": -85,
        "coneccion_mesh": True,
    }

    response = client.send_report(input_data, client=http_client)
    assert response.exito is True
    assert response.codigo_estado == 201
    assert response.id_incidente == "INC-2026-9988"
    assert response.es_offline_buffer is False
    assert client.get_pending_buffer_count() == 0


def test_client_send_report_client_error_400(tmp_path):
    """Verifica que un error 400 Bad Request retorne información del error."""
    buffer_file = tmp_path / "test_buffer.json"
    client = EmerRedClient(
        api_url="https://api.emerred.org.co/afectado",
        max_retries=1,
        buffer_path=buffer_file,
    )

    mock_transport = httpx.MockTransport(
        lambda req: httpx.Response(
            400,
            json={"error": "Estructura de coordenadas no soportada", "codigo": 400},
        )
    )

    http_client = httpx.Client(transport=mock_transport)
    
    input_data = {
        "lat": 4.60971,
        "long": -74.08175,
        "numero_celular": "+573001234567",
        "potencia_red_movil": -85,
        "coneccion_mesh": False,
    }

    response = client.send_report(input_data, client=http_client)
    assert response.exito is False
    assert response.codigo_estado == 400
    assert "Error 400" in response.mensaje_servidor


def test_client_offline_buffer_fallback_on_network_down(tmp_path):
    """
    Verifica que al caerse la conexión (ConnectError), el reporte se guarde
    en la cola offline local con código diferido 202.
    """
    buffer_file = tmp_path / "test_buffer.json"
    client = EmerRedClient(
        api_url="https://api.emerred.org.co/afectado",
        max_retries=2,
        offline_buffer_enabled=True,
        buffer_path=buffer_file,
    )

    def failing_transport(req):
        raise httpx.ConnectError("No route to host / Sin red celular")

    http_client = httpx.Client(transport=httpx.MockTransport(failing_transport))
    
    input_data = {
        "lat": 4.60971,
        "long": -74.08175,
        "numero_celular": "+573001234567",
        "potencia_red_movil": -118,  # Señal crítica
        "coneccion_mesh": True,
    }

    response = client.send_report(input_data, client=http_client)
    assert response.exito is True
    assert response.codigo_estado == 202
    assert response.es_offline_buffer is True
    assert response.id_incidente.startswith("OFFLINE-")
    assert client.get_pending_buffer_count() == 1

    # Verificar contenido del archivo buffer
    assert buffer_file.exists()
    with open(buffer_file, "r", encoding="utf-8") as f:
        stored = json.load(f)
        assert len(stored) == 1
        assert stored[0]["report_payload"]["numero_celular"] == "+573001234567"
        assert stored[0]["report_payload"]["potencia_red_movil"]["valor_dbm"] == -118
        assert stored[0]["report_payload"]["coneccion_mesh"] is True
        assert "mensaje" not in stored[0]["report_payload"]


def test_client_flush_buffer_when_connection_restored(tmp_path):
    """Verifica que flush_offline_buffer sincronice los reportes cuando la red vuelve."""
    buffer_file = tmp_path / "test_buffer.json"
    client = EmerRedClient(
        api_url="https://api.emerred.org.co/afectado",
        max_retries=1,
        offline_buffer_enabled=True,
        buffer_path=buffer_file,
    )

    # 1. Provocar guardado en buffer offline
    def failing_transport(req):
        raise httpx.ConnectError("Sin red")

    client.send_report(
        {
            "lat": 4.60,
            "long": -74.08,
            "celular": "3001112233",
            "potencia_red": -110,
            "coneccion_mesh": True,
        },
        client=httpx.Client(transport=httpx.MockTransport(failing_transport)),
    )
    assert client.get_pending_buffer_count() == 1

    # 2. Restaurar conexión y hacer flush
    mock_success_transport = httpx.MockTransport(
        lambda req: httpx.Response(200, json={"id_incidente": "INC-SYNC-01", "mensaje": "OK"})
    )
    sync_client = httpx.Client(transport=mock_success_transport)

    flush_res = client.flush_offline_buffer(client=sync_client)
    assert flush_res["total_procesados"] == 1
    assert flush_res["sincronizados"] == 1
    assert flush_res["restantes_en_cola"] == 0
    assert client.get_pending_buffer_count() == 0
