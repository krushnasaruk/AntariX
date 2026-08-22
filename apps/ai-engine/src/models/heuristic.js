export class HeuristicModel {
  static evaluateRisk(powerLevel, terrainSlope) {
    return (100 - powerLevel) * 0.4 + terrainSlope * 2.0;
  }
}
