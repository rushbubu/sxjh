const ITEMS = {
    // ═══ 村庄通用物品 ═══
    cloth_coarse:    { id: 'cloth_coarse',    name: '粗布衣',    desc: '粗麻织成的衣服，结实耐穿。',                          value: 1,   stealDiff: 5,  category: 'clothing', slot: 'upperBody', tier: 'white' },
    shoes_straw:     { id: 'shoes_straw',     name: '草鞋',      desc: '稻草编成的鞋子，走山路最合适。',                      value: 1,   stealDiff: 5,  category: 'clothing', slot: 'boots', tier: 'white' },
    band_head:       { id: 'band_head',       name: '布头巾',    desc: '粗布头巾，可遮阳挡尘。',                               value: 1,   stealDiff: 5,  category: 'clothing', slot: 'head', tier: 'white' },
    pants_coarse:    { id: 'pants_coarse',    name: '粗麻裤',    desc: '粗糙的麻布裤子，结实耐磨。',                           value: 1,   stealDiff: 5,  category: 'clothing', slot: 'lowerBody', tier: 'white' },
    bracers_cloth:   { id: 'bracers_cloth',   name: '布护腕',    desc: '粗布护腕，防止袖口磨损。',                             value: 1,   stealDiff: 5,  category: 'clothing', slot: 'bracers', tier: 'white' },
    ration:          { id: 'ration',          name: '干粮',      desc: '粗粮制成的干饼，能填饱肚子。',                        value: 1,   stealDiff: 3,  category: 'food' },
    flint:           { id: 'flint',           name: '火折子',    desc: '引火用的工具，行走江湖必备。',                        value: 2,   stealDiff: 8,  category: 'tool' },
    knife_wood:      { id: 'knife_wood',      name: '柴刀',      desc: '劈柴用的铁刀，刃口有些钝了。',                        value: 3,   stealDiff: 15, category: 'weapon', slot: 'rightHand', tier: 'white', attackDescs: ['砍', '横砍', '劈砍'] },
    hoe_iron:        { id: 'hoe_iron',        name: '铁锄头',    desc: '农夫用的铁锄，也可以当武器使。',                      value: 2,   stealDiff: 10, category: 'weapon', slot: 'rightHand', tier: 'white', attackDescs: ['砸', '挥击', '横扫'] },
    pot_iron:        { id: 'pot_iron',        name: '铁锅',      desc: '生铁铸成的锅，做饭必备。',                            value: 2,   stealDiff: 10, category: 'household' },
    herb_bandage:    { id: 'herb_bandage',    name: '止血草',    desc: '常见的草药，晒干磨粉可止外伤出血。',                   value: 2,   stealDiff: 10, category: 'medicine', use: { cure: 'bleed' } },
    powder_clear:    { id: 'powder_clear',    name: '清心散',    desc: '清凉解热的药散，可缓解轻微中毒。',                    value: 5,   stealDiff: 20, category: 'medicine' },
    wine_rice:       { id: 'wine_rice',       name: '米酒',      desc: '农家自酿的米酒，度数不高但味道淳朴。',                value: 2,   stealDiff: 8,  category: 'wine', use: { healNeili: 5 } },

    // ═══ 村庄特殊物品 ═══
    ginseng_100:     { id: 'ginseng_100',     name: '百年山参',  desc: '生于深山中的百年老参，有续命之效，价值不菲。',        value: 20,  stealDiff: 50, category: 'rare_herb', special: true },
    jade_fish:       { id: 'jade_fish',       name: '江鲤玉佩',  desc: '雕成鲤鱼状的玉佩，玉质温润，入手生温。',               value: 15,  stealDiff: 40, category: 'jewelry', slot: 'accessory', tier: 'green' },
    cloud_manual:    { id: 'cloud_manual',    name: '云纹秘籍残页', desc: '泛黄的纸页，记载着某种轻功心法，可惜只有残篇。', value: 25,  stealDiff: 55, category: 'skill', special: true },
    iron_command:    { id: 'iron_command',    name: '玄铁令',    desc: '刻着古怪符文的铁牌，似乎与某个秘密有关。',             value: 18,  stealDiff: 45, category: 'token', special: true },

    herb_ginseng_small:{ id: 'herb_ginseng_small', name: '小参',      desc: '山中采来的小野参，虽年份不足但也有补气之效。',          value: 8,   stealDiff: 15, category: 'medicine' },
    cheqiancao:      { id: 'cheqiancao',      name: '车前草',    desc: '田埂边常见的野草，晒干后可入药，有利水之效。',             value: 2,   stealDiff: 8,  category: 'medicine' },
    aicao:           { id: 'aicao',           name: '艾草',      desc: '散发着特殊香气的草药，端午时节常用来驱虫避邪。',           value: 2,   stealDiff: 8,  category: 'medicine' },
    pugongying:      { id: 'pugongying',      name: '蒲公英',    desc: '漫山遍野的野菜，嫩叶可食，全株入药可清热解毒。',           value: 1,   stealDiff: 5,  category: 'medicine' },
    fuling:          { id: 'fuling',          name: '茯苓',      desc: '寄生松根而生的菌核，利水渗湿，宁心安神，是常见的药材。',   value: 5,   stealDiff: 15, category: 'medicine' },
    lingzhi:         { id: 'lingzhi',         name: '灵芝',      desc: '生长于枯木之上的仙草，山中珍品，有延年益寿之效。',         value: 15,  stealDiff: 30, category: 'medicine' },

    // ═══ 小城通用物品 ═══
    silk_robe:       { id: 'silk_robe',       name: '绸缎衣',    desc: '上等丝绸制成的衣衫，穿在身上轻软舒适。',               value: 10,  stealDiff: 25, category: 'clothing', slot: 'upperBody', tier: 'green' },
    pastry:          { id: 'pastry',          name: '精致糕点',  desc: '用上等糯米和蜜糖制成的糕点，香甜可口。',               value: 3,   stealDiff: 10, category: 'food' },
    stationary:      { id: 'stationary',      name: '文房四宝',  desc: '笔墨纸砚一套，品相中等，值些银两。',                   value: 8,   stealDiff: 20, category: 'culture' },
    steel_blade:     { id: 'steel_blade',     name: '精铁刀',    desc: '百炼精铁打造的腰刀，锋利异常。',                        value: 15,  stealDiff: 30, category: 'weapon', slot: 'rightHand', tier: 'green', attackDescs: ['砍', '横砍', '劈砍', '斜劈'] },
    chest_mirror:    { id: 'chest_mirror',    name: '护心镜',    desc: '铜制护心镜，可挡暗箭。',                               value: 20,  stealDiff: 35, category: 'armor', slot: 'upperBody', tier: 'green' },
    ring_silver:     { id: 'ring_silver',     name: '银戒指',    desc: '做工精细的银戒指，刻着缠枝花纹。',                     value: 12,  stealDiff: 28, category: 'jewelry', slot: 'accessory', tier: 'green' },
    bangle_jade:     { id: 'bangle_jade',     name: '玉镯子',    desc: '和田玉制成的镯子，水头不错。',                         value: 25,  stealDiff: 40, category: 'jewelry', slot: 'accessory', tier: 'blue' },
    wine_bamboo:     { id: 'wine_bamboo',     name: '竹叶青',    desc: '以竹叶浸制的清酒，入口甘冽。',                         value: 5,   stealDiff: 15, category: 'wine', use: { healNeili: 10 } },
    wine_daughter:   { id: 'wine_daughter',   name: '女儿红',    desc: '埋藏十八年的绍兴黄酒，香气醇厚。',                     value: 10,  stealDiff: 25, category: 'wine', use: { healNeili: 20 } },

    // ═══ 小城特殊物品 ═══
    peony_painting:  { id: 'peony_painting',  name: '洛阳牡丹图', desc: '当代名家所绘牡丹图，色彩艳丽，栩栩如生。',            value: 50,  stealDiff: 60, category: 'art', special: true },
    shu_embroidery:  { id: 'shu_embroidery',  name: '蜀绣',      desc: '蜀中名绣，绣工精细，双面异色，堪称一绝。',            value: 40,  stealDiff: 55, category: 'art', special: true },
    dark_arrow:      { id: 'dark_arrow',      name: '玄铁箭镞',  desc: '玄铁打造的箭镞，据说可射穿铁甲。',                     value: 35,  stealDiff: 50, category: 'weapon', slot: 'rightHand', tier: 'green', attackDescs: ['刺', '扎', '穿'] },
    screen_2side:    { id: 'screen_2side',    name: '双面绣屏风', desc: '苏绣精品，双面绣出不同花鸟图案，巧夺天工。',         value: 55,  stealDiff: 60, category: 'art', special: true },
    buddha_relic:    { id: 'buddha_relic',    name: '佛骨舍利',  desc: '高僧圆寂后留下的舍利子，佛门至宝。',                   value: 60,  stealDiff: 70, category: 'treasure', special: true },
    moon_poem:       { id: 'moon_poem',       name: '二十四桥明月词', desc: '前朝诗人手书长词真迹，字迹飘逸。',              value: 45,  stealDiff: 58, category: 'art', special: true },

    // ═══ 大城通用物品 ═══
    brocade_robe:    { id: 'brocade_robe',    name: '锦袍',      desc: '织锦华服，金线绣边，穿在身上气度不凡。',               value: 30,  stealDiff: 40, category: 'clothing', slot: 'upperBody', tier: 'blue' },
    dragon_tea:      { id: 'dragon_tea',      name: '上等龙井',  desc: '西湖龙井中的珍品，一两黄金一两茶。',                   value: 20,  stealDiff: 30, category: 'food' },
    blue_sword:      { id: 'blue_sword',      name: '青锋剑',    desc: '剑身泛青光，吹毛断发，剑客梦寐以求的利器。',           value: 50,  stealDiff: 55, category: 'weapon', slot: 'rightHand', tier: 'blue', attackDescs: ['刺', '挑', '扫', '削'] },
    blue_blade:      { id: 'blue_blade',      name: '砍山刀',    desc: '刃口厚重的砍刀，是山里人常用的利器，削铁如泥。',       value: 45,  stealDiff: 50, category: 'weapon', slot: 'rightHand', tier: 'blue', attackDescs: ['砍', '横砍', '劈砍', '猛劈'] },
    gold_silk_armor: { id: 'gold_silk_armor', name: '金丝软甲',  desc: '金丝与天蚕丝编织的软甲，刀枪不入。',                   value: 80,  stealDiff: 70, category: 'armor', slot: 'upperBody', tier: 'purple' },
    necklace_gold:   { id: 'necklace_gold',   name: '金项链',    desc: '纯金打造的项链，坠着红宝石，光彩夺目。',               value: 40,  stealDiff: 50, category: 'jewelry', slot: 'accessory', tier: 'purple' },
    jade_ring:       { id: 'jade_ring',       name: '翡翠扳指',  desc: '上等翡翠扳指，通体翠绿，无一丝杂质。',                 value: 60,  stealDiff: 60, category: 'jewelry', slot: 'accessory', tier: 'blue' },

    // ═══ 大城特殊物品 ═══
    nine_dragon_cup: { id: 'nine_dragon_cup', name: '九龙玉杯',  desc: '御用之杯，雕九条飞龙，注酒后龙影游动，价值连城。',    value: 200, stealDiff: 90, category: 'treasure', special: true },
    tang_painting:   { id: 'tang_painting',   name: '唐伯虎真迹', desc: '唐伯虎亲绘《仕女图》，笔法精妙，价值连城。',          value: 150, stealDiff: 85, category: 'art', special: true },
    qin_bamboo:      { id: 'qin_bamboo',      name: '秦始皇残简', desc: '秦朝竹简残片，记载着失传的古代秘术。',               value: 180, stealDiff: 88, category: 'treasure', special: true },

    // ═══ 其他 ═══
    silver_ingot:    { id: 'silver_ingot',    name: '银锭',      desc: '官铸十两银锭，成色十足。',                              value: 10,  stealDiff: 25, category: 'currency' },
    gold_ingot:      { id: 'gold_ingot',      name: '金锭',      desc: '官铸五两金锭，价值不菲。',                               value: 50,  stealDiff: 50, category: 'currency' },
    dagger:          { id: 'dagger',          name: '匕首',      desc: '短小锋利的匕首，可防身也可作为副手武器。',             value: 5,   stealDiff: 12, category: 'weapon', slot: 'leftHand', tier: 'white', attackDescs: ['刺', '划', '捅'] },

    // ═══ 暗器 ═══
    fei_shi:         { id: 'fei_shi',         name: '飞蝗石',    desc: '打磨光滑的飞石，可投掷伤人。',                         value: 1,   stealDiff: 5,  category: 'weapon', slot: 'rightHand', tier: 'white', attackDescs: ['投石', '弹射'] },
    fei_biao:        { id: 'fei_biao',        name: '飞镖',      desc: '精铁打造的飞镖，锋锐尖利，可远距离伤敌。',             value: 3,   stealDiff: 10, category: 'weapon', slot: 'rightHand', tier: 'white', attackDescs: ['飞掷', '连射'] },
    du_biao:         { id: 'du_biao',         name: '毒镖',      desc: '淬过剧毒的飞镖，中者毒发攻心。',                       value: 6,   stealDiff: 15, category: 'weapon', slot: 'rightHand', tier: 'green', attackDescs: ['毒掷', '暗射'] },

    // ═══ 药品 ═══
    jinchuang:       { id: 'jinchuang',      name: '金疮药',    desc: '上好的金疮药，敷于伤口可止血生肌，恢复30点气血。',       value: 8,   stealDiff: 20, category: 'medicine', use: { healHp: 30, cure: 'bleed' } },
    zhixue_gao:      { id: 'zhixue_gao',     name: '止血膏',    desc: '专治撕裂伤口的药膏，可治愈撕裂状态。',                   value: 5,   stealDiff: 15, category: 'medicine', use: { cure: 'bleed' } },
    huisheng:         { id: 'huisheng',       name: '回魂丹',    desc: '珍品丹药，有起死回生之效，恢复50点气血。',               value: 15,  stealDiff: 30, category: 'medicine', use: { healHp: 50 } },
    neili_dan:        { id: 'neili_dan',      name: '养气丹',    desc: '培元固本的丹药，可恢复20点内力。',                       value: 10,  stealDiff: 25, category: 'medicine', use: { healNeili: 20 } },
    jiedu_san:        { id: 'jiedu_san',      name: '解毒散',    desc: '专解百毒的药散，可解除中毒状态。',                       value: 6,   stealDiff: 18, category: 'medicine', use: { cure: 'poison' } },
    qingxin_wan:      { id: 'qingxin_wan',    name: '清心丸',    desc: '宁神静气的药丸，可解除混乱状态。',                       value: 6,   stealDiff: 18, category: 'medicine', use: { cure: 'confusion' } },

    // ═══ 通用商品（店铺售卖，无特殊用途） ═══
    incense:         { id: 'incense',         name: '熏香',      desc: '上等檀香制成的熏香，香气清雅持久。',                     value: 5,   stealDiff: 15, category: 'consumable' },
    silk_scarf:      { id: 'silk_scarf',      name: '丝巾',      desc: '轻柔的丝绸围巾，做工精致。',                              value: 8,   stealDiff: 20, category: 'clothing', slot: 'accessory', tier: 'white' },
    writing_brush:   { id: 'writing_brush',   name: '毛笔',      desc: '狼毫毛笔，笔锋锐利，写字流畅。',                          value: 3,   stealDiff: 10, category: 'culture' },
    ink_stick:       { id: 'ink_stick',       name: '墨锭',      desc: '上等松烟墨，墨色乌黑发亮。',                              value: 3,   stealDiff: 10, category: 'culture' },
    tea_cake:        { id: 'tea_cake',        name: '茶饼',      desc: '压制成饼的普洱茶，越陈越香。',                             value: 6,   stealDiff: 15, category: 'food' },
    shovel:          { id: 'shovel',          name: '铁锹',      desc: '铁匠新打的铁锹，结实趁手，正好用来挖矿。',                 value: 2,   stealDiff: 10, category: 'tool' },

    // ═══ 锻造材料 ═══
    iron_ore:        { id: 'iron_ore',        name: '铁矿石',    desc: '山中开采的铁矿石，可熔炼成铁。',                         value: 3,   stealDiff: 10, category: 'material' },
    copper_ore:      { id: 'copper_ore',      name: '铜矿石',    desc: '泛着暗红色的铜矿石，可熔炼成铜。',                       value: 3,   stealDiff: 10, category: 'material' },
    tin_ore:         { id: 'tin_ore',         name: '锡矿石',    desc: '灰黑色的锡矿石，熔炼后可得锡。',                         value: 3,   stealDiff: 10, category: 'material' },
    lead_ore:        { id: 'lead_ore',        name: '铅矿石',    desc: '沉重的铅矿石，质地柔软密度极大。',                       value: 2,   stealDiff: 8,  category: 'material' },
    coal:            { id: 'coal',            name: '煤炭',      desc: '上好的石炭，耐烧火旺，是锻造的好燃料。',                 value: 2,   stealDiff: 8,  category: 'material' },
    leather_raw:     { id: 'leather_raw',     name: '兽皮',      desc: '处理过的兽皮，可用于制作皮具铠甲。',                     value: 3,   stealDiff: 10, category: 'material' },
    wood_hard:       { id: 'wood_hard',       name: '硬木',      desc: '坚硬耐用的木材，适合做兵器握柄或盾牌。',                 value: 2,   stealDiff: 8,  category: 'material' },

    // ═══ 稀有材料 ═══
    essence_iron:    { id: 'essence_iron',    name: '精铁',      desc: '百炼精铁，质地纯净，是打造神兵利器的上等材料。',        value: 15,  stealDiff: 25, category: 'material' },
    silk_gold:       { id: 'silk_gold',       name: '金蚕丝',    desc: '罕见的天山金蚕所吐之丝，坚韧无比，可织入软甲。',        value: 20,  stealDiff: 30, category: 'material' },

    // ═══ 绝世材料（橙/金/红图纸所需） ═══
    mystic_iron:     { id: 'mystic_iron',     name: '玄铁',      desc: '天外精铁，漆黑如墨，坚硬无匹，传闻历经万年地火淬炼。',      value: 40,  stealDiff: 50, category: 'material' },
    meteor_iron:     { id: 'meteor_iron',     name: '陨星铁',    desc: '陨落星辰携来的天外金属，泛着幽蓝冷光，凡火难熔。',          value: 90,  stealDiff: 75, category: 'material' },
    celestial_silk:  { id: 'celestial_silk',  name: '天蚕丝',    desc: '传说天蚕吐出的灵丝，水火不侵，韧比金丝。',                   value: 60,  stealDiff: 60, category: 'material' },
    dragon_scale:    { id: 'dragon_scale',    name: '龙鳞',      desc: '蛟龙褪下的逆鳞，坚硬如铁却又轻盈，隐隐有灵光流转。',        value: 100, stealDiff: 85, category: 'material' },
    phoenix_plume:   { id: 'phoenix_plume',   name: '凤羽',      desc: '凤凰落下的尾羽，赤红如火，厉火不焚。',                       value: 120, stealDiff: 90, category: 'material' },
    star_essence:    { id: 'star_essence',    name: '星髓',      desc: '星辰陨落所化的髓玉，蕴藏真灵，天下难寻。',                   value: 200, stealDiff: 110, category: 'material' },

    // ═══ 毒药 ═══
    poison_powder:   { id: 'poison_powder',   name: '毒粉',      desc: '用蛇毒和草药调配的毒粉，可下毒暗算。',                   value: 8,   stealDiff: 20, category: 'poison' },
    he_ding_hong:    { id: 'he_ding_hong',    name: '鹤顶红',    desc: '天下奇毒，点滴封喉，见血即亡。',                         value: 30,  stealDiff: 45, category: 'poison' },

    // ═══ 猎物与烹饪 ═══
    meat_rabbit:      { id: 'meat_rabbit',    name: '兔肉',      desc: '新鲜的兔肉，烤着吃很香。',                                value: 2,   stealDiff: 3,  category: 'food' },
    meat_snake:       { id: 'meat_snake',     name: '蛇肉',      desc: '蛇肉细嫩，煲汤极鲜。',                                   value: 3,   stealDiff: 4,  category: 'food' },
    meat_goat:        { id: 'meat_goat',      name: '羊肉',      desc: '山羊肉质紧实，适合烤制。',                                value: 4,   stealDiff: 5,  category: 'food' },
    meat_boar:        { id: 'meat_boar',      name: '野猪肉',    desc: '野猪肉腥膻味重，但极有嚼劲。',                             value: 6,   stealDiff: 8,  category: 'food' },
    firewood:         { id: 'firewood',       name: '柴火',      desc: '干燥的柴火，适合生火做饭。',                              value: 1,   stealDiff: 2,  category: 'material' },
    meat_rabbit_cooked:{ id: 'meat_rabbit_cooked', name: '烤兔肉',  desc: '外焦里嫩的烤兔肉，香气四溢，可恢复15点气血。',          value: 5,   stealDiff: 5,  category: 'food', use: { healHp: 15 } },
    meat_snake_cooked: { id: 'meat_snake_cooked',  name: '烤蛇肉',  desc: '烤得滋滋冒油的蛇肉，细嫩鲜美，可恢复20点气血。',       value: 7,   stealDiff: 6,  category: 'food', use: { healHp: 20 } },
    meat_goat_cooked:  { id: 'meat_goat_cooked',   name: '烤羊肉',  desc: '炭火烤制的山羊肉，撒上盐巴，滋味十足，可恢复25点气血。',value: 9,   stealDiff: 7,  category: 'food', use: { healHp: 25 } },
    meat_boar_cooked:  { id: 'meat_boar_cooked',   name: '烤野猪肉',desc: '烤得金黄的野猪肉，外皮酥脆，可恢复35点气血。',          value: 12,  stealDiff: 10, category: 'food', use: { healHp: 35 } },
    gall_snake:       { id: 'gall_snake',     name: '蛇胆',      desc: '巨蟒之胆，服用可增内力。',                                value: 10,  stealDiff: 15, category: 'medicine' },
    gall_bear:        { id: 'gall_bear',      name: '熊胆',      desc: '黑熊之胆，大补内力。',                                    value: 20,  stealDiff: 25, category: 'medicine' },
    gall_tiger:       { id: 'gall_tiger',     name: '虎胆',      desc: '猛虎之胆，稀世珍品，可大幅提升内力。',                    value: 40,  stealDiff: 40, category: 'medicine' },

    // ═══ 御膳房 ═══
    royal_feast:      { id: 'royal_feast',    name: '御膳正餐',  desc: '御厨精心烹制的御膳珍馐，八珍玉食，色香味俱全，可恢复60点气血。', value: 40, stealDiff: 100, category: 'food', use: { healHp: 60 } },
    palace_leftover:  { id: 'palace_leftover',name: '御膳剩菜',  desc: '御膳房剩下的残羹剩菜，虽是剩的，却也是御厨的手艺，可恢复20点气血。', value: 8, stealDiff: 55, category: 'food', use: { healHp: 20 } },

    // ═══ 渔获与杂物 ═══
    bait_bug:        { id: 'bait_bug',        name: '虫饵',      desc: '从树干上捉到的肥虫，穿在鱼钩上活蹦乱跳。',              value: 1,   stealDiff: 2,  category: 'material' },
    fishing_rod:     { id: 'fishing_rod',     name: '鱼竿',      desc: '竹竿配上麻线和铁钩，虽简陋但足以垂钓。',                 value: 5,   stealDiff: 15, category: 'tool' },
    fish_carp:       { id: 'fish_carp',       name: '鲤鱼',      desc: '一尾红鳞大鲤鱼，少说有三斤重。',                         value: 3,   stealDiff: 5,  category: 'food' },
    fish_grass_carp: { id: 'fish_grass_carp', name: '草鱼',      desc: '肥美的草鱼，适合红烧或炖汤。',                           value: 4,   stealDiff: 5,  category: 'food' },
    fish_catfish:    { id: 'fish_catfish',    name: '鲶鱼',      desc: '光溜溜的大鲶鱼，肉质细嫩无小刺。',                       value: 5,   stealDiff: 6,  category: 'food' },
    fish_crab:       { id: 'fish_crab',       name: '螃蟹',      desc: '张牙舞爪的大螃蟹，壳硬肉肥。',                           value: 4,   stealDiff: 6,  category: 'food' },
    fish_shrimp:     { id: 'fish_shrimp',     name: '河虾',      desc: '晶莹剔透的河虾，鲜美弹牙。',                             value: 3,   stealDiff: 4,  category: 'food' },
    fish_yuanbao:    { id: 'fish_yuanbao',    name: '元宝鱼',    desc: '鱼身泛着金光，形似元宝的奇鱼，据说能带来好运。',        value: 30,  stealDiff: 40, category: 'treasure', special: true },
    pond_goldfish:   { id: 'pond_goldfish',   name: '金鱼',      desc: '小巧玲珑的金鱼，红白相间，鳞片在光下闪闪发亮。',          value: 30,  stealDiff: 15, category: 'ornament' },
    pond_koi:        { id: 'pond_koi',        name: '锦鲤',      desc: '色彩斑斓的观赏鲤鱼，寓意吉祥富贵，深得文人雅士喜爱。',   value: 150, stealDiff: 30, category: 'ornament' },
    pond_turtle:     { id: 'pond_turtle',     name: '灵龟',      desc: '通灵的老龟，背上刻着玄奥纹路，据说能辟邪纳福。',         value: 400, stealDiff: 50, category: 'ornament' },
    fish_tai_silver: { id: 'fish_tai_silver', name: '银须龙鲤',  desc: '太后池中最常见的珍鱼，银鳞如月，须长若鞭。',              value: 600,  stealDiff: 20, category: 'ornament', tier: 'blue' },
    fish_tai_gold:   { id: 'fish_tai_gold',   name: '金鳞龙鲤',  desc: '通体金鳞灿若流金，据说是供于御前的风水瑞兽。',           value: 6000, stealDiff: 45, category: 'ornament', tier: 'purple' },
    fish_tai_dragon: { id: 'fish_tai_dragon', name: '赤须龙鲤',  desc: '传说中龙种遗脉，一跃可成龙，池中瑞兆。',                 value: 150000, stealDiff: 130, category: 'ornament', tier: 'red' },
    water_weed:      { id: 'water_weed',      name: '水草',      desc: '湿漉漉的水草，缠了一团，没什么用。',                     value: 0,   stealDiff: 1,  category: 'material' },
    old_shoe:        { id: 'old_shoe',        name: '破鞋子',    desc: '不知被水泡了多久的破布鞋，散发着一股怪味。',             value: 0,   stealDiff: 1,  category: 'household' },
    rusty_can:       { id: 'rusty_can',       name: '锈铁罐',    desc: '锈迹斑斑的铁罐子，不知道装了什么东西。',                 value: 0,   stealDiff: 2,  category: 'household' },

    // ═══ 锻造图纸 ═══
    blueprint_steel_blade:{ id: 'blueprint_steel_blade', name: '精铁刀图纸', desc: '记载着精铁刀的锻造之法。',                  value: 5,   stealDiff: 20, category: 'blueprint', blueprint: { id: 'steel_blade', ings: { iron_ore: 4, wood_hard: 2 }, cost: 10 } },
    blueprint_blue_sword: { id: 'blueprint_blue_sword',  name: '青锋剑图纸', desc: '记载着青锋剑的锻造之法。',                  value: 15,  stealDiff: 35, category: 'blueprint', blueprint: { id: 'blue_sword', ings: { iron_ore: 8, wood_hard: 4 }, cost: 35 } },
    blueprint_gold_armor: { id: 'blueprint_gold_armor',  name: '金丝软甲图纸', desc: '记载着金丝软甲的锻造之法。',             value: 25,  stealDiff: 50, category: 'blueprint', blueprint: { id: 'gold_silk_armor', ings: { iron_ore: 10, leather_raw: 8 }, cost: 60 } },

    // ═══ 绝世装备（橙·绝品） ═══
    zhanlong_dao:     { id: 'zhanlong_dao',     name: '斩龙刀',      desc: '刀身赤红如燃着烈焰，相传曾饮恶龙之血，一刀断山河。',            value: 150, stealDiff: 75, category: 'weapon', slot: 'rightHand', tier: 'orange', attackDescs: ['怒劈', '横扫', '烈焰斩', '龙吟劈'] },
    xuanniao_gun:     { id: 'xuanniao_gun',     name: '玄鸟戟',      desc: '玄铁为身，鸟啄为锋，挥动时有玄鸟啼鸣之音。',                    value: 140, stealDiff: 70, category: 'weapon', slot: 'rightHand', tier: 'orange', attackDescs: ['刺杀', '横扫', '贯云', '裂风'] },
    phoenix_mirror:   { id: 'phoenix_mirror',   name: '凤羽护心镜',  desc: '以凤羽为芯、玄铁为壳锻成的护心镜，红光流转如浴火重生。',        value: 160, stealDiff: 75, category: 'armor', slot: 'upperBody', tier: 'orange' },
    canglong_boots:   { id: 'canglong_boots',   name: '苍龙战靴',    desc: '以龙皮为底、天蚕丝织就的战靴，日行千里不觉疲。',                value: 130, stealDiff: 65, category: 'armor', slot: 'boots', tier: 'orange' },

    // ═══ 绝世装备（金·神品） ═══
    jiangyan_sword:   { id: 'jiangyan_sword',   name: '焚天剑',      desc: '剑身通体赤金，出鞘时热浪扑面，剑锋所指烈焰焚天。',              value: 260, stealDiff: 95, category: 'weapon', slot: 'rightHand', tier: 'gold', attackDescs: ['焚天斩', '烈日曜', '赤焰贯日', '天火燎原'] },
    shangfang_jian:   { id: 'shangfang_jian',   name: '尚方宝剑',    desc: '御赐尚方剑，剑身寒光凛冽，上斩昏君、下斩佞臣。',                  value: 250, stealDiff: 95, category: 'weapon', slot: 'rightHand', tier: 'gold', attackDescs: ['君临', '一剑封喉', '斩佞', '问罪'] },
    jinpeng_armor:    { id: 'jinpeng_armor',    name: '金鹏宝甲',    desc: '以金鹏翎羽编缀成的宝甲，轻如无物却刀枪不入。',                   value: 270, stealDiff: 90, category: 'armor', slot: 'upperBody', tier: 'gold' },
    lingguang_crown:  { id: 'lingguang_crown',  name: '灵光冠',      desc: '天外陨铁与星髓共锻的冠冕，佩戴者目光如炬、心澄如镜。',           value: 230, stealDiff: 90, category: 'armor', slot: 'head', tier: 'gold' },

    // ═══ 传世神兵（红·仙品） ═══
    changgu_dao:      { id: 'changgu_dao',      name: '屠龙宝刀',    desc: '传说中可斩真龙的绝世宝刀，刀身暗金流转，隐有龙吟。',              value: 420, stealDiff: 120, category: 'weapon', slot: 'rightHand', tier: 'red', attackDescs: ['屠龙斩', '横扫千军', '碎岳', '开天'] },
    jiuchen_sword:    { id: 'jiuchen_sword',    name: '九宸神剑',    desc: '九天之上落下的神剑，剑格刻九宸星辰，一剑可斩鬼神。',             value: 400, stealDiff: 120, category: 'weapon', slot: 'rightHand', tier: 'red', attackDescs: ['神剑出鞘', '九宸灭', '剑断山河', '寰宇一斩'] },
    jiuyan_armor:     { id: 'jiuyan_armor',     name: '九渊天甲',    desc: '九渊深渊底锻成的天甲，通体玄黑泛紫光，传说中的护体至宝。',      value: 450, stealDiff: 125, category: 'armor', slot: 'upperBody', tier: 'red' },
    tiangang_boots:   { id: 'tiangang_boots',   name: '天罡战靴',    desc: '天罡星煞所化的战靴，踏日月而驱山河。',                        value: 380, stealDiff: 115, category: 'armor', slot: 'boots', tier: 'red' },

    // ═══ 锻造图纸·橙/金/红 ═══
    blueprint_zhanlong_dao:  { id: 'blueprint_zhanlong_dao',  name: '斩龙刀图纸',  desc: '记载着斩龙刀的锻造之法。',    value: 40,  stealDiff: 75, category: 'blueprint', blueprint: { id: 'zhanlong_dao', ings: { iron_ore: 12, essence_iron: 6, mystic_iron: 4 }, cost: 200 } },
    blueprint_xuanniao_gun:  { id: 'blueprint_xuanniao_gun',  name: '玄鸟戟图纸',  desc: '记载着玄鸟戟的锻造之法。',    value: 35,  stealDiff: 70, category: 'blueprint', blueprint: { id: 'xuanniao_gun', ings: { iron_ore: 12, essence_iron: 6, meteor_iron: 3, wood_hard: 4 }, cost: 200 } },
    blueprint_phoenix_mirror:{ id: 'blueprint_phoenix_mirror', name: '凤凰羽护心镜图纸', desc: '记载着凤凰羽护心镜的锻造之法。', value: 45, stealDiff: 75, category: 'blueprint', blueprint: { id: 'phoenix_mirror', ings: { iron_ore: 10, silk_gold: 8, phoenix_plume: 2 }, cost: 250 } },
    blueprint_canglong_boots:{ id: 'blueprint_canglong_boots', name: '苍龙战靴图纸', desc: '记载着苍龙战靴的锻造之法。', value: 40, stealDiff: 70, category: 'blueprint', blueprint: { id: 'canglong_boots', ings: { iron_ore: 10, leather_raw: 8, dragon_scale: 4 }, cost: 220 } },

    blueprint_jiangyan_sword:{ id: 'blueprint_jiangyan_sword', name: '焚天剑图纸', desc: '记载着焚天剑的锻造之法。',      value: 55, stealDiff: 90, category: 'blueprint', blueprint: { id: 'jiangyan_sword', ings: { essence_iron: 10, meteor_iron: 6, phoenix_plume: 2 }, cost: 450 } },
    blueprint_shangfang_jian:{ id: 'blueprint_shangfang_jian', name: '御赐宝剑图纸', desc: '记载着御赐宝剑的锻造之法。',  value: 55, stealDiff: 90, category: 'blueprint', blueprint: { id: 'shangfang_jian', ings: { essence_iron: 10, mystic_iron: 6, star_essence: 2 }, cost: 450 } },
    blueprint_jinpeng_armor:{ id: 'blueprint_jinpeng_armor', name: '金鹏宝甲图纸', desc: '记载着金鹏宝甲的锻造之法。',     value: 60, stealDiff: 95, category: 'blueprint', blueprint: { id: 'jinpeng_armor', ings: { silk_gold: 10, celestial_silk: 8, dragon_scale: 4 }, cost: 500 } },
    blueprint_lingguang_crown:{ id: 'blueprint_lingguang_crown', name: '灵光冠图纸', desc: '记载着灵光冠的锻造之法。',    value: 55, stealDiff: 90, category: 'blueprint', blueprint: { id: 'lingguang_crown', ings: { mystic_iron: 8, meteor_iron: 4, star_essence: 2 }, cost: 480 } },

    blueprint_juilong_dao:   { id: 'blueprint_juilong_dao',   name: '屠龙宝刀图纸', desc: '记载着屠龙宝刀的锻造之法。',  value: 80, stealDiff: 110, category: 'blueprint', blueprint: { id: 'changgu_dao', ings: { meteor_iron: 10, mystic_iron: 6, star_essence: 4 }, cost: 1000 } },
    blueprint_jiuchen_sword: { id: 'blueprint_jiuchen_sword', name: '九宸神剑图纸', desc: '记载着九宸神剑的锻造之法。',  value: 75, stealDiff: 105, category: 'blueprint', blueprint: { id: 'jiuchen_sword', ings: { essence_iron: 12, star_essence: 6, celestial_silk: 4 }, cost: 950 } },
    blueprint_jiuyan_armor:  { id: 'blueprint_jiuyan_armor',  name: '九渊天甲图纸', desc: '记载着九渊天甲的锻造之法。', value: 85, stealDiff: 115, category: 'blueprint', blueprint: { id: 'jiuyan_armor', ings: { dragon_scale: 8, celestial_silk: 8, star_essence: 5 }, cost: 1100 } },
    blueprint_tiangang_boots:{ id: 'blueprint_tiangang_boots', name: '天罡战靴图纸', desc: '记载着天罡战靴的锻造之法。', value: 70, stealDiff: 105, category: 'blueprint', blueprint: { id: 'tiangang_boots', ings: { meteor_iron: 8, dragon_scale: 6, star_essence: 3 }, cost: 900 } },

    // ═══ 心法秘籍 ═══
    massage_manual:  { id: 'massage_manual',  name: '按摩心经',  desc: '记载着经络按摩秘术的古册，习之可疏通气血、驻颜养容。', value: 5,   stealDiff: 15, category: 'skill', use: { learnInternalSkill: '按摩心经' } },

    // ═══ 赌徒心经 ═══
    sutra_gambler_1:  { id: 'sutra_gambler_1', name: '初级赌徒心经', desc: '一本皱巴巴的旧册子，记着些出千和听骰的粗浅门道。',   value: 1,   stealDiff: 5,  category: 'skill', use: { learnInternalSkill: '初级赌徒心经' } },
    sutra_gambler_2:  { id: 'sutra_gambler_2', name: '中级赌徒心经', desc: '笔记更深的赌术心得，但习练需有一定福缘。',            value: 1,   stealDiff: 5,  category: 'skill', use: { learnInternalSkill: '中级赌徒心经' } },
    sutra_gambler_3:  { id: 'sutra_gambler_3', name: '高级赌徒心经', desc: '密不外传的赌门要诀，非大福缘之人不可窥其门径。',   value: 1,   stealDiff: 5,  category: 'skill', use: { learnInternalSkill: '高级赌徒心经' } },
    sutra_gambler_4:  { id: 'sutra_gambler_4', name: '大师赌徒心经', desc: '赌门至高秘典，据传练成可逢赌必赢。',                   value: 1,   stealDiff: 5,  category: 'skill', use: { learnInternalSkill: '大师赌徒心经' } },
    pond_portable:    { id: 'pond_portable',   name: '随身鱼袋',    desc: '一只上好的青瓷缸，可暂养一尾活鱼随身携带。',            value: 2000, stealDiff: 80, category: 'tool', special: true },
    // ═══ 观赏鱼（花鸟鱼市场） ═══
    fish_mkt_white:   { id: 'fish_mkt_white',  name: '白鲤',        desc: '通体雪白的鲤鱼，池中一景，清雅脱俗。',                    value: 50,   stealDiff: 10, category: 'ornament', tier: 'white' },
    fish_mkt_green:   { id: 'fish_mkt_green',  name: '青鲤',        desc: '鳞片泛着青光，游动时如一泓碧水。',                        value: 200,  stealDiff: 15, category: 'ornament', tier: 'green' },
    fish_mkt_blue:    { id: 'fish_mkt_blue',   name: '蓝龙睛',      desc: '双眼如龙，通体湛蓝，在池中格外显眼。',                     value: 800,  stealDiff: 25, category: 'ornament', tier: 'blue' },
    fish_mkt_purple:  { id: 'fish_mkt_purple', name: '紫珍珠',      desc: '通体紫红，鳞片圆润如珠，极为名贵。',                       value: 3000, stealDiff: 40, category: 'ornament', tier: 'purple' },
    fish_mkt_orange:  { id: 'fish_mkt_orange', name: '橙丹顶',      desc: '额顶一抹丹橙，如旭日东升，万金难求。',                     value: 12000, stealDiff: 60, category: 'ornament', tier: 'orange' },
    fish_mkt_gold:    { id: 'fish_mkt_gold',   name: '金锦',        desc: '周身金鳞，在水中如一团流动的黄金，皇亲国戚亦求之不得。',   value: 50000, stealDiff: 90, category: 'ornament', tier: 'gold' },
    fish_mkt_red:     { id: 'fish_mkt_red',    name: '赤焰鲤',      desc: '通体赤红如烈焰，传说乃龙种遗脉，池中有此鱼可镇宅辟邪。',   value: 200000, stealDiff: 130, category: 'ornament', tier: 'red' },
    // ═══ 鱼竿（任务奖励） ═══
    rod_green:        { id: 'rod_green',       name: '青竹竿',      desc: '上等青竹所制，弹性极佳，可抛投更远。',                     value: 100,  stealDiff: 30, category: 'tool', tier: 'green' },
    rod_blue:         { id: 'rod_blue',        name: '翠竹钓竿',    desc: '百年翠竹配天蚕丝线，坚韧非凡。',                           value: 500,  stealDiff: 50, category: 'tool', tier: 'blue' },
    rod_purple:       { id: 'rod_purple',      name: '紫檀钓竿',    desc: '紫檀木为柄，玄铁丝为线，名家手制。',                       value: 2500, stealDiff: 70, category: 'tool', tier: 'purple' },
    rod_orange:       { id: 'rod_orange',      name: '玄铁钓竿',    desc: '玄铁打造，百炼成钢，可钓千斤巨鱼。',                       value: 10000, stealDiff: 100, category: 'tool', tier: 'orange' },
    rod_gold:         { id: 'rod_gold',        name: '金龙钓竿',    desc: '南海龙筋为线，九天玄铁为钩，传说之物。',                   value: 50000, stealDiff: 140, category: 'tool', tier: 'gold' },
};

function getItem(id) {
    return ITEMS[id] || null;
}
