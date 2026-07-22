const ITEMS = {
    // ═══ 村庄通用物品 ═══
    cloth_coarse:    { id: 'cloth_coarse',    name: '粗布衣',    desc: '粗麻织成的衣服，结实耐穿。',                          value: 1,   stealDiff: 5,  category: 'clothing', slot: 'upperBody', tier: 'white' },
    shoes_straw:     { id: 'shoes_straw',     name: '草鞋',      desc: '稻草编成的鞋子，走山路最合适。',                      value: 1,   stealDiff: 5,  category: 'clothing', slot: 'boots', tier: 'white' },
    band_head:       { id: 'band_head',       name: '布头巾',    desc: '粗布头巾，可遮阳挡尘。',                               value: 1,   stealDiff: 5,  category: 'clothing', slot: 'head', tier: 'white' },
    pants_coarse:    { id: 'pants_coarse',    name: '粗麻裤',    desc: '粗糙的麻布裤子，结实耐磨。',                           value: 1,   stealDiff: 5,  category: 'clothing', slot: 'lowerBody', tier: 'white' },
    bracers_cloth:   { id: 'bracers_cloth',   name: '布护腕',    desc: '粗布护腕，防止袖口磨损。',                             value: 1,   stealDiff: 5,  category: 'clothing', slot: 'bracers', tier: 'white' },
    ration:          { id: 'ration',          name: '干粮',      desc: '粗粮制成的干饼，能填饱肚子。',                        value: 1,   stealDiff: 3,  category: 'food' },
    flint:           { id: 'flint',           name: '火折子',    desc: '引火用的工具，行走江湖必备。',                        value: 2,   stealDiff: 8,  category: 'tool' },
    knife_wood:      { id: 'knife_wood',      name: '柴刀',      desc: '劈柴用的铁刀，刃口有些钝了。',                        value: 3,   stealDiff: 15, category: 'weapon', slot: 'rightHand', tier: 'white' },
    hoe_iron:        { id: 'hoe_iron',        name: '铁锄头',    desc: '农夫用的铁锄，也可以当武器使。',                      value: 2,   stealDiff: 10, category: 'weapon', slot: 'rightHand', tier: 'white' },
    pot_iron:        { id: 'pot_iron',        name: '铁锅',      desc: '生铁铸成的锅，做饭必备。',                            value: 2,   stealDiff: 10, category: 'household' },
    herb_bandage:    { id: 'herb_bandage',    name: '止血草',    desc: '常见的草药，晒干磨粉可止外伤出血。',                   value: 2,   stealDiff: 10, category: 'medicine' },
    powder_clear:    { id: 'powder_clear',    name: '清心散',    desc: '清凉解热的药散，可缓解轻微中毒。',                    value: 5,   stealDiff: 20, category: 'medicine' },
    wine_rice:       { id: 'wine_rice',       name: '米酒',      desc: '农家自酿的米酒，度数不高但味道淳朴。',                value: 2,   stealDiff: 8,  category: 'wine' },

    // ═══ 村庄特殊物品 ═══
    ginseng_100:     { id: 'ginseng_100',     name: '百年山参',  desc: '生于深山中的百年老参，有续命之效，价值不菲。',        value: 20,  stealDiff: 50, category: 'rare_herb', special: true },
    jade_fish:       { id: 'jade_fish',       name: '江鲤玉佩',  desc: '雕成鲤鱼状的玉佩，玉质温润，入手生温。',               value: 15,  stealDiff: 40, category: 'jewelry', slot: 'accessory', tier: 'green' },
    cloud_manual:    { id: 'cloud_manual',    name: '云纹秘籍残页', desc: '泛黄的纸页，记载着某种轻功心法，可惜只有残篇。', value: 25,  stealDiff: 55, category: 'skill', special: true },
    iron_command:    { id: 'iron_command',    name: '玄铁令',    desc: '刻着古怪符文的铁牌，似乎与某个秘密有关。',             value: 18,  stealDiff: 45, category: 'token', special: true },

    herb_ginseng_small:{ id: 'herb_ginseng_small', name: '小参',      desc: '山中采来的小野参，虽年份不足但也有补气之效。',          value: 5,   stealDiff: 15, category: 'medicine' },

    // ═══ 小城通用物品 ═══
    silk_robe:       { id: 'silk_robe',       name: '绸缎衣',    desc: '上等丝绸制成的衣衫，穿在身上轻软舒适。',               value: 10,  stealDiff: 25, category: 'clothing', slot: 'upperBody', tier: 'green' },
    pastry:          { id: 'pastry',          name: '精致糕点',  desc: '用上等糯米和蜜糖制成的糕点，香甜可口。',               value: 3,   stealDiff: 10, category: 'food' },
    stationary:      { id: 'stationary',      name: '文房四宝',  desc: '笔墨纸砚一套，品相中等，值些银两。',                   value: 8,   stealDiff: 20, category: 'culture' },
    steel_blade:     { id: 'steel_blade',     name: '精铁刀',    desc: '百炼精铁打造的腰刀，锋利异常。',                        value: 15,  stealDiff: 30, category: 'weapon', slot: 'rightHand', tier: 'green' },
    chest_mirror:    { id: 'chest_mirror',    name: '护心镜',    desc: '铜制护心镜，可挡暗箭。',                               value: 20,  stealDiff: 35, category: 'armor', slot: 'upperBody', tier: 'green' },
    ring_silver:     { id: 'ring_silver',     name: '银戒指',    desc: '做工精细的银戒指，刻着缠枝花纹。',                     value: 12,  stealDiff: 28, category: 'jewelry', slot: 'accessory', tier: 'green' },
    bangle_jade:     { id: 'bangle_jade',     name: '玉镯子',    desc: '和田玉制成的镯子，水头不错。',                         value: 25,  stealDiff: 40, category: 'jewelry', slot: 'accessory', tier: 'blue' },
    wine_bamboo:     { id: 'wine_bamboo',     name: '竹叶青',    desc: '以竹叶浸制的清酒，入口甘冽。',                         value: 5,   stealDiff: 15, category: 'wine' },
    wine_daughter:   { id: 'wine_daughter',   name: '女儿红',    desc: '埋藏十八年的绍兴黄酒，香气醇厚。',                     value: 10,  stealDiff: 25, category: 'wine' },

    // ═══ 小城特殊物品 ═══
    peony_painting:  { id: 'peony_painting',  name: '洛阳牡丹图', desc: '当代名家所绘牡丹图，色彩艳丽，栩栩如生。',            value: 50,  stealDiff: 60, category: 'art', special: true },
    shu_embroidery:  { id: 'shu_embroidery',  name: '蜀绣',      desc: '蜀中名绣，绣工精细，双面异色，堪称一绝。',            value: 40,  stealDiff: 55, category: 'art', special: true },
    dark_arrow:      { id: 'dark_arrow',      name: '玄铁箭镞',  desc: '玄铁打造的箭镞，据说可射穿铁甲。',                     value: 35,  stealDiff: 50, category: 'weapon', slot: 'rightHand', tier: 'green' },
    screen_2side:    { id: 'screen_2side',    name: '双面绣屏风', desc: '苏绣精品，双面绣出不同花鸟图案，巧夺天工。',         value: 55,  stealDiff: 60, category: 'art', special: true },
    buddha_relic:    { id: 'buddha_relic',    name: '佛骨舍利',  desc: '高僧圆寂后留下的舍利子，佛门至宝。',                   value: 60,  stealDiff: 70, category: 'treasure', special: true },
    moon_poem:       { id: 'moon_poem',       name: '二十四桥明月词', desc: '前朝诗人手书长词真迹，字迹飘逸。',              value: 45,  stealDiff: 58, category: 'art', special: true },

    // ═══ 大城通用物品 ═══
    brocade_robe:    { id: 'brocade_robe',    name: '锦袍',      desc: '织锦华服，金线绣边，穿在身上气度不凡。',               value: 30,  stealDiff: 40, category: 'clothing', slot: 'upperBody', tier: 'blue' },
    dragon_tea:      { id: 'dragon_tea',      name: '上等龙井',  desc: '西湖龙井中的珍品，一两黄金一两茶。',                   value: 20,  stealDiff: 30, category: 'food' },
    blue_sword:      { id: 'blue_sword',      name: '青锋剑',    desc: '剑身泛青光，吹毛断发，剑客梦寐以求的利器。',           value: 50,  stealDiff: 55, category: 'weapon', slot: 'rightHand', tier: 'blue' },
    gold_silk_armor: { id: 'gold_silk_armor', name: '金丝软甲',  desc: '金丝与天蚕丝编织的软甲，刀枪不入。',                   value: 80,  stealDiff: 70, category: 'armor', slot: 'upperBody', tier: 'purple' },
    necklace_gold:   { id: 'necklace_gold',   name: '金项链',    desc: '纯金打造的项链，坠着红宝石，光彩夺目。',               value: 40,  stealDiff: 50, category: 'jewelry', slot: 'accessory', tier: 'purple' },
    jade_ring:       { id: 'jade_ring',       name: '翡翠扳指',  desc: '上等翡翠扳指，通体翠绿，无一丝杂质。',                 value: 60,  stealDiff: 60, category: 'jewelry', slot: 'accessory', tier: 'blue' },

    // ═══ 大城特殊物品 ═══
    nine_dragon_cup: { id: 'nine_dragon_cup', name: '九龙玉杯',  desc: '御用之杯，雕九条飞龙，注酒后龙影游动，价值连城。',    value: 200, stealDiff: 90, category: 'treasure', special: true },
    tang_painting:   { id: 'tang_painting',   name: '唐伯虎真迹', desc: '唐伯虎亲绘《仕女图》，笔法精妙，价值连城。',          value: 150, stealDiff: 85, category: 'art', special: true },
    qin_bamboo:      { id: 'qin_bamboo',      name: '秦始皇残简', desc: '秦朝竹简残片，记载着失传的古代秘术。',               value: 180, stealDiff: 88, category: 'treasure', special: true },

    // ═══ 其他 ═══
    silver_ingot:    { id: 'silver_ingot',    name: '银锭',      desc: '官铸十两银锭，成色十足。',                              value: 10,  stealDiff: 25, category: 'currency' },
    dagger:          { id: 'dagger',          name: '匕首',      desc: '短小锋利的匕首，可防身也可作为副手武器。',             value: 5,   stealDiff: 12, category: 'weapon', slot: 'leftHand', tier: 'white' },

    // ═══ 药品 ═══
    jinchuang:       { id: 'jinchuang',      name: '金疮药',    desc: '上好的金疮药，敷于伤口可止血生肌，恢复30点气血。',       value: 8,   stealDiff: 20, category: 'medicine', use: { healHp: 30 } },
    huisheng:         { id: 'huisheng',       name: '回魂丹',    desc: '珍品丹药，有起死回生之效，恢复50点气血。',               value: 15,  stealDiff: 30, category: 'medicine', use: { healHp: 50 } },
    neili_dan:        { id: 'neili_dan',      name: '养气丹',    desc: '培元固本的丹药，可恢复20点内力。',                       value: 10,  stealDiff: 25, category: 'medicine', use: { healNeili: 20 } },
    jiedu_san:        { id: 'jiedu_san',      name: '解毒散',    desc: '专解百毒的药散，可解除中毒状态。',                       value: 6,   stealDiff: 18, category: 'medicine', use: { cure: 'poison' } },
    qingxin_wan:      { id: 'qingxin_wan',    name: '清心丸',    desc: '宁神静气的药丸，可解除混乱状态。',                       value: 6,   stealDiff: 18, category: 'medicine', use: { cure: 'confusion' } },
};

function getItem(id) {
    return ITEMS[id] || null;
}
