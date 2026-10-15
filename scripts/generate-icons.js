import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function generatePng(size) {
  // We'll render a rounded shield/hexagon with an inner 'Stop/Pause' symbol
  // Primary color: Vibrant Indigo (#4F46E5), Accent: Crimson (#EF4444)
  const width = size;
  const height = size;
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Antialiased outer circle / rounded badge
      if (dist <= radius) {
        // Deep pitch black background: #09090B
        let r = 9;
        let g = 9;
        let b = 11;
        let a = 255;

        // Inner shield/ring border
        if (dist > radius - (size >= 32 ? 2.5 : 1.2)) {
          // Neutral grey border: #3F3F46
          r = 63;
          g = 63;
          b = 70;
        }

        // Inner Pause/Stop vertical bars
        const barHalfW = size * 0.07;
        const barHalfH = size * 0.18;
        const barSpacing = size * 0.13;
        const inLeftBar = Math.abs(dx + barSpacing) <= barHalfW && Math.abs(dy) <= barHalfH;
        const inRightBar = Math.abs(dx - barSpacing) <= barHalfW && Math.abs(dy) <= barHalfH;

        if (inLeftBar || inRightBar) {
          // Crisp warning/blocked red: #EF4444
          r = 239;
          g = 68;
          b = 68;
        }

        // Smooth antialiased edge
        const edgeDist = radius - dist;
        if (edgeDist < 1.0) {
          a = Math.round(255 * Math.max(0, Math.min(1, edgeDist)));
        }

        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = a;
      } else {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method

  const compressed = zlib.deflateSync(rawData);

  const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSig, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public/icons');
fs.mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 32, 48, 128]) {
  const pngBuf = generatePng(size);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, pngBuf);
  console.log(`Generated ${filePath} (${pngBuf.length} bytes)`);
}

// Generate SVG version as well
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <circle cx="64" cy="64" r="56" fill="#09090B" stroke="#3F3F46" stroke-width="4"/>
  <rect x="42" y="40" width="16" height="48" rx="4" fill="#EF4444"/>
  <rect x="70" y="40" width="16" height="48" rx="4" fill="#EF4444"/>
</svg>`;
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svg.trim());
console.log('Generated public/icons/icon.svg');
