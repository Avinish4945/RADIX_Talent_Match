export function createPersistenceMiddleware(persistedActions, storage) {
  const actionTypes = new Set(persistedActions.map((action) => action.type));

  return (storeApi) => (next) => (action) => {
    const result = next(action);

    if (actionTypes.has(action.type)) {
      const { user, profile } = storeApi.getState().app;
      if (user) storage.writeJson("radix-user", user);
      else storage.removeItem("radix-user");
      storage.writeJson("radix-profile", profile);
    }

    return result;
  };
}
