"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-auth-redirect";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Link from "next/link";
import { PlusIcon, StarIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Avatar,
  Name,
  Identity,
  EthBalance,
} from "@coinbase/onchainkit/identity";

export function Header() {
  const { user } = useAuth();
  const { shouldRender } = useRequireAuth();

  if (!shouldRender || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-3 mx-4">
          <SidebarTrigger className="-ml-1 hover:bg-muted/80 transition-colors" />
          <Link href="/dashboard/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-primary text-secondary rounded-lg p-2">
              <StarIcon className="w-4 h-4" />
            </div>
            <h1 className="font-semibold text-xl text-foreground">
              {user.name}
            </h1>
          </Link>
        </div>
        <nav className="flex items-center space-x-3 justify-end ml-auto mr-4">
          <Link href="/dashboard/campaign/new" className="hidden md:inline">
            <Button variant="outline" className="h-10 px-4 border-border hover:bg-muted/80 transition-all duration-200">
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </Link>
          <Wallet>
            <ConnectWallet className="h-10 flex bg-primary hover:bg-primary/90 text-secondary font-medium rounded-md transition-all duration-200 px-4 border-0">
              <Avatar className="h-5 w-5 mr-2" />
              <Name className="text-secondary font-medium text-sm" />
            </ConnectWallet>
            <WalletDropdown className="bg-background border border-border shadow-lg rounded-lg">
              <Identity 
                hasCopyAddressOnClick 
                className="p-3 hover:bg-muted/50 transition-colors rounded-t-lg"
              >
                <Avatar className="h-8 w-8" />
                <div className="ml-3 flex flex-col">
                  <Name className="text-foreground font-medium text-sm" />
                  <EthBalance className="text-muted-foreground text-xs" />
                </div>
              </Identity>
              <WalletDropdownDisconnect className="p-3 w-full text-left hover:bg-muted/50 transition-colors text-destructive font-medium text-sm border-t border-border rounded-b-lg" />
            </WalletDropdown>
          </Wallet>
        </nav>
      </div>
    </header>
  );
}
