import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../store';
import { Btn, ErrorBox, Field, Sub, Txt } from '../ui';

export default function AuthScreen() {
  const { t, logIn, signUp } = useApp();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ username: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const su = mode === 'signup';
  const up = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setErr(''); setBusy(true);
    try { await (su ? signUp(f) : logIn(f)); } catch (e) { setErr(e.message); } finally { setBusy(false); }
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
          {su && <Field label="USERNAME" value={f.username} onChangeText={up('username')} placeholder="trader01" />}
          <Field label="EMAIL" value={f.email} onChangeText={up('email')} placeholder="you@school.edu" keyboardType="email-address" />
          <Field label="PASSWORD" value={f.password} onChangeText={up('password')} placeholder="••••••••" secureTextEntry />
          {su && <Field label="CONFIRM PASSWORD" value={f.confirm} onChangeText={up('confirm')} placeholder="••••••••" secureTextEntry />}
          <Btn kind="pri" title={busy ? 'Please wait…' : su ? 'Create account' : 'Log in'} onPress={submit} disabled={busy} />
          <Btn title={su ? 'I already have an account' : 'Sign up'} onPress={() => { setMode(su ? 'login' : 'signup'); setErr(''); }} />
          <View style={{ flex: 1 }} />
          <Sub style={{ textAlign: 'center' }}>Secured by Back4App · Illustrative data. Not investment advice.</Sub>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
