/**
 * Alineado a secondra-spec.yaml — enum TrustLevel y UserPublic (campos de confianza).
 */
export type TrustLevel = 'novato' | 'vecinoConfiable' | 'guardianHonor';

export interface UserPublic {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  zipCode: string;
  createdAt: string;
  trustLevel: TrustLevel;
  backingCount: number;
  isIdentityVerified: boolean;
}

export interface GuardianBackingPublic {
  id: string;
  vouchingUserId: string;
  targetGuardianId: string;
  vouchText: string | null;
  createdAt: string;
}

/** GET /users/me/backings — secondra-spec GuardianBackingReceived */
export interface GuardianBackingReceived {
  id: string;
  vouchingUserId: string;
  targetGuardianId: string;
  vouchText: string | null;
  createdAt: string;
  vouchingFirstName: string;
  vouchingLastName: string;
  vouchingTrustLevel: TrustLevel;
}
