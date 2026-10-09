const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("./core.js");
const { SUPPLEMENTS, PRODUCTS } = require("./data.js");

test("GTIN: EAN-13 valide (structure seulement)", () => {
  assert.equal(C.validateGTIN("4006381333931").valid, true);
  assert.match(C.validateGTIN("4006381333931").reason, /لا يثبت/);
});
test("GTIN: chiffre de contrôle faux", () => {
  assert.equal(C.validateGTIN("4006381333932").valid, false);
});
test("GTIN: longueur et caractères invalides", () => {
  assert.equal(C.validateGTIN("12345").valid, false);
  assert.equal(C.validateGTIN("40063813339A1").valid, false);
});

test("Whey: prix par portion et par 25 g de protéine", () => {
  const m = C.productMetrics({ priceMAD: 600, netWeightG: 3000, servingG: 30, proteinPerServingG: 25 });
  assert.equal(m.servings, 100);
  assert.equal(m.pricePerServing, 6);
  assert.equal(m.pricePer25gProtein, 6);
  assert.equal(m.proteinPct, 83.3);
});
test("Créatine: prix par gramme", () => {
  const m = C.productMetrics({ priceMAD: 300, netWeightG: 300, servingG: 3, creatinePerServingG: 3 });
  assert.equal(m.pricePerGCreatine, 1);
});
test("Info manquante => null, jamais une valeur inventée", () => {
  const m = C.productMetrics({ priceMAD: 199, netWeightG: 300, servingG: 5, creatinePerServingG: null });
  assert.equal(m.pricePerGCreatine, null);
  assert.equal(m.pricePer25gProtein, null);
});

test("Validation produit: protéine > portion rejetée", () => {
  const r = C.validateProduct({ name: "x", brand: "y", priceMAD: 10, servingG: 30, proteinPerServingG: 40 });
  assert.equal(r.ok, false);
});
test("Validation produit: avertissements blend + logo non vérifié", () => {
  const r = C.validateProduct({ name: "x", brand: "y", priceMAD: 10, proprietaryBlend: true,
    certification: { status: "déclarée_non_vérifiée" } });
  assert.equal(r.ok, true);
  assert.equal(r.warnings.length, 2);
});

