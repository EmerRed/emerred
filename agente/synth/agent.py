"""
Orquestador central del Agente Autónomo de Investigación y Síntesis (OmniSynth).
"""

from __future__ import annotations
import time
from typing import List, Optional, Callable, Dict, Any
from datetime import datetime

from synth.config import settings
from synth.models.schemas import (
    ResearchPlan,
    SourceItem,
    SourceType,
    SynthesisReport,
    KeyFact,
)
from synth.llm import GeminiClient, llm_client
from synth.tools.scraper import WebScraper, web_scraper
from synth.tools.searcher import WebSearcher, web_searcher
from synth.tools.rss_reader import RSSReader, rss_reader
from synth.prompts import (
    PLANNING_SYSTEM_PROMPT,
    SYNTHESIS_SYSTEM_PROMPT,
    CHAT_WITH_SOURCES_PROMPT,
)


class SynthesisAgent:
    """Agente autónomo que planifica, recolecta y sintetiza información multicanal."""

    def __init__(
        self,
        llm: Optional[GeminiClient] = None,
        searcher: Optional[WebSearcher] = None,
        scraper: Optional[WebScraper] = None,
        feed_reader: Optional[RSSReader] = None,
    ):
        self.llm = llm or llm_client
        self.searcher = searcher or web_searcher
        self.scraper = scraper or web_scraper
        self.feed_reader = feed_reader or rss_reader

    def plan_research(self, topic: str, intent: Optional[str] = None) -> ResearchPlan:
        """Genera un plan de investigación estructurado usando Gemini o heurística de respaldo."""
        user_prompt = f"Tema de investigación: {topic}\n"
        if intent:
            user_prompt += f"Objetivo específico: {intent}\n"

        if self.llm.is_configured:
            try:
                plan_data = self.llm.generate_json(
                    prompt=user_prompt,
                    system_instruction=PLANNING_SYSTEM_PROMPT,
                    temperature=0.2,
                )
                return ResearchPlan(**plan_data)
            except Exception:
                pass

        # Estrategia de respaldo heurística si el LLM aún no está autenticado o falla
        return ResearchPlan(
            topic=topic,
            language="es",
            intent=intent or f"Investigación y análisis integral sobre {topic}",
            search_queries=[
                f"{topic} resumen novedades",
                f"{topic} analisis guia caracteristicas",
                f"{topic} ventajas problemas alternativas",
            ],
            news_queries=[
                f"{topic} noticias recientes",
            ],
            focus_angles=[
                "Definición, estado actual y conceptos clave",
                "Desarrollos recientes y novedades del sector",
                "Ventajas, desafíos y perspectivas a futuro",
            ],
        )

    def gather_sources(
        self,
        plan: ResearchPlan,
        max_per_query: int = 3,
        status_callback: Optional[Callable[[str], None]] = None,
    ) -> List[SourceItem]:
        """Recolecta información ejecutando las consultas web y noticias planeadas."""
        seen_urls = set()
        sources: List[SourceItem] = []
        current_id = 1

        # 1. Búsquedas Web
        for query in plan.search_queries:
            if status_callback:
                status_callback(f"Buscando en la web: '{query}'...")
            results = self.searcher.search_web(
                query=query,
                max_results=max_per_query,
                scrape_full_content=True,
                start_id=current_id,
            )
            for item in results:
                if item.url and item.url in seen_urls:
                    continue
                if item.url:
                    seen_urls.add(item.url)
                item.id = current_id
                sources.append(item)
                current_id += 1

        # 2. Búsquedas de Noticias
        for nquery in plan.news_queries:
            if status_callback:
                status_callback(f"Buscando noticias recientes: '{nquery}'...")
            n_results = self.searcher.search_news(
                query=nquery,
                max_results=max_per_query,
                scrape_full_content=True,
                start_id=current_id,
            )
            for item in n_results:
                if item.url and item.url in seen_urls:
                    continue
                if item.url:
                    seen_urls.add(item.url)
                item.id = current_id
                sources.append(item)
                current_id += 1

        return sources

    def synthesize_sources(
        self,
        topic: str,
        sources: List[SourceItem],
        plan: Optional[ResearchPlan] = None,
        model_name: Optional[str] = None,
    ) -> SynthesisReport:
        """Sintetiza las fuentes recolectadas en un informe analítico estructurado."""
        if not sources:
            return SynthesisReport(
                topic=topic,
                title=f"Investigación sobre {topic}",
                executive_summary="No se encontraron fuentes de información válidas para sintetizar.",
                detailed_synthesis="No fue posible recopilar datos.",
                sources=[],
            )

        # Preparar contexto formateado para el modelo
        context_parts = []
        total_words = 0

        for s in sources:
            total_words += s.word_count
            meta = []
            if s.author:
                meta.append(f"Autor/Medio: {s.author}")
            if s.published_date:
                meta.append(f"Fecha: {s.published_date}")
            if s.url:
                meta.append(f"URL: {s.url}")
            meta_str = " | ".join(meta)

            context_parts.append(
                f"--- FUENTE [{s.id}]: {s.title} ---\n"
                f"{meta_str}\n\n"
                f"{s.clean_content}\n"
            )

        full_context = "\n\n".join(context_parts)

        user_prompt = (
            f"TEMA A SINTETIZAR: {topic}\n\n"
            f"ENFOQUE ANALÍTICO: {plan.intent if plan else 'Síntesis analítica profunda'}\n\n"
            f"FUENTES DISPONIBLES ({len(sources)} fuentes recopiladas):\n\n"
            f"{full_context}\n\n"
            f"Genera el informe estructurado en JSON cumpliendo rigurosamente todas las directrices."
        )

        if self.llm.is_configured:
            try:
                report_data = self.llm.generate_json(
                    prompt=user_prompt,
                    system_instruction=SYNTHESIS_SYSTEM_PROMPT,
                    model=model_name,
                    temperature=0.3,
                )

                # Parsear hechos clave
                raw_facts = report_data.get("key_facts_or_timeline", [])
                facts = []
                for rf in raw_facts:
                    if isinstance(rf, dict):
                        facts.append(KeyFact(**rf))
                    elif isinstance(rf, str):
                        facts.append(KeyFact(fact_or_event="Dato", detail=rf))

                return SynthesisReport(
                    topic=topic,
                    title=report_data.get("title", f"Síntesis: {topic}"),
                    executive_summary=report_data.get("executive_summary", ""),
                    detailed_synthesis=report_data.get("detailed_synthesis", ""),
                    key_takeaways=report_data.get("key_takeaways", []),
                    key_facts_or_timeline=facts,
                    contrasting_views=report_data.get("contrasting_views", []),
                    sources=sources,
                    model_name=model_name or self.llm.model_name,
                    total_words_analyzed=total_words,
                )
            except Exception as e:
                # Si la generación estructurada falla por algún motivo, intentar rescate
                pass

        # Generación de síntesis de respaldo basada en extracción directa
        return self._generate_fallback_synthesis(topic, sources, total_words)

    def _generate_fallback_synthesis(
        self,
        topic: str,
        sources: List[SourceItem],
        total_words: int,
    ) -> SynthesisReport:
        """Genera un reporte preliminar si no hay clave de API activa de Gemini configurada."""
        bullets = []
        for s in sources[:5]:
            snippet = s.summary_preview(180)
            bullets.append(f"[{s.id}] {s.title}: {snippet}")

        return SynthesisReport(
            topic=topic,
            title=f"Informe de Recolección: {topic}",
            executive_summary=(
                f"Se han recolectado {len(sources)} fuentes con un total de {total_words:,} palabras "
                f"sobre el tema '{topic}'. Para obtener la síntesis profunda asistida por Gemini, "
                f"recuerda configurar tu clave con 'python -m synth config --api-key <TU_CLAVE>'."
            ),
            detailed_synthesis="\n\n".join([
                f"### Fuente [{s.id}]: {s.title}\n"
                f"**Enlace:** {s.url or 'N/A'}\n\n"
                f"{s.summary_preview(350)}\n"
                for s in sources
            ]),
            key_takeaways=bullets,
            sources=sources,
            model_name="Extractor Local (OmniSynth)",
            total_words_analyzed=total_words,
        )

    def run_full_research(
        self,
        topic: str,
        intent: Optional[str] = None,
        max_per_query: int = 3,
        status_callback: Optional[Callable[[str], None]] = None,
        model_name: Optional[str] = None,
    ) -> SynthesisReport:
        """Ejecuta el ciclo completo de investigación: Planificación -> Recolección -> Síntesis."""
        start_time = time.time()

        if status_callback:
            status_callback(f"Planificando estrategia de investigación para '{topic}'...")
        plan = self.plan_research(topic, intent)

        if status_callback:
            status_callback(f"Recolectando información ({len(plan.search_queries)} búsquedas web, {len(plan.news_queries)} búsquedas de noticias)...")
        sources = self.gather_sources(plan, max_per_query=max_per_query, status_callback=status_callback)

        if status_callback:
            status_callback(f"Sintetizando {len(sources)} fuentes analizadas con Gemini...")
        report = self.synthesize_sources(topic, sources, plan=plan, model_name=model_name)
        report.elapsed_seconds = round(time.time() - start_time, 2)

        return report

    def synthesize_urls(
        self,
        urls: List[str],
        topic: Optional[str] = None,
        status_callback: Optional[Callable[[str], None]] = None,
        model_name: Optional[str] = None,
    ) -> SynthesisReport:
        """Descarga y sintetiza directamente una lista de URLs dadas."""
        start_time = time.time()
        if status_callback:
            status_callback(f"Descargando y extrayendo contenido de {len(urls)} páginas web...")

        sources = self.scraper.scrape_multiple(urls, start_id=1)
        effective_topic = topic or (sources[0].title if sources else "Análisis de Páginas Web")

        if status_callback:
            status_callback(f"Sintetizando información extraída de las {len(sources)} URLs...")

        report = self.synthesize_sources(effective_topic, sources, model_name=model_name)
        report.elapsed_seconds = round(time.time() - start_time, 2)
        return report

    def synthesize_rss(
        self,
        feed_url_or_site: str,
        max_entries: int = 5,
        topic: Optional[str] = None,
        status_callback: Optional[Callable[[str], None]] = None,
        model_name: Optional[str] = None,
    ) -> SynthesisReport:
        """Procesa un feed RSS/Atom y genera una síntesis de las noticias más recientes."""
        start_time = time.time()
        if status_callback:
            status_callback(f"Obteniendo y parseando feed RSS de '{feed_url_or_site}'...")

        channel_title, sources = self.feed_reader.fetch_feed_items(
            feed_url_or_site=feed_url_or_site,
            max_entries=max_entries,
            scrape_full_body=True,
            start_id=1,
        )

        effective_topic = topic or f"Noticias y Tendencias Recientes de {channel_title}"

        if status_callback:
            status_callback(f"Sintetizando {len(sources)} artículos del feed '{channel_title}'...")

        report = self.synthesize_sources(effective_topic, sources, model_name=model_name)
        report.elapsed_seconds = round(time.time() - start_time, 2)
        return report

    def ask_followup(self, report: SynthesisReport, question: str) -> str:
        """Permite hacer preguntas interactivas sobre el reporte y sus fuentes."""
        if not self.llm.is_configured:
            return "Se requiere configurar una clave de API de Gemini para responder preguntas interactivas."

        sources_context = "\n\n".join([
            f"[{s.id}] {s.title} ({s.url})\n{s.summary_preview(400)}"
            for s in report.sources
        ])

        prompt = CHAT_WITH_SOURCES_PROMPT.format(
            topic=report.topic,
            report_summary=report.executive_summary + "\n\n" + report.detailed_synthesis[:2000],
            sources_context=sources_context,
        )
        prompt += f"\n\nPREGUNTA DEL USUARIO: {question}"

        try:
            return self.llm.generate_text(prompt=prompt, temperature=0.3)
        except Exception as e:
            return f"Error al consultar el modelo: {str(e)}"


# Instancia por defecto
agent = SynthesisAgent()
