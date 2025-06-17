import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { OnChainProviders } from "@/providers/onchainkit";
import { AuthProvider } from "@/contexts/auth-context";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'OutreachAI'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${urbanist.variable} antialiased`}
      >
        <OnChainProviders>
          <AuthProvider>
            {children}
          </AuthProvider>
        </OnChainProviders>
      </body>
    </html>
  );
}