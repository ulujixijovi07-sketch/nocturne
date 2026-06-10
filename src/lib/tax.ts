// TaxJar sales tax calculation (US only)
// Sign up at https://taxjar.com → get API key → set TAXJAR_API_KEY in env

const TAXJAR_KEY = process.env.TAXJAR_API_KEY || "";
const FROM_ZIP = "10001";  // Your business zip
const FROM_STATE = "NY";   // Your business state
const FROM_COUNTRY = "US";

export interface TaxAddress {
  zip: string;
  state: string;
  country: string;
  city?: string;
  street?: string;
}

export interface TaxLineItem {
  id: string;
  quantity: number;
  unitPrice: number;
}

export async function calculateTax(
  to: TaxAddress,
  subtotal: number,
  shipping: number,
  lineItems: TaxLineItem[],
): Promise<{ taxRate: number; taxAmount: number; taxableAmount: number }> {
  // If no TaxJar key or non-US, use simple fallback
  if (!TAXJAR_KEY || to.country !== "US") {
    return simpleTaxFallback(to, subtotal);
  }

  try {
    const res = await fetch("https://api.taxjar.com/v2/taxes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TAXJAR_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from_country: FROM_COUNTRY,
        from_zip: FROM_ZIP,
        from_state: FROM_STATE,
        to_country: to.country,
        to_zip: to.zip,
        to_state: to.state,
        to_city: to.city || "",
        to_street: to.street || "",
        amount: subtotal,
        shipping,
        line_items: lineItems.map((li) => ({
          id: li.id,
          quantity: li.quantity,
          unit_price: li.unitPrice,
          product_tax_code: "20010", // General clothing (taxable)
        })),
      }),
    });

    if (!res.ok) {
      console.error("[TAXJAR] API error:", res.status);
      return simpleTaxFallback(to, subtotal);
    }

    const data = (await res.json()) as { tax: { amount_to_collect: number; taxable_amount: number; rate: number } };
    return {
      taxRate: data.tax.rate,
      taxAmount: data.tax.amount_to_collect,
      taxableAmount: data.tax.taxable_amount,
    };
  } catch (e) {
    console.error("[TAXJAR] Request failed:", e);
    return simpleTaxFallback(to, subtotal);
  }
}

// Simple fallback: only charge tax in specific states
const TAXABLE_STATES: Record<string, number> = {
  NY: 0.08875,
  CA: 0.0850,
  TX: 0.0825,
  FL: 0.0700,
  IL: 0.0875,
  PA: 0.0700,
  OH: 0.0750,
  GA: 0.0700,
  NC: 0.0725,
  MI: 0.0600,
  NJ: 0.0725,
  VA: 0.0630,
  WA: 0.0880,
  MA: 0.0625,
};

function simpleTaxFallback(to: TaxAddress, subtotal: number) {
  const rate = TAXABLE_STATES[to.state?.toUpperCase()] || 0;
  return {
    taxRate: rate,
    taxAmount: Math.round(subtotal * rate * 100) / 100,
    taxableAmount: subtotal,
  };
}
