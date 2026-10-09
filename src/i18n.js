// Traduction de l'interface : arabe (source) → français, anglais, espagnol.
// L'interface est écrite en arabe ; ce module traduit le DOM à l'affichage (texte + attributs)
// et les textes des notifications. Chaque entrée : "texte arabe": [fr, en, es].
(function (root) {
  "use strict";
  const LANGS = { ar: "العربية", fr: "Français", en: "English", es: "Español" };
  const IDX = { fr: 0, en: 1, es: 2 };

  const D = {
    // ---- Navigation, général
    "لوحة القيادة": ["Tableau de bord", "Dashboard", "Panel"],
    "معطياتي": ["Mes données", "My data", "Mis datos"],
    "التنظيم": ["Organisation", "Planning", "Organización"],
    "الأجندة": ["Agenda", "Planner", "Agenda"],
    "المصاريف": ["Dépenses", "Expenses", "Gastos"],
    "الالتزامات": ["Échéances", "Bills", "Pagos fijos"],
    "مراجع": ["Références", "References", "Referencias"],
    "المصادر": ["Sources", "Sources", "Fuentes"],
    "المظهر": ["Apparence", "Appearance", "Apariencia"],
    "اللغة": ["Langue", "Language", "Idioma"],
    "القائمة": ["Menu", "Menu", "Menú"],
    "دليل المكملات": ["Mon Guide", "My Guide", "Mi Guía"],
    "محتوى تعليمي، ولا يغني عن استشارة الطبيب أو الصيدلي.": ["Contenu éducatif ; ne remplace pas l'avis d'un médecin ou d'un pharmacien.", "Educational content; not a substitute for a doctor or pharmacist.", "Contenido educativo; no sustituye la consulta con un médico o farmacéutico."],
    "ليلي": ["Nuit", "Night", "Noche"], "نهاري": ["Jour", "Day", "Día"], "احترافي": ["Pro", "Pro", "Pro"], "زمردي": ["Émeraude", "Emerald", "Esmeralda"], "بنفسجي": ["Violet", "Violet", "Violeta"],
    "إضافة": ["Ajouter", "Add", "Añadir"], "إلغاء": ["Annuler", "Cancel", "Cancelar"], "حذف": ["Supprimer", "Delete", "Eliminar"], "مسح": ["Supprimer", "Delete", "Eliminar"],
    "تعديل": ["Modifier", "Edit", "Editar"], "إغلاق": ["Fermer", "Close", "Cerrar"], "حفظ التعديلات": ["Enregistrer", "Save changes", "Guardar cambios"],
    "نعم": ["Oui", "Yes", "Sí"], "لا": ["Non", "No", "No"], "الكل": ["Tout", "All", "Todo"], "بحث": ["Rechercher", "Search", "Buscar"],
    "اختياري": ["Facultatif", "Optional", "Opcional"], "ملاحظة": ["Note", "Note", "Nota"], "الاسم": ["Nom", "Name", "Nombre"], "النوع": ["Type", "Type", "Tipo"],
    "التاريخ": ["Date", "Date", "Fecha"], "الوقت": ["Heure", "Time", "Hora"], "الساعة": ["Horloge", "Clock", "Reloj"], "المدة": ["Durée", "Duration", "Duración"],
    "اليوم": ["Aujourd'hui", "Today", "Hoy"], "غدًا": ["Demain", "Tomorrow", "Mañana"], "اليوم السابق": ["Jour précédent", "Previous day", "Día anterior"], "اليوم التالي": ["Jour suivant", "Next day", "Día siguiente"],
    "هذا الشهر": ["Ce mois-ci", "This month", "Este mes"], "الشهر السابق": ["Mois précédent", "Previous month", "Mes anterior"], "الشهر التالي": ["Mois suivant", "Next month", "Mes siguiente"],
    "في هذا الشهر": ["ce mois-ci", "this month", "este mes"], "المجموع": ["Total", "Total", "Total"], "المجموع:": ["Total :", "Total:", "Total:"], "التفاصيل": ["Détails", "Details", "Detalles"],
    "لا يوجد": ["Aucun", "None", "Ninguno"], "لا شيء": ["Rien", "Nothing", "Nada"], "لا شيء مسجل": ["Rien d'enregistré", "Nothing recorded", "Nada registrado"], "غير متوفر": ["Non disponible", "Not available", "No disponible"],
    "حُفظ ✓": ["Enregistré ✓", "Saved ✓", "Guardado ✓"], "جارٍ الحفظ…": ["Enregistrement…", "Saving…", "Guardando…"], "حُفظ في الهاتف ✓": ["Enregistré sur le téléphone ✓", "Saved on phone ✓", "Guardado en el teléfono ✓"],
    "حُفظ في حسابك ✓": ["Enregistré dans votre compte ✓", "Saved to your account ✓", "Guardado en tu cuenta ✓"], "حُفظ في هذا الجهاز فقط": ["Enregistré sur cet appareil uniquement", "Saved on this device only", "Guardado solo en este dispositivo"],
    "محفوظ في الهاتف": ["Enregistré sur le téléphone", "Saved on phone", "Guardado en el teléfono"], "متزامن مع حسابك": ["Synchronisé avec votre compte", "Synced with your account", "Sincronizado con tu cuenta"],
    "هل أنت متأكد؟ اضغط مرة أخرى": ["Sûr ? Appuyez encore", "Sure? Tap again", "¿Seguro? Pulsa otra vez"], "تأكيد الحذف؟": ["Confirmer ?", "Confirm delete?", "¿Confirmar?"], "حذف؟": ["Supprimer ?", "Delete?", "¿Eliminar?"],
    "سنة": ["ans", "years", "años"], "يوم": ["j", "d", "d"], "أيام": ["jours", "days", "días"], "دقائق": ["min", "min", "min"], "دقيقة": ["min", "min", "min"],
    "وقت": ["Heure", "Time", "Hora"], "س": ["h", "h", "h"], "د": ["min", "min", "min"], "درهم": ["DH", "DH", "DH"], "عملية": ["opération(s)", "transaction(s)", "operación(es)"], "عنصر": ["élément(s)", "item(s)", "elemento(s)"],
    "موعد": ["rendez-vous", "event(s)", "cita(s)"], "ثم": ["puis", "then", "luego"], "من": ["De", "From", "Desde"], "حتى": ["À", "To", "Hasta"],

    // ---- Jours et mois
    "الأحد": ["Dimanche", "Sunday", "Domingo"], "الاثنين": ["Lundi", "Monday", "Lunes"], "الثلاثاء": ["Mardi", "Tuesday", "Martes"], "الأربعاء": ["Mercredi", "Wednesday", "Miércoles"],
    "الخميس": ["Jeudi", "Thursday", "Jueves"], "الجمعة": ["Vendredi", "Friday", "Viernes"], "السبت": ["Samedi", "Saturday", "Sábado"],
    "أحد": ["Dim", "Sun", "Dom"], "اثن": ["Lun", "Mon", "Lun"], "ثلا": ["Mar", "Tue", "Mar"], "أرب": ["Mer", "Wed", "Mié"], "خمي": ["Jeu", "Thu", "Jue"], "جمع": ["Ven", "Fri", "Vie"], "سبت": ["Sam", "Sat", "Sáb"],
    "يناير": ["janvier", "January", "enero"], "فبراير": ["février", "February", "febrero"], "مارس": ["mars", "March", "marzo"], "أبريل": ["avril", "April", "abril"], "ماي": ["mai", "May", "mayo"], "يونيو": ["juin", "June", "junio"],
    "يوليوز": ["juillet", "July", "julio"], "غشت": ["août", "August", "agosto"], "شتنبر": ["septembre", "September", "septiembre"], "أكتوبر": ["octobre", "October", "octubre"], "نونبر": ["novembre", "November", "noviembre"], "دجنبر": ["décembre", "December", "diciembre"],

    // ---- Tableau de bord
    "مواعيد اليوم": ["Rendez-vous du jour", "Today's events", "Citas de hoy"], "لا توجد مواعيد": ["Aucun rendez-vous", "No events", "Sin citas"],
    "لا توجد مواعيد متبقية اليوم": ["Plus de rendez-vous aujourd'hui", "No more events today", "No quedan citas hoy"], "التالي:": ["Suivant :", "Next:", "Siguiente:"],
    "الوقت المخطط اليوم": ["Temps planifié aujourd'hui", "Time planned today", "Tiempo planificado hoy"], "منبهات مفعّلة": ["Alarmes actives", "Active alarms", "Alarmas activas"],
    "ترنّ عندما تكون الصفحة مفتوحة": ["Sonnent quand l'app est ouverte", "Ring while the app is open", "Suenan con la app abierta"], "ترنّ حتى لو كان التطبيق مغلقًا": ["Sonnent même app fermée", "Ring even when the app is closed", "Suenan aunque la app esté cerrada"],
    "مصاريف هذا الشهر": ["Dépenses du mois", "This month's spending", "Gastos de este mes"], "مقارنة بالشهر السابق": ["par rapport au mois précédent", "vs. last month", "respecto al mes anterior"],
    "الوقت المخطط في الأسبوع": ["Temps planifié de la semaine", "Time planned this week", "Tiempo planificado en la semana"], "ساعات الأسبوع": ["Heures de la semaine", "Weekly hours", "Horas de la semana"],
    "المعدل اليومي": ["Moyenne par jour", "Daily average", "Media diaria"], "برنامج اليوم": ["Programme du jour", "Today's schedule", "Programa de hoy"], "فتح الأجندة": ["Ouvrir l'agenda", "Open planner", "Abrir agenda"],
    "لا توجد مواعيد اليوم.": ["Aucun rendez-vous aujourd'hui.", "No events today.", "No hay citas hoy."], "النشاط": ["Activité", "Activity", "Actividad"], "منبه": ["Alarme", "Alarm", "Alarma"],
    "مصاريف هذا الشهر حسب الفئة": ["Dépenses du mois par catégorie", "This month's spending by category", "Gastos del mes por categoría"],
    "لا توجد مصاريف مسجلة هذا الشهر. أضفها من صفحة «المصاريف».": ["Aucune dépense ce mois-ci. Ajoutez-en depuis la page « Dépenses ».", "No spending recorded this month. Add it from the Expenses page.", "No hay gastos este mes. Añádelos desde la página «Gastos»."],
    "🔔 فواتير يجب أداؤها": ["🔔 Factures à payer", "🔔 Bills to pay", "🔔 Facturas por pagar"], "كل الفواتير": ["Toutes les factures", "All bills", "Todas las facturas"],
    "🍽 الوجبات والأدوية اليوم": ["🍽 Repas et médicaments du jour", "🍽 Today's meals & medicines", "🍽 Comidas y medicamentos de hoy"],
    "أنهيت كل شيء لليوم ✓": ["Tout est fait pour aujourd'hui ✓", "All done for today ✓", "Todo hecho por hoy ✓"], "إخفاء المنتهية": ["Masquer les terminés", "Hide completed", "Ocultar completados"],
    "فات": ["Passé", "Missed", "Pasado"], "انتهيت من الوجبة": ["Repas terminé", "Meal done", "Comida hecha"], "لم تحدد محتوى الوجبة": ["Contenu du repas non défini", "Meal content not set", "Contenido no definido"],

    // ---- Horloge / barre
    "سيُذكّرك بعد 5 دقائق": ["Rappel dans 5 min", "Reminder in 5 min", "Recordatorio en 5 min"],

    // ---- Mes données
    "الطول (cm)": ["Taille (cm)", "Height (cm)", "Altura (cm)"], "الوزن (kg)": ["Poids (kg)", "Weight (kg)", "Peso (kg)"], "تاريخ الازدياد": ["Date de naissance", "Date of birth", "Fecha de nacimiento"],
    "الطول": ["Taille", "Height", "Altura"], "الوزن": ["Poids", "Weight", "Peso"], "العمر": ["Âge", "Age", "Edad"], "الجنس": ["Sexe", "Sex", "Sexo"], "ذكر": ["Homme", "Male", "Hombre"], "أنثى": ["Femme", "Female", "Mujer"],
    "الهدف": ["Objectif", "Goal", "Objetivo"], "زيادة الوزن": ["Prise de poids", "Gain weight", "Ganar peso"], "الحفاظ": ["Maintien", "Maintain", "Mantener"], "نقص الوزن": ["Perte de poids", "Lose weight", "Perder peso"],
    "الحفاظ على الوزن": ["Maintien du poids", "Maintain weight", "Mantener el peso"],
    "قليل (عمل مكتبي)": ["Faible (travail de bureau)", "Low (desk job)", "Baja (trabajo de oficina)"], "خفيف (1–3 مرات أسبوعيًا)": ["Léger (1–3 fois/sem.)", "Light (1–3×/week)", "Ligera (1–3 veces/sem.)"],
    "متوسط (3–5 مرات)": ["Modéré (3–5 fois)", "Moderate (3–5×)", "Moderada (3–5 veces)"], "مرتفع (6–7 مرات)": ["Élevé (6–7 fois)", "High (6–7×)", "Alta (6–7 veces)"], "مرتفع جدًا (عمل بدني + تدريب)": ["Très élevé (travail physique + sport)", "Very high (manual work + training)", "Muy alta (trabajo físico + entreno)"],
    "قليل": ["Faible", "Low", "Baja"], "خفيف": ["Léger", "Light", "Ligera"], "متوسط": ["Modéré", "Moderate", "Moderada"], "مرتفع": ["Élevé", "High", "Alta"], "مرتفع جدًا": ["Très élevé", "Very high", "Muy alta"],
    "احسب واحفظ": ["Calculer et enregistrer", "Calculate & save", "Calcular y guardar"], "✎ تعديل المعطيات": ["✎ Modifier mes données", "✎ Edit my data", "✎ Editar mis datos"],
    "أدخل الطول والوزن وتاريخ الازدياد لعرض حالتك.": ["Saisissez taille, poids et date de naissance pour voir votre état.", "Enter height, weight and date of birth to see your status.", "Introduce altura, peso y fecha de nacimiento para ver tu estado."],
    "وزن ناقص": ["Insuffisance pondérale", "Underweight", "Bajo peso"], "وزن طبيعي": ["Poids normal", "Normal weight", "Peso normal"], "وزن زائد": ["Surpoids", "Overweight", "Sobrepeso"], "سمنة": ["Obésité", "Obesity", "Obesidad"],
    "ضمن المجال الطبيعي بالنسبة لطولك.": ["Dans la plage normale pour votre taille.", "Within the normal range for your height.", "Dentro del rango normal para tu altura."],
    "الوزن الطبيعي": ["Poids normal", "Healthy weight", "Peso saludable"], "الحفاظ على الوزن (TDEE)": ["Maintien (TDEE)", "Maintenance (TDEE)", "Mantenimiento (TDEE)"], "الأيض الأساسي (BMR)": ["Métabolisme de base (BMR)", "Basal metabolism (BMR)", "Metabolismo basal (BMR)"],
    "الماء يوميًا": ["Eau par jour", "Water per day", "Agua al día"], "من الشرب والطعام (EFSA)": ["boissons + aliments (EFSA)", "drinks + food (EFSA)", "bebidas + alimentos (EFSA)"], "حسب مستوى نشاطك": ["selon votre activité", "based on your activity", "según tu actividad"],
    "يوميًا": ["par jour", "per day", "al día"], "العمر · الطول": ["Âge · Taille", "Age · Height", "Edad · Altura"],
    "السعرات لزيادة الوزن": ["Calories pour prendre du poids", "Calories to gain weight", "Calorías para ganar peso"], "السعرات للحفاظ على الوزن": ["Calories de maintien", "Calories to maintain", "Calorías de mantenimiento"], "السعرات لإنقاص الوزن": ["Calories pour perdre du poids", "Calories to lose weight", "Calorías para perder peso"],
    "تقديرات عامة للبالغين وليست تشخيصًا طبيًا. لا يميّز IMC بين العضلات والدهون.": ["Estimations générales pour adultes, pas un diagnostic médical. L'IMC ne distingue pas muscle et graisse.", "General estimates for adults, not a medical diagnosis. BMI doesn't distinguish muscle from fat.", "Estimaciones generales para adultos, no un diagnóstico médico. El IMC no distingue músculo y grasa."],
    "النشاط · الهدف": ["Activité · Objectif", "Activity · Goal", "Actividad · Objetivo"],

    // ---- Agenda
    "+ موعد جديد": ["+ Nouveau rendez-vous", "+ New event", "+ Nueva cita"], "موعد جديد": ["Nouveau rendez-vous", "New event", "Nueva cita"], "تعديل الموعد": ["Modifier le rendez-vous", "Edit event", "Editar cita"],
    "نسخ اليوم السابق": ["Copier la veille", "Copy previous day", "Copiar día anterior"], "المواعيد": ["Rendez-vous", "Events", "Citas"], "الوقت المخطط": ["Temps planifié", "Planned time", "Tiempo planificado"],
    "منبهات": ["Alarmes", "Alarms", "Alarmas"], "تداخل في الوقت": ["Chevauchements", "Overlaps", "Solapamientos"], "تداخل": ["Chevauchement", "Overlap", "Solapamiento"],
    "جدول المواعيد": ["Liste des rendez-vous", "Event list", "Lista de citas"], "البداية": ["Début", "Start", "Inicio"], "النهاية": ["Fin", "End", "Fin"], "التكرار": ["Répétition", "Repeat", "Repetición"],
    "مثال: تدريب في القاعة": ["ex. séance à la salle", "e.g. gym session", "ej. sesión de gimnasio"], "ساعة المنبه بالضبط": ["Heure exacte de l'alarme", "Exact alarm time", "Hora exacta de la alarma"],
    "التكرار خلال الموعد": ["Répéter pendant le rendez-vous", "Repeat during the event", "Repetir durante la cita"], "النغمة": ["Sonnerie", "Ringtone", "Tono"], "▶ استماع": ["▶ Écouter", "▶ Listen", "▶ Escuchar"], "استمع إلى النغمة": ["Écouter la sonnerie", "Listen to ringtone", "Escuchar el tono"],
    "بدون تكرار": ["Pas de répétition", "No repeat", "Sin repetición"], "كل يوم": ["Tous les jours", "Every day", "Todos los días"], "أيام العمل (الإثنين–الجمعة)": ["Jours ouvrables (lun–ven)", "Weekdays (Mon–Fri)", "Laborables (lun–vie)"],
    "كل أسبوع": ["Chaque semaine", "Every week", "Cada semana"], "أيام العمل": ["Jours ouvrables", "Weekdays", "Laborables"], "يوميًا ": ["chaque jour", "daily", "diario"], "أسبوعيًا": ["hebdomadaire", "weekly", "semanal"],
    "مرة واحدة": ["Une fois", "Once", "Una vez"], "كل 5 دقائق": ["Toutes les 5 min", "Every 5 min", "Cada 5 min"], "كل 10 دقائق": ["Toutes les 10 min", "Every 10 min", "Cada 10 min"], "كل 15 دقيقة": ["Toutes les 15 min", "Every 15 min", "Cada 15 min"],
    "كل 20 دقيقة": ["Toutes les 20 min", "Every 20 min", "Cada 20 min"], "كل 30 دقيقة": ["Toutes les 30 min", "Every 30 min", "Cada 30 min"], "كل ساعة": ["Toutes les heures", "Every hour", "Cada hora"],
    "كلاسيكي": ["Classique", "Classic", "Clásico"], "جرس": ["Cloche", "Bell", "Campana"], "هادئ": ["Doux", "Soft", "Suave"], "رقمي": ["Digital", "Digital", "Digital"], "تصاعدي": ["Montant", "Rising", "Ascendente"],
    "نغمة الهاتف": ["Son du téléphone", "Phone sound", "Sonido del teléfono"], "📱 اختيار من نغمات الهاتف…": ["📱 Choisir une sonnerie du téléphone…", "📱 Pick a phone ringtone…", "📱 Elegir un tono del teléfono…"],
    "نغمة من الهاتف": ["Sonnerie du téléphone", "Phone ringtone", "Tono del teléfono"], "(تغيير…)": ["(changer…)", "(change…)", "(cambiar…)"], "تغيير…": ["changer…", "change…", "cambiar…"],
    "حذف كل التكرارات": ["Supprimer toutes les répétitions", "Delete all repeats", "Eliminar todas las repeticiones"],
    "لا توجد مواعيد في هذا اليوم. املأ النموذج واضغط «إضافة».": ["Aucun rendez-vous ce jour. Remplissez le formulaire et appuyez sur « Ajouter ».", "No events this day. Fill in the form and tap Add.", "No hay citas este día. Rellena el formulario y pulsa «Añadir»."],
    "لا توجد مواعيد في اليوم السابق": ["Aucun rendez-vous la veille", "No events on the previous day", "No hay citas el día anterior"],
    "يرنّ المنبه في الهاتف عند ساعة البداية حتى لو كان التطبيق مغلقًا. في المرة الأولى سيطلب منك التطبيق إذن الإشعارات.": ["L'alarme sonne sur le téléphone à l'heure prévue, même app fermée. La première fois, l'app demandera l'autorisation des notifications.", "The alarm rings on the phone at the set time, even when the app is closed. The first time, the app will ask for notification permission.", "La alarma suena en el teléfono a la hora fijada, aunque la app esté cerrada. La primera vez pedirá permiso de notificaciones."],
    "يرنّ المنبه ويظهر في الأعلى عندما تكون الصفحة مفتوحة. في تطبيق Android يرنّ حتى لو كان التطبيق مغلقًا.": ["L'alarme sonne et s'affiche quand la page est ouverte. Dans l'app Android, elle sonne même app fermée.", "The alarm rings and shows at the top while the page is open. In the Android app it rings even when closed.", "La alarma suena y aparece arriba con la página abierta. En la app Android suena aunque esté cerrada."],
    "اكتب النشاط": ["Indiquez l'activité", "Enter the activity", "Escribe la actividad"], "يجب أن تكون ساعة البداية بصيغة 08:30": ["L'heure de début doit être au format 08:30", "Start time must look like 08:30", "La hora de inicio debe ser como 08:30"],
    "يجب أن تكون ساعة النهاية بصيغة 09:30": ["L'heure de fin doit être au format 09:30", "End time must look like 09:30", "La hora de fin debe ser como 09:30"], "يجب أن تكون ساعة النهاية بعد ساعة البداية": ["L'heure de fin doit être après le début", "End time must be after start", "La hora de fin debe ser posterior al inicio"],
    "وقت المنبه غير صحيح": ["Heure d'alarme invalide", "Invalid alarm time", "Hora de alarma no válida"], "يجب أن يكون وقت المنبه قبل نهاية الموعد": ["L'alarme doit être avant la fin du rendez-vous", "Alarm must be before the event ends", "La alarma debe ser antes del fin de la cita"],
    "حان الموعد": ["C'est l'heure", "It's time", "Es la hora"], "الموعد": ["Rendez-vous", "Event", "Cita"], "⏰ تذكير": ["⏰ Rappel", "⏰ Reminder", "⏰ Recordatorio"],
    "تذكير بعد 5 دقائق": ["Rappel dans 5 min", "Remind in 5 min", "Recordar en 5 min"], "إيقاف": ["Arrêter", "Stop", "Detener"], "تذكير بعد 5 د": ["Rappel 5 min", "Snooze 5 min", "Posponer 5 min"],
    "تذكير مؤجَّل 5 دقائق": ["Rappel reporté de 5 min", "Snoozed 5 min", "Pospuesto 5 min"], "منبهات الأجندة": ["Alarmes de l'agenda", "Planner alarms", "Alarmas de la agenda"],
    "المنبهات معطّلة: فعّل الإشعارات من الإعدادات": ["Alarmes désactivées : activez les notifications dans les réglages", "Alarms off: enable notifications in settings", "Alarmas desactivadas: activa las notificaciones en ajustes"],
    "تعذّرت برمجة المنبه": ["Impossible de programmer l'alarme", "Couldn't schedule the alarm", "No se pudo programar la alarma"], "تعذّرت برمجة المنبه المتكرر": ["Impossible de programmer l'alarme répétée", "Couldn't schedule the repeating alarm", "No se pudo programar la alarma repetida"],
    "تعذّر فتح نغمات الهاتف": ["Impossible d'ouvrir les sonneries", "Couldn't open phone ringtones", "No se pudieron abrir los tonos"], "اختر نغمة المنبه": ["Choisir la sonnerie", "Choose alarm ringtone", "Elegir tono de alarma"],

    // ---- Repas et médicaments
    "🍽 الوجبات والأدوية": ["🍽 Repas et médicaments", "🍽 Meals & medicines", "🍽 Comidas y medicamentos"], "الوجبات اليومية": ["Repas quotidiens", "Daily meals", "Comidas diarias"],
    "عدد الوجبات": ["Nombre de repas", "Number of meals", "Número de comidas"], "الوجبة": ["Repas", "Meal", "Comida"], "الفطور": ["Petit-déjeuner", "Breakfast", "Desayuno"], "الغداء": ["Déjeuner", "Lunch", "Almuerzo"],
    "العشاء": ["Dîner", "Dinner", "Cena"], "اللمجة": ["Goûter", "Snack", "Merienda"], "وجبة خفيفة صباحية": ["Collation du matin", "Morning snack", "Tentempié de mañana"], "وجبة قبل النوم": ["Collation du soir", "Bedtime snack", "Tentempié nocturno"],
    "اسم الوجبة": ["Nom du repas", "Meal name", "Nombre de la comida"], "وقت الوجبة": ["Heure du repas", "Meal time", "Hora de la comida"], "محتوى الوجبة": ["Contenu du repas", "Meal content", "Contenido de la comida"],
    "ماذا ستأكل؟ مثال: بيض، خبز كامل، موز": ["Qu'allez-vous manger ? ex. œufs, pain complet, banane", "What will you eat? e.g. eggs, wholegrain bread, banana", "¿Qué vas a comer? ej. huevos, pan integral, plátano"],
    "حان وقت الوجبة": ["C'est l'heure du repas", "Time for your meal", "Hora de comer"], "الأدوية والمكملات": ["Médicaments et compléments", "Medicines & supplements", "Medicamentos y suplementos"],
    "إضافة دواء أو مكمل": ["Ajouter un médicament ou complément", "Add a medicine or supplement", "Añadir medicamento o suplemento"], "تعديل الدواء أو المكمل": ["Modifier le médicament ou complément", "Edit medicine or supplement", "Editar medicamento o suplemento"],
    "مثال: Vitamine D، Créatine": ["ex. Vitamine D, Créatine", "e.g. Vitamin D, Creatine", "ej. Vitamina D, Creatina"], "دواء": ["Médicament", "Medicine", "Medicamento"], "مكمل غذائي": ["Complément alimentaire", "Supplement", "Suplemento"], "مكمل": ["Complément", "Supplement", "Suplemento"],
    "الجرعة": ["Dose", "Dose", "Dosis"], "مثال: قرص واحد، 5 g": ["ex. 1 comprimé, 5 g", "e.g. 1 tablet, 5 g", "ej. 1 comprimido, 5 g"], "المدة بالأيام": ["Durée (jours)", "Duration (days)", "Duración (días)"], "0 = مستمر": ["0 = continu", "0 = ongoing", "0 = continuo"],
    "تاريخ البداية": ["Date de début", "Start date", "Fecha de inicio"], "أوقات التناول": ["Heures de prise", "Intake times", "Horas de toma"], "+ إضافة وقت": ["+ Ajouter une heure", "+ Add time", "+ Añadir hora"], "لم تُضف أي وقت بعد": ["Aucune heure ajoutée", "No time added yet", "Aún no hay horas"],
    "تنبيه في كل وقت": ["Alarme à chaque prise", "Alarm at each time", "Alarma en cada toma"], "الأوقات": ["Heures", "Times", "Horas"], "مستمر": ["continu", "ongoing", "continuo"],
    "لا توجد أدوية أو مكملات. أضفها من النموذج أدناه.": ["Aucun médicament ou complément. Ajoutez-en ci-dessous.", "No medicines or supplements. Add them below.", "No hay medicamentos ni suplementos. Añádelos abajo."],
    "المعلومات هنا للتنظيم والتذكير فقط. اتبع دائمًا الجرعة التي حددها الطبيب أو الصيدلي.": ["Pour l'organisation et les rappels uniquement. Suivez toujours la dose prescrite par votre médecin ou pharmacien.", "For organizing and reminders only. Always follow the dose set by your doctor or pharmacist.", "Solo para organizar y recordar. Sigue siempre la dosis indicada por tu médico o farmacéutico."],
    "تم التناول": ["Pris", "Taken", "Tomado"], "تذكير بعد 10 دقائق": ["Rappel dans 10 min", "Remind in 10 min", "Recordar en 10 min"], "حان وقت التناول": ["C'est l'heure de la prise", "Time to take it", "Hora de tomarlo"], "سُجّل التناول ✓": ["Prise enregistrée ✓", "Intake recorded ✓", "Toma registrada ✓"],
    "أدخل اسم الدواء أو المكمل": ["Saisissez le nom", "Enter the name", "Introduce el nombre"], "أضف وقتًا واحدًا على الأقل": ["Ajoutez au moins une heure", "Add at least one time", "Añade al menos una hora"], "أحد الأوقات غير صحيح": ["Une heure est invalide", "One time is invalid", "Una hora no es válida"],
    "اختر التكرار": ["Choisissez la répétition", "Choose the repeat", "Elige la repetición"], "المدة بين 0 و365 يومًا (0 = مستمر)": ["Durée entre 0 et 365 jours (0 = continu)", "Duration 0–365 days (0 = ongoing)", "Duración entre 0 y 365 días (0 = continuo)"],

    // ---- Dépenses
    "مجموع الشهر": ["Total du mois", "Month total", "Total del mes"], "أكبر فئة": ["Plus grosse catégorie", "Top category", "Mayor categoría"], "لا توجد بيانات": ["Pas de données", "No data", "Sin datos"],
    "إضافة مصروف": ["Ajouter une dépense", "Add an expense", "Añadir gasto"], "الفئة": ["Catégorie", "Category", "Categoría"], "المبلغ (درهم)": ["Montant (DH)", "Amount (DH)", "Importe (DH)"], "المبلغ": ["Montant", "Amount", "Importe"],
    "👇 اختر الفئة من الخانات أسفله": ["👇 Choisissez la catégorie dans les cases ci-dessous", "👇 Pick a category from the tiles below", "👇 Elige la categoría en las casillas de abajo"],
    "إضافة نفس المبلغ مرة أخرى:": ["Ajouter le même montant :", "Add the same amount again:", "Añadir el mismo importe:"],
    "🔔 التزام متكرر (فاتورة، كراء، اشتراك، تأمين…)": ["🔔 Échéance récurrente (facture, loyer, abonnement, assurance…)", "🔔 Recurring bill (utility, rent, subscription, insurance…)", "🔔 Pago recurrente (factura, alquiler, suscripción, seguro…)"],
    "الدورية": ["Fréquence", "Frequency", "Frecuencia"], "شهري": ["Mensuel", "Monthly", "Mensual"], "سنوي": ["Annuel", "Yearly", "Anual"], "يوم الاستحقاق من كل شهر": ["Jour d'échéance du mois", "Due day of the month", "Día de vencimiento del mes"],
    "تاريخ الاستحقاق": ["Date d'échéance", "Due date", "Fecha de vencimiento"], "التنبيه قبل (أيام)": ["Alerte avant (jours)", "Alert before (days)", "Aviso antes (días)"], "مثال: الكراء": ["ex. Loyer", "e.g. Rent", "ej. Alquiler"],
    "أدّيته الآن (يُسجَّل كمصروف اليوم)": ["Déjà payé (enregistré comme dépense du jour)", "Paid now (recorded as today's expense)", "Pagado ahora (se registra como gasto de hoy)"], "حفظ الالتزام": ["Enregistrer l'échéance", "Save bill", "Guardar pago"],
    "المصاريف حسب الفئة": ["Dépenses par catégorie", "Spending by category", "Gastos por categoría"], "فئة جديدة": ["Nouvelle catégorie", "New category", "Nueva categoría"], "إضافة فئة": ["Ajouter", "Add", "Añadir"], "حذف الفئة": ["Supprimer la catégorie", "Delete category", "Eliminar categoría"],
    "خاصة": ["perso", "custom", "propia"], "تنبيه بالاستحقاق": ["Alerte d'échéance", "Due-date alert", "Aviso de vencimiento"], "إضافة مصروف": ["Ajouter une dépense", "Add an expense", "Añadir gasto"],
    "تُحفظ المصاريف في الهاتف فقط. يمكنك إضافة فئات خاصة بك داخل كل مجموعة، أو حذف أي فئة بزر 🗑.": ["Les dépenses sont enregistrées sur le téléphone uniquement. Ajoutez vos propres catégories dans chaque groupe, ou supprimez-en avec 🗑.", "Expenses are saved on the phone only. Add your own categories in each group, or delete any with 🗑.", "Los gastos se guardan solo en el teléfono. Añade tus categorías en cada grupo o elimina cualquiera con 🗑."],
    "التاريخ غير صحيح": ["Date invalide", "Invalid date", "Fecha no válida"], "اختر الفئة": ["Choisissez la catégorie", "Choose the category", "Elige la categoría"], "أدخل مبلغًا صحيحًا بالدرهم": ["Saisissez un montant valide en DH", "Enter a valid amount in DH", "Introduce un importe válido en DH"],
    // groupes et sous-catégories
    "السكن": ["Logement", "Housing", "Vivienda"], "الكراء": ["Loyer", "Rent", "Alquiler"], "الماء والكهرباء": ["Eau et électricité", "Water & electricity", "Agua y luz"], "الإنترنت والهاتف": ["Internet et téléphone", "Internet & phone", "Internet y teléfono"],
    "الاشتراكات": ["Abonnements", "Subscriptions", "Suscripciones"], "القاعة الرياضية": ["Salle de sport", "Gym", "Gimnasio"], "اشتراكات رقمية": ["Abonnements numériques", "Digital subscriptions", "Suscripciones digitales"], "اشتراكات أخرى": ["Autres abonnements", "Other subscriptions", "Otras suscripciones"],
    "التغذية": ["Alimentation", "Food", "Alimentación"], "الخضر": ["Légumes", "Vegetables", "Verduras"], "الفواكه": ["Fruits", "Fruit", "Frutas"], "اللحوم والدواجن والأسماك": ["Viande, volaille, poisson", "Meat, poultry & fish", "Carne, aves y pescado"],
    "الحليب ومشتقاته والبيض": ["Produits laitiers et œufs", "Dairy & eggs", "Lácteos y huevos"], "الخبز والحبوب": ["Pain et céréales", "Bread & grains", "Pan y cereales"], "البقالة": ["Épicerie", "Groceries", "Comestibles"], "الأكل خارج المنزل": ["Repas à l'extérieur", "Eating out", "Comer fuera"],
    "الصحة": ["Santé", "Health", "Salud"], "الطبيب": ["Médecin", "Doctor", "Médico"], "الصيدلية والأدوية": ["Pharmacie et médicaments", "Pharmacy & medicines", "Farmacia y medicamentos"], "التحاليل": ["Analyses", "Lab tests", "Análisis"], "المكملات الغذائية": ["Compléments alimentaires", "Supplements", "Suplementos"],
    "العناية الشخصية": ["Soins personnels", "Personal care", "Cuidado personal"], "الحلاق": ["Coiffeur", "Barber", "Peluquería"], "منتجات النظافة والعناية": ["Hygiène et soins", "Hygiene & care products", "Higiene y cuidado"],
    "التكوين والتعليم": ["Formation et études", "Training & education", "Formación y estudios"], "الدورات التكوينية": ["Formations", "Courses", "Cursos"], "الكتب": ["Livres", "Books", "Libros"],
    "النقل": ["Transport", "Transport", "Transporte"], "الوقود": ["Carburant", "Fuel", "Combustible"], "النقل العمومي وسيارات الأجرة": ["Transports publics et taxis", "Public transport & taxis", "Transporte público y taxis"], "صيانة السيارة": ["Entretien voiture", "Car maintenance", "Mantenimiento del coche"],
    "التأمين": ["Assurance", "Insurance", "Seguros"], "التأمين الصحي": ["Assurance santé", "Health insurance", "Seguro médico"], "تأمين السيارة": ["Assurance auto", "Car insurance", "Seguro del coche"], "تأمينات أخرى": ["Autres assurances", "Other insurance", "Otros seguros"],
    "أخرى": ["Autres", "Other", "Otros"], "الملابس": ["Vêtements", "Clothes", "Ropa"], "الترفيه": ["Loisirs", "Leisure", "Ocio"], "متفرقات": ["Divers", "Miscellaneous", "Varios"],

    // ---- Liste de courses
    "🛒 للشراء": ["🛒 À acheter", "🛒 To buy", "🛒 Por comprar"], "القائمة": ["Liste", "List", "Lista"], "ماذا نفد؟ مثال: بطاطس، لحم، حليب": ["Qu'est-ce qui manque ? ex. pommes de terre, viande, lait", "What ran out? e.g. potatoes, meat, milk", "¿Qué se acabó? ej. patatas, carne, leche"],
    "الكمية": ["Quantité", "Qty", "Cantidad"], "+ أضف": ["+ Ajouter", "+ Add", "+ Añadir"], "المادة": ["Article", "Item", "Artículo"], "اشتريته": ["Acheté", "Bought", "Comprado"],
    "الثمن (اختياري)": ["Prix (facultatif)", "Price (optional)", "Precio (opcional)"], "الثمن": ["Prix", "Price", "Precio"], "تم الشراء": ["Acheté", "Bought", "Comprado"],
    "نفد مرة أخرى:": ["Encore épuisé :", "Ran out again:", "Se acabó otra vez:"], "موجود في القائمة": ["Déjà dans la liste", "Already on the list", "Ya está en la lista"], "أُضيف إلى قائمة الشراء ✓": ["Ajouté à la liste ✓", "Added to the list ✓", "Añadido a la lista ✓"],
    "لا شيء للشراء الآن. عندما ينفد شيء، أضفه هنا ليذكّرك في لوحة القيادة.": ["Rien à acheter. Quand quelque chose manque, ajoutez-le ici : il apparaîtra sur le tableau de bord.", "Nothing to buy right now. When something runs out, add it here and it will show on the dashboard.", "Nada que comprar. Cuando algo se acabe, añádelo aquí y aparecerá en el panel."],
    // ---- Rapport mensuel
    "التقرير الشهري": ["Rapport mensuel", "Monthly report", "Informe mensual"], "التقرير": ["Rapport", "Report", "Informe"], "الفترة": ["Période", "Period", "Periodo"],
    "الأسبوع": ["Semaine", "Week", "Semana"], "الشهر": ["Mois", "Month", "Mes"], "السنة": ["Année", "Year", "Año"], "فترة مخصصة": ["Période libre", "Custom range", "Periodo libre"], "إلى": ["Au", "To", "Hasta"],
    "مقارنة بالفترة السابقة": ["vs période précédente", "vs previous period", "vs periodo anterior"], "الفترة السابقة": ["Période précédente", "Previous period", "Periodo anterior"], "الفترة التالية": ["Période suivante", "Next period", "Periodo siguiente"],
    "اختر أي فترة: أسبوع أو شهر أو سنة أو من تاريخ إلى تاريخ. يُقارَن التقرير بالفترة السابقة من نفس المدة، ويمكنك نسخه ولصقه في رسالة أو ملاحظة.": ["Choisissez une période : semaine, mois, année ou dates libres. Le rapport est comparé à la période précédente de même durée ; vous pouvez le copier dans un message.", "Pick any period: week, month, year or a custom range. The report is compared with the previous period of the same length, and you can copy it into a message.", "Elige un periodo: semana, mes, año o fechas libres. Se compara con el periodo anterior de igual duración y puedes copiarlo en un mensaje."], "📋 نسخ التقرير": ["📋 Copier le rapport", "📋 Copy report", "📋 Copiar informe"], "مجموع المصاريف": ["Total des dépenses", "Total spending", "Gasto total"],
    "أكثر يوم إنفاقًا": ["Jour le plus dépensier", "Highest-spending day", "Día de más gasto"], "التوزيع حسب الفئة": ["Répartition par catégorie", "Breakdown by category", "Reparto por categoría"],
    "التصنيف": ["Sous-catégorie", "Subcategory", "Subcategoría"], "عدد": ["Nb", "Count", "Nº"], "الفرق": ["Écart", "Change", "Diferencia"], "(جارٍ)": ["(en cours)", "(in progress)", "(en curso)"],
    "لا توجد مصاريف مسجلة في هذا الشهر.": ["Aucune dépense enregistrée ce mois-ci.", "No spending recorded this month.", "No hay gastos registrados este mes."], "نُسخ التقرير ✓": ["Rapport copié ✓", "Report copied ✓", "Informe copiado ✓"],
    "اضغط لعرض التقرير المفصل لكل فئة وتصنيف": ["Touchez pour voir le rapport détaillé par catégorie", "Tap to see the detailed report by category", "Pulsa para ver el informe detallado por categoría"],
    "يُحسب التقرير من المصاريف المسجلة في الهاتف. يمكنك نسخه ولصقه في رسالة أو ملاحظة.": ["Le rapport est calculé à partir des dépenses enregistrées. Vous pouvez le copier dans un message ou une note.", "The report is built from the expenses on your phone. You can copy it into a message or note.", "El informe se calcula con los gastos guardados. Puedes copiarlo en un mensaje o una nota."],
    // ---- Échéances
    "🔔 الفواتير والالتزامات الدورية": ["🔔 Factures et échéances", "🔔 Bills & recurring payments", "🔔 Facturas y pagos fijos"], "قائمة الالتزامات": ["Liste des échéances", "Bill list", "Lista de pagos"], "مرتبة حسب أقرب استحقاق": ["Triées par échéance", "Sorted by due date", "Ordenadas por vencimiento"],
    "قريبة الاستحقاق": ["Bientôt dues", "Due soon", "Vencen pronto"], "داخل الهامش": ["dans la marge", "within margin", "dentro del margen"], "متأخرة": ["En retard", "Overdue", "Atrasadas"], "لم تُدفع بعد": ["pas encore payées", "not paid yet", "aún sin pagar"],
    "مستحق خلال 30 يومًا": ["Dû sous 30 jours", "Due within 30 days", "Vence en 30 días"], "تم الأداء": ["Payé", "Paid", "Pagado"], "مدفوع": ["Payé", "Paid", "Pagado"], "تعديل الالتزام": ["Modifier l'échéance", "Edit bill", "Editar pago"],
    "التزام جديد": ["Nouvelle échéance", "New bill", "Nuevo pago"], "فئة المصروف": ["Catégorie de dépense", "Expense category", "Categoría de gasto"], "إلغاء آخر أداء": ["Annuler le dernier paiement", "Undo last payment", "Deshacer último pago"],
    "مثال: تأمين السيارة، كراء، تكوين": ["ex. assurance auto, loyer, formation", "e.g. car insurance, rent, course", "ej. seguro del coche, alquiler, curso"], "الالتزامات والمدفوعات": ["Échéances et paiements", "Bills & payments", "Pagos y vencimientos"], "تذكير بمواعيد الدفع": ["Rappels de paiement", "Payment reminders", "Recordatorios de pago"],
    "حان موعد الدفع": ["C'est le jour du paiement", "Payment due today", "Hoy toca pagar"], "أُلغي آخر أداء ✓": ["Dernier paiement annulé ✓", "Last payment undone ✓", "Último pago deshecho ✓"],
    "لا توجد التزامات بعد. فعّل «🔔 التزام متكرر» في نموذج «إضافة مصروف» أو اضغط 🔔 في أي فئة.": ["Aucune échéance. Activez « 🔔 Échéance récurrente » dans « Ajouter une dépense » ou appuyez sur 🔔 dans une catégorie.", "No bills yet. Turn on “🔔 Recurring bill” in “Add an expense” or tap 🔔 in any category.", "Aún no hay pagos. Activa «🔔 Pago recurrente» en «Añadir gasto» o pulsa 🔔 en una categoría."],
    "عندما يحين موعد فاتورة أو تدخل في هامش التنبيه أو تتأخر، تظهر في لوحة القيادة وتبقى حتى تضغط «تم الأداء»، فيُسجَّل المبلغ في المصاريف تلقائيًا. يمكنك أيضًا الضغط على 🔔 في أي فئة لإضافة تنبيه لها.": ["Quand une facture arrive à échéance, entre dans sa marge d'alerte ou est en retard, elle apparaît sur le tableau de bord jusqu'à ce que vous appuyiez sur « Payé » ; le montant est alors ajouté aux dépenses. Vous pouvez aussi appuyer sur 🔔 dans une catégorie.", "When a bill is due, inside its alert margin or overdue, it shows on the dashboard until you tap “Paid”, and the amount is added to your expenses. You can also tap 🔔 in any category.", "Cuando una factura vence, entra en su margen de aviso o se atrasa, aparece en el panel hasta que pulses «Pagado» y el importe se añade a tus gastos. También puedes pulsar 🔔 en cualquier categoría."],
    "أدخل اسم الالتزام": ["Saisissez le nom", "Enter the name", "Introduce el nombre"], "اختر الدورية": ["Choisissez la fréquence", "Choose the frequency", "Elige la frecuencia"], "يوم الاستحقاق بين 1 و31": ["Jour d'échéance entre 1 et 31", "Due day between 1 and 31", "Día entre 1 y 31"],
    "أدخل تاريخ الاستحقاق": ["Saisissez la date d'échéance", "Enter the due date", "Introduce la fecha de vencimiento"], "الهامش بين 0 و60 يومًا": ["Marge entre 0 et 60 jours", "Margin 0–60 days", "Margen entre 0 y 60 días"],
    "الحالة": ["État", "Status", "Estado"], "الاستحقاق": ["Échéance", "Due", "Vencimiento"], "الالتزام": ["Échéance", "Bill", "Pago"], "التزام": ["échéance", "bill", "pago"],

    // ---- Sources
    "المصادر المعتمدة": ["Sources utilisées", "Sources used", "Fuentes utilizadas"], "المصدر": ["Source", "Source", "Fuente"], "ما نأخذه منه": ["Ce qu'on en tire", "What we use it for", "Para qué la usamos"], "الرابط": ["Lien", "Link", "Enlace"],
    "الحاجة اليومية، UL، أعراض النقص، التداخلات": ["Besoins, UL, carences, interactions", "Needs, UL, deficiency, interactions", "Necesidades, UL, carencias, interacciones"],
    "Créatine وprotéines وcaféine لدى الرياضيين": ["Créatine, protéines et caféine chez le sportif", "Creatine, protein & caffeine in athletes", "Creatina, proteína y cafeína en deportistas"],
    "حدود السلامة الأوروبية (UL، caféine)": ["Limites de sécurité européennes (UL, caféine)", "European safety limits (UL, caffeine)", "Límites de seguridad europeos (UL, cafeína)"], "المواد المحظورة في الرياضة": ["Substances interdites dans le sport", "Substances banned in sport", "Sustancias prohibidas en el deporte"],
  };

  // Modèles avec nombres / parties variables
  const P = [
    [/^بعد (\d+) يوم$/, (m) => ["dans " + m[1] + " j", "in " + m[1] + " days", "en " + m[1] + " días"]],
    [/^متأخر (\d+) يوم$/, (m) => [m[1] + " j de retard", m[1] + " days overdue", m[1] + " días de retraso"]],
    [/^العمر: (\d+) سنة$/, (m) => ["Âge : " + m[1] + " ans", "Age: " + m[1], "Edad: " + m[1] + " años"]],
    [/^\((\d+) سنة\)$/, (m) => ["(" + m[1] + " ans)", "(" + m[1] + " y)", "(" + m[1] + " años)"]],
    [/^(\d+) سنة$/, (m) => [m[1] + " ans", m[1] + " years", m[1] + " años"]],
    [/^(\d+) عملية$/, (m) => [m[1] + " opération(s)", m[1] + " transaction(s)", m[1] + " operación(es)"]],
    [/^(\d+) عنصر$/, (m) => [m[1] + " élément(s)", m[1] + " item(s)", m[1] + " elemento(s)"]],
    [/^(\d+) موعد$/, (m) => [m[1] + " rendez-vous", m[1] + " event(s)", m[1] + " cita(s)"]],
    [/^(\d+)س(?: (\d+)د)?$/, (m) => { const s = m[1] + "h" + (m[2] ? " " + m[2] + "min" : ""); return [s, s, s]; }],
    [/^(\d+)د$/, (m) => [m[1] + " min", m[1] + " min", m[1] + " min"]],
    [/^س \/ 16$/, () => ["h / 16", "h / 16", "h / 16"]],
    [/^(\d+) µg يوميًا$/, (m) => [m[1] + " µg/jour", m[1] + " µg/day", m[1] + " µg/día"]],
    [/^(\d+) mg يوميًا$/, (m) => [m[1] + " mg/jour", m[1] + " mg/day", m[1] + " mg/día"]],
    [/^تنبيه قبل (\d+) يوم$/, (m) => ["alerte " + m[1] + " j avant", "alert " + m[1] + " d before", "aviso " + m[1] + " d antes"]],
    [/^حذف الفئة (.+)$/, (m) => ["Supprimer " + T(m[1], "fr"), "Delete " + T(m[1], "en"), "Eliminar " + T(m[1], "es")]],
    [/^منبه (.+)$/, (m) => ["Alarme " + T(m[1], "fr"), "Alarm " + T(m[1], "en"), "Alarma " + T(m[1], "es")]],
    [/^حذف (\d\d:\d\d)$/, (m) => ["Supprimer " + m[1], "Remove " + m[1], "Quitar " + m[1]]],
    [/^عرض المنتهية \((\d+)\)$/, (m) => ["Afficher les terminés (" + m[1] + ")", "Show completed (" + m[1] + ")", "Mostrar completados (" + m[1] + ")"]],
    [/^سيرنّ المنبه في: (.+)$/, (m) => ["L'alarme sonnera à : " + m[1], "The alarm will ring at: " + m[1], "La alarma sonará a las: " + m[1]]],
    [/^(\d\d:\d\d) ثم (.+)$/, (m) => [m[1] + " puis " + T(m[2], "fr").toLowerCase(), m[1] + " then " + T(m[2], "en").toLowerCase(), m[1] + " luego " + T(m[2], "es").toLowerCase()]],
    [/^أُضيف (.+) درهم ✓$/, (m) => [m[1] + " DH ajoutés ✓", m[1] + " DH added ✓", m[1] + " DH añadidos ✓"]],
    [/^سُجّل دفع «(.+)» ✓$/, (m) => ["Paiement « " + T(m[1], "fr") + " » enregistré ✓", "“" + T(m[1], "en") + "” paid ✓", "Pago «" + T(m[1], "es") + "» registrado ✓"]],
    [/^حُفظ الالتزام · الاستحقاق (.+) ✓$/, (m) => ["Échéance enregistrée · " + T(m[1], "fr") + " ✓", "Bill saved · due " + T(m[1], "en") + " ✓", "Pago guardado · vence " + T(m[1], "es") + " ✓"]],
    [/^سيُذكّرك بعد (\d+) دقائق$/, (m) => ["Rappel dans " + m[1] + " min", "Reminder in " + m[1] + " min", "Recordatorio en " + m[1] + " min"]],
    [/^تذكير بعد (\d+) دقائق$/, (m) => ["Rappel dans " + m[1] + " min", "Remind in " + m[1] + " min", "Recordar en " + m[1] + " min"]],
    [/^الاستحقاق بعد (\d+) يوم \((.+)\)$/, (m) => ["Échéance dans " + m[1] + " j (" + T(m[2], "fr") + ")", "Due in " + m[1] + " days (" + T(m[2], "en") + ")", "Vence en " + m[1] + " días (" + T(m[2], "es") + ")"]],
    [/^≈ (.+) درهم شهريًا$/, (m) => ["≈ " + m[1] + " DH par mois", "≈ " + m[1] + " DH per month", "≈ " + m[1] + " DH al mes"]],
    [/^حتى (.+)$/, (m) => ["jusqu'au " + T(m[1], "fr"), "until " + T(m[1], "en"), "hasta " + T(m[1], "es")]],
    [/^حذف الفئة و(\d+) مصروف؟$/, (m) => ["Supprimer la catégorie et " + m[1] + " dépense(s) ?", "Delete category and " + m[1] + " expense(s)?", "¿Eliminar la categoría y " + m[1] + " gasto(s)?"]],
    [/^([+−]\d+) على الحفاظ$/, (m) => [m[1] + " kcal / maintien", m[1] + " kcal vs maintenance", m[1] + " kcal / mantenimiento"]],
    [/^فئة جديدة في «(.+)»$/, (m) => ["Nouvelle catégorie dans « " + T(m[1], "fr") + " »", "New category in “" + T(m[1], "en") + "”", "Nueva categoría en «" + T(m[1], "es") + "»"]],
    [/^اشتُري «(.+)» · (.+) درهم ✓$/, (m) => ["« " + m[1] + " » acheté · " + m[2] + " DH ✓", "“" + m[1] + "” bought · " + m[2] + " DH ✓", "«" + m[1] + "» comprado · " + m[2] + " DH ✓"]],
    [/^اشتُري «(.+)» ✓$/, (m) => ["« " + m[1] + " » acheté ✓", "“" + m[1] + "” bought ✓", "«" + m[1] + "» comprado ✓"]],
    [/^\+ (.+)$/, (m) => ["+ " + m[1], "+ " + m[1], "+ " + m[1]]],
    [/^تقرير مصاريف (.+) جاهز$/, (m) => ["Rapport des dépenses de " + T(m[1], "fr") + " prêt", T(m[1], "en") + " spending report is ready", "Informe de gastos de " + T(m[1], "es") + " listo"]],
    [/^أكبر مصروف: (.+)$/, (m) => ["Plus grosse dépense : " + T(m[1], "fr"), "Biggest expense: " + T(m[1], "en"), "Mayor gasto: " + T(m[1], "es")]],
    [/^على (\d+) يومًا$/, (m) => ["sur " + m[1] + " jours", "over " + m[1] + " days", "en " + m[1] + " días"]],
    [/^([\d.,]+)% من المجموع$/, (m) => [m[1] + " % du total", m[1] + "% of total", m[1] + " % del total"]],
    [/^الفترة السابقة (.+)$/, (m) => ["Période préc. " + T(m[1], "fr"), "Previous " + T(m[1], "en"), "Periodo ant. " + T(m[1], "es")]],
    [/^الشهر السابق (.+)$/, (m) => ["Mois préc. " + T(m[1], "fr"), "Last month " + T(m[1], "en"), "Mes ant. " + T(m[1], "es")]],
  ];

  const AR = /[\u0600-\u06FF]/;
  let LANG = "ar";
  const exact = (s, i) => (D[s] ? D[s][i] : undefined);
  const WORDS = Object.keys(D).filter((k) => k.length >= 2).sort((a, b) => b.length - a.length);
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let wordRe = null;

  function T(s, lang) {
    lang = lang || LANG;
    if (lang === "ar" || !s || !AR.test(s)) return s;
    const i = IDX[lang];
    const lead = s.match(/^\s*/)[0], trail = s.match(/\s*$/)[0];
    let t = s.trim();
    let r = exact(t, i);
    if (r !== undefined) return lead + r + trail;
    for (const [re, fn] of P) { const m = t.match(re); if (m) return lead + fn(m)[i] + trail; }
    // composites: split on separators and translate pieces
    for (const [re, j0] of [[/\s+·\s+/, " · "], [/\s+—\s+/, " — "], [/\s+›\s+/, " › "], [/\s+→\s+/, " → "], [/،\s*/, ", "], [/\s*:\s+/, ": "]]) {
      if (re.test(t)) {
        const j = j0 === ": " && lang === "fr" ? " : " : j0;
        return lead + t.split(re).map((x) => T(x, lang)).join(j) + trail;
      }
    }
    // word-level fallback (whole Arabic words only)
    if (!wordRe) wordRe = new RegExp("(?<![\\u0600-\\u06FF])(و)?(" + WORDS.map(esc).join("|") + ")(?![\\u0600-\\u06FF])", "g");
    const AND = ["et ", "and ", "y "][i];
    r = t.replace(wordRe, (w, wa, k) => (wa ? AND : "") + (exact(k, i) || k));
    return lead + r + trail;
  }

  // ---- DOM translation
  const ATTRS = ["placeholder", "aria-label", "title", "label"];
  // Each node remembers what we wrote, so our own changes are never re-translated (no loops).
  const done = new WeakMap();
  function trNode(n) {
    if (n.nodeType === 3) {
      const v = n.nodeValue; if (!AR.test(v) || done.get(n) === v) return;
      if (n.parentElement && n.parentElement.closest("[data-noi18n]")) return;
      const t = T(v); done.set(n, t); if (t !== v) n.nodeValue = t; return;
    }
    if (n.nodeType !== 1 || n.tagName === "SCRIPT" || n.tagName === "STYLE") return;
    if (n.closest && n.closest("[data-noi18n]")) return;
    let m = done.get(n); if (!m) { m = {}; done.set(n, m); }
    for (const a of ATTRS) { const v = n.getAttribute && n.getAttribute(a); if (v && AR.test(v) && m[a] !== v) { const t = T(v); m[a] = t; if (t !== v) n.setAttribute(a, t); } }
    for (const c of n.childNodes) trNode(c);
  }
  function apply(lang) {
    LANG = LANGS[lang] ? lang : "ar";
    const rtl = LANG === "ar";
    document.documentElement.lang = LANG; document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.querySelectorAll("[dir]").forEach((el) => { if (el.getAttribute("dir") === "rtl" || el.dataset.dirAuto) { el.dataset.dirAuto = "1"; el.setAttribute("dir", rtl ? "rtl" : "ltr"); } });
    if (rtl) return;
    trNode(document.body); document.title = T(document.title);
    new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === "characterData") trNode(m.target);
        else if (m.type === "attributes") trNode(m.target);
        else m.addedNodes.forEach(trNode);
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  const api = { LANGS, T: (s) => T(s), apply, get lang() { return LANG; }, _T: T, _D: D };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.I18N = api;
})(typeof window !== "undefined" ? window : globalThis);
