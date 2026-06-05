const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL bağlantısı
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Tabloları oluşturacak SQL fonksiyonu
const createTables = async () => {
    const queryText = `
        -- Admin girişleri için kullanıcı tablosu
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL
        );

        -- Akreditasyon verileri için tablo
        CREATE TABLE IF NOT EXISTS accreditations (
            id SERIAL PRIMARY KEY,
            program_name VARCHAR(255) NOT NULL,
            accreditation_type VARCHAR(100) NOT NULL,
            date_info VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL
        );
    `;

    try {
        // Eğer tabloyu daha önce 'password' adıyla oluşturduysa, hata almamak için ismini otomatik değiştiriyoruz
        await pool.query(`ALTER TABLE IF EXISTS users RENAME COLUMN password TO password_hash;`).catch(() => {});
        
        await pool.query(queryText);
        console.log('✅ Veritabanı tabloları hazır!');
    } catch (error) {
        console.error('❌ Tablo oluşturma hatası:', error.message);
    }
};

// Veritabanına bağlan ve ardından tabloları oluştur
pool.connect()
    .then(() => {
        console.log('✅ PostgreSQL Veritabanına başarıyla bağlanıldı.');
        createTables();
    })
    .catch((err) => console.error('❌ Veritabanı bağlantı hatası:', err.message));

module.exports = pool;