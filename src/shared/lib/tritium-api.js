import axios from 'axios';

const port = '8080';

export const PROMISE = (api, verb, noun, args = {}) => {
  console.log('TRITIUM_API');
  console.log(`http://127.0.0.1:${port}/${api}/${verb}/${noun}`);
  console.log(args);

  return axios.get(`http://127.0.0.1:${port}/${api}/${verb}/${noun}`, {
    params: args,
  });
};
