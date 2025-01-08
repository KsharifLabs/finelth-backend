import { AppErrorType } from './AppError';

class NotFoundError extends Error implements AppErrorType {
    status: AppErrorType['status'] = 404;
    error: AppErrorType['error'] = 'NOT_FOUND';
    message: AppErrorType['message'] = '';
    details: AppErrorType['details'] = {};

    constructor({ message, details = {} }: Pick<AppErrorType, 'message' | 'details'>) {
        super(message);
        this.message = message;
        this.details = details;
        this.name = 'NotFoundError';
    }
}

export default NotFoundError;
