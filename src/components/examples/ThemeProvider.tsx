import { ThemeProvider } from '../ThemeProvider';
import { ThemeToggle } from '../ThemeToggle';

export default function ThemeProviderExample() {
  return (
    <ThemeProvider>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Theme Provider Example</h2>
          <ThemeToggle />
        </div>
        <p className="text-muted-foreground">
          This component provides theme context and allows switching between light and dark modes.
        </p>
        <div className="p-4 border rounded-lg bg-card">
          <p>This content automatically adapts to the selected theme.</p>
        </div>
      </div>
    </ThemeProvider>
  );
}