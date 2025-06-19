"use client";

import { Wallet } from "@coinbase/onchainkit/wallet";
import { useState } from "react";
import { PaymentRequirements, PaymentPayload } from "x402/types";
import { preparePaymentHeader } from "x402/client";
import { getNetworkId } from "x402/shared";
import { exact } from "x402/schemes";
import { useAccount, useSignTypedData } from "wagmi";
import { verifyPayment } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ASSET_ADDRESSES } from "@/lib/constants";

function PaymentForm({
  paymentRequirements,
  onPaymentAmountChange,
  onTokenChange
}: {
  paymentRequirements: PaymentRequirements;
  onPaymentAmountChange: (amount: string) => void;
  onTokenChange: (token: "USDC" | "EURC") => void;
}) {
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(paymentRequirements.maxAmountRequired);
  const [token, setToken] = useState<"USDC" | "EURC">(paymentRequirements.extra?.name as "USDC" | "EURC" || "USDC");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);

    if (numValue <= 0) {
      setError('Amount must be greater than 0');
    } else {
      setError(null);
    }

    setPaymentAmount(value);
    onPaymentAmountChange(value);
  };

  const { signTypedDataAsync } = useSignTypedData();

  async function handlePayment() {
    if (error || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const actualPaymentRequirements = {
        ...paymentRequirements,
        maxAmountRequired: paymentAmount
      };

      const unSignedPaymentHeader = preparePaymentHeader(
        address as `0x${string}`,
        1,
        actualPaymentRequirements
      );

      const eip712Data = {
        types: {
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        domain: {
          name: actualPaymentRequirements.extra?.name,
          version: actualPaymentRequirements.extra?.version,
          chainId: getNetworkId(actualPaymentRequirements.network),
          verifyingContract: actualPaymentRequirements.asset,
        },
        primaryType: "TransferWithAuthorization" as const,
        message: unSignedPaymentHeader.payload.authorization,
      };

      // @ts-expect-error handled
      const signature = await signTypedDataAsync(eip712Data);

      const paymentPayload: PaymentPayload = {
        ...unSignedPaymentHeader,
        payload: {
          ...unSignedPaymentHeader.payload,
          signature,
        },
      };

      const payment: string = exact.evm.encodePayment(paymentPayload);
      const verifyPaymentWithPayment = verifyPayment.bind(null, payment, paymentAmount, token);
      const result = await verifyPaymentWithPayment();

      if (result && result.startsWith('Error:')) {
        setError(result);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardDescription>
            {!isConnected ?
              "Please connect your wallet to continue" :
              "Your wallet is connected. Proceed with the payment."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Wallet />
          {!isConnected && (
            <p className="text-sm text-muted-foreground mt-2">

            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            {paymentRequirements.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Amount Input */}
          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium">
              Select Token
            </label>
            <div className="flex items-center space-x-2">
              <Button
                variant={token === "USDC" ? "secondary" : "outline"}
                onClick={() => {
                  setToken("USDC");
                  onTokenChange("USDC");
                }}
                className="flex-1"
              >
                USDC
              </Button>
              <Button
                variant={token === "EURC" ? "secondary" : "outline"}
                onClick={() => {
                  setToken("EURC");
                  onTokenChange("EURC");
                }}
                className="flex-1"
              >
                EURC
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <label htmlFor="amount" className="text-sm font-medium">
              Payment Amount
            </label>

            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter custom amount"
                min="0"
                max={paymentRequirements.maxAmountRequired}
                step="0.01"
                className="pr-16"
              />
              <Badge variant="secondary" className="absolute right-2 top-1/2 -translate-y-1/2">
                {paymentRequirements.extra?.name || 'USDC'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Network:</span>
              <Badge variant="outline">{paymentRequirements.network}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Recipient:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {paymentRequirements.payTo?.slice(0, 6)}...{paymentRequirements.payTo?.slice(-4)}
              </code>
            </div>
          </div>

          <Separator />

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">Payment completed successfully!</p>
            </div>
          )}

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={!isConnected || isProcessing || !!error || !paymentAmount}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing Payment...
              </div>
            ) : !isConnected ? (
              "Connect Wallet to Pay"
            ) : (
              `Pay ${paymentAmount} ${paymentRequirements.extra?.name || 'USDC'}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Paywall() {
  const [maxAmountRequired, setMaxAmountRequired] = useState("100000");
  const [token, setToken] = useState<"USDC" | "EURC">("USDC");

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
    maxAmountRequired: maxAmountRequired,
    resource: "/protected",
    description: "Access to Premium Content",
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

  if (!paymentRequirements.payTo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Configuration Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Payment gateway is not properly configured. Please set the NEXT_PUBLIC_RESOURCE_WALLET_ADDRESS environment variable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Secure Payment Gateway</h1>
        </div>

        {/* Payment Form */}
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
          <PaymentForm
            paymentRequirements={paymentRequirements}
            onPaymentAmountChange={setMaxAmountRequired}
            onTokenChange={setToken}
          />
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Powered by OnchainKit and x402 Payment Protocol
          </p>
        </div>
      </div>
    </div>
  );
}