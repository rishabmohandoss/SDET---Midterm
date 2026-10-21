import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { useApp } from '../store';
import { Btn, Group, Seg, SetRow, Sub, Switch, Txt } from '../ui';

export default function AlertsScreen() {
  const { saved, rules, toggleRule, push, set, esiMin, sendTest, checkLive, pushStatus, meta, shortOf, getCity } = useApp();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const active = saved.filter((k) => rules[k]);
  const can = push && active.length > 0 && !busy;
  const run = (fn) => async () => { setBusy(true); setMsg('Working…'); try { setMsg(await fn()); } catch (e) { setMsg(`Error: ${e?.message || e}`); } finally { setBusy(false); } };

  return (
    <ScrollView contentContainerStyle={{ padding: 14, gap: 12 }}>
      <Group>
        <SetRow first title="Push alerts" desc="Sent from Back4App for saved cities">
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
        {saved.map((k, i) => {
          const m = meta(k), c = getCity(k);
          return m ? (
            <SetRow key={k} first={i === 0} title={`${shortOf(k)}  ${m.name}`} desc={c ? `${c.cond} · ESI ${c.idx}` : 'Loading live data…'}>
              <Switch on={!!rules[k]} label={`Alerts for ${shortOf(k)}`} onPress={() => toggleRule(k)} />
            </SetRow>
          ) : null;
        })}
      </Group>
      <Btn kind="pri" title="⚡ Send test push" disabled={!can} onPress={run(() => sendTest(active[0]))} />
      <Btn kind="out" title="Check live alerts now" disabled={!can} onPress={run(checkLive)} />
      <Txt f="mono" size={11} c="muted" lines={3} style={{ textAlign: 'center', alignSelf: 'center' }}>{msg || `Device: ${pushStatus}`}</Txt>
      <Group title="LIVE ALERTS · NWS & OPEN-METEO">
        {saved.map((k, i) => { const c = getCity(k); return (
          <SetRow key={k} first={i === 0} title={`${shortOf(k)} · ${c ? c.cond : '…'}`} desc={c?.alert ? c.alert.headline : c ? 'No active alerts' : 'Loading'}>
            <Sub>{c ? c.until : ''}</Sub>
          </SetRow>
        ); })}
      </Group>
    </ScrollView>
  );
}
