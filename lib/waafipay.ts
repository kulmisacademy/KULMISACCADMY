import 'server-only';

/**
 * WaafiPay payment gateway client — https://docs.waafipay.com
 * Implements the API_PURCHASE flow (EVC Plus / WaafiPay mobile wallet).
 */
const WAAFI_ENDPOINT = 'https://api.waafipay.net/asm';

export type WaafiResult =
  | { ok: true; reference: string; transactionId: string; raw: unknown }
  | { ok: false; error: string; raw?: unknown };

/** Normalize a Somali phone number to the 252XXXXXXXX format WaafiPay expects. */
export function normalizePhone(input: string): string | null {
  let p = input.replace(/[^0-9]/g, '');
  if (p.startsWith('00')) p = p.slice(2);
  if (p.startsWith('252')) {
    // already country-coded
  } else if (p.startsWith('0')) {
    p = '252' + p.slice(1);
  } else if (p.length === 9) {
    p = '252' + p;
  }
  return /^252\d{9}$/.test(p) ? p : null;
}

/**
 * Charge a customer's mobile wallet. The customer approves the push on their phone.
 * Returns ok:true only when WaafiPay reports an APPROVED transaction (responseCode 2001).
 */
export async function waafiPurchase(opts: {
  phone: string;
  amount: number;
  description: string;
  reference: string;
  currency?: string;
}): Promise<WaafiResult> {
  const merchantUid = process.env.WAAFI_MERCHANT_UID;
  const apiUserId = process.env.WAAFI_API_USER_ID;
  const apiKey = process.env.WAAFI_API_KEY;

  if (!merchantUid || !apiUserId || !apiKey) {
    return { ok: false, error: 'Payment gateway is not configured.' };
  }

  const accountNo = normalizePhone(opts.phone);
  if (!accountNo) return { ok: false, error: 'Enter a valid phone number (e.g. 0612345678).' };

  const body = {
    schemaVersion: '1.0',
    requestId: opts.reference,
    timestamp: new Date().toISOString(),
    channelName: 'WEB',
    serviceName: 'API_PURCHASE',
    serviceParams: {
      merchantUid,
      apiUserId,
      apiKey,
      paymentMethod: 'MWALLET_ACCOUNT',
      payerInfo: { accountNo },
      transactionInfo: {
        referenceId: opts.reference,
        invoiceId: opts.reference,
        amount: opts.amount.toFixed(2),
        currency: opts.currency ?? 'USD',
        description: opts.description,
      },
    },
  };

  let json: any;
  try {
    const res = await fetch(WAAFI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    json = await res.json();
  } catch (e) {
    return { ok: false, error: 'Could not reach the payment gateway. Try again.', raw: String(e) };
  }

  // WaafiPay: responseCode "2001" + params.state "APPROVED" == success
  const code = json?.responseCode;
  const state = json?.params?.state;
  if (code === '2001' && (!state || state === 'APPROVED')) {
    return { ok: true, reference: opts.reference, transactionId: json?.params?.transactionId ?? opts.reference, raw: json };
  }

  const msg = json?.params?.description || json?.responseMsg || 'Payment was declined or cancelled.';
  return { ok: false, error: msg, raw: json };
}
