# Handoff: TerminalCast (iPhone app)

## Overview
TerminalCast is a "financial weather" iPhone app: a full weather app (forecasts, conditions, alerts) fused with commodity-market context. A user picks a city or trading hub and sees how local weather is moving Natural Gas, Crude, Wheat, Power and Freight. Aesthetic: Bloomberg-terminal density, dark, high contrast, 44pt touch targets.

## About the Design Files
`TerminalCast.dc.html` is a **design reference built in HTML**: a prototype of intended look and behavior, not production code to copy. Recreate it in the target environment (recommended: **SwiftUI**, iOS 17+; alternative: React Native/Expo) using that stack's idioms. The HTML is also a design-system sheet (right of the phone) listing colors, type and rules.

## Fidelity
**High-fidelity.** Colors, type, spacing and interactions are final. Data is illustrative mock data; replace with real feeds. Not investment advice; keep a disclaimer in the Arbitrage sheet.

## App Shell (all screens)
Device frame 390×844 (iPhone 15/16). Vertical stack:
1. Status bar (system).
2. **Command bar**: row padding 2/14/8. Field height 40, radius 10, bg `#14161C`, 1px `#262A33`. Left: amber `>` (Plex Mono 600 13). Input Plex Mono 13, placeholder "City or hub · HOU NYC RTM CHI". Right: pulsing green dot + "LIVE" (Mono 600 10, `#00FF66`; opacity 1→.3, 1.6s loop).
   - Typing filters cities by code, name or hub (max 4). Results list sits under the ticker: rows 44pt+, `CODE` amber + name left, region right (Mono 13/`#7C8494`). Tap sets city and goes to Home.
3. **Ticker tape**: height 30, bg `#14161C`, top/bottom 1px `#262A33`. Continuous right-to-left marquee, 28s linear loop (content duplicated for seamless loop). Item: padding 0 16, right border 1px `#262A33`, Mono 500 12: symbol (amber 600), price, change (▲ +x.x% green / ▼ red). Symbols: NG 3.42 (+2.1%), CL 78.64 (−0.4%), ZW 6.12 (+1.3%), FBX 2,184 (+3.8%). Prices jitter ±1.2% every 1.8s in prototype.
4. **Content** (scrolls, one of three tabs).
5. **Tab bar**: height 84 (6 top, 26 bottom for home indicator), bg `rgba(13,14,18,.96)`, top border 1px `#262A33`. 4 equal items: icon (Mono 600 16) over label (Mono 600 9, tracking .08em). Active `#FFB000`, inactive `#7C8494`. Items: **HOME** (☁), **MAP** (◉), **WATCH** (★), **RADAR** (⚡, opens Arbitrage sheet instead of navigating). Use SF Symbols in native build (cloud.sun, map, star, bolt).

Default tab on launch: **HOME**.

## Screens

