"""
Cliente de Google Gemini usando el SDK oficial google-genai con manejo de errores y fallbacks.
"""

from __future__ import annotations
import json
import re
from typing import Optional, Dict, Any, List
import httpx

# Importación condicional del SDK de Google (opcional)
_GENAI_SDK_AVAILABLE = False
try:
    from google import genai
    from google.genai import types
    _GENAI_SDK_AVAILABLE = True
except Exception:
    _GENAI_SDK_AVAILABLE = False

from synth.config import settings


class GeminiClient:
    """Encapsula llamadas a modelos de Google Gemini (vía SDK o REST directo)."""

    AVAILABLE_MODELS = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ]

    BASE_REST_URL = "https://generativelanguage.googleapis.com/v1beta/models"

    def __init__(self, api_key: Optional[str] = None, default_model: Optional[str] = None):
        self.api_key = api_key or settings.gemini_api_key
        self.model_name = default_model or settings.default_model
        self._client = None
        self._initialize_client()

    def _initialize_client(self):
        if self.api_key and not self.api_key.startswith("tu_clave"):
            if _GENAI_SDK_AVAILABLE:
                try:
                    self._client = genai.Client(api_key=self.api_key)
                except Exception:
                    self._client = None

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith("tu_clave"))

    def _call_rest_api(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.3,
        model: Optional[str] = None,
        json_mode: bool = False,
    ) -> str:
        """Llamada HTTP REST directa a Gemini (sin requerir ningún SDK externo)."""
        target_model = model or self.model_name
        url = f"{self.BASE_REST_URL}/{target_model}:generateContent?key={self.api_key}"

        body: Dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": temperature},
        }
        if json_mode:
            body["generationConfig"]["responseMimeType"] = "application/json"
        if system_instruction:
            body["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        with httpx.Client(timeout=45) as http_client:
            resp = http_client.post(url, json=body)
            if resp.status_code == 200:
                data = resp.json()
                try:
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                except Exception as e:
                    raise RuntimeError(f"Error parseando respuesta REST de Gemini: {e}")
                return ""
            else:
                error_msg = resp.text
                try:
                    err_json = resp.json()
                    error_msg = err_json.get("error", {}).get("message", resp.text)
                except Exception:
                    pass
                raise RuntimeError(f"Error en API Gemini ({resp.status_code}): {error_msg}")

    def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
    ) -> str:
        """Genera texto plano a partir de un prompt."""
        if not self.is_configured:
            raise ValueError(
                "Clave de API de Gemini no configurada. "
                "Ejecuta 'python main.py config --api-key <TU_KEY>' o añade GEMINI_API_KEY a tu archivo .env"
            )

        target_model = model or self.model_name
        temp = temperature if temperature is not None else settings.temperature

        # 1. Intentar con SDK oficial si está disponible
        if self._client is not None:
            try:
                config = types.GenerateContentConfig(
                    temperature=temp,
                    system_instruction=system_instruction,
                )
                response = self._client.models.generate_content(
                    model=target_model,
                    contents=prompt,
                    config=config,
                )
                return response.text or ""
            except Exception:
                pass

        # 2. Llamada REST directa con httpx (Universal, 100% confiable)
        try:
            return self._call_rest_api(
                prompt=prompt,
                system_instruction=system_instruction,
                temperature=temp,
                model=target_model,
                json_mode=False,
            )
        except Exception as e:
            # Reintentar con modelos alternativos si el modelo seleccionado no responde
            fallback_models = [m for m in self.AVAILABLE_MODELS if m != target_model]
            for fb_model in fallback_models:
                try:
                    res = self._call_rest_api(
                        prompt=prompt,
                        system_instruction=system_instruction,
                        temperature=temp,
                        model=fb_model,
                        json_mode=False,
                    )
                    self.model_name = fb_model
                    return res
                except Exception:
                    continue
            raise RuntimeError(f"Error comunicando con Gemini API: {str(e)}")

    def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Genera y parsea una respuesta JSON estructurada."""
        raw_text = self.generate_text(
            prompt=prompt,
            system_instruction=system_instruction,
            temperature=temperature,
            model=model,
        )

        return self.extract_json(raw_text)

    @staticmethod
    def extract_json(text: str) -> Dict[str, Any]:
        """Extrae de manera tolerante un bloque JSON de un texto con posibles bloques markdown."""
        text = text.strip()

        # Intento directo
        try:
            return json.loads(text)
        except Exception:
            pass

        # Buscar bloques ```json ... ```
        pattern = r"```(?:json)?\s*(\{.*?\})\s*```"
        match = re.search(pattern, text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except Exception:
                pass

        # Buscar el primer '{' y el último '}'
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            substring = text[start_idx : end_idx + 1]
            try:
                return json.loads(substring)
            except Exception:
                pass

        raise ValueError(f"No se pudo parsear JSON válido de la respuesta del modelo:\n{text[:300]}...")


# Instancia por defecto
llm_client = GeminiClient()
