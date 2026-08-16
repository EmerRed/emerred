# ✦ OmniSynth

**Agente CLI autónomo de investigación profunda, recolección multicanal y síntesis de información con Google Gemini.**

OmniSynth investiga cualquier tema en la web en vivo, explora noticias y feeds RSS, extrae el contenido limpio de los artículos (eliminando publicidad, encabezados y ruido) y produce informes analíticos estructurados con resúmenes ejecutivos, cronologías, puntos de debate y citación rigurosa de fuentes `[1]`, `[2]`.

---

## 🚀 Características Principales

- 🔍 **Búsqueda Web y de Noticias en Vivo**: Estrategia de búsqueda multidimensional con generación autónoma de subconsultas y deduplicación de enlaces.
- 📰 **Lector y Auto-descubridor de Feeds RSS/Atom**: Procesa canales de noticias en tiempo real o auto-descubre el feed de un sitio web.
- 🧹 **Scraping Profundo y Limpio**: Extracción en paralelo con *Trafilatura* y *BeautifulSoup*, eliminando cookies, scripts, anuncios y maquetación irrelevante.
- 🧠 **Síntesis Analítica con Google Gemini**:
  - Resumen ejecutivo de alto impacto.
  - Desarrollo temático con citas directas.
  - Cronología / Datos clave contrastados.
  - Puntos de debate y perspectivas divergentes.
- 📁 **Exportación Multiformato**: Guarda automáticamente los resultados en `outputs/` en **Markdown (.md)**, **HTML visual estilizado (.html)** o **JSON (.json)**.
- 💬 **Modo Q&A Interactivo**: Permite hacer preguntas de seguimiento sobre los hallazgos y fuentes del reporte.
- 💻 **Interfaz de Terminal de Alta Estética**: Construido con *Rich* y *Typer*, con spinners animados, tablas, árboles de estrategia y paneles coloreados.

---

## 📦 Instalación y Configuración

### 1. Activar entorno virtual e instalar dependencias

```bash
# Activar entorno virtual
source .venv/bin/activate

# Instalar OmniSynth en modo editable
pip install -e .
```

### 2. Configurar la clave de Google Gemini (Gratis)

Puedes obtener tu clave de API gratis en [Google AI Studio](https://aistudio.google.com/).

Puedes configurarla de cualquiera de estas formas:

**Opción A (Mediante comando CLI):**
```bash
python -m synth config --api-key TU_GEMINI_API_KEY
```

**Opción B (Archivo `.env`):**
Copia el archivo de ejemplo y coloca tu clave:
```bash
cp .env.example .env
# Edita .env y añade: GEMINI_API_KEY=tu_clave_aqui
```

---

## 🛠️ Modos de Uso

### 1. Investigación Autónoma Completa (`research`)
El agente descompone el tema, realiza búsquedas web y de noticias en paralelo, descarga los artículos y sintetiza el informe:

```bash
python -m synth research "Avances recientes en computación cuántica"
```

Opciones útiles:
```bash
# Con enfoque analítico específico
python -m synth research "Baterías de estado sólido" --intent "Comparativa de densidad energética y viabilidad comercial para 2026"

# Cambiando el modelo de Gemini o los formatos de exportación
python -m synth research "Modelos de razonamiento en IA" --model gemini-2.5-flash --export md,html,json
```

---

### 2. Síntesis de Páginas Web / URLs Específicas (`urls`)
Extrae el contenido de una o más URLs y genera una síntesis combinada:

```bash
python -m synth urls "https://sitio1.com/articulo" "https://sitio2.com/noticia" --topic "Comparativa de Enfoques"
```

---

### 3. Síntesis de Canales RSS / Noticias en Tiempo Real (`rss`)
Analiza las últimas publicaciones de un feed RSS o detecta el feed de un sitio web:

```bash
# Desde un feed RSS directo
python -m synth rss "https://feeds.bbci.co.uk/news/rss.xml" --max 5

# Auto-detectando el feed de una web
python -m synth rss "https://techcrunch.com" --max 4 --topic "Novedades de Startups"
```

---

### 4. Modo Interactivo Guiado (`interactive` o sin argumentos)
Lanza el menú visual interactivo en la terminal:

```bash
python -m synth
# o también:
python -m synth interactive
```

---

### 5. Despacho de Telemetría y Emergencias (`emergency`)
Procesa datos de geolocalización, teléfono y potencia de red móvil en formato JSON o banderas y los envía a la red de emergencias (ej. `api.emerred.org.co/afectado`):

```bash
# Mediante JSON plano o anidado directo
python -m synth emergency --json '{"lat": 4.6097, "long": -74.0817, "numero_celular": "+573001234567", "potencia_red_movil": -85, "coneccion_mesh": true}'

# Mediante archivo JSON
python -m synth emergency --file afectado.json

# Mediante pipeline (stdin)
cat reporte.json | python -m synth emergency --stdin

# Sincronizar reportes pendientes del buffer offline al recuperar cobertura
python -m synth emergency --flush-buffer
```

---

### 6. Configuración y Diagnóstico (`config`)
Inspecciona el estado de la clave de API, el modelo predeterminado y las carpetas de salida:

```bash
python -m synth config
```

---

## 📂 Estructura del Proyecto

```
├── synth/
│   ├── __init__.py
│   ├── __main__.py          # Punto de entrada para ejecución directa
│   ├── cli.py               # Comandos CLI interactivos con Typer y Rich
│   ├── config.py            # Gestión de variables de entorno y settings
│   ├── agent.py             # Orquestador del ciclo de investigación y síntesis
│   ├── llm.py               # Conexión con Google Gemini (SDK google-genai)
│   ├── prompts.py           # Prompts especializados para planificación y análisis
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Modelos Pydantic (SourceItem, SynthesisReport, etc.)
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── scraper.py       # Extractor de páginas web (Trafilatura + BeautifulSoup)
│   │   ├── searcher.py      # Búsqueda web y noticias (DDGS)
│   │   └── rss_reader.py    # Lector y descubridor de feeds RSS/Atom
│   └── ui/
│       ├── __init__.py
│       ├── console.py       # Renderizado estético en terminal con Rich
│       └── exporter.py      # Generador de archivos Markdown, HTML y JSON
├── tests/
│   └── test_agent.py        # Pruebas unitarias automatizadas con pytest
├── outputs/                 # Informes generados listos para consultar
├── .env.example
├── pyproject.toml
└── requirements.txt
```

---

## 🧪 Ejecución de Pruebas

Para ejecutar la suite de pruebas unitarias:

```bash
PYTHONPATH=. pytest -v tests/
```
