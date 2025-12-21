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
}

function validateRequest(body: unknown): { valid: true; data: DecisionAPIRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be a JSON object' };
  }

  const data = body as Record<string, unknown>;
  const requiredFields = ['bookingRef', 'flightNo', 'flightDate', 'passengerToken', 'productId', 'productVersion'];

  for (const field of requiredFields) {
    if (!data[field] || typeof data[field] !== 'string') {
      return { valid: false, error: `Missing or invalid required field: ${field}` };
    }
  }

  // Validate flight date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.flightDate as string)) {
    return { valid: false, error: 'flightDate must be in YYYY-MM-DD format' };
  }

  return {
    valid: true,
    data: {
      bookingRef: data.bookingRef as string,
      flightNo: data.flightNo as string,
      flightDate: data.flightDate as string,
      passengerToken: data.passengerToken as string,
      productId: data.productId as string,
      productVersion: data.productVersion as string,
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
          processingTimeMs: Math.round(performance.now() - startTime),
        },
        { status: 400 }
      );
    }

    const claimInput: ClaimInput = validation.data;
    const decision = evaluateClaimDecision(claimInput);

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
