const pool = require('./db');
const bcrypt = require('bcrypt');
require('dotenv').config(); // .env dosyasını okuması için eklendi

const initAdmin = async () => {
  try {
    // Şifre ve kullanıcı adını koddan değil, .env dosyasından çekiyoruz
    const username = process.env.INIT_ADMIN_USER || 'admin'; 
    const plainPassword = process.env.INIT_ADMIN_PASS;

    // Güvenlik kontrolü: .env içinde şifre tanımlanmamışsa scripti durdur
    if (!plainPassword) {
        console.error("❌ HATA: .env dosyasında INIT_ADMIN_PASS bulunamadı. Lütfen ekleyin!");
        process.exit(1);
    }

    const saltRounds = 10;
    console.log("Şifre hashleniyor, lütfen bekleyin...");
    const hash = await bcrypt.hash(plainPassword, saltRounds);

    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING",
      [username, hash]
    );

    console.log(`✅ İlk yönetici (${username}) başarıyla veritabanına kaydedildi!`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Hata oluştu:", err);
    process.exit(1);
  }
};

initAdmin();