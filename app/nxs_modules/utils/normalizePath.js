export default function normalizePath(path) {
  if (process.platform === 'win32') {
    return path.replace(/\\/g, '/');
  } else {
    return path;
  }
}
