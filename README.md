# TerminalCast

A "financial weather" iPhone app (Expo / React Native). Pick a city, see live weather, and see how it is moving
commodity markets (natural gas, crude, wheat, heating oil). Dark, Bloomberg-terminal look. SDET midterm project.

> Illustrative analytics, not investment advice.

## Features

| Requirement | Where |
|---|---|
| Log in and sign up with Back4App | `app/src/auth.js`, `app/src/screens/AuthScreen.js` (Parse `User`, email as username, password reset, session restore) |
| Push notifications for saved weather alerts, sent from the backend | `backend/cloud/main.js` (Cloud Code) + `app/src/push.js` (Expo push token) |
| Add and save multiple cities | Cities tab; any city worldwide via the command bar (Open-Meteo geocoding); synced to Back4App |
| Settings | Settings tab: account, theme, units, refresh rate, notification toggles, log out |
| Custom theme | Amber Terminal (default), Arctic, Violet. Surfaces and accent change, gain/loss/cold colors keep fixed meaning (`app/src/theme.js`) |
| Design | `design/terminalcast-design.html` (interactive mock) and `design_handoff_terminalcast/` (original handoff) |
| Live data, no mock | see Data sources |

Screens: Log in, Sign up, Home (city weather + Economic Sensitivity Index), Map (4 layers + region panel),
Spread Radar sheet, My Cities, Alerts, Settings.

## Data sources (all free, no API keys)

| Data | Source |
|---|---|
| Forecast, hourly, 10-day, UV, humidity, dew point, sun times | [Open-Meteo](https://open-meteo.com) |
| Air quality (US AQI) | Open-Meteo air-quality API |
| City search (geocoding) | Open-Meteo geocoding API |
| Active US weather alerts | [National Weather Service](https://www.weather.gov/documentation/services-web-api) `api.weather.gov` |
| Futures quotes: NG, CL, ZW, HO, BZ, KE, RB (delayed) | Yahoo Finance chart endpoint (unofficial) |
| Push delivery | Expo push service |

All client calls are in `app/src/live.js`. Notes:
- **Economic Sensitivity Index (ESI)** is this project's own 0-100 score from live weather:
  heating (3-day mean temp below 65°F), cooling (above 65°F), freight/logistics (rain odds, wind, snow, ice, storms),
  ag freeze risk (7-day low). `index = 0.65*top + 0.25*second + 0.10*third + NWS alert bonus`.
- **Spreads** (Brent-WTI, heating-oil crack, gasoline crack, fuel-switch, KC-Chicago wheat) are computed in the app
  from the live futures prices and tied to the live ESI of a weather hub.
- **Map**: the state grid is a stylized tile map. Demand pressure and freeze layers use live temperatures for all 48 states.
  Pipeline and port lines are static illustrations.
- Freightos freight rates have no free API, so heating oil replaces FBX in the ticker.

## Architecture

```
iPhone (Expo Go)
  app/  React Native + Expo SDK 57
   ├─ src/live.js      Open-Meteo, NWS, Yahoo; ESI calculation
   ├─ src/auth.js      Back4App login / sign up / reset / session
   ├─ src/backend.js   UserPrefs + Device rows, Cloud Code calls
   ├─ src/push.js      permission + Expo push token
   └─ src/store.js     app state, polling loop, sync
        │  Parse JS SDK (HTTPS)
        ▼
Back4App (Parse)
  _User, UserPrefs, Device, PushLog, AlertSent
  cloud/main.js: sendCityAlert, checkWeatherAlerts, job checkAllWeatherAlerts, afterSave WeatherAlert
        │  HTTPS
        ▼
Open-Meteo / NWS (read)  ->  Expo push API  ->  APNs  ->  iPhone notification
```

### Back4App data model

| Class | Purpose | Access |
|---|---|---|
| `_User` | account (`username` = email, `email`, `displayName`) | Parse default |
| `UserPrefs` | one row per user: saved cities, alert rules, theme, units, thresholds | ACL: owner only |
| `Device` | Expo push token, owner, `places` [{code,name,lat,lon}] with alerts on, `pushEnabled`, `esiMin` | ACL: owner only |
| `PushLog` | audit row per push sent by Cloud Code | server only |
| `AlertSent` | dedupe keys so one alert is pushed once | server only |

### Push flow
1. After login the app asks notification permission and gets an Expo push token (needs the EAS project id in `app.json`).
2. When saved cities or alert rules change, the app writes a `Device` row (debounced).
3. **Send test push**: `sendCityAlert` builds a message from live Open-Meteo data and pushes to the caller's devices.
4. **Check live alerts now**: `checkWeatherAlerts` polls NWS (and extreme heat, cold, wind thresholds) for the caller's
   places and pushes anything not already in `AlertSent`.
5. Schedule job `checkAllWeatherAlerts` in Back4App to sweep every subscriber's cities automatically.
6. Logs: Back4App dashboard > Cloud Code > Logs. Every line starts with `[TerminalCast]`.

## Setup

Requirements: Node 20+, an iPhone with a current Expo Go, a Back4App app, an Expo account.

1. **Back4App**: create a backend app. Copy the Application ID and JavaScript key (never the Master key).
2. **Cloud Code**: put `backend/cloud/main.js` at `cloud/main.js` in Back4App and click Deploy.
3. **App config**:
   ```
   cd app
   cp .env.example .env.local     # fill in EXPO_PUBLIC_B4A_APP_ID and EXPO_PUBLIC_B4A_JS_KEY
   npm install
   npx eas-cli init               # writes extra.eas.projectId into app.json (needed for push tokens)
   ```
4. **Run**: `npx expo start --tunnel` (the tunnel works on school Wi-Fi). Open the URL in Expo Go.
   Without `.env.local` the app still runs in local-only mode (login is mocked, no sync or push).

## Testing checklist

- Sign up with a bad email, short password, mismatched passwords: each shows an error. Valid signup creates a row in `_User`.
- Log in with a wrong password: "Wrong email or password." Log out and back in: cities and theme are restored from `UserPrefs`.
- Force-quit and reopen: the session persists.
- Add a city by name (for example "Tokyo"), remove one, switch theme and units: Home updates; `UserPrefs` row changes.
- Alerts: push shows "Registered". Send test push: notification arrives on the lock screen; `[TerminalCast]` lines appear in Back4App logs.
- Airplane mode: Home shows a retry state instead of crashing.

## Known limitations

- Remote push works in **Expo Go on iOS only**. Expo Go on Android does not support remote push (SDK 53+); a development build is needed.
- Futures quotes come from an unofficial, delayed endpoint and can break or rate limit.
- NWS alerts cover the US only; elsewhere only the extreme-weather thresholds apply.
- Map is a stylized tile grid, not real state geometry.

## Repo layout

```
app/                       Expo app
backend/cloud/main.js      Back4App Cloud Code
design/                    interactive design mock (open in a browser)
design_handoff_terminalcast/  original Claude Design handoff
```
