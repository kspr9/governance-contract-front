import { json } from "@sveltejs/kit";
var define_process_env_default = {};
const GET = async ({ params }) => {
  const { registryNumber } = params;
  if (!registryNumber) {
    return json({ error: "Registry number is required" }, { status: 400 });
  }
  const username = define_process_env_default.ESTONIAN_REGISTRY_USERNAME;
  const password = define_process_env_default.ESTONIAN_REGISTRY_PASSWORD;
  if (!username || !password) {
    return json({ error: "Registry credentials not configured" }, { status: 500 });
  }
  try {
    const soapBody = `<?xml version="1.0" encoding="UTF-8"?>
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                         xmlns:xro="http://x-road.eu/xsd/xroad.xsd" 
                         xmlns:id="http://x-road.eu/xsd/identifiers" 
                         xmlns:item="http://arireg.x-road.eu/producer">
            <soapenv:Header>
                <xro:protocolVersion>4.0</xro:protocolVersion>
                <xro:id>1</xro:id>
                <xro:userId>miracap</xro:userId>
                <xro:client id:objectType="SUBSYSTEM">
                    <id:xRoadInstance>EE</id:xRoadInstance>
                    <id:memberClass>COM</id:memberClass>
                    <id:memberCode>10560025</id:memberCode>
                    <id:subsystemCode>genericconsumer</id:subsystemCode>
                </xro:client>
                <xro:service id:objectType="SERVICE">
                    <id:xRoadInstance>EE</id:xRoadInstance>
                    <id:memberClass>GOV</id:memberClass>
                    <id:memberCode>70000310</id:memberCode>
                    <id:subsystemCode>arireg</id:subsystemCode>
                    <id:serviceCode>detailandmed</id:serviceCode>
                    <id:serviceVersion>v1</id:serviceVersion>
                </xro:service>
            </soapenv:Header>
            <soapenv:Body>
                <item:detailandmed>
                    <item:keha>
                        <item:ettevotja_kood>${registryNumber}</item:ettevotja_kood>
                    </item:keha>
                </item:detailandmed>
            </soapenv:Body>
        </soapenv:Envelope>`;
    const response = await fetch("https://ariregxmlv6.rik.ee/", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "",
        "Authorization": `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`
      },
      body: soapBody
    });
    if (!response.ok) {
      throw new Error(`Registry API request failed: ${response.status}`);
    }
    const xmlResponse = await response.text();
    const nameMatch = xmlResponse.match(/<item:nimi>([^<]+)<\/item:nimi>/);
    const companyName = nameMatch ? nameMatch[1] : null;
    return json({
      registryNumber,
      companyName,
      success: !!companyName
    });
  } catch (error) {
    console.error("Estonian Registry API error:", error);
    return json({
      error: "Failed to fetch company information",
      registryNumber
    }, { status: 500 });
  }
};
export {
  GET
};
