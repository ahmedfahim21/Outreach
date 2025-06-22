"use client";

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
  Calendar,
  DollarSign,
  Play,
  ArrowRight,
  Target,
  Activity
} from "lucide-react";
import Link from "next/link";

// Mock dashboard data that would typically come from an API
const dashboardData = {
  stats: {
    activeCampaigns: 2,
    totalCampaigns: 5,
    totalLeads: 284,
    totalContacts: 8,
    responseRate: 18.4,
    avgConversionRate: 19.7,
    totalBudgetSpent: 2410,
    meetingsScheduled: 3,
    dealsWon: 1
  },
  recentCampaigns: [
    {
      id: "1",
      title: "Q1 Lead Generation Campaign",
      status: "active",
      leadsFound: 127,
      lastActivity: "2025-06-18",
      progress: 45
    },
    {
      id: "4", 
      title: "Developer Talent Recruitment",
      status: "active",
      leadsFound: 89,
      lastActivity: "2025-06-18",
      progress: 16
    },
    {
      id: "2",
      title: "Influencer Outreach for Product Launch", 
      status: "paused",
      leadsFound: 45,
      lastActivity: "2025-06-15",
      progress: 59
    }
  ],
  recentContacts: [
    {
      id: "1",
      name: "John Smith",
      company: "TechCorp Inc",
      status: "responded",
      lastInteraction: "2025-06-18",
      campaignName: "Q1 Lead Generation"
    },
    {
      id: "4",
      name: "Emily Rodriguez", 
      company: "CreativeStudio",
      status: "negotiating",
      lastInteraction: "2025-06-18",
      campaignName: "Influencer Outreach"
    },
    {
      id: "7",
      name: "Alex Thompson",
      company: "GrowthCo", 
      status: "qualified",
      lastInteraction: "2025-06-18",
      campaignName: "Content Promotion"
    }
  ],
  upcomingTasks: [
    {
      id: "1",
      task: "Demo call with John Smith",
      type: "meeting",
      dueDate: "2025-06-20",
      priority: "high"
    },
    {
      id: "2", 
      task: "Follow up with Sarah Johnson",
      type: "followup",
      dueDate: "2025-06-19",
      priority: "medium"
    },
    {
      id: "3",
      task: "Review partnership proposal from Emily",
      type: "review", 
      dueDate: "2025-06-21",
      priority: "high"
    }
  ]
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { shouldRender, isLoading } = useRequireAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!shouldRender || !user) {
    return null; // Will redirect in useRequireAuth hook
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-700 bg-green-50 border-green-200";
      case "paused": return "text-yellow-700 bg-yellow-50 border-yellow-200"; 
      case "responded": return "text-blue-700 bg-blue-50 border-blue-200";
      case "negotiating": return "text-orange-700 bg-orange-50 border-orange-200";
      case "qualified": return "text-purple-700 bg-purple-50 border-purple-200";
      default: return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

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
                  <p className="text-2xl font-bold">{dashboardData.stats.activeCampaigns}</p>
                  <p className="text-xs text-muted-foreground">
                    of {dashboardData.stats.totalCampaigns} total
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <Play className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold">{dashboardData.stats.totalLeads}</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.stats.totalContacts} contacts
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">{dashboardData.stats.responseRate}%</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.stats.avgConversionRate}% conversion
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Budget Spent</p>
                  <p className="text-2xl font-bold">${dashboardData.stats.totalBudgetSpent}</p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.stats.dealsWon} deals won
                  </p>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
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
              {dashboardData.recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-sm">{campaign.title}</h4>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{campaign.leadsFound} leads found</span>
                      <span>Updated {new Date(campaign.lastActivity).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div 
                          className="bg-foreground h-1.5 rounded-full" 
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
              {dashboardData.recentContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="h-8 w-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {contact.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{contact.name}</h4>
                        <p className="text-xs text-muted-foreground">{contact.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-11">
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.lastInteraction).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>Action items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboardData.upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-muted rounded-lg flex items-center justify-center">
                      {task.type === 'meeting' && <Calendar className="h-4 w-4" />}
                      {task.type === 'followup' && <MessageSquare className="h-4 w-4" />}
                      {task.type === 'review' && <Activity className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{task.task}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
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
                  Update Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <Card>
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
  );
}