const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify').js;

function findNoop(currentDir) {
  if (fs.existsSync(path.join(currentDir, '_noop.js'))) {
    return path.join(currentDir, '_noop.js');
  }

  if (
    fs.existsSync(path.join(currentDir, '_noop'))
    && fs.existsSync(path.join(currentDir, '_noop/index.js'))
  ) {
    return path.join(currentDir, '_noop/index.js');
  }
  return false;
}

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

function write(body, filename) {
  ensureDirectoryExistence(filename);
  fs.writeFileSync(filename, body);
}

async function noopRoot() {
  const currentDir = process.env.PWD;

  const noopAddress = findNoop(currentDir);

  if (!noopAddress) {
    throw new Error('No noop found!');
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const noopFunc = require(noopAddress);

  Promise.resolve(noopFunc()).then((data) => {
    if (data) {
      write(beautify(data.body), path.join(currentDir, data.filename));
    }
  });
}

async function noop(noopAddress) {
  const currentDir = process.env.PWD;

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const noopFunc = require(noopAddress);

  Promise.resolve(noopFunc()).then((data) => {
    if (data) {
      write(beautify(data.body), path.join(currentDir, data.filename));
    }
  });
}

module.exports = {
  noop,
  noopRoot,
};
