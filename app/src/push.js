import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Show alerts as banners even while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

// Resolves to { token } or { error } with a user-facing reason.
export async function registerForPush() {
  try {
    if (!Device.isDevice) return { error: 'Push needs a physical device.' };
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('default', { name: 'Weather alerts', importance: Notifications.AndroidImportance.MAX });
    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
    if (status !== 'granted') return { error: 'Notification permission denied.' };
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) return { error: 'Missing EAS projectId in app.json.' };
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[PUSH] token', data);
    return { token: data };
  } catch (e) {
    console.log('[PUSH] register failed', e?.message);
    return { error: e?.message || 'Push registration failed.' };
  }
}

// System notification on this device without a server. Works in Expo Go; used when Cloud Code push is unavailable.
export async function localAlert(title, body) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: 'default' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2 },
  });
}
