export const ENVIRONMENTS = {
  QA: 'https://app.qa-opt.idfcfirstbank.com/api/payment-gateway/v1/upi/callback',
  Dev: 'https://api.dev-opt.idfcfirstbank.com/api/payment-gateway/v1/upi/callback',
  AutomationTest: 'https://app.automationtest-opt.idfcfirstbank.com/api/payment-gateway/v1/upi/callback',
  UAT: 'https://app.uat-opt.idfcfirstbank.com/api/payment-gateway/v1/upi/callback',
} as const;

export type Environment = keyof typeof ENVIRONMENTS;

export const DEFAULT_ENVIRONMENT: Environment = 'QA';
