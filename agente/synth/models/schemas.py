"""
Esquemas de datos Pydantic para el agente OmniSynth.
"""

from __future__ import annotations
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field


class SourceType(str, Enum):
    WEB_SEARCH = "web_search"
    NEWS_SEARCH = "news_search"
    DIRECT_URL = "direct_url"
    RSS_FEED = "rss_feed"
    LOCAL_DOCUMENT = "local_document"


class SourceItem(BaseModel):
    """Representa una fuente de información recolectada y procesada."""
    id: int = Field(default=1, description="Identificador único para citación")
    title: str = Field(default="Sin título", description="Título de la página o documento")
    url: Optional[str] = Field(default=None, description="URL de origen")
    source_type: SourceType = Field(default=SourceType.WEB_SEARCH, description="Tipo de canal de origen")
    snippet: Optional[str] = Field(default=None, description="Fragmento breve o resumen inicial")
    clean_content: str = Field(default="", description="Texto limpio y estructurado")
    published_date: Optional[str] = Field(default=None, description="Fecha de publicación detectada")
    author: Optional[str] = Field(default=None, description="Autor o sitio web emisor")
    word_count: int = Field(default=0, description="Cantidad de palabras del contenido")
    relevance_score: Optional[float] = Field(default=None, description="Puntaje de relevancia estimado")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Metadatos adicionales")

    def summary_preview(self, max_chars: int = 140) -> str:
        text = self.clean_content or self.snippet or ""
        text = " ".join(text.split())
        return text[:max_chars] + "..." if len(text) > max_chars else text


class ResearchPlan(BaseModel):
    """Plan de búsqueda y recolección generado por el agente."""
    topic: str = Field(description="Tema central de la investigación")
    language: str = Field(default="es", description="Idioma principal para la búsqueda y síntesis")
    intent: str = Field(description="Objetivo analítico principal del usuario")
    search_queries: List[str] = Field(default_factory=list, description="Lista de búsquedas web específicas")
    news_queries: List[str] = Field(default_factory=list, description="Búsquedas enfocadas en noticias o eventos recientes")
    focus_angles: List[str] = Field(default_factory=list, description="Ángulos y dimensiones críticas a sintetizar")


class KeyFact(BaseModel):
    """Dato o evento relevante estructurado."""
    fact_or_event: str
    detail: str
    source_id: Optional[int] = None


class SynthesisReport(BaseModel):
    """Informe final estructurado y sintetizado por el modelo."""
    topic: str = Field(description="Tema o pregunta investigada")
    title: str = Field(description="Título formal del informe")
    executive_summary: str = Field(description="Resumen ejecutivo directo y de alto impacto")
    detailed_synthesis: str = Field(description="Cuerpo principal con desglose temático en Markdown")
    key_takeaways: List[str] = Field(default_factory=list, description="Conclusiones y puntos clave")
    key_facts_or_timeline: List[KeyFact] = Field(default_factory=list, description="Línea de tiempo o hechos destacados")
    contrasting_views: List[str] = Field(default_factory=list, description="Puntos de debate, pros/contras o discrepancias")
    sources: List[SourceItem] = Field(default_factory=list, description="Lista de fuentes analizadas con sus IDs de cita")
    model_name: str = Field(default="gemini-2.5-flash", description="Modelo utilizado para la síntesis")
    created_at: datetime = Field(default_factory=datetime.now, description="Fecha y hora de generación")
    total_words_analyzed: int = Field(default=0, description="Total de palabras recopiladas y evaluadas")
    elapsed_seconds: float = Field(default=0.0, description="Tiempo total de ejecución del agente")


# ==========================================
# Telemetría de Afectados y Red de Emergencia
# ==========================================

class Coordenadas(BaseModel):
    """Geolocalización estándar WGS84."""
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitud WGS84 (-90.0 a 90.0)")
    long: float = Field(..., ge=-180.0, le=180.0, description="Longitud WGS84 (-180.0 a 180.0)")
    precision_metros: Optional[float] = Field(default=None, ge=0.0, description="Precisión estimada en metros")


class PotenciaRed(BaseModel):
    """Calidad y potencia de señal móvil en dBm."""
    valor_dbm: int = Field(..., ge=-140, le=-40, description="Potencia en dBm (-140 a -40)")
    tipo_red: str = Field(default="4G_LTE", description="Tipo de tecnología de red (2G, 3G, 4G_LTE, 5G, SATELITAL, UNKNOWN)")
    operador: Optional[str] = Field(default=None, description="Operador móvil (ej. Claro, Movistar, Tigo, WOM)")
    calidad_estimada: Optional[str] = Field(default=None, description="Estimación cualitativa (Excelente, Buena, Regular, Crítica)")

    @classmethod
    def estimar_calidad(cls, dbm: int) -> str:
        """Estima la calidad de la señal celular a partir del nivel de dBm."""
        if dbm >= -75:
            return "Excelente"
        elif dbm >= -90:
            return "Buena"
        elif dbm >= -105:
            return "Regular"
        else:
            return "Crítica / Señal Débil"


