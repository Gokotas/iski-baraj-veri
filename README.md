# İSKİ baraj doluluk — günlük okuma

İstanbul Su ve Kanalizasyon İdaresi'nin (İSKİ) herkese açık [baraj doluluk sayfasını](https://iski.istanbul/baraj-doluluk/) günde bir kez gerçek bir tarayıcıyla açar ve sayfada görünen değerleri `veri/` klasörüne kaydeder.

- `veri/son.json`: en son okuma (genel doluluk oranı, İSKİ'nin güncelleme zamanı, sayfanın yüklediği grafik verileri)
- `veri/gunluk/YYYY-AA-GG.json`: günlük arşiv

Veriler İSKİ'ye aittir; kullanırken kaynak olarak İSKİ'yi gösterin. Bu depo İSKİ ile bağlantılı değildir. [sondurumhaberler.com](https://sondurumhaberler.com/baraj/istanbul/) için hazırlanmıştır.
