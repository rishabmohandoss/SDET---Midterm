import React, { useEffect } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { px } from '../live';
import { useApp } from '../store';
import { Label, Row, Txt } from '../ui';

const HUBS = ['NWK', 'NYC', 'CHI', 'HOU', 'CUS'];
const f2 = (x) => x.toFixed(2);
const money = (x) => `${x >= 0 ? '+' : '−'}$${Math.abs(x).toFixed(2)}`;

// Spreads computed from live delayed futures (Yahoo Finance). Each is tied to the live ESI of a weather hub.
function buildSpreads(q, cities) {
  const P = (k) => px(k, q);
  const need = (...ks) => ks.every((k) => P(k) != null);
  const wx = (code, fn) => { const c = cities[code]; return c ? { idx: c.idx, text: fn(c) } : { idx: null, text: 'Weather hub still loading' }; };
  const out = [];
  if (need('CL', 'BZ')) out.push({ pair: 'Brent vs WTI crude', a: `$${f2(P('CL'))}`, b: `$${f2(P('BZ'))}`, v: P('BZ') - P('CL'), unit: '/bbl', ...wx('HOU', (c) => `Gulf Coast export logistics: ${c.cond}, wind to ${c.sens[2][2].match(/\d+ mph/)?.[0] || '—'}`) });
  if (need('HO', 'CL')) out.push({ pair: 'Heating oil crack vs WTI', a: `$${f2(P('CL'))}`, b: `$${f2(P('HO') * 42)}`, v: P('HO') * 42 - P('CL'), unit: '/bbl', ...wx('NWK', (c) => `Newark ${c.temp}°F, ${c.sens[0][2]}`) });
  if (need('RB', 'CL')) out.push({ pair: 'Gasoline crack vs WTI', a: `$${f2(P('CL'))}`, b: `$${f2(P('RB') * 42)}`, v: P('RB') * 42 - P('CL'), unit: '/bbl', ...wx('NYC', (c) => `New York ${c.temp}°F, ${c.cond.toLowerCase()}`) });
  if (need('HO', 'NG')) out.push({ pair: 'Fuel switch · heating oil vs gas', a: `$${f2(P('NG'))}`, b: `$${f2((P('HO') * 42) / 5.825)}`, v: (P('HO') * 42) / 5.825 - P('NG'), unit: '/MMBtu', ...wx('NWK', (c) => `Newark heating demand ${c.sens[0][1]}/100, ${c.sens[0][2]}`) });
  if (need('KE', 'ZW')) out.push({ pair: 'Wheat · KC HRW vs Chicago SRW', a: `$${f2(P('ZW'))}`, b: `$${f2(P('KE'))}`, v: P('KE') - P('ZW'), unit: '/bu', ...wx('CHI', (c) => `Chicago ${c.temp}°F, ${c.cond.toLowerCase()}, freight risk ${c.sens[2][1]}/100`) });
  return out;
}

export default function ArbSheet({ visible, onClose }) {
  const { t, quotes, getCity, raw, load, loadQuotes } = useApp();
  useEffect(() => { if (visible) { loadQuotes(); HUBS.forEach((k) => { if (!raw[k]) load(k); }); } }, [visible]);
  const cities = Object.fromEntries(HUBS.map((k) => [k, getCity(k)]).filter(([, c]) => c));
  const spreads = buildSpreads(quotes, cities);
  // Featured = widest spread relative to the prices involved.
  const rel = (s) => Math.abs(s.v) / (parseFloat(s.a.slice(1)) || 1);
  const top = spreads.length ? [...spreads].sort((x, y) => rel(y) - rel(x))[0] : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(5,6,8,.72)', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => {}} style={{ maxHeight: '86%', backgroundColor: t.card, borderTopWidth: 2, borderTopColor: t.acc, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: t.strong, alignSelf: 'center', marginTop: 8 }} />
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <Row style={{ padding: 18, paddingBottom: 10 }}>
              <View><Label>⚡ SPREAD RADAR</Label><Txt f="sansB" size={18} style={{ marginTop: 3 }}>Live spreads, weather-linked</Txt></View>
              <Pressable onPress={onClose} accessibilityLabel="Close" style={{ width: 44, height: 44, borderWidth: 1, borderColor: t.strong, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}><Txt f="monoM" size={16} c="muted">×</Txt></Pressable>
            </Row>
            {!top ? <Txt f="mono" size={11} c="muted" style={{ padding: 18 }}>Loading live futures quotes…</Txt> : (
              <>
                <View style={{ marginHorizontal: 14, padding: 14, backgroundColor: t.raised, borderWidth: 1, borderColor: t.line, borderRadius: 12 }}>
                  <Txt f="monoM" size={10} c="muted">TOP SPREAD · {top.pair.toUpperCase()}</Txt>
                  <Txt f="monoB" size={46} c={top.v >= 0 ? 'up' : 'down'} style={{ marginVertical: 6, lineHeight: 52 }}>{money(top.v)}</Txt>
                  <Txt size={13} c="body" lines={4} style={{ lineHeight: 19 }}>{top.a} → {top.b} {top.unit}. Weather driver: {top.text}.</Txt>
                </View>
                <View style={{ padding: 14, paddingBottom: 0, gap: 8 }}>
                  {spreads.map((s) => (
                    <View key={s.pair} style={{ padding: 14, borderWidth: 1, borderColor: t.line, borderRadius: 12, backgroundColor: t.bg }}>
                      <Row style={{ gap: 8 }}><Txt f="sansB" size={14} fit style={{ flex: 1 }}>{s.pair}</Txt><Txt f="monoB" size={15} c={s.v >= 0 ? 'up' : 'down'}>{money(s.v)}</Txt></Row>
                      <Txt size={12} c="muted" lines={2} style={{ marginTop: 3, marginBottom: 8 }}>{s.text}</Txt>
                      <Row><Txt f="monoM" size={11}>{s.a} → {s.b}</Txt><Txt f="monoM" size={11} c="acc">{s.idx != null ? `WX ESI ${s.idx}` : 'WX …'}</Txt></Row>
                    </View>
                  ))}
                </View>
              </>
            )}
            <Txt f="mono" size={10} c="muted" lines={6} style={{ padding: 18, paddingBottom: 0, lineHeight: 15 }}>Delayed futures from Yahoo Finance; spreads computed in-app. WX ESI is the live weather index of the linked hub. Not investment advice.</Txt>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
