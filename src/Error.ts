import { log_error } from "Log";

export class TemplaterError extends Error {
    constructor(msg: string, public console_msg?: string) {
        super(msg);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export async function errorWrapper(fn: Function, msg: string): Promise<any> {
    try {
        return await fn();
    } catch (e) {
        if (!(e instanceof TemplaterError)) {
            log_error(new TemplaterError(msg, e.message));
        } else {
            log_error(e);
        }
        return null;
    }
}

export function errorWrapperSync(fn: Function, msg: string): any {
    try {
        return fn();
    } catch (e) {
        log_error(new TemplaterError(msg, e.message));
        return null;
    }
}
