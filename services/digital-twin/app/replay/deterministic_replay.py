from typing import List, Dict, Any, Tuple

class DeterministicReplay:
    @staticmethod
    def compare_trajectories(expected: List[Dict[str, Any]], actual: List[Dict[str, Any]]) -> Tuple[bool, List[Dict[str, Any]]]:
        divergences = []

        max_len = min(len(expected), len(actual))
        for i in range(max_len):
            exp = expected[i]
            act = actual[i]

            diffs = {}
            for key in ["battery", "rover_position_x", "rover_position_y", "rover_health", "simulation_time"]:
                exp_val = exp.get(key)
                act_val = act.get(key)
                if exp_val != act_val:
                    diffs[key] = {"expected": exp_val, "actual": act_val}

            if diffs:
                divergences.append({
                    "step_index": i,
                    "simulation_time": exp.get("simulation_time", i),
                    "differences": diffs
                })

        if len(expected) != len(actual):
            divergences.append({
                "step_index": max_len,
                "length_mismatch": {"expected_length": len(expected), "actual_length": len(actual)}
            })

        is_reproducible = len(divergences) == 0
        return is_reproducible, divergences
