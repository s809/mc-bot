export function synchronizeAsync<T extends (...args: any[]) => Promise<void>>(func: T): T {
    let executing = false;
    return (async (...args) => {
        if (executing) return;

        try {
            executing = true;
            await func(...args);
        } finally {
            executing = false;
        }
    }) as T;
}