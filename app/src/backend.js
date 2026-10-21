// Back4App data layer. Classes (create from the app on first save, or in the dashboard):
//   UserPrefs  one row per user: saved cities, alert rules, theme, units, ...
//   Device     one row per push token: owner, Expo push token, cities to alert on, ESI threshold
import { Platform } from 'react-native';
import Parse, { configured } from './parse';

const privateAcl = (user) => { const a = new Parse.ACL(user); a.setPublicReadAccess(false); a.setPublicWriteAccess(false); return a; };

export async function loadPrefs() {
  if (!configured) return null;
  const user = await Parse.User.currentAsync();
  if (!user) return null;
  const row = await new Parse.Query('UserPrefs').equalTo('user', user).first();
  console.log('[B4A] loadPrefs', row ? 'found' : 'none yet');
  return row ? row.get('data') : null;
}

export async function savePrefs(data) {
  if (!configured) return;
  const user = await Parse.User.currentAsync();
  if (!user) return;
  let row = await new Parse.Query('UserPrefs').equalTo('user', user).first();
  if (!row) { row = new Parse.Object('UserPrefs'); row.set('user', user); row.setACL(privateAcl(user)); }
  row.set('data', data);
  await row.save();
  console.log('[B4A] savePrefs ok');
}

export async function registerDevice({ token, cities, pushEnabled, esiMin }) {
  if (!configured || !token) return;
  const user = await Parse.User.currentAsync();
  if (!user) return;
  let row = await new Parse.Query('Device').equalTo('token', token).first();
  if (!row) { row = new Parse.Object('Device'); row.set('token', token); }
  row.set('user', user);
  row.setACL(privateAcl(user));
  row.set('platform', Platform.OS);
  row.set('cities', cities);
  row.set('pushEnabled', pushEnabled);
  row.set('esiMin', esiMin);
  await row.save();
  console.log('[B4A] registerDevice ok', cities.join(','), 'push', pushEnabled);
}

// Asks Cloud Code to push a test alert for one city to the caller's own devices.
export async function sendTestAlert(city) {
  const res = await Parse.Cloud.run('sendCityAlert', { city, test: true });
  console.log('[B4A] sendCityAlert', JSON.stringify(res));
  return res;
}
