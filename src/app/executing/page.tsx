"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Campaign {
  id: string;
  title: string;
  description: string;
  searchIntent: string;
  customSearchIntent?: string;
  targetSkills: string[];
  selectedTools: string[];
  totalBudgetInUSDC: number;
  totalBudgetInEURC: number;
  autoNegotiation: boolean;
  autoFollowups: boolean;
  isPaid: boolean;
  paymentAmount?: string;
  paymentToken?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    contactEmail: string;
    walletAddress: string;
  };
}

export default function ProtectedPage() {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        // Try to get campaign ID from URL params first, then sessionStorage
        const urlParams = new URLSearchParams(window.location.search);
        const campaignIdFromUrl = urlParams.get('campaignId');
        const campaignId = campaignIdFromUrl || sessionStorage.getItem('pendingCampaignId');
        
        if (campaignId) {
          const response = await fetch(`/api/campaigns/${campaignId}`);
          const result = await response.json();
          
          if (result.campaign) {
            // Check if campaign is paid
            if (!result.campaign.isPaid) {
              // Campaign not paid, redirect to paywall
              console.log("Campaign not paid, redirecting to paywall");
              router.push(`/paywall?campaignId=${campaignId}`);
              return;
            }
            
            setCampaign(result.campaign);
            console.log("Campaign data:", result.campaign);
            
            // Only clear sessionStorage if campaign is marked as paid
            if (result.campaign.isPaid) {
              sessionStorage.removeItem('pendingCampaignId');
            }
          } else {
            console.log("Campaign not found, redirecting to paywall");
            router.push('/paywall');
          }
        } else {
          console.log("No campaign ID found, redirecting to paywall");
          router.push('/paywall');
        }
      } catch (error) {
        console.error('Error fetching campaign:', error);
        router.push('/paywall');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading campaign...</h2>
          <p className="text-muted-foreground">Processing your payment and campaign data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">Protected Content</h1>
        <p className="text-lg mb-6">
          Your payment was successful! Your campaign is ready to launch.
        </p>
        
        {campaign && (
          <div className="bg-card p-6 rounded-lg border mb-6">
            <h2 className="text-2xl font-semibold mb-4">Campaign Details</h2>
            <div className="space-y-3">
              <div>
                <strong>Title:</strong> {campaign.title}
              </div>
              <div>
                <strong>Description:</strong> {campaign.description}
              </div>
              <div>
                <strong>Search Intent:</strong> {campaign.searchIntent}
                {campaign.customSearchIntent && (
                  <div className="ml-4 text-sm text-muted-foreground">
                    Custom: {campaign.customSearchIntent}
                  </div>
                )}
              </div>
              <div>
                <strong>Target Skills:</strong> {campaign.targetSkills.join(", ")}
              </div>
              <div>
                <strong>Selected Tools:</strong> {campaign.selectedTools.join(", ")}
              </div>
              <div>
                <strong>Total Budget:</strong> {campaign.totalBudgetInUSDC} USDC / {campaign.totalBudgetInEURC} EURC
              </div>
              <div>
                <strong>Payment Amount:</strong> {campaign.paymentAmount} {campaign.paymentToken}
              </div>
              <div>
                <strong>Auto Features:</strong>
                <ul className="ml-4 list-disc">
                  {campaign.autoNegotiation && <li>Auto-Negotiation enabled</li>}
                  {campaign.autoFollowups && <li>Auto-Follow-ups enabled</li>}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}