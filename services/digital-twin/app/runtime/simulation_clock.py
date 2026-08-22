class DeterministicSimulationClock:
    def __init__(self, initial_sim_time: float = 0.0, default_timestep: float = 1.0):
        self._sim_time = float(initial_sim_time)
        self._default_timestep = float(default_timestep)
        self._paused = False
        self._elapsed_steps = 0

    @property
    def simulation_time(self) -> float:
        return self._sim_time

    @property
    def is_paused(self) -> bool:
        return self._paused

    @property
    def elapsed_steps(self) -> int:
        return self._elapsed_steps

    def step(self, dt: float = None) -> float:
        if self._paused:
            return self._sim_time

        step_duration = dt if dt is not None else self._default_timestep
        self._sim_time += float(step_duration)
        self._elapsed_steps += 1
        return round(self._sim_time, 4)

    def pause(self):
        self._paused = True

    def resume(self):
        self._paused = False

    def reset(self, initial_time: float = 0.0):
        self._sim_time = float(initial_time)
        self._paused = False
        self._elapsed_steps = 0

    def checkpoint(self) -> dict:
        return {
            "simulation_time": self._sim_time,
            "default_timestep": self._default_timestep,
            "paused": self._paused,
            "elapsed_steps": self._elapsed_steps
        }

    def restore(self, data: dict):
        self._sim_time = float(data.get("simulation_time", 0.0))
        self._default_timestep = float(data.get("default_timestep", 1.0))
        self._paused = bool(data.get("paused", False))
        self._elapsed_steps = int(data.get("elapsed_steps", 0))
