import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, Lightbulb, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { loginWithGoogle } from "@/lib/firebase";
import LanguageSwitcher from "@/components/language-switcher";

export default function Landing() {
  const { t } = useTranslation();
  
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="px-4 py-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('app.name')}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <Button onClick={handleLogin} className="gradient-bg text-white hover:opacity-90">
              {t('auth.getStarted')}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-12 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          {t('landing.hero')}
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('landing.subtitle')}
        </p>
        <Button 
          onClick={handleLogin} 
          size="lg" 
          className="gradient-bg text-white hover:opacity-90 text-lg px-8 py-3"
        >
          {t('auth.startPlanning')}
        </Button>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to plan together</h3>
          <p className="text-lg text-gray-600">Powerful features designed for social planning</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">Smart Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Find the perfect time that works for everyone in your group with intelligent scheduling.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Friend Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Organize your friends into groups and make planning for different crowds effortless.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Activity Ideas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Get creative suggestions for activities based on your group size, location, and interests.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">Real-time Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Collaborate live with your friends on planning boards and see updates in real-time.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to make planning fun again?
          </h3>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of friends who are already planning amazing events together.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            variant="secondary"
            className="bg-white text-indigo-600 hover:bg-gray-50 text-lg px-8 py-3"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Sahba</span>
          </div>
          <p className="text-gray-600">Making social planning effortless and fun.</p>
        </div>
      </footer>
    </div>
  );
}
