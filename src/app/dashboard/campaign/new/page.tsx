"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  FileText,
  DollarSign,
  Target,
  Zap,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  CreditCard,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";
import Image from "next/image";


const USDC_EURC = 0.87;

const budgetTools = [
  {
    id: "google-search",
    name: "Google Search & Scrape",
    description: "Search Google and scrape website data",
    image: "/logos/google.webp",
    priceInUSDC: 0.3,
    priceInEURC: USDC_EURC * 0.3,
    requiresGoogle: false
  },
  {
    id: "youtube-scraper",
    name: "YouTube Channel Scraper",
    description: "Search and scrape YouTube channel data",
    image: "/logos/youtube.png",
    priceInUSDC: 0.4,
    priceInEURC: USDC_EURC * 0.4,
    requiresGoogle: false
  },
  {
    id: "content-generation",
    name: "Generate Outreach Content",
    description: "AI-powered personalized outreach content",
    image: "/logos/bedrock.png",
    priceInUSDC: 0.2,
    priceInEURC: USDC_EURC * 0.2,
    requiresGoogle: false
  },
  {
    id: "send-emails",
    name: "Send Emails",
    description: "Automated email sending",
    image: "/logos/gmail.webp",
    priceInUSDC: 0.3,
    priceInEURC: USDC_EURC * 0.3,
    requiresGoogle: true
  },
  {
    id: "email-followups",
    name: "Follow Up on Emails",
    description: "Automated email follow-ups",
    image: "/logos/gmail.webp",
    priceInUSDC: 0.2,
    priceInEURC: USDC_EURC * 0.2,
    dependsOn: "send-emails",
    requiresGoogle: true
  },
  {
    id: "meet-calendar",
    name: "Google Meet & Calendar",
    description: "Schedule meetings and manage calendar",
    image: "/logos/google-meet.webp",
    priceInUSDC: 0.4,
    priceInEURC: USDC_EURC * 0.4,
    requiresGoogle: true
  },
  {
    id: "negotiate-payments",
    name: "Negotiate & Make Payments",
    description: "AI-powered negotiation and payment processing",
    image: "/logos/cdp.webp",
    priceInUSDC: 0.5,
    priceInEURC: USDC_EURC * 0.5,
    requiresGoogle: false
  },
];

const skillsOptions = [
  { name: "Software Development", icon: "💻" },
  { name: "Marketing", icon: "📈" },
  { name: "Sales", icon: "💼" },
  { name: "Design", icon: "🎨" },
  { name: "Data Science", icon: "📊" },
  { name: "Product Management", icon: "🚀" },
  { name: "Customer Success", icon: "🤝" },
  { name: "HR", icon: "👥" },
  { name: "Finance", icon: "💰" },
  { name: "Operations", icon: "⚙️" },
  { name: "Content Creation", icon: "✍️" },
  { name: "Social Media", icon: "📱" }
];

const campaignFormSchema = z.object({
  campaignTitle: z.string().min(2, {
    message: "Campaign title must be at least 2 characters.",
  }),
  campaignDescription: z.string().min(10, {
    message: "Campaign description must be at least 10 characters.",
  }),
  targetSkills: z.array(z.string()).min(1, {
    message: "Please select at least one skill.",
  }),
  selectedTools: z.array(z.string()).min(1, {
    message: "Please select at least one tool.",
  }),
  totalBudgetForOutreach: z.number().min(50, {
    message: "Total budget for outreach must be at least 50 USDC.",
  }),
});

