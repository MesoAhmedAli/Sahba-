import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/navigation";
import EventCard from "@/components/event-card";
import ActivitySuggestion from "@/components/activity-suggestion";
import GroupCard from "@/components/group-card";
import FloatingActionButton from "@/components/floating-action-button";
import { CalendarDays, Users } from "lucide-react";
import type { Event, Group, Activity } from "@shared/schema";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/user/stats"],
    enabled: !!user,
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: !!user,
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ["/api/groups"],
    enabled: !!user,
  });

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    enabled: !!user,
  });

  const upcomingEvents = events
    .filter(event => new Date(event.startDate) > new Date())
    .slice(0, 3)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const randomActivities = activities
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const recentGroups = groups.slice(0, 3);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      
      <div className="pt-16">
        {/* Welcome Section */}
        <section className="px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Good morning, {user?.firstName || "Friend"}! 👋
            </h2>
            <p className="text-gray-600">
              {statsLoading ? "Loading your stats..." : `You have ${stats?.upcomingEvents || 0} upcoming events this week`}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-8 mb-2" />
                    ) : (
                      <p className="text-2xl font-bold text-indigo-600">{stats?.upcomingEvents || 0}</p>
                    )}
                    <p className="text-sm text-gray-600">Upcoming Events</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-8 mb-2" />
                    ) : (
                      <p className="text-2xl font-bold text-emerald-600">{stats?.friendGroups || 0}</p>
                    )}
                    <p className="text-sm text-gray-600">Friend Groups</p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <button className="text-indigo-600 font-medium text-sm">View All</button>
          </div>

          {eventsLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
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
                <p className="text-gray-600 mb-4">No upcoming events yet</p>
                <p className="text-sm text-gray-500">Create your first event to get started!</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Activity Suggestions */}
        <section className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity Suggestions</h3>
            <button className="text-indigo-600 font-medium text-sm">
              <i className="fas fa-refresh mr-1"></i>Refresh
            </button>
          </div>

          {activitiesLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="border border-gray-100">
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {randomActivities.map(activity => (
                <ActivitySuggestion key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </section>

        {/* Your Groups */}
        <section className="px-4 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Groups</h3>
            <button className="text-indigo-600 font-medium text-sm">
              <i className="fas fa-plus mr-1"></i>New Group
            </button>
          </div>

          {groupsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="border border-gray-100">
                  <CardContent className="p-4">
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentGroups.length > 0 ? (
            <div className="space-y-3">
              {recentGroups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <Card className="border border-gray-100">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No groups yet</p>
                <p className="text-sm text-gray-500">Create or join a group to start planning events!</p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      <FloatingActionButton />
    </div>
  );
}
