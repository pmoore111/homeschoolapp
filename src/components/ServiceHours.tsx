import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Clock, Plus, Award, Target, Trash2, Calendar, User, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ServiceEntry {
  id: string;
  studentId: string;
  date: string;
  hours: number;
  description: string;
  category: string | null;
  createdAt: string | null;
}

interface Student {
  id: string;
  name: string;
  userId: string;
  dateOfBirth: string | null;
  schoolYear: string;
  guardianName: string | null;
  notes: string | null;
  createdAt: string | null;
}

interface ServiceHoursProps {
  studentName?: string;
}

// Form schema for adding new students
const addStudentSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  schoolYear: z.string().min(1, "School year is required"),
  dateOfBirth: z.string().optional(),
  guardianName: z.string().optional(),
  notes: z.string().optional(),
});

type AddStudentFormData = z.infer<typeof addStudentSchema>;

export function ServiceHours({ studentName }: ServiceHoursProps) {
  const { toast } = useToast();
  const [addStudentDialogOpen, setAddStudentDialogOpen] = useState(false);
  
  // Get students first
  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Use first student if available, or default studentName prop
  const selectedStudent = students[0];

  // Form for adding new students
  const addStudentForm = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      name: "",
      schoolYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1), // Default to current school year
      dateOfBirth: "",
      guardianName: "",
      notes: "",
    },
  });

  // Mutation for creating a student
  const createStudentMutation = useMutation({
    mutationFn: async (studentData: AddStudentFormData) => {
      const data = { ...studentData };
      // Convert empty strings to undefined for optional fields
      if (!data.dateOfBirth) data.dateOfBirth = undefined;
      if (!data.guardianName) data.guardianName = undefined;  
      if (!data.notes) data.notes = undefined;
      
      const response = await apiRequest("POST", "/api/students", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setAddStudentDialogOpen(false);
      addStudentForm.reset();
      toast({
        title: "Success",
        description: "Student added successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting a student  
  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest("DELETE", `/api/students/${studentId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Success",
        description: "Student deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete student",
        variant: "destructive", 
      });
    },
  });

  const handleAddStudent = (data: AddStudentFormData) => {
    createStudentMutation.mutate(data);
  };

  const handleDeleteStudent = (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to delete ${studentName}? This will also delete all their grades, attendance, and service hours.`)) {
      deleteStudentMutation.mutate(studentId);
    }
  };

  // Get service hours for the selected student
  const { data: serviceHours = [], isLoading: serviceHoursLoading, refetch } = useQuery<ServiceEntry[]>({
    queryKey: ["/api/students", selectedStudent?.id, "service-hours"],
    enabled: !!selectedStudent?.id,
  });

  const [newEntry, setNewEntry] = useState({
    date: "",
    hours: "",
    description: "",
    category: "Community Service"
  });

  // Mutation to create service hour
  const createServiceHourMutation = useMutation({
    mutationFn: async (data: { date: string; hours: number; description: string; category: string }) => {
      if (!selectedStudent?.id) throw new Error("No student selected");
      const response = await apiRequest("POST", `/api/students/${selectedStudent.id}/service-hours`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedStudent?.id, "service-hours"] });
      setNewEntry({
        date: "",
        hours: "",
        description: "",
        category: "Community Service"
      });
      toast({
        title: "Service hours logged",
        description: "Your service hours have been successfully recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to log service hours. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating service hour:", error);
    },
  });

  // Mutation to delete service hour
  const deleteServiceHourMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/service-hours/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", selectedStudent?.id, "service-hours"] });
      toast({
        title: "Service hours deleted",
        description: "The service hour entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to delete service hours. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting service hour:", error);
    },
  });

  const addEntry = () => {
    if (newEntry.date && newEntry.hours && newEntry.description) {
      createServiceHourMutation.mutate({
        date: newEntry.date,
        hours: parseFloat(newEntry.hours),
        description: newEntry.description,
        category: newEntry.category || "Community Service"
      });
    }
  };

  const deleteEntry = (id: string) => {
    deleteServiceHourMutation.mutate(id);
  };

  // Calculate totals
  const totalHours = serviceHours.reduce((sum, entry) => sum + entry.hours, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthHours = serviceHours
    .filter(entry => entry.date.startsWith(currentMonth))
    .reduce((sum, entry) => sum + entry.hours, 0);
  
  const yearGoal = 60; // Texas typical requirement
  const progressPercentage = Math.min((totalHours / yearGoal) * 100, 100);

  // Group by category
  const categorySummary = serviceHours.reduce((acc, entry) => {
    const category = entry.category || "Other";
    acc[category] = (acc[category] || 0) + entry.hours;
    return acc;
  }, {} as Record<string, number>);

  // Recent entries (last 5)
  const recentEntries = [...serviceHours]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 p-6" data-testid="service-hours-main">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Service Hours</h1>
        <p className="text-muted-foreground">
          Track community service and volunteer hours for {selectedStudent?.name || studentName || "Student"}
        </p>
      </div>

      {/* Student Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Manage Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {students.length === 0 
                  ? "No students added yet"  
                  : `${students.length} student${students.length === 1 ? '' : 's'} enrolled`
                }
              </p>
            </div>
            
            {/* Add Student Dialog */}
            <Dialog open={addStudentDialogOpen} onOpenChange={setAddStudentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="button-add-student">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Add a new student to start tracking their service hours, grades, and attendance.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...addStudentForm}>
                  <form onSubmit={addStudentForm.handleSubmit(handleAddStudent)} className="space-y-4">
                    <FormField
                      control={addStudentForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter student name" data-testid="input-student-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addStudentForm.control}
                      name="schoolYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Year *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 2024-2025" data-testid="input-school-year" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addStudentForm.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" data-testid="input-date-birth" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addStudentForm.control}
                      name="guardianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guardian Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Parent/Guardian name" data-testid="input-guardian-name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addStudentForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes about the student" data-testid="input-notes" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setAddStudentDialogOpen(false)}
                        data-testid="button-cancel-student"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createStudentMutation.isPending}
                        data-testid="button-submit-student"
                      >
                        {createStudentMutation.isPending ? "Adding..." : "Add Student"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Students List */}
          {students.length > 0 && (
            <div className="space-y-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`student-card-${student.id}`}>
                  <div className="flex-1">
                    <h3 className="font-medium" data-testid={`text-student-name-${student.id}`}>{student.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      <span data-testid={`text-school-year-${student.id}`}>School Year: {student.schoolYear}</span>
                      {student.guardianName && (
                        <span className="ml-4" data-testid={`text-guardian-${student.id}`}>Guardian: {student.guardianName}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteStudent(student.id, student.name)}
                    disabled={deleteStudentMutation.isPending}
                    className="text-destructive hover:text-destructive"
                    data-testid={`button-delete-student-${student.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {(studentsLoading || serviceHoursLoading) && (
        <div className="text-center py-8 text-muted-foreground">
          Loading service hours...
        </div>
      )}

      {/* No Student State */}
      {!studentsLoading && students.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No students found. Please add a student first.
        </div>
      )}

      {/* Main Content - only show when we have a student and not loading */}
      {selectedStudent && !studentsLoading && !serviceHoursLoading && (
        <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-hours">{totalHours}</div>
            <p className="text-xs text-muted-foreground">
              All-time service hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-month-hours">{thisMonthHours}</div>
            <p className="text-xs text-muted-foreground">
              Hours this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-goal-hours">{yearGoal}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(progressPercentage)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-categories">{Object.keys(categorySummary).length}</div>
            <p className="text-xs text-muted-foreground">
              Service areas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Toward Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Annual Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress toward {yearGoal} hour goal</span>
              <span className="font-medium">{totalHours} / {yearGoal} hours</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-chart-1 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
                data-testid="progress-bar"
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {totalHours >= yearGoal ? 
                "🎉 Congratulations! You've exceeded your annual goal!" :
                `${yearGoal - totalHours} hours remaining to reach your goal`
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Add New Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Log Service Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                data-testid="input-service-date"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Hours</label>
              <Input
                type="number"
                step="0.5"
                placeholder="3.5"
                value={newEntry.hours}
                onChange={(e) => setNewEntry({...newEntry, hours: e.target.value})}
                data-testid="input-service-hours"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Input
                placeholder="Community Service"
                value={newEntry.category}
                onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                data-testid="input-service-category"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea
              placeholder="Describe the service activity and your contributions..."
              value={newEntry.description}
              onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
              rows={3}
              data-testid="input-service-description"
            />
          </div>
          
          <Button 
            onClick={addEntry} 
            className="w-full" 
            data-testid="button-add-service"
            disabled={createServiceHourMutation.isPending || !selectedStudent?.id}
          >
            <Plus className="h-4 w-4 mr-2" />
            {createServiceHourMutation.isPending ? "Logging..." : "Log Service Hours"}
          </Button>
        </CardContent>
      </Card>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categorySummary).map(([category, hours]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{category}</span>
                <Badge variant="secondary" data-testid={`category-hours-${category.toLowerCase().replace(/\s+/g, '-')}`}>
                  {hours} hrs
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Service Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{entry.hours}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{entry.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEntry(entry.id)}
                      data-testid={`button-delete-${entry.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {serviceHours.length > 5 && (
            <div className="pt-4 text-center">
              <Button variant="outline" data-testid="button-view-all-entries">
                View All {serviceHours.length} Entries
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}