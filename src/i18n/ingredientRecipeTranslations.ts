export interface RecipeSetText { effect: string; costs: string }
export type IngredientRecipeText = Record<string, RecipeSetText[]>;

export const EN_RECIPE_TEXT: IngredientRecipeText = {
  Frostbile: [
    { effect: "Draw extra chips equal to this chip's value. Place at most one; return the rest.", costs: "Costs: 5 / 10 / 19" },
    { effect: "The next 1, 2, or 4 draws cannot deny both scoring rewards when they cause an explosion.", costs: "Costs: 5 / 10 / 19" },
    { effect: "When this chip itself lands on a ruby field, gain 1 ruby.", costs: "Costs: 4 / 8 / 14" },
    { effect: "When this chip itself lands on a ruby field, gain prestige equal to its value.", costs: "Costs: 5 / 10 / 20" },
    { effect: "If pressure is 2 or lower after placement, gain 1 ruby.", costs: "Costs: 5 / 9 / 17" },
    { effect: "At 6 or 7 pressure after placement, gain prestige equal to its value.", costs: "Costs: 6 / 11 / 18" },
  ],
  Bloodthorn: [
    { effect: "Moves +1 with 1–2 Brimstones already in the crucible, or +2 with at least 3.", costs: "Costs: 6 / 10 / 16" },
    { effect: "Waits beside the crucible when drawn. When you stop, choose to place it, save it, or return it to the bag.", costs: "Costs: 4 / 8 / 14" },
    { effect: "After a Voidshard, you may move additional spaces equal to that Voidshard's value.", costs: "Costs: 5 / 9 / 15" },
    { effect: "After a Bloodthorn is placed, every value-1 Voidshard moves 1 extra space this round.", costs: "Costs: 7 / 11 / 17" },
    { effect: "Moves +1 for every three distinct non-white colors already placed, up to +2.", costs: "Costs: 6 / 10 / 16" },
    { effect: "Moves +1 per Echo Reed already placed, up to +3.", costs: "Costs: 5 / 9 / 15" },
  ],
  Plaguedust: [
    { effect: "If placed after a Voidshard, you may return that Voidshard to your bag.", costs: "Costs: 8 / 12 / 18" },
    { effect: "The next chip placed moves twice its normal distance.", costs: "Costs: 9 / 13 / 19" },
    { effect: "One Plaguedust raises the safe pressure limit to 8; three raise it to 9.", costs: "Costs: 8 / 12 / 18" },
    { effect: "You may move your first, second, and third Plaguedust +1, +2, and +3 spaces respectively.", costs: "Costs: 8 / 12 / 18" },
    { effect: "If placed after a Voidshard, gain 1 ruby.", costs: "Costs: 8 / 12 / 18" },
    { effect: "If placed after a Voidshard, advance your droplet 1 space.", costs: "Costs: 9 / 13 / 19" },
  ],
  Deathweave: [
    { effect: "Each Deathweave among the last two placed chips awards 1 ruby.", costs: "Costs: 4 / 8 / 14" },
    { effect: "Each Deathweave among the last two grants a chip reward based on its value.", costs: "Costs: 6 / 11 / 18" },
    { effect: "At exactly 7 pressure, you may move the last chip by the total value of Deathweave in the crucible.", costs: "Costs: 6 / 11 / 21" },
    { effect: "For each Deathweave among the last two, you may spend 1 ruby to advance the droplet 1 space.", costs: "Costs: 4 / 8 / 14" },
    { effect: "Each Deathweave among the last two awards 1 prestige.", costs: "Costs: 5 / 9 / 15" },
    { effect: "Each Deathweave among the last two advances your droplet 1 space.", costs: "Costs: 6 / 10 / 16" },
  ],
  Wraithbloom: [
    { effect: "One grants 1 prestige; two grant 1 prestige and 1 ruby; three grant 2 prestige and droplet +1.", costs: "Cost: 8" },
    { effect: "Trade up to three placed Wraithblooms for increasingly powerful chips, prestige, rubies, and droplet movement.", costs: "Cost: 12" },
    { effect: "Each Wraithbloom grants 1–3 prestige based on how far into the crucible it landed.", costs: "Cost: 10" },
    { effect: "Placed Wraithblooms let you upgrade eligible non-white ingredients: 1→2, 2→4, or 1→4.", costs: "Cost: 11" },
    { effect: "Gain prestige equal to your distinct non-white colors, up to 4.", costs: "Cost: 10" },
    { effect: "Gain 1 ruby per Wraithbloom and up to 2 prestige from your Wraithblooms.", costs: "Cost: 12" },
  ],
};

