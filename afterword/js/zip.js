// Minimal ZIP writer and reader (stored, no compression). Enough for backups
// that any phone or computer can open, and that this app can restore.

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(u8) {
  let c = 0xffffffff;
  for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosTime(d) {
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

// files: [{ name, data: Blob | string, date?: Date }]
export async function makeZip(files) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  for (const f of files) {
    const blob = typeof f.data === 'string' ? new Blob([f.data]) : f.data;
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const name = enc.encode(f.name);
    const crc = crc32(bytes);
    const { time, date } = dosTime(f.date || new Date());

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, time, true);
    local.setUint16(12, date, true);
    local.setUint32(14, crc, true);
    local.setUint32(18, bytes.length, true);
    local.setUint32(22, bytes.length, true);
    local.setUint16(26, name.length, true);
    parts.push(local.buffer, name, bytes);

    const cen = new DataView(new ArrayBuffer(46));
    cen.setUint32(0, 0x02014b50, true);
    cen.setUint16(4, 20, true);
    cen.setUint16(6, 20, true);
    cen.setUint16(8, 0x0800, true);
    cen.setUint16(10, 0, true);
    cen.setUint16(12, time, true);
    cen.setUint16(14, date, true);
    cen.setUint32(16, crc, true);
    cen.setUint32(20, bytes.length, true);
    cen.setUint32(24, bytes.length, true);
    cen.setUint16(28, name.length, true);
    cen.setUint32(42, offset, true);
    central.push(cen.buffer, name);

    offset += 30 + name.length + bytes.length;
  }
  const cenSize = central.reduce((n, p) => n + (p.byteLength ?? p.length), 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cenSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
}

// Returns Map(name -> Blob). Reads only stored (uncompressed) entries.
export async function readZip(file) {
  const tailSize = Math.min(file.size, 66000);
  const tail = new DataView(await file.slice(file.size - tailSize).arrayBuffer());
  let eocd = -1;
  for (let i = tail.byteLength - 22; i >= 0; i--) {
    if (tail.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('That file is not a zip archive.');
  const count = tail.getUint16(eocd + 10, true);
  const cenSize = tail.getUint32(eocd + 12, true);
  const cenOff = tail.getUint32(eocd + 16, true);
  const cen = new DataView(await file.slice(cenOff, cenOff + cenSize).arrayBuffer());
  const dec = new TextDecoder();
  const out = new Map();
  let p = 0;
  for (let i = 0; i < count; i++) {
    if (cen.getUint32(p, true) !== 0x02014b50) break;
    const method = cen.getUint16(p + 10, true);
    const size = cen.getUint32(p + 24, true);
    const nameLen = cen.getUint16(p + 28, true);
    const extraLen = cen.getUint16(p + 30, true);
    const commentLen = cen.getUint16(p + 32, true);
    const localOff = cen.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(cen.buffer, p + 46, nameLen));
    if (method === 0) {
      const lh = new DataView(await file.slice(localOff, localOff + 30).arrayBuffer());
      const start = localOff + 30 + lh.getUint16(26, true) + lh.getUint16(28, true);
      out.set(name, file.slice(start, start + size));
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  return out;
}
