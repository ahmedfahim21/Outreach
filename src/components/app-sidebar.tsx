"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
} from "@/components/ui/sidebar"
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownLink,
    WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from "@coinbase/onchainkit/identity";
import { CreditCardIcon, FlagIcon, PlusIcon, SettingsIcon, UserIcon } from "lucide-react"
import Image from "next/image"
import { Button } from "./ui/button"
import { useSelectedLayoutSegment } from "next/navigation";
import Link from "next/link";

export function AppSidebar() {

    const path = useSelectedLayoutSegment();

    return (
        <Sidebar>
            <SidebarHeader className="bg-background pb-5">
                <div className="flex items-center gap-2 m-4 text-secondary">
                    <Image src="/outreachAI.png" alt="Logo" width={40} height={40} />
                    <h1 className="text-xl font-semibold">OutreachAI</h1>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-background">
                <SidebarGroup>
                    <Button variant="secondary">
                        <PlusIcon className="mr-1" />
                        Create New Campaign
                    </Button>
                </SidebarGroup>
                <SidebarGroup>
                    <Link href="/dashboard/campaigns" className="w-full">
                        <Button
                            variant={path === "campaigns" ? "default" : "ghost"}
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
            </SidebarContent>

            <SidebarFooter className="bg-background">
                <hr className="border-secondary/20 my-1" />
                <Wallet className="w-full">
                    <ConnectWallet className="bg-primary hover:bg-primary-foreground text-secondary font-semibold rounded-sm transition-all duration-200 w-full">
                        <Avatar />
                        <Name className="text-secondary" />
                    </ConnectWallet>
                    <WalletDropdown>
                        <Identity hasCopyAddressOnClick>
                            <Avatar />
                            <Name />
                            <EthBalance />
                        </Identity>
                        <WalletDropdownLink
                            icon="wallet"
                            href="https://keys.coinbase.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Wallet
                        </WalletDropdownLink>
                    </WalletDropdown>
                </Wallet>
            </SidebarFooter>
        </Sidebar>
    )
}