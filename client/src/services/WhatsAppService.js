// WhatsApp helper configuration for customer support
export const WHATSAPP_SUPPORT_NUMBER = "918738033229";

/**
 * Open general WhatsApp customer support chat (NOT used for checkout)
 */
export const openSupportChat = () => {
  const message = encodeURIComponent("Hello! I'd like to enquire about medicines at Vijay Medical Store.");
  window.open(`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${message}`, "_blank");
};
