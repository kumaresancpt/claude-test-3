# Frontend Routes Cache

Source: frontend/src/App.tsx (react-router-dom BrowserRouter)

- /login          → LoginPage (public)
- /forgot-password → ForgotPasswordPage (public)
- /reset-password  → ResetPasswordPage (public)
- /dashboard       → DashboardPage (wrapped in ProtectedRoute)
- /visitor-entry   → VisitorEntryPage (wrapped in ProtectedRoute)
- /gate-entry      → GateEntryPage (wrapped in ProtectedRoute)
- /  → redirect to /login
- *  → redirect to /login (catch-all)

### Hooks (frontend/src/hooks/)
- useSessionTimeout.ts — drives SessionTimeoutModal (AC-08)

### Packages installed (frontend/package.json)
- dependencies: react ^18.2.0, react-dom ^18.2.0, react-router-dom ^6.20.0
- devDependencies: typescript, vite, @vitejs/plugin-react, jest, ts-jest, jest-environment-jsdom,
  @testing-library/react, @testing-library/jest-dom, @testing-library/user-event,
  @types/react, @types/react-dom, @types/jest, identity-obj-proxy
