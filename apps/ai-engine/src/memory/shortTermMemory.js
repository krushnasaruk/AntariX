export class ShortTermMemory {
  constructor() {
    this.memoryBuffer = [];
  }

  remember(item) {
    this.memoryBuffer.push({ timestamp: Date.now(), item });
    if (this.memoryBuffer.length > 50) this.memoryBuffer.shift();
  }

  getRecentContext() {
    return this.memoryBuffer;
  }
}
