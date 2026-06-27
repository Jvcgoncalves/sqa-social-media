export type TestUser = {
  email: string;
  password: string;
};

export type AuthResponse = {
  id: number;
  email: string;
};

export type ErrorResponse = {
  message: string;
  status: number;
};
