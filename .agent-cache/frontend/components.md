# Frontend Components Cache

- SessionTimeoutModal.tsx — 25-min warning / 30-min expiry modal (AC-08)
- ErrorBoundary.tsx — top-level React error boundary
- ProtectedRoute.tsx — reads accessToken from localStorage, gates routes (AC-03)
- AuthenticatedLayout.tsx — shared authenticated shell/layout
- RoleSelector.tsx — Admin / Receptionist / Security Guard pill selector (AC-03, Figma node 40:5301)

### Pages (frontend/src/pages/, not under components/ but part of the same UI surface)
- LoginPage.tsx, ForgotPasswordPage.tsx, ResetPasswordPage.tsx, DashboardPage.tsx, GateEntryPage.tsx, VisitorEntryPage.tsx

### Other src/ files
- icons.tsx — shared icon components (e.g. password eye-toggle icon)
- Banners.tsx — inline banner/alert components
