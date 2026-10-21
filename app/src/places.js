// Static geography: preset trading hubs/cities and US state centroids used by the map.
export const PRESETS = {
  NWK: { name: 'Newark, NJ', hub: 'NY HARBOR · PJM EAST', lat: 40.7357, lon: -74.1724 },
  HOU: { name: 'Houston, TX', hub: 'GULF COAST · ERCOT', lat: 29.7604, lon: -95.3698 },
  NYC: { name: 'New York, NY', hub: 'NORTHEAST · TRANSCO Z6', lat: 40.7128, lon: -74.006 },
  CHI: { name: 'Chicago, IL', hub: 'MIDWEST · GRAIN HUB', lat: 41.8781, lon: -87.6298 },
  RTM: { name: 'Rotterdam, NL', hub: 'EUROPE · ARA HUB', lat: 51.9225, lon: 4.4792 },
  CUS: { name: 'Cushing, OK', hub: 'WTI DELIVERY HUB', lat: 35.9851, lon: -96.7676 },
  HH: { name: 'Henry Hub, LA', hub: 'NAT GAS BENCHMARK', lat: 29.9627, lon: -92.0398 },
  LGB: { name: 'LA / Long Beach, CA', hub: 'WEST COAST PORTS', lat: 33.7701, lon: -118.1937 },
};

// [name, lat, lon, commodity most exposed to that state's weather]
export const STATES = {
  AL: ['Alabama', 32.8, -86.8, 'NG'], AZ: ['Arizona', 34.2, -111.7, 'NG'], AR: ['Arkansas', 34.9, -92.4, 'NG'], CA: ['California · LA/Long Beach', 37.2, -119.5, 'CL'],
  CO: ['Colorado', 39.0, -105.5, 'NG'], DE: ['Delaware', 39.0, -75.5, 'NG'], FL: ['Florida', 28.6, -82.4, 'NG'], GA: ['Georgia · Savannah', 32.7, -83.4, 'NG'],
  ID: ['Idaho', 44.4, -114.6, 'ZW'], IL: ['Illinois · Chicago', 40.0, -89.2, 'ZW'], IN: ['Indiana', 39.9, -86.3, 'ZW'], IA: ['Iowa', 42.1, -93.5, 'ZW'],
  KS: ['Kansas · Winter Wheat', 38.5, -98.4, 'KE'], KY: ['Kentucky', 37.5, -85.3, 'NG'], LA: ['Louisiana · Henry Hub', 31.1, -92.0, 'NG'], ME: ['Maine', 45.3, -69.2, 'HO'],
  MD: ['Maryland', 39.0, -76.8, 'NG'], MA: ['Massachusetts', 42.3, -71.8, 'HO'], MI: ['Michigan', 44.3, -85.4, 'NG'], MN: ['Minnesota', 46.3, -94.3, 'ZW'],
  MS: ['Mississippi', 32.7, -89.7, 'NG'], MO: ['Missouri', 38.4, -92.5, 'ZW'], MT: ['Montana', 47.0, -109.6, 'ZW'], NE: ['Nebraska', 41.5, -99.8, 'ZW'],
  NV: ['Nevada', 39.3, -116.6, 'NG'], NH: ['New Hampshire', 43.7, -71.6, 'HO'], NJ: ['New Jersey · Newark', 40.1, -74.7, 'NG'], NM: ['New Mexico', 34.4, -106.1, 'NG'],
  NY: ['New York · Transco Z6', 42.9, -75.5, 'NG'], NC: ['North Carolina', 35.5, -79.4, 'NG'], ND: ['North Dakota · Bakken', 47.5, -100.5, 'CL'], OH: ['Ohio', 40.3, -82.8, 'NG'],
  OK: ['Oklahoma · Cushing', 35.6, -97.5, 'CL'], OR: ['Oregon', 43.9, -120.6, 'NG'], PA: ['Pennsylvania', 40.9, -77.8, 'NG'], SC: ['South Carolina', 33.9, -80.9, 'NG'],
  SD: ['South Dakota', 44.4, -100.2, 'ZW'], TN: ['Tennessee', 35.9, -86.4, 'NG'], TX: ['Texas Gulf Coast', 31.5, -99.3, 'NG'], UT: ['Utah', 39.3, -111.7, 'NG'],
  VT: ['Vermont', 44.1, -72.7, 'HO'], VA: ['Virginia', 37.5, -78.8, 'NG'], WA: ['Washington', 47.4, -120.5, 'NG'], WV: ['West Virginia', 38.6, -80.6, 'NG'],
  WI: ['Wisconsin', 44.6, -89.9, 'ZW'], WY: ['Wyoming', 43.0, -107.5, 'NG'],
};
// Map tile -> preset hub city that "OPEN CITY" jumps to.
export const STATE_CITY = { NJ: 'NWK', TX: 'HOU', NY: 'NYC', IL: 'CHI', OK: 'CUS', LA: 'HH', CA: 'LGB' };
