// services/stripe.js
// Stripe payment integration

const STRIPE_SECRET_KEY = (process.env.STRIPE_SECRET_KEY || "").trim();
const STRIPE_PUBLISHABLE_KEY = (process.env.STRIPE_PUBLISHABLE_KEY || "").trim();
const STRIPE_BASE_URL = "https://api.stripe.com/v1";

function isStripeConfigured() {
  const hasCredentials = Boolean(STRIPE_SECRET_KEY && STRIPE_PUBLISHABLE_KEY);
  if (!hasCredentials) {
    console.warn("⚠️  Stripe credentials not configured. Check STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env");
  }
  return hasCredentials;
}

async function resolveFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  const { default: nodeFetch } = await import("node-fetch");
  return nodeFetch;
}

/**
 * Create a Stripe Checkout Session
 * @param {Object} params
 * @param {number} params.amount - Amount in smallest currency unit (cents for USD)
 * @param {string} params.currency - Currency code (default: 'usd')
 * @param {string} params.successUrl - URL to redirect after successful payment
 * @param {string} params.cancelUrl - URL to redirect after cancelled payment
 * @param {string} params.referenceId - Reference ID for the order
 * @param {string} params.description - Description of the payment
 * @param {Object} params.metadata - Additional metadata
 */
async function createCheckoutSession({
  amount,
  currency = "usd",
  successUrl,
  cancelUrl,
  referenceId,
  description,
  metadata = {},
}) {
  if (!isStripeConfigured()) {
    throw new Error("Stripe credentials are not configured");
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error("Stripe payment amount must be greater than zero");
  }

  // Convert amount to cents (smallest currency unit)
  // If currency is VND, amount is already in VND (no conversion needed)
  // If currency is USD, amount should be in dollars, convert to cents
  const amountInSmallestUnit = currency.toLowerCase() === "usd" 
    ? Math.round(Number(amount) * 100) 
    : Math.round(Number(amount));

  const fetchFn = await resolveFetch();

  // Prepare form data for Stripe API
  const formData = new URLSearchParams();
  formData.append("mode", "payment");
  formData.append("success_url", successUrl);
  formData.append("cancel_url", cancelUrl);
  formData.append("line_items[0][price_data][currency]", currency.toLowerCase());
  formData.append("line_items[0][price_data][product_data][name]", description || "TravelGo Booking");
  formData.append("line_items[0][price_data][unit_amount]", amountInSmallestUnit.toString());
  formData.append("line_items[0][quantity]", "1");
  formData.append("metadata[reference_id]", referenceId || "");

  // Add custom metadata
  Object.entries(metadata).forEach(([key, value]) => {
    formData.append(`metadata[${key}]`, String(value));
  });

  try {
    const response = await fetchFn(`${STRIPE_BASE_URL}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error?.message ||
        data?.message ||
        "Unable to create Stripe checkout session";
      const error = new Error(message);
      error.response = data;
      error.status = response.status;
      
      console.error("❌ Stripe checkout session creation failed:", {
        error: data?.error,
        status: response.status,
        hint: "Verify STRIPE_SECRET_KEY in .env matches your Stripe account"
      });
      
      throw error;
    }

    return {
      sessionId: data.id,
      url: data.url,
      raw: data,
    };
  } catch (error) {
    if (error.status === 401) {
      console.error("❌ Stripe 401 Unauthorized - Possible causes:");
      console.error("   1. Invalid Secret Key");
      console.error("   2. Secret Key doesn't match your Stripe account");
      console.error("   3. Check Stripe Dashboard: https://dashboard.stripe.com/apikeys");
    }
    throw error;
  }
}

/**
 * Retrieve a Stripe Checkout Session
 */
async function getCheckoutSession(sessionId) {
  if (!isStripeConfigured()) {
    throw new Error("Stripe credentials are not configured");
  }

  const fetchFn = await resolveFetch();

  const response = await fetchFn(`${STRIPE_BASE_URL}/checkout/sessions/${sessionId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || data?.message || "Unable to retrieve Stripe session";
    const error = new Error(message);
    error.response = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

module.exports = {
  createCheckoutSession,
  getCheckoutSession,
  isStripeConfigured,
};

