export type AppErrorType = {
    status: number;
    error: string;
    message: string;
    details: unknown;
};

class AppError extends Error implements AppErrorType {
    status: AppErrorType['status'] = 500;
    error: AppErrorType['error'] = '';
    message: AppErrorType['message'] = '';
    details: AppErrorType['details'] = {};

    constructor({ status, error, message, details }: AppErrorType) {
        super(message);
        this.status = status;
        this.error = error;
        this.details = details;
    }
}

export default AppError;
