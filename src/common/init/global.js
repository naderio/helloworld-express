import path from 'path';

// @TODO use `import.meta.url` instead of __filename/__dirname

const FILENAME_PREFIX_LENGTH = path.normalize(__filename).indexOf('/src/') + 1;
// const FILENAME_PREFIX_LENGTH = path.normalize(import.meta.url).indexOf('/src/') + 1;

function $filepath(filename) {
  return filename
    .slice(FILENAME_PREFIX_LENGTH)
    .replace(/^src\//, '~/')
    .replace(/.js$/, '')
    .replace(/\/index$/, '');
}

function $jobname(filename) {
  return $filepath(filename)
    .replace(/\.job$/, '')
    .replace(/^~\//, '')
    .replace(/\//g, '_');
}

Object.assign(globalThis, {
  $filepath,
  $jobname,
});
