import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, CheckCircle, XCircle, Clock, Edit, Loader2 } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Student, InsertAttendance, Attendance } from "@shared/schema";

type AttendanceStatus = "Present" | "Absent" | "Excused";

export function AttendanceTracker() {
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);
  const [formData, setFormData] = useState({
    status: "Present" as AttendanceStatus,
    minutes: "360",
    notes: ""
  });

  // Fetch students
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Auto-select first student if none selected
  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [selectedStudentId, students]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Calculate date range for selected month
  const monthRange = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { startDate, endDate };
  }, [selectedMonth]);

  // Fetch attendance data
  const { data: attendanceRecords = [], isLoading: attendanceLoading } = useQuery<Attendance[]>({
    queryKey: ["/api/students", selectedStudentId, "attendance", monthRange],
    queryFn: async () => {
      if (!selectedStudentId) return [];
      const response = await fetch(
        `/api/students/${selectedStudentId}/attendance?startDate=${monthRange.startDate}&endDate=${monthRange.endDate}`
      );
      if (!response.ok) throw new Error("Failed to fetch attendance");
      return response.json();
    },
    enabled: !!selectedStudentId,
  });

  // Create attendance mutation
  const createAttendance = useMutation({
    mutationFn: async (data: InsertAttendance) => {
      return await apiRequest("POST", `/api/students/${selectedStudentId}/attendance`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedStudentId, "attendance"] });
      toast({ title: "Attendance Marked", description: "Attendance has been recorded successfully." });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark attendance.", variant: "destructive" });
    },
  });

  // Update attendance mutation
  const updateAttendance = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAttendance> }) => {
      return await apiRequest("PUT", `/api/attendance/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedStudentId, "attendance"] });
      toast({ title: "Attendance Updated", description: "Attendance has been updated successfully." });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update attendance.", variant: "destructive" });
    },
  });

  // Delete attendance mutation
  const deleteAttendance = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/attendance/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedStudentId, "attendance"] });
      toast({ title: "Attendance Deleted", description: "Attendance record has been deleted." });
      setEditDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete attendance.", variant: "destructive" });
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceRecords.find(record => record.date === today);

  const quickMarkAttendance = (status: AttendanceStatus) => {
    if (!selectedStudentId) return;
    
    const existingRecord = attendanceRecords.find(r => r.date === today);
    
    if (existingRecord) {
      updateAttendance.mutate({
        id: existingRecord.id,
        data: {
          status,
          minutes: status === "Present" ? 360 : null,
          date: today,
        }
      });
    } else {
      createAttendance.mutate({
        studentId: selectedStudentId,
        date: today,
        status,
        minutes: status === "Present" ? 360 : null,
      });
    }
  };

  const openEditDialog = (date: string, record?: Attendance) => {
    setSelectedDate(date);
    setEditingRecord(record || null);
    
    if (record) {
      setFormData({
        status: record.status,
        minutes: record.minutes?.toString() || "360",
        notes: record.notes || ""
      });
    } else {
      setFormData({
        status: "Present",
        minutes: "360",
        notes: ""
      });
    }
    
    setEditDialogOpen(true);
  };

  const handleSaveAttendance = () => {
    if (!selectedStudentId || !selectedDate) return;

    const attendanceData = {
      studentId: selectedStudentId,
      date: selectedDate,
      status: formData.status,
      minutes: formData.minutes ? parseInt(formData.minutes) : null,
      notes: formData.notes || null,
    };

    if (editingRecord) {
      updateAttendance.mutate({
        id: editingRecord.id,
        data: attendanceData
      });
    } else {
      createAttendance.mutate(attendanceData);
    }
  };

  const handleDeleteAttendance = () => {
    if (editingRecord) {
      deleteAttendance.mutate(editingRecord.id);
    }
  };

  // Calculate monthly stats
  const stats = useMemo(() => {
    const present = attendanceRecords.filter(r => r.status === "Present").length;
    const absent = attendanceRecords.filter(r => r.status === "Absent").length;
    const excused = attendanceRecords.filter(r => r.status === "Excused").length;
    const total = attendanceRecords.length;
    const totalMinutes = attendanceRecords.reduce((sum, r) => sum + (r.minutes || 0), 0);
    
    return { present, absent, excused, total, totalMinutes };
  }, [attendanceRecords]);

  const attendanceRate = stats.total > 0 ? Math.round(((stats.present + stats.excused) / stats.total) * 100) : 0;

  // Generate calendar days for the selected month
  const calendarDays = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = attendanceRecords.find(r => r.date === dateStr);
      days.push({ day, date: dateStr, record });
    }
    
    return days;
  }, [selectedMonth, attendanceRecords]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "bg-chart-1 text-white";
      case "Excused": return "bg-chart-2 text-white";
      case "Absent": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present": return <CheckCircle className="h-3 w-3" />;
      case "Excused": return <Clock className="h-3 w-3" />;
      case "Absent": return <XCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  // Generate month options for the last 12 months and next 3 months
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    
    for (let i = -12; i <= 3; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push({ value, label });
    }
    
    return options;
  }, []);

  if (studentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracker</h1>
          <p className="text-muted-foreground">
            No students found. Please add a student first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="attendance-tracker-main">
      {/* Header with Student Selector */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Tracker</h1>
          <p className="text-muted-foreground">
            Track daily attendance and view statistics
          </p>
        </div>
        
        <div className="w-64">
          <Label htmlFor="student-select">Student</Label>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger id="student-select" data-testid="select-student">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map(student => (
                <SelectItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedStudent && (
        <>
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Attendance
                </span>
                {todayRecord && (
                  <Badge className={getStatusColor(todayRecord.status)}>
                    {getStatusIcon(todayRecord.status)}
                    {todayRecord.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  onClick={() => quickMarkAttendance("Present")}
                  variant={todayRecord?.status === "Present" ? "default" : "outline"}
                  disabled={createAttendance.isPending || updateAttendance.isPending}
                  data-testid="button-mark-present"
                >
                  {(createAttendance.isPending || updateAttendance.isPending) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Present
                </Button>
                <Button 
                  onClick={() => quickMarkAttendance("Absent")}
                  variant={todayRecord?.status === "Absent" ? "destructive" : "outline"}
                  disabled={createAttendance.isPending || updateAttendance.isPending}
                  data-testid="button-mark-absent"
                >
                  {(createAttendance.isPending || updateAttendance.isPending) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Absent
                </Button>
                <Button 
                  onClick={() => quickMarkAttendance("Excused")}
                  variant={todayRecord?.status === "Excused" ? "secondary" : "outline"}
                  disabled={createAttendance.isPending || updateAttendance.isPending}
                  data-testid="button-mark-excused"
                >
                  {(createAttendance.isPending || updateAttendance.isPending) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Excused
                </Button>
                {todayRecord && (
                  <Button
                    onClick={() => openEditDialog(today, todayRecord)}
                    variant="ghost"
                    size="icon"
                    data-testid="button-edit-today"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Present Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-1" data-testid="text-present-days">
                  {stats.present}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Excused Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-2" data-testid="text-excused-days">
                  {stats.excused}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive" data-testid="text-absent-days">
                  {stats.absent}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-attendance-rate">
                  {attendanceRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar View */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Monthly Calendar</CardTitle>
              <div className="flex items-center gap-4">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-48" data-testid="select-month">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Legend */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-chart-1"></div>
                      <span>Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-chart-2"></div>
                      <span>Excused</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-destructive"></div>
                      <span>Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded border-2 border-muted"></div>
                      <span>No Record</span>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Week day headers */}
                    {weekDays.map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {calendarDays.map((day, index) => (
                      <div key={index} className="aspect-square">
                        {day ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`w-full h-full flex flex-col items-center justify-center text-xs relative ${
                              day.record ? getStatusColor(day.record.status) : "hover-elevate"
                            }`}
                            onClick={() => openEditDialog(day.date, day.record)}
                            data-testid={`calendar-day-${day.day}`}
                          >
                            <span className="font-medium">{day.day}</span>
                            {day.record && (
                              <div className="absolute bottom-0 right-0">
                                {getStatusIcon(day.record.status)}
                              </div>
                            )}
                          </Button>
                        ) : (
                          <div className="w-full h-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Attendance Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total School Days:</span>
                      <span className="font-medium" data-testid="text-total-days">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days Present:</span>
                      <span className="font-medium text-chart-1">{stats.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days Excused:</span>
                      <span className="font-medium text-chart-2">{stats.excused}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Days Absent:</span>
                      <span className="font-medium text-destructive">{stats.absent}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Time Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Minutes:</span>
                      <span className="font-medium" data-testid="text-total-minutes">{stats.totalMinutes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Hours:</span>
                      <span className="font-medium">{Math.round(stats.totalMinutes / 60 * 10) / 10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Daily Hours:</span>
                      <span className="font-medium">
                        {stats.present > 0 ? Math.round((stats.totalMinutes / stats.present / 60) * 10) / 10 : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Attendance Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent data-testid="dialog-edit-attendance">
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Edit" : "Add"} Attendance - {selectedDate}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: AttendanceStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status" data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Excused">Excused</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minutes">Minutes (optional)</Label>
              <Input
                id="minutes"
                type="number"
                value={formData.minutes}
                onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                placeholder="360"
                data-testid="input-minutes"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this attendance record..."
                data-testid="input-notes"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingRecord && (
              <Button
                variant="destructive"
                onClick={handleDeleteAttendance}
                disabled={deleteAttendance.isPending}
                data-testid="button-delete-attendance"
              >
                {deleteAttendance.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveAttendance}
              disabled={createAttendance.isPending || updateAttendance.isPending}
              data-testid="button-save-attendance"
            >
              {(createAttendance.isPending || updateAttendance.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
