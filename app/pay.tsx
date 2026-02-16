import { StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PaymentDetailsCard } from '@/components/payment-details-card';
import { type UpiPaymentData } from '@/utils/upi-parser';

const REQUIRED_FIELDS = ['pa', 'pn', 'am', 'cu', 'tr'] as const;

export default function PayScreen() {
  const params = useLocalSearchParams<Record<string, string>>();

  const hasRequired = REQUIRED_FIELDS.every((f) => params[f]);

  if (!hasRequired) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">Invalid payment request</ThemedText>
        <ThemedText style={styles.hint}>Missing required UPI parameters.</ThemedText>
      </ThemedView>
    );
  }

  const data: UpiPaymentData = {
    pa: params.pa!,
    pn: params.pn!,
    am: params.am!,
    cu: params.cu!,
    tr: params.tr!,
    tn: params.tn ?? undefined,
    mc: params.mc ?? undefined,
  };

  return (
    <ThemedView style={styles.container}>
      <PaymentDetailsCard data={data} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  hint: {
    marginTop: 8,
    opacity: 0.6,
    textAlign: 'center',
  },
});
