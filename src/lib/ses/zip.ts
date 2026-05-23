import { Buffer } from "node:buffer";

const CRC_TABLE = new Uint32Array(256).map((_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function writeLocalHeader(fileName: Buffer, payload: Buffer, crc: number, time: number, day: number) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(time, 10);
  header.writeUInt16LE(day, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(payload.length, 18);
  header.writeUInt32LE(payload.length, 22);
  header.writeUInt16LE(fileName.length, 26);
  return Buffer.concat([header, fileName]);
}

function writeCentralDirectory(fileName: Buffer, payload: Buffer, crc: number, time: number, day: number) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(time, 12);
  header.writeUInt16LE(day, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(payload.length, 20);
  header.writeUInt32LE(payload.length, 24);
  header.writeUInt16LE(fileName.length, 28);
  return Buffer.concat([header, fileName]);
}

function writeEndOfCentralDirectory(centralLength: number, centralOffset: number) {
  const header = Buffer.alloc(22);
  header.writeUInt32LE(0x06054b50, 0);
  header.writeUInt16LE(1, 8);
  header.writeUInt16LE(1, 10);
  header.writeUInt32LE(centralLength, 12);
  header.writeUInt32LE(centralOffset, 16);
  return header;
}

export function zipXmlBase64(xml: string, fileName = "solicitud.xml") {
  const payload = Buffer.from(xml, "utf8");
  const encodedFileName = Buffer.from(fileName, "utf8");
  const { time, day } = dosDateTime();
  const crc = crc32(payload);
  const localHeader = writeLocalHeader(encodedFileName, payload, crc, time, day);
  const central = writeCentralDirectory(encodedFileName, payload, crc, time, day);
  const centralOffset = localHeader.length + payload.length;
  const end = writeEndOfCentralDirectory(central.length, centralOffset);
  return Buffer.concat([localHeader, payload, central, end]).toString("base64");
}
