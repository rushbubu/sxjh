const TIERS = {
    white:  { label: '凡品', color: '#c0c0c0', order: 0 },
    green:  { label: '良品', color: '#40c040', order: 1 },
    blue:   { label: '精品', color: '#4080ff', order: 2 },
    purple: { label: '上品', color: '#a040e0', order: 3 },
    red:    { label: '极品', color: '#e04040', order: 4 },
    orange: { label: '绝品', color: '#e09040', order: 5 },
    black:  { label: '神品', color: '#303030', order: 6 },
};

const EQUIP_SLOTS = [
    { key: 'rightHand',   label: '右手' },
    { key: 'leftHand',    label: '左手' },
    { key: 'head',        label: '头部' },
    { key: 'upperBody',   label: '上半身' },
    { key: 'lowerBody',   label: '下半身' },
    { key: 'boots',       label: '靴子' },
    { key: 'bracers',     label: '护臂' },
    { key: 'accessory1',  label: '饰品一' },
    { key: 'accessory2',  label: '饰品二' },
];

function getTierInfo(tier) {
    return TIERS[tier] || TIERS.white;
}

const ITEM_TIER_LABELS = { white:'凡品', green:'良品', blue:'精品', purple:'上品', orange:'绝品', gold:'神品', red:'仙品' };

class Game {
    constructor() {
        this.freePoints = 30;
        this.createValues = {};
        this.player = null;
        this.currentLocation = null;
        this.killedNpcs = new Set();
        this.redRecord = {};
        this.brothelProstitutes = {};
        this.init();
    }

    init() {
        this.generateCreatePanel();
        this.resetCreateValues();
    }

    generateCreatePanel() {
        const container = document.getElementById('create-attrs');
        container.innerHTML = '';
        for (const attr of ATTRIBUTES) {
            const row = document.createElement('div');
            row.className = 'attr-row';
            row.innerHTML = `
                <span class="attr-label">${attr.name} <span class="attr-desc">(${attr.desc})</span></span>
                <span class="attr-val" id="attr-${attr.id}-val">10</span>
                <div class="attr-bar">
                    <div class="attr-fill" id="attr-${attr.id}-fill" style="width:10%"></div>
                </div>
                <div class="attr-btns">
                    <button onclick="game.adjustAttr(${attr.id},-5)">-5</button>
                    <button onclick="game.adjustAttr(${attr.id},-1)">-1</button>
                    <button onclick="game.adjustAttr(${attr.id},1)">+1</button>
                    <button onclick="game.adjustAttr(${attr.id},5)">+5</button>
                </div>
            `;
            container.appendChild(row);
        }
    }

    resetCreateValues() {
        this.remainingPoints = this.freePoints;
        for (const attr of ATTRIBUTES) {
            this.createValues[attr.id] = 10;
        }
        this.updateCreateDisplay();
    }

    updateCreateDisplay() {
        for (const attr of ATTRIBUTES) {
            const val = this.createValues[attr.id];
            document.getElementById(`attr-${attr.id}-val`).textContent = val;
            document.getElementById(`attr-${attr.id}-fill`).style.width = val + '%';
        }
        document.getElementById('remain-points').textContent = this.remainingPoints;
        this.renderCreateRatings();
    }

    renderCreateRatings() {
        const container = document.getElementById('create-ratings');
        container.innerHTML = ATTRIBUTES.map(a =>
            `<span>${a.name}：<span style="color:${getRating(this.createValues[a.id]).color}">${getRatingLabel(this.createValues[a.id])}</span></span>`
        ).join('');
    }

    adjustAttr(id, delta) {
        const current = this.createValues[id];
        const newVal = current + delta;
        if (newVal < 0 || newVal > 100) return;
        if (delta > 0 && this.remainingPoints < delta) return;
        this.createValues[id] = newVal;
        if (delta > 0) this.remainingPoints -= delta;
        else this.remainingPoints += -delta;
        this.updateCreateDisplay();
    }

    cheatMaxAttrs() {
        for (const attr of ATTRIBUTES) {
            this.createValues[attr.id] = 100;
        }
        this.remainingPoints = 0;
        this.updateCreateDisplay();
    }

    startGame() {
        if (this.remainingPoints < 0) return;
        const attrs = {};
        for (const attr of ATTRIBUTES) attrs[attr.key] = this.createValues[attr.id];

        const startMaxHp = Math.max(10, attrs.root);
        this.player = {
            attrs,
            hp: startMaxHp, maxHp: startMaxHp,
            neili: 0, maxNeili: 0,
            day: 1, level: 1, exp: 0,
            gold: 500000000, reputation: 10,
            shadowRep: 0,
            // ─── 三套声望系统 ───
            // _evil:     罪恶值 (+为恶), 用于判定心魔/入魔事件
            // _worldHelp: 济苍生 (+为善), 用于判定大侠/侠义事件 & 正派入门门槛
            // shadowRep: 暗面声望, 用于判定黑道/帮派进阶门槛 (只增不减)
            // 三者独立运转, 允许玩家同时具备善行/恶行/暗面经营, 而非单一"善恶值"抹平一切
            // 设计初衷: 侠之大者, 有两种——强大的人学会正义, 正义的人变得强大
            // 瘸子李线即为后者的启蒙注脚
            timePeriod: '清晨',
            items: [],
            equipment: { rightHand:null, leftHand:null, head:null, upperBody:null, lowerBody:null, boots:null, bracers:null, accessory1:null, accessory2:null },
            externalSkills: [],
            internalSkills: ['天之书'],
            locationId: null,
            villageBlacklist: {},
            faction: null,
            factionRank: 0,
            factionRep: 0,
            _evil: 0,
            _worldHelp: 0,
            _theftCount: 0,
            _assassinationCount: 0,
            _villageRoot: {},       // 砍柴根骨（每村庄上限5）
            _villageMineRoot: {},   // 挖矿根骨（每村庄上限10）
            _villageMineDex: {},    // 矿难灵巧（每村庄上限10）
            _villageFishGold: {},   // 每村庄元宝鱼已钓数（最多5条）
            _massageLevel: 0,       // 按摩心经修炼等级（0-5）
            _tianzhishuLevel: 0,    // 天之书修炼次数（上限10）
            _huntUnlockLevel: 0,
            _drunk: 0,
            houses: {},
            _portablePond: null,
            _fishQuestDone: 0,
        };

        setupStreetGamblers(WORLD);
        this._initCrippleLi();
        this.injectFactionVenues();
        const startVillages = WORLD.villages.filter(v => getRegion(v.id) !== 'zhongbu');
        const sv = startVillages[Math.floor(Math.random() * startVillages.length)];
        this.player.locationId = sv.id;
        this.player.startingVillage = sv.id;
        this.player.mainQuest = 0;
        this.player.mainQuestSteps = [
            '去村长家打听师弟沈清寒的下落',
            '去大户家询问沈清寒的消息',
            '去城里的酒楼、赌坊等地方打探消息',
        ];
        this.player._questFirstEntry = true;
        this.player._questFirstCityEntry = true;
        const usedNames = new Set();
        this.beautyMap = {};
        for (const loc of getAllLocations()) {
            const type = loc.nearestCity ? 'village' : WORLD.big_cities.find(c => c.id === loc.id) ? 'big_city' : 'small_city';
            this.beautyMap[loc.id] = generateBeauties(loc.id, type, usedNames);
        }
        for (const sb of SPECIAL_BEAUTIES) {
            if (!this.beautyMap[sb.locationId]) this.beautyMap[sb.locationId] = [];
            this.beautyMap[sb.locationId].push(sb);
        }
        this.brothelProstitutes = {};
        for (const loc of getAllLocations()) {
            if (loc.id === 'dali') continue;
            const type = loc.nearestCity ? null : WORLD.big_cities.find(c => c.id === loc.id) ? 'big_city' : 'small_city';
            if (type) this.brothelProstitutes[loc.id] = generateProstitutes(loc.id, type, usedNames);
        }
        document.getElementById('create-overlay').classList.add('hidden');
        this.updateStatsBar();
        this.houseManager = new HouseManager(this);
        this.estateManager = new EstateManager(this);
        this.showIntro();
    }

    /* ─── 门派驻地注入 ─── */

    injectFactionVenues() {
        for (const fId of Object.keys(FACTIONS)) {
            const f = FACTIONS[fId];
            const cities = [...WORLD.big_cities, ...WORLD.small_cities];
            const host = cities.find(c => c.id === f.locationId);
            if (!host) continue;
            const isWealthy = fId === 'money';
            // 避免重复注入：门派驻地已存在则跳过
            if (!host.venues.some(v => v.name === f.venueName)) {
                host.venues.push({
                    name: f.venueName,
                    npcs: [{
                        npcName: f.stewardName,
                        npcDesc: f.stewardDesc,
                        civilian: false,
                        combatPower: f.stewardPower,
    items: [],
    statuses: [],
                        factionId: fId,
                    }],
                    _isOutskirts: !isWealthy,
                    ...(isWealthy ? { _isCommercialHQ: true } : {}),
                });
            }
            // 爬塔入口已移至门派内部菜单（不再作为独立场景）
        }
    }

    /* ─── 罪恶值辅助 ─── */

    _adjEvil(delta, label) {
        this.player._evil = (this.player._evil || 0) + delta;
    }

    _adjWorldHelp(delta, label) {
        this.player._worldHelp = Math.max(0, (this.player._worldHelp || 0) + delta);
    }

    /* 随机济苍生事件（仅村庄触发） */
    tryRandomCharityEvent() {
        const loc = this.currentLocation;
        if (!loc || !loc.nearestCity) return false;
        if (Math.random() > 0.25) return false;
        const day = this.player.day;
        const key = '_charityDay_' + loc.id;
        if (this.player[key] === day) return false;

        const events = [
            {
                text: '一个衣衫褴褛的流浪汉蜷在墙角，瑟瑟发抖地伸出手：「行行好……给口吃的吧……」',
                gain: 2,
                ask: 'food',
                help: '流浪汉接过食物狼吞虎咽，眼眶泛红：「恩人……您一定长命百岁！」',
                helpMoney: '流浪汉接过银两，千恩万谢地走了。',
            },
            {
                text: '路边一个断了一条腿的老人坐在破席上，面前放着一个空碗。',
                gain: 2,
                ask: 'money',
                cost: 3,
                help: '你放了几两碎银在碗里，老人颤巍巍地拱手：「善人呐，菩萨保佑您。」',
                noMoney: '你摸了摸口袋，囊中空空，只能叹息着离开。',
            },
            {
                text: '一个面黄肌瘦的妇人抱着孩子跪在路边，孩子饿得直哭。',
                gain: 3,
                ask: 'both',
                cost: 5,
                helpMoney: '你掏出些银两塞给妇人，她泪流满面地给你磕了个头。',
                helpFood: '你把吃食递给妇人，她掰碎了喂给孩子，孩子终于止住了哭声。',
                noMoneyNoFood: '你囊中空空，只能低下头匆匆走过。',
            },
            {
                text: '你见一个瘸腿的老乞丐——不，是落魄的退伍老兵，正一瘸一拐地想爬上斜坡捡掉落的柴火。',
                gain: 2,
                ask: 'help',
                help: '你上前帮他拾起柴火，老兵咧嘴笑了：「小伙子，有把力气。」',
            },
            {
                text: '村口的破庙里躲着几个逃荒的流民，见你路过，一个老者颤声喊：「这位爷……赏口饭吃吧……」',
                gain: 2,
                ask: 'food',
                help: '你把食物分给他们，老者跪下就要磕头，你赶紧扶住了。',
                helpMoney: '你给了些银钱让他们自己去买吃的，老者含泪道谢。',
            },
            {
                text: '你看到一个孤儿蹲在路边，肚子饿得咕咕叫。',
                gain: 2,
                ask: 'both',
                cost: 3,
                helpMoney: '你带他去买了几个包子，看着他狼吞虎咽的样子，心中五味杂陈。',
                helpFood: '你翻出干粮递给孤儿，他接过去就狼吞虎咽地啃了起来。',
                noMoneyNoFood: '你叹了口气——自己也帮不上什么。',
            },
            {
                text: '一个瞎眼的老琴师坐在桥头拉二胡，跟前放着一只破碗。',
                gain: 1,
                ask: 'money',
                cost: 2,
                help: '你在碗里放下几两碎银，琴师微微点头，琴声似乎更凄凉了。',
                noMoney: '你摸了摸口袋，囊中羞涩，只能默默听了一会儿，终究没留下什么。',
            },
        ];

        const ev = events[Math.floor(Math.random() * events.length)];
        this.player[key] = day;
        this.clearChoices();
        this.addMessage(ev.text, 'narrator');

        // 查找背包中可使用（有 use 属性）的食物或酒
        const foodItems = this.player.items.filter(i => {
            const def = getItem(i.id);
            return def && (def.category === 'food' || def.category === 'wine') && def.use;
        });
        const hasFood = foodItems.length > 0;

        const choices = [];

        const doHelp = (extraMsg) => {
            this.clearChoices();
            if (extraMsg) this.addMessage(extraMsg, 'event');
            this.addMessage('助人为乐，江湖声望略有提升。声望 +1', 'event');
            this.player.reputation += 1;
            this.advanceTime();
            this._adjWorldHelp(ev.gain, '济苍生');
            this.updateStatsBar();
            this.showChoices([{ text: '继续赶路', action: () => this.showOutdoorChoices() }]);
        };

        const doMoney = (cost) => {
            const paid = Math.min(cost, this.player.gold);
            this.player.gold -= paid;
            if (paid < cost) {
                this.addMessage(`你囊中羞涩，翻遍口袋只找出${paid}两。`, 'narrator');
            }
            doHelp(ev.help);
        };

        // 根据 ask 类型生成选项
        if (ev.ask === 'help') {
            // 只需出力的
            choices.push({ text: '上前帮忙', action: () => { doHelp(ev.help); } });
        } else {
            if (ev.ask === 'money' || ev.ask === 'both') {
                const canPay = this.player.gold >= (ev.cost || 0);
                choices.push({
                    text: `给${ev.cost}两银子` + (canPay ? '' : '（钱不够）'),
                    action: () => {
                        if (!canPay) {
                            this.clearChoices();
                            this.addMessage(ev.noMoney || '你摸了摸口袋，囊中羞涩。', 'narrator');
                            this.showChoices([{ text: '继续赶路', action: () => this.showOutdoorChoices() }]);
                        } else {
                            doMoney(ev.cost);
                            if (ev.helpMoney) this.addMessage(ev.helpMoney, 'event');
                        }
                    },
                });
            }
            if (ev.ask === 'food' || ev.ask === 'both') {
                if (hasFood) {
                    choices.push({
                        text: `给些吃的（${foodItems.length}件可用）`,
                        action: () => {
                            this.clearChoices();
                            this.addMessage('你翻出背包里的吃食：', 'narrator');
                            const foodChoices = foodItems.map(fi => ({
                                text: fi.name,
                                action: () => {
                                    this.clearChoices();
                                    const idx = this.player.items.indexOf(fi);
                                    if (idx !== -1) this.player.items.splice(idx, 1);
                                    doHelp();
                                    const msg = ev.helpFood || ev.help || '';
                                    if (msg) this.addMessage(msg, 'event');
                                },
                            }));
                            foodChoices.push({ text: '算了', action: () => { this.clearChoices(); this.addMessage('你收起了食物。', 'narrator'); this.showChoices([{ text: '继续赶路', action: () => this.showOutdoorChoices() }]); } });
                            this.showChoices(foodChoices);
                        },
                    });
                } else {
                    choices.push({
                        text: '给些吃的（你也无能为力）',
                        action: () => {
                            this.clearChoices();
                            this.addMessage('你翻遍了包裹，没有一样能给人吃的东西。', 'narrator');
                            this.addMessage('你也无能为力，只能叹息着离开。', 'narrator');
                            this.showChoices([{ text: '继续赶路', action: () => this.showOutdoorChoices() }]);
                        },
                    });
                }
            }
        }

        choices.push({
            text: '多一事不如少一事', action: () => {
                this.clearChoices();
                if (ev.noMoneyNoFood) {
                    this.addMessage(ev.noMoneyNoFood, 'narrator');
                } else {
                    this.addMessage('你犹豫了一下，还是转身离开了。', 'narrator');
                }
                this.showChoices([{ text: '继续赶路', action: () => this.showOutdoorChoices() }]);
            },
        });

        this.showChoices(choices);
        return true;
    }

    /* ─── 序章 ─── */

    showIntro() {
        this.clearLog();
        this.clearChoices();
        const segs = [
            '你猛地睁开双眼。',
            '最后的记忆，是华山之巅。',
            '那一剑从背后刺入，穿胸而过——你的师弟沈清寒，你最信任的师弟，在你全力激战之时，递出了致命一剑。',
            '你——华山派大弟子，江湖上赫赫有名的剑客——坠入了万劫深渊。',
            '耳边还回响着他冷冰冰的声音：「师兄，这掌门之位就归我了。」',
            '万劫深渊，深不见底，自古无人能生还。但你竟没有死。',
            '坠落途中，怀里的古老竹简突然发光——是师父交给你的天之书残本。',
            '那是《天之书》残本，上古无上心法。经文虽不全，却已深深刻入你的魂魄。',
            '你，重生了。',
            '这一世，你要从零开始，一步一步——让那些背叛你的人，付出代价。',
        ];
        let i = 0;
        const next = () => {
            if (i < segs.length) {
                this.addMessage(segs[i], 'narrator'); i++;
                this.showChoices([{ text: i === segs.length ? '缓缓睁开双眼' : '继续……', action: i === segs.length ? () => this.afterIntro() : next }]);
            }
        };
        next();
    }

    afterIntro() {
        this.addMessage('你，活下来了。', 'system');
        this.enterLocation(this.player.locationId, false);
    }

    /* ─── 状态条 ─── */

    getRepInfo(rep) {
        if (rep <= -40) return { label: '游戏结束', color: '#800000' };
        if (rep < -30) return { label: '恶贯满盈', color: '#600000' };
        if (rep < -20) return { label: '声名狼藉', color: '#804040' };
        if (rep < -10) return { label: '臭名昭著', color: '#a05050' };
        if (rep < 0) return { label: '风评不佳', color: '#b07050' };
        if (rep < 10) return { label: '无名小卒', color: '#606060' };
        if (rep < 20) return { label: '初入江湖', color: '#808080' };
        if (rep < 50) return { label: '小有名气', color: '#5090c0' };
        if (rep < 100) return { label: '声名鹊起', color: '#40a080' };
        if (rep < 400) return { label: '声名显赫', color: '#6090e0' };
        if (rep < 1000) return { label: '名震一方', color: '#8060d0' };
        if (rep < 2000) return { label: '威震天下', color: '#d0a040' };
        if (rep < 5000) return { label: '武林泰斗', color: '#e08030' };
        return { label: '江湖神话', color: '#ff6040' };
    }

    formatGold(gold) {
        if (gold >= 100000000) return (gold / 100000000).toFixed(1).replace(/\.0$/, '') + '亿两';
        if (gold >= 10000) return (gold / 10000).toFixed(1).replace(/\.0$/, '') + '万两';
        return gold + ' 两';
    }

    getWealthInfo(gold) {
        if (gold < 0) return { label: '负债累累', color: '#804040' };
        if (gold <= 10) return { label: '穷困潦倒', color: '#806060' };
        if (gold <= 50) return { label: '小康之家', color: '#60a060' };
        if (gold <= 500) return { label: '颇有家资', color: '#5090c0' };
        if (gold <= 5000) return { label: '富甲一方', color: '#b060d0' };
        if (gold <= 50000) return { label: '富可敌国', color: '#d0a040' };
        return { label: '财神下凡', color: '#ff8040' };
    }

    getPlayerCombatPower(mode = 'full', useSkill = null) {
        const p = this.player;
        const basePower = Math.floor(p.attrs.root * 0.5 + p.attrs.dexterity * 0.5);
        let weaponPower = 0;
        let skillPower = 0;
        let coefficient = 1.0;
        let skillName = null;

        if (mode === 'light') {
            return basePower;
        }

        // Weapon power
        const weaponSlots = ['rightHand', 'leftHand'];
        for (const s of weaponSlots) {
            if (p.equipment[s]) weaponPower += p.equipment[s].value;
        }

        // Pick best external skill for 全力以赴
        if (mode === 'full') {
            const usableSkills = p.externalSkills.filter(sk => {
                if (!sk.type) return false;
                if (sk.type === 'fist' || sk.type === 'kick') return true; // no weapon needed
                if (sk.type === 'sword') return this.hasWeaponType('sword');
                if (sk.type === 'blade') return this.hasWeaponType('blade');
                return true;
            });
            let bestSkill = null;
            let bestPower = -1;
            for (const sk of usableSkills) {
                const fp = getSkillFixedPower(sk.quality, sk.level);
                const coeff = getSkillCoefficient(sk.quality, sk.level);
                const skWeaponPower = (sk.type === 'fist' || sk.type === 'kick') ? 0 : weaponPower;
                const total = getSkillPowerTotal(basePower, skWeaponPower, fp, coeff);
                if (total > bestPower) {
                    bestPower = total;
                    bestSkill = sk;
                }
            }
            if (bestSkill) {
                const fp = getSkillFixedPower(bestSkill.quality, bestSkill.level);
                coefficient = getSkillCoefficient(bestSkill.quality, bestSkill.level);
                skillPower = fp;
                skillName = bestSkill.name;
                if (bestSkill.type === 'fist' || bestSkill.type === 'kick') weaponPower = 0;
            }
        } else if (mode === 'serious') {
            // serious: weapon + base, no external skill
        }

        return getSkillPowerTotal(basePower, weaponPower, skillPower, coefficient);
    }

    getPlayerBestSkillName() {
        const p = this.player;
        const usableSkills = p.externalSkills.filter(sk => {
            if (!sk.type) return false;
            if (sk.type === 'fist' || sk.type === 'kick') return true;
            if (sk.type === 'sword') return this.hasWeaponType('sword');
            if (sk.type === 'blade') return this.hasWeaponType('blade');
            return true;
        });
        let bestSkill = null;
        let bestPower = -1;
        const basePower = Math.floor(p.attrs.root * 0.5 + p.attrs.dexterity * 0.5);
        for (const sk of usableSkills) {
            const fp = getSkillFixedPower(sk.quality, sk.level);
            const coeff = getSkillCoefficient(sk.quality, sk.level);
            const total = getSkillPowerTotal(basePower, 0, fp, coeff);
            if (total > bestPower) {
                bestPower = total;
                bestSkill = sk;
            }
        }
        return bestSkill ? bestSkill.name : null;
    }

    hasWeaponType(type) {
        const p = this.player;
        const rh = p.equipment.rightHand;
        if (!rh) return false;
        if (type === 'sword') return rh.name.includes('剑') || rh.id === 'blue_sword';
        if (type === 'blade') return rh.name.includes('刀') || rh.id === 'steel_blade' || rh.id === 'knife_wood';
        return false;
    }

    getPlayerDefense() {
        const p = this.player;
        const armorSlots = ['head', 'upperBody', 'lowerBody', 'boots', 'bracers'];
        let armorBonus = 0;
        for (const s of armorSlots) {
            if (p.equipment[s]) armorBonus += p.equipment[s].value;
        }
        return Math.floor(p.attrs.root * 0.8 + armorBonus);
    }

    autoEquip(item) {
        if (!item.slot) return false;
        const p = this.player;
        let slot = item.slot;

        if (slot === 'accessory') {
            if (!p.equipment.accessory1) { slot = 'accessory1'; }
            else if (!p.equipment.accessory2) { slot = 'accessory2'; }
            else {
                const a1 = p.equipment.accessory1, a2 = p.equipment.accessory2;
                const lower = a1.value <= a2.value ? 'accessory1' : 'accessory2';
                if (item.value <= p.equipment[lower].value) return false;
                p.items.push({ ...p.equipment[lower] });
                p.equipment[lower] = { ...item };
                const idx = p.items.indexOf(item);
                if (idx !== -1) p.items.splice(idx, 1);
                return true;
            }
        }

        const current = p.equipment[slot];
        if (!current || item.value > current.value) {
            if (current) p.items.push({ ...current });
            p.equipment[slot] = { ...item };
            const idx = p.items.indexOf(item);
            if (idx !== -1) p.items.splice(idx, 1);
            return true;
        }
        return false;
    }

    updateStatsBar() {
        const p = this.player;
        if (!p) return;
        const hpPct = p.maxHp > 0 ? Math.floor(p.hp / p.maxHp * 100) : 0;
        const mpPct = p.maxNeili > 0 ? Math.floor(p.neili / p.maxNeili * 100) : 0;
        document.getElementById('hp-fill').style.width = Math.max(0, hpPct) + '%';
        document.getElementById('hp-text').textContent = `${p.hp}/${p.maxHp}`;
        document.getElementById('mp-fill').style.width = Math.max(0, mpPct) + '%';
        document.getElementById('mp-text').textContent = `${p.neili}/${p.maxNeili}`;
        const st = document.getElementById('hp-status');
        if (hpPct < 30) { st.textContent = '致命伤'; st.style.color = '#ff4040'; }
        else if (hpPct < 50) { st.textContent = '重伤'; st.style.color = '#ff8040'; }
        else if (hpPct < 70) { st.textContent = '轻伤'; st.style.color = '#ffc040'; }
        else st.textContent = '';
        const statusNames = { bleed: '撕裂', poison: '中毒' };
        const activeStatuses = (p.statuses || []).map(s => statusNames[s.type] || s.type).filter(Boolean);
        if (activeStatuses.length > 0) {
            st.textContent += (st.textContent ? ' | ' : '') + activeStatuses.join('|');
        }
        const drunk = p._drunk || 0;
        if (drunk > 0) st.textContent += (st.textContent ? ' | ' : '') + `醉意 ${drunk}`;
        p.hp = Math.max(0, p.hp); p.neili = Math.max(0, p.neili);
        if (p.reputation <= -40) this._triggerRepGameOver();
        const houseRepBonus = this.houseManager ? this.houseManager.getMaxRepBonus() : 0;
        const effectiveRep = p.reputation + houseRepBonus;
        const ri = this.getRepInfo(effectiveRep);
        const wi = this.getWealthInfo(p.gold);
        document.getElementById('gold-text').textContent = this.formatGold(p.gold);
        document.getElementById('rep-text').textContent = ri.label;
        document.getElementById('rep-text').style.color = ri.color;
        document.getElementById('wealth-text').textContent = wi.label;
        document.getElementById('wealth-text').style.color = wi.color;
        document.getElementById('day-text').textContent = p.day;
        document.getElementById('time-text').textContent = p.timePeriod;
        document.getElementById('level-text').textContent = p.level;
    }

    getItemStock(item) {
        if (item.special) return 1;
        if (item.slot) return 1;
        if (item.value <= 3) return 5;
        if (item.value <= 10) return 3;
        if (item.value <= 20) return 2;
        return 1;
    }

    getItemDisplayName(item) {
        const labels = { blue:'蓝色', purple:'紫色', orange:'橙色', gold:'金色' };
        if (labels[item.tier]) return `${item.name} ［${labels[item.tier]}］`;
        return item.name;
    }

    toggleMenu() {
        const o = document.getElementById('menu-overlay');
        o.classList.toggle('hidden');
        if (!o.classList.contains('hidden')) this.renderMenu();
    }

    renderMenu() {
        const p = this.player;
        const loc = this.currentLocation;
        const rl = ATTRIBUTES.map(a =>
            `<div class="stat-line"><span>${a.name}</span><span style="color:${getRating(p.attrs[a.key]).color}">${p.attrs[a.key]}（${getRatingLabel(p.attrs[a.key])}）</span></div>`
        ).join('');
        const il = p.items.length ? p.items.map(i => i.name).join('、') : '（空）';
        const extSkills = p.externalSkills.length ? p.externalSkills.map(s => {
            const q = SKILL_QUALITIES[s.quality] || SKILL_QUALITIES.white;
            const elem = s.element ? ` [${s.element}]` : '';
            return `${s.name} Lv.${s.level}/${s.maxLevel}（${q.name}${elem}）`;
        }).join('、') : '无';
        const intSkills = p.internalSkills.length ? p.internalSkills.join('、') : '无';
        document.getElementById('menu-stats').innerHTML = `
            ${rl}
            <div class="stat-line"><span>等级</span><span>Lv.${p.level}</span></div>
            <div class="stat-line"><span>经验</span><span>${p.exp}/${this.getExpToNextLevel(p.level)}</span></div>
            <div class="stat-line"><span>气血</span><span>${p.hp}/${p.maxHp}</span></div>
            <div class="stat-line"><span>内力</span><span>${p.neili}/${p.maxNeili}</span></div>
            <div class="stat-line"><span>银两</span><span>${this.formatGold(p.gold)}</span></div>
            <div class="stat-line" style="margin-top:6px;"><span>心法</span><span>${intSkills}</span></div>
            <div class="stat-line"><span>外功</span><span>${extSkills}</span></div>
        `;
        document.getElementById('menu-rep').textContent = `声望：${p.reputation}`;
        let extra = `<div style="margin-top:8px;">行囊：${il}</div>`;
        if (loc && loc.nearestCity) {
            const city = getAllLocations().find(l => l.id === loc.nearestCity);
            if (city) extra += `<div style="font-size:12px;color:#5a6a8a;margin-top:4px;">最近：${city.name}（${loc.distanceToCity}）</div>`;
        }
        document.getElementById('menu-location').innerHTML = extra;
    }

    clearLog() { document.getElementById('log').innerHTML = ''; }

    addMessage(text, type = 'narrator') {
        const log = document.getElementById('log');
        const msg = document.createElement('div');
        if (type === 'html') {
            msg.className = 'msg msg-info';
            msg.innerHTML = text;
        } else {
            msg.className = `msg msg-${type}`;
            msg.textContent = text;
        }
        log.appendChild(msg);
        const area = document.getElementById('main-area');
        setTimeout(() => { area.scrollTop = area.scrollHeight; }, 0);
    }

    clearChoices() { document.getElementById('choice-area').innerHTML = ''; }

    showChoices(choices) {
        const area = document.getElementById('choice-area');
        area.innerHTML = '';
        for (const c of choices) {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = c.text;
            btn.onclick = () => { if (c.action) c.action(); };
            area.appendChild(btn);
        }
        document.getElementById('main-area').scrollTop = document.getElementById('main-area').scrollHeight;
    }

    showMessageSequence(messages, onDone) {
        let i = 0;
        const next = () => {
            if (i < messages.length) {
                this.addMessage(messages[i].text, messages[i].type || 'narrator');
                i++;
                this.showChoices([{ text: '继续', action: next }]);
            } else if (onDone) {
                onDone();
            }
        };
        next();
    }

    /* ─── 地点系统 ─── */

    enterLocation(locationId, clear = true) {
        const loc = getAllLocations().find(l => l.id === locationId);
        if (!loc) return;
        if (this.processStatusOnMove()) return;
        // Clean expired blacklist entries
        for (const [id, expiry] of Object.entries(this.player.villageBlacklist || {})) {
            if (this.player.day >= expiry) delete this.player.villageBlacklist[id];
        }
        // Check blacklist
        if (this.player.villageBlacklist && this.player.villageBlacklist[locationId]) {
            const daysLeft = this.player.villageBlacklist[locationId] - this.player.day;
            this.clearChoices();
            this.showMessageSequence([
                { text: `${loc.name}的村民对你怒目而视，你根本进不去。`, type: 'danger' },
                { text: `你决定还是避避风头，等${daysLeft}天后再回来。`, type: 'narrator' },
            ], () => this.showChoices([{ text: '去别处走走', action: () => this.showTravelOptions() }]));
            return;
        }
        this.player.locationId = locationId;
        this.currentLocation = loc;
        this.player.locationVenues = loc.venues.map(v => ({
            ...v,
            npcs: (v.npcs || []).map(n => {
                const ni = n.items || [];
                return {
                    ...n,
                    _defaultItems: ni.map(i => ({ ...i })),
                    items: ni.map(i => {
                        const stock = this.getItemStock(i);
                        const item = { ...i, stock, maxStock: stock };
                        if (['blue','purple','orange','gold'].includes(item.tier)) item.name += ` ［${ITEM_TIER_LABELS[item.tier]}］`;
                        return item;
                    }),
                };
            }).filter(n => !this.killedNpcs.has(loc.id + ':' + v.name + ':' + n.npcName)),
        }));
        this.assignBeauties(loc);
        const tl = getLocationTypeLabel(loc.id);
        if (clear) this.clearLog();
        this.clearChoices();
        const locSegs = [
            { text: `━━━ ${tl.label} · ${loc.name} ━━━`, type: 'system' },
        ];
        if (this.player._questFirstEntry && locationId === this.player.startingVillage) {
            locSegs.push({ text: '你找了一处荒废之所安顿下来。这里虽然破败，但遮风挡雨总算够了。', type: 'narrator' });
            locSegs.push({ text: '你盘算着下一步——该从哪里打探师弟沈清寒的消息呢……村长的家或许是个合适的去处。', type: 'narrator' });
            this.player._questFirstEntry = false;
        }
        if (this.player._questFirstCityEntry && locationId !== this.player.startingVillage && this.player.mainQuest >= 2) {
            locSegs.push({ text: '你找了一间客栈安顿下来，掸了掸身上的尘土。', type: 'narrator' });
            locSegs.push({ text: '你盘算着下一步——师弟沈清寒的下落毫无头绪，这城里的酒楼、赌坊、茶肆三教九流云集，或许能打探到些有用的消息。', type: 'narrator' });
            this.player._questFirstCityEntry = false;
        }
        locSegs.push({ text: `「${loc.desc}」`, type: 'info' });
        locSegs.push({ text: `人口 ${loc.population.toLocaleString()}  |  面积 ${loc.area}${loc.areaUnit}  |  经济 ${getEconomyLabel(loc.economy)}`, type: 'info' });
        if (loc.factions && loc.factions.length) {
            locSegs.push({ text: `本地势力：${loc.factions.map(f => { if (f === 'wulin') return '武林盟'; const fObj = getFaction(f); return fObj ? fObj.name : f; }).join('、')}`, type: 'system' });
        }
        if (loc.nearestCity) {
            const city = getAllLocations().find(l => l.id === loc.nearestCity);
            if (city) locSegs.push({ text: `最近城镇：${getLocationTypeLabel(city.id).label} · ${city.name}（${loc.distanceToCity}）`, type: 'info' });
        }
        if (this.player.mainQuest === 2 || locationId !== this.player.startingVillage) {
            locSegs.push({ text: '你打算怎么做？', type: 'narrator' });
        } else {
            const hints = [
                '你打算怎么做？',
                '当务之急是打探师弟沈清寒的下落……',
                '或许该先去村长家问问情况。',
            ];
            locSegs.push({ text: hints[Math.floor(Math.random() * hints.length)], type: 'narrator' });
        }
        let li = 0;
        const nextLoc = () => {
            if (li < locSegs.length) {
                this.addMessage(locSegs[li].text, locSegs[li].type);
                li++;
                this.showChoices([{ text: '继续……', action: nextLoc }]);
            } else {
                this.showLocationChoices();
            }
        };
        nextLoc();
        this.updateStatsBar();
    }

    showLocationChoices() {
        this.showChoices([
            { text: '外出 · 四处走走', action: () => this.showOutdoorChoices() },
            { text: '居家 · 闭门修炼', action: () => this.showHomeChoices() },
            { text: '前往其他地方', action: () => this.showTravelOptions() },
            { text: '【睡到明天】', action: () => this.sleepToTomorrow() },
            { text: '【个人状态】', action: () => this.showCharacterStatus() },
            { text: '【红颜录】', action: () => this.showRedRecord() },
        ]);
    }

    /* ─── 外出：场所系统 ─── */

    showOutdoorChoices() {
        const loc = this.currentLocation;
        // 村庄随机济苍生事件
        if (loc && loc.nearestCity) {
            if (this.tryRandomCharityEvent()) return;
        }
        const choices = [];
        const isVillage = !!loc.nearestCity;
        if (isVillage) {
            const groups = {
                '市集': this.player.locationVenues.filter(v => ['草药铺', '铁匠铺', '酒馆', '肉铺'].includes(v.name)),
                '村外': this.player.locationVenues.filter(v => ['小树林', '断桥', '小溪', '田埂', '废弃矿坑'].includes(v.name)),
            };
            const others = this.player.locationVenues.filter(v =>
                !['草药铺', '铁匠铺', '酒馆', '肉铺', '断桥', '小溪', '田埂', '小树林', '废弃矿坑'].includes(v.name)
            );
            for (const [label, list] of Object.entries(groups)) {
                if (list.length > 0) choices.push({ text: label, action: () => this.showGroupVenues(label, list) });
            }
            for (const v of others) {
                choices.push({ text: v.name, action: () => this.enterVenue(v) });
            }
        } else {
            const shopKeys = ['铺', '店', '行', '斋', '庄', '坊', '肆', '堂', '阁'];
            const specialShops = ['酒馆', '茶馆', '集市'];
            const entertainmentVenues = ['怡红院', '醉花楼', '潇湘阁', '春风楼', '牡丹院', '锦官阁', '汉水楼', '烟雨阁', '赌坊'];
            const isEntertainment = v => entertainmentVenues.includes(v.name);
            const isOutskirts = v => v._isOutskirts;
            const isShop = v =>
                !isEntertainment(v) && !isOutskirts(v) && (v._isCommercialHQ || specialShops.includes(v.name) || shopKeys.some(s => v.name.includes(s)) || v.name.includes('楼') || ['房产中介', '花鸟鱼市场', '黑市'].includes(v.name));
            const groups = {
                '城外': this.player.locationVenues.filter(v => isOutskirts(v)),
                '商业区': this.player.locationVenues.filter(v => isShop(v)),
                '娱乐区': this.player.locationVenues.filter(v => isEntertainment(v) && !isOutskirts(v)),
                '居民区': this.player.locationVenues.filter(v => !isShop(v) && !isEntertainment(v) && !isOutskirts(v)),
            };
            for (const [label, list] of Object.entries(groups)) {
                if (list.length > 0) choices.push({ text: label, action: () => this.showGroupVenues(label, list) });
            }
        }
        choices.push({ text: '回去', action: () => this.showLocationChoices() });
        this.addMessage(`—— ${loc.name}的街市 ——`, 'system');
        this.showChoices(choices);
    }

