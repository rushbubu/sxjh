// ═══ 房间类型配置 ═══
const HOUSE_ROOM_TYPES = {
    training: {
        name: '练功房', icon: '⚔',
        desc: '修炼外功、心法的专属场所。',
        levels: [
            { cost: 5000,  desc: '院落中划出一块空地，立了几个木桩。' },
            { cost: 20000, desc: '器械齐全的练功房，修炼事半功倍。' },
            { cost: 80000, desc: '上等练功密室，静心凝神，一日千里。' },
        ]
    },
    alchemy: {
        name: '炼丹房', icon: '⚗',
        desc: '炼制丹药的专用房间。',
        levels: [
            { cost: 8000,  desc: '一座石炉，几只瓦罐，勉强可炼丹药。' },
            { cost: 30000, desc: '上品丹炉，通风良好，丹药成色更佳。' },
            { cost: 100000,desc: '极品丹房，奇珍异材在此可化腐朽为神奇。' },
        ]
    },
    storage: {
        name: '库房', icon: '📦',
        desc: '储物纳藏的仓库，可存放各类杂物。',
        levels: [
            { cost: 3000,  desc: '一间小库房，几只木架，可堆放杂物。' },
            { cost: 10000, desc: '宽敞的库房，一排排货架井然有序。' },
            { cost: 40000, desc: '三层仓库，铁门铜锁，万贯家财亦藏得下。' },
        ]
    },
    kitchen: {
        name: '庖厨', icon: '🍳',
        desc: '烹制珍馐美味的厨房，可提升烹饪效果。',
        levels: [
            { cost: 4000,  desc: '土灶铁锅，柴火旺盛，可做寻常饭菜。' },
            { cost: 15000, desc: '上等庖厨，刀俎锅瓢一应俱全。' },
            { cost: 50000, desc: '御厨级别的厨房，天下珍馐皆可烹制。' },
        ]
    },
    dining: {
        name: '膳厅', icon: '🍽',
        desc: '用膳宴客之所，可招待宾客。',
        levels: [
            { cost: 3000,  desc: '方桌几张，可招待三五好友小酌。' },
            { cost: 12000, desc: '八仙桌太师椅，可宴请十余人。' },
            { cost: 40000, desc: '富丽堂皇的宴会大厅，可摆数十桌酒席。' },
        ]
    },
    study: {
        name: '书房', icon: '📖',
        desc: '读书研习、提升悟性的清静之处。',
        levels: [
            { cost: 3000,  desc: '一案一椅，几本旧书，好歹有个读书之处。' },
            { cost: 12000, desc: '藏书百卷，笔墨纸砚一应俱全。' },
            { cost: 50000, desc: '万卷藏书阁，儒道释三家典籍尽在案头。' },
        ]
    },
    garden: {
        name: '花园', icon: '🌸',
        desc: '亭台水榭，赏花观鱼，陶冶性情。',
        levels: [
            { cost: 6000,  desc: '几株花木，一方小池，倒也清幽。' },
            { cost: 25000, desc: '假山流水，曲径通幽，颇有几分雅致。' },
            { cost: 80000, desc: '江南名园之风，亭台楼阁，步步皆景。' },
        ]
    },
    reception: {
        name: '会客厅', icon: '🏛',
        desc: '接待宾客、宴请友人的场所。',
        levels: [
            { cost: 5000,  desc: '方桌木椅，虽简朴但也干净整洁。' },
            { cost: 20000, desc: '八仙桌太师椅，墙上挂着名家字画。' },
            { cost: 80000, desc: '富丽堂皇的大厅，王侯将相也不过如此。' },
        ]
    },
};

// ═══ 鱼池（独立设施，不计入房间数）═══
const HOUSE_POND_CONFIG = {
    name: '鱼池', icon: '🐟',
    desc: '庭院中的鱼池，可蓄养锦鲤、金鱼、灵龟。',
    levels: [
        { cost: 5000,  desc: '一方小池，青石围边，可养数尾小鱼。', maxStock: 3 },
        { cost: 20000, desc: '曲桥流水，假山环绕，可养十余尾。',   maxStock: 10 },
        { cost: 80000, desc: '亭台水榭，荷香四溢，天下名鱼尽可蓄养。', maxStock: 30 },
    ],
    stockTypes: [
        { id: 'goldfish', name: '金鱼',      desc: '小巧玲珑，红白相间，赏心悦目。',        cost: 50,  value: 30 },
        { id: 'koi',      name: '锦鲤',      desc: '色彩斑斓的观赏鲤鱼，寓意吉祥富贵。',    cost: 200, value: 150 },
        { id: 'turtle',   name: '灵龟',      desc: '通灵的老龟，背上刻着玄奥的纹路。',        cost: 500, value: 400 },
    ],
};

