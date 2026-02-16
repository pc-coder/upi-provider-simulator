export interface UpiPaymentData {
  pa: string; // payee address (UPI ID)
  pn: string; // payee name
  am: string; // amount
  cu: string; // currency
  tr: string; // transaction reference
  tn?: string; // note
  mc?: string; // merchant code
}

const REQUIRED_FIELDS = ['pa', 'pn', 'am', 'cu', 'tr'] as const;

export function parseUpiUrl(url: string): UpiPaymentData | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'upi:' || parsed.hostname !== 'pay') {
      return null;
    }

    const params = parsed.searchParams;
    for (const field of REQUIRED_FIELDS) {
      if (!params.get(field)) {
        return null;
      }
    }

    return {
      pa: params.get('pa')!,
      pn: params.get('pn')!,
      am: params.get('am')!,
      cu: params.get('cu')!,
      tr: params.get('tr')!,
      tn: params.get('tn') ?? undefined,
      mc: params.get('mc') ?? undefined,
    };
  } catch {
    return null;
  }
}

export function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency} ${amount}`;

  const symbol = currency === 'INR' ? '₹' : currency;
  return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
