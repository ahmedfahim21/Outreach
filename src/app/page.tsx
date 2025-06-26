import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Bot,
  Zap,
  BarChart3,
  ArrowRight,
  Star,
  MessageSquare,
  Target,
  Wallet,
  HammerIcon,
} from "lucide-react";
import Image from "next/image";

export default function LandingPage() {
  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "AI-Powered Discovery",
      description: "Find potential podcast guests, influencers, and co-founders with intelligent candidate scoring",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Personalized Outreach",
      description: "Generate custom messages tailored to each prospect using advanced AI",
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      title: "Crypto Payments",
      description: "Integrated USDC and EURC payment processing using x402 technology",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Real-Time Analytics",
      description: "Track campaign performance with live streaming updates and detailed insights",
    },
    {
      icon: <HammerIcon className="h-6 w-6" />,
      title: "Advanced Tools",
      description: "Built-in tools for managing outreach, scheduling, and follow-ups with AI assistance",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Campaign Management",
      description: "Create, manage, and optimize outreach campaigns with budget tracking",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative px-4 py-20 md:py-40 h-screen overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url(/outreach-bg.png)] bg-cover bg-center blur-sm opacity-100" />
          <div className="absolute inset-0 bg-black/30 z-0" />

          <div className="relative max-w-7xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 px-4 py-2 backdrop-blur-md bg-white/10 text-white">
              <Star className="h-4 w-4 mr-2" />
              AI-Powered Outreach Platform
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">OutreachAI</h1>
            <h2 className="text-xl md:text-2xl text-white/70 mb-6 font-medium">
              AI Agents. Real Connections.
            </h2>

            <p className="text-xl md:text-2xl text-white/85 mb-8 max-w-3xl mx-auto leading-relaxed">
              Revolutionize your outreach with AI-powered candidate discovery, personalized messaging,
              and blockchain-based payment processing. All automated, all intelligent.
            </p>

            <Link href="/get-started">
              <Button className="text-lg px-16 group h-12">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to automate outreach</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to streamline your networking and business development process
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Built For Section */}
        <section className="px-4 py-2 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Built For</h3>
            <p className="text-lg text-muted-foreground">
              Podcasters, founders, marketers, researchers, recruiters — anyone who needs to connect with the right people fast.
            </p>
          </div>
        </section>

        
        <section className="p-8 text-center">
          <div className="max-w-5xl mx-auto justify-center flex flex-col items-center">
            <Image src="/architecture.jpeg" width={1000} height={600} alt="Agent Workflow" className="mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              Architecture Diagram: How OutreachAI connects AI agents, blockchain payments, and real-time analytics
            </p>
          </div>
        </section>
       

        {/* CTA Section */}
        <section className="px-4 py-20 w-full bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="shadow-none">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to transform your outreach?
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Join early adopters already using OutreachAI to discover prospects,
                  generate personalized messages, and close more deals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/get-started">
                    <Button size="lg" className="text-lg px-8 py-4 group">
                      Get Started Now
                      <Zap className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                      Video Demo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-8 bg-muted/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Image src="/outreachAI.png" alt="OutreachAI Logo" width={40} height={40} />
            <span className="text-lg font-semibold">OutreachAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Intelligent outreach automation platform powered by AI and crypto payments.
          </p>
        </div>
      </footer>
    </div>
  );
}
