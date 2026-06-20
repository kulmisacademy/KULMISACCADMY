/* Minimal STORE (uncompressed) ZIP builder — no external dependencies. */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of Array.from(bytes)) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function u16(n: number): number[] { return [n & 0xff, (n >> 8) & 0xff]; }
function u32(n: number): number[] { return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff]; }

function concat(...parts: (Uint8Array | number[])[]): Uint8Array {
  const len = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(len);
  let off = 0;
  for (const p of parts) { out.set(p instanceof Uint8Array ? p : new Uint8Array(p), off); off += p.length; }
  return out;
}

export function buildZip(files: { name: string; content: string }[]): Blob {
  const enc = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = enc.encode(file.name);
    const data = enc.encode(file.content);
    const crc = crc32(data);
    const size = data.length;

    const local = concat(
      [0x50, 0x4b, 0x03, 0x04], // sig
      u16(20), u16(0), u16(0),   // version, flags, compression (STORE)
      u16(0), u16(0),            // mod time, mod date
      u32(crc), u32(size), u32(size),
      u16(name.length), u16(0),  // name len, extra len
      name, data,
    );
    locals.push(local);

    const central = concat(
      [0x50, 0x4b, 0x01, 0x02], // sig
      u16(20), u16(20), u16(0), u16(0), // ver made, ver needed, flags, compression
      u16(0), u16(0),            // mod time, mod date
      u32(crc), u32(size), u32(size),
      u16(name.length), u16(0), u16(0), // name len, extra, comment
      u16(0), u16(0),            // disk start, int attribs
      u32(0),                    // ext attribs
      u32(offset),               // local header offset
      name,
    );
    centrals.push(central);
    offset += local.length;
  }

  const cdSize = centrals.reduce((s, c) => s + c.length, 0);
  const end = concat(
    [0x50, 0x4b, 0x05, 0x06], // sig
    u16(0), u16(0),            // disk, disk with CD
    u16(files.length), u16(files.length),
    u32(cdSize), u32(offset),
    u16(0),                    // comment length
  );

  return new Blob([...locals, ...centrals, end] as BlobPart[], { type: 'application/zip' });
}
