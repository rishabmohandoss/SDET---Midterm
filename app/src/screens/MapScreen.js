import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { GRID, LAYER_NODES, NODES, PIPES, PORTS } from '../data';
import { PRESETS, STATES, STATE_CITY } from '../places';
import { px } from '../live';
import { risk } from '../theme';
import { useApp } from '../store';
import { Btn, Chip, Row, Sub, Txt } from '../ui';

const LAYERS = [['futures', 'DEMAND PRESSURE'], ['pipeline', 'PIPELINE FLOW'], ['ports', 'PORT CORRIDORS'], ['freeze', 'CROP FREEZE']];
const TITLE = { futures: 'DEMAND PRESSURE', pipeline: 'ENERGY FLOW', ports: 'SHIPPING', freeze: 'FREEZE RISK' };
const LEGEND = {
  futures: 'Live 3-day temps. Green = heating/cooling demand building · Red = mild, demand soft · Tap a state',
  pipeline: 'Dashed = gas · Solid = crude · Pin color = live ESI of the hub city',
  ports: 'Cyan routes = freight corridors · Pin color = live ESI',
  freeze: 'Cyan intensity = coldest forecast low in the next 7 days (Open-Meteo)',
};
const ctr = (st) => [GRID[st][0] * 32 + 15, GRID[st][1] * 32 + 15];
const clamp = (x) => Math.max(0, Math.min(100, x));
const pressure = (g) => Math.max(clamp((65 - g.avg3) * 2.5), clamp((g.avg3 - 65) * 4));
const freezeLevel = (g) => (g.min7 <= 20 ? 3 : g.min7 <= 28 ? 2 : g.min7 <= 32 ? 1 : 0);

