import pytest
from pathlib import Path
from synth.tools.portal_collector import EmergencyPortalCollector


def test_portal_collector_extraction(tmp_path: Path):
    collector = EmergencyPortalCollector()
    data = collector.extract_from_local_source()

    assert data["ciudad"] == "Santiago de Cali"
    assert len(data["contactos_emergencia"]) > 0
    assert len(data["centros_acopio"]) > 0
    assert len(data["albergues"]) > 0


def test_portal_collector_bulletin_formatting():
    collector = EmergencyPortalCollector()
    data = collector.extract_from_local_source()
    bulletin = collector.format_mobile_bulletin(data)

    assert "BOLETÍN OFICIAL DE EMERGENCIA — CALI" in bulletin
    assert "Bomberos Cali" in bulletin
    assert "CENTROS DE ACOPIO" in bulletin
    assert "ALBERGUES TEMPORALES" in bulletin


def test_portal_collector_json_formatting():
    collector = EmergencyPortalCollector()
    data = collector.extract_from_local_source()
    json_data = collector.format_app_json(data)

    assert json_data["canal"] == "EMERGENCY_BROADCAST_CALI"
    assert "evento" in json_data
    assert "lineas_auxilio" in json_data
    assert "centros_acopio" in json_data
    assert "resumen_texto_movil" in json_data


def test_portal_collector_export(tmp_path: Path):
    collector = EmergencyPortalCollector()
    collector.outputs_dir = tmp_path
    data = collector.extract_from_local_source()
    exports = collector.save_and_export_bulletin(data)

    assert exports["txt"].exists()
    assert exports["json"].exists()
    assert exports["md"].exists()

    txt_content = exports["txt"].read_text(encoding="utf-8")
    assert "BOLETÍN OFICIAL" in txt_content
