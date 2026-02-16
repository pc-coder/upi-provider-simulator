import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PaymentDetailsCard } from '@/components/payment-details-card';
import { type UpiPaymentData } from '@/utils/upi-parser';
import { API_BASE_URL } from '@/constants/api';

const REQUIRED_FIELDS = ['pa', 'pn', 'am', 'cu', 'tr'] as const;

async function submitResponse(tr: string, status: 'SUCCESS' | 'FAILURE') {
  const res = await fetch(`${API_BASE_URL}/api/upi/response`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tr, status }),
  });
  if (!res.ok) {
    throw new Error(`Server responded with ${res.status}`);
  }
}

export default function PayScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<'SUCCESS' | 'FAILURE' | null>(null);

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

  const handlePress = async (status: 'SUCCESS' | 'FAILURE') => {
    setSubmitting(true);
    try {
      await submitResponse(data.tr, status);
      setSubmitted(status);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <PaymentDetailsCard data={data} />

      {submitted ? (
        <ThemedView style={styles.resultContainer}>
          <ThemedText type="defaultSemiBold" style={submitted === 'SUCCESS' ? styles.successText : styles.failureText}>
            Payment marked as {submitted.toLowerCase()}
          </ThemedText>
        </ThemedView>
      ) : (
        <ThemedView style={styles.buttonRow}>
          <Pressable
            style={[styles.button, styles.failureButton]}
            onPress={() => handlePress('FAILURE')}
            disabled={submitting}
          >
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              Failure
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.button, styles.successButton]}
            onPress={() => handlePress('SUCCESS')}
            disabled={submitting}
          >
            <ThemedText type="defaultSemiBold" style={styles.buttonText}>
              {submitting ? 'Sending...' : 'Success'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      )}
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
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 130,
    alignItems: 'center',
  },
  successButton: {
    backgroundColor: '#22c55e',
  },
  failureButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 32,
  },
  successText: {
    color: '#22c55e',
    fontSize: 18,
  },
  failureText: {
    color: '#ef4444',
    fontSize: 18,
  },
});
