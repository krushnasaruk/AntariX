import pytest
from app.runtime.simulation_clock import DeterministicSimulationClock

def test_clock_initialization():
    clock = DeterministicSimulationClock()
    assert clock.simulation_time == 0.0
    assert not clock.is_paused
    assert clock.elapsed_steps == 0

def test_clock_step_advancement():
    clock = DeterministicSimulationClock(initial_sim_time=0.0, default_timestep=1.0)
    t1 = clock.step()
    assert t1 == 1.0
    t2 = clock.step(2.5)
    assert t2 == 3.5
    assert clock.elapsed_steps == 2

def test_clock_pause_resume():
    clock = DeterministicSimulationClock()
    clock.pause()
    assert clock.is_paused
    t1 = clock.step(1.0)
    assert t1 == 0.0 # Time does not advance when paused
    clock.resume()
    assert not clock.is_paused
    t2 = clock.step(1.0)
    assert t2 == 1.0

def test_clock_checkpoint_restore():
    clock = DeterministicSimulationClock()
    clock.step(5.0)
    cp = clock.checkpoint()

    new_clock = DeterministicSimulationClock()
    new_clock.restore(cp)
    assert new_clock.simulation_time == 5.0
    assert new_clock.elapsed_steps == 1
