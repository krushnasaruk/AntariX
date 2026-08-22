export class NavigationPathfinderAgent {
  computeObstacleAvoidance(lidarData) {
    return {
      suggestedHeadingDelta: 4.2, // degrees
      wheelSpeedMultiplier: 0.9,
      hazardDetected: false
    };
  }
}
