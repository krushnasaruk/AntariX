from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.memory.memory_models import MissionExperience, StrategyPerformance, FailurePattern, AdaptivePlanningRecommendation
from app.models.observations import AutonomyObservationModel

class LearningModel(ABC):
    @abstractmethod
    def analyze_experience(self, experiences: List[MissionExperience]) -> List[StrategyPerformance]:
        pass

    @abstractmethod
    def predict_strategy_success(self, strategy_name: str, experiences: List[MissionExperience]) -> float:
        pass

    @abstractmethod
    def detect_failure_pattern(self, experiences: List[MissionExperience]) -> List[FailurePattern]:
        pass

    @abstractmethod
    def recommend_strategy(
        self,
        obs: AutonomyObservationModel,
        candidate_strategies: List[str],
        experiences: List[MissionExperience]
    ) -> AdaptivePlanningRecommendation:
        pass


class DeterministicLearningModel(LearningModel):
    def analyze_experience(self, experiences: List[MissionExperience]) -> List[StrategyPerformance]:
        if not experiences:
            return []

        strategies = set(e.planStrategy for e in experiences)
        performances: List[StrategyPerformance] = []

        for strat in strategies:
            strat_exps = [e for e in experiences if e.planStrategy == strat]
            total = len(strat_exps)
            successes = sum(1 for e in strat_exps if e.actionSuccess and e.finalOutcome != "FAILURE")
            failures = total - successes

            energy_errors = [abs(e.estimatedEnergy - e.actualEnergy) for e in strat_exps]
            duration_errors = [abs(e.estimatedDuration - e.executionDuration) for e in strat_exps]

            obs_failures = sum(1 for e in strat_exps if not e.actionSuccess and "OBSTACLE" in (e.failureReason or "").upper())
            wth_failures = sum(1 for e in strat_exps if not e.actionSuccess and "DUST" in (e.failureReason or "").upper())
            safety_rejections = sum(1 for e in strat_exps if e.safetyValidationResult and e.safetyValidationResult.get("valid") is False)

            avg_res = sum(e.batteryAfter for e in strat_exps) / total if total > 0 else 0.0

            performances.append(StrategyPerformance(
                strategyName=strat,
                totalExecutions=total,
                successfulExecutions=successes,
                failedExecutions=failures,
                successRate=round(successes / total, 3) if total > 0 else 0.0,
                failureRate=round(failures / total, 3) if total > 0 else 0.0,
                averageEnergyError=round(sum(energy_errors) / total, 3) if total > 0 else 0.0,
                averageDurationError=round(sum(duration_errors) / total, 3) if total > 0 else 0.0,
                averageReplans=0.0,
                averageBatteryReserveAtCompletion=round(avg_res, 3),
                obstacleFailureFrequency=obs_failures,
                weatherFailureFrequency=wth_failures,
                communicationDelayImpact=0.0,
                safetyRejectionFrequency=safety_rejections
            ))

        return performances

    def predict_strategy_success(self, strategy_name: str, experiences: List[MissionExperience]) -> float:
        strat_exps = [e for e in experiences if e.planStrategy == strategy_name]
        if not strat_exps:
            return 0.5 # Cold start prior probability

        successes = sum(1 for e in strat_exps if e.actionSuccess and e.finalOutcome != "FAILURE")
        return round(successes / len(strat_exps), 3)

    def detect_failure_pattern(self, experiences: List[MissionExperience]) -> List[FailurePattern]:
        failed_exps = [e for e in experiences if not e.actionSuccess or e.finalOutcome == "FAILURE"]
        if not failed_exps:
            return []

        patterns: Dict[str, FailurePattern] = {}

        for e in failed_exps:
            reason = (e.failureReason or "UNKNOWN_FAILURE").upper()

            if "BATTERY" in reason or e.batteryAfter < 0.15:
                p_type = "BATTERY_LOW"
                adj = "Increase minimum planning battery margin"
            elif "OBSTACLE" in reason:
                p_type = "OBSTACLE_COLLISION"
                adj = "Increase obstacle safety clearance radius"
            elif "DUST" in reason or e.weatherState == "DUST_STORM":
                p_type = "DUST_STORM"
                adj = "Switch to DUST_STORM_HOLDING strategy during high dust activity"
            else:
                p_type = "PLAN_INFEASIBILITY"
                adj = "Recompute action path feasibility before execution"

            if p_type not in patterns:
                patterns[p_type] = FailurePattern(
                    pattern=p_type,
                    frequency=0,
                    severity="HIGH" if p_type in ("BATTERY_LOW", "DUST_STORM") else "MEDIUM",
                    affectedStrategies=[],
                    affectedTerrain=[],
                    affectedWeather=[],
                    affectedMissionTasks=[],
                    recommendedAdjustment=adj
                )

            p = patterns[p_type]
            p.frequency += 1
            if e.planStrategy not in p.affectedStrategies:
                p.affectedStrategies.append(e.planStrategy)
            if e.terrainType not in p.affectedTerrain:
                p.affectedTerrain.append(e.terrainType)
            if e.weatherState not in p.affectedWeather:
                p.affectedWeather.append(e.weatherState)
            if e.taskId not in p.affectedMissionTasks:
                p.affectedMissionTasks.append(e.taskId)

        return list(patterns.values())

    def recommend_strategy(
        self,
        obs: AutonomyObservationModel,
        candidate_strategies: List[str],
        experiences: List[MissionExperience]
    ) -> AdaptivePlanningRecommendation:
        sample_size = len(experiences)

        # Cold Start Behavior
        if sample_size == 0:
            rec_strategy = candidate_strategies[0] if candidate_strategies else "SAFE_SAMPLE_ACQUISITION_AND_RETURN"
            return AdaptivePlanningRecommendation(
                recommendedStrategy=rec_strategy,
                confidence=0.10,
                reason="Cold start: zero historical experience available. Relying on baseline Objective 6 planning.",
                historicalEvidence={"sampleSize": 0, "successRate": 0.0},
                riskAdjustment={"batteryMarginIncrease": 0.0},
                sampleSize=0,
                evidenceQuality="NONE"
            )

        # Sample size confidence calculation
        if sample_size < 3:
            confidence = 0.35
            quality = "LOW"
        elif sample_size < 10:
            confidence = 0.70
            quality = "MODERATE"
        else:
            confidence = 0.92
            quality = "HIGH"

        performances = self.analyze_experience(experiences)
        best_strategy = candidate_strategies[0] if candidate_strategies else "SAFE_SAMPLE_ACQUISITION_AND_RETURN"
        best_score = -999.0

        for candidate in (candidate_strategies or ["SAFE_SAMPLE_ACQUISITION_AND_RETURN"]):
            perf = next((p for p in performances if p.strategyName == candidate), None)

            base_score = 50.0
            if perf:
                success_bonus = perf.successRate * 40.0
                failure_penalty = perf.failureRate * 30.0
                energy_penalty = perf.averageEnergyError * 20.0
                safety_penalty = perf.safetyRejectionFrequency * 10.0
                score = base_score + success_bonus - failure_penalty - energy_penalty - safety_penalty
            else:
                score = base_score

            if score > best_score:
                best_score = score
                best_strategy = candidate

        best_perf = next((p for p in performances if p.strategyName == best_strategy), None)
        success_rate = best_perf.successRate if best_perf else 0.85
        energy_error = best_perf.averageEnergyError if best_perf else 0.02

        return AdaptivePlanningRecommendation(
            recommendedStrategy=best_strategy,
            confidence=confidence,
            reason=f"Historical evidence from {sample_size} mission cycles indicates {best_strategy} achieves {success_rate * 100:.1f}% success rate.",
            historicalEvidence={
                "sampleSize": sample_size,
                "successRate": success_rate,
                "averageEnergyError": energy_error
            },
            riskAdjustment={"batteryMarginIncrease": 0.05 if success_rate < 0.8 else 0.0},
            sampleSize=sample_size,
            evidenceQuality=quality
        )
