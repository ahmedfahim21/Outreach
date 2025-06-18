"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye,
  Pause,
  Play,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  Calendar
} from "lucide-react";
import Link from "next/link";

// Mock data for campaigns
const mockCampaigns = [
  {
    id: "1",
    title: "Q1 Lead Generation Campaign",
    status: "active",
    leadsFound: 127,
    conversionRate: 12.5,
    lastUpdated: "2025-06-17",
    createdAt: "2025-06-01",
    template: "Lead Generation"
  },
  {
    id: "2",
    title: "Influencer Outreach for Product Launch",
    status: "paused",
    leadsFound: 45,
    conversionRate: 28.9,
    lastUpdated: "2025-06-15",
    createdAt: "2025-05-20",
    template: "Influencer Outreach"
  },
  {
    id: "3",
    title: "Partnership Development Initiative",
    status: "completed",
    leadsFound: 23,
    conversionRate: 43.5,
    lastUpdated: "2025-06-10",
    createdAt: "2025-05-01",
    template: "Partnership Building"
  },
  {
    id: "4",
    title: "Developer Talent Recruitment",
    status: "active",
    leadsFound: 89,
    conversionRate: 8.9,
    lastUpdated: "2025-06-18",
    createdAt: "2025-06-10",
    template: "Talent Recruitment"
  },
  {
    id: "5",
    title: "Content Promotion Campaign",
    status: "draft",
    leadsFound: 0,
    conversionRate: 0,
    lastUpdated: "2025-06-16",
    createdAt: "2025-06-16",
    template: "Content Promotion"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800 border-green-200";
    case "paused": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "completed": return "bg-blue-100 text-blue-800 border-blue-200";
    case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active": return <Play className="h-3 w-3" />;
    case "paused": return <Pause className="h-3 w-3" />;
    case "completed": return <TrendingUp className="h-3 w-3" />;
    case "draft": return <Calendar className="h-3 w-3" />;
    default: return null;
  }
};

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("lastUpdated");

  const filteredCampaigns = mockCampaigns
    .filter(campaign =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (statusFilter === "all" || campaign.status === statusFilter)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "lastUpdated":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case "leadsFound":
          return b.leadsFound - a.leadsFound;
        case "conversionRate":
          return b.conversionRate - a.conversionRate;
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="budgetUsed">Budget Used</SelectItem>
              <SelectItem value="leadsFound">Leads Found</SelectItem>
              <SelectItem value="conversionRate">Conversion Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <Badge className={`${getStatusColor(campaign.status)} flex items-center gap-1`}>
                    {getStatusIcon(campaign.status)}
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {new Date(campaign.lastUpdated).toLocaleDateString()}
                  </p>
                </div>

                <h3 className="font-medium text-lg mb-1">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{campaign.template}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <p className="font-medium">{campaign.leadsFound}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conversion</p>
                    <p className="font-medium">{campaign.conversionRate}%</p>
                  </div>
                </div>

                <div className="flex justify-end gap-1">
                  <Link href={`/dashboard/campaign/${campaign.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {campaign.status === "active" ? (
                    <Button variant="ghost" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : campaign.status === "paused" ? (
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
