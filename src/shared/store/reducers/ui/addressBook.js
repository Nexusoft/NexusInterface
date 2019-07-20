import * as TYPE from 'consts/actionTypes';

const initialState = {
  searchQuery: '',
  selectedContactName: null,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.CONTACT_SEARCH:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case TYPE.SELECT_CONTACT:
      return {
        ...state,
        selectedContactName: action.payload,
      };

    case TYPE.UPDATE_CONTACT:
      if (
        action.payload.name === state.selectedContactName &&
        action.payload.name !== action.payload.contact.name
      ) {
        return {
          ...state,
          selectedContactName: action.payload.contact.name,
        };
      } else {
        return state;
      }

    default:
      return state;
  }
};
