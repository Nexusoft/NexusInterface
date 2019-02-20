import * as TYPE from 'actions/actiontypes';

const initialState = {
  addressbook: [],
  myAccounts: [],
  searchQuery: '',
  selectedContactIndex: -1, // nothing selected
};

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

    case TYPE.ADD_NEW_CONTACT:
      return {
        ...state,
        addressbook: [...state.addressbook, action.payload].sort(compareNames),
      };

    case TYPE.CONTACT_SEARCH:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case TYPE.SELECT_CONTACT:
      return {
        ...state,
        selectedContactIndex: action.payload,
      };

    case TYPE.UPDATE_CONTACT:
      const index = state.addressbook.findIndex(
        c => c.name === action.payload.name
      );
      if (index === -1) {
        return state;
      } else {
        const addressbook = [...state.addressbook];
        addressbook.splice(index, 1, action.payload.contact);
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

    case TYPE.DELETE_CONTACT:
      return {
        ...state,
        addressbook: state.addressbook.filter(
          contact => contact.name !== action.payload
        ),
      };

    default:
      return state;
  }
};
