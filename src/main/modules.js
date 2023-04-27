import axios from 'axios';

export async function proxyRequest(...params) {
  const { data, status, statusText, headers } = await axios(...params);
  return { data, status, statusText, headers };
}
