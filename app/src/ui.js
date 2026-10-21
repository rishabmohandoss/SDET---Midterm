import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { F } from './theme';
import { useApp } from './store';

export const useT = () => useApp().t;

// Text with a preset font. `f` is a key of F; `c` is a theme color key or a raw color.
// Overflow rules: data and labels (any mono font) stay on ONE line and shrink to fit; pass `fit` to opt a sans title in
// (or `fit={false}` to opt a mono string out). Prose passes `lines={n}` to wrap and then truncate with an ellipsis.
// Font scaling is capped so large iOS text settings can't blow the layout up. flexShrink lets text yield in a Row.
export function Txt({ f = 'sans', size = 13, c = 'ink', fit, lines, style, children, ...rest }) {
  const t = useT();
  const one = lines ? false : fit ?? f.startsWith('mono');
  const limit = lines ? { numberOfLines: lines, ellipsizeMode: 'tail' } : one ? { numberOfLines: 1, adjustsFontSizeToFit: true, minimumFontScale: 0.75, ellipsizeMode: 'tail' } : null;
  return <Text maxFontSizeMultiplier={1.15} {...limit} {...rest} style={[{ fontFamily: F[f], fontSize: size, color: t[c] || c, flexShrink: 1 }, style]}>{children}</Text>;
}

export const Label = ({ children, style }) => <Txt f="monoB" size={11} c="acc" style={[{ letterSpacing: 1.1 }, style]}>{children}</Txt>;
export const Sub = ({ children, style, ...rest }) => <Txt f="monoM" size={10} c="muted" style={style} {...rest}>{children}</Txt>;

export function Card({ children, style }) {
  const t = useT();
  return <View style={[{ backgroundColor: t.card, borderColor: t.line, borderWidth: 1, borderRadius: 14, padding: 14 }, style]}>{children}</View>;
}

export function Group({ title, right, children }) {
  const t = useT();
  return (
    <View style={{ backgroundColor: t.card, borderColor: t.line, borderWidth: 1, borderRadius: 14, overflow: 'hidden' }}>
      {title ? <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 14, paddingBottom: 8 }}><Label>{title}</Label>{right}</View> : null}
      {children}
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, style]}>{children}</View>;
}

export function SetRow({ title, desc, children, first }) {
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 52, paddingHorizontal: 14, paddingVertical: 6, gap: 12, borderTopWidth: first ? 0 : 1, borderTopColor: t.line2 }}>
      <View style={{ flex: 1 }}>
        <Txt f="sansM" size={14} fit>{title}</Txt>
        {desc ? <Txt f="mono" size={11} c="muted" style={{ marginTop: 2 }}>{desc}</Txt> : null}
      </View>
      {children}
    </View>
  );
}

export function Btn({ title, onPress, kind, disabled, style, color }) {
  const t = useT();
  const pri = kind === 'pri', out = kind === 'out';
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={title}
      style={({ pressed }) => [{ height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, opacity: disabled ? 0.4 : 1,
        backgroundColor: pri ? (pressed ? t.accHi : t.acc) : pressed ? t.accSoft : 'transparent',
        borderWidth: pri ? 0 : 1, borderColor: color || (out ? t.acc : t.strong) }, style]}>
      <Txt fit f={pri ? 'sansB' : 'monoM'} size={pri ? 15 : 13} c={pri ? t.bg : color || (out ? 'acc' : 'ink')}>{title}</Txt>
    </Pressable>
  );
}

export function Chip({ label, on, onPress, style, a11y }) {
  const t = useT();
  return (
    <Pressable onPress={onPress} accessibilityLabel={a11y || label}
      style={[{ height: 36, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderColor: on ? t.acc : t.line, backgroundColor: on ? t.accSoft : t.card }, style]}>
      <Txt f="monoM" size={12} c={on ? 'acc' : 'ink'}>{label}</Txt>
    </Pressable>
  );
}

export function Switch({ on, onPress, label }) {
  const t = useT();
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} hitSlop={8}
      style={{ width: 48, height: 28, borderRadius: 14, borderWidth: 1, borderColor: on ? t.acc : t.strong, backgroundColor: on ? t.accSoft : t.bg }}>
      <View style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: 10, backgroundColor: on ? t.acc : t.muted }} />
    </Pressable>
  );
}

export function Seg({ options, value, onChange, width }) {
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: t.line, borderRadius: 10, overflow: 'hidden', width }}>
      {options.map((o, i) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        const on = value === v;
        return (
          <Pressable key={String(v)} onPress={() => onChange(v)} accessibilityLabel={String(l)}
            style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.accSoft : t.card, borderRightWidth: i < options.length - 1 ? 1 : 0, borderRightColor: t.line }}>
            <Txt f="monoM" size={11} c={on ? 'acc' : 'muted'}>{l}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({ label, ...props }) {
  const t = useT();
  return (
    <View style={{ gap: 6 }}>
      <Txt f="monoB" size={10} c="muted" style={{ letterSpacing: 1 }}>{label}</Txt>
      <TextInput {...props} accessibilityLabel={label} placeholderTextColor={t.muted} autoCapitalize="none" autoCorrect={false}
        style={{ height: 48, backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderRadius: 10, paddingHorizontal: 14, color: t.ink, fontFamily: F.mono, fontSize: 14 }} />
    </View>
  );
}

export function ErrorBox({ text }) {
  if (!text) return null;
  return (
    <View accessibilityRole="alert" style={{ padding: 10, borderWidth: 1, borderColor: '#FF3B4E', backgroundColor: 'rgba(255,59,78,.1)', borderRadius: 10 }}>
      <Txt f="monoM" size={12} c="down" lines={3}>{text}</Txt>
    </View>
  );
}
