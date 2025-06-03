import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Events from "@/pages/events";
import Groups from "@/pages/groups";
import Profile from "@/pages/profile";
import CreateEvent from "@/pages/create-event";
import EventDetails from "@/pages/event-details";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/events" component={Events} />
          <Route path="/groups" component={Groups} />
          <Route path="/profile" component={Profile} />
          <Route path="/create-event" component={CreateEvent} />
          <Route path="/events/:id" component={EventDetails} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial language direction
    const savedLanguage = localStorage.getItem('language') || 'en';
    if (savedLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  }, []);

  return (
    <>
      <Toaster />
      <Router />
    </>
  );
}

export default App;
