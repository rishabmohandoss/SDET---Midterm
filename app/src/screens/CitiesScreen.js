import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { CITIES } from '../data';
import { risk } from '../theme';
import { useApp } from '../store';
import { Btn, Label, Row, Sub, Txt } from '../ui';

export default function CitiesScreen({ goTab }) {
  const { t, saved, city, set, addCity, removeCity, temp } = useApp();
  const available = Object.keys(CITIES).filter((k) => !saved.includes(k));
  const legend = [['SHOCK', 'down'], ['ELEVATED', 'acc'], ['COLD', 'cold'], ['CLEAR', 'up']];

  return (
    <ScrollView contentContainerStyle={{ paddingVertical: 14 }}>
      <Row style={{ paddingHorizontal: 16, paddingBottom: 8 }}><Label>MY CITIES · SAVED HUBS</Label><Sub>{saved.length} SAVED</Sub></Row>
      {saved.length === 0 && (
        <View style={{ padding: 36, alignItems: 'center' }}>
          <Txt f="mono" size={28} c="muted">☆</Txt>
          <Txt f="sansB" size={15} style={{ marginTop: 8 }}>No saved cities</Txt>
          <Txt size={12} c="muted" style={{ marginTop: 4 }}>Add one below to get weather and alerts.</Txt>
        </View>
      )}
      {saved.map((k) => {
        const c = CITIES[k], r = risk(c.idx), on = k === city;
        return (
          <Pressable key={k} onPress={() => { set({ city: k }); goTab('home'); }} accessibilityLabel={`Open ${c.name}`}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 64, paddingVertical: 8, paddingLeft: 13, paddingRight: 4, borderTopWidth: 1, borderTopColor: t.line2, borderLeftWidth: 3, borderLeftColor: on ? t.acc : 'transparent', backgroundColor: on ? t.raised : 'transparent' }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: t[r] }} />
            <View style={{ flex: 1 }}>
              <Txt f="sansM" size={14}>{c.name}</Txt>
              <Txt f="mono" size={10} c="muted" style={{ marginTop: 3 }}>{c.hub}</Txt>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Txt f="monoM" size={12}>{temp(c.temp)}</Txt>
              <Txt f="monoM" size={12} c={r} style={{ marginTop: 2 }}>ESI {c.idx}</Txt>
            </View>
            <Pressable onPress={() => removeCity(k)} accessibilityLabel={`Remove ${c.name}`} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Txt f="monoM" size={18} c="muted">×</Txt>
            </Pressable>
          </Pressable>
        );
      })}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 16 }}>
        {legend.map(([l, c]) => (
          <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, backgroundColor: t[c] }} /><Txt f="mono" size={10} c="muted">{l}</Txt>
          </View>
        ))}
      </View>
      <View style={{ paddingHorizontal: 16, gap: 6 }}>
        <Label style={{ marginBottom: 2 }}>ADD A CITY</Label>
        {available.length === 0 && <Txt f="mono" size={11} c="muted">All available cities are saved.</Txt>}
        {available.map((k) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 10, paddingVertical: 8, paddingLeft: 14, paddingRight: 8 }}>
            <View style={{ flex: 1 }}>
              <Txt f="sansM" size={13}><Txt f="monoM" size={13} c="acc">{k}</Txt>  {CITIES[k].name}</Txt>
              <Txt f="mono" size={10} c="muted" style={{ marginTop: 2 }}>{CITIES[k].hub}</Txt>
            </View>
            <Btn kind="out" title="＋ ADD" onPress={() => addCity(k)} style={{ height: 44, paddingHorizontal: 14 }} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
