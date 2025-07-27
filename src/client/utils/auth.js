const API = '/api';

// src/client/utils/auth.js
export async function register(formData) {
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}


// src/client/utils/auth.js
export async function login(email, password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');

  // data.user now has { id, name, email, role }
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
