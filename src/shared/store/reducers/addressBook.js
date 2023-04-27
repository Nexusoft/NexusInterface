import * as TYPE from 'consts/actionTypes';

const initialState = {};

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
      return action.payload;

    case TYPE.ADD_NEW_CONTACT: {
      const contacts = [...Object.values(state), action.payload];
      contacts.sort(compareNames);
      return fromArray(contacts);
    }

    case TYPE.UPDATE_CONTACT: {
      let addressbook;
      const { name, contact } = action.payload;

      if (name === contact.name) {
        addressbook = { ...state, [name]: contact };
      } else {
        const contacts = [...Object.values(state), contact]
          .filter((c) => c.name !== action.payload.name)
          .sort(compareNames);
        addressbook = fromArray(contacts);
      }

      return addressbook;
    }

    case TYPE.DELETE_CONTACT: {
      const addressbook = { ...state };
      delete addressbook[action.payload];
      return addressbook;
    }

    default:
      return state;
  }
};
