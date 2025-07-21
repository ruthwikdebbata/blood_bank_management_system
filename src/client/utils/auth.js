const API = '/api';

export async function register(name, email, password) {
  const res = await fetch(`${API}/register`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  window.localStorage.setItem('token', data.token);
  window.localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  window.localStorage.setItem('token', data.token);
  window.localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export function logout() {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
}

export function getCurrentUser() {
  return JSON.parse(window.localStorage.getItem('user'));
}

export function getToken() {
  return window.localStorage.getItem('token');
}
