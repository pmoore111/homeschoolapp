import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AttendanceDialog } from "./AttendanceDialog";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  FileText
} from "lucide-react";

interface KhanLesson {
  id: string;
  title: string;
  lessonType: "practice" | "quiz" | "test" | "lesson";
  status: "unfamiliar" | "familiar" | "proficient" | "mastered" | "not started" | "attempted";
  pointsEarned?: number;
  maxPoints?: number;
  isKhanLesson: boolean;
}

interface DashboardProps {
  studentName?: string;
}

export function Dashboard({ studentName = "Student" }: DashboardProps) {
  const [, setLocation] = useLocation();
  const [subjects, setSubjects] = useState<Array<{
    name: string;
    currentUnit: string;
    average: number;
    letterGrade: string;
    assignments: number;
    missing: number;
  }>>([]);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);

  const subjectList = ["8th grade math (TX TEKS)", "Grammar", "Good Citizenship"];
  const units = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5", "Unit 6", "Unit 7", "Unit 8", "Unit 9", "Unit 10"];

  // Fetch students to get the student ID (gracefully handles auth errors in development)
  const { data: students } = useQuery<any[]>({
    queryKey: ['/api/students'],
    retry: false,
    throwOnError: false, // Don't throw errors, just return undefined
  });

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const calculateSubjectData = (subjectName: string) => {
    // First, check if there are unit dates set for this subject
    const datesKey = `unit-dates-${subjectName}`;
    const storedDates = localStorage.getItem(datesKey);
    let currentUnit = "Unit 1";
    let unitDeterminedByDate = false;
    
    if (storedDates) {
      try {
        const unitDates: Record<string, { startDate: string; endDate: string }> = JSON.parse(storedDates);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for date comparison
        
        // Find which unit today falls into
        for (const unit of units) {
          const dates = unitDates[unit];
          if (dates?.startDate && dates?.endDate) {
            // Parse dates as local dates to avoid timezone issues
            const [startY, startM, startD] = dates.startDate.split('-').map(Number);
            const [endY, endM, endD] = dates.endDate.split('-').map(Number);
            const startDate = new Date(startY, startM - 1, startD);
            const endDate = new Date(endY, endM - 1, endD);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            
            if (today >= startDate && today <= endDate) {
              currentUnit = unit;
              unitDeterminedByDate = true;
              break;
            }
          }
        }
      } catch (e) {
        // If parsing fails, fall through to the logic below
      }
    }
    
    // If unit wasn't determined by date, find the most recent unit with data
    let mostRecentUnitData: KhanLesson[] | null = null;
    
    if (!unitDeterminedByDate) {
      for (let i = units.length - 1; i >= 0; i--) {
        const storageKey = `khan-lessons-${subjectName}-${units[i]}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const lessons = JSON.parse(stored);
            if (lessons.length > 0) {
              currentUnit = units[i];
              mostRecentUnitData = lessons;
              break;
            }
          } catch (e) {
            // Skip invalid data
          }
        }
      }
    } else {
      // Load data for the date-determined unit
      const storageKey = `khan-lessons-${subjectName}-${currentUnit}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          mostRecentUnitData = JSON.parse(stored);
        } catch (e) {
          // Skip invalid data
        }
      }
    }

    // If no data found, return default values
    if (!mostRecentUnitData || mostRecentUnitData.length === 0) {
      return {
        name: subjectName,
        currentUnit,
        average: 0,
        letterGrade: "N/A",
        assignments: 0,
        missing: 0
      };
    }

    // Calculate grade for the current unit
    let totalEarned = 0;
    let totalPossible = 0;
    let missing = 0;

    for (const lesson of mostRecentUnitData) {
      if (lesson.lessonType === "quiz") {
        // Quiz: 240 max points
        const maxPoints = lesson.maxPoints || 240;
        totalPossible += maxPoints;
        if (lesson.pointsEarned !== undefined && lesson.pointsEarned > 0) {
          totalEarned += lesson.pointsEarned;
        } else {
          missing++;
        }
      } else if (lesson.lessonType === "test") {
        // Test: 400 max points (or use maxPoints from lesson)
        const maxPoints = lesson.maxPoints || 400;
        totalPossible += maxPoints;
        if (lesson.pointsEarned !== undefined && lesson.pointsEarned > 0) {
          totalEarned += lesson.pointsEarned;
        } else {
          missing++;
        }
      } else {
        // Practice lesson: Khan Academy mastery system
        // familiar = 50, proficient = 100, mastered = 150, max = 150
        const statusPoints: Record<typeof lesson.status, number> = {
          "not started": 0,
          "attempted": 0,
          "unfamiliar": 0,
          "familiar": 50,
          "proficient": 100,
          "mastered": 150
        };
        totalPossible += 150;
        totalEarned += statusPoints[lesson.status] || 0;
      }
    }

    const average = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    const letterGrade = average > 0 ? getLetterGrade(average) : "N/A";

    return {
      name: subjectName,
      currentUnit,
      average,
      letterGrade,
      assignments: mostRecentUnitData.length,
      missing
    };
  };

  useEffect(() => {
    const loadSubjects = () => {
      const subjectData = subjectList.map(subject => calculateSubjectData(subject));
      setSubjects(subjectData);
    };

    loadSubjects();

    // Listen for localStorage changes to update in real-time
    const handleStorageChange = () => {
      loadSubjects();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also create a custom event for same-tab updates
    const handleCustomUpdate = () => {
      loadSubjects();
    };
    window.addEventListener('lessonsUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lessonsUpdated', handleCustomUpdate);
    };
  }, []);

  const attendanceData = {
    present: 142,
    absent: 3,
    excused: 2,
    total: 147,
    percentage: 97
  };

  const serviceHours = {
    thisMonth: 8.5,
    yearTotal: 45.5,
    goal: 60
  };

  const overallGPA = 3.6;

  return (
    <div className="space-y-6 p-6" data-testid="dashboard-main">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of {studentName}'s progress.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-gpa">{overallGPA}</div>
            <p className="text-xs text-muted-foreground">
              +0.2 from last term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-attendance">{attendanceData.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              {attendanceData.present} of {attendanceData.total} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-service-hours">{serviceHours.yearTotal}</div>
            <p className="text-xs text-muted-foreground">
              {serviceHours.thisMonth} hours this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing Assignments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive" data-testid="text-missing">1</div>
            <p className="text-xs text-muted-foreground">
              8th grade math (TX TEKS) homework due today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject Averages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subjects.map((subject) => (
            <div key={subject.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{subject.name}</span>
                  {subject.missing > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {subject.missing} missing
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{subject.letterGrade}</Badge>
                  <span className="text-sm font-medium" data-testid={`grade-${subject.name.toLowerCase()}`}>
                    {subject.average}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Current: {subject.currentUnit}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button data-testid="button-add-grade">
              <BookOpen className="h-4 w-4 mr-2" />
              Add Grade
            </Button>
            <Button 
              variant="outline" 
              data-testid="button-mark-attendance"
              onClick={() => setLocation('/calendar')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Mark Today's Attendance
            </Button>
            <Button variant="outline" data-testid="button-log-service">
              <Clock className="h-4 w-4 mr-2" />
              Log Service Hours
            </Button>
            <Button variant="outline" data-testid="button-generate-report">
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Dialog */}
      <AttendanceDialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}
        studentId={students?.[0]?.id || 'temp-id'}
        studentName={studentName}
      />
    </div>
  );
}