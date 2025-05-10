import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import ProviderDetail from './ProviderDetailParody';

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/provider/:id" element={<ProviderDetail />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;