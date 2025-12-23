import { FlightData } from '@/lib/engine/types';

// Mock flight status data for the simulator
// Covers EU, US, and APAC regions with various delay scenarios
export const flightDatabase: Record<string, FlightData> = {
  // ============================================
  // EU FLIGHTS (BA, LH, AF, KL, IB, SK)
  // ============================================

  // Tier 2: 121-240 min delay ($175) - used in tests
  'BA123-2024-12-20': {
    flightNo: 'BA123',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T14:00:00Z',
    actualArrival: '2024-12-20T16:30:00Z',
    delayMinutes: 150,
    delayReason: 'operational',
    status: 'delayed',
  },
  'AF101-2024-12-21': {
    flightNo: 'AF101',
    flightDate: '2024-12-21',
    scheduledArrival: '2024-12-21T10:00:00Z',
    actualArrival: '2024-12-21T11:45:00Z',
    delayMinutes: 105,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 3: 241-480 min delay ($350) - used in tests
  'LH456-2024-12-20': {
    flightNo: 'LH456',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T09:00:00Z',
    actualArrival: '2024-12-20T15:30:00Z',
    delayMinutes: 390,
    delayReason: 'operational',
    status: 'delayed',
  },
  'KL205-2024-12-21': {
    flightNo: 'KL205',
    flightDate: '2024-12-21',
    scheduledArrival: '2024-12-21T16:00:00Z',
    actualArrival: '2024-12-21T19:40:00Z',
    delayMinutes: 220,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 3: 241-480 min delay ($350)
  'IB302-2024-12-19': {
    flightNo: 'IB302',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T14:00:00Z',
    actualArrival: '2024-12-19T19:00:00Z',
    delayMinutes: 300,
    delayReason: 'operational',
    status: 'delayed',
  },
  'SK600-2024-12-22': {
    flightNo: 'SK600',
    flightDate: '2024-12-22',
    scheduledArrival: '2024-12-22T08:00:00Z',
    actualArrival: '2024-12-22T15:00:00Z',
    delayMinutes: 420,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 4: 481+ min delay ($600)
  'BA789-2024-12-18': {
    flightNo: 'BA789',
    flightDate: '2024-12-18',
    scheduledArrival: '2024-12-18T22:00:00Z',
    actualArrival: '2024-12-19T08:30:00Z',
    delayMinutes: 630,
    delayReason: 'operational',
    status: 'delayed',
  },

  // ============================================
  // US FLIGHTS (AA, UA, DL, JB, WN)
  // ============================================

  // Tier 1
  'AA100-2024-12-20': {
    flightNo: 'AA100',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T18:00:00Z',
    actualArrival: '2024-12-20T19:10:00Z',
    delayMinutes: 70,
    delayReason: 'operational',
    status: 'delayed',
  },
  'JB524-2024-12-21': {
    flightNo: 'JB524',
    flightDate: '2024-12-21',
    scheduledArrival: '2024-12-21T12:00:00Z',
    actualArrival: '2024-12-21T13:50:00Z',
    delayMinutes: 110,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 2
  'UA200-2024-12-19': {
    flightNo: 'UA200',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T15:00:00Z',
    actualArrival: '2024-12-19T18:00:00Z',
    delayMinutes: 180,
    delayReason: 'operational',
    status: 'delayed',
  },
  'DL450-2024-12-22': {
    flightNo: 'DL450',
    flightDate: '2024-12-22',
    scheduledArrival: '2024-12-22T20:00:00Z',
    actualArrival: '2024-12-22T23:30:00Z',
    delayMinutes: 210,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 3
  'WN333-2024-12-20': {
    flightNo: 'WN333',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T10:00:00Z',
    actualArrival: '2024-12-20T15:30:00Z',
    delayMinutes: 330,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 4
  'UA100-2024-12-18': {
    flightNo: 'UA100',
    flightDate: '2024-12-18',
    scheduledArrival: '2024-12-18T22:00:00Z',
    actualArrival: '2024-12-19T08:00:00Z',
    delayMinutes: 600,
    delayReason: 'operational',
    status: 'delayed',
  },

  // ============================================
  // APAC FLIGHTS (SQ, CX, QF, JL, NH)
  // ============================================

  // Tier 1
  'SQ321-2024-12-21': {
    flightNo: 'SQ321',
    flightDate: '2024-12-21',
    scheduledArrival: '2024-12-21T06:00:00Z',
    actualArrival: '2024-12-21T07:30:00Z',
    delayMinutes: 90,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 2
  'CX888-2024-12-20': {
    flightNo: 'CX888',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T23:00:00Z',
    actualArrival: '2024-12-21T01:15:00Z',
    delayMinutes: 135,
    delayReason: 'operational',
    status: 'delayed',
  },
  'JL005-2024-12-22': {
    flightNo: 'JL005',
    flightDate: '2024-12-22',
    scheduledArrival: '2024-12-22T14:00:00Z',
    actualArrival: '2024-12-22T17:20:00Z',
    delayMinutes: 200,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 3
  'QF001-2024-12-19': {
    flightNo: 'QF001',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T05:00:00Z',
    actualArrival: '2024-12-19T11:30:00Z',
    delayMinutes: 390,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Tier 4
  'NH102-2024-12-18': {
    flightNo: 'NH102',
    flightDate: '2024-12-18',
    scheduledArrival: '2024-12-18T09:00:00Z',
    actualArrival: '2024-12-18T18:30:00Z',
    delayMinutes: 570,
    delayReason: 'operational',
    status: 'delayed',
  },

  // ============================================
  // SPECIAL SCENARIOS
  // ============================================

  // Weather delay (may or may not be excluded depending on product config)
  'AA200-2024-12-20': {
    flightNo: 'AA200',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T16:00:00Z',
    actualArrival: '2024-12-20T20:00:00Z',
    delayMinutes: 240,
    delayReason: 'weather',
    status: 'delayed',
  },

  // Force majeure (typically excluded)
  'DL300-2024-12-19': {
    flightNo: 'DL300',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T12:00:00Z',
    actualArrival: '2024-12-19T18:00:00Z',
    delayMinutes: 360,
    delayReason: 'force_majeure',
    status: 'delayed',
  },

  // Crew strike (typically excluded)
  'IB400-2024-12-18': {
    flightNo: 'IB400',
    flightDate: '2024-12-18',
    scheduledArrival: '2024-12-18T10:00:00Z',
    actualArrival: '2024-12-18T16:00:00Z',
    delayMinutes: 360,
    delayReason: 'crew_strike',
    status: 'delayed',
  },

  // On-time flights (no payout)
  'KL500-2024-12-20': {
    flightNo: 'KL500',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T11:00:00Z',
    actualArrival: '2024-12-20T10:55:00Z',
    delayMinutes: 0,
    delayReason: 'none',
    status: 'on_time',
  },
  'SQ100-2024-12-21': {
    flightNo: 'SQ100',
    flightDate: '2024-12-21',
    scheduledArrival: '2024-12-21T19:00:00Z',
    actualArrival: '2024-12-21T19:05:00Z',
    delayMinutes: 5,
    delayReason: 'none',
    status: 'on_time',
  },

  // Minor delay (below threshold - no payout)
  'SK600-2024-12-20': {
    flightNo: 'SK600',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T15:00:00Z',
    actualArrival: '2024-12-20T15:45:00Z',
    delayMinutes: 45,
    delayReason: 'operational',
    status: 'delayed',
  },
  'AF789-2024-12-19': {
    flightNo: 'AF789',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T18:00:00Z',
    actualArrival: '2024-12-19T18:50:00Z',
    delayMinutes: 50,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Cancelled flights
  'EK700-2024-12-19': {
    flightNo: 'EK700',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T20:00:00Z',
    actualArrival: null,
    delayMinutes: 9999,
    delayReason: 'carrier',
    status: 'cancelled',
  },
  'QF050-2024-12-22': {
    flightNo: 'QF050',
    flightDate: '2024-12-22',
    scheduledArrival: '2024-12-22T07:00:00Z',
    actualArrival: null,
    delayMinutes: 9999,
    delayReason: 'operational',
    status: 'cancelled',
  },
};

// Simple deterministic hash function for generating consistent flight data
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Generate deterministic flight data for any flight number + date combination
function generateFlightData(flightNo: string, flightDate: string): FlightData {
  const seed = hashCode(`${flightNo}-${flightDate}`);

  // Use seed to determine flight characteristics deterministically
  const delayProbability = (seed % 100) / 100; // 0-1
  const delayAmount = seed % 720; // 0-720 minutes
  const reasonIndex = seed % 5;

  const delayReasons: Array<FlightData['delayReason']> = [
    'operational',
    'operational',
    'weather',
    'operational',
    'force_majeure',
  ];

  // 70% of flights have some delay, 30% on time
  const hasDelay = delayProbability > 0.3;
  const delayMinutes = hasDelay ? Math.max(30, delayAmount) : 0;
  const delayReason = hasDelay ? delayReasons[reasonIndex] : 'none';

  // Determine status
  let status: FlightData['status'] = 'on_time';
  if (delayMinutes > 0 && delayMinutes < 9999) {
    status = 'delayed';
  } else if (delayProbability > 0.95) {
    status = 'cancelled';
  }

  // Generate scheduled arrival based on date
  const scheduledHour = (seed % 18) + 6; // 6am to midnight
  const scheduledArrival = `${flightDate}T${String(scheduledHour).padStart(2, '0')}:00:00Z`;

  // Calculate actual arrival
  let actualArrival: string | null = null;
  if (status !== 'cancelled') {
    const arrivalDate = new Date(scheduledArrival);
    arrivalDate.setMinutes(arrivalDate.getMinutes() + delayMinutes);
    actualArrival = arrivalDate.toISOString().replace('.000Z', 'Z');
  }

  return {
    flightNo,
    flightDate,
    scheduledArrival,
    actualArrival,
    delayMinutes: status === 'cancelled' ? 9999 : delayMinutes,
    delayReason: status === 'cancelled' ? 'carrier' : delayReason,
    status,
  };
}

export function getFlightData(flightNo: string, flightDate: string): FlightData {
  const key = `${flightNo}-${flightDate}`;
  // Return mock data if available, otherwise generate deterministically
  return flightDatabase[key] || generateFlightData(flightNo, flightDate);
}

export function getAllFlights(): FlightData[] {
  return Object.values(flightDatabase);
}

// Check if flight is from mock database (for testing/debugging)
export function isKnownFlight(flightNo: string, flightDate: string): boolean {
  const key = `${flightNo}-${flightDate}`;
  return key in flightDatabase;
}
