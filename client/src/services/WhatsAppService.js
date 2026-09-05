const WHATSAPP_NUMBER = "918738033229"; // Vijay Medical Store

/**
 * sendOrderToWhatsApp — Cart order ko WhatsApp par bhejta hai
 * WhatsApp URL scheme sirf text support karta hai (image directly attach
 * nahi ho sakti browser security ke wajah se). Text message fully prefilled
 * hota hai — user ko sirf Send dabana hai.
 */
export const sendOrderToWhatsApp = (cartItems, total) => {
  const itemSummary = cartItems
    .map(
      (item, i) =>
        `${i + 1}. *${item.name}*\n   Qty: ${item.quantity} × ₹${item.price} = ₹${item.price * item.quantity}`
    )
    .join("\n");

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = subtotal * 0.12;
  const delivery = subtotal > 0 ? 20 : 0;

  const message =
    `🏥 *Vijay Medical Store — New Order Request*\n\n` +
    `📋 *Order Details:*\n${itemSummary}\n\n` +
    `──────────────────\n` +
    `Subtotal: ₹${subtotal.toFixed(2)}\n` +
    `GST (12%): ₹${gst.toFixed(2)}\n` +
    `Delivery: ₹${delivery.toFixed(2)}\n` +
    `*Grand Total: ₹${total.toFixed(2)}*\n` +
    `──────────────────\n\n` +
    `Please confirm availability and expected delivery time. Thank you! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
};