    showGroupVenues(label, venues) {
        this.clearChoices();
        this._groupContext = { label, venues };
        const choices = venues.map(v => ({ text: v.name, action: () => this.enterVenue(v) }));
        choices.push({ text: '回去', action: () => { this._groupContext = null; this.showOutdoorChoices(); } });
        this.addMessage(`—— ${label} ——`, 'system');
        this.showChoices(choices);
    }

    /* ─── 时辰系统 ─── */

    advanceTime() {
        const order = ['清晨', '正午', '黄昏', '子时'];
        const idx = order.indexOf(this.player.timePeriod);
        this.player.timePeriod = order[(idx + 1) % order.length];
        this.updateStatsBar();
    }

    isVenueClosed(venue) {
        const t = this.player.timePeriod;
        // 子时所有室内场所关闭
        if (t === '子时') {
            if (['村角', '断桥', '小溪', '田埂', '小树林', '废弃矿坑'].includes(venue.name)) return false;
            return true;
        }
        // 黄昏商店歇业，住宅/怡红院等仍营业
        if (t === '黄昏') {
            if (['村角', '断桥', '小溪', '田埂', '小树林', '废弃矿坑'].includes(venue.name)) return false;
            if (['草药铺', '铁匠铺', '酒馆'].includes(venue.name)) return true;
            return false;
        }
        return false;
    }

    getVenueLockDifficulty(venue) {
        const loc = this.currentLocation;
        const locType = loc ? getLocationTypeLabel(loc.id) : null;
        // 物品总价值
        const items = venue.npcs && venue.npcs.length > 0 ? venue.npcs[0].items : [];
        let totalValue = 0;
        for (const it of items) {
            if (it && it.value) totalValue += it.value;
        }
        // 大户家：守卫森严
        if (venue.name.endsWith('府')) {
            let diff = 30;
            if (totalValue >= 50) diff += 25;
            else if (totalValue >= 20) diff += 15;
            return diff;
        }
        // 珍宝阁/藏宝级（总价值≥200）
        if (totalValue >= 200) return 90;
        if (totalValue >= 100) return 70;
        // 大城商店 50-70
        if (locType === LOCATION_TYPES.big_city) {
            if (totalValue >= 60) return 60;
            return 50;
        }
        // 小城商店 30-50
        if (locType === LOCATION_TYPES.small_city) {
            if (totalValue >= 60) return 50;
            if (totalValue >= 30) return 40;
            return 30;
        }
        // 村庄 15-30
        if (totalValue >= 30) return 30;
        if (totalValue >= 15) return 25;
        return 15;
    }

