// api/create-preference.js — Vercel Serverless Function
// Crea una preferencia de pago en Mercado Pago y devuelve el init_point

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!MP_TOKEN) return res.status(500).json({ error: "MP_ACCESS_TOKEN no configurado en Vercel" });

  const { items, payer, back_urls } = req.body;

  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MP_TOKEN}`,
      },
      body: JSON.stringify({
        items: items.map(i => ({
          id:          i.id,
          title:       i.title,
          quantity:    i.quantity,
          unit_price:  i.unit_price,
          currency_id: "CLP",
        })),
        payer: payer || {},
        back_urls: {
          success: back_urls?.success || `${req.headers.origin || "https://pango-pdp3.vercel.app"}/?status=success`,
          failure: back_urls?.failure || `${req.headers.origin || "https://pango-pdp3.vercel.app"}/?status=failure`,
          pending: back_urls?.pending || `${req.headers.origin || "https://pango-pdp3.vercel.app"}/?status=pending`,
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [],
          installments: 1,
        },
        statement_descriptor: "PanGo Boulangerie",
        external_reference: `PANGO-${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("MP Error:", err);
      return res.status(response.status).json({ error: err.message || "Error en Mercado Pago" });
    }

    const data = await response.json();
    return res.status(200).json({
      id:         data.id,
      init_point: data.init_point,       // producción
      sandbox_url: data.sandbox_init_point, // sandbox
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}
