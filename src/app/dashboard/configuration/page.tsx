"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Search, Settings, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

interface GoogleConnectionStatus {
  connected: boolean;
  email?: string;
  name?: string;
  scope?: string;
}

export default function ConfigurationPage() {
  const { user } = useAuth();
  const [services] = useState<ServiceConfig[]>([
    {
      id: "gmail",
      name: "Gmail",
      description: "Connect your Gmail account to enable email outreach and management",
      icon: <Mail className="w-8 h-8 text-red-500" />,
      features: ["Send emails", "Read emails", "Email templates", "Bulk sending"]
    },
    {
      id: "google-search",
      name: "Google Search",
      description: "Integrate Google Search to find prospect information and research",
      icon: <Search className="w-8 h-8 text-blue-500" />,
      features: ["Search prospects", "Research companies", "Find contact info", "Market insights"]
    }
  ]);

  const [googleStatus, setGoogleStatus] = useState<GoogleConnectionStatus>({
    connected: false
  });
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkGoogleStatus();
    }
  }, [user?.id]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    
    if (success) {
      setGoogleStatus(prev => ({ ...prev, connected: true }));
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
    } else if (error) {
      console.error('OAuth error:', error);
      setIsConnecting(false);
    }
  }, []);

  const checkGoogleStatus = async () => {
    try {
      const response = await fetch(`/api/auth/google/status?userId=${user?.id}`);
      if (response.ok) {
        const status = await response.json();
        setGoogleStatus(status);
      }
    } catch (error) {
      console.error('Failed to check Google status:', error);
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

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Configuration</h1>
          <p className="text-gray-600">
            Connect and configure your tools to enhance your outreach capabilities
          </p>
        </div>

        {/* Google Connection Status */}
        <Card className="mb-8 border-2 border-dashed border-tertiary bg-background shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Google Account Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {googleStatus.connected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <span className="text-green-700 font-medium">Connected to Google</span>
                      {googleStatus.email && (
                        <p className="text-sm text-gray-600">{googleStatus.email}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-amber-700 font-medium">Not Connected</span>
                  </>
                )}
              </div>
              {!googleStatus.connected && (
                <Button 
                  onClick={handleGoogleConnect}
                  disabled={isConnecting}
                  className="flex items-center gap-2"
                >
                  <span>{isConnecting ? 'Connecting...' : 'Connect Google Account'}</span>
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