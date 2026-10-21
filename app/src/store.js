import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from './theme';
import * as auth from './auth';
import * as backend from './backend';
import { registerForPush, localAlert } from './push';
import { configured } from './parse';
import { PRESETS, STATES } from './places';
import { buildCity, getGrid, getQuotes, getWeather } from './live';

const KEY = 'terminalcast:v3';
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const DEFAULTS = {
  user: null, theme: 'amber', saved: ['NWK', 'HOU', 'NYC', 'CHI', 'RTM'], city: 'NWK', custom: {},
  rules: { NWK: true, HOU: true, NYC: true, CHI: false, RTM: true },
  units: 'F', speed: 'mph', refresh: '1m', push: true, sound: true, quiet: false, esiMin: 80,
};
const prefsOf = ({ user, ...rest }) => rest; // everything except the session user syncs to Back4App
const EVERY = { '1m': 60000, '5m': 300000, '15m': 900000 };
const STATE_KEYS = Object.keys(STATES);

export function AppProvider({ children }) {
  const [s, setS] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [sync, setSync] = useState(configured ? 'idle' : 'mock'); // idle | syncing | synced | error | mock
  const [pushStatus, setPushStatus] = useState('Not registered');
  const [raw, setRaw] = useState({});        // code -> { data, error, loading, at }  (raw API payloads)
  const [quotes, setQuotes] = useState({});  // symbol -> { price, chg, ... }
  const [quotesAt, setQuotesAt] = useState(null);
  const [grid, setGrid] = useState(null);    // state code -> { temp, min7, max7, avg3 }
  const token = useRef(null);
  const loaded = useRef(false);

  const meta = useCallback((code) => PRESETS[code] || s.custom[code] || null, [s.custom]);
  const shortOf = useCallback((code) => (PRESETS[code] ? code : (s.custom[code]?.name || code).replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()), [s.custom]);

  /* ---- live data ---- */
  const load = useCallback(async (code, metaOverride) => {
    const m = metaOverride || PRESETS[code] || s.custom[code];
    if (!m) return;
    setRaw((p) => ({ ...p, [code]: { ...p[code], loading: true, error: null } }));
    try {
      const data = await getWeather(m.lat, m.lon);
      setRaw((p) => ({ ...p, [code]: { data, loading: false, error: null, at: Date.now() } }));
    } catch (e) {
      console.log('[LIVE] weather failed', code, e?.message);
      setRaw((p) => ({ ...p, [code]: { ...p[code], loading: false, error: e?.message || 'Network error' } }));
    }
  }, [s.custom]);
  const loadQuotes = useCallback(async () => {
    const q = await getQuotes();
    if (Object.keys(q).length) { setQuotes(q); setQuotesAt(Date.now()); }
  }, []);
  const loadGrid = useCallback(async () => {
    try {
      const r = await getGrid(STATE_KEYS.map((k) => [STATES[k][1], STATES[k][2]]));
      setGrid(Object.fromEntries(STATE_KEYS.map((k, i) => [k, r[i]])));
    } catch (e) { console.log('[LIVE] grid failed', e?.message); }
  }, []);

  // Derived city objects (recomputed when weather or quotes change).
  const cityCache = useRef({});
  const getCity = useCallback((code) => {
    const r = raw[code];
    if (!r?.data) return null;
    const c = cityCache.current[code];
    if (c && c.d === r.data && c.q === quotes) return c.v;
    const v = buildCity(r.data, quotes);
    cityCache.current[code] = { d: r.data, q: quotes, v };
    return v;
  }, [raw, quotes]);

  /* ---- startup: local cache + Back4App session ---- */
  useEffect(() => {
    (async () => {
      let local = {};
      try { const r = await AsyncStorage.getItem(KEY); if (r) local = JSON.parse(r); } catch {}
      const restored = await auth.restore();
      setS((p) => ({ ...p, ...local, ...(restored !== undefined ? { user: restored } : {}) }));
      setReady(true);
    })();
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); }, [s, ready]);

  /* ---- after login: pull prefs, register push ---- */
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

  /* ---- live refresh loop: quotes, grid, and every saved city ---- */
  useEffect(() => {
    if (!ready || !s.user) return;
    const tick = () => { loadQuotes(); s.saved.forEach((k) => load(k)); };
    tick(); loadGrid();
    const id = setInterval(tick, EVERY[s.refresh] || 60000);
    const gid = setInterval(loadGrid, 15 * 60000);
    return () => { clearInterval(id); clearInterval(gid); };
  }, [ready, s.user?.email, s.refresh, s.saved.join(',')]);

  /* ---- debounced upload of prefs + device subscriptions ---- */
  const placesOn = useMemo(() => s.saved.filter((k) => s.rules[k]).map((k) => { const m = PRESETS[k] || s.custom[k]; return m ? { code: k, name: m.name, lat: m.lat, lon: m.lon } : null; }).filter(Boolean), [s.saved, s.rules, s.custom]);
  useEffect(() => {
    if (!ready || !s.user || !configured || !loaded.current) return;
    const id = setTimeout(async () => {
      try {
        setSync('syncing');
        await backend.savePrefs(prefsOf(s));
        await backend.registerDevice({ token: token.current, places: placesOn, pushEnabled: s.push, esiMin: s.esiMin });
        setSync('synced');
      } catch (e) { console.log('[B4A] sync failed', e?.message); setSync('error'); }
    }, 800);
    return () => clearTimeout(id);
  }, [s.saved, s.rules, s.custom, s.theme, s.units, s.speed, s.refresh, s.push, s.sound, s.quiet, s.esiMin, s.city, pushStatus]);

  const set = (patch) => setS((p) => ({ ...p, ...patch }));
  const value = useMemo(() => ({
    ...s, ready, sync, pushStatus, quotes, quotesAt, grid, raw, t: THEMES[s.theme], set,
    meta, shortOf, getCity, load, loadQuotes,
    signUp: async (f) => set({ user: await auth.signUp(f) }),
    logIn: async (f) => set({ user: await auth.logIn(f) }),
    resetPassword: auth.resetPassword,
    logOut: async () => { await auth.logOut(); token.current = null; set({ ...DEFAULTS, user: null }); setRaw({}); setSync(configured ? 'idle' : 'mock'); setPushStatus('Not registered'); },
    // Real path: Back4App Cloud Code builds the message from live weather and pushes via Expo to this iPhone.
    sendTest: async (code) => {
      const m = PRESETS[code] || s.custom[code];
      const c = getCity(code);
      const fallback = async (why) => { if (c) await localAlert(`${shortOf(code)} · ${c.cond}`, `${c.temp}°F · ${c.note} ESI ${c.idx}.`).catch(() => {}); return why; };
      if (configured && token.current && m) {
        try { const r = await backend.sendTestAlert({ code, name: m.name, lat: m.lat, lon: m.lon }); return `Back4App pushed ${r.sent}/${r.recipients} device(s): ${r.title}`; }
        catch (e) { console.log('[B4A] test push failed', e?.message); return fallback(`Cloud Code: ${e?.message}. Sent a local notification instead`); }
      }
      return fallback(configured ? `No push token (${pushStatus}). Sent a local notification` : 'Local notification (no Back4App keys)');
    },
    checkLive: async () => {
      if (!configured) return 'Needs Back4App';
      if (!placesOn.length) return 'Turn on alerts for a city first';
      const r = await backend.checkMyAlerts(placesOn);
      return r.found ? `${r.found} live alert(s) found, ${r.sent} pushed` : 'No active NWS alerts or extreme conditions for your cities';
    },
    addPreset: (k) => setS((p) => ({ ...p, saved: p.saved.includes(k) ? p.saved : [...p.saved, k], rules: { ...p.rules, [k]: true } })),
    addPlace: (pl) => { // pl from geocode()
      const code = `G${pl.id}`;
      setS((p) => ({ ...p, custom: { ...p.custom, [code]: { name: pl.name, hub: pl.hub, lat: pl.lat, lon: pl.lon } }, saved: p.saved.includes(code) ? p.saved : [...p.saved, code], rules: { ...p.rules, [code]: true }, city: code }));
      return code;
    },
    removeCity: (k) => setS((p) => { const saved = p.saved.filter((x) => x !== k); return { ...p, saved, city: p.city === k && saved.length ? saved[0] : p.city }; }),
    toggleSaved: (k) => setS((p) => ({ ...p, saved: p.saved.includes(k) ? p.saved.filter((x) => x !== k) : [...p.saved, k] })),
    toggleRule: (k) => setS((p) => ({ ...p, rules: { ...p.rules, [k]: !p.rules[k] } })),
    temp: (f) => (s.units === 'F' ? f : Math.round(((f - 32) * 5) / 9)) + '°',
    speedText: (mph) => (s.speed === 'mph' ? mph + ' mph' : Math.round(mph * 1.609) + ' kph'),
  }), [s, ready, sync, pushStatus, quotes, quotesAt, grid, raw, getCity, meta, shortOf, load, loadQuotes, placesOn]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
