import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('banu_jwt_token') !== null;
  });
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Akreditasyon Form State'leri
  const [formData, setFormData] = useState({
    program_name: '',
    accreditation_type: '',
    date_info: '',
    status: 'SURECTE'
  });
  const [accreditations, setAccreditations] = useState([]);
  const [refreshCount, setRefreshCount] = useState(0);
  const [editId, setEditId] = useState(null);

  // Modal ve Profil Form State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
  new_username: '',
  new_password: '',
  old_password: '' // Yeni eklenen alan
});

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('banu_jwt_token', data.token);
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError(data.error || 'Giriş başarısız!');
      }
    } catch (error) {
      console.error("Bağlantı hatası:", error);
      setLoginError('Sunucuya bağlanılamadı. Backend açık mı?');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('banu_jwt_token');
    setIsAuthenticated(false);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('banu_jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/accreditations`);
        const data = await response.json();
        setAccreditations(data);
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      }
    };
    loadData();
  }, [refreshCount, isAuthenticated]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Profil Formu Değişiklik Takibi
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  // HESAP BİLGİLERİNİ GÜNCELLEME
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/update-profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileForm)
      });
      const data = await response.json();

      if (response.ok) {
        alert('🔒 Giriş bilgileriniz başarıyla güncellendi! Lütfen yeni bilgilerinizle tekrar giriş yapın.');
        setIsModalOpen(false);
        handleLogout(); 
      } else {
        alert(`❌ Hata: ${data.error || 'Profil güncellenemedi.'}`);
      }
    } catch (error) {
      console.error("Profil güncelleme hatası:", error);
      alert('API ile bağlantı kurulamadı.');
    }
  };

  const handleEditClick = (item) => {
    setFormData({
      program_name: item.program_name,
      accreditation_type: item.accreditation_type,
      date_info: item.date_info,
      status: item.status
    });
    setEditId(item.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setFormData({ program_name: '', accreditation_type: '', date_info: '', status: 'SURECTE' });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId ? `${API_URL}/api/accreditations/${editId}` : `${API_URL}/api/accreditations`;
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editId ? '✅ Kayıt başarıyla güncellendi!' : '✅ Kayıt başarıyla eklendi!');
        setFormData({ program_name: '', accreditation_type: '', date_info: '', status: 'SURECTE' });
        setEditId(null);
        setRefreshCount(prev => prev + 1);
      } else {
        const err = await response.json();
        alert(`❌ Hata: ${err.error || 'İşlem başarısız'}`);
        if (response.status === 401 || response.status === 403) handleLogout();
      }
    } catch (error) {
      console.error('Gönderme hatası:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kaydı tamamen silmek istediğinize emin misiniz?')) {
      try {
        const response = await fetch(`${API_URL}/api/accreditations/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          alert('🗑️ Kayıt başarıyla silindi!');
          setRefreshCount(prev => prev + 1);
        } else {
          const err = await response.json();
          alert(`❌ Hata: ${err.error || 'Silme başarısız'}`);
          if (response.status === 401 || response.status === 403) handleLogout();
        }
      } catch (error) {
        console.error('Silme hatası:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f9', fontFamily: '"Nunito", "Segoe UI", sans-serif' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '50%', fontSize: '28px', margin: '0 auto 20px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px' }}>
            🔒
          </div>
          <h2 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '24px', fontWeight: '800' }}>Yönetim Girişi</h2>
          <p style={{ margin: '0 0 25px 0', color: '#64748b', fontSize: '14px' }}>Sistem JWT Token ve Bcrypt ile korunmaktadır.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
            <input type="password" placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '12px 16px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
            {loginError && <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>{loginError}</div>}
            <button type="submit" style={{ padding: '14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', marginTop: '5px' }}>Güvenli Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: '#f4f7f9', fontFamily: '"Nunito", "Segoe UI", sans-serif', position: 'relative' }}>
      
      {/* MODAL (HESAP AYARLARI) */}
      {isModalOpen && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
          backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', 
            width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative', animation: 'fadeIn 0.2s ease-out'
          }}>
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}
            >
              ✖
            </button>
            <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🔒 Hesap Ayarları
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Yeni giriş bilgilerinizi belirleyin. İşlem sonrası oturumunuz yeniden başlatılacaktır.</p>
            
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Yeni Kullanıcı Adı</label>
                <input type="text" name="new_username" placeholder="Örn: yeni_admin" value={profileForm.new_username} onChange={handleProfileChange} required style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
  <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Mevcut Şifre</label>
  <input 
    type="password" name="old_password" placeholder="İşlemi onaylamak için mevcut şifrenizi girin" 
    value={profileForm.old_password} onChange={handleProfileChange} required 
    style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} 
  />
</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Yeni Şifre</label>
                <input type="password" name="new_password" placeholder="Değiştirmek istemiyorsanız boş bırakın" value={profileForm.new_password} onChange={handleProfileChange} style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
              </div>
              <button type="submit" style={{ padding: '14px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', marginTop: '10px' }}>
                Bilgileri Güncelle
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Ortalanmış Başlık Alanı ve Sağ Üst Butonlar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '40px', position: 'relative' }}>
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '15px', borderRadius: '50%', fontSize: '28px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px' }}>
            🛡️
          </div>
          <h2 style={{ margin: 0, color: '#1e293b', fontSize: '26px', fontWeight: '800' }}>Yönetim Paneli</h2>
          <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '15px' }}>Akreditasyon verilerini buradan yönetebilirsiniz.</p>
          
          {/* SAĞ ÜST MENÜ BUTONLARI */}
          <div style={{ position: 'absolute', right: 0, top: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setIsModalOpen(true)} 
              style={{ padding: '8px 16px', backgroundColor: '#e2e8f0', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', transition: 'background-color 0.2s' }}
            >
              ⚙️ Yönetim
            </button>
            <button 
              onClick={handleLogout} 
              style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'background-color 0.2s' }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>
        
        {/* AKREDİTASYON EKLE/DÜZENLE FORMU (Artık Geniş) */}
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '40px', border: editId ? '2px solid #3b82f6' : '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: editId ? '#3b82f6' : '#0f172a', fontSize: '18px', fontWeight: '700' }}>
              {editId ? '✏️ Kaydı Düzenle' : '✨ Yeni Akreditasyon Ekle'}
            </h3>
            {editId && <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>✖ İptal</button>}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Program Adı</label>
              <input type="text" name="program_name" placeholder="Örn: Yazılım Mühendisliği" value={formData.program_name} onChange={handleChange} required style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Akreditasyon Türü</label>
              <input type="text" name="accreditation_type" placeholder="Örn: MÜDEK" value={formData.accreditation_type} onChange={handleChange} required style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Tarih Bilgisi</label>
              <input type="text" name="date_info" placeholder="Örn: 2025 - 2027" value={formData.date_info} onChange={handleChange} required style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Durum</label>
              <select name="status" value={formData.status} onChange={handleChange} style={{ padding: '12px 14px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', outline: 'none', backgroundColor: 'white' }}>
                <option value="TAMAMLANDI">✅ Tamamlandı</option>
                <option value="SURECTE">🔄 Başvuru Sürecinde</option>
                <option value="YENI_BASVURU">📝 Yeni Başvuru</option>
              </select>
            </div>
            <button type="submit" style={{ gridColumn: '1 / -1', padding: '14px', background: editId ? '#3b82f6' : '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }}>
              {editId ? 'Değişiklikleri Kaydet' : 'Veritabanına Ekle'}
            </button>
          </form>
        </div>

        {/* TABLO KARTI */}
        <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>🗃️ Sistemdeki Kayıtlar</h3>
            <span style={{ backgroundColor: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Toplam: {accreditations.length}</span>
          </div>
          
          {accreditations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Henüz eklenmiş bir veri bulunmuyor.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '13px' }}>
                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>PROGRAM ADI</th>
                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>AKREDİTASYON</th>
                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0' }}>DURUM</th>
                    <th style={{ padding: '16px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>İŞLEMLER</th>
                  </tr>
                </thead>
                <tbody>
                  {accreditations.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '16px', color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>{item.program_name}</td>
                      <td style={{ padding: '16px', color: '#475569', fontSize: '14px' }}>{item.accreditation_type} <br/><span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.date_info}</span></td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: item.status === 'TAMAMLANDI' ? '#dcfce7' : item.status === 'SURECTE' ? '#fef3c7' : '#ede9fe', color: item.status === 'TAMAMLANDI' ? '#166534' : item.status === 'SURECTE' ? '#92400e' : '#4c1d95' }}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleEditClick(item)} style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', color: '#3b82f6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Düzenle</button>
                        <button onClick={() => handleDelete(item.id)} style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Sil</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;