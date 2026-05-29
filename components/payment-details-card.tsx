import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { type UpiPaymentData, formatAmount } from '@/utils/upi-parser';

function Row({ label, value, testID }: { label: string; value: string; testID: string }) {
  return (
    <ThemedView style={styles.row} testID={`${testID}-row`}>
      <ThemedText style={styles.label} testID={`${testID}-label`}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.value} testID={`${testID}-value`}>{value}</ThemedText>
    </ThemedView>
  );
}

export function PaymentDetailsCard({ data }: { data: UpiPaymentData }) {
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#333' }, 'icon');

  return (
    <ThemedView style={[styles.card, { borderColor }]} testID="payment-details-card">
      <ThemedText type="subtitle" style={styles.heading} testID="payment-heading">Payment Request</ThemedText>

      <ThemedView style={styles.amountContainer}>
        <ThemedText type="title" style={styles.amount} testID="payment-amount">
          {formatAmount(data.am, data.cu)}
        </ThemedText>
        <ThemedText style={styles.currency} testID="payment-currency">{data.cu}</ThemedText>
      </ThemedView>

      <Row label="Payee Name" value={data.pn} testID="payment-payee-name" />
      <Row label="UPI ID" value={data.pa} testID="payment-upi-id" />
      <Row label="Transaction Ref" value={data.tr} testID="payment-transaction-ref" />
      {data.tn ? <Row label="Note" value={data.tn} testID="payment-note" /> : null}
      {data.mc ? <Row label="Merchant Code" value={data.mc} testID="payment-merchant-code" /> : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    width: '100%',
    maxWidth: 400,
  },
  heading: {
    textAlign: 'center',
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  amount: {
    fontSize: 40,
    lineHeight: 48,
  },
  currency: {
    marginTop: 4,
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    opacity: 0.6,
    flex: 1,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
});
