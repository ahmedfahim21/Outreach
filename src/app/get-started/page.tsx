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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Wallet as WalletIcon, Building2, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

// Form schema
const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    })
});

export default function GetStartedPage() {
    const { address, isConnected } = useAccount();
    const { user, isLoading, setUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: ""
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
        .then(response => response.json())
        .then(data => {
            if (data && !data.error) {
                setUser(data);
            } else {
                console.error("Error creating user:", data.error);
                setIsSubmitted(false);
            }
        })
        .catch(error => {
            console.error("Error creating user:", error);
            setIsSubmitted(false);
        });
    }

    useEffect(() => {
        if (user && isConnected) {
            router.push('/dashboard');
        } else if (isConnected && address && !isLoading) {
            setCurrentStep(2);
        }
    }, [user, isConnected, address, isLoading, router]);

    const handleNext = () => {
        if (currentStep === 1 && isConnected && !user) {
            setCurrentStep(2);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="relative flex items-center justify-center min-h-screen p-4 pt-12">
                <div className="w-full max-w-2xl">
                    <div className="flex flex-row items-between justify-center mb-6">
                        <Image src="/outreachAI.png" alt="Outreach AI Logo" width={90} height={90}/>
                        <h4 className="text-2xl items-center my-auto ml-2">
                            OutreachAI
                        </h4>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center">
                            {/* Step 1 */}
                            <div className={`flex flex-col items-center ${currentStep >= 1 ? 'text-secondary' : 'text-tertiary'}`}>
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                    isConnected 
                                        ? 'bg-primary border-primary text-secondary' 
                                        : currentStep >= 1 
                                            ? 'border-primary bg-tertiary' 
                                            : 'border-tertiary'
                                }`}>
                                    {isConnected ? <CheckCircle className="h-6 w-6" /> : <WalletIcon className="h-6 w-6" />}
                                </div>
                                <span className="text-sm font-medium mt-2">Connect</span>
                            </div>
                            
                            {/* Connector */}
                            <div className={`h-0.5 w-16 mx-4 transition-all duration-300 ${
                                currentStep >= 2 ? 'bg-primary' : 'bg-tertiary'
                            }`} />
                            
                            {/* Step 2 */}
                            <div className={`flex flex-col items-center ${currentStep >= 2 ? 'text-secondary' : 'text-slate-400'}`}>
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                    isSubmitted
                                        ? 'bg-primary border-primary text-secondary'
                                        : currentStep >= 2 
                                            ? 'border-primary bg-tertiary' 
                                            : 'border-tertiary'
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
                                <CardTitle className="text-3xl font-bold text-secondary">
                                    Welcome aboard! 
                                </CardTitle>
                                <CardDescription className="text-md mt-2">
                                    Your account has been set up successfully. You&apos;re ready to explore the platform.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Button 
                                    className="w-full h-12 bg-primary hover:bg-primary-foreground text-secondary font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                                    onClick={() => router.push('/dashboard')}
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
                                <Card className="bg-white">
                                    <CardHeader className="text-center pb-6">
                                        <CardTitle className="text-2xl font-bold text-secondary">
                                            Connect Your Wallet
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            Choose your preferred wallet to get started securely
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <div className="flex justify-center">
                                                    <Wallet>
                                                        <ConnectWallet className="bg-primary hover:bg-primary-foreground text-secondary font-semibold rounded-sm transition-all duration-200">
                                                            <Avatar/>
                                                            <Name className="text-secondary" />
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
                                        {isConnected && (
                                            <div className="text-center">
                                                <Badge variant="secondary" className="bg-primary/50 text-teritiary px-4 py-2 text-xs rounded-full mb-4">
                                                    Wallet Connected Successfully
                                                </Badge>
                                                <Button 
                                                    onClick={handleNext} 
                                                    className="w-full h-12 bg-primary hover:bg-primary-foreground text-secondary font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                                                >
                                                    Continue to Fill Details
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Step 2: Details Form */}
                            {currentStep === 2 && (
                                <Card className="bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-2xl font-bold text-slate-900">
                                            Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 font-semibold">
                                                                Name *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    placeholder="Enter your name" 
                                                                    className="h-12 border-secondary/10 focus:border-primary bg-white"
                                                                    {...field} 
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-slate-700 font-semibold">
                                                                Contact Email *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input 
                                                                    type="email" 
                                                                    placeholder="Enter your email address" 
                                                                    className="h-12 border-secondary/10 focus:border-primary bg-white"
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
                                                        className="flex-1 h-12 border-secondary/10 hover:bg-slate-50"
                                                    >
                                                        Back
                                                    </Button>
                                                    <Button 
                                                        type="submit" 
                                                        className="flex-1 h-12 bg-primary hover:bg-primary-foreground text-secondary font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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