import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import LoginPage from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import SchoolsPage from "@/pages/schools";
import SchoolDetailPage from "@/pages/school-detail";
import TeachersPage from "@/pages/teachers";
import TimetablePage from "@/pages/timetable";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRoutes() {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/schools" component={SchoolsPage} />
        <Route path="/schools/:schoolId" component={SchoolDetailPage} />
        <Route path="/teachers" component={TeachersPage} />
        <Route path="/timetable" component={TimetablePage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
