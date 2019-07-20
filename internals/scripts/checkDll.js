import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

const dllPath = path.resolve(process.cwd(), 'dll');
const manifest = path.resolve(dllPath, 'renderer.json');

if (!(fs.existsSync(dllPath) && fs.existsSync(manifest))) {
  console.log(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "npm run build-dll"'
    )
  );
  execSync('npm run build-dll');
}
