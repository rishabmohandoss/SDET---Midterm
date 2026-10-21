// Back4App Cloud Code. Deploy: dashboard > Cloud Code > Functions > cloud/main.js > Deploy.
// Logs: dashboard > Cloud Code > Logs. Every line below is prefixed [TerminalCast].
//
// Data sources (free, no keys): Open-Meteo (forecast), api.weather.gov (US alerts), Expo push API (delivery).
// Flow: app registers a Device row (Expo push token + places with alerts on)
//   sendCityAlert        -> build a message from LIVE weather -> push to the caller's own devices (test button)
//   checkWeatherAlerts   -> poll NWS + extreme-weather thresholds for the caller's places -> push anything new
//   job checkAllWeatherAlerts -> same for every subscribed device (schedule it in Cloud Code > Jobs)
//   afterSave WeatherAlert    -> push a hand-entered alert row to every device subscribed to that city code

const EXPO_PUSH = 'https://exp.host/--/api/v2/push/send';
const NWS_UA = 'TerminalCast-midterm (rm2289@njit.edu)';
const clamp = (x) => Math.max(0, Math.min(100, x));
const log = (...a) => console.log('[TerminalCast]', ...a);

async function getJSON(url, headers) {
  const r = await Parse.Cloud.httpRequest({ url, headers, timeout: 15000 });
  return r.data;
}

/* ---------- live weather ---------- */
async function snapshot(place) {
  const j = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=7&timezone=auto`);
  const d = j.daily, c = j.current;
  const avg3 = [0, 1, 2].reduce((s, i) => s + (d.temperature_2m_max[i] + d.temperature_2m_min[i]) / 2, 0) / 3;
  const min7 = Math.min(...d.temperature_2m_min);
  const windMax = Math.max(d.wind_speed_10m_max[0], d.wind_speed_10m_max[1]);
  const precip = Math.max(d.precipitation_probability_max[0] || 0, d.precipitation_probability_max[1] || 0);
  const codes = d.weather_code.slice(0, 2);
  const hdd = Math.max(0, 65 - avg3), cdd = Math.max(0, avg3 - 65);
  const sec = {
    heating: clamp(hdd * 2.5), cooling: clamp(cdd * 4),
    logistics: clamp(precip * 0.4 + windMax * 1.6 + (codes.some((x) => (x >= 71 && x <= 77) || x === 85 || x === 86) ? 25 : 0) + (codes.some((x) => [56, 57, 66, 67].includes(x)) ? 40 : 0) + (codes.some((x) => x >= 95) ? 30 : 0)),
    freeze: clamp((36 - min7) * 6),
  };
  const s = Object.values(sec).sort((a, b) => b - a);
  const idx = Math.round(clamp(s[0] * 0.65 + s[1] * 0.25 + s[2] * 0.1));
  const dom = Object.entries(sec).sort((a, b) => b[1] - a[1])[0][0];
  return { temp: Math.round(c.temperature_2m), wind: Math.round(c.wind_speed_10m), idx, dom, hdd, cdd, min7, maxT: Math.max(...d.temperature_2m_max), windMax, today: d.time[0] };
}

const inUS = (p) => p.lat > 17 && p.lat < 72 && p.lon > -180 && p.lon < -64;
const HIDE = new Set(['Test Message']);

// Everything worth pushing for one place right now: [{ key, title, body }]
async function scan(place) {
  const out = [];
  if (inUS(place)) {
    try {
      const j = await getJSON(`https://api.weather.gov/alerts/active?point=${place.lat.toFixed(4)},${place.lon.toFixed(4)}`, { 'User-Agent': NWS_UA, Accept: 'application/geo+json' });
      for (const f of j.features || []) {
        const p = f.properties;
        if (HIDE.has(p.event) || !['Extreme', 'Severe', 'Moderate'].includes(p.severity)) continue;
        out.push({ key: `nws:${f.id || p.id}`, title: `${place.code} · ${p.event.toUpperCase()}`, body: p.headline || p.event });
      }
    } catch (e) { log('NWS failed for', place.code, e.message || e.text); }
  }
  try {
    const s = await snapshot(place);
    const add = (type, title, body) => out.push({ key: `wx:${place.code}:${type}:${s.today}`, title: `${place.code} · ${title}`, body });
    if (s.maxT >= 95) add('heat', 'EXTREME HEAT', `Highs to ${Math.round(s.maxT)}°F in ${place.name}. Power and gas demand elevated (ESI ${s.idx}).`);
    if (s.min7 <= 15) add('cold', 'EXTREME COLD', `Lows to ${Math.round(s.min7)}°F in ${place.name}. Heating demand and freeze risk elevated (ESI ${s.idx}).`);
    if (s.windMax >= 45) add('wind', 'HIGH WIND', `Winds to ${Math.round(s.windMax)} mph in ${place.name}. Freight and port delays likely (ESI ${s.idx}).`);
  } catch (e) { log('Open-Meteo failed for', place.code, e.message || e.text); }
  return out;
}

