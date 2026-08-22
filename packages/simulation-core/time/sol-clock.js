// 1 Martian Sol = 24 hours, 39 minutes, 35.244 seconds = 88775.244 seconds
export const SOL_DURATION_SECONDS = 88775.244;

export class SolClock {
  constructor(initialSol = 142) {
    this.currentSol = initialSol;
    this.solTimeFraction = 0.5; // 12:00 PM local solar time
  }

  tick(secondsElapsed = 1) {
    this.solTimeFraction += (secondsElapsed / SOL_DURATION_SECONDS);
    if (this.solTimeFraction >= 1.0) {
      this.currentSol += Math.floor(this.solTimeFraction);
      this.solTimeFraction = this.solTimeFraction % 1.0;
    }
  }

  getFormattedTime() {
    const totalHours = this.solTimeFraction * 24;
    const hours = Math.floor(totalHours);
    const totalMinutes = (totalHours - hours) * 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.floor((totalMinutes - minutes) * 60);

    const pad = (n) => String(n).padStart(2, '0');
    return `Sol ${this.currentSol} ${pad(hours)}:${pad(minutes)}:${pad(seconds)} MTC`;
  }
}
