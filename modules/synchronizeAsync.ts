export function synchronizeAsync<Args extends any[]>(
    canContinue: () => boolean,
    func: (awaitWrapper: <T extends Promise<any>>(promise: T) => Promise<T>, ...args: Args) => Promise<void>
): (...args: Args) => Promise<void> {
    const awaitWrapper = async <T extends Promise<any>>(promise: T) => {
        const result = await promise;
        if (!canContinue())
            throw new ShouldNotContinueError();
        return result;
    }

    let executing = false;
    return (async (...args) => {
        if (executing) return;

        try {
            executing = true;
            await func(awaitWrapper, ...args);
        } catch (e) {
            if (!(e instanceof ShouldNotContinueError))
                throw e;
        } finally {
            executing = false;
        }
    });
}

export class ShouldNotContinueError extends Error {
    constructor(message = "Execution should not continue") {
        super(message);
        this.name = ShouldNotContinueError.name;
    }
}