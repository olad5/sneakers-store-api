import {CustomAPIError} from './custom-api.js';

export class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}


