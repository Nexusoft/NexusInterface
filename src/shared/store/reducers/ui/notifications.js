import * as TYPE from 'consts/actionTypes';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.CREATE_NOTIFICATION: {
      const {
        payload: { id, content, ...options },
      } = action;
      return [
        {
          id,
          content,
          ...options,
        },
        ...state,
      ];
    }

    case TYPE.REMOVE_NOTIFICATION: {
      const {
        payload: { id },
      } = action;
      return state.filter((n) => n.id !== id);
    }

    default:
      return state;
  }
};
