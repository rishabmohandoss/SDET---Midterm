import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import { IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans';
import { AppProvider, useApp } from './src/store';
import AuthScreen from './src/screens/AuthScreen';
import Shell from './src/Shell';

function Root() {
  const { ready, user, t } = useApp();
  if (!ready) return <View style={{ flex: 1, backgroundColor: '#0D0E12', justifyContent: 'center' }}><ActivityIndicator color="#FFB000" /></View>;
  return user ? <Shell /> : <AuthScreen />;
}

export default function App() {
  const [loaded] = useFonts({ IBMPlexMono_400Regular, IBMPlexMono_500Medium, IBMPlexMono_600SemiBold, IBMPlexSans_400Regular, IBMPlexSans_500Medium, IBMPlexSans_600SemiBold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: '#0D0E12' }} />;
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}
