import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Professionals from "@/pages/Professionals";
import ProfessionalDetail from "@/pages/ProfessionalDetail";
import Jobs from "@/pages/Jobs";
import Finance from "@/pages/Finance";
import Invoices from "@/pages/Invoices";
import PaymentRuns from "@/pages/PaymentRuns";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="professionals" element={<Professionals />} />
          <Route path="professionals/:id" element={<ProfessionalDetail />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="finance" element={<Finance />} />
          <Route path="payment-runs" element={<PaymentRuns />} />
        </Route>
        <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
