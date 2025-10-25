import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import type { Student } from "@shared/schema";

interface StudentFormData {
  firstName: string;
  lastName: string;
  gradeLevel: string;
  dateOfBirth: string;
}

export function StudentsPage() {
  const { toast } = useToast();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: "",
    lastName: "",
    gradeLevel: "",
    dateOfBirth: ""
  });

  // Fetch students
  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  // Create student mutation
  const createStudent = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const response = await apiRequest("POST", "/api/students", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsWizardOpen(false);
      setWizardStep(1);
      resetForm();
      toast({
        title: "Student Added",
        description: "Student has been successfully added to your account.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add student. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update student mutation
  const updateStudent = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StudentFormData> }) => {
      const response = await apiRequest("PUT", `/api/students/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsWizardOpen(false);
      setEditingStudent(null);
      setWizardStep(1);
      resetForm();
      toast({
        title: "Student Updated",
        description: "Student information has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete student mutation
  const deleteStudent = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest("DELETE", `/api/students/${studentId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      toast({
        title: "Student Removed",
        description: "Student has been removed from your account.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove student. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      gradeLevel: "",
      dateOfBirth: ""
    });
  };

  const openWizard = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        gradeLevel: student.gradeLevel || "",
        dateOfBirth: student.dateOfBirth || ""
      });
    } else {
      setEditingStudent(null);
      resetForm();
    }
    setWizardStep(1);
    setIsWizardOpen(true);
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      // Validate step 1 required fields
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please enter both first and last name.",
          variant: "destructive",
        });
        return;
      }
      setWizardStep(2);
    }
  };

  const handleSubmit = () => {
    // Clean up the data - remove empty strings for optional fields
    const cleanedData: any = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
    };
    
    // Only include optional fields if they have values
    if (formData.gradeLevel && formData.gradeLevel.trim()) {
      cleanedData.gradeLevel = formData.gradeLevel.trim();
    }
    if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
      cleanedData.dateOfBirth = formData.dateOfBirth.trim();
    }

    if (editingStudent) {
      updateStudent.mutate({ id: editingStudent.id, data: cleanedData });
    } else {
      createStudent.mutate(cleanedData);
    }
  };

  const handleDelete = (studentId: string) => {
    if (confirm("Are you sure you want to remove this student? This will delete all associated grades, attendance, and service hours.")) {
      deleteStudent.mutate(studentId);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage your homeschool students and their profiles
          </p>
        </div>
        <Button onClick={() => openWizard()} data-testid="button-add-student">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Students List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Loading students...
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Students Yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding your first student to begin tracking their academic progress.
              </p>
              <Button onClick={() => openWizard()} data-testid="button-add-first-student">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Student
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <Card key={student.id} className="hover-elevate" data-testid={`card-student-${student.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-student-name-${student.id}`}>
                        {student.firstName} {student.lastName}
                      </CardTitle>
                      {student.gradeLevel && (
                        <CardDescription>Grade {student.gradeLevel}</CardDescription>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWizard(student)}
                    data-testid={`button-edit-student-${student.id}`}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                    data-testid={`button-delete-student-${student.id}`}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Creation/Edit Wizard */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
            <DialogDescription>
              {wizardStep === 1 
                ? "Enter the student's basic information" 
                : "Optional: Add additional details"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Step Indicator */}
            <div className="flex items-center gap-2 pb-4">
              <Badge variant={wizardStep === 1 ? "default" : "secondary"}>1</Badge>
              <div className="h-0.5 flex-1 bg-border" />
              <Badge variant={wizardStep === 2 ? "default" : "secondary"}>2</Badge>
            </div>

            {wizardStep === 1 && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name *</Label>
                    <Input
                      id="first-name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Enter first name"
                      data-testid="input-student-first-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name *</Label>
                    <Input
                      id="last-name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Enter last name"
                      data-testid="input-student-last-name"
                    />
                  </div>
                </div>
              </>
            )}

            {wizardStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="grade-level">Grade Level (Optional)</Label>
                  <Select
                    value={formData.gradeLevel}
                    onValueChange={(value) => setFormData({ ...formData, gradeLevel: value })}
                  >
                    <SelectTrigger data-testid="select-grade-level">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="K">Kindergarten</SelectItem>
                      <SelectItem value="1">1st Grade</SelectItem>
                      <SelectItem value="2">2nd Grade</SelectItem>
                      <SelectItem value="3">3rd Grade</SelectItem>
                      <SelectItem value="4">4th Grade</SelectItem>
                      <SelectItem value="5">5th Grade</SelectItem>
                      <SelectItem value="6">6th Grade</SelectItem>
                      <SelectItem value="7">7th Grade</SelectItem>
                      <SelectItem value="8">8th Grade</SelectItem>
                      <SelectItem value="9">9th Grade</SelectItem>
                      <SelectItem value="10">10th Grade</SelectItem>
                      <SelectItem value="11">11th Grade</SelectItem>
                      <SelectItem value="12">12th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth (Optional)</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    data-testid="input-student-dob"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between">
            {wizardStep === 2 && (
              <Button
                variant="outline"
                onClick={() => setWizardStep(1)}
                data-testid="button-wizard-back"
              >
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={() => setIsWizardOpen(false)}
                data-testid="button-wizard-cancel"
              >
                Cancel
              </Button>
              {wizardStep === 1 ? (
                <Button
                  onClick={handleNextStep}
                  data-testid="button-wizard-next"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={createStudent.isPending || updateStudent.isPending}
                  data-testid="button-wizard-save"
                >
                  {createStudent.isPending || updateStudent.isPending ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
