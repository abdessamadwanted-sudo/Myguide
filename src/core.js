// Supplement Intelligence — logique métier (calculs, validation, GTIN)
// Fonctionne dans le navigateur (window.SuppCore) et dans Node (module.exports).
(function (root) {
  "use strict";

  const EVIDENCE = ["forte", "modérée", "limitée", "insuffisante"];
  const CERT_STATUS = ["non_déclarée", "déclarée_non_vérifiée", "vérifiée_source_officielle"];
  const KIND = ["nutriment_essentiel", "supplément_performance", "protéine_alimentaire", "plante"];

  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const round = (v, d = 2) => (isNum(v) ? Math.round(v * 10 ** d) / 10 ** d : null);

  // ---- GTIN (EAN-8 / UPC-A 12 / EAN-13 / GTIN-14) : validité structurelle seulement
  function validateGTIN(raw) {
    const code = String(raw || "").replace(/\s+/g, "");
    if (!/^\d+$/.test(code)) return { valid: false, reason: "يحتوي على حروف أو رموز غير الأرقام" };
    if (![8, 12, 13, 14].includes(code.length))
      return { valid: false, reason: "الطول خاصو يكون 8 أو 12 أو 13 أو 14 رقم" };
    const digits = code.split("").map(Number);
    const check = digits.pop();
    let sum = 0;
    digits.reverse().forEach((d, i) => { sum += d * (i % 2 === 0 ? 3 : 1); });
    const expected = (10 - (sum % 10)) % 10;
    if (expected !== check)
      return { valid: false, reason: `chiffre de contrôle خاطئ (المتوقع ${expected})` };
    return {
      valid: true,
      reason: "البنية صحيحة. هادشي ما كيثبتش أن المنتوج أصلي.",
    };
  }

  // ---- Calculs de comparaison (null = information manquante, jamais inventée)
  function productMetrics(p) {
    const servings = isNum(p.netWeightG) && isNum(p.servingG) && p.servingG > 0
      ? p.netWeightG / p.servingG : null;
    const pricePerServing = isNum(p.priceMAD) && servings ? p.priceMAD / servings : null;
    const proteinPct = isNum(p.proteinPerServingG) && isNum(p.servingG) && p.servingG > 0
      ? (p.proteinPerServingG / p.servingG) * 100 : null;
    const pricePer25gProtein = pricePerServing !== null && isNum(p.proteinPerServingG) && p.proteinPerServingG > 0
      ? (pricePerServing / p.proteinPerServingG) * 25 : null;
    const totalCreatineG = isNum(p.creatinePerServingG) && servings ? p.creatinePerServingG * servings : null;
    const pricePerGCreatine = isNum(p.priceMAD) && totalCreatineG ? p.priceMAD / totalCreatineG : null;
    return {
      servings: round(servings, 1),
      pricePerServing: round(pricePerServing),
      proteinPct: round(proteinPct, 1),
      pricePer25gProtein: round(pricePer25gProtein),
      pricePerGCreatine: round(pricePerGCreatine),
    };
  }

  // ---- Règles de validation d'un produit
  function validateProduct(p) {
    const errors = [];
    const warnings = [];
    if (!p.name) errors.push("الاسم ديال المنتوج ناقص");
    if (!p.brand) errors.push("la marque ناقصة");
    if (p.priceMAD !== null && p.priceMAD !== undefined && !(isNum(p.priceMAD) && p.priceMAD > 0))
      errors.push("الثمن خاصو يكون رقم موجب بالدرهم");
    if (isNum(p.servingG) && isNum(p.netWeightG) && p.servingG > p.netWeightG)
      errors.push("la portion أكبر من poids net");
    if (isNum(p.proteinPerServingG) && isNum(p.servingG) && p.proteinPerServingG > p.servingG)
      errors.push("البروتين فالـ portion أكبر من الـ portion كاملة: مستحيل");
    if (isNum(p.creatinePerServingG) && isNum(p.servingG) && p.creatinePerServingG > p.servingG)
      errors.push("الكرياتين فالـ portion أكبر من الـ portion كاملة: مستحيل");
    if (p.certification && !CERT_STATUS.includes(p.certification.status))
      errors.push("statut de certification غير معروف");
    if (p.gtin) {
      const g = validateGTIN(p.gtin);
      if (!g.valid) warnings.push("GTIN: " + g.reason);
    }
    if (p.proprietaryBlend) warnings.push("Proprietary blend: الكميات ديال كل مكون ما مبيناش");
    if (p.certification && p.certification.status === "déclarée_non_vérifiée")
      warnings.push("Logo de certification على العلبة، ولكن ما تأكدناش منو فالـ base officielle");
    if (p.gmpClaim && !p.coaAvailable)
      warnings.push("GMP ما كيعنيش أن كل lot تفحص بشكل مستقل");
    return { ok: errors.length === 0, errors, warnings };
  }

  // ---- Validation d'une fiche supplément (base de données)
  function validateSupplement(s) {
    const errors = [];
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) errors.push("id خاصو يكون slug (a-z, 0-9, -)");
    if (!KIND.includes(s.kind)) errors.push("kind غير معروف");
    if (!EVIDENCE.includes(s.evidence && s.evidence.level)) errors.push("niveau de preuve غير معروف");
    if (!Array.isArray(s.sources) || s.sources.length === 0) errors.push("خاص مصدر واحد على الأقل");
    (s.sources || []).forEach((src, i) => {
      if (!src.title || !src.url) errors.push(`المصدر ${i + 1} ناقص title أو url`);
    });
    if (!s.reviewedOn || !/^\d{4}-\d{2}-\d{2}$/.test(s.reviewedOn)) errors.push("reviewedOn خاصو YYYY-MM-DD");
    return { ok: errors.length === 0, errors };
  }

  // ---- Recherche plein texte (nom, synonymes, catégorie, formes)
  function normalize(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  function searchSupplements(list, query, category) {
    const q = normalize(query).trim();
    return list.filter((s) => {
      if (category && category !== "all" && s.category !== category) return false;
      if (!q) return true;
      const hay = normalize([s.name, s.nameAr, ...(s.synonyms || []), s.category, ...(s.forms || []).map((f) => f.name)].join(" "));
      return q.split(/\s+/).every((w) => hay.includes(w));
    });
  }

  // ---- Agenda : heures de la journée et résumé par catégorie
  const HOURS = Array.from({ length: 19 }, (_, i) => String(i + 5).padStart(2, "0")); // 05 → 23
  function summarizeDay(slots) {
    const byCat = {};
    let filled = 0;
    HOURS.forEach((h) => {
      const s = slots && slots[h];
      if (s && String(s.text || "").trim()) {
        filled++;
        const c = s.cat || "autre";
        byCat[c] = (byCat[c] || 0) + 1;
      }
    });
    return { filled, total: HOURS.length, pct: Math.round((filled / HOURS.length) * 100), byCat };
  }
  function dateKey(d) {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function addDays(key, n) {
    const [y, m, d] = key.split("-").map(Number);
    return dateKey(new Date(y, m - 1, d + n));
  }

  // ---- Calendrier : événements avec heure de début / fin et alarme
  const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const toMin = (t) => { const m = TIME_RE.exec(t || ""); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  const fromMin = (n) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  function validateEvent(e) {
    const errors = [];
    if (!e || !String(e.title || "").trim()) errors.push("كتب شنو غادي دير");
    const s = toMin(e && e.start), f = toMin(e && e.end);
    if (s === null) errors.push("ساعة البداية خاصها تكون بحال 08:30");
    if (f === null) errors.push("ساعة النهاية خاصها تكون بحال 09:30");
    if (s !== null && f !== null && f <= s) errors.push("ساعة النهاية خاصها تكون من بعد البداية");
    return { ok: errors.length === 0, errors };
  }
  const duration = (e) => { const s = toMin(e.start), f = toMin(e.end); return s !== null && f !== null && f > s ? f - s : 0; };
  const sortEvents = (list) => [...(list || [])].sort((a, b) => toMin(a.start) - toMin(b.start));
  function findOverlaps(list) {
    const ev = sortEvents(list), out = new Set();
    for (let i = 0; i < ev.length; i++) for (let j = i + 1; j < ev.length; j++) {
      if (toMin(ev[j].start) < toMin(ev[i].end)) { out.add(ev[i].id); out.add(ev[j].id); } else break;
    }
    return out;
  }
  function summarizeEvents(list) {
    const byCat = {}; let minutes = 0;
    (list || []).forEach((e) => { const d = duration(e); minutes += d; const c = e.cat || "autre"; byCat[c] = (byCat[c] || 0) + d; });
    return { count: (list || []).length, minutes, byCat, alarms: (list || []).filter((e) => e.alarm).length };
  }
  // Ancien format (créneaux horaires) → événements
  function slotsToEvents(slots) {
    return Object.keys(slots || {}).filter((h) => String(slots[h].text || "").trim()).sort().map((h) => ({
      id: "m" + h, title: slots[h].text, start: h + ":00", end: fromMin(Math.min(toMin(h + ":00") + 60, 23 * 60 + 59)), cat: slots[h].cat || "", alarm: false, note: "",
    }));
  }
  // Alarmes à déclencher maintenant (minute de début atteinte, pas encore déclenchée)
  function dueAlarms(list, nowMin, fired) {
    return (list || []).filter((e) => e.alarm && toMin(e.start) !== null && nowMin >= toMin(e.start) && nowMin - toMin(e.start) < 2 && !fired.has(e.id + "@" + e.start));
  }

  // ---- Profil corporel : IMC (OMS), Mifflin-St Jeor, besoins énergétiques, eau (EFSA)
  const ACTIVITY = { sedentaire: 1.2, leger: 1.375, modere: 1.55, actif: 1.725, tres_actif: 1.9 };
  const GOAL_DELTA = { perte: -400, maintien: 0, prise: 400 };
  function validateProfile(p) {
    const errors = [];
    const n = (v) => typeof v === "number" && Number.isFinite(v);
    if (!n(p.heightCm) || p.heightCm < 120 || p.heightCm > 230) errors.push("الطول خاصو يكون بين 120 و 230 cm");
    if (!n(p.weightKg) || p.weightKg < 30 || p.weightKg > 250) errors.push("الوزن خاصو يكون بين 30 و 250 kg");
    if (!n(p.age) || p.age < 18 || p.age > 100) errors.push("الحسابات هنا للبالغين: العمر بين 18 و 100");
    if (!["h", "f"].includes(p.sex)) errors.push("ختار الجنس");
    if (!ACTIVITY[p.activity]) errors.push("ختار مستوى النشاط");
    return { ok: errors.length === 0, errors };
  }
  function bmiCategory(bmi) {
    if (bmi < 18.5) return { id: "maigreur", ar: "وزن ناقص", level: "warn" };
    if (bmi < 25) return { id: "normal", ar: "وزن طبيعي", level: "good" };
    if (bmi < 30) return { id: "surpoids", ar: "وزن زايد", level: "warn" };
    return { id: "obesite", ar: "سمنة", level: "bad" };
  }
  function bodyStats(p) {
    if (!validateProfile(p).ok) return null;
    const m = p.heightCm / 100;
    const bmi = p.weightKg / (m * m);
    const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "h" ? 5 : -161);
    const tdee = bmr * ACTIVITY[p.activity];
    const goal = GOAL_DELTA[p.goal] !== undefined ? p.goal : "maintien";
    return {
      bmi: Math.round(bmi * 10) / 10,
      category: bmiCategory(bmi),
      healthyMin: Math.round(18.5 * m * m * 10) / 10,
      healthyMax: Math.round(24.9 * m * m * 10) / 10,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target: Math.round(tdee + GOAL_DELTA[goal]),
      goal,
      waterL: p.sex === "h" ? 2.5 : 2.0,
    };
  }

  function eventStatus(e, nowMin) {
    if (nowMin >= toMin(e.end)) return "done";
    if (nowMin >= toMin(e.start)) return "live";
    return "next";
  }

  const api = { ACTIVITY, validateProfile, bmiCategory, bodyStats, TIME_RE, toMin, fromMin, validateEvent, duration, sortEvents, findOverlaps, eventStatus, summarizeEvents, slotsToEvents, dueAlarms, EVIDENCE, CERT_STATUS, KIND, HOURS, validateGTIN, productMetrics, validateProduct, validateSupplement, searchSupplements, summarizeDay, dateKey, addDays };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SuppCore = api;
})(typeof window !== "undefined" ? window : globalThis);
