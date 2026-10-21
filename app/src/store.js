import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from './theme';
import * as auth from './auth';

const KEY = 'terminalcast:v1';
const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const DEFAULTS = {
  user: null, theme: 'amber', saved: ['HOU', 'NYC', 'CHI', 'RTM'], city: 'HOU',
  rules: { HOU: true, NYC: true, CHI: false, RTM: true, CUS: false, HH: false, LGB: false },
  units: 'F', speed: 'mph', refresh: '1m', push: true, sound: true, quiet: false, esiMin: 80,
};

export function AppProvider({ children }) {
  const [s, setS] = useState(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState(null); // city code of the in-app push banner

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setS((p) => ({ ...p, ...JSON.parse(raw) })))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem(KEY, JSON.stringify(s)).catch(() => {}); }, [s, ready]);

  const set = (patch) => setS((p) => ({ ...p, ...patch }));
  const value = useMemo(() => ({
    ...s, ready, toast, t: THEMES[s.theme], set,
    setToast,
    signUp: async (f) => set({ user: await auth.signUp(f) }),
    logIn: async (f) => set({ user: await auth.logIn(f) }),
    logOut: async () => { await auth.logOut(); set({ user: null }); },
    addCity: (k) => setS((p) => ({ ...p, saved: p.saved.includes(k) ? p.saved : [...p.saved, k], rules: { ...p.rules, [k]: true } })),
    removeCity: (k) => setS((p) => { const saved = p.saved.filter((x) => x !== k); return { ...p, saved, city: p.city === k && saved.length ? saved[0] : p.city }; }),
    toggleSaved: (k) => setS((p) => ({ ...p, saved: p.saved.includes(k) ? p.saved.filter((x) => x !== k) : [...p.saved, k] })),
    toggleRule: (k) => setS((p) => ({ ...p, rules: { ...p.rules, [k]: !p.rules[k] } })),
    temp: (f) => (s.units === 'F' ? f : Math.round(((f - 32) * 5) / 9)) + '°',
    speedText: (mph) => (s.speed === 'mph' ? mph + ' mph' : Math.round(mph * 1.609) + ' kph'),
  }), [s, ready, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
