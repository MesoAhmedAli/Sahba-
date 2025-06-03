import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function FloatingActionButton() {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate("/create-event");
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-20 right-6 w-16 h-16 gradient-bg rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 group"
      size="icon"
    >
      <div className="relative">
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
        <Sparkles className="w-4 h-4 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <span className="sr-only">Create new event</span>
    </Button>
  );
}
