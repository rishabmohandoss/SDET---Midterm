// Static map geometry only. All weather, quotes and spreads come from src/live.js.
export const GRID = { ME: [10, 0], VT: [9, 1], NH: [10, 1], WA: [0, 1], ID: [1, 1], MT: [2, 1], ND: [3, 1], MN: [4, 1], WI: [5, 1], MI: [6, 1], NY: [8, 1], MA: [10, 2], OR: [0, 2], NV: [1, 2], WY: [2, 2], SD: [3, 2], IA: [4, 2], IL: [5, 2], IN: [6, 2], OH: [7, 2], PA: [8, 2], NJ: [9, 2], CA: [0, 3], UT: [1, 3], CO: [2, 3], NE: [3, 3], MO: [4, 3], KY: [5, 3], WV: [6, 3], VA: [7, 3], MD: [8, 3], DE: [9, 3], AZ: [1, 4], NM: [2, 4], KS: [3, 4], AR: [4, 4], TN: [5, 4], NC: [6, 4], SC: [7, 4], OK: [3, 5], LA: [4, 5], MS: [5, 5], AL: [6, 5], GA: [7, 5], TX: [3, 6], FL: [8, 6] };
export const NODES = { cush: ['OK', 'CUSHING', 'CUS'], hh: ['LA', 'HENRY HUB', 'HH'], hou: ['TX', 'HOUSTON', 'HOU'], chi: ['IL', 'CHICAGO', 'CHI'], z6: ['NY', 'Z6', 'NYC'], lgb: ['CA', 'LGB', 'LGB'], sav: ['GA', 'SAV', null] };
export const PIPES = [['hh', 'z6'], ['cush', 'chi'], ['hou', 'cush'], ['hh', 'hou']];
export const PORTS = [['lgb', 'chi'], ['hou', 'hh'], ['sav', 'chi'], ['z6', 'chi']];
export const LAYER_NODES = { futures: ['cush', 'hh', 'hou', 'chi', 'z6'], pipeline: ['cush', 'hh', 'hou', 'chi', 'z6'], ports: ['lgb', 'hou', 'sav', 'z6', 'chi'], freeze: ['chi', 'cush'] };

