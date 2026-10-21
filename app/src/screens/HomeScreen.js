import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { CITIES } from '../data';
import { risk, sign } from '../theme';
import { useApp } from '../store';
import { Card, Chip, Label, Row, Sub, Txt } from '../ui';

export default function HomeScreen({ goTab }) {
  const { t, city, saved, set, rules, toggleRule, temp, speedText } = useApp();
  const c = CITIES[city] || CITIES[saved[0]] || CITIES.HOU;
  const ic = risk(c.idx), arc = (c.idx / 100) * 220;
  const p = parseInt(c.precip, 10) || 0;
  const hrs = ['NOW', '10A', '11A', '12P', '1P', '2P', '3P', '4P', '5P', '6P', '7P', '8P'];
  const hasAlert = !c.until.startsWith('NO');

  return (
    <ScrollView contentContainerStyle={{ padding: 14, gap: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
        {saved.map((k) => <Chip key={k} label={k} on={k === city} onPress={() => set({ city: k })} />)}
        <Chip label="＋" a11y="Add city" onPress={() => goTab('cities')} />
      </ScrollView>

      <Card>
        <Row style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Txt f="monoM" size={9} c="muted" style={{ letterSpacing: 0.8 }}>{c.hub}</Txt>
            <Txt f="sansB" size={21} style={{ marginTop: 2 }}>{c.name}</Txt>
            <Txt f="monoB" size={11} c={c.cc} style={{ marginTop: 4 }}>{c.cond}</Txt>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Txt f="monoM" size={44} style={{ lineHeight: 48 }}>{temp(c.temp)}</Txt>
            <Sub style={{ marginTop: 4 }}>FEELS {temp(c.feels)}</Sub>
          </View>
        </Row>
        <View style={{ flexDirection: 'row', gap: 1, backgroundColor: t.line, borderRadius: 8, overflow: 'hidden', marginTop: 14 }}>
          {[['WIND', `${speedText(c.wind)} ${c.dir}`], ['BARO', c.baro], ['PRECIP', c.precip]].map(([k, v]) => (
            <View key={k} style={{ flex: 1, backgroundColor: t.bg, padding: 10 }}>
              <Txt f="monoM" size={9} c="muted">{k}</Txt><Txt f="monoM" size={12} style={{ marginTop: 3 }}>{v}</Txt>
            </View>
          ))}
        </View>
      </Card>

      {hasAlert && (
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, backgroundColor: t.accSoft, borderWidth: 1, borderColor: t.acc, borderRadius: 12 }}>
          <Txt f="monoB" size={14} c="acc">!</Txt>
          <View style={{ flex: 1 }}>
            <Txt f="monoB" size={12} c="acc">{c.cond} · {c.until}</Txt>
            <Txt size={12} c="body" style={{ marginTop: 2 }}>Mkt link: {c.note}</Txt>
          </View>
          <Pressable onPress={() => toggleRule(city)} accessibilityLabel={`Toggle alerts for ${city}`} hitSlop={10}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: t.acc, borderRadius: 10 }}>
            <Txt size={16}>{rules[city] ? '🔔' : '🔕'}</Txt>
          </Pressable>
        </View>
      )}

      <Card>
        <Row style={{ marginBottom: 10 }}><Label>MARKET MOVERS</Label><Sub>WEATHER-LINKED</Sub></Row>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {c.mv.map(([k, v]) => (
            <View key={k} style={{ flex: 1, backgroundColor: t.bg, borderWidth: 1, borderColor: t.line, borderRadius: 10, padding: 10 }}>
              <Txt f="monoM" size={9} c="muted">{k}</Txt>
              <Txt f="monoB" size={15} c={sign(v)} style={{ marginTop: 4 }}>{v}</Txt>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Row style={{ marginBottom: 10 }}><Label>HOURLY</Label><Sub>NEXT 12H</Sub></Row>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {hrs.map((h, i) => (
            <View key={h} style={{ width: 48, alignItems: 'center' }}>
              <Txt f="monoM" size={10} c="muted">{h}</Txt>
              <Txt f="monoM" size={12} style={{ marginVertical: 8 }}>{temp(c.temp + Math.round(Math.sin((i - 6) / 24 * 6.283) * 5 + 5))}</Txt>
              <Txt f="monoM" size={10} c="cold">{Math.max(0, p - 8 + ((i * 7) % 16))}%</Txt>
            </View>
          ))}
        </ScrollView>
      </Card>

      <Card>
        <Row><Label>ECONOMIC SENSITIVITY INDEX</Label><Sub>24H</Sub></Row>
        <View style={{ alignItems: 'center', marginTop: 8 }}>
          <Svg width={220} height={128} viewBox="0 0 160 92">
            <Path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke={t.line} strokeWidth={10} />
            <Path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke={t[ic]} strokeWidth={10} strokeDasharray={`${arc} 300`} />
          </Svg>
          <View style={{ position: 'absolute', bottom: 6, alignItems: 'center' }}>
            <Txt f="monoB" size={34} c={ic} style={{ lineHeight: 38 }}>{c.idx}</Txt>
            <Sub style={{ marginTop: 4 }}>{c.il}</Sub>
          </View>
        </View>
        <View style={{ gap: 12, marginTop: 14 }}>
          {c.sens.map(([name, v, note]) => (
            <View key={name}>
              <Row><Txt f="sansM" size={13}>{name}</Txt><Txt f="monoB" size={12} c={risk(v)}>{v}</Txt></Row>
              <View style={{ height: 4, backgroundColor: t.line, borderRadius: 2, marginTop: 6, marginBottom: 5 }}>
                <View style={{ height: 4, width: `${v}%`, backgroundColor: t[risk(v)], borderRadius: 2 }} />
              </View>
              <Txt f="mono" size={11} c="muted">{note}</Txt>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Row style={{ marginBottom: 6 }}><Label>5-DAY FORECAST</Label><Sub>HI / LO</Sub></Row>
        {c.fc.map(([d, hi, lo, cond, col]) => (
          <View key={d} style={{ flexDirection: 'row', alignItems: 'center', height: 34, borderTopWidth: 1, borderTopColor: t.line2, gap: 8 }}>
            <Txt f="monoM" size={11} c="muted" style={{ width: 44 }}>{d}</Txt>
            <Txt f="monoM" size={10} c={col} style={{ flex: 1 }}>{cond}</Txt>
            <Txt f="monoM" size={12} c="muted" style={{ width: 36, textAlign: 'right' }}>{temp(lo)}</Txt>
            <Txt f="monoM" size={12} style={{ width: 36, textAlign: 'right' }}>{temp(hi)}</Txt>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
