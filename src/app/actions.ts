'use server'

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useFacilitator as getFaciliator } from "x402/verify";
import { PaymentRequirements } from "x402/types";
import { exact } from "x402/schemes";

export async function verifyPayment(payload: string): Promise<string> {
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: "1",
    resource: "/protected",
    description: "Payment for a service",
    mimeType: "text/html",
    payTo: process.env.RESOURCE_WALLET_ADDRESS as string,
    maxTimeoutSeconds: 60,
    asset: "",
    outputSchema: undefined,
    extra: {
      name: "USDC",
      version: "2",
    },
  };

  const { verify, settle } = getFaciliator();

  try {
    const payment = exact.evm.decodePayment(payload);
    const valid = await verify(payment, paymentRequirements);
    if (!valid.isValid) {
      throw new Error(valid.invalidReason);
    }

    const settleResponse = await settle(payment, paymentRequirements);

    if (!settleResponse.success) {
      throw new Error(settleResponse.errorReason);
    }
  } catch (error) {
    console.error({ error });
    return `Error: ${error}`;
  }

  const cookieStore = await cookies();
  cookieStore.set("payment-session", payload);
  redirect("/protected");
}