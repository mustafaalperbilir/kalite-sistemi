require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

// GÜVENLİK: HTTP başlıklarını koruma
app.use(helmet());

// CORS: Sadece izin verilen kaynaktan veya her yerden erişim
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET;
const PORT = process.env.PORT || 5000;

// RATE LIMIT: Brute-force saldırılarını engelle
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10, // Her IP için en fazla 10 deneme
  message: { error: 'Çok fazla giriş denemesi yaptınız, lütfen daha sonra tekrar deneyin.' }
});

// GÜVENLİ GİRİŞ (LOGIN)
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (isMatch) {
      // ÖNEMLİ: Token içine kullanıcının ID'sini de gömüyoruz ki kimin güncelleneceğini bilelim
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '2h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }
  } catch (err) {
    console.error("Giriş hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// GÜVENLİK KALKANI (MIDDLEWARE)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Erişim reddedildi. Yetki belgesi eksik.' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Oturum süresi dolmuş veya geçersiz jeton.' });
    req.user = user; // Token içindeki id ve username buraya aktarılır
    next();
  });
};

app.put('/api/update-profile', authenticateToken, async (req, res) => {
  const { new_username, new_password, old_password } = req.body;
  const userId = req.user.id;

  try {
    // 1. Önce kullanıcının veritabanındaki mevcut verilerini al
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = userResult.rows[0];

    // 2. Eski şifreyi doğrula
    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mevcut şifreniz hatalı.' });
    }

    // 3. Güncelleme işlemi
    let queryText = "";
    let values = [];

    if (new_password && new_password.trim() !== "") {
      const saltRounds = 10;
      const hashed_password = await bcrypt.hash(new_password, saltRounds);
      queryText = "UPDATE users SET username = $1, password_hash = $2 WHERE id = $3 RETURNING *";
      values = [new_username, hashed_password, userId];
    } else {
      queryText = "UPDATE users SET username = $1 WHERE id = $2 RETURNING *";
      values = [new_username, userId];
    }

    await pool.query(queryText, values);
    res.json({ message: 'Profil başarıyla güncellendi!' });
  } catch (err) {
    res.status(500).json({ error: 'Profil güncellenirken sunucu hatası oluştu.' });
  }
});

// --- AKREDİTASYON CRUD ROTARI ---
app.get('/api/accreditations', async (req, res) => {
  try {
    const allData = await pool.query("SELECT * FROM accreditations ORDER BY id DESC");
    res.json(allData.rows);
  } catch (err) {
    res.status(500).send("Sunucu hatası");
  }
});

app.post('/api/accreditations', authenticateToken, async (req, res) => {
  try {
    const { program_name, accreditation_type, date_info, status } = req.body;
    const newData = await pool.query(
      "INSERT INTO accreditations (program_name, accreditation_type, date_info, status) VALUES($1, $2, $3, $4) RETURNING *",
      [program_name, accreditation_type, date_info, status]
    );
    res.json(newData.rows[0]);
  } catch (err) {
    res.status(500).send("Sunucu hatası");
  }
});

app.put('/api/accreditations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { program_name, accreditation_type, date_info, status } = req.body;
    const updateData = await pool.query(
      "UPDATE accreditations SET program_name = $1, accreditation_type = $2, date_info = $3, status = $4 WHERE id = $5 RETURNING *",
      [program_name, accreditation_type, date_info, status, id]
    );
    res.json(updateData.rows[0]);
  } catch (err) {
    res.status(500).send("Sunucu hatası");
  }
});

app.delete('/api/accreditations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM accreditations WHERE id = $1", [id]);
    res.json("Kayıt silindi");
  } catch (err) {
    res.status(500).send("Sunucu hatası");
  }
});

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda tam korumalı profil ayarlarıyla çalışıyor`);
});