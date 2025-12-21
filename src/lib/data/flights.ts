import { FlightData } from '@/lib/engine/types';

// Mock flight status data for the simulator
export const flightDatabase: Record<string, FlightData> = {
  // Delayed flights - various tiers
  'BA123-2024-12-20': {
    flightNo: 'BA123',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T14:00:00Z',
    actualArrival: '2024-12-20T16:30:00Z',
    delayMinutes: 150,
    delayReason: 'operational',
    status: 'delayed',
  },
  'LH456-2024-12-20': {
    flightNo: 'LH456',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T09:00:00Z',
    actualArrival: '2024-12-20T15:30:00Z',
    delayMinutes: 390,
    delayReason: 'operational',
    status: 'delayed',
  },
  'AF789-2024-12-19': {
    flightNo: 'AF789',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T18:00:00Z',
    actualArrival: '2024-12-19T19:15:00Z',
    delayMinutes: 75,
    delayReason: 'operational',
    status: 'delayed',
  },
  'UA100-2024-12-18': {
    flightNo: 'UA100',
    flightDate: '2024-12-18',
    scheduledArrival: '2024-12-18T22:00:00Z',
    actualArrival: '2024-12-19T08:00:00Z',
    delayMinutes: 600,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Weather-related delay (potential exclusion)
  'AA200-2024-12-20': {
    flightNo: 'AA200',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T16:00:00Z',
    actualArrival: '2024-12-20T20:00:00Z',
    delayMinutes: 240,
    delayReason: 'weather',
    status: 'delayed',
  },

  // Force majeure (excluded)
  'DL300-2024-12-19': {
    flightNo: 'DL300',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T12:00:00Z',
    actualArrival: '2024-12-19T18:00:00Z',
    delayMinutes: 360,
    delayReason: 'force_majeure',
    status: 'delayed',
  },

  // Crew strike (excluded)
  'IB400-2024-12-18': {
    flightNo: 'IB400',
    flightDate: '2024-12-18',
    scheduledArrival: '2024-12-18T10:00:00Z',
    actualArrival: '2024-12-18T16:00:00Z',
    delayMinutes: 360,
    delayReason: 'crew_strike',
    status: 'delayed',
  },

  // On-time flight (no payout)
  'KL500-2024-12-20': {
    flightNo: 'KL500',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T11:00:00Z',
    actualArrival: '2024-12-20T10:55:00Z',
    delayMinutes: 0,
    delayReason: 'none',
    status: 'on_time',
  },

  // Minor delay (below threshold)
  'SK600-2024-12-20': {
    flightNo: 'SK600',
    flightDate: '2024-12-20',
    scheduledArrival: '2024-12-20T15:00:00Z',
    actualArrival: '2024-12-20T15:45:00Z',
    delayMinutes: 45,
    delayReason: 'operational',
    status: 'delayed',
  },

  // Cancelled flight
  'EK700-2024-12-19': {
    flightNo: 'EK700',
    flightDate: '2024-12-19',
    scheduledArrival: '2024-12-19T20:00:00Z',
    actualArrival: null,
    delayMinutes: 9999,
    delayReason: 'carrier',
    status: 'cancelled',
  },
};

export function getFlightData(flightNo: string, flightDate: string): FlightData | null {
  const key = `${flightNo}-${flightDate}`;
  return flightDatabase[key] || null;
}

export function getAllFlights(): FlightData[] {
  return Object.values(flightDatabase);
}
