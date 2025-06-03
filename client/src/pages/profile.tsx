import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/navigation";
import { User, LogOut, Settings, Bell, Shield } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      
      <div className="pt-16">
        {/* Header */}
        <section className="px-4 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile</h2>
          <p className="text-gray-600">Manage your account and preferences</p>
        </section>

        {/* Profile Info */}
        <section className="px-4 mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-xl">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.firstName || "User"
                    }
                  </CardTitle>
                  <CardDescription>
                    {user?.email || "No email provided"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* Settings */}
        <section className="px-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-gray-500">Manage your notification preferences</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Privacy</p>
                    <p className="text-sm text-gray-500">Control who can see your information</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Account Actions */}
        <section className="px-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account settings and data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleLogout}
                variant="destructive" 
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* App Info */}
        <section className="px-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Sahba</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">Version 1.0.0</p>
              <p className="text-xs text-gray-400">
                Making social planning effortless and fun.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
