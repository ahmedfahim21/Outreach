"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useFacilitator as getFaciliator } from "x402/verify";
import { PaymentRequirements } from "x402/types";
import { exact } from "x402/schemes";

export async function verifyPayment(payload: string, paymentAmount: string): Promise<string> {
  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: "base-sepolia",
    maxAmountRequired: paymentAmount,
    resource: "https://example.com",
    description: "Payment for a service",
    mimeType: "text/html",
    payTo: process.env.RESOURCE_WALLET_ADDRESS as string,
    maxTimeoutSeconds: 60,
    asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
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