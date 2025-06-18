"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    Filter,
    Mail,
    Phone,
    Linkedin,
    MessageSquare,
    Calendar,
    Star,
    CheckCircle,
    Clock,
    AlertCircle,
    XCircle,
    Download,
    Plus,
    Eye,
    MoreHorizontal,
    Building2,
    MapPin,
    Briefcase
} from "lucide-react";
import Link from "next/link";

// Mock data for contacts across all campaigns
const mockContacts = [
    {
        id: "1",
        name: "John Smith",
        company: "TechCorp Inc",
        position: "Chief Technology Officer",
        email: "john@techcorp.com",
        phone: "+1-555-0123",
        linkedin: "linkedin.com/in/johnsmith",
        location: "San Francisco, CA",
        campaignId: "1",
        campaignName: "Q1 Lead Generation Campaign",
        status: "responded",
        lastInteraction: "2025-06-18",
        interactionType: "email_response",
        interactionNote: "Interested in enterprise plan, scheduled demo for next week",
        tags: ["Enterprise", "Hot Lead", "CTO"],
        leadSource: "LinkedIn Scraper",
    },
    {
        id: "2",
        name: "Sarah Johnson",
        company: "StartupXYZ",
        position: "Product Manager",
        email: "sarah@startupxyz.com",
        phone: "+1-555-0456",
        linkedin: "linkedin.com/in/sarahj",
        location: "New York, NY",
        campaignId: "1",
        campaignName: "Q1 Lead Generation Campaign",
        status: "contacted",
        lastInteraction: "2025-06-17",
        interactionType: "email_sent",
        interactionNote: "First email sent, no response yet",
        tags: ["Product", "Startup"],
        leadSource: "Email Finder",
    },
    {
        id: "3",
        name: "Mike Chen",
        company: "InnovateLabs",
        position: "VP Engineering",
        email: "mike@innovatelabs.com",
        phone: "+1-555-0789",
        linkedin: "linkedin.com/in/mikechen",
        location: "Austin, TX",
        campaignId: "1",
        campaignName: "Q1 Lead Generation Campaign",
        status: "meeting_scheduled",
        lastInteraction: "2025-06-16",
        interactionType: "meeting_scheduled",
        interactionNote: "Very interested, meeting scheduled for Thursday 2pm",
        tags: ["VP", "Meeting Confirmed", "High Priority"],
        leadSource: "AI Personalization",
    },
    {
        id: "4",
        name: "Emily Rodriguez",
        company: "CreativeStudio",
        position: "Marketing Director",
        email: "emily@creativestudio.com",
        phone: "+1-555-0321",
        linkedin: "linkedin.com/in/emilyrodriguez",
        location: "Los Angeles, CA",
        campaignId: "2",
        campaignName: "Influencer Outreach for Product Launch",
        status: "negotiating",
        lastInteraction: "2025-06-18",
        interactionType: "proposal_sent",
        interactionNote: "Reviewing partnership proposal, very interested",
        tags: ["Influencer", "Marketing", "Partnership"],
        leadSource: "LinkedIn Scraper",
    },
    {
        id: "5",
        name: "David Kim",
        company: "TechStartup Inc",
        position: "Founder & CEO",
        email: "david@techstartup.com",
        phone: "+1-555-0654",
        linkedin: "linkedin.com/in/davidkim",
        location: "Seattle, WA",
        campaignId: "3",
        campaignName: "Partnership Development Initiative",
        status: "closed_won",
        lastInteraction: "2025-06-15",
        interactionType: "deal_closed",
        interactionNote: "Partnership agreement signed, onboarding next week",
        tags: ["CEO", "Partner", "Closed Won"],
        leadSource: "AI Personalization",
    },
    {
        id: "6",
        name: "Lisa Wang",
        company: "DataCorp",
        position: "Head of Engineering",
        email: "lisa@datacorp.com",
        phone: "+1-555-0987",
        linkedin: "linkedin.com/in/lisawang",
        location: "Boston, MA",
        campaignId: "4",
        campaignName: "Developer Talent Recruitment",
        status: "cold",
        lastInteraction: "2025-06-14",
        interactionType: "linkedin_connection",
        interactionNote: "Connected on LinkedIn, no response to initial message",
        tags: ["Engineering", "Data"],
        leadSource: "LinkedIn Scraper",
    },
    {
        id: "7",
        name: "Alex Thompson",
        company: "GrowthCo",
        position: "Growth Marketing Lead",
        email: "alex@growthco.com",
        phone: "+1-555-0147",
        linkedin: "linkedin.com/in/alexthompson",
        location: "Denver, CO",
        campaignId: "5",
        campaignName: "Content Promotion Campaign",
        status: "qualified",
        lastInteraction: "2025-06-18",
        interactionType: "phone_call",
        interactionNote: "Had 30min discovery call, qualified as good fit",
        tags: ["Growth", "Marketing", "Qualified"],
        leadSource: "Email Finder",
    },
    {
        id: "8",
        name: "Jennifer Lopez",
        company: "FinanceFlow",
        position: "CFO",
        email: "jennifer@financeflow.com",
        phone: "+1-555-0258",
        linkedin: "linkedin.com/in/jenniferlopez",
        location: "Miami, FL",
        campaignId: "1",
        campaignName: "Q1 Lead Generation Campaign",
        status: "closed_lost",
        lastInteraction: "2025-06-12",
        interactionType: "email_response",
        interactionNote: "Not interested at this time, budget constraints",
        tags: ["CFO", "Budget Issues", "Lost"],
        leadSource: "Company Data",
    }
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "responded": return "bg-blue-100 text-blue-800 border-blue-200";
        case "contacted": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "meeting_scheduled": return "bg-purple-100 text-purple-800 border-purple-200";
        case "negotiating": return "bg-orange-100 text-orange-800 border-orange-200";
        case "closed_won": return "bg-green-100 text-green-800 border-green-200";
        case "qualified": return "bg-teal-100 text-teal-800 border-teal-200";
        case "cold": return "bg-gray-100 text-gray-800 border-gray-200";
        case "closed_lost": return "bg-red-100 text-red-800 border-red-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case "responded": return <MessageSquare className="h-3 w-3" />;
        case "contacted": return <Mail className="h-3 w-3" />;
        case "meeting_scheduled": return <Calendar className="h-3 w-3" />;
        case "negotiating": return <AlertCircle className="h-3 w-3" />;
        case "closed_won": return <CheckCircle className="h-3 w-3" />;
        case "qualified": return <Star className="h-3 w-3" />;
        case "cold": return <Clock className="h-3 w-3" />;
        case "closed_lost": return <XCircle className="h-3 w-3" />;
        default: return <AlertCircle className="h-3 w-3" />;
    }
};

