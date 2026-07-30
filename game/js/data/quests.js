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
    rescue_ox: {
        order: 1,
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
        desc: '向村长打听师弟沈清寒的下落。',
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
        desc: '去城里的酒楼、赌坊等地方打探沈清寒的消息。',
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
