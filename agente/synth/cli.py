"""
Punto de entrada CLI para OmniSynth utilizando Typer y Rich.
"""

from __future__ import annotations
import sys
from typing import List, Optional
from pathlib import Path
import typer
from rich.prompt import Prompt, Confirm
from rich.status import Status

from synth.config import settings
from synth.agent import agent, SynthesisAgent
from synth.llm import GeminiClient
from synth.models.schemas import SynthesisReport, AfectadoReportInput
from synth.tools.emergency_client import emergency_client
from synth.tools.portal_collector import portal_collector
from synth.ui.console import (
    console,
    print_banner,
    print_plan,
    print_sources_summary,
    print_report,
    print_emergency_report,
    print_portal_bulletin,
)
from synth.ui.exporter import report_exporter

app = typer.Typer(
    name="synth",
    help="✦ OmniSynth: Agente autónomo de investigación y síntesis profunda con Google Gemini.",
    add_completion=False,
    no_args_is_help=False,
)


def _handle_exports(report: SynthesisReport, formats: Optional[str] = "md,html"):
    """Exporta el reporte a los formatos indicados y muestra las rutas generadas."""
    if not formats:
        return

    requested = [f.strip().lower() for f in formats.split(",")]
    exported_paths = []

    if "md" in requested or "markdown" in requested:
        md_path = report_exporter.export_markdown(report)
        exported_paths.append(f"[bold cyan]Markdown:[/] [link=file://{md_path.absolute()}]{md_path.name}[/]")

    if "html" in requested:
        html_path = report_exporter.export_html(report)
        exported_paths.append(f"[bold green]HTML:[/] [link=file://{html_path.absolute()}]{html_path.name}[/]")

    if "json" in requested:
        json_path = report_exporter.export_json(report)
        exported_paths.append(f"[bold yellow]JSON:[/] [link=file://{json_path.absolute()}]{json_path.name}[/]")

    if exported_paths:
        console.print("\n📁 [bold white]Archivos exportados en carpeta outputs/:[/]")
        for ep in exported_paths:
            console.print(f"  • {ep}")


def _interactive_qa_loop(report: SynthesisReport):
    """Permite al usuario hacer preguntas interactivas sobre el reporte sintetizado."""
    if not settings.has_gemini_key:
        return

    console.print("\n[bold cyan]💬 Modo Preguntas y Respuestas sobre el Reporte[/]")
    console.print("[dim]Puedes hacer preguntas sobre los hallazgos o fuentes analizadas (escribe 'salir' para terminar):[/]\n")

    while True:
        try:
            query = Prompt.ask("[bold green]¿Tienes alguna pregunta sobre el informe?[/]")
            if not query or query.strip().lower() in ["salir", "exit", "quit", "no", "q"]:
                break

            with Status("[cyan]Consultando al agente OmniSynth...", console=console, spinner="dots"):
                answer = agent.ask_followup(report, query.strip())

            console.print(f"\n[bold white]{answer}[/]\n")
        except (KeyboardInterrupt, EOFError):
            break


@app.command(name="research")
def research(
    topic: str = typer.Argument(..., help="Tema o pregunta que deseas investigar"),
    intent: Optional[str] = typer.Option(None, "--intent", "-i", help="Objetivo o enfoque analítico específico"),
    max_per_query: int = typer.Option(3, "--max-per-query", "-m", help="Resultados máximos por consulta"),
    model: Optional[str] = typer.Option(None, "--model", help="Modelo de Gemini a utilizar"),
    export: str = typer.Option("md,html", "--export", "-e", help="Formatos a exportar separados por coma (md,html,json)"),
    interactive_qa: bool = typer.Option(True, "--qa/--no-qa", help="Habilitar preguntas interactivas al finalizar"),
):
    """Investigación autónoma integral: planifica, busca en la web, extrae páginas y sintetiza."""
    print_banner()

    if not settings.has_gemini_key:
        console.print(
            "[yellow]⚠️ Clave de Gemini no detectada. Se ejecutará recolección y resumen básico.\n"
            "Para síntesis profunda con IA ejecuta: [bold cyan]python -m synth config --api-key <TU_CLAVE>[/]\n[/]"
        )

    # 1. Planificación
    with Status("[cyan]Elaborando plan estratégico de investigación...", console=console, spinner="dots"):
        plan = agent.plan_research(topic, intent)

    print_plan(plan)

    # 2. Recolección
    sources = []
    with Status("[cyan]Recolectando y extrayendo contenido de páginas web y noticias...", console=console, spinner="earth") as status:
        def update_msg(msg: str):
            status.update(f"[cyan]{msg}")
        sources = agent.gather_sources(plan, max_per_query=max_per_query, status_callback=update_msg)

    print_sources_summary(sources)

    # 3. Síntesis
    with Status("[bold green]Sintetizando información con Google Gemini...", console=console, spinner="bouncingBar"):
        report = agent.synthesize_sources(topic, sources, plan=plan, model_name=model)
        report.elapsed_seconds = 0.0

    print_report(report)
    _handle_exports(report, export)

    if interactive_qa and settings.has_gemini_key:
        _interactive_qa_loop(report)


