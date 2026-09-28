import { Result } from '../../../domain/shared/result.js';

export type WompiChargeStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';

export type WompiChargeRequest = {
  readonly reference: string;
  readonly amountInCents: number;
  readonly currency: string;
  readonly customerEmail: string;
  readonly paymentMethodToken: string;
};

export type WompiChargeResponse = {
  readonly wompiTransactionId: string;
  readonly status: WompiChargeStatus;
};

export type WompiPaymentError = {
  readonly kind: 'WOMPI_PAYMENT_ERROR';
  readonly message: string;
};

export const WOMPI_PAYMENT_GATEWAY = Symbol('WOMPI_PAYMENT_GATEWAY');

export interface WompiPaymentOutputPort {
  charge(
    request: WompiChargeRequest,
  ): Promise<Result<WompiChargeResponse, WompiPaymentError>>;
}
