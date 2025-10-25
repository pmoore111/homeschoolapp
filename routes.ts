import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertStudentSchema,
  insertSubjectSchema,
  insertTermSchema,
  insertAssignmentSchema,
  insertGradeSchema,
  insertAttendanceSchema,
  insertServiceHourSchema,
  insertGradingSchemeSchema,
  updateStudentSchema,
  updateSubjectSchema,
  updateTermSchema,
  updateAssignmentSchema,
  updateGradeSchema,
  updateAttendanceSchema,
  updateServiceHourSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Students endpoints
  app.get("/api/students", async (req: any, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req: any, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ error: "Failed to create student" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const validatedData = updateStudentSchema.parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ error: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      await storage.deleteStudent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  app.post("/api/students/ensure-default", async (req: any, res) => {
    try {
      const students = await storage.getStudents();
      
      if (students.length === 0) {
        const defaultStudent = await storage.createStudent({
          firstName: "Jordan",
          lastName: "Moore"
        });
        res.json(defaultStudent);
      } else {
        const firstStudent = students[0];
        
        if (firstStudent.firstName !== "Jordan" || firstStudent.lastName !== "Moore") {
          const updatedStudent = await storage.updateStudent(firstStudent.id, {
            firstName: "Jordan",
            lastName: "Moore"
          });
          
          for (let i = 1; i < students.length; i++) {
            await storage.deleteStudent(students[i].id);
          }
          
          res.json(updatedStudent);
        } else {
          for (let i = 1; i < students.length; i++) {
            await storage.deleteStudent(students[i].id);
          }
          
          res.json(firstStudent);
        }
      }
    } catch (error) {
      console.error("Error ensuring default student:", error);
      res.status(500).json({ error: "Failed to ensure default student" });
    }
  });

  // Subjects endpoints
  app.get("/api/students/:studentId/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjectsByStudent(req.params.studentId);
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.post("/api/students/:studentId/subjects", async (req, res) => {
    try {
      const validatedData = insertSubjectSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const subject = await storage.createSubject(validatedData);
      res.json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(400).json({ error: "Failed to create subject" });
    }
  });

  app.put("/api/subjects/:id", async (req, res) => {
    try {
      const validatedData = updateSubjectSchema.parse(req.body);
      const subject = await storage.updateSubject(req.params.id, validatedData);
      res.json(subject);
    } catch (error) {
      console.error("Error updating subject:", error);
      res.status(400).json({ error: "Failed to update subject" });
    }
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    try {
      await storage.deleteSubject(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subject:", error);
      res.status(500).json({ error: "Failed to delete subject" });
    }
  });

  // Terms endpoints
  app.get("/api/students/:studentId/terms", async (req, res) => {
    try {
      const terms = await storage.getTermsByStudent(req.params.studentId);
      res.json(terms);
    } catch (error) {
      console.error("Error fetching terms:", error);
      res.status(500).json({ error: "Failed to fetch terms" });
    }
  });

  app.get("/api/students/:studentId/terms/active", async (req, res) => {
    try {
      const term = await storage.getActiveTerm(req.params.studentId);
      res.json(term);
    } catch (error) {
      console.error("Error fetching active term:", error);
      res.status(500).json({ error: "Failed to fetch active term" });
    }
  });

  app.post("/api/students/:studentId/terms", async (req, res) => {
    try {
      const validatedData = insertTermSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const term = await storage.createTerm(validatedData);
      res.json(term);
    } catch (error) {
      console.error("Error creating term:", error);
      res.status(400).json({ error: "Failed to create term" });
    }
  });

  app.put("/api/terms/:id", async (req, res) => {
    try {
      const validatedData = updateTermSchema.parse(req.body);
      const term = await storage.updateTerm(req.params.id, validatedData);
      res.json(term);
    } catch (error) {
      console.error("Error updating term:", error);
      res.status(400).json({ error: "Failed to update term" });
    }
  });

  app.delete("/api/terms/:id", async (req, res) => {
    try {
      await storage.deleteTerm(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting term:", error);
      res.status(500).json({ error: "Failed to delete term" });
    }
  });

  // Assignments endpoints
  app.get("/api/subjects/:subjectId/assignments", async (req, res) => {
    try {
      const termId = req.query.termId as string;
      const assignments = await storage.getAssignmentsBySubject(req.params.subjectId, termId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ error: "Failed to fetch assignments" });
    }
  });

  app.post("/api/subjects/:subjectId/assignments", async (req, res) => {
    try {
      const validatedData = insertAssignmentSchema.parse({
        ...req.body,
        subjectId: req.params.subjectId
      });
      const assignment = await storage.createAssignment(validatedData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(400).json({ error: "Failed to create assignment" });
    }
  });

  app.put("/api/assignments/:id", async (req, res) => {
    try {
      const validatedData = updateAssignmentSchema.parse(req.body);
      const assignment = await storage.updateAssignment(req.params.id, validatedData);
      res.json(assignment);
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(400).json({ error: "Failed to update assignment" });
    }
  });

  app.delete("/api/assignments/:id", async (req, res) => {
    try {
      await storage.deleteAssignment(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ error: "Failed to delete assignment" });
    }
  });

  // Grades endpoints
  app.get("/api/assignments/:assignmentId/grades", async (req, res) => {
    try {
      const grades = await storage.getGradesByAssignment(req.params.assignmentId);
      res.json(grades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      res.status(500).json({ error: "Failed to fetch grades" });
    }
  });

  app.post("/api/assignments/:assignmentId/grades", async (req, res) => {
    try {
      const validatedData = insertGradeSchema.parse({
        ...req.body,
        assignmentId: req.params.assignmentId
      });
      const grade = await storage.createGrade(validatedData);
      res.json(grade);
    } catch (error) {
      console.error("Error creating grade:", error);
      res.status(400).json({ error: "Failed to create grade" });
    }
  });

  app.put("/api/grades/:id", async (req, res) => {
    try {
      const validatedData = updateGradeSchema.parse(req.body);
      const grade = await storage.updateGrade(req.params.id, validatedData);
      res.json(grade);
    } catch (error) {
      console.error("Error updating grade:", error);
      res.status(400).json({ error: "Failed to update grade" });
    }
  });

  app.delete("/api/grades/:id", async (req, res) => {
    try {
      await storage.deleteGrade(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting grade:", error);
      res.status(500).json({ error: "Failed to delete grade" });
    }
  });

  // Grade calculation endpoints
  app.get("/api/subjects/:subjectId/grades/summary", async (req, res) => {
    try {
      const termId = req.query.termId as string | undefined;
      const summary = await storage.getSubjectGradeSummary(req.params.subjectId, termId);
      res.json(summary);
    } catch (error) {
      console.error("Error calculating grade summary:", error);
      res.status(500).json({ error: "Failed to calculate grade summary" });
    }
  });

  app.get("/api/students/:studentId/gpa", async (req, res) => {
    try {
      const termId = req.query.termId as string;
      const gpa = await storage.calculateOverallGPA(req.params.studentId, termId);
      res.json({ gpa });
    } catch (error) {
      console.error("Error calculating GPA:", error);
      res.status(500).json({ error: "Failed to calculate GPA" });
    }
  });

  // Attendance endpoints
  app.get("/api/students/:studentId/attendance", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const attendance = await storage.getAttendanceByStudent(req.params.studentId, startDate, endDate);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ error: "Failed to fetch attendance" });
    }
  });

  app.post("/api/students/:studentId/attendance", async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const attendance = await storage.createAttendance(validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error creating attendance:", error);
      res.status(400).json({ error: "Failed to create attendance" });
    }
  });

  app.put("/api/attendance/:id", async (req, res) => {
    try {
      const validatedData = updateAttendanceSchema.parse(req.body);
      const attendance = await storage.updateAttendance(req.params.id, validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      res.status(400).json({ error: "Failed to update attendance" });
    }
  });

  app.delete("/api/attendance/:id", async (req, res) => {
    try {
      await storage.deleteAttendance(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting attendance:", error);
      res.status(500).json({ error: "Failed to delete attendance" });
    }
  });

  // Attendance statistics and reporting endpoints
  app.get("/api/students/:studentId/attendance/statistics", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Validate date formats if provided
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (startDate && !dateRegex.test(startDate)) {
        return res.status(400).json({ error: "Start date must be in YYYY-MM-DD format" });
      }
      if (endDate && !dateRegex.test(endDate)) {
        return res.status(400).json({ error: "End date must be in YYYY-MM-DD format" });
      }
      
      // Ensure start date is before end date if both provided
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: "Start date must be before end date" });
      }
      
      const statistics = await storage.getAttendanceStatistics(req.params.studentId, startDate, endDate);
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching attendance statistics:", error);
      res.status(500).json({ error: "Failed to fetch attendance statistics" });
    }
  });

  app.get("/api/students/:studentId/attendance/report/monthly", async (req, res) => {
    try {
      const yearNum = parseInt(req.query.year as string);
      const monthNum = parseInt(req.query.month as string);
      
      if (Number.isNaN(yearNum) || Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12 || yearNum < 1900 || yearNum > 2100) {
        return res.status(400).json({ error: "Invalid year or month parameter" });
      }
      
      const report = await storage.getMonthlyAttendanceReport(req.params.studentId, yearNum, monthNum);
      res.json(report);
    } catch (error) {
      console.error("Error fetching monthly attendance report:", error);
      res.status(500).json({ error: "Failed to fetch monthly attendance report" });
    }
  });

  app.get("/api/students/:studentId/attendance/report", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      // Validate date formats
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Both startDate and endDate are required" });
      }
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({ error: "Dates must be in YYYY-MM-DD format" });
      }
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: "Start date must be before end date" });
      }
      
      const report = await storage.getAttendanceReport(req.params.studentId, startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      res.status(500).json({ error: "Failed to fetch attendance report" });
    }
  });

  // Service Hours endpoints
  app.get("/api/students/:studentId/service-hours", async (req, res) => {
    try {
      const serviceHours = await storage.getServiceHoursByStudent(req.params.studentId);
      res.json(serviceHours);
    } catch (error) {
      console.error("Error fetching service hours:", error);
      res.status(500).json({ error: "Failed to fetch service hours" });
    }
  });

  app.post("/api/students/:studentId/service-hours", async (req, res) => {
    try {
      const validatedData = insertServiceHourSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const serviceHour = await storage.createServiceHour(validatedData);
      res.json(serviceHour);
    } catch (error) {
      console.error("Error creating service hour:", error);
      res.status(400).json({ error: "Failed to create service hour" });
    }
  });

  app.put("/api/service-hours/:id", async (req, res) => {
    try {
      const validatedData = updateServiceHourSchema.parse(req.body);
      const serviceHour = await storage.updateServiceHour(req.params.id, validatedData);
      res.json(serviceHour);
    } catch (error) {
      console.error("Error updating service hour:", error);
      res.status(400).json({ error: "Failed to update service hour" });
    }
  });

  app.delete("/api/service-hours/:id", async (req, res) => {
    try {
      await storage.deleteServiceHour(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service hour:", error);
      res.status(500).json({ error: "Failed to delete service hour" });
    }
  });

  // Grading Schemes endpoints
  app.get("/api/students/:studentId/grading-schemes", async (req, res) => {
    try {
      const schemes = await storage.getGradingSchemesByStudent(req.params.studentId);
      res.json(schemes);
    } catch (error) {
      console.error("Error fetching grading schemes:", error);
      res.status(500).json({ error: "Failed to fetch grading schemes" });
    }
  });

  app.post("/api/students/:studentId/grading-schemes", async (req, res) => {
    try {
      const validatedData = insertGradingSchemeSchema.parse({
        ...req.body,
        studentId: req.params.studentId
      });
      const scheme = await storage.createGradingScheme(validatedData);
      res.json(scheme);
    } catch (error) {
      console.error("Error creating grading scheme:", error);
      res.status(400).json({ error: "Failed to create grading scheme" });
    }
  });

  app.put("/api/grading-schemes/:id", async (req, res) => {
    try {
      const validatedData = insertGradingSchemeSchema.partial().parse(req.body);
      const scheme = await storage.updateGradingScheme(req.params.id, validatedData);
      res.json(scheme);
    } catch (error) {
      console.error("Error updating grading scheme:", error);
      res.status(400).json({ error: "Failed to update grading scheme" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
