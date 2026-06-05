import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPanel from './AdminPanel';
import PublicDashboard from './PublicDashboard'; // Yeni yazdığımız dosyayı içeri aktardık

function App() {
  return (
    <Router>
      <Routes>
        {/* Ana sayfa (Public) artık yeni dosyamızdan besleniyor */}
        <Route path="/" element={<PublicDashboard />} />
        
        {/* Yönetim Paneli (Admin) */}
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;