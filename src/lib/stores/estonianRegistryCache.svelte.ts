/**
 * Estonian Registry Cache Store
 * Centralized cache for Estonian Business Registry data with session persistence
 */

interface CompanyData {
    name: string;
    registryCode: string;
    status: string;
    address?: string;
    registryNumber: string;
    success: boolean;
    isMock: boolean;
}

interface CacheEntry {
    data: CompanyData | null;
    loading: boolean;
    error: string | null;
    timestamp: number;
}

interface CacheState {
    [registryNumber: string]: CacheEntry;
}

const CACHE_KEY = 'estonianRegistryCache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// Test registry numbers that should not make API calls
const TEST_REGISTRY_NUMBERS = ['556655', '989898', '1235664', '3636363', '12121212'];

// Mock data for test registry numbers
const TEST_REGISTRY_MOCK_DATA: Record<string, CompanyData> = {
    '556655': {
        name: 'Test Company Alpha Ltd',
        registryCode: '556655',
        status: 'Active',
        address: '1234 Test Street, Tallinn 10115, Estonia',
        registryNumber: '556655',
        success: true,
        isMock: true
    },
    '989898': {
        name: 'Demo Corporation Beta OÜ',
        registryCode: '989898', 
        status: 'Active',
        address: '5678 Demo Avenue, Tartu 50090, Estonia',
        registryNumber: '989898',
        success: true,
        isMock: true
    },
    '1235664': {
        name: 'Sample Business Gamma AS',
        registryCode: '1235664',
        status: 'Active', 
        address: '9012 Sample Road, Pärnu 80010, Estonia',
        registryNumber: '1235664',
        success: true,
        isMock: true
    },
    '3636363': {
        name: 'Mock Enterprise Delta Ltd',
        registryCode: '3636363',
        status: 'Active',
        address: '3456 Mock Boulevard, Narva 20308, Estonia', 
        registryNumber: '3636363',
        success: true,
        isMock: true
    },
    '12121212': {
        name: 'Prototype Company Epsilon OÜ',
        registryCode: '12121212',
        status: 'Active',
        address: '7890 Prototype Lane, Viljandi 71020, Estonia',
        registryNumber: '12121212', 
        success: true,
        isMock: true
    }
};

class EstonianRegistryCacheStore {
    private cache = $state<CacheState>({});
    private pendingRequests = new Map<string, Promise<CompanyData | null>>();

    constructor() {
        // Load from localStorage on initialization
        this.loadFromStorage();
        
        // Clean expired entries on startup
        this.clearExpired();
    }

    /**
     * Check if a registry number is a test registry number
     */
    private isTestRegistryNumber(registryNumber: string): boolean {
        return TEST_REGISTRY_NUMBERS.includes(registryNumber);
    }

    /**
     * Get mock data for test registry numbers
     */
    private getTestMockData(registryNumber: string): CompanyData | null {
        return TEST_REGISTRY_MOCK_DATA[registryNumber] || null;
    }

    /**
     * Get company data from cache or fetch if not available
     */
    async getCompanyData(registryNumber: string): Promise<CompanyData | null> {
        if (!registryNumber) {
            return null;
        }

        // Handle test registry numbers FIRST - return mock data immediately
        if (this.isTestRegistryNumber(registryNumber)) {
            // Check if we already have cached mock data
            const cacheEntry = this.cache[registryNumber];
            if (cacheEntry && !this.isExpired(cacheEntry) && cacheEntry.data) {
                return cacheEntry.data;
            }

            // Get mock data and cache it
            const mockData = this.getTestMockData(registryNumber);
            if (mockData) {
                const cacheEntry: CacheEntry = {
                    data: mockData,
                    loading: false,
                    error: null,
                    timestamp: Date.now()
                };
                this.cache[registryNumber] = cacheEntry;
                this.saveToStorage();
                console.log('Returning mock data for test registry number:', registryNumber, mockData);
                return mockData;
            }
        }

        // For non-test registry numbers, validate 8-character length requirement
        if (registryNumber.length !== 8) {
            return null;
        }

        // Check if we have valid cached data
        const cacheEntry = this.cache[registryNumber];
        if (cacheEntry && !this.isExpired(cacheEntry) && cacheEntry.data) {
            return cacheEntry.data;
        }

        // If there's already a pending request, wait for it
        if (this.pendingRequests.has(registryNumber)) {
            return await this.pendingRequests.get(registryNumber)!;
        }

        // Create and store the fetch promise
        const fetchPromise = this.fetchCompanyData(registryNumber);
        this.pendingRequests.set(registryNumber, fetchPromise);

        try {
            const result = await fetchPromise;
            return result;
        } finally {
            // Clean up the pending request
            this.pendingRequests.delete(registryNumber);
        }
    }

