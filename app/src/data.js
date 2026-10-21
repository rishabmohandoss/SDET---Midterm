// Illustrative mock data. Replace with real feeds / Back4App classes later.
export const CITIES = {
  HOU: { name: 'Houston, TX', hub: 'GULF COAST · ERCOT', temp: 93, feels: 101, wind: 11, dir: 'SSE', baro: '29.82"', precip: '10%', cond: 'HEAT ADVISORY', cc: 'down', idx: 78, il: 'HIGH · BULLISH POWER', until: 'UNTIL 8PM', note: 'ERCOT load +6% vs 5y avg; power futures bid.',
    mv: [['ERCOT PWR', '+4.2%'], ['HSC NG', '+1.9%'], ['RBOB', '+0.8%']],
    fc: [['MON', 94, 76, 'HOT', 'down'], ['TUE', 95, 77, 'HOT', 'down'], ['WED', 91, 75, 'STORM', 'acc'], ['THU', 87, 73, 'CLEAR', 'up'], ['FRI', 86, 72, 'CLEAR', 'up']],
    sens: [['Power load / ERCOT', 91, 'Peak demand +6% vs 5y avg'], ['Refinery run risk', 55, 'Cooling-water derates, 2 units'], ['LNG export logistics', 62, 'Ship channel winds < 20kt'], ['Grain port delays', 38, 'Elevators loading normally']] },
  NYC: { name: 'New York, NY', hub: 'NORTHEAST · TRANSCO Z6', temp: 24, feels: 12, wind: 18, dir: 'NW', baro: '30.31"', precip: '35% SNOW', cond: 'HARD FREEZE', cc: 'cold', idx: 91, il: 'EXTREME · BULLISH NG / HO', until: 'UNTIL 6AM', note: 'Z6 basis +$1.40 over Henry Hub; heating oil bid.',
    mv: [['TRANSCO Z6', '+6.1%'], ['HO', '+2.4%'], ['NG', '+2.1%']],
    fc: [['MON', 26, 15, 'COLD', 'cold'], ['TUE', 22, 10, 'SNOW', 'cold'], ['WED', 28, 18, 'COLD', 'cold'], ['THU', 33, 24, 'CLOUD', 'acc'], ['FRI', 38, 28, 'CLEAR', 'up']],
    sens: [['Heating oil demand', 88, 'HDD +34% vs normal'], ['Z6 gas basis', 94, 'Pipeline at 98% utilization'], ['Freight / drayage', 52, 'Port NY/NJ icing slowdowns'], ['Grain logistics', 41, 'Minor rail delays']] },
  CHI: { name: 'Chicago, IL', hub: 'MIDWEST · GRAIN HUB', temp: 19, feels: 6, wind: 22, dir: 'WNW', baro: '30.12"', precip: '60% ICE', cond: 'ICE STORM WATCH', cc: 'acc', idx: 83, il: 'HIGH · BULLISH WHEAT', until: 'UNTIL 10PM', note: 'Rail dwell +19h; wheat logistics risk.',
    mv: [['ZW', '+1.3%'], ['ZC', '+0.6%'], ['RAIL DWELL', '+19h']],
    fc: [['MON', 21, 9, 'ICE', 'cold'], ['TUE', 18, 5, 'SNOW', 'cold'], ['WED', 24, 12, 'WIND', 'acc'], ['THU', 30, 19, 'CLOUD', 'acc'], ['FRI', 34, 22, 'CLEAR', 'up']],
    sens: [['Grain logistics delays', 83, 'Rail dwell +19h; barge ice'], ['Heating demand', 76, 'LDC sendout high'], ['Rail network', 69, 'Switching yards degraded'], ['Power load', 48, 'Within seasonal range']] },
  RTM: { name: 'Rotterdam, NL', hub: 'EUROPE · ARA HUB', temp: 41, feels: 34, wind: 24, dir: 'SW', baro: '29.55"', precip: '70% RAIN', cond: 'GALE WARNING', cc: 'acc', idx: 66, il: 'ELEVATED · MIXED', until: 'UNTIL 3PM', note: 'Low wind output lifts TTF; Rhine barge surcharge.',
    mv: [['TTF', '+3.4%'], ['ARA GASOIL', '+1.1%'], ['RHINE FRT', '+8%']],
    fc: [['MON', 42, 36, 'GALE', 'acc'], ['TUE', 44, 38, 'RAIN', 'acc'], ['WED', 40, 33, 'RAIN', 'acc'], ['THU', 38, 31, 'CLOUD', 'acc'], ['FRI', 37, 30, 'CLEAR', 'up']],
    sens: [['TTF gas demand', 70, 'Wind output soft, gas burn up'], ['Rhine barge draft', 81, 'Low-water surcharge in effect'], ['Wheat import delays', 45, 'Terminal wind holds, 6h avg'], ['Container freight', 66, 'Vessel bunching at ECT']] },
  CUS: { name: 'Cushing, OK', hub: 'WTI DELIVERY HUB', temp: 28, feels: 17, wind: 16, dir: 'N', baro: '30.20"', precip: '20%', cond: 'COLD SNAP', cc: 'cold', idx: 64, il: 'ELEVATED · TIGHT STORAGE', until: 'UNTIL 9AM', note: 'Road ice slows trucked crude into storage.',
    mv: [['WTI', '−0.4%'], ['CL M1–M2', '+$0.32'], ['TANK UTIL', '61%']],
    fc: [['MON', 30, 18, 'COLD', 'cold'], ['TUE', 27, 15, 'COLD', 'cold'], ['WED', 33, 21, 'CLEAR', 'up'], ['THU', 41, 26, 'CLEAR', 'up'], ['FRI', 48, 31, 'CLEAR', 'up']],
    sens: [['Trucked crude flow', 72, 'Road ice slows gathering'], ['Storage tightness', 61, 'Tank utilization 61%'], ['Pipeline throughput', 44, 'Normal operations'], ['Wheat belt freeze', 58, 'KS/OK winterkill watch']] },
  HH: { name: 'Henry Hub, LA', hub: 'NAT GAS BENCHMARK', temp: 68, feels: 68, wind: 7, dir: 'S', baro: '29.95"', precip: '5%', cond: 'MILD / CLEAR', cc: 'up', idx: 32, il: 'LOW · SUPPLY LONG', until: 'NO ACTIVE ALERTS', note: 'Mild Gulf keeps supply long; spread to Z6 wide.',
    mv: [['HENRY HUB', '+2.1%'], ['LNG FEED', '14.8'], ['NG M1', '+2.1%']],
    fc: [['MON', 70, 55, 'CLEAR', 'up'], ['TUE', 72, 58, 'CLEAR', 'up'], ['WED', 69, 56, 'CLOUD', 'acc'], ['THU', 66, 52, 'CLEAR', 'up'], ['FRI', 64, 50, 'CLEAR', 'up']],
    sens: [['Demand pull', 28, 'Gulf heating & cooling light'], ['LNG feedgas', 74, 'Steady 14.8 Bcf/d'], ['Storm risk', 12, 'No tropical activity'], ['Pipeline flow', 58, 'Northbound capped at Z6']] },
  LGB: { name: 'LA / Long Beach, CA', hub: 'WEST COAST PORTS', temp: 72, feels: 72, wind: 6, dir: 'W', baro: '30.02"', precip: '0%', cond: 'CLEAR', cc: 'up', idx: 21, il: 'LOW · NORMAL FLOW', until: 'NO ACTIVE ALERTS', note: 'Normal port flow; FBX West Coast +3.8%.',
    mv: [['FBX WC', '+3.8%'], ['ANCHORAGE', '3'], ['DIESEL', '−0.3%']],
    fc: [['MON', 73, 58, 'CLEAR', 'up'], ['TUE', 74, 59, 'CLEAR', 'up'], ['WED', 71, 57, 'CLOUD', 'acc'], ['THU', 70, 56, 'CLEAR', 'up'], ['FRI', 72, 58, 'CLEAR', 'up']],
    sens: [['Port congestion', 22, '3 vessels at anchor'], ['Freight rates', 48, 'FBX trending up +3.8%'], ['Rail intermodal', 19, 'Clear corridors'], ['Power load', 31, 'Mild demand']] },
};

