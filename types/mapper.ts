export interface MapperProfile {
  id: string;
  alias: string;
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  nationality: string;
  mobility: string;
  zone: string;
  bankName: string;
  accountNumber: string;
  trustScore: number;
  score: number;
  rank: string;
  balance: number;
  history: any[];
}

export interface LoginRequest {
  alias: string;
  passkey: string;
}
