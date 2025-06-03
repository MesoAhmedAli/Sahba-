import { useEffect, useRef } from "react";
import { useAuth } from "./useAuth";

export function useWebSocket(eventId?: string, userId?: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!eventId || !userId || !user) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      // Join the event room
      ws.send(JSON.stringify({
        type: "join-event",
        eventId,
        userId,
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        switch (data.type) {
          case "user-joined":
            console.log(`User ${data.userId} joined event ${data.eventId}`);
            break;
          case "planning-update":
            console.log("Planning board updated:", data.update);
            // You could trigger a query invalidation here if needed
            break;
          case "activity-suggestion":
            console.log("New activity suggestion:", data.suggestion);
            // You could trigger a query invalidation here if needed
            break;
          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Cleanup on unmount or dependency change
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [eventId, userId, user]);

  // Function to send messages
  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { sendMessage };
}
