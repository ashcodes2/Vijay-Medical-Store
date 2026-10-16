const axios = require("axios");

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const STORE_PHONE = process.env.STORE_PHONE;

/**
 * Sends an SMS via Fast2SMS Quick SMS route.
 * Non-fatal: logs error and continues if SMS fails.
 */
const sendSMS = async (phone, message) => {
  if (!FAST2SMS_API_KEY) {
    console.warn("[SMS] FAST2SMS_API_KEY not set — skipping SMS");
    return;
  }

  const cleanPhone = String(phone).replace(/^\+?91/, "").replace(/\D/g, "").slice(-10);

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message,
        language: "english",
        flash: 0,
        numbers: cleanPhone,
      },
      {
        headers: {
          authorization: FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data?.return === true) {
      console.log(`[SMS] Sent to ${cleanPhone}: OK`);
    } else {
      console.warn("[SMS] Fast2SMS response:", response.data);
    }
  } catch (err) {
    console.error(`[SMS] Failed to send to ${cleanPhone}:`, err?.response?.data || err.message);
  }
};

/**
 * Sends order confirmation SMS to the customer.
 */
const sendOrderConfirmationSMS = async (order) => {
  const shortId = String(order._id).slice(-6).toUpperCase();
  const itemNames = order.items.map((i) => `${i.name} x${i.quantity}`).join(", ");

  const message =
    `Vijay Medical Store: Order #VMS-${shortId} confirmed! ` +
    `Items: ${itemNames}. ` +
    `Total: Rs.${order.totalAmount}. ` +
    `Expected delivery: 2-4 hours. Thank you!`;

  await sendSMS(order.phone, message);
};

/**
 * Sends a new order alert SMS to the store owner.
 */
const sendOwnerAlertSMS = async (order) => {
  if (!STORE_PHONE) {
    console.warn("[SMS] STORE_PHONE not set — skipping owner alert");
    return;
  }

  const shortId = String(order._id).slice(-6).toUpperCase();
  const itemNames = order.items.map((i) => `${i.name} x${i.quantity}`).join(", ");

  const message =
    `NEW ORDER #VMS-${shortId} from ${order.customerName} (${order.phone}). ` +
    `${itemNames}. Total: Rs.${order.totalAmount}. ` +
    `Addr: ${order.address.slice(0, 50)}`;

  await sendSMS(STORE_PHONE, message);
};

module.exports = { sendOrderConfirmationSMS, sendOwnerAlertSMS };