test("Toutes les fiches d'exemple passent la validation", () => {
  for (const s of SUPPLEMENTS) {
    const r = C.validateSupplement(s);
    assert.equal(r.ok, true, s.id + ": " + r.errors.join(", "));
  }
});
test("Tous les produits d'exemple sont marqués example et valides", () => {
  for (const p of PRODUCTS) {
    assert.equal(p.example, true);
    assert.equal(C.validateProduct(p).ok, true, p.id);
  }
});
test("Agenda: résumé des heures remplies par catégorie", () => {
  const r = C.summarizeDay({ "06": { text: "Gym", cat: "sport" }, "07": { text: "  " }, "08": { text: "Chantier", cat: "travail" }, "09": { text: "Chantier", cat: "travail" } });
  assert.equal(r.filled, 3);
  assert.equal(r.total, 19);
  assert.deepEqual(r.byCat, { sport: 1, travail: 2 });
});
test("Agenda: navigation entre les jours (fin de mois)", () => {
  assert.equal(C.addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(C.addDays("2026-03-01", -1), "2026-02-28");
});
test("Minéraux: 13 fiches complètes avec source", () => {
  const { MINERALS } = require("./minerals.js");
  assert.equal(MINERALS.length, 13);
  for (const m of MINERALS) for (const k of ["sym", "ar", "role", "sources", "need", "deficiency", "excess", "src"]) assert.ok(m[k] && m[k].length, m.id + " " + k);
});
test("Calendrier: validation début / fin", () => {
  assert.equal(C.validateEvent({ title: "Gym", start: "18:00", end: "19:30" }).ok, true);
  assert.equal(C.validateEvent({ title: "Gym", start: "19:00", end: "18:00" }).ok, false);
  assert.equal(C.validateEvent({ title: "", start: "8:00", end: "09:00" }).errors.length, 2);
});
test("Calendrier: durée, chevauchements et résumé", () => {
  const ev = [{ id: "a", start: "08:00", end: "10:00", cat: "travail" }, { id: "b", start: "09:30", end: "10:30", cat: "sport", alarm: true }, { id: "c", start: "12:00", end: "12:45", cat: "repas" }];
  assert.equal(C.duration(ev[0]), 120);
  assert.deepEqual([...C.findOverlaps(ev)].sort(), ["a", "b"]);
  const s = C.summarizeEvents(ev);
  assert.equal(s.minutes, 225); assert.equal(s.alarms, 1); assert.equal(s.byCat.travail, 120);
});
test("Calendrier: alarmes dues une seule fois", () => {
  const ev = [{ id: "a", start: "07:00", end: "07:30", alarm: true }, { id: "b", start: "07:00", end: "08:00", alarm: false }];
  const fired = new Set();
  assert.equal(C.dueAlarms(ev, 420, fired).length, 1);
  fired.add("a@420");
  assert.equal(C.dueAlarms(ev, 420, fired).length, 0);
  assert.equal(C.dueAlarms(ev, 430, new Set()).length, 0);
});
test("Alarme: heure exacte dans le rendez-vous + répétition jusqu'à la fin", () => {
  const e = { id: "g", start: "08:00", end: "09:00", alarm: true, alarmAt: "08:20", alarmEvery: 15 };
  assert.deepEqual(C.alarmTimes(e).map(C.fromMin), ["08:20", "08:35", "08:50"]);
  const due = C.dueAlarms([e], C.toMin("08:35"), new Set(["g@500"]));
  assert.deepEqual(due.map((x) => x._at), [515]);
  assert.equal(C.validateEvent({ ...e, title: "x", alarmAt: "09:30" }).ok, false);
  // ancien format (rappel X minutes avant) toujours compris
  assert.equal(C.alarmMin({ start: "18:00", remind: 15 }), 17 * 60 + 45);
});
test("Répétition: tous les jours, jours ouvrables, chaque semaine", () => {
  const d = { repeat: "daily", since: "2026-10-09" };
  assert.equal(C.occursOn(d, "2026-10-08"), false);
  assert.equal(C.occursOn(d, "2026-10-20"), true);
  const w = { repeat: "weekdays", since: "2026-10-09" }; // vendredi
  assert.equal(C.occursOn(w, "2026-10-10"), false); // samedi
  assert.equal(C.occursOn(w, "2026-10-12"), true); // lundi
  const k = { repeat: "weekly", since: "2026-10-09" };
  assert.equal(C.occursOn(k, "2026-10-16"), true);
  assert.equal(C.occursOn(k, "2026-10-17"), false);
  assert.equal(C.occursOn({ repeat: "none", since: "2026-10-09" }, "2026-10-09"), false);
});
test("Répétition: créneaux de notification hebdomadaires", () => {
  assert.deepEqual(C.repeatSlots({ repeat: "daily", start: "06:30", remind: 10 }), [{ weekday: null, hour: 6, minute: 20 }]);
  assert.deepEqual(C.repeatSlots({ repeat: "daily", start: "06:00", end: "07:00", alarmAt: "06:30", alarmEvery: 20 }), [{ weekday: null, hour: 6, minute: 30 }, { weekday: null, hour: 6, minute: 50 }]);
  const wk = C.repeatSlots({ repeat: "weekdays", start: "08:00", remind: 0 });
  assert.deepEqual(wk.map((s) => s.weekday), [2, 3, 4, 5, 6]); // lun..ven (1 = dimanche)
  // 00:10 avec rappel 30 min → 23:40 la veille
  const late = C.repeatSlots({ repeat: "weekly", since: "2026-10-12", start: "00:10", remind: 30 }); // lundi
  assert.deepEqual(late, [{ weekday: 1, hour: 23, minute: 40 }]); // dimanche
});
test("Calendrier: migration de l'ancien format horaire", () => {
  const e = C.slotsToEvents({ "06": { text: "Gym", cat: "sport" }, "07": { text: "" } });
  assert.equal(e.length, 1); assert.equal(e[0].start, "06:00"); assert.equal(e[0].end, "07:00");
});
test("Calendrier: statut passé / en cours / à venir", () => {
  const e = { start: "08:00", end: "12:00" };
  assert.equal(C.eventStatus(e, C.toMin("07:59")), "next");
  assert.equal(C.eventStatus(e, C.toMin("10:00")), "live");
  assert.equal(C.eventStatus(e, C.toMin("12:00")), "done");
});
test("Profil: IMC, catégorie et fourchette de poids sain", () => {
  const s = C.bodyStats({ heightCm: 175, weightKg: 60, age: 28, sex: "h", activity: "modere", goal: "prise" });
  assert.equal(s.bmi, 19.6);
  assert.equal(s.category.id, "normal");
  assert.equal(s.healthyMin, 56.7);
  assert.equal(s.healthyMax, 76.3);
  assert.equal(C.bmiCategory(18.4).id, "maigreur");
  assert.equal(C.bmiCategory(30).id, "obesite");
});
test("Profil: Mifflin-St Jeor + activité + objectif", () => {
  const s = C.bodyStats({ heightCm: 175, weightKg: 60, age: 28, sex: "h", activity: "modere", goal: "prise" });
  assert.equal(s.bmr, 1559);
  assert.equal(s.tdee, 2416);
  assert.equal(s.target, 2816);
  const f = C.bodyStats({ heightCm: 165, weightKg: 58, age: 30, sex: "f", activity: "sedentaire", goal: "maintien" });
  assert.equal(f.bmr, 1300);
  assert.equal(f.waterL, 2.0);
});
test("Profil: âge à partir de la date de naissance", () => {
  assert.equal(C.ageFrom("1996-10-10", "2026-10-09"), 29);
  assert.equal(C.ageFrom("1996-10-09", "2026-10-09"), 30);
  assert.ok(Number.isNaN(C.ageFrom("", "2026-10-09")));
});
test("Profil: valeurs invalides refusées, mineurs exclus", () => {
  assert.equal(C.bodyStats({ heightCm: 175, weightKg: 60, age: 16, sex: "h", activity: "modere" }), null);
  assert.equal(C.validateProfile({ heightCm: 90, weightKg: 60, age: 30, sex: "h", activity: "modere" }).ok, false);
  assert.equal(C.validateProfile({ heightCm: 175, weightKg: 60, age: 30, sex: "x", activity: "modere" }).ok, false);
});
const TREE = [{ id: "food", subs: [{ id: "veg" }, { id: "fruit" }] }, { id: "home", subs: [{ id: "rent" }] }];
test("Dépenses: montant, validation, somme mensuelle par groupe", () => {
  assert.equal(C.parseAmount("12,5"), 12.5);
  assert.ok(Number.isNaN(C.parseAmount("abc")));
  assert.equal(C.validateExpense({ date: "2026-10-09", sub: "veg", amount: 20 }, ["veg"]).ok, true);
  assert.equal(C.validateExpense({ date: "2026-10-09", sub: "x", amount: 0 }, ["veg"]).errors.length, 2);
  const e = [
    { date: "2026-10-01", sub: "rent", amount: 2500 }, { date: "2026-10-03", sub: "veg", amount: 35.5, item: "طماطم" },
    { date: "2026-10-07", sub: "veg", amount: 20, item: "Tomates" }, { date: "2026-10-07", sub: "fruit", amount: 18 },
    { date: "2026-09-30", sub: "veg", amount: 99 },
  ];
  const s = C.expenseSummary(e, "2026-10", TREE);
  assert.equal(s.total, 2573.5); assert.equal(s.count, 4);
  assert.deepEqual(s.byGroup, { home: 2500, food: 73.5 });
  assert.deepEqual(s.bySub.veg, { sum: 55.5, count: 2 });
  assert.equal(C.addMonths("2026-01", -1), "2025-12");
});
test("Dépenses: articles récents pour « acheter à nouveau »", () => {
  const e = [{ date: "2026-10-01", sub: "veg", item: "Tomates", amount: 10 }, { date: "2026-10-05", sub: "veg", item: "tomates ", amount: 12 }, { date: "2026-10-04", sub: "veg", item: "Oignons", amount: 6 }];
  const r = C.recentItems(e, "veg");
  assert.deepEqual(r.map((x) => [x.item, x.amount, x.times]), [["tomates", 12, 2], ["Oignons", 6, 1]]);
});
test("Échéances: mensuelle, marge, payée, en retard, fin de mois", () => {
  const rent = { name: "كراء", amount: 2500, freq: "monthly", day: 5, margin: 3, since: "2026-09-01", paid: [] };
  assert.equal(C.validateBill(rent).ok, true);
  assert.deepEqual(C.billDue({ ...rent, since: "2026-10-01" }, "2026-10-01"), { due: "2026-10-05", period: "2026-10", days: 4, status: "later" });
  assert.equal(C.billDue({ ...rent, since: "2026-10-01" }, "2026-10-02").status, "soon");
  assert.equal(C.billDue({ ...rent, paid: ["2026-09"] }, "2026-10-07").status, "overdue");
  assert.equal(C.billDue({ ...rent, paid: ["2026-09", "2026-10"] }, "2026-10-07").due, "2026-11-05");
  // ajouté le 9 octobre, échéance le 5 : octobre est considéré comme déjà réglé → novembre
  assert.equal(C.billDue({ ...rent, since: "2026-10-09" }, "2026-10-09").due, "2026-11-05");
  // septembre non payé (ajouté en août) → en retard début octobre
  const lateSep = C.billDue({ ...rent, since: "2026-08-01" }, "2026-10-01");
  assert.deepEqual([lateSep.period, lateSep.status], ["2026-09", "overdue"]);
  const eom = { name: "x", amount: 1, freq: "monthly", day: 31, margin: 0, paid: [], since: "2026-02-01" };
  assert.equal(C.billDue(eom, "2026-02-10").due, "2026-02-28");
});
test("Échéances: annuelle, unique, liste des proches", () => {
  const ins = { name: "Assurance", amount: 1800, freq: "yearly", date: "2025-11-01", margin: 30, paid: [], since: "2026-10-01" };
  assert.deepEqual(C.billDue(ins, "2026-10-09"), { due: "2026-11-01", period: "2026", days: 23, status: "soon" });
  assert.equal(C.billDue({ ...ins, paid: ["2026"] }, "2026-10-09").due, "2027-11-01");
  const f = { name: "Formation", amount: 900, freq: "once", date: "2026-12-01", margin: 7, paid: [], since: "2026-10-01" };
  assert.equal(C.billDue(f, "2026-10-09").status, "later");
  assert.equal(C.billDue({ ...f, paid: ["once"] }, "2026-12-03").status, "paid");
  const up = C.upcomingBills([ins, f, { name: "Gym", amount: 200, freq: "monthly", day: 8, margin: 2, paid: [], since: "2026-10-01" }], "2026-10-09");
  assert.deepEqual(up.map((x) => x.b.name), ["Gym", "Assurance"]);
});
test("Routine: nombre de repas, conservation de la saisie", () => {
  const three = C.resizeMeals([], 3);
  assert.deepEqual(three.map((m) => m.name), ["الفطور", "الغداء", "العشاء"]);
  three[0].food = "بيض وخبز";
  const four = C.resizeMeals(three, 4);
  assert.equal(four.length, 4); assert.equal(four[0].food, "بيض وخبز");
  assert.deepEqual(four.map((m) => m.name), ["الفطور", "الغداء", "اللمجة", "العشاء"]);
  const custom = C.resizeMeals([{ id: "x", name: "وجبتي", time: "09:00", food: "", alarm: true }], 2);
  assert.equal(custom[0].name, "وجبتي");
  assert.equal(C.resizeMeals(four, 2).length, 2);
  assert.equal(C.resizeMeals([], 8).length, 8);
});
test("Routine: médicaments (durée, jours ouvrables) et liste du jour", () => {
  const med = { id: "d1", name: "Vitamine D", dose: "1 قرص", times: ["20:00", "08:00"], repeat: "daily", days: 10, start: "2026-10-01", alarm: true };
  assert.equal(C.validateMed(med).ok, true);
  assert.equal(C.validateMed({ ...med, times: [] }).ok, false);
  assert.equal(C.medActiveOn(med, "2026-10-10"), true);
  assert.equal(C.medActiveOn(med, "2026-10-11"), false); // 10 jours: 1→10
  assert.equal(C.medActiveOn({ ...med, repeat: "weekdays", days: 0 }, "2026-10-10"), false); // samedi
  const r = C.routineFor([{ id: "a", name: "الفطور", time: "08:30", food: "", alarm: false }], [med], "2026-10-09");
  assert.deepEqual(r.map((x) => x.key), ["med:d1@08:00", "meal:a", "med:d1@20:00"]);
});
test("Recherche: synonymes, accents et filtre catégorie", () => {
  assert.equal(C.searchSupplements(SUPPLEMENTS, "creatine")[0].id, "creatine-monohydrate");
  assert.ok(C.searchSupplements(SUPPLEMENTS, "glycinate").some((s) => s.id === "magnesium"));
  assert.ok(C.searchSupplements(SUPPLEMENTS, "", "Minéraux").every((s) => s.category === "Minéraux"));
});
