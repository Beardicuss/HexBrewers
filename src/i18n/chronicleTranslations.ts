import {
  ACHIEVEMENTS,
  CHALLENGES,
  type ChallengeId,
  type MatchRecord,
} from "../game/replayability";
import { useSettingsStore } from "../store/settingsStore";

type TrialText = { title: string; epitaph: string; description: string; lesson: string; objective: string; mastery: string };
type HonorText = { title: string; description: string; reward: string };
type Tier = "initiation" | "craft" | "peril" | "mastery";
type BuildRole = NonNullable<MatchRecord["buildPrimary"]>;

export interface ChronicleTranslation {
  eyebrow: string; title: string; emptySubtitle: string; recordedTitle: (title: string) => string;
  tabsLabel: string; tabs: { record: string; trials: string; honors: string };
  stats: { rituals: string; victories: string; rate: string; highest: string; average: string; dailyStreak: string };
  daily: { title: string; answered: string; conquered: string; bestStreak: string; description: string };
  weeklyRecord: { title: string; description: string };
  recent: { title: string; empty: string; victory: string; defeat: string; prestige: string; place: string; margin: string };
  modes: Record<MatchRecord["mode"], string>;
  weekly: { seal: string; brewers: string; rivals: string; recipe: string; currentStreak: string; victories: string; answer: string; description: (week: string) => string };
  weeklyNames: Record<string, { title: string; epitaph: string }>;
  tiers: Record<Tier, { label: string; title: string; description: string }>;
  trialLabels: { mastery: string; brewers: string; rivals: string; recipe: string; seededRandom: string; set: string; attempts: string; seals: string; masteries: string; begin: string };
  trials: Record<ChallengeId, TrialText>;
  honors: Record<string, HonorText>;
  honorLabels: { veiled: string; equipped: string; equip: string; locked: string };
  difficulties: Record<string, string>;
  buildRoles: Record<BuildRole, string>;
  back: string;
}

const en: ChronicleTranslation = {
  eyebrow: "THE ASHEN RECORD", title: "Brewer’s Chronicle", emptySubtitle: "Every sealed crucible leaves a mark. No honor recorded here changes the laws of the ritual.", recordedTitle: (title) => `Recorded title: ${title}`,
  tabsLabel: "Chronicle pages", tabs: { record: "Match Record", trials: "Named Trials", honors: "Honors & Titles" },
  stats: { rituals: "Rituals sealed", victories: "Victories", rate: "Victory rate", highest: "Highest prestige", average: "Average prestige", dailyStreak: "Daily streak" },
  daily: { title: "The Daily Omen", answered: "answered", conquered: "conquered", bestStreak: "best streak", description: "One shared, deterministic rite appears each day. Its complete rules remain unchanged." },
  weeklyRecord: { title: "The Turning Trial", description: "A shared seal turns once each week. Every brewer receives the same rivals, recipe, and deterministic starting seed." },
  recent: { title: "Recent Rituals", empty: "The parchment waits for your first completed brew.", victory: "VICTORY", defeat: "DEFEAT", prestige: "prestige", place: "place", margin: "margin" },
  modes: { standard: "Standard Ritual", ashenveil: "Ashenveil Ritual", daily: "Daily Omen", weekly: "Turning Trial", challenge: "Named Trial" },
  weekly: { seal: "THIS WEEK’S TURNING SEAL", brewers: "Brewers", rivals: "Rivals", recipe: "Recipe", currentStreak: "current streak", victories: "victories", answer: "Answer This Week’s Trial", description: (week) => `A shared Trial for ${week}. Its rivals, recipe, and deterministic starting seed remain identical for every brewer until the seal turns.` },
  weeklyNames: {
    "The Bell Beneath the Mire": { title: "The Bell Beneath the Mire", epitaph: "It rings only for those already expected." },
    "The Unblinking Crucible": { title: "The Unblinking Crucible", epitaph: "Something below the mixture counts every draw." },
    "A Bargain Written in Soot": { title: "A Bargain Written in Soot", epitaph: "The signature remains warm after seven nights." },
    "The Procession of Empty Vials": { title: "The Procession of Empty Vials", epitaph: "At midnight, the shelves rearrange themselves." },
  },
  tiers: {
    initiation: { label: "INITIATION · THREE LESSONS", title: "The First Seals", description: "These deterministic rites teach the decisions beneath the draw. Their order is hidden; their strategic purpose is not." },
    craft: { label: "CRAFT · THREE DISCIPLINES", title: "The Crucible’s Arts", description: "These fixed rites demand a coherent bag. Each teaches one recipe identity and judges the craft you assembled—not victory alone." },
    peril: { label: "PERIL · THREE ORDEALS", title: "The Lessons That Bite", description: "These rites deny comfortable brewing. Recover from failure, govern a volatile bag, and answer hostile Omens while accomplished rivals close around you." },
    mastery: { label: "MASTERY · THREE FINAL SEALS", title: "The Hands Beyond Chance", description: "These final seals demand plans that survive several rounds, purchases that change with the table, and risk judged precisely at the edge of shattering." },
  },
  trialLabels: { mastery: "Mastery", brewers: "Brewers", rivals: "Rivals", recipe: "Recipe", seededRandom: "Seeded random", set: "Set", attempts: "attempts", seals: "seals", masteries: "masteries", begin: "Begin Trial" },
  trials: Object.fromEntries(CHALLENGES.map(({ id, title, epitaph, description, lesson, objective, mastery }) => [id, { title, epitaph, description, lesson, objective, mastery }])) as Record<ChallengeId, TrialText>,
  honors: Object.fromEntries(ACHIEVEMENTS.map(({ id, title, description, titleReward }) => [id, { title, description, reward: titleReward }])), honorLabels: { veiled: "Title remains veiled", equipped: "Title Equipped", equip: "Equip Title", locked: "Locked" },
  difficulties: { apprentice: "Apprentice", skilled: "Skilled", master: "Master" },
  buildRoles: { control: "Control", rubyEngine: "Ruby Engine", resonance: "Resonance", aggression: "Aggression", adaptation: "Adaptation", lateBloom: "Late Bloom" },
  back: "Return to the Hall",
};

