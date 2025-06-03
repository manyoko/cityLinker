import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import About from './About';
import Contact from './Contact';
import ProviderDetail from './ProviderDetailParody';
import AddProviderForm from './AddProviderForm';
import EditProvider from './EditProvider'
import ProviderAdmin from './Admin';
import Layout from './Layout';
import NotFound from './NotFound';

function AppRouter() {
  return (
    <Router>
      <Layout>
      <Routes> 
        <Route path="/" element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/CreateProvider" element={<AddProviderForm />} />
        <Route path="/EditProvider/:id" element={<EditProvider />} />
        <Route path="/admin" element={<ProviderAdmin />} />
        <Route path="/provider/:id" element={<ProviderDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Layout>
    </Router>
  );
}

export default AppRouter;