/* ---------- delivery ---------- */
async function pushTo(devices, title, body, data) {
  const messages = devices.map((d) => ({ to: d.get('token'), title, body, sound: 'default', data }));
  let sent = 0, failed = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const res = await Parse.Cloud.httpRequest({ method: 'POST', url: EXPO_PUSH, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messages.slice(i, i + 100)) });
    for (const t of res.data.data || []) { if (t.status === 'ok') sent++; else { failed++; log('push ticket error', JSON.stringify(t)); } }
  }
  const row = new Parse.Object('PushLog');
  row.set({ title, body, recipients: devices.length, sent, failed });
  await row.save(null, { useMasterKey: true });
  log(`pushed "${title}" recipients=${devices.length} sent=${sent} failed=${failed}`);
  return { sent, failed, recipients: devices.length };
}

const deviceQuery = (code, user) => {
  const q = new Parse.Query('Device');
  q.equalTo('cities', code); q.equalTo('pushEnabled', true); q.limit(1000);
  if (user) q.equalTo('user', user);
  return q.find({ useMasterKey: true });
};

async function pushNewAlerts(places, user) {
  let found = 0, sent = 0;
  for (const place of places) {
    for (const a of await scan(place)) {
      found++;
      const seen = await new Parse.Query('AlertSent').equalTo('key', a.key).first({ useMasterKey: true });
      if (seen) { log('already sent', a.key); continue; }
      const devices = await deviceQuery(place.code, user);
      const r = await pushTo(devices, a.title, a.body, { code: place.code });
      const row = new Parse.Object('AlertSent'); row.set('key', a.key);
      await row.save(null, { useMasterKey: true });
      sent += r.sent;
    }
  }
  log(`checked ${places.length} place(s): found=${found} sent=${sent}`);
  return { checked: places.length, found, sent };
}

const cleanPlaces = (arr) => (Array.isArray(arr) ? arr : []).filter((p) => p && p.code && Number.isFinite(p.lat) && Number.isFinite(p.lon)).slice(0, 20);

/* ---------- cloud functions ---------- */
// App "Send test push": real push, message built from live weather for this place, to the caller's own devices.
Parse.Cloud.define('sendCityAlert', async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Login required');
  const place = request.params.place;
  if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) throw new Parse.Error(Parse.Error.INVALID_QUERY, 'place {code,name,lat,lon} required');
  log(`sendCityAlert user=${request.user.id} place=${place.code}`);
  const s = await snapshot(place);
  const driver = { heating: `HDD ${s.hdd.toFixed(0)}`, cooling: `CDD ${s.cdd.toFixed(0)}`, logistics: `winds to ${Math.round(s.windMax)} mph`, freeze: `7-day low ${Math.round(s.min7)}°F` }[s.dom];
  const title = `${place.code} · ${s.temp}°F · ESI ${s.idx}`;
  const body = `${place.name}: ${driver}. Live from Open-Meteo.`;
  const devices = await deviceQuery(place.code, request.user);
  log(`${devices.length} device(s) for ${place.code}`);
  const r = await pushTo(devices, title, body, { code: place.code });
  return { ...r, title };
});

// App "Check live alerts now".
Parse.Cloud.define('checkWeatherAlerts', async (request) => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Login required');
  const places = cleanPlaces(request.params.places);
  log(`checkWeatherAlerts user=${request.user.id} places=${places.map((p) => p.code).join(',')}`);
  return pushNewAlerts(places, request.user);
});

// Scheduled sweep for everyone: dashboard > Cloud Code > Jobs (or run manually).
Parse.Cloud.job('checkAllWeatherAlerts', async () => {
  const devices = await new Parse.Query('Device').equalTo('pushEnabled', true).limit(1000).find({ useMasterKey: true });
  const byCode = {};
  for (const d of devices) for (const p of cleanPlaces(d.get('places'))) byCode[p.code] = p;
  log(`job: ${devices.length} device(s), ${Object.keys(byCode).length} place(s)`);
  await pushNewAlerts(Object.values(byCode), null);
});

// Hand-entered alert (dashboard > WeatherAlert > add row: city, title, body) -> everyone subscribed to that code.
Parse.Cloud.afterSave('WeatherAlert', async (request) => {
  if (request.original) return;
  const o = request.object, code = o.get('city');
  log(`afterSave WeatherAlert id=${o.id} city=${code}`);
  const devices = await deviceQuery(code, null);
  await pushTo(devices, o.get('title') || `${code} · WEATHER ALERT`, o.get('body') || '', { code });
});
