"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Rocket } from "lucide-react";

const searchIntentTemplates = [
  { id: "lead-gen", name: "Lead Generation", description: "Find potential customers and clients" },
  { id: "influencer", name: "Influencer Outreach", description: "Connect with industry influencers" },
  { id: "partnership", name: "Partnership Building", description: "Establish business partnerships" },
  { id: "recruitment", name: "Talent Recruitment", description: "Find and hire top talent" },
  { id: "content-promo", name: "Content Promotion", description: "Promote your content and campaigns" },
  { id: "custom", name: "Custom Template", description: "Create your own outreach strategy" },
];

const budgetTools = [
  { id: "email-finder", name: "Email Finder", price: 2, description: "Find verified email addresses" },
  { id: "linkedin-scraper", name: "LinkedIn Scraper", price: 5, description: "Extract LinkedIn profiles" },
  { id: "company-data", name: "Company Data", price: 3, description: "Get detailed company information" },
  { id: "social-media", name: "Social Media Intel", price: 4, description: "Social media insights and data" },
  { id: "ai-personalization", name: "AI Personalization", price: 6, description: "AI-powered message personalization" },
  { id: "analytics", name: "Advanced Analytics", price: 8, description: "Detailed campaign analytics" },
];

const geographyOptions = [
  "United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "Japan", "Global"
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
  geography: z.string().min(1, {
    message: "Please select a geography.",
  }),
  audienceSize: z.string().min(1, {
    message: "Please select an audience size.",
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
  const form = useForm<z.infer<typeof campaignFormSchema>>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      searchIntent: "",
      customSearchIntent: "",
      campaignTitle: "",
      campaignDescription: "",
      targetSkills: [],
      geography: "",
      audienceSize: "",
      selectedTools: [],
      autoNegotiation: false,
      autoFollowups: false,
    },
  });

  const watchedValues = form.watch();
  
  const totalBudget = watchedValues.selectedTools?.reduce((total, toolId) => {
    const tool = budgetTools.find(t => t.id === toolId);
    return total + (tool?.price || 0);
  }, 0) || 0;

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

  const onSubmit = (values: z.infer<typeof campaignFormSchema>) => {
    console.log("Campaign data:", values);
    console.log("Total budget per contact:", totalBudget);
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
                              className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                field.value === template.id 
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

                <Separator />

                <FormField
                  control={form.control}
                  name="geography"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geography</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target geography" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {geographyOptions.map((geo) => (
                            <SelectItem key={geo} value={geo.toLowerCase()}>{geo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audienceSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Audience Size</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="small">Small (1-100 contacts)</SelectItem>
                          <SelectItem value="medium">Medium (100-500 contacts)</SelectItem>
                          <SelectItem value="large">Large (500-1000 contacts)</SelectItem>
                          <SelectItem value="enterprise">Enterprise (1000+ contacts)</SelectItem>
                        </SelectContent>
                      </Select>
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
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                field.value.includes(tool.id) 
                                  ? 'border-primary bg-primary' 
                                  : 'border-border hover:border-primary'
                              }`}
                              onClick={() => handleToolToggle(tool.id)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-sm">{tool.name}</h3>
                                <Badge>${tool.price}/contact</Badge>
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
                    <span className="text-lg font-bold text-secondary">${totalBudget}/contact</span>
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              field.value ? 'bg-primary' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                field.value ? 'translate-x-6' : 'translate-x-1'
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
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              field.value ? 'bg-primary' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                field.value ? 'translate-x-6' : 'translate-x-1'
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
              >
                Launch Campaign Agent
                <Rocket className="ml-2 h-5 w-5 inline-block" />
              </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}