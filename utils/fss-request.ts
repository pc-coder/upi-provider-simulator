import { generateHMAC } from './hmac';

const HMAC_PREFIX = '{';
const HMAC_SUFFIX = '}';
const HMAC_KEY_SEPARATOR = ', ';
const HMAC_KEY_VALUE_SEPARATOR = '=';

export interface FssMerchantStatusUpdateRequest {
  OperationName: string;
  TxnId: string;
  TxnType: string;
  OrgTxnId: string;
  OrgCustRefId: string;
  OrgTxnRefId: string;
  OrgTxnTimeStamp: string;
  PayerMobileNumber: string;
  PayeeMobileNumber: string;
  PayerVirAddr: string;
  PayeeVirAddr: string;
  Amount: string;
  Remarks: string;
  ResCode: string;
  ResDesc: string;
  TimeStamp: string;
  MerchantID: string;
  SubMerchantID: string;
  TerminalID: string;
  HMAC?: string;
  statusUpdateRetryCount?: string;
  UMN?: string;
}

function mapToKeyValueString(map: Record<string, string>): string {
  const keys = Object.keys(map).sort();
  const pairs = keys.map((k) => k + HMAC_KEY_VALUE_SEPARATOR + map[k]);
  return HMAC_PREFIX + pairs.join(HMAC_KEY_SEPARATOR) + HMAC_SUFFIX;
}

/**
 * Builds a signed FSS MerchantStatusUpdateNotification request.
 * Mirrors the Go implementation: serializes all non-omitempty fields to a
 * sorted key=value string, then generates HMAC-SHA256 using TxnId as the key.
 */
export async function buildFssRequest(
  fields: Omit<FssMerchantStatusUpdateRequest, 'HMAC'>,
): Promise<FssMerchantStatusUpdateRequest> {
  // Build the map for HMAC computation (same as Go's ConvertTo[map[string]string]).
  // Include all standard fields (even if empty), exclude omitempty fields when empty.
  const hmacMap: Record<string, string> = {
    OperationName: fields.OperationName,
    TxnId: fields.TxnId,
    TxnType: fields.TxnType,
    OrgTxnId: fields.OrgTxnId,
    OrgCustRefId: fields.OrgCustRefId,
    OrgTxnRefId: fields.OrgTxnRefId,
    OrgTxnTimeStamp: fields.OrgTxnTimeStamp,
    PayerMobileNumber: fields.PayerMobileNumber,
    PayeeMobileNumber: fields.PayeeMobileNumber,
    PayerVirAddr: fields.PayerVirAddr,
    PayeeVirAddr: fields.PayeeVirAddr,
    Amount: fields.Amount,
    Remarks: fields.Remarks,
    ResCode: fields.ResCode,
    ResDesc: fields.ResDesc,
    TimeStamp: fields.TimeStamp,
    MerchantID: fields.MerchantID,
    SubMerchantID: fields.SubMerchantID,
    TerminalID: fields.TerminalID,
  };

  // omitempty fields — only included if non-empty
  if (fields.statusUpdateRetryCount) hmacMap.statusUpdateRetryCount = fields.statusUpdateRetryCount;
  if (fields.UMN) hmacMap.UMN = fields.UMN;

  const valueString = mapToKeyValueString(hmacMap);
  const hmac = await generateHMAC(fields.TxnId, valueString);

  return {
    ...fields,
    HMAC: hmac,
  };
}
