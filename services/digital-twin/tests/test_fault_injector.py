import pytest
from app.scenarios.fault_injector import FaultInjector

def test_fault_injection_generation_and_reproducibility():
    injector1 = FaultInjector(seed=42)
    faults1 = injector1.generate_faults("EP-FAULT-001", count=3)

    injector2 = FaultInjector(seed=42)
    faults2 = injector2.generate_faults("EP-FAULT-001", count=3)

    assert len(faults1) == 3
    assert faults1[0].faultType == faults2[0].faultType
    assert faults1[0].startTime == faults2[0].startTime
    assert faults1[0].severity == faults2[0].severity
