// Auth service: Back4App (Parse) when configured, local mock otherwise.
// Email is the Parse username so the login form can use email + password.
import Parse, { configured } from './parse';

const valid = (e) => /^\S+@\S+\.\S+$/.test(e);
const toUser = (u) => ({ name: u.get('displayName') || u.get('email') || u.get('username'), email: u.get('email') || u.get('username') });

// Parse error codes -> messages the forms can show as-is.
function explain(e) {
  console.log('[B4A] auth error', e?.code, e?.message);
  switch (e?.code) {
    case 101: return new Error('Wrong email or password.');
    case 202: case 203: return new Error('An account with that email already exists.');
    case 205: return new Error('Verify your email before logging in.');
    case 100: case 124: return new Error('Network problem. Check your connection and retry.');
    case 125: return new Error('That email address looks invalid.');
    default: return new Error(e?.message || 'Something went wrong. Try again.');
  }
}

export async function signUp({ username, email, password, confirm }) {
  if (!username || !email || !password) throw new Error('All fields are required.');
  if (!valid(email)) throw new Error('That email address looks invalid.');
  if (password.length < 8) throw new Error('Password must be at least 8 characters.');
  if (password !== confirm) throw new Error('Passwords do not match.');
  if (!configured) return { name: username, email };
  try {
    const u = new Parse.User();
    u.set('username', email.toLowerCase());
    u.set('email', email.toLowerCase());
    u.set('password', password);
    u.set('displayName', username);
    await u.signUp();
    console.log('[B4A] signUp ok', u.id);
    return toUser(u);
  } catch (e) { throw explain(e); }
}

export async function logIn({ email, password }) {
  if (!email || !password) throw new Error('Enter your email and password.');
  if (!valid(email)) throw new Error('That email address looks invalid.');
  if (!configured) return { name: email.split('@')[0], email };
  try {
    const u = await Parse.User.logIn(email.toLowerCase(), password);
    console.log('[B4A] logIn ok', u.id);
    return toUser(u);
  } catch (e) { throw explain(e); }
}

export async function resetPassword(email) {
  if (!email) throw new Error('Enter your email first.');
  if (!valid(email)) throw new Error('That email address looks invalid.');
  if (!configured) return;
  try { await Parse.User.requestPasswordReset(email.toLowerCase()); console.log('[B4A] password reset requested'); }
  catch (e) { throw explain(e); }
}

// Returns the persisted Parse session user, or null (also validates the session token).
export async function restore() {
  if (!configured) return undefined; // undefined = keep whatever the mock persisted
  try {
    const u = await Parse.User.currentAsync();
    if (!u) return null;
    await u.fetch(); // throws 209 if the session expired
    return toUser(u);
  } catch (e) { console.log('[B4A] session restore failed', e?.code); await Parse.User.logOut().catch(() => {}); return null; }
}

export async function logOut() {
  if (configured) await Parse.User.logOut().catch((e) => console.log('[B4A] logOut error', e?.message));
}
