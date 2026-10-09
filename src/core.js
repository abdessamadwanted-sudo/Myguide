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
      return { valid: false, reason: "يجب أن يتكون الرمز من 8 أو 12 أو 13 أو 14 رقمًا" };
    const digits = code.split("").map(Number);
    const check = digits.pop();
    let sum = 0;
    digits.reverse().forEach((d, i) => { sum += d * (i % 2 === 0 ? 3 : 1); });
    const expected = (10 - (sum % 10)) % 10;
    if (expected !== check)
      return { valid: false, reason: `chiffre de contrôle خاطئ (المتوقع ${expected})` };
    return {
      valid: true,
      reason: "البنية صحيحة، لكن ذلك لا يثبت أن المنتج أصلي.",
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
    if (!p.name) errors.push("اسم المنتج مفقود");
    if (!p.brand) errors.push("la marque مفقودة");
    if (p.priceMAD !== null && p.priceMAD !== undefined && !(isNum(p.priceMAD) && p.priceMAD > 0))
      errors.push("يجب أن يكون السعر رقمًا موجبًا بالدرهم");
    if (isNum(p.servingG) && isNum(p.netWeightG) && p.servingG > p.netWeightG)
      errors.push("la portion أكبر من poids net");
    if (isNum(p.proteinPerServingG) && isNum(p.servingG) && p.proteinPerServingG > p.servingG)
      errors.push("كمية البروتين في الـ portion أكبر من الـ portion نفسها: قيمة مستحيلة");
    if (isNum(p.creatinePerServingG) && isNum(p.servingG) && p.creatinePerServingG > p.servingG)
      errors.push("كمية الكرياتين في الـ portion أكبر من الـ portion نفسها: قيمة مستحيلة");
    if (p.certification && !CERT_STATUS.includes(p.certification.status))
      errors.push("statut de certification غير معروف");
    if (p.gtin) {
      const g = validateGTIN(p.gtin);
      if (!g.valid) warnings.push("GTIN: " + g.reason);
    }
    if (p.proprietaryBlend) warnings.push("Proprietary blend: كمية كل مكوّن غير مُعلنة");
    if (p.certification && p.certification.status === "déclarée_non_vérifiée")
      warnings.push("شعار الشهادة موجود على العلبة، لكن لم يُتحقَّق منه في القاعدة الرسمية");
    if (p.gmpClaim && !p.coaAvailable)
      warnings.push("شهادة GMP لا تعني أن كل lot خضع لفحص مستقل");
    return { ok: errors.length === 0, errors, warnings };
  }

  // ---- Validation d'une fiche supplément (base de données)
  function validateSupplement(s) {
    const errors = [];
    if (!s.id || !/^[a-z0-9-]+$/.test(s.id)) errors.push("يجب أن يكون id بصيغة slug (a-z, 0-9, -)");
    if (!KIND.includes(s.kind)) errors.push("kind غير معروف");
    if (!EVIDENCE.includes(s.evidence && s.evidence.level)) errors.push("niveau de preuve غير معروف");
    if (!Array.isArray(s.sources) || s.sources.length === 0) errors.push("يلزم مصدر واحد على الأقل");
    (s.sources || []).forEach((src, i) => {
      if (!src.title || !src.url) errors.push(`المصدر ${i + 1} ينقصه title أو url`);
    });
    if (!s.reviewedOn || !/^\d{4}-\d{2}-\d{2}$/.test(s.reviewedOn)) errors.push("يجب أن يكون reviewedOn بصيغة YYYY-MM-DD");
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
    if (!e || !String(e.title || "").trim()) errors.push("اكتب النشاط");
    const s = toMin(e && e.start), f = toMin(e && e.end);
    if (s === null) errors.push("يجب أن تكون ساعة البداية بصيغة 08:30");
    if (f === null) errors.push("يجب أن تكون ساعة النهاية بصيغة 09:30");
    if (s !== null && f !== null && f <= s) errors.push("يجب أن تكون ساعة النهاية بعد ساعة البداية");
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
  // Minute de déclenchement de l'alarme : début − rappel (peut être négatif = la veille)
  const REMIND = [0, 5, 10, 15, 30, 60];
  const alarmMin = (e) => { const s = toMin(e.start); return s === null ? null : s - (Number(e.remind) || 0); };
  // Alarmes à déclencher maintenant (minute atteinte, pas encore déclenchée)
  function dueAlarms(list, nowMin, fired) {
    return (list || []).filter((e) => {
      const a = alarmMin(e);
      return e.alarm && a !== null && a >= 0 && nowMin >= a && nowMin - a < 2 && !fired.has(e.id + "@" + e.start + "-" + (e.remind || 0));
    });
  }
  // Répétition : none | daily | weekdays (lun–ven) | weekly (même jour que « since »)
  const REPEAT = ["none", "daily", "weekdays", "weekly"];
  function occursOn(r, key) {
    if (!r || !r.repeat || r.repeat === "none" || !r.since || key < r.since) return false;
    const wd = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d).getDay(); };
    if (r.repeat === "daily") return true;
    if (r.repeat === "weekdays") { const w = wd(key); return w >= 1 && w <= 5; }
    if (r.repeat === "weekly") return wd(key) === wd(r.since);
    return false;
  }
  // Créneaux hebdomadaires de l'alarme (pour une notification répétée) : [{weekday 1=dim..7=sam | null, hour, minute}]
  function repeatSlots(r) {
    let a = alarmMin(r); if (a === null) return [];
    let shift = 0; if (a < 0) { a += 1440; shift = -1; }
    const hour = Math.floor(a / 60), minute = a % 60;
    const wdOf = (js) => ((((js + shift) % 7) + 7) % 7) + 1;
    if (r.repeat === "daily") return [{ weekday: null, hour, minute }];
    if (r.repeat === "weekdays") return [1, 2, 3, 4, 5].map((js) => ({ weekday: wdOf(js), hour, minute }));
    if (r.repeat === "weekly") { const [y, m, d] = r.since.split("-").map(Number); return [{ weekday: wdOf(new Date(y, m - 1, d).getDay()), hour, minute }]; }
    return [];
  }

  // ---- Profil corporel : IMC (OMS), Mifflin-St Jeor, besoins énergétiques, eau (EFSA)
  const ACTIVITY = { sedentaire: 1.2, leger: 1.375, modere: 1.55, actif: 1.725, tres_actif: 1.9 };
  const GOAL_DELTA = { perte: -400, maintien: 0, prise: 400 };
  function validateProfile(p) {
    const errors = [];
    const n = (v) => typeof v === "number" && Number.isFinite(v);
    if (!n(p.heightCm) || p.heightCm < 120 || p.heightCm > 230) errors.push("يجب أن يكون الطول بين 120 و230 cm");
    if (!n(p.weightKg) || p.weightKg < 30 || p.weightKg > 250) errors.push("يجب أن يكون الوزن بين 30 و250 kg");
    if (!n(p.age) || p.age < 18 || p.age > 100) errors.push("هذه الحسابات مخصصة للبالغين: العمر بين 18 و100");
    if (!["h", "f"].includes(p.sex)) errors.push("اختر الجنس");
    if (!ACTIVITY[p.activity]) errors.push("اختر مستوى النشاط");
    return { ok: errors.length === 0, errors };
  }
  function bmiCategory(bmi) {
    if (bmi < 18.5) return { id: "maigreur", ar: "وزن ناقص", level: "warn" };
    if (bmi < 25) return { id: "normal", ar: "وزن طبيعي", level: "good" };
    if (bmi < 30) return { id: "surpoids", ar: "وزن زائد", level: "warn" };
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

  const api = { REMIND, REPEAT, alarmMin, occursOn, repeatSlots, ACTIVITY, validateProfile, bmiCategory, bodyStats, TIME_RE, toMin, fromMin, validateEvent, duration, sortEvents, findOverlaps, eventStatus, summarizeEvents, slotsToEvents, dueAlarms, EVIDENCE, CERT_STATUS, KIND, HOURS, validateGTIN, productMetrics, validateProduct, validateSupplement, searchSupplements, summarizeDay, dateKey, addDays };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SuppCore = api;
})(typeof window !== "undefined" ? window : globalThis);