### 1. Home (selected city) — default
Padding 14, vertical gap 12, cards: bg `#14161C`, 1px `#262A33`, radius 14, padding 14.
Order top to bottom:
- **City chips**: horizontal scroll, gap 6. Chip height 36, padding 0 14, radius 8, Mono 500 12. Codes: HOU, NYC, CHI, RTM, CUS, HH, LGB. Selected: border `#FFB000`, bg `rgba(255,176,0,.14)`, text amber. Unselected: border `#262A33`, bg `#14161C`, text `#E6E8EC`.
- **Current conditions card**: hub label (Mono 500 9, tracking .08em, `#7C8494`); city name (Plex Sans 600 21); condition tag (Mono 600 11, colored by severity); temp right-aligned (Mono 500 44, line-height 1) with "FEELS n°" (Mono 10, `#7C8494`). Below, 3-cell grid (1px gaps `#262A33`, cells bg `#0D0E12`, radius 8): WIND, BARO, PRECIP (label Mono 9 grey; value Mono 500 12).
- **Alert banner**: padding 10/12, bg `rgba(255,176,0,.1)`, 1px `#FFB000`, radius 12. Amber `!` + title "COND · UNTIL …" (Mono 600 12 amber) + market-link note (Plex Sans 12, `#C4C8D0`).
- **Market Movers**: label "MARKET MOVERS" / "WEATHER-LINKED". 3 tiles (gap 8, bg `#0D0E12`, 1px `#262A33`, radius 10, pad 10): key (Mono 9 grey), value (Mono 600 15; green if "+", red if "−", ink otherwise).
- **Hourly**: next 12h, horizontally scrollable; 48pt-wide columns: hour (Mono 10 grey), temp (Mono 12), precip % (Mono 10 cyan `#22D3EE`).
- **Economic Sensitivity Index (ESI)**: half-circle gauge (SVG arc r=70, stroke 10, track `#262A33`, value arc colored by risk), value Mono 600 34 centered, label under (e.g. "EXTREME · BULLISH NG / HO"). Below: 4 sensitivity rows: name (Plex Sans 500 13) + score (Mono 600 12, risk color), 4pt bar (track `#262A33`, fill = score%), note (Mono 11 grey). Example NYC: Heating oil demand 88, Z6 gas basis 94, Freight/drayage 52, Grain logistics 41.
- **10-day forecast**: rows height 34, top hairline `#1d2028`; grid columns `44px 1fr 28px 1fr 28px`: day, condition tag (Mono 10, severity color), low, range bar (4pt, positioned/sized by lo..hi against the 10-day min..max), high.
- **Precipitation**: 12 bars (gap 4, max height 64, `#22D3EE` at .85 opacity) with NOW / +6H / +12H labels.
- **Conditions grid**: 3×2 cells: UV INDEX, HUMIDITY, VISIBILITY, DEW POINT, AIR QUALITY (AQI), SUN (rise/set).

ESI color rule: ≥85 red `#FF3B4E`; 60–84 amber `#FFB000`; 40–59 cyan `#22D3EE`; <40 green `#00FF66`.

### 2. Map
- Header: "US WEATHER × MACRO" (Mono 600 10, tracking .1em, grey) + active layer title (Mono 600 12 amber).
- **Layer toggles** 2×2 grid, gap 6, height 36, radius 8, Mono 500 11, labels in brackets: `[FUTURES OVERLAY]`, `[PIPELINE FLOW]`, `[PORT CORRIDORS]`, `[CROP FREEZE]`. One active (amber style as chips).
- **Map** 362×262, bg `#0f1116`, 1px `#262A33`, radius 12. Prototype uses a stylized state-tile grid (30pt tiles, 32pt pitch, radius 4). **Replace with a real map** (MapKit with GeoJSON state polygons) using the same layer logic.
  - Futures: tile fill green (gain) / red (loss) with opacity scaled by |Δ%| (0.08–0.63); neutral `#171A21`.
  - Pipeline: dashed amber lines (gas) and solid orange `#FF8A3D` (crude) between hubs.
  - Ports: dashed cyan corridors.
  - Freeze: cyan fill, opacity by risk level 1–3.
  - Hub pins: 14pt circle, 2pt `#0D0E12` ring, glow in risk color, label Mono 600 8. Hubs: Cushing OK, Henry Hub LA, Houston, Chicago, Z6 NYC, LGB port, Savannah.
- Legend line under map (Mono 10 grey), changes per layer.
- **Arbitrage CTA**: height 52, radius 12, bg `#FFB000`, text `#0D0E12` Plex Sans 600 15: "⚡ View Live Arbitrage Opportunities" + count badge ("4": bg `#0D0E12`, amber text). Glow `0 0 28px rgba(255,176,0,.25)`.
- **Region panel** (appears on tapping a state/pin): card with 2pt top border in risk color, radius 12. Title (Plex Sans 600 16), body (Plex Sans 13/1.5), data rows (Mono 500 11, label grey / value colored), buttons OPEN CITY and SAVE HUB (44 high, radius 10; save = amber outline, toggles to "★ SAVED"). Example: "Texas Gulf Coast: 90°F+ heat wave spiking regional grid load; ERCOT power futures +4.2%."

### 3. Watch (Watchlist & Saved Hubs)
List rows min-height 60, padding 8/16, top hairline, 3pt left edge (amber if current, else transparent), selected bg `#171A21`. Columns: 10pt risk square, name (Plex Sans 500 14) + hub (Mono 10 grey), temp + "ESI n" in risk color. Tap sets city and opens Home. Footer legend: SHOCK red, ELEVATED amber, COLD cyan, CLEAR green. Default list: HOU, NYC, CHI, RTM, CUS, HH, LGB. Add swipe-to-delete natively.

