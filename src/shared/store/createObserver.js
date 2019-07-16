const createObserver = store => (
  select,
  onChange,
  isChanged = (state1, state2) => state1 !== state2
) => {
  let currentState;

  function handleChange() {
    const nextState = select(store.getState());
    if (isChanged(currentState, nextState)) {
      currentState = nextState;
      onChange(currentState, {
        getState: store.getState,
        dispatch: store.dispatch,
      });
    }
  }

  const unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
};

export default createObserver;
