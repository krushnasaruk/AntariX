export class ScenarioLoader {
  static loadScenario(scenarioName) {
    const scenarios = {
      'crater-07': {
        name: 'Crater-07 Exploration',
        dustStormSeverity: 0.1,
        solarRadiationFlux: 590, // W/m^2
        initialBatteryPct: 94
      },
      'dust-storm': {
        name: 'Global Dust Storm Alert',
        dustStormSeverity: 0.85,
        solarRadiationFlux: 120, // Severe solar reduction
        initialBatteryPct: 62
      },
      'solar-conjunction': {
        name: 'Solar Conjunction Blackout',
        blackoutActive: true,
        communicationLinkState: 'OFFLINE',
        initialBatteryPct: 88
      }
    };

    return scenarios[scenarioName] || scenarios['crater-07'];
  }
}
