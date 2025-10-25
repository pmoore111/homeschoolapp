# Homeschool Grade Tracker Design Guidelines

## Design Approach
**Utility-Focused Design System** - Following a productivity-focused approach inspired by educational platforms like Canvas and Google Classroom, prioritizing clarity, efficiency, and data comprehension over visual flair.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light mode: 219 78% 20% (deep educational blue)
- Dark mode: 219 78% 85% (light blue for contrast)

**Accent Colors:**
- Success/grades: 142 69% 45% (educational green)
- Warning/missing: 45 93% 47% (amber for attention)
- Error: 0 72% 51% (clear red for issues)

**Background Strategy:**
- Clean, minimal backgrounds with subtle gray tones
- Card-based layouts with soft shadows for data separation
- No gradients or decorative elements that distract from data

### B. Typography
**Font System:** Inter (Google Fonts)
- Headers: 600-700 weight for clear hierarchy
- Body: 400-500 weight for readability
- Data tables: 400 weight, slightly smaller for density
- Emphasize numerical data with medium weight

### C. Layout System
**Tailwind Spacing:** Consistent use of 2, 4, 6, 8, 12, 16 units
- Cards: p-6, gap-4 between elements
- Tables: p-4 for cells, gap-2 for tight data
- Dashboard widgets: p-6 with mb-8 spacing
- Form elements: gap-4 between fields

### D. Component Library

**Navigation:**
- Clean sidebar with clear iconography
- Breadcrumb navigation for deep sections
- Tab system for switching between terms/subjects

**Data Tables:**
- Inline editing capabilities with clear focus states
- Alternating row colors for readability
- Sortable headers with visual indicators
- Keyboard navigation highlighting

**Forms:**
- Grouped logical sections with clear labels
- Inline validation with immediate feedback
- Quick-add buttons for common actions
- Auto-save indicators

**Dashboard Cards:**
- Grade overview cards with large, readable numbers
- Progress indicators using subtle color coding
- Quick-action buttons for common tasks
- Attendance summary with calendar preview

**Reports Interface:**
- Clean PDF preview with print-optimized styling
- Export buttons with clear file format indicators
- Settings panels with collapsible sections

### E. Key UX Patterns

**Grade Entry Flow:**
- Spreadsheet-like interface with keyboard shortcuts
- Contextual grade calculation display
- Quick assignment creation modal
- Batch operations for efficiency

**Attendance Tracking:**
- Monthly calendar view with status indicators
- Quick daily entry with preset options
- Running totals prominently displayed

**Report Generation:**
- Step-by-step wizard for report customization
- Real-time PDF preview
- Clear export and sharing options

## Visual Hierarchy
- Numerical data (grades, averages) given highest visual priority
- Clear separation between input areas and calculated results
- Consistent iconography from Heroicons for actions
- Subtle animations only for state changes and loading

## Images
No decorative images needed. This is a data-focused application where:
- Icons serve functional purposes (subjects, actions, status)
- Charts/graphs for grade trends (if implemented)
- Student photos optional in profile areas
- Focus remains on clear data presentation

The design prioritizes fast data entry, accurate calculations display, and professional report output over visual aesthetics.