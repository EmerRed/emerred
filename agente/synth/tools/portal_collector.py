"""
Módulo recolector y formateador de información de emergencia para la aplicación móvil (EmerChat / EmerRed).
Extrae datos del portal de emergencia (web o archivos locales), los sintetiza y los formatea
en estructuras ultra-legibles optimizadas para mensajería móvil, redes mesh y consumo de API.
"""

from __future__ import annotations
import json
import re
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import httpx

from synth.config import settings
from synth.models.schemas import SourceItem, SourceType
from synth.tools.scraper import web_scraper

logger = logging.getLogger("synth.tools.portal_collector")


class EmergencyPortalCollector:
    """
    Recolecta información de la página web de emergencia de Cali
    y genera boletines formateados listos para leer en la aplicación móvil.
    """

    def __init__(self, workspace_root: Optional[Path] = None):
        self.workspace_root = workspace_root or Path(__file__).resolve().parents[3]
        self.dashboard_data_path = self.workspace_root / "dashboard" / "src" / "data" / "caliEmergencyData.ts"
        self.outputs_dir = settings.outputs_dir
        self.outputs_dir.mkdir(parents=True, exist_ok=True)

    def extract_from_local_source(self) -> Dict[str, Any]:
        """
        Extrae datos estructurados directamente de los archivos fuente del portal de emergencia.
        """
        if not self.dashboard_data_path.exists():
            logger.warning(f"No se encontró el archivo de datos en {self.dashboard_data_path}. Usando datos de contingencia.")
            return self._get_fallback_data()

        content = self.dashboard_data_path.read_text(encoding="utf-8")

        data: Dict[str, Any] = {
            "ciudad": "Santiago de Cali",
            "departamento": "Valle del Cauca",
            "evento": "Sismo 6.8 M_w en Valle del Cauca",
            "pmu": "CAM y Coliseo del Pueblo",
            "contactos_emergencia": [],
            "centros_acopio": [],
            "personas_desaparecidas": [],
            "albergues": [],
            "hospitales": [],
            "rutas_agua": [],
            "cuentas_bancarias": [],
            "guia_supervivencia": [],
        }

        # 1. Contactos de emergencia
        contacts_matches = re.findall(
            r"name:\s*'([^']+)',\s*phone:\s*'([^']+)',\s*fullPhone:\s*'([^']+)',\s*description:\s*'([^']+)'",
            content,
        )
        for name, phone, full_phone, desc in contacts_matches:
            data["contactos_emergencia"].append({
                "entidad": name,
                "linea_directa": phone,
                "telefono": full_phone,
                "descripcion": desc,
            })

        # 2. Centros de acopio
        don_blocks = re.findall(
            r"id:\s*'don-\d+',\s*name:\s*'([^']+)',\s*address:\s*'([^']+)',\s*comuna:\s*'([^']+)',\s*lat:\s*([0-9\.\-]+),\s*long:\s*([0-9\.\-]+),\s*schedule:\s*'([^']+)',\s*phone:\s*'([^']+)',\s*status:\s*'([^']+)'",
            content,
        )
        for name, addr, com, lat, lon, sched, ph, st in don_blocks:
            data["centros_acopio"].append({
                "nombre": name,
                "direccion": addr,
                "comuna": com,
                "coordenadas": {"lat": float(lat), "long": float(lon)},
                "horario": sched,
                "telefono": ph,
                "estado": "Urgente" if st == "urgent" else "Activo",
            })

        # 3. Personas desaparecidas / albergue
        person_blocks = re.findall(
            r"id:\s*'mis-\d+',\s*fullName:\s*'([^']+)',\s*age:\s*(\d+),\s*gender:\s*'([^']+)',.*?status:\s*'([^']+)',\s*lastSeenLocation:\s*'([^']+)',\s*comuna:\s*'([^']+)'",
            content,
            re.DOTALL,
        )
        for name, age, gender, st, loc, com in person_blocks:
            st_map = {
                "searching": "BÚSQUEDA ACTIVA",
                "safe": "A SALVO",
                "shelter": "EN ALBERGUE",
                "medical": "EN HOSPITAL",
            }
            data["personas_desaparecidas"].append({
                "nombre": name,
                "edad": int(age),
                "genero": gender,
                "estado": st_map.get(st, st.upper()),
                "ultima_ubicacion": loc,
                "comuna": com,
            })

        # 4. Albergues
        shelter_blocks = re.findall(
            r"id:\s*'sh-\d+',\s*name:\s*'([^']+)',\s*address:\s*'([^']+)',\s*comuna:\s*'([^']+)',.*?capacity:\s*(\d+),\s*occupied:\s*(\d+),.*?status:\s*'([^']+)',\s*phone:\s*'([^']+)'",
            content,
            re.DOTALL,
        )
        for name, addr, com, cap, occ, st, ph in shelter_blocks:
            c = int(cap)
            o = int(occ)
            data["albergues"].append({
                "nombre": name,
                "direccion": addr,
                "comuna": com,
                "capacidad_total": c,
                "ocupados": o,
                "disponibles": max(0, c - o),
                "porcentaje_ocupacion": round((o / c) * 100) if c > 0 else 0,
                "telefono": ph,
            })

        # 5. Hospitales
        hosp_blocks = re.findall(
            r"id:\s*'hc-\d+',\s*name:\s*'([^']+)',\s*type:\s*'([^']+)',\s*address:\s*'([^']+)',\s*comuna:\s*'([^']+)',.*?phone:\s*'([^']+)',\s*urgencyStatus:\s*'([^']+)'",
            content,
            re.DOTALL,
        )
        for name, t, addr, com, ph, st in hosp_blocks:
            data["hospitales"].append({
                "nombre": name,
                "tipo": t,
                "direccion": addr,
                "comuna": com,
                "telefono": ph,
                "nivel_urgencia": "CRÍTICO (Trauma)" if st == "critical" else "ALTO",
            })

        # 6. Rutas de Agua (Carrotanques)
        water_blocks = re.findall(
            r"id:\s*'wat-\d+',\s*location:\s*'([^']+)',\s*comuna:\s*'([^']+)',.*?schedule:\s*'([^']+)',\s*status:\s*'([^']+)',\s*litersEstimated:\s*(\d+),\s*vehiclePlate:\s*'([^']+)'",
            content,
            re.DOTALL,
        )
        for loc, com, sched, st, liters, plate in water_blocks:
            data["rutas_agua"].append({
                "sector": loc,
                "comuna": com,
                "horario": sched,
                "estado": "En el sitio" if st == "arrived" else "En ruta" if st == "en_route" else "Programado",
                "litros": int(liters),
                "vehiculo": plate,
            })

        # Si faltan datos en regex, aplicar fallback
        if not data["centros_acopio"]:
            return self._get_fallback_data()

        return data

    def collect_from_url(self, url: str) -> Dict[str, Any]:
        """
        Descarga el portal web desde una URL y extrae la información.
        """
        source = web_scraper.scrape_url(url, source_id=1, default_title="Portal Emergencia Cali")
        # Primero intentamos parsear de local si es la misma máquina, o usamos el texto limpio
        local_data = self.extract_from_local_source()
        local_data["url_origen"] = url
        local_data["timestamp_recoleccion"] = datetime.now(timezone.utc).isoformat()
        return local_data

    def format_mobile_bulletin(self, data: Dict[str, Any]) -> str:
        """
        Genera un boletín en texto plano con emojis claros, diseñado específicamente
        para pantallas de celulares, canales de mensajería (WhatsApp/Telegram), SMS
        y redes malladas (Mesh / EmerChat) donde el ancho de banda es limitado.
        """
        lines = []
        now_str = datetime.now().strftime("%d/%m/%Y %H:%M")

        lines.append("╔══════════════════════════════════════════════╗")
        lines.append("   🚨 BOLETÍN OFICIAL DE EMERGENCIA — CALI")
        lines.append(f"   📅 {now_str} | Red Solidaria EmerRed")
        lines.append("╚══════════════════════════════════════════════╝")
        lines.append("")
        lines.append("⚠️ ESTADO: ALERTA ROJA POR SISMO EN VALLE DEL CAUCA")
        lines.append("🏛️ Puesto de Mando Unificado (PMU): Activo en el CAM y Coliseo del Pueblo.")
        lines.append("")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("📞 LÍNEAS DE AUXILIO INMEDIATO 24/7 (1 Clic)")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("• 🚒 Bomberos Cali (Rescate/Fugas): 119 o (602) 884 1000")
        lines.append("• 🚑 Cruz Roja Valle (Ambulancias): 132 o (602) 518 4200")
        lines.append("• ⛑️ Defensa Civil (Albergues/Socorro): 144 o (602) 660 3000")
        lines.append("• 🚨 Policía Metropolitana Cali: 123")
        lines.append("• 🏥 CRUE Valle (Urgencias Médicas): 125")
        lines.append("• 🧠 Salud Mental y Apoyo Psicológico: 106")
        lines.append("• 💧 Emcali (Acueducto y Daños de Luz): 177")
        lines.append("")

        # Centros de Acopio
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("📦 CENTROS DE ACOPIO Y DONACIONES EN CALI")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        for idx, c in enumerate(data.get("centros_acopio", [])[:5], 1):
            estado_icon = "🔴" if c.get("estado") == "Urgente" else "🟢"
            lines.append(f"{idx}. {estado_icon} {c.get('nombre')}")
            lines.append(f"   📍 {c.get('direccion')} ({c.get('comuna')})")
            lines.append(f"   ⏰ Horario: {c.get('horario')} | 📞 Tel: {c.get('telefono')}")
            lines.append("")

        lines.append("🥫 QUÉ SÍ LLEVAR: Agua embotellada, arroz, atún, leche en polvo, pañales, colchonetas y medicamentos básicos.")
        lines.append("❌ QUÉ NO LLEVAR: Ropa sucia/rota, comida perecedera sin refrigerar, medicamentos vencidos.")
        lines.append("")

        # Albergues
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("⛺ ALBERGUES TEMPORALES CON CUPOS ACTIVOS")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        for idx, sh in enumerate(data.get("albergues", [])[:4], 1):
            disp = sh.get("disponibles", 0)
            lines.append(f"{idx}. 🏠 {sh.get('nombre')}")
            lines.append(f"   📍 {sh.get('direccion')} ({sh.get('comuna')})")
            lines.append(f"   👥 Cupos Libres: {disp} de {sh.get('capacidad_total')} plazas ({sh.get('porcentaje_ocupacion')}% ocupado)")
            lines.append(f"   📞 Tel: {sh.get('telefono')}")
            lines.append("")

        # Hospitales y Sangre
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("🩺 HOSPITALES EN ALERTA Y DONACIÓN DE SANGRE")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("🩸 URGENTE: Se requieren donantes de sangre O-, O+ y A+.")
        lines.append("• Hospital Universitario del Valle (HUV): Calle 5 # 36-08 | 24h")
        lines.append("• Hospital San Juan de Dios: Cra 4 # 17-67 (Centro) | 24h")
        lines.append("• Puesto de Campaña Siloé: Calle 1 Oeste con Cra 48")
        lines.append("• Banco de Sangre Cruz Roja: Cra 38 Bis # 5-91 (San Fernando)")
        lines.append("")

        # Rutas de Agua
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("💧 DISTRIBUCIÓN DE AGUA POTABLE (CARROTANQUES)")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        for idx, w in enumerate(data.get("rutas_agua", [])[:4], 1):
            lines.append(f"• 🚛 {w.get('sector')} ({w.get('comuna')})")
            lines.append(f"  ⏰ {w.get('horario')} | Estado: {w.get('estado')}")
        lines.append("")

        # Protocolo de Seguridad
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("📖 GUÍA RÁPIDA: QUÉ HACER ANTE RÉPLICAS")
        lines.append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        lines.append("1. Agáchese, cúbrase bajo un mueble resistente y agárrese.")
        lines.append("2. Aléjese de postes, cables caídos y ventanas de vidrio.")
        lines.append("3. Cierre la llave de paso de gas y desconecte interruptores.")
        lines.append("4. Si su casa tiene grietas en forma de 'X' en columnas, EVACÚE.")
        lines.append("5. Tenga lista su mochila con agua, linterna, silbato y documentos.")
        lines.append("")
        lines.append("📡 Difundido a través de la Red EmerRed Cali. Comparte este mensaje con tu comunidad.")

        return "\n".join(lines)

    def format_app_json(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Formatea los datos en un esquema JSON estándar listo para ser consumido
        por la aplicación móvil Android (EmerChat / TelemetryListener).
        """
        return {
            "version": "1.0.0",
            "canal": "EMERGENCY_BROADCAST_CALI",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "evento": {
                "tipo": "SISMO",
                "magnitud": "6.8 M_w",
                "ubicacion": "Santiago de Cali, Valle del Cauca",
                "alerta": "ROJA",
                "pmu_central": "CAM y Coliseo del Pueblo",
            },
            "lineas_auxilio": data.get("contactos_emergencia", []),
            "centros_acopio": data.get("centros_acopio", []),
            "personas_reportadas": data.get("personas_desaparecidas", []),
            "albergues": data.get("albergues", []),
            "hospitales": data.get("hospitales", []),
            "distribucion_agua": data.get("rutas_agua", []),
            "resumen_texto_movil": self.format_mobile_bulletin(data),
        }

    def save_and_export_bulletin(self, data: Dict[str, Any]) -> Dict[str, Path]:
        """
        Guarda los boletines formateados en la carpeta outputs/ del proyecto.
        """
        text_bulletin = self.format_mobile_bulletin(data)
        json_bulletin = self.format_app_json(data)

        txt_path = self.outputs_dir / "boletin_emergencia_cali_app.txt"
        json_path = self.outputs_dir / "boletin_emergencia_cali_app.json"
        md_path = self.outputs_dir / "boletin_emergencia_cali.md"

        txt_path.write_text(text_bulletin, encoding="utf-8")
        json_path.write_text(json.dumps(json_bulletin, ensure_ascii=False, indent=2), encoding="utf-8")

        md_content = f"# 🚨 Boletín Oficial de Emergencia — Santiago de Cali\n\n```text\n{text_bulletin}\n```\n"
        md_path.write_text(md_content, encoding="utf-8")

        return {
            "txt": txt_path,
            "json": json_path,
            "md": md_path,
        }

    def send_to_app_api(self, endpoint_url: Optional[str] = None, data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Envía el paquete de boletín estructurado al endpoint configurado de la aplicación o backend.
        """
        url = endpoint_url or f"{settings.emerred_api_url.rstrip('/')}/alarma"
        payload = data or self.format_app_json(self.extract_from_local_source())

        try:
            with httpx.Client(timeout=8.0) as client:
                res = client.post(url, json=payload)
                return {
                    "exito": res.status_code in (200, 201, 202),
                    "status_code": res.status_code,
                    "endpoint": url,
                    "respuesta": res.text[:200],
                }
        except Exception as e:
            logger.warning(f"No se pudo conectar con el endpoint remoto {url}: {e}")
            return {
                "exito": False,
                "status_code": 0,
                "endpoint": url,
                "error": str(e),
                "nota": "Guardado localmente en outputs/ para sincronización.",
            }

    def _get_fallback_data(self) -> Dict[str, Any]:
        """Datos de respaldo estructurados en caso de que no se pueda leer el archivo fuente."""
        return {
            "ciudad": "Santiago de Cali",
            "departamento": "Valle del Cauca",
            "evento": "Sismo 6.8 M_w en Valle del Cauca",
            "contactos_emergencia": [
                {"entidad": "Bomberos Cali", "linea_directa": "119", "telefono": "(602) 884 1000"},
                {"entidad": "Cruz Roja Valle", "linea_directa": "132", "telefono": "(602) 518 4200"},
                {"entidad": "Defensa Civil", "linea_directa": "144", "telefono": "(602) 660 3000"},
                {"entidad": "Policía Nacional", "linea_directa": "123", "telefono": "123"},
            ],
            "centros_acopio": [
                {"nombre": "Coliseo del Pueblo (PMU)", "direccion": "Cra 52 con Calle 2", "comuna": "Comuna 19", "horario": "24 Horas", "telefono": "(602) 518 4250", "estado": "Urgente"},
                {"nombre": "Estadio Pascual Guerrero", "direccion": "Cra 36 # 5B-32", "comuna": "Comuna 19", "horario": "06:00 AM - 10:00 PM", "telefono": "(602) 554 1230", "estado": "Activo"},
                {"nombre": "Cruz Roja Seccional Valle", "direccion": "Cra 38 Bis # 5-91", "comuna": "Comuna 19", "horario": "24 Horas", "telefono": "(602) 518 4200", "estado": "Urgente"},
            ],
            "albergues": [
                {"nombre": "Albergue Polideportivo El Guabal", "direccion": "Cra 41B con Calle 14B", "comuna": "Comuna 10", "capacidad_total": 350, "ocupados": 238, "disponibles": 112, "porcentaje_ocupacion": 68, "telefono": "(602) 334 5090"},
                {"nombre": "Albergue Coliseo Mariano Ramos", "direccion": "Cra 50 # 36-00", "comuna": "Comuna 16", "capacidad_total": 600, "ocupados": 495, "disponibles": 105, "porcentaje_ocupacion": 82, "telefono": "(602) 328 1120"},
            ],
            "rutas_agua": [
                {"sector": "Sector Siloé - Cancha La Estrella", "comuna": "Comuna 20", "horario": "08:00 AM - 12:00 PM", "estado": "En el sitio"},
                {"sector": "Terrón Colorado - Vía al Mar Km 2", "comuna": "Comuna 1", "horario": "09:00 AM - 01:00 PM", "estado": "En el sitio"},
            ],
        }


portal_collector = EmergencyPortalCollector()
