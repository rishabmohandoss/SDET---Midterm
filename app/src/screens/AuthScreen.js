import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { Btn, ErrorBox, Field, Sub, Txt } from '../ui';

export default function AuthScreen() {
  const { t, logIn, signUp, resetPassword } = useApp();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ username: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);
  const su = mode === 'signup';
  const up = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr(''); setInfo(''); setBusy(true);
    try { await (su ? signUp(f) : logIn(f)); } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  const forgot = async () => {
    setErr(''); setInfo('');
    try { await resetPassword(f.email); setInfo('If that email has an account, a reset link is on its way.'); } catch (e) { setErr(e.message); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 22, gap: 16, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ marginTop: 24 }}>
            <Txt f="monoB" size={32}><Txt f="monoB" size={32} c="acc">&gt; </Txt>TerminalCast</Txt>
            <Txt size={14} c="body" style={{ marginTop: 8, lineHeight: 20 }}>Weather that moves markets. Sign in to sync your cities and alerts.</Txt>
          </View>
          <Txt f="monoB" size={10} c="up">● MARKETS LIVE · NG 3.42 ▲2.1%</Txt>
          <ErrorBox text={err} />
          {info ? <Txt f="monoM" size={12} c="up" lines={3}>{info}</Txt> : null}
          {su && <Field label="USERNAME" value={f.username} onChangeText={up('username')} placeholder="trader01" />}
          <Field label="EMAIL" value={f.email} onChangeText={up('email')} placeholder="you@school.edu" keyboardType="email-address" />
          <Field label="PASSWORD" value={f.password} onChangeText={up('password')} placeholder="••••••••" secureTextEntry />
          {su && <Field label="CONFIRM PASSWORD" value={f.confirm} onChangeText={up('confirm')} placeholder="••••••••" secureTextEntry />}
          <Btn kind="pri" title={busy ? 'Please wait…' : su ? 'Create account' : 'Log in'} onPress={submit} disabled={busy} />
          {!su && <Btn title="Forgot password?" onPress={forgot} style={{ height: 40, borderWidth: 0 }} color="#7C8494" />}
          <Btn title={su ? 'I already have an account' : 'Sign up'} onPress={() => { setMode(su ? 'login' : 'signup'); setErr(''); setInfo(''); }} />
          <View style={{ flex: 1 }} />
          <Sub lines={2} style={{ textAlign: 'center', alignSelf: 'center' }}>Secured by Back4App · Illustrative data. Not investment advice.</Sub>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
