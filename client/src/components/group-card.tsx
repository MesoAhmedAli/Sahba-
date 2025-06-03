import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, MoreHorizontal } from "lucide-react";
import type { Group, Event } from "@shared/schema";

interface GroupCardProps {
  group: Group;
  showEvents?: boolean;
}

export default function GroupCard({ group, showEvents = false }: GroupCardProps) {
  const { data: groupEvents = [] } = useQuery<Event[]>({
    queryKey: ["/api/groups", group.id, "events"],
    enabled: showEvents,
  });

  const getGroupInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getGroupGradient = (name: string) => {
    const gradients = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
      "from-rose-500 to-pink-500",
      "from-indigo-500 to-purple-500",
      "from-green-500 to-emerald-500",
      "from-red-500 to-rose-500",
    ];
    
    // Use name hash to consistently assign gradient
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const upcomingEvents = groupEvents.filter(event => 
    new Date(event.startDate) > new Date()
  ).length;

  const activeEvents = groupEvents.filter(event => 
    event.status === "confirmed" || event.status === "planning"
  ).length;

  return (
    <Card className="card-hover border border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getGroupGradient(group.name)} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <span className="text-white font-bold text-sm">
              {getGroupInitials(group.name)}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">{group.name}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Members</span>
              </div>
              {showEvents && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{activeEvents} active events</span>
                </div>
              )}
            </div>
            
            {group.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {group.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Online indicator placeholder */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <span className="text-xs text-gray-500 font-medium">Offline</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                // Future: dropdown menu for group actions
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {upcomingEvents > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {upcomingEvents} upcoming event{upcomingEvents !== 1 ? 's' : ''}
              </span>
              <Badge variant="outline" className="text-xs">
                Active
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
