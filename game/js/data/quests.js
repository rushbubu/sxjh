/* ─── 辅助：数字转中文序数 ─── */
const _CN_ORD = ['零','其一','其二','其三','其四','其五','其六','其七','其八','其九','其十'];

function questOrderLabel(order) {
    return _CN_ORD[order] || '第' + order;
}

function _findQuest(questId) {
    return QUESTS[questId] || MAIN_QUESTS[questId];
}

function questDisplayName(questId) {
    const q = _findQuest(questId);
    if (!q) return '【未知】';
    const prefix = QUESTS[questId] ? '支线任务' : '主线';
    return '【' + prefix + '·' + questOrderLabel(q.order) + '：' + q.name + '】';
}

function questShortLabel(questId) {
    const q = _findQuest(questId);
    if (!q) return '【?】';
    const prefix = QUESTS[questId] ? '支线' : '主线';
    return '【' + prefix + q.order + '】';
}

/* ─── 支线任务数据 ─── */

const QUESTS = {
    blacksmith_iron: {
        order: 1,
        id: 'blacksmith_iron',
        name: '铁匠的委托',
        desc: '铁匠铺进不到铁矿，帮铁匠去废弃矿坑挖 5 块铁矿石回来，可换精铁刀图纸。',
        stages: {
            TRIGGER: 'ACCEPTED',
            ACCEPTED: null,
        },
    },
    rescue_ox: {
        order: 2,
        id: 'rescue_ox',
        name: '救牛',
        desc: '村口遇到一对爷孙因卖牛起冲突，帮他们把牛赎回来。',
        timeLimit: 'today',
        stages: {
            TRIGGER: 'FIGHT_SCENE',
            FIGHT_SCENE: 'AFTER_BATTLE',
            AFTER_BATTLE: null,
            SPAWN_BUTCHER: 'BUTCHER_ACTIVE',
            BUTCHER_ACTIVE: null,
        },
    },
};

/* ─── 主线任务数据 ─── */

const MAIN_QUESTS = {
    main_1: {
        order: 1,
        id: 'main_1',
        name: '村长问话',
        desc: '村长的家是个合适的去处，但在此之前，你或许应当先提升自己的实力和声望。',
    },
    main_2: {
        order: 2,
        id: 'main_2',
        name: '大户问话',
        desc: '向大户询问沈清寒的消息。',
    },
    main_3: {
        order: 3,
        id: 'main_3',
        name: '城中打探',
        desc: '长安、京城、成都、姑苏四地的听风阁情报贩子，或许知道沈清寒的下落。',
    },
    main_4: {
        order: 4,
        id: 'main_4',
        name: '山中巢穴',
        desc: '情报指向暗杀组织藏身的山野——四方皆有其巢穴，离你最近的那座山最是凶险。此行务必小心。',
    },
};

const QUEST_ENEMIES = {
    angry_young_man: {
        name: '愤怒的年轻人',
        hp: 50, maxHp: 50,
        combatPower: 25,
        dexterity: 15,
        attack: 12,
        defense: 5,
        expReward: 10,
        goldReward: 0,
        drops: [],
        martialArts: [],
        skills: [],
    },
    butcher: {
        name: '张屠户',
        hp: 80, maxHp: 80,
        combatPower: 35,
        dexterity: 12,
        attack: 18,
        defense: 8,
        expReward: 15,
        goldReward: 0,
        drops: [],
        martialArts: [],
        skills: [],
    },
};
