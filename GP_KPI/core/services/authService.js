const authService = {
  login(userData) {
    const auth = { isAuthenticated: true, user: userData };
    localStorage.setItem('rd_auth', JSON.stringify(auth));
    return auth;
  },
  logout() {
    localStorage.removeItem('rd_auth');
  },
  isAuthenticated() {
    const auth = localStorage.getItem('rd_auth');
    return auth ? JSON.parse(auth).isAuthenticated : false;
  },
  getCurrentUser() {
    const auth = localStorage.getItem('rd_auth');
    return auth ? JSON.parse(auth).user : null;
  }
};
window.authService = authService;