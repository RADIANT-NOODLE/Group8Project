/**
 * Image uploads accept real JPEG, PNG and WebP files only, judged by the
 * file's contents: renaming a video or audio file must not get it through.
 */
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import { IMAGE_ACCEPT, imageFileProblem } from '../app/services/imageFiles.js';

const ascii = (text) => [...text].map((char) => char.charCodeAt(0));
const padded = (bytes) => new Uint8Array([...bytes, ...new Array(32).fill(0)]);
const file = (bytes, name, type) => new File([padded(bytes)], name, { type });

const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP')];

test('real JPEG, PNG and WebP images are accepted', async () => {
  assert.equal(await imageFileProblem(file(JPEG, 'a.jpg', 'image/jpeg')), '');
  assert.equal(await imageFileProblem(file(PNG, 'a.png', 'image/png')), '');
  assert.equal(await imageFileProblem(file(WEBP, 'a.webp', 'image/webp')), '');
});

test('video and audio files are refused', async () => {
  const media = [
    ['clip.mp4', 'video/mp4', [0, 0, 0, 0x18, ...ascii('ftypmp42')]],
    ['clip.webm', 'video/webm', [0x1a, 0x45, 0xdf, 0xa3]],
    ['clip.avi', 'video/x-msvideo', [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('AVI ')]],
    ['song.mp3', 'audio/mpeg', [...ascii('ID3'), 4, 0]],
    ['song.wav', 'audio/wav', [...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WAVE')]],
    ['song.ogg', 'audio/ogg', ascii('OggS')],
  ];
  for (const [name, type, bytes] of media) {
    assert.match(await imageFileProblem(file(bytes, name, type)), /only JPEG, PNG or WebP/, name);
  }
});

test('renaming a video or audio file to .jpg does not get it through', async () => {
  const renamedVideo = file([0, 0, 0, 0x18, ...ascii('ftypmp42')], 'holiday.jpg', 'image/jpeg');
  const renamedAudio = file([...ascii('ID3'), 4, 0], 'song.png', 'image/png');
  assert.match(await imageFileProblem(renamedVideo), /only JPEG, PNG or WebP/);
  assert.match(await imageFileProblem(renamedAudio), /only JPEG, PNG or WebP/);
});

test('other image types and empty files are refused', async () => {
  const svg = file(ascii('<svg xmlns="http://www.w3.org/2000/svg"/>'), 'a.svg', 'image/svg+xml');
  assert.match(await imageFileProblem(svg), /only JPEG, PNG or WebP/);
  assert.match(await imageFileProblem(file(ascii('GIF89a'), 'a.gif', 'image/gif')), /only JPEG, PNG or WebP/);
  assert.match(await imageFileProblem(new File([], 'empty.jpg', { type: 'image/jpeg' })), /only JPEG, PNG or WebP/);
});

test('the size limit applies', async () => {
  const large = new File([padded(JPEG), new Uint8Array(3 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
  assert.match(await imageFileProblem(large, { maxBytes: 2 * 1024 * 1024 }), /at most 2 MB/);
  assert.equal(await imageFileProblem(large), '');
});

test('every file input in the app offers images only', async () => {
  const root = path.resolve('app');
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  const pages = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.jsx'))
    .map((entry) => path.join(entry.parentPath, entry.name));

  let inputs = 0;
  for (const page of pages) {
    const source = await readFile(page, 'utf8');
    for (const match of source.matchAll(/<input\b[^>]*?type="file"[^>]*?>/gs)) {
      inputs += 1;
      assert.match(match[0], /accept=\{IMAGE_ACCEPT\}/, `${page}: a file input must use IMAGE_ACCEPT`);
    }
  }
  assert.ok(inputs >= 4, 'expected to find the upload inputs');
  assert.equal(IMAGE_ACCEPT, 'image/jpeg,image/png,image/webp');
});
