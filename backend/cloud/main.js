// Back4App Cloud Code. Deploy: Back4App dashboard > Cloud Code > Functions > upload this as cloud/main.js
// View logs: dashboard > Cloud Code > Logs (every line below is prefixed [TerminalCast]).
//
// Flow: a row saved to WeatherAlert (or the sendCityAlert function) -> find Device rows subscribed to that
// city -> POST to the Expo push API -> write a PushLog row. Remote push is delivered to Expo Go on iOS.

const EXPO_PUSH = 'https://exp.host/--/api/v2/push/send';

const ALERTS = {
  NWK: { cond: 'WINTER WX ADVISORY', until: 'UNTIL 7AM', idx: 74, note: 'PJM East load up on cold; Port Newark icing slows drayage.' },
  HOU: { cond: 'HEAT ADVISORY', until: 'UNTIL 8PM', idx: 78, note: 'ERCOT load +6% vs 5y avg; power futures bid.' },
  NYC: { cond: 'HARD FREEZE', until: 'UNTIL 6AM', idx: 91, note: 'Z6 basis +$1.40 over Henry Hub; heating oil bid.' },
  CHI: { cond: 'ICE STORM WATCH', until: 'UNTIL 10PM', idx: 83, note: 'Rail dwell +19h; wheat logistics risk.' },
  RTM: { cond: 'GALE WARNING', until: 'UNTIL 3PM', idx: 66, note: 'Low wind output lifts TTF; Rhine barge surcharge.' },
  CUS: { cond: 'COLD SNAP', until: 'UNTIL 9AM', idx: 64, note: 'Road ice slows trucked crude into storage.' },
  HH: { cond: 'MILD / CLEAR', until: '', idx: 32, note: 'Mild Gulf keeps supply long.' },
  LGB: { cond: 'CLEAR', until: '', idx: 21, note: 'Normal port flow.' },
};

async function notifyCity(code, alert, { user, bypassThreshold } = {}) {
  console.log(`[TerminalCast] notifyCity city=${code} idx=${alert.idx} test=${!!bypassThreshold}`);
  const q = new Parse.Query('Device');
  q.equalTo('cities', code);
  q.equalTo('pushEnabled', true);
  if (!bypassThreshold) q.lessThanOrEqualTo('esiMin', alert.idx);
  if (user) q.equalTo('user', user);
  q.limit(1000);
  const devices = await q.find({ useMasterKey: true });
  console.log(`[TerminalCast] ${devices.length} matching device(s) for ${code}`);

  const title = `${code} · ${alert.cond}${alert.until ? ' ' + alert.until : ''}`;
  const body = `${alert.note} ESI ${alert.idx}.`;
  const messages = devices.map((d) => ({ to: d.get('token'), title, body, sound: 'default', data: { city: code } }));

  let sent = 0, failed = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const res = await Parse.Cloud.httpRequest({ method: 'POST', url: EXPO_PUSH, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messages.slice(i, i + 100)) });
    for (const t of res.data.data || []) {
      if (t.status === 'ok') sent++; else { failed++; console.log('[TerminalCast] push ticket error', JSON.stringify(t)); }
    }
  }
  console.log(`[TerminalCast] push done city=${code} sent=${sent} failed=${failed}`);

  const log = new Parse.Object('PushLog');
  log.set({ city: code, title, body, recipients: devices.length, sent, failed, test: !!bypassThreshold });
  await log.save(null, { useMasterKey: true });
  return { city: code, recipients: devices.length, sent, failed };
}

// Called from the app's "Send test push" button. Only notifies the caller's own devices.
Parse.Cloud.define('sendCityAlert', async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Login required');
  const code = request.params.city;
  const alert = ALERTS[code];
  if (!alert) throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Unknown city ' + code);
  console.log(`[TerminalCast] sendCityAlert by user=${request.user.id} city=${code}`);
  return notifyCity(code, alert, { user: request.user, bypassThreshold: true });
});

// Real trigger: adding a WeatherAlert row (city, cond, until, idx, note) pushes it to every subscribed device.
Parse.Cloud.afterSave('WeatherAlert', async (request) => {
  if (request.original) return; // new rows only
  const o = request.object;
  const code = o.get('city');
  const alert = { ...(ALERTS[code] || {}), cond: o.get('cond') || ALERTS[code]?.cond, until: o.get('until') || '', idx: o.get('idx') ?? ALERTS[code]?.idx ?? 0, note: o.get('note') || ALERTS[code]?.note || '' };
  console.log(`[TerminalCast] afterSave WeatherAlert id=${o.id} city=${code}`);
  await notifyCity(code, alert);
});
