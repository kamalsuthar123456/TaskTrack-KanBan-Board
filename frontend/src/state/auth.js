function parseTokenPayload(token) {
  try {
    const base64 = token.split('.')[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

let _user = null;

const _savedToken = localStorage.getItem('tt_token');
if (_savedToken) {
  const payload = parseTokenPayload(_savedToken);
  if (payload && payload.exp * 1000 > Date.now()) {
    _user = { id: payload.id };
  } else {
    localStorage.removeItem('tt_token');
  }
}

export const auth = {
  login(token, user) {
    localStorage.setItem('tt_token', token);
    _user = user;
  },

  logout() {
    localStorage.removeItem('tt_token');
    _user = null;
  },

  isAuthenticated() {
    const token = localStorage.getItem('tt_token');
    if (!token) return false;
    const payload = parseTokenPayload(token);
    return !!(payload && payload.exp * 1000 > Date.now());
  },

  getUser() {
    return _user;
  },

  getToken() {
    return localStorage.getItem('tt_token');
  },

  
  async rehydrate() {
    const token = localStorage.getItem('tt_token');
    if (!token) return false;

    const payload = parseTokenPayload(token);
    if (!payload || payload.exp * 1000 <= Date.now()) {
      this.logout();
      return false;
    }

    try {
      const res = await fetch(
        `${'http://localhost:5000/api'}/auth/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        this.logout();
        return false;
      }
      _user = await res.json();
      return true;
    } catch {
      return true;
    }
  },
};
