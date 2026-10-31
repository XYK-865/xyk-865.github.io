// USDA SR Legacy, April 2018. Exact source extract: ../food-reference-verified.json.
// Nutrients are per 100 g edible portion. Portion weights are site examples, not USDA serving recommendations.
export const BASE_FOODS = [
  {
    "id": "milk",
    "name": "全脂牛奶",
    "category": "奶制品",
    "state": "液态 · 乳脂 3.25%",
    "portion": {
      "grams": 250,
      "label": "一杯示例"
    },
    "note": "未加糖；不同乳脂比例应换用对应条目。",
    "aliases": "牛乳 鲜奶 milk",
    "fdcId": 171265,
    "description": "Milk, whole, 3.25% milkfat, with added vitamin D",
    "per100": {
      "kcal": 61.0,
      "protein": 3.15,
      "fat": 3.25,
      "carbs": 4.8
    },
    "illustration": "milk",
    "sourceNote": ""
  },
  {
    "id": "yogurt",
    "name": "原味脱脂希腊酸奶",
    "category": "奶制品",
    "state": "原味 · 脱脂",
    "portion": {
      "grams": 170,
      "label": "一小碗示例"
    },
    "note": "这里是高蛋白希腊酸奶，不等同于普通风味酸奶。",
    "aliases": "优格 酸乳 yogurt",
    "fdcId": 170894,
    "description": "Yogurt, Greek, plain, nonfat (Includes foods for USDA's Food Distribution Program)",
    "per100": {
      "kcal": 59.0,
      "protein": 10.19,
      "fat": 0.39,
      "carbs": 3.6
    },
    "illustration": "yogurt",
    "sourceNote": ""
  },
  {
    "id": "egg",
    "name": "水煮全蛋",
    "category": "肉蛋与水产",
    "state": "熟 · 去壳可食部",
    "portion": {
      "grams": 50,
      "label": "一个去壳蛋示例"
    },
    "note": "按去壳后重量计，不含煎蛋用油。",
    "aliases": "鸡蛋 蛋 egg",
    "fdcId": 173424,
    "description": "Egg, whole, cooked, hard-boiled",
    "per100": {
      "kcal": 155.0,
      "protein": 12.58,
      "fat": 10.61,
      "carbs": 1.12
    },
    "illustration": "egg",
    "sourceNote": ""
  },
  {
    "id": "chicken",
    "name": "去皮鸡胸肉",
    "category": "肉蛋与水产",
    "state": "熟 · 烤制 · 仅肉",
    "portion": {
      "grams": 150,
      "label": "一份熟肉示例"
    },
    "note": "熟重条目；额外油和酱汁单独记录。",
    "aliases": "鸡肉 鸡胸 chicken",
    "fdcId": 171477,
    "description": "Chicken, broilers or fryers, breast, meat only, cooked, roasted",
    "per100": {
      "kcal": 165.0,
      "protein": 31.02,
      "fat": 3.57,
      "carbs": 0.0
    },
    "illustration": "chicken",
    "sourceNote": ""
  },
  {
    "id": "beef",
    "name": "瘦牛肉末",
    "category": "肉蛋与水产",
    "state": "熟 · 锅煎碎肉 · 原料 95% 瘦",
    "portion": {
      "grams": 120,
      "label": "一份熟肉示例"
    },
    "note": "对应原料 95% 瘦肉的熟肉末，不能代替任意牛排。",
    "aliases": "牛肉 牛绞肉 beef",
    "fdcId": 174028,
    "description": "Beef, ground, 95% lean meat / 5% fat, crumbles, cooked, pan-browned",
    "per100": {
      "kcal": 193.0,
      "protein": 29.17,
      "fat": 7.58,
      "carbs": 0.0
    },
    "illustration": "beef",
    "sourceNote": ""
  },
  {
    "id": "salmon",
    "name": "大西洋三文鱼",
    "category": "肉蛋与水产",
    "state": "熟 · 养殖 · 干热烹调",
    "portion": {
      "grams": 150,
      "label": "一块熟鱼示例"
    },
    "note": "养殖与野生、不同鱼种的脂肪含量会有差别。",
    "aliases": "鲑鱼 salmon",
    "fdcId": 175168,
    "description": "Fish, salmon, Atlantic, farmed, cooked, dry heat",
    "per100": {
      "kcal": 206.0,
      "protein": 22.1,
      "fat": 12.35,
      "carbs": 0.0
    },
    "illustration": "salmon",
    "sourceNote": ""
  },
  {
    "id": "tofu",
    "name": "硬豆腐（硫酸钙凝固）",
    "category": "豆类与豆制品",
    "state": "未再烹调 · firm",
    "portion": {
      "grams": 150,
      "label": "一份示例"
    },
    "note": "此条目含水较少，不等同于国内所有“北豆腐”；优先看包装。",
    "aliases": "豆制品 豆腐 tofu",
    "fdcId": 172475,
    "description": "Tofu, raw, firm, prepared with calcium sulfate",
    "per100": {
      "kcal": 144.0,
      "protein": 17.27,
      "fat": 8.72,
      "carbs": 2.78
    },
    "illustration": "tofu",
    "sourceNote": ""
  },
  {
    "id": "lentils",
    "name": "熟小扁豆",
    "category": "豆类与豆制品",
    "state": "熟 · 水煮 · 无盐",
    "portion": {
      "grams": 150,
      "label": "一小碗示例"
    },
    "note": "指 lentils 小扁豆，不是鲜扁豆荚；按熟重计算。",
    "aliases": "兵豆 小扁豆 lentil",
    "fdcId": 172421,
    "description": "Lentils, mature seeds, cooked, boiled, without salt",
    "per100": {
      "kcal": 116.0,
      "protein": 9.02,
      "fat": 0.38,
      "carbs": 20.13
    },
    "illustration": "lentils",
    "sourceNote": ""
  },
  {
    "id": "rice",
    "name": "白米饭",
    "category": "主食",
    "state": "熟 · 长粒白米",
    "portion": {
      "grams": 150,
      "label": "一小碗示例"
    },
    "note": "称熟米饭；不能用此条目换算同重生大米。",
    "aliases": "米饭 大米 rice",
    "fdcId": 168878,
    "description": "Rice, white, long-grain, regular, enriched, cooked",
    "per100": {
      "kcal": 130.0,
      "protein": 2.69,
      "fat": 0.28,
      "carbs": 28.17
    },
    "illustration": "rice",
    "sourceNote": ""
  },
  {
    "id": "oats",
    "name": "原味燕麦片",
    "category": "主食",
    "state": "干 · 未强化 · 未煮",
    "portion": {
      "grams": 40,
      "label": "一份干料示例"
    },
    "note": "普通或快熟燕麦片；煮粥加水后每 100 g 会改变。",
    "aliases": "燕麦 oatmeal oats",
    "fdcId": 173904,
    "description": "Cereals, oats, regular and quick, not fortified, dry",
    "per100": {
      "kcal": 379.0,
      "protein": 13.15,
      "fat": 6.52,
      "carbs": 67.7
    },
    "illustration": "oats",
    "sourceNote": ""
  },
  {
    "id": "potato",
    "name": "水煮土豆",
    "category": "主食",
    "state": "熟 · 带皮煮后取肉 · 无盐",
    "portion": {
      "grams": 180,
      "label": "一份可食部示例"
    },
    "note": "按去皮后的熟土豆肉称量，不含黄油或奶。",
    "aliases": "马铃薯 洋芋 potato",
    "fdcId": 170438,
    "description": "Potatoes, boiled, cooked in skin, flesh, without salt",
    "per100": {
      "kcal": 87.0,
      "protein": 1.87,
      "fat": 0.1,
      "carbs": 20.13
    },
    "illustration": "potato",
    "sourceNote": ""
  },
  {
    "id": "broccoli",
    "name": "水煮西兰花",
    "category": "蔬菜",
    "state": "熟 · 沥干 · 无盐",
    "portion": {
      "grams": 150,
      "label": "一份熟菜示例"
    },
    "note": "按沥干后的熟重；拌入的油另算。",
    "aliases": "绿花椰菜 西蓝花 broccoli",
    "fdcId": 169967,
    "description": "Broccoli, cooked, boiled, drained, without salt",
    "per100": {
      "kcal": 35.0,
      "protein": 2.38,
      "fat": 0.41,
      "carbs": 7.18
    },
    "illustration": "broccoli",
    "sourceNote": ""
  },
  {
    "id": "spinach",
    "name": "菠菜",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 100,
      "label": "一份生菜示例"
    },
    "note": "这里为生菠菜；焯水后的同重菠菜需另选熟食条目。",
    "aliases": "青菜 spinach",
    "fdcId": 168462,
    "description": "Spinach, raw",
    "per100": {
      "kcal": 23.0,
      "protein": 2.86,
      "fat": 0.39,
      "carbs": 3.63
    },
    "illustration": "spinach",
    "sourceNote": ""
  },
  {
    "id": "tomato",
    "name": "番茄",
    "category": "蔬菜",
    "state": "生 · 红熟 · 可食部",
    "portion": {
      "grams": 150,
      "label": "一个中等番茄示例"
    },
    "note": "不同个头差异大，最好称去蒂后的可食部分。",
    "aliases": "西红柿 tomato",
    "fdcId": 170457,
    "description": "Tomatoes, red, ripe, raw, year round average",
    "per100": {
      "kcal": 18.0,
      "protein": 0.88,
      "fat": 0.2,
      "carbs": 3.89
    },
    "illustration": "tomato",
    "sourceNote": ""
  },
  {
    "id": "banana",
    "name": "香蕉",
    "category": "水果",
    "state": "生 · 去皮可食部",
    "portion": {
      "grams": 120,
      "label": "一根去皮香蕉示例"
    },
    "note": "示例重量不含香蕉皮；实际一根不一定是 120 g。",
    "aliases": "水果 banana",
    "fdcId": 173944,
    "description": "Bananas, raw",
    "per100": {
      "kcal": 89.0,
      "protein": 1.09,
      "fat": 0.33,
      "carbs": 22.84
    },
    "illustration": "banana",
    "sourceNote": ""
  },
  {
    "id": "apple",
    "name": "苹果",
    "category": "水果",
    "state": "生 · 带皮 · 可食部",
    "portion": {
      "grams": 180,
      "label": "一个去核苹果示例"
    },
    "note": "按去核后的可食部分称量。",
    "aliases": "水果 apple",
    "fdcId": 171688,
    "description": "Apples, raw, with skin (Includes foods for USDA's Food Distribution Program)",
    "per100": {
      "kcal": 52.0,
      "protein": 0.26,
      "fat": 0.17,
      "carbs": 13.81
    },
    "illustration": "apple",
    "sourceNote": ""
  },
  {
    "id": "almond",
    "name": "巴旦木（扁桃仁）",
    "category": "坚果种子与油",
    "state": "原味 · 未加调味",
    "portion": {
      "grams": 20,
      "label": "一小把示例"
    },
    "note": "不是中药杏仁；糖衣和烤制加油需另选条目。",
    "aliases": "坚果 美国大杏仁 almond",
    "fdcId": 170567,
    "description": "Nuts, almonds",
    "per100": {
      "kcal": 579.0,
      "protein": 21.15,
      "fat": 49.93,
      "carbs": 21.55
    },
    "illustration": "almond",
    "sourceNote": ""
  },
  {
    "id": "oil",
    "name": "橄榄油",
    "category": "坚果种子与油",
    "state": "烹调油 · 可食部",
    "portion": {
      "grams": 5,
      "label": "一次用油示例"
    },
    "note": "这里按重量，不把一勺直接视为固定克数。",
    "aliases": "食用油 olive oil",
    "fdcId": 171413,
    "description": "Oil, olive, salad or cooking",
    "per100": {
      "kcal": 884.0,
      "protein": 0.0,
      "fat": 100.0,
      "carbs": 0.0
    },
    "illustration": "oil",
    "sourceNote": ""
  },
  {
    "id": "coffee",
    "name": "黑咖啡",
    "category": "饮品",
    "state": "冲煮液 · 无奶无糖",
    "portion": {
      "grams": 240,
      "label": "一杯咖啡液示例"
    },
    "note": "按咖啡液重量；不含奶、糖和糖浆。",
    "aliases": "美式 手冲 黑咖 coffee americano",
    "fdcId": 171890,
    "description": "Beverages, coffee, brewed, prepared with tap water",
    "per100": {
      "kcal": 1.0,
      "protein": 0.12,
      "fat": 0.02,
      "carbs": 0.0
    },
    "illustration": "coffee",
    "sourceNote": ""
  },
  {
    "id": "soy",
    "name": "未加糖强化豆奶",
    "category": "饮品",
    "state": "液态 · 添加钙与维生素 A、D",
    "portion": {
      "grams": 250,
      "label": "一杯示例"
    },
    "note": "这是 USDA 无糖强化豆奶条目，不等同于现磨豆浆。",
    "aliases": "植物奶 豆奶 豆浆 soy soymilk",
    "fdcId": 175215,
    "description": "Soymilk (all flavors), unsweetened, with added calcium, vitamins A and D",
    "per100": {
      "kcal": 33.0,
      "protein": 2.86,
      "fat": 1.61,
      "carbs": 1.74
    },
    "illustration": "soy",
    "sourceNote": ""
  },
  {
    "id": "bread",
    "name": "全麦面包",
    "category": "面包与烘焙",
    "state": "成品 · 市售通用条目",
    "portion": {
      "grams": 35,
      "label": "一片示例"
    },
    "note": "一片重量和配方差异明显，包装标签优先。",
    "aliases": "吐司 麦片面包 whole wheat bread",
    "fdcId": 172688,
    "description": "Bread, whole-wheat, commercially prepared",
    "per100": {
      "kcal": 252.0,
      "protein": 12.45,
      "fat": 3.5,
      "carbs": 42.71
    },
    "illustration": "bread",
    "sourceNote": ""
  },
  {
    "id": "peanut",
    "name": "顺滑花生酱",
    "category": "坚果种子与油",
    "state": "成品 · 无盐",
    "portion": {
      "grams": 15,
      "label": "一次涂抹示例"
    },
    "note": "无盐不代表零糖；此处不额外推断添加糖含量。",
    "aliases": "坚果酱 peanut butter",
    "fdcId": 172470,
    "description": "Peanut butter, smooth style, without salt",
    "per100": {
      "kcal": 598.0,
      "protein": 22.21,
      "fat": 51.36,
      "carbs": 22.31
    },
    "illustration": "peanut",
    "sourceNote": ""
  },
  {
    "id": "espresso",
    "name": "浓缩咖啡",
    "category": "饮品",
    "state": "espresso · 餐饮冲煮液",
    "portion": {
      "grams": 30,
      "label": "一份咖啡液示例"
    },
    "note": "不含奶和糖；萃取配方不同，成分会变化。",
    "aliases": "意式 浓缩 espresso",
    "fdcId": 171891,
    "description": "Beverages, coffee, brewed, espresso, restaurant-prepared",
    "per100": {
      "kcal": 9.0,
      "protein": 0.12,
      "fat": 0.18,
      "carbs": 1.67
    },
    "illustration": "espresso",
    "sourceNote": ""
  },
  {
    "id": "white-bread",
    "name": "白面包（吐司）",
    "category": "面包与烘焙",
    "state": "成品 · 未烤 · 市售通用",
    "portion": {
      "grams": 35.0,
      "label": "一片示例"
    },
    "note": "这里是未烘烤的白面包；夹馅、抹酱和品牌配方另计。",
    "aliases": "白吐司 白面包 white bread",
    "fdcId": 174924,
    "description": "Bread, white, commercially prepared (includes soft bread crumbs)",
    "per100": {
      "kcal": 266.0,
      "protein": 8.85,
      "fat": 3.33,
      "carbs": 49.42
    },
    "illustration": "bread",
    "sourceNote": ""
  },
  {
    "id": "white-toast",
    "name": "烤白吐司",
    "category": "面包与烘焙",
    "state": "成品 · 烤过的白面包",
    "portion": {
      "grams": 30.0,
      "label": "一片烤吐司示例"
    },
    "note": "烘烤失水后每 100 g 不同；按烤后的重量计算，不包含黄油。",
    "aliases": "烤面包 多士 toast toasted bread",
    "fdcId": 174925,
    "description": "Bread, white, commercially prepared, toasted",
    "per100": {
      "kcal": 290.0,
      "protein": 9.0,
      "fat": 4.0,
      "carbs": 54.5
    },
    "illustration": "bread",
    "sourceNote": ""
  },
  {
    "id": "rye-bread",
    "name": "黑麦面包",
    "category": "面包与烘焙",
    "state": "成品 · 通用黑麦面包",
    "portion": {
      "grams": 35.0,
      "label": "一片示例"
    },
    "note": "通用条目不等同于 100% 黑麦或某种深色面包；配方看包装。",
    "aliases": "黑麦 rye bread",
    "fdcId": 172684,
    "description": "Bread, rye",
    "per100": {
      "kcal": 259.0,
      "protein": 8.5,
      "fat": 3.3,
      "carbs": 48.3
    },
    "illustration": "bread",
    "sourceNote": ""
  },
  {
    "id": "french-bread",
    "name": "法式 / 维也纳式面包",
    "category": "面包与烘焙",
    "state": "成品 · 未烤 · 含酸种通用记录",
    "portion": {
      "grams": 60.0,
      "label": "一段示例"
    },
    "note": "USDA 此记录合并法式、维也纳式和部分酸种面包，不是某一款法棍的配方。",
    "aliases": "法棍 法式 维也纳 酸种 sourdough french vienna baguette",
    "fdcId": 172675,
    "description": "Bread, french or vienna (includes sourdough)",
    "per100": {
      "kcal": 272.0,
      "protein": 10.75,
      "fat": 2.42,
      "carbs": 51.88
    },
    "illustration": "french-bread",
    "sourceNote": ""
  },
  {
    "id": "bagel",
    "name": "贝果",
    "category": "面包与烘焙",
    "state": "成品 · 未烤",
    "portion": {
      "grams": 90.0,
      "label": "一个贝果示例"
    },
    "note": "不含夹馅；大小和配方不同，以实际克数或包装营养表为准。",
    "aliases": "贝果 百吉圈 bagel",
    "fdcId": 174899,
    "description": "Bagels, plain, enriched, with calcium propionate (includes onion, poppy, sesame)",
    "per100": {
      "kcal": 264.0,
      "protein": 10.56,
      "fat": 1.32,
      "carbs": 52.38
    },
    "illustration": "bagel",
    "sourceNote": "本条目对应 USDA 的强化面粉原味类贝果记录，包含洋葱、罂粟籽及芝麻变体；不适用于夹馅或其他配方的贝果。"
  },
  {
    "id": "croissant",
    "name": "黄油可颂",
    "category": "面包与烘焙",
    "state": "成品 · 黄油类通用条目",
    "portion": {
      "grams": 55.0,
      "label": "一个示例"
    },
    "note": "不含额外夹心；可颂大小、黄油用量和品牌差异明显。",
    "aliases": "牛角包 可颂 croissant butter",
    "fdcId": 174987,
    "description": "Croissants, butter",
    "per100": {
      "kcal": 406.0,
      "protein": 8.2,
      "fat": 21.0,
      "carbs": 45.8
    },
    "illustration": "croissant",
    "sourceNote": ""
  },
  {
    "id": "pita",
    "name": "全麦皮塔饼",
    "category": "面包与烘焙",
    "state": "成品 · 全麦",
    "portion": {
      "grams": 60.0,
      "label": "一张示例"
    },
    "note": "只计饼本身，口袋内的肉、菜和酱汁分别计算。",
    "aliases": "口袋面包 皮塔 pita whole wheat",
    "fdcId": 174916,
    "description": "Bread, pita, whole-wheat",
    "per100": {
      "kcal": 262.0,
      "protein": 9.8,
      "fat": 1.71,
      "carbs": 55.89
    },
    "illustration": "pita",
    "sourceNote": ""
  },
  {
    "id": "brown-rice",
    "name": "糙米饭",
    "category": "主食",
    "state": "熟 · 长粒糙米",
    "portion": {
      "grams": 150.0,
      "label": "一小碗熟饭示例"
    },
    "note": "按煮熟后的可食部称重；同重干糙米不能直接套用。",
    "aliases": "糙米 brown rice",
    "fdcId": 169704,
    "description": "Rice, brown, long-grain, cooked (Includes foods for USDA's Food Distribution Program)",
    "per100": {
      "kcal": 123.0,
      "protein": 2.74,
      "fat": 0.97,
      "carbs": 25.58
    },
    "illustration": "rice",
    "sourceNote": ""
  },
  {
    "id": "pasta",
    "name": "意大利面（熟）",
    "category": "主食",
    "state": "熟 · 强化面粉 · 未加盐",
    "portion": {
      "grams": 150.0,
      "label": "一份熟面示例"
    },
    "note": "只含煮熟面条，不含肉酱、奶油、油和奶酪。",
    "aliases": "意面 通心粉 spaghetti pasta",
    "fdcId": 169737,
    "description": "Pasta, cooked, enriched, without added salt",
    "per100": {
      "kcal": 158.0,
      "protein": 5.8,
      "fat": 0.93,
      "carbs": 30.86
    },
    "illustration": "pasta",
    "sourceNote": ""
  },
  {
    "id": "quinoa",
    "name": "熟藜麦",
    "category": "主食",
    "state": "熟 · 可食部",
    "portion": {
      "grams": 150.0,
      "label": "一小碗示例"
    },
    "note": "此为熟藜麦；烹调吸水量会影响每 100 g。",
    "aliases": "藜麦 quinoa",
    "fdcId": 168917,
    "description": "Quinoa, cooked",
    "per100": {
      "kcal": 120.0,
      "protein": 4.4,
      "fat": 1.92,
      "carbs": 21.3
    },
    "illustration": "rice",
    "sourceNote": ""
  },
  {
    "id": "sweet-potato",
    "name": "烤红薯（去皮）",
    "category": "主食",
    "state": "熟 · 带皮烤后取肉 · 无盐",
    "portion": {
      "grams": 150.0,
      "label": "一份熟薯肉示例"
    },
    "note": "称取去皮后的熟薯肉；不含糖浆、黄油或奶。",
    "aliases": "红薯 甘薯 地瓜 sweet potato",
    "fdcId": 168483,
    "description": "Sweet potato, cooked, baked in skin, flesh, without salt",
    "per100": {
      "kcal": 90.0,
      "protein": 2.01,
      "fat": 0.15,
      "carbs": 20.71
    },
    "illustration": "potato",
    "sourceNote": ""
  },
  {
    "id": "corn",
    "name": "水煮甜玉米粒",
    "category": "主食",
    "state": "熟 · 黄色甜玉米 · 沥干 · 无盐",
    "portion": {
      "grams": 150.0,
      "label": "一份玉米粒示例"
    },
    "note": "按剥下来的熟玉米粒称量，不包含玉米芯。",
    "aliases": "玉米 甜玉米 corn",
    "fdcId": 169999,
    "description": "Corn, sweet, yellow, cooked, boiled, drained, without salt",
    "per100": {
      "kcal": 96.0,
      "protein": 3.41,
      "fat": 1.5,
      "carbs": 20.98
    },
    "illustration": "corn",
    "sourceNote": ""
  },
  {
    "id": "chickpeas",
    "name": "熟鹰嘴豆",
    "category": "豆类与豆制品",
    "state": "熟 · 成熟种子 · 水煮 · 无盐",
    "portion": {
      "grams": 150.0,
      "label": "一小碗示例"
    },
    "note": "这里是熟鹰嘴豆，不是鹰嘴豆泥；油和芝麻酱另计。",
    "aliases": "鹰嘴豆 鸡豆 chickpea garbanzo",
    "fdcId": 173757,
    "description": "Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt",
    "per100": {
      "kcal": 164.0,
      "protein": 8.86,
      "fat": 2.59,
      "carbs": 27.42
    },
    "illustration": "lentils",
    "sourceNote": ""
  },
  {
    "id": "kidney-beans",
    "name": "熟红腰豆",
    "category": "豆类与豆制品",
    "state": "熟 · 成熟种子 · 水煮 · 无盐",
    "portion": {
      "grams": 150.0,
      "label": "一小碗示例"
    },
    "note": "采用充分煮熟的红腰豆条目，不是生豆或含糖罐头豆。",
    "aliases": "红腰豆 芸豆 kidney bean",
    "fdcId": 175194,
    "description": "Beans, kidney, red, mature seeds, cooked, boiled, without salt",
    "per100": {
      "kcal": 127.0,
      "protein": 8.67,
      "fat": 0.5,
      "carbs": 22.8
    },
    "illustration": "lentils",
    "sourceNote": ""
  },
  {
    "id": "edamame",
    "name": "熟毛豆仁（冷冻制品）",
    "category": "豆类与豆制品",
    "state": "冷冻毛豆 · 按包装制备后",
    "portion": {
      "grams": 100.0,
      "label": "一份去荚豆仁示例"
    },
    "note": "对应冷冻产品制备后的可食豆仁；不计豆荚和额外盐、油。",
    "aliases": "毛豆 枝豆 edamame",
    "fdcId": 168411,
    "description": "Edamame, frozen, prepared",
    "per100": {
      "kcal": 121.0,
      "protein": 11.91,
      "fat": 5.2,
      "carbs": 8.91
    },
    "illustration": "edamame",
    "sourceNote": ""
  },
  {
    "id": "soft-tofu",
    "name": "软豆腐（钙盐与卤水凝固）",
    "category": "豆类与豆制品",
    "state": "未再烹调 · soft",
    "portion": {
      "grams": 150.0,
      "label": "一份示例"
    },
    "note": "对应硫酸钙与氯化镁凝固的软豆腐；不同嫩豆腐和内酯豆腐含水量不同。",
    "aliases": "嫩豆腐 软豆腐 soft tofu",
    "fdcId": 172449,
    "description": "Tofu, soft, prepared with calcium sulfate and magnesium chloride (nigari)",
    "per100": {
      "kcal": 61.0,
      "protein": 7.17,
      "fat": 3.69,
      "carbs": 1.18
    },
    "illustration": "tofu",
    "sourceNote": ""
  },
  {
    "id": "tempeh",
    "name": "天贝",
    "category": "豆类与豆制品",
    "state": "发酵大豆制品 · 通用条目",
    "portion": {
      "grams": 100.0,
      "label": "一份示例"
    },
    "note": "不含后续煎炒的油或酱汁；不能替代豆豉或腐乳。",
    "aliases": "丹贝 添贝 发酵大豆 tempeh",
    "fdcId": 174272,
    "description": "Tempeh",
    "per100": {
      "kcal": 192.0,
      "protein": 20.29,
      "fat": 10.8,
      "carbs": 7.64
    },
    "illustration": "tempeh",
    "sourceNote": ""
  },
  {
    "id": "mushroom",
    "name": "白蘑菇",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 100.0,
      "label": "一份示例"
    },
    "note": "为白蘑菇生重，不是干香菇；烹调用油另计。",
    "aliases": "蘑菇 口蘑 mushroom",
    "fdcId": 169251,
    "description": "Mushrooms, white, raw",
    "per100": {
      "kcal": 22.0,
      "protein": 3.09,
      "fat": 0.34,
      "carbs": 3.26
    },
    "illustration": "mushroom",
    "sourceNote": ""
  },
  {
    "id": "carrot",
    "name": "胡萝卜",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 100.0,
      "label": "一份生料示例"
    },
    "note": "采用生胡萝卜条目；熟制、榨汁或加糖后应另计。",
    "aliases": "红萝卜 carrot",
    "fdcId": 170393,
    "description": "Carrots, raw",
    "per100": {
      "kcal": 41.0,
      "protein": 0.93,
      "fat": 0.24,
      "carbs": 9.58
    },
    "illustration": "carrot",
    "sourceNote": ""
  },
  {
    "id": "cucumber",
    "name": "黄瓜（带皮）",
    "category": "蔬菜",
    "state": "生 · 带皮可食部",
    "portion": {
      "grams": 150.0,
      "label": "一份示例"
    },
    "note": "按可食部称重，不含凉拌汁与拌入的油。",
    "aliases": "青瓜 cucumber",
    "fdcId": 168409,
    "description": "Cucumber, with peel, raw",
    "per100": {
      "kcal": 15.0,
      "protein": 0.65,
      "fat": 0.11,
      "carbs": 3.63
    },
    "illustration": "cucumber",
    "sourceNote": ""
  },
  {
    "id": "orange",
    "name": "鲜橙",
    "category": "水果",
    "state": "生 · 去皮可食部 · 通用品种",
    "portion": {
      "grams": 150.0,
      "label": "一个去皮橙子示例"
    },
    "note": "按去皮果肉称量；不是橙汁，也不包含果皮。",
    "aliases": "橙子 甜橙 orange",
    "fdcId": 169097,
    "description": "Oranges, raw, all commercial varieties",
    "per100": {
      "kcal": 47.0,
      "protein": 0.94,
      "fat": 0.12,
      "carbs": 11.75
    },
    "illustration": "orange",
    "sourceNote": ""
  },
  {
    "id": "blueberry",
    "name": "蓝莓",
    "category": "水果",
    "state": "生 · 可食部",
    "portion": {
      "grams": 100.0,
      "label": "一小碗示例"
    },
    "note": "这里是新鲜生蓝莓；果干、糖渍或糖浆罐头需另选。",
    "aliases": "蓝莓 blueberry blueberries",
    "fdcId": 171711,
    "description": "Blueberries, raw",
    "per100": {
      "kcal": 57.0,
      "protein": 0.74,
      "fat": 0.33,
      "carbs": 14.49
    },
    "illustration": "blueberry",
    "sourceNote": ""
  },
  {
    "id": "kiwi",
    "name": "绿心猕猴桃",
    "category": "水果",
    "state": "生 · 绿心品种 · 可食部",
    "portion": {
      "grams": 100.0,
      "label": "一份果肉示例"
    },
    "note": "按可食果肉称量；不把果皮和果蒂重量直接算入示例。",
    "aliases": "奇异果 猕猴桃 kiwi kiwifruit",
    "fdcId": 168153,
    "description": "Kiwifruit, green, raw",
    "per100": {
      "kcal": 61.0,
      "protein": 1.14,
      "fat": 0.52,
      "carbs": 14.66
    },
    "illustration": "kiwi",
    "sourceNote": ""
  },
  {
    "id": "avocado",
    "name": "牛油果",
    "category": "水果",
    "state": "生 · 去皮去核 · 通用品种",
    "portion": {
      "grams": 100.0,
      "label": "一份果肉示例"
    },
    "note": "按果肉称重；牛油果酱中的油、其他配料另计。",
    "aliases": "鳄梨 牛油果 avocado",
    "fdcId": 171705,
    "description": "Avocados, raw, all commercial varieties",
    "per100": {
      "kcal": 160.0,
      "protein": 2.0,
      "fat": 14.66,
      "carbs": 8.53
    },
    "illustration": "avocado",
    "sourceNote": ""
  },
  {
    "id": "tuna",
    "name": "水浸淡色金枪鱼罐头",
    "category": "肉蛋与水产",
    "state": "罐装 · 沥干固形物",
    "portion": {
      "grams": 100.0,
      "label": "一份沥干鱼肉示例"
    },
    "note": "不是油浸金枪鱼，也不是默认无盐产品；按沥干后的鱼肉称重。",
    "aliases": "吞拿鱼 金枪鱼 tuna canned",
    "fdcId": 173709,
    "description": "Fish, tuna, light, canned in water, drained solids (Includes foods for USDA's Food Distribution Program)",
    "per100": {
      "kcal": 86.0,
      "protein": 19.44,
      "fat": 0.96,
      "carbs": 0.0
    },
    "illustration": "tuna",
    "sourceNote": ""
  },
  {
    "id": "shrimp",
    "name": "熟虾仁",
    "category": "肉蛋与水产",
    "state": "熟 · 可食部",
    "portion": {
      "grams": 100.0,
      "label": "一份去壳虾肉示例"
    },
    "note": "只计熟虾可食肉，不含壳与蘸料；加工保水方式可影响含水量。",
    "aliases": "虾 虾仁 shrimp prawn",
    "fdcId": 175180,
    "description": "Crustaceans, shrimp, cooked",
    "per100": {
      "kcal": 99.0,
      "protein": 23.98,
      "fat": 0.28,
      "carbs": 0.2
    },
    "illustration": "shrimp",
    "sourceNote": ""
  },
  {
    "id": "pork",
    "name": "烤猪里脊（去可分离脂肪）",
    "category": "肉蛋与水产",
    "state": "熟 · 烤制 · 仅瘦肉",
    "portion": {
      "grams": 120.0,
      "label": "一份熟肉示例"
    },
    "note": "对应猪里脊去可分离脂肪后的熟瘦肉，不等于所有部位的猪肉。",
    "aliases": "猪肉 里脊 pork tenderloin",
    "fdcId": 168250,
    "description": "Pork, fresh, loin, tenderloin, separable lean only, cooked, roasted",
    "per100": {
      "kcal": 143.0,
      "protein": 26.17,
      "fat": 3.51,
      "carbs": 0.0
    },
    "illustration": "chicken",
    "sourceNote": ""
  },
  {
    "id": "lowfat-milk",
    "name": "低脂牛奶（1%乳脂）",
    "category": "奶制品",
    "state": "液态 · 乳脂 1% · 添加维生素 A、D",
    "portion": {
      "grams": 250.0,
      "label": "一杯示例"
    },
    "note": "不是脱脂奶；若包装标签不同，优先用实际产品数据。",
    "aliases": "低脂奶 牛乳 lowfat milk",
    "fdcId": 170872,
    "description": "Milk, lowfat, fluid, 1% milkfat, with added vitamin A and vitamin D",
    "per100": {
      "kcal": 42.0,
      "protein": 3.37,
      "fat": 0.97,
      "carbs": 4.99
    },
    "illustration": "milk",
    "sourceNote": ""
  },
  {
    "id": "plain-yogurt",
    "name": "原味全脂酸奶",
    "category": "奶制品",
    "state": "原味 · 全脂 · 普通酸奶",
    "portion": {
      "grams": 170.0,
      "label": "一小碗示例"
    },
    "note": "普通全脂酸奶，不是希腊酸奶，也不代表加糖风味酸奶。",
    "aliases": "酸乳 优格 plain whole milk yogurt",
    "fdcId": 171284,
    "description": "Yogurt, plain, whole milk",
    "per100": {
      "kcal": 61.0,
      "protein": 3.47,
      "fat": 3.25,
      "carbs": 4.66
    },
    "illustration": "yogurt",
    "sourceNote": ""
  },
  {
    "id": "green-tea",
    "name": "清泡绿茶",
    "category": "饮品",
    "state": "冲泡液 · 常规含咖啡因 · 无额外糖奶",
    "portion": {
      "grams": 240.0,
      "label": "一杯茶汤示例"
    },
    "note": "只计泡好的茶汤，不计干茶叶重量；不等同于瓶装甜茶。",
    "aliases": "茶 绿茶 green tea",
    "fdcId": 171917,
    "description": "Beverages, tea, green, brewed, regular",
    "per100": {
      "kcal": 1.0,
      "protein": 0.22,
      "fat": 0.0,
      "carbs": 0.0
    },
    "illustration": "tea",
    "sourceNote": ""
  },
  {
    "id": "orange-juice",
    "name": "鲜橙汁",
    "category": "饮品",
    "state": "生鲜果汁 · 通用条目",
    "portion": {
      "grams": 200.0,
      "label": "一杯示例"
    },
    "note": "果汁含水果本身的糖；不等于橙味饮料，也不包含另外加入的糖浆。",
    "aliases": "橙汁 鲜榨果汁 orange juice",
    "fdcId": 169098,
    "description": "Orange juice, raw (Includes foods for USDA's Food Distribution Program)",
    "per100": {
      "kcal": 45.0,
      "protein": 0.7,
      "fat": 0.2,
      "carbs": 10.4
    },
    "illustration": "juice",
    "sourceNote": ""
  },
  {
    "id": "walnut",
    "name": "核桃仁",
    "category": "坚果种子与油",
    "state": "原味 · 英国核桃类可食仁",
    "portion": {
      "grams": 20.0,
      "label": "一小把示例"
    },
    "note": "不含壳，也不包括糖衣、蜂蜜或烘烤另加的油。",
    "aliases": "核桃 胡桃 walnut",
    "fdcId": 170187,
    "description": "Nuts, walnuts, english",
    "per100": {
      "kcal": 654.0,
      "protein": 15.23,
      "fat": 65.21,
      "carbs": 13.71
    },
    "illustration": "walnut",
    "sourceNote": ""
  },
  {
    "id": "peanuts",
    "name": "生花生仁",
    "category": "坚果种子与油",
    "state": "生 · 去壳 · 通用品种",
    "portion": {
      "grams": 20.0,
      "label": "一小把示例"
    },
    "note": "为生花生仁；炒花生、油炸花生和水煮花生含水与用油不同。",
    "aliases": "花生 花生米 peanut raw",
    "fdcId": 172430,
    "description": "Peanuts, all types, raw",
    "per100": {
      "kcal": 567.0,
      "protein": 25.8,
      "fat": 49.24,
      "carbs": 16.13
    },
    "illustration": "peanuts",
    "sourceNote": ""
  },
  {
    "id": "lettuce",
    "name": "绿叶生菜",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "按清理后的生菜叶称量；沙拉酱与油另计。",
    "aliases": "生菜 lettuce salad",
    "fdcId": 169249,
    "description": "Lettuce, green leaf, raw",
    "per100": {
      "kcal": 15.0,
      "protein": 1.36,
      "fat": 0.15,
      "carbs": 2.87
    },
    "illustration": "lettuce",
    "sourceNote": ""
  },
  {
    "id": "cabbage",
    "name": "圆白菜",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "对应生圆白菜，不等同于炒卷心菜。",
    "aliases": "包菜 卷心菜 cabbage",
    "fdcId": 169975,
    "description": "Cabbage, raw",
    "per100": {
      "kcal": 25.0,
      "protein": 1.28,
      "fat": 0.1,
      "carbs": 5.8
    },
    "illustration": "cabbage",
    "sourceNote": ""
  },
  {
    "id": "cauliflower",
    "name": "菜花",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "按清理后的生重，水煮或炒制应选对应状态。",
    "aliases": "花菜 花椰菜 cauliflower",
    "fdcId": 169986,
    "description": "Cauliflower, raw",
    "per100": {
      "kcal": 25.0,
      "protein": 1.92,
      "fat": 0.28,
      "carbs": 4.97
    },
    "illustration": "cauliflower",
    "sourceNote": ""
  },
  {
    "id": "celery",
    "name": "芹菜",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "按生芹菜称量；调味料与烹调油单独计算。",
    "aliases": "西芹 celery",
    "fdcId": 169988,
    "description": "Celery, raw",
    "per100": {
      "kcal": 14.0,
      "protein": 0.69,
      "fat": 0.17,
      "carbs": 2.97
    },
    "illustration": "celery",
    "sourceNote": ""
  },
  {
    "id": "eggplant",
    "name": "水煮茄子",
    "category": "蔬菜",
    "state": "熟 · 水煮沥干 · 无盐",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "不包含油；油煎和红烧茄子不能直接沿用此数值。",
    "aliases": "茄子 eggplant aubergine",
    "fdcId": 169229,
    "description": "Eggplant, cooked, boiled, drained, without salt",
    "per100": {
      "kcal": 35.0,
      "protein": 0.83,
      "fat": 0.23,
      "carbs": 8.73
    },
    "illustration": "eggplant",
    "sourceNote": ""
  },
  {
    "id": "green-pepper",
    "name": "青甜椒",
    "category": "蔬菜",
    "state": "生 · 去籽可食部",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "这是青甜椒通用条目，不等同于所有辣椒品种。",
    "aliases": "青椒 甜椒 彩椒 green pepper",
    "fdcId": 170427,
    "description": "Peppers, sweet, green, raw",
    "per100": {
      "kcal": 20.0,
      "protein": 0.86,
      "fat": 0.17,
      "carbs": 4.64
    },
    "illustration": "green-pepper",
    "sourceNote": ""
  },
  {
    "id": "pumpkin",
    "name": "水煮南瓜",
    "category": "蔬菜",
    "state": "熟 · 水煮沥干 · 无盐",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "南瓜品种和含水量有差别，按所列熟重条目估算。",
    "aliases": "南瓜 pumpkin",
    "fdcId": 168449,
    "description": "Pumpkin, cooked, boiled, drained, without salt",
    "per100": {
      "kcal": 20.0,
      "protein": 0.72,
      "fat": 0.07,
      "carbs": 4.9
    },
    "illustration": "pumpkin",
    "sourceNote": ""
  },
  {
    "id": "asparagus",
    "name": "芦笋",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "去除难食根部后称量；烹调油另计。",
    "aliases": "芦笋 asparagus",
    "fdcId": 168389,
    "description": "Asparagus, raw",
    "per100": {
      "kcal": 20.0,
      "protein": 2.2,
      "fat": 0.12,
      "carbs": 3.88
    },
    "illustration": "asparagus",
    "sourceNote": ""
  },
  {
    "id": "green-beans",
    "name": "水煮四季豆",
    "category": "蔬菜",
    "state": "熟 · 水煮沥干 · 无盐",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "按完全煮熟、沥干的四季豆称重，不含炒菜油。",
    "aliases": "芸豆 菜豆 四季豆 green beans",
    "fdcId": 169141,
    "description": "Beans, snap, green, cooked, boiled, drained, without salt",
    "per100": {
      "kcal": 35.0,
      "protein": 1.89,
      "fat": 0.28,
      "carbs": 7.88
    },
    "illustration": "green-beans",
    "sourceNote": ""
  },
  {
    "id": "bok-choy",
    "name": "水煮小白菜",
    "category": "蔬菜",
    "state": "熟 · 水煮沥干 · 无盐",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "对应 pak-choi，小白菜类；不等同于全部白菜品种。",
    "aliases": "青菜 油菜 小白菜 bok choy pak choi",
    "fdcId": 170391,
    "description": "Cabbage, chinese (pak-choi), cooked, boiled, drained, without salt",
    "per100": {
      "kcal": 12.0,
      "protein": 1.56,
      "fat": 0.16,
      "carbs": 1.78
    },
    "illustration": "bok-choy",
    "sourceNote": ""
  },
  {
    "id": "napa-cabbage",
    "name": "大白菜",
    "category": "蔬菜",
    "state": "生 · 可食部",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "对应 pe-tsai 生大白菜，熟菜中的油与汤汁另计。",
    "aliases": "黄芽菜 大白菜 napa cabbage",
    "fdcId": 169979,
    "description": "Cabbage, chinese (pe-tsai), raw",
    "per100": {
      "kcal": 16.0,
      "protein": 1.2,
      "fat": 0.2,
      "carbs": 3.23
    },
    "illustration": "napa-cabbage",
    "sourceNote": ""
  },
  {
    "id": "pear",
    "name": "梨",
    "category": "水果",
    "state": "生 · 可食部",
    "portion": {
      "grams": 180,
      "label": "一份称量示例"
    },
    "note": "按去核后的可食部分称量；品种和成熟度会影响数值。",
    "aliases": "鸭梨 雪梨 pear",
    "fdcId": 169118,
    "description": "Pears, raw",
    "per100": {
      "kcal": 57.0,
      "protein": 0.36,
      "fat": 0.14,
      "carbs": 15.23
    },
    "illustration": "pear",
    "sourceNote": ""
  },
  {
    "id": "pineapple",
    "name": "菠萝",
    "category": "水果",
    "state": "生 · 可食部",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "不含果皮和硬芯，非糖水罐头。",
    "aliases": "凤梨 pineapple",
    "fdcId": 169124,
    "description": "Pineapple, raw, all varieties",
    "per100": {
      "kcal": 50.0,
      "protein": 0.54,
      "fat": 0.12,
      "carbs": 13.12
    },
    "illustration": "pineapple",
    "sourceNote": ""
  },
  {
    "id": "grapes",
    "name": "葡萄",
    "category": "水果",
    "state": "生 · 红或绿欧亚种",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "不含果梗；这是通用欧亚种鲜葡萄条目。",
    "aliases": "提子 grapes",
    "fdcId": 174683,
    "description": "Grapes, red or green (European type, such as Thompson seedless), raw",
    "per100": {
      "kcal": 69.0,
      "protein": 0.72,
      "fat": 0.16,
      "carbs": 18.1
    },
    "illustration": "grapes",
    "sourceNote": ""
  },
  {
    "id": "grapefruit",
    "name": "葡萄柚",
    "category": "水果",
    "state": "生 · 果肉 · 通用品种",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "去皮后的果肉；葡萄柚与柚子分为不同条目。",
    "aliases": "西柚 grapefruit",
    "fdcId": 173033,
    "description": "Grapefruit, raw, pink and red and white, all areas",
    "per100": {
      "kcal": 32.0,
      "protein": 0.63,
      "fat": 0.1,
      "carbs": 8.08
    },
    "illustration": "grapefruit",
    "sourceNote": ""
  },
  {
    "id": "mango",
    "name": "芒果",
    "category": "水果",
    "state": "生 · 去皮去核",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "按实际吃下的果肉称量，不含核和皮。",
    "aliases": "芒果 mango",
    "fdcId": 169910,
    "description": "Mangos, raw",
    "per100": {
      "kcal": 60.0,
      "protein": 0.82,
      "fat": 0.38,
      "carbs": 14.98
    },
    "illustration": "mango",
    "sourceNote": ""
  },
  {
    "id": "peach",
    "name": "黄桃",
    "category": "水果",
    "state": "生 · 去核可食部",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "这里为鲜黄桃，不是糖水黄桃罐头。",
    "aliases": "桃子 蜜桃 黄桃 peach",
    "fdcId": 169928,
    "description": "Peaches, yellow, raw",
    "per100": {
      "kcal": 39.0,
      "protein": 0.91,
      "fat": 0.25,
      "carbs": 9.54
    },
    "illustration": "peach",
    "sourceNote": ""
  },
  {
    "id": "cherry",
    "name": "甜樱桃",
    "category": "水果",
    "state": "生 · 去核可食部",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "不含果核和果梗，不是糖渍樱桃。",
    "aliases": "车厘子 樱桃 cherry cherries",
    "fdcId": 171719,
    "description": "Cherries, sweet, raw",
    "per100": {
      "kcal": 63.0,
      "protein": 1.06,
      "fat": 0.2,
      "carbs": 16.01
    },
    "illustration": "cherry",
    "sourceNote": ""
  },
  {
    "id": "strawberry",
    "name": "草莓",
    "category": "水果",
    "state": "生 · 去蒂可食部",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "未额外加糖或奶油，按去蒂后的重量计算。",
    "aliases": "草莓 strawberry strawberries",
    "fdcId": 167762,
    "description": "Strawberries, raw",
    "per100": {
      "kcal": 32.0,
      "protein": 0.67,
      "fat": 0.3,
      "carbs": 7.68
    },
    "illustration": "strawberry",
    "sourceNote": ""
  },
  {
    "id": "watermelon",
    "name": "西瓜",
    "category": "水果",
    "state": "生 · 瓜瓤",
    "portion": {
      "grams": 200,
      "label": "一份称量示例"
    },
    "note": "这里按瓜瓤可食部，不含瓜皮。",
    "aliases": "西瓜 watermelon",
    "fdcId": 167765,
    "description": "Watermelon, raw",
    "per100": {
      "kcal": 30.0,
      "protein": 0.61,
      "fat": 0.15,
      "carbs": 7.55
    },
    "illustration": "watermelon",
    "sourceNote": ""
  },
  {
    "id": "cantaloupe",
    "name": "哈密瓜类甜瓜",
    "category": "水果",
    "state": "生 · cantaloupe 瓜肉",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "对应 USDA cantaloupe 通用条目，不声称适用于每个国产甜瓜品种。",
    "aliases": "香瓜 哈密瓜 甜瓜 cantaloupe melon",
    "fdcId": 169092,
    "description": "Melons, cantaloupe, raw",
    "per100": {
      "kcal": 34.0,
      "protein": 0.84,
      "fat": 0.19,
      "carbs": 8.16
    },
    "illustration": "cantaloupe",
    "sourceNote": ""
  },
  {
    "id": "plum",
    "name": "李子",
    "category": "水果",
    "state": "生 · 去核可食部",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "不是果脯或蜜饯；按去核后的重量计算。",
    "aliases": "李子 plum",
    "fdcId": 169949,
    "description": "Plums, raw",
    "per100": {
      "kcal": 46.0,
      "protein": 0.7,
      "fat": 0.28,
      "carbs": 11.42
    },
    "illustration": "plum",
    "sourceNote": ""
  },
  {
    "id": "lychee",
    "name": "荔枝",
    "category": "水果",
    "state": "生 · 去壳去核",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "按果肉称量，干荔枝的每 100 g 数值不同。",
    "aliases": "荔枝 lychee litchi",
    "fdcId": 169086,
    "description": "Litchis, raw",
    "per100": {
      "kcal": 66.0,
      "protein": 0.83,
      "fat": 0.44,
      "carbs": 16.53
    },
    "illustration": "lychee",
    "sourceNote": ""
  },
  {
    "id": "pomelo",
    "name": "柚子",
    "category": "水果",
    "state": "生 · 去皮果肉",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "不含外皮、内层厚皮和籽，与葡萄柚分开记录。",
    "aliases": "蜜柚 文旦 柚子 pomelo pummelo",
    "fdcId": 167754,
    "description": "Pummelo, raw",
    "per100": {
      "kcal": 38.0,
      "protein": 0.76,
      "fat": 0.04,
      "carbs": 9.62
    },
    "illustration": "pomelo",
    "sourceNote": ""
  },
  {
    "id": "starfruit",
    "name": "杨桃",
    "category": "水果",
    "state": "生 · 可食部",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "按实际吃下的可食部分称量。",
    "aliases": "杨桃 starfruit carambola",
    "fdcId": 171715,
    "description": "Carambola, (starfruit), raw",
    "per100": {
      "kcal": 31.0,
      "protein": 1.04,
      "fat": 0.33,
      "carbs": 6.73
    },
    "illustration": "starfruit",
    "sourceNote": ""
  },
  {
    "id": "papaya",
    "name": "木瓜",
    "category": "水果",
    "state": "生 · 去皮去籽",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "对应成熟木瓜果肉，不是青木瓜菜肴。",
    "aliases": "番木瓜 木瓜 papaya",
    "fdcId": 169926,
    "description": "Papayas, raw",
    "per100": {
      "kcal": 43.0,
      "protein": 0.47,
      "fat": 0.26,
      "carbs": 10.82
    },
    "illustration": "papaya",
    "sourceNote": ""
  },
  {
    "id": "lemon",
    "name": "柠檬果肉",
    "category": "水果",
    "state": "生 · 去皮",
    "portion": {
      "grams": 50,
      "label": "一份称量示例"
    },
    "note": "按去皮果肉计；单独柠檬汁有自己的条目。",
    "aliases": "柠檬 lemon",
    "fdcId": 167746,
    "description": "Lemons, raw, without peel",
    "per100": {
      "kcal": 29.0,
      "protein": 1.1,
      "fat": 0.3,
      "carbs": 9.32
    },
    "illustration": "lemon",
    "sourceNote": ""
  },
  {
    "id": "egg-white",
    "name": "生鸡蛋蛋清",
    "category": "肉蛋与水产",
    "state": "生 · 新鲜蛋清",
    "portion": {
      "grams": 33,
      "label": "一份称量示例"
    },
    "note": "用于配方称量的生蛋清条目，不是熟蒸蛋白。",
    "aliases": "蛋白 蛋清 egg white",
    "fdcId": 172183,
    "description": "Egg, white, raw, fresh",
    "per100": {
      "kcal": 52.0,
      "protein": 10.9,
      "fat": 0.17,
      "carbs": 0.73
    },
    "illustration": "egg-white",
    "sourceNote": ""
  },
  {
    "id": "duck",
    "name": "烤鸭肉（去皮）",
    "category": "肉蛋与水产",
    "state": "熟 · 烤制 · 仅肉",
    "portion": {
      "grams": 120,
      "label": "一份称量示例"
    },
    "note": "不含鸭皮、蘸酱和烤鸭饼；不能当作整份北京烤鸭。",
    "aliases": "鸭肉 去皮鸭肉 duck",
    "fdcId": 172411,
    "description": "Duck, domesticated, meat only, cooked, roasted",
    "per100": {
      "kcal": 201.0,
      "protein": 23.48,
      "fat": 11.2,
      "carbs": 0.0
    },
    "illustration": "duck",
    "sourceNote": ""
  },
  {
    "id": "cod",
    "name": "太平洋鳕鱼（熟）",
    "category": "肉蛋与水产",
    "state": "熟 · 干热烹调",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "源条目可能包含保水添加物；不同鳕鱼种类应区分。",
    "aliases": "鳕鱼 cod",
    "fdcId": 171990,
    "description": "Fish, cod, Pacific, cooked, dry heat (may contain additives to retain moisture)",
    "per100": {
      "kcal": 85.0,
      "protein": 18.73,
      "fat": 0.5,
      "carbs": 0.0
    },
    "illustration": "cod",
    "sourceNote": ""
  },
  {
    "id": "tilapia",
    "name": "罗非鱼（熟）",
    "category": "肉蛋与水产",
    "state": "熟 · 干热烹调",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "按熟鱼肉可食部称量，不含鱼骨和额外油。",
    "aliases": "罗非鱼 tilapia",
    "fdcId": 175177,
    "description": "Fish, tilapia, cooked, dry heat",
    "per100": {
      "kcal": 128.0,
      "protein": 26.15,
      "fat": 2.65,
      "carbs": 0.0
    },
    "illustration": "tilapia",
    "sourceNote": ""
  },
  {
    "id": "clam",
    "name": "蛤蜊肉（熟）",
    "category": "肉蛋与水产",
    "state": "熟 · 湿热烹调 · 混合品种",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "不含贝壳；源为蛤蜊混合品种熟肉，不含额外蒜油。",
    "aliases": "花蛤 蛤蜊 贝类 clam",
    "fdcId": 171975,
    "description": "Mollusks, clam, mixed species, cooked, moist heat",
    "per100": {
      "kcal": 148.0,
      "protein": 25.55,
      "fat": 1.95,
      "carbs": 5.13
    },
    "illustration": "clam",
    "sourceNote": ""
  },
  {
    "id": "scallop",
    "name": "清蒸扇贝肉",
    "category": "肉蛋与水产",
    "state": "熟 · 蒸制 · 可食部",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "不含贝壳、粉丝和蒜蓉酱，按熟肉称量。",
    "aliases": "鲜贝 扇贝 scallop",
    "fdcId": 167742,
    "description": "Mollusks, scallop, (bay and sea), cooked, steamed",
    "per100": {
      "kcal": 111.0,
      "protein": 20.54,
      "fat": 0.84,
      "carbs": 5.41
    },
    "illustration": "scallop",
    "sourceNote": ""
  },
  {
    "id": "skim-milk",
    "name": "脱脂牛奶",
    "category": "奶制品",
    "state": "液态 · 添加维生素 A、D",
    "portion": {
      "grams": 250,
      "label": "一份称量示例"
    },
    "note": "无脂或脱脂通用条目；品牌营养标签优先。",
    "aliases": "脱脂奶 skim milk nonfat milk",
    "fdcId": 171269,
    "description": "Milk, nonfat, fluid, with added vitamin A and vitamin D (fat free or skim)",
    "per100": {
      "kcal": 34.0,
      "protein": 3.37,
      "fat": 0.08,
      "carbs": 4.96
    },
    "illustration": "skim-milk",
    "sourceNote": ""
  },
  {
    "id": "goat-milk",
    "name": "羊奶",
    "category": "奶制品",
    "state": "液态 · 山羊奶 · 添加维生素 D",
    "portion": {
      "grams": 250,
      "label": "一份称量示例"
    },
    "note": "此处为山羊奶，不是绵羊奶；按液体重量计算。",
    "aliases": "羊乳 山羊奶 goat milk",
    "fdcId": 171278,
    "description": "Milk, goat, fluid, with added vitamin D",
    "per100": {
      "kcal": 69.0,
      "protein": 3.56,
      "fat": 4.14,
      "carbs": 4.45
    },
    "illustration": "goat-milk",
    "sourceNote": ""
  },
  {
    "id": "cheddar",
    "name": "切达奶酪",
    "category": "奶制品",
    "state": "成品 · 通用条目",
    "portion": {
      "grams": 25,
      "label": "一份称量示例"
    },
    "note": "不等同于所有芝士片；购买产品应优先看包装。",
    "aliases": "芝士 乳酪 切达 cheddar cheese",
    "fdcId": 173414,
    "description": "Cheese, cheddar (Includes foods for USDA's Food Distribution Program)",
    "per100": {
      "kcal": 403.0,
      "protein": 22.87,
      "fat": 33.31,
      "carbs": 3.37
    },
    "illustration": "cheddar",
    "sourceNote": ""
  },
  {
    "id": "cream-cheese",
    "name": "奶油奶酪",
    "category": "奶制品",
    "state": "成品 · 普通脂肪",
    "portion": {
      "grams": 20,
      "label": "一份称量示例"
    },
    "note": "不是淡奶油或再制芝士；配方奶酪按实际包装记录。",
    "aliases": "奶油芝士 cream cheese",
    "fdcId": 173418,
    "description": "Cheese, cream",
    "per100": {
      "kcal": 350.0,
      "protein": 6.15,
      "fat": 34.44,
      "carbs": 5.52
    },
    "illustration": "cream-cheese",
    "sourceNote": ""
  },
  {
    "id": "whole-milk-powder",
    "name": "全脂奶粉",
    "category": "奶制品",
    "state": "干粉 · 添加维生素 D",
    "portion": {
      "grams": 25,
      "label": "一份称量示例"
    },
    "note": "按未冲调的奶粉重量，不按冲好后奶液的每 100 g。",
    "aliases": "全脂乳粉 milk powder whole",
    "fdcId": 170876,
    "description": "Milk, dry, whole, with added vitamin D",
    "per100": {
      "kcal": 496.0,
      "protein": 26.32,
      "fat": 26.71,
      "carbs": 38.42
    },
    "illustration": "whole-milk-powder",
    "sourceNote": ""
  },
  {
    "id": "skim-milk-powder",
    "name": "脱脂奶粉",
    "category": "奶制品",
    "state": "干粉 · 常规型 · 未额外添加 A、D",
    "portion": {
      "grams": 25,
      "label": "一份称量示例"
    },
    "note": "按干粉称重；加水只改变浓度，不增加本条目的总营养。",
    "aliases": "脱脂乳粉 skim nonfat milk powder",
    "fdcId": 170877,
    "description": "Milk, dry, nonfat, regular, without added vitamin A and vitamin D",
    "per100": {
      "kcal": 362.0,
      "protein": 36.16,
      "fat": 0.77,
      "carbs": 51.98
    },
    "illustration": "skim-milk-powder",
    "sourceNote": ""
  },
  {
    "id": "cashew",
    "name": "生腰果仁",
    "category": "坚果种子与油",
    "state": "生 · 未额外调味",
    "portion": {
      "grams": 20,
      "label": "一份称量示例"
    },
    "note": "不含外壳；盐焗、油炸和糖衣腰果应另算。",
    "aliases": "坚果 腰果 cashew",
    "fdcId": 170162,
    "description": "Nuts, cashew nuts, raw",
    "per100": {
      "kcal": 553.0,
      "protein": 18.22,
      "fat": 43.85,
      "carbs": 30.19
    },
    "illustration": "cashew",
    "sourceNote": ""
  },
  {
    "id": "hazelnut",
    "name": "榛子仁",
    "category": "坚果种子与油",
    "state": "原味 · 通用条目",
    "portion": {
      "grams": 20,
      "label": "一份称量示例"
    },
    "note": "按去壳果仁称量，不含糖衣和巧克力。",
    "aliases": "坚果 榛子 hazelnut",
    "fdcId": 170581,
    "description": "Nuts, hazelnuts or filberts",
    "per100": {
      "kcal": 628.0,
      "protein": 14.95,
      "fat": 60.75,
      "carbs": 16.7
    },
    "illustration": "hazelnut",
    "sourceNote": ""
  },
  {
    "id": "pistachio",
    "name": "生开心果仁",
    "category": "坚果种子与油",
    "state": "生 · 去壳",
    "portion": {
      "grams": 20,
      "label": "一份称量示例"
    },
    "note": "这里的克数不包含果壳，非盐焗品种。",
    "aliases": "坚果 开心果 pistachio",
    "fdcId": 170184,
    "description": "Nuts, pistachio nuts, raw",
    "per100": {
      "kcal": 560.0,
      "protein": 20.16,
      "fat": 45.32,
      "carbs": 27.17
    },
    "illustration": "pistachio",
    "sourceNote": ""
  },
  {
    "id": "macadamia",
    "name": "生夏威夷果仁",
    "category": "坚果种子与油",
    "state": "生 · 去壳",
    "portion": {
      "grams": 20,
      "label": "一份称量示例"
    },
    "note": "不含果壳；调味、糖衣或奶油烘焙用料另计。",
    "aliases": "澳洲坚果 夏威夷果 macadamia",
    "fdcId": 170178,
    "description": "Nuts, macadamia nuts, raw",
    "per100": {
      "kcal": 718.0,
      "protein": 7.91,
      "fat": 75.77,
      "carbs": 13.82
    },
    "illustration": "macadamia",
    "sourceNote": ""
  },
  {
    "id": "pumpkin-seed",
    "name": "南瓜籽仁",
    "category": "坚果种子与油",
    "state": "干 · 去壳籽仁",
    "portion": {
      "grams": 20,
      "label": "一份称量示例"
    },
    "note": "是南瓜和西葫芦籽仁通用条目，非带壳总重。",
    "aliases": "瓜子 南瓜子 pumpkin seeds pepitas",
    "fdcId": 170556,
    "description": "Seeds, pumpkin and squash seed kernels, dried",
    "per100": {
      "kcal": 559.0,
      "protein": 30.23,
      "fat": 49.05,
      "carbs": 10.71
    },
    "illustration": "pumpkin-seed",
    "sourceNote": ""
  },
  {
    "id": "sunflower-seed",
    "name": "葵花籽仁",
    "category": "坚果种子与油",
    "state": "干 · 去壳籽仁",
    "portion": {
      "grams": 20,
      "label": "一份称量示例"
    },
    "note": "不含壳；盐焗和油烤瓜子需对照对应标签。",
    "aliases": "瓜子 葵花子 sunflower seeds",
    "fdcId": 170562,
    "description": "Seeds, sunflower seed kernels, dried",
    "per100": {
      "kcal": 584.0,
      "protein": 20.78,
      "fat": 51.46,
      "carbs": 20.0
    },
    "illustration": "sunflower-seed",
    "sourceNote": ""
  },
  {
    "id": "sesame",
    "name": "芝麻",
    "category": "坚果种子与油",
    "state": "干 · 整粒 · 通用条目",
    "portion": {
      "grams": 10,
      "label": "一份称量示例"
    },
    "note": "未区分黑芝麻与白芝麻专用品种；不等同于芝麻糊或芝麻酱。",
    "aliases": "黑芝麻 白芝麻 sesame",
    "fdcId": 170150,
    "description": "Seeds, sesame seeds, whole, dried",
    "per100": {
      "kcal": 573.0,
      "protein": 17.73,
      "fat": 49.67,
      "carbs": 23.45
    },
    "illustration": "sesame",
    "sourceNote": ""
  },
  {
    "id": "flaxseed",
    "name": "亚麻籽",
    "category": "坚果种子与油",
    "state": "种子 · 通用条目",
    "portion": {
      "grams": 10,
      "label": "一份称量示例"
    },
    "note": "这是亚麻籽，不是亚麻籽油；附加用油另算。",
    "aliases": "亚麻子 flaxseed linseed",
    "fdcId": 169414,
    "description": "Seeds, flaxseed",
    "per100": {
      "kcal": 534.0,
      "protein": 18.29,
      "fat": 42.16,
      "carbs": 28.88
    },
    "illustration": "flaxseed",
    "sourceNote": ""
  },
  {
    "id": "millet",
    "name": "熟小米",
    "category": "主食",
    "state": "熟 · 谷粒 · 非稀粥",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "这是煮熟谷粒，不是含水更多的小米粥。",
    "aliases": "小米饭 millet",
    "fdcId": 168871,
    "description": "Millet, cooked",
    "per100": {
      "kcal": 119.0,
      "protein": 3.51,
      "fat": 1.0,
      "carbs": 23.67
    },
    "illustration": "millet",
    "sourceNote": ""
  },
  {
    "id": "barley",
    "name": "熟珍珠大麦",
    "category": "主食",
    "state": "熟 · 去麸皮大麦",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "源为 pearled barley，不是薏苡仁或啤酒麦芽。",
    "aliases": "大麦 珍珠麦 barley",
    "fdcId": 170285,
    "description": "Barley, pearled, cooked",
    "per100": {
      "kcal": 123.0,
      "protein": 2.26,
      "fat": 0.44,
      "carbs": 28.22
    },
    "illustration": "barley",
    "sourceNote": ""
  },
  {
    "id": "buckwheat",
    "name": "熟烘焙荞麦粒",
    "category": "主食",
    "state": "熟 · 烘焙荞麦粒",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "按煮熟的荞麦粒称量，非荞麦面条或干荞麦。",
    "aliases": "荞麦 荞麦饭 buckwheat",
    "fdcId": 170686,
    "description": "Buckwheat groats, roasted, cooked",
    "per100": {
      "kcal": 92.0,
      "protein": 3.38,
      "fat": 0.62,
      "carbs": 19.94
    },
    "illustration": "buckwheat",
    "sourceNote": ""
  },
  {
    "id": "adzuki-beans",
    "name": "熟赤小豆",
    "category": "豆类与豆制品",
    "state": "熟 · 水煮 · 无盐",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "无糖赤小豆条目，不是蜜红豆或红豆沙。",
    "aliases": "红豆 赤豆 赤小豆 adzuki azuki",
    "fdcId": 173728,
    "description": "Beans, adzuki, mature seeds, cooked, boiled, without salt",
    "per100": {
      "kcal": 128.0,
      "protein": 7.52,
      "fat": 0.1,
      "carbs": 24.77
    },
    "illustration": "adzuki-beans",
    "sourceNote": ""
  },
  {
    "id": "mung-beans",
    "name": "熟绿豆",
    "category": "豆类与豆制品",
    "state": "熟 · 水煮 · 无盐",
    "portion": {
      "grams": 150,
      "label": "一份称量示例"
    },
    "note": "不是加糖绿豆汤或豆芽；按煮熟豆粒称量。",
    "aliases": "绿豆 mung beans",
    "fdcId": 174257,
    "description": "Mung beans, mature seeds, cooked, boiled, without salt",
    "per100": {
      "kcal": 105.0,
      "protein": 7.02,
      "fat": 0.38,
      "carbs": 19.15
    },
    "illustration": "mung-beans",
    "sourceNote": ""
  },
  {
    "id": "soybeans",
    "name": "熟黄豆",
    "category": "豆类与豆制品",
    "state": "熟 · 成熟种子 · 水煮无盐",
    "portion": {
      "grams": 100,
      "label": "一份称量示例"
    },
    "note": "按煮熟的成熟黄豆称量，与毛豆和干黄豆分开。",
    "aliases": "大豆 黄豆 soybeans",
    "fdcId": 174271,
    "description": "Soybeans, mature cooked, boiled, without salt",
    "per100": {
      "kcal": 172.0,
      "protein": 18.21,
      "fat": 8.97,
      "carbs": 8.36
    },
    "illustration": "soybeans",
    "sourceNote": ""
  },
  {
    "id": "black-tea",
    "name": "清泡红茶",
    "category": "饮品",
    "state": "茶汤 · 自来水冲泡 · 无糖",
    "portion": {
      "grams": 240,
      "label": "一份称量示例"
    },
    "note": "不含奶、蜂蜜、糖浆或珍珠；并非甜味瓶装红茶。",
    "aliases": "红茶 black tea",
    "fdcId": 173227,
    "description": "Beverages, tea, black, brewed, prepared with tap water",
    "per100": {
      "kcal": 1.0,
      "protein": 0.0,
      "fat": 0.0,
      "carbs": 0.3
    },
    "illustration": "black-tea",
    "sourceNote": ""
  },
  {
    "id": "chamomile-tea",
    "name": "洋甘菊茶",
    "category": "饮品",
    "state": "茶汤 · 冲泡",
    "portion": {
      "grams": 240,
      "label": "一份称量示例"
    },
    "note": "源为洋甘菊浸泡茶，不能代表所有花草茶或药茶。",
    "aliases": "花草茶 洋甘菊 chamomile herbal tea",
    "fdcId": 174156,
    "description": "Beverages, tea, herb, brewed, chamomile",
    "per100": {
      "kcal": 1.0,
      "protein": 0.0,
      "fat": 0.0,
      "carbs": 0.2
    },
    "illustration": "chamomile-tea",
    "sourceNote": ""
  },
  {
    "id": "apple-juice",
    "name": "未加糖苹果汁",
    "category": "饮品",
    "state": "罐装或瓶装 · 未加糖 · 添加抗坏血酸",
    "portion": {
      "grams": 200,
      "label": "一份称量示例"
    },
    "note": "未加糖不等于无糖；这里是果汁而非苹果味饮料。",
    "aliases": "苹果汁 apple juice",
    "fdcId": 167771,
    "description": "Apple juice, canned or bottled, unsweetened, with added ascorbic acid",
    "per100": {
      "kcal": 46.0,
      "protein": 0.1,
      "fat": 0.13,
      "carbs": 11.3
    },
    "illustration": "apple-juice",
    "sourceNote": ""
  },
  {
    "id": "grape-juice",
    "name": "未加糖葡萄汁",
    "category": "饮品",
    "state": "罐装或瓶装 · 未加糖 · 未添加抗坏血酸",
    "portion": {
      "grams": 200,
      "label": "一份称量示例"
    },
    "note": "果汁天然含糖；不把所有葡萄味饮料视为本条目。",
    "aliases": "葡萄汁 grape juice",
    "fdcId": 173042,
    "description": "Grape juice, canned or bottled, unsweetened, without added ascorbic acid",
    "per100": {
      "kcal": 60.0,
      "protein": 0.37,
      "fat": 0.13,
      "carbs": 14.77
    },
    "illustration": "grape-juice",
    "sourceNote": ""
  },
  {
    "id": "lemon-juice",
    "name": "鲜柠檬汁",
    "category": "饮品",
    "state": "生 · 鲜榨汁",
    "portion": {
      "grams": 30,
      "label": "一份称量示例"
    },
    "note": "不含水、糖或蜂蜜，不等同于一整杯柠檬水。",
    "aliases": "柠檬汁 lemon juice",
    "fdcId": 167747,
    "description": "Lemon juice, raw",
    "per100": {
      "kcal": 22.0,
      "protein": 0.35,
      "fat": 0.24,
      "carbs": 6.9
    },
    "illustration": "lemon-juice",
    "sourceNote": ""
  },
  {
    "id": "carrot-juice",
    "name": "胡萝卜汁",
    "category": "饮品",
    "state": "罐装汁 · 通用条目",
    "portion": {
      "grams": 200,
      "label": "一份称量示例"
    },
    "note": "对应罐装胡萝卜汁，非任意品牌果蔬混合汁。",
    "aliases": "胡萝卜汁 carrot juice",
    "fdcId": 170491,
    "description": "Carrot juice, canned",
    "per100": {
      "kcal": 40.0,
      "protein": 0.95,
      "fat": 0.15,
      "carbs": 9.28
    },
    "illustration": "carrot-juice",
    "sourceNote": ""
  },
  {
    "id": "raisins",
    "name": "无籽深色葡萄干",
    "category": "零食与果干",
    "state": "果干 · 可食部",
    "portion": {
      "grams": 30,
      "label": "一份称量示例"
    },
    "note": "干燥浓缩后的每 100 g 与鲜葡萄不同。",
    "aliases": "葡萄干 raisins",
    "fdcId": 168165,
    "description": "Raisins, dark, seedless (Includes foods for USDA's Food Distribution Program)",
    "per100": {
      "kcal": 299.0,
      "protein": 3.3,
      "fat": 0.25,
      "carbs": 79.32
    },
    "illustration": "raisins",
    "sourceNote": ""
  },
  {
    "id": "dried-apricot",
    "name": "杏干",
    "category": "零食与果干",
    "state": "硫处理果干 · 未烹调",
    "portion": {
      "grams": 30,
      "label": "一份称量示例"
    },
    "note": "对应硫处理的杏干，不是鲜杏、果酱或糖渍杏脯。",
    "aliases": "杏脯 杏干 dried apricots",
    "fdcId": 173941,
    "description": "Apricots, dried, sulfured, uncooked",
    "per100": {
      "kcal": 241.0,
      "protein": 3.39,
      "fat": 0.51,
      "carbs": 62.64
    },
    "illustration": "dried-apricot",
    "sourceNote": ""
  },
  {
    "id": "prunes",
    "name": "西梅干",
    "category": "零食与果干",
    "state": "干 · 未烹调",
    "portion": {
      "grams": 30,
      "label": "一份称量示例"
    },
    "note": "不是西梅汁、鲜李子或糖水炖西梅。",
    "aliases": "西梅干 prunes dried plums",
    "fdcId": 168162,
    "description": "Plums, dried (prunes), uncooked",
    "per100": {
      "kcal": 240.0,
      "protein": 2.18,
      "fat": 0.38,
      "carbs": 63.88
    },
    "illustration": "prunes",
    "sourceNote": ""
  },
  {
    "id": "dates",
    "name": "椰枣（Deglet Noor）",
    "category": "零食与果干",
    "state": "可食部 · 去核",
    "portion": {
      "grams": 30,
      "label": "一份称量示例"
    },
    "note": "指 Deglet Noor 椰枣，不是中国红枣；不含果核。",
    "aliases": "枣 椰枣 dates deglet noor",
    "fdcId": 171726,
    "description": "Dates, deglet noor",
    "per100": {
      "kcal": 282.0,
      "protein": 2.45,
      "fat": 0.39,
      "carbs": 75.03
    },
    "illustration": "dates",
    "sourceNote": ""
  },
  {
    "id": "popcorn",
    "name": "无盐空气爆米花",
    "category": "零食与果干",
    "state": "空气爆制 · 无盐",
    "portion": {
      "grams": 20,
      "label": "一份称量示例"
    },
    "note": "无额外油、黄油或焦糖；影院爆米花不能直接套用。",
    "aliases": "爆米花 popcorn air popped",
    "fdcId": 170246,
    "description": "Snacks, popcorn, air-popped (Unsalted)",
    "per100": {
      "kcal": 382.0,
      "protein": 12.0,
      "fat": 4.2,
      "carbs": 77.9
    },
    "illustration": "popcorn",
    "sourceNote": ""
  }
];

