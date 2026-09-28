import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { Result, failure, success } from '../../../domain/shared/result.js';
import {
  WompiChargeRequest,
  WompiChargeResponse,
  WompiChargeStatus,
  WompiPaymentError,
  WompiPaymentOutputPort,
} from '../../../application/transaction/ports/wompi-payment.output-port.js';
import { EnvironmentVariables } from '../../config/environment-variables.js';

type WompiMerchantInfoResponseBody = {
  readonly data: {
    readonly presigned_acceptance: {
      readonly acceptance_token: string;
    };
  };
};

type WompiTransactionResponseBody = {
  readonly data: {
    readonly id: string;
    readonly status: WompiChargeStatus;
  };
};

const WOMPI_FIXED_CURRENCY = 'COP';

@Injectable()
export class WompiHttpAdapter implements WompiPaymentOutputPort {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async charge(
    request: WompiChargeRequest,
  ): Promise<Result<WompiChargeResponse, WompiPaymentError>> {
    const acceptanceTokenResult = await this.getAcceptanceToken();
    if (acceptanceTokenResult.isFailure) {
      return failure(acceptanceTokenResult.error);
    }

    const signature = this.buildIntegritySignature(
      request.reference,
      request.amountInCents,
    );

    return this.createTransaction(
      request,
      acceptanceTokenResult.value,
      signature,
    );
  }

  // STEP 1: fetch the acceptance token required by Wompi before creating a transaction.
  private async getAcceptanceToken(): Promise<
    Result<string, WompiPaymentError>
  > {
    try {
      const baseUrl = this.configService.get('WOMPI_API_URL', {
        infer: true,
      });
      const publicKey = this.configService.get('WOMPI_PUBLIC_KEY', {
        infer: true,
      });

      const response = await fetch(`${baseUrl}/merchants/info`, {
        method: 'GET',
        headers: {
          'x-merchant-public-key': publicKey,
        },
      });

      if (!response.ok) {
        return failure({
          kind: 'WOMPI_PAYMENT_ERROR',
          message: `Wompi merchant info responded with status ${response.status}`,
        });
      }

      const body = (await response.json()) as WompiMerchantInfoResponseBody;

      return success(body.data.presigned_acceptance.acceptance_token);
    } catch (error) {
      return failure({
        kind: 'WOMPI_PAYMENT_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error while fetching the Wompi acceptance token',
      });
    }
  }

  // STEP 2: integrity signature = SHA-256(reference + amount_in_cents + "COP" + integrity_secret).
  private buildIntegritySignature(
    reference: string,
    amountInCents: number,
  ): string {
    const integrityKey = this.configService.get('WOMPI_INTEGRITY_KEY', {
      infer: true,
    });

    return createHash('sha256')
      .update(
        `${reference}${amountInCents}${WOMPI_FIXED_CURRENCY}${integrityKey}`,
      )
      .digest('hex');
  }

  // STEP 3: create the transaction using the acceptance token and integrity signature.
  private async createTransaction(
    request: WompiChargeRequest,
    acceptanceToken: string,
    signature: string,
  ): Promise<Result<WompiChargeResponse, WompiPaymentError>> {
    try {
      const baseUrl = this.configService.get('WOMPI_API_URL', {
        infer: true,
      });
      const privateKey = this.configService.get('WOMPI_PRIVATE_KEY', {
        infer: true,
      });

      const response = await fetch(`${baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${privateKey}`,
        },
        body: JSON.stringify({
          acceptance_token: acceptanceToken,
          amount_in_cents: request.amountInCents,
          currency: WOMPI_FIXED_CURRENCY,
          customer_email: request.customerEmail,
          reference: request.reference,
          signature,
          payment_method: {
            type: 'CARD',
            token: request.paymentMethodToken,
          },
        }),
      });

      if (!response.ok) {
        return failure({
          kind: 'WOMPI_PAYMENT_ERROR',
          message: `Wompi API responded with status ${response.status}`,
        });
      }

      const body = (await response.json()) as WompiTransactionResponseBody;

      return success({
        wompiTransactionId: body.data.id,
        status: body.data.status,
      });
    } catch (error) {
      return failure({
        kind: 'WOMPI_PAYMENT_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown error while contacting Wompi',
      });
    }
  }
}
