export class LidarSensorModel {
  static scanSurroundings() {
    const points = [];
    for (let angle = 0; angle < 360; angle += 15) {
      points.push({
        angle,
        distanceMeters: 5 + Math.random() * 25
      });
    }
    return points;
  }
}
