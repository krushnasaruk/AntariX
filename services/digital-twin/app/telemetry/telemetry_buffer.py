from typing import List
from app.telemetry.telemetry_schema import TelemetryRecord

class TelemetryBuffer:
    def __init__(self, max_size: int = 1000):
        self.max_size = max_size
        self._buffer: List[TelemetryRecord] = []

    def push(self, record: TelemetryRecord):
        self._buffer.append(record)
        if len(self._buffer) > self.max_size:
            self._buffer.pop(0)

    def get_window(self, size: int = 50) -> List[TelemetryRecord]:
        return self._buffer[-size:]

    def clear(self):
        self._buffer = []
