const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("./core.js");
const { SUPPLEMENTS, PRODUCTS } = require("./data.js");

test("GTIN: EAN-13 valide (structure seulement)", () => {
  assert.equal(C.validateGTIN("4006381333931").valid, true);
  assert.match(C.validateGTIN("4006381333931").reason, /ما كيثبتش/);
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
  fired.add("a@07:00");
  assert.equal(C.dueAlarms(ev, 420, fired).length, 0);
  assert.equal(C.dueAlarms(ev, 430, new Set()).length, 0);
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
test("Profil: valeurs invalides refusées, mineurs exclus", () => {
  assert.equal(C.bodyStats({ heightCm: 175, weightKg: 60, age: 16, sex: "h", activity: "modere" }), null);
  assert.equal(C.validateProfile({ heightCm: 90, weightKg: 60, age: 30, sex: "h", activity: "modere" }).ok, false);
  assert.equal(C.validateProfile({ heightCm: 175, weightKg: 60, age: 30, sex: "x", activity: "modere" }).ok, false);
});
test("Recherche: synonymes, accents et filtre catégorie", () => {
  assert.equal(C.searchSupplements(SUPPLEMENTS, "creatine")[0].id, "creatine-monohydrate");
  assert.ok(C.searchSupplements(SUPPLEMENTS, "glycinate").some((s) => s.id === "magnesium"));
  assert.ok(C.searchSupplements(SUPPLEMENTS, "", "Minéraux").every((s) => s.category === "Minéraux"));
});
