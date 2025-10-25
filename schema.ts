import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, real, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Students being tracked
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gradeLevel: text("grade_level"), // K, 1-12
  dateOfBirth: date("date_of_birth"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subjects for each student
export const subjects = pgTable("subjects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(), // Reading, Math, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Grading schemes per student
export const gradingSchemes = pgTable("grading_schemes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  subjectId: varchar("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  letterCutoffs: text("letter_cutoffs").notNull(), // JSON: {"A": 90, "B": 80, "C": 70, "D": 60}
  categoryWeights: text("category_weights").notNull(), // JSON: {"Homework": 30, "Quiz": 30, "Test": 40}
  createdAt: timestamp("created_at").defaultNow(),
});

// Terms/semesters
export const terms = pgTable("terms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(), // "Term 1", "Fall Semester", etc.
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Assignments (also used for Khan Academy lessons)
export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: varchar("subject_id").references(() => subjects.id, { onDelete: "cascade" }).notNull(),
  termId: varchar("term_id").references(() => terms.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(), // "Homework", "Quiz", "Test", "Project", "Practice", "Lesson"
  maxPoints: real("max_points"),
  dateAssigned: date("date_assigned"),
  dateDue: date("date_due"),
  // Khan Academy specific fields
  lessonType: text("lesson_type"), // "practice", "quiz", "test", "lesson"
  status: text("status"), // "unfamiliar", "familiar", "proficient", "mastered", "not started", "attempted"
  isKhanLesson: boolean("is_khan_lesson").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Grades for assignments
export const grades = pgTable("grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignmentId: varchar("assignment_id").references(() => assignments.id, { onDelete: "cascade" }).notNull(),
  pointsEarned: real("points_earned"),
  comment: text("comment"),
  gradedAt: timestamp("graded_at").defaultNow(),
});

// Attendance tracking
export const attendance = pgTable("attendance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(), // "Present", "Absent", "Excused"
  timeOfDay: text("time_of_day"), // Time student worked (e.g., "9:00 AM - 2:00 PM")
  minutes: integer("minutes"), // Optional duration in minutes
  notes: text("notes"), // What was worked on
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Unique constraint to prevent duplicate attendance entries for same date
  uniqueStudentDate: sql`UNIQUE(${table.studentId}, ${table.date})`
}));

// Service hours for "good citizenship"
export const serviceHours = pgTable("service_hours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").references(() => students.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  hours: real("hours").notNull(),
  description: text("description").notNull(),
  category: text("category").default("Community Service"), // Track type of service
  createdAt: timestamp("created_at").defaultNow(),
});

// JSON validation schemas for grading schemes
export const letterCutoffsSchema = z.object({
  A: z.number().min(0).max(100),
  B: z.number().min(0).max(100),
  C: z.number().min(0).max(100),
  D: z.number().min(0).max(100),
});

export const categoryWeightsSchema = z.object({
  Homework: z.number().min(0).max(100).optional().default(0),
  Quiz: z.number().min(0).max(100).optional().default(0),
  Test: z.number().min(0).max(100).optional().default(0),
  Project: z.number().min(0).max(100).optional().default(0),
});

// Insert schemas  
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, createdAt: true });


// Enhanced grading scheme with JSON validation
export const insertGradingSchemeSchema = createInsertSchema(gradingSchemes)
  .omit({ id: true, createdAt: true })
  .extend({
    letterCutoffs: z.union([
      z.string(),
      letterCutoffsSchema.transform(obj => JSON.stringify(obj))
    ]),
    categoryWeights: z.union([
      z.string(),
      categoryWeightsSchema.transform(obj => JSON.stringify(obj))
    ]),
  });

export const insertTermSchema = createInsertSchema(terms).omit({ id: true, createdAt: true });

// Enhanced assignment schema with Khan Academy field validation
export const insertAssignmentSchema = createInsertSchema(assignments)
  .omit({ id: true, createdAt: true })
  .extend({
    lessonType: z.enum(["practice", "quiz", "test", "lesson"]).optional(),
    status: z.enum(["unfamiliar", "familiar", "proficient", "mastered", "not started", "attempted"]).optional(),
  });

export const insertGradeSchema = createInsertSchema(grades).omit({ id: true, gradedAt: true });

// Enhanced attendance schema with status validation
export const insertAttendanceSchema = createInsertSchema(attendance)
  .omit({ id: true, createdAt: true })
  .extend({
    status: z.enum(["Present", "Absent", "Excused"]),
  });

export const insertServiceHourSchema = createInsertSchema(serviceHours).omit({ id: true, createdAt: true });

// Secure update schemas that prevent ownership escalation
export const updateStudentSchema = insertStudentSchema.partial();
export const updateSubjectSchema = insertSubjectSchema.omit({ studentId: true }).partial();
export const updateTermSchema = insertTermSchema.omit({ studentId: true }).partial();
export const updateAssignmentSchema = insertAssignmentSchema.omit({ subjectId: true, termId: true }).partial();
export const updateGradeSchema = insertGradeSchema.omit({ assignmentId: true }).partial();
export const updateAttendanceSchema = insertAttendanceSchema.omit({ studentId: true }).partial();
export const updateServiceHourSchema = insertServiceHourSchema.omit({ studentId: true }).partial();

// Types
export type Student = typeof students.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type GradingScheme = typeof gradingSchemes.$inferSelect;
export type Term = typeof terms.$inferSelect;
export type Assignment = typeof assignments.$inferSelect;
export type Grade = typeof grades.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type ServiceHour = typeof serviceHours.$inferSelect;

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertGradingScheme = z.infer<typeof insertGradingSchemeSchema>;
export type InsertTerm = z.infer<typeof insertTermSchema>;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type InsertServiceHour = z.infer<typeof insertServiceHourSchema>;