"use client";

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
import { useAccount } from "wagmi";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Wallet as WalletIcon, Building2, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import prisma from "@/lib/prisma";

// Form schema
const formSchema = z.object({
    companyName: z.string().min(2, {
        message: "Company name must be at least 2 characters.",
    }),
    purpose: z.string({
        required_error: "Please select a purpose.",
    }),
    contactEmail: z.string().email({
        message: "Please enter a valid email address.",
    }),
    website: z.string().url().optional().or(z.literal("")),
});

export default function GetStartedPage() {
    const { address, isConnected } = useAccount();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            companyName: "",
            purpose: "",
            contactEmail: "",
            website: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitted(true);
        
        fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...values,
                walletAddress: address || "",
            }),
        })
    }

    const handleNext = () => {
        if (currentStep === 1 && isConnected) {
            setCurrentStep(2);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            
            <main className="relative flex items-center justify-center min-h-screen p-4 pt-20">
                <div className="w-full max-w-2xl">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-primary rounded-full text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4" />
                            Get Started in Minutes
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center">
                            {/* Step 1 */}
                            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-primary' : 'text-slate-400'}`}>
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                    isConnected 
                                        ? 'bg-primary border-primary text-white' 
                                        : currentStep >= 1 
                                            ? 'border-primary bg-blue-50' 
                                            : 'border-slate-300'
                                }`}>
                                    {isConnected ? <CheckCircle className="h-6 w-6" /> : <WalletIcon className="h-6 w-6" />}
                                </div>
                                <span className="text-sm font-medium mt-2">Connect</span>
                            </div>
                            
                            {/* Connector */}
                            <div className={`h-0.5 w-16 mx-4 transition-all duration-300 ${
                                currentStep >= 2 ? 'bg-primary' : 'bg-slate-300'
                            }`} />
                            
                            {/* Step 2 */}
                            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-primary' : 'text-slate-400'}`}>
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                    isSubmitted
                                        ? 'bg-green-600 border-green-600 text-white'
                                        : currentStep >= 2 
                                            ? 'border-primary bg-blue-50' 
                                            : 'border-slate-300'
                                }`}>
                                    {isSubmitted ? <CheckCircle className="h-6 w-6" /> : <Building2 className="h-6 w-6" />}
                                </div>
                                <span className="text-sm font-medium mt-2">Setup</span>
                            </div>
                        </div>
                    </div>

                    {isSubmitted ? (
                        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
                            <CardHeader className="text-center pb-6">
                                <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                                    <CheckCircle className="h-10 w-10 text-white" />
                                </div>
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    Welcome aboard! 
                                </CardTitle>
                                <CardDescription className="text-lg mt-2">
                                    Your account has been set up successfully. You&apos;re ready to explore the platform.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-700">Secure</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50rounded-lg">
                                        <Zap className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-700">Fast</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <Sparkles className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-slate-700">Modern</p>
                                    </div>
                                </div>
                                <Button 
                                    className="w-full h-12 bg-gradient-to-r from-primary to-tertiary hover:from-primary hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                                    onClick={() => window.location.href = '/protected'}
                                >
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Step 1: Connect Wallet */}
                            {currentStep === 1 && (
                                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
                                    <CardHeader className="text-center pb-6">
                                        <CardTitle className="text-2xl font-bold text-slate-900">
                                            Connect Your Wallet
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            Choose your preferred wallet to get started securely
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        {!isConnected ? (
                                            <div className="text-center">
                                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-tertiary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                    <WalletIcon className="h-12 w-12 text-white" />
                                                </div>
                                                <p className="text-slate-600 mb-8 text-lg">
                                                    Please connect your wallet to continue your journey
                                                </p>
                                                <div className="flex justify-center">
                                                    <Wallet>
                                                        <ConnectWallet>
                                                            <Avatar/>
                                                            <Name />
                                                        </ConnectWallet>
                                                        <WalletDropdown>
                                                            <Identity hasCopyAddressOnClick>
                                                                <Avatar />
                                                                <Name />
                                                                <Address />
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
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                                    <CheckCircle className="h-12 w-12 text-white" />
                                                </div>
                                                <Badge variant="secondary" className="bg-green-100 text-green-800px-4 py-2 text-sm font-semibold mb-4">
                                                    Wallet Connected Successfully
                                                </Badge>
                                                <div className="bg-slate-50 rounded-xl p-4 mb-8">
                                                    <p className="text-sm text-slate-600 mb-1">Connected Address:</p>
                                                    <p className="font-mono text-slate-900 font-medium">
                                                        {address?.slice(0, 8)}...{address?.slice(-8)}
                                                    </p>
                                                </div>
                                                <Button 
                                                    onClick={handleNext} 
                                                    className="w-full h-12 bg-gradient-to-r from-primary to-tertiary hover:from-primary hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    Continue to Company Details
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: Company Details Form */}
                            {currentStep === 2 && (
                                <Card className="border-0 shadow-2xl bg-white/80backdrop-blur-xl">
                                    <CardHeader className="pb-6">
                                        <CardTitle className="text-2xl font-bold text-slate-900">
                                            Company Details
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            Tell us about your company to personalize your experience
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="companyName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 font-semibold">
                                                                Company Name *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="Enter your company name" 
                                                                    className="h-12 border-slate-200 focus:border-blue-500 bg-white"
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="purpose"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 font-semibold">
                                                                Primary Purpose *
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-12 border-slate-200 focus:border-blue-500 bg-white">
                                                                        <SelectValue placeholder="Select your primary purpose" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="defi">💰 DeFi & Finance</SelectItem>
                                                                    <SelectItem value="nft">🎨 NFTs & Digital Assets</SelectItem>
                                                                    <SelectItem value="gaming">🎮 Gaming & Metaverse</SelectItem>
                                                                    <SelectItem value="marketplace">🛒 Marketplace</SelectItem>
                                                                    <SelectItem value="infrastructure">🏗️ Infrastructure</SelectItem>
                                                                    <SelectItem value="education">📚 Education & Learning</SelectItem>
                                                                    <SelectItem value="social">👥 Social & Community</SelectItem>
                                                                    <SelectItem value="other">🔧 Other</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="contactEmail"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 font-semibold">
                                                                Contact Email *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    type="email" 
                                                                    placeholder="Enter your email address" 
                                                                    className="h-12 border-slate-200 focus:border-blue-500 bg-white"
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="website"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 font-semibold">
                                                                Website (Optional)
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="https://yourcompany.com" 
                                                                    className="h-12 border-slate-200 focus:border-blue-500 bg-white"
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Separator className="my-8" />

                                                <div className="flex gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => setCurrentStep(1)}
                                                        className="flex-1 h-12 border-slate-200 hover:bg-slate-50"
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        className="flex-1 h-12 bg-gradient-to-r from-primary to-tertiary hover:from-primary hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                                    >
                                                        Complete Setup
                                                        <Sparkles className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}