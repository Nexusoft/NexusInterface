export function tryParsingJson(json: string) {
  try {
    return JSON.parse(json);
  } catch (err) {
    console.warn('Error parsing JSON', json);
    return null;
  }
}
