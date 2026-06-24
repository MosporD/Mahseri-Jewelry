import { createServiceSupabaseClient } from "./supabase";
import type { OrderInput } from "./types";

export async function createOrder(input: OrderInput) {
  const supabase = createServiceSupabaseClient();
  const orderNumber = `MJ-${Date.now().toString(36).toUpperCase()}`;

  if (!supabase) {
    return {
      id: orderNumber,
      orderNumber,
      persisted: false
    };
  }

  const { items, ...order } = input;
  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...order,
      order_number: orderNumber,
      status: "new"
    })
    .select("id, order_number")
    .single();

  if (error) throw error;

  if (items.length) {
    const { error: itemError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        ...item,
        order_id: data.id
      }))
    );
    if (itemError) throw itemError;
  }

  return {
    id: data.id,
    orderNumber: data.order_number,
    persisted: true
  };
}

export async function notifyOrder(input: OrderInput, orderNumber: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    `New Mahseri order ${orderNumber}`,
    `Customer: ${input.customer_name}`,
    `Phone: ${input.customer_phone}`,
    `City: ${input.city}`,
    `Total: ${input.total} JOD`,
    "",
    ...input.items.map((item) => `- ${item.name} x${item.quantity}: ${item.line_total} JOD`)
  ];

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join("\n")
    })
  }).catch(() => undefined);
}
