"""
Interfaz de consola con Rich: paneles, tablas, banners, spinners y formateo de alta estética.
"""

from __future__ import annotations
from typing import List, Optional, Dict, Any
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown
from rich.text import Text
from rich.theme import Theme
from rich.columns import Columns
from rich.tree import Tree

from synth.models.schemas import SourceItem, SynthesisReport, ResearchPlan, SourceType

# Tema visual moderno para terminal
custom_theme = Theme({
    "info": "cyan",
    "warning": "yellow",
    "error": "bold red",
    "success": "bold green",
    "accent": "bold magenta",
    "muted": "dim white",
    "header": "bold cyan",
})

console = Console(theme=custom_theme)


def print_banner():
    """Muestra el banner de inicio de OmniSynth."""
    banner_text = Text()
    banner_text.append("✦ ", style="bold cyan")
    banner_text.append("OMNISYNTH", style="bold white on blue")
    banner_text.append(" ✦ ", style="bold cyan")
    banner_text.append("Agente Autónomo de Investigación y Síntesis Web\n", style="bold italic bright_white")
    banner_text.append("Búsqueda Web en Vivo • Scraping Profundo • Feeds RSS • Google Gemini", style="dim cyan")

    panel = Panel(
        banner_text,
        border_style="cyan",
        padding=(1, 2),
        expand=False,
    )
    console.print(panel)


def print_plan(plan: ResearchPlan):
    """Muestra el plan de investigación generado por el agente."""
    tree = Tree(f"[bold cyan]🎯 Plan de Investigación:[/] [bold white]{plan.topic}[/]")
    tree.add(f"[dim]Objetivo:[/] {plan.intent}")

    if plan.search_queries:
        search_branch = tree.add("[bold blue]🔍 Búsquedas Web Planeadas[/]")
        for q in plan.search_queries:
            search_branch.add(f"[white]{q}[/]")

    if plan.news_queries:
        news_branch = tree.add("[bold yellow]📰 Búsquedas de Noticias Recientes[/]")
        for nq in plan.news_queries:
            news_branch.add(f"[white]{nq}[/]")

    if plan.focus_angles:
        angles_branch = tree.add("[bold magenta]📐 Ejes Analíticos a Sintetizar[/]")
        for angle in plan.focus_angles:
            angles_branch.add(f"[white]{angle}[/]")

    console.print(Panel(tree, border_style="blue", title="[bold blue]Estrategia del Agente[/]", expand=False))


def print_sources_summary(sources: List[SourceItem]):
    """Muestra una tabla con las fuentes recolectadas."""
    if not sources:
        console.print("[warning]No se recolectaron fuentes.[/]")
        return

    table = Table(
        title=f"📚 Fuentes Recolectadas ({len(sources)} fuentes procesadas)",
        border_style="dim cyan",
        header_style="bold cyan",
        show_lines=True,
    )
    table.add_column("ID", justify="center", style="bold yellow", width=4)
    table.add_column("Tipo", justify="center", width=12)
    table.add_column("Título / Origen", style="white", min_width=30)
    table.add_column("Palabras", justify="right", style="green", width=10)
    table.add_column("Detalle / URL", style="dim", min_width=25)

    type_styles = {
        SourceType.WEB_SEARCH: "[blue]Web[/]",
        SourceType.NEWS_SEARCH: "[yellow]Noticias[/]",
        SourceType.RSS_FEED: "[magenta]RSS Feed[/]",
        SourceType.DIRECT_URL: "[cyan]URL Directa[/]",
        SourceType.LOCAL_DOCUMENT: "[green]Documento[/]",
    }

    for s in sources:
        stype = type_styles.get(s.source_type, str(s.source_type.value))
        words = f"{s.word_count:,}"
        detail = s.url or s.author or "N/A"
        if len(detail) > 40:
            detail = detail[:37] + "..."

        title_display = s.title
        if len(title_display) > 45:
            title_display = title_display[:42] + "..."

        table.add_row(f"[{s.id}]", stype, title_display, words, detail)

    console.print(table)


