import * as Tritium from './tritium-api';
import {
  openConfirmDialog,
  openModal,
  openErrorDialog,
} from 'actions/overlays';

/**
 *
 *
 * @export
 * @param {*} {
 *   genesis = null,
 *   username = null,
 *   page = 0,
 *   limit = 100,
 *   verbose = 'default',
 * }
 * @returns {[]}
 */
export function listTransactions({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
  verbose = 'default',
}) {
  checkInput({ genesis, username, page, limit, verbose });

  let inputs = {
    genesis: genesis,
    username: username,
    page: page,
    limit: limit,
    verbose: verbose,
  };

  if (genesis === null) {
    delete inputs.genesis;
  }
  if (username === null) {
    delete inputs.username;
  }

  console.log(inputs);
  Tritium.PROMISE(
    'api',
    {
      api: 'users',
      verb: 'list',
      noun: 'transactions',
    },
    inputs
  )
    .then(({ data }) => {
      console.log(data);
      return data.result;
    })
    .catch(error => {
      if (error.response) {
        console.log(error.response);
         openErrorDialog({
          message: 'Error',
          note: error.response.data.error.message,
        });
      } else if (error.request) {
        console.log(error.request);
         openErrorDialog({
          message: 'Error',
          note: error.request.data.error.message,
        });
      } else {
        console.log('Error', error.message);
         openErrorDialog({
          message: 'Error',
          note: error.message.data.error.message,
        });
      }
    });
}

/**
 *
 *
 * @export
 * @param {*} {
 *   genesis = null,
 *   username = null,
 *   page = 0,
 *   limit = 100,
 *   verbose = 'default',
 * }
 * @returns
 */
export async function listTransactionsAll({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
  verbose = 'default',
}) {
  checkInput({ genesis, username, page, limit, verbose });
  const list = recursiveCommand(
    { api: 'users', verb: 'list', noun: 'transactions' },
    { genesis, username, page, limit, verbose }
  );
  return list;
}

export function listNotifications({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

export function listNotificationsAll({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

export function listAssets({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

export function listAssetsAll({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

export function listAccounts({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  return new Promise(resolve => {
    checkInput({ genesis, username, page, limit });
    let inputs = {
      genesis: genesis,
      username: username,
      page: page,
      limit: limit,
    };

    if (genesis === null) delete inputs.genesis;

    if (username === null) delete inputs.username;

    console.log(inputs);
    resolve(
      Tritium.PROMISE(
        'api',
        {
          api: 'users',
          verb: 'list',
          noun: 'accounts',
        },
        inputs
      )
        .then(({ data }) => {
          console.log(data);
          return data.result;
        })
        .catch(error => {
          catchError(error);
        })
    );
  });
}

export async function listAccountsAll({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  return new Promise(async resolve => {
    checkInput({ genesis, username, page, limit });
    const list = await recursiveCommand(
      { api: 'users', verb: 'list', noun: 'accounts' },
      { genesis, username, page, limit }
    );
    resolve(list);
  });
}

export function listTokens({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

export function listTokensAll({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

export function listNamespaces({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

export function listNamespaceAll({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

export function listNames({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  return new Promise(resolve => {
    checkInput({ genesis, username, page, limit });
    let inputs = {
      genesis: genesis,
      username: username,
      page: page,
      limit: limit,
    };

    if (genesis === null) delete inputs.genesis;

    if (username === null) delete inputs.username;

    console.log(inputs);
    resolve(
      Tritium.PROMISE(
        'api',
        {
          api: 'users',
          verb: 'list',
          noun: 'names',
        },
        inputs
      )
        .then(({ data }) => {
          console.log(data);
          return data.result;
        })
        .catch(error => {
          catchError(error);
        })
    );
  });
}

export function listNamesAll({
  genesis = null,
  username = null,
  page = 0,
  limit = 100,
}) {
  checkInput({ genesis, username, page, limit });
}

async function recursiveCommand(command, params) {
  return new Promise(async resolve => {
    console.log(`Passwith${params}`);
    console.log(params);

    const payload = await Tritium.PROMISE('Api', command, params);
    console.log(payload);
    if (payload.data.result.length != 0) {
      console.log(payload.data.result);
      console.log('Length Not Zero');
      const newParams = { ...params, page: ++params.page };
      return resolve(recursiveCommand(command, newParams));
    } else {
      console.log('Length Is Zero');
      return resolve();
    }
  });
}

function catchError(error) {
  if (error.response) {
    console.log(error.response);
     openErrorDialog({
      message: 'Error',
      note: error.response.data.error.message,
    });
  } else if (error.request) {
    console.log(error.request);
     openErrorDialog({
      message: 'Error',
      note: error.request.data.error.message,
    });
  } else {
    console.log('Error', error.message);
     openErrorDialog({
      message: 'Error',
      note: error.message.data.error.message,
    });
  }
}

/**
 *
 *
 * @param {*} input
 */
function checkInput(input) {
  if (input.genesis == null && input.username == null) {
    throw 'Provide Either a Genesis or Username';
  }

  if (input.genesis != null && input.username != null) {
    throw 'You can not provide both a genesis and a username, only supply one';
  }

  if (isNaN(input.page)) {
    throw 'Page must be a number';
  }

  if (isNaN(input.limit)) {
    throw 'Limit must be a number';
  }

  if (
    input.verbose != null &&
    input.verbose != 'default' &&
    input.verbose != 'summary' &&
    input.verbose != 'detail'
  ) {
    throw 'Verbose must be either default/summary/detail or null';
  }
}