const ru: ChronicleTranslation = {
  eyebrow: "ПЕПЕЛЬНАЯ ЛЕТОПИСЬ", title: "Хроника зельевара", emptySubtitle: "Каждый запечатанный тигель оставляет след. Ни одна записанная здесь почесть не меняет законов ритуала.", recordedTitle: (title) => `Записанный титул: ${title}`,
  tabsLabel: "Разделы хроники", tabs: { record: "История матчей", trials: "Именные испытания", honors: "Почести и титулы" },
  stats: { rituals: "Завершено ритуалов", victories: "Победы", rate: "Доля побед", highest: "Лучший престиж", average: "Средний престиж", dailyStreak: "Дневная серия" },
  daily: { title: "Ежедневное знамение", answered: "принято", conquered: "побеждено", bestStreak: "лучшая серия", description: "Каждый день появляется один общий детерминированный ритуал. Его полные правила остаются неизменными." },
  weeklyRecord: { title: "Поворотное испытание", description: "Общая печать меняется раз в неделю. Все зельевары получают одинаковых соперников, рецепт и детерминированное начальное зерно." },
  recent: { title: "Недавние ритуалы", empty: "Пергамент ждёт вашего первого завершённого варева.", victory: "ПОБЕДА", defeat: "ПОРАЖЕНИЕ", prestige: "престижа", place: "место", margin: "отрыв" },
  modes: { standard: "Стандартный ритуал", ashenveil: "Ритуал Ашенвейла", daily: "Ежедневное знамение", weekly: "Поворотное испытание", challenge: "Именное испытание" },
  weekly: { seal: "ПОВОРОТНАЯ ПЕЧАТЬ ЭТОЙ НЕДЕЛИ", brewers: "Зельевары", rivals: "Соперники", recipe: "Рецепт", currentStreak: "текущая серия", victories: "победы", answer: "Принять недельное испытание", description: (week) => `Общее испытание недели ${week}. Соперники, рецепт и детерминированное начальное зерно одинаковы для всех зельеваров, пока печать не повернётся.` },
  weeklyNames: {
    "The Bell Beneath the Mire": { title: "Колокол под трясиной", epitaph: "Он звонит лишь для тех, кого уже ждут." },
    "The Unblinking Crucible": { title: "Немигающий тигель", epitaph: "Нечто под смесью считает каждое вытягивание." },
    "A Bargain Written in Soot": { title: "Сделка, записанная сажей", epitaph: "Подпись остаётся тёплой спустя семь ночей." },
    "The Procession of Empty Vials": { title: "Процессия пустых флаконов", epitaph: "В полночь полки переставляют себя сами." },
  },
  tiers: {
    initiation: { label: "ПОСВЯЩЕНИЕ · ТРИ УРОКА", title: "Первые печати", description: "Эти предопределённые обряды учат решениям, скрытым за вытягиванием. Порядок жетонов неизвестен, но стратегическая цель ясна." },
    craft: { label: "РЕМЕСЛО · ТРИ ДИСЦИПЛИНЫ", title: "Искусства тигеля", description: "Эти обряды требуют цельного состава мешка. Каждый раскрывает один стиль рецепта и оценивает созданную вами систему, а не одну лишь победу." },
    peril: { label: "ОПАСНОСТЬ · ТРИ ИСПЫТАНИЯ", title: "Уроки, которые кусают", description: "Эти обряды не позволяют варить спокойно. Оправьтесь после неудачи, обуздайте опасный мешок и ответьте враждебным знамениям под давлением опытных соперников." },
    mastery: { label: "МАСТЕРСТВО · ТРИ ПОСЛЕДНИЕ ПЕЧАТИ", title: "Руки по ту сторону случая", description: "Последние печати требуют многораундовых планов, покупок, меняющихся вместе со столом, и точной оценки риска у самой грани разрушения." },
  },
  trialLabels: { mastery: "Мастерство", brewers: "Зельевары", rivals: "Соперники", recipe: "Рецепт", seededRandom: "Случайный по зерну", set: "Набор", attempts: "попыток", seals: "печатей", masteries: "мастерств", begin: "Начать испытание" },
  trials: {
    read_the_ashes: { title: "Прочти пепел", epitaph: "Мешок скрыт. Его опасность — нет.", description: "Предопределённая дуэль учит проверять мешок, рассчитывать оставшийся риск и отличать возможное вытягивание от опасного.", lesson: "Чтение риска", objective: "Победите Тень, набрав не менее 14 престижа.", mastery: "Победите с 18 престижем и отрывом не менее 3." },
    the_willing_stop: { title: "Добровольная остановка", epitaph: "Жадность тянет снова. Рассудок сохраняет добытое.", description: "Управляемое состязание о сохранении уже обеспеченных наград, а не о том, чтобы принимать каждое безопасное вытягивание за разрешение продолжать.", lesson: "Осмысленная остановка", objective: "Победите в ритуале с положительным отрывом.", mastery: "Победите с отрывом не менее 5 престижа." },
    three_coins_ahead: { title: "На три монеты впереди", epitaph: "Покупка сделана сейчас. Победа придёт позже.", description: "Рыночный урок для трёх зельеваров: читайте синергии рецепта, осознанно снижайте давление и покупайте ради будущих раундов.", lesson: "Основы планирования рынка", objective: "Займите первое место с 19 престижем.", mastery: "Победите, набрав не менее 23 престижа." },
    the_gentle_chain: { title: "Мягкая цепь", epitaph: "Мороз не щадит руку. Он учит её, когда остановиться.", description: "Набор 1 поощряет контроль: Морозная желчь раскрывает выборы, Чумная пыль исправляет опасные вытягивания, а сдержанность превращает их в гарантированную ценность.", lesson: "Контроль Морозной желчи и Чумной пыли", objective: "Победите с Контролем как главным стилем сборки.", mastery: "Победите сборкой Контроля с 20 престижем и отрывом 3+." },
    the_crimson_answer: { title: "Багряный ответ", epitaph: "Один шип позвал через тигели. Остальные ответили кровью.", description: "Набор 3 учит Резонансу: Кровошип превращает давление предыдущего Осколка Пустоты в движение, а Чумная пыль повышает безопасный предел.", lesson: "Резонанс Кровошипа и Осколка Пустоты", objective: "Займите первое место с Резонансом как главным стилем.", mastery: "Победите сборкой Резонанса и наберите 22 престижа." },
    roots_beyond_nine: { title: "Корни за девятым пределом", epitaph: "То, что расцвело после колокола, было посажено до первого вытягивания.", description: "Набор 4 учит позднему расцвету: Смертоткач и Призракоцвет требуют вложений между раундами, а зрелый мешок обеспечивает решающий финал.", lesson: "Поздний расцвет Смертоткача и Призракоцвета", objective: "Победите с Поздним расцветом как главным стилем.", mastery: "Победите с 24 престижем и отрывом 4+." },
    the_vial_remembers: { title: "Флакон помнит", epitaph: "Стекло забывает разбившую его руку. Кровь под ним — нет.", description: "Дуэль набора 2, где защищённый риск и Проклятый флакон должны стать восстановлением, а не паникой. Безупречное варево не запечатает этот урок.", lesson: "Восстановление после разрушения", objective: "Победите, хотя бы раз разрушив тигель и использовав флакон.", mastery: "Победите ровно с одним разрушением, двумя применениями флакона и 20 престижем." },
    a_bag_with_teeth: { title: "Мешок с зубами", epitaph: "Каждую ночь он становился тяжелее, хотя внутрь ничего не клали.", description: "Набор 4 и тесный стол поощряют смелые покупки, но каждый ингредиент меняет долю опасности. Расширяйте мешок, не теряя контроля.", lesson: "Управление опасным мешком", objective: "Победите с 15+ ингредиентами и долей Осколков не более половины мешка.", mastery: "Выполните цель мешка, разрушьтесь не более раза и победите с отрывом 3+." },
    under_nine_eyes: { title: "Под девятью глазами", epitaph: "Каждое знамение следило за другим соперником. Ни одно не моргнуло для вас.", description: "Четыре зельевара встречают заданную череду разрушительных знамений. Набор 2 требует гибкости, пока соперники уровня Мастер оспаривают каждую награду.", lesson: "Адаптация к знамениям под давлением", objective: "Победите трёх Мастеров со стилем Адаптация.", mastery: "Победите Адаптацией с 23 престижем и отрывом 4+." },
    the_long_conjunction: { title: "Долгое соединение", epitaph: "Через девять колоколов одна покупка наконец раскрыла своё назначение.", description: "Обряд набора 4 для троих, где победа собирается постепенно. Тратьте в течение матча и не позволяйте одному визиту на рынок нести весь план.", lesson: "Многораундовые вложения", objective: "Победите после 5 покупок в 4 разных раундах.", mastery: "Сделайте 7 покупок в 5 раундах и наберите 25 престижа." },
    the_changing_hand: { title: "Меняющаяся рука", epitaph: "Рынок не предложил второй копии будущего, которое вы задумали.", description: "Обряд для четверых со случайным рецептом по зерну. Читайте выданные правила, меняйте приоритеты при исчерпании запасов и сохраняйте цельность плана.", lesson: "Адаптивные покупки", objective: "Победите трёх Мастеров, купив ингредиенты 4 разных цветов.", mastery: "Купите 5 цветов и победите с отрывом 3+." },
    at_the_seventh_breath: { title: "На седьмом дыхании", epitaph: "Сосуд узнал звук разрушения. Вы научили его тишине.", description: "Финальная дуэль набора 3. Снова и снова доводите давление до опасной отметки, решайте, когда награды достаточно, и не путайте удачу с мастерством.", lesson: "Экспертное управление риском", objective: "Победите, безопасно завершив 3 раунда при давлении 6+, и разрушьтесь не более раза.", mastery: "Переживите высокое давление в 4 раундах без разрушений и наберите 25 престижа." },
  },
  honors: {
    first_ritual: { title: "Первая печать", description: "Завершите один ритуал.", reward: "Посвящённый Ашенвейла" }, three_victories: { title: "Испытанный тигелем", description: "Победите в трёх ритуалах.", reward: "Испытанный тигелем" }, prestige_25: { title: "Имя в золоте", description: "Наберите 25 престижа за матч.", reward: "Позолоченный зельевар" }, daily_three: { title: "Слушатель знамений", description: "Ответьте на три ежедневных знамения.", reward: "Слушатель за колоколом" }, trial_trinity: { title: "Первые три печати", description: "Покорите все испытания Посвящения.", reward: "Посвящённый тигеля" }, craft_trinity: { title: "Три связанных искусства", description: "Покорите все испытания Ремесла.", reward: "Мастер тигеля" }, peril_trinity: { title: "Неразбитый сосуд", description: "Покорите все испытания Опасности.", reward: "Переживший девять глаз" }, mastery_trinity: { title: "Двенадцатая печать", description: "Покорите все испытания Мастерства.", reward: "Мастер Девятого Знамения" }, weekly_three: { title: "Поворотная печать", description: "Ответьте на три разных недельных испытания.", reward: "Отмеченный поворотной неделей" },
  },
  honorLabels: { veiled: "Титул остаётся сокрытым", equipped: "Титул выбран", equip: "Выбрать титул", locked: "Закрыто" },
  difficulties: { apprentice: "Ученик", skilled: "Опытный", master: "Мастер" },
  buildRoles: { control: "Контроль", rubyEngine: "Рубиновый механизм", resonance: "Резонанс", aggression: "Натиск", adaptation: "Адаптация", lateBloom: "Поздний расцвет" },
  back: "Вернуться в зал",
};

