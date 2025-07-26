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

class EstonianRegistryCacheStore {
    private cache = $state<CacheState>({});

    constructor() {
        // Load from localStorage on initialization
        this.loadFromStorage();
        
        // Clean expired entries on startup
        this.clearExpired();
    }

    /**
     * Get company data from cache or fetch if not available
     */
    async getCompanyData(registryNumber: string): Promise<CompanyData | null> {
        if (!registryNumber || registryNumber.length !== 8) {
            return null;
        }

        // Check if we have valid cached data
        const cacheEntry = this.cache[registryNumber];
        if (cacheEntry && !this.isExpired(cacheEntry) && cacheEntry.data) {
            return cacheEntry.data;
        }

        // Don't fetch if already loading
        if (cacheEntry?.loading) {
            return cacheEntry.data;
        }

        // Fetch data
        return await this.fetchCompanyData(registryNumber);
    }

    /**
     * Get current cache entry for a registry number (for loading/error states)
     */
    getCacheEntry(registryNumber: string): CacheEntry | undefined {
        return this.cache[registryNumber];
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