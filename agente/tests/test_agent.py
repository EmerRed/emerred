"""
Pruebas unitarias para las herramientas y el agente OmniSynth.
"""

from pathlib import Path
from synth.models.schemas import SourceItem, SourceType, SynthesisReport, KeyFact, ResearchPlan
from synth.tools.scraper import WebScraper
from synth.tools.searcher import WebSearcher
from synth.tools.rss_reader import RSSReader
from synth.ui.exporter import ReportExporter
from synth.agent import SynthesisAgent


def test_source_item_creation():
    item = SourceItem(
        id=1,
        title="Artículo de Prueba",
        url="https://example.com",
        source_type=SourceType.DIRECT_URL,
        clean_content="Este es un contenido de prueba para validar la funcionalidad del agente.",
        word_count=12,
    )
    assert item.id == 1
    assert item.title == "Artículo de Prueba"
    assert "contenido de prueba" in item.clean_content
    assert len(item.summary_preview(50)) > 0


def test_research_plan_fallback():
    agent = SynthesisAgent()
    plan = agent.plan_research("Modelos de Inteligencia Artificial")
    assert isinstance(plan, ResearchPlan)
    assert len(plan.search_queries) > 0
    assert len(plan.focus_angles) > 0


def test_report_export_markdown(tmp_path: Path):
    exporter = ReportExporter(output_dir=tmp_path)
    report = SynthesisReport(
        topic="Prueba de Exportación",
        title="Síntesis de Prueba",
        executive_summary="Resumen de prueba para verificar exportación.",
        detailed_synthesis="## Sección 1\nDetalle analítico con cita [1].",
        key_takeaways=["Punto 1", "Punto 2"],
        key_facts_or_timeline=[KeyFact(fact_or_event="2026", detail="Lanzamiento de prueba", source_id=1)],
        contrasting_views=["Perspectiva A vs Perspectiva B"],
        sources=[
            SourceItem(
                id=1,
                title="Fuente 1",
                url="https://example.com/1",
                source_type=SourceType.WEB_SEARCH,
                clean_content="Contenido de fuente 1",
                word_count=4,
            )
        ],
        model_name="test-model",
    )

    md_file = exporter.export_markdown(report)
    html_file = exporter.export_html(report)
    json_file = exporter.export_json(report)

    assert md_file.exists()
    assert html_file.exists()
    assert json_file.exists()

    md_content = md_file.read_text(encoding="utf-8")
    assert "Síntesis de Prueba" in md_content
    assert "Resumen de prueba" in md_content


def test_scraper_fetch():
    scraper = WebScraper()
    item = scraper.scrape_url("https://example.com", source_id=1)
    assert isinstance(item, SourceItem)
    assert item.id == 1
    assert item.url == "https://example.com"