const ka: ChronicleTranslation = {
  eyebrow: "ფერფლის მატიანე", title: "მხარშავის მატიანე", emptySubtitle: "ყოველი დალუქული ტიგელი კვალს ტოვებს. აქ ჩაწერილი არცერთი პატივი რიტუალის კანონებს არ ცვლის.", recordedTitle: (title) => `ჩაწერილი წოდება: ${title}`,
  tabsLabel: "მატიანის გვერდები", tabs: { record: "მატჩების ჩანაწერი", trials: "სახელდებული გამოცდები", honors: "პატივი და წოდებები" },
  stats: { rituals: "დასრულებული რიტუალები", victories: "გამარჯვებები", rate: "გამარჯვების მაჩვენებელი", highest: "უმაღლესი პრესტიჟი", average: "საშუალო პრესტიჟი", dailyStreak: "დღიური სერია" },
  daily: { title: "დღიური ნიშანი", answered: "პასუხი", conquered: "დაძლეული", bestStreak: "საუკეთესო სერია", description: "ყოველ დღე ჩნდება ერთი საერთო, წინასწარ განსაზღვრული რიტუალი. მისი სრული წესები უცვლელი რჩება." },
  weeklyRecord: { title: "მბრუნავი გამოცდა", description: "საერთო ბეჭედი კვირაში ერთხელ ბრუნდება. ყველა მხარშავი ერთსა და იმავე მეტოქეებს, რეცეპტსა და დეტერმინირებულ საწყის თესლს იღებს." },
  recent: { title: "ბოლო რიტუალები", empty: "პერგამენტი თქვენს პირველ დასრულებულ ნახარშს ელის.", victory: "გამარჯვება", defeat: "დამარცხება", prestige: "პრესტიჟი", place: "ადგილი", margin: "სხვაობა" },
  modes: { standard: "სტანდარტული რიტუალი", ashenveil: "ეშენვეილის რიტუალი", daily: "დღიური ნიშანი", weekly: "მბრუნავი გამოცდა", challenge: "სახელდებული გამოცდა" },
  weekly: { seal: "ამ კვირის მბრუნავი ბეჭედი", brewers: "მხარშავები", rivals: "მეტოქეები", recipe: "რეცეპტი", currentStreak: "მიმდინარე სერია", victories: "გამარჯვებები", answer: "უპასუხე კვირის გამოცდას", description: (week) => `${week} კვირის საერთო გამოცდა. ბეჭდის მობრუნებამდე მეტოქეები, რეცეპტი და დეტერმინირებული საწყისი თესლი ყველა მხარშავისთვის ერთნაირია.` },
  weeklyNames: {
    "The Bell Beneath the Mire": { title: "ზარი ჭაობის ქვეშ", epitaph: "ის მხოლოდ მათთვის რეკავს, ვისაც უკვე ელიან." },
    "The Unblinking Crucible": { title: "დაუხამხამებელი ტიგელი", epitaph: "ნარევის ქვეშ რაღაც ყოველი ამოღებას ითვლის." },
    "A Bargain Written in Soot": { title: "ჭვარტლით დაწერილი გარიგება", epitaph: "ხელმოწერა შვიდი ღამის შემდეგაც თბილია." },
    "The Procession of Empty Vials": { title: "ცარიელი ფლაკონების პროცესია", epitaph: "შუაღამისას თაროები თავისით გადაადგილდება." },
  },
  tiers: {
    initiation: { label: "კურთხევა · სამი გაკვეთილი", title: "პირველი ბეჭდები", description: "ეს განსაზღვრული რიტუალები ამოღების მიღმა დამალულ გადაწყვეტილებებს გასწავლით. რიგი დაფარულია, სტრატეგიული მიზანი — არა." },
    craft: { label: "ხელობა · სამი დისციპლინა", title: "ტიგელის ხელოვნებანი", description: "ეს გამოცდები გამართულ ტომარას მოითხოვს. თითოეული ერთ რეცეპტულ იდენტობას გასწავლით და შექმნილ ოსტატობას აფასებს, არა მხოლოდ გამარჯვებას." },
    peril: { label: "საფრთხე · სამი განსაცდელი", title: "გაკვეთილები, რომლებიც კბენენ", description: "ეს რიტუალები მშვიდ ხარშვას არ გაძლევთ. აღდგით მარცხის შემდეგ, მართეთ მტაცებელი ტომარა და უპასუხეთ მტრულ ნიშნებს." },
    mastery: { label: "ოსტატობა · სამი საბოლოო ბეჭედი", title: "ხელები შემთხვევითობის მიღმა", description: "საბოლოო ბეჭდები რამდენიმე რაუნდზე გამძლე გეგმებს, ცვალებად შესყიდვებს და დამსხვრევის ზღვარზე ზუსტ რისკს მოითხოვს." },
  },
  trialLabels: { mastery: "ოსტატობა", brewers: "მხარშავები", rivals: "მეტოქეები", recipe: "რეცეპტი", seededRandom: "განსაზღვრული შემთხვევითი", set: "ნაკრები", attempts: "ცდა", seals: "ბეჭედი", masteries: "ოსტატობა", begin: "გამოცდის დაწყება" },
  trials: {
    read_the_ashes: { title: "წაიკითხე ფერფლი", epitaph: "ტომარა დაფარულია. მისი საფრთხე — არა.", description: "განსაზღვრული ორთაბრძოლა გასწავლის ტომრის შემოწმებას, დარჩენილი რისკის გამოთვლას და შესაძლო ამოღების სახიფათოსგან გარჩევას.", lesson: "რისკის წაკითხვა", objective: "დაამარცხე ჩრდილი სულ მცირე 14 პრესტიჟით.", mastery: "გაიმარჯვე 18 პრესტიჟით და მინიმუმ 3 ქულის სხვაობით." },
    the_willing_stop: { title: "ნებაყოფლობითი შეჩერება", epitaph: "სიხარბე კვლავ იღებს. განსჯა მოპოვებულს ინახავს.", description: "კონტროლირებული შეჯიბრი დაცული ჯილდოების შენარჩუნებაზეა და არა ყოველი უსაფრთხო ამოღების გაგრძელების ნებად მიჩნევაზე.", lesson: "აზრიანი შეჩერება", objective: "გაიმარჯვე დადებითი სხვაობით.", mastery: "გაიმარჯვე მინიმუმ 5 პრესტიჟის სხვაობით." },
    three_coins_ahead: { title: "სამი მონეტით წინ", epitaph: "შესყიდვა ახლა კეთდება. გამარჯვება მოგვიანებით მოდის.", description: "სამი მხარშავის საბაზრო გაკვეთილი: წაიკითხე რეცეპტის სინერგია, შეგნებულად შეამცირე წნევა და მომავალი რაუნდებისთვის იყიდე.", lesson: "ბაზრის საბაზისო დაგეგმვა", objective: "დაიკავე პირველი ადგილი 19 პრესტიჟით.", mastery: "გაიმარჯვე სულ მცირე 23 პრესტიჟით." },
    the_gentle_chain: { title: "ნაზი ჯაჭვი", epitaph: "ყინვა ხელს არ ინდობს. ის ასწავლის, როდის უნდა დაიხუროს.", description: "ნაკრები 1 კონტროლის აგებას აჯილდოებს: ყინვის ნაღველი არჩევანს ხსნის, ჭირის მტვერი სახიფათო ამოღებებს ასწორებს, თავშეკავება კი მათ დაცულ ღირებულებად აქცევს.", lesson: "ყინვის ნაღველისა და ჭირის მტვრის კონტროლი", objective: "გაიმარჯვე კონტროლით, როგორც მთავარ აგებულებით.", mastery: "გაიმარჯვე კონტროლით, 20 პრესტიჟითა და 3+ სხვაობით." },
    the_crimson_answer: { title: "ალისფერი პასუხი", epitaph: "ერთმა ეკალმა ტიგელებს შორის დაიძახა. სხვებმა სისხლით უპასუხეს.", description: "ნაკრები 3 რეზონანსს გასწავლით: სისხლის ეკალი წინა სიცარიელის ნატეხის წნევას მოძრაობად აქცევს, ჭირის მტვერი კი უსაფრთხო ზღვარს ზრდის.", lesson: "სისხლის ეკლისა და სიცარიელის ნატეხის რეზონანსი", objective: "დაიკავე პირველი ადგილი რეზონანსით, როგორც მთავარი აგებულებით.", mastery: "გაიმარჯვე რეზონანსით და 22 პრესტიჟით." },
    roots_beyond_nine: { title: "ფესვები მეცხრის მიღმა", epitaph: "რაც ზარის შემდეგ აყვავდა, პირველ ამოღებამდე დაითესა.", description: "ნაკრები 4 გვიან აყვავებას გასწავლით: სიკვდილის ქსელი და აჩრდილის ყვავილი რაუნდებს შორის ინვესტიციას ითხოვს, შემდეგ კი მომწიფებულ ტომარას გადამწყვეტ ფინალად აქცევს.", lesson: "სიკვდილის ქსელისა და აჩრდილის ყვავილის გვიანი აყვავება", objective: "გაიმარჯვე გვიანი აყვავებით, როგორც მთავარი აგებულებით.", mastery: "გაიმარჯვე 24 პრესტიჟითა და 4+ სხვაობით." },
    the_vial_remembers: { title: "ფლაკონს ახსოვს", epitaph: "მინა იმ ხელს ივიწყებს, რომელმაც გატეხა. მის ქვეშ სისხლი — არა.", description: "ნაკრები 2-ის ორთაბრძოლა, სადაც დაცული რისკი და დაწყევლილი ფლაკონი აღდგენად უნდა იქცეს და არა პანიკად.", lesson: "დამსხვრევის შემდეგ აღდგენა", objective: "გაიმარჯვე მინიმუმ ერთი დამსხვრევისა და ფლაკონის ერთი გამოყენების შემდეგ.", mastery: "გაიმარჯვე ზუსტად ერთი დამსხვრევით, ფლაკონის ორი გამოყენებით და 20 პრესტიჟით." },
    a_bag_with_teeth: { title: "კბილებიანი ტომარა", epitaph: "ყოველ ღამე მძიმდებოდა, თუმცა შიგნით არაფერი ჩაუდიათ.", description: "ნაკრები 4 და ხალხმრავალი მაგიდა თამამ შესყიდვებს აჯილდოებს, მაგრამ ყოველი ინგრედიენტი საფრთხის წილს ცვლის. გააფართოვე ტომარა კონტროლის დაკარგვის გარეშე.", lesson: "არასტაბილური ტომრის მართვა", objective: "გაიმარჯვე 15+ ინგრედიენტით და სიცარიელის ნატეხების არაუმეტეს ნახევარი წილით.", mastery: "შეასრულე ტომრის მიზანი, ერთხელზე მეტად არ დაიმსხვრე და 3+ სხვაობით მოიგე." },
    under_nine_eyes: { title: "ცხრა თვალის ქვეშ", epitaph: "ყოველი ნიშანი სხვა მეტოქეს უყურებდა. შენთვის არცერთს დაუხამხამებია.", description: "ოთხი მხარშავი დამანგრეველი ნიშნების განსაზღვრულ რიგს ხვდება. ნაკრები 2 მოქნილ პასუხებს მოითხოვს, როცა ოსტატი მეტოქეები ყოველ ჯილდოს გეცილებიან.", lesson: "ნიშნებთან ადაპტაცია მეტოქეთა წნეხში", objective: "დაამარცხე სამი ოსტატი ადაპტაციით, როგორც მთავარი აგებულებით.", mastery: "გაიმარჯვე ადაპტაციით, 23 პრესტიჟითა და 4+ სხვაობით." },
    the_long_conjunction: { title: "ხანგრძლივი შეერთება", epitaph: "ცხრა ზარის შემდეგ ერთმა შესყიდვამ ბოლოს გამოავლინა თავისი დანიშნულება.", description: "სამმხარშავიანი ნაკრები 4-ის რიტუალი, სადაც გამარჯვება დროში იგება. ხარჯე მთელი მატჩის განმავლობაში და ნუ დააკისრებ გეგმას ერთ საბაზრო ვიზიტს.", lesson: "მრავალრაუნდიანი ინვესტიცია", objective: "გაიმარჯვე 4 სხვადასხვა რაუნდში სულ მცირე 5 შესყიდვის შემდეგ.", mastery: "გააკეთე 7 შესყიდვა 5 რაუნდში და მოიპოვე 25 პრესტიჟი." },
    the_changing_hand: { title: "ცვალებადი ხელი", epitaph: "ბაზარმა დაგეგმილი მომავლის მეორე ასლი არ შემოგთავაზა.", description: "ოთხმხარშავიანი რიტუალი განსაზღვრული შემთხვევითი რეცეპტით. წაიკითხე მიღებული წესები, შეცვალე პრიორიტეტები მარაგის ამოწურვისას და შეინარჩუნე თანმიმდევრული პასუხი.", lesson: "ადაპტიური შესყიდვები", objective: "დაამარცხე სამი ოსტატი 4 განსხვავებული ფერის ინგრედიენტის შეძენის შემდეგ.", mastery: "იყიდე 5 ფერი და 3+ სხვაობით გაიმარჯვე." },
    at_the_seventh_breath: { title: "მეშვიდე სუნთქვაზე", epitaph: "ჭურჭელმა დამსხვრევის ხმა ისწავლა. შენ მას სიჩუმე ასწავლე.", description: "ნაკრები 3-ის საბოლოო ორთაბრძოლა. არაერთხელ მიიყვანე ტიგელი სახიფათო წნევამდე, განსაზღვრე როდის კმარა დაცული ჯილდო და იღბალი ოსტატობაში არ აგერიოს.", lesson: "რისკის ოსტატური მართვა", objective: "გაიმარჯვე 6+ წნევაზე 3 უსაფრთხო დასრულებით და არაუმეტეს ერთი დამსხვრევით.", mastery: "გადაიტანე მაღალი წნევა 4 რაუნდში, არ დაიმსხვრე და დაასრულე 25 პრესტიჟით." },
  },
  honors: {
    first_ritual: { title: "პირველი ბეჭედი", description: "დაასრულე ერთი რიტუალი.", reward: "ეშენვეილის ხელდასხმული" }, three_victories: { title: "ტიგელით გამოცდილი", description: "გაიმარჯვე სამ რიტუალში.", reward: "ტიგელით გამოცდილი" }, prestige_25: { title: "სახელი ოქროში", description: "ერთ მატჩში 25 პრესტიჟი მოიპოვე.", reward: "მოოქროვილი მხარშავი" }, daily_three: { title: "ნიშნების მსმენელი", description: "უპასუხე სამ დღიურ ნიშანს.", reward: "ზარის მიღმა მსმენელი" }, trial_trinity: { title: "პირველი სამი ბეჭედი", description: "დაძლიე კურთხევის ყველა გამოცდა.", reward: "ტიგელის ხელდასხმული" }, craft_trinity: { title: "სამი შეკრული ხელოვნება", description: "დაძლიე ხელობის ყველა გამოცდა.", reward: "ტიგელის ხელოვანი" }, peril_trinity: { title: "გაუტეხელი ჭურჭელი", description: "დაძლიე საფრთხის ყველა გამოცდა.", reward: "ცხრა თვალის გადამრჩენი" }, mastery_trinity: { title: "მეთორმეტე ბეჭედი", description: "დაძლიე ოსტატობის ყველა გამოცდა.", reward: "მეცხრე ნიშნის ოსტატი" }, weekly_three: { title: "მბრუნავი ბეჭედი", description: "უპასუხე სამ განსხვავებულ კვირის გამოცდას.", reward: "მბრუნავი კვირით მონიშნული" },
  },
  honorLabels: { veiled: "წოდება ჯერ დაფარულია", equipped: "წოდება არჩეულია", equip: "წოდების არჩევა", locked: "ჩაკეტილია" },
  difficulties: { apprentice: "შეგირდი", skilled: "გამოცდილი", master: "ოსტატი" },
  buildRoles: { control: "კონტროლი", rubyEngine: "ლალის მექანიზმი", resonance: "რეზონანსი", aggression: "აგრესია", adaptation: "ადაპტაცია", lateBloom: "გვიანი აყვავება" },
  back: "დარბაზში დაბრუნება",
};

const dictionaries = { en, ru, ka } as const;

export function useChronicleTranslation(): ChronicleTranslation {
  const language = useSettingsStore((state) => state.language);
  return dictionaries[language] ?? en;
}

