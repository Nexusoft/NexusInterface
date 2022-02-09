import * as TYPE from 'consts/actionTypes';

const initialState = {};

export default (state = initialState, action) => {
  switch (action.type) {
    case TYPE.MODULE_DOWNLOAD_PROGRESS: {
      const { moduleName, downloaded, totalSize } = action.payload;
      return {
        ...state,
        [moduleName]: {
          downloaded,
          totalSize,
        },
      };
    }

    case TYPE.MODULE_DOWNLOAD_FINISH:
      return {
        ...state,
        [action.payload.moduleName]: undefined,
      };

    default:
      return state;
  }
};
