import * as TYPE from 'consts/actionTypes';

const initialState = [];

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.CREATE_BACKGROUND_TASK: {
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

    case TYPE.REMOVE_BACKGROUND_TASK: {
      const {
        payload: { id },
      } = action;
      return state.filter((t) => t.id !== id);
    }

    default:
      return state;
  }
};
