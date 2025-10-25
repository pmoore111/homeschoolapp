# Homeschool Grade Tracker

## Overview
The Homeschool Grade Tracker is a production-ready web application designed for Texas homeschool families. It facilitates tracking student grades, attendance, and service hours, and generates compliant report cards and progress reports. The system functions as a shared data system, allowing all authenticated users to view and edit the same educational records, effectively operating as a single family account. It offers features for grade entry, attendance logging, service hour tracking, and automated report generation, with a design inspired by educational platforms like Canvas and Google Classroom.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Build System**: Vite for fast development and optimized builds.
- **Routing**: Wouter for client-side navigation.
- **UI Components**: Radix UI primitives with shadcn/ui for consistent and accessible components.
- **State Management**: TanStack Query for server state and caching; React hooks for local state.
- **Styling**: Tailwind CSS, based on educational platform design patterns.

### Backend
- **Framework**: Express.js with TypeScript.
- **ORM**: Drizzle ORM for type-safe database operations and schema management.
- **API Design**: RESTful endpoints organized by resource.
- **File Structure**: Clear separation between client, server, and shared code.

### Data Storage
- **Database**: PostgreSQL via Neon serverless hosting.
- **Schema**: Normalized relational schema with a shared data model.
    - All students, subjects, grades, attendance, and service hours are accessible to all authenticated users.
    - Flexible configuration for subject and grading schemes.
    - Term-based academic calendar and detailed grade tracking with category weights.
    - Attendance records with status and time tracking.
    - Service hours logging for citizenship requirements.
- **Migrations**: Drizzle Kit for schema versioning.

### Authentication and Authorization
- **Integration**: Full OIDC authentication with Replit's auth service.
- **Data Model**: Shared data model where all authenticated users can access and edit all data; no per-user isolation.
- **Role Selection**: Users select Parent or Student role, but both have full read/write access to all data.
- **Security**: All API endpoints require authentication, but no ownership or role checks enforce data isolation.
- **Account Linking**: Parents can link student records to separate user accounts via email, providing bi-directional access.

### Key Design Decisions
- **Database Schema**: Normalized for complex grading schemes and data integrity, supporting custom grading scales and category weights.
- **Authentication**: Simple session-based auth with demo mode, prioritizing ease of use.
- **Component Architecture**: shadcn/ui for rapid development of accessible components.
- **State Management**: TanStack Query for server state, providing optimistic updates, caching, and synchronization.
- **API Design**: RESTful patterns with resource-based endpoints, consistent middleware for auth, validation, and error handling.
- **Styling**: Tailwind CSS focusing on data density, clear hierarchy, and efficient workflows.

### Feature Specifications
- **Attendance Tracking**: Comprehensive system with status, time of day, minutes worked, and notes. Includes a monthly calendar view with color-coded status indicators.
- **Unit Date Management**: Dialog for setting start/end dates for units (1-10) per subject. Dashboard automatically detects the "current" unit based on these dates.
- **Real-Time Dashboard**: Displays live subject averages and current unit progress, updating automatically with lesson changes.
- **Progress and Grade Tracking**: Dynamic section on the Classes page showing unit-specific and overall class progress with dual progress bars and completion metrics.
- **Khan Academy Integration**: Ability to import Khan Academy lesson lists, with smart mastery calculation for practice lessons, quizzes, and tests.
- **Student Management**: Dedicated Students page with card-based grid layout, comprehensive CRUD operations, and a two-step wizard for student creation.
- **Profile Pictures**: Avatar component in the header with profile picture display or initials fallback.

## External Dependencies
- **Neon Database**: Serverless PostgreSQL hosting.
- **shadcn/ui Components**: Pre-built UI components.
- **TanStack Query**: Server state synchronization and caching.
- **React Hook Form**: Form validation and submission.
- **Date-fns**: Date manipulation and formatting.
- **Zod**: Runtime type validation.
- **Lucide Icons**: Consistent icon library.