export default function MapScreen({ goTab, openArb }) {
  const { t, saved, addPreset, removeCity, set, grid, quotes, getCity, load, raw } = useApp();
  const [layer, setLayer] = useState('futures');
  const [region, setRegion] = useState(null);

  // Pins are colored by the live ESI of the hub city, so make sure those cities are loaded.
  useEffect(() => { Object.values(NODES).forEach((n) => { if (n[2] && !raw[n[2]]) load(n[2]); }); }, []);

  const tileColors = (id) => {
    const g = grid?.[id];
    let bg = t.raised, fg = t.muted;
    if (g && layer === 'futures') {
      const v = pressure(g) - 35;
      bg = v > 0 ? `rgba(0,255,102,${0.1 + Math.min(v / 65, 1) * 0.5})` : `rgba(255,59,78,${0.08 + Math.min(-v / 35, 1) * 0.3})`; fg = t.ink;
    } else if (g && layer === 'freeze') {
      const f = freezeLevel(g);
      if (f) { bg = `rgba(34,211,238,${0.15 + f * 0.2})`; fg = t.ink; }
    }
    return { bg, fg };
  };

  const edges = layer === 'pipeline' ? PIPES : layer === 'ports' ? PORTS : [];
  const g = region ? grid?.[region] : null;
  const hubCode = region ? STATE_CITY[region] : null;
  const commodity = region ? STATES[region][3] : null;
  const q = commodity && quotes[commodity];
  const press = g ? Math.round(pressure(g)) : 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 14, gap: 12 }}>
      <Row><Txt f="monoB" size={10} c="muted" style={{ letterSpacing: 1 }}>US WEATHER × MACRO</Txt><Txt f="monoB" size={12} c="acc">{TITLE[layer]}</Txt></Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {LAYERS.map(([k, l]) => <Chip key={k} label={`[${l}]`} on={layer === k} onPress={() => setLayer(k)} style={{ width: '49%' }} />)}
      </View>

      <View style={{ width: 362, height: 262, alignSelf: 'center', backgroundColor: t.bg, borderWidth: 1, borderColor: t.line, borderRadius: 12, overflow: 'hidden' }}>
        {!grid && <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', zIndex: 3 }}><ActivityIndicator color={t.acc} /><Txt f="mono" size={10} c="muted" style={{ marginTop: 8 }}>Loading live state weather…</Txt></View>}
        <View style={{ position: 'absolute', left: 4, top: 4, width: 352, height: 256 }}>
          {Object.keys(GRID).map((id) => {
            const { bg, fg } = tileColors(id);
            return (
              <Pressable key={id} onPress={() => setRegion(id)} accessibilityLabel={`State ${id}`}
                style={{ position: 'absolute', left: GRID[id][0] * 32, top: GRID[id][1] * 32, width: 30, height: 30, borderRadius: 4, borderWidth: 1, borderColor: region === id ? t.acc : t.line, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <Txt f="monoM" size={9} c={fg}>{id}</Txt>
              </Pressable>
            );
          })}
          <Svg width={352} height={256} style={{ position: 'absolute' }} pointerEvents="none">
            {edges.map(([a, b], i) => {
              const A = ctr(NODES[a][0]), B = ctr(NODES[b][0]), gas = layer === 'pipeline' && i % 2 === 0;
              return <Line key={a + b} x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} strokeWidth={2} stroke={layer === 'ports' ? t.cold : gas ? t.acc : t.orange} strokeDasharray={gas || layer === 'ports' ? '5 4' : undefined} />;
            })}
          </Svg>
          {LAYER_NODES[layer].map((k) => {
            const [st, label, cc] = NODES[k], p = ctr(st), c = cc && getCity(cc), col = c ? t[risk(c.idx)] : t.muted;
            return (
              <Pressable key={k} onPress={() => { if (cc) set({ city: cc }); setRegion(st); }} accessibilityLabel={`Hub ${label}`}
                style={{ position: 'absolute', left: p[0] - 24, top: p[1] - 9, width: 48, alignItems: 'center' }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: col, borderWidth: 2, borderColor: t.bg }} />
                <Txt f="monoB" size={8} style={{ backgroundColor: t.bg, paddingHorizontal: 3, borderRadius: 2 }}>{label}</Txt>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Sub lines={3} style={{ textAlign: 'center', alignSelf: 'center' }}>{LEGEND[layer]}</Sub>

      <Btn kind="pri" title="⚡ View Live Spread Opportunities" onPress={openArb} style={{ height: 52 }} />

      {region && (
        <View style={{ backgroundColor: t.card, borderWidth: 1, borderColor: t.strong, borderTopWidth: 2, borderTopColor: g ? t[risk(press)] : t.muted, borderRadius: 12, overflow: 'hidden' }}>
          <Row style={{ alignItems: 'flex-start', padding: 14, paddingBottom: 6 }}>
            <View style={{ flex: 1 }}>
              <Txt f="monoM" size={9} c="muted" style={{ letterSpacing: 0.8 }}>REGION EXPOSURE</Txt>
              <Txt f="sansB" size={16} fit style={{ marginTop: 3 }}>{STATES[region][0]}</Txt>
            </View>
            <Pressable onPress={() => setRegion(null)} accessibilityLabel="Close region" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Txt f="monoM" size={18} c="muted">×</Txt></Pressable>
          </Row>
          {g ? (
            <>
              <Txt size={13} c="body" style={{ paddingHorizontal: 14, paddingBottom: 10, lineHeight: 19 }}>
                {Math.round(g.temp)}°F now with a 7-day range of {Math.round(g.min7)}–{Math.round(g.max7)}°F. {press >= 60 ? 'Strong weather-driven demand pressure.' : press >= 35 ? 'Moderate demand pressure.' : 'Mild weather; demand is soft.'}
              </Txt>
              <View style={{ padding: 14, gap: 6, borderTopWidth: 1, borderTopColor: t.line }}>
                <Row><Txt f="monoM" size={11} c="muted">TEMP NOW</Txt><Txt f="monoM" size={11}>{Math.round(g.temp)}°F</Txt></Row>
                <Row><Txt f="monoM" size={11} c="muted">7-DAY LOW</Txt><Txt f="monoM" size={11} c={freezeLevel(g) ? 'cold' : 'ink'}>{Math.round(g.min7)}°F</Txt></Row>
                <Row><Txt f="monoM" size={11} c="muted">DEMAND PRESSURE</Txt><Txt f="monoM" size={11} c={risk(press)}>{press}/100</Txt></Row>
                {q && <Row><Txt f="monoM" size={11} c="muted">{commodity} FUTURES</Txt><Txt f="monoM" size={11} c={q.chg >= 0 ? 'up' : 'down'}>{px(commodity, quotes).toFixed(2)} {q.chg >= 0 ? '+' : '−'}{Math.abs(q.chg).toFixed(1)}%</Txt></Row>}
              </View>
            </>
          ) : <Txt size={13} c="body" style={{ paddingHorizontal: 14, paddingBottom: 14 }}>Live weather for this state is still loading.</Txt>}
          <View style={{ flexDirection: 'row', gap: 8, padding: 14, borderTopWidth: 1, borderTopColor: t.line }}>
            <Btn title="OPEN CITY" style={{ flex: 1, height: 44 }} disabled={!hubCode} onPress={() => { set({ city: hubCode }); load(hubCode); goTab('home'); }} />
            <Btn kind="out" title={!hubCode ? 'NO HUB' : saved.includes(hubCode) ? '★ SAVED' : '☆ SAVE HUB'} style={{ flex: 1, height: 44 }} disabled={!hubCode} onPress={() => (saved.includes(hubCode) ? removeCity(hubCode) : addPreset(hubCode))} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
