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

// Wedding-specific tables
export const weddingDetails = pgTable("wedding_details", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  brideFirstName: varchar("bride_first_name", { length: 100 }),
  brideLastName: varchar("bride_last_name", { length: 100 }),
  groomFirstName: varchar("groom_first_name", { length: 100 }),
  groomLastName: varchar("groom_last_name", { length: 100 }),
  ceremonyLocation: varchar("ceremony_location", { length: 500 }),
  receptionLocation: varchar("reception_location", { length: 500 }),
  weddingDate: timestamp("wedding_date").notNull(),
  ceremonyTime: varchar("ceremony_time", { length: 10 }),
  receptionTime: varchar("reception_time", { length: 10 }),
  budget: integer("budget"),
  guestCount: integer("guest_count"),
  theme: varchar("theme", { length: 100 }),
  colorScheme: varchar("color_scheme", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weddingVendors = pgTable("wedding_vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  weddingId: uuid("wedding_id").notNull().references(() => weddingDetails.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 50 }).notNull(), // 'photographer', 'florist', 'caterer', 'dj', etc.
  name: varchar("name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 500 }),
  cost: integer("cost"),
  status: varchar("status", { length: 20 }).default("considering"), // 'considering', 'booked', 'rejected'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const weddingGuests = pgTable("wedding_guests", {
  id: uuid("id").primaryKey().defaultRandom(),
  weddingId: uuid("wedding_id").notNull().references(() => weddingDetails.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phoneNumber: varchar("phone_number", { length: 20 }),
  relationship: varchar("relationship", { length: 50 }), // 'family', 'friend', 'colleague', etc.
  side: varchar("side", { length: 10 }), // 'bride', 'groom', 'both'
  inviteStatus: varchar("invite_status", { length: 20 }).default("not_sent"), // 'not_sent', 'sent', 'delivered'
  rsvpStatus: varchar("rsvp_status", { length: 20 }), // 'pending', 'attending', 'not_attending'
  plusOne: boolean("plus_one").default(false),
  dietaryRestrictions: text("dietary_restrictions"),
  table: varchar("table", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPhoneNumbers = pgTable("user_phone_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  countryCode: varchar("country_code", { length: 5 }).default("+1"),
  isWhatsApp: boolean("is_whatsapp").default(false),
  isPrimary: boolean("is_primary").default(false),
  createdAt: timestamp("created_at").defaultNow(),
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
  phoneNumbers: many(userPhoneNumbers),
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
  weddingDetails: many(weddingDetails),
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

// Wedding relations
export const weddingDetailsRelations = relations(weddingDetails, ({ one, many }) => ({
  event: one(events, {
    fields: [weddingDetails.eventId],
    references: [events.id],
  }),
  vendors: many(weddingVendors),
  guests: many(weddingGuests),
}));

export const weddingVendorsRelations = relations(weddingVendors, ({ one }) => ({
  wedding: one(weddingDetails, {
    fields: [weddingVendors.weddingId],
    references: [weddingDetails.id],
  }),
}));

export const weddingGuestsRelations = relations(weddingGuests, ({ one }) => ({
  wedding: one(weddingDetails, {
    fields: [weddingGuests.weddingId],
    references: [weddingDetails.id],
  }),
}));

export const userPhoneNumbersRelations = relations(userPhoneNumbers, ({ one }) => ({
  user: one(users, {
    fields: [userPhoneNumbers.userId],
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

export const insertWeddingDetailsSchema = createInsertSchema(weddingDetails).pick({
  eventId: true,
  brideFirstName: true,
  brideLastName: true,
  groomFirstName: true,
  groomLastName: true,
  ceremonyLocation: true,
  receptionLocation: true,
  weddingDate: true,
  ceremonyTime: true,
  receptionTime: true,
  budget: true,
  guestCount: true,
  theme: true,
  colorScheme: true,
});

export const insertWeddingVendorSchema = createInsertSchema(weddingVendors).pick({
  weddingId: true,
  category: true,
  name: true,
  contactPerson: true,
  phoneNumber: true,
  email: true,
  website: true,
  cost: true,
  status: true,
  notes: true,
});

export const insertWeddingGuestSchema = createInsertSchema(weddingGuests).pick({
  weddingId: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNumber: true,
  relationship: true,
  side: true,
  plusOne: true,
  dietaryRestrictions: true,
  table: true,
});

export const insertUserPhoneNumberSchema = createInsertSchema(userPhoneNumbers).pick({
  userId: true,
  phoneNumber: true,
  countryCode: true,
  isWhatsApp: true,
  isPrimary: true,
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
export type WeddingDetails = typeof weddingDetails.$inferSelect;
export type InsertWeddingDetails = z.infer<typeof insertWeddingDetailsSchema>;
export type WeddingVendor = typeof weddingVendors.$inferSelect;
export type InsertWeddingVendor = z.infer<typeof insertWeddingVendorSchema>;
export type WeddingGuest = typeof weddingGuests.$inferSelect;
export type InsertWeddingGuest = z.infer<typeof insertWeddingGuestSchema>;
export type UserPhoneNumber = typeof userPhoneNumbers.$inferSelect;
export type InsertUserPhoneNumber = z.infer<typeof insertUserPhoneNumberSchema>;
