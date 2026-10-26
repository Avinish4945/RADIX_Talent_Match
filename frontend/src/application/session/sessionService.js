export function createSessionService(sessionRepository) {
  return {
    isAuthenticated() {
      return Boolean(sessionRepository.readSession());
    },
  };
}