def print_report(report: SynthesisReport):
    """Renderiza el informe de síntesis final en la consola con máxima claridad visual."""
    # 1. Título y Encabezado
    title_text = Text()
    title_text.append(f"\n{report.title}\n", style="bold white")
    title_text.append(f"Tema: {report.topic}  •  Modelo: {report.model_name}  •  Fuentes: {len(report.sources)}  •  Tiempo: {report.elapsed_seconds:.1f}s", style="dim white")
    console.print(Panel(title_text, border_style="bold green", expand=False))

    # 2. Resumen Ejecutivo
    console.print(
        Panel(
            report.executive_summary,
            title="[bold green]📌 RESUMEN EJECUTIVO[/]",
            border_style="green",
            padding=(1, 2),
        )
    )

    # 3. Puntos Clave
    if report.key_takeaways:
        takeaways_text = "\n".join([f"• [bold cyan]{t}[/]" for t in report.key_takeaways])
        console.print(
            Panel(
                takeaways_text,
                title="[bold cyan]💡 CONCLUSIONES Y PUNTOS CLAVE[/]",
                border_style="cyan",
                padding=(1, 2),
            )
        )

    # 4. Desarrollo Detallado en Markdown
    console.print("\n[bold white underline]ANÁLISIS Y SÍNTESIS DETALLADA[/]\n")
    console.print(Markdown(report.detailed_synthesis))

    # 5. Hechos Clave / Cronología
    if report.key_facts_or_timeline:
        fact_table = Table(
            title="⏱️ Datos Clave y Cronología",
            border_style="dim magenta",
            header_style="bold magenta",
            show_lines=True,
        )
        fact_table.add_column("Hecho / Evento", style="bold white", width=25)
        fact_table.add_column("Detalle y Cita", style="white")

        for f in report.key_facts_or_timeline:
            cite = f" [{f.source_id}]" if f.source_id else ""
            fact_table.add_row(f.fact_or_event, f"{f.detail}{cite}")

        console.print(fact_table)

    # 6. Puntos de Debate / Pros y Contras
    if report.contrasting_views:
        views_text = "\n".join([f"⚖️ {v}" for v in report.contrasting_views])
        console.print(
            Panel(
                views_text,
                title="[bold yellow]⚖️ PERSPECTIVAS Y PUNTOS DE DEBATE[/]",
                border_style="yellow",
                padding=(1, 2),
            )
        )

    # 7. Fuentes Citadas
    if report.sources:
        sources_list = []
        for s in report.sources:
            author_str = f" ({s.author})" if s.author else ""
            url_str = f" - {s.url}" if s.url else ""
            sources_list.append(f"[[bold yellow]{s.id}[/]] [bold white]{s.title}[/]{author_str}[dim]{url_str}[/]")
        
        console.print(
            Panel(
                "\n".join(sources_list),
                title="[bold yellow]📚 FUENTES Y REFERENCIAS CITADAS[/]",
                border_style="dim yellow",
                padding=(1, 2),
            )
        )


def print_emergency_report(report: Any, response: Any):
    """Renderiza estéticamente el resultado del despacho de telemetría de afectado."""
    status_style = "bold green" if response.exito else "bold red"
    status_icon = "✓" if response.exito else "✗"
    
    # Evaluar color según calidad de señal
    dbm = getattr(report, "potencia_red_movil_dbm", -100)
    if dbm >= -75:
        signal_badge = f"[bold green]{dbm} dBm (Excelente)[/]"
    elif dbm >= -90:
        signal_badge = f"[bold blue]{dbm} dBm (Buena)[/]"
    elif dbm >= -105:
        signal_badge = f"[bold yellow]{dbm} dBm (Regular)[/]"
    else:
        signal_badge = f"[bold red]{dbm} dBm (Crítica / Muy Débil)[/]"

    table = Table(
        title="📡 Telemetría y Reporte de Emergencia",
        border_style="cyan",
        show_lines=True,
    )
    table.add_column("Campo", style="bold white", width=22)
    table.add_column("Valor / Información", style="cyan")

    table.add_row("📍 Coordenadas GPS", f"Lat: [bold]{report.lat}[/], Long: [bold]{report.long}[/]")
    table.add_row("📱 Teléfono Celular", f"[bold yellow]{report.numero_celular}[/]")
    table.add_row("📶 Potencia de Red", f"{signal_badge} • Tecnología: {report.tipo_red or '4G'}")
    
    if report.operador:
        table.add_row("🏢 Operador Móvil", f"{report.operador}")
    if report.nivel_bateria is not None:
        bat_color = "green" if report.nivel_bateria > 50 else ("yellow" if report.nivel_bateria > 20 else "red")
        table.add_row("🔋 Batería del Dispositivo", f"[{bat_color}]{report.nivel_bateria}%[/]")
    
    mesh_badge = "[bold green]✓ Activa (Red Mallada)[/]" if getattr(report, "coneccion_mesh", False) else "[dim]✗ Inactiva (Conexión Directa)[/]"
    table.add_row("🕸️ Conexión Mesh", mesh_badge)
    
    table.add_row("🌐 Destino", f"[dim]{response.enviado_a}[/]")
    table.add_row("🎫 ID / Ticket Incidente", f"[bold magenta]{response.id_incidente or 'N/A'}[/]")
    
    estado_texto = f"[{status_style}]{status_icon} Código HTTP {response.codigo_estado}[/]"
    if response.es_offline_buffer:
        estado_texto += " • [bold yellow]ALMACENADO EN BUFFER OFFLINE (SIN COBERTURA)[/]"
    table.add_row("🚦 Estado del Despacho", estado_texto)

    console.print("\n")
    console.print(table)
    
    box_border = "green" if response.exito and not response.es_offline_buffer else ("yellow" if response.es_offline_buffer else "red")
    console.print(
        Panel(
            f"[bold white]{response.mensaje_servidor}[/]",
            title="[bold]Respuesta del Servidor EmerRed[/]",
            border_style=box_border,
            padding=(0, 2),
        )
    )

