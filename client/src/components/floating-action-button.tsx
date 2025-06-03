import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";

export default function FloatingActionButton() {
  const [, navigate] = useLocation();

  const handleClick = () => {
    navigate("/create-event");
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-14 h-14 gradient-bg rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all duration-300 animate-bounce-subtle z-40"
      size="icon"
    >
      <Plus className="w-6 h-6" />
      <span className="sr-only">Create new event</span>
    </Button>
  );
}
