export default function sleep(miliseconds) {
  return new Promise((resolve) => setTimeout(() => resolve(), miliseconds));
}
