export class PacketCodec {
  static encode(packet) {
    return JSON.stringify({
      version: '1.0',
      encodedAt: Date.now(),
      data: packet
    });
  }

  static decode(rawString) {
    try {
      const parsed = JSON.parse(rawString);
      return parsed.data;
    } catch (e) {
      throw new Error('Packet Corruption Detected: Invalid JSON payload');
    }
  }
}
