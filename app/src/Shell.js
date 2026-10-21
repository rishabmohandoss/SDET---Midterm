import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRESETS } from './places';
import { geocode } from './live';
import { F } from './theme';
import { useApp } from './store';
import { Row, Txt } from './ui';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import CitiesScreen from './screens/CitiesScreen';
import AlertsScreen from './screens/AlertsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ArbSheet from './screens/ArbSheet';

const TABS = [['home', '☁', 'HOME'], ['map', '◉', 'MAP'], ['cities', '★', 'CITIES'], ['alerts', '⚡', 'ALERTS'], ['settings', '⚙', 'SETTINGS']];
const TICK = ['NG', 'CL', 'ZW', 'HO'];

function Ticker() {
  const { t, quotes } = useApp();
  const QUOTES = TICK.map((k) => (quotes[k] ? [k, (k === 'ZW' ? quotes[k].price / 100 : quotes[k].price).toFixed(2), `${quotes[k].chg >= 0 ? '+' : '−'}${Math.abs(quotes[k].chg).toFixed(1)}%`] : [k, '…', '+0.0%']));
  const x = useRef(new Animated.Value(0)).current;
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!w) return;
    x.setValue(0);
    const a = Animated.loop(Animated.timing(x, { toValue: -w, duration: 28000, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [w]);
  // One copy is two passes of the quotes so it is always wider than the screen; the second copy makes the loop seamless.
  const copy = (id, onLayout) => (
    <View key={id} onLayout={onLayout} style={{ flexDirection: 'row' }}>
      {[0, 1].flatMap((n) => QUOTES.map(([s, p, c]) => (
        <View key={`${n}${s}`} style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 16, borderRightWidth: 1, borderRightColor: t.line }}>
          <Txt f="monoB" size={12} c="acc">{s}</Txt><Txt f="monoM" size={12}>{p}</Txt>
          <Txt f="monoM" size={12} c={c[0] === '+' ? 'up' : 'down'}>{c[0] === '+' ? '▲ ' : '▼ '}{c}</Txt>
        </View>
      )))}
    </View>
  );
  return (
    <View style={{ height: 30, overflow: 'hidden', backgroundColor: t.card, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.line, justifyContent: 'center' }}>
      <Animated.View style={{ flexDirection: 'row', width: 6000, transform: [{ translateX: x }] }}>
        {copy('a', (e) => setW(e.nativeEvent.layout.width))}
        {copy('b')}
      </Animated.View>
    </View>
  );
}

export default function Shell() {
  const { t, set, saved, addPlace, addPreset, load, meta, shortOf } = useApp();
  const [tab, setTab] = useState('home');
  const [arb, setArb] = useState(false);
  const [q, setQ] = useState('');
  const goTab = setTab;

  const [geo, setGeo] = useState({ hits: [], busy: false, err: '' });
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setGeo({ hits: [], busy: false, err: '' }); return; }
    setGeo((g) => ({ ...g, busy: true, err: '' }));
    const id = setTimeout(async () => {
      try { setGeo({ hits: await geocode(term), busy: false, err: '' }); }
      catch (e) { setGeo({ hits: [], busy: false, err: 'Search failed. Check your connection.' }); }
    }, 350);
    return () => clearTimeout(id);
  }, [q]);
  const presetHits = q.trim() ? Object.entries(PRESETS).filter(([k, c]) => (k + c.name + c.hub).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 3) : [];
  const pickPreset = (k) => { addPreset(k); load(k); set({ city: k }); setQ(''); setTab('home'); };
  const pickPlace = (pl) => { const code = addPlace(pl); load(code, { name: pl.name, hub: pl.hub, lat: pl.lat, lon: pl.lon }); setQ(''); setTab('home'); };

  const screens = {
    home: <HomeScreen goTab={goTab} />,
    map: <MapScreen goTab={goTab} openArb={() => setArb(true)} />,
    cities: <CitiesScreen goTab={goTab} />,
    alerts: <AlertsScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingHorizontal: 14, paddingTop: 4, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 10 }}>
          <Txt f="monoB" size={13} c="acc">&gt;</Txt>
          <TextInput value={q} onChangeText={setQ} placeholder="City or hub · NWK HOU NYC CHI" placeholderTextColor={t.muted} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Search cities"
            style={{ flex: 1, color: t.ink, fontFamily: F.mono, fontSize: 13 }} />
          <Txt f="monoB" size={10} c="up">● LIVE</Txt>
        </View>
      </View>
      <Ticker />
      {q.trim() !== '' && (
        <View style={{ backgroundColor: t.card, borderBottomWidth: 1, borderBottomColor: t.strong }}>
          {presetHits.map(([k, c]) => (
            <Pressable key={k} onPress={() => pickPreset(k)} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14, minHeight: 44, borderBottomWidth: 1, borderBottomColor: t.line2 }}>
              <Txt f="monoM" size={13}><Txt f="monoM" size={13} c="acc">{k}</Txt>  {c.name}</Txt><Txt f="monoM" size={11} c="muted">{saved.includes(k) ? '★ SAVED' : '＋ ADD'}</Txt>
            </Pressable>
          ))}
          {geo.hits.map((pl) => (
            <Pressable key={pl.id} onPress={() => pickPlace(pl)} style={{ padding: 14, minHeight: 44, borderBottomWidth: 1, borderBottomColor: t.line2 }}>
              <Row><Txt f="monoM" size={13} style={{ flex: 1 }}>{pl.name}</Txt><Txt f="monoM" size={11} c="muted">＋ ADD</Txt></Row>
              <Txt f="mono" size={10} c="muted" style={{ marginTop: 2 }}>{pl.hub}</Txt>
            </Pressable>
          ))}
          {geo.busy && <Txt f="monoM" size={12} c="muted" style={{ padding: 14 }}>Searching…</Txt>}
          {geo.err ? <Txt f="monoM" size={12} c="down" style={{ padding: 14 }}>{geo.err}</Txt> : null}
          {!geo.busy && !geo.err && q.trim().length >= 2 && presetHits.length === 0 && geo.hits.length === 0 && <Txt f="monoM" size={12} c="muted" style={{ padding: 14 }}>No match for “{q}”</Txt>}
        </View>
      )}
      <View style={{ flex: 1 }}>{screens[tab]}</View>
      <View style={{ flexDirection: 'row', height: 58, borderTopWidth: 1, borderTopColor: t.line, backgroundColor: t.bg }}>
        {TABS.map(([k, ic, l]) => (
          <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityLabel={l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Txt f="monoB" size={16} c={tab === k ? 'acc' : 'muted'}>{ic}</Txt>
            <Txt f="monoB" size={9} c={tab === k ? 'acc' : 'muted'} style={{ letterSpacing: 0.7 }}>{l}</Txt>
          </Pressable>
        ))}
      </View>
      <ArbSheet visible={arb} onClose={() => setArb(false)} />
    </SafeAreaView>
  );
}
