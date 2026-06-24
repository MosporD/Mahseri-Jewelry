import { NextRequest, NextResponse } from "next/server";
import { createOrder, notifyOrder } from "@/src/lib/orders";
import type { OrderInput } from "@/src/lib/types";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as OrderInput;
    if (!input.customer_name || !input.customer_phone || !input.address || !input.items?.length) {
      return NextResponse.json({ error: "Missing required order details." }, { status: 400 });
    }

    const order = await createOrder(input);
    await notifyOrder(input, order.orderNumber);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create order." },
      { status: 500 }
    );
  }
}