export const GRID = { ME: [10, 0], VT: [9, 1], NH: [10, 1], WA: [0, 1], ID: [1, 1], MT: [2, 1], ND: [3, 1], MN: [4, 1], WI: [5, 1], MI: [6, 1], NY: [8, 1], MA: [10, 2], OR: [0, 2], NV: [1, 2], WY: [2, 2], SD: [3, 2], IA: [4, 2], IL: [5, 2], IN: [6, 2], OH: [7, 2], PA: [8, 2], NJ: [9, 2], CA: [0, 3], UT: [1, 3], CO: [2, 3], NE: [3, 3], MO: [4, 3], KY: [5, 3], WV: [6, 3], VA: [7, 3], MD: [8, 3], DE: [9, 3], AZ: [1, 4], NM: [2, 4], KS: [3, 4], AR: [4, 4], TN: [5, 4], NC: [6, 4], SC: [7, 4], OK: [3, 5], LA: [4, 5], MS: [5, 5], AL: [6, 5], GA: [7, 5], TX: [3, 6], FL: [8, 6] };
export const CHG = { TX: 4.2, NY: 6.1, NJ: 5.4, PA: 3.1, OK: 1.2, LA: 2.0, IL: 0.8, OH: 1.4, MA: 5.8, MI: 2.2, MN: 1.6, WI: 1.3, GA: 1.1, FL: 0.3, ND: -1.1, SD: -0.7, CA: -0.6, AZ: -1.2, NV: -0.4 };
export const FRZ = { ND: 3, MT: 3, MN: 2, SD: 2, WI: 2, MI: 1, NY: 2, VT: 2, NH: 2, ME: 2, WY: 1, NE: 1, KS: 1, OK: 1, IL: 2 };
export const NODES = { cush: ['OK', 'CUSHING', 'CUS'], hh: ['LA', 'HENRY HUB', 'HH'], hou: ['TX', 'HOUSTON', 'HOU'], chi: ['IL', 'CHICAGO', 'CHI'], z6: ['NY', 'Z6', 'NYC'], lgb: ['CA', 'LGB', 'LGB'], sav: ['GA', 'SAV', null] };
export const PIPES = [['hh', 'z6'], ['cush', 'chi'], ['hou', 'cush'], ['hh', 'hou']];
export const PORTS = [['lgb', 'chi'], ['hou', 'hh'], ['sav', 'chi'], ['z6', 'chi']];
export const LAYER_NODES = { futures: ['cush', 'hh', 'hou', 'chi', 'z6'], pipeline: ['cush', 'hh', 'hou', 'chi', 'z6'], ports: ['lgb', 'hou', 'sav', 'z6', 'chi'], freeze: ['chi', 'cush'] };

