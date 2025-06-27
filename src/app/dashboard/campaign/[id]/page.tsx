"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  TrendingUp,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Star
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
  user?: {
    id: string;
    name: string;
    contactEmail: string;
    walletAddress: string;
  };
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

interface CampaignStats {
  totalContacts: number;
  contactedContacts: number;
  respondedContacts: number;
  responseRate: number;
  averageScore: number;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<CampaignStats>({
    totalContacts: 0,
    contactedContacts: 0,
    respondedContacts: 0,
    responseRate: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch campaign details
      const campaignResponse = await fetch(`/api/campaigns/${campaignId}`);
      if (!campaignResponse.ok) {
        throw new Error('Failed to fetch campaign');
      }
      const campaignData = await campaignResponse.json();
      setCampaign(campaignData.campaign);

      // Fetch campaign contacts
      const contactsResponse = await fetch(`/api/campaigns/${campaignId}/contacts`);
      if (!contactsResponse.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const contactsData = await contactsResponse.json();
      setContacts(contactsData.contacts || []);

      // Calculate stats
      calculateStats(contactsData.contacts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (contactsData: Contact[]) => {
    const totalContacts = contactsData.length;
    const contactedContacts = contactsData.filter(c => c.contacted).length;
    const respondedContacts = contactsData.filter(c => c.responded).length;
    const responseRate = contactedContacts > 0 ? Math.round((respondedContacts / contactedContacts) * 100) : 0;
    const averageScore = contactsData.length > 0 
      ? Math.round(contactsData.reduce((sum, c) => sum + (c.ai_score || 0), 0) / contactsData.length)
      : 0;

    setStats({
      totalContacts,
      contactedContacts,
      respondedContacts,
      responseRate,
      averageScore
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <p>Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-600">{error || 'Campaign not found'}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "leads", label: "Leads List", icon: Users },
    { id: "outreach", label: "Outreach Logs", icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/campaign">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{campaign.title}</h1>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={campaign.isPaid ? "bg-primary text-secondary" : "bg-gray-100 text-gray-800 border-gray-200"}>
              {campaign.isPaid ? "Paid" : "Draft"}
            </Badge>
          </div>
        </div>

        <div className="border-b">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 py-4 px-3 mx-2 border-b-3 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-secondary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className="text-sm">{campaign.isPaid ? "Active" : "Draft"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tools</p>
                      <p className="text-sm">{campaign.selectedTools.join(", ")}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p className="text-sm">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{new Date(campaign.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Target Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.targetSkills.map((skill: string) => (
                        <Badge key={skill} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span>Budget for Outreach: ${campaign.totalBudgetForOutreach}</span>
                      <span>Tool Cost: {campaign.totalBudgetInUSDC || 0} USDC / 
                        {campaign.totalBudgetInEURC || 0} EURC</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full">
                      <div 
                        className="h-4 bg-primary rounded-full" 
                        style={{ width: campaign.isPaid ? "100%" : "0%" }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {campaign.isPaid ? "Campaign is active and funded" : "Campaign not yet funded"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.totalContacts}</p>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.contactedContacts}</p>
                    <p className="text-sm text-muted-foreground">Contacts Reached</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{stats.responseRate}%</p>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{stats.respondedContacts}</p>
                    <p className="text-sm text-muted-foreground">Responses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{stats.averageScore}</p>
                    <p className="text-sm text-muted-foreground">Avg AI Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "leads" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Contacts List</CardTitle>
                  <CardDescription>{contacts.length} contacts found</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Contact</th>
                      <th className="text-left p-4 font-medium">Contact Methods</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">AI Score</th>
                      <th className="text-left p-4 font-medium">Last Updated</th>
                      <th className="text-left p-4 font-medium">AI Insights</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          No contacts found for this campaign.
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-muted/25 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground">{contact.role || "Role not specified"}</p>
                              <p className="text-sm text-muted-foreground max-w-xs truncate">{contact.description || ""}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {contact.email && (
                                <Button variant="ghost" size="sm" asChild>
                                  <a href={`mailto:${contact.email}`}>
                                    <Mail className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={contact.responded ? "bg-green-100 text-green-800 border-green-200" : 
                                              contact.contacted ? "bg-blue-100 text-blue-800 border-blue-200" : 
                                              "bg-gray-100 text-gray-800 border-gray-200"}>
                              {contact.responded ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Responded
                                </>
                              ) : contact.contacted ? (
                                <>
                                  <Clock className="h-4 w-4 mr-1" />
                                  Contacted
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Not contacted
                                </>
                              )}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">{contact.ai_score || 0}/100</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{new Date(contact.updatedAt || contact.createdAt || Date.now()).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs">
                              {contact.ai_reasoning && (
                                <p className="text-sm text-muted-foreground truncate">
                                  {contact.ai_reasoning}
                                </p>
                              )}
                              {contact.ai_strengths && contact.ai_strengths.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {contact.ai_strengths.slice(0, 2).map((strength, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {strength}
                                    </Badge>
                                  ))}
                                  {contact.ai_strengths.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{contact.ai_strengths.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "outreach" && (
          <Card>
            <CardHeader>
              <CardTitle>Outreach Logs</CardTitle>
              <CardDescription>All messages sent and responses received</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Placeholder for outreach logs - implement when outreach API is available */}
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Outreach logs will appear here once outreach features are implemented.</p>
                <p className="text-sm mt-2">
                  This will show email sends, responses, and follow-up activities.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
