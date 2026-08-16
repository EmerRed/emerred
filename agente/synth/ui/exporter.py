"""
Exportador de reportes de síntesis a múltiples formatos (Markdown, HTML, JSON).
"""

from __future__ import annotations
import json
import re
from pathlib import Path
from datetime import datetime
from synth.models.schemas import SynthesisReport
from synth.config import settings


class ReportExporter:
    """Generador de archivos de exportación de informes."""

    def __init__(self, output_dir: Optional[Path] = None):
        self.output_dir = output_dir or settings.outputs_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def _sanitize_filename(self, text: str) -> str:
        """Convierte un título en un nombre de archivo seguro."""
        clean = re.sub(r"[^\w\s-]", "", text).strip().lower()
        clean = re.sub(r"[-\s]+", "_", clean)
        return clean[:50] or "sintesis"

    def export_markdown(self, report: SynthesisReport) -> Path:
        """Exporta el reporte en formato Markdown estructurado."""
        timestamp = report.created_at.strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{self._sanitize_filename(report.topic)}.md"
        file_path = self.output_dir / filename

        lines = [
            f"# {report.title}",
            "",
            f"> **Tema:** {report.topic}  ",
            f"> **Generado el:** {report.created_at.strftime('%Y-%m-%d %H:%M:%S')}  ",
            f"> **Modelo:** {report.model_name}  ",
            f"> **Total palabras analizadas:** {report.total_words_analyzed:,}  ",
            "",
            "## 📌 Resumen Ejecutivo",
            "",
            report.executive_summary,
            "",
        ]

        if report.key_takeaways:
            lines.append("## 💡 Conclusiones y Puntos Clave")
            lines.append("")
            for t in report.key_takeaways:
                lines.append(f"- {t}")
            lines.append("")

        lines.append("## 🔍 Análisis y Desarrollo Detallado")
        lines.append("")
        lines.append(report.detailed_synthesis)
        lines.append("")

        if report.key_facts_or_timeline:
            lines.append("## ⏱️ Cronología y Datos Clave")
            lines.append("")
            lines.append("| Hecho / Evento | Detalle | Fuente |")
            lines.append("| :--- | :--- | :---: |")
            for f in report.key_facts_or_timeline:
                source_cite = f"[{f.source_id}]" if f.source_id else "-"
                lines.append(f"| **{f.fact_or_event}** | {f.detail} | {source_cite} |")
            lines.append("")

        if report.contrasting_views:
            lines.append("## ⚖️ Perspectivas y Puntos de Debate")
            lines.append("")
            for v in report.contrasting_views:
                lines.append(f"- {v}")
            lines.append("")

        if report.sources:
            lines.append("## 📚 Fuentes y Referencias Citadas")
            lines.append("")
            for s in report.sources:
                author_part = f" ({s.author})" if s.author else ""
                url_part = f" - [{s.url}]({s.url})" if s.url else ""
                date_part = f" [{s.published_date}]" if s.published_date else ""
                lines.append(f"{s.id}. **{s.title}**{author_part}{date_part}{url_part}")
            lines.append("")

        content = "\n".join(lines)
        file_path.write_text(content, encoding="utf-8")
        return file_path

    def export_html(self, report: SynthesisReport) -> Path:
        """Exporta el reporte a un archivo HTML autónomo con diseño moderno y responsivo."""
        timestamp = report.created_at.strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{self._sanitize_filename(report.topic)}.html"
        file_path = self.output_dir / filename

        takeaways_html = "".join([f"<li>{t}</li>" for t in report.key_takeaways])
        views_html = "".join([f"<li>{v}</li>" for v in report.contrasting_views])

        facts_rows = "".join([
            f"<tr><td><strong>{f.fact_or_event}</strong></td><td>{f.detail}</td><td style='text-align:center;'>[{f.source_id or '-'}]</td></tr>"
            for f in report.key_facts_or_timeline
        ])

        sources_html = "".join([
            f"<li><strong>[{s.id}] {s.title}</strong>"
            + (f" <em>({s.author})</em>" if s.author else "")
            + (f" &mdash; <a href='{s.url}' target='_blank' rel='noopener'>{s.url}</a>" if s.url else "")
            + "</li>"
            for s in report.sources
        ])

        # Convertir párrafos básicos en Markdown a HTML
        body_formatted = report.detailed_synthesis.replace("\n\n", "</p><p>").replace("\n", "<br>")

        html_template = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{report.title} - OmniSynth</title>
    <style>
        :root {{
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #38bdf8;
            --accent-green: #4ade80;
            --border: #334155;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-primary);
            line-height: 1.6;
            margin: 0;
            padding: 2rem 1rem;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
        }}
        header {{
            border-bottom: 1px solid var(--border);
            padding-bottom: 1.5rem;
            margin-bottom: 2rem;
        }}
        h1 {{
            color: var(--accent);
            margin-top: 0;
            font-size: 2rem;
        }}
        .meta {{
            color: var(--text-secondary);
            font-size: 0.9rem;
        }}
        .card {{
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }}
        .card-green {{ border-left: 4px solid var(--accent-green); }}
        .card-cyan {{ border-left: 4px solid var(--accent); }}
        h2 {{
            margin-top: 0;
            color: #f1f5f9;
            font-size: 1.3rem;
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.5rem;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }}
        th, td {{
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }}
        th {{
            background: #0f172a;
            color: var(--accent);
        }}
        a {{
            color: var(--accent);
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
        ul {{
            padding-left: 1.2rem;
        }}
        li {{
            margin-bottom: 0.5rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{report.title}</h1>
            <div class="meta">
                <span><strong>Tema:</strong> {report.topic}</span> • 
                <span><strong>Generado:</strong> {report.created_at.strftime('%Y-%m-%d %H:%M')}</span> • 
                <span><strong>Modelo:</strong> {report.model_name}</span> • 
                <span><strong>Fuentes:</strong> {len(report.sources)}</span>
            </div>
        </header>

        <div class="card card-green">
            <h2>📌 Resumen Ejecutivo</h2>
            <p>{report.executive_summary}</p>
        </div>

        {"<div class='card card-cyan'><h2>💡 Puntos Clave</h2><ul>" + takeaways_html + "</ul></div>" if report.key_takeaways else ""}

        <div class="card">
            <h2>🔍 Análisis y Síntesis Detallada</h2>
            <p>{body_formatted}</p>
        </div>

        {"<div class='card'><h2>⏱️ Datos Clave y Cronología</h2><table><thead><tr><th>Hecho / Evento</th><th>Detalle</th><th>Fuente</th></tr></thead><tbody>" + facts_rows + "</tbody></table></div>" if report.key_facts_or_timeline else ""}

        {"<div class='card'><h2>⚖️ Perspectivas y Puntos de Debate</h2><ul>" + views_html + "</ul></div>" if report.contrasting_views else ""}

        <div class="card">
            <h2>📚 Fuentes y Referencias Citadas</h2>
            <ol>{sources_html}</ol>
        </div>
    </div>
</body>
</html>
"""
        file_path.write_text(html_template, encoding="utf-8")
        return file_path

    def export_json(self, report: SynthesisReport) -> Path:
        """Exporta el reporte y sus fuentes en JSON."""
        timestamp = report.created_at.strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{self._sanitize_filename(report.topic)}.json"
        file_path = self.output_dir / filename

        data = report.model_dump(mode="json")
        file_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        return file_path


# Instancia por defecto
report_exporter = ReportExporter()
