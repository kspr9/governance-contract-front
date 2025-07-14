import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
    const { address } = params;
    const limit = url.searchParams.get('limit') || '10';
    const offset = url.searchParams.get('offset') || '0';
    
    if (!address) {
        return json({ error: 'Contract address is required' }, { status: 400 });
    }

    try {
        // Use TzKT API to fetch contract operations
        const response = await fetch(
            `https://api.mainnet.tzkt.io/v1/contracts/${address}/operations` +
            `?limit=${limit}&offset=${offset}&sort.desc=level`
        );
        
        if (!response.ok) {
            throw new Error(`TzKT API request failed: ${response.status}`);
        }

        const operations = await response.json();
        
        return json({ 
            address,
            operations,
            success: true
        });

    } catch (error) {
        console.error('TzKT API error:', error);
        return json({ 
            error: 'Failed to fetch contract operations',
            address
        }, { status: 500 });
    }
};