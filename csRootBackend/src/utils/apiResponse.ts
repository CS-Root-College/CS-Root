class apiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;

  constructor(
    statusCode: number,
    message: string = "Success",
    data: T | null = null
  ) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}

export default apiResponse;