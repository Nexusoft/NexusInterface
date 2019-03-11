import * as TYPE from './actiontypes';
import { loadModules } from 'api/modules';

const loadModulesActionCreator = () => async dispatch => {
  const modules = await loadModules();

  dispatch({
    type: TYPE.LOAD_MODULES,
    payload: modules,
  });
};
export { loadModulesActionCreator as loadModules };
