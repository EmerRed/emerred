"""
Configuración central y gestión de entorno para OmniSynth.
"""

from __future__ import annotations
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Cargar variables de entorno locales
ENV_PATH = Path(".env")
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()


class Settings:
    """Configuraciones globales de OmniSynth."""

    def __init__(self):
        self.gemini_api_key: Optional[str] = (
            os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        )
        self.default_model: str = os.getenv("DEFAULT_MODEL", "gemini-2.5-flash")
        self.max_search_results: int = int(os.getenv("MAX_SEARCH_RESULTS", "5"))
        self.max_article_chars: int = int(os.getenv("MAX_ARTICLE_CHARS", "12000"))
        self.temperature: float = float(os.getenv("TEMPERATURE", "0.3"))
        self.outputs_dir: Path = Path(os.getenv("OUTPUTS_DIR", "outputs"))
        self.data_dir: Path = Path(os.getenv("DATA_DIR", "data"))
        self.request_timeout: int = int(os.getenv("REQUEST_TIMEOUT", "15"))
        self.user_agent: str = (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OmniSynth/0.1.0"
        )

        # Configuración del servicio de Emergencia (EmerRed)
        self.emerred_api_url: str = os.getenv(
            "EMERRED_API_URL", "https://api.emerred.org.co/afectado"
        )
        self.emerred_api_key: Optional[str] = os.getenv("EMERRED_API_KEY")
        self.emerred_timeout_seconds: float = float(os.getenv("EMERRED_TIMEOUT_SECONDS", "10.0"))
        self.emerred_max_retries: int = int(os.getenv("EMERRED_MAX_RETRIES", "3"))
        self.emerred_offline_buffer_enabled: bool = (
            os.getenv("EMERRED_OFFLINE_BUFFER_ENABLED", "true").lower() in ("true", "1", "yes")
        )
        self.emerred_buffer_path: Path = Path(
            os.getenv("EMERRED_BUFFER_PATH", "data/emergency_buffer.json")
        )

        # Crear carpetas de salidas y datos si no existen
        self.outputs_dir.mkdir(parents=True, exist_ok=True)
        self.data_dir.mkdir(parents=True, exist_ok=True)

    @property
    def has_gemini_key(self) -> bool:
        """Verifica si la API key está configurada y no es un valor placeholder."""
        if not self.gemini_api_key:
            return False
        return not self.gemini_api_key.startswith("tu_clave")

    def save_api_key(self, api_key: str, env_file_path: Optional[Path] = None) -> Path:
        """Guarda o actualiza la clave GEMINI_API_KEY en el archivo .env."""
        target_path = env_file_path or ENV_PATH
        api_key = api_key.strip()
        self.gemini_api_key = api_key
        os.environ["GEMINI_API_KEY"] = api_key

        lines = []
        key_found = False
        if target_path.exists():
            with open(target_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GEMINI_API_KEY="):
                        lines.append(f"GEMINI_API_KEY={api_key}\n")
                        key_found = True
                    else:
                        lines.append(line)
        if not key_found:
            lines.append(f"GEMINI_API_KEY={api_key}\n")

        with open(target_path, "w", encoding="utf-8") as f:
            f.writelines(lines)

        return target_path


# Instancia única reutilizable
settings = Settings()
