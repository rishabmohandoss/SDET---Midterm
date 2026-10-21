// Live data layer. All free, no API keys:
//   Open-Meteo        forecast + air quality + geocoding   https://open-meteo.com
//   NWS (weather.gov) active US weather alerts             https://www.weather.gov/documentation/services-web-api
//   Yahoo Finance     delayed futures quotes (chart API)   NG=F CL=F ZW=F HO=F BZ=F KE=F RB=F
// ESI (Economic Sensitivity Index) is computed here from the live weather; see computeESI.
// This file imports nothing so it can be unit-tested in plain Node.

const NWS_UA = 'TerminalCast-midterm (rm2289@njit.edu)';

async function getJSON(url, headers, ms = 12000) {
  const ctl = new AbortController();
  const id = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers, signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally { clearTimeout(id); }
}

/* ---------------- quotes ---------------- */
export const QUOTE_SYMS = { NG: 'NG=F', CL: 'CL=F', ZW: 'ZW=F', HO: 'HO=F', BZ: 'BZ=F', KE: 'KE=F', RB: 'RB=F' };

export async function getQuotes() {
  const out = {};
  await Promise.all(Object.entries(QUOTE_SYMS).map(async ([k, sym]) => {
    try {
      const j = await getJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=5d`, { 'User-Agent': 'Mozilla/5.0' });
      const r = j.chart.result[0];
      const closes = (r.indicators.quote[0].close || []).filter((x) => x != null);
      const price = r.meta.regularMarketPrice ?? closes[closes.length - 1];
      const prev = closes.length >= 2 ? closes[closes.length - 2] : r.meta.chartPreviousClose;
      out[k] = { price, prev, chg: prev ? ((price - prev) / prev) * 100 : 0, time: (r.meta.regularMarketTime || 0) * 1000 };
    } catch (e) { /* leave this symbol out; callers handle missing quotes */ }
  }));
  return out;
}
// Yahoo grain futures are quoted in cents per bushel.
export const px = (k, q) => (q && q[k] ? (k === 'ZW' || k === 'KE' ? q[k].price / 100 : q[k].price) : null);

/* ---------------- weather ---------------- */
const WMO = (c) => {
  if (c === 0) return ['CLEAR', 'up'];
  if (c <= 2) return ['PARTLY CLOUDY', 'up'];
  if (c === 3) return ['OVERCAST', 'acc'];
  if (c === 45 || c === 48) return ['FOG', 'acc'];
  if (c >= 51 && c <= 55) return ['DRIZZLE', 'acc'];
  if (c === 56 || c === 57 || c === 66 || c === 67) return ['FREEZING RAIN', 'cold'];
  if (c >= 61 && c <= 65) return ['RAIN', 'acc'];
  if (c >= 71 && c <= 77) return ['SNOW', 'cold'];
  if (c >= 80 && c <= 82) return ['SHOWERS', 'acc'];
  if (c === 85 || c === 86) return ['SNOW SHOWERS', 'cold'];
  if (c >= 95) return ['THUNDERSTORM', 'down'];
  return ['CLOUDY', 'acc'];
};
const compass = (d) => ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(d / 22.5) % 16];
const clamp = (x, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, x));
const h12 = (iso) => { const h = parseInt(iso.slice(11, 13), 10); return `${h % 12 || 12}${h < 12 ? 'A' : 'P'}`; };
const hm12 = (iso) => { const h = parseInt(iso.slice(11, 13), 10); return `${h % 12 || 12}:${iso.slice(14, 16)}${h < 12 ? 'A' : 'P'}`; };

export async function getWeather(lat, lon) {
  const w = getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code,uv_index,visibility,dew_point_2m&hourly=temperature_2m,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset,wind_speed_10m_max,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=10&timezone=auto`);
  const a = getJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`).catch(() => null);
  const n = getAlerts(lat, lon).catch(() => []);
  const [wx, aq, alerts] = await Promise.all([w, a, n]);
  return { wx, aqi: aq?.current?.us_aqi ?? null, alerts };
}

const inUS = (lat, lon) => lat > 17 && lat < 72 && lon > -180 && lon < -64;
const SEV = { Extreme: 4, Severe: 3, Moderate: 2, Minor: 1, Unknown: 0 };
export async function getAlerts(lat, lon) {
  if (!inUS(lat, lon)) return [];
  const j = await getJSON(`https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`, { 'User-Agent': NWS_UA, Accept: 'application/geo+json' });
  return (j.features || []).map((f) => f.properties).sort((x, y) => (SEV[y.severity] || 0) - (SEV[x.severity] || 0));
}

export async function geocode(q) {
  const j = await getJSON(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`);
  return (j.results || []).map((r) => ({
    id: r.id, name: [r.name, r.admin1 && r.country_code === 'US' ? r.admin1 : r.country_code].filter(Boolean).join(', '),
    lat: r.latitude, lon: r.longitude, hub: [r.admin1, r.country].filter(Boolean).join(' · ').toUpperCase(),
  }));
}

// Batch current + 7-day temps for many points (map layers). One request.
export async function getGrid(points) {
  const j = await getJSON(`https://api.open-meteo.com/v1/forecast?latitude=${points.map((p) => p[0]).join(',')}&longitude=${points.map((p) => p[1]).join(',')}&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=7&timezone=auto`, undefined, 20000);
  const arr = Array.isArray(j) ? j : [j];
  return arr.map((r) => {
    const mean = r.daily.temperature_2m_max.map((hi, i) => (hi + r.daily.temperature_2m_min[i]) / 2);
    const avg3 = mean.slice(0, 3).reduce((s, x) => s + x, 0) / 3;
    return { temp: r.current.temperature_2m, min7: Math.min(...r.daily.temperature_2m_min), max7: Math.max(...r.daily.temperature_2m_max), avg3 };
  });
}

/* ---------------- Economic Sensitivity Index ----------------
   heating   = HDD-style: how far the 3-day mean temp is below 65°F (x2.5, so 40 HDD = 100)
   cooling   = CDD-style: how far above 65°F (x4)
   logistics = rain odds + max wind + snow / freezing rain / thunderstorm in the next 2 days
   ag freeze = 7-day low below 36°F (x6)
   index     = 0.65*top sector + 0.25*second + 0.10*third + NWS alert bonus */
export function computeESI({ avg3, min7, windMax, precipMax, codes2, alerts }) {
  const hdd = Math.max(0, 65 - avg3), cdd = Math.max(0, avg3 - 65);
  const snow = codes2.some((c) => (c >= 71 && c <= 77) || c === 85 || c === 86), ice = codes2.some((c) => [56, 57, 66, 67].includes(c)), storm = codes2.some((c) => c >= 95);
  const sectors = {
    heating: clamp(hdd * 2.5), cooling: clamp(cdd * 4),
    logistics: clamp(precipMax * 0.4 + windMax * 1.6 + (snow ? 25 : 0) + (ice ? 40 : 0) + (storm ? 30 : 0)),
    freeze: clamp((36 - min7) * 6),
  };
  const sorted = Object.entries(sectors).sort((a, b) => b[1] - a[1]);
  const bonus = alerts.length ? [0, 5, 10, 18, 25][SEV[alerts[0].severity] || 0] : 0;
  const idx = clamp(Math.round(sorted[0][1] * 0.65 + sorted[1][1] * 0.25 + sorted[2][1] * 0.1 + bonus));
  return { idx, sectors, dominant: sorted[0][0], hdd, cdd };
}

const BULL = { heating: 'NG / HO', cooling: 'POWER / NG', logistics: 'FREIGHT', freeze: 'WHEAT' };
const LINK = { heating: ['NG', 'HO', 'CL'], cooling: ['NG', 'RB', 'CL'], logistics: ['CL', 'ZW', 'HO'], freeze: ['ZW', 'KE', 'NG'] };
const fmtChg = (c) => `${c >= 0 ? '+' : '−'}${Math.abs(c).toFixed(1)}%`;

// Turn raw API responses + quotes into the shape the screens render.
export function buildCity({ wx, aqi, alerts }, quotes = {}) {
  const c = wx.current, d = wx.daily, hr = wx.hourly;
  const now = c.time.slice(0, 13);
  const i0 = Math.max(0, hr.time.findIndex((t) => t.slice(0, 13) === now));
  const hourly = Array.from({ length: 12 }, (_, k) => ({ t: k === 0 ? 'NOW' : h12(hr.time[i0 + k]), temp: Math.round(hr.temperature_2m[i0 + k]), p: hr.precipitation_probability[i0 + k] ?? 0 }));
  const avg3 = [0, 1, 2].reduce((s, i) => s + (d.temperature_2m_max[i] + d.temperature_2m_min[i]) / 2, 0) / 3;
  const min7 = Math.min(...d.temperature_2m_min.slice(0, 7));
  const windMax = Math.max(...d.wind_speed_10m_max.slice(0, 2));
  const precipMax = Math.max(...d.precipitation_probability_max.slice(0, 2).map((x) => x ?? 0));
  const esi = computeESI({ avg3, min7, windMax, precipMax, codes2: d.weather_code.slice(0, 2), alerts });
  const idx = esi.idx, sx = esi.sectors;

  const [wlabel, wcol] = WMO(c.weather_code);
  const top = alerts[0];
  let cond = wlabel, cc = wcol, until = 'NO ACTIVE ALERTS';
  if (top) {
    cond = top.event.toUpperCase();
    const sev = SEV[top.severity] || 0;
    cc = sev >= 3 ? 'down' : /freeze|cold|winter|snow|ice|blizzard|chill|frost/i.test(top.event) ? 'cold' : 'acc';
    const end = top.ends || top.expires;
    until = end ? `UNTIL ${h12(end)}` : 'ACTIVE';
  }
  const link = LINK[esi.dominant].filter((k) => quotes[k]);
  const movers = link.slice(0, 3).map((k) => [k, fmtChg(quotes[k].chg)]);
  const lead = link[0];
  const note = lead
    ? `${esi.dominant === 'heating' ? `HDD ${esi.hdd.toFixed(0)} vs 65°F` : esi.dominant === 'cooling' ? `CDD ${esi.cdd.toFixed(0)} vs 65°F` : esi.dominant === 'freeze' ? `7-day low ${Math.round(min7)}°F` : `Wind to ${Math.round(windMax)} mph`}; ${lead} ${px(lead, quotes).toFixed(2)} ${fmtChg(quotes[lead].chg)}.`
    : `${esi.dominant} is the top weather driver.`;
  const level = idx >= 85 ? 'EXTREME' : idx >= 60 ? 'HIGH' : idx >= 40 ? 'MODERATE' : 'LOW';
  const sens = [
    ['Heating demand', Math.round(sx.heating), `HDD ${esi.hdd.toFixed(0)} · 3-day mean ${avg3.toFixed(0)}°F`],
    ['Cooling / power load', Math.round(sx.cooling), `CDD ${esi.cdd.toFixed(0)} · 3-day mean ${avg3.toFixed(0)}°F`],
    ['Freight & logistics', Math.round(sx.logistics), `Wind to ${Math.round(windMax)} mph · precip odds ${precipMax}%`],
    ['Ag freeze risk', Math.round(sx.freeze), `7-day low ${Math.round(min7)}°F`],
  ];
  const days = d.time.map((t, i) => {
    const [lab, col] = WMO(d.weather_code[i]);
    const nm = i === 0 ? 'TODAY' : new Date(`${t}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return [nm, Math.round(d.temperature_2m_max[i]), Math.round(d.temperature_2m_min[i]), lab, col];
  });
  return {
    temp: Math.round(c.temperature_2m), feels: Math.round(c.apparent_temperature), wind: Math.round(c.wind_speed_10m), dir: compass(c.wind_direction_10m),
    baro: `${(c.surface_pressure * 0.02953).toFixed(2)}"`, precip: `${hourly[1]?.p ?? 0}%`,
    cond, cc, until, note, idx, il: `${level} · BULLISH ${BULL[esi.dominant]}`, mv: movers, fc: days, sens, hourly,
    conds: { uv: Math.round(c.uv_index ?? 0), hum: Math.round(c.relative_humidity_2m), vis: c.visibility != null ? `${Math.min(10, c.visibility / 1609).toFixed(0)} mi` : '—', dew: Math.round(c.dew_point_2m), aqi, sr: hm12(d.sunrise[0]), ss: hm12(d.sunset[0]) },
    alert: top ? { event: top.event, headline: top.headline, severity: top.severity } : null,
    updated: Date.now(),
  };
}
