# دليل المكملات — تطبيق Android

تطبيق فيه: لوحة قيادة، أجندة بمواعيد ومنبهات حقيقيين، جدول المعادن، المكملات، ومقارنة المنتوجات.

## كيفاش كيتصاوب التطبيق

كل مرة كيتبدل الكود فالفرع `main`، GitHub كيدير هادشي أوتوماتيكيا (`.github/workflows/android.yml`):

1. كيدوز الـ tests (`npm test`)
2. كيجمع الصفحة فـ `www/index.html` (`npm run build`)
3. كيصاوب مشروع Android بـ Capacitor ويزيد الـ permissions ديال المنبه
4. كيصاوب ملف `supplement-app.apk` وكيحطو فـ **Releases**

## التثبيت والتحديث فالتيليفون

رابط ثابت ديال آخر نسخة:

```
https://github.com/abdessamadwanted-sudo/Myguide/releases/latest/download/supplement-app.apk
```

- أول مرة: حل الرابط ← تحميل ← ثبت. Android غادي يطلب «Autoriser les sources inconnues» للمتصفح: قبلها.
- التحديث: نفس الرابط، ثبت فوق النسخة القديمة. المعطيات ديالك كتبقى.
- تشوف واش النسخة الجديدة واجدة: تبويب **Actions** فـ GitHub (أخضر = واجدة، أحمر = كاين مشكل).

## الملفات

| الملف | الدور |
|---|---|
| `src/page.html` | الواجهة (HTML/CSS/JS) |
| `src/core.js` | الحسابات: الأجندة، المنبهات، المقارنة، GTIN |
| `src/data.js` | فيشات المكملات والمنتوجات (أمثلة) |
| `src/minerals.js` | فيشات المعادن (NIH) |
| `src/core.test.js` | الـ tests |
| `src/schema.sql` | Schéma PostgreSQL للمستقبل |
| `assets/` | الأيقونة |
| `keystore/debug.keystore` | مفتاح التوقيع: خاصو يبقى هو هو باش التحديثات يتثبتو فوق بعضهم |

## ملاحظات

- المعطيات ديال الأجندة كتتسجل فالتيليفون (ما كتمشيش لشي serveur).
- المفتاح `debug.keystore` صالح للاستعمال الشخصي. قبل النشر فـ Google Play خاص مفتاح release خاص (secret).
- المحتوى الصحي تعليمي وماشي بديل للطبيب أو الصيدلي.
