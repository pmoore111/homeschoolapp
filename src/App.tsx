import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AppSidebar } from "@/components/AppSidebar";
import { Dashboard } from "@/components/Dashboard";
import { GradeEntry } from "@/components/GradeEntry";
import { ReportsPanel } from "@/components/ReportsPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import Calendar from "@/pages/Calendar";
import NotFound from "@/pages/not-found";

function AppHeader() {
  return (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div>
          <h1 className="text-lg font-semibold">Living Word Academy</h1>
          <p className="text-sm text-muted-foreground">Texas Compliant</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Dashboard />} />
      <Route path="/dashboard" component={() => <Dashboard />} />
      <Route path="/grades" component={() => <GradeEntry />} />
      <Route path="/calendar" component={() => <Calendar />} />
      <Route path="/reports" component={() => <ReportsPanel />} />
      <Route path="/settings" component={() => <SettingsPanel />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="light">
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1">
                <AppHeader />
                <main className="flex-1 overflow-auto bg-background">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
