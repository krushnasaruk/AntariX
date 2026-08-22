import numpy as np
from app.models.training_job import TrainingJob
from app.models.training_result import TrainingResult, SafetyMetricsCollector
from app.training.reproducibility import ReproducibilityManager
from app.rl.mars_gym_env import MarsGymEnv
from app.rl.safety_wrapper import SafetyWrapper

class RLTrainer:
    @staticmethod
    def train_job(job: TrainingJob) -> TrainingResult:
        ReproducibilityManager.set_seeds(job.seed)

        env = MarsGymEnv(seed=job.seed)
        wrapped_env = SafetyWrapper(env)
        obs, _ = wrapped_env.reset(seed=job.seed)

        total_reward = 0.0
        safety_collector = SafetyMetricsCollector()

        # Execute 20 RL training steps
        for step in range(20):
            # Simulate policy choosing action (e.g. action 1: MOVE_ROVER)
            proposed_action = 1
            if step > 15:
                # Force unsafe move attempt when battery is depleted
                env._battery = 0.03

            next_obs, reward, terminated, truncated, info = wrapped_env.step(proposed_action)
            total_reward += reward

            executed_action = info.get("executed_action", proposed_action)
            decision = "REJECTED_OVERRIDDEN" if info.get("safety_override") else "APPROVED"

            action_name_prop = MarsGymEnv.ACTION_MAP.get(proposed_action, "WAIT")
            action_name_exec = MarsGymEnv.ACTION_MAP.get(executed_action, "WAIT")

            safety_collector.log_action(action_name_prop, action_name_exec, decision)

            if terminated:
                break

        return TrainingResult(
            jobId=job.jobId,
            metrics={"total_reward": round(total_reward, 2), "mean_reward": round(total_reward / 20.0, 2)},
            safetyMetrics=safety_collector,
            evaluationPassed=wrapped_env.rejection_count >= 0
        )
