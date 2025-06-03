import {
  users,
  groups,
  groupMembers,
  events,
  eventRsvps,
  activities,
  eventActivitySuggestions,
  activityVotes,
  eventPhotos,
  planningItems,
  weddingDetails,
  weddingVendors,
  weddingGuests,
  userPhoneNumbers,
  type User,
  type UpsertUser,
  type Group,
  type InsertGroup,
  type Event,
  type InsertEvent,
  type EventRsvp,
  type InsertEventRsvp,
  type Activity,
  type EventActivitySuggestion,
  type InsertActivitySuggestion,
  type EventPhoto,
  type PlanningItem,
  type InsertPlanningItem,
  type GroupMember,
  type WeddingDetails,
  type InsertWeddingDetails,
  type WeddingVendor,
  type InsertWeddingVendor,
  type WeddingGuest,
  type InsertWeddingGuest,
  type UserPhoneNumber,
  type InsertUserPhoneNumber,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Group operations
  createGroup(group: InsertGroup, createdBy: string): Promise<Group>;
  getUserGroups(userId: string): Promise<Group[]>;
  getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]>;
  joinGroup(groupId: string, userId: string): Promise<void>;
  
  // Event operations
  createEvent(event: InsertEvent, createdBy: string): Promise<Event>;
  getEvents(userId: string): Promise<Event[]>;
  getEventsByGroup(groupId: string): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  updateEventRsvp(rsvp: InsertEventRsvp, userId: string): Promise<EventRsvp>;
  getEventRsvps(eventId: string): Promise<(EventRsvp & { user: User })[]>;
  
  // Activity operations
  getActivities(): Promise<Activity[]>;
  suggestActivity(suggestion: InsertActivitySuggestion, suggestedBy: string): Promise<EventActivitySuggestion>;
  voteForActivity(suggestionId: string, userId: string): Promise<void>;
  getEventActivitySuggestions(eventId: string): Promise<(EventActivitySuggestion & { activity: Activity; votes: number })[]>;
  
  // Planning operations
  createPlanningItem(item: InsertPlanningItem, createdBy: string): Promise<PlanningItem>;
  getPlanningItems(eventId: string): Promise<PlanningItem[]>;
  updatePlanningItem(id: string, updates: Partial<PlanningItem>): Promise<PlanningItem>;
  
  // Wedding operations
  createWeddingDetails(wedding: InsertWeddingDetails): Promise<WeddingDetails>;
  getWeddingDetails(eventId: string): Promise<WeddingDetails | undefined>;
  updateWeddingDetails(id: string, updates: Partial<WeddingDetails>): Promise<WeddingDetails>;
  addWeddingVendor(vendor: InsertWeddingVendor): Promise<WeddingVendor>;
  getWeddingVendors(weddingId: string): Promise<WeddingVendor[]>;
  updateWeddingVendor(id: string, updates: Partial<WeddingVendor>): Promise<WeddingVendor>;
  addWeddingGuest(guest: InsertWeddingGuest): Promise<WeddingGuest>;
  getWeddingGuests(weddingId: string): Promise<WeddingGuest[]>;
  updateWeddingGuest(id: string, updates: Partial<WeddingGuest>): Promise<WeddingGuest>;
  
  // Phone number operations
  addUserPhoneNumber(phoneNumber: InsertUserPhoneNumber): Promise<UserPhoneNumber>;
  getUserPhoneNumbers(userId: string): Promise<UserPhoneNumber[]>;
  updateUserPhoneNumber(id: string, updates: Partial<UserPhoneNumber>): Promise<UserPhoneNumber>;
  
  // Stats
  getUserStats(userId: string): Promise<{ upcomingEvents: number; friendGroups: number }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Group operations
  async createGroup(group: InsertGroup, createdBy: string): Promise<Group> {
    const [newGroup] = await db
      .insert(groups)
      .values({ ...group, createdBy })
      .returning();
    
    // Add creator as admin
    await db.insert(groupMembers).values({
      groupId: newGroup.id,
      userId: createdBy,
      role: "admin",
    });
    
    return newGroup;
  }

  async getUserGroups(userId: string): Promise<Group[]> {
    const userGroupsResult = await db
      .select({ group: groups })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId))
      .orderBy(desc(groups.createdAt));
    
    return userGroupsResult.map(r => r.group);
  }

  async getGroupMembers(groupId: string): Promise<(GroupMember & { user: User })[]> {
    const members = await db
      .select({
        id: groupMembers.id,
        groupId: groupMembers.groupId,
        userId: groupMembers.userId,
        role: groupMembers.role,
        joinedAt: groupMembers.joinedAt,
        user: users,
      })
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId));
    
    return members;
  }

  async joinGroup(groupId: string, userId: string): Promise<void> {
    await db.insert(groupMembers).values({
      groupId,
      userId,
      role: "member",
    });
  }

  // Event operations
  async createEvent(event: InsertEvent, createdBy: string): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({ ...event, createdBy })
      .returning();
    return newEvent;
  }

  async getEvents(userId: string): Promise<Event[]> {
    // Get events from user's groups
    const userEvents = await db
      .select({ event: events })
      .from(events)
      .innerJoin(groupMembers, eq(events.groupId, groupMembers.groupId))
      .where(eq(groupMembers.userId, userId))
      .orderBy(events.startDate);
    
    return userEvents.map(r => r.event);
  }

  async getEventsByGroup(groupId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.groupId, groupId))
      .orderBy(events.startDate);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async updateEventRsvp(rsvp: InsertEventRsvp, userId: string): Promise<EventRsvp> {
    const [existingRsvp] = await db
      .select()
      .from(eventRsvps)
      .where(and(eq(eventRsvps.eventId, rsvp.eventId), eq(eventRsvps.userId, userId)));

    if (existingRsvp) {
      const [updatedRsvp] = await db
        .update(eventRsvps)
        .set({ status: rsvp.status, respondedAt: new Date() })
        .where(eq(eventRsvps.id, existingRsvp.id))
        .returning();
      return updatedRsvp;
    } else {
      const [newRsvp] = await db
        .insert(eventRsvps)
        .values({ ...rsvp, userId })
        .returning();
      return newRsvp;
    }
  }

  async getEventRsvps(eventId: string): Promise<(EventRsvp & { user: User })[]> {
    const rsvps = await db
      .select({
        id: eventRsvps.id,
        eventId: eventRsvps.eventId,
        userId: eventRsvps.userId,
        status: eventRsvps.status,
        respondedAt: eventRsvps.respondedAt,
        user: users,
      })
      .from(eventRsvps)
      .innerJoin(users, eq(eventRsvps.userId, users.id))
      .where(eq(eventRsvps.eventId, eventId));
    
    return rsvps;
  }

  // Activity operations
  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities);
  }

  async suggestActivity(suggestion: InsertActivitySuggestion, suggestedBy: string): Promise<EventActivitySuggestion> {
    const [newSuggestion] = await db
      .insert(eventActivitySuggestions)
      .values({ ...suggestion, suggestedBy })
      .returning();
    return newSuggestion;
  }

  async voteForActivity(suggestionId: string, userId: string): Promise<void> {
    // Check if user already voted
    const [existingVote] = await db
      .select()
      .from(activityVotes)
      .where(and(eq(activityVotes.suggestionId, suggestionId), eq(activityVotes.userId, userId)));

    if (!existingVote) {
      await db.insert(activityVotes).values({
        suggestionId,
        userId,
      });
      
      // Update vote count
      await db
        .update(eventActivitySuggestions)
        .set({ votes: sql`votes + 1` })
        .where(eq(eventActivitySuggestions.id, suggestionId));
    }
  }

  async getEventActivitySuggestions(eventId: string): Promise<(EventActivitySuggestion & { activity: Activity; votes: number })[]> {
    const suggestions = await db
      .select({
        id: eventActivitySuggestions.id,
        eventId: eventActivitySuggestions.eventId,
        activityId: eventActivitySuggestions.activityId,
        suggestedBy: eventActivitySuggestions.suggestedBy,
        votes: eventActivitySuggestions.votes,
        suggestedAt: eventActivitySuggestions.suggestedAt,
        activity: activities,
      })
      .from(eventActivitySuggestions)
      .innerJoin(activities, eq(eventActivitySuggestions.activityId, activities.id))
      .where(eq(eventActivitySuggestions.eventId, eventId))
      .orderBy(desc(eventActivitySuggestions.votes));
    
    return suggestions.map(s => ({
      ...s,
      votes: s.votes || 0,
    }));
  }

  // Planning operations
  async createPlanningItem(item: InsertPlanningItem, createdBy: string): Promise<PlanningItem> {
    const [newItem] = await db
      .insert(planningItems)
      .values({ ...item, createdBy })
      .returning();
    return newItem;
  }

  async getPlanningItems(eventId: string): Promise<PlanningItem[]> {
    return await db
      .select()
      .from(planningItems)
      .where(eq(planningItems.eventId, eventId))
      .orderBy(desc(planningItems.createdAt));
  }

  async updatePlanningItem(id: string, updates: Partial<PlanningItem>): Promise<PlanningItem> {
    const [updatedItem] = await db
      .update(planningItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(planningItems.id, id))
      .returning();
    return updatedItem;
  }

  // Wedding operations
  async createWeddingDetails(wedding: InsertWeddingDetails): Promise<WeddingDetails> {
    const [newWedding] = await db
      .insert(weddingDetails)
      .values(wedding)
      .returning();
    return newWedding;
  }

  async getWeddingDetails(eventId: string): Promise<WeddingDetails | undefined> {
    const [wedding] = await db
      .select()
      .from(weddingDetails)
      .where(eq(weddingDetails.eventId, eventId));
    return wedding;
  }

  async updateWeddingDetails(id: string, updates: Partial<WeddingDetails>): Promise<WeddingDetails> {
    const [wedding] = await db
      .update(weddingDetails)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(weddingDetails.id, id))
      .returning();
    return wedding;
  }

  async addWeddingVendor(vendor: InsertWeddingVendor): Promise<WeddingVendor> {
    const [newVendor] = await db
      .insert(weddingVendors)
      .values(vendor)
      .returning();
    return newVendor;
  }

  async getWeddingVendors(weddingId: string): Promise<WeddingVendor[]> {
    return db
      .select()
      .from(weddingVendors)
      .where(eq(weddingVendors.weddingId, weddingId))
      .orderBy(desc(weddingVendors.createdAt));
  }

  async updateWeddingVendor(id: string, updates: Partial<WeddingVendor>): Promise<WeddingVendor> {
    const [vendor] = await db
      .update(weddingVendors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(weddingVendors.id, id))
      .returning();
    return vendor;
  }

  async addWeddingGuest(guest: InsertWeddingGuest): Promise<WeddingGuest> {
    const [newGuest] = await db
      .insert(weddingGuests)
      .values(guest)
      .returning();
    return newGuest;
  }

  async getWeddingGuests(weddingId: string): Promise<WeddingGuest[]> {
    return db
      .select()
      .from(weddingGuests)
      .where(eq(weddingGuests.weddingId, weddingId))
      .orderBy(desc(weddingGuests.createdAt));
  }

  async updateWeddingGuest(id: string, updates: Partial<WeddingGuest>): Promise<WeddingGuest> {
    const [guest] = await db
      .update(weddingGuests)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(weddingGuests.id, id))
      .returning();
    return guest;
  }

  // Phone number operations
  async addUserPhoneNumber(phoneNumber: InsertUserPhoneNumber): Promise<UserPhoneNumber> {
    const [newPhoneNumber] = await db
      .insert(userPhoneNumbers)
      .values(phoneNumber)
      .returning();
    return newPhoneNumber;
  }

  async getUserPhoneNumbers(userId: string): Promise<UserPhoneNumber[]> {
    return db
      .select()
      .from(userPhoneNumbers)
      .where(eq(userPhoneNumbers.userId, userId))
      .orderBy(desc(userPhoneNumbers.isPrimary));
  }

  async updateUserPhoneNumber(id: string, updates: Partial<UserPhoneNumber>): Promise<UserPhoneNumber> {
    const [phoneNumber] = await db
      .update(userPhoneNumbers)
      .set(updates)
      .where(eq(userPhoneNumbers.id, id))
      .returning();
    return phoneNumber;
  }

  // Stats
  async getUserStats(userId: string): Promise<{ upcomingEvents: number; friendGroups: number }> {
    const [groupCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const userGroupIds = await db
      .select({ groupId: groupMembers.groupId })
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const groupIds = userGroupIds.map(g => g.groupId);
    
    let eventCount = 0;
    if (groupIds.length > 0) {
      const [eventCountResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(events)
        .where(and(
          inArray(events.groupId, groupIds),
          sql`start_date > NOW()`
        ));
      eventCount = eventCountResult?.count || 0;
    }

    return {
      upcomingEvents: eventCount,
      friendGroups: groupCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
