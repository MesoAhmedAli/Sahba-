import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import EventCard from "@/components/event-card";
import { CalendarDays, Plus } from "lucide-react";
import { useLocation } from "wouter";
import type { Event } from "@shared/schema";

export default function Events() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const pastEvents = events
    .filter(event => new Date(event.startDate) <= new Date())
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      
      <div className="pt-16">
        {/* Header */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Events</h2>
              <p className="text-gray-600">Manage your upcoming and past events</p>
            </div>
            <Button 
              onClick={() => navigate("/create-event")}
              className="gradient-bg text-white hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="px-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border border-gray-100">
                  <CardContent className="p-4">
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="border border-gray-100">
              <CardContent className="p-8 text-center">
                <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No upcoming events</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first event or wait for friends to invite you!
                </p>
                <Button 
                  onClick={() => navigate("/create-event")}
                  className="gradient-bg text-white hover:opacity-90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="px-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Past Events</h3>
            <div className="space-y-4">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} isPast />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
