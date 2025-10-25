import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-96 w-full border rounded-lg overflow-hidden">
        <AppSidebar currentPath="/dashboard" />
        <div className="flex-1 p-6 bg-background">
          <h2 className="text-2xl font-bold mb-4">Main Content Area</h2>
          <p className="text-muted-foreground">
            The sidebar navigation includes all major sections: Dashboard, Grades, 
            Attendance, Service Hours, Reports, Students, and Settings.
          </p>
        </div>
      </div>
    </SidebarProvider>
  );
}