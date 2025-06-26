"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Search,
    Mail,
    Download,
    Briefcase
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ContactData {
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

export default function ContactsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [campaignFilter] = useState("all");
    const [sortBy, setSortBy] = useState("lastInteraction");
    const [contacts, setContacts] = useState<ContactData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/api/contacts');
            const data = await response.json();
            if (data.contacts) {
                setContacts(data.contacts);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts
        .filter(contact =>
            (contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (campaignFilter === "all" || contact.campaignId === campaignFilter)
        )
        .sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "ai_score":
                    return (b.ai_score || 0) - (a.ai_score || 0);
                default:
                    return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
            }
        });

    const getStatusBadge = (contact: ContactData) => {
        if (contact.responded) {
            return <Badge className="bg-green-100 text-green-800">Responded</Badge>;
        } else if (contact.contacted) {
            return <Badge className="bg-blue-100 text-blue-800">Contacted</Badge>;
        } else {
            return <Badge className="bg-gray-100 text-gray-800">Not Contacted</Badge>;
        }
    };

    if (loading) {
        return (
            <LoadingSpinner message="Loading dashboard..." />
        );
    }


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
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lastInteraction">Last Updated</SelectItem>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="ai_score">AI Score</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Contacts</CardTitle>
                        <CardDescription>
                            {filteredContacts.length} of {contacts.length} contacts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-medium">Contact</th>
                                        <th className="text-left p-4 font-medium">AI Score</th>
                                        <th className="text-left p-4 font-medium">Status</th>
                                        <th className="text-left p-4 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredContacts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                No contacts found. Add contacts from your campaigns to see them here.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredContacts.map((contact) => (
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
                                                            {contact.role && (
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                                    <Briefcase className="h-3 w-3" />
                                                                    {contact.role}
                                                                </p>
                                                            )}
                                                            {contact.description && (
                                                                <p className="text-xs text-muted-foreground mt-1 max-w-xs truncate">
                                                                    {contact.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <Badge variant="secondary" className="w-fit">
                                                            Score: {contact.ai_score || 0}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getStatusBadge(contact)}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1">
                                                        {contact.email && (
                                                            <div className="flex gap-2 mt-1">
                                                                <Button variant="ghost" size="sm" asChild className="p-1 h-6">
                                                                    <a href={`mailto:${contact.email}`}>
                                                                        <Mail className="h-3 w-3" />
                                                                    </a>
                                                                </Button>
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
            </div>
        </div>
    );
}