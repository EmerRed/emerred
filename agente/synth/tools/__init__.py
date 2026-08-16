"""
Módulo de herramientas de recolección, scraping, búsqueda y telemetría de emergencia.
"""

from .scraper import WebScraper, web_scraper
from .searcher import WebSearcher, web_searcher
from .rss_reader import RSSReader, rss_reader
from .emergency_client import EmerRedClient, emergency_client

__all__ = [
    "WebScraper",
    "web_scraper",
    "WebSearcher",
    "web_searcher",
    "RSSReader",
    "rss_reader",
    "EmerRedClient",
    "emergency_client",
]
