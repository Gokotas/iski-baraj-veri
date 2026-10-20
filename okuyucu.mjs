// İSKİ baraj doluluk sayfasını gerçek bir tarayıcıyla günde bir kez açar; ekranda görünen
// genel oranı ve sayfanın yüklenirken kendisinin aldığı grafik verilerini kaydeder.
// İSKİ'nin servisine bu betik ayrıca istek atmaz; yalnızca normal bir sayfa ziyareti yapılır.
import { chromium } from 'playwright';
import fs from 'node:fs';

const URL = 'https://iski.istanbul/baraj-doluluk/';

// Bağlantı testi: sunucu bu ağdan yanıt veriyor mu?
for (const u of ['https://iski.istanbul/', 'https://www.google.com/']) {
  const t0 = Date.now();
  try {
    const r = await fetch(u, { signal: AbortSignal.timeout(25000) });
    console.log(`Bağlantı ${u}: HTTP ${r.status} (${Date.now() - t0} ms)`);
  } catch (e) {
    console.log(`Bağlantı ${u}: HATA ${e.name} ${e.message} (${Date.now() - t0} ms)`);
  }
}

const tarayici = await chromium.launch();
const sayfa = await tarayici.newPage({ locale: 'tr-TR', timezoneId: 'Europe/Istanbul' });
const grafikVerisi = {};
sayfa.on('response', async (r) => {
  const u = r.url();
  if (!u.includes('/api/iski/baraj/') || r.status() !== 200) return;
  try { grafikVerisi[u.split('/api/iski/baraj/')[1]] = await r.json(); } catch { /* JSON değil */ }
});

await sayfa.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
await sayfa.waitForFunction(() => /ORTALAMA BARAJ DOLULUK ORANI\s*[\d.,]+\s?%/i.test(document.body.innerText), null, { timeout: 90000 });
await sayfa.waitForTimeout(10000); // geç yüklenen grafikler
const metin = await sayfa.evaluate(() => document.body.innerText);
await tarayici.close();

const genel = (metin.match(/ORTALAMA BARAJ DOLULUK ORANI\s*([\d.,]+)\s?%/i) || [])[1];
const guncelleme = (metin.match(/Son Güncelleme Zamanı\s*:\s*([\d/]+\s+[\d:]+)/i) || [])[1] || null;
if (!genel) { console.error('Genel doluluk oranı sayfada bulunamadı'); process.exit(1); }

const kayit = {
  alindi: new Date().toISOString(),
  kaynak: URL,
  genel_doluluk: parseFloat(genel.replace(',', '.')),
  iski_guncelleme: guncelleme,
  grafik_verisi: grafikVerisi,
};
const gun = new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10);
fs.mkdirSync('veri/gunluk', { recursive: true });
fs.writeFileSync('veri/son.json', JSON.stringify(kayit, null, 1));
fs.writeFileSync(`veri/gunluk/${gun}.json`, JSON.stringify(kayit));
console.log(`Tamam: %${kayit.genel_doluluk} (${guncelleme}), ${Object.keys(grafikVerisi).length} grafik yanıtı`);
