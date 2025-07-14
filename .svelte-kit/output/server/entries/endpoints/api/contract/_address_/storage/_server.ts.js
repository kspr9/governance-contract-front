import { json } from "@sveltejs/kit";
const GET = async ({ params }) => {
  const { address } = params;
  if (!address) {
    return json({ error: "Contract address is required" }, { status: 400 });
  }
  try {
    const response = await fetch(`https://api.mainnet.tzkt.io/v1/contracts/${address}/storage`);
    if (!response.ok) {
      throw new Error(`TzKT API request failed: ${response.status}`);
    }
    const storage = await response.json();
    return json({
      address,
      storage,
      success: true
    });
  } catch (error) {
    console.error("TzKT API error:", error);
    return json({
      error: "Failed to fetch contract storage",
      address
    }, { status: 500 });
  }
};
export {
  GET
};
