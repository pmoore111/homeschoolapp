import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttendanceDialog } from "@/components/AttendanceDialog";
import { useDefaultStudent } from "@/hooks/useDefaultStudent";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from "lucide-react";

// Helper function to get local date in YYYY-MM-DD format (timezone-safe)
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: "Present" | "Absent" | "Excused";
  timeOfDay?: string;
  minutes?: number;
  notes?: string;
}

interface CalendarProps {
  studentName?: string;
}

export default function Calendar({ studentName = "Student" }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);

  // Use default student (auto-creates if none exists)
  const { student, isLoading: isLoadingStudent } = useDefaultStudent();

  const studentId = student?.id;

  // Get current month's date range (timezone-safe)
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startDate = getLocalDateString(firstDay);
  const endDate = getLocalDateString(lastDay);

  // Fetch attendance data for current month
  const { data: attendanceRecords = [], isLoading } = useQuery<Attendance[]>({
    queryKey: ['/api/students', studentId, 'attendance', startDate, endDate],
    queryFn: async () => {
      if (!studentId) return [];
      const res = await fetch(`/api/students/${studentId}/attendance?startDate=${startDate}&endDate=${endDate}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch attendance: ${res.statusText}`);
      }
      return res.json();
    },
    enabled: !!studentId, // Only fetch if we have a student ID
    retry: false,
    throwOnError: false, // Handle errors gracefully
  });

  // Create a map of attendance by date
  const attendanceByDate = attendanceRecords.reduce((acc, record) => {
    acc[record.date] = record;
    return acc;
  }, {} as Record<string, Attendance>);

  // Navigate months
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: null, isEmpty: true });
    }

    // Add days of the month (timezone-safe)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = getLocalDateString(date);
      const todayString = getLocalDateString();
      days.push({
        date: dateString,
        dayNumber: day,
        isEmpty: false,
        attendance: attendanceByDate[dateString],
        isToday: dateString === todayString,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Excused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const handleDayClick = (dateString: string) => {
    setSelectedDate(dateString);
    setAttendanceDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Calendar</h1>
          <p className="text-muted-foreground">Track daily attendance and activities</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedDate(getLocalDateString());
            setAttendanceDialogOpen(true);
          }}
          data-testid="button-add-attendance"
          disabled={isLoadingStudent}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Attendance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToToday}
                data-testid="button-today"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading calendar...</div>
          ) : (
            <>
              {/* Week days header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-sm text-muted-foreground py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] border rounded-md p-2
                      ${day.isEmpty ? 'bg-muted/20' : 'hover-elevate cursor-pointer'}
                      ${day.isToday ? 'ring-2 ring-primary' : ''}
                    `}
                    onClick={() => !day.isEmpty && day.date && handleDayClick(day.date)}
                    data-testid={day.date ? `calendar-day-${day.date}` : undefined}
                  >
                    {!day.isEmpty && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-medium ${day.isToday ? 'text-primary font-bold' : ''}`}>
                            {day.dayNumber}
                          </span>
                          {day.attendance && (
                            <Badge 
                              variant="secondary"
                              className={`text-xs px-1.5 py-0 ${getStatusColor(day.attendance.status)}`}
                              data-testid={`status-${day.date}`}
                            >
                              {day.attendance.status.charAt(0)}
                            </Badge>
                          )}
                        </div>
                        {day.attendance && (
                          <div className="space-y-1">
                            {day.attendance.timeOfDay && (
                              <p className="text-xs text-muted-foreground truncate">
                                {day.attendance.timeOfDay}
                              </p>
                            )}
                            {day.attendance.notes && (
                              <p 
                                className="text-xs line-clamp-2"
                                title={day.attendance.notes}
                                data-testid={`notes-${day.date}`}
                              >
                                {day.attendance.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Attendance Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Days</p>
              <p className="text-2xl font-bold" data-testid="stat-total-days">
                {attendanceRecords.length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-green-600" data-testid="stat-present">
                {attendanceRecords.filter(r => r.status === "Present").length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-red-600" data-testid="stat-absent">
                {attendanceRecords.filter(r => r.status === "Absent").length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Excused</p>
              <p className="text-2xl font-bold text-yellow-600" data-testid="stat-excused">
                {attendanceRecords.filter(r => r.status === "Excused").length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Dialog */}
      <AttendanceDialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}
        studentId={studentId || 'temp-id'}
        studentName={studentName}
        defaultDate={selectedDate || undefined}
      />
    </div>
  );
}
