#!/usr/bin/env python3
"""
Punto de entrada directo para OmniSynth.
Garantiza que el paquete 'synth' sea importable sin importar desde dónde se ejecute el script.
"""

import sys
from pathlib import Path

# Añadir la carpeta raíz del proyecto al path de Python
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from synth.cli import main

if __name__ == "__main__":
    main()
