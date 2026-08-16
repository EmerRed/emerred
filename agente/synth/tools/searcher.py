"""
Módulo de búsqueda web y de noticias con soporte para scraping automático de páginas encontradas.
"""

from __future__ import annotations
from typing import List, Optional, Set
import time

try:
    from ddgs import DDGS
except ImportError:
    from duckduckgo_search import DDGS

from synth.config import settings
from synth.models.schemas import SourceItem, SourceType
from synth.tools.scraper import WebScraper


class WebSearcher:
    """Buscador web y de noticias con extracción de contenido profundo."""

    def __init__(self, scraper: Optional[WebScraper] = None):
        self.scraper = scraper or WebScraper()

    def search_web(
        self,
        query: str,
        max_results: Optional[int] = None,
        scrape_full_content: bool = True,
        start_id: int = 1,
    ) -> List[SourceItem]:
        """Realiza una búsqueda web general y opcionalmente extrae el texto de las páginas."""
        limit = max_results or settings.max_search_results
        items: List[SourceItem] = []

        try:
            ddgs = DDGS()
            raw_results = list(ddgs.text(query, max_results=limit))
        except Exception as e:
            raw_results = []

        urls_to_scrape = []
        for idx, res in enumerate(raw_results, start=start_id):
            title = res.get("title") or f"Resultado {idx}"
            url = res.get("href") or res.get("link") or ""
            snippet = res.get("body") or res.get("snippet") or ""

            item = SourceItem(
                id=idx,
                title=title,
                url=url,
                source_type=SourceType.WEB_SEARCH,
                snippet=snippet,
                clean_content=snippet,
                word_count=len(snippet.split()),
            )
            items.append(item)
            if url and scrape_full_content:
                urls_to_scrape.append((item, url))

        # Enriquecer con scraping completo en paralelo si se solicita
        if urls_to_scrape:
            scraped_items = self.scraper.scrape_multiple(
                [u for _, u in urls_to_scrape],
                start_id=start_id,
            )
            # Combinar información
            scraped_dict = {s.url: s for s in scraped_items if s.url}
            for item in items:
                if item.url in scraped_dict:
                    scraped = scraped_dict[item.url]
                    if scraped.clean_content and len(scraped.clean_content) > len(item.clean_content):
                        item.clean_content = scraped.clean_content
                        item.word_count = scraped.word_count
                        if scraped.author:
                            item.author = scraped.author
                        if scraped.published_date:
                            item.published_date = scraped.published_date
                        if scraped.title and len(scraped.title) > len(item.title):
                            item.title = scraped.title

        return items

    def search_news(
        self,
        query: str,
        max_results: Optional[int] = None,
        scrape_full_content: bool = True,
        start_id: int = 1,
    ) -> List[SourceItem]:
        """Realiza una búsqueda de noticias recientes."""
        limit = max_results or settings.max_search_results
        items: List[SourceItem] = []

        try:
            ddgs = DDGS()
            raw_results = list(ddgs.news(query, max_results=limit))
        except Exception:
            raw_results = []

        urls_to_scrape = []
        for idx, res in enumerate(raw_results, start=start_id):
            title = res.get("title") or f"Noticia {idx}"
            url = res.get("url") or res.get("link") or ""
            snippet = res.get("body") or res.get("snippet") or ""
            date = res.get("date")
            source_name = res.get("source")

            item = SourceItem(
                id=idx,
                title=title,
                url=url,
                source_type=SourceType.NEWS_SEARCH,
                snippet=snippet,
                clean_content=snippet,
                published_date=date,
                author=source_name,
                word_count=len(snippet.split()),
            )
            items.append(item)
            if url and scrape_full_content:
                urls_to_scrape.append((item, url))

        if urls_to_scrape:
            scraped_items = self.scraper.scrape_multiple(
                [u for _, u in urls_to_scrape],
                start_id=start_id,
            )
            scraped_dict = {s.url: s for s in scraped_items if s.url}
            for item in items:
                if item.url in scraped_dict:
                    scraped = scraped_dict[item.url]
                    if scraped.clean_content and len(scraped.clean_content) > len(item.clean_content):
                        item.clean_content = scraped.clean_content
                        item.word_count = scraped.word_count

        return items

    def search_multi_queries(
        self,
        search_queries: List[str],
        news_queries: Optional[List[str]] = None,
        max_per_query: int = 3,
    ) -> List[SourceItem]:
        """Ejecuta un conjunto de queries deduplicando URLs encontradas."""
        seen_urls: Set[str] = set()
        all_sources: List[SourceItem] = []
        current_id = 1

        # Ejecutar búsquedas generales
        for q in search_queries:
            results = self.search_web(q, max_results=max_per_query, scrape_full_content=True, start_id=current_id)
            for res in results:
                if res.url and res.url in seen_urls:
                    continue
                if res.url:
                    seen_urls.add(res.url)
                res.id = current_id
                all_sources.append(res)
                current_id += 1

        # Ejecutar búsquedas de noticias
        if news_queries:
            for q in news_queries:
                news_results = self.search_news(q, max_results=max_per_query, scrape_full_content=True, start_id=current_id)
                for res in news_results:
                    if res.url and res.url in seen_urls:
                        continue
                    if res.url:
                        seen_urls.add(res.url)
                    res.id = current_id
                    all_sources.append(res)
                    current_id += 1

        return all_sources


# Instancia por defecto
web_searcher = WebSearcher()
