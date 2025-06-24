import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import About from "./About";
import Contact from "./Contact";
import ProviderDetail from "./ProviderDetailParody";
import AddProviderForm from "./AddProviderForm";
import EditProvider from "./EditProvider";
import ProviderAdmin from "./Admin";
import Layout from "./Layout";
import NotFound from "./NotFound";
import Login from "./auth/Login";
import Logout from "./auth/Logout";
import Register from "./auth/Register";
import BusinessOwnerDashboard from "./BusinessOwnerDashboard";
import PrivateRoute from "./PrivateRoute";

function AppRouter() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />

          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />

          {/* Protected Admin Route */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<ProviderAdmin />} />
          </Route>
          <Route
            element={<PrivateRoute allowedRoles={["admin", "provider"]} />}
          >
            <Route path="/dashboard" element={<BusinessOwnerDashboard />} />
            <Route path="/CreateProvider" element={<AddProviderForm />} />
            <Route path="/EditProvider/:id" element={<EditProvider />} />
          </Route>

          <Route path="/provider/:id" element={<ProviderDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default AppRouter;
