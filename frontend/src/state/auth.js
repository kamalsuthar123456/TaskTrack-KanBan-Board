const KEY = "krypton_kanban_auth_v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.identifier || typeof parsed.identifier !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function write(value) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export const auth = {
  isAuthenticated() {
    return !!read();
  },
  getUser() {
    return read();
  },
  login(identifier) {
    const user = { identifier: (identifier || "").trim(), loggedInAt: Date.now() };
    write(user);
    return user;
  },
  logout() {
    localStorage.removeItem(KEY);
  },
};