export const RU_RECIPE_TEXT: IngredientRecipeText = {
  Frostbile: [
    { effect: "Вытяните дополнительные жетоны по значению Морозной Желчи. Поместите не более одного, остальные верните.", costs: "Цена: 5 / 10 / 19" },
    { effect: "Следующие 1, 2 или 4 вытягивания не лишают обеих наград, если вызывают взрыв.", costs: "Цена: 5 / 10 / 19" },
    { effect: "Если жетон достигает клетки подсчёта с рубином, получите 1 рубин.", costs: "Цена: 4 / 8 / 14" },
    { effect: "Если жетон достигает клетки с рубином, получите славу, равную его значению.", costs: "Цена: 5 / 10 / 20" },
    { effect: "Если после размещения давление не выше 2, получите 1 рубин.", costs: "Цена: 5 / 9 / 17" },
    { effect: "При давлении 6 или 7 получите славу, равную значению жетона.", costs: "Цена: 6 / 11 / 18" },
  ],
  Bloodthorn: [
    { effect: "+1 движение при 1–2 Серных Камнях в котле; +2 при трёх и более.", costs: "Цена: 6 / 10 / 16" },
    { effect: "После вытягивания ждёт рядом с котлом. При остановке поместите, сохраните или верните его в мешок.", costs: "Цена: 4 / 8 / 14" },
    { effect: "После Осколка Пустоты можно пройти дополнительно на его значение.", costs: "Цена: 5 / 9 / 15" },
    { effect: "После Кровошипа каждый Осколок Пустоты 1 движется ещё на 1 клетку.", costs: "Цена: 7 / 11 / 17" },
    { effect: "+1 движение за каждые три разных не-белых цвета, максимум +2.", costs: "Цена: 6 / 10 / 16" },
    { effect: "+1 движение за каждый Эхо-тростник в котле, максимум +3.", costs: "Цена: 5 / 9 / 15" },
  ],
  Plaguedust: [
    { effect: "После Осколка Пустоты его можно вернуть в мешок.", costs: "Цена: 8 / 12 / 18" },
    { effect: "Следующий помещённый жетон движется вдвое дальше.", costs: "Цена: 9 / 13 / 19" },
    { effect: "Одна Чумная Пыль повышает безопасный предел до 8; три — до 9.", costs: "Цена: 8 / 12 / 18" },
    { effect: "Первую, вторую и третью Чумную Пыль можно продвинуть дополнительно на 1, 2 и 3 клетки.", costs: "Цена: 8 / 12 / 18" },
    { effect: "После Осколка Пустоты получите 1 рубин.", costs: "Цена: 8 / 12 / 18" },
    { effect: "После Осколка Пустоты продвиньте каплю на 1 клетку.", costs: "Цена: 9 / 13 / 19" },
  ],
  Deathweave: [
    { effect: "Каждый Смертоткач среди двух последних жетонов даёт 1 рубин.", costs: "Цена: 4 / 8 / 14" },
    { effect: "Каждый Смертоткач среди двух последних даёт жетон-награду согласно его значению.", costs: "Цена: 6 / 11 / 18" },
    { effect: "При ровно 7 давления можно продвинуть последний жетон на сумму значений Смертоткача в котле.", costs: "Цена: 6 / 11 / 21" },
    { effect: "За каждый Смертоткач среди двух последних можно потратить 1 рубин и продвинуть каплю на 1.", costs: "Цена: 4 / 8 / 14" },
    { effect: "Каждый Смертоткач среди двух последних даёт 1 славу.", costs: "Цена: 5 / 9 / 15" },
    { effect: "Каждый Смертоткач среди двух последних продвигает каплю на 1.", costs: "Цена: 6 / 10 / 16" },
  ],
  Wraithbloom: [
    { effect: "Один даёт 1 славу; два — 1 славу и рубин; три — 2 славы и каплю +1.", costs: "Цена: 8" },
    { effect: "Обменяйте до трёх помещённых Призракоцветов на усиливающиеся награды.", costs: "Цена: 12" },
    { effect: "Каждый Призракоцвет даёт 1–3 славы в зависимости от места в котле.", costs: "Цена: 10" },
    { effect: "Призракоцветы позволяют улучшать подходящие цветные жетоны: 1→2, 2→4 или 1→4.", costs: "Цена: 11" },
    { effect: "Получите славу за каждый разный не-белый цвет, максимум 4.", costs: "Цена: 10" },
    { effect: "Получите по 1 рубину за каждый Призракоцвет и до 2 славы за ваши Призракоцветы.", costs: "Цена: 12" },
  ],
};

