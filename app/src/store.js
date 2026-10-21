import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from './theme';
import * as auth from './auth';
import * as backend from './backend';
import { registerForPush, localAlert } from './push';
import { CITIES } from './data';
import { configured } from './parse';

const KEY = 'terminalcast:v1';
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const DEFAULTS = {
  user: null, theme: 'amber', saved: ['HOU', 'NYC', 'CHI', 'RTM'], city: 'HOU',
  rules: { HOU: true, NYC: true, CHI: false, RTM: true, CUS: false, HH: false, LGB: false },
  units: 'F', speed: 'mph', refresh: '1m', push: true, sound: true, quiet: false, esiMin: 80,
};
// Everything except the session user is synced to Back4App (UserPrefs).
const prefsOf = ({ user, ...rest }) => rest;

export function AppProvider({ children }) {
  const [s, setS] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null); // city code of the in-app push banner
  const [sync, setSync] = useState(configured ? 'idle' : 'mock'); // idle | syncing | synced | error | mock
  const [pushStatus, setPushStatus] = useState('Not registered');
  const token = useRef(null);
  const loaded = useRef(false); // true once the server prefs have been merged, so we never overwrite them with defaults

  // 1. Hydrate local cache, then verify the Back4App session.
  useEffect(() => {
    (async () => {
      let local = {};
      try { const raw = await AsyncStorage.getItem(KEY); if (raw) local = JSON.parse(raw); } catch {}
      const restored = await auth.restore();
      setS((p) => ({ ...p, ...local, ...(restored !== undefined ? { user: restored } : {}) }));
      setReady(true);
    })();
  }, []);

  // 2. Local persistence.
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); }, [s, ready]);

  // 3. After login (or on app start with a session): pull prefs from Back4App, register for push.
  useEffect(() => {
    if (!ready || !s.user) { loaded.current = false; return; }
    if (loaded.current) return;
    loaded.current = true;
    (async () => {
      if (configured) {
        try {
          setSync('syncing');
          const remote = await backend.loadPrefs();
          if (remote) setS((p) => ({ ...p, ...remote }));
          setSync('synced');
        } catch (e) { console.log('[B4A] loadPrefs failed', e?.message); setSync('error'); }
      }
      const r = await registerForPush();
      if (r.token) { token.current = r.token; setPushStatus('Registered'); } else setPushStatus(r.error);
    })();
  }, [ready, s.user?.email]);

  // 4. Debounced upload of prefs + device subscriptions whenever they change.
  useEffect(() => {
    if (!ready || !s.user || !configured || !loaded.current) return;
    const id = setTimeout(async () => {
      try {
        setSync('syncing');
        await backend.savePrefs(prefsOf(s));
        await backend.registerDevice({ token: token.current, cities: s.saved.filter((k) => s.rules[k]), pushEnabled: s.push, esiMin: s.esiMin });
        setSync('synced');
      } catch (e) { console.log('[B4A] sync failed', e?.message); setSync('error'); }
    }, 800);
    return () => clearTimeout(id);
  }, [s.saved, s.rules, s.theme, s.units, s.speed, s.refresh, s.push, s.sound, s.quiet, s.esiMin, s.city, pushStatus]);

  const set = (patch) => setS((p) => ({ ...p, ...patch }));
  const value = useMemo(() => ({
    ...s, ready, toast, sync, pushStatus, t: THEMES[s.theme], set, setToast,
    signUp: async (f) => set({ user: await auth.signUp(f) }),
    logIn: async (f) => set({ user: await auth.logIn(f) }),
    resetPassword: auth.resetPassword,
    logOut: async () => { await auth.logOut(); token.current = null; set({ ...DEFAULTS, user: null }); setSync(configured ? 'idle' : 'mock'); setPushStatus('Not registered'); },
    // Test push goes through Back4App Cloud Code -> Expo push -> iPhone notification.
    // If that path is unavailable, fall back to a local system notification so the phone still shows one.
    sendTest: async (city) => {
      const c = CITIES[city];
      const fallback = async (why) => { await localAlert(`${city} · ${c.cond} ${c.until}`, `${c.note} ESI ${c.idx}.`).catch(() => {}); return why; };
      if (configured && token.current) {
        try { const r = await backend.sendTestAlert(city); return r.sent ? `Sent via Back4App (${r.sent}/${r.recipients})` : `Back4App found ${r.recipients} device(s), sent ${r.sent}`; }
        catch (e) { console.log('[B4A] test push failed', e?.message); return fallback(`Cloud Code error: ${e?.message}. Sent a local notification instead`); }
      }
      return fallback(configured ? `No push token (${pushStatus}). Sent a local notification` : 'Local notification (no Back4App keys)');
    },
    addCity: (k) => setS((p) => ({ ...p, saved: p.saved.includes(k) ? p.saved : [...p.saved, k], rules: { ...p.rules, [k]: true } })),
    removeCity: (k) => setS((p) => { const saved = p.saved.filter((x) => x !== k); return { ...p, saved, city: p.city === k && saved.length ? saved[0] : p.city }; }),
    toggleSaved: (k) => setS((p) => ({ ...p, saved: p.saved.includes(k) ? p.saved.filter((x) => x !== k) : [...p.saved, k] })),
    toggleRule: (k) => setS((p) => ({ ...p, rules: { ...p.rules, [k]: !p.rules[k] } })),
    temp: (f) => (s.units === 'F' ? f : Math.round(((f - 32) * 5) / 9)) + '°',
    speedText: (mph) => (s.speed === 'mph' ? mph + ' mph' : Math.round(mph * 1.609) + ' kph'),
  }), [s, ready, toast, sync, pushStatus]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
