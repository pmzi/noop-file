const fs = require('fs');
const path = require('path');
const beautify = require('js-beautify').js;

function findNoop(currentDir) {
  if (fs.existsSync(path.join(currentDir, '_noop.js'))) {
    return path.join(currentDir, '_noop.js');
  } if (
    fs.existsSync(path.join(currentDir, '_noop'))
    && fs.existsSync(path.join(currentDir, '_noop/index.js'))
  ) {
    return path.join(currentDir, '_noop/index.js');
  }
  return false;
}

function write(body, filename) {
  fs.writeFileSync(filename, body);
}

module.exports = async function noop() {
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
};
