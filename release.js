const fse = require('fs-extra');
const sh = require('shelljs');

// Prepare files
fse.emptyDirSync('dist/release');
fse.copySync('dist/backend', 'dist/release/backend');
fse.copySync('dist/ngxe', 'dist/release/ngxe');
fse.copySync('bin', 'dist/release/bin');
fse.copySync('package-release.json', 'dist/release/package.json');

// Publish
const pkg = require('./package-release.json');
if (sh.exec(`npm publish ./dist/release --access=public ${pkg.version.indexOf('beta') !== -1 ? '--tag=beta' : ''}`).code !== 0) {
  console.log('Publishing error!');
  sh.exit(1);
}

console.log('Done!');
