// Auth service. Mocked locally for now; swapped for Back4App (Parse) in the next step.
// Keep the signatures async and the error messages user-facing so the swap is a drop-in.
const valid = (e) => /^\S+@\S+\.\S+$/.test(e);

export async function signUp({ username, email, password, confirm }) {
  if (!username || !email || !password) throw new Error('All fields are required.');
  if (!valid(email)) throw new Error('That email address looks invalid.');
  if (password.length < 8) throw new Error('Password must be at least 8 characters.');
  if (password !== confirm) throw new Error('Passwords do not match.');
  return { name: username, email };
}

export async function logIn({ email, password }) {
  if (!email || !password) throw new Error('Enter your email and password.');
  if (!valid(email)) throw new Error('That email address looks invalid.');
  return { name: email.split('@')[0], email };
}

export async function logOut() {}
