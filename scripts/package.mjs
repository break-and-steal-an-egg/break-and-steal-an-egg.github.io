import { mkdirSync, readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const root = fileURLToPath(new URL('../', import.meta.url));
const release = join(root, 'release');
const projectName = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).name;
if (!/^[a-z0-9-]+$/.test(projectName)) throw new Error('Invalid archive name.');

const sourcePaths = [
  'app', 'components', 'config', 'content', 'lib', 'public', 'scripts', '.github',
  '.gitignore', 'README.md', 'package.json', 'package-lock.json',
  'next.config.ts', 'next-env.d.ts', 'tsconfig.json', 'eslint.config.mjs',
  'postcss.config.js', 'tailwind.config.ts',
];

function filesAt(path) {
  const name = relative(root, path).split(sep).pop();
  if (name === '.DS_Store' || name.startsWith('.env')) return [];
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) throw new Error(`Cannot archive a symbolic link: ${relative(root, path)}`);
  if (stat.isDirectory()) return readdirSync(path).sort().flatMap((name) => filesAt(join(path, name)));
  if (!stat.isFile()) throw new Error(`Cannot archive this file type: ${relative(root, path)}`);
  return [path];
}

const crcTable = Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  return value >>> 0;
});

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/** Write standard ZIP files using Node only, so packaging needs no extra tools. */
function writeZip(target, base, files) {
  if (files.length > 65535) throw new Error('Too many files for a ZIP archive.');
  const entries = [];
  const directory = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(relative(base, file).split(sep).join('/'));
    const data = readFileSync(file);
    const compressed = deflateRawSync(data, { level: 9 });
    if (name.length > 65535 || data.length > 0xffffffff || compressed.length > 0xffffffff) throw new Error('File exceeds ZIP size limits.');
    const modified = lstatSync(file).mtime;
    const year = Math.max(1980, Math.min(2107, modified.getUTCFullYear()));
    const time = (modified.getUTCHours() << 11) | (modified.getUTCMinutes() << 5) | (modified.getUTCSeconds() >>> 1);
    const date = ((year - 1980) << 9) | ((modified.getUTCMonth() + 1) << 5) | modified.getUTCDate();
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6);
    local.writeUInt16LE(8, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    entries.push(local, name, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0314, 4);
    local.copy(central, 6, 4, 28);
    central.writeUInt32LE((0o100644 * 65536) >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    directory.push(central, name);
    offset += local.length + name.length + compressed.length;
    if (offset > 0xffffffff) throw new Error('Archive exceeds ZIP size limits.');
  }
  const centralSize = directory.reduce((size, part) => size + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  writeFileSync(target, Buffer.concat([...entries, ...directory, end]));
  console.log(`${relative(root, target)} (${files.length} files)`);
}

mkdirSync(release, { recursive: true });
writeZip(join(release, `${projectName}-source.zip`), root, sourcePaths.flatMap((path) => filesAt(resolve(root, path))));
writeZip(join(release, `${projectName}-static.zip`), join(root, 'out'), filesAt(join(root, 'out')));
