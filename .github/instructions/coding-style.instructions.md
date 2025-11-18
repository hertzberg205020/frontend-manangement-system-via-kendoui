---
applyTo: "**/*.ts,**/*.tsx"
---
# Project Coding Style and Conventions

## React Best Practices

- **Component Types**:

  - **Always use Functional Components with Hooks** (e.g., `useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`).
  - **Avoid Class Components** unless there's a specific reason (e.g., legacy code or specific lifecycle needs).

- **Props Typing**:

  - Use TypeScript `interface` or `type` to define clear types for component props.
  - Interface names should be the component name suffixed with `Props`, e.g., `MyComponentProps`.
  - For components that accept `children`, use `React.PropsWithChildren<P>` or `React.FC<P>` (where `P` is your props interface).

    ```typescript
    // Example
    interface ButtonProps {
    	onClick: () => void;
    	variant?: 'primary' | 'secondary';
    }

    const Button: React.FC<ButtonProps> = ({
    	children,
    	onClick,
    	variant = 'primary',
    }) => {
    	// ...
    };
    ```

- **Rules of Hooks**:

  - **Strictly follow the Rules of Hooks**:
    - Only call Hooks at the top level of functional components or custom Hooks.
    - Do not call Hooks inside loops, conditions, or nested functions.

- **State Management**:

  - For simple component-local state, use `useState`.
  - For complex state shared across components, prefer `useContext` with `useReducer`.
  - If the project uses a specific state management library (e.g., Zustand, Redux Toolkit), follow its best practices.
  - **Avoid unnecessary prop drilling**.

- **Lists & Keys**:

  - When rendering lists, **always provide a stable and unique `key` prop for each list item**. Avoid using index as the key, unless the list is static and will not be reordered.

- **Side Effect Management (`useEffect`)**:

  - Clearly define the dependency array for `useEffect`.
  - Pass an empty array `[]` if the effect should not re-run.
  - If an effect needs cleanup when the component unmounts, be sure to return a cleanup function.

- **Event Handling**:

  - Event handler function names should start with `handle`, e.g., `handleClick`, `handleSubmit`, `handleChange`.
  - Use `useCallback` to memoize event handlers where possible to prevent unnecessary re-renders of child components, especially when passing functions as props.

- **Performance Optimization**:

  - Use `React.memo` to optimize re-renders of functional components.
  - Use `useMemo` to memoize the results of expensive calculations.

- **Component Structure**:
  - Keep components small and focused, following the Single Responsibility Principle.
  - Extract reusable logic into custom Hooks.

## Component & File Conventions

- File extension: `.tsx` for React components, `.ts` for plain modules.
- Component files in `src/components/`, pages in `src/pages/`, hooks in `src/hooks/`.
- Filename = PascalCase for components (`UserTable.tsx`), camelCase for hooks (`useFetchData.ts`).
- Default-export each React component at bottom of file.

## TypeScript Usage Guide

- **Type Definitions**:
  - Provide explicit types for all variables, function parameters, and return values whenever possible.
  - Prefer `interface` for defining object structures and component props.
  - Use `type` for defining union types, intersection types, or other complex types.
  - **Avoid using the `any` type** unless absolutely necessary and well-justified. Consider using `unknown` and perform type checking.
- **Strict Mode**:
  - The project has TypeScript's `strict` mode enabled; ensure your code complies with its requirements (e.g., `strictNullChecks`).
- **Optional Properties & Default Values**:
  - Use `?` to mark optional properties and provide sensible default values for optional props within the component.
- Prefer immutable data (const, readonly).

## Naming Conventions

- **Components**: `PascalCase` (e.g., `UserProfileCard`)
- **Custom Hooks**: `useCamelCase` (e.g., `useUserData`)
- **Variables/Functions**: `camelCase` (e.g., `userName`, `fetchUserDetails`)
- **TypeScript Interfaces/Types**: `PascalCase` (e.g., `User`, `ProductDetails`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_ITEMS`, `API_ENDPOINT`)

## Code Style & Standards

- **Indentation**: Use 2 spaces.
- **Quotes**: Prefer single quotes (`'`) for strings, double quotes (`"`) for JSX attributes.
- **Semicolons**: Use semicolons at the end of statements.
- **Import Order**:
  1. React-related imports (`import React from 'react';`)
  2. External package imports
  3. Project internal components/modules imports (use absolute or aliased paths, e.g., `@/components/...`)
  4. Style file imports
  5. Type imports (`import type { ... } from '...'`)
- **Arrow Functions**: Use arrow functions wherever possible, especially for callbacks.
- **Destructuring Assignment**: Actively use object and array destructuring.
- **Comments**: Add clear comments for complex logic or important decisions.

## Error Handling

- **Asynchronous Operations**: Use `try...catch` blocks to handle errors in `async/await` operations.
- **Component Error Boundaries**: Use Error Boundary components at appropriate levels to catch and handle rendering errors, preventing the entire application from crashing.

## Code Generation Preferences

- Favor concise, readable code over clever one-liners.
- Include JSDoc/TSDoc comments on exported functions/components.
- When generating forms, use AntD `<Form>` with proper field rules.
- For API clients, show example fetch wrappers using `fetch` + `async/await`.

## Other Important Notes

- **Keep code DRY (Don't Repeat Yourself)**: Avoid repetitive code; extract common logic into functions or custom Hooks.
- **Readability First**: Write code that is easy for others to understand and maintain.
- **Git Commit Messages**: Follow the project's Git commit message conventions (e.g., Conventional Commits).

---

**Copilot, please assist me in writing React and TypeScript code according to the guidelines above. When I am unsure, please prioritize the suggestions from these conventions.**
