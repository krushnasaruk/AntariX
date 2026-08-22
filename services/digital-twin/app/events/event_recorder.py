import time
from typing import List, Dict, Any
from app.events.event_schema import SimulationEvent

class EventRecorder:
    def __init__(self):
        self._events: List[SimulationEvent] = []

    def record_event(self, episode_id: str, sim_time: float, event_type: str, source: str, payload: Dict[str, Any] = None) -> SimulationEvent:
        event_id = f"EVT-{int(time.time() * 1000)}-{len(self._events) + 1}"
        evt = SimulationEvent(
            event_id=event_id,
            episode_id=episode_id,
            simulation_time=sim_time,
            event_type=event_type,
            source=source,
            payload=payload or {}
        )
        self._events.append(evt)
        return evt

    def get_events(self, episode_id: str = None) -> List[SimulationEvent]:
        if episode_id:
            return [e for e in self._events if e.episode_id == episode_id]
        return list(self._events)

    def clear(self):
        self._events = []
