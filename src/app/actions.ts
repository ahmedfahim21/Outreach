"use server";

import { redirect } from "next/navigation";
import { useFacilitator as getFaciliator } from "x402/verify";
import { PaymentRequirements } from "x402/types";
import { exact } from "x402/schemes";
import { ASSET_ADDRESSES } from "@/lib/constants";
import prisma from "@/lib/prisma";

export async function verifyPayment(payload: string, paymentAmount: string, token: "USDC"|"EURC", campaignId?: string | null): Promise<string> {
  
  if (campaignId) {
    try {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
      });
      
      if (!campaign) {
        throw new Error("Campaign not found");
      }
      
      if (campaign.isPaid) {
        throw new Error("Campaign has already been paid for");
      }
      
    } catch (error) {
      console.error('Campaign validation error:', error);
      return `Error: ${error}`;
    }
  }
  

  const assetAddress = process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? token === "USDC"
      ? ASSET_ADDRESSES.BASE.USDC
      : ASSET_ADDRESSES.BASE.EURC
    : token === "USDC"
      ? ASSET_ADDRESSES.BASE_SEPOLIA.USDC
      : ASSET_ADDRESSES.BASE_SEPOLIA.EURC;

  const paymentRequirements: PaymentRequirements = {
    scheme: "exact",
    network: process.env.NEXT_PUBLIC_NODE_ENV === "production" ? "base" : "base-sepolia",
    maxAmountRequired: paymentAmount,
    resource: "https://example.com",
    description: "Payment for a service",
    mimeType: "text/html",
    payTo: process.env.NEXT_PUBLIC_RESOURCE_WALLET_ADDRESS as string,
    maxTimeoutSeconds: 60,
    asset: assetAddress,
    outputSchema: undefined,
    extra: {
      name: token,
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

    if (campaignId) {
      try {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            isPaid: true,
            paymentAmount,
            paymentToken: token,
            updatedAt: new Date()
          }
        });
      } catch (updateError) {
        console.error('Error updating campaign:', updateError);
      }
    }
  } catch (error) {
    console.error({ error });
    return `Error: ${error}`;
  }

  if (campaignId) {
    redirect(`/executing?campaignId=${campaignId}`);
  } else {
    redirect("/executing");
  }
}