/**
 * Deep Space Telemetry Packet (DSTP) Schema
 */
export function createPacket(header, payload) {
  return {
    syncWord: 0x35415253, // "MARS" ASCII in Hex
    header: {
      sequenceNumber: header.sequenceNumber || 0,
      timestampEarth: header.timestampEarth || Date.now(),
      timestampRoverSol: header.timestampRoverSol || 0,
      sender: header.sender || 'EARTH_DSN',
      recipient: header.recipient || 'ROVER_PERSEVERANCE_2',
      checksum: 0
    },
    payload: payload
  };
}

export function calculateCRC32(dataString) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < dataString.length; i++) {
    const byte = dataString.charCodeAt(i);
    crc = crc ^ byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
