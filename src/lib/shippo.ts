// Shippo tracking integration
// Sign up at https://goshippo.com → get API key → set SHIPPO_API_KEY in env
// Test token: shippo_test_... (free)

const SHIPPO_KEY = process.env.SHIPPO_API_KEY || "";
const SHIPPO_BASE = "https://api.goshippo.com";

export interface TrackingInfo {
  status: string;           // UNKNOWN, PRE_TRANSIT, TRANSIT, DELIVERED, RETURNED, FAILURE
  statusDate: string;
  eta?: string;
  location?: string;
  history: TrackingEvent[];
  carrierUrl?: string;
}

export interface TrackingEvent {
  date: string;
  status: string;
  location?: string;
  message: string;
}

// Register a tracking number with Shippo
export async function registerTracking(
  carrier: string,
  trackingNumber: string,
  metadata?: string,
): Promise<{ ok: boolean; carrierUrl?: string }> {
  if (!SHIPPO_KEY) {
    const url = getFallbackUrl(carrier, trackingNumber);
    return { ok: true, carrierUrl: url };
  }

  try {
    const res = await fetch(`${SHIPPO_BASE}/tracks`, {
      method: "POST",
      headers: {
        Authorization: `ShippoToken ${SHIPPO_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carrier: carrier.toLowerCase(),
        tracking_number: trackingNumber,
        metadata,
      }),
    });

    if (!res.ok) {
      console.error("[SHIPPO] Register failed:", res.status);
      return { ok: false };
    }

    const data = (await res.json()) as { tracking_status?: { status?: string }; tracking_url_provider?: string };
    return { ok: true, carrierUrl: data?.tracking_url_provider || getFallbackUrl(carrier, trackingNumber) };
  } catch (e) {
    console.error("[SHIPPO] Tracking error:", e);
    return { ok: false };
  }
}

// Get tracking status
export async function getTrackingStatus(
  carrier: string,
  trackingNumber: string,
): Promise<TrackingInfo | null> {
  if (!SHIPPO_KEY) {
    return fallbackTracking(carrier, trackingNumber);
  }

  try {
    const res = await fetch(
      `${SHIPPO_BASE}/tracks/${encodeURIComponent(carrier)}/${encodeURIComponent(trackingNumber)}`,
      {
        headers: { Authorization: `ShippoToken ${SHIPPO_KEY}` },
      },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as {
      tracking_status?: {
        status?: string;
        status_date?: string;
        location?: { city?: string; state?: string };
      };
      eta?: string;
      tracking_history?: Array<{
        status_date?: string;
        status?: string;
        location?: { city?: string; state?: string };
        status_details?: string;
      }>;
      tracking_url_provider?: string;
    };

    return {
      status: mapStatus(data.tracking_status?.status || "UNKNOWN"),
      statusDate: data.tracking_status?.status_date || "",
      eta: data.eta,
      location: data.tracking_status?.location
        ? `${data.tracking_status.location.city}, ${data.tracking_status.location.state}`
        : undefined,
      history: (data.tracking_history || []).map((h) => ({
        date: h.status_date || "",
        status: mapStatus(h.status || "UNKNOWN"),
        location: h.location ? `${h.location.city}, ${h.location.state}` : undefined,
        message: h.status_details || h.status || "",
      })),
      carrierUrl: data.tracking_url_provider || getFallbackUrl(carrier, trackingNumber),
    };
  } catch {
    return null;
  }
}

function mapStatus(s: string): string {
  const m: Record<string, string> = {
    PRE_TRANSIT: "Label Created",
    TRANSIT: "In Transit",
    DELIVERED: "Delivered",
    RETURNED: "Returned",
    FAILURE: "Delivery Failed",
    UNKNOWN: "Status Pending",
  };
  return m[s] || s;
}

function getFallbackUrl(carrier: string, trackingNumber: string): string {
  const urls: Record<string, string> = {
    usps: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    ups: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    dhl: `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${trackingNumber}`,
    shippo: `https://track.goshippo.com/${trackingNumber}`,
  };
  return urls[carrier.toLowerCase()] || `https://track.goshippo.com/${trackingNumber}`;
}

function fallbackTracking(carrier: string, trackingNumber: string): TrackingInfo {
  return {
    status: "Status Pending",
    statusDate: new Date().toISOString(),
    history: [],
    carrierUrl: getFallbackUrl(carrier, trackingNumber),
  };
}
