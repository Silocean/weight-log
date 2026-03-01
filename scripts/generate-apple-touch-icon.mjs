/**
 * 生成应用图标 PNG（Apple Touch Icon 180x180 + 标签页回退 32x32）
 * 运行: node scripts/generate-apple-touch-icon.mjs
 */
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

// #0ea5e9 (Tailwind sky-500)
const R = 14, G = 165, B = 233;

function crc32(data) {
  let crc = 0xffffffff;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const chunk = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(chunk), 0);
  return Buffer.concat([len, chunk, crc]);
}

function writePng(width, height, outPath) {
  const raw = Buffer.alloc(height * (1 + width * 3));
  let off = 0;
  for (let y = 0; y < height; y++) {
    raw[off++] = 0;
    for (let x = 0; x < width; x++) {
      raw[off++] = R;
      raw[off++] = G;
      raw[off++] = B;
    }
  }
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const idat = makeChunk('IDAT', zlib.deflateSync(raw, { level: 9 }));
  const png = Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    idat,
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, png);
  console.log('Generated', outPath);
}

writePng(180, 180, path.join(publicDir, 'apple-touch-icon.png'));
writePng(32, 32, path.join(publicDir, 'favicon-32x32.png'));
