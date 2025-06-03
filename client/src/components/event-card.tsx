import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import type { Event } from "@shared/schema";

interface EventCardProps {
  event: Event;
  isPast?: boolean;
}

export default function EventCard({ event, isPast = false }: EventCardProps) {
  const [, navigate] = useLocation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-100 text-emerald-700";
      case "planning": return "bg-amber-100 text-amber-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getActivityIcon = (activityType?: string) => {
    if (!activityType) return "fas fa-calendar-alt";
    
    const type = activityType.toLowerCase();
    if (type.includes("music") || type.includes("concert")) return "fas fa-music";
    if (type.includes("food") || type.includes("dinner") || type.includes("restaurant")) return "fas fa-utensils";
    if (type.includes("game") || type.includes("gaming")) return "fas fa-gamepad";
    if (type.includes("sport") || type.includes("fitness")) return "fas fa-running";
    if (type.includes("art") || type.includes("creative")) return "fas fa-paint-brush";
    if (type.includes("outdoor") || type.includes("hiking")) return "fas fa-mountain";
    if (type.includes("party") || type.includes("celebration")) return "fas fa-birthday-cake";
    
    return "fas fa-calendar-alt";
  };

  const getActivityGradient = (activityType?: string) => {
    if (!activityType) return "from-indigo-500 to-purple-500";
    
    const type = activityType.toLowerCase();
    if (type.includes("music") || type.includes("concert")) return "from-indigo-500 to-purple-500";
    if (type.includes("food") || type.includes("dinner") || type.includes("restaurant")) return "from-amber-500 to-orange-500";
    if (type.includes("game") || type.includes("gaming")) return "from-emerald-500 to-teal-500";
    if (type.includes("sport") || type.includes("fitness")) return "from-blue-500 to-cyan-500";
    if (type.includes("art") || type.includes("creative")) return "from-rose-500 to-pink-500";
    if (type.includes("outdoor") || type.includes("hiking")) return "from-green-500 to-emerald-500";
    if (type.includes("party") || type.includes("celebration")) return "from-amber-500 to-orange-500";
    
    return "from-indigo-500 to-purple-500";
  };

  const formatEventDate = (date: string | Date) => {
    const eventDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    
    if (eventDateOnly.getTime() === today.getTime()) {
      return `Today • ${format(eventDate, "h:mm a")}`;
    } else if (eventDateOnly.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return `Tomorrow • ${format(eventDate, "h:mm a")}`;
    } else {
      return `${format(eventDate, "MMM d")} • ${format(eventDate, "h:mm a")}`;
    }
  };

  return (
    <Card className={`card-hover border border-gray-100 ${isPast ? "opacity-75" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getActivityGradient(event.activityType)} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <i className={`${getActivityIcon(event.activityType)} text-white`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1 truncate">{event.title}</h4>
                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{formatEventDate(event.startDate)}</span>
                </div>
                {event.location && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {/* Placeholder for attendee avatars - will be populated via API */}
                    <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                      <Users className="w-3 h-3 text-gray-600" />
                    </div>
                  </div>
                  <Badge className={getStatusColor(event.status || "planning")}>
                    {event.status || "planning"}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Future: dropdown menu for event actions
                }}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Click handler for navigation */}
        <Button
          variant="ghost"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onClick={() => navigate(`/events/${event.id}`)}
        >
          <span className="sr-only">View event details</span>
        </Button>
      </CardContent>
    </Card>
  );
}
