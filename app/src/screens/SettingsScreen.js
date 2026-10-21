import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { THEMES } from '../theme';
import { useApp } from '../store';
import { Btn, Group, Seg, SetRow, Sub, Switch, Txt } from '../ui';

export default function SettingsScreen() {
  const { t, sync, user, theme, units, speed, refresh, push, sound, quiet, set, logOut } = useApp();
  const name = user?.name || 'user';

  return (
    <ScrollView contentContainerStyle={{ padding: 14, gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 14, padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.accSoft, borderWidth: 1, borderColor: t.acc, alignItems: 'center', justifyContent: 'center' }}>
            <Txt f="monoB" size={18} c="acc">{name[0].toUpperCase()}</Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt f="sansB" size={15} fit>{name}</Txt>
            <Txt f="mono" size={11} c="muted" style={{ marginTop: 2 }} numberOfLines={1}>{user?.email}</Txt>
          </View>
        </View>
        <Txt f="monoM" size={10} c={sync === 'synced' ? 'up' : sync === 'error' ? 'down' : 'muted'}>● {({ synced: 'SYNCED', syncing: 'SYNCING', error: 'SYNC ERROR', idle: '…', mock: 'LOCAL ONLY' })[sync]}</Txt>
      </View>

      <Group title="APPEARANCE">
        <View style={{ flexDirection: 'row', gap: 8, padding: 14, paddingTop: 0 }}>
          {Object.entries(THEMES).map(([k, th]) => (
            <Pressable key={k} onPress={() => set({ theme: k })} accessibilityLabel={`${th.name} theme`}
              style={{ flex: 1, alignItems: 'center', gap: 6, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: theme === k ? t.acc : t.line, backgroundColor: t.card }}>
              <View style={{ flexDirection: 'row', width: '100%', height: 28, borderRadius: 6, overflow: 'hidden' }}>
                <View style={{ flex: 1, backgroundColor: th.bg }} /><View style={{ flex: 1, backgroundColor: th.acc }} />
              </View>
              <Txt f="monoB" size={9} c={theme === k ? 'acc' : 'muted'}>{th.name}</Txt>
            </Pressable>
          ))}
        </View>
      </Group>

      <Group title="UNITS & DATA">
        <SetRow first title="Temperature"><Seg width={150} value={units} onChange={(v) => set({ units: v })} options={['F', 'C']} /></SetRow>
        <SetRow title="Wind speed"><Seg width={150} value={speed} onChange={(v) => set({ speed: v })} options={['mph', 'kph']} /></SetRow>
        <SetRow title="Refresh" desc="Quotes and conditions"><Seg width={150} value={refresh} onChange={(v) => set({ refresh: v })} options={['1m', '5m', '15m']} /></SetRow>
      </Group>

      <Group title="NOTIFICATIONS">
        <SetRow first title="Push alerts"><Switch on={push} label="Push alerts" onPress={() => set({ push: !push })} /></SetRow>
        <SetRow title="Sound"><Switch on={sound} label="Sound" onPress={() => set({ sound: !sound })} /></SetRow>
        <SetRow title="Quiet hours" desc="10 PM – 6 AM"><Switch on={quiet} label="Quiet hours" onPress={() => set({ quiet: !quiet })} /></SetRow>
      </Group>

      <Group title="ABOUT">
        <SetRow first title="Version"><Sub>1.0.0 (midterm)</Sub></SetRow>
        <SetRow title="Illustrative data. Not investment advice." />
      </Group>

      <Btn title="Log out" color="#FF3B4E" onPress={logOut} />
    </ScrollView>
  );
}