    attemptPickLock(venue) {
        this.clearChoices();
        const dex = this.player.attrs.dexterity || 10;
        const diff = this.getVenueLockDifficulty(venue);
        const successChance = Math.min(0.9, dex / (diff + dex));
        this.addMessage(`你屏住呼吸，摸到门前，掏出随身铁片试着撬锁潜入……`, 'narrator');
        if (Math.random() < successChance) {
            this.addMessage('锁「咔」一声开了！你闪身溜了进去，没有惊动任何人。', 'system');
            this.player.shadowRep += 1;
            this.updateStatsBar();
            this._sneaking = true;
            this.enterVenueInner(venue);
        } else {
            this.addMessage('你正专心撬锁，突然远处传来一声大喝：「有贼！」', 'danger');
            this.player.reputation -= 5;
            this.updateStatsBar();
            this.addMessage(`声望 -5（当前 ${this.player.reputation}）`, 'system');
            setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400);
        }
    }

    enterVenue(venue) {
        this.clearChoices();
        // 时间关闭检查
        if (this.isVenueClosed(venue)) {
            this.addMessage(`${venue.name}的大门紧闭，门上挂着一块「已打烊」的木牌。`, 'narrator');
            this.showChoices([
                { text: `潜入（灵巧${this.getVenueLockDifficulty(venue)}）`, action: () => this.attemptPickLock(venue) },
                { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
            ]);
            return;
        }
        if (this.processStatusOnMove()) return;
        this.enterVenueInner(venue);
    }

    enterVenueInner(venue) {
        if (this._sneaking) {
            this._sneaking = false;
            this.enterVenueSneak(venue);
            return;
        }
        // 爬塔入口已在门派菜单中处理（旧数据兼容：塔场景重定向）
        if (venue._isTower) {
            const fId = venue._towerFactionId;
            const towerFaction = FACTIONS[fId];
            if (towerFaction) {
                this.addMessage(`此处已移入门派内部，请从门派驻地进入。`, 'narrator');
                return this.showVenues();
            }
        }
        // Landlord gate check for starting village quest
        if (this.player.mainQuest <= 1 && this.player.startingVillage === this.player.locationId && venue.name.endsWith('府')) {
            if (this.player.mainQuest === 0) {
                this.addMessage(`你来到${venue.name}门前，只见朱门紧闭，门口站着两个虎背熊腰的家丁。`, 'narrator');
                this.addMessage(`家丁横臂拦住去路，冷声道：「此处是私宅，闲人免进！要找死别处死去！」`, 'narrator');
                this.showChoices([
                    { text: `潜入（灵巧${this.getVenueLockDifficulty(venue)}）`, action: () => this.attemptPickLock(venue) },
                    { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
                ]);
                return;
            }
            this.addMessage(`你来到${venue.name}门前，只见朱门紧闭，门口站着两个虎背熊腰的家丁。`, 'narrator');
            this.addMessage(`其中一个家丁上前一步，横臂拦住去路：「站住！你是何人？我家老爷岂是你想见就见的？」`, 'narrator');
            const loc = this.currentLocation;
            const repNeed = 20 + Math.floor(Math.random() * 6);
            const goldNeed = 30 + Math.floor(Math.random() * 21); // 30-50 两
            this.showChoices([
                { text: `报上名号（需要${repNeed}点声望）`, action: () => {
                    if (this.player.reputation >= repNeed) {
                        this.addMessage(`你朗声道：「在下华山${this.player.attrs.name || '无名'}，有事求见你家老爷。」`, 'narrator');
                        this.addMessage(`家丁上下打量了你一番，态度缓和了些：「原来是江湖上的朋友，失敬失敬！快请进！」`, 'narrator');
                        this.landlordQuestGrant(venue, false);
                    } else {
                        this.addMessage(`家丁嗤笑一声：「就你这无名小卒，也配提我家老爷的名号？滚！」`, 'narrator');
                        this.addMessage(`你咬了咬牙，只得转身离开。`, 'narrator');
                        setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400);
                    }
                }},
                { text: `塞银子（需要${goldNeed}两）`, action: () => {
                    if (this.player.gold >= goldNeed) {
                        this.player.gold -= goldNeed;
                        this.addMessage(`你掏出${goldNeed}两银子塞到家丁手里。家丁掂了掂，眉开眼笑。`, 'narrator');
                        this.addMessage(`「原来是贵客！里面请里面请！」`, 'narrator');
                        this.landlordQuestGrant(venue, true);
                    } else {
                const short = goldNeed - this.player.gold;
                this.addMessage(`你摸了摸钱袋，还差${short}两。家丁冷笑一声：「没钱还想见我家老爷？打发叫花子呢！」`, 'narrator');
                        setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400);
                    }
                }},
                { text: `潜入（灵巧${this.getVenueLockDifficulty(venue)}）`, action: () => this.attemptPickLock(venue) },
                { text: '硬闯', action: () => this.landlordFightGuards(venue) },
                { text: '算了，改日再来', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
            ]);
            return;
        }
        this.addMessage(`你走进${venue.name}。`, 'narrator');

        // 小树林：每次进入随机刷新猎人或樵夫
        if (venue.name === '小树林') {
            const village = WORLD.villages.find(v => v.id === (this.currentLocation && this.currentLocation.id));
            const isHunter = Math.random() < 0.5;
            const forestItemIds = isHunter
                ? ['dagger', 'herb_bandage', 'jinchuang']
                : ['knife_wood', 'blue_blade', 'ration'];
            venue.npcs = [{
                npcName: isHunter
                    ? (village ? village.hunterNpc : '老张猎户')
                    : (village ? village.woodcutterNpc : '老王'),
                npcDesc: isHunter ? '经验丰富的猎户，常年在山中打猎。' : '朴实憨厚的樵夫，每天上山砍柴。',
                items: forestItemIds.map(id => {
                    const item = getItem(id);
                    if (!item) return null;
                    const stock = this.getItemStock(item);
                    const obj = { ...item, stock, maxStock: stock };
                    if (id === 'blue_blade') obj._noBuy = true;
                    if (['blue','purple','orange','gold'].includes(obj.tier)) obj.name += ` ［${ITEM_TIER_LABELS[obj.tier]}］`;
                    return obj;
                }).filter(Boolean),
                civilian: true,
                combatPower: (this.currentLocation.guardianPower || 10) + (isHunter ? 5 : 3),
                _forestType: isHunter ? 'hunter' : 'woodcutter',
            }];
        }

        this._tryRevealCrippleLi(venue);
        const nightTime = this.player.timePeriod === '黄昏' || this.player.timePeriod === '子时';
        const alive = venue.npcs.filter(n =>
            !n._killed
            && !(n.isBeauty && n._beautyData && n._beautyData._chattedToday)
            && !(nightTime && n._forestType)
            && !n._hidden
        );
        if (alive.length === 0) {
            this.addMessage('里面空无一人……', 'narrator');
            if (venue.name === '小树林' && this.player.items.some(i => i.id === 'knife_wood')) {
                this.showChoices([
                    { text: '砍柴' + ((this.player._villageRoot[this.player.locationId] || 0) < 5 ? '（根骨 +1）' : ''), action: () => {
                        this.clearChoices();
                        const vid = this.player.locationId;
                        const chopBonus = this.player._villageRoot[vid] || 0;
                        if (chopBonus < 5) {
                            this.player.attrs.root += 1;
                            this.player._villageRoot[vid] = chopBonus + 1;
                            this.player.exp += 2;
                            this.addMessage('你抡起柴刀，劈了半个时辰的柴火。出了一身汗，但筋骨更结实了。', 'narrator');
                            this.addMessage(`根骨 +1（当前 ${this.player.attrs.root}），经验 +2`, 'system');
                        } else {
                            this.addMessage('你抡起柴刀劈了半个时辰的柴，但此地已无益筋骨，再砍也无寸进。', 'narrator');
                        }
                        this.player.items.push({ ...getItem('firewood') });
                        this.player.items.push({ ...getItem('firewood') });
                        this.addMessage('获得柴火×2', 'system');
                        if (Math.random() < 0.25) {
                            this.player.items.push({ ...getItem('bait_bug') });
                            this.addMessage('一条肥虫从树干上掉落，正好落入你手中——获得虫饵×1', 'system');
                        }
                        this.advanceTime();
                        this.updateStatsBar();
                        setTimeout(() => this.enterVenueInner(venue), 400);
                    }},
                    { text: '采药', action: () => { this.clearChoices(); this._herbGatherMenu(venue); } },
                    { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
                ]);
            } else if (venue.name === '小树林') {
                this.showChoices([
                    { text: '采药', action: () => { this.clearChoices(); this._herbGatherMenu(venue); } },
                    { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
                ]);
            } else if (venue.name === '废弃矿坑') {
                this._mineMenu(venue);
            } else if (venue.name === '小溪') {
                this._fishingMenu(venue);
            } else if (venue.name === '田埂') {
                this._herbGatherMenu(venue);
            } else {
                setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400);
            }
            return;
        }
        const choices = alive.map(npc => ({
            text: npc.isChief ? `村长 · ${npc.npcName}` : npc.npcName,
            action: () => this.interactNpc(venue, npc),
        }));
        // 子场所（如村角内的学堂、习武堂）
        if (venue.subVenues) {
            venue.subVenues.forEach(sv => {
                choices.push({ text: `进入${sv.name}`, action: () => this._enterSubVenue(venue, sv) });
            });
        }
        // 小树林：有柴刀可自行砍柴
        if (venue.name === '小树林' && this.player.items.some(i => i.id === 'knife_wood')) {
            choices.splice(choices.length, 0, { text: '砍柴（根骨 +1）', action: () => {
                this.clearChoices();
                const vid = this.player.locationId;
                const chopRoot = this.player._villageRoot[vid] || 0;
                if (chopRoot < 5) {
                    this.player.attrs.root += 1;
                    this.player._villageRoot[vid] = chopRoot + 1;
                    this.player.exp += 2;
                    this.addMessage('你抡起柴刀，劈了半个时辰的柴火。出了一身汗，但筋骨更结实了。', 'narrator');
                    this.addMessage(`根骨 +1（当前 ${this.player.attrs.root}），经验 +2`, 'system');
                } else {
                    this.addMessage('你抡起柴刀劈了半个时辰的柴，但此地已无益筋骨，再砍也无寸进。', 'narrator');
                }
                this.player.items.push({ ...getItem('firewood') });
                this.player.items.push({ ...getItem('firewood') });
                this.addMessage('获得柴火×2', 'system');
                if (Math.random() < 0.25) {
                    this.player.items.push({ ...getItem('bait_bug') });
                    this.addMessage('一条肥虫从树干上掉落，正好落入你手中——获得虫饵×1', 'system');
                }
                this.advanceTime();
                this.updateStatsBar();
                setTimeout(() => this.enterVenueInner(venue), 400);
            }});
        }
        if (venue.name === '田埂') {
            choices.splice(choices.length, 0, { text: '采药', action: () => { this.clearChoices(); this._herbGatherMenu(venue); } });
        }
        if (venue.name === '小树林') {
            choices.splice(choices.length, 0, { text: '采药', action: () => { this.clearChoices(); this._herbGatherMenu(venue); } });
        }
        if (venue.name === '村长家') {
            choices.splice(choices.length, 0, { text: '查看告示栏', action: () => { this.clearChoices(); this._showNoticeBoard(venue); } });
        }
        choices.push({ text: `离开${venue.name}`, action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) });
        this.showChoices(choices);
    }

    /* ─── 子场所入口（学堂、习武堂等） ─── */

    _enterSubVenue(parentVenue, subVenue) {
        this.clearChoices();
        this.addMessage(`你走进${subVenue.name}。`, 'narrator');
        const alive = (subVenue.npcs || []).filter(n => !n._killed && !n._hidden);
        if (alive.length === 0) {
            this.addMessage('里面空无一人……', 'narrator');
            this.showChoices([{ text: '离开', action: () => this.enterVenueInner(parentVenue) }]);
            return;
        }
        const choices = alive.map(npc => ({
            text: npc.npcName,
            action: () => this.interactNpc(parentVenue, npc),
        }));
        choices.push({ text: `离开${subVenue.name}`, action: () => this.enterVenueInner(parentVenue) });
        this.showChoices(choices);
    }

    /* ─── 废弃矿坑 ─── */

    _mineMenu(venue) {
        this.addMessage('你发现一处废弃的矿坑，洞口散落着几把生锈的铁锹，看来是前人留下的。', 'narrator');
        const vid = this.player.locationId;
        const rootBonus = this.player._villageMineRoot[vid] || 0;
        const dexBonus = this.player._villageMineDex[vid] || 0;
        const rootLabel = rootBonus < 5 ? '（根骨 +1）' : '';
        const choices = [
            { text: `挖掘${rootLabel}`, action: () => {
                this.clearChoices();
                if (Math.random() < 0.1) {
                    if (dexBonus < 10) {
                        this.player.attrs.dexterity += 1;
                        this.player._villageMineDex[vid] = dexBonus + 1;
                    }
                    this.addMessage('你正挥锹挖掘，忽然头顶传来"咔嚓"声——矿坑塌了！你扔下铁锹连滚带爬逃了出来，灰头土脸，所幸没受伤。', 'narrator');
                    this.addMessage(`灵巧 +1（当前 ${this.player.attrs.dexterity}）`, 'system');
                } else {
                    const ores = [
                        { id: 'iron_ore', weight: 35 },
                        { id: 'copper_ore', weight: 25 },
                        { id: 'tin_ore', weight: 15 },
                        { id: 'lead_ore', weight: 10 },
                        { id: 'coal', weight: 15 },
                    ];
                    const total = ores.reduce((s, o) => s + o.weight, 0);
                    let roll = Math.random() * total;
                    let picked = ores[0].id;
                    for (const o of ores) {
                        roll -= o.weight;
                        if (roll <= 0) { picked = o.id; break; }
                    }
                    const num = 1 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < num; i++) this.player.items.push({ ...getItem(picked) });
                    const itemName = (getItem(picked) || { name: picked }).name;
                    this.addMessage('你抡起铁锹在矿壁上奋力挖掘，碎岩纷纷落下。', 'narrator');
                    this.addMessage(`获得${itemName}×${num}`, 'system');
                    if (rootBonus < 5) {
                        this.player.attrs.root += 1;
                        this.player._villageMineRoot[vid] = rootBonus + 1;
                        this.player.exp += 2;
                        this.addMessage(`根骨 +1（当前 ${this.player.attrs.root}），经验 +2`, 'system');
                    }
                }
                this.advanceTime();
                this.updateStatsBar();
                setTimeout(() => this._mineMenu(venue), 400);
            }},
            { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
        ];
        this.showChoices(choices);
    }

    /* ─── 小溪垂钓 ─── */

    _fishingMenu(venue) {
        const hasRod = this.player.items.some(i => i.id === 'fishing_rod');
        const hasBait = this.player.items.some(i => i.id === 'bait_bug');
        if (!hasRod) {
            this.addMessage('溪水潺潺，清澈见底，偶尔能看到鱼儿游过。可惜你没有鱼竿，只能望水兴叹。', 'narrator');
            const choices = [{ text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) }];
            this.showChoices(choices);
            return;
        }
        if (!hasBait) {
            this.addMessage('你拿出鱼竿在溪边坐下，却发现鱼钩上空空如也——没有鱼饵，鱼儿不会上钩的。', 'narrator');
            const choices = [{ text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) }];
            this.showChoices(choices);
            return;
        }
        const vid = this.player.locationId;
        const goldCount = this.player._villageFishGold[vid] || 0;
        const canGold = goldCount < 5;
        const choices = [
            { text: '垂钓', action: () => {
                this.clearChoices();
                // 消耗一个虫饵
                const idx = this.player.items.findIndex(i => i.id === 'bait_bug');
                if (idx !== -1) this.player.items.splice(idx, 1);
                if (Math.random() < 0.1 && canGold) {
                    const newCount = goldCount + 1;
                    this.player._villageFishGold[vid] = newCount;
                    this.player.items.push({ ...getItem('fish_yuanbao') });
                    this.player.attrs.luck += 5;
                    this.addMessage('鱼漂猛地一沉，你奋力收线——一条金光闪闪的鱼被甩上岸来！鱼身状如元宝，在阳光下熠熠生辉。', 'narrator');
                    this.addMessage('获得元宝鱼×1  福缘 +5（当前 ' + this.player.attrs.luck + '）', 'system');
                    if (newCount >= 5) {
                        this.addMessage('此地的元宝鱼已被你钓光了，换个地方试试吧。', 'info');
                    }
                } else {
                    const catches = [
                        { id: 'fish_carp', weight: 25 },
                        { id: 'fish_grass_carp', weight: 20 },
                        { id: 'fish_catfish', weight: 15 },
                        { id: 'fish_crab', weight: 10 },
                        { id: 'fish_shrimp', weight: 15 },
                        { id: 'water_weed', weight: 8 },
                        { id: 'old_shoe', weight: 4 },
                        { id: 'rusty_can', weight: 3 },
                    ];
                    const total = catches.reduce((s, c) => s + c.weight, 0);
                    let roll = Math.random() * total;
                    let picked = catches[0].id;
                    for (const c of catches) {
                        roll -= c.weight;
                        if (roll <= 0) { picked = c.id; break; }
                    }
                    this.player.items.push({ ...getItem(picked) });
                    const itemName = (getItem(picked) || { name: picked }).name;
                    const msgs = {
                        fish_carp: '鱼漂轻点，你提竿一收——一尾红鳞大鲤鱼在阳光下闪着光。',
                        fish_grass_carp: '浮漂猛地一沉，你用力提竿，一条肥美的草鱼挣扎着被拉出水面。',
                        fish_catfish: '鱼漂缓缓沉入水中，你一拉竿，手感沉重——一条光溜溜的大鲶鱼！',
                        fish_crab: '鱼漂一阵乱晃，你提起来一看——一只大螃蟹正死死钳住你的鱼钩。',
                        fish_shrimp: '你感觉鱼线轻轻一颤，提起来一看，几只晶莹剔透的河虾挂在钩上。',
                        water_weed: '你感觉挂到了什么东西，提起来是一团湿漉漉的水草。',
                        old_shoe: '你费力地拉起鱼线，钩上挂着一只泡得发胀的破布鞋。',
                        rusty_can: '鱼钩挂到了什么沉甸甸的东西，拉上来是个锈迹斑斑的铁罐子。',
                    };
                    this.addMessage(msgs[picked] || '你收起鱼线，看看钓到了什么。', 'narrator');
                    this.addMessage(`获得${itemName}×1`, 'system');
                }
                this.advanceTime();
                this.updateStatsBar();
                setTimeout(() => this._fishingMenu(venue), 400);
            }},
            { text: '收起鱼竿', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
        ];
        // 随身鱼袋
        if (this.player.items.some(i => i.id === 'pond_portable') && !this.player._portablePond) {
            const fishItems = this.player.items.filter(i => i.id.startsWith('fish_') && !['water_weed', 'old_shoe', 'rusty_can'].includes(i.id));
            if (fishItems.length > 0) {
                choices.splice(choices.length - 1, 0, { text: '将鱼放入随身鱼袋', action: () => this._showPortablePondStore(venue) });
            }
        }
        this.showChoices(choices);
    }

    /* ─── 随身鱼袋 ─── */

    _showPortablePondStore(venue) {
        this.clearChoices();
        const fishItems = this.player.items.filter(i => i.id.startsWith('fish_') && !['water_weed', 'old_shoe', 'rusty_can'].includes(i.id));
        if (fishItems.length === 0) {
            this.addMessage('你翻了翻随身鱼袋——里面空空如也。', 'narrator');
            this._fishingMenu(venue);
            return;
        }
        this.addMessage('你想把哪条鱼放入随身鱼袋？（只能暂养一尾）', 'narrator');
        const choices = fishItems.map((item, idx) => ({
            text: item.name,
            action: () => {
                this.clearChoices();
                this.player.items.splice(this.player.items.indexOf(item), 1);
                this.player._portablePond = { id: item.id, name: item.name };
                this.addMessage(`你将${item.name}小心地放入青瓷缸中。鱼儿在缸中打了个转，似乎对新家颇为满意。`, 'narrator');
                this.updateStatsBar();
                setTimeout(() => this._fishingMenu(venue), 400);
            },
        }));
        choices.push({ text: '算了', action: () => this._fishingMenu(venue) });
        this.showChoices(choices);
    }

    /* ─── 采药系统 ─── */

    _getSeason() {
        return ['春', '夏', '秋', '冬'][this.player.day % 4];
    }

    _herbTable(venue) {
        const season = this._getSeason();
        if (venue.name === '田埂') {
            const pools = {
                '春': [{ id: 'cheqiancao', w: 35 }, { id: 'pugongying', w: 30 }, { id: 'aicao', w: 20 }, { id: 'herb_bandage', w: 10 }, { id: 'fuling', w: 5 }],
                '夏': [{ id: 'pugongying', w: 35 }, { id: 'cheqiancao', w: 25 }, { id: 'aicao', w: 15 }, { id: 'herb_bandage', w: 15 }, { id: 'fuling', w: 10 }],
                '秋': [{ id: 'aicao', w: 35 }, { id: 'cheqiancao', w: 25 }, { id: 'pugongying', w: 20 }, { id: 'herb_bandage', w: 15 }, { id: 'fuling', w: 5 }],
                '冬': [{ id: 'cheqiancao', w: 30 }, { id: 'aicao', w: 30 }, { id: 'pugongying', w: 20 }, { id: 'herb_bandage', w: 15 }, { id: 'fuling', w: 5 }],
            };
            return pools[season] || pools['春'];
        }
        if (venue.name === '小树林') {
            const pools = {
                '春': [{ id: 'herb_ginseng_small', w: 25 }, { id: 'fuling', w: 25 }, { id: 'lingzhi', w: 15 }, { id: 'cheqiancao', w: 20 }, { id: 'aicao', w: 15 }],
                '夏': [{ id: 'fuling', w: 30 }, { id: 'herb_ginseng_small', w: 20 }, { id: 'lingzhi', w: 15 }, { id: 'pugongying', w: 20 }, { id: 'ginseng_100', w: 5 }],
                '秋': [{ id: 'lingzhi', w: 25 }, { id: 'herb_ginseng_small', w: 25 }, { id: 'fuling', w: 20 }, { id: 'cheqiancao', w: 15 }, { id: 'ginseng_100', w: 5 }],
                '冬': [{ id: 'herb_ginseng_small', w: 30 }, { id: 'fuling', w: 25 }, { id: 'lingzhi', w: 10 }, { id: 'cheqiancao', w: 20 }, { id: 'aicao', w: 15 }, { id: 'ginseng_100', w: 1 }],
            };
            return pools[season] || pools['春'];
        }
        return [];
    }

    _herbGatherDesc(venue, season) {
        const descs = {
            '田埂': {
                '春': '田埂上的野草在春风吹拂下嫩绿欲滴，你弯下腰仔细翻找着药草。',
                '夏': '夏日的田野一片生机，各种草药在烈日下长得正旺。你蹲在田埂边，拨开杂草挑选可用的药材。',
                '秋': '秋风拂过金黄的稻田，田埂上的草药已经结籽。你趁天高气爽，细细采收成熟的药草。',
                '冬': '田埂上一片萧瑟，枯草间偶有几株耐寒的药草仍在生长。你耐着寒意仔细搜寻。',
            },
            '小树林': {
                '春': '春雨过后，林间弥漫着泥土和草木的气息。松树下、枯木旁，各种药材正悄然生长。',
                '夏': '树林里浓荫蔽日，闷热潮湿的林间是诸多喜阴药草生长的好时节。你穿梭在树影间，搜寻着珍贵的药材。',
                '秋': '秋日的树林里落叶满地，灵芝和茯苓正是采收的好时节。你拨开落叶仔细查看每一处朽木和树根。',
                '冬': '林间一片寂静，枯枝上挂着薄霜。耐寒的草药在雪地下蛰伏，只有最细心的采药人才能发现它们的踪迹。',
            },
        };
        return (descs[venue.name] && descs[venue.name][season]) || '你仔细搜寻着四周，看看有什么可采的药材。';
    }

    _herbGatherMenu(venue) {
        this.clearChoices();
        const season = this._getSeason();
        this.addMessage(this._herbGatherDesc(venue, season), 'narrator');
        const choices = [
            { text: '采药', action: () => {
                this.clearChoices();
                const table = this._herbTable(venue);
                const total = table.reduce((s, h) => s + h.w, 0);
                let roll = Math.random() * total;
                let picked = table[0].id;
                for (const h of table) {
                    roll -= h.w;
                    if (roll <= 0) { picked = h.id; break; }
                }
                const num = 1 + Math.floor(Math.random() * (venue.name === '小树林' ? 2 : 3));
                for (let i = 0; i < num; i++) this.player.items.push({ ...getItem(picked) });
                const itemName = (getItem(picked) || { name: picked }).name;
                this.addMessage(`你${venue.name === '田埂' ? '沿着田埂仔细翻找' : '在林间穿行搜寻'}，采到了${itemName}×${num}。`, 'narrator');
                this.addMessage(`获得 ${itemName}×${num}`, 'system');
                if (Math.random() < 0.05) {
                    this.player.items.push({ ...getItem('herb_ginseng_small') });
                    this.addMessage('你在一处隐蔽的角落发现了一株小参！额外获得小参×1', 'event');
                }
                this.advanceTime();
                this.updateStatsBar();
                setTimeout(() => this._herbGatherMenu(venue), 400);
            }},
            { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
        ];
        this.showChoices(choices);
    }

    enterVenueSneak(venue) {
        this.clearChoices();
        const items = [];
        for (const npc of venue.npcs) {
            if (npc.items) {
                for (const it of npc.items) {
                    if (it.stock !== undefined && it.stock <= 0) continue;
                    if (it._noBuy) continue;
                    items.push({ item: it, npc: npc });
                }
            }
        }
        if (items.length === 0) {
            this.addMessage('你环顾四周，这里没什么值得偷的东西。', 'narrator');
            this.showChoices([
                { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
            ]);
            return;
        }
        this._sneakItems = items;
        this.addMessage(`你悄然潜入${venue.name}，目光扫过四周的货物。`, 'narrator');
        this.showStealMenu(venue);
    }

    showStealMenu(venue) {
        this.clearChoices();
        const items = this._sneakItems;
        const choices = items.map((entry, i) => ({
            text: `${entry.item.name}（价值${entry.item.value}两）`,
            action: () => this.stealSingleItem(venue, i),
        }));
        choices.push({ text: '全部偷走', action: () => this.stealAllItems(venue) });
        choices.push({ text: '算了，离开', action: () => {
            this._sneakItems = null;
            this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices();
        }});
        this.showChoices(choices);
    }

    stealSingleItem(venue, index) {
        this.clearChoices();
        const entry = this._sneakItems[index];
        const it = entry.item;
        const copy = { ...it };
        if (copy.stock !== undefined) {
            copy.stock = 1;
            it.stock--;
        }
        if (!this.autoEquip(copy)) {
            this.player.items.push(copy);
        }
        this.player.shadowRep += 1;
        this.addMessage(`你悄悄摸走「${it.name}」（价值${it.value}两）。`, 'system');
        this.updateStatsBar();
        this._sneakItems.splice(index, 1);
        if (this._sneakItems.length === 0) {
            this.addMessage('这里已经没有值得偷的东西了。', 'narrator');
            this._sneakItems = null;
            this.showChoices([
                { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
            ]);
        } else {
            this.showStealMenu(venue);
        }
    }

    stealAllItems(venue) {
        this.clearChoices();
        this.addMessage('你手脚麻利地将值钱的东西一扫而空……', 'narrator');
        let totalValue = 0;
        for (const entry of this._sneakItems) {
            const it = entry.item;
            const copy = { ...it };
            if (copy.stock !== undefined) {
                copy.stock = 1;
                it.stock--;
            }
            if (!this.autoEquip(copy)) {
                this.player.items.push(copy);
            }
            totalValue += it.value || 0;
        }
        const count = this._sneakItems.length;
        this.player.shadowRep += count;
        this._sneakItems = null;
        this.addMessage(`你成功偷取了 <b>${count}</b> 件物品，价值 ${totalValue} 两。`, 'html');
        this.updateStatsBar();
        this.showChoices([
            { text: '迅速离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
        ]);
    }

    landlordQuestGrant(venue, paidEntry) {
        this.clearChoices();
        const landlord = venue.npcs[0];
        const loc = this.currentLocation;
        const gift = Math.max(30, 50 + (loc.economy === 'moderate' ? 30 : 0));
        const seq = [
            { text: `你走进${venue.name}，${landlord.npcName}正端坐在太师椅上喝茶。`, type: 'narrator' },
            { text: `${landlord.npcName}见你进来，放下茶盏：「你就是他们说的那位少侠？不知找老夫有何贵干？」`, type: 'narrator' },
            { text: `你拱手道：「晚辈想打听一个人——沈清寒。」`, type: 'narrator' },
            { text: `${landlord.npcName}沉吟片刻：「沈清寒……这个名字老夫似乎有所耳闻，不过未曾在意。」`, type: 'narrator' },
            { text: `${landlord.npcName}：「此人似乎与中原武林的一些大人物有来往，具体的老夫也不甚清楚。」`, type: 'narrator' },
            { text: `${landlord.npcName}：「老夫建议你去城里打听打听，那些酒楼茶肆里三教九流的人多，消息比我这小地方灵通得多。」`, type: 'narrator' },
        ];
        if (paidEntry) {
            // 塞钱进来的，没有盘缠
            seq.push(
                { text: `${landlord.npcName}：「天色不早了，少侠请便吧。」`, type: 'narrator' },
            );
            this.player.mainQuest = 2;
            if (!this.player.completedQuests) this.player.completedQuests = {};
            this.player.completedQuests.main_2 = true;
            this.showMessageSequence(seq, () => {
                this.showChoices([
                    { text: '告辞', action: () => {
                        this.addMessage('你辞别了员外，走出了大门。', 'narrator');
                        setTimeout(() => this._afterLandlordQuest(), 400);
                    } },
                ]);
            });
        } else {
            // 凭声望或硬闯进来的，可以索要盘缠
            this.showMessageSequence(seq, () => {
                this.showChoices([
                    { text: '告辞', action: () => {
                        this.player.mainQuest = 2;
                        if (!this.player.completedQuests) this.player.completedQuests = {};
                        this.player.completedQuests.main_2 = true;
                        this.addMessage('你辞别了员外，走出了大门。', 'narrator');
                        setTimeout(() => this._afterLandlordQuest(), 400);
                    } },
                    { text: '「晚辈初入江湖，盘缠不足，不知老员外能否资助一二？」', action: () => {
                        this.clearChoices();
                        this.player.gold += gift;
                        this.updateStatsBar();
                        this.player.mainQuest = 2;
                        if (!this.player.completedQuests) this.player.completedQuests = {};
                        this.player.completedQuests.main_2 = true;
                        this.showMessageSequence([
                            { text: `${landlord.npcName}哈哈一笑：「区区小事，何足挂齿。」`, type: 'narrator' },
                            { text: `${landlord.npcName}：「这点盘缠你拿着，就当老夫结个善缘。」`, type: 'narrator' },
                            { text: `获得了 ${gift} 两银子。`, type: 'system' },
                            { text: `你现在可以离开村庄，前往其他地方打探消息了。`, type: 'info' },
                        ], () => {
                            this.showChoices([
                                { text: '多谢老员外', action: () => {
                                    this.addMessage('你辞别了员外，走出了大门。', 'narrator');
                                    setTimeout(() => this._afterLandlordQuest(), 400);
                                } },
                            ]);
                        });
                    } },
                ]);
            });
        }
    }

    _afterLandlordQuest() {
        this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices();
    }

    landlordFightGuards(venue) {
        this.clearChoices();
        this.addMessage(`你大喝一声：「让开！」挥拳朝家丁冲了过去。`, 'narrator');
        const guardPower = (this.currentLocation.guardianPower || 20) * 2 + 15;
        const enemy = createGuardEnemy('家丁', guardPower);
        this.startBattle(enemy,
            () => {
                this.showMessageSequence([
                    { text: `三拳两脚，两个家丁便躺在地上哀嚎不止。`, type: 'narrator' },
                    { text: `大门「吱呀」一声开了，${venue.npcs[0].npcName}站在门口，面色不悦。`, type: 'narrator' },
                    { text: `管家：「少侠好身手，既然能打到这来，那就进来说话吧。」`, type: 'narrator' },
                ], () => this.landlordQuestGrant(venue, false));
            },
            () => this.gameOver('你受伤过重，不治身亡')
        );
    }

    isBrothelVenue(venue) {
        return ['怡红院','醉花楼','潇湘阁','春风楼','牡丹院','锦官阁','汉水楼','烟雨阁'].includes(venue.name);
    }

    isPublicVenue(venue) {
        if (this.isBrothelVenue(venue)) return false;
        const name = venue.name;
        if (name.includes('家') || name.includes('府')) return false;
        if (['断桥', '小溪', '田埂', '小树林', '废弃矿坑'].includes(name)) return false;
        return true;
    }

    interactNpc(venue, npc) {
        if (npc.isBeauty) { this.interactBeauty(venue, npc); return; }
        if (npc.isChief) { this.chiefAction(venue, npc); return; }
        if (this.isBrothelVenue(venue)) { this.interactBrothel(venue, npc); return; }
        if (npc.isTeacher) { this._schoolAction(venue, npc); return; }
        if (npc.isMartialTeacher) { this._martialHallAction(venue, npc); return; }
        if (venue.name === '村角') {
            if (npc._isCrippleLi) { this.crippleLiAction(venue, npc); return; }
            if (npc.gamblerLevel) { this.gamblerAction(venue, npc); return; }
            this.beggarAction(venue, npc); return;
        }
        if (npc.factionId) { this.factionAction(venue, npc); return; }
        if (npc.gamblerLevel) { this.gamblerAction(venue, npc); return; }
        if ((npc.isButcher || venue.name === '肉铺') && this.questInteractButcher) { this.questInteractButcher(venue, npc); return; }
        if (npc.isEstateAgent) { this.houseManager.showEstateAgent(venue, this.player.locationId); return; }
        if (npc.isFishMarket) { this._fishMarketMenu(venue, npc); return; }
        this.clearChoices();
        if (!npc._introduced) {
            this.addMessage(`${npc.npcName}：「${npc.npcDesc}」`, 'info');
            npc._introduced = true;
        }
        const choices = [
            { text: '闲谈', action: () => this.chatWithNpc(venue, npc) },
            { text: '购买', action: () => this.buyFromNpc(venue, npc) },
            { text: '出售', action: () => this.sellToNpc(venue, npc) },
        ];
        const deliverQuest = this._getBoardDeliverMatch(npc.npcName, venue.name);
        if (deliverQuest) {
            choices.splice(0, 0, { text: '有给你的信', action: () => this._boardDeliverLetter(deliverQuest, venue) });
        }
        if (venue.name === '铁匠铺') {
            choices.splice(choices.findIndex(c => c.text === '出售') + 1, 0, { text: '装备制造', action: () => this.showForgeMenu(venue, npc) });
        }
        const huntQuest = this._getActiveBoardHuntQuest();
        if (huntQuest && venue.name === '小树林' && !npc._killed) {
            choices.splice(choices.length, 0, { text: `猎杀${huntQuest.beastName}（告示栏任务）`, action: () => this._startBoardHuntBattle(huntQuest) });
        }
        // 小树林：猎人或樵夫专属
        if (npc._forestType === 'hunter' && !npc._killed) {
            choices.splice(choices.length, 0, { text: '帮助打猎', action: () => this.huntWithHunter(venue, npc) });
        }
        if (npc._forestType === 'woodcutter' && !npc._killed) {
            choices.splice(choices.length, 0, { text: '帮助砍柴', action: () => this.chopWithWoodcutter(venue, npc) });
        }
        if (!npc.civilian && npc.combatPower > 0 && !npc._defeated) {
            choices.push({ text: '邀请切磋', action: () => this.duelWithNpc(venue, npc, { label: '邀请切磋' }) });
        }
        choices.push({ text: '不义之举', action: () => this.showUnrighteousActs(venue, npc) });
        choices.push({ text: '返回', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    /* ─── 学堂 ─── */

    _schoolAction(venue, npc) {
        this.clearChoices();
        if (!npc._introduced) {
            this.addMessage(`${npc.npcName}：「${npc.npcDesc}」`, 'info');
            npc._introduced = true;
        }
        const studied = (this.player._studiedAt || {})[this.player.locationId] || 0;
        if (studied >= 3) {
            this.addMessage(`${npc.npcName}捋着胡须道：「老夫已倾囊相授，你再学也难有寸进了。」`, 'narrator');
            this.showChoices([{ text: '离开', action: () => this.enterVenue(venue) }]);
            return;
        }
        this.addMessage(`${npc.npcName}：「又是来求学的？老夫这里有《千字文》《论语》《周易》……你想学哪本？」`, 'narrator');
        const choices = [
            { text: `读书（悟性 +2 · 10两）`, action: () => {
                this.clearChoices();
                if (this.player.gold < 10) {
                    this.addMessage('你摸了摸钱袋——囊中羞涩。', 'narrator');
                    this.showChoices([{ text: '回去', action: () => this._schoolAction(venue, npc) }]);
                    return;
                }
                this.player.gold -= 10;
                const cur = this.player._studiedAt || {};
                cur[this.player.locationId] = (cur[this.player.locationId] || 0) + 1;
                this.player._studiedAt = cur;
                this.player.attrs.wit += 2;
                this.addMessage(`你坐在窗边，跟着老先生读了半日书。窗外蝉鸣阵阵，书声琅琅。`, 'narrator');
                this.addMessage(`悟性 +2（当前 ${this.player.attrs.wit}）`, 'system');
                this.advanceTime();
                this.updateStatsBar();
                setTimeout(() => this._schoolAction(venue, npc), 400);
            }},
        ];
        choices.push({ text: '离开', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    /* ─── 习武堂 ─── */

    _martialHallAction(venue, npc) {
        this.clearChoices();
        if (!npc._introduced) {
            this.addMessage(`${npc.npcName}：「${npc.npcDesc}」`, 'info');
            npc._introduced = true;
        }
        const hasChangquan = this.player.externalSkills.some(s => s.id === 'chang_quan');
        if (hasChangquan) {
            this.addMessage(`${npc.npcName}打量了你一番：「你已学会了长拳，老夫没什么可教你的了。自己勤加练习便是。」`, 'narrator');
            this.showChoices([{ text: '离开', action: () => this.enterVenue(venue) }]);
            return;
        }
        this.addMessage(`${npc.npcName}拍了拍你的肩膀：「小伙子筋骨不错，想学功夫？老夫这里有一套长拳，虽然只是入门功夫，但练好了走江湖也够用。」`, 'narrator');
        const choices = [
            { text: '学拳（习得长拳 · 15两）', action: () => {
                this.clearChoices();
                if (this.player.gold < 15) {
                    this.addMessage('你摸了摸钱袋——囊中羞涩。', 'narrator');
                    this.showChoices([{ text: '回去', action: () => this._martialHallAction(venue, npc) }]);
                    return;
                }
                this.player.gold -= 15;
                this.player.externalSkills.push({ id: 'chang_quan', name: '长拳', desc: '江湖最常见的入门拳法，四平八稳，招正势圆。', level: 1 });
                this.addMessage(`你跟着老武师在院子里扎马步、练冲拳，一个时辰下来汗流浃背。`, 'narrator');
                this.addMessage(`你学会了「长拳」！江湖最常见的入门拳法，四平八稳，招正势圆。`, 'event');
                this.advanceTime();
                this.updateStatsBar();
                setTimeout(() => this._martialHallAction(venue, npc), 400);
            }},
        ];
        choices.push({ text: '离开', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    /* ─── 花鸟鱼市场 ─── */

    _fishMarketMenu(venue, npc) {
        this.clearChoices();
        this.addMessage(`你走进${venue.name}，${npc.npcName}正在给水盆换水。`, 'narrator');
        this.addMessage(`「客官来得巧！今儿个刚到的几尾好鱼，您瞧瞧？」`, 'info');
        const stock = this._getFishMarketStock();
        const hasPondPortable = this.player.items.some(i => i.id === 'pond_portable');
        const quest = this._getFishMarketQuest();
        const choices = [];
        // 每日鱼货
        if (stock.length > 0) {
            const label = stock.map(s => `「${s.name}」`).join('');
            choices.push({ text: `看看今日鱼货${label}`, action: () => this._fishMarketBuy(venue, npc) });
        }
        // 随身鱼袋
        if (!hasPondPortable) {
            choices.push({ text: '买一个随身鱼袋（2,000两）', action: () => {
                this.clearChoices();
                if (this.player.gold < 2000) {
                    this.addMessage('囊中羞涩。', 'narrator');
                    this._fishMarketMenu(venue, npc);
                    return;
                }
                this.player.gold -= 2000;
                this.player.items.push({ ...getItem('pond_portable') });
                this.addMessage('你买下一只青瓷鱼缸。老板叮嘱道：「这缸金贵，别摔了，一尾鱼也别贪多。」', 'narrator');
                this.updateStatsBar();
                setTimeout(() => this._fishMarketMenu(venue, npc), 500);
            }});
        }
        // 任务
        if (quest) {
            const hasFish = this.player.items.some(i => i.id === quest.targetId);
            choices.push({ text: `交付任务：${quest.desc}`, action: () => this._fishMarketDeliver(venue, npc, quest) });
        }
        choices.push({ text: '闲聊', action: () => {
            this.clearChoices();
            this.addMessage(`${npc.npcName}擦了擦手：「这花鸟鱼市场热闹着呢，您常来逛逛。」`, 'narrator');
            this.addMessage('他告诉你一些养鱼的心得，还提到了城外某处深潭似乎有异鱼出没……', 'narrator');
            this.showChoices([{ text: '回去', action: () => this._fishMarketMenu(venue, npc) }]);
        }});
        choices.push({ text: '离开', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    _getFishMarketStock() {
        const key = 'fishmkt_' + this.player.locationId + '_' + this.player.day;
        const allFish = ['fish_mkt_white','fish_mkt_green','fish_mkt_blue','fish_mkt_purple','fish_mkt_orange','fish_mkt_gold','fish_mkt_red'];
        if (this._fishStockCache && this._fishStockCache._key === key) return this._fishStockCache.stock;
        const shuffled = [...allFish].sort(() => Math.random() - 0.5);
        const picked = shuffled.slice(0, 3);
        const stock = picked.map(id => ({ ...getItem(id) }));
        this._fishStockCache = { _key: key, stock };
        return stock;
    }

    _fishMarketBuy(venue, npc) {
        this.clearChoices();
        const stock = this._getFishMarketStock();
        this.addMessage(`${npc.npcName}指着几个水盆：「今儿个就这三尾，您瞅瞅——」`, 'narrator');
        const choices = stock.map(fish => ({
            text: `${fish.name}【${ITEM_TIER_LABELS[fish.tier] || fish.tier}】— ${fish.value.toLocaleString()}两`,
            action: () => {
                this.clearChoices();
                if (this.player.gold < fish.value) {
                    this.addMessage('囊中羞涩。', 'narrator');
                    this._fishMarketBuy(venue, npc);
                    return;
                }
                this.player.gold -= fish.value;
                this.player.items.push({ ...fish });
                this.addMessage(`你买下${fish.name}，老板小心翼翼地帮你装进水袋。`, 'narrator');
                this.updateStatsBar();
                setTimeout(() => this._fishMarketMenu(venue, npc), 500);
            },
        }));
        choices.push({ text: '算了', action: () => this._fishMarketMenu(venue, npc) });
        this.showChoices(choices);
    }

    _getFishMarketQuest() {
        const key = this.player.day + '_fishquest';
        if (this.player._fishQuestDone === this.player.day) return null;
        if (this._fishQuestCache && this._fishQuestCache._key === key) return this._fishQuestCache.quest;
        const targets = [
            { targetId: 'fish_carp', targetName: '鲤鱼', desc: '送一尾鲤鱼来，我要宴客。', gold: 50, rep: 5, rod: null },
            { targetId: 'fish_grass_carp', targetName: '草鱼', desc: '家里来客，差条草鱼做菜。', gold: 60, rep: 5, rod: null },
            { targetId: 'fish_catfish', targetName: '鲶鱼', desc: '想炖锅鲶鱼汤，你帮我弄一条来。', gold: 80, rep: 8, rod: null },
            { targetId: 'fish_crab', targetName: '螃蟹', desc: '下酒菜就差几只螃蟹了。', gold: 100, rep: 10, rod: null },
            { targetId: 'fish_shrimp', targetName: '河虾', desc: '要些鲜虾入药，你帮我张罗张罗。', gold: 50, rep: 5, rod: null },
            { targetId: 'fish_yuanbao', targetName: '元宝鱼', desc: '听说你钓到过元宝鱼？卖我如何？', gold: 500, rep: 30, rod: 'rod_green' },
            { targetId: 'fish_mkt_white', targetName: '白鲤', desc: '有客人想买白鲤放生，我这儿缺货了。', gold: 200, rep: 15, rod: null },
            { targetId: 'fish_mkt_green', targetName: '青鲤', desc: '一位老主顾指明要青鲤，你帮我寻一条。', gold: 500, rep: 25, rod: 'rod_blue' },
        ];
        const picked = targets[Math.floor(Math.random() * targets.length)];
        const hasRod = !!picked.rod;
        let quest = { ...picked, hasRodReward: hasRod };
        // 如果玩家已有同品质或更好的鱼竿，不再奖励鱼竿
        if (hasRod) {
            const rodTiers = { rod_green:1, rod_blue:2, rod_purple:3, rod_orange:4, rod_gold:5 };
            const currentTier = this.player.items.reduce((max, i) => Math.max(max, rodTiers[i.id] || 0), 0);
            if (currentTier >= (rodTiers[picked.rod] || 0)) {
                quest.rod = null;
                quest.hasRodReward = false;
                quest.gold += 200; // 补偿金
            }
        }
        this._fishQuestCache = { _key: key, quest };
        return quest;
    }

    _fishMarketDeliver(venue, npc, quest) {
        this.clearChoices();
        const idx = this.player.items.findIndex(i => i.id === quest.targetId);
        if (idx === -1) {
            this.addMessage(`${npc.npcName}看了看你的水桶：「空手来的？没事，改天再说。」`, 'narrator');
            this._fishMarketMenu(venue, npc);
            return;
        }
        this.player.items.splice(idx, 1);
        this.player.gold += quest.gold;
        this.player.reputation += quest.rep;
        this.addMessage(`${npc.npcName}接过${quest.targetName}，喜笑颜开：「好！痛快！」`, 'narrator');
        this.addMessage(`获得${quest.gold}两，声望+${quest.rep}`, 'system');
        if (quest.rod) {
            const rodDef = getItem(quest.rod);
            if (rodDef) {
                this.player.items.push({ ...rodDef });
                this.addMessage(`获得【${rodDef.name}】×1`, 'system');
            }
        }
        this.player._fishQuestDone = this.player.day;
        this.updateStatsBar();
        this.showChoices([{ text: '回去', action: () => this._fishMarketMenu(venue, npc) }]);
    }

    showUnrighteousActs(venue, npc) {
        this.clearChoices();
        this.addMessage(`你心中泛起了些见不得光的念头……`, 'narrator');
        const choices = [];
        if (!npc._caught) {
            choices.push({ text: '偷窃', action: () => this.attemptSteal(venue, npc) });
        }
        if (!npc._defeated && !npc._killed) {
            if (npc._forestType) {
                choices.push({ text: '偷袭', action: () => this.forestAmbush(venue, npc) });
            } else {
                choices.push({ text: '偷袭', action: () => this.duelWithNpc(venue, npc, { powerMult: 0.5, initRepCost: 1, noCombatRepChange: true, label: '偷袭' }) });
            }
            choices.push({ text: '暗杀', action: () => this.duelWithNpc(venue, npc, { powerMult: 0.5, initRepCost: 3, noCombatRepChange: true, winGetAllItems: true, label: '暗杀' }) });
        }
        choices.push({ text: '算了', action: () => this.interactNpc(venue, npc) });
        this.showChoices(choices);
    }

    /* ─── 门派交互 ─── */

    factionAction(venue, npc) {
        const fId = npc.factionId;
        const f = getFaction(fId);
        if (!f) { this.addMessage('这位掌门似乎不在了。', 'narrator'); return this.enterVenue(venue); }
        this.clearChoices();
        this.addMessage(`您来到${f.venueName}。`, 'narrator');
        this.addMessage(`${f.stewardName}：「${f.stewardDesc}」`, 'info');

        const p = this.player;
        const isMember = p.faction === fId;
        const choices = [];

        if (isMember) {
            const rank = getCurrentRank(p);
            const rankName = rank ? rank.name : '未知';
            this.addMessage(`你目前是【${f.name}】的「${rankName}」。门派贡献：${p.factionRep}`, 'system');
            choices.push({ text: '聆听教诲（查看门派信息）', action: () => this.showFactionInfo(f, venue) });
            choices.push({ text: '请求晋升', action: () => this.requestFactionPromotion(f, venue) });
            choices.push({ text: '研习武学', action: () => this.learnFactionSkillFromFaction(f, venue) });
            choices.push({ text: '修习内功', action: () => this.learnFactionInternalFromFaction(f, venue) });
            const tower = getFactionTower(f.id);
            if (tower) choices.push({ text: `挑战「${tower.towerName}」`, action: () =>
                this.enterTower({ _towerFactionId: f.id, _originVenue: venue })
            });
            choices.push({ text: '捐赠银两（贡献+1/10两）', action: () => this.donateToFaction(f, venue) });
            choices.push({ text: '退出门派', action: () => this.leaveFaction(venue) });
        } else {
            this.addMessage(`你与${f.name}尚无渊源。`, 'narrator');
            choices.push({ text: '了解详情', action: () => this.showFactionInfo(f, venue) });
            const canJoin = !p.faction
                || f.exclusiveGroup == null  // 金钱帮可随时加入
                || FACTIONS[p.faction].exclusiveGroup == null  // 在金钱帮时可随时加入其他派
                || FACTIONS[p.faction].exclusiveGroup !== f.exclusiveGroup;
            if (canJoin) {
                choices.push({ text: '请求加入', action: () => this.joinFaction(fId, venue) });
            }
        }
        choices.push({ text: '离开', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    showFactionInfo(f, venue) {
        this.clearChoices();
        const p = this.player;
        this.addMessage(`—— ${f.icon} ${f.name} ——`, 'system');
        this.addMessage(f.desc, 'info');
        this.addMessage('', 'narrator');
        this.addMessage('【门规地位】' + (f.isEvil ? '邪派' : (f.exclusiveGroup === 'positive' ? '正派' : '中立')), 'info');
        this.addMessage(`驻地：${f.venueName}`, 'info');
        this.addMessage('', 'narrator');
        this.addMessage('【晋升阶梯】', 'system');

        for (let i = 0; i < f.ranks.length; i++) {
            const r = f.ranks[i];
            const unlocked = (!p.faction && i === 0) || (p.faction === f.id && i <= p.factionRank);
            const current = p.faction === f.id && i === p.factionRank;
            const available = p.faction === f.id && i === p.factionRank + 1;
            let prefix = '  ';
            if (current) prefix = '→ ';
            else if (available) prefix = '▸ ';
            else if (unlocked) prefix = '✓ ';
            this.addMessage(`${prefix}${r.name}（贡献≥${r.repRequired}）`, current ? 'event' : (available ? 'system' : 'info'));
            this.addMessage(`    条件：${r.reqDesc}`, 'info');
            if (r.bonusDesc) this.addMessage(`    加成：${r.bonusDesc}`, 'info');
            if (current) this.addMessage(`    「${r.desc}」`, 'narrator');
        }

        this.addMessage('', 'narrator');
        this.addMessage('【专属武学】', 'system');
        const shownSkills = new Set();
        for (const rank of f.ranks) {
            for (const skId of (rank.skillIds || [])) {
                if (shownSkills.has(skId)) continue;
                shownSkills.add(skId);
                const sk = getFactionSkill(skId);
                if (sk) this.addMessage(`  ${sk.name}（${SKILL_QUALITIES[sk.quality].name}）— ${sk.desc}`, 'info');
            }
        }

        this.addMessage('', 'narrator');
        this.addMessage('【专属内功】', 'system');
        const shownInternals = new Set();
        for (const rank of f.ranks) {
            for (const inId of (rank.internalIds || [])) {
                if (shownInternals.has(inId)) continue;
                shownInternals.add(inId);
                const ins = FACTION_INTERNAL_SKILLS[inId];
                if (ins) this.addMessage(`  ${ins.name}（${SKILL_QUALITIES[ins.quality].name}）`, 'info');
            }
        }

        this.showChoices([{ text: '返回', action: () => this.factionAction(venue, { factionId: f.id })}]);
    }

    joinFaction(fId, venue) {
        const f = getFaction(fId);
        if (!f) return this.enterVenue(venue);
        const p = this.player;

        // 检查是否已有互斥门派
        const conflict = handleFactionJoinConflict(p, fId);
        if (conflict === false) {
            this.addMessage(`你已有同阵营门派在身，不便再加入${f.name}。`, 'danger');
            return this.factionAction(venue, { factionId: fId });
        }

        // 检查入门条件
        const entryRank = f.ranks[0];
        if (!meetsRankRequirements(p, entryRank)) {
            this.addMessage(`你的条件尚未满足${f.name}的入门要求。`, 'danger');
            this.addMessage(`需要：${entryRank.reqDesc}`, 'info');
            return this.factionAction(venue, { factionId: fId });
        }
        if (!canPayRankCost(p, entryRank)) {
            this.addMessage(`你无法支付加入${f.name}的费用。`, 'danger');
            return this.factionAction(venue, { factionId: fId });
        }

        this.clearChoices();
        this.addMessage(`你郑重地向${f.stewardName}行礼：「晚辈${p.attrs.name || '无名'}，恳请拜入${f.name}门下！」`, 'narrator');
        this.addMessage(`${f.stewardName}捋须打量你片刻，点了点头：「根骨尚可，心性不错。好，从今日起你便是我${f.name}的${entryRank.name}了。」`, 'event');

        payRankCost(p, entryRank);
        applyStatBonuses(p, entryRank);

        p.faction = fId;
        p.factionRank = 0;
        p.factionRep = 0;

        this.addMessage(`你成为了【${f.name}】的「${entryRank.name}」！`, 'event');
        if (entryRank.bonusDesc) this.addMessage(`获得加成：${entryRank.bonusDesc}`, 'system');
        if (f.isEvil) this.addMessage('你踏入了魔道——从此江湖正道视你为敌。', 'danger');

        this.updateStatsBar();
        setTimeout(() => this.factionAction(venue, { factionId: fId }), 400);
    }

    requestFactionPromotion(f, venue) {
        this.clearChoices();
        const p = this.player;
        const nextRankIdx = p.factionRank + 1;
        if (nextRankIdx >= f.ranks.length) {
            this.addMessage(`你已是${f.name}最高阶弟子，再无晋升空间。`, 'narrator');
            return this.factionAction(venue, { factionId: f.id });
        }
        const nextRank = f.ranks[nextRankIdx];

        if (p.factionRep < nextRank.repRequired) {
            this.addMessage(`你的门派贡献不足（${p.factionRep}/${nextRank.repRequired}），还需努力。`, 'danger');
            return this.factionAction(venue, { factionId: f.id });
        }
        if (!meetsRankRequirements(p, nextRank)) {
            this.addMessage(`你的条件尚未满足「${nextRank.name}」的要求。`, 'danger');
            this.addMessage(`需要：${nextRank.reqDesc}`, 'info');
            return this.factionAction(venue, { factionId: f.id });
        }
        if (!canPayRankCost(p, nextRank)) {
            this.addMessage(`你无法支付晋升的费用。`, 'danger');
            return this.factionAction(venue, { factionId: f.id });
        }

        this.addMessage(`你向${f.stewardName}请求晋升：「弟子恳请师长恩准晋升${nextRank.name}。」`, 'narrator');
        // 门派会有考核——对决同门
        const testPower = 30 + nextRankIdx * 25 + (f.isEvil ? 10 : 0);
        const playerPower = this.getPlayerCombatPower('full');
        if (playerPower < testPower) {
            this.addMessage(`${f.stewardName}摇了摇头：「你功力尚浅，还需打磨。等火候到了，为师自会提你。」`, 'narrator');
            return this.factionAction(venue, { factionId: f.id });
        }

        payRankCost(p, nextRank);
        // 移除旧 rank 加成，应用新 rank 加成
        const oldRank = f.ranks[p.factionRank];
        unapplyStatBonuses(p, oldRank);
        p.factionRank = nextRankIdx;
        applyStatBonuses(p, nextRank);

        this.addMessage(`${f.stewardName}赞许地颔首：「不错，从今日起你便是我${f.name}的${nextRank.name}了。」`, 'event');
        this.addMessage(`你晋升为【${f.name}】的「${nextRank.name}」！`, 'event');
        if (nextRank.bonusDesc) this.addMessage(`获得加成：${nextRank.bonusDesc}`, 'system');

        this.updateStatsBar();
        setTimeout(() => this.factionAction(venue, { factionId: f.id }), 400);
    }

    learnFactionSkillFromFaction(f, venue) {
        this.clearChoices();
        const p = this.player;
        const rank = getCurrentRank(p);
        if (!rank) return this.factionAction(venue, { factionId: f.id });

        const skillIds = rank.skillIds || [];
        // 找出未学过的武学（用 faction skill 的 key 作为 external skill id）
        const unlearned = skillIds.filter(skId => !p.externalSkills.some(e => e.id === skId));

        if (unlearned.length === 0) {
            this.addMessage('你当前身份可学的武学均已习得。', 'info');
            return this.factionAction(venue, { factionId: f.id });
        }

        this.addMessage('请选择要研习的武学：', 'narrator');
        const choices = unlearned.map(skId => {
            const sk = getFactionSkill(skId);
            if (!sk) return null;
            return { text: sk.name, action: () => {
                this.clearChoices();
                if (p.externalSkills.some(e => e.id === skId)) {
                    this.addMessage(`你已经学过${sk.name}了。`, 'info');
                } else {
                    p.externalSkills.push({
                        id: skId,
                        name: sk.name,
                        desc: sk.desc,
                        type: sk.type,
                        quality: sk.quality,
                        level: 1,
                        maxLevel: (SKILL_QUALITIES[sk.quality] || SKILL_QUALITIES.white).maxLevel,
                        rootReq: sk.rootReq,
                        agileReq: sk.agileReq,
                        intelReq: sk.intelReq,
                    });
                    this.addMessage(`你潜心研习，习得了「${sk.name}」！`, 'event');
                    this.player.day += 3;
                    this.player.exp += 10;
                }
                this.updateStatsBar();
                setTimeout(() => this.learnFactionSkillFromFaction(f, venue), 400);
            }};
        }).filter(Boolean);
        choices.push({ text: '算了', action: () => this.factionAction(venue, { factionId: f.id }) });
        this.showChoices(choices);
    }

    learnFactionInternalFromFaction(f, venue) {
        this.clearChoices();
        const p = this.player;
        const rank = getCurrentRank(p);
        if (!rank) return this.factionAction(venue, { factionId: f.id });

        const internalIds = rank.internalIds || [];
        const available = internalIds.map(id => FACTION_INTERNAL_SKILLS[id]).filter(Boolean);
        const unlearned = available.filter(ins => !p.internalSkills.includes(ins.name));

        if (unlearned.length === 0) {
            this.addMessage('你当前身份可学的内功均已习得。', 'info');
            return this.factionAction(venue, { factionId: f.id });
        }

        this.addMessage('请选择要修习的内功：', 'narrator');
        const choices = unlearned.map(ins => ({ text: ins.name, action: () => {
            this.clearChoices();
            if (p.internalSkills.includes(ins.name)) {
                this.addMessage(`你已经学过${ins.name}了。`, 'info');
            } else {
                p.internalSkills.push(ins.name);
                this.addMessage(`你默记口诀，习得了「${ins.name}」心法！`, 'event');
                this.player.day += 5;
                this.player.exp += 15;
            }
            this.updateStatsBar();
            setTimeout(() => this.learnFactionInternalFromFaction(f, venue), 400);
        }}));
        choices.push({ text: '算了', action: () => this.factionAction(venue, { factionId: f.id }) });
        this.showChoices(choices);
    }

    donateToFaction(f, venue) {
        this.clearChoices();
        const DONATION_RATES = [10, 50, 100, 500];
        this.addMessage(`你打算捐赠多少银两？每10两可获1点门派贡献。`, 'narrator');
        this.addMessage(`当前银两：${this.player.gold}两 | 当前贡献：${this.player.factionRep}`, 'info');
        const choices = DONATION_RATES.filter(g => this.player.gold >= g).map(g => ({
            text: `${g}两（贡献+${g/10}）`,
            action: () => {
                this.player.gold -= g;
                this.player.factionRep += g / 10;
                this.addMessage(`你捐赠了${g}两白银，门派贡献+${g/10}。`, 'event');
                this.updateStatsBar();
                setTimeout(() => this.factionAction(venue, { factionId: f.id }), 400);
            },
        }));
        choices.push({ text: '算了', action: () => this.factionAction(venue, { factionId: f.id }) });
        this.showChoices(choices);
    }

    leaveFaction(venue) {
        const p = this.player;
        if (!p.faction) return;
        const f = getFaction(p.faction);
        if (!f) { p.faction = null; return this.enterVenue(venue); }

        this.clearChoices();
        this.addMessage(`你向${f.stewardName}提出退出${f.name}……`, 'narrator');
        this.addMessage(`${f.stewardName}沉默良久，叹息一声：「人各有志，去吧。」`, 'narrator');

        // 收回当前 rank 加成
        const currentRank = f.ranks[p.factionRank || 0];
        if (currentRank) unapplyStatBonuses(p, currentRank);

        const oldFaction = p.faction;
        p.faction = null;
        p.factionRank = 0;
        p.factionRep = 0;
        this.addMessage(`你退出了【${f.name}】。`, 'system');
        if (f.isEvil) {
            this.addMessage('你脱离了魔教，江湖正道对你松了口气。', 'narrator');
        }
        this.updateStatsBar();
        setTimeout(() => this.enterVenue(venue), 400);
    }

    /* ─── 爬塔系统 ─── */

    _towerBack(venue) {
        if (venue._originVenue) {
            this.enterVenue(venue._originVenue);
        } else {
            this.showVenues();
        }
    }

    enterTower(venue) {
        this.clearChoices();
        const fId = venue._towerFactionId;
        const tower = getFactionTower(fId);
        if (!tower) { this.addMessage('试炼之地已荒废。', 'narrator'); return this._towerBack(venue); }

        const p = this.player;
        const progressKey = '_tower_' + fId;
        const currentLevel = p[progressKey] || 0;
        const isMember = p.faction === fId;

        this.addMessage(`—— ${tower.towerName} ——`, 'system');
        this.addMessage(tower.towerDesc, 'info');
        this.addMessage('', 'narrator');

        if (!isMember) {
            this.addMessage('只有本门弟子方可入内挑战。', 'narrator');
            this.showChoices([{ text: '离开', action: () => this._towerBack(venue) }]);
            return;
        }

        if (currentLevel >= tower.levels.length) {
            this.addMessage('你已通关所有关卡，站在塔顶俯瞰众生，心中豪气万千。', 'event');
            this.showChoices([{ text: '离开', action: () => this._towerBack(venue) }]);
            return;
        }

        // 显示关卡信息
        this.addMessage(`当前进度：第 ${currentLevel + 1} 关 / 共 ${tower.levels.length} 关`, 'system');
        for (let i = 0; i < tower.levels.length; i++) {
            const lv = tower.levels[i];
            const status = i < currentLevel ? '✓' : (i === currentLevel ? '→' : ' ');
            this.addMessage(`  ${status} ${lv.name}（${lv.guardianName}·战力 ${lv.combatPower}）`, i < currentLevel ? 'event' : (i === currentLevel ? 'system' : 'info'));
        }

        this.addMessage('', 'narrator');
        this.showChoices([
            { text: `挑战「${tower.levels[currentLevel].name}」`, action: () => this.startTowerBattle(venue, tower) },
            { text: '离开', action: () => this._towerBack(venue) },
        ]);
    }

    startTowerBattle(venue, tower) {
        const p = this.player;
        const progressKey = '_tower_' + tower.factionId;
        const levelIdx = p[progressKey] || 0;
        if (levelIdx >= tower.levels.length) return this.enterTower(venue);

        const lv = tower.levels[levelIdx];
        this.clearChoices();
        this.addMessage(`你深吸一口气，踏入${lv.name}……`, 'narrator');
        this.addMessage(`${lv.guardianName}挡在面前：「接招！」`, 'danger');

        const enemy = generateNpcEnemy({ npcName: lv.guardianName, combatPower: lv.combatPower });

        this.startBattle(enemy,
            () => {
                // 胜利
                this.addMessage(`你击败了${lv.guardianName}！`, 'event');
                // 发放奖励
                this._grantTowerReward(tower, lv);
                p[progressKey] = levelIdx + 1;
                this.addMessage(`木人巷进度：第 ${levelIdx + 1} 关通关！`, 'system');
                this.updateStatsBar();
                setTimeout(() => this.enterTower(venue), 500);
            },
            () => {
                this.gameOver('你受伤过重，不治身亡');
            },
        );
    }

    _grantTowerReward(tower, level) {
        const reward = level.reward;
        const p = this.player;
        if (reward.type === 'skill') {
            const sk = getFactionSkill(reward.skillId);
            if (sk && !p.externalSkills.some(e => e.id === reward.skillId)) {
                p.externalSkills.push({ id: reward.skillId, name: sk.name, desc: sk.desc, type: sk.type, quality: sk.quality, level: 1, rootReq: sk.rootReq, agileReq: sk.agileReq, intelReq: sk.intelReq });
                this.addMessage(`你获得「${reward.label}」，习得了「${sk.name}」！`, 'event');
            } else if (sk) {
                // 已有则升级
                const existing = p.externalSkills.find(e => e.id === reward.skillId);
                if (existing) existing.level = Math.min((existing.level || 1) + 1, SKILL_QUALITIES[existing.quality].maxLevel || 5);
                this.addMessage(`你的「${sk.name}」提升至第 ${existing.level} 层！`, 'event');
            }
        } else if (reward.type === 'internal') {
            const ins = FACTION_INTERNAL_SKILLS[reward.internalId];
            if (ins && !p.internalSkills.includes(ins.name)) {
                p.internalSkills.push(ins.name);
                this.addMessage(`你获得「${reward.label}」，习得了「${ins.name}」心法！`, 'event');
            } else if (ins) {
                this.addMessage(`你获得「${reward.label}」，内功修为精进（内力上限+3）！`, 'event');
                p.maxNeili += 3;
                p.neili = p.maxNeili;
            }
        } else if (reward.type === 'title') {
            const bonuses = reward.statBonuses || {};
            if (!p._towerTitles) p._towerTitles = {};
            if (!p._towerTitles[tower.factionId]) {
                p._towerTitles[tower.factionId] = true;
                if (bonuses.root) { p.attrs.root += bonuses.root; this.addMessage(`根骨 +${bonuses.root}`, 'system'); }
                if (bonuses.wit) { p.attrs.wit += bonuses.wit; this.addMessage(`悟性 +${bonuses.wit}`, 'system'); }
                if (bonuses.dexterity) { p.attrs.dexterity += bonuses.dexterity; this.addMessage(`灵巧 +${bonuses.dexterity}`, 'system'); }
                if (bonuses.luck) { p.attrs.luck += bonuses.luck; this.addMessage(`福缘 +${bonuses.luck}`, 'system'); }
                if (bonuses.maxHp) { p.maxHp += bonuses.maxHp; this.addMessage(`气血 +${bonuses.maxHp}`, 'system'); }
                this.addMessage(`你获得称号「${reward.title}」！${reward.label}`, 'event');
            } else {
                this.addMessage(`你已获得过「${reward.title}」称号。`, 'info');
            }
        }
        this.player.exp += levelIdx * 5 + 10;
    }

    /* ─── 闲谈 ─── */

    chatWithNpc(venue, npc) {
        this.clearChoices();
        const chats = {
            '草药铺': [
                '最近山里的药材越来越少，采药得走更远了。', '你懂药理吗？我这有几味好药……', '看你的气色，要不要抓副药调理调理？',
                '后山小树林里常有药草，你有空可以去采些来，我高价收。', '你要是受了伤，记得来买金疮药，跌打损伤都好使。',
                '村里的樵夫常在山上砍柴，也认得些草药，你可以去后山小树林寻他。',
            ],
            '铁匠铺': [
                '这铁是上好的百炼钢，一般人打不动。', '前两天有人来打了把好刀，那气势……', '你要是想打兵器，得自己带好铁来。',
                '后山小树林里有猎户打猎、樵夫砍柴，他们手上常有材料，你可以去瞧瞧。', '想打造好装备，得先有好的矿石，打猎砍柴都能弄到材料。',
                '我这里有锻炉，你拿铁矿石、兽皮、硬木来，我给你打兵器铠甲。猎户的兽皮、樵夫的硬木都是好材料。',
            ],
            '酒馆': [
                '客官来点什么？本店的酒水可是一绝。', '听说了吗？最近城外好像不太平。', '我这有坛十八年的女儿红，想不想尝尝？',
                '你要想打听消息，村角那老乞丐消息最灵通，塞几两银子什么都告诉你。', '出门在外，多带些干粮和酒水，路上用得着。',
                '听说有些村子的铁匠铺能打造上好的兵器，你有材料不妨去试试。',
            ],
            '家': [
                '村里最近倒是太平，没什么大事。', '你要是想找活干，可以去后山看看。', '唉，今年的收成不太好……',
                '后山小树林里有猎户打猎，也有樵夫砍柴，年轻人可以去搭把手。', '你需要啥就去村里各铺子转转，草药铺找郎中，铁匠铺找铁匠。',
                '村角那个乞丐别看邋遢，这十里八乡的事他门儿清。',
            ],
            '府': [
                '最近生意不太好做啊……', '你要是有什么好东西，可以卖给我。', '听说镇上来了个陌生人，你可要多加小心。',
                '我府上缺些山货，你去小树林找猎户樵夫收些来，我出高价。', '这年头各村的郎中都不错，跌打损伤找他们比去大城便宜。',
                '你想发财的话，小树林里打猎砍柴都能卖钱，攒够了去铁匠铺打身好行头。',
            ],
            '村角': [
                '行行好，赏口饭吃吧……', '我已经三天没吃东西了……', '这年头，活着真难啊。', '大爷您行行好，我给你磕头了！',
                '……你要是想赌两手，那边巷子里有人开局，不过别怪我没提醒你，水深的很。', '后山林子里有猎户，你要是想打猎可以去找他，比跟我这老骨头耗着强。',
            ],
            '猎人': [
                '后山的猎物越来越精了，不好打。', '你要是想试试身手，可以跟我进山。', '猎了一辈子，这山里的东西没人比我更熟。', '昨天打了个大家伙，够吃好几天了。',
                '你要是能帮我打些猎物，皮毛和肉都归你，拿去铁匠铺能换不少钱。', '山里偶尔能碰到珍兽，打到了可值大钱，不过没点本事可别去送死。',
                '你可以先去村里铁匠铺打把趁手的兵器，再来跟我进山。', '打到的猎物剥下的兽皮是好东西，铁匠铺收这个，能打皮甲。',
            ],
            '樵夫': [
                '这柴劈起来也有门道，顺着纹路才省力。', '山上的木头硬得很，我这把刀都快卷刃了。', '每天砍柴，倒也自在。', '你要是有空，可以搭把手。',
                '你帮我砍够了柴，这些硬木你可以拿去铁匠铺，他们打兵器正缺好木料。', '村头的草药铺郎中有时也会来采药，你留意脚下，别踩坏了药草。',
                '我天天在山上转悠，倒是常见到猎户打猎，你们年轻人该去跟他学学。', '这硬木适合做刀柄和弓身，铁匠铺的师傅识货。',
            ],
        };
        const key = Object.keys(chats).find(k => venue.name.includes(k) || (npc._forestType && npc._forestType === k));
        const lines = chats[key] || [
            '今天天气不错。', '你好啊，有什么事吗？', '这日子一天天过，平淡是福。',
            '你要想找事做，可以去小树林帮猎户打猎或者帮樵夫砍柴。', '每个村子都有草药铺和铁匠铺，受伤了去找郎中，想打装备去找铁匠。',
            '村角的乞丐消息灵通，想打听什么事找他准没错。', '赌博有风险，输光了可别怪我没提醒你。',
        ];
        this.addMessage(npc.npcName + '：「' + lines[Math.floor(Math.random() * lines.length)] + '」', 'narrator');
        // 主线任务提示
        if (Math.random() < 0.3 && this.currentLocation && this.player.startingVillage === this.currentLocation.id) {
            const loc = this.currentLocation;
            if (this.player.mainQuest === 0) {
                const chiefVenue = loc.venues.find(v => v.name === '村长家');
                if (chiefVenue) {
                    const chief = chiefVenue.npcs[0];
                    if (npc !== chief) {
                        const chiefHints = [
                            `你顺势问起${chief.npcName}的为人，${npc.npcName}压低声音道：「${chief.npcName}这人势利得很，一般人根本见不到他。」`,
                            `你打听${chief.npcName}的消息，${npc.npcName}撇了撇嘴：「那老东西眼睛长在头顶上，没点名声他都不带正眼看你的。」`,
                            `你提起${chief.npcName}，${npc.npcName}摇了摇头：「他眼光高着呢，没几分本事可入不了他的眼。」`,
                        ];
                        this.addMessage(chiefHints[Math.floor(Math.random() * chiefHints.length)], 'info');
                    }
                }
            } else if (this.player.mainQuest === 1) {
                const landlordVenue = loc.venues.find(v => v.name.endsWith('府'));
                if (landlordVenue) {
                    const landlord = landlordVenue.npcs[0];
                    if (npc !== landlord) {
                        const landlordHints = [
                            `你问起${landlord.npcName}，${npc.npcName}啧啧道：「那可是咱们村最有钱的主儿，宅子深着呢，寻常人可进不去。」`,
                            `你打听${landlord.npcName}的消息，${npc.npcName}压低嗓门：「他家里阔得很，就是门禁严，没点门路见不着。」`,
                            `你提到${landlord.npcName}，${npc.npcName}笑道：「那大户人家规矩多，你要是想去，先把自己名声闯出来再说。」`,
                        ];
                        this.addMessage(landlordHints[Math.floor(Math.random() * landlordHints.length)], 'info');
                    }
                }
            }
        }
        this.updateStatsBar();
        setTimeout(() => this.interactNpc(venue, npc), 400);
    }

    /* ─── 乞丐系统 ─── */

    _initCrippleLi() {
        const allLocs = [...(WORLD.villages || []), ...(WORLD.small_cities || []), ...(WORLD.big_cities || [])];
        for (const loc of allLocs) {
            const corner = loc.venues.find(v => v.name === '村角');
            if (!corner) continue;
            corner.npcs.push({
                npcName: '瘸子李',
                npcDesc: '一个衣衫褴褛的老乞丐，缩在墙角打盹，身旁靠着一根黑黝黝的竹棒。',
                civilian: true,
                combatPower: 80,
                items: [],
                _isCrippleLi: true,
                _hidden: true,
            });
        }
    }

    _tryRevealCrippleLi(venue) {
        if (venue.name !== '村角') return;
        if (this.player._metCrippleLi) return;
        if (!this.player.completedQuests || !this.player.completedQuests.rescue_ox) return;
        if ((this.player._evil || 0) !== 0) return;
        if ((this.player._chopCount || 0) < 5) return;
        if ((this.player._huntCount || 0) < 5) return;
        const cripple = venue.npcs.find(n => n._isCrippleLi);
        if (cripple) cripple._hidden = false;
    }

    beggarAction(venue, npc) {
        this.clearChoices();
        this.addMessage(`墙角的老乞丐缩了缩脖子，咧嘴露出一口黄牙：「爷，赏口饭吃吧……」`, 'narrator');
        const choices = [
            { text: '打听消息（1两）', action: () => this.beggarIntel(venue, npc) },
            { text: '打听门派势力', action: () => this.beggarIntelFactions(venue, npc) },
            { text: '暴打一顿', action: () => this.beatBeggar(venue, npc) },
            { text: '离开', action: () => this.enterVenue(venue) },
        ];
        this.showChoices(choices);
    }

    beggarCharity(venue, npc) {
        this.clearChoices();
        const cost = 1;
        if (this.player.gold < cost) {
            this.addMessage('你摸了摸口袋——一文不名。乞丐失望地叹了口气。', 'narrator');
            setTimeout(() => this.beggarAction(venue, npc), 400);
            return;
        }
        this.player.gold -= cost;
        const texts = [
            '你掏出一两碎银丢进乞丐的破碗里。乞丐千恩万谢：「好人啊！菩萨保佑您！」',
            '你把银子放在乞丐面前，他眼眶一红：「您是个善人……会有好报的。」',
            '乞丐接过银两，连连作揖：「多谢大爷！您一定长命百岁！」',
        ];
        this.addMessage(texts[Math.floor(Math.random() * texts.length)], 'event');
        this._adjWorldHelp(1, '施舍乞丐');
        this.updateStatsBar();
        setTimeout(() => this.beggarAction(venue, npc), 400);
    }

    beggarIntel(venue, npc) {
        this.clearChoices();
        if (this.player.gold < 1) {
            this.addMessage('你摸了摸口袋——一文不名。乞丐翻了个白眼，不理你了。', 'narrator');
            setTimeout(() => this.enterVenue(venue), 400);
            return;
        }
        this.player.gold -= 1;
        this.updateStatsBar();
        this.beggarIntelBeauties(venue, npc, false);
    }

    beatBeggar(venue, npc) {
        this.clearChoices();
        this.player.reputation -= 3;
        this._adjEvil(2, '欺压乞丐');
        this._adjWorldHelp(-1, '欺压乞丐');
        this.addMessage(`你揪起乞丐的衣领，恶狠狠地瞪了他一眼。`, 'narrator');
        this.addMessage(`乞丐吓得瑟瑟发抖：「大爷饶命！我说！我什么都说！」`, 'narrator');
        this.addMessage(`声望 -3（当前 ${this.player.reputation}）`, 'system');
        this.updateStatsBar();
        this.beggarIntelBeauties(venue, npc, true);
    }

    crippleLiAction(venue, npc) {
        this.player._metCrippleLi = true;
        npc._hidden = true;
        this._questSeq([
            '村角蜷缩着一个衣衫褴褛的老乞丐，他一条腿瘸着，身旁靠着一根黑黝黝的竹棒。',
            '你走近时，他缓缓抬起头，一双眼睛却精光四射，与那副落魄模样毫不相称。',
            '「这位爷……行行好，给点赏钱让老瘸子吃口饭吧。」他咧嘴笑道，露出一口黄牙。',
        ], () => {
            this.showChoices([
                { text: '给几两银子', action: () => this.crippleLiGiveMoney(venue, npc) },
                { text: '不予理会', action: () => { this.addMessage('你转身离开，老瘸子在身后叹了口气。', 'narrator'); setTimeout(() => this.enterVenue(venue), 400); } },
            ]);
        });
    }

    crippleLiGiveMoney(venue, npc) {
        if (this.player.gold < 5) {
            this._questSeq([
                '你摸了摸钱袋，窘迫地发现连五两碎银都拿不出来。老瘸子摆摆手：「无妨无妨，有心就好。」',
                '他顿了顿，忽然道：「你虽穷，却有一副侠义心肠。我那不成器的徒子徒孙传了我一套掌法，留在我这儿也是浪费——拿去！」',
                '他将身旁那根黑黝黝的竹棒抛给你。',
            ], () => {
                this.teachCrippleLiSkill();
            });
            return;
        }
        this.player.gold -= 5;
        this.updateStatsBar();
        this._questSeq([
            '你掏出五两碎银放进他碗里。',
        ], () => {
            this._crippleLiAskQuestion(venue, npc);
        });
    }

    _crippleLiAskQuestion(venue, npc) {
        this._questSeq([
            '老瘸子没有急着收钱，而是抬眼定定地看着你，缓缓开口：',
            '「且慢，小哥儿。老瘸子多嘴问一句——你这一路走来，可曾做过问心有愧的事？」',
        ], () => {
            this.showChoices([
                { text: '本人生平光明磊落，自信是个正人君子', action: () => {
                    this._crippleLiAnswerGood(venue, npc);
                }},
                { text: '是是非非很难说，但求无愧我心，无愧苍生', action: () => {
                    this._crippleLiAnswerGreat(venue, npc);
                }},
            ]);
        });
    }

    _crippleLiAnswerGood(venue, npc) {
        this._questSeq([
            '老瘸子看了你半晌，捋须点了点头，忽而哈哈大笑。',
            '「好！好心有好报！老瘸子我漂泊半生，也没什么值钱家当——这套掌法，你收着！」',
        ], () => {
            this.teachCrippleLiSkill();
        });
    }

    _crippleLiAnswerGreat(venue, npc) {
        this._questSeq([
            '老瘸子闻言一怔，随即仰天大笑，笑声在幽深的巷子里回荡不绝。',
            '「哈哈哈哈——好一个无愧苍生！」',
            '他笑罢，抹了把花白的胡子，正色道：',
            '「有你这句话，老瘸子这身功夫没白留。拿去！」',
        ], () => {
            this.teachCrippleLiSkill();
        });
    }

    teachCrippleLiSkill() {
        const skId = 'f_beggar_palm';
        if (this.player.externalSkills.some(s => s.id === skId)) {
            this.addMessage('你早已习得此功，老瘸子赞赏地点了点头。', 'info');
            setTimeout(() => this.enterVenue(this.currentLocation.venues.find(v => v.name === '村角')), 400);
            return;
        }
        const sk = getFactionSkill(skId);
        if (!sk) {
            this.addMessage('老瘸子一拍脑袋：「哎呀，老糊涂了，功夫都忘光了！」', 'narrator');
            setTimeout(() => this.enterVenue(this.currentLocation.venues.find(v => v.name === '村角')), 400);
            return;
        }
        this.player.externalSkills.push({
            id: skId,
            name: sk.name,
            desc: sk.desc,
            type: sk.type,
            quality: sk.quality,
            level: 1,
            maxLevel: (SKILL_QUALITIES[sk.quality] || SKILL_QUALITIES.white).maxLevel,
            rootReq: sk.rootReq,
            agileReq: sk.agileReq,
            intelReq: sk.intelReq,
        });
        this.addMessage(`老瘸子站起身来，拍了拍你的肩膀，沉声道：「此乃丐帮不传之秘——「${sk.name}」，今日传你，望你善用。」`, 'event');
        this.addMessage(`你领悟了「${sk.name}」！`, 'event');
        this.player.exp += 30;
        this.checkLevelUp();
        this.updateStatsBar();

        // 拜谢与对话
        this._questSeq([
            '你心中一震——前世记忆中，这降龙十八掌乃是丐帮镇帮绝学，至刚至阳，天下无双。',
            '这位不起眼的瘸腿老丐，竟是丐帮帮主？',
            '你当即躬身抱拳：「前辈传此绝学，晚辈感激不尽！只是……晚辈一介无名之辈，前辈为何如此厚赠？」',
            '瘸子李沉默片刻，摘下腰间的酒葫芦灌了一口，望着巷口的天光缓缓道：',
            '「夫侠之大者，二者缺一不可——万夫莫敌的实力，与一身浩然正气。有人先修力，后明正气；有人先立正气，后成实力。」',
            '「另一种人，出身微末、本事不大，但心里自有一杆秤——知道什么事该做，什么事打死也不能做。他们一步一步往上爬，不为万人景仰，只为胸中一口浩然正气！」',
            '他转过头，目光灼灼：',
            '「老夫当年生性顽劣……差点走错了路。是前任丐帮帮主沈青竹拽了我一把，让我迷途知返，当年他把这套掌法传给了我。」',
            '「老夫今天将这套掌法传给你，就是希望你能成为后者。」',
            '你将竹棒紧握手中，低头道：「前辈如此盛意，晚辈更觉惶恐。晚辈不过一介无名小卒，只怕辜负了前辈这份期望……」',
            '瘸子李嗤笑一声，摆了摆手：',
            '「哈哈哈！无名之辈？老子这辈子见过太多有名之辈——满口仁义道德，一肚子男盗女娼！」',
            '「我辈习武之人，求的不是青史留名、不是万人景仰，是——」',
            '他目光陡然锐利，一字一顿：',
            '「为国为民，为天下苍生，为了天地之间的浩然正气！」',
            '「至于你叫什么名字、什么出身……谁他娘在乎！」',
        ], () => {
            this.addMessage('一番话掷地有声，如雷贯耳。你怔在原地，只觉得胸中一股热流翻涌，久久说不出话来。', 'narrator');
            this._questSeq([
                '良久，你才郑重拱手：「前辈教诲，晚辈铭记在心。」',
                '瘸子李摆了摆手，拎起地上的竹棒，一瘸一拐地朝巷外走去。',
                '走出几步，他忽然回头，目光如电：',
                '「小子——记住。日后你若恃此掌法行不义之事，无论你走到天涯海角，老夫都要废了你的一身武功！」',
                '说罢，他头也不回地消失在巷口。',
                '你站在原地，望着他远去的方向，久久未动。',
            ], () => {
                this.addMessage('你默默记住了那个佝偻的背影。', 'narrator');
                setTimeout(() => this.enterVenue(this.currentLocation.venues.find(v => v.name === '村角')), 400);
            });
        });
    }

    beggarIntelBeauties(venue, npc, beat, skipIntro = false) {
        this.clearChoices();
        const loc = this.currentLocation;
        const beauties = this.beautyMap[loc.id] || [];
        const available = beauties.filter(b => !this.killedNpcs.has('beauty_' + b.id));
        if (available.length === 0) {
            this.addMessage(`乞丐挠了挠头：「这地方……哪有什么娘们儿啊。」`, 'narrator');
            this.showChoices([{ text: '离开', action: () => this.enterVenue(venue) }]);
            return;
        }
        const showList = () => {
            const choices = available.map(b => ({
                text: b.name,
                action: () => {
                    this.clearChoices();
                    const where = b._currentVenueName || '街上';
                    const who = ['我瞧见过', '听人说', '好像', '前两日还在'][Math.floor(Math.random() * 4)];
                    const action = ['晃悠', '小酌', '买酒', '闲坐', '纳凉', '赏景', '等人'][Math.floor(Math.random() * 7)];
                    this.addMessage(`乞丐压低声音：「${who}，她这会儿在${where}${action}呢。」`, 'narrator');
                    this.showChoices([
                        { text: '再问别的', action: () => this.beggarIntelBeauties(venue, npc, beat, true) },
                        { text: '够了', action: () => this.enterVenue(venue) },
                    ]);
                },
            }));
            choices.push({ text: '算了', action: () => this.enterVenue(venue) });
            this.showChoices(choices);
        };
        if (skipIntro) {
            showList();
        } else {
            const intro = beat ? '「小的常在这一带混，哪家姑娘住在哪儿，门儿清！」' : '乞丐接过银子，眉开眼笑：「爷大方！您想打听谁？」';
            this.showMessageSequence([
                { text: beat ? `乞丐揉着被打的地方，讪笑着说。` : `乞丐掂了掂手里的碎银子，凑近了些。`, type: 'narrator' },
                { text: `乞丐：${intro}`, type: 'html' },
            ], showList);
        }
    }

    /* ─── 赌徒系统 ─── */

    gamblerAction(venue, npc) {
        this.clearChoices();
        this.addMessage(npc.npcName + '抬眼看了看你，咧嘴一笑：「来两把？」他拍了拍面前的破碗，三颗骰子叮当作响。', 'narrator');
        this.showChoices([
            { text: '赌两把', action: () => {
                this.clearChoices();
                startGambling(npc, this.player, {
                    addMessage: (t, type) => this.addMessage(t, type),
                    clearChoices: () => this.clearChoices(),
                    showChoices: (c) => this.showChoices(c),
                    updateStatsBar: () => this.updateStatsBar(),
                    startBattle: (enemy, onWin, onLose, onFlee) => this.startBattle(enemy, onWin, onLose, onFlee),
                    gameOver: (reason) => this.gameOver(reason),
                    gamblerAction: () => this.gamblerAction(venue, npc),
                });
            } },
            { text: '离开', action: () => this.enterVenue(venue) },
        ]);
    }

    /* ─── 猎人系统 ─── */

    huntWithHunter(venue, npc) {
        this.clearChoices();
        const root = this.player.attrs.root || 10;
        const dex = this.player.attrs.dexterity || 10;
        const skill = root + dex;

        const preyList = [
            { name: '兔子', diff: 0, dexReward: 1, reward: { item: 'meat_rabbit', label: '兔肉', desc: '兔子肉，可充饥。' } },
            { name: '蛇',   diff: 1, dexReward: 1, reward: { item: 'meat_snake', label: '蛇肉', desc: '蛇肉细嫩，可煲汤。' } },
            { name: '山羊', diff: 2, dexReward: 2, reward: { item: 'meat_goat', label: '羊肉', desc: '山羊肉质紧实。' } },
            { name: '野猪', diff: 3, dexReward: 2, penalty: 0.22, reward: { item: 'meat_boar', label: '野猪肉', desc: '野猪肉有嚼劲。' } },
            { name: '巨蟒', diff: 4, dexReward: 4, penalty: 0.20, reward: { item: 'gall_snake', label: '蛇胆', desc: '服用内力上限+2。', boost: { maxNeili: 2 } } },
            { name: '黑熊', diff: 5, dexReward: 4, penalty: 0.17, reward: { item: 'gall_bear',  label: '熊胆', desc: '服用内力上限+4。', boost: { maxNeili: 4 } } },
            { name: '老虎', diff: 6, dexReward: 8, penalty: 0.13, reward: { item: 'gall_tiger', label: '虎胆', desc: '服用内力上限+8。', boost: { maxNeili: 8 } } },
        ];

        const calcChance = (p) => Math.min(0.95, Math.max(0.05, 0.85 - p.diff * 0.12 + skill * 0.004 - (p.penalty || 0)));

        this.addMessage(`${npc.npcName}：「今天想打点什么？」`, 'narrator');

        const unlockLevel = this.player._huntUnlockLevel || 0;
        const choices = preyList.map((p, i) => {
            if (i > unlockLevel) return null;
            const chance = Math.round(calcChance(p) * 100);
            return {
                text: `${p.name}（${chance}%）`,
                action: () => this._doHunt(venue, npc, p, chance, i),
            };
        }).filter(Boolean);
        choices.push({ text: '算了，不打了', action: () => { this.clearChoices(); setTimeout(() => this.enterVenueInner(venue), 100); } });
        this.showChoices(choices);
    }

    _doHunt(venue, npc, prey, chancePct, preyIndex) {
        this.clearChoices();
        const success = Math.random() < (chancePct / 100);

        this.addMessage(`${npc.npcName}带你进山打猎。林中走了一阵，发现了一只${prey.name}！`, 'narrator');
        this.advanceTime();

        if (success) {
            this.addMessage(`你张弓搭箭，一箭命中！${npc.npcName}竖起大拇指：「好箭法！」`, 'event');
            const reward = prey.reward;
            this.player.items.push({ ...getItem(reward.item) });
            this.addMessage(`获得 ${reward.label}`, 'system');
            if (prey.diff >= 1) {
                const leatherQty = Math.floor(prey.diff / 2) + 1;
                for (let i = 0; i < leatherQty; i++) this.player.items.push({ ...getItem('leather_raw') });
                this.addMessage(`获得兽皮×${leatherQty}`, 'system');
            }

            if (reward.boost) {
                if (reward.boost.maxNeili) {
                    this.player.maxNeili += reward.boost.maxNeili;
                    this.player.neili = this.player.maxNeili;
                    this.addMessage(`内力上限 +${reward.boost.maxNeili}（当前 ${this.player.maxNeili}）`, 'system');
                }
            }

            this.player.attrs.dexterity += prey.dexReward;
            this.addMessage(`灵巧 +${prey.dexReward}（当前 ${this.player.attrs.dexterity}）`, 'system');

            this.player._huntCount = (this.player._huntCount || 0) + 1;
            if (preyIndex != null && preyIndex === (this.player._huntUnlockLevel || 0)) {
                this.player._huntUnlockLevel = preyIndex + 1;
                if (preyIndex < 6) {
                    this.addMessage(`「好手艺！」${npc.npcName}赞道，「下次可以试试更猛的猎物了。」`, 'event');
                }
            }
        } else {
            if (prey.diff >= 4) {
                this.addMessage(`那${prey.name}发现了你们，低吼着作势欲扑。你和${npc.npcName}对视一眼——「跑！」`, 'narrator');
                this.addMessage('你们撒腿就跑，总算逃过一劫。打猎失败。', 'danger');
            } else {
                this.addMessage(`你张弓搭箭，谁知那${prey.name}突然警觉，一溜烟窜进了草丛。`, 'narrator');
                this.addMessage('你叹了口气——好猎物不好打。打猎失败。', 'info');
            }
        }

        this.updateStatsBar();
        setTimeout(() => this.enterVenueInner(venue), 600);
    }

    /* ─── 樵夫系统 ─── */

    chopWithWoodcutter(venue, npc) {
        this.clearChoices();
        this.player._chopCount = (this.player._chopCount || 0) + 1;

        this.addMessage(`你接过${npc.npcName}的斧头，帮他劈柴。`, 'narrator');
        this.addMessage('你一斧一斧地劈着，虽然累，但感觉筋骨舒展了不少。', 'narrator');
        this.addMessage('不知不觉，半天过去了。', 'narrator');
        this.advanceTime();
        this.player.items.push({ ...getItem('wood_hard') });
        this.addMessage('获得硬木×1', 'system');
        this.player.items.push({ ...getItem('firewood') });
        this.player.items.push({ ...getItem('firewood') });
        this.addMessage('获得柴火×2', 'system');
        const vid = this.player.locationId;
        const chopRoot = this.player._villageRoot[vid] || 0;
        if (chopRoot < 5) {
            this.player.attrs.root += 1;
            this.player._villageRoot[vid] = chopRoot + 1;
            this.player.exp += 3;
            this.addMessage(`根骨 +1（当前 ${this.player.attrs.root}），经验 +3`, 'system');
        } else {
            this.player.exp += 1;
            this.addMessage('筋骨已到瓶颈，再无寸进。只得了些许经验。', 'narrator');
        }

        const chopCount = this.player._chopCount;
        const shadowRep = this.player.shadowRep || 0;

        // 第3次且罪恶值为0：送柴刀
        if (chopCount === 3 && shadowRep === 0) {
            this.addMessage(`${npc.npcName}擦了把汗，看了看你：「你小子老实本分，我这有把柴刀你用得上，拿去吧。」`, 'narrator');
            this.player.items.push({ ...getItem('knife_wood') });
            this.addMessage('获得了柴刀！', 'event');
        }

        // 第5次且罪恶值为0：教蓝色刀法
        if (chopCount === 5 && shadowRep === 0) {
            if (!this.player.externalSkills.some(s => s.id === 'caidao')) {
                this.addMessage(`${npc.npcName}满意地点点头：「你人不错，又肯下力气。我这几手砍柴的功夫，你想学吗？」`, 'narrator');
                const art = getMartialArt('caidao');
                if (art) {
                    const skillObj = { id: 'caidao', name: art.name, desc: art.desc, type: art.type, quality: art.quality, level: 1, maxLevel: 4, element: art.element, rootReq: art.rootReq, agileReq: art.agileReq, intelReq: art.intelReq };
                    this.player.externalSkills.push(skillObj);
                    this.addMessage(`你领悟了「${art.name}」！`, 'event');
                }
            } else {
                this.addMessage(`你早已学会了${npc.npcName}的刀法，再无所获。`, 'info');
            }
        }

        // 5次后无额外奖励
        if (chopCount > 5) {
            this.addMessage(`你早已帮了足够多的忙，${npc.npcName}拍了拍你的肩：「好小子，够意思！」`, 'narrator');
        }

        this.updateStatsBar();
        setTimeout(() => this.enterVenueInner(venue), 600);
    }

    /* ─── 声望系统 ─── */

    getLocRepTier(locId) {
        const loc = getAllLocations().find(l => l.id === locId);
        if (!loc) return 'mid';
        const diff = this.player.reputation - loc.repThreshold;
        if (diff >= 5) return 'high';
        if (diff >= 0) return 'mid';
        return 'low';
    }

    chiefAction(venue, npc) {
        this.clearChoices();
        const loc = this.currentLocation;
        const tier = npc._sonBeaten ? 'mid' : this.getLocRepTier(loc.id);
        if (tier === 'low') {
            const repNeed = (loc.repThreshold || 0) - this.player.reputation;
            const hints = [
                `你不过是个初出茅庐的小辈，${npc.npcName}根本懒得正眼看你。`,
                `以你现在的江湖地位，${npc.npcName}连话都懒得跟你说半句。`,
                `${npc.npcName}见你资历尚浅，根本没把你放在眼里。`,
            ];
            if (repNeed > 0) {
                hints.push(`你的名声还不够响亮，想在${loc.name}说话，至少还需要${repNeed}点声望。`);
            }
            const hint = hints[Math.floor(Math.random() * hints.length)];
            const insult = [
                `「哪来的野狗，也敢进我${npc.npcName}家的门？滚！」`,
                `「呵呵，我当是谁呢，原来是个无名小卒。趁我没发火，自己滚出去。」`,
                `「你算什么东西？也配跟我说话？滚远点！」`,
                `「不知天高地厚的小子，这地方不欢迎你，滚！」`,
                `「我呸！什么阿猫阿狗都敢来敲门了。滚！」`,
            ][Math.floor(Math.random() * 5)];
            this.showMessageSequence([
                { text: hint, type: 'info' },
                { text: `${npc.npcName}满脸不屑地打量着你。`, type: 'narrator' },
                { text: npc.npcName + '：' + insult, type: 'html' },
            ], () => {
                const exitVenue = () => this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices();
                this.showChoices([
                    { text: '忍气吞声', action: () => { this.addMessage('你咬了咬牙没有发作，转身默默离开。', 'narrator'); setTimeout(() => exitVenue(), 300); } },
                    { text: '一顿毒打', action: () => this.confrontChief(venue, npc, 'beat') },
                    { text: '痛下杀手', action: () => this.confrontChief(venue, npc, 'kill') },
                    { text: '离开', action: () => exitVenue() },
                ]);
            });
        } else {
            if (!npc._greeted) {
                const greeting = tier === 'high'
                    ? [`「哎呀呀，什么风把您吹来了？快请进快请进！」`, `「您能来我们这小地方，真是蓬荜生辉啊！」`, `「您的大名如雷贯耳，快请上座！」`]
                    : [`「原来是远道而来的客人，请坐请坐。」`, `「不知驾临寒舍，有何贵干？」`, `「稀客稀客，请进来说话。」`];
                this.addMessage(npc.npcName + '：' + greeting[Math.floor(Math.random() * greeting.length)], 'narrator');
                npc._greeted = true;
            }
            const choices = [
            { text: '闲谈', action: () => this.chatWithNpc(venue, npc) },
            { text: '购买', action: () => this.buyFromNpc(venue, npc) },
            { text: '出售', action: () => this.sellToNpc(venue, npc) },
            { text: '打探消息', action: () => this.chiefIntel(venue, npc) },
        ];
            if (!npc.civilian && npc.combatPower > 0 && !npc._defeated) {
                choices.push({ text: '邀请切磋', action: () => this.duelWithNpc(venue, npc, { label: '邀请切磋' }) });
            }
            choices.push({ text: '不义之举', action: () => this.showUnrighteousActs(venue, npc) });
            choices.push({ text: '离开', action: () => this.enterVenue(venue) });
            this.showChoices(choices);
        }
    }

    chiefIntel(venue, npc) {
        this.clearChoices();
        this.addMessage(`你向${npc.npcName}打听消息。`, 'narrator');
        this.showChoices([
            { text: '打听师弟沈清寒', action: () => this.askAboutDisciple(venue, npc) },
            { text: '打听女人', action: () => this.chiefIntelBeauties(venue, npc) },
            { text: '算了', action: () => this.chiefAction(venue, npc) },
        ]);
    }

    chiefIntelBeauties(venue, npc, skipIntro = false) {
        this.clearChoices();
        const loc = this.currentLocation;
        const beauties = this.beautyMap[loc.id] || [];
        const available = beauties.filter(b => !this.killedNpcs.has('beauty_' + b.id));
        if (available.length === 0) {
            this.addMessage(`${npc.npcName}想了想：「咱们村……还真没什么值得一提的女子。」`, 'narrator');
            this.showChoices([{ text: '返回', action: () => this.chiefIntel(venue, npc) }]);
            return;
        }
        const showList = () => {
            const choices = available.map(b => ({
                text: b.name,
                action: () => {
                    this.clearChoices();
                    const where = b._currentVenueName || '街上';
                    const who = ['有人说', '听隔壁大妈讲', '据说', '好像是', '前两日还见她在'][Math.floor(Math.random() * 5)];
                    const action = ['散步', '小酌', '买酒', '闲坐', '纳凉', '赏景', '等人'][Math.floor(Math.random() * 7)];
                    this.addMessage(`${npc.npcName}凑近了些，压低声音：「${who}，她这会儿在${where}${action}呢。」`, 'narrator');
                    this.showChoices([{ text: '再问别的', action: () => this.chiefIntelBeauties(venue, npc, true) }, { text: '多谢', action: () => this.chiefAction(venue, npc) }]);
                },
            }));
            choices.push({ text: '算了', action: () => this.chiefAction(venue, npc) });
            this.showChoices(choices);
        };
        if (skipIntro) {
            showList();
        } else {
            this.showMessageSequence([
                { text: `你向${npc.npcName}打听村中女子的消息。`, type: 'narrator' },
                { text: `${npc.npcName}捋了捋胡须：「咱们村共有${available.length}位待字闺中的姑娘，你问的是哪一位？」`, type: 'narrator' },
            ], showList);
        }
    }

    askAboutDisciple(venue, npc) {
        this.clearChoices();
        const loc = this.currentLocation;
        if (this.player.mainQuest === 0 && loc.id === this.player.startingVillage) {
            const hasLandlord = loc.venues.some(v => v.name.endsWith('府'));
            if (hasLandlord) {
                this.player.mainQuest = 1;
                if (!this.player.completedQuests) this.player.completedQuests = {};
                this.player.completedQuests.main_1 = true;
                this.showMessageSequence([
                    { text: `你提起「沈清寒」这个名字，${npc.npcName}皱眉思索了片刻。`, type: 'narrator' },
                    { text: `${npc.npcName}：「沈清寒……恕老夫孤陋寡闻，不曾听过这个名字。」`, type: 'narrator' },
                    { text: `${npc.npcName}：「你去村东头的${loc.venues.find(v => v.name.endsWith('府')).name}问问吧，那老东西见多识广，兴许知道些什么。」`, type: 'narrator' },
                ], () => this.showChoices([{ text: '多谢', action: () => this.chiefAction(venue, npc) }]));
            } else {
                const region = getRegion(loc.id);
                const cityLocs = getAllLocations().filter(l => l.id !== loc.id && getRegion(l.id) === region && !l.nearestCity);
                const target = cityLocs.length > 0 ? cityLocs[Math.floor(Math.random() * cityLocs.length)] : null;
                this.player.gold += 50;
                this.player.mainQuest = 2;
                if (!this.player.completedQuests) this.player.completedQuests = {};
                this.player.completedQuests.main_1 = true;
                this.player.completedQuests.main_2 = true;
                this.showMessageSequence([
                    { text: `你提起「沈清寒」这个名字，${npc.npcName}叹了口气。`, type: 'narrator' },
                    { text: `${npc.npcName}：「沈清寒……老夫知道一些，但此中干系重大，不是你能掺和的。」`, type: 'narrator' },
                    { text: `${npc.npcName}：「这样吧，你拿些盘缠，去${target ? target.name : '城里'}碰碰运气。记住，别跟任何人提起是我说的。」`, type: 'narrator' },
                    { text: `获得了 50 两银子。`, type: 'system' },
                ], () => this.showChoices([{ text: '多谢', action: () => this.chiefAction(venue, npc) }]));
            }
            return;
        }
        const region = getRegion(loc.id);
        const cityLocs = getAllLocations().filter(l => l.id !== loc.id && getRegion(l.id) === region && !l.nearestCity);
        const target = cityLocs.length > 0 ? cityLocs[Math.floor(Math.random() * cityLocs.length)] : null;
        if (target) {
            this.showMessageSequence([
                { text: `你提起「沈清寒」这个名字，${npc.npcName}皱眉思索了片刻。`, type: 'narrator' },
                { text: `${npc.npcName}：「沈清寒……这个名字好像在哪听过，但老夫孤陋寡闻，实在记不起来了。」`, type: 'narrator' },
                { text: `${npc.npcName}：「少侠不妨去${target.name}看看，城里人多口杂，兴许能打听到什么。」`, type: 'narrator' },
            ], () => this.showChoices([{ text: '多谢', action: () => this.chiefAction(venue, npc) }]));
        } else {
            this.showMessageSequence([
                { text: `你提起「沈清寒」这个名字，${npc.npcName}摇了摇头。`, type: 'narrator' },
                { text: `${npc.npcName}：「没听说过这个人，少侠去别处打听打听吧。」`, type: 'narrator' },
            ], () => this.showChoices([{ text: '多谢', action: () => this.chiefAction(venue, npc) }]));
        }
    }

    confrontChief(venue, npc, type) {
        this.clearChoices();
        if (type === 'beat') {
            this.confrontChiefSon(venue, npc);
            return;
        }
        const repCost = 10;
        this.player.reputation -= repCost;
        this.showMessageSequence([
            { text: `声望 -${repCost}（当前 ${this.player.reputation}）`, type: 'system' },
            { text: `你拔出兵器，眼中杀机毕露，直取${npc.npcName}！`, type: 'danger' },
            { text: `${npc.npcName}大声呼救：「来人啊！杀人啦！」`, type: 'narrator' },
        ], () => setTimeout(() => this.arrestScene(venue, npc, 'kill'), 500));
    }

    confrontChiefSon(venue, chief) {
        const loc = this.currentLocation;
        if (!chief._sonName) {
            const familyName = chief.npcName.charAt(0);
            const sonNames = ['大牛', '二虎', '铁柱', '石头', '大壮'];
            chief._sonName = familyName + sonNames[Math.floor(Math.random() * sonNames.length)];
        }
        const sonName = chief._sonName;
        const chiefPower = chief.combatPower || 20;
        const sonPower = Math.max(25, chiefPower + 8);

        const fightIntro = [
            { text: `你一拳砸向${chief.npcName}，${chief.npcName}身子一缩，大吼一声：「儿子！有人捣乱！」`, type: 'narrator' },
            { text: `只听一声怒吼，一个壮硕的年轻人从里屋冲了出来——正是${chief.npcName}的儿子${sonName}！`, type: 'narrator' },
            { text: `${sonName}挡在父亲面前，怒目圆睁：「敢动我爹？先过我这一关！」`, type: 'event' },
        ];
        this.showMessageSequence(fightIntro, () => this.confrontChiefSonAfterIntro(venue, chief, sonName, sonPower, loc));
    }

    confrontChiefSonAfterIntro(venue, chief, sonName, sonPower, loc) {
        const ratio = sonPower / Math.max(1, this.getPlayerCombatPower('full'));

        const enemy = generateChiefSonEnemy(sonName, sonPower);
        this.startBattle(enemy,
            () => {
                chief._sonBeaten = true;
                let repGain = 1;
                if (ratio <= 0.3) repGain = 3;
                else if (ratio <= 0.6) repGain = 2;
                this.player.reputation += repGain;
                const reps = {
                    3: { msg: `你身形一闪，${sonName}还没反应过来，已被你击倒在地！`, chief: `${chief.npcName}吓得面如土色，连连作揖：「少侠神功盖世！」` },
                    2: { msg: `你一记漂亮的扫堂腿将${sonName}摔倒在地！`, chief: `${chief.npcName}在一旁看得目瞪口呆，连忙上前拱手：「少侠好身手！」` },
                    1: { msg: `你苦战良久，终于找到破绽，将${sonName}击退！`, chief: `${chief.npcName}面色难看，却也不得不拱手：「少侠……好功夫。」` },
                }[repGain];
                this.showMessageSequence([
                    { text: reps.msg, type: 'event' },
                    { text: `${sonName}趴在地上，喘着粗气。`, type: 'narrator' },
                    { text: reps.chief, type: 'narrator' },
                    { text: '见你有如此身手，他再不敢小看你。', type: 'narrator' },
                    { text: `声望 +${repGain}（当前 ${this.player.reputation}）`, type: 'system' },
                ], () => setTimeout(() => this.chiefAction(venue, chief), 300));
            },
            () => this.gameOver('你受伤过重，不治身亡'),
            () => {
                document.getElementById('log').innerHTML = '';
                this.addMessage('你无心恋战，虚晃一招抽身而退。', 'narrator');
                this.addMessage(`${sonName}在你身后叫道：「有种别跑！」`, 'narrator');
                this.showChoices([
                    { text: '返回', action: () => this.enterVenue(venue) },
                ]);
            }
        );
    }

    arrestScene(venue, npc, crimeType) {
        this.clearChoices();
        const loc = this.currentLocation;
        const guardPower = loc.guardianPower || 50;
        this.showMessageSequence([
            { text: `门外传来一阵急促的脚步声——村中的护卫闻讯赶来！`, type: 'narrator' },
            { text: `为首的大汉挡在你面前，怒目圆睁：「大胆狂徒，敢在${loc.name}撒野！」`, type: 'narrator' },
        ], () => {
            this.showChoices([
                { text: '硬刚', action: () => {
                    this.clearChoices();
                    const enemy = createGuardEnemy('护卫', guardPower);
                    this.startBattle(enemy,
                        () => {
                            this.player.reputation -= 2;
                            this.player.villageBlacklist[loc.id] = this.player.day + 30;
                            this.updateStatsBar();
                            if (this.player.reputation <= -40) { this.gameOver(`你在${loc.name}恶行败露，声名狼藉，再无容身之处……`); return; }
                            const escapeDest = this.findRegionEscape(loc.id);
                            this.showMessageSequence([
                                { text: '你一声长啸，掌风呼啸而出，将护卫击退数步！', type: 'event' },
                                { text: '趁众人惊愕之际，你纵身一跃，逃出了村子。', type: 'narrator' },
                                { text: `声望 -2（当前 ${this.player.reputation}）`, type: 'system' },
                                ...(escapeDest ? [{ text: `你不敢停留，一口气逃到了附近的${escapeDest.name}。`, type: 'narrator' }] : []),
                            ], () => {
                                if (escapeDest) {
                                    this.showChoices([{ text: '继续旅程', action: () => {
                                        const days = getTravelDays(loc.id, escapeDest.id);
                                        const cost = days * 2;
                                        if (this.player.gold >= cost) {
                                            this.player.gold -= cost;
                                            this.addMessage(`路途花费了 ${cost} 两银子。`, 'system');
                                        } else {
                                            this.player.hp = Math.max(1, this.player.hp - cost);
                                            this.addMessage(`你身无分文，一路风餐露宿，损失了 ${cost} 点气血。`, 'danger');
                                        }
                                        this.updateStatsBar();
                                        this.enterLocation(escapeDest.id);
                                    } }]);
                                } else {
                                    this.showChoices([{ text: '睡到明天', action: () => this.sleepToTomorrow(true) }]);
                                }
                            });
                        },
                        () => this.gameOver('你受伤过重，不治身亡')
                    );
                } },
                { text: '逃跑', action: () => {
                    this.clearChoices();
                    const goldLoss = Math.min(this.player.gold, 5 + Math.floor(Math.random() * 15));
                    this.player.gold = Math.max(0, this.player.gold - goldLoss);
                    this.player.reputation -= 2;
                    this.player.villageBlacklist[loc.id] = this.player.day + 30;
                    this.updateStatsBar();
                    if (this.player.reputation <= -40) { this.gameOver(`你在${loc.name}犯下的事已经传遍四方，江湖再无容身之处……`); return; }
                    const escapeDest2 = this.findRegionEscape(loc.id);
                    this.showMessageSequence([
                        { text: `你趁乱夺门而出，但慌乱中丢了 ${goldLoss} 两银子。`, type: 'narrator' },
                        { text: `声望 -2（当前 ${this.player.reputation}）`, type: 'system' },
                        { text: '你一口气跑出数里地，回头确认无人追来才停下。', type: 'narrator' },
                        ...(escapeDest2 ? [{ text: `你不敢停留，一路逃到了附近的${escapeDest2.name}。`, type: 'narrator' }] : []),
                    ], () => {
                        if (escapeDest2) {
                            this.showChoices([{ text: '继续旅程', action: () => {
                                const days = getTravelDays(loc.id, escapeDest2.id);
                                const cost = days * 2;
                                if (this.player.gold >= cost) {
                                    this.player.gold -= cost;
                                    this.addMessage(`路途花费了 ${cost} 两银子。`, 'system');
                                } else {
                                    this.player.hp = Math.max(1, this.player.hp - cost);
                                    this.addMessage(`你身无分文，一路风餐露宿，损失了 ${cost} 点气血。`, 'danger');
                                }
                                this.updateStatsBar();
                                this.enterLocation(escapeDest2.id);
                            } }]);
                        } else {
                            this.showChoices([{ text: '睡到明天', action: () => this.sleepToTomorrow(true) }]);
                        }
                    });
                } },
            ]);
        });
    }

    findRegionEscape(fromId) {
        const region = getRegion(fromId);
        if (!region) return null;
        const regionLocs = getAllLocations().filter(l => l.id !== fromId && getRegion(l.id) === region);
        if (regionLocs.length === 0) return null;
        // prefer cities over villages
        const cities = regionLocs.filter(l => !l.nearestCity);
        if (cities.length > 0) return cities[Math.floor(Math.random() * cities.length)];
        return regionLocs[Math.floor(Math.random() * regionLocs.length)];
    }

    duelWithNpc(venue, npc, options = {}) {
        const { powerMult = 1, initRepCost = 0, noCombatRepChange = false, winGetAllItems = false, label = '邀请切磋' } = options;
        this.clearChoices();

        if (initRepCost > 0) {
            this.player.reputation -= initRepCost;
            this.addMessage(`声望 -${initRepCost}（当前 ${this.player.reputation}）`, 'system');
            if (this.player.reputation <= -40) {
                this.updateStatsBar();
                this.gameOver(`你名声已臭，连对${npc.npcName}下黑手的资格都没有了……`);
                return;
            }
        }

        const enemy = generateNpcEnemy(npc);
        if (powerMult !== 1) {
            enemy.hp = Math.max(5, Math.floor(enemy.hp * powerMult));
            enemy.maxHp = enemy.hp;
        }

        const isSneak = label === '偷袭' || label === '暗杀';
        if (isSneak) {
            this.addMessage(`你趁${npc.npcName}不备猛然出手！`, 'event');
        } else {
            const introFlavors = [
                `听闻${npc.npcName}身手不凡，你向${npc.npcName}一拱手，朗声道：「请赐教！」`,
                `你来到${npc.npcName}面前，抱拳道：「久仰阁下威名，想切磋一二，不知可否赏脸？」`,
            ];
            const flavor = introFlavors[Math.floor(Math.random() * introFlavors.length)];
            this.addMessage(flavor, 'narrator');
            this.addMessage(`${npc.npcName}微微点头，沉声道：「既然阁下有此雅兴，那便领教几招。」`, 'narrator');
        }

        this.startBattle(enemy,
            () => {
                this.addMessage(`你将${npc.npcName}击倒在地！`, 'event');
                if (label === '暗杀') {
                    npc._killed = true;
                    this.killedNpcs.add(this.currentLocation.id + ':' + venue.name + ':' + npc.npcName);
                    this.addMessage(`${npc.npcName}缓缓倒下，再无声息……`, 'danger');
                    this.player._assassinationCount = (this.player._assassinationCount || 0) + 1;
                    this._adjEvil(5, '暗杀');
                    this._adjWorldHelp(-3, '暗杀');
                }
                if (winGetAllItems) {
                    const loot = [...npc.items];
                    loot.forEach(it => { const cloned = { ...it }; if (!this.autoEquip(cloned)) this.player.items.push(cloned); });
                    npc.items = [];
                    this.addMessage(`你从${npc.npcName}身上搜刮了所有物品！`, 'event');
                }
                if (!noCombatRepChange) this.awardDuelRep(venue, npc);
                this.tryLearnMartialArt(npc);
                this.updateStatsBar();
                setTimeout(() => npc._killed ? this.enterVenue(venue) : this.interactNpc(venue, npc), 500);
            },
            () => {
                this.player.hp = 1;
                this.addMessage('你力不能敌，败下阵来，捡回一条命。', 'danger');
                this.updateStatsBar();
                setTimeout(() => this.interactNpc(venue, npc), 400);
            }
        );
    }

    /* ─── 小树林偷袭 ─── */

    forestAmbush(venue, npc) {
        this.clearChoices();
        this.player.reputation -= 1;
        this.player.shadowRep += 1;
        this.addMessage(`你趁${npc.npcName}不备猛然出手！偷袭扣除了 1 点声望。`, 'system');
        this.updateStatsBar();
        if (this.player.reputation <= -40) { this.gameOver(`你名声已臭，连对${npc.npcName}下黑手的资格都没有了……`); return; }

        const enemy = generateNpcEnemy(npc);
        enemy.hp = Math.max(5, Math.floor(enemy.hp * 0.8));
        enemy.maxHp = enemy.hp;

        this.startBattle(enemy,
            () => {
                this.addMessage(`你击倒了${npc.npcName}！`, 'event');
                this.showLootChoices(venue, npc);
            },
            () => this.gameOver('你受伤过重，不治身亡')
        );
    }

    showLootChoices(venue, npc) {
        this.clearChoices();
        const lootable = npc.items.filter(it => it.stock > 0);
        if (lootable.length === 0) {
            this.addMessage(`${npc.npcName}身上没什么可拿的。`, 'narrator');
            setTimeout(() => this.enterVenueInner(venue), 400);
            return;
        }
        this.addMessage(`你从${npc.npcName}身上搜出了一些东西：`, 'narrator');
        const choices = lootable.map(item => {
            const repCost = Math.max(1, Math.floor(item.value / 5));
            return {
                text: `拿走 ${item.name}（价值 ${item.value}两 · 扣声望 ${repCost}）`,
                action: () => this.takeLoot(venue, npc, item),
            };
        });
        choices.push({ text: '收手离开', action: () => {
            this.addMessage('你拍了拍身上的灰，转身离开。', 'narrator');
            setTimeout(() => this.enterVenueInner(venue), 400);
        }});
        this.showChoices(choices);
    }

    takeLoot(venue, npc, item) {
        this.clearChoices();
        const repCost = Math.max(1, Math.floor(item.value / 5));
        this.player.reputation -= repCost;
        this.player.shadowRep += 1;
        this.addMessage(`你拿走了${item.name}，声望 -${repCost}（当前 ${this.player.reputation}）`, 'system');
        const taken = { ...item };
        if (!this.autoEquip(taken)) this.player.items.push(taken);
        item.stock--;
        this.updateStatsBar();
        this.showLootChoices(venue, npc);
    }

    awardDuelRep(venue, npc) {
        if (this.killedNpcs.has(npc.npcName)) return;
        npc._timesDefeated = (npc._timesDefeated || 0) + 1;
        const d = npc._timesDefeated;
        const mult = venue.name.includes('道场') ? 3 : venue.name.includes('武馆') ? 2 : 1;
        const gain = Math.max(0, mult - Math.floor((d - 1) / 3) * mult);
        if (gain > 0) {
            this.player.reputation += gain;
            this.player.exp += 10 * mult;
            this.addMessage(`声望 +${gain}，经验 +${10 * mult}`, 'system');
            this.checkLevelUp();
        } else {
            this.addMessage(`你已熟悉${npc.npcName}的路数，再无可学之处。`, 'info');
            this.player.exp += 2;
            this.addMessage(`经验 +2`, 'system');
        }
        if (venue.name.includes('武馆') || venue.name.includes('道场')) {
            // repeatable: don't set _defeated
        } else {
            npc._defeated = true;
        }
    }

    tryLearnMartialArt(npc) {
        if (!npc.martialArt) return;
        const art = getMartialArt(npc.martialArt);
        if (!art) return;
        if (this.player.externalSkills.some(s => s.id === npc.martialArt)) {
            this.addMessage(`${npc.npcName}欲将${art.name}传授于你，但你早已习得此功。`, 'info');
            return;
        }
        const luck = this.player.attrs.luck;
        const baseChance = 80;
        let chance;
        if (luck >= art.luckReq) {
            chance = Math.min(100, baseChance + (luck - art.luckReq) * 2);
        } else {
            chance = baseChance * (luck / art.luckReq);
        }
        chance = Math.max(0, Math.min(100, chance));
        if (Math.random() * 100 < chance) {
            const luckLabel = this.player.attrs.luck >= art.luckReq ? '福缘深厚' : '勉强够格';
            this.addMessage(`你${luckLabel}（福缘 ${this.player.attrs.luck}），${npc.npcName}对你另眼相看！`, 'event');
            const qData = SKILL_QUALITIES[art.quality] || SKILL_QUALITIES.white;
            this.player.externalSkills.push({ id: npc.martialArt, name: art.name, desc: art.desc, type: art.type, quality: art.quality, level: 1, maxLevel: qData.maxLevel, element: art.element, rootReq: art.rootReq, agileReq: art.agileReq, intelReq: art.intelReq });
            this.addMessage(`${npc.npcName}将${art.name}倾囊相授！你领悟了「${art.name}」的奥义！`, 'event');
            this.player.exp += 20;
            this.checkLevelUp();
        } else {
            this.addMessage(`${npc.npcName}本想将${art.name}传授于你，可惜你福缘不够，未能领悟。`, 'info');
        }
    }

    /* ─── 战斗系统 ─── */

    startBattle(enemy, onWin, onLose, onFlee) {
        const ps = this.player.attrs.dexterity || 10;
        const es = Math.max(1, enemy.dexterity || Math.floor((enemy.combatPower || 15) / 3));
        this.battleState = {
            enemy,
            log: [],
            onWin,
            onLose: onLose || (() => {}),
            onFlee: onFlee || (() => {
                document.getElementById('log').innerHTML = '';
                this.addMessage('你灰溜溜地逃走了。', 'narrator');
                this.showOutdoorChoices();
            }),
            playerSpeed: ps,
            enemySpeed: es,
            playerMaxActions: Math.max(1, Math.min(4, Math.floor(ps / es))),
            enemyMaxActions: Math.max(1, Math.min(4, Math.floor(es / ps))),
            actionsUsed: 0,
            isPlayerTurn: false,
        };
        this.clearChoices();
        document.getElementById('log').innerHTML = '';
        this.renderBattleHUD();

        const bs = this.battleState;
        let playerFirst;
        if (bs.playerSpeed > bs.enemySpeed) playerFirst = true;
        else if (bs.playerSpeed < bs.enemySpeed) playerFirst = false;
        else playerFirst = Math.random() < 0.5;

        bs.isPlayerTurn = playerFirst;
        const msg = playerFirst ? `你身法更快，率先抢攻！` : `${bs.enemy.name}身法更快，抢先出手！`;
        bs.log.push({ text: msg, cls: 'battle-log-info' });
        this.renderBattleHUD();
        this.showChoices([
            { text: '继续', action: () => this._startTurn() },
        ]);
    }

    _startTurn() {
        const bs = this.battleState;
        bs.actionsUsed = 0;
        this.renderBattleHUD();
        if (bs.isPlayerTurn) {
            this.showBattleActions();
        } else {
            this.enemyTurn();
        }
    }

    _advanceTurn() {
        const bs = this.battleState;
        const maxAct = bs.isPlayerTurn ? bs.playerMaxActions : bs.enemyMaxActions;
        bs.actionsUsed++;
        this.renderBattleHUD();

        if (bs.isPlayerTurn) {
            const e = bs.enemy;
            if (e.hp <= 0) {
                this.showChoices([
                    { text: '继续', action: () => {
                        this.resolveBattleVictory();
                    } },
                ]);
                return;
            }
            if (bs.actionsUsed >= maxAct) {
                this.showChoices([
                    { text: '继续', action: () => {
                        bs.isPlayerTurn = false;
                        this._startTurn();
                    } },
                ]);
                return;
            }
            this.showBattleActions();
        } else {
            if (bs.actionsUsed >= maxAct) {
                bs.isPlayerTurn = true;
                this._startTurn();
            } else {
                this.enemyTurn();
            }
        }
    }

    renderBattleHUD() {
        const e = this.battleState.enemy;
        const epct = Math.max(0, Math.min(100, (e.hp / e.maxHp) * 100));
        const ppct = Math.max(0, Math.min(100, (this.player.hp / this.player.maxHp) * 100));
        const npct = this.player.maxNeili > 0 ? Math.max(0, Math.min(100, (this.player.neili / this.player.maxNeili) * 100)) : 0;
        const hpClass = ppct < 30 ? 'battle-hp-fill-low' : 'battle-hp-fill';

        let html = '<div id="battle-hud">';
        html += '<div class="battle-section">';
        html += `<div class="battle-names"><span class="battle-name battle-name-enemy">${e.name}</span></div>`;
        html += '<div class="battle-bar-row">';
        html += `<div class="battle-bar-track"><div class="battle-bar-fill battle-enemy-hp-fill" style="width:${epct}%"></div></div>`;
        html += `<span class="battle-bar-text">${e.hp}/${e.maxHp}</span>`;
        html += '</div></div>';

        html += '<div class="battle-section">';
        html += '<div class="battle-names"><span class="battle-name">你</span></div>';
        html += '<div class="battle-bar-row">';
        html += '<span class="battle-bar-label">HP</span>';
        html += `<div class="battle-bar-track"><div class="battle-bar-fill ${hpClass}" style="width:${ppct}%"></div></div>`;
        html += `<span class="battle-bar-text">${this.player.hp}/${this.player.maxHp}</span>`;
        html += '</div>';
        html += '<div class="battle-bar-row">';
        html += '<span class="battle-bar-label">内力</span>';
        html += `<div class="battle-bar-track"><div class="battle-bar-fill battle-mp-fill" style="width:${npct}%"></div></div>`;
        html += `<span class="battle-bar-text">${this.player.neili}/${this.player.maxNeili}</span>`;
        html += '</div>';
        html += '<div class="battle-bar-row battle-action-row">';
        html += '<span class="battle-bar-label">行动</span>';
        const bs2 = this.battleState;
        const totalAct = bs2 ? (bs2.isPlayerTurn ? bs2.playerMaxActions : bs2.enemyMaxActions) : 4;
        const used = bs2 ? bs2.actionsUsed : 0;
        for (let i = 0; i < 4; i++) {
            if (i >= totalAct) {
                html += '<span class="action-dot action-dot-locked">●</span>';
            } else if (i < used) {
                html += '<span class="action-dot action-dot-empty">●</span>';
            } else {
                html += '<span class="action-dot action-dot-ready">●</span>';
            }
        }
        html += '</div></div></div>';

        const logLines = this.battleState.log.slice(-3);
        html += '<div id="battle-log">';
        for (const l of logLines) {
            html += `<div class="battle-log-entry ${l.cls || ''}">${l.text}</div>`;
        }
        html += '</div>';

        document.getElementById('log').innerHTML = html;
    }

    showBattleActions() {
        this.renderBattleHUD();
        const area = document.getElementById('choice-area');
        area.innerHTML = '';
        area.classList.add('battle-choices');
        const items = [
            { text: '普通攻击', action: () => this.battleNormalAttack() },
            { text: '外功招式', action: () => this.showBattleSkillMenu() },
            { text: '使用物品', action: () => this.showBattleItemMenu() },
            { text: '逃跑', action: () => this.attemptFlee() },
        ];
        for (const c of items) {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = c.text;
            btn.onclick = () => { area.classList.remove('battle-choices'); if (c.action) c.action(); };
            area.appendChild(btn);
        }
        document.getElementById('main-area').scrollTop = document.getElementById('main-area').scrollHeight;
    }

    battleNormalAttack() {
        const basePower = Math.floor(this.player.attrs.root * 0.5 + this.player.attrs.dexterity * 0.5);
        let weaponPower = 0;
        let descs = ['直拳', '横扫', '飞踢', '肘击', '膝撞', '劈掌', '勾拳', '侧踹'];
        for (const s of ['rightHand', 'leftHand']) {
            const w = this.player.equipment[s];
            if (w && w.attackDescs) {
                weaponPower += w.value;
                if (s === 'rightHand') descs = w.attackDescs;
            }
        }
        const dmg = Math.max(1, Math.floor((basePower + weaponPower) * (0.3 + Math.random() * 0.6)));
        const e = this.battleState.enemy;
        e.hp -= dmg;
        this.battleState.log.push({ text: `你一记${descs[Math.floor(Math.random() * descs.length)]}，造成 <b>${dmg}</b> 点伤害！`, cls: 'battle-log-hit' });
        this._advanceTurn();
    }

    showBattleSkillMenu() {
        const skills = this.player.externalSkills;
        if (skills.length === 0) {
            this.battleState.log.push({ text: '你尚未习得任何外功招式。', cls: 'battle-log-info' });
            this.showBattleActions();
            return;
        }
        const bs = this.battleState;
        const remaining = (bs.isPlayerTurn ? bs.playerMaxActions : bs.enemyMaxActions) - bs.actionsUsed;
        const choices = skills.map((sk, i) => {
            const fixedPower = getSkillFixedPower(sk.quality, sk.level);
            const neiliCost = Math.max(1, Math.floor(fixedPower * 0.4));
            const actionCost = getSkillActionCost(sk);
            const enoughNeili = this.player.neili >= neiliCost;
            const enoughAction = remaining >= actionCost;
            const canUse = enoughNeili && enoughAction;
            let label = `${sk.name} Lv.${sk.level}（内力${neiliCost} 行动${actionCost}）`;
            // 属性不足提示
            if (sk.quality === 'purple' || sk.quality === 'orange' || sk.quality === 'gold') {
                const reqs = [];
                if (sk.rootReq) reqs.push(`根骨${sk.rootReq}`);
                if (sk.agileReq) reqs.push(`灵巧${sk.agileReq}`);
                if (sk.intelReq) reqs.push(`悟性${sk.intelReq}`);
                if (reqs.length > 0) label += ` [需${reqs.join('/')}]`;
            }
            if (!enoughNeili) label += ' [内力不足]';
            else if (!enoughAction) label += ' [行动不足]';
            return {
                text: label,
                action: canUse ? () => this.battleUseSkill(i) : null,
            };
        });
        choices.push({ text: '返回', action: () => this.showBattleActions() });
        this.showChoices(choices);
    }

    battleUseSkill(skillIndex) {
        const sk = this.player.externalSkills[skillIndex];
        const actionCost = getSkillActionCost(sk);
        const bs = this.battleState;
        const maxAct = bs.isPlayerTurn ? bs.playerMaxActions : bs.enemyMaxActions;
        if (bs.actionsUsed + actionCost > maxAct) {
            this.battleState.log.push({ text: `行动值不足，不足以释放${sk.name}。`, cls: 'battle-log-info' });
            this.showBattleActions();
            return;
        }
        bs.actionsUsed += actionCost - 1;
        const basePower = Math.floor(this.player.attrs.root * 0.5 + this.player.attrs.dexterity * 0.5);
        let weaponPower = 0;
        for (const s of ['rightHand', 'leftHand']) {
            if (this.player.equipment[s]) weaponPower += this.player.equipment[s].value;
        }
        if (sk.type === 'fist' || sk.type === 'kick') weaponPower = 0;
        const fixedPower = getSkillFixedPower(sk.quality, sk.level);
        const coeff = getSkillCoefficient(sk.quality, sk.level);
        const combatPwr = getSkillPowerTotal(basePower, weaponPower, fixedPower, coeff);
        let dmg = Math.max(1, Math.floor(combatPwr * 0.55 + Math.floor(Math.random() * 3) - 1));
        const neiliCost = Math.max(1, Math.floor(fixedPower * 0.4));

        // 根骨/灵巧/悟性不足时威力减半
        let penaltyNote = '';
        if (sk.rootReq && (this.player.attrs.root || 0) < sk.rootReq) {
            penaltyNote = `根骨不足（${this.player.attrs.root}/${sk.rootReq}）`;
        }
        if (sk.agileReq && (this.player.attrs.dexterity || 0) < sk.agileReq) {
            penaltyNote = (penaltyNote ? penaltyNote + '，' : '') + `灵巧不足（${this.player.attrs.dexterity}/${sk.agileReq}）`;
        }
        if (sk.intelReq && (this.player.attrs.wit || 0) < sk.intelReq) {
            penaltyNote = (penaltyNote ? penaltyNote + '，' : '') + `悟性不足（${this.player.attrs.wit}/${sk.intelReq}）`;
        }
        if (penaltyNote) {
            dmg = Math.max(1, Math.floor(dmg * 0.5));
            bs.log.push({ text: `你的${penaltyNote}，尚不能发挥此招的全部威力！伤害减半！`, cls: 'battle-log-warning' });
        }

        this.player.neili -= neiliCost;

        const e = bs.enemy;
        e.hp -= dmg;
        bs.log.push({ text: `你使出<span style="color:#ffd700">${sk.name}</span>！造成 <b>${dmg}</b> 点伤害！（内力 -${neiliCost}）`, cls: 'battle-log-hit' });

        this._advanceTurn();
    }

    showBattleItemMenu() {
        const healingItems = [];
        for (let i = 0; i < this.player.items.length; i++) {
            const it = this.player.items[i];
            if (it.use && (it.use.healHp || it.use.healNeili || it.use.cure)) {
                healingItems.push({ item: it, index: i });
            }
        }
        if (healingItems.length === 0) {
            this.battleState.log.push({ text: '你没有可用的药品。', cls: 'battle-log-info' });
            this.showBattleActions();
            return;
        }
        const choices = healingItems.map(h => ({
            text: `${h.item.name}`,
            action: () => this.battleUseItem(h.item, h.index),
        }));
        choices.push({ text: '返回', action: () => this.showBattleActions() });
        this.showChoices(choices);
    }

    battleUseItem(item, idx) {
        this.player.items.splice(idx, 1);
        let msg = `你使用了「${item.name}」。`;
        const use = item.use || {};
        const statusNames = { bleed: '撕裂', poison: '中毒' };
        if (use.cure) {
            const p = this.player;
            const found = (p.statuses || []).findIndex(s => s.type === use.cure);
            if (found !== -1) {
                if (item.id === 'herb_bandage' && Math.random() >= 0.5) {
                    msg += ` 但止血草药力不足，没能止住伤口。`;
                } else {
                    p.statuses.splice(found, 1);
                    msg += ` 身上的「${statusNames[use.cure] || use.cure}」状态解除了。`;
                }
            } else {
                msg += ` 但你没有${statusNames[use.cure] || use.cure}状态。`;
            }
            this.battleState.log.push({ text: msg, cls: 'battle-log-info' });
        } else if (use.healNeili) {
            this.player.neili = Math.min(this.player.maxNeili, this.player.neili + use.healNeili);
            this.player._drunk = (this.player._drunk || 0) + use.healNeili;
            msg += ` 内力恢复 ${use.healNeili} 点。醉意 +${use.healNeili}。`;
            this.battleState.log.push({ text: msg, cls: 'battle-log-info' });
            if (this.player._drunk >= 100) {
                this.battleState.log.push({ text: `你喝得烂醉如泥，一头栽倒在地，不省人事……`, cls: 'battle-log-danger' });
                this.player._drunk = 0;
                this.gameOver('你醉得不省人事，战斗失败……');
                return;
            }
        } else if (use.healHp) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + use.healHp);
            msg += ` 气血恢复 ${use.healHp} 点。`;
            this.battleState.log.push({ text: msg, cls: 'battle-log-info' });
        } else {
            this.battleState.log.push({ text: msg + ' 但是什么也没发生。', cls: 'battle-log-info' });
        }
        this.updateStatsBar();
        this._advanceTurn();
    }

    attemptFlee() {
        if (!this.battleState) return;
        const e = this.battleState.enemy;
        const fleeChance = Math.min(0.85, (this.player.attrs.dexterity * 3) / Math.max(1, e.combatPower));
        if (Math.random() < fleeChance) {
            this.clearChoices();
            this.battleState.log.push({ text: '你转身就跑，成功摆脱了战斗！', cls: 'battle-log-info' });
            this.renderBattleHUD();
            this.updateStatsBar();
            setTimeout(() => {
                const cb = this.battleState.onFlee;
                this.battleState = null;
                cb();
            }, 600);
        } else {
            this.battleState.log.push({ text: '你试图逃跑，但没能脱身！', cls: 'battle-log-miss' });
            this._advanceTurn();
        }
    }

    enemyTurn() {
        const e = this.battleState.enemy;
        if (e.hp <= 0) { this.resolveBattleVictory(); return; }

        const moves = e.moves;
        let move;
        if (moves.length >= 2 && e.neili >= moves[1].neiliCost && Math.random() < 0.4) {
            move = moves[1];
        } else {
            move = moves[0];
        }
        if (move.neiliCost) e.neili -= move.neiliCost;

        const defense = this.getPlayerDefense();
        const rawDmg = Math.max(1, Math.floor(move.power + Math.floor(Math.random() * 4) - 1));
        const dmg = Math.max(1, rawDmg - Math.floor(defense * 0.15));
        this.player.hp -= dmg;
        if (move.status && Math.random() < move.status.chance) {
            this._applyStatus(move.status.type, e.name);
        }
        const moveName = move.neiliCost ? `<span style="color:#f0a0a0">${move.name}</span>` : move.name;
        this.battleState.log.push({ text: `${e.name}使出了${moveName}！你受到 <b>${dmg}</b> 点伤害。`, cls: 'battle-log-self' });
        this.renderBattleHUD();

        this.updateStatsBar();
        this.showChoices([
            { text: '继续', action: () => {
                if (this.player.hp <= 0) {
                    this.battleState.log.push({ text: '你眼前一黑，倒了下去……', cls: 'battle-log-self' });
                    this.renderBattleHUD();
                    this.showChoices([
                        { text: '继续', action: () => {
                            document.getElementById('log').innerHTML = '';
                            const cb = this.battleState.onLose;
                            this.battleState = null;
                            this.player.hp = 0;
                            this.updateStatsBar();
                            cb();
                        } },
                    ]);
                    return;
                }
                this._advanceTurn();
            } },
        ]);
    }

    resolveBattleVictory() {
        this.renderBattleHUD();
        this.updateStatsBar();
        const cb = this.battleState.onWin;
        this.battleState = null;
        document.getElementById('log').innerHTML = '';
        cb();
    }

    /* ─── 异常状态 ─── */

    _applyStatus(type, source) {
        const p = this.player;
        if (!p.statuses) p.statuses = [];
        if (p.statuses.some(s => s.type === type)) return;
        p.statuses.push({ type, source });
        const names = { bleed: '撕裂', poison: '中毒' };
        const name = names[type] || type;
        this.addMessage(`你被${source}的攻击命中，陷入了<b>${name}</b>状态！`, 'danger');
        this.updateStatsBar();
    }

    processStatusOnMove() {
        const p = this.player;
        if (!p.statuses || p.statuses.length === 0) return false;
        let msg = '';
        for (const s of p.statuses) {
            if (s.type === 'bleed') {
                const dmg = Math.max(1, Math.floor(p.maxHp * 0.05));
                p.hp -= dmg;
                msg += `伤口撕裂，你流失了 ${dmg} 点气血！`;
            } else if (s.type === 'poison') {
                const dmg = Math.max(1, Math.floor(p.maxHp * 0.03));
                p.hp -= dmg;
                msg += `毒气发作，你损失了 ${dmg} 点气血！`;
            }
        }
        if (msg) {
            this.addMessage(msg, 'danger');
            this.updateStatsBar();
            if (p.hp <= 0) {
                this.gameOver('你因伤势过重，倒在了路上。');
                return true;
            }
        }
        return false;
    }

    /* ─── 购买 ─── */

    buyFromNpc(venue, npc) {
        this.clearChoices();
        const avail = npc.items.filter(it => it.stock > 0 && !it._noBuy);
        if (avail.length === 0) {
            this.addMessage(npc.npcName + '：「不好意思，货都卖完了。」', 'narrator');
            setTimeout(() => this.interactNpc(venue, npc), 400);
            return;
        }
        this.addMessage(`—— ${venue.name} · ${npc.npcName}的货 ——`, 'system');
        avail.sort((a, b) => a.value - b.value);
        const choices = avail.map((item, idx) => {
            const price = item.value * 3;
            return {
                text: `${item.name}（${price}两）—— ${item.desc}`,
                action: () => this.buyItem(venue, npc, item),
            };
        });
        choices.push({ text: '算了', action: () => this.interactNpc(venue, npc) });
        this.showChoices(choices);
    }

    buyItem(venue, npc, item) {
        this.clearChoices();
        const price = item.value * 3;
        if (this.player.gold < price) {
            this.addMessage('你囊中羞涩，买不起。', 'narrator');
            setTimeout(() => this.buyFromNpc(venue, npc), 400);
            return;
        }
        this.player.gold -= price;
        const bought = { ...item };
        if (!this.autoEquip(bought)) this.player.items.push(bought);
        item.stock--;
        if (item.stock <= 0) this.addMessage(`${item.name}已售罄。`, 'info');
        this.addMessage(`你买下了${item.name}，花费 ${price}两。`, 'event');
        this.updateStatsBar();
        setTimeout(() => this.buyFromNpc(venue, npc), 400);
    }

    /* ─── 出售 ─── */

    sellToNpc(venue, npc) {
        this.clearChoices();
        const p = this.player;
        if (p.items.length === 0) {
            this.addMessage('你翻遍全身，没什么可卖的。', 'narrator');
            setTimeout(() => this.interactNpc(venue, npc), 400);
            return;
        }
        this.addMessage(`—— 你的行囊 ——`, 'system');
        // 按 id 合并同类物品
        const groups = {};
        for (let i = 0; i < p.items.length; i++) {
            const item = p.items[i];
            const key = item.id || item.name;
            if (!groups[key]) groups[key] = { item, indices: [], count: 0 };
            groups[key].indices.push(i);
            groups[key].count++;
        }
        const choices = Object.values(groups).map(g => {
            const price = Math.max(1, Math.floor(g.item.value * 0.5));
            const label = g.count > 1 ? `${g.item.name} ×${g.count} → 共售价 ${price * g.count}两` : `${g.item.name} → 售价 ${price}两`;
            return {
                text: label,
                action: () => {
                    if (g.count > 1) this._showSellQuantity(venue, npc, g, price);
                    else this.sellItems(venue, npc, g.indices, price, g.count);
                },
            };
        });
        choices.push({ text: '算了', action: () => this.interactNpc(venue, npc) });
        this.showChoices(choices);
    }

    _showSellQuantity(venue, npc, g, unitPrice) {
        this.clearChoices();
        let qty = 1;
        const maxQty = g.count;
        const render = () => {
            this.clearChoices();
            const total = unitPrice * qty;
            this.addMessage(`—— ${g.item.name} ×${maxQty} ——`, 'system');
            this.addMessage(`出售数量：${qty}`, 'info');
            this.addMessage(`售价：${total}两（单价 ${unitPrice}两）`, 'system');
            this.showChoices([
                { text: '清空', action: () => { qty = 0; render(); } },
                { text: '+1', action: () => { if (qty < maxQty) qty++; render(); } },
                { text: '-1', action: () => { if (qty > 1) qty--; render(); } },
                { text: '全部', action: () => { qty = maxQty; render(); } },
                { text: `售卖${qty > 0 ? '（' + qty + '个→' + (unitPrice * qty) + '两）' : ''}`, action: () => {
                    if (qty <= 0) { this.addMessage('请选择出售数量。', 'narrator'); setTimeout(() => render(), 300); return; }
                    this.sellItems(venue, npc, g.indices.slice(0, qty), unitPrice, qty);
                } },
                { text: '返回', action: () => this.sellToNpc(venue, npc) },
            ]);
        };
        render();
    }

    sellItems(venue, npc, indices, price, count) {
        this.clearChoices();
        const p = this.player;
        const item = p.items[indices[0]];
        const totalPrice = price * count;
        p.gold += totalPrice;
        // 从后往前删，避免索引偏移
        for (let i = indices.length - 1; i >= 0; i--) {
            p.items.splice(indices[i], 1);
        }
        npc.items.push({ ...item, stock: count, maxStock: count });
        this.addMessage(`你卖掉了 ${count} 个${item.name}，获得 ${totalPrice}两。`, 'event');
        this.updateStatsBar();
        setTimeout(() => this.sellToNpc(venue, npc), 400);
    }

    /* ─── 装备制造 ─── */

    showForgeMenu(venue, npc) {
        this.clearChoices();
        this.addMessage(`—— ${npc.npcName}的锻炉 ——`, 'system');
        this.showChoices([
            { text: '基础锻造', action: () => this.showBasicForge(venue, npc) },
            { text: '图纸锻造', action: () => this.showBlueprintForge(venue, npc) },
            { text: '返回', action: () => this.interactNpc(venue, npc) },
        ]);
    }

    showBasicForge(venue, npc) {
        this.clearChoices();
        const p = this.player;
        const allRecipes = [
            { id: 'knife_wood',    name: '柴刀',      tier: 'white', cost: 3,  ings: { iron_ore: 2 }, desc: '劈柴用的铁刀' },
            { id: 'dagger',        name: '匕首',      tier: 'white', cost: 3,  ings: { iron_ore: 2 }, desc: '短小锋利的匕首' },
            { id: 'fishing_rod',   name: '鱼竿',      tier: 'white', cost: 3, ings: { iron_ore: 1, wood_hard: 1 }, desc: '竹竿配麻线铁钩' },
            { id: 'chest_mirror',  name: '护心镜',    tier: 'green', cost: 10, ings: { iron_ore: 4, leather_raw: 2 }, desc: '可挡暗箭的铜镜' },
            { id: 'blue_blade',    name: '砍山刀',    tier: 'blue',  cost: 30, ings: { iron_ore: 6, leather_raw: 4, wood_hard: 2 }, desc: '刃口厚重的砍刀' },
            { id: 'blue_sword',    name: '青锋剑',    tier: 'blue',  cost: 35, ings: { iron_ore: 8, wood_hard: 4 }, desc: '剑身泛青光的利器' },
            { id: 'gold_silk_armor', name: '金丝软甲', tier: 'purple', cost: 60, ings: { iron_ore: 10, leather_raw: 8 }, desc: '刀枪不入的宝甲' },
        ];
        const hasHighTier = (npc.items || []).some(it => it.tier === 'blue' || it.tier === 'purple');
        const recipes = hasHighTier ? allRecipes : allRecipes.filter(r => r.tier === 'white' || r.tier === 'green');

        const countItem = (id) => p.items.filter(it => it.id === id).length;
        const ingName = (id) => (getItem(id) || { name: id }).name;

        this.addMessage(`— 基础锻造 —`, 'system');
        this.addMessage(`材料：铁矿石×${countItem('iron_ore')}、兽皮×${countItem('leather_raw')}、硬木×${countItem('wood_hard')}  银两：${p.gold}两`, 'narrator');

        const choices = recipes.map(r => {
            const hasMat = Object.entries(r.ings).every(([id, qty]) => countItem(id) >= qty);
            const hasGold = p.gold >= r.cost;
            const canForge = hasMat && hasGold;
            const label = (canForge ? '' : '⚠ ') + '【' + (ITEM_TIER_LABELS[r.tier] || r.tier) + '】' + r.name + ' — ' + r.desc + '  |  ' +
                Object.entries(r.ings).map(([id, qty]) => `${ingName(id)}×${qty}`).join('、') + ` + ${r.cost}两`;
            return {
                text: label,
                action: canForge ? () => this._doForge(r, venue, npc) : () => { this.addMessage('材料不足，无法锻造。', 'info'); setTimeout(() => this.showBasicForge(venue, npc), 200); },
            };
        });
        choices.push({ text: '返回装备制造', action: () => this.showForgeMenu(venue, npc) });
        this.showChoices(choices);
    }

    showBlueprintForge(venue, npc) {
        this.clearChoices();
        const p = this.player;
        const blueprints = p.items.filter(i => {
            const def = getItem(i.id);
            return def && def.category === 'blueprint' && def.blueprint;
        });

        this.addMessage(`— 图纸锻造 —`, 'system');
        if (blueprints.length === 0) {
            this.addMessage('你身上没有任何锻造图纸。', 'narrator');
            this.addMessage('图纸可以在各地商人处购买，或从某些特殊途径获得。', 'narrator');
            this.showChoices([{ text: '返回装备制造', action: () => this.showForgeMenu(venue, npc) }]);
            return;
        }

        const countItem = (id) => p.items.filter(it => it.id === id).length;
        const ingName = (id) => (getItem(id) || { name: id }).name;
        this.addMessage(`材料：铁矿石×${countItem('iron_ore')}、兽皮×${countItem('leather_raw')}、硬木×${countItem('wood_hard')}  银两：${p.gold}两`, 'narrator');

        const choices = blueprints.map(bp => {
            const def = getItem(bp.id);
            const bpData = def.blueprint;
            const targetItem = getItem(bpData.id);
            const tier = targetItem ? (targetItem.tier || 'white') : 'white';
            const hasMat = Object.entries(bpData.ings).every(([id, qty]) => countItem(id) >= qty);
            const hasGold = p.gold >= bpData.cost;
            const canForge = hasMat && hasGold;
            const label = (canForge ? '' : '⚠ ') + '【' + (ITEM_TIER_LABELS[tier] || tier) + '】' + def.name + ' → ' + (targetItem ? targetItem.name : bpData.id) + '  |  ' +
                Object.entries(bpData.ings).map(([id, qty]) => `${ingName(id)}×${qty}`).join('、') + ` + ${bpData.cost}两`;
            return {
                text: label,
                action: canForge ? () => this._doBlueprintForge(bp, bpData, venue, npc) : () => { this.addMessage('材料不足，无法锻造。', 'info'); setTimeout(() => this.showBlueprintForge(venue, npc), 200); },
            };
        });
        choices.push({ text: '返回装备制造', action: () => this.showForgeMenu(venue, npc) });
        this.showChoices(choices);
    }

    _doForge(recipe, venue, npc) {
        this.clearChoices();
        const p = this.player;
        for (const [id, qty] of Object.entries(recipe.ings)) {
            let left = qty;
            p.items = p.items.filter(it => {
                if (it.id === id && left > 0) { left--; return false; }
                return true;
            });
        }
        p.gold -= recipe.cost;
        const item = getItem(recipe.id);
        if (!item) { this.addMessage('锻造失败：未知的配方。', 'danger'); this.updateStatsBar(); setTimeout(() => this.showBasicForge(venue, npc), 400); return; }
        if (!this.autoEquip(item)) p.items.push({ ...item });
        this.addMessage(`你将材料投入炉火中，锻造成了一把${recipe.name}！`, 'event');
        this.addMessage(`花费 ${recipe.cost}两，消耗了相应材料。`, 'info');
        this.updateStatsBar();
        setTimeout(() => this.showBasicForge(venue, npc), 400);
    }

    _doBlueprintForge(bp, bpData, venue, npc) {
        this.clearChoices();
        const p = this.player;
        for (const [id, qty] of Object.entries(bpData.ings)) {
            let left = qty;
            p.items = p.items.filter(it => {
                if (it.id === id && left > 0) { left--; return false; }
                return true;
            });
        }
        p.gold -= bpData.cost;
        const bpIdx = p.items.indexOf(bp);
        if (bpIdx !== -1) p.items.splice(bpIdx, 1);
        const item = getItem(bpData.id);
        if (!item) { this.addMessage('锻造失败：未知的配方。', 'danger'); this.updateStatsBar(); setTimeout(() => this.showBlueprintForge(venue, npc), 400); return; }
        if (!this.autoEquip(item)) p.items.push({ ...item });
        this.addMessage(`你按照图纸上的方法，精心打造！`, 'narrator');
        this.addMessage(`你成功制作了${item.name}！图纸也随之用掉了。`, 'event');
        this.addMessage(`花费 ${bpData.cost}两，消耗了相应材料。`, 'info');
        this.updateStatsBar();
        setTimeout(() => this.showBlueprintForge(venue, npc), 400);
    }

    /* ─── 偷盗 ─── */

    attemptSteal(venue, npc) {
        this.clearChoices();
        const items = npc.items.filter(it => it.stock > 0);
        if (items.length === 0) {
            this.addMessage('你打量了一番，发现这人身上已经没什么可偷的了。', 'narrator');
            setTimeout(() => this.interactNpc(venue, npc), 400);
            return;
        }
        const dex = this.player.attrs.dexterity;
        this.addMessage(`你盯着${npc.npcName}，盘算着下手的目标……`, 'narrator');
        const choices = items.map(item => {
            const diff = item.stealDiff;
            const pct = Math.min(99, Math.floor(dex / (dex + diff * 1.5) * 100));
            return {
                text: `［偷］${item.name}（价值 ${item.value}两 · 难度 ${diff} · ~${pct}%）`,
                action: () => this.doSteal(venue, npc, item),
            };
        });
        choices.push({ text: '算了，不偷了', action: () => this.interactNpc(venue, npc) });
        this.showChoices(choices);
    }

    doSteal(venue, npc, item) {
        this.clearChoices();
        const dex = this.player.attrs.dexterity;
        const diff = item.stealDiff;
        const chance = Math.max(0.05, Math.min(0.95, dex / (dex + diff * 1.5) + (this.player.attrs.luck - 50) / 500));
        const roll = Math.random();

        if (roll < chance) {
            this.addMessage(`你趁${npc.npcName}不注意，悄悄将${item.name}摸到手中！`, 'event');
            this.addMessage('得手了！你迅速将东西藏好。', 'event');
            this.player.shadowRep += 1;
            this.player._theftCount = (this.player._theftCount || 0) + 1;
            this._adjEvil(2, '偷盗');
            const stolen = { ...item };
            if (!this.autoEquip(stolen)) this.player.items.push(stolen);
            item.stock--;
            if (item.stock <= 0) this.addMessage(`${npc.npcName}身上已经没有这种物品了。`, 'info');
            this.updateStatsBar();
            setTimeout(() => this.interactNpc(venue, npc), 400);
        } else if (roll < chance + 0.12) {
            this.addMessage(`${npc.npcName}似乎察觉到了什么，回头看了一眼。你赶紧缩回手。`, 'narrator');
            this.addMessage('好险！差点被发现……', 'system');
            this.player.neili -= 5;
            this.updateStatsBar();
            setTimeout(() => this.interactNpc(venue, npc), 500);
        } else {
            this.addMessage(`「干什么！」${npc.npcName}一把抓住你的手腕！`, 'danger');
            this.addMessage('你奋力挣脱，狼狈逃开。周围的人都在指指点点。', 'danger');
            this.player.reputation -= 1;
            npc._caught = true;
            this.addMessage(`声望 -1（当前 ${this.player.reputation}）`, 'system');
            this.player.neili -= 10;
            if (this.player.reputation <= -40) { this.gameOver('你偷盗失手被当场拿获，被扭送官府。江湖之路，到此为止……'); return; }
            this.updateStatsBar();
            setTimeout(() => this.enterVenue(venue), 500);
        }
    }

    beggarIntelFactions(venue, npc) {
        this.clearChoices();
        const loc = this.currentLocation;
        if (!loc || !loc.factions || loc.factions.length === 0) {
            this.addMessage(`乞丐挠了挠头：「这旮沓穷乡僻壤的，哪有什么门派势力哦。」`, 'narrator');
            this.showChoices([{ text: '离开', action: () => this.enterVenue(venue) }]);
            return;
        }
        this.addMessage(`乞丐压低声音，神秘兮兮地说：「您可算问对人了，这${loc.name}一带的势力，小的门儿清！」`, 'narrator');
        for (const fId of loc.factions) {
            let info;
            if (fId === 'wulin') {
                info = '武林盟总舵就在此地，盟主上官金虹坐镇，天下英雄莫不低头。';
            } else {
                const f = getFaction(fId);
                if (!f) continue;
                const rankCount = f.ranks.length;
                const skillCount = f.ranks.reduce((sum, r) => sum + (r.skillIds || []).length, 0);
                info = `${f.icon} ${f.name}，位在「${f.venueName}」。门下分${rankCount}阶弟子，独门武学${skillCount}余种。${f.isEvil ? '此派亦正亦邪，行事诡秘。' : f.exclusiveGroup === 'positive' ? '江湖正派，名声在外。' : '行事低调，不涉正邪之争。'}`;
            }
            this.addMessage(`  · ${info}`, 'info');
        }
        this.addMessage(`乞丐嘿嘿一笑：「爷要是想投奔哪家，可得带够了拜礼才成。」`, 'narrator');
        this.showChoices([{ text: '够了', action: () => this.enterVenue(venue) }]);
    }

    /* ─── 背包 ─── */

    showInventory() {
        this.clearChoices();
        const p = this.player;
        if (p.items.length === 0) {
            this.addMessage('你的背包空空如也。', 'narrator');
        } else {
            this.addMessage('—— 背包 ——', 'system');
            const groups = {};
            for (const item of p.items) {
                const key = item.id || item.name;
                if (!groups[key]) groups[key] = { name: item.name, desc: item.desc, value: item.value, count: 0 };
                groups[key].count++;
            }
            for (const g of Object.values(groups)) {
                const label = g.count > 1 ? `${g.name} ×${g.count}` : g.name;
                this.addMessage(`${label}：${g.desc}（价值 ${g.value}两）`, 'info');
            }
        }
        this.addMessage(`银两：${p.gold}两 | 物品：${p.items.length}件`, 'system');
        const choices = [];
        const usable = p.items.findIndex(it => it.use && (it.use.healHp || it.use.healNeili || it.use.cure));
        if (usable !== -1) {
            choices.push({ text: '使用物品', action: () => this.showUseableItems() });
        }
        choices.push({ text: '收起背包', action: () => this.showLocationChoices() });
        this.showChoices(choices);
    }

    showUseableItems() {
        this.clearChoices();
        const p = this.player;
        const usable = [];
        for (let i = 0; i < p.items.length; i++) {
            const it = p.items[i];
            if (it.use && (it.use.healHp || it.use.healNeili || it.use.cure)) {
                usable.push({ item: it, index: i });
            }
        }
        if (usable.length === 0) {
            this.addMessage('没有可用的物品。', 'narrator');
            this.showInventory();
            return;
        }
        const choices = usable.map(u => ({
            text: u.item.name,
            action: () => this.doUseItem(u.item, u.index),
        }));
        choices.push({ text: '返回', action: () => this.showInventory() });
        this.showChoices(choices);
    }

    doUseItem(item, idx) {
        const use = item.use || {};
        // 福缘检查（在删除物品前）
        if (use.learnInternalSkill) {
            const tier = GAMBLING_SKILL_TIERS.find(t => t.internalName === use.learnInternalSkill);
            if (tier && tier.luckReq > 0 && (this.player.attrs.luck || 0) < tier.luckReq) {
                this.addMessage(`你翻开「${item.name}」研读半晌，却发现其中玄机深奥，以你的福缘（${this.player.attrs.luck || 0}）尚不足以参悟。需要福缘达到${tier.luckReq}方可习练。`, 'danger');
                this.updateStatsBar();
                return this.showInventory();
            }
        }
        this.player.items.splice(idx, 1);
        let msg = `你使用了「${item.name}」。`;
        const statusNames = { bleed: '撕裂', poison: '中毒' };
        if (use.cure) {
            const p = this.player;
            const found = (p.statuses || []).findIndex(s => s.type === use.cure);
            if (found !== -1) {
                if (item.id === 'herb_bandage' && Math.random() >= 0.5) {
                    msg += ` 但止血草药力不足，没能止住伤口。`;
                } else {
                    p.statuses.splice(found, 1);
                    msg += ` 身上的「${statusNames[use.cure] || use.cure}」状态解除了。`;
                }
            } else {
                msg += ` 但你没有${statusNames[use.cure] || use.cure}状态。`;
            }
        } else if (use.healNeili) {
            this.player.neili = Math.min(this.player.maxNeili, this.player.neili + use.healNeili);
            this.player._drunk = (this.player._drunk || 0) + use.healNeili;
            msg += ` 内力恢复 ${use.healNeili} 点。醉意 +${use.healNeili}。`;
            if (this.player._drunk >= 100) {
                this.addMessage(`你喝得烂醉如泥，一头栽倒在地，不省人事……`, 'danger');
                this.player._drunk = 0;
                this.sleepToTomorrow(true);
                return;
            }
        } else if (use.healHp) {
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + use.healHp);
            msg += ` 气血恢复 ${use.healHp} 点。`;
        } else if (use.learnInternalSkill) {
            const skName = use.learnInternalSkill;
            if (!this.player.internalSkills.includes(skName)) {
                this.player.internalSkills.push(skName);
                msg += ` 你默记心法口诀，习得「${skName}」！`;
            } else {
                msg += ` 但你已经学过这门心法了。`;
            }
        }
        this.addMessage(msg, 'narrator');
        this.updateStatsBar();
        this.showInventory();
    }

    /* ─── 装备系统 ─── */

    showEquipment() {
        const overlay = document.getElementById('equip-overlay');
        overlay.classList.remove('hidden');
        this._buildEquipSlots();
    }

    hideEquipment() {
        document.getElementById('equip-overlay').classList.add('hidden');
        document.getElementById('equip-sub').classList.add('hidden');
    }

    _buildEquipSlots() {
        const eq = this.player.equipment;
        const slots = document.getElementById('equip-slots');
        const defs = [
            { row: 0, slots: [{ key: 'head',        label: '头部' }] },
            { row: 1, slots: [
                { key: 'leftHand',   label: '左手' },
                { key: 'upperBody',  label: '上衣' },
                { key: 'rightHand',  label: '右手' },
            ]},
            { row: 2, slots: [
                { key: 'bracers',    label: '护腕' },
                { key: 'lowerBody',  label: '下装' },
                { key: 'boots',      label: '鞋子' },
            ]},
            { row: 3, slots: [
                { key: 'accessory1', label: '饰品·壹' },
                { key: 'accessory2', label: '饰品·贰' },
            ]},
        ];

        const tierClass = { white:'eq-tier-white', green:'eq-tier-green', blue:'eq-tier-blue', purple:'eq-tier-purple' };
        let html = '';
        for (const row of defs) {
            html += '<div class="equip-row">';
            for (const s of row.slots) {
                const item = eq[s.key];
                const filled = !!item;
                const tc = item ? (tierClass[item.tier] || '') : '';
                html += '<div class="equip-slot' + (filled ? ' eq-filled' : '') + '" data-slot="' + s.key + '">' +
                    '<span class="eq-label">' + s.label + '</span>' +
                    '<span class="eq-name ' + tc + '">' + (item ? item.name : '空') + '</span>' +
                    '</div>';
            }
            html += '</div>';
        }
        html += '<div class="equip-row" style="margin-top:8px">' +
            '<button class="equip-loadout-btn" id="btn-save-loadout">保存套装</button>' +
            '<button class="equip-loadout-btn" id="btn-load-loadout">读取套装</button>' +
            '</div>';
        slots.innerHTML = html;

        for (const el of slots.querySelectorAll('.equip-slot')) {
            el.onclick = () => {
                const slot = el.dataset.slot;
                if (eq[slot]) {
                    this._doUnequip(slot);
                } else {
                    this._showEquipItems(slot);
                }
            };
        }
        document.getElementById('btn-save-loadout').onclick = () => this._saveLoadout();
        document.getElementById('btn-load-loadout').onclick = () => this._showLoadouts();
    }

    _showEquipItems(slot) {
        const sub = document.getElementById('equip-sub');
        const eq = this.player.equipment;
        const items = this.player.items.filter(it => it.slot && this._slotMatches(slot, it.slot));

        if (items.length === 0) {
            sub.classList.remove('hidden');
            sub.innerHTML = '<div style="text-align:center;color:#6a7a9a;padding:8px;">没有可装备的物品</div>';
            return;
        }

        const tierClass = { white:'eq-tier-white', green:'eq-tier-green', blue:'eq-tier-blue', purple:'eq-tier-purple' };
        let html = '';
        for (const it of items) {
            const tc = tierClass[it.tier] || '';
            html += '<button class="equip-item-choice" data-id="' + it.id + '">' +
                '<span class="' + tc + '">' + it.name + '</span> — ' + (it.desc || '') + '（价值 ' + it.value + '两）' +
                '</button>';
        }
        sub.innerHTML = html;
        sub.classList.remove('hidden');

        for (const btn of sub.querySelectorAll('.equip-item-choice')) {
            btn.onclick = () => {
                const id = btn.dataset.id;
                const idx = this.player.items.findIndex(it => it.id === id && it.slot && this._slotMatches(slot, it.slot));
                if (idx > -1) {
                    const item = this.player.items[idx];
                    const current = eq[slot];
                    if (current) this.player.items.push({ ...current });
                    this.player.items.splice(idx, 1);
                    eq[slot] = { ...item };
                    this.updateStatsBar();
                    this._buildEquipSlots();
                    sub.classList.add('hidden');
                }
            };
        }
    }

    _slotMatches(slotKey, itemSlot) {
        if (slotKey === itemSlot) return true;
        if (slotKey === 'accessory1' || slotKey === 'accessory2') return itemSlot === 'accessory';
        return false;
    }

    _doUnequip(slot) {
        const eq = this.player.equipment;
        const item = eq[slot];
        if (!item) return;
        this.player.items.push({ ...item });
        eq[slot] = null;
        this.updateStatsBar();
        this._buildEquipSlots();
        document.getElementById('equip-sub').classList.add('hidden');
    }

    /* ─── 套装保存/读取 ─── */

    _saveLoadout() {
        const eq = this.player.equipment;
        if (!this.player._equipLoadouts) this.player._equipLoadouts = [];
        const name = '套装' + (this.player._equipLoadouts.length + 1);
        const snapshot = {};
        for (const key of Object.keys(eq)) {
            if (eq[key]) snapshot[key] = eq[key].id;
        }
        this.player._equipLoadouts.push({ name, slots: snapshot });
        this.addMessage('已保存当前装备为「' + name + '」。', 'event');
        this._buildEquipSlots();
    }

    _showLoadouts() {
        const sub = document.getElementById('equip-sub');
        const loadouts = this.player._equipLoadouts || [];
        if (loadouts.length === 0) {
            sub.classList.remove('hidden');
            sub.innerHTML = '<div style="text-align:center;color:#6a7a9a;padding:8px;">暂无保存的套装</div>';
            return;
        }
        let html = '';
        for (let i = 0; i < loadouts.length; i++) {
            const lo = loadouts[i];
            const count = Object.keys(lo.slots).length;
            html += '<button class="equip-item-choice" data-idx="' + i + '">' +
                lo.name + '（' + count + '件）</button>';
        }
        html += '<button class="equip-item-choice" style="border-color:#6a3a3a;color:#c09090" id="btn-clear-loadouts">删除全部</button>';
        sub.innerHTML = html;
        sub.classList.remove('hidden');

        for (const btn of sub.querySelectorAll('.equip-item-choice[data-idx]')) {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                this._applyLoadout(idx);
            };
        }
        document.getElementById('btn-clear-loadouts').onclick = () => {
            this.player._equipLoadouts = [];
            sub.classList.add('hidden');
            this.addMessage('已删除所有套装。', 'info');
            this._buildEquipSlots();
        };
    }

    _applyLoadout(idx) {
        const sub = document.getElementById('equip-sub');
        const loadouts = this.player._equipLoadouts || [];
        const lo = loadouts[idx];
        if (!lo) return;

        const allItems = [...this.player.items, ...Object.values(this.player.equipment).filter(Boolean)];
        const missing = [];
        for (const [slot, id] of Object.entries(lo.slots)) {
            const already = this.player.equipment[slot] && this.player.equipment[slot].id === id;
            if (already) continue;
            if (!allItems.some(it => it.id === id)) {
                missing.push(id);
            }
        }

        if (missing.length > 0) {
            const names = missing.map(id => (getItem(id) || { name: id }).name);
            sub.classList.remove('hidden');
            sub.innerHTML = '<div style="text-align:center;color:#d08060;padding:8px;">缺少装备：' + names.join('、') + '，无法换装。</div>';
            return;
        }

        const eq = this.player.equipment;
        for (const [slot, id] of Object.entries(lo.slots)) {
            if (eq[slot] && eq[slot].id === id) continue;
            if (eq[slot]) this.player.items.push({ ...eq[slot] });
            const found = this.player.items.findIndex(it => it.id === id);
            if (found > -1) {
                eq[slot] = { ...this.player.items[found] };
                this.player.items.splice(found, 1);
            }
        }

        this.updateStatsBar();
        this._buildEquipSlots();
        sub.classList.add('hidden');
        this.addMessage('已换装为「' + lo.name + '」。', 'event');
    }

    showCharacterStatus() {
        this.clearChoices();
        const p = this.player;
        this.addMessage('—— 个人状态 ——', 'system');
        for (const attr of ATTRIBUTES) {
            const val = p.attrs[attr.key];
            const ri = getRating(val);
            this.addMessage(`${attr.name}：${val}（${getRatingLabel(val)}）`, 'info');
        }
        const height = 155 + Math.min(35, Math.floor(p.attrs.root * 0.35));
        this.addMessage(`身高：${height}cm`, 'info');
        if (p.faction) {
            const f = getFaction(p.faction);
            if (f) {
                const rank = f.ranks[p.factionRank || 0];
                const rankName = rank ? rank.name : '未知';
                this.addMessage(`门派：${f.name} · ${rankName}（贡献 ${p.factionRep || 0}）`, 'event');
            }
        }
        this.addMessage('', 'narrator');
        this.addMessage('—— 装备 ——', 'system');
        let combatStr = `战力（全力以赴）：${this.getPlayerCombatPower('full')}`;
        const lightPower = this.getPlayerCombatPower('light');
        if (lightPower > 0) combatStr += ` | 基础：${lightPower}`;
        this.addMessage(combatStr, 'info');
        let defStr = `防御力：${this.getPlayerDefense()}`;
        this.addMessage(defStr, 'info');
        this.addMessage('', 'narrator');
        for (const s of EQUIP_SLOTS) {
            const eq = p.equipment[s.key];
            if (eq) {
                const ti = getTierInfo(eq.tier);
                const badge = `<span style="color:${ti.color};font-weight:bold">${ti.label}</span>`;
                this.addMessage(`　${s.label}：${eq.name}（${badge} · +${eq.value}）`, 'html');
            } else {
                this.addMessage(`　${s.label}：（空）`, 'info');
            }
        }
        setTimeout(() => this.showLocationChoices(), 300);
        this.showChoices([{ text: '收起', action: () => this.showLocationChoices() }]);
    }

    /* ─── 居家 ─── */

    showHomeChoices() {
        const choices = [
            { text: '练习外功', action: () => this.showExternalPractice() },
            { text: '练习心法', action: () => this.practiceInternal() },
            { text: '生火做饭', action: () => this.showCooking() },
            { text: '炼制丹药', action: () => this._alchemyMenu() },
        ];
        const houses = this.player.houses || {};
        const houseIds = Object.keys(houses);
        // 如果有庄园，直接提供快捷入口
        const estateId = houseIds.find(cId => houses[cId].plotIndex >= 2);
        if (estateId) {
            const house = houses[estateId];
            choices.push({ text: `🏯 回${cityIdToName(estateId)}${house.plotName}`, action: () => this.estateManager.enterEstate(estateId) });
        }
        if (houseIds.length > 0) {
            choices.push({ text: '我的宅院', action: () => this.houseManager._showGlobalHouseMenu() });
        }
        choices.push({ text: '睡到明天', action: () => this.sleepToTomorrow() });
        choices.push({ text: '回去', action: () => this.showLocationChoices() });
        this.showChoices(choices);
    }

    showCooking() {
        this.clearChoices();
        const rawMeats = [
            { id: 'meat_rabbit', name: '兔肉', cookedId: 'meat_rabbit_cooked', cookedName: '烤兔肉' },
            { id: 'meat_snake',  name: '蛇肉', cookedId: 'meat_snake_cooked',  cookedName: '烤蛇肉' },
            { id: 'meat_goat',   name: '羊肉', cookedId: 'meat_goat_cooked',   cookedName: '烤羊肉' },
            { id: 'meat_boar',   name: '野猪肉', cookedId: 'meat_boar_cooked', cookedName: '烤野猪肉' },
        ];
        const available = rawMeats.filter(m => this.player.items.some(i => i.id === m.id));
        const firewoodCount = this.player.items.filter(i => i.id === 'firewood').length;

        if (available.length === 0) {
            this.addMessage('你翻了翻背包——没有任何可以烹饪的肉类。', 'narrator');
            this.addMessage('去打猎弄些肉来，再找些柴火，就能生火做饭了。', 'narrator');
            this.showChoices([{ text: '回去', action: () => this.showHomeChoices() }]);
            return;
        }
        if (firewoodCount < 1) {
            this.addMessage('你架好锅，却发现没有柴火。', 'narrator');
            this.addMessage('去小树林砍些柴火回来吧。', 'narrator');
            this.showChoices([{ text: '回去', action: () => this.showHomeChoices() }]);
            return;
        }

        this.addMessage(`你拾来柴火，架起铁锅，准备生火做饭。（柴火剩余：${firewoodCount}）`, 'narrator');
        const choices = available.map(m => ({
            text: `烤${m.name}`,
            action: () => {
                this.clearChoices();
                const idx = this.player.items.findIndex(i => i.id === m.id);
                if (idx === -1) { this.addMessage('没有这个食材了。', 'narrator'); this.showChoices([{ text: '回去', action: () => this.showHomeChoices() }]); return; }
                this.player.items.splice(idx, 1);
                const fwIdx = this.player.items.findIndex(i => i.id === 'firewood');
                if (fwIdx === -1) { this.addMessage('柴火不够了。', 'narrator'); this.showChoices([{ text: '回去', action: () => this.showHomeChoices() }]); return; }
                this.player.items.splice(fwIdx, 1);
                this.player.items.push({ ...getItem(m.cookedId) });
                this.addMessage(`你将${m.name}放在火上慢慢烤制，香气四溢。`, 'narrator');
                this.addMessage(`${m.name}烤好了！获得 ${m.cookedName}`, 'event');
                this.advanceTime();
                this.updateStatsBar();
                this.showChoices([
                    { text: '再烤一份', action: () => this.showCooking() },
                    { text: '回去', action: () => this.showHomeChoices() },
                ]);
            },
        }));
        choices.push({ text: '回去', action: () => this.showHomeChoices() });
        this.showChoices(choices);
    }

    /* ─── 炼丹系统 ─── */

    _alchemyMenu() {
        this.clearChoices();
        const ALCHEMY_RECIPES = [
            { name: '金疮药', productId: 'jinchuang', ings: { herb_bandage: 2 }, desc: '止血草×2 → 金疮药' },
            { name: '止血膏', productId: 'zhixue_gao', ings: { herb_bandage: 3, aicao: 1 }, desc: '止血草×3 + 艾草×1 → 止血膏' },
            { name: '养气丹', productId: 'neili_dan', ings: { fuling: 2, herb_ginseng_small: 1 }, desc: '茯苓×2 + 小参×1 → 养气丹' },
            { name: '清心丸', productId: 'qingxin_wan', ings: { cheqiancao: 2, aicao: 1 }, desc: '车前草×2 + 艾草×1 → 清心丸' },
            { name: '解毒散', productId: 'jiedu_san', ings: { pugongying: 2, fuling: 1 }, desc: '蒲公英×2 + 茯苓×1 → 解毒散' },
            { name: '回魂丹', productId: 'huisheng', ings: { lingzhi: 2, herb_ginseng_small: 2, ginseng_100: 1 }, desc: '灵芝×2 + 小参×2 + 百年山参×1 → 回魂丹' },
        ];
        const available = ALCHEMY_RECIPES.filter(r => {
            const inv = this.player.items;
            return Object.keys(r.ings).every(id => inv.filter(i => i.id === id).length >= r.ings[id]);
        });
        if (available.length === 0) {
            this.addMessage('你取出药罐和火炉，翻了一遍背包——没有足够的药材可以炼丹。', 'narrator');
            this.addMessage('去田埂或小树林采些药材回来吧。', 'narrator');
            this.showChoices([{ text: '回去', action: () => this.showHomeChoices() }]);
            return;
        }
        this.addMessage('你取出药罐，升起炉火，准备炼制丹药。', 'narrator');
        const choices = available.map(r => ({
            text: `炼制${r.name}（${r.desc}）`,
            action: () => {
                this.clearChoices();
                const inv = this.player.items;
                const hasAll = Object.keys(r.ings).every(id => inv.filter(i => i.id === id).length >= r.ings[id]);
                if (!hasAll) {
                    this.addMessage('药材不够了。', 'narrator');
                    this.showChoices([{ text: '回去', action: () => this.showHomeChoices() }]);
                    return;
                }
                for (const id of Object.keys(r.ings)) {
                    let need = r.ings[id];
                    for (let i = inv.length - 1; i >= 0 && need > 0; i--) {
                        if (inv[i].id === id) { inv.splice(i, 1); need--; }
                    }
                }
                this.player.items.push({ ...getItem(r.productId) });
                this.addMessage(`你按方配药，守在炉边控制火候。半个时辰后，药香四溢——${r.name}炼成了！`, 'narrator');
                this.addMessage(`获得 ${r.name}×1`, 'system');
                this.advanceTime();
                this.updateStatsBar();
                setTimeout(() => this._alchemyMenu(), 400);
            },
        }));
        choices.push({ text: '回去', action: () => this.showHomeChoices() });
        this.showChoices(choices);
    }

    showExternalPractice() {
        this.clearChoices();
        const skills = this.player.externalSkills;
        if (skills.length === 0) {
            this.addMessage('你没有学过任何外功招式，只能做些基础的锻炼。', 'narrator');
            this.showChoices([
                { text: '锻炼身体', action: () => this.exercise() },
                { text: '算了', action: () => this.showHomeChoices() },
            ]);
        } else {
            this.addMessage('你回顾所学的武学招式，开始练习：', 'narrator');
            const choices = skills.map(s => {
                const qData = SKILL_QUALITIES[s.quality] || SKILL_QUALITIES.white;
                return { text: `${s.name} Lv.${s.level}/${s.maxLevel}（${qData.name}）`, action: () => this.practiceExternalSkill(s) };
            });
            choices.push({ text: '算了', action: () => this.showHomeChoices() });
            this.showChoices(choices);
        }
    }

    exercise() {
        this.clearChoices();
        const maxed = (this.player._exerciseCount || 0) >= 5;
        if (maxed) {
            this.addMessage('你扎稳马步，一趟拳法打完，浑身大汗淋漓。', 'narrator');
            this.addMessage('你的根基已固，再练也无进展了。', 'event');
            this.player.exp += 1;
            this.player.day += 1;
            this.addMessage('经验 +1', 'system');
            this.addMessage('折腾了半天，你昏昏沉沉地睡了过去。', 'narrator');
        } else {
            this.player._exerciseCount = (this.player._exerciseCount || 0) + 1;
            this.player.attrs.root += 1;
            this.player.maxHp += 1;
            this.player.hp = this.player.maxHp;
            this.player.exp += 3;
            this.player.day += 1;
            this.addMessage('你扎稳马步，一趟拳法打完，浑身大汗淋漓。', 'narrator');
            this.addMessage('虽然动作笨拙，但感觉筋骨舒展开了不少。', 'event');
            this.addMessage(`根骨 +1（${this.player.attrs.root}），气血 +1（${this.player.maxHp}），经验 +3`, 'system');
            this.addMessage('练完后，你浑身酸痛，倒头便睡了过去。', 'narrator');
        }
        this.checkLevelUp();
        this.updateStatsBar();
        setTimeout(() => this.showLocationChoices(), 400);
    }

    practiceExternalSkill(skill) {
        this.clearChoices();
        if (skill.level >= skill.maxLevel) {
            this.addMessage(`你反复演练${skill.name}，招式已臻化境，再练也无寸进了。`, 'narrator');
            this.player.exp += 5;
        this.player._drunk = Math.max(0, (this.player._drunk || 0) - 30);
        this.player.day += 1;
        this.player.timePeriod = '清晨';
            this.addMessage('经验 +5', 'system');
            this.addMessage('练完后，你精疲力竭，倒头便睡了过去。', 'narrator');
            this.checkLevelUp();
            this.updateStatsBar();
            setTimeout(() => this.showLocationChoices(), 400);
            return;
        }
        const oldFixed = getSkillFixedPower(skill.quality, skill.level);
        const oldCoeff = getSkillCoefficient(skill.quality, skill.level);
        skill.level++;
        const newFixed = getSkillFixedPower(skill.quality, skill.level);
        const newCoeff = getSkillCoefficient(skill.quality, skill.level);
        const fixedGain = newFixed - oldFixed;
        const qData = SKILL_QUALITIES[skill.quality];
        const isMaxed = skill.level >= skill.maxLevel;

        this.addMessage(`你凝神静气，一遍又一遍地演练${skill.name}……`, 'narrator');
        this.addMessage('不知练了多久，你感觉招式愈发纯熟，心有所悟。', 'event');
        let msg = `${skill.name} 提升至 Lv.${skill.level}`;
        if (fixedGain > 0) msg += `，威力 +${fixedGain}`;
        if (newCoeff > oldCoeff) msg += `，战意系数 ${oldCoeff.toFixed(2)} → ${newCoeff.toFixed(2)}`;
        this.addMessage(msg, 'system');
        this.player.exp += 5;
        this.player.day += 1;
        this.player.timePeriod = '清晨';
        this.addMessage('经验 +5', 'system');
        this.addMessage('练完后，你精疲力竭，倒头便睡了过去。', 'narrator');
        this.checkLevelUp();
        this.updateStatsBar();
        setTimeout(() => this.showLocationChoices(), 400);
    }

    practiceInternal() {
        this.clearChoices();
        const s = this.player.internalSkills;
        if (s.length === 0) { this.addMessage('你没有学过任何内功心法。', 'narrator'); setTimeout(() => this.showHomeChoices(), 400); return; }
        const choices = s.map(sk => ({ text: `运功 · ${sk}`, action: () => this.practiceInternalSkill(sk) }));
        choices.push({ text: '算了', action: () => this.showHomeChoices() });
        this.showChoices(choices);
    }

    practiceInternalSkill(name) {
        this.clearChoices();
        this.addMessage(`你盘膝坐下，五心朝天，默运「${name}」心法口诀……`, 'narrator');
        this.addMessage('一缕微弱的真气在经脉中缓缓流转，虽然渺小，却真实存在。', 'event');

        let neiliMsg = null;
        if (name === '天之书') {
            const level = this.player._tianzhishuLevel || 0;
            if (level >= 10) {
                this.addMessage('但真气运行至丹田处便凝滞不前，似有瓶颈阻隔，难以寸进。看来需得另寻机缘方可突破。', 'narrator');
                this.player.exp += 5;
                this.player.day += 1;
                this.player.timePeriod = '清晨';
                this.addMessage('经验 +5', 'system');
                this.addMessage('运功完毕，你收功归元，沉沉睡去。', 'narrator');
                this.checkLevelUp();
                this.updateStatsBar();
                setTimeout(() => this.showLocationChoices(), 400);
                return;
            }
            this.player.maxNeili += 2;
            this.player.neili = this.player.maxNeili;
            this.player._tianzhishuLevel = level + 1;
            neiliMsg = `内力上限 +2（${this.player.maxNeili}）`;
        } else if (name !== '按摩心经') {
            this.player.maxNeili += 1;
            this.player.neili = this.player.maxNeili;
            neiliMsg = `内力上限 +1（${this.player.maxNeili}）`;
        }

        this.player.exp += 5;
        this.player.day += 1;
        this.player.timePeriod = '清晨';
        this.addMessage((neiliMsg ? neiliMsg + '，' : '') + '经验 +5', 'system');
        // 沿袭赌徒心经解锁赌技
        if (name.endsWith('赌徒心经')) {
            this._unlockGamblingSkill(name);
        }
        if (name === '按摩心经') {
            const level = this.player._massageLevel || 0;
            if (level < 5) {
                this.player.attrs.appearance += 2;
                this.player._massageLevel = level + 1;
                this.addMessage(`容颜焕发，颜值 +2（当前 ${this.player.attrs.appearance}）`, 'system');
            } else {
                this.addMessage('此心法已至圆满，再无寸进。', 'info');
            }
        }
        this.addMessage('运功完毕，你收功归元，沉沉睡去。', 'narrator');
        this.checkLevelUp();
        this.updateStatsBar();
        setTimeout(() => this.showLocationChoices(), 400);
    }

    _unlockGamblingSkill(sutraName) {
        const tier = GAMBLING_SKILL_TIERS.find(t => t.internalName === sutraName);
        if (!tier) return;
        const currLevel = this.player._gamblingSkillLevel || 0;
        if (tier.level > currLevel) {
            this.player._gamblingSkillLevel = tier.level;
            this.addMessage(`你从「${sutraName}」中悟得了**${tier.name}**！此后赌博时可用内力催动，提升胜率。`, 'event');
        } else {
            this.addMessage('你在「' + sutraName + '」的运功中又多了几分心得，赌术更加精纯。', 'info');
        }
    }

    sleepToTomorrow(silent = false) {
        this.clearChoices();
        if (!silent) {
            this.addMessage('你回到住处，吹灭油灯，倒在床上沉沉睡去……', 'narrator');
            this.addMessage('一夜无梦。', 'narrator');
        }
        if (this.player._sleptWithBeauty) {
            this.player.hp = this.player.maxHp;
            this.player.neili = this.player.maxNeili;
            delete this.player._sleptWithBeauty;
            if (!silent) this.addMessage('你从温柔乡中醒来，昨夜风流如梦，气血充盈。', 'narrator');
        } else {
            if (this.player.neili < this.player.maxNeili) {
                const recover = Math.floor(this.player.maxNeili / 4);
                this.player.neili = Math.min(this.player.maxNeili, this.player.neili + recover);
                this.addMessage(`内力恢复了 ${recover} 点。`, 'system');
            }
        }
        this.player.day += 1;
        this.player.timePeriod = '清晨';
        if (this.player.locationVenues) {
            let restored = 0;
            this.player.locationVenues.forEach(v => v.npcs.forEach(n => {
                if (n._killed) return;
                delete n._caught;
                delete n._defeated;
                n.items.forEach(it => {
                    if (it.maxStock !== undefined) {
                        it.stock = it.maxStock;
                        restored++;
                    }
                });
            }));
            if (restored > 0) this.addMessage(`街市上的商贩们重新摆上了货物。`, 'info');
        }
        if (this.currentLocation && this.beautyMap[this.currentLocation.id]) {
            Object.values(this.beautyMap).flat().forEach(b => {
                delete b._chattedToday;
                delete b._chatting;
            });
            this.player.locationVenues.forEach(v => v.npcs = v.npcs.filter(n => !n.isBeauty));
            this.assignBeauties(this.currentLocation);
        }
        if (this.currentLocation && this.brothelProstitutes[this.currentLocation.id]) {
            this.brothelProstitutes[this.currentLocation.id].forEach(p => {
                delete p._hadSexToday;
            });
        }
        this.updateStatsBar();
        if (this.questCheckExpired) {
            const expired = this.questCheckExpired();
            if (expired) {
                this.addMessage('……', 'narrator');
                this.addMessage('你想起昨天那对爷孙，也不知道他们怎么样了。', 'narrator');
                this.addMessage('你心中感到一丝愧疚。', 'narrator');
            }
        }
        setTimeout(() => this.showLocationChoices(), 400);
    }

    getExpToNextLevel(level) {
        return Math.floor(80 + level * 20 + level * level * 3);
    }

    checkLevelUp() {
        let needed = this.getExpToNextLevel(this.player.level);
        while (this.player.exp >= needed) {
            this.player.exp -= needed;
            this.player.level++;
            this.player.maxHp += 5;
            this.player.maxNeili += 3;
            this.player.hp = this.player.maxHp;
            this.player.neili = this.player.maxNeili;
            this.addMessage(`━━━ 恭喜！升至 Lv.${this.player.level}！气血 +5，内力 +3 ━━━`, 'system');
            needed = this.getExpToNextLevel(this.player.level);
        }
    }

    /* ─── 旅行 ─── */

    showTravelOptions() {
        this.clearChoices();
        const current = this.player.locationId;
        // Block travel if main quest not complete in starting village
        if (this.player.mainQuest < 2 && current === this.player.startingVillage) {
            this.showMessageSequence([
                { text: `你收拾好行囊走到村口，却停下了脚步。`, type: 'narrator' },
                { text: `师弟沈清寒的下落还毫无头绪，现在离开村庄，无异于大海捞针。`, type: 'narrator' },
                { text: `还是先在村里把消息打听清楚再说吧……`, type: 'narrator' },
            ], () => this.showChoices([{ text: '回去', action: () => this.showOutdoorChoices() }]));
            return;
        }
        // 离开新手村时触发支线一（救牛）
        if (current === this.player.startingVillage &&
            (!this.player.completedQuests || !this.player.completedQuests.rescue_ox) &&
            (!this.player.failedQuests || !this.player.failedQuests.rescue_ox) &&
            (!this.player.activeQuests || !this.player.activeQuests.rescue_ox)) {
            this._triggerRescueOx();
            return;
        }
        const currentRegion = getRegion(current);
        const allLocs = getAllLocations().filter(l => l.id !== current);
        // only show locations in the same region
        const reachable = allLocs.filter(l => getRegion(l.id) === currentRegion);
        const others = reachable.sort(() => Math.random() - 0.5).slice(0, 4);
        const choices = others.map(loc => ({ text: `【${getRegionLabel(loc.id)}】${getLocationTypeLabel(loc.id).label} · ${loc.name}`, action: () => this.travelTo(loc.id) }));
        choices.push({ text: '算了', action: () => this.showOutdoorChoices() });
        this.addMessage('你盘算着下一站去哪儿……', 'narrator');
        this.showChoices(choices);
    }

    travelTo(locationId) {
        this.clearChoices();
        // Block travel if main quest not complete in starting village
        if (this.player.mainQuest < 2 && this.player.locationId === this.player.startingVillage) {
            this.addMessage(`现在还不是离开的时候，你还需要在村里打探消息。`, 'narrator');
            this.showChoices([{ text: '回去', action: () => this.showOutdoorChoices() }]);
            return;
        }
        // Check blacklist before traveling
        if (this.player.villageBlacklist && this.player.villageBlacklist[locationId]) {
            const loc = getAllLocations().find(l => l.id === locationId);
            const daysLeft = this.player.villageBlacklist[locationId] - this.player.day;
            this.showMessageSequence([
                { text: `${loc ? loc.name : '该地'}的村民还在气头上，你还是避避风头再说。`, type: 'narrator' },
                { text: `大概还需要${daysLeft}天才能回去。`, type: 'info' },
            ], () => this.showChoices([{ text: '换个别处', action: () => this.showTravelOptions() }]));
            return;
        }
        const fromId = this.player.locationId;
        const days = fromId === locationId ? 0 : getTravelDays(fromId, locationId);
        const cost = days * 2;
        this.addMessage('你收拾好行囊踏上了旅程……', 'narrator');
        this.addMessage(`此去大约${days}天脚程。`, 'info');
        if (this.player.gold >= cost) {
            this.player.gold -= cost;
            this.addMessage(`路途花费了 ${cost} 两银子。`, 'system');
        } else {
            this.player.hp = Math.max(1, this.player.hp - cost);
            this.addMessage(`你盘缠不够，只能一路风餐露宿，损失了 ${cost} 点气血。`, 'danger');
        }
        this.player.neili -= 10;
        this.player.day += days;
        setTimeout(() => {
            if (Math.random() < 1/3) {
                this.triggerTravelEvent(locationId);
            } else {
                this.addMessage('一路风平浪静。', 'narrator');
                this.updateStatsBar();
                setTimeout(() => this.enterLocation(locationId), 400);
            }
        }, 600);
    }

    triggerTravelEvent(locationId) {
        const EVENTS = [
            { label: '一只老虎', power: 30, count: 1, desc: '路旁蹿出一只猛虎，正对一名路人虎视眈眈！', enemyKey: 'tiger_1' },
            { label: '两只老虎', power: 30, count: 2, desc: '两只猛虎拦住了去路，路人在角落瑟瑟发抖！', enemyKey: 'tiger_2' },
            { label: '一个强盗', power: 15, count: 1, desc: '一个手持砍刀的强盗正在抢劫路人！', enemyKey: 'bandit_1' },
            { label: '两个强盗', power: 15, count: 2, desc: '两个强盗围住了路人，抢走了他的包袱！', enemyKey: 'bandit_2' },
            { label: '一群强盗', power: 15, count: 6, desc: '一伙强盗正在洗劫一支商队，喊杀声震天！', enemyKey: 'bandit_g' },
            { label: '一个山贼', power: 20, count: 1, desc: '一个山贼正在欺负一个过路的老人！', enemyKey: 'robber_1' },
            { label: '两个山贼', power: 20, count: 2, desc: '两个山贼拦路抢劫，路人吓得跪地求饶！', enemyKey: 'robber_2' },
            { label: '一群山贼', power: 20, count: 6, desc: '一群山贼正在围攻一辆马车！', enemyKey: 'robber_g' },
            { label: '一只野狗', power: 8, count: 1, desc: '一只野狗在路边狂吠，吓住了路人！', enemyKey: 'dog_1' },
            { label: '一群野狗', power: 8, count: 5, desc: '一群野狗围住了路人，情况危急！', enemyKey: 'dog_g' },
        ];
        const evt = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        const totalPower = evt.power * evt.count;
        this.showMessageSequence([
            { text: `前方一阵骚动！${evt.desc}`, type: 'danger' },
            { text: '路人看见你，投来求助的目光。', type: 'narrator' },
        ], () => this.showChoices([
            { text: '挺身而出', action: () => this.resolveTravelFight(locationId, evt, totalPower) },
            { text: '袖手旁观', action: () => this.resolveTravelStandby(locationId, evt) },
        ]));
    }

    resolveTravelFight(locationId, evt, totalPower) {
        this.clearChoices();
        this._questSeq([
            '你大喝一声，挡在路人身前！',
        ], () => {
            const enemy = createTravelEnemy(evt.enemyKey);
            this.startBattle(enemy,
                () => {
                    const goldReward = enemy.goldReward || Math.floor(totalPower * 1.5);
                    this.player.gold += goldReward;
                    this.player.exp += enemy.expReward || totalPower;
                    const isEasy = totalPower <= this.getPlayerCombatPower('full') * 0.67;
                    if (isEasy) {
                        this.player.reputation += 1;
                        this._questSeq([
                            `你三招两式便将${evt.label}击退！路人纷纷喝彩。`,
                            `获得 ${goldReward} 两银子、${enemy.expReward || totalPower} 点经验，声望 +1`,
                        ], () => {
                            this.checkLevelUp();
                            this.updateStatsBar();
                            setTimeout(() => this.enterLocation(locationId), 400);
                        });
                    } else {
                        const repGain = Math.min(10, 3 + Math.floor((totalPower / Math.max(1, this.getPlayerCombatPower('full'))) * 2));
                        this.player.reputation += repGain;
                        this._questSeq([
                            `你一番苦战，终于将${evt.label}击退！路人千恩万谢。`,
                            `获得 ${goldReward} 两银子、${enemy.expReward || totalPower} 点经验，声望 +${repGain}`,
                        ], () => {
                            this.checkLevelUp();
                            this.updateStatsBar();
                            setTimeout(() => this.enterLocation(locationId), 400);
                        });
                    }
                },
                () => this.gameOver('你受伤过重，不治身亡'),
                () => {
                    this._questSeq([
                        '你趁乱逃走了。',
                    ], () => {
                        this.updateStatsBar();
                        setTimeout(() => this.enterLocation(locationId), 400);
                    });
                }
            );
        });
    }

    resolveTravelStandby(locationId, evt) {
        this.clearChoices();
        const rep = this.player.reputation;
        const ratingIdx = getRatingIndex(rep);
        if (ratingIdx <= 2) {
            this._questSeq([
                '你冷漠地站在一旁，没有出手。',
                '你名声不显，路人也不敢指望你什么。',
            ], () => {
                this.updateStatsBar();
                setTimeout(() => this.enterLocation(locationId), 400);
            });
        } else {
            const tierMin = RATINGS[ratingIdx].min;
            const penalty = Math.max(1, Math.floor(tierMin / 10));
            this.player.reputation -= penalty;
            this._questSeq([
                '你冷漠地站在一旁，没有出手。',
                `路人失望地看着你：「见死不救，算什么江湖中人！」`,
                `声望 -${penalty}（当前 ${this.player.reputation}）`,
            ], () => {
                if (this.player.reputation <= -40) { this.gameOver('你声名狼藉，江湖再无容身之处……'); return; }
                this.updateStatsBar();
                setTimeout(() => this.enterLocation(locationId), 400);
            });
        }
    }

    /* ─── 美女系统 ─── */

    assignBeauties(loc) {
        const beauties = this.beautyMap[loc.id];
        if (!beauties || beauties.length === 0) return;
        const venues = this.player.locationVenues;
        if (venues.length === 0) return;
        const publicVenues = venues.filter(v => !v.name.includes('家') && !v.name.includes('府') && v.name !== '小树林' && v.name !== '废弃矿坑' && v.name !== '村角' && !this.isBrothelVenue(v));
        if (publicVenues.length === 0) return;
        for (const b of beauties) {
            if (this.killedNpcs.has('beauty_' + b.id)) continue;
            let targetVenue;
            if (b.special && b.fixedVenue) {
                targetVenue = venues.find(v => v.name === b.fixedVenue) || publicVenues[Math.floor(Math.random() * publicVenues.length)];
            } else {
                targetVenue = publicVenues[Math.floor(Math.random() * publicVenues.length)];
            }
            b._currentLocId = loc.id;
            b._currentVenueName = targetVenue.name;
            targetVenue.npcs.push({
                npcName: b.name,
                npcDesc: b.special ? (b.bodyDesc || '一位容貌出众的女子。') : '一位容貌出众的女子。',
                isBeauty: true,
                beautyId: b.id,
                _beautyData: b,
                civilian: true,
                combatPower: 0,
                items: [],
            });
        }
    }

    interactBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        // 聊过天的女NPC不再显示，留在场所继续看其他NPC
        if (bd._chattedToday) {
            this.enterVenueInner(venue);
            return;
        }
        // 特殊美人专用交互（可自定义对话树/任务）
        if (bd.special && bd.onInteract) {
            bd.onInteract(this, venue, beauty);
            return;
        }
        // 被强奸过的女性，只剩不义之举
        if (bd._raped) {
            this.addMessage(`${bd.name}「${bd.faceDesc}」`, 'html');
            this.addMessage('她目光躲闪，身子微微发抖，不敢正眼看你。', 'narrator');
            this.showChoices([
                { text: '不义之举', action: () => this.evilBeauty(venue, beauty) },
                { text: '离开', action: () => this.enterVenue(venue) },
            ]);
            return;
        }
        this.addMessage(`${bd.name}「${bd.faceDesc}」`, 'html');
        const choices = [
            { text: '鉴赏', action: () => this.appreciateBeauty(venue, beauty) },
            { text: '聊天', action: () => {
                if (bd.special && bd.dialogueTree) this._specialChat(venue, beauty, 0);
                else this.chatBeauty(venue, beauty);
            } },
            { text: '行动', action: () => this.actBeauty(venue, beauty) },
        ];
        if (bd.chatLevel >= 4) choices.push({ text: '亲密行为', action: () => this.intimateBeauty(venue, beauty) });
        choices.push({ text: '不义之举', action: () => this.evilBeauty(venue, beauty) });
        choices.push({ text: '离开', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    _specialChat(venue, beauty, stage) {
        const bd = beauty._beautyData;
        const tree = bd.dialogueTree;
        if (!tree || !tree[stage]) {
            this.chatBeauty(venue, beauty);
            return;
        }
        this.clearChoices();
        const node = tree[stage];
        this.addMessage(typeof node === 'string' ? node : node.text, 'narrator');
        const choices = (node.choices || [{ text: '继续', next: stage + 1 }]).map(c => ({
            text: c.text,
            action: () => {
                if (c.action) c.action(this, venue, beauty);
                else this._specialChat(venue, beauty, c.next);
            },
        }));
        choices.push({ text: '离开', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    appreciateBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const msgs = [
            { text: `你细细打量着${bd.name}……`, type: 'narrator' },
            { text: this._getAttitudeText(bd) || '她态度冷冷，不愿搭理你。', type: 'html' },
            { text: `<span style="color:${bd.beautyTierColor}">【${bd.beautyTierLabel}】</span> 颜值 ${bd.faceScore||'?'}  身材 ${bd.bodyScore||'?'}  评分 ${bd.beautyScore}`, type: 'html' },
        ];
        if (bd._revealed.body) msgs.push({ text: `身材：${bd.bodyDesc}`, type: 'html' });
        if (bd._revealed.clothing) msgs.push({ text: `穿着：${bd.clothing}`, type: 'html' });
        if (bd._revealed.age) msgs.push({ text: `年龄：约${bd.age}岁`, type: 'info' });
        if (bd._revealed.height) msgs.push({ text: `身高：${bd.height}cm${bd.heightLabel ? '（' + bd.heightLabel + '）' : ''}`, type: 'info' });
        if (bd._revealed.measurements) msgs.push({ text: `三围：${bd.bust}-${bd.waist}-${bd.hips}`, type: 'info' });
        if (bd._revealed.marital) {
            const fam = bd.married ? '已婚' : '未婚';
            const kid = bd.hasChildren ? '，有子女' : '';
            msgs.push({ text: `婚育：${fam}${kid}`, type: 'info' });
        }
        this.showMessageSequence(msgs, () => this.showChoices([{ text: '返回', action: () => this.interactBeauty(venue, beauty) }]));
    }

    _ensureRedRecord(bd) {
        if (!this.redRecord[bd.id]) {
            this.redRecord[bd.id] = {
                id: bd.id, name: bd.name, age: bd.age, surface: bd.surface, inner: bd.inner,
                height: bd.height, heightLabel: bd.heightLabel,
                bust: bd.bust, waist: bd.waist, hips: bd.hips,
                beautyScore: bd.beautyScore, beautyTierLabel: bd.beautyTierLabel, beautyTierColor: bd.beautyTierColor,
                faceScore: bd.faceScore, bodyScore: bd.bodyScore, faceDesc: bd.faceDesc, bodyDesc: bd.bodyDesc,
                _currentLocId: bd._currentLocId,
                special: !!bd.special,
                sexCount: 0,
                _revealed: {},
            };
        }
        const r = this.redRecord[bd.id];
        for (const k of ['body', 'age', 'height', 'measurements', 'marital']) {
            if (bd._revealed && bd._revealed[k]) r._revealed[k] = true;
        }
        if (bd._hadSex) r.sexCount++;
        if (bd._favPos) {
            r.favPos = bd._favPos;
        }
    }

    _getAttitudeText(bd) {
        const stage = bd.chatLevel;
        return stage >= 4 ? '她似乎已经倾心于你。' : stage >= 3 ? '她看起来很喜欢你。' : stage >= 2 ? '她似乎对你有些好感。' : stage >= 1 ? '她对你态度平淡。' : null;
    }

    _pickChatLine(bd, stage) {
        const pool = window.CHAT_LINES[bd.inner] || window.CHAT_LINES.unmarried;
        const c = randomEntry(pool['s' + stage]);
        return { narrator: fmtLine(c.n, bd), line: c.l, player: c.p ? fmtLine(c.p, bd) : null };
    }

    _pickKissScene(bd) {
        const pool = bd.chatLevel === 0 ? window.KISS_SCENES_FIRST : window.KISS_SCENES;
        const s = pickScene(pool, bd.inner);
        return { narrator: fmtLine(s.n, bd), line: fmtLine(s.l, bd) };
    }

    _chatFirstMet(venue, beauty) {
        const bd = beauty._beautyData;
        if (bd.chatLevel === 0) {
            if (computeFavorability(this.player, bd) >= 80) {
                bd.chatLevel = 4;
                this.showMessageSequence([
                    { text: `你走向${bd.name}，她见到你后眼中闪过一丝欣喜。`, type: 'narrator' },
                    { text: `你与她一番交谈，她对你颇为倾心，无所不谈。`, type: 'narrator' },
                ], () => {
                    this._ensureRedRecord(bd);
                    this.addMessage(`已将${bd.name}记入红颜录，可通过红颜录查询她的去向。`, 'system');
                    this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]);
                });
                return;
            }
            const outdoorVenues = ['断桥', '小溪', '田埂', '小树林', '村角', '集市'];
            if (outdoorVenues.includes(venue.name) && Math.random() < 0.5) {
                this._beautyOutdoorBattle(venue, beauty);
                return;
            }
            this.showMessageSequence([
                { text: `你走向${bd.name}，她态度冷冷，似乎不愿与你交谈。`, type: 'narrator' },
            ], () => this.enterVenue(venue));
            return;
        }
        const c = this._pickChatLine(bd, 0);
        bd._revealed.body = true;
        const msgs = [
            { text: c.narrator, type: 'narrator' },
        ];
        if (c.player) msgs.push({ text: c.player, type: 'narrator' });
        msgs.push(
            { text: `${bd.name}：${c.line}`, type: 'narrator' },
            { text: `一番闲谈之后，你得知她名叫${bd.name}。`, type: 'info' },
        );
        this._ensureRedRecord(bd);
        msgs.push({ text: `已将${bd.name}记入红颜录，可通过红颜录查询她的去向。`, type: 'system' });
        const gift = pickRegionalGift(this.currentLocation.id, Math.max(0, (bd.chatLevel || 0) - 1));
        if (gift) { bd._wantedGift = gift.id; msgs.push({ text: `${bd.name}提到她最近想要一件「${gift.name}」。`, type: 'event' }); }
        bd._chattedToday = true;
        msgs.push({ text: `${bd.name}离开了${venue.name}。`, type: 'narrator' });
        this.showMessageSequence(msgs, () => this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]));
    }

    _beautyOutdoorBattle(venue, beauty) {
        const bd = beauty._beautyData;
        const wildVenues = ['断桥', '小溪', '田埂', '小树林'];
        const isWild = wildVenues.includes(venue.name);
        const enemies = isWild ? ['dog_1', 'snake_1'] : ['thug_1', 'thug_2'];
        const key = enemies[Math.floor(Math.random() * enemies.length)];
        const enemy = createTravelEnemy(key);
        const intro = isWild
            ? `你正要上前与${bd.name}搭话，忽然${enemy.name}从旁边窜了出来，直扑${bd.name}！\n${bd.name}吓得花容失色，连连后退。`
            : `你正要上前与${bd.name}搭话，几个${enemy.name}围上前来，不怀好意地打量着她。\n${bd.name}面露惊慌，下意识地朝你这边靠了靠。`;
        this._questSeq([
            intro,
        ], () => {
            this.showChoices([
                { text: '出手相助', action: () => {
                    this._questSeq([
                        isWild ? '你大喝一声，挡在' + bd.name + '身前！' : '你冷笑一声，几步挡在' + bd.name + '面前：「活腻了？」',
                    ], () => {
                        this.startBattle(enemy,
                            () => {
                                this.addMessage(`你干净利落地击败了${enemy.name}！`, 'event');
                                this.addMessage(`${bd.name}松了口气，看向你的眼神多了几分感激和敬佩。`, 'narrator');
                                bd.chatLevel = 1;
                                this._chatFirstMet(venue, beauty);
                            },
                            () => this.gameOver(`你被${enemy.name}打成重伤，不治身亡。`),
                        );
                    });
                } },
                { text: '袖手旁观', action: () => {
                    this.addMessage(isWild
                        ? `你犹豫了一下，没有出手。${bd.name}惊叫着被${enemy.name}逼得步步后退。等你再回过神来，她已经不见了踪影。`
                        : `你犹豫了一下，没有上前。${bd.name}失望地看了你一眼，转身快步离开了。`, 'narrator');
                    this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]);
                } },
            ]);
        });
    }

    _chatProgressive(venue, beauty) {
        const bd = beauty._beautyData;
        const stage = bd.chatLevel;
        const stageLabels = ['粗谈一番', '你们再次相遇，相谈甚欢', '卧心长谈', '深入交流'];
        const c = this._pickChatLine(bd, stage);
        if (stage === 1) { bd._revealed.clothing = true; bd._revealed.height = true; }
        else if (stage === 2) { bd._revealed.age = true; }
        else if (stage === 3) { bd._revealed.measurements = true; bd._revealed.marital = true; }
        const msgs = [
            { text: `（${stageLabels[stage]}）`, type: 'system' },
            { text: c.narrator, type: 'narrator' },
        ];
        if (c.player) msgs.push({ text: c.player, type: 'narrator' });
        msgs.push({ text: `${bd.name}：${c.line}`, type: 'narrator' });
        if (stage === 3) {
            msgs.push({ text: `她告诉你她今年${bd.age}岁，${bd.surface === 'unmarried' ? '尚未婚配' : bd.surface === 'widow' ? '夫家已故，守寡至今' : '已嫁人'}${bd.surface === 'married_child' ? '，育有子女' : ''}。`, type: 'info' });
            msgs.push({ text: `你偷偷记下了她的三围：${bd.bust}-${bd.waist}-${bd.hips}。`, type: 'info' });
        }
        const gift = pickRegionalGift(this.currentLocation.id, bd.chatLevel || 0);
        if (gift) { bd._wantedGift = gift.id; msgs.push({ text: `${bd.name}提到她最近想要一件「${gift.name}」。`, type: 'event' }); }
        bd._chattedToday = true;
        msgs.push({ text: `${bd.name}离开了${venue.name}。`, type: 'narrator' });
        this.showMessageSequence(msgs, () => this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]));
    }

    _chatFlirtMode(venue, beauty) {
        const bd = beauty._beautyData;
        if (bd.flirtDay !== this.player.day) { bd.flirtCount = 0; bd.flirtDay = this.player.day; }
        bd.flirtCount++;
        if (bd.flirtCount >= 4) {
            if (this.isPublicVenue(venue)) {
                bd._chattedToday = true;
                this._negotiateCloudRain(venue, beauty, () => { this.clearChoices(); this.showOutdoorChoices(); });
                return;
            }
            this.addMessage(`夜色渐深，${bd.name}脸颊绯红，${getFlirtMood(bd)}。`, 'narrator');
            bd._chattedToday = true;
            this.showChoices([{ text: '……', action: () => {
                startCloudRain(bd, this.player, {
                    addMessage: (...a) => this.addMessage(...a),
                    showChoices: (...a) => this.showChoices(...a),
                    clearChoices: () => this.clearChoices(),
                    updateStatsBar: () => this.updateStatsBar(),
                    sleepToTomorrow: (v) => this.sleepToTomorrow(v),
                    ensureRedRecord: (b) => this._ensureRedRecord(b),
                    venue: venue,
                });
            } }]);
            return;
        }
        const line = randomEntry(FLIRT_LINES);
        const react = getReaction(bd);
        this.showMessageSequence([
            { text: '（调情）', type: 'system' },
            { text: line, type: 'narrator' },
            { text: `${bd.name}：${react}`, type: 'html' },
        ], () => {
            this.updateStatsBar();
            this.showChoices([
                { text: '继续调情', action: () => this.chatBeauty(venue, beauty) },
                { text: '让她离开', action: () => { bd._chattedToday = true; this.clearChoices(); this.addMessage(`${bd.name}离开了${venue.name}。`, 'narrator'); setTimeout(() => this.showOutdoorChoices(), 300); } },
            ]);
        });
    }

    _chatPostIntimate(venue, beauty) {
        const bd = beauty._beautyData;
        this.addMessage('你们已经无话不谈，但她似乎还想更进一步……', 'narrator');
        const intChoices = [
            { text: '接吻', action: () => this.kissBeauty(venue, beauty) },
            { text: '揩油', action: () => this.gropeBeauty(venue, beauty) },
        ];
        if (this.isPublicVenue(venue)) {
            intChoices.push({ text: '云雨', action: () => this._negotiateCloudRain(venue, beauty, () => this._chatPostIntimate(venue, beauty)) });
        } else {
            intChoices.push({ text: '云雨', action: () => this.sexBeauty(venue, beauty) });
        }
        intChoices.push({ text: '离开', action: () => this.showOutdoorChoices() });
        this.showChoices(intChoices);
    }

    chatBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        if (bd._chattedToday) {
            this.addMessage(`${bd.name}今天已经来过了，改天再来吧。`, 'narrator');
            this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]);
            return;
        }
        const stage = bd.chatLevel;
        if (stage >= 4) {
            if (bd._hadSex) return this._chatFlirtMode(venue, beauty);
            return this._chatPostIntimate(venue, beauty);
        }
        if (stage === 0) return this._chatFirstMet(venue, beauty);
        this._chatProgressive(venue, beauty);
    }


    getKissScene(bd) {
        return this._pickKissScene(bd);
    }

    actBeauty(venue, beauty) {
        this.clearChoices();
        this.addMessage(`你想做些什么？`, 'narrator');
        const bd = beauty._beautyData;
        const choices = [];
        if (bd.chatLevel > 0) {
          if (bd._wantedGift && this.player.items.some(i => i.id === bd._wantedGift)) {
            choices.push({ text: '送礼', action: () => this.giftBeauty(venue, beauty) });
          }
          choices.push({ text: '送诗', action: () => this.poemBeauty(venue, beauty) });
        }
        choices.push({ text: '返回', action: () => this.interactBeauty(venue, beauty) });
        this.showChoices(choices);
    }

    giftBeauty(venue, beauty) {
        this.clearChoices();
        const p = this.player;
        const bd = beauty._beautyData;
        const wantedId = bd._wantedGift;
        const idx = p.items.findIndex(i => i.id === wantedId);
        if (idx === -1) {
            this.addMessage(`${bd.name}想要的东西你好像没有……`, 'narrator');
            setTimeout(() => this.actBeauty(venue, beauty), 400);
            return;
        }
        const item = p.items[idx];
        const favGain = Math.max(1, Math.floor(item.value * 0.5));
        this.addMessage(`${bd.name}上次提到她想要一件「${item.name}」，你正好有。`, 'narrator');
        this.showChoices([
            { text: `送出${item.name}`, action: () => this.doGift(venue, beauty, item, idx, favGain) },
            { text: '算了', action: () => this.actBeauty(venue, beauty) },
        ]);
    }

    doGift(venue, beauty, item, idx, favGain) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.player.items.splice(idx, 1);
        if (bd._wantedGift && item.id === bd._wantedGift) {
            bd._wantedGift = null;
            this.addMessage(`这正是她想要的！她眼中闪过惊喜的光芒。`, 'event');
        }
        bd.chatLevel = Math.min(4, (bd.chatLevel || 0) + 1);
        this.addMessage(`你将${item.name}送给${bd.name}，她很高兴。`, 'event');
        if (bd.chatLevel < 4) {
            const gift = pickRegionalGift(this.currentLocation.id, bd.chatLevel);
            if (gift) { bd._wantedGift = gift.id; this.addMessage(`${bd.name}提到她还想要一件「${gift.name}」。`, 'event'); }
        }
        setTimeout(() => this.interactBeauty(venue, beauty), 400);
    }

    poemBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        if (this.player.attrs.wit < 15) {
            this.addMessage('你搜肠刮肚也凑不出一句像样的诗，只好作罢。', 'narrator');
            setTimeout(() => this.actBeauty(venue, beauty), 400);
            return;
        }
        const success = Math.random() < this.player.attrs.wit / 100;
        if (success) {
            this.addMessage(`你吟了一首自己作的小诗，${bd.name}眼中闪过一丝惊喜。`, 'event');
        } else {
            this.addMessage(`你吟了一首诗，但${bd.name}似乎没听懂，尴尬地笑了笑。`, 'narrator');
        }
        setTimeout(() => this.interactBeauty(venue, beauty), 400);
    }

    intimateBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const choices = [
            { text: '接吻', action: () => this.kissBeauty(venue, beauty) },
            { text: '揩油', action: () => this.gropeBeauty(venue, beauty) },
        ];
        if (bd.chatLevel >= 4) {
            if (this.isPublicVenue(venue)) {
                choices.push({ text: '云雨', action: () => this._negotiateCloudRain(venue, beauty, () => this.intimateBeauty(venue, beauty)) });
            } else {
                choices.push({ text: '云雨', action: () => this.sexBeauty(venue, beauty) });
            }
        }
        choices.push({ text: '返回', action: () => this.interactBeauty(venue, beauty) });
        this.showChoices(choices);
    }

    kissBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const scene = this.getKissScene(bd);
        const segs = this._splitKissDesc(scene.narrator);
        const showNext = (i) => {
            if (i < segs.length) {
                this.clearChoices();
                this.addMessage(segs[i], 'narrator');
                this.showChoices([{ text: '继续', action: () => showNext(i + 1) }]);
            } else {
                this.addMessage(scene.line, 'narrator');
                this.updateStatsBar();
                setTimeout(() => this.interactBeauty(venue, beauty), 500);
            }
        };
        showNext(0);
    }

    _splitKissDesc(text) {
        const segs = [];
        let buf = '';
        for (let i = 0; i < text.length; i++) {
            buf += text[i];
            if (text[i] === '。' || text[i] === '！' || text[i] === '？') {
                const next = text[i + 1] || '';
                if (next === '」' || next === '』') {
                    buf += next; i++;
                }
                segs.push(buf.trim());
                buf = '';
            }
        }
        if (buf.trim()) segs.push(buf.trim());
        return segs.length > 1 ? segs : [text];
    }

    gropeBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.addMessage(`${bd.name}俏生生地站在你面前，你想对她哪里下手？`, 'narrator');
        this.showChoices([
            { text: '胸', action: () => this.gropeBodyPart(venue, beauty, 'chest') },
            { text: '腰', action: () => this.gropeBodyPart(venue, beauty, 'waist') },
            { text: '臀', action: () => this.gropeBodyPart(venue, beauty, 'hips') },
            { text: '腿', action: () => this.gropeBodyPart(venue, beauty, 'legs') },
            { text: '算了', action: () => this.intimateBeauty(venue, beauty) },
        ]);
    }

    gropeBodyPart(venue, beauty, bodyPart) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const line = pickGropeBodyScene(bd, bodyPart);
        this.addMessage(line, 'narrator');
        this.updateStatsBar();
        this.showChoices([
            { text: '继续', action: () => this.gropeBeauty(venue, beauty) },
            { text: '返回', action: () => this.intimateBeauty(venue, beauty) },
        ]);
    }

    sexBeauty(venue, beauty) {
        const bd = beauty._beautyData;
        startCloudRain(bd, this.player, {
            addMessage: (...a) => this.addMessage(...a),
            showChoices: (...a) => this.showChoices(...a),
            clearChoices: () => this.clearChoices(),
            updateStatsBar: () => this.updateStatsBar(),
            sleepToTomorrow: (v) => this.sleepToTomorrow(v),
            ensureRedRecord: (b) => this._ensureRedRecord(b),
            venue: venue,
        });
    }

    _goToHomeSex(venue, beauty) {
        const homeVenue = { ...venue, name: '她家' };
        this.sexBeauty(homeVenue, beauty);
    }

    _goToInnSex(venue, beauty) {
        const innVenue = { ...venue, name: '客栈厢房' };
        this.sexBeauty(innVenue, beauty);
    }

    _negotiateCloudRain(venue, beauty, returnTo) {
        this.clearChoices();
        const bd = beauty._beautyData;
        if (!this.isPublicVenue(venue)) {
            this.sexBeauty(venue, beauty);
            return;
        }
        this.addMessage(`${bd.name}脸颊绯红，低声道：「此处人多眼杂……不太方便。」`, 'narrator');
        this._showCloudRainChoices(venue, beauty, returnTo);
    }

    _showCloudRainChoices(venue, beauty, returnTo) {
        const bd = beauty._beautyData;
        const choices = [
            {
                text: '去她家',
                action: () => {
                    this.clearChoices();
                    const inner = bd.inner;
                    if (inner === 'widow') {
                        this.addMessage(`${bd.name}点了点头，低声道：「……跟奴家来吧。」`, 'narrator');
                        this._goToHomeSex(venue, beauty);
                    } else if (inner === 'unmarried') {
                        if (Math.random() < 0.5) {
                            this.addMessage(`${bd.name}摇了摇头，面露难色：「我家里有人……不太方便。」`, 'narrator');
                            this._showCloudRainChoices(venue, beauty, returnTo);
                        } else {
                            this.addMessage(`${bd.name}红着脸低声道：「家里没人……你跟我来。」`, 'narrator');
                            this._goToHomeSex(venue, beauty);
                        }
                    } else {
                        if (Math.random() < 0.5) {
                            this.addMessage(`${bd.name}低声道：「夫君在家……我们去客栈吧。」`, 'narrator');
                            this._goToInnSex(venue, beauty);
                        } else {
                            this.addMessage(`${bd.name}低声道：「夫君出门了……家里方便。」`, 'narrator');
                            this._goToHomeSex(venue, beauty);
                        }
                    }
                }
            },
            {
                text: '去客栈',
                action: () => {
                    this.clearChoices();
                    const loc = this.currentLocation;
                    let innCost = 10;
                    if (loc) {
                        const locType = getLocationTypeLabel(loc.id);
                        if (locType === LOCATION_TYPES.big_city) {
                            innCost = 50 + Math.floor(Math.random() * 51);
                        } else if (locType === LOCATION_TYPES.small_city) {
                            innCost = 30 + Math.floor(Math.random() * 31);
                        } else {
                            innCost = 10 + Math.floor(Math.random() * 11);
                        }
                    }
                    this.addMessage(`你低声道：「那我们去客栈开间房……」`, 'narrator');
                    this.addMessage(`${bd.name}红着脸点了点头。`, 'narrator');
                    this.showChoices([
                        {
                            text: `付${innCost}两银子`,
                            action: () => {
                                if (this.player.gold < innCost) {
                                    this.addMessage(`你摸了摸钱袋……银子不够。`, 'narrator');
                                    this._showCloudRainChoices(venue, beauty, returnTo);
                                    return;
                                }
                                this.player.gold -= innCost;
                                this.updateStatsBar();
                                this._goToInnSex(venue, beauty);
                            }
                        },
                        {
                            text: '太贵了，算了',
                            action: () => {
                                this.addMessage(`你摇了摇头：「改日再说吧。」`, 'narrator');
                                if (typeof returnTo === 'function') returnTo();
                                else this.showOutdoorChoices();
                            }
                        }
                    ]);
                }
            },
            {
                text: '算了',
                action: () => {
                    this.addMessage(`你摇了摇头：「改日再说吧。」`, 'narrator');
                    if (typeof returnTo === 'function') returnTo();
                    else this.showOutdoorChoices();
                }
            }
        ];
        this.showChoices(choices);
    }

    evilBeauty(venue, beauty) {
        this.clearChoices();
        this.addMessage(`你心中涌起邪恶的念头……`, 'narrator');
        const choices = [
            { text: '暗杀', action: () => this.killBeauty(venue, beauty) },
            { text: '算了', action: () => this.interactBeauty(venue, beauty) },
        ];
        if (this.isPublicVenue(venue)) {
            choices.unshift({ text: '强奸', action: () => { this.addMessage('此处人多眼杂，不便下手。', 'narrator'); this.evilBeauty(venue, beauty); } });
        } else {
            choices.unshift({ text: '强奸', action: () => this.rapeBeautyScene(venue, beauty) });
        }
        this.showChoices(choices);
    }

    rapeBeautyScene(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.player.reputation -= 2;
        this._adjEvil(10, '强奸');
        this._adjWorldHelp(-5, '强奸');
        bd.favorability = Math.max(0, bd.favorability - 30);
        this.updateStatsBar();
        startRapeScene(bd, this.player, {
            addMessage: (...a) => this.addMessage(...a),
            showChoices: (...a) => this.showChoices(...a),
            clearChoices: () => this.clearChoices(),
            updateStatsBar: () => this.updateStatsBar(),
            sleepToTomorrow: (v) => this.sleepToTomorrow(v),
            ensureRedRecord: (b) => this._ensureRedRecord(b),
            enterVenue: (v) => this.enterVenue(v),
            venue: venue,
        });
    }

    killBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        // 表声望：-10，大于 100 则扣 20%
        const repDeduction = this.player.reputation > 100 ? Math.floor(this.player.reputation * 0.2) : 10;
        this.player.reputation -= repDeduction;
        // 罪恶值（恶行累积）：+10，大于 100 则加 20%
        if (!this.player._evil) this.player._evil = 0;
        const innerGain = this.player._evil > 100 ? Math.floor(this.player._evil * 0.2) : 10;
        this.player._evil += innerGain;
        // 济苍生：同表声望算法
        const helpDeduction = this.player.reputation > 100 ? Math.floor(this.player.reputation * 0.2) : 10;
        this.player._worldHelp = Math.max(0, (this.player._worldHelp || 0) - helpDeduction);
        this.addMessage(`你趁${bd.name}不备，狠狠扼住了她的咽喉！`, 'danger');
        this.addMessage(`${bd.name}挣扎了几下，便不再动弹……`, 'danger');
        this.addMessage(`声望 -${repDeduction}（当前 ${this.player.reputation}）`, 'system');
        if (this.player.reputation <= -40) {
            this.updateStatsBar();
            this.gameOver(`你杀害${bd.name}的恶行令人发指，你恶贯满盈，江湖再无容身之处……`);
            return;
        }
        const key = 'beauty_' + bd.id;
        this.killedNpcs.add(key);
        venue.npcs = venue.npcs.filter(n => n !== beauty);
        const baitem = [...beauty.items];
        baitem.forEach(it => { const c = { ...it }; if (!this.autoEquip(c)) this.player.items.push(c); });
        this.addMessage(`你从${bd.name}身上搜刮了所有物品。`, 'event');
        this.updateStatsBar();
        setTimeout(() => this.enterVenue(venue), 500);
    }

    /* ─── 青楼 ─── */

    interactBrothel(venue, npc) {
        this.clearChoices();
        const locId = this.currentLocation.id;
        this.showMessageSequence([
            { text: `你走进${venue.name}，${npc.npcName}迎了上来。`, type: 'narrator' },
            { text: `${npc.npcName}：「${npc.npcDesc}」`, type: 'html' },
        ], () => this.showChoices([
            { text: '看看货物', action: () => {
                this.clearChoices();
                this.addMessage(`${npc.npcName}：「要点什么？」`, 'narrator');
                this.showChoices([
                    { text: '购买', action: () => this.buyFromNpc(venue, npc) },
                    { text: '出售', action: () => this.sellToNpc(venue, npc) },
                    { text: '返回', action: () => this.interactBrothel(venue, npc) },
                ]);
            }},
            { text: '找姑娘', action: () => this.brothelShowGirls(venue, npc) },
            { text: '算了', action: () => this.enterVenue(venue) },
        ]));
    }

    /* ─── 勾栏系统 ─── */

    brothelShowGirls(venue, npc) {
        this.clearChoices();
        const locId = this.currentLocation.id;
        const allProstitutes = this.brothelProstitutes[locId] || [];
        const pick = allProstitutes.sort(() => Math.random() - 0.5).slice(0, 2);
        this.addMessage(`${npc.npcName}笑着说：「今儿个有两位姑娘得空，您瞧瞧？」`, 'narrator');
        const choices = pick.map(p => ({
            text: `${p.name}【${p.beautyTierLabel}】${p.price}两/次`,
            action: () => this.brothelInteractProstitute(venue, npc, p),
        }));
        choices.push({ text: '不看了', action: () => this.interactBrothel(venue, npc) });
        this.showChoices(choices);
    }

    brothelInteractProstitute(venue, npc, prostitute) {
        this.clearChoices();
        this.showMessageSequence([
            { text: `${prostitute.name}「${prostitute.faceDesc}」`, type: 'html' },
            { text: `<span style="color:${prostitute.beautyTierColor}">【${prostitute.beautyTierLabel}】</span> 颜值 ${prostitute.faceScore} 身材 ${prostitute.bodyScore} 评分 ${prostitute.beautyScore}`, type: 'html' },
        ], () => this._brothelShowActions(venue, npc, prostitute));
    }

    _brothelShowActions(venue, npc, prostitute) {
        this.showChoices([
            { text: '聊天', action: () => {
                this.clearChoices();
                this.addMessage(`你和${prostitute.name}闲聊了几句，她笑语盈盈。`, 'narrator');
                this.showChoices([{ text: '返回', action: () => this._brothelShowActions(venue, npc, prostitute) }]);
            }},
            { text: `共度春宵（${prostitute.price}两）`, action: () => this._brothelTryHire(venue, npc, prostitute) },
            { text: '离开', action: () => this.brothelShowGirls(venue, npc) },
        ]);
    }

    _brothelTryHire(venue, npc, prostitute) {
        this.clearChoices();
        const p = this.player;
        const price = prostitute.price;

        if (p.gold >= price) {
            // 有钱：正常付钱
            p.gold -= price;
            const msgs = [
                `你掏出${price}两银子放在桌上。${prostitute.name}嫣然一笑，牵起你的手：「爷，里面请——」`,
                `你数出${price}两白银递过去，${prostitute.name}眼波流转，挽着你走向香闺。`,
                `${prostitute.name}接过银两，在你耳边轻声道：「爷真大方，今晚定让您尽兴。」说罢拉着你进了内室。`,
            ];
            this.addMessage(msgs[Math.floor(Math.random() * msgs.length)], 'event');
            this.updateStatsBar();
            return this.brothelSexProstitute(prostitute, venue);
        }

        // 钱不够：尝试用声望
        const repCost = Math.min(20, Math.ceil((price - p.gold) / 2));
        if (p.reputation >= repCost + 5) {
            // 声望够：扣声望抵账
            const paid = p.gold;
            p.gold = 0;
            p.reputation -= repCost;
            const msgs = [
                `你囊中羞涩，但${prostitute.name}听你报上名号后，目光微动：「原来是${p.name}大侠……那便破例一次吧。」`,
                `你苦笑一声，报出自己名号。${prostitute.name}掩口轻笑：「大名如雷贯耳，今日算是给公子一个面子。」`,
                `你讪讪地翻遍口袋，${npc.npcName}在一旁道：「这位爷手头紧，不过看在你名头的份上——下不为例。」`,
            ];
            this.addMessage(msgs[Math.floor(Math.random() * msgs.length)], 'event');
            this.addMessage(`（支付${paid}两 + 扣除声望 ${repCost}）`, 'system');
            this._adjEvil(1, '赊账嫖妓');
            this.updateStatsBar();
            return this.brothelSexProstitute(prostitute, venue);
        }

        // 钱不够 + 声望太低：被嘲讽
        const taunts = [
            `${prostitute.name}冷哼一声：「穷鬼也来逛窑子？也不撒泡尿照照自己。」${
                npc.npcName}在一旁阴阳怪气：「没银子还想睡姑娘，做你的春秋大梦去！」`,
            `${npc.npcName}脸色一沉：「没钱还敢点姑娘？来人啊，把这个不知天高地厚的东西轰出去！」${
                prostitute.name}掩着嘴窃笑。`,
            `${prostitute.name}懒洋洋地瞥了你一眼：「就这点身家也敢来${venue.name}充大爷？回去吧，别丢人现眼了。」`,
            `${npc.npcName}双手叉腰，唾沫横飞：「我说这位爷，您这点碎银子连茶钱都不够！要不您去城外破庙凑合一宿？」${
                prostitute.name}在一旁捂着嘴咯咯直笑。`,
        ];
        this.addMessage(taunts[Math.floor(Math.random() * taunts.length)], 'danger');
        p.reputation -= 4;
        this.addMessage(`（声望 -4）`, 'system');
        this.updateStatsBar();
        this.showChoices([{ text: '灰溜溜地离开', action: () => this.brothelShowGirls(venue, npc) }]);
    }

    /* ─── 勾栏云雨（调用独立 brothel_cloud_rain.js） ─── */

    brothelSexProstitute(prostitute, venue) {
        startBrothelRain(prostitute, this.player, {
            addMessage: (...a) => this.addMessage(...a),
            showChoices: (...a) => this.showChoices(...a),
            clearChoices: () => this.clearChoices(),
            updateStatsBar: () => this.updateStatsBar(),
            sleepToTomorrow: (v) => this.sleepToTomorrow(v),
            venue: venue,
        });
    }

    /* ─── 红颜录 ─── */

    showRedRecord() {
        this.clearChoices();
        const entries = Object.values(this.redRecord);
        if (entries.length === 0) {
            this.showMessageSequence([
                { text: '—— 红颜录 ——', type: 'system' },
                { text: '你尚未与任何女子结下情缘。', type: 'narrator' },
            ], () => this.showChoices([{ text: '收起', action: () => this.showLocationChoices() }]));
            return;
        }
        this.addMessage('—— 红颜录 ——', 'system');
        const choices = entries.map(r => {
            const label = `${r.name}【${r.beautyTierLabel}】`;
            return { text: label, action: () => this.showRedRecordDetail(r) };
        });
        choices.push({ text: '收起', action: () => this.showLocationChoices() });
        this.showChoices(choices);
    }

    showRedRecordDetail(r) {
        this.clearChoices();
        let locStr = '未知';
        for (const locId in this.beautyMap) {
            const beauties = this.beautyMap[locId];
            const found = beauties.find(b => b.id === r.id);
            if (found) {
                if (found._currentLocId) {
                    const loc = getAllLocations().find(l => l.id === found._currentLocId);
                    const region = getRegionLabel(found._currentLocId);
                    locStr = `【${region}】${loc ? loc.name : found._currentLocId} · ${found._currentVenueName || '街上'}`;
                }
                break;
            }
        }
        if (locStr === '未知') {
            for (const locId in this.brothelProstitutes) {
                const pros = this.brothelProstitutes[locId];
                const found = pros.find(p => p.id === r.id);
                if (found) {
                    const loc = getAllLocations().find(l => l.id === locId);
                    const region = getRegionLabel(locId);
                    locStr = `【${region}】${loc ? loc.name : locId} · 青楼`;
                    break;
                }
            }
        }
        const msgs = [
            { text: `<span style="color:${r.beautyTierColor}">【${r.beautyTierLabel}】</span>颜值 ${r.faceScore||'?'}  身材 ${r.bodyScore||'?'}  评分 ${r.beautyScore}`, type: 'html' },
            { text: `容貌：${r.faceDesc}`, type: 'info' },
        ];
        if (r._revealed && r._revealed.body) msgs.push({ text: `身材：${r.bodyDesc}`, type: 'info' });
        if (r._revealed && r._revealed.age) msgs.push({ text: `年龄：约${r.age}岁`, type: 'info' });
        if (r._revealed && r._revealed.height) msgs.push({ text: `身高：${r.height}cm${r.heightLabel ? '（' + r.heightLabel + '）' : ''}`, type: 'info' });
        if (r._revealed && r._revealed.measurements) msgs.push({ text: `三围：${r.bust}-${r.waist}-${r.hips}`, type: 'info' });
        if (r._revealed && r._revealed.marital) {
            const ms = r.surface === 'unmarried' ? '未婚' : r.surface === 'married' ? '已婚' : r.surface === 'married_child' ? '已婚已育' : '寡妇';
            msgs.push({ text: `婚育：${ms}`, type: 'info' });
        }
        msgs.push({ text: `云雨次数：${r.sexCount}`, type: 'info' });
        if (r.favPos) {
            const posName = SEX_POSITIONS[r.favPos] ? SEX_POSITIONS[r.favPos].name : r.favPos;
            msgs.push({ text: `最爱的姿势：${posName}`, type: 'info' });
        }
        msgs.push({ text: `今日位置：${locStr}`, type: 'narrator' });
        this.showMessageSequence(msgs, () => this.showChoices([
            { text: '返回列表', action: () => this.showRedRecord() },
            { text: '收起', action: () => this.showLocationChoices() },
        ]));
    }

    /* ─── 游戏结束 ─── */

    _triggerRepGameOver() {
        if (this._repGameOverTriggered) return;
        this._repGameOverTriggered = true;
        this.gameOver('你恶贯满盈，江湖之大已无容身之处。天下英雄人人得而诛之，你最终伏诛于武林正道之手……');
    }

    gameOver(reason, npc = null) {
        this.addMessage(`━━━ Game Over ━━━`, 'system');
        setTimeout(() => {
            document.getElementById('gameover-reason').textContent = reason;
            document.getElementById('gameover-overlay').classList.remove('hidden');
        }, 3000);
    }

    _syncQuestStage(stage) {
        if (!this.player.activeQuests) this.player.activeQuests = {};
        if (!this.player.activeQuests.rescue_ox) {
            this.player.activeQuests.rescue_ox = { stage, _local: this.player._questRescueOx || {} };
        }
        this.player.activeQuests.rescue_ox.stage = stage;
    }

    _triggerRescueOx() {
        if (!this.player._questRescueOx) this.player._questRescueOx = {};
        const q = this.player._questRescueOx;
        if (q._done) { this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices(); return; }
        if (!q.stage) q.stage = 'TRIGGER';
        if (typeof this.questAdvance === 'function') {
            if (!this.player.activeQuests) this.player.activeQuests = {};
            if (!this.player.completedQuests) this.player.completedQuests = {};
            if (this.player.completedQuests.rescue_ox) { this._afterQuestChoices(); return; }
            this.player.activeQuests.rescue_ox = { stage: q.stage, dayStarted: this.player.day, _local: q };
            this.questAdvance('rescue_ox');
            return;
        }
        this._syncQuestStage(q.stage);
        this._inlineQuestTrigger(q);
    }

    _inlineQuestTrigger(q) {
        this._questSeq_fallback([
            questDisplayName('rescue_ox'),
            '你走出大门，沿着村道前行……',
            '忽然，你听到不远处传来打斗声和叫骂声。',
            '似乎是一个年轻人正在殴打老人。',
        ], () => {
            this.showChoices([
                { text: '不管闲事', action: () => { q._done = true; this._questSeq_fallback(['你摇了摇头，转身离开。'], () => { this._afterQuestChoices(); }); } },
                { text: '过去看看', action: () => { q.stage = 'FIGHT_SCENE'; this._syncQuestStage('FIGHT_SCENE'); this._inlineQuestRescueOx(q); } },
            ]);
        });
    }

    _inlineQuestRescueOx(q) {
        const s = q.stage;
        if (s === 'FIGHT_SCENE') {
            this._questSeq_fallback([
                '你快步走近，只见一个二十出头的年轻人正按着一位花甲老人拳打脚踢。',
                '老人蜷缩在地上，满脸是血，口中不住地哀求。',
                '年轻人却不管不顾，一边打一边骂。',
            ], () => {
                this.showChoices([
                    { text: '离开', action: () => { q._done = true; this._questSeq_fallback(['你转身离开。'], () => { this._afterQuestChoices(); }); } },
                    { text: '上前阻挠', action: () => {
                        this._questSeq_fallback([
                            '你上前一把抓住年轻人的手腕，沉声道：「住手！」',
                            '年轻人猛地甩开你的手，怒目而视：「你是谁？凭什么管我家的事！」',
                            '「少管闲事！不然连你一起打！」他摆开架势，朝你扑了过来。',
                        ], () => {
                            const cp = (this.currentLocation && this.currentLocation.guardianPower || 15) + 8;
                            this.startBattle(createGenericEnemy('愤怒的年轻人', cp), () => {
                                q.stage = 'REVEAL';
                                this._syncQuestStage('REVEAL');
                                this._inlineQuestReveal(q);
                            }, () => {
                                this._questSeq_fallback([
                                    '你竟不是他的对手，被他三拳两脚打翻在地。',
                                    '他冷哼一声，扶着老人走了。',
                                ], () => { this._afterQuestChoices(); });
                            });
                        });
                    } },
                ]);
            });
        } else if (s === 'REVEAL') {
            this._inlineQuestReveal(q);
        } else if (s === 'BUTCHER') {
            this._inlineQuestButcher(q);
        }
    }

    _inlineQuestReveal(q) {
        this._questSeq_fallback([
            '你三两下便将他制住，按在地上。',
            '他挣扎了几下，发现挣不脱，便放弃了抵抗。',
            '你喝道：「为何殴打老人？」',
            '他抬起头，你这才看清他满脸泪痕。',
            '「他是我爷爷……」他的声音哽咽了。',
            '你松开手，他坐在地上，双手抱头。',
            '他擦干眼泪，这才缓缓道来。',
            '「我爹走得早……家里就剩那头老黄牛犁地，撑了三十年……」',
            '「今年地里没打出多少粮，家里锅都揭不开了……我老婆饿得没奶水，娃儿整夜哭……」',
            '「爷爷他……背着我，把牛卖了……才卖了十两银子……」',
            '说到这，他再也忍不住，放声大哭。',
            '一个大男人，哭得像个孩子。',
            '「我打小就在那牛背上长大的……那牛老实啊，犁地从来不偷懒，一年到头就指着它吃饭……」',
            '「冬天它暖窝，夏天它驮柴，我爹在的时候拿它当命根子……」',
            '「那牛老了……陪了我二十年，就这么让人牵走了……」',
            '「我去肉铺想赎回来，可那张屠户咬死三十两，少一个子儿都不干！」',
            '「我没钱……我没法子啊……」他用力捶着自己的头。',
        ], () => {
            this.showChoices([
                { text: '不管了', action: () => {
                    this._questSeq_fallback(['你叹了口气，转身离去。'], () => {
                        q._done = true;
                        this._afterQuestChoices();
                    });
                } },
                { text: '给他三十两', action: () => this._inlineQuestGiveMoney(q) },
                { text: '我来想办法', action: () => {
                    this._questSeq_fallback([
                        '你拍了拍他的肩膀：「你先带爷爷回家治伤，这事我来想办法。」',
                        '他感激地看着你，扶着爷爷一瘸一拐地走了。',
                        '你决定去集市找那屠户谈谈。',
                    ], () => {
                        q.stage = 'BUTCHER';
                        this._syncQuestStage('BUTCHER');
                        if (!this._butcherSpawned && this.currentLocation) {
                            const v = this.currentLocation.venues.find(vv => vv.name === '肉铺');
                            if (v && v.npcs[0]) v.npcs[0]._questActive = true;
                            this._butcherSpawned = true;
                        }
                        this._afterQuestChoices();
                    });
                } },
            ]);
        });
    }

    _inlineQuestGiveMoney(q) {
        if (this.player.gold < 30) {
            this._questSeq_fallback([
                '你摸了摸钱袋，只有' + this.player.gold + '两银子……不够三十两。',
                '你惭愧地摇了摇头。',
            ], () => {
                this._questSeq_fallback([
                    '你拍了拍他的肩膀：「你先带爷爷回家治伤，这事我来想办法。」',
                    '他感激地看着你，扶着爷爷一瘸一拐地走了。',
                    '你决定去集市找那屠户谈谈。',
                ], () => {
                    q.stage = 'BUTCHER';
                    this._syncQuestStage('BUTCHER');
                    if (!this._butcherSpawned && this.currentLocation) {
                        const v = this.currentLocation.venues.find(vv => vv.name === '肉铺');
                        if (v && v.npcs[0]) v.npcs[0]._questActive = true;
                        this._butcherSpawned = true;
                    }
                    this._afterQuestChoices();
                });
            });
            return;
        }
        this.player.gold -= 30;
        this.updateStatsBar();
        this._questSeq_fallback([
            '你掏出三十两银子递给他。',
            '他瞪大了眼睛，连连摆手：「这……这怎么行！我不能要你的钱！」',
            '你不由分说，将银子塞进他手里。',
            '他捧着银子，浑身颤抖，扑通一声跪在地上。',
            '「恩人！大恩人！」他连连磕头，额头都磕破了。',
            '他擦干眼泪，飞奔而去。',
            '过了不久，你听到远处传来一声悠长的牛哞。',
            '他牵着那头老黄牛回来了，牛尾巴悠闲地甩着。',
            '老黄牛用头蹭着年轻人的手，像在安慰他。',
            '年轻人牵着牛，朝你深深一揖。',
        ], () => {
            q._done = true;
            this.player.reputation += 10;
            this._adjEvil(5, '支线');
            this.updateStatsBar();
            this.addMessage('声望 +10', 'system');
            this.addMessage('济苍生 +5', 'system');
            this._afterQuestChoices();
        });
    }

    _inlineQuestButcher(q) {
        if (!this.currentLocation) { this._afterQuestChoices(); return; }
        const venue = this.currentLocation.venues.find(v => v.name === '肉铺');
        if (!venue || !venue.npcs[0]) {
            this._questSeq_fallback(['屠户不知道去哪儿了。'], () => { this._afterQuestChoices(); });
            return;
        }
        if (venue.npcs[0]) venue.npcs[0]._questActive = true;
        this._butcherSpawned = true;
        this._afterQuestChoices();
    }

    _questSeq_fallback(messages, onDone) {
        let i = 0;
        const next = () => {
            if (i < messages.length) {
                this.addMessage(messages[i], 'narrator');
                i++;
                this.showChoices([{ text: '继续', action: next }]);
            } else if (onDone) {
                onDone();
            }
        };
        next();
    }

    _afterQuestChoices() {
        this.showChoices([
            { text: '继续', action: () => {
                this.clearChoices();
                this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices();
            } },
        ]);
    }

    /* ─── 告示栏系统 ─── */

    _generateBoardQuests() {
        if (!this.player || !this.currentLocation) return;
        const loc = this.currentLocation;
        if (!loc.id) return;
        const village = WORLD.villages.find(v => v.id === loc.id);
        if (!village || village.venues.length < 4) return;
        const existing = this.player._boardQuests || [];
        const hasIncomplete = existing.some(q => !q.completed);
        if (hasIncomplete) return;
        const rng = Math.random;
        const quests = [];
        const targetVillages = WORLD.villages.filter(v => v.id !== loc.id);
        if (targetVillages.length > 0) {
            const tv = targetVillages[Math.floor(rng() * targetVillages.length)];
            const validVenues = tv.venues.filter(v =>
                v.npcs && v.npcs.length > 0
                && !['村角', '村长家', '小树林', '黑市', '肉铺'].includes(v.name)
            );
            if (validVenues.length > 0) {
                const vv = validVenues[Math.floor(rng() * validVenues.length)];
                const npc = vv.npcs[0];
                quests.push({
                    type: 'deliver',
                    title: `送信到${tv.name}`,
                    desc: `请将一封书信送到${tv.name}的${vv.name}，交给${npc.npcName}。`,
                    targetVillageId: tv.id,
                    targetVillageName: tv.name,
                    targetVenueName: vv.name,
                    targetNpcName: npc.npcName,
                    reward: 10,
                    accepted: false,
                    completed: false,
                });
            }
        }
        const beasts = [
            { key: 'wolf', name: '野狼', cp: 15, desc: '最近小树林里来了一条野狼，常常在夜间出没，请前往狩猎。' },
            { key: 'boar', name: '野猪', cp: 22, desc: '一头野猪在小树林里乱窜，拱坏了不少地，请前往猎杀。' },
            { key: 'python', name: '巨蟒', cp: 18, desc: '小树林里出现了一条巨蟒，路人纷纷绕道，请前往铲除。' },
            { key: 'bear', name: '黑熊', cp: 35, desc: '一只黑熊从深山里跑了出来，在小树林里伤人，请前往讨伐！' },
            { key: 'tiger', name: '猛虎', cp: 45, desc: '不得了！一只吊睛白额猛虎盘踞在小树林中，村中无人敢近。请壮士务必出手！' },
        ];
        const huntCount = 1 + Math.floor(rng() * 2);
        const shuffled = [...beasts].sort(() => rng() - 0.5);
        for (let i = 0; i < Math.min(huntCount, shuffled.length); i++) {
            const b = shuffled[i];
            const rewardMap = { wolf: 12, boar: 18, python: 15, bear: 28, tiger: 35 };
            quests.push({
                type: 'hunt', title: `猎杀${b.name}`, desc: b.desc,
                beastKey: b.key, beastName: b.name, beastCp: b.cp,
                count: 1, progress: 0, reward: rewardMap[b.key],
                accepted: false, completed: false,
            });
        }
        const gatherTasks = [
            { item: 'firewood', name: '柴火', count: 5, reward: 8, label: '捆' },
            { item: 'iron_ore', name: '铁矿', count: 3, reward: 12, label: '块' },
            { item: 'coal', name: '煤炭', count: 3, reward: 10, label: '块' },
            { item: 'fish_carp', name: '鲤鱼', count: 3, reward: 10, label: '条' },
            { item: 'meat_rabbit', name: '兔肉', count: 3, reward: 10, label: '份' },
        ];
        if (rng() < 0.6) {
            const gt = gatherTasks[Math.floor(rng() * gatherTasks.length)];
            quests.push({
                type: 'gather', title: `收集${gt.name}`,
                desc: `请收集${gt.count}${gt.label}${gt.name}，交给村里。`,
                itemId: gt.item, itemName: gt.name,
                count: gt.count, progress: 0, reward: gt.reward,
                accepted: false, completed: false,
            });
        }
        this.player._boardQuests = quests;
    }

    _showNoticeBoard(venue) {
        this.clearChoices();
        const loc = this.currentLocation;
        let quests = this.player._boardQuests;
        if (!quests || quests.every(q => q.completed)) {
            this._generateBoardQuests();
            quests = this.player._boardQuests;
        }
        if (!quests || quests.length === 0) {
            this.addMessage('告示栏上空空如也，什么任务也没有。', 'narrator');
            setTimeout(() => this.enterVenueInner(venue), 300);
            return;
        }
        this.addMessage(`你走到${loc.name}的告示栏前，上面贴着几张告示：`, 'narrator');
        const choices = quests.map((q, i) => {
            if (q.completed) {
                return { text: `✓ ${q.title}（可领取赏银${q.reward}两）`, action: () => this._collectBoardReward(i, venue) };
            } else if (q.accepted) {
                let prog = '已接取', canClaim = false;
                if (q.type === 'hunt') { prog = q.progress >= q.count ? '可领取奖励' : `进度 ${q.progress}/${q.count}`; canClaim = q.progress >= q.count; }
                else if (q.type === 'gather') {
                    const has = (this.player.items || []).filter(it => it.id === q.itemId).length;
                    q.progress = Math.min(q.count, has);
                    prog = q.progress >= q.count ? '可提交领取奖励' : `进度 ${q.progress}/${q.count}`;
                    canClaim = q.progress >= q.count;
                }
                if (canClaim) return { text: `${q.title}（${prog}）`, action: () => this._collectBoardReward(i, venue) };
                return { text: `${q.title}（${prog}）`, action: () => this._showNoticeBoard(venue) };
            } else {
                return { text: `${q.title}（报酬 ${q.reward}两·揭榜）`, action: () => this._acceptBoardQuest(i, venue) };
            }
        });
        choices.push({ text: '返回', action: () => this.enterVenueInner(venue) });
        this.showChoices(choices);
    }

    _acceptBoardQuest(idx, venue) {
        const q = this.player._boardQuests[idx];
        if (!q || q.accepted) return;
        q.accepted = true;
        this.addMessage(`你揭下了「${q.title}」的告示。`, 'narrator');
        setTimeout(() => this._showNoticeBoard(venue), 300);
    }

    _collectBoardReward(idx, venue) {
        const q = this.player._boardQuests[idx];
        if (!q) return;
        if (q.type === 'gather') {
            if (q.progress < q.count) return;
            let remaining = q.count;
            for (let i = this.player.items.length - 1; i >= 0 && remaining > 0; i--) {
                if (this.player.items[i].id === q.itemId) {
                    this.player.items.splice(i, 1);
                    remaining--;
                }
            }
        } else if (!q.completed) {
            return;
        }
        this.player.gold += q.reward;
        this.addMessage(`你完成了「${q.title}」，获得 ${q.reward}两赏银。`, 'system');
        if (q.type === 'hunt') {
            const repGain = q.beastCp <= 10 ? 1 : q.beastCp <= 20 ? 2 : q.beastCp <= 35 ? 3 : 5;
            this.player.reputation += repGain;
            this.addMessage(`声望 +${repGain}`, 'system');
        } else {
            this.player.reputation += 1;
            this.addMessage(`声望 +1`, 'system');
        }
        this.player._boardQuests.splice(idx, 1);
        this.updateStatsBar();
        setTimeout(() => this._showNoticeBoard(venue), 300);
    }

    _getActiveBoardHuntQuest() {
        if (!this.player._boardQuests) return null;
        return this.player._boardQuests.find(q => q.type === 'hunt' && q.accepted && !q.completed && q.progress < q.count) || null;
    }

    _getBoardDeliverMatch(npcName, venueName) {
        if (!this.player._boardQuests) return null;
        return this.player._boardQuests.find(q =>
            q.type === 'deliver' && q.accepted && !q.completed
            && q.targetNpcName === npcName && q.targetVenueName === venueName
        ) || null;
    }

    _startBoardHuntBattle(quest) {
        const enemy = createGenericEnemy(quest.beastName, quest.beastCp);
        this.startBattle(enemy, () => {
            quest.progress = Math.min(quest.count, quest.progress + 1);
            this.addMessage(`你成功猎杀了${quest.beastName}！`, 'event');
            if (quest.progress >= quest.count) {
                quest.completed = true;
                this.addMessage(`「${quest.title}」已完成，可以回告示栏领取赏银了。`, 'event');
            }
            this.updateStatsBar();
            setTimeout(() => this.showOutdoorChoices(), 400);
        }, () => {
            this.addMessage('你被野兽击败了……', 'narrator');
            setTimeout(() => this.showOutdoorChoices(), 400);
        }, () => {
            this.addMessage('你仓皇逃离了小树林。', 'narrator');
            setTimeout(() => this.showOutdoorChoices(), 400);
        });
    }

    _boardDeliverLetter(quest, venue) {
        quest.completed = true;
        this.clearChoices();
        this.addMessage(`你取出一封书信，递了过去：「这是${quest.targetVillageName}给您的信。」`, 'narrator');
        this.addMessage(`${quest.targetNpcName}接过信，拆开看了看，点头道：「有劳了，替我谢谢${quest.targetVillageName}的老朋友。」`, 'info');
        this.addMessage(`送信完成！可以回告示栏领取赏银了。`, 'system');
        this.updateStatsBar();
        setTimeout(() => this.enterVenue(venue), 400);
    }

}

const game = new Game();
