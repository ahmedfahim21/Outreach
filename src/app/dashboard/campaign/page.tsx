"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye,
  Search
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

interface Campaign {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("lastUpdated");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const response = await fetch(`/api/campaigns?userId=${user?.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    }
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const filteredCampaigns = campaigns
    .filter(campaign =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "lastUpdated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "budget":
          return (b.totalBudgetInUSDC + b.totalBudgetInEURC) - (a.totalBudgetInUSDC + a.totalBudgetInEURC);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground">View and manage all your outreach campaigns</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>


          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="title">Title (A-Z)</SelectItem>
              <SelectItem value="budget">Budget (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                <h3 className="font-medium text-lg mb-1">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{campaign.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Budget USDC</p>
                    <p className="font-medium">${campaign.totalBudgetInUSDC}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget EURC</p>
                    <p className="font-medium">€{campaign.totalBudgetInEURC}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {campaign.targetSkills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {campaign.targetSkills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{campaign.targetSkills.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex justify-end gap-1">
                  <Link href={`/dashboard/campaign/${campaign.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No campaigns found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
