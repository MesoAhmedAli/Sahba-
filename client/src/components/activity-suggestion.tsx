import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Activity } from "@shared/schema";

interface ActivitySuggestionProps {
  activity: Activity;
  onSuggest?: (activityId: string) => void;
}

export default function ActivitySuggestion({ activity, onSuggest }: ActivitySuggestionProps) {
  const getActivityIcon = (category?: string, icon?: string) => {
    if (icon) return `fas fa-${icon}`;
    
    if (!category) return "fas fa-lightbulb";
    
    const cat = category.toLowerCase();
    if (cat.includes("outdoor") || cat.includes("sports")) return "fas fa-hiking";
    if (cat.includes("indoor") || cat.includes("games")) return "fas fa-gamepad";
    if (cat.includes("food") || cat.includes("dining")) return "fas fa-utensils";
    if (cat.includes("creative") || cat.includes("art")) return "fas fa-paint-brush";
    if (cat.includes("music") || cat.includes("entertainment")) return "fas fa-music";
    if (cat.includes("social") || cat.includes("party")) return "fas fa-users";
    if (cat.includes("learning") || cat.includes("education")) return "fas fa-book";
    if (cat.includes("fitness") || cat.includes("health")) return "fas fa-dumbbell";
    if (cat.includes("nature") || cat.includes("adventure")) return "fas fa-mountain";
    if (cat.includes("photography")) return "fas fa-camera";
    
    return "fas fa-lightbulb";
  };

  const getActivityGradient = (category?: string) => {
    if (!category) return "from-indigo-500 to-purple-500";
    
    const cat = category.toLowerCase();
    if (cat.includes("outdoor") || cat.includes("sports")) return "from-green-500 to-emerald-500";
    if (cat.includes("indoor") || cat.includes("games")) return "from-emerald-500 to-teal-500";
    if (cat.includes("food") || cat.includes("dining")) return "from-amber-500 to-orange-500";
    if (cat.includes("creative") || cat.includes("art")) return "from-rose-500 to-pink-500";
    if (cat.includes("music") || cat.includes("entertainment")) return "from-purple-500 to-indigo-500";
    if (cat.includes("social") || cat.includes("party")) return "from-pink-500 to-rose-500";
    if (cat.includes("learning") || cat.includes("education")) return "from-blue-500 to-indigo-500";
    if (cat.includes("fitness") || cat.includes("health")) return "from-red-500 to-pink-500";
    if (cat.includes("nature") || cat.includes("adventure")) return "from-green-600 to-emerald-600";
    if (cat.includes("photography")) return "from-amber-500 to-yellow-500";
    
    return "from-indigo-500 to-purple-500";
  };

  const getParticipantText = () => {
    if (activity.minParticipants && activity.maxParticipants) {
      return `${activity.minParticipants}-${activity.maxParticipants} people`;
    } else if (activity.minParticipants) {
      return `${activity.minParticipants}+ people`;
    } else if (activity.maxParticipants) {
      return `Up to ${activity.maxParticipants} people`;
    }
    return "Any group size";
  };

  const getCostDisplay = () => {
    switch (activity.cost) {
      case "free": return "Free";
      case "low": return "$";
      case "medium": return "$$";
      case "high": return "$$$";
      default: return "";
    }
  };

  const handleSuggest = () => {
    if (onSuggest) {
      onSuggest(activity.id);
    }
  };

  return (
    <Card className="activity-card card-hover border border-gray-100">
      <CardContent className="p-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${getActivityGradient(activity.category)} rounded-lg flex items-center justify-center mb-3`}>
          <i className={`${getActivityIcon(activity.category, activity.icon)} text-white`}></i>
        </div>
        
        <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
          {activity.name}
        </h4>
        
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {activity.description || getParticipantText()}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          {activity.category && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {activity.category}
            </span>
          )}
          {activity.cost && (
            <span className="text-xs font-medium text-emerald-600">
              {getCostDisplay()}
            </span>
          )}
        </div>
        
        <Button 
          onClick={handleSuggest}
          className="w-full bg-white border border-gray-200 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Suggest to Group
        </Button>
      </CardContent>
    </Card>
  );
}
