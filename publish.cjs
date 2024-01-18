const { execSync } = require('child_process');

execSync('cp package.json ./dist');
execSync('npm publish', { stdio: 'inherit', cwd: "./dist" });