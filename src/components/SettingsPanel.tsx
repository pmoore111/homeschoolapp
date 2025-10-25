import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings, 
  BookOpen, 
  Calendar, 
  Calculator, 
  Users, 
  Download, 
  Upload,
  Plus,
  Trash2,
  Save,
  User,
  Camera,
  Link as LinkIcon,
  Unlink
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";

interface SettingsPanelProps {
  studentName?: string;
}

export function SettingsPanel({ studentName = "Student" }: SettingsPanelProps) {
  const { toast } = useToast();
  
  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Student linking state
  const [linkingEmail, setLinkingEmail] = useState("");
  const [selectedStudentForLinking, setSelectedStudentForLinking] = useState<string | null>(null);
  
  // Student creation state
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    firstName: "",
    lastName: "",
    gradeLevel: "",
    dateOfBirth: ""
  });

  // Fetch students - SHARED DATA: Everyone can see all students
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<any[]>({
    queryKey: ['/api/students'],
    retry: false,
    throwOnError: false,
  });

  // Load student data into form when students load (only once)
  useEffect(() => {
    if (students && students.length > 0 && !studentFormData.firstName) {
      const firstStudent = students[0];
      setStudentFormData({
        firstName: firstStudent.firstName || "",
        lastName: firstStudent.lastName || "",
        gradeLevel: firstStudent.gradeLevel || "",
        dateOfBirth: firstStudent.dateOfBirth || ""
      });
    }
  }, [students]);

  // Fetch all users for linking
  const { data: allUsers = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users/all'],
    enabled: false, // Disabled since auth is removed
    retry: false,
    throwOnError: false,
  });

  // Link student mutation
  const linkStudentMutation = useMutation({
    mutationFn: async ({ studentId, linkedUserId }: { studentId: string, linkedUserId: string }) => {
      const response = await apiRequest('POST', `/api/students/${studentId}/link`, { linkedUserId });
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Success",
        description: "Student account linked successfully",
      });
      setLinkingEmail("");
      setSelectedStudentForLinking(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to link student account",
        variant: "destructive",
      });
    }
  });

  // Unlink student mutation
  const unlinkStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await apiRequest('DELETE', `/api/students/${studentId}/link`);
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Success",
        description: "Student account unlinked successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unlink student account",
        variant: "destructive",
      });
    }
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: typeof studentFormData) => {
      const cleanedData: any = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      };
      if (data.gradeLevel && data.gradeLevel.trim()) {
        cleanedData.gradeLevel = data.gradeLevel.trim();
      }
      if (data.dateOfBirth && data.dateOfBirth.trim()) {
        cleanedData.dateOfBirth = data.dateOfBirth.trim();
      }
      const response = await apiRequest("POST", "/api/students", cleanedData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      setIsStudentDialogOpen(false);
      setStudentFormData({
        firstName: "",
        lastName: "",
        gradeLevel: "",
        dateOfBirth: ""
      });
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
  const updateStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: typeof studentFormData }) => {
      const cleanedData: any = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      };
      if (data.gradeLevel && data.gradeLevel.trim()) {
        cleanedData.gradeLevel = data.gradeLevel.trim();
      }
      const response = await apiRequest("PUT", `/api/students/${id}`, cleanedData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      toast({
        title: "Success",
        description: "Student information updated successfully.",
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

  const handleLinkStudent = () => {
    if (!selectedStudentForLinking || !linkingEmail) {
      toast({
        title: "Error",
        description: "Please select a student and enter an email",
        variant: "destructive",
      });
      return;
    }

    const userToLink = (allUsers as any[]).find((u: any) => u.email.toLowerCase() === linkingEmail.toLowerCase());
    if (!userToLink) {
      toast({
        title: "Error",
        description: "No user found with that email address",
        variant: "destructive",
      });
      return;
    }

    linkStudentMutation.mutate({
      studentId: selectedStudentForLinking,
      linkedUserId: userToLink.id
    });
  };

  const handleCreateStudent = () => {
    if (!studentFormData.firstName.trim() || !studentFormData.lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both first and last name.",
        variant: "destructive",
      });
      return;
    }
    createStudentMutation.mutate(studentFormData);
  };

  // Mock data for the prototype - todo: remove mock functionality
  const [subjects, setSubjects] = useState([
    { id: "1", name: "Reading", isActive: true, color: "#3b82f6" },
    { id: "2", name: "8th grade math (TX TEKS)", isActive: true, color: "#ef4444" },
    { id: "3", name: "Grammar", isActive: true, color: "#10b981" },
    { id: "4", name: "Spelling", isActive: true, color: "#f59e0b" },
    { id: "5", name: "Good Citizenship", isActive: true, color: "#8b5cf6" }
  ]);

  const [terms, setTerms] = useState([
    { id: "1", name: "Term 1", startDate: "2024-08-26", endDate: "2024-12-20", isActive: true },
    { id: "2", name: "Term 2", startDate: "2025-01-06", endDate: "2025-05-23", isActive: false },
    { id: "3", name: "Term 3", startDate: "2025-05-26", endDate: "2025-08-15", isActive: false }
  ]);

  const [gradingScale, setGradingScale] = useState({
    A: 90,
    B: 80,
    C: 70,
    D: 60
  });

  const [categoryWeights, setCategoryWeights] = useState({
    Homework: 30,
    Quiz: 30,
    Test: 40,
    Project: 20
  });

  const [newSubject, setNewSubject] = useState("");
  const [newTerm, setNewTerm] = useState({
    name: "",
    startDate: "",
    endDate: ""
  });

  const addSubject = () => {
    if (newSubject.trim()) {
      const subject = {
        id: Date.now().toString(),
        name: newSubject.trim(),
        isActive: true,
        color: "#6b7280"
      };
      setSubjects([...subjects, subject]);
      setNewSubject("");
      console.log("Subject added:", subject);
    }
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    console.log("Subject deleted:", id);
  };

  const addTerm = () => {
    if (newTerm.name && newTerm.startDate && newTerm.endDate) {
      const term = {
        id: Date.now().toString(),
        name: newTerm.name,
        startDate: newTerm.startDate,
        endDate: newTerm.endDate,
        isActive: false
      };
      setTerms([...terms, term]);
      setNewTerm({ name: "", startDate: "", endDate: "" });
      console.log("Term added:", term);
    }
  };

  const deleteTerm = (id: string) => {
    setTerms(terms.filter(t => t.id !== id));
    console.log("Term deleted:", id);
  };

  const updateGradingScale = (grade: string, value: number) => {
    setGradingScale({ ...gradingScale, [grade]: value });
    console.log("Grading scale updated:", grade, value);
  };

  const updateCategoryWeight = (category: string, weight: number) => {
    setCategoryWeights({ ...categoryWeights, [category]: weight });
    console.log("Category weight updated:", category, weight);
  };

  const exportData = () => {
    console.log("Exporting data...");
    // In a real app, this would generate and download JSON data
    alert("Exporting all data to JSON file...");
  };

  const importData = () => {
    console.log("Importing data...");
    // In a real app, this would open a file picker
    alert("Import functionality would open a file picker here...");
  };

  const totalWeight = Object.values(categoryWeights).reduce((sum, weight) => sum + weight, 0);

  // Profile update handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true);
    try {
      // Update profile data
      await apiRequest("PATCH", "/api/user/profile", profileData);
      
      // Upload image if selected (convert to base64)
      if (selectedImage && imagePreview) {
        await apiRequest("POST", "/api/user/profile/image", { imageData: imagePreview });
      }
      
      // Refresh user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="space-y-6 p-6" data-testid="settings-panel-main">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure subjects, terms, grading scales, and system preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="subjects" data-testid="tab-subjects">Subjects</TabsTrigger>
          <TabsTrigger value="terms" data-testid="tab-terms">Terms</TabsTrigger>
          <TabsTrigger value="grading" data-testid="tab-grading">Grading</TabsTrigger>
          <TabsTrigger value="students" data-testid="tab-students">Students</TabsTrigger>
          <TabsTrigger value="backup" data-testid="tab-backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Profile Settings</p>
                <p className="text-sm">
                  Profile management is not available in this simplified version.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Manage Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Subject */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter subject name"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                  data-testid="input-new-subject"
                />
                <Button onClick={addSubject} data-testid="button-add-subject">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              <Separator />

              {/* Existing Subjects */}
              <div className="space-y-3">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      <span className="font-medium">{subject.name}</span>
                      <Badge variant={subject.isActive ? "default" : "secondary"}>
                        {subject.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={subject.isActive}
                        onCheckedChange={(checked) => {
                          setSubjects(subjects.map(s => 
                            s.id === subject.id ? { ...s, isActive: checked } : s
                          ));
                        }}
                        data-testid={`switch-subject-${subject.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubject(subject.id)}
                        data-testid={`button-delete-subject-${subject.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="terms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Manage Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Term */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  placeholder="Term name"
                  value={newTerm.name}
                  onChange={(e) => setNewTerm({...newTerm, name: e.target.value})}
                  data-testid="input-term-name"
                />
                <Input
                  type="date"
                  placeholder="Start date"
                  value={newTerm.startDate}
                  onChange={(e) => setNewTerm({...newTerm, startDate: e.target.value})}
                  data-testid="input-term-start"
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={newTerm.endDate}
                  onChange={(e) => setNewTerm({...newTerm, endDate: e.target.value})}
                  data-testid="input-term-end"
                />
                <Button onClick={addTerm} data-testid="button-add-term">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Term
                </Button>
              </div>

              <Separator />

              {/* Existing Terms */}
              <div className="space-y-3">
                {terms.map((term) => (
                  <div key={term.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium">{term.name}</span>
                        <Badge variant={term.isActive ? "default" : "secondary"}>
                          {term.isActive ? "Current" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={term.isActive}
                        onCheckedChange={(checked) => {
                          setTerms(terms.map(t => 
                            t.id === term.id ? { ...t, isActive: checked } : 
                            checked ? { ...t, isActive: false } : t // Only one active term
                          ));
                        }}
                        data-testid={`switch-term-${term.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTerm(term.id)}
                        data-testid={`button-delete-term-${term.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Grading Scale */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Letter Grade Scale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(gradingScale).map(([grade, cutoff]) => (
                  <div key={grade} className="flex items-center justify-between">
                    <span className="font-medium text-lg">{grade}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={cutoff}
                        onChange={(e) => updateGradingScale(grade, parseInt(e.target.value))}
                        className="w-20"
                        data-testid={`input-grade-${grade}`}
                      />
                      <span className="text-sm text-muted-foreground">% and above</span>
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>F</span>
                    <span>Below {Math.min(...Object.values(gradingScale))}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category Weights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Category Weights
                  </span>
                  <Badge variant={totalWeight === 100 ? "default" : "destructive"}>
                    Total: {totalWeight}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(categoryWeights).map(([category, weight]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={weight}
                        onChange={(e) => updateCategoryWeight(category, parseInt(e.target.value))}
                        className="w-20"
                        data-testid={`input-weight-${category.toLowerCase()}`}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
                
                {totalWeight !== 100 && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">
                      Warning: Category weights should total 100% for accurate calculations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Grade Calculation Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-3">
                  Example: If a student has Homework: 85%, Quiz: 90%, Test: 95%, Project: 88%
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-medium">Weighted Calculation:</h4>
                    <div>Homework: 85% × {categoryWeights.Homework}% = {(85 * categoryWeights.Homework / 100).toFixed(1)}</div>
                    <div>Quiz: 90% × {categoryWeights.Quiz}% = {(90 * categoryWeights.Quiz / 100).toFixed(1)}</div>
                    <div>Test: 95% × {categoryWeights.Test}% = {(95 * categoryWeights.Test / 100).toFixed(1)}</div>
                    <div>Project: 88% × {categoryWeights.Project}% = {(88 * categoryWeights.Project / 100).toFixed(1)}</div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Final Grade:</h4>
                    <div className="text-lg font-bold">
                      {((85 * categoryWeights.Homework + 90 * categoryWeights.Quiz + 95 * categoryWeights.Test + 88 * categoryWeights.Project) / totalWeight).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Letter Grade: {
                        (() => {
                          const finalGrade = ((85 * categoryWeights.Homework + 90 * categoryWeights.Quiz + 95 * categoryWeights.Test + 88 * categoryWeights.Project) / totalWeight);
                          if (finalGrade >= gradingScale.A) return "A";
                          if (finalGrade >= gradingScale.B) return "B";
                          if (finalGrade >= gradingScale.C) return "C";
                          if (finalGrade >= gradingScale.D) return "D";
                          return "F";
                        })()
                      }
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student Information
              </CardTitle>
              <CardDescription>
                Update your student's name and grade level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingStudents ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : (students as any[]).length > 0 ? (
                <>
                  {(students as any[]).slice(0, 1).map((student: any) => (
                    <div key={student.id} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={studentFormData.firstName}
                            onChange={(e) => setStudentFormData({...studentFormData, firstName: e.target.value})}
                            placeholder="First Name"
                            data-testid="input-student-first-name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={studentFormData.lastName}
                            onChange={(e) => setStudentFormData({...studentFormData, lastName: e.target.value})}
                            placeholder="Last Name"
                            data-testid="input-student-last-name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="gradeLevel">Grade Level</Label>
                        <Input
                          id="gradeLevel"
                          value={studentFormData.gradeLevel}
                          onChange={(e) => setStudentFormData({...studentFormData, gradeLevel: e.target.value})}
                          placeholder="e.g., 9th Grade"
                          data-testid="input-grade-level"
                        />
                      </div>
                      <Button
                        onClick={() => updateStudentMutation.mutate({id: student.id, data: studentFormData})}
                        disabled={updateStudentMutation.isPending}
                        data-testid="button-save-student"
                      >
                        Save Changes
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Setting up student...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Creation Dialog */}
          <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
            <DialogContent data-testid="dialog-add-student">
              <DialogHeader>
                <DialogTitle>Add Student</DialogTitle>
                <DialogDescription>
                  Add a new student to your homeschool program
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student-first-name">First Name *</Label>
                  <Input
                    id="student-first-name"
                    value={studentFormData.firstName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                    placeholder="Enter first name"
                    data-testid="input-student-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-last-name">Last Name *</Label>
                  <Input
                    id="student-last-name"
                    value={studentFormData.lastName}
                    onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })}
                    placeholder="Enter last name"
                    data-testid="input-student-last-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-grade">Grade Level</Label>
                  <Select 
                    value={studentFormData.gradeLevel} 
                    onValueChange={(value) => setStudentFormData({ ...studentFormData, gradeLevel: value })}
                  >
                    <SelectTrigger id="student-grade" data-testid="select-grade-level">
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
                  <Label htmlFor="student-dob">Date of Birth</Label>
                  <Input
                    id="student-dob"
                    type="date"
                    value={studentFormData.dateOfBirth}
                    onChange={(e) => setStudentFormData({ ...studentFormData, dateOfBirth: e.target.value })}
                    data-testid="input-student-dob"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsStudentDialogOpen(false)}
                    data-testid="button-cancel-student"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateStudent}
                    disabled={createStudentMutation.isPending}
                    data-testid="button-save-student"
                  >
                    {createStudentMutation.isPending ? "Adding..." : "Add Student"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Backup & Import
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Export Section */}
              <div>
                <h3 className="font-medium mb-3">Export Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your data as a JSON file for backup or transfer purposes.
                </p>
                <Button onClick={exportData} data-testid="button-export-data">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Data
                </Button>
              </div>

              <Separator />

              {/* Import Section */}
              <div>
                <h3 className="font-medium mb-3">Import Data</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Restore data from a previously exported JSON file. This will replace all current data.
                </p>
                <Button 
                  variant="outline" 
                  onClick={importData}
                  data-testid="button-import-data"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>

              <Separator />

              {/* CSV Export Options */}
              <div>
                <h3 className="font-medium mb-3">CSV Exports</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export specific data types for use in spreadsheet applications.
                </p>
                <div className="grid gap-2 md:grid-cols-2">
                  <Button variant="outline" size="sm" data-testid="button-export-grades">
                    Export Grades CSV
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-export-attendance">
                    Export Attendance CSV
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-export-service">
                    Export Service Hours CSV
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-export-subjects">
                    Export Subjects CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Button className="w-full" data-testid="button-save-settings">
            <Save className="h-4 w-4 mr-2" />
            Save All Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}