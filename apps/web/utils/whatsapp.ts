type WhatsAppItem = {
  name: string;
  quantity: number;
  price: number;
};

type Params = {
  items: WhatsAppItem[];
  total: number;
  customerName: string;
};

export function generateWhatsAppLink(params: Params) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;

  const productsText = params.items
    .map(
      (item) =>
        `- ${item.quantity}x ${item.name} - MXN $${(
          item.price * item.quantity
        ).toLocaleString()}`
    )
    .join("\n");

  const message = `Hola, quiero hacer este pedido:

Cliente: ${params.customerName}

Pedido:
${productsText}

Total: MXN $${params.total.toLocaleString()}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}