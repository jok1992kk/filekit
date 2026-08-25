import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Checkout" };

/** Checkout is activated when the payment provider is connected. */
export default function CheckoutPage() {
  redirect("/pricing");
}
