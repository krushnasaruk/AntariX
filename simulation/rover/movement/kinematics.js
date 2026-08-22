export class RoverKinematics {
  static updatePosition(currentPos, speedMps, headingDegrees, deltaSeconds) {
    const rad = headingDegrees * (Math.PI / 180);
    const distanceMoved = speedMps * deltaSeconds;

    return {
      x: currentPos.x + Math.cos(rad) * distanceMoved,
      y: currentPos.y + Math.sin(rad) * distanceMoved,
      heading: headingDegrees
    };
  }
}
