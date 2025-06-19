"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Settings, CheckCircle, AlertCircle } from "lucide-react";

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
  enabled: boolean;
  features: string[];
}

export default function ConfigurationPage() {
  const [services, setServices] = useState<ServiceConfig[]>([
    {
      id: "gmail",
      name: "Gmail",
      description: "Connect your Gmail account to enable email outreach and management",
      icon: <Mail className="w-8 h-8 text-red-500" />,
      connected: false,
      enabled: false,
      features: ["Send emails", "Read emails", "Email templates", "Bulk sending"]
    },
    {
      id: "google-search",
      name: "Google Search",
      description: "Integrate Google Search to find prospect information and research",
      icon: <Search className="w-8 h-8 text-blue-500" />,
      connected: false,
      enabled: false,
      features: ["Search prospects", "Research companies", "Find contact info", "Market insights"]
    }
  ]);

  const [userConfig, setUserConfig] = useState({
    googleConnected: false,
    gmailEnabled: false,
    searchEnabled: false
  });


  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Configuration</h1>
          <p className="text-gray-600">
            Connect and configure your tools to enhance your outreach capabilities
          </p>
        </div>

        {/* Google Connection Status */}
        <Card className="mb-8 border-2 border-dashed border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Google Account Connection
            </CardTitle>
            <CardDescription>
              Connect your Google account to enable Gmail and Google Search integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {userConfig.googleConnected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">Connected to Google</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-amber-700 font-medium">Not Connected</span>
                  </>
                )}
              </div>
              {!userConfig.googleConnected && (
                <Button className="flex items-center gap-2">
                  <span>Connect Google Account</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="relative overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {service.icon}
                    <div>
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.connected ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        Not Connected
                      </Badge>
                    )}
                    {service.enabled && (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Enabled
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    {!service.connected ? (
                      <Button 
                        className="w-full"
                      >
                        Connect Google Account First
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button 
                            variant={service.enabled ? "outline" : "default"}
                            className="flex-1"
                          >
                            {service.enabled ? "Disable Service" : "Enable Service"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3"
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Configuration */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>
              Configure advanced settings for your integrated services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">Email Sending Limits</h4>
                  <p className="text-sm text-gray-600">
                    Configure daily email sending limits to avoid hitting Gmail quotas
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <h4 className="font-medium">Search Preferences</h4>
                  <p className="text-sm text-gray-600">
                    Set default search parameters and filters
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h4 className="font-medium">Data Privacy</h4>
                  <p className="text-sm text-gray-600">
                    Manage data retention and privacy settings
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}