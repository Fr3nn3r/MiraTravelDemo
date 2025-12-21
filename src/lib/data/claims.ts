import { ClaimInput } from '@/lib/engine/types';

// Sample claims for quick testing in the simulator
export const sampleClaims: ClaimInput[] = [
  {
    bookingRef: 'BK-2024-001',
    flightNo: 'BA123',
    flightDate: '2024-12-20',
    passengerToken: 'PAX-A1B2C3',
    productId: 'prod-eu-delay',
    productVersion: 'v1.2',
  },
  {
    bookingRef: 'BK-2024-002',
    flightNo: 'LH456',
    flightDate: '2024-12-20',
    passengerToken: 'PAX-D4E5F6',
    productId: 'prod-eu-delay',
    productVersion: 'v1.2',
  },
  {
    bookingRef: 'BK-2024-003',
    flightNo: 'AF789',
    flightDate: '2024-12-19',
    passengerToken: 'PAX-G7H8I9',
    productId: 'prod-eu-delay',
    productVersion: 'v1.2',
  },
  {
    bookingRef: 'BK-2024-004',
    flightNo: 'UA100',
    flightDate: '2024-12-18',
    passengerToken: 'PAX-J0K1L2',
    productId: 'prod-us-delay',
    productVersion: 'v1.0',
  },
  {
    bookingRef: 'BK-2024-005',
    flightNo: 'AA200',
    flightDate: '2024-12-20',
    passengerToken: 'PAX-M3N4O5',
    productId: 'prod-us-delay',
    productVersion: 'v1.0',
  },
  {
    bookingRef: 'BK-2024-006',
    flightNo: 'DL300',
    flightDate: '2024-12-19',
    passengerToken: 'PAX-P6Q7R8',
    productId: 'prod-eu-delay',
    productVersion: 'v1.2',
  },
  {
    bookingRef: 'BK-2024-007',
    flightNo: 'KL500',
    flightDate: '2024-12-20',
    passengerToken: 'PAX-S9T0U1',
    productId: 'prod-eu-delay',
    productVersion: 'v1.2',
  },
  {
    bookingRef: 'BK-2024-008',
    flightNo: 'SK600',
    flightDate: '2024-12-20',
    passengerToken: 'PAX-V2W3X4',
    productId: 'prod-eu-delay',
    productVersion: 'v1.2',
  },
];

export function getSampleClaims(): ClaimInput[] {
  return sampleClaims;
}

export function getSampleClaimByBookingRef(bookingRef: string): ClaimInput | undefined {
  return sampleClaims.find((c) => c.bookingRef === bookingRef);
}
