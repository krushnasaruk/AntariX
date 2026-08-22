# Python AI Learning & Adaptive Strategy Engine Architecture

This document describes the design, memory model, strategy performance analysis, failure pattern recognition, and safety boundaries for the **Python AI Learning & Adaptive Strategy Engine** (Objective 8).

---

## 1. Overview & Architecture Diagram

```mermaid
flowchart TD
    subgraph NODE_SIMULATION [Node.js Simulation Kernel (Authoritative)]
        sim[Physical Simulation (Obj 4)]
        mm[Mission Execution (Obj 3)]
        validator[SafetyValidator (Obj 5)]
        planner[MissionPlanner (Obj 6)]
        adapter[PythonLearningAdapter]
    end

    subgraph PYTHON_LEARNING [Python AI Engine Service (services/ai-engine)]
        fastapi[FastAPI Service /learn]
        repo[InMemoryExperienceRepository]
        strat_eng[StrategyPerformanceEngine]
        fail_eng[FailurePatternAnalyzer]
        adapt_eng[AdaptivePlanningEngine]
        model[DeterministicLearningModel]
    end

    sim -->|Execution Outcome| adapter
    adapter -->|POST /learn/experience| fastapi
    fastapi --> repo

    planner -->|POST /learn/analyze| adapter
    adapter --> fastapi
    fastapi --> adapt_eng
    adapt_eng --> strat_eng & fail_eng & model

    adapt_eng -->|AdaptivePlanningRecommendation| adapter
    adapter -->|Advisory Strategy Recommendation| planner
    planner -->|Proposed Plan Action| validator
    validator -->|Validated Safe Action| sim
```

---

## 2. Key Subsystems & Responsibilities

- **`MissionExperience`**: Structured schema recording 25+ attributes per cycle (battery before/after, actual vs estimated energy, terrain, weather, risk level, action success, failure reason).
- **`InMemoryExperienceRepository`**: Thread-safe experience memory supporting recording, querying, failure retrieval, strategy history, and store statistics.
- **`StrategyPerformanceEngine`**: Calculates success/failure rates, average energy/duration prediction errors, replan frequencies, and safety rejection rates.
- **`FailurePatternAnalyzer`**: Detects recurring failure patterns (`BATTERY_LOW`, `OBSTACLE_COLLISION`, `DUST_STORM`, `PLAN_INFEASIBILITY`, `COMMUNICATION_BLACKOUT`, `ROVER_HEALTH_DEGRADATION`, `TASK_STALL`, `INSUFFICIENT_RETURN_ENERGY`).
- **`AdaptivePlanningEngine`**: Computes evidence-weighted adaptive strategy scores:
  $$\text{adaptiveScore} = \text{baseScore} + \text{successBonus} - \text{failurePenalty} - \text{energyErrorPenalty} - \text{safetyRejectionPenalty}$$
- **Cold-Start Handling**: When zero historical experience exists, confidence is set to `0.10`, evidence quality is `NONE`, and baseline Objective 6 planning is recommended without fabricating statistics.

---

## 3. Safety Boundary

The Learning Engine is **strictly advisory**. Recommendations must pass through Objective 6 `MissionPlanner` and Objective 5 `SafetyValidator` before execution in Node.js.
