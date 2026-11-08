// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { inflateRawSync } from 'node:zlib';
import { crc32 } from '../src/crc32.ts';
import { zip } from '../src/zip.ts';

/** Read entries back via the central directory (independent minimal reader). */
function unzip(buf: Buffer): Array<{ name: string; data: Buffer; crc: number }> {
  const end = buf.length - 22;
  assert.equal(buf.readUInt32LE(end), 0x06054b50, 'end of central directory');
  const count = buf.readUInt16LE(end + 10);
  let p = buf.readUInt32LE(end + 16);
  const out = [];
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(p), 0x02014b50, 'central header');
    const crc = buf.readUInt32LE(p + 16);
    const packedSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString('utf8');
    assert.equal(buf.readUInt32LE(local), 0x04034b50, 'local header');
    const dataStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    out.push({ name, crc, data: inflateRawSync(buf.subarray(dataStart, dataStart + packedSize)) });
    p += 46 + nameLen;
  }
  return out;
}

describe('zip', () => {
  const entries = [
    { name: 'a/readme.md', data: Buffer.from('# hello\n'.repeat(50)) },
    { name: 'a/stl/модель.stl', data: Buffer.from(Array.from({ length: 5000 }, (_, i) => i % 251)) },
    { name: 'empty.txt', data: Buffer.alloc(0) },
  ];

  it('round-trips names (UTF-8) and contents', () => {
    const back = unzip(zip(entries));
    assert.deepEqual(
      back.map((e) => e.name),
      entries.map((e) => e.name),
    );
    back.forEach((e, i) => {
      assert.deepEqual(e.data, entries[i].data);
      assert.equal(e.crc, crc32(entries[i].data));
    });
  });

  it('is deterministic', () => {
    assert.deepEqual(zip(entries), zip(entries));
  });

  it('computes the standard CRC-32', () => {
    assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
  });
});
