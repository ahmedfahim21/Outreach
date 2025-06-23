"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Rocket } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

const searchIntentTemplates = [
  { id: "influencer", name: "Influencer Outreach", description: "Connect with industry influencers" },
  { id: "partnership", name: "Partnership Building", description: "Establish business partnerships" },
  { id: "custom", name: "Custom Template", description: "Create your own outreach strategy" },
];

const USDC_EURC = 0.87;

const budgetTools = [
  { id: "email-finder", name: "Email Finder", description: "Find verified email addresses" , priceInUSDC: 0.2, priceInEURC: USDC_EURC * 0.2 },
  { id: "linkedin-scraper", name: "LinkedIn Scraper", description: "Extract LinkedIn profiles and contacts", priceInUSDC: 0.5, priceInEURC: USDC_EURC * 0.5 },
  { id: "email-sequence", name: "Email Sequence", description: "Automated email sequences", priceInUSDC: 0.3, priceInEURC: USDC_EURC * 0.3 },
  { id: "webinar-hosting", name: "Meet Hosting", description: "Host Meeting with Client", priceInUSDC: 0.4, priceInEURC: USDC_EURC * 0.4 },
];

const skillsOptions = [
  "Software Development", "Marketing", "Sales", "Design", "Data Science", "Product Management",
  "Customer Success", "HR", "Finance", "Operations", "Content Creation", "Social Media"
];

const campaignFormSchema = z.object({
  searchIntent: z.string().min(1, {
    message: "Please select a search intent template.",
  }),
  customSearchIntent: z.string().optional(),
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
  autoNegotiation: z.boolean(),
  autoFollowups: z.boolean(),
}).refine(
  (data) => {
    if (data.searchIntent === "custom") {
      return data.customSearchIntent && data.customSearchIntent.length >= 10;
    }
    return true;
  },
  {
    message: "Custom search intent must be at least 10 characters when using custom template.",
    path: ["customSearchIntent"],
  }
);

export default function NewCampaignPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      searchIntent: "",
      customSearchIntent: "",
      campaignTitle: "",
      campaignDescription: "",
      targetSkills: [],
      selectedTools: [],
      autoNegotiation: false,
      autoFollowups: false,
    },
  });

  const watchedValues = form.watch();

  const totalBudget = watchedValues.selectedTools?.reduce((total, toolId) => {
    const tool = budgetTools.find(t => t.id === toolId);
    return total + (tool?.priceInUSDC || 0);
  }, 0.5) || 0.5;

  const handleSkillToggle = (skill: string) => {
    const currentSkills = form.getValues("targetSkills");
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];
    form.setValue("targetSkills", newSkills);
  };

  const handleToolToggle = (toolId: string) => {
    const currentTools = form.getValues("selectedTools");
    const newTools = currentTools.includes(toolId)
      ? currentTools.filter(t => t !== toolId)
      : [...currentTools, toolId];
    form.setValue("selectedTools", newTools);
  };

  const onSubmit = async (values: z.infer<typeof campaignFormSchema>) => {
    setIsSubmitting(true);
    try {
      const userId = user!.id;

      const campaignData = {
        userId,
        title: values.campaignTitle,
        description: values.campaignDescription,
        searchIntent: values.searchIntent,
        customSearchIntent: values.customSearchIntent,
        targetSkills: values.targetSkills,
        selectedTools: values.selectedTools,
        totalBudgetInUSDC: totalBudget,
        totalBudgetInEURC: parseFloat((totalBudget * USDC_EURC).toFixed(2)),
        autoNegotiation: values.autoNegotiation,
        autoFollowups: values.autoFollowups
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
      console.error('Error creating campaign:', error);
      setError('An unexpected error occurred');
      console.error('Error creating campaign:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 text-secondary">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">Launch a new outreach campaign using predefined templates or custom needs</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Choose Search Intent Template</CardTitle>
                <CardDescription>Select a template that matches your outreach goals or create a custom one</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="searchIntent"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {searchIntentTemplates.map((template) => (
                            <div
                              key={template.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${field.value === template.id
                                  ? 'border-primary bg-primary'
                                  : 'border-border hover:border-primary/50'
                                }`}
                              onClick={() => field.onChange(template.id)}
                            >
                              <h3 className="font-semibold text-sm">{template.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedValues.searchIntent === 'custom' && (
                  <FormField
                    control={form.control}
                    name="customSearchIntent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Describe your search intent</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Find startup founders in the fintech space for partnership opportunities..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>Give your campaign a name and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="campaignTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Q1 Lead Generation Campaign"
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
                      <FormLabel>Campaign Description</FormLabel>
                      <FormControl>
                        <textarea
                          className="w-full p-3 border border-input rounded-md bg-background text-foreground min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="Describe your campaign goals, target audience, and key messaging..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Target Filters</CardTitle>
                <CardDescription>Define your target audience and campaign parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skills */}
                <FormField
                  control={form.control}
                  name="targetSkills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Skills & Expertise</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2">
                          {skillsOptions.map((skill) => (
                            <Badge
                              key={skill}
                              variant={field.value.includes(skill) ? "default" : "outline"}
                              className="cursor-pointer hover:bg-primary/20"
                              onClick={() => handleSkillToggle(skill)}
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget & Tool Selection</CardTitle>
                <CardDescription>Choose the tools and features for your campaign</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="selectedTools"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {budgetTools.map((tool) => (
                            <div
                              key={tool.id}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${field.value.includes(tool.id)
                                  ? 'border-primary bg-primary'
                                  : 'border-border hover:border-primary'
                                }`}
                              onClick={() => handleToolToggle(tool.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-sm">{tool.name}</h3>
                                <div className="flex space-x-1">
                                  <Badge>{tool.priceInUSDC} USDC</Badge>
                                  <span className="text-xs self-center text-muted-foreground">or</span>
                                  <Badge variant="outline">{tool.priceInEURC.toFixed(2)} EURC</Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{tool.description}</p>
                              <div className="mt-2">
                                <input
                                  type="checkbox"
                                  checked={field.value.includes(tool.id)}
                                  onChange={() => handleToolToggle(tool.id)}
                                  className="sr-only"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-background rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Budget Estimate:</span>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-secondary">{totalBudget} USDC</span>
                      <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs px-1.5 py-0.5 bg-muted rounded-full text-muted-foreground">OR</span>
                      <span className="text-sm font-medium">{(totalBudget * USDC_EURC).toFixed(2)} EURC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Automation Features</CardTitle>
                <CardDescription>Enable automated features to streamline your outreach</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="autoNegotiation"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h5 className="font-semibold text-sm">Auto-Negotiation</h5>
                          <p className="text-xs text-muted-foreground">Let AI handle price negotiations and deal terms</p>
                        </div>
                        <FormControl>
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-primary' : 'bg-gray-200'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoFollowups"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h5 className="font-semibold text-sm">Auto-Follow-ups</h5>
                          <p className="text-xs text-muted-foreground">Automatically send follow-up messages based on responses</p>
                        </div>
                        <FormControl>
                          <button
                            type="button"
                            onClick={() => field.onChange(!field.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${field.value ? 'bg-primary' : 'bg-gray-200'
                              }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${field.value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                          </button>
                        </FormControl>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="px-8 py-3 text-lg justify-center w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Campaign...' : 'Launch Campaign Agent'}
              <Rocket className="ml-2 h-5 w-5 inline-block" />
            </Button>
          </form>
        </Form>
        {error && (
          <div className="text-red-500 text-center mt-4">
            <p>Error creating campaign: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}