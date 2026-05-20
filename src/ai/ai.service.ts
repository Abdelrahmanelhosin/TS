import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: { message: { content: string } }[];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly model = 'google/gemini-2.0-flash-001';
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
    if (!this.apiKey) {
      this.logger.warn(
        'OPENROUTER_API_KEY is not set. AI features will not work.',
      );
    }
  }

  // ─── Core OpenRouter Call ────────────────────────────────────────────

  private async callOpenRouter(messages: OpenRouterMessage[]): Promise<string> {
    const keys = [this.apiKey].filter(Boolean);

    let lastError: any = 'API Anahtarı bulunamadı.';

    for (const key of keys) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://poltem.com',
            'X-Title': 'PolTem Admin AI',
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            max_tokens: 4096,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as OpenRouterResponse;
          return (
            data.choices?.[0]?.message?.content || 'AI boş yanıt döndürdü.'
          );
        }

        const errBody = await response.text();
        this.logger.error(
          `OpenRouter Error with key ${key.substring(0, 15)}...: ${errBody}`,
        );
        lastError = errBody;
      } catch (error) {
        lastError = error;
        this.logger.error(
          `Fetch error with key ${key.substring(0, 15)}...:`,
          error,
        );
      }
    }

    return `AI servisine şu an ulaşılamıyor. Hata: ${lastError}`;
  }

  // ─── Platform Analysis ───────────────────────────────────────────────

  async analyzePlatform(): Promise<string> {
    // Gather platform statistics
    const [
      totalUsers,
      totalResearchers,
      totalSurveys,
      activeSurveys,
      pendingSurveys,
      completedSurveys,
      totalSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
    ] = await Promise.all([
      this.prisma.profiles.count(),
      this.prisma.profiles.count({ where: { role: 'researcher' } }),
      this.prisma.surveys.count(),
      this.prisma.surveys.count({ where: { status: 'active' as any } }),
      this.prisma.surveys.count({ where: { status: 'pending' as any } }),
      this.prisma.surveys.count({ where: { status: 'completed' as any } }),
      this.prisma.submissions.count(),
      this.prisma.submissions.count({ where: { status: 'approved' } }),
      this.prisma.submissions.count({ where: { status: 'rejected' } }),
    ]);

    // Recent surveys
    const recentSurveys = await this.prisma.surveys.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        title: true,
        status: true,
        target_audience: true,
        created_at: true,
      },
    });

    const statsContext = `
Platform İstatistikleri:
- Toplam Kullanıcı: ${totalUsers}
- Araştırmacı: ${totalResearchers}
- Toplam Anket: ${totalSurveys} (Aktif: ${activeSurveys}, Bekleyen: ${pendingSurveys}, Tamamlanan: ${completedSurveys})
- Toplam Katılım: ${totalSubmissions} (Onaylanan: ${approvedSubmissions}, Reddedilen: ${rejectedSubmissions})
- Son 5 Anket: ${recentSurveys.map((s) => `"${s.title}" (${s.status})`).join(', ')}
    `.trim();

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `Sen PolTem'in Baş Veri Bilimcisi ve Büyüme Strateji Danışmanısın. PolTem, Türkiye'deki akademik araştırma anketleri için bir katılımcı-araştırmacı eşleştirme platformudur.

Sana gönderilen platform verilerini aşağıdaki metodoloji ile analiz et:

## ANALİZ ÇERÇEVESİ

### 1. 🏥 Platform Sağlık Skoru (1-100)
Kullanıcı büyümesi, aktivasyon oranı, anket tamamlama hızı ve araştırmacı-katılımcı dengesine göre bir skor hesapla ve gerekçesini açıkla.

### 2. 📊 Büyüme Trajektörisi Analizi
Mevcut verilere göre büyüme eğrisini matematiksel olarak yorumla. "Bu platformun şu anki büyüme hızıyla X kişiye ulaşması Y ay alacak" gibi projeksiyonlar sun.

### 3. ⚖️ Kullanıcı-Araştırmacı Denge Analizi
Oran ne olmalı, şu an ne? Dengesizlik varsa bunun katılım kalitesine etkisini hesapla.

### 4. 🎯 Funnel Verimliliği
Anket başına ortalama onay oranını hesapla. Sektör ortalamasıyla (akademik platformlar için %60-75) karşılaştır.

### 5. 🚨 Risk Alarm Sistemi
Red oranı, bekleyen anket birikimi, düşük katılım trendleri gibi kritik sinyalleri tespit et ve her birine "Yüksek/Orta/Düşük Risk" etiketi ver.

### 6. 🚀 90 Günlük Aksiyon Planı
Her biri ölçülebilir KPI'a bağlı, öncelik sırasına göre 5 somut öneri sun. Tahmini etkiyi (%) de belirt.

Yanıtın markdown formatında, tablolar içersin ve Türkçe olsun. Rakamları öne çıkar.`,
      },
      {
        role: 'user',
        content: `Platformun güncel verilerini al, her metriği derinlemesine analiz et ve kapsamlı bir strateji raporu hazırla:\n\n${statsContext}`,
      },
    ];

    return this.callOpenRouter(messages);
  }

  // ─── Survey Analysis ─────────────────────────────────────────────────

  async analyzeSurvey(surveyId: string): Promise<string> {
    const survey = await this.prisma.surveys.findUnique({
      where: { id: surveyId },
      include: {
        submissions: {
          select: { status: true, created_at: true, updated_at: true },
        },
        users: { select: { email: true } },
      },
    });

    if (!survey) {
      return 'Anket bulunamadı.';
    }

    const s = survey as any;
    const totalSubs = s.submissions?.length || 0;
    const approvedSubs =
      s.submissions?.filter((sub: any) => sub.status === 'approved').length ||
      0;
    const rejectedSubs =
      s.submissions?.filter((sub: any) => sub.status === 'rejected').length ||
      0;
    const pendingSubs =
      s.submissions?.filter((sub: any) => sub.status === 'pending').length || 0;
    const targetAudience = s.target_audience || 0;
    const completionRate =
      targetAudience > 0
        ? ((approvedSubs / targetAudience) * 100).toFixed(1)
        : 'N/A';

    const surveyContext = `
Anket Bilgileri:
- Başlık: ${s.title}
- Açıklama: ${s.description || 'Belirtilmemiş'}
- Durum: ${s.status}
- Oluşturan: ${s.users?.email || 'Bilinmiyor'}
- Platform: ${s.platform || 'Google Forms'}
- Ödül: ${s.reward_amount || 0} TL
- Tahmini Süre: ${s.estimated_time || 0} dk
- Hedef Kitle: ${targetAudience} kişi
- Toplam Katılım: ${totalSubs}
- Onaylanan: ${approvedSubs}
- Reddedilen: ${rejectedSubs}
- Bekleyen: ${pendingSubs}
- Tamamlanma Oranı: %${completionRate}

Hedef Filtreler:
- Cinsiyet: ${JSON.stringify(s.target_gender || [])}
- Yaş Grubu: ${JSON.stringify(s.target_age_group || [])}
- Şehir: ${JSON.stringify(s.target_city || [])}
- Eğitim: ${JSON.stringify(s.target_education || [])}
- Meslek: ${JSON.stringify(s.target_occupation || [])}
- Sektör: ${JSON.stringify(s.target_sector || [])}
    `.trim();

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `Sen PolTem platformunun Kıdemli Araştırma Denetçisi ve Veri Bilimcisisin. Sana verilen anket verilerini aşağıdaki kapsamlı denetim metodolojisiyle analiz et:

## ANALİZ METODOLOJİSİ

### 1. 📈 İstatistiksel Denetim
- Onay/Red/Bekleyen oranlarını tabloda göster.
- İstatistiksel anlamlılık değerlendirmesi yap. Hedef kitleye ne kadar yaklaşıldı?
- Günlük ortalama katılım hızını ve kalan süreye göre hedef tamamlanma projeksiyonunu hesapla.

### 2. 💰 ROI ve Bütçe Verimliliği
- Onaylanan katılım başına maliyeti hesapla (Ödül miktarı / onaylanan).
- Reddedilen katılımların toplam bütçe kaybını hesapla.
- Sektör ortalamasıyla karşılaştırarak verimlilik skoru ver (A/B/C/D).

### 3. 🎯 Hedef Kitle Uyum Analizi
- Her filtre boyutunu (yaş, cinsiyet, şehir, eğitim, meslek) ayrı ayrı değerlendir.
- Hangi filtrenin katılımı en çok kısıtladığını tespit et ve öner.
- Demografik genişleme önerisi: Hangi ek segmentler eklenmeli?

### 4. 🔍 Fraud ve Kalite Denetimi
Aşağıdaki fraud sinyallerini kontrol et:
- Çok hızlı tamamlama oranı (suspected speeders)
- Toplu red örüntüsü (bulk rejections)
- Tekrar başvuru davranışı
Her sinyal için "Tespit Edildi/Tespit Edilmedi" ve risk seviyesi (Yüksek/Orta/Düşük) belirt.

### 5. 🧠 Yapay Zeka Başarı Tahmini
Tüm metrikleri birleştirerek anketin hedefine ulaşma olasılığını % olarak hesapla. Güven aralığını da ver (örn: %72 ± %8).

### 6. 🚀 Aksiyon Reçetesi (Öncelik Sıralı)
En kritik 4 sorunu tespit et ve her biri için:
- Problem tanımı
- Önerilen çözüm
- Beklenen iyileşme oranı (%)
- Uygulama süresi

Tüm yanıt markdown formatında, tablolar içersin, Türkçe olsun.`,
      },
      {
        role: 'user',
        content: `Bu anketi kapsamlı şekilde denetle ve stratejik bir rapor hazırla:\n\n${surveyContext}`,
      },
    ];

    return this.callOpenRouter(messages);
  }

  // ─── Chat ────────────────────────────────────────────────────────────

  async chat(
    userId: string,
    message: string,
    surveyId?: string,
  ): Promise<string> {
    // Save user message
    await this.prisma.ai_messages.create({
      data: {
        user_id: userId,
        role: 'user',
        content: message,
        survey_id: surveyId || null,
      },
    });

    // Get conversation history (last 20 messages)
    const history = await this.prisma.ai_messages.findMany({
      where: {
        user_id: userId,
        survey_id: surveyId || null,
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    // Reverse to get chronological order
    const orderedHistory = history.reverse();

    // Build context based on whether this is survey-specific
    let systemPrompt = `Sen PolTem platformunun yapay zeka asistanısın. PolTem, Türkiye'deki akademik araştırma anketleri için bir katılımcı-araştırmacı eşleştirme platformudur.
Türkçe yanıt ver. Yardımsever, profesyonel ve bilgilendirici ol.
Platform hakkında sorulara yanıt ver, anket stratejileri öner, veri analizi konusunda yardımcı ol.`;

    if (surveyId) {
      const survey = await this.prisma.surveys.findUnique({
        where: { id: surveyId },
        include: {
          submissions: { select: { status: true } },
        },
      });

      if (survey) {
        const s = survey as any;
        const totalSubs = s.submissions?.length || 0;
        const approvedSubs =
          s.submissions?.filter((sub: any) => sub.status === 'approved')
            .length || 0;

        systemPrompt += `\n\nŞu anda "${s.title}" anketini tartışıyorsun.
Anket Durumu: ${s.status}
Katılım: ${totalSubs} (Onaylı: ${approvedSubs})
Hedef: ${s.target_audience || 'Belirtilmemiş'} kişi
Ödül: ${s.reward_amount || 0} TL`;
      }
    }

    // Build messages for OpenRouter
    const messages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...orderedHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    const response = await this.callOpenRouter(messages);

    // Save assistant response
    await this.prisma.ai_messages.create({
      data: {
        user_id: userId,
        role: 'assistant',
        content: response,
        survey_id: surveyId || null,
      },
    });

    return response;
  }

  // ─── User Profile Analysis ───────────────────────────────────────────
  async analyzeGenericData(context: string, title: string): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: `Sen PolTem Akademi sisteminin baş veri bilimcisin. Sana gönderilen "${title}" isimli veri kümesini (Excel çıktısı) derinlemesine analiz etmelisin. 

        Analizinde şunlara odaklan:
        1. 📊 Betimsel İstatistikler: Verilerin ortalaması, dağılımı ve genel eğilimleri.
        2. 🔍 Farklılıklar ve Sapmalar (Differences): Hedeflenen ile gerçekleşen arasındaki farkları net bir şekilde belirt.
        3. 💡 Stratejik Aksiyonlar (Actionable Insights): Verideki sorunları çözmek için "ne yapılması gerektiğini" (Aksiyon Reçetesi) madde madde açıkla.
        4. 📈 Gelecek Projeksiyonu: Bu verilere dayanarak bir sonraki adımın ne olması gerektiğini rakamlarla açıkla.
        
        Analizi profesyonel، etkileyici ve anlaşılır bir markdown formatında, tablolar ve yüzdeler kullanarak sun. Her bölüm için somut tavsiyeler ver.`,
      },
      {
        role: 'user',
        content: `İşte analiz edilecek veri:\n${context}`,
      },
    ];

    return this.callOpenRouter(messages);
  }

  async analyzeUser(userId: string): Promise<string> {
    const user = await this.prisma.profiles.findUnique({
      where: { id: userId },
    });

    if (!user) return 'Kullanıcı bulunamadı.';

    const submissions = await this.prisma.submissions.findMany({
      where: { user_id: userId },
      take: 10,
      orderBy: { created_at: 'desc' },
      include: { surveys: true },
    });

    const context = `
      Kullanıcı Bilgileri:
      - Ad: ${user.full_name}
      - Rol: ${user.role}
      - Şehir: ${user.city}
      - Meslek: ${user.occupation}
      - Eğitim: ${user.education_level}
      - Gelir: ${user.household_income}
      - Kayıt Tarihi: ${user.created_at}
      - Bakiye: ${user.balance} TL
      
      Son Katılımlar:
      ${submissions.map((s: any) => `- ${s.surveys.title} (Durum: ${s.status}, Tarih: ${s.created_at})`).join('\n')}
    `;

    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content:
          'Sen PolTem Akademi sisteminin uzman analizcisisin. Bir kullanıcının profilini ve geçmişini analiz ederek ona bir "Güvenilirlik ve Katılım Özeti" hazırlamalısın. Yanıtın profesyonel, objektif ve Türkçe olmalı. Kullanıcının demografik yapısını ve anketlere katılım kalitesini değerlendir. Yanıtını markdown formatında ver.',
      },
      {
        role: 'user',
        content: `Lütfen şu kullanıcıyı analiz et:\n${context}`,
      },
    ];

    return this.callOpenRouter(messages);
  }

  // ─── Chat History ────────────────────────────────────────────────────

  async getChatHistory(userId: string, surveyId?: string) {
    return this.prisma.ai_messages.findMany({
      where: {
        user_id: userId,
        survey_id: surveyId || null,
      },
      orderBy: { created_at: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        created_at: true,
      },
    });
  }

  async getSmartPulse(): Promise<string> {
    const submissions = await this.prisma.submissions.findMany({
      select: {
        created_at: true,
        surveys: {
          select: { title: true, platform: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 1000,
    });

    const hourlyActivity = new Array(24).fill(0);
    const platformActivity: Record<string, number> = {};
    const recentSurveys = new Set<string>();
    
    submissions.forEach(s => {
      if (s.created_at) {
        const hour = new Date(s.created_at).getHours();
        hourlyActivity[hour]++;
      }
      
      const p = (s as any).surveys?.platform || 'Unknown';
      platformActivity[p] = (platformActivity[p] || 0) + 1;
      
      if (recentSurveys.size < 5 && (s as any).surveys?.title) {
        recentSurveys.add((s as any).surveys.title);
      }
    });

    const prompt = `
      Aşağıdaki veri setini analiz et:
      
      1. Son 1000 katılımın saatlik dağılımı (0-23): ${JSON.stringify(hourlyActivity)}
      2. Platform dağılımı: ${JSON.stringify(platformActivity)}
      3. Son aktif araştırmalar: ${Array.from(recentSurveys).join(', ')}
    `;

    return this.callOpenRouter([
      {
        role: 'system',
        content: `Sen PolTem platformunun Bildirim Optimizasyon Uzmanısın. Davranışsal veri analizi yaparak en verimli iletişim stratejisini belirlersin.

## ANALİZ ÇERÇEVESİ

### 1. ⏰ Altın Zaman Dilimleri
Saatlik veriyi analiz et. En yüksek 3 aktivite saatini tespit et ve bunları "Birincil", "İkincil", "Üçüncül" olarak etiketle. Her birinin toplam aktiviteden aldığı payı hesapla.

### 2. 📅 Gün İçi Aktivite Eğrisi
Sabah (06-12), Öğleden Sonra (12-17), Akşam (17-22), Gece (22-06) segmentlerini karşılaştır. En aktif segmentin oranını hesapla.

### 3. 🎯 Platform Stratejisi
Her platformdaki katılım yoğunluğunu karşılaştır. En verimli platform üzerinde yoğunlaşma önerisini gerekçesiyle sun.

### 4. 🚀 Bu Hafta İçin Kesin Zaman Önerisi
Analiz sonucunda: "En optimal bildirim zamanı: [GÜN] saat [XX:XX] - [XX:XX] arasıdır" şeklinde net bir öneri ver. Bunu destekleyen istatistikleri göster.

### 5. 💡 3 Somut İyileştirme Önerisi
Veriye dayalı, uygulanabilir öneriler. Her biri için beklenen artış oranını (%) belirt.

Yanıt Türkçe, markdown formatında ve tablolar içersin.`,
      },
      { role: 'user', content: prompt },
    ]);
  }
}
