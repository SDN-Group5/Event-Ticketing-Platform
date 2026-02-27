import axios from 'axios';

export type BankTransferRequest = {
  toAccountNumber: string;
  toAccountName: string;
  bankCode?: string;
  bankName?: string;
  amount: number;
  description: string;
};

export type BankTransferResult = {
  transactionId: string;
  raw: unknown;
};

const BANK_API_BASE_URL = process.env.BANK_API_BASE_URL;
const BANK_API_KEY = process.env.BANK_API_KEY;
const BANK_API_CLIENT_ID = process.env.BANK_API_CLIENT_ID;
const APP_BANK_ACCOUNT_NUMBER = process.env.APP_BANK_ACCOUNT_NUMBER;
const APP_BANK_ACCOUNT_NAME = process.env.APP_BANK_ACCOUNT_NAME;

export async function transferToOrganizerBank(
  payload: BankTransferRequest,
): Promise<BankTransferResult> {
  if (!BANK_API_BASE_URL) {
    throw new Error('BANK_API_BASE_URL chưa được cấu hình');
  }

  if (!APP_BANK_ACCOUNT_NUMBER) {
    throw new Error('APP_BANK_ACCOUNT_NUMBER chưa được cấu hình');
  }

  const url = `${BANK_API_BASE_URL.replace(/\/$/, '')}/transfers`;

  const body = {
    sourceAccount: {
      accountNumber: APP_BANK_ACCOUNT_NUMBER,
      accountName: APP_BANK_ACCOUNT_NAME,
    },
    destinationAccount: {
      accountNumber: payload.toAccountNumber,
      accountName: payload.toAccountName,
      bankCode: payload.bankCode,
      bankName: payload.bankName,
    },
    amount: payload.amount,
    description: payload.description,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (BANK_API_KEY) {
    headers['X-API-Key'] = BANK_API_KEY;
  }

  if (BANK_API_CLIENT_ID) {
    headers['X-Client-Id'] = BANK_API_CLIENT_ID;
  }

  const response = await axios.post(url, body, { headers });

  const data = response.data as any;
  const transactionId =
    data.transactionId || data.id || data.txnId || data.reference || '';

  if (!transactionId) {
    throw new Error('Ngân hàng không trả về mã giao dịch (transactionId)');
  }

  return {
    transactionId,
    raw: data,
  };
}

