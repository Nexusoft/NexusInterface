import * as TYPE from 'consts/actionTypes';
import store from 'store';
import fs from 'fs';
import path from 'path';
import Ajv from 'ajv';
import { walletDataDir } from 'consts/paths';
import { emailRegex } from 'utils/form';
import { readJson, writeJson } from 'utils/json';

const fileName = 'invoicedrafts.json';
const filePath = path.join(walletDataDir, fileName);

function saveInvoiceDraftsToFile(invoiceDrafts) {
  console.log('Saving');
  console.log(invoiceDrafts);
  return writeJson(filePath, { invoiceDrafts });
}

const loadInvoiceDraftsFile = () => {
  console.log('Loading Drafts');
  const schema = {
    patternProperties: {
      '^.+$': {
        required: ['invoiceReference', 'items'],
        properties: {
          reference: { type: 'string' },
          items: {
            type: 'array',
            minItems: 1,
          },
        },
      },
    },
  };
  const ajv = new Ajv();
  const validate = ajv.compile(schema);

  if (fs.existsSync(filePath)) {
    const json = readJson(filePath);
    console.log('Reaading File');
    console.log(json);
    let invoiceDrafts, valid;
    if (json && json.invoiceDrafts) {
      invoiceDrafts = json.invoiceDrafts;
      valid = validate(invoiceDrafts);
      if (valid) saveInvoiceDraftsToFile(invoiceDrafts);
    } else {
      invoiceDrafts = json.invoiceDrafts;
      valid = validate(invoiceDrafts);
    }

    if (valid) {
      return invoiceDrafts;
    } else {
      console.error(
        'Invoice Drafts validation error: ' + ajv.errorsText(validate.errors)
      );
      return {};
    }
  } else {
    writeJson(filePath, {
      invoiceDrafts: {},
    });
    return {};
  }
};

export const loadInvoiceDrafts = () => {
  const invoices = loadInvoiceDraftsFile();
  store.dispatch({
    type: TYPE.LOAD_INVOICE_DRAFTS,
    payload: invoices,
  });
};

export const addNewDraft = draft => {
  const result = store.dispatch({
    type: TYPE.ADD_NEW_INVOICE_DRAFT,
    payload: draft,
  });
  const { invoiceDrafts } = store.getState();
  console.log(invoiceDrafts);
  console.log(result);
  saveInvoiceDraftsToFile(invoiceDrafts);
  return result;
};

export const updateDraft = (name, contact) => {
  const result = store.dispatch({
    type: TYPE.UPDATE_INVOICE_DRAFT,
    payload: { name, contact },
  });
  const { invoiceDrafts } = store.getState();
  saveInvoiceDraftsToFile(invoiceDrafts);
  return result;
};

export const deleteDraft = name => {
  const result = store.dispatch({
    type: TYPE.DELETE_INVOICE_DRAFT,
    payload: name,
  });
  const { invoiceDrafts } = store.getState();
  saveInvoiceDraftsToFile(invoiceDrafts);
  return result;
};
