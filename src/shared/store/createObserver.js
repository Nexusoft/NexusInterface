const createObserver = (store) => (select, onChange) => {
  let currentState = undefined;

  function handleChange() {
    const nextState = select(store.getState());
    if (currentState !== nextState) {
      const oldState = currentState;
      currentState = nextState;
      onChange(currentState, oldState);
    }
  }

  const unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
};

export default createObserver;
