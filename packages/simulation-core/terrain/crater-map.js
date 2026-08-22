export class CraterMap {
  constructor(name = 'Jezero Crater Sector 07', width = 1000, height = 1000) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.hazards = [
      { x: 350, y: 400, radius: 45, type: 'DEEP_CRATER', risk: 'HIGH' },
      { x: 600, y: 250, radius: 80, type: 'SAND_DUNE', risk: 'MEDIUM' },
      { x: 200, y: 750, radius: 60, type: 'BOULDER_FIELD', risk: 'HIGH' }
    ];
  }

  getTerrainElevation(x, y) {
    const scale1 = Math.sin(x * 0.01) * Math.cos(y * 0.01) * 15;
    const scale2 = Math.sin(x * 0.05 + y * 0.05) * 5;
    return 100 + scale1 + scale2;
  }
}