@app.command(name="urls")
def synthesize_urls_cmd(
    urls: List[str] = typer.Argument(..., help="Lista de URLs a extraer y sintetizar"),
    topic: Optional[str] = typer.Option(None, "--topic", "-t", help="Título o tema descriptivo"),
    model: Optional[str] = typer.Option(None, "--model", help="Modelo de Gemini a utilizar"),
    export: str = typer.Option("md,html", "--export", "-e", help="Formatos a exportar (md,html,json)"),
):
    """Descarga y sintetiza directamente una lista de páginas web dadas."""
    print_banner()

    with Status("[cyan]Descargando y extrayendo páginas web...", console=console, spinner="earth") as status:
        def update_msg(msg: str):
            status.update(f"[cyan]{msg}")
        report = agent.synthesize_urls(urls, topic=topic, status_callback=update_msg, model_name=model)

    print_sources_summary(report.sources)
    print_report(report)
    _handle_exports(report, export)


@app.command(name="rss")
def synthesize_rss_cmd(
    feed_url_or_site: str = typer.Argument(..., help="URL del feed RSS/Atom o dominio web"),
    max_entries: int = typer.Option(5, "--max", "-m", help="Número de artículos recientes a procesar"),
    topic: Optional[str] = typer.Option(None, "--topic", "-t", help="Tema o enfoque para la síntesis"),
    model: Optional[str] = typer.Option(None, "--model", help="Modelo de Gemini a utilizar"),
    export: str = typer.Option("md,html", "--export", "-e", help="Formatos a exportar (md,html,json)"),
):
    """Procesa un feed RSS/Atom o detecta el feed de un sitio web y sintetiza los artículos."""
    print_banner()

    with Status("[cyan]Descargando feed RSS y artículos...", console=console, spinner="earth") as status:
        def update_msg(msg: str):
            status.update(f"[cyan]{msg}")
        report = agent.synthesize_rss(feed_url_or_site, max_entries=max_entries, topic=topic, status_callback=update_msg, model_name=model)

    print_sources_summary(report.sources)
    print_report(report)
    _handle_exports(report, export)


