import { Stack } from 'expo-router';

export default function PartnerAuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="partner-login" />
      <Stack.Screen name="partner-register" />
    </Stack>
  );
}