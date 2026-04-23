const { Client } = require('pg');

const client = new Client("postgres://postgres:Sirket123*.@34.154.120.176:5432/postgres");

async function createDb() {
    try {
        await client.connect();
        await client.query('CREATE DATABASE "bursta-bugun"');
        console.log("bursta-bugun veritabanı başarıyla oluşturuldu.");
    } catch (e) {
        if (e.message && e.message.includes('already exists')) {
            console.log("Veritabanı zaten mevcut, tablo aktarımına geçilebilir.");
        } else {
            console.error("Veritabanı oluşturulurken hata:", e.message);
        }
    } finally {
        await client.end();
    }
}

createDb();