### 4. Arbitrage Radar (bottom sheet)
Dimmed scrim `rgba(5,6,8,.72)`; sheet bg `#14161C`, 2pt amber top border, radius 24 24 0 0, max-height 86%, grabber 40×4 `#333845`. Header: "⚡ ARBITRAGE RADAR" (Mono 600 11 amber) / "Weather-driven spreads" (Plex Sans 600 18); 44pt close button.
- Hero: bg `#171A21`, radius 12: "TOP SPREAD · HENRY HUB vs TRANSCO Z6", **$1.40** (Mono 600 46, `#00FF66`), copy: "Freezing temperatures in NY against mild conditions in TX created a $1.40 Henry Hub vs Transco Z6 natural gas price spread. Pipeline at 98% utilization caps arbitrage flow."
- Spread cards (bg `#0D0E12`, 1px `#262A33`, radius 12, pad 12/14): pair + spread (green/red), weather driver (grey), "legA → legB" and "CONF n%".
  1. NG Henry Hub vs Transco Z6: $3.42 → $4.82, +$1.40, 88%
  2. Power ERCOT vs PJM West: $96 → $54, +$42, 74%
  3. WTI Cushing vs Gulf Coast: $78.64 → $79.31, −$0.67, 61%
  4. Wheat KC HRW vs Chicago SRW: $6.48 → $6.12, +$0.36, 69%
- Footer: "Illustrative data. Not investment advice."
Dismiss: scrim tap, ×, swipe down, Esc.

## Interactions & Behavior
- Tab switching: instant; keep per-tab scroll position.
- Map tile/pin tap → region panel; pin for a hub also sets the current city.
- Region OPEN CITY → Home with that city. SAVE HUB toggles watchlist membership.
- Search filters live; selecting a result closes the list.
- Ticker auto-scrolls; prices refresh on a timer (real: websocket/poll).
- Pulsing LIVE dot: opacity loop. Buttons: active state lightens amber to `#FFC638`; outlined buttons tint `rgba(255,176,0,.12)`.
- Haptics suggested: light impact on tab/city change, medium on opening the sheet.

## State Management
`city` (code), `tab` (home|map|watch), `layer` (futures|pipeline|ports|freeze), `region` (state code or nil), `arbOpen`, `query`, `watchlist` ([code]), `prices` (live quotes). Data needs: forecast API (current, hourly, 10-day, UV, AQI, sun), futures quotes (NG, CL, ZW, FBX, ERCOT, Z6), hub/state exposure and risk scores (ESI), and a spreads engine. ESI is a 0–100 score per city plus per-asset sub-scores.

## Design Tokens
Colors
- Canvas `#0D0E12`; Card `#14161C`; Raised `#171A21`; Hairline `#262A33` (inner `#1d2028`, strong `#333845`)
- Ink `#E6E8EC`; Body `#C4C8D0`; Muted `#7C8494`
- Amber (alerts, CTA, tickers, active) `#FFB000`
- Green (gain / bullish) `#00FF66`; Red (shock / loss) `#FF3B4E`; Cyan (freeze / cold / precip) `#22D3EE`; Orange (crude flow) `#FF8A3D`

Type: **IBM Plex Sans** (titles, copy; 500/600; 12–21) and **IBM Plex Mono** (all data, labels, tickers; 400–600; 8–46). Section labels: Mono 600 10–11, uppercase, tracking .1em.
Spacing: 4 / 6 / 8 / 10 / 12 / 14 / 16. Radius: 4 (map tiles), 8–10 (chips, buttons, cells), 12–14 (cards), 24 (sheet), 2 (bars). Shadows: none, except amber CTA glow. Min touch target 44pt.

## Assets
No raster assets or icons; glyphs are text characters (replace with SF Symbols). Fonts from Google Fonts (IBM Plex). Map is a placeholder tile grid, so source real US state GeoJSON.

## Files
- `TerminalCast.dc.html`: the full interactive prototype and design-system sheet (open in a browser). Logic lives in the `<script>` class: mock data (`cities`, `X`, `info`, `chg`, `freeze`), layer rendering, and ESI/risk color rules.
