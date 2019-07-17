const createObserver = store => (
  select,
  onChange,
  isChanged = (currentState, nextState) => currentState !== nextState
) => {
  let currentState;

  function handleChange() {
    const nextState = select(store.getState());
    if (isChanged(currentState, nextState)) {
      currentState = nextState;
      onChange(currentState, store);
    }
  }

  const unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
};

export default createObserver;
