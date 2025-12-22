# 🚀 T-HUB (Unified Project Hub)

**TEK Ekosistemi**'nin yönetim merkezi olan **T-HUB**, tüm projelerinizi, görevlerinizi ve finansal akışınızı tek bir yerden yönetmenizi sağlar.

![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0.0-purple?style=for-the-badge)
![Tech](https://img.shields.io/badge/Tech-Next.js%2015%20%7C%20Firebase%20%7C%20TypeScript-black?style=for-the-badge)

---

## ✨ Öne Çıkan Özellikler

### 📊 Proje Yönetimi

- **📈 Dashboard**: Aktif projeler, bütçe takibi ve görev durumlarının üst düzey görünümü
- **📅 Gantt Zaman Çizelgesi**: `gantt-task-react` ile interaktif zamanlama ve bağımlılık takibi
- **🎯 Kanban Panosu**: Agile iş akışları için sürükle-bırak görev yönetimi
  - Filtre ve görünüm seçenekleri
  - Öncelik bazlı renk kodlaması
  - Gerçek zamanlı senkronizasyon

### 💰 Finansal İstihbarat

- **💵 Gerçek Zamanlı Maliyet Hesaplama**: BOM (Malzeme Listesi) ve envanter atamalarına göre otomatik maliyet hesaplama
- **📊 Finansal Dashboard**:
  - Maliyet dağılımı (Malzeme vs İşçilik) için pasta grafikleri
  - Bütçe vs Gerçekleşen için çubuk grafikleri (`recharts`)
- **📈 Karlılık Analizi**: Sözleşme değeri, marjlar ve net kar takibi

### 📉 Risk ve EVM Yönetimi

- **🛡️ RAID Log**: Riskler, Varsayımlar, Sorunlar ve Bağımlılıkların merkezi takibi.
- **📊 Risk Matrisi**: Olasılık ve etkiye dayalı görsel 5x5 risk haritası.
- **📈 EVM Analizi**: Kazanılmış Değer (Earned Value) yöntemi ile proje bütçe ve zaman performansının (CPI/SPI) takibi.

### 🔌 Mühendislik Entegrasyonu

- **🔗 BOM Otomasyonu**: Weave tasarımlarından BOM'ları doğrudan içe aktarma ve stoktan otomatik düşme
- **🎨 Tasarım Görüntüleyici**: Weave şematiklerini, PCB tasarımlarını ve 3D modelleri proje bağlamında önizleme
- **📐 CAD Çizim Desteği**: DXF/DWG dosyalarını görüntüleme ve yönetme
  - React Three Fiber ile 3D görselleştirme
  - Çizgi, poliçizgi ve daire desteği
  - Zoom ve pan kontrolleri

### ☁️ Google Drive Entegrasyonu

- **📁 Dosya Tarayıcısı**: Proje dosyalarını doğrudan Drive'dan yönetme
- **📤 Yüklemeler**:
  - Küçük dosyalar için basit yükleme (<5MB)
  - Büyük dosyalar için devam ettirilebilir yükleme (>5MB)
  - Gerçek zamanlı ilerleme takibi
- **🔍 Önizleme**: DXF/DWG dosyalarını tarayıcıda doğrudan görüntüleme

### 🔗 GitHub Entegrasyonu

- Commit'leri ve PR'ları proje görevlerine bağlama
- Kod değişikliklerini proje zaman çizelgesiyle senkronize etme

---

## 🛠️ Teknoloji Yığını

| Kategori                 | Teknoloji                                    | Açıklama                                                |
| :----------------------- | :------------------------------------------- | :------------------------------------------------------ |
| **Framework**            | [Next.js 15](https://nextjs.org/)            | App Router, Server Components, TypeScript               |
| **Stil**                 | [Tailwind CSS](https://tailwindcss.com/)     | Utility-first CSS + [shadcn/ui](https://ui.shadcn.com/) |
| **Görselleştirme**       | `recharts`, `gantt-task-react`               | Finansal grafikler ve proje zaman çizelgesi             |
| **3D Render**            | `@react-three/fiber`, `@react-three/drei`    | CAD dosyası görselleştirme                              |
| **Backend**              | [Firebase](https://firebase.google.com/)     | Firestore, Authentication, Storage                      |
| **State Yönetimi**       | [Zustand](https://github.com/pmndrs/zustand) | Hafif global state yönetimi                             |
| **Uluslararasılaştırma** | `next-intl`                                  | Çoklu dil desteği (TR/EN)                               |

---

## 🚀 Başlangıç

### Ön Gereksinimler

- **Node.js** (v18+)
- **pnpm** (önerilen paket yöneticisi)
- **Firebase Projesi** (Firestore, Authentication, Storage etkin)

### Kurulum

1. **Depoyu klonlayın:**

   ```bash
   git clone <repository-url>
   cd UPH-main
   ```

2. **Bağımlılıkları yükleyin:**

   ```bash
   pnpm install
   ```

3. **Ortam Değişkenlerini Ayarlayın:**

   `.env.local` dosyası oluşturun:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Geliştirme sunucusunu başlatın:**

   ```bash
   pnpm dev
   ```

5. Tarayıcınızda [http://localhost:3002](http://localhost:3002) adresini açın.

---

## 📂 Proje Yapısı

```
UPH-main/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── [locale]/             # Uluslararasılaştırma rotaları
│   │   │   ├── (dashboard)/      # Ana uygulama düzeni
│   │   │   │   ├── dashboard/    # Yönetici özeti
│   │   │   │   ├── projects/     # Proje listesi ve detayları
│   │   │   │   ├── inventory/    # Envanter yönetimi
│   │   │   │   └── kanban/       # Kanban panosu
│   │   └── api/                  # API rotaları (proxy'ler)
│   ├── components/               # UI Bileşenleri
│   │   ├── projects/             # Proje özgü bileşenler
│   │   │   ├── project-detail/   # Proje detay sekmeleri
│   │   │   ├── weave-viewer/     # Weave tasarım görüntüleyici
│   │   │   └── list/             # Proje liste görünümleri
│   │   ├── drive/                # Google Drive entegrasyonu
│   │   ├── viewer/               # Dosya görüntüleyiciler (DXF, 3D)
│   │   ├── kanban/               # Kanban bileşenleri
│   │   └── ui/                   # Temel UI bileşenleri (shadcn)
│   ├── stores/                   # Zustand Store'ları
│   │   ├── slices/               # Store dilimleri (modüler)
│   │   ├── project-store.ts      # Proje state yönetimi
│   │   ├── kanban-store.ts       # Kanban state yönetimi
│   │   └── auth-store.ts         # Kimlik doğrulama state
│   ├── services/                 # İş Mantığı Servisleri
│   │   ├── drive-service.ts      # Google Drive API
│   │   └── github-service.ts     # GitHub API
│   ├── lib/                      # Yardımcı Fonksiyonlar
│   │   ├── repositories/         # Veri erişim katmanı
│   │   ├── firebase.ts           # Firebase yapılandırması
│   │   └── utils.ts              # Genel yardımcılar
│   └── types/                    # TypeScript Tanımları
│       ├── project.ts            # Proje tipleri
│       └── dxf-parser.d.ts       # DXF parser tip tanımları
└── public/                       # Statik Varlıklar
    └── ecosystem-logo.png        # Ekosistem logosu
```

---

## 🧩 Modül Detayları

### 📅 Zaman Çizelgesi (Gantt)

Bir projenin **Timeline** sekmesinde bulunur. Görev dizilerini görselleştirir.

**Özellikler:**

- Görev bağımlılıkları
- Kritik yol analizi
- Sürükle-bırak ile tarih ayarlama
- Otomatik tarih hesaplama

### 💰 Finansallar

**Financials** sekmesinde bulunur. Şunları toplar:

- **Malzeme Maliyeti**: Tüm bağlı envanter öğelerinin (fiyat × miktar) toplamı
- **İşçilik/Genel Gider**: (Toplam Harcanan - Malzeme Maliyeti) olarak hesaplanır
- **Projeksiyonlar**: Yapılandırılabilir bir marj (%25 varsayılan) temelinde kar tahmini

**Grafikler:**

- Maliyet Dağılımı (Pasta Grafik)
- Bütçe vs Gerçekleşen (Çubuk Grafik)
- Zaman İçinde Harcama Trendi (Çizgi Grafik)

### 🎯 Kanban Panosu

**Kanban** sekmesinde bulunur. Agile görev yönetimi sağlar.

**Özellikler:**

- Sürükle-bırak görev taşıma
- Öncelik filtreleme (Düşük, Orta, Yüksek)
- Kompakt ve detaylı görünüm modları
- Gerçek zamanlı senkronizasyon

### 📐 CAD Çizim Görüntüleyici

**CAD Drawings** sekmesinde bulunur. DXF/DWG dosyalarını yönetir.

**Desteklenen Öğeler:**

- Çizgiler (LINE)
- Poliçizgiler (LWPOLYLINE, POLYLINE)
- Daireler (CIRCLE)

**Kontroller:**

- Zoom: Fare tekerleği
- Pan: Sağ tıklayıp sürükle
- Sıfırla: Görünümü merkeze al

---

## 🔄 Ekosistem Entegrasyonu

### T-Weave ile Entegrasyon

- **📤 Tasarım İçe Aktarma**: Weave'den `.tsproj` dosyalarını doğrudan içe aktarma
- **🎨 Tasarım Önizleme**: Weave tasarımlarını proje bağlamında görüntüleme
- **📋 BOM Senkronizasyonu**: Weave BOM'larını otomatik olarak proje malzemelerine dönüştürme

### ENV-I ile Entegrasyon

- **📦 Envanter Bağlama**: Proje malzemelerini ENV-I ürünlerine bağlama
- **📊 Stok Takibi**: Gerçek zamanlı stok seviyesi görünürlüğü
- **💰 Maliyet Hesaplama**: ENV-I fiyatlarına dayalı otomatik maliyet hesaplama

---

## 🆕 Son Güncellemeler

### v2.0.0 (2025-01-20)

**Yeni Özellikler:**

- ✨ Google Drive entegrasyonu eklendi
- ✨ DXF/DWG dosya görüntüleyici eklendi
- ✨ Devam ettirilebilir dosya yükleme desteği
- ✨ Kanban panosu filtreleme ve görünüm seçenekleri
- ✨ Proje detay sayfası yeniden yapılandırıldı

**İyileştirmeler:**

- 🔧 TypeScript tip güvenliği iyileştirildi
- 🔧 Drive Service için hata yönetimi geliştirildi
- 🔧 DXF parser için tip tanımları eklendi
- 🔧 Weave Canvas Viewer performansı optimize edildi

**Düzeltmeler:**

- 🐛 Drive Service `uploadFileResumable` metodu eklendi
- 🐛 DxfViewer tip hataları düzeltildi
- 🐛 Kanban kartı sürükle-bırak işlevi düzeltildi

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen depoyu fork'layın ve Pull Request gönderin.

### Geliştirme Kuralları

- TypeScript strict mode kullanın
- Tüm bileşenler için tip tanımları yazın
- Commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/) kullanın
- Kod değişikliklerinden önce `pnpm lint` çalıştırın

---

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır.

---

## 🔗 Bağlantılar

- **T-Weave**: Şematik tasarım uygulaması
- **ENV-I**: Envanter yönetim sistemi
- **Dokümantasyon**: [Wiki](./wiki/RISK_EVM.md)
- **Sorun Bildirimi**: [GitHub Issues](./issues)
