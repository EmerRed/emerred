"""
Extractor resiliente de páginas web y artículos usando Trafilatura, httpx y BeautifulSoup.
"""

from __future__ import annotations
import re
from typing import Optional, List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed
import httpx
import trafilatura
from bs4 import BeautifulSoup

from synth.config import settings
from synth.models.schemas import SourceItem, SourceType


class WebScraper:
    """Scraper robusto y optimizado para extracción de texto limpio."""

    def __init__(self, timeout: int = 15, max_chars: int = 12000):
        self.timeout = timeout
        self.max_chars = max_chars
        self.headers = {
            "User-Agent": settings.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "DNT": "1",
            "Upgrade-Insecure-Requests": "1",
        }

    def fetch_page_content(self, url: str) -> Optional[str]:
        """Descarga el HTML crudo de una URL con manejo de errores y redirecciones."""
        try:
            with httpx.Client(
                timeout=self.timeout,
                follow_redirects=True,
                headers=self.headers,
                verify=False,
            ) as client:
                response = client.get(url)
                if response.status_code == 200:
                    return response.text
        except Exception:
            pass

        # Intento secundario con el descargador integrado de trafilatura
        try:
            return trafilatura.fetch_url(url)
        except Exception:
            return None

    def scrape_url(self, url: str, source_id: int = 1, default_title: Optional[str] = None) -> SourceItem:
        """Extrae el contenido limpio, título y metadatos de una URL."""
        html_content = self.fetch_page_content(url)
        if not html_content:
            return SourceItem(
                id=source_id,
                title=default_title or url,
                url=url,
                source_type=SourceType.DIRECT_URL,
                clean_content="[No se pudo descargar el contenido de esta página o está protegida contra bots]",
                word_count=0,
            )

        # 1. Extracción con Trafilatura (modo lector especializado)
        clean_text = ""
        extracted_metadata: Dict[str, Any] = {}
        try:
            doc = trafilatura.extract(
                html_content,
                include_comments=False,
                include_tables=True,
                include_links=False,
                output_format="txt",
                with_metadata=True,
            )
            if doc:
                clean_text = doc.strip()
        except Exception:
            pass

        # 2. Respaldo con BeautifulSoup si trafilatura extrajo muy poco texto
        soup = None
        try:
            soup = BeautifulSoup(html_content, "html.parser")
        except Exception:
            pass

        title = default_title or ""
        author = None
        date = None

        if soup:
            # Extraer título si falta
            if not title:
                title_tag = soup.find("title") or soup.find("h1")
                if title_tag:
                    title = title_tag.get_text().strip()

            # Extraer meta author y date
            meta_author = soup.find("meta", attrs={"name": re.compile(r"author", re.I)})
            if meta_author and meta_author.get("content"):
                author = meta_author.get("content").strip()

            meta_date = (
                soup.find("meta", attrs={"property": "article:published_time"})
                or soup.find("meta", attrs={"name": "date"})
                or soup.find("meta", attrs={"name": "pubdate"})
            )
            if meta_date and meta_date.get("content"):
                date = meta_date.get("content").strip()

            if not clean_text or len(clean_text) < 150:
                # Remover scripts, styles y navs
                for tag in soup(["script", "style", "nav", "footer", "header", "aside", "noscript"]):
                    tag.decompose()
                body_text = soup.get_text(separator="\n", strip=True)
                lines = [line.strip() for line in body_text.splitlines() if len(line.strip()) > 30]
                clean_text = "\n\n".join(lines)

        if not title:
            title = url

        # Limitar longitud para optimizar presupuesto de tokens
        if len(clean_text) > self.max_chars:
            clean_text = clean_text[: self.max_chars] + "\n...[Contenido truncado por longitud]"

        words = len(clean_text.split())

        return SourceItem(
            id=source_id,
            title=title,
            url=url,
            source_type=SourceType.DIRECT_URL,
            clean_content=clean_text if clean_text else "[Sin contenido textual extraíble]",
            snippet=clean_text[:250] if clean_text else None,
            author=author,
            published_date=date,
            word_count=words,
        )

    def scrape_multiple(self, urls: List[str], start_id: int = 1) -> List[SourceItem]:
        """Descarga y procesa múltiples URLs en paralelo."""
        results: List[SourceItem] = []
        with ThreadPoolExecutor(max_workers=min(len(urls), 6)) as executor:
            future_to_url = {
                executor.submit(self.scrape_url, url, start_id + idx): (idx, url)
                for idx, url in enumerate(urls)
            }
            for future in as_completed(future_to_url):
                try:
                    item = future.result()
                    results.append(item)
                except Exception:
                    pass

        # Ordenar por ID para consistencia
        results.sort(key=lambda x: x.id)
        return results


# Instancia por defecto
web_scraper = WebScraper()
