import { useState } from 'react';
import { Pressable, StyleSheet, ToastAndroid, Platform, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PaymentDetailsCard } from '@/components/payment-details-card';
import { type UpiPaymentData } from '@/utils/upi-parser';
import { buildFssRequest } from '@/utils/fss-request';
import { ENVIRONMENTS, DEFAULT_ENVIRONMENT, type Environment } from '@/constants/api';

const REQUIRED_FIELDS = ['pa', 'pn', 'am', 'cu', 'tr'] as const;

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  }
}

async function submitResponse(
  params: Record<string, string>,
  status: 'SUCCESS' | 'FAILURE',
  environment: Environment,
) {
  const now = new Date();
  const timestamp =
    now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '') +
    now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).replace(/:/g, '');

  const fssRequest = await buildFssRequest({
    OperationName: params.OperationName ?? 'MerchantStatusUpdateReq',
    TxnId: params.TxnId ?? 'IDF226BZNWS09ASG17YMUE6VPB9KZP899K5',
    TxnType: params.TxnType ?? 'SendMoney',
    OrgTxnId: params.OrgTxnId ?? 'IDFA849295D96B642E9AB238471FEC21A01',
    OrgCustRefId: params.OrgCustRefId ?? '299456962261',
    OrgTxnRefId: params.tr ?? '',
    OrgTxnTimeStamp: params.OrgTxnTimeStamp ?? timestamp,
    PayerMobileNumber: params.PayerMobileNumber ?? '',
    PayeeMobileNumber: params.PayeeMobileNumber ?? '+919515522050',
    PayerVirAddr: params.PayerVirAddr ?? '9999999999@idfcfirst',
    PayeeVirAddr: params.pa ?? 'ccbillpay.987845@idfcbankuat',
    Amount: params.am ?? '90000.00',
    Remarks: params.tn ?? 'Payment from PhonePe',
    ResCode: status === 'SUCCESS' ? '000' : '100',
    ResDesc: status === 'SUCCESS' ? 'Approved' : 'Declined',
    TimeStamp: timestamp,
    MerchantID: params.MerchantID ?? params.mc ?? '16199',
    SubMerchantID: params.SubMerchantID ?? '-',
    TerminalID: params.TerminalID ?? '169991',
  });

  const res = await fetch(ENVIRONMENTS[environment], {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
    body: JSON.stringify(fssRequest),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Server responded with ${res.status}${body ? ': ' + body : ''}`);
  }
}

export default function PayScreen() {
  const params = useLocalSearchParams<Record<string, string>>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<'SUCCESS' | 'FAILURE' | null>(null);
  const [environment, setEnvironment] = useState<Environment>(DEFAULT_ENVIRONMENT);

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
      await submitResponse(params, status, environment);
      setSubmitted(status);
      showToast(`Payment ${status.toLowerCase()} sent to server`);
    } catch (e: any) {
      const message = e?.message ?? 'Unknown error';
      showToast(`Network error: ${message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <PaymentDetailsCard data={data} />

      {!submitted && (
        <ThemedView style={styles.envContainer}>
          <ThemedText type="defaultSemiBold" style={styles.envLabel}>
            Environment
          </ThemedText>
          <ThemedView style={styles.envOptions}>
            {(Object.keys(ENVIRONMENTS) as Environment[]).map((env) => {
              const selected = env === environment;
              return (
                <Pressable
                  key={env}
                  onPress={() => setEnvironment(env)}
                  disabled={submitting}
                  style={styles.envOption}
                >
                  <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                    {selected ? <View style={styles.radioInner} /> : null}
                  </View>
                  <ThemedText style={styles.envOptionText}>{env}</ThemedText>
                </Pressable>
              );
            })}
          </ThemedView>
        </ThemedView>
      )}

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
  envContainer: {
    marginTop: 24,
    alignSelf: 'stretch',
  },
  envLabel: {
    marginBottom: 8,
  },
  envOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  envOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioOuterSelected: {
    borderColor: '#2563eb',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  envOptionText: {
    fontSize: 14,
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
