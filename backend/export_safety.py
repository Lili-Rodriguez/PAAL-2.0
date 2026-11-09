"""Export the pinned safety metadata for a complete API/network outage."""
import json
from pathlib import Path
from .safety import SOURCES

if __name__=='__main__':
    fallback=dict(version=1,status='unavailable',
      reassurance='The reviewed guidance service is unavailable, so I can’t give an evidence-backed parenting answer right now. If someone is in immediate danger, has trouble breathing or is unresponsive, contact local emergency services now (911 in the United States). For possible abuse, contact local child protective services or a healthcare professional.',
      actions=[],sources=SOURCES,citations=[s['id'] for s in SOURCES])
    (Path(__file__).resolve().parents[1]/'dist'/'safety-guidance.js').write_text(
        '// Generated from backend/safety.py: python3 -m backend.export_safety\nwindow.PAAL_SAFETY_FALLBACK = '+json.dumps(fallback)+';\n')
