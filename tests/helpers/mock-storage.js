export class MockStorage {
    constructor() {
        this.store = new Map();
    }
    
    getItem(key) {
        return this.store.get(key) || null;
    }
    
    setItem(key, value) {
        this.store.set(key, String(value));
    }
    
    removeItem(key) {
        this.store.delete(key);
    }
    
    clear() {
        this.store.clear();
    }
}

export function setupMockStorage() {
    const mockStorage = new MockStorage();
    
    if (typeof global !== 'undefined') {
        global.localStorage = mockStorage;
    }
    if (typeof window !== 'undefined') {
        window.localStorage = mockStorage;
    }
    
    return mockStorage;
}
