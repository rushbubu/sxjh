// ─── 战斗系统：敌人数据模板 ───

function getStatusChanceForCp(cp) {
    return Math.min(0.85, 0.2 + cp * 0.008);
}

const ART_STATUS = {
    yingzhua:     { type: 'bleed', chance: 0.35 },
    mantis:       { type: 'bleed', chance: 0.3 },
    longzhua:     { type: 'bleed', chance: 0.3 },
    hei_hu_tao_xin:{ type: 'bleed', chance: 0.3 },
    hu_zhua_shou: { type: 'bleed', chance: 0.3 },
    long_hu_zhua: { type: 'bleed', chance: 0.35 },
    wudu:         { type: 'poison', chance: 0.35 },
};

const TRAVEL_ENEMY_CONFIGS = {
    tiger_1:   { name: '一只猛虎',   cp: 30, basicName: '猛扑', specialName: '虎啸山林', beast: true },
    tiger_2:   { name: '两只猛虎',   cp: 60, basicName: '猛扑', specialName: '合击', beast: true },
    bandit_1:  { name: '一个强盗',   cp: 15, basicName: '挥砍', specialName: '劈头一刀' },
    bandit_2:  { name: '两个强盗',   cp: 30, basicName: '挥砍', specialName: '前后夹击' },
    bandit_g:  { name: '一群强盗',   cp: 90, basicName: '乱刀齐砍', specialName: '围攻' },
    robber_1:  { name: '一个山贼',   cp: 20, basicName: '棍击', specialName: '当头一棒' },
    robber_2:  { name: '两个山贼',   cp: 40, basicName: '棍击', specialName: '左右夹棍' },
    robber_g:  { name: '一群山贼',   cp: 120,basicName: '乱棍齐下', specialName: '山贼阵' },
    dog_1:     { name: '一只野狗',   cp: 8,  basicName: '撕咬', specialName: '狂吠扑击', beast: true },
    dog_g:     { name: '一群野狗',   cp: 40, basicName: '群咬', specialName: '蜂拥而上', beast: true },
    snake_1:   { name: '一条毒蛇',   cp: 10, basicName: '噬咬', specialName: '毒牙穿刺', beast: true, venomous: true },
    thug_1:    { name: '一个无赖',   cp: 12, basicName: '拳脚', specialName: '混混群殴' },
    thug_2:    { name: '两个流氓',   cp: 25, basicName: '棍棒', specialName: '前后夹击' },
};

