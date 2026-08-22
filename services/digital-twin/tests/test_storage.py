import os
import pytest
from app.storage.parquet_store import ParquetStore
from app.storage.duckdb_store import DuckDBStore

def test_parquet_store_write_and_read(tmp_path):
    store = ParquetStore(base_dir=str(tmp_path))
    records = [
        {"timestamp": 100.0, "episode_id": "EP-1", "simulation_time": 1.0, "battery": 0.94},
        {"timestamp": 200.0, "episode_id": "EP-1", "simulation_time": 2.0, "battery": 0.92}
    ]

    p_file = store.write_telemetry("EP-1", records)
    assert os.path.exists(p_file)

    loaded = store.read_telemetry("EP-1")
    assert len(loaded) == 2
    assert loaded[0]["battery"] == 0.94

def test_duckdb_query(tmp_path):
    store = ParquetStore(base_dir=str(tmp_path))
    duck = DuckDBStore()

    records = [
        {"timestamp": 100.0, "episode_id": "EP-1", "simulation_time": 1.0, "battery": 0.94},
        {"timestamp": 200.0, "episode_id": "EP-1", "simulation_time": 2.0, "battery": 0.92}
    ]
    p_file = store.write_telemetry("EP-1", records)

    res = duck.query_parquet_file(p_file, "SELECT AVG(battery) as avg_bat FROM TELEMETRY")
    assert len(res) == 1
    assert round(res[0]["avg_bat"], 2) == 0.93
