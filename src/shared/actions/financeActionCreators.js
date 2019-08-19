import * as TYPE from './actiontypes';
import * as Backend from 'scripts/backend-com';

export const LoadTritiumAccounts = () => dispatch => {
  Backend.RunCommand(
    'API',
    {
      api: 'users',
      verb: 'list',
      noun: 'accounts',
    },
    [
      {
        username: 'nexustest',
      },
    ]
  )
    .then(({ data }) => {
      console.log(data);
      dispatch({ type: TYPE.TRITIUM_ACCOUNTS_LIST, payload: data.result });
    })
    .catch(error => {
      if (error.response) {
        console.log(error.response);
        dispatch({
          type: TYPE.TRITIUM_ACCOUNTS_LIST,
          payload: [{ error: error.response.data.error.message }],
        });
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log('Error', error.message);
      }
    });
};
