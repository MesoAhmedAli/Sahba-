import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/use-websocket";
import Navigation from "@/components/navigation";
import { ArrowLeft, Calendar, MapPin, Users, Check, X, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import type { Event, EventRsvp, User, EventActivitySuggestion, Activity, PlanningItem } from "@shared/schema";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("details");

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
    enabled: !!id,
  });

  const { data: rsvps = [], isLoading: rsvpsLoading } = useQuery<(EventRsvp & { user: User })[]>({
    queryKey: ["/api/events", id, "rsvps"],
    enabled: !!id,
  });

  const { data: activitySuggestions = [] } = useQuery<(EventActivitySuggestion & { activity: Activity; votes: number })[]>({
    queryKey: ["/api/events", id, "activity-suggestions"],
    enabled: !!id,
  });

  const { data: planningItems = [] } = useQuery<PlanningItem[]>({
    queryKey: ["/api/events", id, "planning"],
    enabled: !!id,
  });

  // WebSocket connection for real-time updates
  useWebSocket(id, user?.id);

  const rsvpMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await apiRequest("POST", `/api/events/${id}/rsvp`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "rsvps"] });
      toast({
        title: "RSVP Updated",
        description: "Your response has been recorded!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const voteForActivityMutation = useMutation({
    mutationFn: async (suggestionId: string) => {
      const response = await apiRequest("POST", `/api/activity-suggestions/${suggestionId}/vote`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "activity-suggestions"] });
      toast({
        title: "Vote Recorded",
        description: "Thanks for voting!",
      });
    },
  });

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event not found</p>
          <Button onClick={() => navigate("/events")} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const userRsvp = rsvps.find(rsvp => rsvp.userId === user?.id);
  const goingCount = rsvps.filter(rsvp => rsvp.status === "going").length;
  const maybeCount = rsvps.filter(rsvp => rsvp.status === "maybe").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-100 text-emerald-700";
      case "planning": return "bg-amber-100 text-amber-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getRsvpColor = (status: string) => {
    switch (status) {
      case "going": return "bg-emerald-500 hover:bg-emerald-600";
      case "maybe": return "bg-amber-500 hover:bg-amber-600";
      case "not_going": return "bg-red-500 hover:bg-red-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navigation />
      
      <div className="pt-16">
        {/* Header */}
        <section className="px-4 py-6">
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/events")}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getStatusColor(event.status || "planning")}>
                  {event.status || "planning"}
                </Badge>
                {event.activityType && (
                  <Badge variant="outline">{event.activityType}</Badge>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Event Info */}
        <section className="px-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(event.startDate), "h:mm a")}
                      {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <p>{event.location}</p>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-gray-500" />
                  <p>
                    {goingCount} going{maybeCount > 0 && `, ${maybeCount} maybe`}
                  </p>
                </div>

                {event.description && (
                  <div className="pt-4 border-t">
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* RSVP Buttons */}
        <section className="px-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  onClick={() => rsvpMutation.mutate("going")}
                  disabled={rsvpMutation.isPending}
                  variant={userRsvp?.status === "going" ? "default" : "outline"}
                  className={userRsvp?.status === "going" ? getRsvpColor("going") : ""}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Going
                </Button>
                <Button
                  onClick={() => rsvpMutation.mutate("maybe")}
                  disabled={rsvpMutation.isPending}
                  variant={userRsvp?.status === "maybe" ? "default" : "outline"}
                  className={userRsvp?.status === "maybe" ? getRsvpColor("maybe") : ""}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Maybe
                </Button>
                <Button
                  onClick={() => rsvpMutation.mutate("not_going")}
                  disabled={rsvpMutation.isPending}
                  variant={userRsvp?.status === "not_going" ? "default" : "outline"}
                  className={userRsvp?.status === "not_going" ? getRsvpColor("not_going") : ""}
                >
                  <X className="w-4 h-4 mr-2" />
                  Can't Go
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tabs */}
        <section className="px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Attendees</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Who's Coming</CardTitle>
                  <CardDescription>
                    {goingCount} confirmed, {maybeCount} maybe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rsvpsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center space-x-3">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : rsvps.length > 0 ? (
                    <div className="space-y-3">
                      {rsvps.map(rsvp => (
                        <div key={rsvp.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {rsvp.user.profileImageUrl ? (
                              <img 
                                src={rsvp.user.profileImageUrl} 
                                alt={rsvp.user.firstName || "User"} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {(rsvp.user.firstName || "U")[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium">
                                {rsvp.user.firstName && rsvp.user.lastName 
                                  ? `${rsvp.user.firstName} ${rsvp.user.lastName}`
                                  : rsvp.user.firstName || "User"
                                }
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(rsvp.respondedAt), "MMM d")}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              rsvp.status === "going" ? "text-emerald-600 border-emerald-600" :
                              rsvp.status === "maybe" ? "text-amber-600 border-amber-600" :
                              "text-red-600 border-red-600"
                            }
                          >
                            {rsvp.status === "going" ? "Going" : 
                             rsvp.status === "maybe" ? "Maybe" : "Can't Go"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No responses yet. Be the first to RSVP!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Suggestions</CardTitle>
                  <CardDescription>
                    Vote for your favorite activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activitySuggestions.length > 0 ? (
                    <div className="space-y-3">
                      {activitySuggestions.map(suggestion => (
                        <div key={suggestion.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                {suggestion.activity.icon ? (
                                  <i className={`fas fa-${suggestion.activity.icon} text-indigo-600`}></i>
                                ) : (
                                  <span className="text-indigo-600 font-bold">
                                    {suggestion.activity.name[0]}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{suggestion.activity.name}</p>
                                <p className="text-sm text-gray-600">
                                  {suggestion.activity.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium">
                                {suggestion.votes} votes
                              </span>
                              <Button
                                size="sm"
                                onClick={() => voteForActivityMutation.mutate(suggestion.id)}
                                disabled={voteForActivityMutation.isPending}
                                className="gradient-bg text-white hover:opacity-90"
                              >
                                Vote
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No activity suggestions yet. Be the first to suggest one!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="planning" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Planning Board</CardTitle>
                  <CardDescription>
                    Collaborate on event planning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {planningItems.length > 0 ? (
                    <div className="space-y-3">
                      {planningItems.map(item => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{item.title}</p>
                              {item.content && (
                                <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                              )}
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {item.type}
                                </Badge>
                                {item.priority && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${
                                      item.priority === "high" ? "text-red-600 border-red-600" :
                                      item.priority === "medium" ? "text-amber-600 border-amber-600" :
                                      "text-gray-600 border-gray-600"
                                    }`}
                                  >
                                    {item.priority} priority
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {item.completed && (
                              <Check className="w-5 h-5 text-emerald-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No planning items yet. Start collaborating!
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
