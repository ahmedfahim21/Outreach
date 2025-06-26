"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-auth-redirect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  DollarSign,
  Play,
  ArrowRight,
  Target,
  Activity
} from "lucide-react";
import Link from "next/link";

interface Campaign {
  id: string;
  title: string;
  description: string;
  targetSkills: string[];
  selectedTools: string[];
  totalBudgetInUSDC?: number;
  totalBudgetInEURC?: number;
  totalBudgetForOutreach: number;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Contact {
  id: string;
  campaignId: string;
  name: string;
  email?: string;
  role?: string;
  description?: string;
  ai_score?: number;
  ai_strengths?: string[];
  ai_concerns?: string[];
  ai_reasoning?: string;
  contacted?: boolean;
  responded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalContacts: number;
  totalLeads: number;
  responseRate: number;
  avgConversionRate: number;
  totalBudgetSpent: number;
}


export default function DashboardPage() {
  const { user } = useAuth();
  const { shouldRender, isLoading } = useRequireAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalContacts: 0,
    totalLeads: 0,
    responseRate: 0,
    avgConversionRate: 0,
    totalBudgetSpent: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    try {
      // Fetch campaigns
      const campaignsResponse = await fetch(`/api/campaigns?userId=${user?.id}`);
      const campaignsData = await campaignsResponse.json();
      
      // Fetch contacts
      const contactsResponse = await fetch('/api/contacts');
      const contactsData = await contactsResponse.json();
      
      if (Array.isArray(campaignsData)) {
        setCampaigns(campaignsData);
      }
      
      if (contactsData.contacts && Array.isArray(contactsData.contacts)) {
        setContacts(contactsData.contacts);
      }
      
      // Calculate dashboard stats
      calculateStats(campaignsData, contactsData.contacts || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const calculateStats = (campaignsData: Campaign[], contactsData: Contact[]) => {
    const totalCampaigns = campaignsData.length;
    const activeCampaigns = campaignsData.filter(c => c.isPaid).length;
    const totalContacts = contactsData.length;
    const contactedContacts = contactsData.filter(c => c.contacted).length;
    const respondedContacts = contactsData.filter(c => c.responded).length;
    const responseRate = contactedContacts > 0 ? Math.round((respondedContacts / contactedContacts) * 100) : 0;
    const totalBudgetSpent = campaignsData.reduce((sum, c) => sum + (c.totalBudgetForOutreach || 0), 0);
    
    setDashboardStats({
      totalCampaigns,
      activeCampaigns,
      totalContacts,
      totalLeads: totalContacts,
      responseRate,
      avgConversionRate: Math.round(responseRate * 0.8), // Estimate conversion as 80% of response rate
      totalBudgetSpent,
    });
  };

  if (isLoading || dataLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!shouldRender || !user) {
    return null; // Will redirect in useRequireAuth hook
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-700 bg-red-50 border-red-200";
      case "medium": return "text-yellow-700 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-700 bg-green-50 border-green-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 text-secondary">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back
            </h1>
            <p className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your outreach campaigns today
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{dashboardStats.activeCampaigns}</p>
                  <p className="text-xs text-muted-foreground">
                    of {dashboardStats.totalCampaigns} total
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalLeads}</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.totalContacts} contacts
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">{dashboardStats.responseRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.avgConversionRate}% conversion
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget Spent</p>
                  <p className="text-2xl font-bold">${dashboardStats.totalBudgetSpent}</p>
                </div>
                <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Your latest outreach efforts</CardDescription>
              </div>
              <Link href="/dashboard/campaign">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-sm">{campaign.title}</h4>
                      <Badge className={campaign.isPaid ? "text-secondary bg-primary" : "text-gray-700 bg-gray-50 border-gray-200"}>
                        {campaign.isPaid ? "Paid" : "Draft"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Budget: ${campaign.totalBudgetForOutreach}</span>
                      <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Skills: {campaign.targetSkills.slice(0, 2).join(", ")}</span>
                        <span>{campaign.targetSkills.length} skills</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No campaigns yet. Create your first campaign to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Contacts</CardTitle>
                <CardDescription>Latest prospect interactions</CardDescription>
              </div>
              <Link href="/dashboard/contacts">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {contacts.slice(0, 3).map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {contact.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{contact.name}</h4>
                        <p className="text-xs text-muted-foreground">{contact.role || 'Role not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-11">
                      <Badge className={contact.responded ? "text-green-700 bg-green-50 border-green-200" : 
                                        contact.contacted ? "text-blue-700 bg-blue-50 border-blue-200" : 
                                        "text-gray-700 bg-gray-50 border-gray-200"}>
                        {contact.responded ? "Responded" : contact.contacted ? "Contacted" : "New"}
                      </Badge>
                      {contact.ai_score && (
                        <Badge variant="outline" className="text-xs">
                          Score: {contact.ai_score}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.createdAt || contact.updatedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No contacts yet. Start a campaign to find prospects!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/campaign/new">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
              <Link href="/dashboard/contacts">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  View Contacts
                </Button>
              </Link>
              <Link href="/dashboard/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-medium">{user.contactEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet Address</p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </code>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Account created on {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
        </div>

      </div>
    </div>
  );
}