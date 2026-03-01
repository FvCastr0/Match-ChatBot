class Mutex {
    private queue: Array<() => void> = [];
    private locked = false;

    async lock(): Promise<void> {
        if (this.locked) {
            await new Promise<void>((resolve) => this.queue.push(resolve));
        }
        this.locked = true;
    }

    unlock(): void {
        if (this.queue.length > 0) {
            const next = this.queue.shift();
            if (next) next();
        } else {
            this.locked = false;
        }
    }

    isLocked(): boolean {
        return this.locked;
    }
}

const customerLocks = new Map<string, Mutex>();

export async function executeWithLock<T>(
    customerId: string,
    fn: () => Promise<T>
): Promise<T> {
    let mutex = customerLocks.get(customerId);
    if (!mutex) {
        mutex = new Mutex();
        customerLocks.set(customerId, mutex);
    }

    await mutex.lock();
    try {
        return await fn();
    } finally {
        mutex.unlock();
        // Limpeza de memória: se a fila do mutex acabou nós o deletamos
        if (!mutex.isLocked()) {
            customerLocks.delete(customerId);
        }
    }
}
