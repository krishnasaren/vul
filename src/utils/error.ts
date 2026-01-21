export enum BridgeErrorType {
  Unauthorized,
  NotFound,
  BadRequest,
  InternalServerError,
  Unknown,
}

export interface BridgeError {
  type: BridgeErrorType;
  message: string;
}