export const KA_RECIPE_TEXT: IngredientRecipeText = {
  Frostbile: [
    { effect: "ამოიღეთ დამატებითი ჟეტონები მისი მნიშვნელობის რაოდენობით. მოათავსეთ მაქსიმუმ ერთი, დანარჩენი დააბრუნეთ.", costs: "ფასი: 5 / 10 / 19" },
    { effect: "შემდეგი 1, 2 ან 4 ამოღება აფეთქებისას ორივე ჯილდოს დაკარგვისგან გიცავთ.", costs: "ფასი: 5 / 10 / 19" },
    { effect: "თუ ჟეტონი ლალის ქულის უჯრას მიაღწევს, მიიღეთ 1 ლალი.", costs: "ფასი: 4 / 8 / 14" },
    { effect: "თუ ჟეტონი ლალის ქულის უჯრას მიაღწევს, მიიღეთ მისი მნიშვნელობის პრესტიჟი.", costs: "ფასი: 5 / 10 / 20" },
    { effect: "თუ დადების შემდეგ წნევა 2 ან ნაკლებია, მიიღეთ 1 ლალი.", costs: "ფასი: 5 / 9 / 17" },
    { effect: "6 ან 7 წნევაზე მიიღეთ ჟეტონის მნიშვნელობის პრესტიჟი.", costs: "ფასი: 6 / 11 / 18" },
  ],
  Bloodthorn: [
    { effect: "+1 მოძრაობა 1–2 გოგირდის ქვასთან; +2 — სამთან ან მეტთან.", costs: "ფასი: 6 / 10 / 16" },
    { effect: "ამოღებისას ქვაბთან იცდის. გაჩერებისას მოათავსეთ, შეინახეთ ან ტომარაში დააბრუნეთ.", costs: "ფასი: 4 / 8 / 14" },
    { effect: "სიცარიელის ნატეხის შემდეგ შეგიძლიათ დამატებით მისი მნიშვნელობის მანძილი გაიაროთ.", costs: "ფასი: 5 / 9 / 15" },
    { effect: "სისხლის ეკლის შემდეგ ყოველი 1-იანი ნატეხი დამატებით 1 უჯრით მოძრაობს.", costs: "ფასი: 7 / 11 / 17" },
    { effect: "+1 მოძრაობა ყოველ სამ განსხვავებულ არა-თეთრ ფერზე, მაქსიმუმ +2.", costs: "ფასი: 6 / 10 / 16" },
    { effect: "+1 მოძრაობა თითო დადებულ ექოს ლერწამზე, მაქსიმუმ +3.", costs: "ფასი: 5 / 9 / 15" },
  ],
  Plaguedust: [
    { effect: "თუ ნატეხის შემდეგ დაიდო, შეგიძლიათ ის ნატეხი ტომარაში დააბრუნოთ.", costs: "ფასი: 8 / 12 / 18" },
    { effect: "შემდეგი ჟეტონი ორმაგ მანძილზე მოძრაობს.", costs: "ფასი: 9 / 13 / 19" },
    { effect: "ერთი ჭირის მტვერი უსაფრთხო ზღვარს 8-მდე ზრდის; სამი — 9-მდე.", costs: "ფასი: 8 / 12 / 18" },
    { effect: "შეგიძლიათ პირველი, მეორე და მესამე ჭირის მტვერი დამატებით 1, 2 და 3 უჯრით წასწიოთ.", costs: "ფასი: 8 / 12 / 18" },
    { effect: "სიცარიელის ნატეხის შემდეგ მიიღეთ 1 ლალი.", costs: "ფასი: 8 / 12 / 18" },
    { effect: "სიცარიელის ნატეხის შემდეგ წვეთი 1 უჯრით წინ წაიღეთ.", costs: "ფასი: 9 / 13 / 19" },
  ],
  Deathweave: [
    { effect: "ბოლო ორ ჟეტონში ყოველი სიკვდილის ქსელი 1 ლალს იძლევა.", costs: "ფასი: 4 / 8 / 14" },
    { effect: "ბოლო ორ ჟეტონში ყოველი სიკვდილის ქსელი თავისი მნიშვნელობის შესაბამის ჯილდოს იძლევა.", costs: "ფასი: 6 / 11 / 18" },
    { effect: "ზუსტად 7 წნევაზე შეგიძლიათ ბოლო ჟეტონი ქსელების ჯამური მნიშვნელობით წასწიოთ.", costs: "ფასი: 6 / 11 / 21" },
    { effect: "ბოლო ორ ჟეტონში თითო ქსელზე შეგიძლიათ 1 ლალი დახარჯოთ და წვეთი 1 უჯრით წასწიოთ.", costs: "ფასი: 4 / 8 / 14" },
    { effect: "ბოლო ორ ჟეტონში თითო სიკვდილის ქსელი 1 პრესტიჟს იძლევა.", costs: "ფასი: 5 / 9 / 15" },
    { effect: "ბოლო ორ ჟეტონში თითო სიკვდილის ქსელი წვეთს 1 უჯრით წინ წევს.", costs: "ფასი: 6 / 10 / 16" },
  ],
  Wraithbloom: [
    { effect: "ერთი იძლევა 1 პრესტიჟს; ორი — 1 პრესტიჟსა და ლალს; სამი — 2 პრესტიჟსა და წვეთს +1.", costs: "ფასი: 8" },
    { effect: "გაცვალეთ სამამდე მოთავსებული აჩრდილის ყვავილი მზარდ ჯილდოებზე.", costs: "ფასი: 12" },
    { effect: "თითო ყვავილი მდებარეობის მიხედვით 1–3 პრესტიჟს იძლევა.", costs: "ფასი: 10" },
    { effect: "ყვავილები ფერადი ჟეტონების გაუმჯობესების საშუალებას იძლევა: 1→2, 2→4 ან 1→4.", costs: "ფასი: 11" },
    { effect: "მიიღეთ პრესტიჟი განსხვავებული არა-თეთრი ფერების რაოდენობით, მაქსიმუმ 4.", costs: "ფასი: 10" },
    { effect: "მიიღეთ 1 ლალი თითო ყვავილზე და მაქსიმუმ 2 პრესტიჟი თქვენი აჩრდილის ყვავილებიდან.", costs: "ფასი: 12" },
  ],
};
