import * as TYPE from 'actions/actiontypes';

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

    default:
      return state;
  }
};
