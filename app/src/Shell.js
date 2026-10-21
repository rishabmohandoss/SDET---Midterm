import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CITIES } from './data';
import { F } from './theme';
import { useApp } from './store';
import { Txt } from './ui';
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import CitiesScreen from './screens/CitiesScreen';
import AlertsScreen from './screens/AlertsScreen';
import SettingsScreen from './screens/SettingsScreen';
import ArbSheet from './screens/ArbSheet';

const TABS = [['home', '☁', 'HOME'], ['map', '◉', 'MAP'], ['cities', '★', 'CITIES'], ['alerts', '⚡', 'ALERTS'], ['settings', '⚙', 'SETTINGS']];
const QUOTES = [['NG', '3.42', '+2.1%'], ['CL', '78.64', '−0.4%'], ['ZW', '6.12', '+1.3%'], ['FBX', '2,184', '+3.8%']];

function Ticker() {
  const { t } = useApp();
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

function PushBanner() {
  const { t, toast, setToast } = useApp();
  const y = useRef(new Animated.Value(-140)).current;
  useEffect(() => {
    if (!toast) return;
    y.setValue(-140);
    Animated.timing(y, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    const id = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  if (!toast) return null;
  const c = CITIES[toast];
  return (
    <Animated.View style={{ position: 'absolute', top: 54, left: 10, right: 10, zIndex: 50, transform: [{ translateY: y }] }}>
      <Pressable onPress={() => setToast(null)} style={{ flexDirection: 'row', gap: 10, padding: 12, borderRadius: 20, backgroundColor: 'rgba(30,32,40,.97)', borderWidth: 1, borderColor: t.strong }}>
        <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: t.acc, alignItems: 'center', justifyContent: 'center' }}><Txt f="monoB" size={15} c={t.bg}>⚡</Txt></View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Txt f="sansB" size={13}>TerminalCast</Txt><Txt f="monoM" size={10} c="muted">now</Txt></View>
          <Txt f="monoB" size={12} c="acc" style={{ marginTop: 2 }}>{toast} · {c.cond} {c.until}</Txt>
          <Txt size={12} c="body" style={{ marginTop: 2 }}>{c.note} ESI {c.idx}.</Txt>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function Shell() {
  const { t, set, saved } = useApp();
  const [tab, setTab] = useState('home');
  const [arb, setArb] = useState(false);
  const [q, setQ] = useState('');
  const goTab = setTab;

  const hits = q.trim() ? Object.entries(CITIES).filter(([k, c]) => (k + c.name + c.hub).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 4) : [];

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
          <TextInput value={q} onChangeText={setQ} placeholder="City or hub · HOU NYC RTM CHI" placeholderTextColor={t.muted} autoCapitalize="none" autoCorrect={false} accessibilityLabel="Search cities"
            style={{ flex: 1, color: t.ink, fontFamily: F.mono, fontSize: 13 }} />
          <Txt f="monoB" size={10} c="up">● LIVE</Txt>
        </View>
      </View>
      <Ticker />
      {q.trim() !== '' && (
        <View style={{ backgroundColor: t.card, borderBottomWidth: 1, borderBottomColor: t.strong }}>
          {hits.length === 0 && <Txt f="monoM" size={12} c="muted" style={{ padding: 14 }}>No match for “{q}”</Txt>}
          {hits.map(([k, c]) => (
            <Pressable key={k} onPress={() => { set({ city: k }); setQ(''); setTab('home'); }} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14, minHeight: 44, borderBottomWidth: 1, borderBottomColor: t.line2 }}>
              <Txt f="monoM" size={13}><Txt f="monoM" size={13} c="acc">{k}</Txt>  {c.name}</Txt><Txt f="monoM" size={13} c="muted">{saved.includes(k) ? '★' : ''}</Txt>
            </Pressable>
          ))}
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
      <PushBanner />
    </SafeAreaView>
  );
}
