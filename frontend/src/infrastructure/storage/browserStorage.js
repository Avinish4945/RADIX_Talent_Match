export function createBrowserStorage() {
  return {
    readJson(key) {
      try {
        return JSON.parse(window.localStorage.getItem(key) || "null");
      } catch {
        return null;
      }
    },
    writeJson(key, value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem(key) {
      window.localStorage.removeItem(key);
    },
  };
}
