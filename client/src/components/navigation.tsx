import { useAuth } from "@/hooks/useAuth";
import { Bell, Home, Calendar, Users, User, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./language-switcher";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t('app.name')}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">U</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="flex items-center justify-around py-2">
          <Link href="/">
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center py-2 px-4 ${
                isActive("/") ? "text-indigo-600" : "text-gray-400 hover:text-indigo-600"
              } transition-colors`}
            >
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{t('navigation.home')}</span>
            </Button>
          </Link>
          
          <Link href="/events">
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center py-2 px-4 ${
                isActive("/events") ? "text-indigo-600" : "text-gray-400 hover:text-indigo-600"
              } transition-colors`}
            >
              <Calendar className="w-5 h-5 mb-1" />
              <span className="text-xs">{t('navigation.events')}</span>
            </Button>
          </Link>
          
          <Link href="/groups">
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center py-2 px-4 ${
                isActive("/groups") ? "text-indigo-600" : "text-gray-400 hover:text-indigo-600"
              } transition-colors`}
            >
              <Users className="w-5 h-5 mb-1" />
              <span className="text-xs">{t('navigation.groups')}</span>
            </Button>
          </Link>
          
          <Link href="/profile">
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center py-2 px-4 ${
                isActive("/profile") ? "text-indigo-600" : "text-gray-400 hover:text-indigo-600"
              } transition-colors`}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">{t('navigation.profile')}</span>
            </Button>
          </Link>
        </div>
      </nav>
    </>
  );
}
