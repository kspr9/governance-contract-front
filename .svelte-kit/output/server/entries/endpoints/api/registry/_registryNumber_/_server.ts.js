import { json } from "@sveltejs/kit";
const ESTONIAN_REGISTRY_USERNAME = "kaspar.pae";
const ESTONIAN_REGISTRY_PASSWORD = "Unfounded8-Spyglass4-Dyslexia9-Yo-yo8-Reverse4";
const GET = async ({ params }) => {
  const { registryNumber } = params;
  if (!registryNumber) {
    return json({ error: "Registry number is required" }, { status: 400 });
  }
  const username = ESTONIAN_REGISTRY_USERNAME;
  const password = ESTONIAN_REGISTRY_PASSWORD;
  try {
    console.log("Fetching company data for registry number:", registryNumber);
    const soapRequest = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:iden="http://x-road.eu/xsd/identifiers" xmlns:prod="http://arireg.x-road.eu/producer/" xmlns:xro="http://x-road.eu/xsd/xroad.xsd">
    <soapenv:Body>
        <prod:lihtandmed_v2>
            <prod:language>eng</prod:language> 
            <prod:keha>
                <prod:ariregister_kasutajanimi>${username}</prod:ariregister_kasutajanimi>
                <prod:ariregister_parool>${password}</prod:ariregister_parool>
                <prod:ariregistri_kood>${registryNumber}</prod:ariregistri_kood>
                <prod:ariregister_valjundi_formaat>json</prod:ariregister_valjundi_formaat>
            </prod:keha>
        </prod:lihtandmed_v2>
    </soapenv:Body>
</soapenv:Envelope>`;
    console.log("Making API request to Estonian Business Registry...");
    const response = await fetch("https://ariregxmlv6.rik.ee/", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        "SOAPAction": ""
      },
      body: soapRequest
    });
    console.log("Response status:", response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseText = await response.text();
    const jsonMatch = responseText.match(/\{"keha":.*\}/s);
    if (!jsonMatch) {
      console.error("Could not find JSON data in response");
      return json({
        error: "Invalid response format",
        registryNumber,
        success: false
      }, { status: 500 });
    }
    const jsonData = JSON.parse(jsonMatch[0]);
    console.log("Parsed JSON data:", jsonData);
    if (!jsonData.keha?.ettevotjad?.item?.[0]) {
      console.log("No company data found in response");
      return json({
        error: "Company not found",
        registryNumber,
        success: false
      }, { status: 404 });
    }
    const companyData = jsonData.keha.ettevotjad.item[0];
    console.log("Company data:", companyData);
    return json({
      name: companyData.evnimi,
      registryCode: companyData.ariregistri_kood.toString(),
      status: companyData.staatus_tekstina,
      address: companyData.evaadressid?.aadress_ads__ads_normaliseeritud_taisaadress,
      registryNumber,
      success: true,
      isMock: false
    });
  } catch (error) {
    console.error("Failed to fetch company data:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace available");
    return json({
      error: "Failed to fetch company information",
      registryNumber,
      success: false
    }, { status: 500 });
  }
};
export {
  GET
};