// 武林人士武功对应的招式名
const NPC_ART_MOVES = {
    yingzhua:     { basic: '鹰爪手',     special: '苍鹰捕兔' },
    mantis:       { basic: '螳螂探爪',   special: '螳螂捕蝉' },
    hongquan:     { basic: '冲拳',       special: '洪拳八打' },
    fuhu:         { basic: '伏虎掌',     special: '降龙伏虎' },
    tantui:       { basic: '弹腿',       special: '连环弹腿' },
    zuiquan:      { basic: '醉步挥拳',   special: '醉八仙' },
    tiezhang:     { basic: '铁掌',       special: '开碑裂石' },
    longzhua:     { basic: '龙爪',       special: '飞龙探云' },
    zhuifeng:     { basic: '追风刺',     special: '追风逐月' },
    taiji:        { basic: '云手',       special: '揽雀尾' },
    baji:         { basic: '撑锤',       special: '铁山靠' },
    tongbi:       { basic: '通臂拳',     special: '猿臂穿梭' },
    tiangang:     { basic: '天罡掌',     special: '天罡北斗' },
    tiesha:       { basic: '铁砂掌',     special: '黑砂手' },
    jingang:      { basic: '金刚伏魔掌', special: '金刚降魔' },
    nianhua:      { basic: '拈花指',     special: '迦叶拈花' },
    caidao:       { basic: '砍柴式',     special: '樵夫问路' },
    yiyangzhi:    { basic: '一阳指',     special: '六脉神剑' },
    wudu:         { basic: '五毒掌',     special: '万毒蚀骨' },
    hei_hu_tao_xin:{ basic: '黑虎掏心',  special: '猛虎下山' },
    hu_zhua_shou: { basic: '虎爪手',    special: '饿虎扑食' },
    long_hu_zhua: { basic: '龙虎爪',    special: '龙吟虎啸' },
    shaolin_quan: { basic: '罗汉拳',    special: '金刚怒目' },
    wudang_quan:  { basic: '武当长拳',  special: '太极起势' },
    wang_ba_quan:  { basic: '王八拳',   special: '乱拳乱抡' },
    ye_gou_quan:   { basic: '野狗拳',   special: '疯狗扑咬' },
    chang_quan:    { basic: '长拳',     special: '冲拳直击' },
    wang_ba_zhang: { basic: '王八掌',   special: '龟缩防御' },
    kuai_zhang:    { basic: '快掌',     special: '疾风连掌' },
    kai_shan_zhang:{ basic: '开山掌',   special: '力劈华山' },
    bo_re_zhang:  { basic: '般若掌',   special: '佛法无边' },
    han_bing_shen_zhang:{ basic: '寒冰神掌', special: '冰封千里' },
    qian_shou_ru_lai_zhang:{ basic: '千手如来掌', special: '千手降魔' },

    // 少林七十二绝技 — 拳法
    shao_lin_chang_quan:{ basic: '少林长拳',   special: '开山破石' },
    luo_han_quan:      { basic: '罗汉拳',     special: '十八罗汉' },
    wei_tuo_chu:       { basic: '韦陀杵',     special: '韦陀降魔' },

    // 掌法
    da_jin_gang_zhang:  { basic: '大金刚掌',   special: '金刚怒目' },
    xu_mi_shan_zhang:   { basic: '须弥山掌',   special: '须弥压顶' },
    jin_gang_bo_re_zhang:{ basic: '金刚般若掌', special: '金刚般若' },
    xiang_mo_zhang:     { basic: '降魔掌',     special: '降魔卫道' },
    yi_pai_liang_san:   { basic: '一拍两散',   special: '玉石俱焚' },

    // 指法
    duo_luo_ye_zhi:     { basic: '多罗叶指',   special: '叶落缤纷' },
    wu_xiang_jie_zhi:   { basic: '无相劫指',   special: '无相无形' },
    mo_he_zhi:          { basic: '摩诃指',     special: '摩诃无量' },
    da_li_jin_gang_zhi: { basic: '大力金刚指', special: '金刚碎玉' },
    yi_zhi_chan:        { basic: '一指禅',     special: '一指破万法' },
    da_zhi_wu_ding_zhi: { basic: '大智无定指', special: '无定无常' },
    qu_fan_nao_zhi:     { basic: '去烦恼指',   special: '烦恼尽消' },
    tian_zhu_fo_zhi:    { basic: '天竺佛指',   special: '佛指西来' },

    // 刀棍
    ran_mu_dao_fa:      { basic: '燃木刀法',   special: '烈焰焚天' },
    fu_mo_zhang_fa:     { basic: '伏魔杖法',   special: '万佛朝宗' },
    feng_mo_zhang_fa:   { basic: '疯魔杖法',   special: '疯魔乱舞' },

    // 手法
    shao_lin_qin_na:    { basic: '少林擒拿十八打', special: '分筋错骨' },
    bo_luo_mi_shou:     { basic: '波罗密手',   special: '般若波罗密' },
    da_ci_da_bei_qian_shou_shi:{ basic: '大慈大悲千手式', special: '千手如来' },

    // 功法
    jia_sha_fu_mo_gong:{ basic: '袈裟伏魔功', special: '袈裟蔽天' },
    po_na_gong:        { basic: '破衲功',     special: '破衲万千' },
    tie_xiu_gong:      { basic: '铁袖功',     special: '铁袖横扫' },
    xiu_li_qian_kun:   { basic: '袖里乾坤',   special: '乾坤一袖' },
    jin_gang_chan_shi_zi_hou:{ basic: '金刚禅狮子吼', special: '狮子震天' },

    // 无上内功
    jin_gang_bu_huai_ti:{ basic: '金刚不坏体神功', special: '金刚不坏' },
    xi_sui_jing:       { basic: '洗髓经',     special: '洗髓伐脉' },
    yi_jin_jing:       { basic: '易筋经',     special: '易筋洗髓' },
};

function createTravelEnemy(key) {
    const cfg = TRAVEL_ENEMY_CONFIGS[key];
    if (!cfg) { const cp = 10; return createGenericEnemy('未知敌人', cp); }
    const cp = cfg.cp;
    const hp = Math.max(10, Math.floor(cp * 0.9));
    const specialMove = { name: cfg.specialName, power: Math.max(4, Math.floor(cp * 0.55)), neiliCost: Math.max(1, Math.floor(cp * 0.15)), type: 'special' };
    if (cfg.beast || cfg.venomous) {
        const statusType = cfg.venomous ? 'poison' : 'bleed';
        specialMove.status = { type: statusType, chance: getStatusChanceForCp(cp) };
    }
    return {
        name: cfg.name, hp, maxHp: hp,
        neili: Math.floor(cp * 1.5), maxNeili: Math.floor(cp * 1.5),
        combatPower: cp,
        moves: [
            { name: cfg.basicName,   power: Math.max(2, Math.floor(cp * 0.3)),  neiliCost: 0, type: 'basic' },
            specialMove,
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
    const specialMove = { name: specialName, power: Math.max(5, Math.floor(cp * 0.6)), neiliCost: Math.max(2, Math.floor(cp * 0.18)), type: 'special' };
    if (art && ART_STATUS[art]) {
        specialMove.status = { type: ART_STATUS[art].type, chance: ART_STATUS[art].chance };
    }
    return {
        name: npc.npcName, hp, maxHp: hp,
        neili: cp * 3, maxNeili: cp * 3,
        combatPower: cp,
        moves: [
            { name: basicName,   power: Math.max(3, Math.floor(cp * 0.32)), neiliCost: 0, type: 'basic' },
            specialMove,
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
        dexterity: 10,
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
