import type { MessageResponseType, MessageType } from "./types.js";


export interface IGenericMessage<T extends MessageType, Payload> {
  type: T;
  messageId: string;
  timestamp: number;
  payload: Payload;
}

export interface IMessageErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface IBaseMessageResponse<T extends MessageResponseType> {
  type: T;
  messageId: string;
  responseTo: {
    messageId: string;
    type: MessageType;
  }
  timestamp: number;
}

export interface IGenericSuccessMessageResponse<T extends MessageResponseType, Payload> extends IBaseMessageResponse<T> {
  success: true;
  payload: Payload;
}

export interface IGenericErrorMessageResponse<T extends MessageResponseType, E extends IMessageErrorPayload> extends IBaseMessageResponse<T> {
  success: false;
  error: E;
}

export type IGenericMessageResponse<T extends MessageResponseType, Payload> =
  | IGenericSuccessMessageResponse<T, Payload>
  | IGenericErrorMessageResponse<T, IMessageErrorPayload>;

