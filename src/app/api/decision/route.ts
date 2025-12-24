import { NextRequest, NextResponse } from 'next/server';
import { evaluateClaimDecision, exportAuditArtifact } from '@/lib/engine/decision-engine';
import { ClaimInput } from '@/lib/engine/types';

export interface DecisionAPIRequest {
  bookingRef: string;
  flightNo: string;
  flightDate: string;
  passengerToken: string;
  productId: string;
  productVersion: string;
  claimDate?: string; // Optional: defaults to current date for eligibility check
}

export interface DecisionAPIResponse {
  success: boolean;
  decision?: {
    id: string;
    outcome: 'approved' | 'denied';
    payoutAmountUSD: number;
    reasonCodes: string[];
    productVersion: string;
    productHash: string;
    timestamp: string;
  };
  trace?: {
    id: string;
    rule: string;
    description: string;
    result: 'pass' | 'fail' | 'skip';
    explanation: string;
  }[];
  flightData?: {
    flightNo: string;
    status: string;
    delayMinutes: number;
    delayReason: string;
  };
  processingTimeMs: number;
  error?: string;
  errorCode?: string;
}

function validateRequest(body: unknown): { valid: true; data: DecisionAPIRequest } | { valid: false; error: string; code: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object', code: 'INVALID_BODY' };
  }

  const data = body as Record<string, unknown>;
  const requiredFields = ['bookingRef', 'flightNo', 'flightDate', 'passengerToken', 'productId', 'productVersion'];

  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      return { valid: false, error: `Missing or invalid required field: ${field}`, code: 'MISSING_FIELD' };
    }
  }

  // Validate booking reference (non-empty, reasonable length)
  const bookingRef = data.bookingRef as string;
  if (bookingRef.length < 2 || bookingRef.length > 20) {
    return { valid: false, error: 'bookingRef must be 2-20 characters', code: 'INVALID_BOOKING_REF' };
  }

  // Validate flight number format: 2-3 letter carrier code + 1-4 digit flight number
  const flightNo = data.flightNo as string;
  const flightNoRegex = /^[A-Z]{2,3}\d{1,4}$/;
  if (!flightNoRegex.test(flightNo)) {
    return { valid: false, error: 'flightNo must be 2-3 letter carrier code + 1-4 digit number (e.g., BA123, UAL1234)', code: 'INVALID_FLIGHT_NO' };
  }

  // Validate flight date format (YYYY-MM-DD)
  const flightDate = data.flightDate as string;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(flightDate)) {
    return { valid: false, error: 'flightDate must be in YYYY-MM-DD format', code: 'INVALID_DATE_FORMAT' };
  }

  // Validate date is a valid date (lenient for demo purposes)
  const dateObj = new Date(flightDate);

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'flightDate is not a valid date', code: 'INVALID_DATE' };
  }

  // Only reject dates more than 1 year in the future (allow historical dates for demos)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  if (dateObj > oneYearFromNow) {
    return { valid: false, error: 'flightDate cannot be more than 1 year in the future', code: 'FUTURE_DATE' };
  }

  // Validate product version format (e.g., v1.0, v1.2.3)
  const productVersion = data.productVersion as string;
  const versionRegex = /^v\d+(\.\d+)*$/;
  if (!versionRegex.test(productVersion)) {
    return { valid: false, error: 'productVersion must be in format vX.Y (e.g., v1.0, v1.2)', code: 'INVALID_VERSION_FORMAT' };
  }

  // Validate optional claimDate if provided (YYYY-MM-DD format)
  let claimDate: string | undefined;
  if (data.claimDate !== undefined) {
    if (typeof data.claimDate !== 'string') {
      return { valid: false, error: 'claimDate must be a string in YYYY-MM-DD format', code: 'INVALID_CLAIM_DATE' };
    }
    if (!dateRegex.test(data.claimDate)) {
      return { valid: false, error: 'claimDate must be in YYYY-MM-DD format', code: 'INVALID_CLAIM_DATE_FORMAT' };
    }
    const claimDateObj = new Date(data.claimDate);
    if (isNaN(claimDateObj.getTime())) {
      return { valid: false, error: 'claimDate is not a valid date', code: 'INVALID_CLAIM_DATE' };
    }
    claimDate = data.claimDate;
  }

  return {
    valid: true,
    data: {
      bookingRef: bookingRef,
      flightNo: flightNo,
      flightDate: flightDate,
      passengerToken: data.passengerToken as string,
      productId: data.productId as string,
      productVersion: productVersion,
      claimDate: claimDate,
    }
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<DecisionAPIResponse>> {
  const startTime = performance.now();

  try {
    const body = await request.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error,
          errorCode: validation.code,
          processingTimeMs: Math.round(performance.now() - startTime),
        },
        { status: 400 }
      );
    }

    const claimInput: ClaimInput = validation.data;
    const decision = await evaluateClaimDecision(claimInput);

    const processingTimeMs = Math.round(performance.now() - startTime);

    return NextResponse.json({
      success: true,
      decision: {
        id: decision.id,
        outcome: decision.outcome,
        payoutAmountUSD: decision.payoutAmountUSD,
        reasonCodes: decision.reasonCodes,
        productVersion: decision.productVersion,
        productHash: decision.productHash,
        timestamp: decision.timestamp,
      },
      trace: decision.trace.map((step) => ({
        id: step.id,
        rule: step.rule,
        description: step.description,
        result: step.result,
        explanation: step.explanation,
      })),
      flightData: {
        flightNo: decision.flightData.flightNo,
        status: decision.flightData.status,
        delayMinutes: decision.flightData.delayMinutes,
        delayReason: decision.flightData.delayReason,
      },
      processingTimeMs,
    });
  } catch (error) {
    const processingTimeMs = Math.round(performance.now() - startTime);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
        processingTimeMs,
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Decision API',
    version: '1.0.0',
    description: 'Parametric claims decisioning endpoint',
    endpoints: {
      'POST /api/decision': {
        description: 'Submit a claim for decisioning',
        requestBody: {
          bookingRef: 'string - Booking reference',
          flightNo: 'string - Flight number (e.g., BA123)',
          flightDate: 'string - Flight date in YYYY-MM-DD format',
          passengerToken: 'string - Passenger identifier token',
          productId: 'string - Product ID (e.g., prod-eu-delay)',
          productVersion: 'string - Product version (e.g., v1.2)',
          claimDate: 'string (optional) - Claim submission date in YYYY-MM-DD format, defaults to today',
        },
        response: {
          success: 'boolean',
          decision: {
            id: 'string - Decision ID',
            outcome: 'approved | denied',
            payoutAmountUSD: 'number',
            reasonCodes: 'string[]',
            productVersion: 'string',
            productHash: 'string',
            timestamp: 'ISO 8601 timestamp',
          },
          trace: 'Array of evaluation steps',
          flightData: 'Flight status information',
          processingTimeMs: 'number',
        },
      },
    },
    exampleRequest: {
      bookingRef: 'BK-12345',
      flightNo: 'BA123',
      flightDate: '2024-12-20',
      passengerToken: 'pax-abc123',
      productId: 'prod-eu-delay',
      productVersion: 'v1.2',
    },
  });
}
