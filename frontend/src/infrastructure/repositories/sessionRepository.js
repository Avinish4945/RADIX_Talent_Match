const SESSION_KEY = "radix-user";

export function createSessionRepository(storage) {
  return {
    readSession() {
      return storage.readJson(SESSION_KEY);
    },
  };
}
