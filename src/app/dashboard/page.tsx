"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-auth-redirect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardPage() {
  const { user } = useAuth();
  const { shouldRender, isLoading } = useRequireAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!shouldRender || !user) {
    return null; // Will redirect in useRequireAuth hook
  }


  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
            <p className="text-muted-foreground">Manage your outreach campaigns</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Your company information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Company:</strong> {user.companyName}
                </div>
                <div>
                  <strong>Email:</strong> {user.contactEmail}
                </div>
                <div>
                  <strong>Purpose:</strong> 
                  <Badge variant="secondary" className="ml-2">
                    {user.purpose}
                  </Badge>
                </div>
                <div>
                  <strong>Wallet:</strong> 
                  <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                    {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
              <CardDescription>Your campaign overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Active Campaigns:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Sent:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Response Rate:</span>
                  <span className="font-semibold">0%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Account created on {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}