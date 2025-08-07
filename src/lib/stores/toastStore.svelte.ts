import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: number;
    type: ToastType;
    message: string;
    operationHash?: string;
}

function createToastStore() {
    const { subscribe, update } = writable<Toast[]>([]);
    let nextId = 0;

    return {
        subscribe,
        add: (type: ToastType, message: string, operationHash?: string) => {
            const id = nextId++;
            update(toasts => [...toasts, { id, type, message, operationHash }]);
            // Auto remove after 5 seconds
            setTimeout(() => {
                update(toasts => toasts.filter(t => t.id !== id));
            }, 5000);
        },
        remove: (id: number) => {
            update(toasts => toasts.filter(t => t.id !== id));
        }
    };
}

export const toastStore = createToastStore(); 