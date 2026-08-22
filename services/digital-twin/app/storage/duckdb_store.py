import duckdb
from typing import List, Dict, Any

class DuckDBStore:
    def __init__(self, db_path: str = ":memory:"):
        self.conn = duckdb.connect(db_path)

    def query_parquet_file(self, parquet_path: str, sql_query: str) -> List[Dict[str, Any]]:
        # Replace {{parquet_path}} placeholder or execute against view
        query = sql_query.replace("TELEMETRY", f"read_parquet('{parquet_path}')")
        query = query.replace("EVENTS", f"read_parquet('{parquet_path}')")

        res = self.conn.execute(query).df()
        return res.to_dict(orient="records")

    def query_dataframe(self, df, sql_query: str) -> List[Dict[str, Any]]:
        self.conn.register("df_table", df)
        res = self.conn.execute(sql_query.replace("TELEMETRY", "df_table")).df()
        self.conn.unregister("df_table")
        return res.to_dict(orient="records")