export default function NewCampaignPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleStatus, setGoogleStatus] = useState<{ connected: boolean; email?: string; name?: string }>({ connected: false });
  const [isConnecting, setIsConnecting] = useState(false);
  const [checkingGoogleStatus, setCheckingGoogleStatus] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      campaignTitle: "",
      campaignDescription: "",
      targetSkills: [],
      selectedTools: [],
      totalBudgetForOutreach: 50,
    },
  });

  const watchedValues = form.watch();

  const totalBudget = watchedValues.selectedTools?.reduce((total, toolId) => {
    const tool = budgetTools.find(t => t.id === toolId);
    return total + (tool?.priceInUSDC || 0);
  }, 0.5) || 0.5;

  const needsGoogleConnection = watchedValues.selectedTools?.some(toolId => {
    const tool = budgetTools.find(t => t.id === toolId);
    return tool?.requiresGoogle;
  });

  const isSubmitDisabled = isSubmitting || (needsGoogleConnection && !googleStatus.connected);

  // Check Google status on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      checkGoogleStatus();
    }
  }, [user?.id]);

  // Re-check Google status when tools selection changes to include Google-required tools
  useEffect(() => {
    if (needsGoogleConnection && user?.id) {
      checkGoogleStatus();
    }
  }, [needsGoogleConnection, user?.id]);

  // Re-check Google status when component gains focus (user returns from auth)
  useEffect(() => {
    const handleFocus = () => {
      if (needsGoogleConnection && user?.id) {
        checkGoogleStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [needsGoogleConnection, user?.id]);

  const handleSkillToggle = (skill: string) => {
    const currentSkills = form.getValues("targetSkills");
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    form.setValue("targetSkills", newSkills);
  };

  const handleToolToggle = (toolId: string) => {
    const currentTools = form.getValues("selectedTools");
    const tool = budgetTools.find(t => t.id === toolId);

    if (currentTools.includes(toolId)) {
      const newTools = currentTools.filter(t => {
        const toolItem = budgetTools.find(bt => bt.id === t);
        return t !== toolId && toolItem?.dependsOn !== toolId;
      });
      form.setValue("selectedTools", newTools);
    } else {
      // Adding tool - check dependencies
      let newTools = [...currentTools, toolId];
      if (tool?.dependsOn && !currentTools.includes(tool.dependsOn)) {
        newTools = [...newTools, tool.dependsOn];
      }
      form.setValue("selectedTools", newTools);
    }
  };

  const checkGoogleStatus = async () => {
    if (!user?.id) return;

    setCheckingGoogleStatus(true);
    try {
      const response = await fetch(`/api/auth/google/status?userId=${user.id}`);
      if (response.ok) {
        const status = await response.json();
        setGoogleStatus(status);
      }
    } catch (error) {
      console.error('Failed to check Google status:', error);
    } finally {
      setCheckingGoogleStatus(false);
    }
  };

  const handleGoogleConnect = async () => {
    if (!user?.id) return;

    setIsConnecting(true);
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          feature: 'calendar'
        })
      });

      if (response.ok) {
        const { authUrl } = await response.json();
        window.location.href = authUrl;
      } else {
        throw new Error('Failed to get auth URL');
      }
    } catch (error) {
      console.error('Failed to initiate Google auth:', error);
      setIsConnecting(false);
    }
  };

  const handlePayment = async () => {
    // if (!form.formState.isValid) {
    //   // Trigger validation
    //   form.trigger();
    //   return;
    // }

    const formData = form.getValues();

    // Create campaign first
    setIsSubmitting(true);
    try {
      const userId = user!.id;
      console.log("Creating campaign for user:", userId);

      const campaignData = {
        userId,
        title: formData.campaignTitle,
        description: formData.campaignDescription,
        targetSkills: formData.targetSkills,
        selectedTools: formData.selectedTools,
        totalBudgetInUSDC: totalBudget,
        totalBudgetInEURC: parseFloat((totalBudget * USDC_EURC).toFixed(2)),
        totalBudgetForOutreach: formData.totalBudgetForOutreach,
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem('pendingCampaignId', result.campaignId);
        router.push(`/paywall?campaignId=${result.campaignId}`);
      } else {
        console.error('Failed to create campaign:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof campaignFormSchema>) => {
    console.log("Form submitted with values:", values);
    handlePayment();
  };

  return (
    <div className="min-h-screen bg-background p-6 text-foreground max-w-6xl mx-auto">
      <div className="mx-auto space-y-8">
        {/* Enhanced Header */}
        <motion.div
          className="text-center space-y-6 py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1
            className="text-4xl font-bold text-secondary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Create New Campaign
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Launch a new outreach campaign using predefined templates or custom needs
          </motion.p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Enhanced Campaign Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-lime-200/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6" style={{ color: "rgb(179,224,31)" }} />
                    <CardTitle className="text-xl">Campaign Details</CardTitle>
                  </div>
                  <CardDescription>Start your campaign by telling us what you want to achieve</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="campaignTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 text-base">
                          <FileText className="h-4 w-4" style={{ color: "rgb(179,224,31)" }} />
                          <span>Campaign Title</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Q1 Lead Generation Campaign"
                            className="transition-all duration-200 focus:scale-[1.01] focus:border-lime-300"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="campaignDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 text-base">
                          <FileText className="h-4 w-4" style={{ color: "rgb(179,224,31)" }} />
                          <span>Campaign Description</span>
                        </FormLabel>
                        <FormControl>
                          <motion.textarea
                            className="w-full p-4 border border-input rounded-lg text-foreground min-h-[120px] resize-none focus:outline-none focus:ring-2 transition-all duration-200 focus:scale-[1.01] focus:border-lime-300 focus:ring-lime-300/50"
                            placeholder="Can you find me 5 startup founders in the fintech space who'll be interested to participate in my podcast?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Target Filters */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-lime-200/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Target className="h-6 w-6" style={{ color: "rgb(179,224,31)" }} />
                    <CardTitle className="text-xl">Target Filters</CardTitle>
                  </div>
                  <CardDescription>Define your target audience and campaign parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="targetSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-wrap gap-3">
                            {skillsOptions.map((skill, index) => (
                              <motion.div
                                key={skill.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Badge
                                  variant={field.value.includes(skill.name) ? "default" : "outline"}
                                  className={`cursor-pointer transition-all duration-200 px-4 py-2 text-sm ${field.value.includes(skill.name)
                                      ? 'shadow-lg'
                                      : 'hover:shadow-md border-lime-200 hover:border-lime-300'
                                    }`}
                                  style={{
                                    backgroundColor: field.value.includes(skill.name) ? "rgb(179,224,31)" : undefined,
                                    color: field.value.includes(skill.name) ? "black" : undefined,
                                    borderColor: !field.value.includes(skill.name) ? "rgba(179,224,31,0.3)" : undefined
                                  }}
                                  onClick={() => handleSkillToggle(skill.name)}
                                >
                                  <span className="mr-2 text-base">{skill.icon}</span>
                                  {skill.name}
                                  {field.value.includes(skill.name) && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 500 }}
                                    >
                                      <CheckCircle2 className="h-3 w-3 ml-2" />
                                    </motion.div>
                                  )}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Google Connection Warning */}
            {needsGoogleConnection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className={`border-amber-300/50 ${googleStatus.connected ? 'border-green-300/50' : ''}`}
                  style={{ backgroundColor: googleStatus.connected ? "rgba(34,197,94,0.1)" : "rgba(255,193,7,0.1)" }}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      {checkingGoogleStatus ? (
                        <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                      ) : googleStatus.connected ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                      )}
                      <h3 className={`font-semibold text-lg ${checkingGoogleStatus
                          ? 'text-blue-800'
                          : googleStatus.connected
                            ? 'text-green-800'
                            : 'text-amber-800'
                        }`}>
                        {checkingGoogleStatus
                          ? 'Checking Google Account...'
                          : googleStatus.connected
                            ? 'Google Account Connected'
                            : 'Google Account Required'}
                      </h3>
                    </div>

                    {checkingGoogleStatus ? (
                      <div className="space-y-2">
                        <p className="text-blue-700">
                          Verifying your Google account connection...
                        </p>
                      </div>
                    ) : googleStatus.connected ? (
                      <div className="space-y-2">
                        <p className="text-green-700">
                          Connected as: <span className="font-medium">{googleStatus.email}</span>
                        </p>
                        <p className="text-green-700text-sm">
                          Your selected tools are ready to use with your Google account.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-amber-700">
                          Some selected tools require Google account integration for email sending, calendar management, and follow-ups.
                        </p>
                        <Button
                          type="button"
                          onClick={handleGoogleConnect}
                          disabled={isConnecting}
                          className="bg-amber-500 hover:bg-amber-600 text-white transition-all duration-200"
                        >
                          {isConnecting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Connect Google Account
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Enhanced Tool Selection */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Zap className="h-6 w-6" style={{ color: "rgb(179,224,31)" }} />
                    <CardTitle className="text-xl">Budget & Tool Selection</CardTitle>
                  </div>
                  <CardDescription>Choose the tools and features for your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="selectedTools"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {budgetTools.map((tool, index) => {
                              const isDisabled = tool.dependsOn && !field.value.includes(tool.dependsOn);

                              return (
                                <motion.div
                                  key={tool.id}
                                  initial={{ opacity: 0, y: 30 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: index * 0.1 }}
                                  whileTap={{ scale: isDisabled ? 1 : 0.98 }}
                                  className={`group relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 ${field.value.includes(tool.id)
                                      ? 'shadow-lg'
                                      : isDisabled
                                        ? 'border-border/50 bg-muted/50 cursor-not-allowed opacity-50'
                                        : 'border-border hover:border-lime-300/70'
                                    }`}
                                  style={{
                                    borderColor: field.value.includes(tool.id) ? "rgb(179,224,31)" : undefined,
                                    backgroundColor: field.value.includes(tool.id) ? "rgba(179,224,31,0.1)" : undefined
                                  }}
                                  onClick={() => !isDisabled && handleToolToggle(tool.id)}
                                >
                                  <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center space-x-3">
                                        <Image src={tool.image} alt={tool.name} width={24} height={24} />
                                        <h3 className="font-semibold text-base">{tool.name}</h3>
                                      </div>
                                      {field.value.includes(tool.id) && (
                                        <motion.div
                                          initial={{ scale: 0, rotate: -180 }}
                                          animate={{ scale: 1, rotate: 0 }}
                                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        >
                                          <CheckCircle2 className="h-5 w-5" style={{ color: "rgb(179,224,31)" }} />
                                        </motion.div>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{tool.description}</p>
                                    {tool.dependsOn && (
                                      <div className="flex items-center space-x-2 mb-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "rgb(179,224,31)" }}></div>
                                        <p className="text-xs font-medium" style={{ color: "rgb(179,224,31)" }}>
                                          Requires: {budgetTools.find(t => t.id === tool.dependsOn)?.name}
                                        </p>
                                      </div>
                                    )}
                                    {tool.requiresGoogle && (
                                      <div className="flex items-center space-x-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                        <p className="text-xs text-amber-600 font-medium">
                                          Requires Google Account
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex space-x-3 mt-4">
                                      <Badge
                                        className="px-3 py-1 text-sm font-medium bg-primary text-secondary"
                                      >
                                        {tool.priceInUSDC.toFixed(2)} USDC
                                      </Badge>
                                      <span className="text-xs self-center text-muted-foreground font-medium m-0">or</span>
                                      <Badge
                                        variant="outline"
                                        className="px-3 py-1 text-sm"
                                      >
                                        {tool.priceInEURC.toFixed(2)} EURC
                                      </Badge>
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Enhanced Budget Display */}
                  <motion.div
                    className="p-6 rounded-xl border-2"
                    style={{
                      backgroundColor: "rgba(179,224,31,0.1)",
                      borderColor: "rgba(179,224,31,0.3)"
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5" style={{ color: "rgb(179,224,31)" }} />
                        <span className="font-semibold text-lg">Total Budget Estimate:</span>
                      </div>
                      <div className="flex flex-col items-end">
                        {totalBudget.toFixed(2)} USDC
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">OR</span>
                          <span className="text-base font-medium text-secondary">{(totalBudget * USDC_EURC).toFixed(2)} EURC</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Outreach Budget Input */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Card className="hover:shadow-lg transition-shadow border-lime-200/20">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-6 w-6" style={{ color: "rgb(179,224,31)" }} />
                    <CardTitle className="text-xl">Outreach Budget</CardTitle>
                  </div>
                  <CardDescription>Set your budget for reaching out to potential contacts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="totalBudgetForOutreach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 text-base">
                          <CreditCard className="h-4 w-4" style={{ color: "rgb(179,224,31)" }} />
                          <span>Total Budget for Outreach (USDC)</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              min={50}
                              className="pl-12 py-6 text-lg transition-all duration-200 focus:scale-[1.01] focus:border-lime-300"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                              value={field.value}
                            />
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <DollarSign className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </div>
                        </FormControl>
                        <p className="text-sm text-muted-foreground mt-2">
                          This budget will be used for paying contacts, negotiating rates, and processing payments.
                          <span className="font-medium"> Minimum 50 USDC required.</span>
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <motion.div
                    className="flex items-center space-x-3 p-4 rounded-lg bg-primary/10 border border-primary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Sparkles className="h-5 w-5 text-secondary" />
                    <p className="text-sm text-secondary">
                      This budget is separate from tool costs and will be used specifically for payments to contacts.
                    </p>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Button
                type="submit"
                variant="default"
                size="lg"
                className="relative px-10 py-6 text-xl font-semibold justify-center w-full h-16 overflow-hidden group transition-all duration-300"
                disabled={isSubmitDisabled}
              >
                <div className="relative flex items-center space-x-3">
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-12 w-12" />
                      <span>Creating Campaign...</span>
                    </>
                  ) : needsGoogleConnection && !googleStatus.connected ? (
                    <>
                      <AlertCircle className="h-12 w-12" />
                      <span>Connect Google Account Required</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-12 w-12" />
                      <span>Proceed to Pay & Launch Campaign</span>
                    </>
                  )}
                </div>
              </Button>
            </motion.div>
          </form>
        </Form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="p-6 bg-red-50 border-2 border-red-200 rounded-xl"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center justify-center space-x-3">
                <motion.div
                  className="p-2 bg-red-100 rounded-full"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  <AlertCircle className="h-5 w-5 text-red-600 " />
                </motion.div>
                <p className="text-red-700 font-medium">
                  Error creating campaign: {error}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}