// ═══ 卧室（特殊房间，按床位算）═══
const HOUSE_BEDROOM_CONFIG = {
    name: '卧室', icon: '🛏',
    desc: '每间卧室可容纳一位红颜入住。',
    levels: [
        { cost: 10000,  desc: '朴素厢房，一床一柜，干净即可。' },
        { cost: 40000,  desc: '雅致闺房，妆台镜奁，温馨舒适。' },
        { cost: 150000, desc: '奢华卧房，锦被罗帐，人间仙境。' },
    ],
};

// ═══ 房源规格（每个城市3种）═══
const CITY_PLOTS = {
    small: [
        { id: 'small_yard',  name: '小院',   desc: '一进院落，清净雅致，适合独居。',    maxRooms: 1, maxBedrooms: 1, maxLevel: 2 },
        { id: 'mansion',     name: '宅邸',   desc: '三进大宅，宽敞气派，可纳亲友。',    maxRooms: 2, maxBedrooms: 2, maxLevel: 2 },
        { id: 'estate',      name: '庄园',   desc: '独占一方天地，满城皆知其名。',      maxRooms: 3, maxBedrooms: 3, maxLevel: 2 },
    ],
    big: [
        { id: 'small_yard',  name: '小院',   desc: '城中一隅，闹中取静，别有天地。',    maxRooms: 2, maxBedrooms: 2, maxLevel: 3 },
        { id: 'mansion',     name: '宅邸',   desc: '深宅大院，前庭后院，气势不凡。',    maxRooms: 4, maxBedrooms: 4, maxLevel: 3 },
        { id: 'estate',      name: '庄园',   desc: '城中之城，顶级权贵的府邸规格。',    maxRooms: 6, maxBedrooms: 6, maxLevel: 3 },
    ],
};

// ═══ 城市地价倍率（基准 × 倍率）═══
// 小城基准: 5,000两；大城基准: 100,000两
const CITY_LAND_MULTIPLIER = {
    luoyang: 1, chengdu: 1.2, xiangyang: 0.8,
    suzhou_city: 1.5, dali: 0.8, yangzhou: 1.2,
    suzhou: 20, changan: 20,
    jingcheng: 40, shendu: 60,
};

const BASE_LAND_SMALL = 5000;
const BASE_LAND_BIG = 100000;

// ═══ 浴池配置 ═══
const HOUSE_BATH_CONFIG = {
    normal: {
        name: '露天浴池', icon: '🛁',
        desc: '庭院中的露天浴池，可沐浴放松、恢复体力。',
        levels: [
            { cost: 8000,   desc: '简易木池，引水入池，可洗去一身疲乏。',    healHp: 30,  healNeili: 10 },
            { cost: 30000,  desc: '石砌浴池，四周种满花木，沐浴时暗香浮动。', healHp: 60,  healNeili: 25 },
            { cost: 100000, desc: '白玉为池，池边设榻，宛如人间仙境。',        healHp: 100, healNeili: 50 },
        ],
    },
    hotspring: {
        name: '温泉浴池', icon: '♨',
        desc: '引入天然温泉的浴池，对修为大有裨益。',
        levels: [
            { cost: 20000,  desc: '引泉入池，热气氤氲，泡之通体舒泰。',      healHp: 50,  healNeili: 30 },
            { cost: 80000,  desc: '亭台覆顶，温泉环绕，可边泡边赏景。',      healHp: 100, healNeili: 60 },
            { cost: 300000, desc: '皇室规格的温泉行宫，泡一次可抵七日苦修。', healHp: 200, healNeili: 120 },
        ],
    },
};

const HOTSPRING_CITIES = ['shendu', 'jingcheng', 'changan'];

// ═══ 声望阈值 ═══
const HOUSE_REP_THRESHOLDS = [
    { minValue: 0,       label: '陋室',   repBonus: 0 },
    { minValue: 50000,   label: '雅居',   repBonus: 30 },
    { minValue: 200000,  label: '华宅',   repBonus: 100 },
    { minValue: 500000,  label: '府邸',   repBonus: 300 },
    { minValue: 1500000, label: '山庄',   repBonus: 800 },
];

// ═══ 辅助函数 ═══
function getCityTier(cityId) {
    if (WORLD.big_cities.some(c => c.id === cityId)) return 'big';
    if (WORLD.small_cities.some(c => c.id === cityId)) return 'small';
    return null;
}

function getCityLandPrice(cityId, plotIndex) {
    const tier = getCityTier(cityId);
    if (!tier) return 0;
    const mult = CITY_LAND_MULTIPLIER[cityId] || (tier === 'big' ? 20 : 1);
    const base = tier === 'big' ? BASE_LAND_BIG : BASE_LAND_SMALL;
    const plotPrice = [1, 2, 4][plotIndex] || 1;
    return base * mult * plotPrice;
}

function getHouseRepLabel(value) {
    const t = HOUSE_REP_THRESHOLDS.slice().reverse().find(t => value >= t.minValue);
    return t ? t.label : '陋室';
}

function getHouseRepBonus(value) {
    const t = HOUSE_REP_THRESHOLDS.slice().reverse().find(t => value >= t.minValue);
    return t ? t.repBonus : 0;
}