export const RECIPES = [
  {
    id: 'chicken-bowl', name: '鸡胸西兰花饭碗', illustration: 'bowl', servings: 1,
    intro: '一碗主食、熟肉和蔬菜。以下用已经烹调好的食材称重，适合把备餐组合成一份饭。',
    ingredients: [{food: 'rice', grams: 150}, {food: 'chicken', grams: 120}, {food: 'broccoli', grams: 150}, {food: 'oil', grams: 5}],
    steps: ['准备熟米饭、烤熟的去皮鸡胸和水煮沥干的西兰花，分别称取所列熟重。', '鸡胸切片，和热米饭、西兰花装碗。拌入称好的 5 g 橄榄油。', '按口味少量加盐或胡椒；额外酱汁需按实际用量另计。'],
    note: '油按全部吃下估算；若锅内有剩油，实际摄入量可能略低。'
  },
  {
    id: 'oat-bowl', name: '香蕉花生酱燕麦碗', illustration: 'oat-bowl', servings: 1,
    intro: '干燕麦先称重，再加奶煮软。香蕉和花生酱带来甜味与香气，适合记录自己喜欢的稠度。',
    ingredients: [{food: 'oats', grams: 40}, {food: 'milk', grams: 200}, {food: 'banana', grams: 100}, {food: 'peanut', grams: 10}],
    steps: ['称取干燕麦片 40 g 和全脂牛奶 200 g，放入小锅，小火煮至燕麦熟软，期间搅拌。', '稠度不足可加水，太稀可多煮一会；加水不会增加本配方的营养总量。', '放上去皮香蕉 100 g，拌入花生酱 10 g。趁热品尝并记录口感。'],
    note: '按原料相加估算，假定不弃去煮出的液体；成品重量受加水、蒸发影响。'
  },
  {
    id: 'banana-shake', foodId: 'shake', name: '香蕉酸奶奶昔', illustration: 'shake', servings: 2,
    intro: '没有额外加糖的香蕉奶昔示例。牛奶、酸奶、香蕉本身仍含碳水，冰块和水只改变浓稠度。',
    ingredients: [{food: 'milk', grams: 200}, {food: 'yogurt', grams: 170}, {food: 'banana', grams: 120}],
    steps: ['香蕉去皮后称取 120 g，切成小段。', '与全脂牛奶 200 g、原味脱脂希腊酸奶 170 g 一起放入搅拌机，打至顺滑。', '不加水时原料合计 490 g，默认分两杯；若加水或冰，按整份总量分杯，不能直接沿用食物卡的每 100 g。'],
    note: '食物库中的奶昔卡按 490 g 原配方计算，不包含额外水、冰和糖浆。'
  },
  {
    id: 'plain-latte', foodId: 'latte', name: '全脂拿铁（未额外加糖）', illustration: 'latte', servings: 1,
    intro: '先把奶与咖啡分开称清楚，就能算出一杯奶咖。这里采用 30 g 浓缩咖啡和 200 g 全脂奶；“无糖”指未额外加糖，牛奶本身仍含乳糖。',
    ingredients: [{food: 'espresso', grams: 30}, {food: 'milk', grams: 200}],
    steps: ['准备浓缩咖啡液 30 g。', '另称全脂牛奶 200 g，按喜好使用冷奶或加热打泡后加入咖啡。', '本配方不加糖和糖浆；如果加冰或水，总营养不变，但食物卡的每 100 g 需按最终重量重算。'],
    note: '按原料合计 230 g 估算，忽略少量蒸发和杯壁残留；奶泡体积不能直接当重量。'
  }
];

