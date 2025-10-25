import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useDefaultStudent } from "@/hooks/useDefaultStudent";
import type { Student, Subject, Term, ServiceHour } from "@shared/schema";
import { 
  FileText, 
  Download, 
  Calendar, 
  GraduationCap, 
  Clock,
  BookOpen,
  Printer
} from "lucide-react";

interface ReportsPanelProps {
  studentName?: string;
}

interface GradeSummary {
  percentage: number;
  letterGrade: string;
  totalAssignments: number;
  completedAssignments: number;
}

export function ReportsPanel({ studentName = "Student" }: ReportsPanelProps) {
  const { student, isLoading: isStudentLoading } = useDefaultStudent();
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState("progress");

  // Fetch subjects for the student
  const { data: subjects = [], isLoading: isSubjectsLoading } = useQuery<Subject[]>({
    queryKey: ['/api/students', student?.id, 'subjects'],
    enabled: !!student?.id,
  });

  // Fetch terms for the student
  const { data: terms = [], isLoading: isTermsLoading } = useQuery<Term[]>({
    queryKey: ['/api/students', student?.id, 'terms'],
    enabled: !!student?.id,
  });

  // Fetch service hours for the student
  const { data: serviceHours = [], isLoading: isServiceHoursLoading } = useQuery<ServiceHour[]>({
    queryKey: ['/api/students', student?.id, 'service-hours'],
    enabled: !!student?.id,
  });

  // Get the selected term data
  const selectedTermData = useMemo(() => {
    if (selectedTerm === "all") {
      // Return a synthetic "all" term covering the full year
      const sortedTerms = [...terms].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      if (sortedTerms.length === 0) return null;
      
      return {
        id: "all",
        name: "Full Year",
        startDate: sortedTerms[0].startDate,
        endDate: sortedTerms[sortedTerms.length - 1].endDate,
      };
    }
    return terms.find(t => t.id === selectedTerm);
  }, [selectedTerm, terms]);

  // Fetch attendance statistics for the selected term
  const { data: attendanceStats } = useQuery<{
    present: number;
    absent: number;
    excused: number;
    total: number;
    percentage: number;
  }>({
    queryKey: [
      '/api/students',
      student?.id,
      'attendance',
      'statistics',
      { startDate: selectedTermData?.startDate, endDate: selectedTermData?.endDate }
    ],
    queryFn: async () => {
      if (!selectedTermData) return { present: 0, absent: 0, excused: 0, total: 0, percentage: 100 };
      
      const params = new URLSearchParams({
        startDate: selectedTermData.startDate,
        endDate: selectedTermData.endDate,
      });
      const response = await fetch(`/api/students/${student?.id}/attendance/statistics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch attendance statistics');
      return response.json();
    },
    enabled: !!student?.id && !!selectedTermData,
  });

  // Fetch grade summaries for each subject
  const subjectGradeQueries = subjects.map(subject => ({
    subject,
    query: useQuery<GradeSummary>({
      queryKey: [
        '/api/subjects',
        subject.id,
        'grades',
        'summary',
        { termId: selectedTerm === "all" ? undefined : selectedTerm }
      ],
      queryFn: async () => {
        const termIdParam = selectedTerm === "all" ? "" : `?termId=${selectedTerm}`;
        const response = await fetch(`/api/subjects/${subject.id}/grades/summary${termIdParam}`);
        if (!response.ok) {
          // Return empty summary if there's an error
          return {
            percentage: 0,
            letterGrade: "N/A",
            totalAssignments: 0,
            completedAssignments: 0,
          };
        }
        return response.json();
      },
      enabled: !!subject.id,
    })
  }));

  // Calculate service hours totals
  const serviceHoursSummary = useMemo(() => {
    const total = serviceHours.reduce((sum, sh) => sum + sh.hours, 0);
    const categorySet = new Set(serviceHours.map(sh => sh.category || "Community Service"));
    const categories = Array.from(categorySet);
    return {
      total,
      entries: serviceHours.length,
      categories,
    };
  }, [serviceHours]);

  // Calculate GPA from subject averages
  const calculateGPA = () => {
    const validGrades = subjectGradeQueries
      .map(q => q.query.data?.letterGrade)
      .filter(grade => grade && grade !== "N/A");
    
    if (validGrades.length === 0) return "0.0";
    
    const totalGradePoints = validGrades.reduce((sum, grade) => {
      let gradePoint = 0;
      if (grade === "A") gradePoint = 4.0;
      else if (grade === "B") gradePoint = 3.0;
      else if (grade === "C") gradePoint = 2.0;
      else if (grade === "D") gradePoint = 1.0;
      return sum + gradePoint;
    }, 0);
    
    return (totalGradePoints / validGrades.length).toFixed(1);
  };

  const reportTypes = [
    {
      id: "progress",
      name: "Progress Report",
      description: "Current progress with grades, attendance, and service hours",
      icon: BookOpen
    },
    {
      id: "report-card", 
      name: "Report Card",
      description: "Final grades with letter grades and official transcript format",
      icon: GraduationCap
    },
    {
      id: "attendance",
      name: "Attendance Report",
      description: "Detailed attendance summary with daily records and statistics",
      icon: Calendar
    },
    {
      id: "service",
      name: "Service Hours Report", 
      description: "Community service and volunteer hours with detailed descriptions",
      icon: Clock
    }
  ];

  const generateReport = (type: string) => {
    console.log("Generating report:", type, "for student:", student?.id, "term:", selectedTerm);
    const reportType = reportTypes.find(r => r.id === type);
    alert(`Generating ${reportType?.name} for ${student?.firstName} ${student?.lastName}...\n\nThis would normally download a PDF with the current data.`);
  };

  const selectedReportType = reportTypes.find(r => r.id === selectedReport);

  // Loading state
  const isLoading = isStudentLoading || isSubjectsLoading || isTermsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6" data-testid="reports-panel-main">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6 p-6" data-testid="reports-panel-main">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            No student found. Please create a student first.
          </p>
        </div>
      </div>
    );
  }

  const studentData = {
    info: {
      name: `${student.firstName} ${student.lastName}`,
      grade: student.gradeLevel || "8th Grade",
      schoolYear: "2024-2025",
      guardianName: "Parent/Guardian",
      dateOfBirth: student.dateOfBirth || ""
    },
    subjects: subjectGradeQueries.map(({ subject, query }) => ({
      id: subject.id,
      name: subject.name,
      average: query.data?.percentage || 0,
      letterGrade: query.data?.letterGrade || "N/A",
      totalAssignments: query.data?.totalAssignments || 0,
      completedAssignments: query.data?.completedAssignments || 0,
    })),
    attendance: attendanceStats || {
      present: 0,
      absent: 0,
      excused: 0,
      total: 0,
      percentage: 100
    },
    serviceHours: serviceHoursSummary,
    gpa: calculateGPA()
  };

  // All terms including a "Full Year" option
  const allTermOptions = [
    { id: "all", name: "Full Year" },
    ...terms.map(t => ({ id: t.id, name: t.name, startDate: t.startDate, endDate: t.endDate }))
  ];

  return (
    <div className="space-y-6 p-6" data-testid="reports-panel-main">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate progress reports, report cards, and other official documents
        </p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configure Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Student</label>
              <div className="flex items-center h-10 px-3 py-2 border rounded-md bg-muted" data-testid="text-report-student">
                <span className="font-medium">{student.firstName} {student.lastName}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Term/Period</label>
              <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                <SelectTrigger data-testid="select-report-term">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allTermOptions.map(term => (
                    <SelectItem key={term.id} value={term.id}>{term.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTermData && selectedTermData.id !== "all" && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">{selectedTermData.name} Details</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedTermData.startDate).toLocaleDateString()} - {new Date(selectedTermData.endDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Types Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((type) => (
          <Card 
            key={type.id} 
            className={`cursor-pointer transition-all hover-elevate ${
              selectedReport === type.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedReport(type.id)}
            data-testid={`card-report-type-${type.id}`}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedReport === type.id ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">{type.name}</div>
                  <div className="text-sm text-muted-foreground font-normal">
                    {type.description}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Report Preview */}
      {selectedReportType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <selectedReportType.icon className="h-5 w-5" />
                {selectedReportType.name} Preview
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.print()}
                  data-testid="button-preview-report"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button 
                  onClick={() => generateReport(selectedReport)}
                  data-testid="button-generate-report"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Report Preview Content */}
            <div className="border rounded-lg p-6 bg-white text-black min-h-96" data-testid="report-preview-content">
              {/* Header */}
              <div className="text-center border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold">Texas Homeschool</h2>
                <h3 className="text-xl">{selectedReportType.name}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  School Year: {studentData.info.schoolYear} | {selectedTermData?.name}
                </p>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Student Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {studentData.info.name}</div>
                    <div><strong>Grade:</strong> {studentData.info.grade}</div>
                    <div><strong>Guardian:</strong> {studentData.info.guardianName}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Period Information</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Term:</strong> {selectedTermData?.name}</div>
                    {selectedTermData && (
                      <>
                        <div><strong>Start Date:</strong> {new Date(selectedTermData.startDate).toLocaleDateString()}</div>
                        <div><strong>End Date:</strong> {new Date(selectedTermData.endDate).toLocaleDateString()}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Report Type Specific Content */}
              {selectedReport === "progress" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Academic Progress</h4>
                    {studentData.subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No grade data available yet. Start entering grades in the Classes section.</p>
                    ) : (
                      <div className="space-y-2">
                        {studentData.subjects.map(subject => (
                          <div key={subject.id} className="flex justify-between items-center py-2 border-b border-gray-200" data-testid={`report-subject-${subject.name}`}>
                            <div className="flex flex-col">
                              <span className="font-medium">{subject.name}</span>
                              <span className="text-xs text-gray-500">
                                Completed: {subject.completedAssignments}/{subject.totalAssignments} assignments
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm" data-testid={`report-subject-percentage-${subject.name}`}>{subject.average}%</span>
                              <Badge variant="outline" data-testid={`report-subject-grade-${subject.name}`}>{subject.letterGrade}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Attendance</h4>
                      <div className="text-sm space-y-1">
                        <div>Present: {studentData.attendance.present} days</div>
                        <div>Absent: {studentData.attendance.absent} days</div>
                        <div>Excused: {studentData.attendance.excused} days</div>
                        <div><strong>Rate: {studentData.attendance.percentage.toFixed(1)}%</strong></div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Service Hours</h4>
                      <div className="text-sm space-y-1">
                        <div>Total Hours: {studentData.serviceHours.total}</div>
                        <div>Entries: {studentData.serviceHours.entries}</div>
                        <div>Categories: {studentData.serviceHours.categories.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === "report-card" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Final Grades</h4>
                    {studentData.subjects.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No grade data available yet. Start entering grades in the Classes section.</p>
                    ) : (
                      <table className="w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-3 py-2 text-left">Subject</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Percentage</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Letter Grade</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentData.subjects.map(subject => (
                            <tr key={subject.id}>
                              <td className="border border-gray-300 px-3 py-2">{subject.name}</td>
                              <td className="border border-gray-300 px-3 py-2 text-center">{subject.average}%</td>
                              <td className="border border-gray-300 px-3 py-2 text-center font-bold">{subject.letterGrade}</td>
                              <td className="border border-gray-300 px-3 py-2 text-center">1.0</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">{studentData.gpa}</div>
                      <div className="text-sm text-gray-600">GPA</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">{studentData.subjects.length}</div>
                      <div className="text-sm text-gray-600">Courses</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">{studentData.subjects.length}.0</div>
                      <div className="text-sm text-gray-600">Credits Earned</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedReport === "attendance" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Attendance Summary</h4>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{studentData.attendance.present}</div>
                        <div className="text-sm text-gray-600">Present</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-600">{studentData.attendance.absent}</div>
                        <div className="text-sm text-gray-600">Absent</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">{studentData.attendance.excused}</div>
                        <div className="text-sm text-gray-600">Excused</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{studentData.attendance.percentage.toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Rate</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Attendance Analysis</h4>
                    <p className="text-sm text-gray-600">
                      Student has maintained a {studentData.attendance.percentage.toFixed(1)}% attendance rate during this period.
                      {studentData.attendance.percentage >= 95 && " Excellent attendance record!"}
                      {studentData.attendance.percentage >= 90 && studentData.attendance.percentage < 95 && " Good attendance record."}
                      {studentData.attendance.percentage < 90 && " Consider reviewing attendance patterns."}
                    </p>
                  </div>
                </div>
              )}

              {selectedReport === "service" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Service Hours Summary</h4>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">{studentData.serviceHours.total}</div>
                        <div className="text-sm text-gray-600">Total Hours</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">{studentData.serviceHours.entries}</div>
                        <div className="text-sm text-gray-600">Activities</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">{studentData.serviceHours.categories.length}</div>
                        <div className="text-sm text-gray-600">Categories</div>
                      </div>
                    </div>
                  </div>

                  {serviceHours.length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-3">Service Activities</h4>
                      <table className="w-full border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-3 py-2 text-left">Date</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Activity</th>
                            <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
                            <th className="border border-gray-300 px-3 py-2 text-center">Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          {serviceHours.map(sh => (
                            <tr key={sh.id}>
                              <td className="border border-gray-300 px-3 py-2">
                                {new Date(sh.date).toLocaleDateString()}
                              </td>
                              <td className="border border-gray-300 px-3 py-2">{sh.description}</td>
                              <td className="border border-gray-300 px-3 py-2">{sh.category || "Community Service"}</td>
                              <td className="border border-gray-300 px-3 py-2 text-center">{sh.hours}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No service hours recorded yet. Add entries in the Service Hours section.</p>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t text-center text-sm text-gray-500">
                <p>This report was generated on {new Date().toLocaleDateString()}</p>
                <p className="mt-1">Texas Homeschool - Official Academic Record</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
