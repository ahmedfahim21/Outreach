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
  WalletDropdownLink,
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
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-20 items-center">
        <div className="flex items-center gap-2 ml-4">
          <SidebarTrigger className="-ml-1" />
          <Link href="/dashboard/profile" className="flex items-center gap-2">
            <StarIcon className="inline-block mr-1 bg-primary text-secondary rounded-sm p-1" />
            <h1 className="inline font-semibold text-2xl text-secondary">
              {user.name}
            </h1>
          </Link>
        </div>
        <nav className="flex items-center space-x-4 justify-end ml-auto mr-4">
          <Link href="/dashboard/campaign/new" className="hidden md:inline">
            <Button variant="outline" className="h-11">
              <PlusIcon className="h-4 w-4" />
              Create New Campaign
            </Button>
          </Link>
          <Wallet className="flex items-center space-x-2">
            <ConnectWallet className="h-11 flex bg-primary hover:bg-primary-foreground text-secondary font-semibold rounded-sm transition-all duration-200">
              <Avatar className="h-6 w-6 mr-2" />
              <Name className="text-secondary font-medium text-md" />
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
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </nav>
      </div>
    </header>
  );
}
