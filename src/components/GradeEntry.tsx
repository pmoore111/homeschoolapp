import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload, Calculator, BookOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface KhanLesson {
  id: string;
  title: string;
  lessonType: "practice" | "quiz" | "test" | "lesson";
  status: "unfamiliar" | "familiar" | "proficient" | "mastered" | "not started" | "attempted";
  pointsEarned?: number;
  maxPoints?: number;
  isKhanLesson: boolean;
}

interface GradeEntryProps {
  studentName?: string;
}

export function GradeEntry({ studentName = "Student" }: GradeEntryProps) {
  const [selectedSubject, setSelectedSubject] = useState("8th grade math (TX TEKS)");
  const [selectedUnit, setSelectedUnit] = useState("Unit 1");
  const [pasteText, setPasteText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [lessons, setLessons] = useState<KhanLesson[]>([]);
  const [unitDates, setUnitDates] = useState<Record<string, { startDate: string; endDate: string }>>({});
  
  // Mock data for the prototype
  const subjects = ["8th grade math (TX TEKS)", "Grammar", "Good Citizenship"];
  const units = ["Unit 1", "Unit 2", "Unit 3", "Unit 4", "Unit 5", "Unit 6", "Unit 7", "Unit 8", "Unit 9", "Unit 10"];
  
  // Unit 1 lessons for 8th grade math (TX TEKS)
  const unit1Lessons: KhanLesson[] = [
    {
      id: "u1-l1",
      title: "Visualize relationships between sets of rational numbers",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u1-l2",
      title: "Order rational numbers in context",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u1-l3",
      title: "Negative exponents",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u1-q1",
      title: "Quiz 1 - Value and magnitude of rational numbers",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u1-l4",
      title: "Scientific notation",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u1-test",
      title: "Unit Test - Value and magnitude of rational numbers",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 2 lessons for 8th grade math (TX TEKS)
  const unit2Lessons: KhanLesson[] = [
    {
      id: "u2-l1",
      title: "Mean absolute deviation (MAD)",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u2-l2",
      title: "Analyze simulated samples from populations",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u2-l3",
      title: "Simple random samples",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u2-test",
      title: "Unit Test - Statistics with univariate data",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 3 lessons for 8th grade math (TX TEKS)
  const unit3Lessons: KhanLesson[] = [
    {
      id: "u3-l1",
      title: "Using inequalities to solve problems",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-l2",
      title: "Write equations to represent problems",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-l3",
      title: "Write inequalities to represent problems",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-q1",
      title: "Quiz 1 - One-variable equations & inequalities basics",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u3-l4",
      title: "Equations with variables on both sides",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-l5",
      title: "Equations with variables on both sides: decimals & fractions",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-l6",
      title: "Equations with parentheses",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-l7",
      title: "Equations with parentheses: decimals & fractions",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-q2",
      title: "Quiz 2 - Equations with variables & parentheses",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u3-l8",
      title: "Sums of consecutive integers",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-l9",
      title: "Simple and compound interest",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-l10",
      title: "Financing a car",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u3-q3",
      title: "Quiz 3 - Applications (integers, interest, loans)",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u3-test",
      title: "Unit Test - One-variable equations, inequalities, and applications",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 4 lessons for 8th grade math (TX TEKS)
  const unit4Lessons: KhanLesson[] = [
    {
      id: "u4-l1",
      title: "Slope from graph",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u4-l2",
      title: "Similar triangles & slope",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u4-l3",
      title: "Slope in a table",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u4-l4",
      title: "Slope from two points",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u4-q1",
      title: "Quiz 1 - Calculating slope",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u4-l5",
      title: "Intercepts from a graph",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u4-l6",
      title: "Linear equations word problems: graphs",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u4-l7",
      title: "Linear equations word problems: tables",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u4-q2",
      title: "Quiz 2 - Applying slope & intercepts",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u4-test",
      title: "Unit Test - Slope & y-intercept",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 5 lessons for 8th grade math (TX TEKS)
  const unit5Lessons: KhanLesson[] = [
    {
      id: "u5-l1",
      title: "Identify proportional relationships",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-l2",
      title: "Identify proportional relationships from graphs",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-l3",
      title: "Graphing proportional relationships",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-l4",
      title: "Relate unit rate and slope",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-q1",
      title: "Quiz 1 - Identifying proportional relationships",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u5-l5",
      title: "Solving proportions",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-l6",
      title: "Writing proportions",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-l7",
      title: "Proportion word problems",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-l8",
      title: "Writing proportional equations from tables",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-l9",
      title: "Write y=mx proportional equations",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u5-q2",
      title: "Quiz 2 - Solving and writing proportions",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u5-test",
      title: "Unit Test - Proportional and non-proportional relationships",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 6 lessons for 8th grade math (TX TEKS)
  const unit6Lessons: KhanLesson[] = [
    {
      id: "u6-l1",
      title: "Slope-intercept intro",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l2",
      title: "Graph from slope-intercept form",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l3",
      title: "Slope-intercept equation from graph",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l4",
      title: "Locate y-intercepts using slope",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l5",
      title: "Slope-intercept from two points",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l6",
      title: "Writing linear equations word problems",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-q1",
      title: "Quiz 1 - Slope-intercept & linear equations",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u6-l7",
      title: "Recognize functions from tables",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l8",
      title: "Recognize functions from graphs",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l9",
      title: "Identify proportional & non-proportional functions",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-q2",
      title: "Quiz 2 - Functions recognition",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u6-l10",
      title: "Solutions to simultaneous linear equations",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l11",
      title: "Solving a system of linear equations by graphing in slope-intercept form",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-l12",
      title: "Different payment methods",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u6-q3",
      title: "Quiz 3 - Systems of equations & applications",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u6-test",
      title: "Unit Test - Functions and linear equations",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 7 lessons for 8th grade math (TX TEKS)
  const unit7Lessons: KhanLesson[] = [
    {
      id: "u7-l1",
      title: "Constructing scatter plots",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u7-l2",
      title: "Making appropriate scatter plots",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u7-l3",
      title: "Positive and negative linear associations from scatter plots",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u7-l4",
      title: "Describing trends in scatterplots",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u7-q1",
      title: "Quiz 1 - Interpreting scatter plots",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u7-l5",
      title: "Eyeballing the line of best fit",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u7-l6",
      title: "Estimating slope of line of best fit",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u7-l7",
      title: "Estimating equations of lines of best fit, and using them to make predictions",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u7-l8",
      title: "Interpreting slope and y-intercept for linear models",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u7-q2",
      title: "Quiz 2 - Trend lines and linear models",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u7-test",
      title: "Unit Test - Statistics with bivariate data",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 8 lessons for 8th grade math (TX TEKS)
  const unit8Lessons: KhanLesson[] = [
    {
      id: "u8-l1",
      title: "Identify transformations",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l2",
      title: "Translate points intuition",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l3",
      title: "Translate shapes intuition",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l4",
      title: "Determine translations",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-q1",
      title: "Quiz 1 - Translations",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u8-l5",
      title: "Rotate points (basic)",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l6",
      title: "Determine rotations (basic)",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l7",
      title: "Reflect points",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l8",
      title: "Reflect shapes",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l9",
      title: "Determine reflections",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l10",
      title: "Find measures using rigid transformations",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l11",
      title: "Rigid transformations: preserved properties",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-q2",
      title: "Quiz 2 - Rotations, reflections, rigid transformations",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u8-l12",
      title: "Dilate points",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l13",
      title: "Dilations: scale factor",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l14",
      title: "Dilate triangles",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l15",
      title: "Represent dilations algebraically",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-q3",
      title: "Quiz 3 - Dilations",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u8-l16",
      title: "Dilations and properties",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l17",
      title: "Relate scale drawings to area",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l18",
      title: "Effect of dilations on linear & area measurements",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-q4",
      title: "Quiz 4 - Effects of dilations",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u8-l19",
      title: "Congruence & transformations",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l20",
      title: "Algebraic rules for transformations",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-l21",
      title: "Find equivalent ratios in similar shapes",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u8-q5",
      title: "Quiz 5 - Congruence, rules, and ratios",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u8-test",
      title: "Unit Test - Transformational geometry",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 9 lessons for 8th grade math (TX TEKS)
  const unit9Lessons: KhanLesson[] = [
    {
      id: "u9-l1",
      title: "Classify numbers: rational & irrational",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l2",
      title: "Classify numbers",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l3",
      title: "Visualize relationships between sets of real numbers",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-q1",
      title: "Quiz 1 - Classifying and visualizing real numbers",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u9-l4",
      title: "Approximating square roots",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l5",
      title: "Comparing irrational numbers",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l6",
      title: "Comparing irrational numbers with a calculator",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-q2",
      title: "Quiz 2 - Irrational numbers and square roots",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u9-l7",
      title: "Use Pythagorean theorem to find right triangle side lengths",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l8",
      title: "Use Pythagorean theorem to find isosceles triangle side lengths",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l9",
      title: "Right triangle side lengths",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l10",
      title: "Use area of squares to visualize Pythagorean theorem",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l11",
      title: "Pythagorean theorem word problems",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l12",
      title: "Distance between two points",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-q3",
      title: "Quiz 3 - Pythagorean theorem and distance",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u9-l13",
      title: "Angle relationships with parallel lines",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l14",
      title: "Find angles in triangles",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l15",
      title: "Find angles in isosceles triangles",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l16",
      title: "Finding angle measures using triangles",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-l17",
      title: "Determine similar triangles: Angles",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u9-q4",
      title: "Quiz 4 - Angles and triangle similarity",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u9-test",
      title: "Unit Test - Angle and triangle relationships",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Unit 10 lessons for 8th grade math (TX TEKS)
  const unit10Lessons: KhanLesson[] = [
    {
      id: "u10-l1",
      title: "Lateral & total surface area of prisms",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u10-l2",
      title: "Cylinder volume formula",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u10-l3",
      title: "Volume of cylinders",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u10-l4",
      title: "Lateral & total surface area of cylinders",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u10-q1",
      title: "Quiz 1 - Prisms & cylinders",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u10-l5",
      title: "Volume of cones",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u10-l6",
      title: "Volume of spheres",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u10-l7",
      title: "Volume of cylinders, spheres, and cones word problems",
      lessonType: "practice",
      status: "not started",
      isKhanLesson: true
    },
    {
      id: "u10-q2",
      title: "Quiz 2 - Cones & spheres",
      lessonType: "quiz",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    },
    {
      id: "u10-test",
      title: "Unit Test - Measurement of three-dimensional figures",
      lessonType: "test",
      status: "not started",
      maxPoints: 100,
      isKhanLesson: true
    }
  ];
  
  // Grammar Unit 1: Parts of speech - the noun
  const grammarUnit1: KhanLesson[] = [
    { id: "g1-l1", title: "Identifying nouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l2", title: "Singular and plural nouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l3", title: "Common and proper nouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l4", title: "Concrete and abstract nouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l5", title: "Irregular plural nouns: f to -ves plurals", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l6", title: "Irregular plural nouns: -en plurals", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l7", title: "Irregular plural nouns: the base plural", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l8", title: "Irregular plural nouns: mutant plurals", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l9", title: "Irregular plural nouns: foreign plurals", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-l10", title: "Irregular plural nouns review", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g1-test", title: "Unit Test - The noun", lessonType: "test", status: "not started", maxPoints: 100, isKhanLesson: true }
  ];

  // Grammar Unit 2: Parts of speech - the verb
  const grammarUnit2: KhanLesson[] = [
    { id: "g2-l1", title: "Identifying verbs", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l2", title: "Introduction to verb agreement", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l3", title: "Introduction to verb tense", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l4", title: "Action, linking, and helping verbs", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-q1", title: "Quiz 1 - Verb basics", lessonType: "quiz", status: "not started", maxPoints: 100, isKhanLesson: true },
    { id: "g2-l5", title: "Irregular verbs", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l6", title: "Simple verb aspect", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l7", title: "Progressive verb aspect", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l8", title: "Perfect verb aspect", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l9", title: "Perfect progressive verb aspect", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l10", title: "Managing time with tense and aspect", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-l11", title: "Modal verbs", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g2-test", title: "Unit Test - The verb", lessonType: "test", status: "not started", maxPoints: 100, isKhanLesson: true }
  ];

  // Grammar Unit 3: Parts of speech - the pronoun
  const grammarUnit3: KhanLesson[] = [
    { id: "g3-l1", title: "The question word", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l2", title: "Meet the personal pronoun", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l3", title: "Possessive pronouns and adjectives", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l4", title: "Reflexive pronouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l5", title: "Relative pronouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-q1", title: "Quiz 1 - Pronoun basics", lessonType: "quiz", status: "not started", maxPoints: 100, isKhanLesson: true },
    { id: "g3-l6", title: "Choosing between subject and object pronouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l7", title: "Pronoun person", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l8", title: "Pronoun number", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l9", title: "Indefinite pronouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l10", title: "Pronoun vagueness", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-l11", title: "Emphatic pronouns", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g3-test", title: "Unit Test - The pronoun", lessonType: "test", status: "not started", maxPoints: 100, isKhanLesson: true }
  ];

  // Grammar Unit 4: Parts of speech - the modifier
  const grammarUnit4: KhanLesson[] = [
    { id: "g4-l1", title: "Meet the adjective", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l2", title: "Meet the article", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l3", title: "Choosing between definite and indefinite articles", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l4", title: "Meet the adverb", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l5", title: "Using adverbs and adjectives", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l6", title: "Identifying relative adverbs", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l7", title: "Adjective order", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l8", title: "Commas and adjectives", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l9", title: "Comparative and superlative adjectives and adverbs", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-l10", title: "Intensifiers and adverbs of degree", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g4-test", title: "Unit Test - The modifier", lessonType: "test", status: "not started", maxPoints: 100, isKhanLesson: true }
  ];

  // Grammar Unit 5: Parts of speech - the preposition and the conjunction
  const grammarUnit5: KhanLesson[] = [
    { id: "g5-l1", title: "Meet the preposition with pictures", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l2", title: "Identifying prepositions", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l3", title: "Prepositions about time and space", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l4", title: "Common prepositions", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l5", title: "Compound prepositions", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l6", title: "Prepositional phrases", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l7", title: "Meet the conjunction", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l8", title: "Coordinating conjunctions", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l9", title: "Coordinating and subordinating conjunctions", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-l10", title: "Correlative conjunctions", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g5-test", title: "Unit Test - Prepositions & conjunctions", lessonType: "test", status: "not started", maxPoints: 100, isKhanLesson: true }
  ];

  // Grammar Unit 6: Punctuation - end-of-sentence punctuation, the comma, and the apostrophe
  const grammarUnit6: KhanLesson[] = [
    { id: "g6-l1", title: "Three ways to end a sentence", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l2", title: "Meet the comma", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l3", title: "Punctuating lists", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l4", title: "Salutations, valedictions, dates, and addresses", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l5", title: "Commas and introductory elements", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l6", title: "Commas in dialogue, tag questions, direct address, yes/no", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l7", title: "Appositives", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-q1", title: "Quiz 1 - End marks & comma uses", lessonType: "quiz", status: "not started", maxPoints: 100, isKhanLesson: true },
    { id: "g6-l8", title: "Meet the apostrophe", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l9", title: "Introduction to contractions", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l10", title: "Apostrophes and plurals", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l11", title: "Introduction to the possessive", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l12", title: "Advanced (plural) possession", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-l13", title: "Choosing between its and it's", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g6-test", title: "Unit Test - End marks, commas, apostrophes", lessonType: "test", status: "not started", maxPoints: 100, isKhanLesson: true }
  ];

  // Grammar Unit 7: Punctuation - the colon, semicolon, and more
  const grammarUnit7: KhanLesson[] = [
    { id: "g7-l1", title: "Introduction to colons", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-l2", title: "Introduction to semicolons", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-l3", title: "Using semicolons and commas", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-l4", title: "Using semicolons and colons", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-q1", title: "Quiz 1 - Colons & semicolons", lessonType: "quiz", status: "not started", maxPoints: 100, isKhanLesson: true },
    { id: "g7-l5", title: "Italics, underlines, and quotation marks", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-l6", title: "Introduction to parentheses", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-l7", title: "Introduction to dashes", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-l8", title: "Dashes and hyphens", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-l9", title: "Introduction to ellipses", lessonType: "practice", status: "not started", isKhanLesson: true },
    { id: "g7-test", title: "Unit Test - Colons, semicolons, & more", lessonType: "test", status: "not started", maxPoints: 100, isKhanLesson: true }
  ];
  
  // Map selected subject and unit to lessons
  const subjectLessonsMap: Record<string, Record<string, KhanLesson[]>> = {
    "8th grade math (TX TEKS)": {
      "Unit 1": unit1Lessons,
      "Unit 2": unit2Lessons,
      "Unit 3": unit3Lessons,
      "Unit 4": unit4Lessons,
      "Unit 5": unit5Lessons,
      "Unit 6": unit6Lessons,
      "Unit 7": unit7Lessons,
      "Unit 8": unit8Lessons,
      "Unit 9": unit9Lessons,
      "Unit 10": unit10Lessons,
    },
    "Grammar": {
      "Unit 1": grammarUnit1,
      "Unit 2": grammarUnit2,
      "Unit 3": grammarUnit3,
      "Unit 4": grammarUnit4,
      "Unit 5": grammarUnit5,
      "Unit 6": grammarUnit6,
      "Unit 7": grammarUnit7,
      "Unit 8": [],
      "Unit 9": [],
      "Unit 10": [],
    },
    "Good Citizenship": {
      "Unit 1": [],
      "Unit 2": [],
      "Unit 3": [],
      "Unit 4": [],
      "Unit 5": [],
      "Unit 6": [],
      "Unit 7": [],
      "Unit 8": [],
      "Unit 9": [],
      "Unit 10": [],
    }
  };
  
  // Load unit dates from localStorage
  useEffect(() => {
    const datesKey = `unit-dates-${selectedSubject}`;
    const storedDates = localStorage.getItem(datesKey);
    if (storedDates) {
      try {
        setUnitDates(JSON.parse(storedDates));
      } catch (e) {
        setUnitDates({});
      }
    }
  }, [selectedSubject]);
  
  // Load lessons when unit changes, with localStorage persistence
  useEffect(() => {
    const storageKey = `khan-lessons-${selectedSubject}-${selectedUnit}`;
    const stored = localStorage.getItem(storageKey);
    const defaultLessons = subjectLessonsMap[selectedSubject]?.[selectedUnit] || [];
    
    if (stored) {
      // Load from localStorage if available
      try {
        const parsedLessons = JSON.parse(stored);
        
        // Validate that stored lessons match the subject (check ID prefix)
        // Grammar lessons start with 'g', math lessons start with 'u'
        const isValidForSubject = parsedLessons.length === 0 || 
          (selectedSubject === "Grammar" && parsedLessons[0]?.id?.startsWith('g')) ||
          (selectedSubject === "8th grade math (TX TEKS)" && parsedLessons[0]?.id?.startsWith('u')) ||
          selectedSubject === "Good Citizenship";
        
        if (isValidForSubject && parsedLessons.length > 0) {
          setLessons(parsedLessons);
        } else {
          // Stored data doesn't match subject, use defaults and overwrite
          setLessons(defaultLessons);
          localStorage.setItem(storageKey, JSON.stringify(defaultLessons));
        }
      } catch (e) {
        // Fallback to default lessons if parsing fails
        setLessons(defaultLessons);
        localStorage.setItem(storageKey, JSON.stringify(defaultLessons));
      }
    } else {
      // Load default lessons for this subject and unit
      setLessons(defaultLessons);
      // Save to localStorage
      localStorage.setItem(storageKey, JSON.stringify(defaultLessons));
    }
  }, [selectedUnit, selectedSubject]);
  
  // Helper to notify Dashboard of updates
  const notifyDashboardUpdate = () => {
    window.dispatchEvent(new Event('lessonsUpdated'));
  };

  // Save unit dates to localStorage
  const saveUnitDates = () => {
    const datesKey = `unit-dates-${selectedSubject}`;
    localStorage.setItem(datesKey, JSON.stringify(unitDates));
    notifyDashboardUpdate();
    setIsDateDialogOpen(false);
  };

  // Update a specific unit's dates
  const updateUnitDate = (unit: string, field: 'startDate' | 'endDate', value: string) => {
    setUnitDates(prev => ({
      ...prev,
      [unit]: {
        ...prev[unit],
        startDate: field === 'startDate' ? value : (prev[unit]?.startDate || ''),
        endDate: field === 'endDate' ? value : (prev[unit]?.endDate || '')
      }
    }));
  };

  // Update status function with localStorage persistence
  const updateStatus = (id: string, status: KhanLesson['status']) => {
    // Update local state immediately
    const updatedLessons = lessons.map(lesson => 
      lesson.id === id ? { ...lesson, status } : lesson
    );
    setLessons(updatedLessons);
    
    // Persist to localStorage
    const storageKey = `khan-lessons-${selectedSubject}-${selectedUnit}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedLessons));
    
    // Notify Dashboard to update
    notifyDashboardUpdate();
  };

  // Parse Khan Academy text
  const parseKhanText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const parsedLessons: KhanLesson[] = [];
    const seenTitles = new Set<string>();
    
    for (const line of lines) {
      // Skip obvious section headers and UI elements
      if (
        line.match(/^Unit \d+:/i) ||
        line.match(/\d+ possible mastery points/i) ||
        line === 'Mastered' ||
        line === 'Proficient' ||
        line === 'Familiar' ||
        line === 'Attempted' ||
        line === 'Not started' ||
        line.match(/^About this unit/i) ||
        line.match(/^Unit guides are here/i) ||
        line.match(/^Level up on/i) ||
        line.match(/^Get \d+ of \d+ questions to level up/i) ||
        line.match(/^Up next for you:/i) ||
        line === 'Quiz' ||
        line === 'Unit test' ||
        line === 'Learn' ||
        line === 'Practice' ||
        line.length < 3
      ) {
        continue;
      }
      
      let lessonType: "practice" | "quiz" | "test" | "lesson" = "practice";
      let status: "unfamiliar" | "familiar" | "proficient" | "mastered" | "not started" | "attempted" = "not started";
      let maxPoints: number | undefined;
      let title = line;
      
      // Extract status from the line (handles both ": status" and "• status" formats)
      const statusMatch = title.match(/[:\•]\s*(unfamiliar|familiar|proficient|mastered|not started|attempted)$/i);
      if (statusMatch) {
        status = statusMatch[1].toLowerCase() as typeof status;
        title = title.substring(0, statusMatch.index).trim();
      }
      
      // Detect lesson type based on title content
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('quiz')) {
        lessonType = "quiz";
        maxPoints = 100;
      } else if (lowerTitle.includes('unit test')) {
        lessonType = "test";
        maxPoints = 100;
      } else if (lowerTitle.includes('test')) {
        lessonType = "test";
        maxPoints = 100;
      }
      
      // Skip duplicates
      if (seenTitles.has(title)) {
        continue;
      }
      seenTitles.add(title);
      
      // Only add if we have a meaningful title
      if (title && title.length > 3) {
        parsedLessons.push({
          id: Date.now().toString() + Math.random(),
          title,
          lessonType,
          status,
          maxPoints,
          isKhanLesson: true
        });
      }
    }
    
    return parsedLessons;
  };

  const handlePasteLessons = () => {
    if (!pasteText.trim()) return;
    
    const newLessons = parseKhanText(pasteText);
    const updatedLessons = [...lessons, ...newLessons];
    setLessons(updatedLessons);
    
    // Persist to localStorage
    const storageKey = `khan-lessons-${selectedSubject}-${selectedUnit}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedLessons));
    
    // Notify Dashboard to update
    notifyDashboardUpdate();
    
    setPasteText("");
    setIsDialogOpen(false);
  };

  const updateGrade = (id: string, pointsEarned: number) => {
    // Update local state immediately
    const updatedLessons = lessons.map(lesson => 
      lesson.id === id ? { ...lesson, pointsEarned } : lesson
    );
    setLessons(updatedLessons);
    
    // Persist to localStorage
    const storageKey = `khan-lessons-${selectedSubject}-${selectedUnit}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedLessons));
    
    // Notify Dashboard to update
    notifyDashboardUpdate();
  };

  // Convert percentage to US letter grade
  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  // Calculate overall grade percentage
  const calculateGrade = () => {
    let totalEarned = 0;
    let totalPossible = 0;
    
    for (const lesson of lessons) {
      if (lesson.lessonType === "quiz" || lesson.lessonType === "test") {
        // For quizzes and tests, use actual points earned
        if (lesson.maxPoints) {
          totalPossible += lesson.maxPoints;
          totalEarned += lesson.pointsEarned || 0;
        }
      } else {
        // For practice lessons, mastery is based on status (0-100 scale)
        // not started/attempted/unfamiliar = 0, familiar = 33, proficient = 67, mastered = 100
        const statusPoints: Record<typeof lesson.status, number> = {
          "not started": 0,
          "attempted": 0,
          "unfamiliar": 0,
          "familiar": 33,
          "proficient": 67,
          "mastered": 100
        };
        
        totalPossible += 100; // Max points per practice lesson
        totalEarned += statusPoints[lesson.status] || 0;
      }
    }
    
    const percentage = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
    const letterGrade = getLetterGrade(percentage);
    
    return { percentage, letterGrade, earned: totalEarned, possible: totalPossible };
  };

  const gradeInfo = calculateGrade();

  // Calculate completion progress for current unit
  const calculateUnitProgress = () => {
    if (lessons.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }
    
    // Consider a lesson "completed" if it has meaningful progress
    const completed = lessons.filter(lesson => {
      if (lesson.lessonType === "quiz" || lesson.lessonType === "test") {
        // For quizzes/tests, consider completed if points are entered
        return lesson.pointsEarned !== undefined && lesson.pointsEarned > 0;
      } else {
        // For practice lessons, consider completed if status is familiar, proficient, or mastered
        return lesson.status === "familiar" || lesson.status === "proficient" || lesson.status === "mastered";
      }
    }).length;
    
    const percentage = Math.round((completed / lessons.length) * 100);
    return { completed, total: lessons.length, percentage };
  };

  // Calculate overall progress across all units for selected subject
  const calculateOverallProgress = () => {
    let totalCompleted = 0;
    let totalLessons = 0;

    // Loop through all units and aggregate data
    for (const unit of units) {
      const storageKey = `khan-lessons-${selectedSubject}-${unit}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        try {
          const unitLessons: KhanLesson[] = JSON.parse(stored);
          totalLessons += unitLessons.length;
          
          const completed = unitLessons.filter(lesson => {
            if (lesson.lessonType === "quiz" || lesson.lessonType === "test") {
              return lesson.pointsEarned !== undefined && lesson.pointsEarned > 0;
            } else {
              return lesson.status === "familiar" || lesson.status === "proficient" || lesson.status === "mastered";
            }
          }).length;
          
          totalCompleted += completed;
        } catch (e) {
          // Skip invalid data
        }
      }
    }

    const percentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
    return { completed: totalCompleted, total: totalLessons, percentage };
  };

  const unitProgressInfo = calculateUnitProgress();
  const overallProgressInfo = calculateOverallProgress();

  return (
    <div className="space-y-6 p-6" data-testid="grade-entry-main">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
        <p className="text-muted-foreground">
          Track lessons and grades for {studentName}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Select Subject and Unit</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setIsDateDialogOpen(true)} data-testid="button-manage-dates">
            <Calculator className="h-4 w-4 mr-2" />
            Manage Unit Dates
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger data-testid="select-subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject} data-testid={`subject-${subject}`}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit</label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger data-testid="select-unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit} data-testid={`unit-${unit}`}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit Dates Management Dialog */}
      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Unit Dates for {selectedSubject}</DialogTitle>
            <DialogDescription>
              Set the start and end dates for each unit. The Dashboard will automatically display the current unit based on today's date.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {units.map(unit => (
              <div key={unit} className="grid grid-cols-3 gap-4 items-center border-b pb-4">
                <div className="font-medium">{unit}</div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={unitDates[unit]?.startDate || ''}
                    onChange={(e) => updateUnitDate(unit, 'startDate', e.target.value)}
                    data-testid={`input-start-date-${unit}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">End Date</label>
                  <Input
                    type="date"
                    value={unitDates[unit]?.endDate || ''}
                    onChange={(e) => updateUnitDate(unit, 'endDate', e.target.value)}
                    data-testid={`input-end-date-${unit}`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDateDialogOpen(false)} data-testid="button-cancel-dates">
              Cancel
            </Button>
            <Button onClick={saveUnitDates} data-testid="button-save-dates">
              Save Dates
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress and Grade Summary */}
      {lessons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedSubject} - {selectedUnit}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Grade Display - Unit Only */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">{selectedUnit} Grade</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold" data-testid="text-current-grade-percentage">
                    {gradeInfo.percentage}%
                  </span>
                  <span className="text-xl font-semibold text-muted-foreground" data-testid="text-current-grade-letter">
                    ({gradeInfo.letterGrade})
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-right">
                {gradeInfo.earned.toFixed(0)} / {gradeInfo.possible} points earned
              </p>
            </div>

            {/* Unit Progress */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-muted-foreground">{selectedUnit} Progress</span>
                <span className="text-lg font-semibold" data-testid="text-unit-progress">
                  {unitProgressInfo.completed} / {unitProgressInfo.total} lessons
                </span>
              </div>
              <Progress value={unitProgressInfo.percentage} className="h-3" data-testid="progress-unit" />
              <p className="text-sm text-muted-foreground text-right">
                {unitProgressInfo.percentage}% complete
              </p>
            </div>

            {/* Overall Class Progress */}
            {overallProgressInfo.total > 0 && (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Overall Class Progress</span>
                  <span className="text-sm font-semibold" data-testid="text-overall-progress">
                    {overallProgressInfo.completed} / {overallProgressInfo.total} lessons
                  </span>
                </div>
                <Progress value={overallProgressInfo.percentage} className="h-1.5" data-testid="progress-overall" />
                <p className="text-xs text-muted-foreground text-right">
                  {overallProgressInfo.percentage}% complete across all units
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Unit Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedSubject} - {selectedUnit}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Current Grade: {gradeInfo.percentage}% ({gradeInfo.letterGrade})
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-lessons">
                <Upload className="h-4 w-4 mr-2" />
                Add Lessons
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Paste Khan Academy Lessons</DialogTitle>
                <DialogDescription>
                  Copy and paste the lesson list from Khan Academy. The system will automatically parse lessons, quizzes, and tests.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste Khan Academy lesson text here..."
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="textarea-paste-lessons"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} data-testid="button-cancel">
                    Cancel
                  </Button>
                  <Button onClick={handlePasteLessons} data-testid="button-import-lessons">
                    Import Lessons
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lesson</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Max Points</TableHead>
                <TableHead>Points Earned</TableHead>
                <TableHead>Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No lessons added yet. Click "Add Lessons" to paste from Khan Academy.
                  </TableCell>
                </TableRow>
              ) : (
                lessons.map((lesson) => (
                  <TableRow key={lesson.id} data-testid={`lesson-row-${lesson.id}`}>
                    <TableCell className="font-medium">{lesson.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" data-testid={`lesson-type-${lesson.id}`}>
                        {lesson.lessonType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={lesson.status || "not started"} 
                        onValueChange={(value) => updateStatus(lesson.id, value as KhanLesson['status'])}
                      >
                        <SelectTrigger className="w-[150px]" data-testid={`select-status-${lesson.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not started">Not Started</SelectItem>
                          <SelectItem value="attempted">Attempted</SelectItem>
                          <SelectItem value="unfamiliar">Unfamiliar</SelectItem>
                          <SelectItem value="familiar">Familiar</SelectItem>
                          <SelectItem value="proficient">Proficient</SelectItem>
                          <SelectItem value="mastered">Mastered</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {lesson.maxPoints || '-'}
                    </TableCell>
                    <TableCell>
                      {lesson.lessonType === "quiz" || lesson.lessonType === "test" ? (
                        <Input
                          type="number"
                          placeholder="0"
                          value={lesson.pointsEarned || ''}
                          onChange={(e) => updateGrade(lesson.id, parseFloat(e.target.value) || 0)}
                          className="w-24"
                          data-testid={`input-points-${lesson.id}`}
                        />
                      ) : (
                        <span className="text-muted-foreground" data-testid={`text-points-${lesson.id}`}>
                          {lesson.status === "mastered" ? "100" : 
                           lesson.status === "proficient" ? "67" : 
                           lesson.status === "familiar" ? "33" : "0"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lesson.lessonType === "quiz" || lesson.lessonType === "test" ? (
                        lesson.maxPoints && lesson.pointsEarned 
                          ? Math.round((lesson.pointsEarned / lesson.maxPoints) * 100) + '%'
                          : '-'
                      ) : (
                        <span className="text-muted-foreground">
                          {lesson.status === "mastered" ? "100%" : 
                           lesson.status === "proficient" ? "67%" : 
                           lesson.status === "familiar" ? "33%" : "0%"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
