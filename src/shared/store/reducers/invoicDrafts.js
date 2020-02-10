import * as TYPE from 'consts/actionTypes';

const initialState = {};

function fromArray(contacts) {
  return contacts.reduce(
    (obj, contact) => ({ ...obj, [contact.draftTimeStamp]: contact }),
    {}
  );
}

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOAD_INVOICE_DRAFTS: {
      return action.payload;
    }
    case TYPE.ADD_NEW_INVOICE_DRAFT: {
      const payload = {
        ...action.payload,
        draftTimeStamp: new Date().getTime(),
      };
      const draftInvoices = [...Object.values(state), payload];
      return fromArray(draftInvoices);
    }

    case TYPE.UPDATE_INVOICE_DRAFT: {
      let invoicedrafts;
      const { name, contact } = action.payload;

      if (name === contact.name) {
        invoicedrafts = { ...state, [name]: contact };
      } else {
        const contacts = [...Object.values(state), contact]
          .filter(c => c.name !== action.payload.name)
          .sort(compareNames);
        invoicedrafts = fromArray(contacts);
      }

      return invoicedrafts;
    }

    case TYPE.DELETE_INVOICE_DRAFT: {
      const invoicedrafts = { ...state };
      delete invoicedrafts[action.payload];
      return invoicedrafts;
    }
    default:
      return state;
  }
};
