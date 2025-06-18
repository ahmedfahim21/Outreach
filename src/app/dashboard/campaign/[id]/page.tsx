"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Pause,
  Trash2,
  TrendingUp,
  Users,
  DollarSign,
  MessageSquare,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Linkedin,
  ExternalLink,
  Calendar,
  Star,
  Download
} from "lucide-react";
import Link from "next/link";

// Mock data for campaign details
const mockCampaignDetails = {
  "1": {
    id: "1",
    title: "Q1 Lead Generation Campaign",
    status: "active",
    budgetUsed: 450,
    budgetTotal: 1000,
    leadsFound: 127,
    conversionRate: 12.5,
    lastUpdated: "2025-06-17",
    createdAt: "2025-06-01",
    template: "Lead Generation",
    description: "Targeting software companies in the US for our new SaaS product",
    targetSkills: ["Software Development", "Product Management", "Marketing"],
    geography: "United States",
    audienceSize: "medium",
    overview: {
      totalContacts: 1250,
      emailsSent: 890,
      responseRate: 18.2,
      meetingsScheduled: 23,
      deals: 16
    },
    leads: [
      {
        id: "1",
        name: "John Smith",
        company: "TechCorp Inc",
        position: "CTO",
        email: "john@techcorp.com",
        phone: "+1-555-0123",
        linkedin: "linkedin.com/in/johnsmith",
        status: "responded",
        aiScore: 85,
        lastContact: "2025-06-17",
        notes: "Interested in enterprise plan, scheduled demo for next week"
      },
      {
        id: "2", 
        name: "Sarah Johnson",
        company: "StartupXYZ",
        position: "Product Manager",
        email: "sarah@startupxyz.com",
        phone: "+1-555-0456",
        linkedin: "linkedin.com/in/sarahj",
        status: "contacted",
        aiScore: 72,
        lastContact: "2025-06-16",
        notes: "First email sent, no response yet"
      },
      {
        id: "3",
        name: "Mike Chen",
        company: "InnovateLabs",
        position: "VP Engineering",
        email: "mike@innovatelabs.com", 
        phone: "+1-555-0789",
        linkedin: "linkedin.com/in/mikechen",
        status: "meeting_scheduled",
        aiScore: 91,
        lastContact: "2025-06-15",
        notes: "Very interested, meeting scheduled for Thursday 2pm"
      }
    ],
    outreachLogs: [
      {
        id: "1",
        leadName: "John Smith",
        type: "email",
        subject: "Transform your development workflow with our AI-powered platform",
        sent: "2025-06-17 10:30",
        status: "opened",
        response: "Looks interesting! Can we schedule a demo?",
        followUpPlan: "Schedule demo call within 24 hours"
      },
      {
        id: "2",
        leadName: "Sarah Johnson", 
        type: "email",
        subject: "Boost your product team's efficiency by 40%",
        sent: "2025-06-16 14:15",
        status: "sent",
        response: null,
        followUpPlan: "Send follow-up email in 3 days"
      },
      {
        id: "3",
        leadName: "Mike Chen",
        type: "linkedin",
        subject: "Connection request + intro message",
        sent: "2025-06-15 09:00",
        status: "responded",
        response: "Thanks for reaching out! I'd like to learn more.",
        followUpPlan: "Send calendar link for meeting"
      }
    ],
    toolUsage: [
      {
        tool: "Email Finder",
        contacts: 127,
        cost: 254,
        successRate: 94
      },
      {
        tool: "LinkedIn Scraper",
        contacts: 89,
        cost: 445,
        successRate: 87
      },
      {
        tool: "AI Personalization",
        messages: 156,
        cost: 936,
        successRate: 23
      }
    ],
    negotiations: [
      {
        id: "1",
        leadName: "John Smith",
        company: "TechCorp Inc",
        suggestedPayment: "$2,500/month",
        status: "in_progress",
        scheduledMeeting: "2025-06-20 14:00",
        notes: "Interested in enterprise plan with custom integrations"
      },
      {
        id: "2",
        leadName: "Mike Chen", 
        company: "InnovateLabs",
        suggestedPayment: "$1,200/month",
        status: "accepted",
        scheduledMeeting: "2025-06-19 10:00",
        notes: "Ready to proceed with standard plan"
      }
    ]
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active": return "bg-green-100 text-green-800 border-green-200";
    case "responded": return "bg-blue-100 text-blue-800 border-blue-200";
    case "contacted": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "meeting_scheduled": return "bg-purple-100 text-purple-800 border-purple-200";
    case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
    case "accepted": return "bg-green-100 text-green-800 border-green-200";
    case "opened": return "bg-blue-100 text-blue-800 border-blue-200";
    case "sent": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getLeadStatusIcon = (status: string) => {
  switch (status) {
    case "responded": return <CheckCircle className="h-4 w-4" />;
    case "contacted": return <Clock className="h-4 w-4" />;
    case "meeting_scheduled": return <Calendar className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");
  
  const campaign = mockCampaignDetails[campaignId as keyof typeof mockCampaignDetails];
  
  if (!campaign) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <p>Campaign not found</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "leads", label: "Leads List", icon: Users },
    { id: "outreach", label: "Outreach Logs", icon: MessageSquare },
    { id: "tools", label: "Tool Usage", icon: Target },
    { id: "negotiations", label: "Negotiations", icon: DollarSign }
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
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
            </Badge>
            <Button variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
            <Button variant="outline" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
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
                      <p className="text-sm font-medium text-muted-foreground">Template</p>
                      <p className="text-sm">{campaign.template}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Geography</p>
                      <p className="text-sm">{campaign.geography}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Created</p>
                      <p className="text-sm">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="text-sm">{new Date(campaign.lastUpdated).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Target Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {campaign.targetSkills.map((skill) => (
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
                    <div className="flex justify-between items-center">
                      <span>Used: ${campaign.budgetUsed}</span>
                      <span>Total: ${campaign.budgetTotal}</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 rounded-full">
                      <div 
                        className="h-4 bg-primary rounded-full" 
                        style={{ width: `${(campaign.budgetUsed / campaign.budgetTotal) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {((campaign.budgetUsed / campaign.budgetTotal) * 100).toFixed(1)}% of budget used
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
                    <p className="text-2xl font-bold text-blue-600">{campaign.overview.totalContacts}</p>
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{campaign.overview.emailsSent}</p>
                    <p className="text-sm text-muted-foreground">Emails Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{campaign.overview.responseRate}%</p>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{campaign.overview.meetingsScheduled}</p>
                    <p className="text-sm text-muted-foreground">Meetings Scheduled</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{campaign.overview.deals}</p>
                    <p className="text-sm text-muted-foreground">Deals Closed</p>
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
                  <CardTitle>Leads List</CardTitle>
                  <CardDescription>{campaign.leads.length} leads found</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
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
                      <th className="text-left p-4 font-medium">Last Contact</th>
                      <th className="text-left p-4 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.leads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/25 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">{lead.position}</p>
                            <p className="text-sm text-muted-foreground">{lead.company}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`mailto:${lead.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                            {lead.phone && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`tel:${lead.phone}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {lead.linkedin && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`https://${lead.linkedin}`} target="_blank">
                                  <Linkedin className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(lead.status)} flex items-center gap-1 w-fit`}>
                            {getLeadStatusIcon(lead.status)}
                            {lead.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{lead.aiScore}/100</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm">{new Date(lead.lastContact).toLocaleDateString()}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground max-w-xs truncate">
                            {lead.notes}
                          </p>
                        </td>
                      </tr>
                    ))}
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
              {campaign.outreachLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{log.leadName}</p>
                      <p className="text-sm text-muted-foreground">{log.subject}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(log.sent).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {log.response && (
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm font-medium">Response:</p>
                      <p className="text-sm">{log.response}</p>
                    </div>
                  )}
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium text-blue-800">Follow-up Plan:</p>
                    <p className="text-sm text-blue-700">{log.followUpPlan}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === "tools" && (
          <Card>
            <CardHeader>
              <CardTitle>Tool Usage & Costs</CardTitle>
              <CardDescription>Breakdown of tools used and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {campaign.toolUsage.map((tool, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{tool.tool}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tool.contacts} contacts processed
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">${tool.cost}</p>
                        <p className="text-sm text-muted-foreground">Total cost</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">{tool.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Cost per Contact</p>
                        <p className="text-2xl font-bold">${(tool.contacts && tool.contacts > 0) ? (tool.cost / tool.contacts).toFixed(2) : '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                        <p className="text-2xl font-bold">{tool.contacts}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "negotiations" && (
          <Card>
            <CardHeader>
              <CardTitle>Negotiations & Meetings</CardTitle>
              <CardDescription>Active negotiations and scheduled meetings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.negotiations.map((negotiation) => (
                <div key={negotiation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{negotiation.leadName}</h3>
                      <p className="text-sm text-muted-foreground">{negotiation.company}</p>
                    </div>
                    <Badge className={getStatusColor(negotiation.status)}>
                      {negotiation.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Suggested Payment</p>
                      <p className="text-lg font-bold text-green-600">{negotiation.suggestedPayment}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Scheduled Meeting</p>
                      <p className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(negotiation.scheduledMeeting).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="text-sm">{negotiation.notes}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Meeting
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