export const REGION = {
  TX: ['Texas Gulf Coast', '90°F+ heat wave spiking regional grid load; ERCOT power futures +4.2%. Gulf refinery runs trimmed on cooling-water limits.', 'down', 'HOU', [['ERCOT NORTH DA', '$96.40 +4.2%', 'up'], ['HSC NAT GAS', '$3.18 +1.9%', 'up'], ['REFINERY RISK', 'HIGH', 'down']]],
  NY: ['New York · Transco Z6', 'Freezing temperatures drive heating demand; Z6 basis blown out against mild Gulf supply.', 'cold', 'NYC', [['TRANSCO Z6', '$4.82 +6.1%', 'up'], ['HEATING OIL', '$2.91 +2.4%', 'up'], ['PIPELINE UTIL.', '98%', 'down']]],
  OK: ['Oklahoma · Cushing', 'Cushing storage tight; cold snap in the Plains slows trucked barrels.', 'acc', 'CUS', [['WTI CUSHING', '$78.64 −0.4%', 'down'], ['TANK UTIL.', '61%', 'acc'], ['CL M1–M2', '+$0.32', 'up']]],
  IL: ['Illinois · Chicago', 'Sub-freezing snap and ice delay rail and barge grain movements.', 'acc', 'CHI', [['ZW CHICAGO', '$6.12 +1.3%', 'up'], ['RAIL DWELL', '+19h', 'down'], ['BARGE FREIGHT', '$14.20/t', 'acc']]],
  LA: ['Louisiana · Henry Hub', 'Henry Hub long on mild Gulf temps and steady LNG feedgas.', 'up', 'HH', [['HENRY HUB', '$3.42 +2.1%', 'up'], ['LNG FEEDGAS', '14.8 Bcf/d', 'ink'], ['STORM RISK', 'LOW', 'up']]],
  CA: ['California · LA/Long Beach', 'Clear and mild. Port throughput normal; container rates easing.', 'up', 'LGB', [['FBX WEST COAST', '$2,184 +3.8%', 'up'], ['AT ANCHOR', '3 vessels', 'up'], ['PORT DELAY', '0.4 d', 'up']]],
};

export const ARBS = [
  ['NG · Henry Hub vs Transco Z6', 'NY freeze vs mild Gulf: Z6 basis blowout', '$3.42', '$4.82', '+$1.40', 'up', '88%'],
  ['Power · ERCOT vs PJM West', 'Houston 90°F+ load against mild mid-Atlantic', '$96', '$54', '+$42', 'up', '74%'],
  ['WTI Cushing vs Gulf Coast', 'Plains cold snap slows trucked crude', '$78.64', '$79.31', '−$0.67', 'down', '61%'],
  ['Wheat · KC HRW vs Chicago SRW', 'Plains hard freeze, Chicago ice delays', '$6.48', '$6.12', '+$0.36', 'up', '69%'],
];
