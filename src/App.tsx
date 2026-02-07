import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Professionals from "@/pages/Professionals";
import ProfessionalDetail from "@/pages/ProfessionalDetail";
import Jobs from "@/pages/Jobs";
import Finance from "@/pages/Finance";
import Invoices from "@/pages/Invoices";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="professionals" element={<Professionals />} />
          <Route path="professionals/:id" element={<ProfessionalDetail />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="finance" element={<Finance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
