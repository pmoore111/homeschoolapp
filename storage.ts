import { 
  type Student,
  type InsertStudent,
  type Subject,
  type InsertSubject,
  type Term,
  type InsertTerm,
  type Assignment,
  type InsertAssignment,
  type Grade,
  type InsertGrade,
  type Attendance,
  type InsertAttendance,
  type ServiceHour,
  type InsertServiceHour,
  type GradingScheme,
  type InsertGradingScheme,
  students, 
  subjects, 
  terms, 
  assignments, 
  grades, 
  attendance, 
  serviceHours, 
  gradingSchemes
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql, or } from "drizzle-orm";

// Storage interface for all grade tracker functionality
export interface IStorage {
  // Student methods
  getStudent(id: string): Promise<Student | undefined>;
  getStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: string): Promise<void>;
  
  // Subject methods
  getSubject(id: string): Promise<Subject | undefined>;
  getSubjectsByStudent(studentId: string): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: string): Promise<void>;
  
  // Term methods
  getTerm(id: string): Promise<Term | undefined>;
  getTermsByStudent(studentId: string): Promise<Term[]>;
  getActiveTerm(studentId: string): Promise<Term | undefined>;
  createTerm(term: InsertTerm): Promise<Term>;
  updateTerm(id: string, term: Partial<InsertTerm>): Promise<Term>;
  deleteTerm(id: string): Promise<void>;
  
  // Assignment and Grade methods
  getAssignment(id: string): Promise<Assignment | undefined>;
  getAssignmentsBySubject(subjectId: string, termId?: string): Promise<Assignment[]>;
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;
  
  getGrade(id: string): Promise<Grade | undefined>;
  getGradesByAssignment(assignmentId: string): Promise<Grade[]>;
  getGradesBySubjectAndTerm(subjectId: string, termId: string): Promise<Grade[]>;
  createGrade(grade: InsertGrade): Promise<Grade>;
  updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade>;
  deleteGrade(id: string): Promise<void>;
  
  // Grade calculation methods
  calculateSubjectAverage(subjectId: string, termId?: string): Promise<number | null>;
  calculateOverallGPA(studentId: string, termId?: string): Promise<number | null>;
  getSubjectGradeSummary(subjectId: string, termId?: string): Promise<{
    percentage: number;
    letterGrade: string;
    totalAssignments: number;
    completedAssignments: number;
  }>;
  
  // Attendance methods
  getAttendance(id: string): Promise<Attendance | undefined>;
  getAttendanceByStudent(studentId: string, startDate?: string, endDate?: string): Promise<Attendance[]>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: string, attendance: Partial<InsertAttendance>): Promise<Attendance>;
  deleteAttendance(id: string): Promise<void>;
  
  // Attendance statistics and reporting methods
  getAttendanceStatistics(studentId: string, startDate?: string, endDate?: string): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    excusedDays: number;
    attendanceRate: number;
    currentStreak: number;
    longestStreak: number;
  }>;
  getMonthlyAttendanceReport(studentId: string, year: number, month: number): Promise<{
    month: string;
    year: number;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    excusedDays: number;
    attendanceRate: number;
    dailyRecords: { date: string; status: string; minutes?: number; notes?: string }[];
  }>;
  getAttendanceReport(studentId: string, startDate: string, endDate: string): Promise<{
    period: { startDate: string; endDate: string };
    summary: { totalDays: number; presentDays: number; absentDays: number; excusedDays: number; attendanceRate: number };
    dailyRecords: { date: string; status: string; minutes?: number; notes?: string }[];
  }>;
  
  // Service Hours methods
  getServiceHour(id: string): Promise<ServiceHour | undefined>;
  getServiceHoursByStudent(studentId: string): Promise<ServiceHour[]>;
  createServiceHour(serviceHour: InsertServiceHour): Promise<ServiceHour>;
  updateServiceHour(id: string, serviceHour: Partial<InsertServiceHour>): Promise<ServiceHour>;
  deleteServiceHour(id: string): Promise<void>;
  
  // Grading Scheme methods
  getGradingSchemesByStudent(studentId: string): Promise<GradingScheme[]>;
  createGradingScheme(scheme: InsertGradingScheme): Promise<GradingScheme>;
  updateGradingScheme(id: string, scheme: Partial<InsertGradingScheme>): Promise<GradingScheme>;
}

