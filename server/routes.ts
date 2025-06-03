import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertGroupSchema,
  insertEventSchema,
  insertEventRsvpSchema,
  insertActivitySuggestionSchema,
  insertPlanningItemSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User stats
  app.get('/api/user/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Group routes
  app.post('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(validatedData, userId);
      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getUserGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get('/api/groups/:id/members', isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getGroupMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching group members:", error);
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  app.post('/api/groups/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.joinGroup(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  // Event routes
  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData, userId);
      res.json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.get('/api/groups/:id/events', isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getEventsByGroup(req.params.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching group events:", error);
      res.status(500).json({ message: "Failed to fetch group events" });
    }
  });

  // RSVP routes
  app.post('/api/events/:id/rsvp', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEventRsvpSchema.parse({
        ...req.body,
        eventId: req.params.id,
      });
      const rsvp = await storage.updateEventRsvp(validatedData, userId);
      res.json(rsvp);
    } catch (error) {
      console.error("Error updating RSVP:", error);
      res.status(500).json({ message: "Failed to update RSVP" });
    }
  });

  app.get('/api/events/:id/rsvps', isAuthenticated, async (req, res) => {
    try {
      const rsvps = await storage.getEventRsvps(req.params.id);
      res.json(rsvps);
    } catch (error) {
      console.error("Error fetching RSVPs:", error);
      res.status(500).json({ message: "Failed to fetch RSVPs" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/events/:id/suggest-activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertActivitySuggestionSchema.parse({
        ...req.body,
        eventId: req.params.id,
      });
      const suggestion = await storage.suggestActivity(validatedData, userId);
      res.json(suggestion);
    } catch (error) {
      console.error("Error suggesting activity:", error);
      res.status(500).json({ message: "Failed to suggest activity" });
    }
  });

  app.post('/api/activity-suggestions/:id/vote', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.voteForActivity(req.params.id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting for activity:", error);
      res.status(500).json({ message: "Failed to vote for activity" });
    }
  });

  app.get('/api/events/:id/activity-suggestions', isAuthenticated, async (req, res) => {
    try {
      const suggestions = await storage.getEventActivitySuggestions(req.params.id);
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching activity suggestions:", error);
      res.status(500).json({ message: "Failed to fetch activity suggestions" });
    }
  });

  // Planning routes
  app.post('/api/events/:id/planning', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPlanningItemSchema.parse({
        ...req.body,
        eventId: req.params.id,
      });
      const item = await storage.createPlanningItem(validatedData, userId);
      res.json(item);
    } catch (error) {
      console.error("Error creating planning item:", error);
      res.status(500).json({ message: "Failed to create planning item" });
    }
  });

  app.get('/api/events/:id/planning', isAuthenticated, async (req, res) => {
    try {
      const items = await storage.getPlanningItems(req.params.id);
      res.json(items);
    } catch (error) {
      console.error("Error fetching planning items:", error);
      res.status(500).json({ message: "Failed to fetch planning items" });
    }
  });

  app.patch('/api/planning/:id', isAuthenticated, async (req, res) => {
    try {
      const updatedItem = await storage.updatePlanningItem(req.params.id, req.body);
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating planning item:", error);
      res.status(500).json({ message: "Failed to update planning item" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const eventRooms = new Map<string, Set<WebSocket>>();

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'join-event') {
          const eventId = data.eventId;
          if (!eventRooms.has(eventId)) {
            eventRooms.set(eventId, new Set());
          }
          eventRooms.get(eventId)?.add(ws);
          
          // Store eventId on ws for cleanup
          (ws as any).eventId = eventId;
          
          // Broadcast user joined
          const joinMessage = JSON.stringify({
            type: 'user-joined',
            eventId,
            userId: data.userId,
            timestamp: Date.now(),
          });
          
          eventRooms.get(eventId)?.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(joinMessage);
            }
          });
        }
        
        if (data.type === 'planning-update') {
          const eventId = data.eventId;
          const updateMessage = JSON.stringify({
            type: 'planning-update',
            eventId,
            update: data.update,
            userId: data.userId,
            timestamp: Date.now(),
          });
          
          eventRooms.get(eventId)?.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(updateMessage);
            }
          });
        }
        
        if (data.type === 'activity-suggestion') {
          const eventId = data.eventId;
          const suggestionMessage = JSON.stringify({
            type: 'activity-suggestion',
            eventId,
            suggestion: data.suggestion,
            userId: data.userId,
            timestamp: Date.now(),
          });
          
          eventRooms.get(eventId)?.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(suggestionMessage);
            }
          });
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove from event rooms
      const eventId = (ws as any).eventId;
      if (eventId && eventRooms.has(eventId)) {
        eventRooms.get(eventId)?.delete(ws);
        if (eventRooms.get(eventId)?.size === 0) {
          eventRooms.delete(eventId);
        }
      }
    });
  });

  return httpServer;
}
