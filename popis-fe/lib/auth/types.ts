export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isStudent?: boolean;
};

export type SignInPayload = { email: string; password: string };
export type SignUpPayload = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  isUnder18?: boolean;
};

