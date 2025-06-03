import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Friend groups
export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group memberships
export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).default("member"), // 'admin', 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  groupId: uuid("group_id").references(() => groups.id, { onDelete: "cascade" }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  status: varchar("status", { length: 50 }).default("planning"), // 'planning', 'confirmed', 'cancelled'
  activityType: varchar("activity_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event RSVPs
export const eventRsvps = pgTable("event_rsvps", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull(), // 'going', 'maybe', 'not_going'
  respondedAt: timestamp("responded_at").defaultNow(),
});

// Activity suggestions
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  icon: varchar("icon", { length: 100 }),
  minParticipants: integer("min_participants").default(2),
  maxParticipants: integer("max_participants"),
  indoor: boolean("indoor").default(false),
  outdoor: boolean("outdoor").default(false),
  cost: varchar("cost", { length: 50 }), // 'free', 'low', 'medium', 'high'
});

// Activity suggestions for events
export const eventActivitySuggestions = pgTable("event_activity_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  activityId: uuid("activity_id").notNull().references(() => activities.id, { onDelete: "cascade" }),
  suggestedBy: varchar("suggested_by").notNull().references(() => users.id),
  votes: integer("votes").default(0),
  suggestedAt: timestamp("suggested_at").defaultNow(),
});

// Activity votes
export const activityVotes = pgTable("activity_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  suggestionId: uuid("suggestion_id").notNull().references(() => eventActivitySuggestions.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  votedAt: timestamp("voted_at").defaultNow(),
});

// Event photos
export const eventPhotos = pgTable("event_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  photoUrl: varchar("photo_url", { length: 500 }).notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Planning board items
export const planningItems = pgTable("planning_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // 'task', 'idea', 'vote', 'note'
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  completed: boolean("completed").default(false),
  priority: varchar("priority", { length: 20 }).default("medium"), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdGroups: many(groups),
  groupMemberships: many(groupMembers),
  createdEvents: many(events),
  eventRsvps: many(eventRsvps),
  activitySuggestions: many(eventActivitySuggestions),
  activityVotes: many(activityVotes),
  uploadedPhotos: many(eventPhotos),
  planningItems: many(planningItems),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
  events: many(events),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [events.groupId],
    references: [groups.id],
  }),
  rsvps: many(eventRsvps),
  activitySuggestions: many(eventActivitySuggestions),
  photos: many(eventPhotos),
  planningItems: many(planningItems),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(events, {
    fields: [eventRsvps.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ many }) => ({
  suggestions: many(eventActivitySuggestions),
}));

export const eventActivitySuggestionsRelations = relations(eventActivitySuggestions, ({ one, many }) => ({
  event: one(events, {
    fields: [eventActivitySuggestions.eventId],
    references: [events.id],
  }),
  activity: one(activities, {
    fields: [eventActivitySuggestions.activityId],
    references: [activities.id],
  }),
  suggestedByUser: one(users, {
    fields: [eventActivitySuggestions.suggestedBy],
    references: [users.id],
  }),
  votes: many(activityVotes),
}));

export const activityVotesRelations = relations(activityVotes, ({ one }) => ({
  suggestion: one(eventActivitySuggestions, {
    fields: [activityVotes.suggestionId],
    references: [eventActivitySuggestions.id],
  }),
  user: one(users, {
    fields: [activityVotes.userId],
    references: [users.id],
  }),
}));

export const eventPhotosRelations = relations(eventPhotos, ({ one }) => ({
  event: one(events, {
    fields: [eventPhotos.eventId],
    references: [events.id],
  }),
  uploadedByUser: one(users, {
    fields: [eventPhotos.uploadedBy],
    references: [users.id],
  }),
}));

export const planningItemsRelations = relations(planningItems, ({ one }) => ({
  event: one(events, {
    fields: [planningItems.eventId],
    references: [events.id],
  }),
  createdByUser: one(users, {
    fields: [planningItems.createdBy],
    references: [users.id],
  }),
  assignedToUser: one(users, {
    fields: [planningItems.assignedTo],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  location: true,
  startDate: true,
  endDate: true,
  groupId: true,
  activityType: true,
});

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).pick({
  eventId: true,
  status: true,
});

export const insertActivitySuggestionSchema = createInsertSchema(eventActivitySuggestions).pick({
  eventId: true,
  activityId: true,
});

export const insertPlanningItemSchema = createInsertSchema(planningItems).pick({
  eventId: true,
  type: true,
  title: true,
  content: true,
  assignedTo: true,
  priority: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type Activity = typeof activities.$inferSelect;
export type EventActivitySuggestion = typeof eventActivitySuggestions.$inferSelect;
export type InsertActivitySuggestion = z.infer<typeof insertActivitySuggestionSchema>;
export type EventPhoto = typeof eventPhotos.$inferSelect;
export type PlanningItem = typeof planningItems.$inferSelect;
export type InsertPlanningItem = z.infer<typeof insertPlanningItemSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