@app.command(name="emergency")
def emergency_cmd(
    json_input: Optional[str] = typer.Option(None, "--json", "-j", help="Payload JSON con lat, long, numero_celular, potencia_red_movil"),
    file_path: Optional[Path] = typer.Option(None, "--file", "-f", help="Ruta al archivo JSON con el reporte"),
    from_stdin: bool = typer.Option(False, "--stdin", help="Leer el payload JSON desde stdin (pipeline)"),
    lat: Optional[float] = typer.Option(None, "--lat", help="Latitud GPS (-90.0 a 90.0)"),
    lon: Optional[float] = typer.Option(None, "--long", "--lon", help="Longitud GPS (-180.0 a 180.0)"),
    celular: Optional[str] = typer.Option(None, "--celular", "--phone", "-p", help="Número celular de contacto"),
    potencia: Optional[int] = typer.Option(None, "--potencia", "--signal", "-s", help="Potencia de señal móvil en dBm (ej: -85)"),
    tipo_red: str = typer.Option("4G_LTE", "--red", "-r", help="Tipo de tecnología de red (4G, 5G, 3G, SATELITAL)"),
    coneccion_mesh: bool = typer.Option(False, "--mesh/--no-mesh", "--coneccion-mesh/--no-coneccion-mesh", help="Indica si la conexión es mediante red mallada (Mesh)"),
    bateria: Optional[int] = typer.Option(None, "--bateria", "-b", help="Porcentaje de batería (0 a 100)"),
    operador: Optional[str] = typer.Option(None, "--operador", help="Operador móvil (Claro, Tigo, Movistar, etc.)"),
    flush_buffer: bool = typer.Option(False, "--flush-buffer", help="Sincronizar reportes pendientes del buffer offline"),
    buffer_status: bool = typer.Option(False, "--buffer-status", help="Consultar cantidad de reportes en cola offline"),
):
    """Despacha telemetría de una persona afectada (coordenadas, teléfono, señal de red, conexión mesh) hacia EmerRed."""
    print_banner()

    # 1. Consultar estado del buffer
    if buffer_status:
        count = emergency_client.get_pending_buffer_count()
        console.print(f"\n📦 [bold cyan]Buffer Offline:[/] [bold yellow]{count}[/] reporte(s) pendiente(s) de sincronización.")
        return

    # 2. Sincronizar buffer offline
    if flush_buffer:
        with Status("[cyan]Sincronizando reportes pendientes del buffer offline...", console=console, spinner="dots"):
            summary = emergency_client.flush_offline_buffer()
        console.print("\n[bold green]✓ Sincronización finalizada:[/]")
        console.print(f"  • Total procesados: [bold]{summary['total_procesados']}[/]")
        console.print(f"  • Sincronizados exitosamente: [bold green]{summary['sincronizados']}[/]")
        console.print(f"  • Pendientes con fallo: [bold red]{summary['fallidos']}[/]")
        return

    # 3. Determinar origen de los datos
    raw_payload = None

    if from_stdin:
        raw_payload = sys.stdin.read().strip()
    elif file_path:
        if not file_path.exists():
            console.print(f"[bold red]✗ El archivo especificado no existe:[/] {file_path}")
            raise typer.Exit(code=1)
        with open(file_path, "r", encoding="utf-8") as f:
            raw_payload = f.read().strip()
    elif json_input:
        raw_payload = json_input.strip()
    elif lat is not None and lon is not None and celular and potencia is not None:
        raw_payload = {
            "lat": lat,
            "long": lon,
            "numero_celular": celular,
            "potencia_red_movil_dbm": potencia,
            "tipo_red": tipo_red,
            "coneccion_mesh": coneccion_mesh,
            "nivel_bateria": bateria,
            "operador": operador,
        }
    else:
        # Modo interactivo para recolectar los datos requeridos
        console.print("\n[bold cyan]📝 Ingreso Interactivo de Telemetría de Afectado[/]")
        try:
            input_lat = float(Prompt.ask("[bold white]Latitud GPS (ej: 4.60971)[/]"))
            input_lon = float(Prompt.ask("[bold white]Longitud GPS (ej: -74.08174)[/]"))
            input_cel = Prompt.ask("[bold white]Número celular de contacto (ej: +573001234567)[/]")
            input_dbm = int(Prompt.ask("[bold white]Potencia de red móvil en dBm (ej: -85, rango -140 a -40)[/]", default="-85"))
            input_red = Prompt.ask("[dim]Tipo de red móvil (4G_LTE, 5G, 3G, SATELITAL)[/]", default="4G_LTE")
            input_mesh = Confirm.ask("[bold white]¿El dispositivo opera a través de red mallada (Mesh)?[/]", default=False)
            raw_payload = {
                "lat": input_lat,
                "long": input_lon,
                "numero_celular": input_cel,
                "potencia_red_movil_dbm": input_dbm,
                "tipo_red": input_red,
                "coneccion_mesh": input_mesh,
            }
        except (ValueError, KeyboardInterrupt, EOFError):
            console.print("[yellow]Operación cancelada o valores no válidos.[/]")
            return

    # 4. Validar y despachar
    try:
        parsed_report = emergency_client.parse_input(raw_payload)
    except Exception as err:
        console.print(f"\n[bold red]✗ Error en formato o validación del JSON:[/] {err}")
        raise typer.Exit(code=1)

    with Status(f"[cyan]Despachando telemetría a {emergency_client.api_url}...", console=console, spinner="bouncingBar"):
        response = emergency_client.send_report(parsed_report)

    print_emergency_report(parsed_report, response)


