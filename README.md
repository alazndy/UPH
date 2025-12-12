# Unified Project Hub (UPH)

Unified Project Hub, karmaşık projeleri, görevleri ve kaynakları tek bir merkezden yönetmek için tasarlanmış, **AI destekli** (Gemini) ve **GitHub entegreli** modern bir proje yönetim aracıdır. Envanter sistemi (ENV-I) ile entegre çalışarak malzeme ve bütçe yönetimini kolaylaştırır.

## 🚀 Özellikler

### 📊 Proje Yönetimi

- **Detaylı Proje Takibi:** Projelerin bütçesini, takvimini, ekibini ve durumunu tek ekrandan izleyin.
- **Kanban Görev Panosu:** Sürükle-bırak özellikli Kanban panosu ile görevleri (Todo, In Progress, Review, Done) görsel olarak yönetin.
- **GitHub Entegrasyonu:** GitHub repolarınızı bağlayın, issue'ları otomatik olarak görevlere dönüştürün ve senkronize edin.

### 🤖 AI Asistan (Gemini)

- **Akıllı Görev Oluşturma:** AI asistanı, proje tanımına göre otomatik alt görevler önerir ve oluşturur.
- **Issue Özetleme:** Karmaşık GitHub issue'larını analiz eder ve özetler.

### 🔗 Envanter Entegrasyonu

- **ENV-I Bağlantısı:** Envanter sistemine (ENV-I) doğrudan bağlanır.
- **Malzeme Atama:** Projelere stoktan ürün, sarf malzeme veya demirbaş atayın.
- **Maliyet Takibi:** Atanan malzemelerin maliyetlerini proje bütçesine otomatik yansıtın.

### 🛠 Teknik Altyapı

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **UI:** shadcn/ui, Tailwind CSS
- **State Management:** Zustand
- **Database:** Firebase Firestore
- **AI:** Google Generative AI (Gemini)
- **DnD:** @dnd-kit (Kanban board için)

## 🚀 Kurulum

1. **Projeyi Klonlayın:**

```bash
git clone https://github.com/alazndy/Pr-M.git
cd Pr-M
```

2. **Bağımlılıkları Yükleyin:**

```bash
pnpm install
```

3. **Çevresel Değişkenleri Ayarlayın:**
   `.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_GEMINI_API_KEY=...
# Diğer Firebase ayarları...
```

4. **Uygulamayı Başlatın:**

```bash
pnpm dev
```

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen pull request göndermeden önce issue açarak tartışın.

## 📝 Lisans

MIT License
