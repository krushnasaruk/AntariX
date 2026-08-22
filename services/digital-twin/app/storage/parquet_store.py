import os
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from typing import List, Dict, Any

class ParquetStore:
    def __init__(self, base_dir: str = "services/digital-twin/data"):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def write_telemetry(self, episode_id: str, records: List[Dict[str, Any]]) -> str:
        if not records:
            return ""

        file_path = os.path.join(self.base_dir, f"telemetry_{episode_id}.parquet")
        df = pd.DataFrame(records)
        table = pa.Table.from_pandas(df)
        pq.write_table(table, file_path)
        return file_path

    def read_telemetry(self, episode_id: str) -> List[Dict[str, Any]]:
        file_path = os.path.join(self.base_dir, f"telemetry_{episode_id}.parquet")
        if not os.path.exists(file_path):
            return []

        table = pq.read_table(file_path)
        df = table.to_pandas()
        return df.to_dict(orient="records")

    def write_events(self, episode_id: str, events: List[Dict[str, Any]]) -> str:
        if not events:
            return ""

        file_path = os.path.join(self.base_dir, f"events_{episode_id}.parquet")
        df = pd.DataFrame(events)
        table = pa.Table.from_pandas(df)
        pq.write_table(table, file_path)
        return file_path

    def read_events(self, episode_id: str) -> List[Dict[str, Any]]:
        file_path = os.path.join(self.base_dir, f"events_{episode_id}.parquet")
        if not os.path.exists(file_path):
            return []

        table = pq.read_table(file_path)
        df = table.to_pandas()
        return df.to_dict(orient="records")
