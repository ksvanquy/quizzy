import { DomainError } from './domain-error';
import { HTTP_STATUS } from '../../../constants/http-status';

export class NotFoundError extends DomainError {
  code = 'NOT_FOUND';
  statusCode = HTTP_STATUS.NOT_FOUND;

  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
