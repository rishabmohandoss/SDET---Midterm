import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { CITIES } from '../data';
import { useApp } from '../store';
import { Btn, Group, Seg, SetRow, Sub, Switch, Txt } from '../ui';

const LOGS = [['HOU', 'Heat Advisory until 8PM', '12m ago'], ['NYC', 'Hard Freeze · Z6 basis +$1.40', '2h ago'], ['RTM', 'Gale Warning until 3PM', '5h ago']];

export default function AlertsScreen() {
  const { saved, rules, toggleRule, push, set, esiMin, sendTest, pushStatus } = useApp();
  const [msg, setMsg] = useState('');
  const active = saved.filter((k) => rules[k]);
  const canTest = push && active.length > 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 14, gap: 12 }}>
      <Group>
        <SetRow first title="Push alerts" desc="Sent from the backend for saved cities">
          <Switch on={push} label="Push alerts" onPress={() => set({ push: !push })} />
        </SetRow>
      </Group>
      <Group title="ESI THRESHOLD">
        <ScrollView scrollEnabled={false} contentContainerStyle={{ padding: 14, paddingTop: 0 }}>
          <Seg value={esiMin} onChange={(v) => set({ esiMin: v })} options={[[70, '≥ 70'], [80, '≥ 80'], [90, '≥ 90']]} />
          <Txt f="mono" size={11} c="muted" style={{ marginTop: 8 }}>{esiMin >= 90 ? 'Extreme only' : esiMin >= 80 ? 'High and extreme' : 'Elevated and above'}</Txt>
        </ScrollView>
      </Group>
      <Group title="ALERT RULES · BY CITY" right={<Sub>{active.length} ON</Sub>}>
        {saved.length === 0 && <SetRow first title="Save a city to create alert rules." />}
        {saved.map((k, i) => (
          <SetRow key={k} first={i === 0} title={`${k}  ${CITIES[k].name}`} desc={`${CITIES[k].cond} · ESI ${CITIES[k].idx}`}>
            <Switch on={!!rules[k]} label={`Alerts for ${k}`} onPress={() => toggleRule(k)} />
          </SetRow>
        ))}
      </Group>
      <Btn kind="pri" title="⚡ Send test push" disabled={!canTest} onPress={async () => { setMsg('Sending…'); setMsg(await sendTest(active[0])); }} />
      <Txt f="mono" size={11} c="muted" style={{ textAlign: 'center' }}>{msg || `Device: ${pushStatus}`}</Txt>
      <Group title="RECENT PUSHES">
        {LOGS.map(([k, msg, ago], i) => (
          <SetRow key={k} first={i === 0} title={`${k} · ${msg}`}><Sub>{ago}</Sub></SetRow>
        ))}
      </Group>
    </ScrollView>
  );
}
