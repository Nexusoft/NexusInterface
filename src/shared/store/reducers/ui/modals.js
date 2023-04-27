import * as TYPE from 'consts/actionTypes';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.CREATE_MODAL: {
      const {
        payload: { id, component, props },
      } = action;
      return [
        ...state,
        {
          id,
          component,
          props,
        },
      ];
    }

    case TYPE.REMOVE_MODAL: {
      const {
        payload: { id },
      } = action;
      return state.filter((m) => m.id !== id);
    }

    default:
      return state;
  }
};
