"""
Lector y auto-descubridor de feeds RSS / Atom con extracción de artículos.
"""

from __future__ import annotations
import urllib.parse
from typing import List, Optional, Tuple
import feedparser
import httpx
from bs4 import BeautifulSoup

from synth.config import settings
from synth.models.schemas import SourceItem, SourceType
from synth.tools.scraper import WebScraper


class RSSReader:
    """Procesador de feeds RSS/Atom y auto-detección desde dominios web."""

    def __init__(self, scraper: Optional[WebScraper] = None):
        self.scraper = scraper or WebScraper()

    def discover_feed_url(self, website_url: str) -> Optional[str]:
        """Intenta descubrir automáticamente la URL del feed RSS desde una página web."""
        if not website_url.startswith("http"):
            website_url = "https://" + website_url

        try:
            with httpx.Client(timeout=10, follow_redirects=True, headers={"User-Agent": settings.user_agent}) as client:
                res = client.get(website_url)
                if res.status_code != 200:
                    return None
                soup = BeautifulSoup(res.text, "html.parser")
                feed_link = soup.find(
                    "link",
                    type=lambda t: t in ["application/rss+xml", "application/atom+xml", "application/feed+json"]
                )
                if feed_link and feed_link.get("href"):
                    return urllib.parse.urljoin(website_url, feed_link["href"])
        except Exception:
            pass

        # Rutas comunes
        common_paths = ["/feed", "/rss", "/rss.xml", "/feed.xml", "/atom.xml", "/feeds/posts/default"]
        base_parsed = urllib.parse.urlparse(website_url)
        for path in common_paths:
            test_url = f"{base_parsed.scheme}://{base_parsed.netloc}{path}"
            try:
                with httpx.Client(timeout=5, follow_redirects=True) as client:
                    res = client.head(test_url)
                    if res.status_code == 200:
                        return test_url
            except Exception:
                continue

        return None

    def fetch_feed_items(
        self,
        feed_url_or_site: str,
        max_entries: int = 5,
        scrape_full_body: bool = True,
        start_id: int = 1,
    ) -> Tuple[str, List[SourceItem]]:
        """
        Descarga y procesa las entradas de un feed RSS/Atom.
        Devuelve (título_del_feed, lista_de_SourceItem).
        """
        feed_url = feed_url_or_site
        if not (feed_url.endswith(".xml") or "/feed" in feed_url or "/rss" in feed_url):
            discovered = self.discover_feed_url(feed_url_or_site)
            if discovered:
                feed_url = discovered

        parsed = feedparser.parse(feed_url)
        channel_title = parsed.feed.get("title", feed_url)

        items: List[SourceItem] = []
        entries = parsed.entries[:max_entries]

        urls_to_scrape = []
        for idx, entry in enumerate(entries, start=start_id):
            title = entry.get("title", f"Entrada {idx}")
            link = entry.get("link", "")
            summary = entry.get("summary") or entry.get("description") or ""

            # Limpiar etiquetas HTML del summary
            if summary:
                try:
                    summary = BeautifulSoup(summary, "html.parser").get_text(separator=" ", strip=True)
                except Exception:
                    pass

            pub_date = entry.get("published") or entry.get("updated")
            author = entry.get("author") or channel_title

            item = SourceItem(
                id=idx,
                title=title,
                url=link,
                source_type=SourceType.RSS_FEED,
                snippet=summary[:300] if summary else None,
                clean_content=summary,
                published_date=pub_date,
                author=author,
                word_count=len(summary.split()),
                metadata={"channel": channel_title, "feed_url": feed_url},
            )
            items.append(item)
            if link and scrape_full_body:
                urls_to_scrape.append((item, link))

        # Scrapear el contenido completo de cada artículo si se especificó
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

        return channel_title, items


# Instancia por defecto
rss_reader = RSSReader()
