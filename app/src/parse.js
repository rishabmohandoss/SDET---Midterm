// Back4App (Parse) client. Without keys the app falls back to a local mock so it still runs.
import 'react-native-get-random-values';
import Parse from 'parse/react-native.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_ID = process.env.EXPO_PUBLIC_B4A_APP_ID;
const JS_KEY = process.env.EXPO_PUBLIC_B4A_JS_KEY;

export const configured = Boolean(APP_ID && JS_KEY);

if (configured) {
  Parse.setAsyncStorage(AsyncStorage);
  Parse.initialize(APP_ID, JS_KEY);
  Parse.serverURL = 'https://parseapi.back4app.com';
  console.log('[B4A] Parse initialized');
} else {
  console.log('[B4A] No keys in .env.local; running in local mock mode');
}

export default Parse;
