import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export const TOKEN_NAME = 'token';
export const APP_LOGOUT_EVENT = 'APP_LOGOUT'; 

function setAuthHeader(token) {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axios.defaults.headers.common['Authorization'];
}

export function initializeAuth(router) {
  const urlParams = new URLSearchParams(window.location.search);
  const googleToken = urlParams.get('token');

  if (googleToken) {
    localStorage.setItem(TOKEN_NAME, googleToken);
    setAuthHeader(googleToken);
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    router.replace('/');
    return;
  }

  const existingToken = localStorage.getItem(TOKEN_NAME);
  if (!existingToken) {
    setAuthHeader(null);
    return;
  }

  try {
    const { exp } = jwtDecode(existingToken);
    const now = Math.floor(Date.now() / 1000);

    if (exp && exp > now) {
      setAuthHeader(existingToken);
      if (['/login', '/signup'].includes(router.currentRoute.value.path)) {
        router.replace('/');
      }
    } else {
      localCleanup();
      setAuthHeader(null);
      if (router.currentRoute.value.path !== '/login') router.replace('/login');
    }
  } catch {
    localCleanup();
    setAuthHeader(null);
    if (router.currentRoute.value.path !== '/login') router.replace('/login');
  }
}

export function checkLoginStatus() {
  const token = localStorage.getItem(TOKEN_NAME);
  if (!token) return false;
  try {
    const { exp } = jwtDecode(token);
    return exp && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function localCleanup() {
  localStorage.removeItem(TOKEN_NAME);
  localStorage.removeItem('memberId');
  localStorage.removeItem('schedules');
  localStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent(APP_LOGOUT_EVENT));
}

export function logoutUser(router) {
  localCleanup();
  setAuthHeader(null);
  router?.push?.('/login');
}