@app.command(name="collect-portal")
def collect_portal_cmd(
    url: Optional[str] = typer.Option(None, "--url", "-u", help="URL del portal de emergencia si está en vivo (ej: http://localhost:5173)"),
    send_to_app: bool = typer.Option(False, "--send-app", "--broadcast", help="Transmitir el boletín al endpoint de la aplicación / backend"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", help="Endpoint destino de la app o backend"),
):
    """
    Recolecta toda la información del portal de emergencia de Cali (centros de acopio,
    desaparecidos, albergues, hospitales, rutas de agua, líneas 24/7) y la formatea
    en estructuras ultra-legibles para la app móvil (EmerChat / Mesh / SMS).
    """
    print_banner()

    with Status("[cyan]Recolectando y estructurando información del portal de emergencia...", console=console, spinner="earth"):
        if url:
            data = portal_collector.collect_from_url(url)
        else:
            data = portal_collector.extract_from_local_source()

        bulletin_text = portal_collector.format_mobile_bulletin(data)
        export_paths = portal_collector.save_and_export_bulletin(data)

    print_portal_bulletin(bulletin_text, export_paths)

    if send_to_app:
        with Status("[cyan]Transmitiendo boletín a la red de la aplicación móvil...", console=console, spinner="bouncingBar"):
            resp = portal_collector.send_to_app_api(endpoint_url=endpoint, data=portal_collector.format_app_json(data))
        if resp.get("exito"):
            console.print(f"\n[bold green]✓ Boletín transmitido exitosamente a la aplicación:[/] [cyan]{resp.get('endpoint')}[/]")
        else:
            console.print(f"\n[bold yellow]⚠️ Aviso de transmisión a la app:[/] {resp.get('error') or resp.get('nota')}")


@app.command(name="interactive")
def interactive_shell():
    """Lanza la consola interactiva guiada de OmniSynth."""
    print_banner()

    while True:
        console.print("\n[bold cyan]Menú Principal de OmniSynth:[/]")
        console.print("  [bold white]1.[/] 🔍 Investigar tema en la web (Búsqueda + Scraping + Síntesis)")
        console.print("  [bold white]2.[/] 🌐 Sintetizar URLs específicas")
        console.print("  [bold white]3.[/] 📰 Sintetizar canal de noticias / Feed RSS")
        console.print("  [bold white]4.[/] 📡 Despachar telemetría de afectado (EmerRed)")
        console.print("  [bold white]5.[/] 📱 Recolectar información del portal y formatear para la App (EmerChat / SMS)")
        console.print("  [bold white]6.[/] ⚙️  Ver / Configurar clave de Gemini y opciones")
        console.print("  [bold white]7.[/] 🚪 Salir")

        option = Prompt.ask("\n[bold green]Selecciona una opción[/]", choices=["1", "2", "3", "4", "5", "6", "7"], default="5")

        if option == "1":
            topic = Prompt.ask("\n[bold white]Ingresa el tema o pregunta a investigar[/]")
            if topic:
                intent = Prompt.ask("[dim]Objetivo o ángulo específico (opcional, presiona Enter para omitir)[/]", default="")
                research(topic=topic, intent=intent or None)
        elif option == "2":
            raw_urls = Prompt.ask("\n[bold white]Ingresa una o más URLs separadas por espacio[/]")
            urls = raw_urls.strip().split()
            if urls:
                topic = Prompt.ask("[dim]Título o tema para este conjunto (opcional)[/]", default="")
                synthesize_urls_cmd(urls=urls, topic=topic or None)
        elif option == "3":
            feed = Prompt.ask("\n[bold white]Ingresa la URL del feed RSS o dominio de noticias (ej: https://feeds.bbci.co.uk/news/rss.xml)[/]")
            if feed:
                synthesize_rss_cmd(feed_url_or_site=feed)
        elif option == "4":
            emergency_cmd()
        elif option == "5":
            send_app = Confirm.ask("¿Deseas intentar transmitir el boletín al endpoint de la aplicación?", default=False)
            collect_portal_cmd(send_to_app=send_app)
        elif option == "6":
            config_menu()
        elif option == "7":
            console.print("[cyan]¡Hasta luego! Gracias por usar OmniSynth.[/]")
            break


@app.command(name="config")
def config_menu(
    api_key: Optional[str] = typer.Option(None, "--api-key", "-k", help="Establecer y guardar nueva clave GEMINI_API_KEY"),
    model: Optional[str] = typer.Option(None, "--model", "-m", help="Establecer modelo por defecto"),
):
    """Muestra el estado de la configuración y permite cambiar la clave de API o modelo."""
    if api_key:
        settings.save_api_key(api_key)
        agent.llm = GeminiClient(api_key=api_key)
        console.print("[success]✓ Clave GEMINI_API_KEY guardada exitosamente en .env[/]")
        return

    console.print("\n[bold cyan]⚙️ Configuración Actual de OmniSynth[/]")
    key_status = "[bold green]✓ Configurada[/]" if settings.has_gemini_key else "[bold red]✗ No configurada[/]"
    console.print(f"  • [white]Estado de Gemini API Key:[/] {key_status}")
    console.print(f"  • [white]Modelo predeterminado:[/] [cyan]{settings.default_model}[/]")
    console.print(f"  • [white]Carpeta de salidas:[/] [cyan]{settings.outputs_dir.absolute()}[/]")
    console.print(f"  • [white]Endpoint EmerRed:[/] [cyan]{settings.emerred_api_url}[/]")
    console.print(f"  • [white]Buffer Offline Activo:[/] [cyan]{settings.emerred_offline_buffer_enabled}[/]")
    console.print(f"  • [white]Modelos disponibles:[/] {', '.join(GeminiClient.AVAILABLE_MODELS)}")

    if not settings.has_gemini_key:
        console.print("\n[dim]Para configurar tu clave gratis de Google Gemini visita: https://aistudio.google.com/[/]")
        set_now = Confirm.ask("¿Deseas ingresar tu clave de API de Gemini ahora?")
        if set_now:
            new_key = Prompt.ask("[bold green]Pega tu GEMINI_API_KEY[/]", password=True)
            if new_key:
                settings.save_api_key(new_key)
                agent.llm = GeminiClient(api_key=new_key)
                console.print("[success]✓ Clave configurada exitosamente.[/]")


def main():
    if len(sys.argv) == 1:
        interactive_shell()
    else:
        app()


if __name__ == "__main__":
    main()