const getInteractionIcon = (type: string) => {
    switch (type) {
        case "email_sent": return <Mail className="h-4 w-4 text-blue-500" />;
        case "email_response": return <MessageSquare className="h-4 w-4 text-green-500" />;
        case "phone_call": return <Phone className="h-4 w-4 text-purple-500" />;
        case "linkedin_connection": return <Linkedin className="h-4 w-4 text-blue-600" />;
        case "meeting_scheduled": return <Calendar className="h-4 w-4 text-orange-500" />;
        case "proposal_sent": return <Mail className="h-4 w-4 text-indigo-500" />;
        case "deal_closed": return <CheckCircle className="h-4 w-4 text-green-600" />;
        default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
};

export default function ContactsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [campaignFilter, setCampaignFilter] = useState("all");
    const [sortBy, setSortBy] = useState("lastInteraction");

    const filteredContacts = mockContacts
        .filter(contact =>
            (contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.position.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === "all" || contact.status === statusFilter) &&
            (campaignFilter === "all" || contact.campaignId === campaignFilter)
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "lastInteraction":
                    return new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime();
                case "name":
                    return a.name.localeCompare(b.name);
                case "company":
                    return a.company.localeCompare(b.company);
                default:
                    return 0;
            }
        });

    const uniqueCampaigns = Array.from(new Set(mockContacts.map(c => ({ id: c.campaignId, name: c.campaignName }))))
        .filter((campaign, index, self) => self.findIndex(c => c.id === campaign.id) === index);

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
                        <p className="text-muted-foreground">Centralized CRM view of all leads across campaigns</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export CSV
                        </Button>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Contact
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search contacts by name, company, or position..."
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
                            <SelectItem value="responded">Responded</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="closed_won">Closed Won</SelectItem>
                            <SelectItem value="cold">Cold</SelectItem>
                            <SelectItem value="closed_lost">Closed Lost</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                        <SelectTrigger className="w-full sm:w-64">
                            <SelectValue placeholder="Filter by campaign" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Campaigns</SelectItem>
                            {uniqueCampaigns.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                    {campaign.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lastInteraction">Last Interaction</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="company">Company</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Contacts</CardTitle>
                        <CardDescription>
                            {filteredContacts.length} of {mockContacts.length} contacts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-medium">Contact</th>
                                        <th className="text-left p-4 font-medium">Campaign</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Last Interaction</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContacts.map((contact) => (
                                        <tr key={contact.id} className="border-b hover:bg-muted/25 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-primary">
                                                            {contact.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{contact.name}</p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Briefcase className="h-3 w-3" />
                                                            {contact.position}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <Building2 className="h-3 w-3" />
                                                            {contact.company}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" />
                                                            {contact.location}
                                                        </p>
                                                        <div className="flex gap-2 mt-1">
                                                            <Button variant="ghost" size="sm" asChild className="p-1 h-6">
                                                                <a href={`mailto:${contact.email}`}>
                                                                    <Mail className="h-3 w-3" />
                                                                </a>
                                                            </Button>
                                                            {contact.phone && (
                                                                <Button variant="ghost" size="sm" asChild className="p-1 h-6">
                                                                    <a href={`tel:${contact.phone}`}>
                                                                        <Phone className="h-3 w-3" />
                                                                    </a>
                                                                </Button>
                                                            )}
                                                            {contact.linkedin && (
                                                                <Button variant="ghost" size="sm" asChild className="p-1 h-6">
                                                                    <a href={`https://${contact.linkedin}`} target="_blank">
                                                                        <Linkedin className="h-3 w-3" />
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {contact.tags.slice(0, 2).map((tag) => (
                                                                <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                            {contact.tags.length > 2 && (
                                                                <Badge variant="outline" className="text-xs px-1 py-0">
                                                                    +{contact.tags.length - 2}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Link href={`/dashboard/campaign/${contact.campaignId}`}>
                                                    <Button variant="ghost" className="h-auto p-0 justify-start">
                                                        <div>
                                                            <p className="font-medium text-left">{contact.campaignName}</p>
                                                            <p className="text-sm text-muted-foreground">Campaign #{contact.campaignId}</p>
                                                        </div>
                                                    </Button>
                                                </Link>
                                            </td>
                                            <td className="p-4">
                                                <Badge className={`${getStatusColor(contact.status)} flex items-center gap-1 w-fit`}>
                                                    {getStatusIcon(contact.status)}
                                                    {contact.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </Badge>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-start gap-2">
                                                    {getInteractionIcon(contact.interactionType)}
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {new Date(contact.lastInteraction).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {contact.interactionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground max-w-xs truncate mt-1">
                                                            {contact.interactionNote}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <MessageSquare className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}