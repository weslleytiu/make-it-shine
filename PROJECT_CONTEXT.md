# Project Context & Coding Standards

This document serves as a reference for the coding standards, technologies, and patterns used in the `crm-antigravity` project.

## 1. Technology Stack

- **Runtime/Build**:
  - [Vite 7](https://vitejs.dev/) (Build tool & Dev server)
  - [TypeScript 5.9](https://www.typescriptlang.org/)
  - [Node.js](https://nodejs.org/) (Environment)

- **Frontend Framework**:
  - [React 19](https://react.dev/)
  - [React Router DOM 7](https://reactrouter.com/) (Routing)

- **Styling & UI**:
  - [Tailwind CSS 3.4](https://tailwindcss.com/) (Utility-first CSS)
  - [Radix UI](https://www.radix-ui.com/) (Unstyled, accessible UI primitives)
  - [Lucide React](https://lucide.dev/) (Icons)
  - `clsx` & `tailwind-merge` (Class name utility & conflict resolution)
  - `tailwindcss-animate` (Animation utilities)

- **State Management & Data Fetching**:
  - [@tanstack/react-query](https://tanstack.com/query/latest) (Server state & caching)

- **Forms & Validation**:
  - [React Hook Form](https://react-hook-form.com/) (Form management)
  - [Zod](https://zod.dev/) (Schema validation)
  - `@hookform/resolvers` (Zod resolver for React Hook Form)

- **Utilities**:
  - [date-fns](https://date-fns.org/) (Date manipulation)

## 2. Project Structure

```text
src/
├── components/         # React components
│   ├── ui/             # Reusable UI components (Shadcn/Radix wrappers)
│   └── clients/        # Feature-specific components (e.g., ClientList)
├── hooks/              # Custom React hooks (Data fetching, logic)
├── lib/                # Utilities and libraries
│   └── schemas.ts      # Zod schemas and type definitions
├── services/           # API service layers
└── ...
```

## 3. Coding Patterns & Standards

### Type Safety & Schemas
- **Source of Truth**: define data structures using **Zod schemas** in `src/lib/schemas.ts`.
- **Type Inference**: Types are inferred directly from Zod schemas using `z.infer`.
- **Enums**: Use `z.enum` for categorical data (e.g., `ClientTypeEnum`, `ClientStatusEnum`).

### State Management (Server State)
- Use **TanStack Query** (`useQuery`, `useMutation`) for all server-side data interactions.
- Encapsulate queries and mutations in custom hooks (e.g., `src/hooks/useClients.ts`).
  - Convention: `usePlural` for lists (e.g., `useClients`).
  - Convention: `useSingular` for details (e.g., `useClient`).
  - Convention: `useActionSingular` for mutations (e.g., `useCreateClient`, `useDeleteClient`).
- Invalidate relevant query keys (`queryClient.invalidateQueries`) upon successful mutations.

### Component Architecture
- **Functional Components**: Use standard React functional components.
- **Imports**: Use absolute imports with `@/` alias (e.g., `import ... from "@/components/..."`).
- **UI Components**: Prefer reusing primitives from `src/components/ui/` (Buttons, Inputs, Dialogs, Tables).
- **Icons**: Use `lucide-react` for iconography.

### Form Handling
- Use `react-hook-form` controlled by `zodResolver`.
- Validate inputs against the Zod schemas defined in `src/lib/schemas.ts`.

### Styling
- Use **Tailwind CSS** classes.
- Combine conditional classes using `cn()` utility (usually wrapper around `clsx` + `tailwind-merge`).
- Keep styles inline via `className` props unless extracting complex components.

## 4. Specific Implementations

### Clients Module
- **Schema**: `clientSchema` in `src/lib/schemas.ts`.
- **List View**: `ClientList.tsx` - Displays tabular data with filtering and search.
- **Dialogs**: `ClientDialog.tsx` - Handles Create/Edit operations.
- **Hooks**: `useClients` handles API calls to `api.getClients()`, `api.addClient()`, etc.

### API Service
- The `api` object (imported from `@/services/api`) abstracts strict REST calls (currently appears to return Promises based on mock or real implementation).

---
*Reference this file before initiating new tasks to ensure consistency with existing patterns.*