export function nutritionFor(food, grams) {
  return Object.fromEntries(Object.entries(food.per100).map(([key, value]) => [key, value * grams / 100]));
}

export function recipeNutrition(recipe) {
  return recipe.ingredients.reduce((total, ingredient) => {
    const food = BASE_FOODS.find(item => item.id === ingredient.food);
    const amounts = nutritionFor(food, ingredient.grams);
    for (const key of Object.keys(amounts)) total[key] += amounts[key];
    return total;
  }, {kcal: 0, protein: 0, fat: 0, carbs: 0});
}

const DRINKS = RECIPES.filter(recipe => recipe.foodId).map(recipe => {
  const grams = recipe.ingredients.reduce((sum, item) => sum + item.grams, 0);
  const totals = recipeNutrition(recipe);
  return {
    id: recipe.foodId, name: recipe.name, category: '饮品', state: '本站明确配方 · 估算',
    portion: {grams: grams / recipe.servings, label: '按下方配方分杯'},
    note: recipe.foodId === 'latte' ? '每杯：浓缩咖啡 30 g＋全脂奶 200 g；无糖浆、无额外水冰。' : '整份：牛奶 200 g＋希腊酸奶 170 g＋去皮香蕉 120 g；默认分两杯。',
    aliases: recipe.foodId === 'latte' ? '拿铁 奶咖 latte coffee' : '奶昔 香蕉 milkshake smoothie',
    illustration: recipe.illustration, recipeId: recipe.id,
    per100: Object.fromEntries(Object.entries(totals).map(([key, value]) => [key, value / grams * 100]))
  };
});

export const FOODS = [...BASE_FOODS, ...DRINKS];
export const SOURCE_URL = 'https://fdc.nal.usda.gov/download-datasets/';
export const fdcUrl = id => `https://fdc.nal.usda.gov/food-details/${id}/nutrients`;
