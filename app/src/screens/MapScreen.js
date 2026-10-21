import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { CHG, CITIES, FRZ, GRID, LAYER_NODES, NODES, PIPES, PORTS, REGION } from '../data';
import { risk } from '../theme';
import { useApp } from '../store';
import { Btn, Chip, Row, Sub, Txt } from '../ui';

const LAYERS = [['futures', 'FUTURES OVERLAY'], ['pipeline', 'PIPELINE FLOW'], ['ports', 'PORT CORRIDORS'], ['freeze', 'CROP FREEZE']];
const TITLE = { futures: 'FUTURES Δ%', pipeline: 'ENERGY FLOW', ports: 'SHIPPING', freeze: 'FREEZE RISK' };
const LEGEND = { futures: 'Green = bullish impact · Red = bearish · Tap a state', pipeline: 'Dashed = gas · Solid = crude · Pins = hubs', ports: 'Cyan routes = freight corridors · Pins = ports', freeze: 'Cyan intensity = hard-freeze risk to winter wheat' };
const ctr = (st) => [GRID[st][0] * 32 + 15, GRID[st][1] * 32 + 15];

export default function MapScreen({ goTab, openArb }) {
  const { t, saved, toggleSaved, set } = useApp();
  const [layer, setLayer] = useState('futures');
  const [region, setRegion] = useState(null);

  const tileColors = (id) => {
    const ch = CHG[id] || 0, f = FRZ[id] || 0;
    let bg = t.raised, fg = t.muted;
    if (layer === 'futures') {
      const a = Math.min(Math.abs(ch) / 7, 1) * 0.55 + 0.08;
      if (ch > 0.2) bg = `rgba(0,255,102,${a})`; else if (ch < -0.2) bg = `rgba(255,59,78,${a})`;
      if (ch) fg = t.ink;
    } else if (layer === 'freeze' && f) { bg = `rgba(34,211,238,${0.15 + f * 0.2})`; fg = t.ink; }
    return { bg, fg };
  };

  const edges = layer === 'pipeline' ? PIPES : layer === 'ports' ? PORTS : [];
  const R = region ? REGION[region] : null;
  const code = R && R[3];

  return (
    <ScrollView contentContainerStyle={{ padding: 14, gap: 12 }}>
      <Row><Txt f="monoB" size={10} c="muted" style={{ letterSpacing: 1 }}>US WEATHER × MACRO</Txt><Txt f="monoB" size={12} c="acc">{TITLE[layer]}</Txt></Row>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {LAYERS.map(([k, l]) => <Chip key={k} label={`[${l}]`} on={layer === k} onPress={() => setLayer(k)} style={{ width: '49%' }} />)}
      </View>

      <View style={{ width: 362, height: 262, alignSelf: 'center', backgroundColor: t.bg, borderWidth: 1, borderColor: t.line, borderRadius: 12, overflow: 'hidden' }}>
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
            const [st, label, cc] = NODES[k], p = ctr(st), col = t[risk(cc ? CITIES[cc].idx : 40)];
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
      <Sub style={{ textAlign: 'center' }}>{LEGEND[layer]}</Sub>

      <Btn kind="pri" title="⚡ View Live Arbitrage Opportunities  4" onPress={openArb} style={{ height: 52 }} />

      {region && (
        <View style={{ backgroundColor: t.card, borderWidth: 1, borderColor: t.strong, borderTopWidth: 2, borderTopColor: R ? t[R[2]] : t.muted, borderRadius: 12, overflow: 'hidden' }}>
          <Row style={{ alignItems: 'flex-start', padding: 14, paddingBottom: 6 }}>
            <View style={{ flex: 1 }}>
              <Txt f="monoM" size={9} c="muted" style={{ letterSpacing: 0.8 }}>REGION EXPOSURE</Txt>
              <Txt f="sansB" size={16} style={{ marginTop: 3 }}>{R ? R[0] : region}</Txt>
            </View>
            <Pressable onPress={() => setRegion(null)} accessibilityLabel="Close region" style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><Txt f="monoM" size={18} c="muted">×</Txt></Pressable>
          </Row>
          <Txt size={13} c="body" style={{ paddingHorizontal: 14, paddingBottom: 10, lineHeight: 19 }}>{R ? R[1] : 'No acute weather-driven exposure. Local benchmarks trading in range.'}</Txt>
          {R && (
            <View style={{ padding: 14, gap: 6, borderTopWidth: 1, borderTopColor: t.line }}>
              {R[4].map(([k, v, col]) => <Row key={k}><Txt f="monoM" size={11} c="muted">{k}</Txt><Txt f="monoM" size={11} c={col}>{v}</Txt></Row>)}
            </View>
          )}
          <View style={{ flexDirection: 'row', gap: 8, padding: 14, borderTopWidth: 1, borderTopColor: t.line }}>
            <Btn title="OPEN CITY" style={{ flex: 1, height: 44 }} disabled={!code} onPress={() => { set({ city: code }); goTab('home'); }} />
            <Btn kind="out" title={!code ? 'NO HUB' : saved.includes(code) ? '★ SAVED' : '☆ SAVE HUB'} style={{ flex: 1, height: 44 }} disabled={!code} onPress={() => toggleSaved(code)} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