    /**
     * Get current cache entry for a registry number (for loading/error states)
     */
    getCacheEntry(registryNumber: string): CacheEntry | undefined {
        return this.cache[registryNumber];
    }

    /**
     * Check if a registry number is currently being loaded
     */
    isLoading(registryNumber: string): boolean {
        return this.pendingRequests.has(registryNumber) || this.cache[registryNumber]?.loading === true;
    }

    /**
     * Check if we should fetch company name for a registry number
     * Returns true for test registry numbers OR real 8-character registry numbers
     */
    shouldFetchCompanyName(registryNumber: string): boolean {
        return this.isTestRegistryNumber(registryNumber) || registryNumber.length === 8;
    }

    /**
     * Fetch company data from API and cache the result
     */
    private async fetchCompanyData(registryNumber: string): Promise<CompanyData | null> {
        // Set loading state
        this.cache[registryNumber] = {
            data: this.cache[registryNumber]?.data || null,
            loading: true,
            error: null,
            timestamp: Date.now()
        };

        try {
            console.log('Fetching company data from API for registry number:', registryNumber);
            
            const response = await fetch(`/api/registry/${registryNumber}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            if (!data.success) {
                throw new Error(data.error || 'Company not found');
            }

            // Cache successful result
            const cacheEntry: CacheEntry = {
                data: data as CompanyData,
                loading: false,
                error: null,
                timestamp: Date.now()
            };

            this.cache[registryNumber] = cacheEntry;
            this.saveToStorage();

            console.log('Successfully cached company data:', data);
            return data;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch company data';
            console.error(`Failed to fetch company data for ${registryNumber}:`, error);

            // Cache error state
            this.cache[registryNumber] = {
                data: null,
                loading: false,
                error: errorMessage,
                timestamp: Date.now()
            };

            this.saveToStorage();
            return null;
        }
    }

    /**
     * Check if a cache entry is expired
     */
    private isExpired(entry: CacheEntry): boolean {
        return Date.now() - entry.timestamp > CACHE_EXPIRY_MS;
    }

    /**
     * Clear expired entries from cache
     */
    clearExpired(): void {
        const now = Date.now();
        let hasChanges = false;

        for (const [registryNumber, entry] of Object.entries(this.cache)) {
            if (this.isExpired(entry)) {
                delete this.cache[registryNumber];
                hasChanges = true;
            }
        }

        if (hasChanges) {
            this.saveToStorage();
        }
    }

    /**
     * Clear all cache entries
     */
    clearCache(): void {
        this.cache = {};
        this.saveToStorage();
    }

    /**
     * Load cache from localStorage
     */
    private loadFromStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(CACHE_KEY);
            if (stored) {
                const parsedCache = JSON.parse(stored) as CacheState;
                
                // Only load non-expired entries
                for (const [registryNumber, entry] of Object.entries(parsedCache)) {
                    if (!this.isExpired(entry)) {
                        this.cache[registryNumber] = entry;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load cache from localStorage:', error);
            // Clear corrupted cache
            localStorage.removeItem(CACHE_KEY);
        }
    }

    /**
     * Save cache to localStorage
     */
    private saveToStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
        } catch (error) {
            console.error('Failed to save cache to localStorage:', error);
        }
    }

    /**
     * Get cache statistics (for debugging)
     */
    getCacheStats(): { total: number; expired: number; loading: number; errors: number } {
        const entries = Object.values(this.cache);
        return {
            total: entries.length,
            expired: entries.filter(entry => this.isExpired(entry)).length,
            loading: entries.filter(entry => entry.loading).length,
            errors: entries.filter(entry => entry.error !== null).length
        };
    }
}

// Create and export the singleton instance
export const estonianRegistryCache = new EstonianRegistryCacheStore();