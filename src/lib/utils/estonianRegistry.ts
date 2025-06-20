/**
 * Utility functions for interacting with the Estonian Business Registry API
 */

interface CompanyData {
    name: string;
    registryCode: string;
    status: string;
    address?: string;
}

interface EstonianRegistryAddress {
    aadress_ads__ads_normaliseeritud_taisaadress?: string;
    asukoht_ettevotja_aadressis?: string;
}

interface EstonianRegistryItem {
    ariregistri_kood: number;
    staatus: string;
    staatus_tekstina: string;
    evnimi: string;
    evaadressid: EstonianRegistryAddress;
}

interface EstonianRegistryResponse {
    keha: {
        ettevotjad: {
            item: EstonianRegistryItem[];
        };
        leitud_ettevotjate_arv: number;
    };
    paring: {
        ariregistri_kood: number;
        ariregister_parool: string;
        ariregister_kasutajanimi: string;
        ariregister_valjundi_formaat: string;
    };
}

export async function fetchCompanyData(
    registryCode: string,
    username: string,
    password: string
): Promise<CompanyData | null> {
    try {
        console.log('Fetching company data for registry code:', registryCode);
        
        // Construct SOAP request
        const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:iden="http://x-road.eu/xsd/identifiers" xmlns:prod="http://arireg.x-road.eu/producer/" xmlns:xro="http://x-road.eu/xsd/xroad.xsd">
    <soapenv:Body>
        <prod:lihtandmed_v2>
            <prod:language>eng</prod:language> 
            <prod:keha>
                <prod:ariregister_kasutajanimi>${username}</prod:ariregister_kasutajanimi>
                <prod:ariregister_parool>${password}</prod:ariregister_parool>
                <prod:ariregistri_kood>${registryCode}</prod:ariregistri_kood>
                <prod:ariregister_valjundi_formaat>json</prod:ariregister_valjundi_formaat>
            </prod:keha>
        </prod:lihtandmed_v2>
    </soapenv:Body>
</soapenv:Envelope>`;

        console.log('Making API request to Estonian Business Registry...');

        const response = await fetch('https://ariregxmlv6.rik.ee/', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
                'SOAPAction': ''
            },
            body: soapRequest
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseText = await response.text();
        //console.log('Raw Response:', responseText);
        
        // Parse the JSON response
        const jsonMatch = responseText.match(/\{"keha":.*\}/s);
        if (!jsonMatch) {
            console.error('Could not find JSON data in response');
            return null;
        }

        const jsonData = JSON.parse(jsonMatch[0]) as EstonianRegistryResponse;
        console.log('Parsed JSON data:', jsonData);

        if (!jsonData.keha?.ettevotjad?.item?.[0]) {
            console.log('No company data found in response');
            return null;
        }

        const companyData = jsonData.keha.ettevotjad.item[0];
        console.log('Company data:', companyData);

        return {
            name: companyData.evnimi,
            registryCode: companyData.ariregistri_kood.toString(),
            status: companyData.staatus_tekstina,
            address: companyData.evaadressid?.aadress_ads__ads_normaliseeritud_taisaadress
        };
    } catch (error) {
        console.error('Failed to fetch company data:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
        return null;
    }
} 