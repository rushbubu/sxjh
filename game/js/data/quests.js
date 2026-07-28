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