class AfectadoReportInput(BaseModel):
    """
    Modelo de entrada para la telemetría de una persona afectada.
    Soporta formato plano o anidado, y normaliza números celulares y métricas de red.
    """
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitud WGS84")
    long: float = Field(..., ge=-180.0, le=180.0, description="Longitud WGS84")
    numero_celular: str = Field(..., description="Número celular normalizado de contacto")
    potencia_red_movil_dbm: int = Field(..., ge=-140, le=-40, description="Potencia en dBm de la red móvil")
    tipo_red: str = Field(default="4G_LTE", description="Tecnología de conexión")
    operador: Optional[str] = Field(default=None, description="Operador de telecomunicaciones")
    coneccion_mesh: bool = Field(default=False, description="Indica si el dispositivo está conectado a través de una red mallada (Mesh)")
    nivel_bateria: Optional[int] = Field(default=None, ge=0, le=100, description="Porcentaje de batería (0-100)")
    calidad_red: Optional[str] = Field(default=None, description="Calidad estimada de la señal")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="Timestamp UTC del reporte")
    metadatos: Dict[str, Any] = Field(default_factory=dict, description="Datos adicionales de contexto")

    @classmethod
    def from_raw_json(cls, data: Dict[str, Any]) -> "AfectadoReportInput":
        """
        Transforma datos de entrada con formatos flexibles (anidados o planos)
        hacia un modelo AfectadoReportInput fuertemente tipado y validado.
        """
        import re
        
        # 1. Extracción de coordenadas
        coords = data.get("coordenadas") or {}
        lat = data.get("lat") or data.get("latitud") or (coords.get("lat") if isinstance(coords, dict) else None)
        lon = data.get("long") or data.get("lon") or data.get("longitud") or (coords.get("long") if isinstance(coords, dict) else None)
        
        if lat is None or lon is None:
            raise ValueError("Las coordenadas 'lat' y 'long' son obligatorias.")
        
        try:
            lat = float(lat)
            lon = float(lon)
        except (ValueError, TypeError):
            raise ValueError(f"Coordenadas inválidas: lat={lat}, long={lon}")

        # 2. Extracción de teléfono
        telefono = (
            data.get("numero_celular")
            or data.get("celular")
            or data.get("telefono")
            or data.get("phone")
        )
        if not telefono:
            raise ValueError("El número celular ('numero_celular' o 'celular') es obligatorio.")
        
        # Limpieza de teléfono
        telefono_str = str(telefono).strip()
        telefono_limpio = re.sub(r"[\s\-\(\)\.]", "", telefono_str)
        if not re.match(r"^\+?[0-9]{7,15}$", telefono_limpio):
            raise ValueError(f"Número celular inválido '{telefono}'. Debe contener entre 7 y 15 dígitos numéricos.")

        # 3. Extracción de potencia de red móvil
        potencia_obj = data.get("potencia_red_movil") or data.get("potencia_red") or data.get("signal") or {}
        if isinstance(potencia_obj, dict):
            potencia_dbm = potencia_obj.get("valor_dbm") or potencia_obj.get("dbm") or potencia_obj.get("valor")
            tipo_red = potencia_obj.get("tipo_red") or data.get("tipo_red") or "4G_LTE"
            operador = potencia_obj.get("operador") or data.get("operador")
        else:
            potencia_dbm = potencia_obj
            tipo_red = data.get("tipo_red") or "4G_LTE"
            operador = data.get("operador")

        if potencia_dbm is None:
            # Fallback a claves planas
            potencia_dbm = data.get("potencia_red_movil_dbm") or data.get("dbm")

        if potencia_dbm is None:
            raise ValueError("La potencia de red móvil ('potencia_red_movil' o 'potencia_red_movil_dbm') es obligatoria.")

        try:
            potencia_dbm = int(potencia_dbm)
        except (ValueError, TypeError):
            raise ValueError(f"Valor de potencia de red inválido: {potencia_dbm}. Debe ser un número entero en dBm.")

        # 4. Extracción de conexión mesh (booleano)
        raw_mesh = (
            data.get("coneccion_mesh")
            if "coneccion_mesh" in data
            else data.get("conexion_mesh", data.get("mesh", data.get("is_mesh", False)))
        )
        if isinstance(raw_mesh, bool):
            coneccion_mesh = raw_mesh
        elif isinstance(raw_mesh, str):
            coneccion_mesh = raw_mesh.strip().lower() in ("true", "1", "t", "yes", "si", "sí", "y")
        elif isinstance(raw_mesh, (int, float)):
            coneccion_mesh = bool(raw_mesh)
        else:
            coneccion_mesh = False

        # 5. Metadatos y campos opcionales
        nivel_bateria = data.get("nivel_bateria") or data.get("battery")
        if nivel_bateria is not None:
            try:
                nivel_bateria = int(nivel_bateria)
            except (ValueError, TypeError):
                nivel_bateria = None

        metadatos = data.get("metadatos") if isinstance(data.get("metadatos"), dict) else {}

        calidad = PotenciaRed.estimar_calidad(potencia_dbm)

        return cls(
            lat=lat,
            long=lon,
            numero_celular=telefono_limpio,
            potencia_red_movil_dbm=potencia_dbm,
            tipo_red=str(tipo_red),
            operador=operador,
            coneccion_mesh=coneccion_mesh,
            nivel_bateria=nivel_bateria,
            calidad_red=calidad,
            metadatos=metadatos
        )

    def to_emerred_payload(self) -> Dict[str, Any]:
        """Convierte el modelo al formato esperado por la API de EmerRed."""
        return {
            "coordenadas": {
                "lat": self.lat,
                "long": self.long
            },
            "numero_celular": self.numero_celular,
            "potencia_red_movil": {
                "valor_dbm": self.potencia_red_movil_dbm,
                "tipo_red": self.tipo_red,
                "calidad_estimada": self.calidad_red,
                "operador": self.operador
            },
            "coneccion_mesh": self.coneccion_mesh,
            "nivel_bateria": self.nivel_bateria,
            "timestamp": self.timestamp.isoformat(),
            "metadatos": self.metadatos
        }


class AfectadoReportResponse(BaseModel):
    """Respuesta tras despachar el reporte de afectado."""
    exito: bool
    codigo_estado: int
    id_incidente: Optional[str] = None
    mensaje_servidor: str
    enviado_a: str
    timestamp_envio: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    es_offline_buffer: bool = False
    detalles: Dict[str, Any] = Field(default_factory=dict)