export class DatabaseStorage implements IStorage {
  // Student methods
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db
      .insert(students)
      .values(student)
      .returning();
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student> {
    const [updatedStudent] = await db
      .update(students)
      .set(student)
      .where(eq(students.id, id))
      .returning();
    return updatedStudent;
  }

  async deleteStudent(id: string): Promise<void> {
    await db
      .delete(students)
      .where(eq(students.id, id));
  }

  // Subject methods
  async getSubject(id: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.id, id));
    return subject || undefined;
  }

  async getSubjectsByStudent(studentId: string): Promise<Subject[]> {
    return await db.select().from(subjects).where(eq(subjects.studentId, studentId));
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db
      .insert(subjects)
      .values(subject)
      .returning();
    return newSubject;
  }

  async updateSubject(id: string, subject: Partial<InsertSubject>): Promise<Subject> {
    const [updatedSubject] = await db
      .update(subjects)
      .set(subject)
      .where(eq(subjects.id, id))
      .returning();
    return updatedSubject;
  }

  async deleteSubject(id: string): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  // Term methods
  async getTerm(id: string): Promise<Term | undefined> {
    const [term] = await db.select().from(terms).where(eq(terms.id, id));
    return term || undefined;
  }

  async getTermsByStudent(studentId: string): Promise<Term[]> {
    return await db
      .select()
      .from(terms)
      .where(eq(terms.studentId, studentId))
      .orderBy(desc(terms.startDate));
  }

  async getActiveTerm(studentId: string): Promise<Term | undefined> {
    const [term] = await db
      .select()
      .from(terms)
      .where(and(eq(terms.studentId, studentId), eq(terms.isActive, true)));
    return term || undefined;
  }

  async createTerm(term: InsertTerm): Promise<Term> {
    const [newTerm] = await db
      .insert(terms)
      .values(term)
      .returning();
    return newTerm;
  }

  async updateTerm(id: string, term: Partial<InsertTerm>): Promise<Term> {
    const [updatedTerm] = await db
      .update(terms)
      .set(term)
      .where(eq(terms.id, id))
      .returning();
    return updatedTerm;
  }

  async deleteTerm(id: string): Promise<void> {
    await db.delete(terms).where(eq(terms.id, id));
  }

  // Assignment and Grade methods
  async getAssignment(id: string): Promise<Assignment | undefined> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.id, id));
    return assignment || undefined;
  }

  async getAssignmentsBySubject(subjectId: string, termId?: string): Promise<Assignment[]> {
    if (termId) {
      return await db
        .select()
        .from(assignments)
        .where(and(eq(assignments.subjectId, subjectId), eq(assignments.termId, termId)));
    }
    
    return await db
      .select()
      .from(assignments)
      .where(eq(assignments.subjectId, subjectId));
  }

  async createAssignment(assignment: InsertAssignment): Promise<Assignment> {
    const [newAssignment] = await db
      .insert(assignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async updateAssignment(id: string, assignment: Partial<InsertAssignment>): Promise<Assignment> {
    const [updatedAssignment] = await db
      .update(assignments)
      .set(assignment)
      .where(eq(assignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteAssignment(id: string): Promise<void> {
    await db.delete(assignments).where(eq(assignments.id, id));
  }

  async getGrade(id: string): Promise<Grade | undefined> {
    const [grade] = await db.select().from(grades).where(eq(grades.id, id));
    return grade || undefined;
  }

  async getGradesByAssignment(assignmentId: string): Promise<Grade[]> {
    return await db.select().from(grades).where(eq(grades.assignmentId, assignmentId));
  }

  async createGrade(grade: InsertGrade): Promise<Grade> {
    const [newGrade] = await db
      .insert(grades)
      .values(grade)
      .returning();
    return newGrade;
  }

  async updateGrade(id: string, grade: Partial<InsertGrade>): Promise<Grade> {
    const [updatedGrade] = await db
      .update(grades)
      .set(grade)
      .where(eq(grades.id, id))
      .returning();
    return updatedGrade;
  }

  async deleteGrade(id: string): Promise<void> {
    await db.delete(grades).where(eq(grades.id, id));
  }

  async getGradesBySubjectAndTerm(subjectId: string, termId: string): Promise<Grade[]> {
    return await db
      .select({
        id: grades.id,
        assignmentId: grades.assignmentId,
        pointsEarned: grades.pointsEarned,
        comment: grades.comment,
        gradedAt: grades.gradedAt
      })
      .from(grades)
      .innerJoin(assignments, eq(grades.assignmentId, assignments.id))
      .where(and(
        eq(assignments.subjectId, subjectId),
        eq(assignments.termId, termId)
      ));
  }

  async calculateSubjectAverage(subjectId: string, termId?: string): Promise<number | null> {
    const whereConditions = termId 
      ? and(eq(assignments.subjectId, subjectId), eq(assignments.termId, termId))
      : eq(assignments.subjectId, subjectId);

    const gradeData = await db
      .select({
        pointsEarned: grades.pointsEarned,
        maxPoints: assignments.maxPoints,
        category: assignments.category
      })
      .from(grades)
      .innerJoin(assignments, eq(grades.assignmentId, assignments.id))
      .where(whereConditions);

    if (gradeData.length === 0) return null;

    // Get grading scheme for weighted calculation
    const gradingScheme = await this.getApplicableGradingScheme(subjectId);
    
    if (gradingScheme?.categoryWeights) {
      return this.calculateWeightedAverage(gradeData, gradingScheme.categoryWeights);
    }

    // Fallback to simple point average
    let totalPoints = 0;
    let maxTotalPoints = 0;

    for (const grade of gradeData) {
      if (grade.pointsEarned !== null && grade.maxPoints !== null && grade.maxPoints > 0) {
        totalPoints += grade.pointsEarned;
        maxTotalPoints += grade.maxPoints;
      }
    }

    return maxTotalPoints > 0 ? (totalPoints / maxTotalPoints) * 100 : null;
  }

  async getSubjectGradeSummary(subjectId: string, termId?: string): Promise<{
    percentage: number;
    letterGrade: string;
    totalAssignments: number;
    completedAssignments: number;
  }> {
    const whereConditions = termId 
      ? and(eq(assignments.subjectId, subjectId), eq(assignments.termId, termId))
      : eq(assignments.subjectId, subjectId);

    const gradeData = await db
      .select({
        pointsEarned: grades.pointsEarned,
        maxPoints: assignments.maxPoints,
        category: assignments.category
      })
      .from(grades)
      .innerJoin(assignments, eq(grades.assignmentId, assignments.id))
      .where(whereConditions);

    let totalPoints = 0;
    let maxTotalPoints = 0;
    let assignmentCount = 0;

    for (const grade of gradeData) {
      if (grade.pointsEarned !== null && grade.maxPoints !== null && grade.maxPoints > 0) {
        totalPoints += grade.pointsEarned;
        maxTotalPoints += grade.maxPoints;
        assignmentCount++;
      }
    }

    const average = await this.calculateSubjectAverage(subjectId, termId);
    const gradingScheme = await this.getApplicableGradingScheme(subjectId);
    const letterGrade = this.calculateLetterGrade(average, gradingScheme);

    // Get total assignments count (both graded and ungraded)
    const allAssignments = await db
      .select({ id: assignments.id })
      .from(assignments)
      .where(whereConditions);

    return {
      percentage: average || 0,
      letterGrade,
      totalAssignments: allAssignments.length,
      completedAssignments: assignmentCount
    };
  }

  async calculateOverallGPA(studentId: string, termId?: string): Promise<number | null> {
    // Get all subjects for the student
    const subjectIds = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.studentId, studentId));

    if (subjectIds.length === 0) return null;

    const subjectAverages: number[] = [];

    for (const subject of subjectIds) {
      // If termId is provided, calculate for that term only
      if (termId) {
        const average = await this.calculateSubjectAverage(subject.id, termId);
        if (average !== null) {
          subjectAverages.push(average);
        }
      } else {
        // Calculate for all active terms
        const activeTerms = await db
          .select({ id: terms.id })
          .from(terms)
          .where(and(eq(terms.studentId, studentId), eq(terms.isActive, true)));

        for (const term of activeTerms) {
          const average = await this.calculateSubjectAverage(subject.id, term.id);
          if (average !== null) {
            subjectAverages.push(average);
          }
        }
      }
    }

    if (subjectAverages.length === 0) return null;

    const totalAverage = subjectAverages.reduce((sum, avg) => sum + avg, 0) / subjectAverages.length;
    
    // Convert percentage to 4.0 scale (Texas standard)
    if (totalAverage >= 90) return 4.0;
    if (totalAverage >= 80) return 3.0;
    if (totalAverage >= 70) return 2.0;
    if (totalAverage >= 60) return 1.0;
    return 0.0;
  }

  private calculateLetterGrade(average: number | null, gradingScheme?: GradingScheme | null): string {
    if (average === null) return "N/A";
    
    // Use custom grading scheme if available
    if (gradingScheme?.letterCutoffs) {
      try {
        const cutoffs = JSON.parse(gradingScheme.letterCutoffs);
        if (average >= cutoffs.A) return "A";
        if (average >= cutoffs.B) return "B";
        if (average >= cutoffs.C) return "C";
        if (average >= cutoffs.D) return "D";
        return "F";
      } catch (error) {
        console.error("Failed to parse grading scheme:", error);
      }
    }
    
    // Texas standard grading scale fallback
    if (average >= 90) return "A";
    if (average >= 80) return "B";
    if (average >= 70) return "C";
    if (average >= 60) return "D";
    return "F";
  }

  private async getApplicableGradingScheme(subjectId: string): Promise<GradingScheme | null> {
    // First try to get subject-specific grading scheme
    const [subjectScheme] = await db
      .select()
      .from(gradingSchemes)
      .where(eq(gradingSchemes.subjectId, subjectId));
    
    if (subjectScheme) return subjectScheme;
    
    // Fallback to student default scheme
    const subject = await this.getSubject(subjectId);
    if (!subject) return null;
    
    const [studentScheme] = await db
      .select()
      .from(gradingSchemes)
      .where(and(
        eq(gradingSchemes.studentId, subject.studentId),
        sql`${gradingSchemes.subjectId} IS NULL`
      ));
    
    return studentScheme || null;
  }

  private calculateWeightedAverage(gradeData: any[], categoryWeights: string): number | null {
    try {
      const weights = JSON.parse(categoryWeights);
      const categoryTotals: Record<string, { earned: number; max: number }> = {};
      
      // Group grades by category
      for (const grade of gradeData) {
        if (grade.pointsEarned !== null && grade.maxPoints > 0) {
          const category = grade.category;
          if (!categoryTotals[category]) {
            categoryTotals[category] = { earned: 0, max: 0 };
          }
          categoryTotals[category].earned += grade.pointsEarned;
          categoryTotals[category].max += grade.maxPoints;
        }
      }
      
      // Calculate weighted average
      let weightedSum = 0;
      let totalWeight = 0;
      
      for (const [category, weight] of Object.entries(weights)) {
        if (categoryTotals[category] && categoryTotals[category].max > 0) {
          const categoryAverage = (categoryTotals[category].earned / categoryTotals[category].max) * 100;
          weightedSum += categoryAverage * (weight as number);
          totalWeight += weight as number;
        }
      }
      
      return totalWeight > 0 ? weightedSum / totalWeight : null;
    } catch (error) {
      console.error("Failed to calculate weighted average:", error);
      return null;
    }
  }

  // Attendance methods
  async getAttendance(id: string): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db.select().from(attendance).where(eq(attendance.id, id));
    return attendanceRecord || undefined;
  }

  async getAttendanceByStudent(studentId: string, startDate?: string, endDate?: string): Promise<Attendance[]> {
    let whereConditions = [eq(attendance.studentId, studentId)];

    // Add date filtering if provided (validate date format first)
    if (startDate && this.isValidDateFormat(startDate)) {
      whereConditions.push(gte(attendance.date, startDate));
    }
    if (endDate && this.isValidDateFormat(endDate)) {
      whereConditions.push(lte(attendance.date, endDate));
    }

    return await db
      .select()
      .from(attendance)
      .where(and(...whereConditions))
      .orderBy(desc(attendance.date));
  }

  private isValidDateFormat(dateString: string): boolean {
    // Check YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;
    
    // Check if it's a valid date
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date.toISOString().startsWith(dateString);
  }

  async createAttendance(attendanceRecord: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db
      .insert(attendance)
      .values(attendanceRecord)
      .returning();
    return newAttendance;
  }

  async updateAttendance(id: string, attendanceUpdate: Partial<InsertAttendance>): Promise<Attendance> {
    const [updatedAttendance] = await db
      .update(attendance)
      .set(attendanceUpdate)
      .where(eq(attendance.id, id))
      .returning();
    return updatedAttendance;
  }

  async deleteAttendance(id: string): Promise<void> {
    await db.delete(attendance).where(eq(attendance.id, id));
  }

  async getAttendanceStatistics(studentId: string, startDate?: string, endDate?: string): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    excusedDays: number;
    attendanceRate: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    // Get attendance records for the period
    const records = await this.getAttendanceByStudent(studentId, startDate, endDate);
    
    let presentDays = 0;
    let absentDays = 0;
    let excusedDays = 0;
    
    // Count by status
    for (const record of records) {
      switch (record.status) {
        case "Present":
          presentDays++;
          break;
        case "Absent":
          absentDays++;
          break;
        case "Excused":
          excusedDays++;
          break;
      }
    }
    
    const totalDays = records.length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    
    // Calculate streaks (need records sorted chronologically, oldest first)
    const chronologicalRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const { currentStreak, longestStreak } = this.calculateAttendanceStreaks(chronologicalRecords);
    
    return {
      totalDays,
      presentDays,
      absentDays,
      excusedDays,
      attendanceRate: Math.round(attendanceRate * 100) / 100, // Round to 2 decimal places
      currentStreak,
      longestStreak
    };
  }

  async getMonthlyAttendanceReport(studentId: string, year: number, month: number): Promise<{
    month: string;
    year: number;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    excusedDays: number;
    attendanceRate: number;
    dailyRecords: { date: string; status: string; minutes?: number; notes?: string }[];
  }> {
    // Create date range for the month
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate(); // Get last day of month
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    
    const records = await this.getAttendanceByStudent(studentId, startDate, endDate);
    const statistics = await this.getAttendanceStatistics(studentId, startDate, endDate);
    
    const dailyRecords = records.map(record => ({
      date: record.date,
      status: record.status,
      minutes: record.minutes || undefined,
      notes: record.notes || undefined
    }));
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return {
      month: monthNames[month - 1],
      year,
      totalDays: statistics.totalDays,
      presentDays: statistics.presentDays,
      absentDays: statistics.absentDays,
      excusedDays: statistics.excusedDays,
      attendanceRate: statistics.attendanceRate,
      dailyRecords
    };
  }

  async getAttendanceReport(studentId: string, startDate: string, endDate: string): Promise<{
    period: { startDate: string; endDate: string };
    summary: { totalDays: number; presentDays: number; absentDays: number; excusedDays: number; attendanceRate: number };
    dailyRecords: { date: string; status: string; minutes?: number; notes?: string }[];
  }> {
    const records = await this.getAttendanceByStudent(studentId, startDate, endDate);
    const statistics = await this.getAttendanceStatistics(studentId, startDate, endDate);
    
    const dailyRecords = records.map(record => ({
      date: record.date,
      status: record.status,
      minutes: record.minutes || undefined,
      notes: record.notes || undefined
    }));
    
    return {
      period: { startDate, endDate },
      summary: {
        totalDays: statistics.totalDays,
        presentDays: statistics.presentDays,
        absentDays: statistics.absentDays,
        excusedDays: statistics.excusedDays,
        attendanceRate: statistics.attendanceRate
      },
      dailyRecords
    };
  }

  private calculateAttendanceStreaks(sortedRecords: Attendance[]): { currentStreak: number; longestStreak: number } {
    if (sortedRecords.length === 0) return { currentStreak: 0, longestStreak: 0 };
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Calculate streaks from most recent backwards
    for (let i = sortedRecords.length - 1; i >= 0; i--) {
      const record = sortedRecords[i];
      
      if (record.status === "Present") {
        tempStreak++;
        if (i === sortedRecords.length - 1) {
          // This is the most recent record, so it contributes to current streak
          currentStreak = tempStreak;
        }
      } else {
        // Reset streak on absent/excused
        if (i === sortedRecords.length - 1) {
          currentStreak = 0;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }
    
    // Check final streak
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { currentStreak, longestStreak };
  }

  // Service Hours methods
  async getServiceHour(id: string): Promise<ServiceHour | undefined> {
    const [serviceHour] = await db.select().from(serviceHours).where(eq(serviceHours.id, id));
    return serviceHour || undefined;
  }

  async getServiceHoursByStudent(studentId: string): Promise<ServiceHour[]> {
    return await db
      .select()
      .from(serviceHours)
      .where(eq(serviceHours.studentId, studentId))
      .orderBy(desc(serviceHours.date));
  }

  async createServiceHour(serviceHour: InsertServiceHour): Promise<ServiceHour> {
    const [newServiceHour] = await db
      .insert(serviceHours)
      .values(serviceHour)
      .returning();
    return newServiceHour;
  }

  async updateServiceHour(id: string, serviceHour: Partial<InsertServiceHour>): Promise<ServiceHour> {
    const [updatedServiceHour] = await db
      .update(serviceHours)
      .set(serviceHour)
      .where(eq(serviceHours.id, id))
      .returning();
    return updatedServiceHour;
  }

  async deleteServiceHour(id: string): Promise<void> {
    await db.delete(serviceHours).where(eq(serviceHours.id, id));
  }

  // Grading Scheme methods
  async getGradingSchemesByStudent(studentId: string): Promise<GradingScheme[]> {
    return await db
      .select()
      .from(gradingSchemes)
      .where(eq(gradingSchemes.studentId, studentId));
  }

  async createGradingScheme(scheme: InsertGradingScheme): Promise<GradingScheme> {
    const [newScheme] = await db
      .insert(gradingSchemes)
      .values(scheme)
      .returning();
    return newScheme;
  }

  async updateGradingScheme(id: string, scheme: Partial<InsertGradingScheme>): Promise<GradingScheme> {
    const [updatedScheme] = await db
      .update(gradingSchemes)
      .set(scheme)
      .where(eq(gradingSchemes.id, id))
      .returning();
    return updatedScheme;
  }
}

export const storage = new DatabaseStorage();
