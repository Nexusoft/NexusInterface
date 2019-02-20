import * as TYPE from 'actions/actiontypes';

const initialState = {
  addressbook: {},
  myAccounts: [],
};

function fromArray(contacts) {
  return contacts.reduce(
    (obj, contact) => ({ ...obj, [contact.name]: contact }),
    {}
  );
}

const compareNames = (a, b) => {
  let nameA = a.name.toUpperCase();
  let nameB = b.name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.LOAD_ADDRESS_BOOK:
      return {
        ...state,
        addressbook: action.payload,
      };

    case TYPE.ADD_NEW_CONTACT: {
      const contacts = [...Object.values(state.addressbook), action.payload];
      contacts.sort(compareNames);
      return {
        ...state,
        addressbook: fromArray(contacts),
      };
    }

    case TYPE.UPDATE_CONTACT: {
      let addressbook;
      const { name, contact } = action.payload;

      if (name === contact.name) {
        addressbook = { ...state.addressbook, [name]: contact };
      } else {
        const contacts = [...Object.values(state.addressbook), contact]
          .filter(c => c.name !== action.payload.name)
          .sort(compareNames);
        addressbook = fromArray(contacts);
      }

      return {
        ...state,
        addressbook,
      };
    }

    case TYPE.MY_ACCOUNTS_LIST:
      return {
        ...state,
        myAccounts: action.payload,
      };

    case TYPE.DELETE_CONTACT: {
      const addressbook = { ...state.addressbook };
      delete addressbook[action.payload];
      return {
        ...state,
        addressbook,
      };
    }

    default:
      return state;
  }
};
