import sys
from pathlib import Path

# Garantizar que el directorio raíz esté en sys.path
root_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from synth.cli import main

if __name__ == "__main__":
    main()

