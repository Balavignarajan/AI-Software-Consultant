export type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
  timestamp: string;
};

export type ErrorResponse = {
  success: false;
  message: string;
  errors: unknown[];
  timestamp: string;
};

export function successResponse<T>(
  message: string,
  data: T,
): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  message: string,
  errors: unknown[] = [],
): ErrorResponse {
  return {
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
}
