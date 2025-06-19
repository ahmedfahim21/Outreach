"use client";

import { useAuth } from "@/contexts/auth-context";
import { useRequireAuth } from "@/hooks/use-auth-redirect";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function ProfilePage() {
  const { user } = useAuth();
  const { shouldRender, isLoading } = useRequireAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!shouldRender || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your registered details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                <p className="text-sm font-mono bg-muted p-2 rounded w-fit">
                  {user.walletAddress}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Account created:</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Last updated:</span>
                <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
