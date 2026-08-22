export class OnboardAutonomyLoop {
  static runCycle(roverState, environment) {
    if (roverState.batteryLevel < 15) {
      return { action: 'ENTER_SAFE_MODE', reason: 'CRITICAL_BATTERY_LOW' };
    }
    return { action: 'PROCEED_WAYPOINT_NAVIGATION' };
  }
}
