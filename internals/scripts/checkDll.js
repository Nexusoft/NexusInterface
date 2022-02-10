import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
// Temporarily disable chalk import because of a webpack error
// Try enabling this again at some point
// import chalk from 'chalk';

const dllPath = path.resolve(process.cwd(), 'dll');
const manifest = path.resolve(dllPath, 'renderer.json');

if (!(fs.existsSync(dllPath) && fs.existsSync(manifest))) {
  console.log(
    // chalk.black.bgYellow.bold(
    'The DLL files are missing. Sit back while we build them for you with "npm run build-dll"'
    // )
  );
  execSync('npm run build-dll');
}
