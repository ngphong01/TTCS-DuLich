const base64 = (value) => Buffer.from(value).toString("base64");

// Trim and validate PayPal credentials
const PAYPAL_CLIENT_ID = (process.env.PAYPAL_CLIENT_ID || "").trim();
const PAYPAL_SECRET = (process.env.PAYPAL_SECRET || "").trim();
const PAYPAL_BASE_URL =
  (process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com").trim();
const PAYPAL_RETURN_URL =
  (process.env.PAYPAL_RETURN_URL ||
  `${process.env.FRONTEND_URL || "http://localhost:3001"}/checkout/paypal/success`).trim();
const PAYPAL_CANCEL_URL =
  (process.env.PAYPAL_CANCEL_URL ||
  `${process.env.FRONTEND_URL || "http://localhost:3001"}/checkout/paypal/cancel`).trim();
const PAYPAL_BRAND_NAME = (process.env.PAYPAL_BRAND_NAME || "TravelGo").trim();

function isPaypalConfigured() {
  const hasCredentials = Boolean(PAYPAL_CLIENT_ID && PAYPAL_SECRET);
  if (!hasCredentials) {
    console.warn("⚠️  PayPal credentials not configured. Check PAYPAL_CLIENT_ID and PAYPAL_SECRET in .env");
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

async function getAccessToken() {
  if (!isPaypalConfigured()) {
    throw new Error("PayPal credentials are not configured");
  }

  // Validate credentials format
  if (PAYPAL_CLIENT_ID.length < 10 || PAYPAL_SECRET.length < 10) {
    throw new Error("PayPal credentials appear to be invalid (too short)");
  }

  const fetchFn = await resolveFetch();
  
  // Build auth header with trimmed credentials
  const credentials = `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`;
  const authHeader = `Basic ${base64(credentials)}`;
  
  const tokenUrl = `${PAYPAL_BASE_URL}/v1/oauth2/token`;
  
  console.log("🔍 Attempting PayPal authentication...");
  console.log("   URL:", tokenUrl);
  console.log("   Client ID (first 10 chars):", PAYPAL_CLIENT_ID.substring(0, 10) + "...");
  console.log("   Client ID length:", PAYPAL_CLIENT_ID.length);
  console.log("   Secret length:", PAYPAL_SECRET.length);

  try {
    const response = await fetchFn(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();

    if (!response.ok) {
      const message =
        data?.error_description || data?.error || "Unable to obtain PayPal token";
      const error = new Error(message);
      error.response = data;
      error.status = response.status;
      
      // Log helpful debugging info (without exposing secrets)
      console.error("❌ PayPal authentication failed:", {
        error: data?.error,
        error_description: data?.error_description,
        status: response.status,
        baseUrl: PAYPAL_BASE_URL,
        clientIdLength: PAYPAL_CLIENT_ID.length,
        secretLength: PAYPAL_SECRET.length,
        clientIdPrefix: PAYPAL_CLIENT_ID.substring(0, 15) + "...",
        hint: "Verify PAYPAL_CLIENT_ID and PAYPAL_SECRET in .env match your PayPal app credentials"
      });
      
      // Additional diagnostic info
      if (data?.error === 'invalid_client') {
        console.error("\n🔧 TROUBLESHOOTING TIPS:");
        console.error("   1. Go to https://developer.paypal.com/dashboard/applications/sandbox");
        console.error("   2. Check if your app exists and is active");
        console.error("   3. Verify Client ID matches exactly (no extra spaces)");
        console.error("   4. Click 'Show' next to Secret and copy the NEW secret");
        console.error("   5. Make sure you're using SANDBOX credentials with sandbox URL");
        console.error("   6. If credentials are old, they may have expired - generate new ones");
        console.error("   7. Restart your server after updating .env file");
      }
      
      throw error;
    }

    console.log("✅ PayPal authentication successful!");
    return data.access_token;
  } catch (error) {
    if (error.status === 401 || error.message?.includes('invalid_client')) {
      console.error("\n❌ PayPal 401 Unauthorized - Detailed Analysis:");
      console.error("   Error:", error.message);
      console.error("   Status:", error.status);
      console.error("   Response:", JSON.stringify(error.response, null, 2));
      console.error("\n💡 COMMON FIXES:");
      console.error("   1. Regenerate credentials in PayPal Developer Dashboard");
      console.error("   2. Ensure no extra spaces in .env file");
      console.error("   3. Verify sandbox credentials with sandbox URL");
      console.error("   4. Check if app is active in PayPal dashboard");
      console.error("   5. Try creating a NEW app in PayPal dashboard");
    }
    throw error;
  }
}

async function createOrder({
  amount,
  currency = process.env.PAYPAL_CURRENCY || "USD",
  referenceId,
  description,
  returnUrl = PAYPAL_RETURN_URL,
  cancelUrl = PAYPAL_CANCEL_URL,
}) {
  if (!amount || Number(amount) <= 0) {
    throw new Error("PayPal order amount must be greater than zero");
  }

  const fetchFn = await resolveFetch();
  const accessToken = await getAccessToken();

  const response = await fetchFn(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          amount: {
            currency_code: currency,
            value: Number(amount).toFixed(2),
          },
          description,
        },
      ],
      application_context: {
        brand_name: PAYPAL_BRAND_NAME,
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.details?.[0]?.description ||
      data?.details?.[0]?.issue ||
      data?.message ||
      "Unable to create PayPal order";
    const error = new Error(message);
    error.response = data;
    error.status = response.status;
    throw error;
  }

  const approveLink = data?.links?.find((link) => link.rel === "approve")?.href;

  if (!approveLink) {
    throw new Error("PayPal approval link not found");
  }

  return {
    orderId: data.id,
    approveLink,
    raw: data,
  };
}

async function captureOrder(orderId) {
  if (!orderId) {
    throw new Error("PayPal orderId is required for capture");
  }

  const fetchFn = await resolveFetch();
  const accessToken = await getAccessToken();

  const response = await fetchFn(
    `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.details?.[0]?.description ||
      data?.details?.[0]?.issue ||
      data?.message ||
      "Unable to capture PayPal order";
    const error = new Error(message);
    error.response = data;
    error.status = response.status;
    throw error;
  }

  return data;
}

async function testCredentials() {
  try {
    const token = await getAccessToken();
    return {
      success: true,
      message: 'PayPal credentials are valid',
      tokenLength: token?.length || 0,
    };
  } catch (error) {
    return {
      success: false,
      message: error?.message || 'PayPal credentials test failed',
      error: error?.response || error,
      status: error?.status,
    };
  }
}

module.exports = {
  createOrder,
  isPaypalConfigured,
  captureOrder,
  testCredentials,
  getAccessToken, // Export for testing
};

