"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar"
import { ChevronLeft, CreditCardIcon, FlagIcon, PersonStanding, PlusIcon, SettingsIcon, UserIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "./ui/button"
import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

export function AppSidebar() {

    const path = useSelectedLayoutSegment();

    return (
        <Sidebar>
            <SidebarHeader className="bg-background">
                <div className="flex items-center gap-2 m-4 text-secondary">
                    <Image src="/outreachAI.png" alt="Logo" width={40} height={40} />
                    <h1 className="text-xl font-semibold">OutreachAI</h1>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-background">
                <SidebarGroup className="h-6">
                    {path && (
                        <Link href="/dashboard" className="flex items-center text-secondary transition-colors mb-2 px-2 py-1 rounded-md hover:bg-secondary/10">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Back to Dashboard</span>
                        </Link>
                    )}
                </SidebarGroup>
                <SidebarGroup>
                    <Link href="/dashboard/campaign/new" className="w-full px-3">
                        <Button variant="secondary" className="h-12 w-full">
                            <PlusIcon className="mr-1" />
                            Create New Campaign
                        </Button>
                    </Link>
                </SidebarGroup>
                <SidebarGroup>
                    <Link href="/dashboard/campaign" className="w-full">
                        <Button
                            variant={path === "campaign" ? "default" : "ghost"}
                            className="w-full justify-start"
                        >
                            <FlagIcon className="mr-2 w-4 h-4" />
                            Campaigns
                        </Button>
                    </Link>
                </SidebarGroup>
                <SidebarGroup>
                    <Link href="/dashboard/contacts" className="w-full">
                        <Button
                            variant={path === "contacts" ? "default" : "ghost"}
                            className="w-full justify-start"
                        >
                            <UserIcon className="mr-2 w-4 h-4" />
                            Contacts
                        </Button>
                    </Link>
                </SidebarGroup>
                <SidebarGroup>
                    <Link href="/dashboard/configuration" className="w-full">
                        <Button
                            variant={path === "configuration" ? "default" : "ghost"}
                            className="w-full justify-start"
                        >
                            <SettingsIcon className="mr-2 w-4 h-4" />
                            Configuration
                        </Button>
                    </Link>
                </SidebarGroup>
                <SidebarGroup>
                    <Link href="/dashboard/billing" className="w-full">
                        <Button
                            variant={path === "billing" ? "default" : "ghost"}
                            className="w-full justify-start"
                        >
                            <CreditCardIcon className="mr-2 w-4 h-4" />
                            Billing
                        </Button>
                    </Link>
                </SidebarGroup>
                <SidebarGroup>
                    <Link href="/dashboard/profile" className="w-full">
                        <Button
                            variant={path === "profile" ? "default" : "ghost"}
                            className="w-full justify-start"
                        >
                            <PersonStanding className="mr-2 w-4 h-4" />
                            Profile
                        </Button>
                    </Link>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-background border-t text-secondary text-xs text-center py-2">
                    <span>© 2025 OutreachAI</span>
            </SidebarFooter>
        </Sidebar>
    )
}