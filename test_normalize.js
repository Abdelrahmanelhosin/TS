const normalize = (v) => {
    if (typeof v !== 'string') return v;
    const s = v.trim();
    let lower = s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
    lower = lower.replace(/\u0307/g, '');
    
    // Position (MUST come before Sector)
    if (lower.includes('girişimci') || lower.includes('girisimci')) return 'girisimci_isletme_sahibi';
    if (lower.includes('üst düzey') || lower.includes('ust duzey')) return 'ust_duzey_yonetici';
    if (lower.includes('orta düzey') || lower.includes('orta duzey')) return 'orta_duzey_yonetici';
    if (lower.includes('takım lideri') || lower.includes('takim lideri')) return 'alt_duzey_yonetici_takim_lideri';
    if (lower === 'çalışan' || lower === 'calisan') return 'calisan';

    // Sector (after Position)
    if (lower.includes('özel sektör') || lower.includes('ozel sektor')) return 'ozel_sektor';
    if (lower.includes('kamu sektörü') || lower.includes('kamu sektoru')) return 'kamu_sektoru';
    if ((lower.includes('işletme sahibi') || lower.includes('isletme sahibi')) && (lower.includes('esnaf') || lower.includes('zanaatk') || lower.includes('kendi'))) return 'isletme_sahibi_esnaf_zanaatkar_kendi_isi';

    return `FALLBACK: ${lower}`;
};

// Test the collision case
console.log("=== POSITION VALUES ===");
console.log("Girişimci / İşletme Sahibi ->", normalize("Girişimci / İşletme Sahibi"));
console.log("Üst Düzey Yönetici ->", normalize("Üst Düzey Yönetici"));
console.log("Orta Düzey Yönetici ->", normalize("Orta Düzey Yönetici"));
console.log("Alt Düzey Yön. / Takım Lideri ->", normalize("Alt Düzey Yön. / Takım Lideri"));
console.log("Çalışan ->", normalize("Çalışan"));

console.log("\n=== SECTOR VALUES ===");
console.log("Özel Sektör ->", normalize("Özel Sektör"));
console.log("Kamu Sektörü ->", normalize("Kamu Sektörü"));
console.log("İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi ->", normalize("İşletme Sahibi / Esnaf / Zanaatkâr / Kendi İşi"));
