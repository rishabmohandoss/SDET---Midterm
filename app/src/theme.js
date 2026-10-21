// Theme tokens ported from design/terminalcast-design.html.
// Only surfaces and the accent change per theme; up/down/cold keep fixed meaning.
const base = { up: '#00FF66', down: '#FF3B4E', ink: '#E6E8EC', body: '#C4C8D0', orange: '#FF8A3D' };

export const THEMES = {
  amber: { ...base, name: 'AMBER', bg: '#0D0E12', card: '#14161C', raised: '#171A21', line: '#262A33', line2: '#1d2028', strong: '#333845', muted: '#7C8494', acc: '#FFB000', accHi: '#FFC638', accSoft: 'rgba(255,176,0,.14)', cold: '#22D3EE' },
  arctic: { ...base, name: 'ARCTIC', bg: '#0A1016', card: '#101820', raised: '#142029', line: '#1F3340', line2: '#172833', strong: '#2B4655', muted: '#7C93A3', acc: '#22D3EE', accHi: '#67E3F5', accSoft: 'rgba(34,211,238,.14)', cold: '#FFB000' },
  violet: { ...base, name: 'VIOLET', bg: '#0E0C14', card: '#16131F', raised: '#1B1727', line: '#2B2540', line2: '#211C33', strong: '#3A3256', muted: '#8A82A6', acc: '#A78BFA', accHi: '#C4B0FF', accSoft: 'rgba(167,139,250,.16)', cold: '#22D3EE' },
};

export const F = {
  mono: 'IBMPlexMono_400Regular',
  monoM: 'IBMPlexMono_500Medium',
  monoB: 'IBMPlexMono_600SemiBold',
  sans: 'IBMPlexSans_400Regular',
  sansM: 'IBMPlexSans_500Medium',
  sansB: 'IBMPlexSans_600SemiBold',
};

export const risk = (i) => (i >= 85 ? 'down' : i >= 60 ? 'acc' : i >= 40 ? 'cold' : 'up');
export const sign = (s) => (s[0] === '+' ? 'up' : s[0] === '−' ? 'down' : 'ink');
