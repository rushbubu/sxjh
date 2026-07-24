// ─── 战斗系统：敌人数据模板 ───

const TRAVEL_ENEMY_CONFIGS = {
    tiger_1:   { name: '一只猛虎',   cp: 30, basicName: '猛扑', specialName: '虎啸山林' },
    tiger_2:   { name: '两只猛虎',   cp: 60, basicName: '猛扑', specialName: '合击' },
    bandit_1:  { name: '一个强盗',   cp: 15, basicName: '挥砍', specialName: '劈头一刀' },
    bandit_2:  { name: '两个强盗',   cp: 30, basicName: '挥砍', specialName: '前后夹击' },
    bandit_g:  { name: '一群强盗',   cp: 90, basicName: '乱刀齐砍', specialName: '围攻' },
    robber_1:  { name: '一个山贼',   cp: 20, basicName: '棍击', specialName: '当头一棒' },
    robber_2:  { name: '两个山贼',   cp: 40, basicName: '棍击', specialName: '左右夹棍' },
    robber_g:  { name: '一群山贼',   cp: 120,basicName: '乱棍齐下', specialName: '山贼阵' },
    dog_1:     { name: '一只野狗',   cp: 8,  basicName: '撕咬', specialName: '狂吠扑击' },
    dog_g:     { name: '一群野狗',   cp: 40, basicName: '群咬', specialName: '蜂拥而上' },
};

// 武林人士武功对应的招式名
const NPC_ART_MOVES = {
    mantis:    { basic: '螳螂探爪',   special: '螳螂捕蝉' },
    hongquan:  { basic: '冲拳',       special: '洪拳八打' },
    fuhu:      { basic: '伏虎掌',     special: '降龙伏虎' },
    tantui:    { basic: '弹腿',       special: '连环弹腿' },
    zuiquan:   { basic: '醉步挥拳',   special: '醉八仙' },
    tiezhang:  { basic: '铁掌',       special: '开碑裂石' },
    longzhua:  { basic: '龙爪',       special: '飞龙探云' },
    zhuifeng:  { basic: '追风刺',     special: '追风逐月' },
    taiji:     { basic: '云手',       special: '揽雀尾' },
    baji:      { basic: '撑锤',       special: '铁山靠' },
    tongbi:    { basic: '通臂拳',     special: '猿臂穿梭' },
    tiangang:  { basic: '天罡掌',     special: '天罡北斗' },
    tiesha:    { basic: '铁砂掌',     special: '黑砂手' },
    jingang:   { basic: '金刚掌',     special: '金刚伏魔' },
    nianhua:   { basic: '拈花指',     special: '迦叶拈花' },
    caidao:    { basic: '砍柴式',     special: '樵夫问路' },
    yiyangzhi: { basic: '一阳指',     special: '六脉神剑' },
};

function createTravelEnemy(key) {
    const cfg = TRAVEL_ENEMY_CONFIGS[key];
    if (!cfg) { const cp = 10; return createGenericEnemy('未知敌人', cp); }
    const cp = cfg.cp;
    const hp = Math.max(10, Math.floor(cp * 0.9));
    return {
        name: cfg.name, hp, maxHp: hp,
        neili: Math.floor(cp * 1.5), maxNeili: Math.floor(cp * 1.5),
        combatPower: cp,
        moves: [
            { name: cfg.basicName,   power: Math.max(2, Math.floor(cp * 0.3)),  neiliCost: 0, type: 'basic' },
            { name: cfg.specialName, power: Math.max(4, Math.floor(cp * 0.55)), neiliCost: Math.max(1, Math.floor(cp * 0.15)), type: 'special' },
        ],
        goldReward: Math.floor(cp * 1.5),
        expReward: cp * 2,
    };
}

function generateNpcEnemy(npc) {
    const cp = npc.combatPower || 15;
    const hp = Math.max(20, Math.floor(cp * 1.2));
    const art = npc.martialArt;
    let basicName = '拳脚', specialName = '奋力一击';
    if (art && NPC_ART_MOVES[art]) {
        basicName = NPC_ART_MOVES[art].basic;
        specialName = NPC_ART_MOVES[art].special;
    }
    return {
        name: npc.npcName, hp, maxHp: hp,
        neili: cp * 3, maxNeili: cp * 3,
        combatPower: cp,
        moves: [
            { name: basicName,   power: Math.max(3, Math.floor(cp * 0.32)), neiliCost: 0, type: 'basic' },
            { name: specialName, power: Math.max(5, Math.floor(cp * 0.6)),  neiliCost: Math.max(2, Math.floor(cp * 0.18)), type: 'special' },
        ],
        npcData: npc,
    };
}

function generateChiefSonEnemy(sonName, sonPower) {
    const hp = Math.max(25, Math.floor(sonPower * 1.1));
    return {
        name: sonName, hp, maxHp: hp,
        neili: Math.floor(sonPower * 2), maxNeili: Math.floor(sonPower * 2),
        combatPower: sonPower,
        moves: [
            { name: '直拳',       power: Math.max(4, Math.floor(sonPower * 0.3)),  neiliCost: 0, type: 'basic' },
            { name: '蛮力冲撞',   power: Math.max(6, Math.floor(sonPower * 0.55)), neiliCost: Math.max(3, Math.floor(sonPower * 0.15)), type: 'special' },
        ],
    };
}

function createGenericEnemy(name, cp) {
    const hp = Math.max(15, Math.floor(cp * 1.1));
    return {
        name, hp, maxHp: hp,
        neili: cp * 2, maxNeili: cp * 2,
        combatPower: cp,
        moves: [
            { name: '攻击',     power: Math.max(2, Math.floor(cp * 0.3)),  neiliCost: 0, type: 'basic' },
            { name: '全力一击', power: Math.max(3, Math.floor(cp * 0.55)), neiliCost: Math.max(1, Math.floor(cp * 0.15)), type: 'special' },
        ],
    };
}

function createGuardEnemy(name, cp) {
    const hp = Math.max(20, Math.floor(cp * 1.0));
    return {
        name, hp, maxHp: hp,
        neili: cp, maxNeili: cp,
        combatPower: cp,
        moves: [
            { name: '棍击',   power: Math.max(4, Math.floor(cp * 0.32)),  neiliCost: 0, type: 'basic' },
            { name: '擒拿手', power: Math.max(6, Math.floor(cp * 0.58)),  neiliCost: Math.max(2, Math.floor(cp * 0.16)), type: 'special' },
        ],
    };
}
