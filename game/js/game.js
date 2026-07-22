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

class Game {
    constructor() {
        this.freePoints = 30;
        this.createValues = {};
        this.player = null;
        this.currentLocation = null;
        this.killedNpcs = new Set();
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

    startGame() {
        if (this.remainingPoints < 0) return;
        const attrs = {};
        for (const attr of ATTRIBUTES) attrs[attr.key] = this.createValues[attr.id];

        this.player = {
            attrs,
            hp: 10, maxHp: 10,
            energy: 0, maxEnergy: 0,
            day: 1, level: 1, exp: 0,
            gold: 0, reputation: 10,
            items: [],
            equipment: { rightHand:null, leftHand:null, head:null, upperBody:null, lowerBody:null, boots:null, bracers:null, accessory1:null, accessory2:null },
            externalSkills: [],
            internalSkills: ['天之书'],
            locationId: null,
        };

        const sv = WORLD.villages[Math.floor(Math.random() * WORLD.villages.length)];
        this.player.locationId = sv.id;
        this.beautyMap = {};
        for (const loc of getAllLocations()) {
            const type = loc.nearestCity ? 'village' : WORLD.big_cities.find(c => c.id === loc.id) ? 'big_city' : 'small_city';
            this.beautyMap[loc.id] = generateBeauties(loc.id, type);
        }
        document.getElementById('create-overlay').classList.add('hidden');
        this.updateStatsBar();
        this.showIntro();
    }

    /* ─── 序章 ─── */

    showIntro() {
        this.clearLog();
        this.clearChoices();
        const segs = [
            '你猛地睁开双眼。',
            '脑海中最后的记忆，是天劫雷光劈落的那一刻——亿万雷霆将你的肉身与元神一同撕碎。',
            '你——曾经叱咤风云、傲视九天的大能——渡劫失败了。',
            '恍惚中你看见一张熟悉到令人心寒的面孔。你的师父。那个你最信任的人，在你渡劫的最关键时刻，动了手脚。',
            '如今你重返凡尘。元神尽毁，灵脉俱断，一身通天修为荡然无存。',
            '你落入了一个灵气稀薄的低武世界。昔日的仇敌，恐怕早已以为你灰飞烟灭。',
            '唯一剩下的，只有脑海中那半部《天之书》残本。那是上古流传的无上心法，可惜你记忆不全，只记得上半卷。',
            '但，够了。这一世，你要从零开始，一步一步——让那些背叛你的人，付出代价。',
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
        this.addMessage('你缓缓睁开双眼，刺眼的阳光透过茅草屋顶的缝隙洒在脸上。', 'narrator');
        this.addMessage('你坐起身来，环顾四周——一间简陋的茅屋，几张破旧的家具。', 'narrator');
        this.addMessage('你，重生了。', 'system');
        this.enterLocation(this.player.locationId, false);
    }

    /* ─── 状态条 ─── */

    getRepInfo(rep) {
        if (rep <= 2) return { label: '声名狼藉', color: '#804040' };
        if (rep <= 4) return { label: '臭名昭著', color: '#a05050' };
        if (rep <= 6) return { label: '风评不佳', color: '#b07050' };
        if (rep <= 8) return { label: '默默无闻', color: '#606060' };
        if (rep <= 10) return { label: '初入江湖', color: '#808080' };
        if (rep <= 12) return { label: '小有名气', color: '#5090c0' };
        if (rep <= 14) return { label: '声名鹊起', color: '#40a080' };
        if (rep <= 16) return { label: '名震一方', color: '#8060d0' };
        if (rep <= 18) return { label: '威震天下', color: '#d0a040' };
        if (rep <= 20) return { label: '武林泰斗', color: '#e08030' };
        return { label: '名动江湖', color: '#ff6040' };
    }

    getPlayerCombatPower() {
        const p = this.player;
        const weaponSlots = ['rightHand', 'leftHand'];
        let weaponBonus = 0;
        for (const s of weaponSlots) {
            if (p.equipment[s]) weaponBonus += p.equipment[s].value;
        }
        return Math.floor(p.attrs.root * 0.5 + p.attrs.dexterity * 0.5 + weaponBonus);
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
        const mpPct = p.maxEnergy > 0 ? Math.floor(p.energy / p.maxEnergy * 100) : 0;
        document.getElementById('hp-fill').style.width = Math.max(0, hpPct) + '%';
        document.getElementById('hp-text').textContent = `${p.hp}/${p.maxHp}`;
        document.getElementById('mp-fill').style.width = Math.max(0, mpPct) + '%';
        document.getElementById('mp-text').textContent = `${p.energy}/${p.maxEnergy}`;
        const st = document.getElementById('hp-status');
        if (hpPct < 30) { st.textContent = '致命伤'; st.style.color = '#ff4040'; }
        else if (hpPct < 50) { st.textContent = '重伤'; st.style.color = '#ff8040'; }
        else if (hpPct < 70) { st.textContent = '轻伤'; st.style.color = '#ffc040'; }
        else st.textContent = '';
        p.hp = Math.max(0, p.hp); p.energy = Math.max(0, p.energy);
        const ri = this.getRepInfo(p.reputation);
        document.getElementById('gold-text').textContent = p.gold + ' 两';
        document.getElementById('rep-text').textContent = ri.label;
        document.getElementById('rep-text').style.color = ri.color;
        document.getElementById('day-text').textContent = p.day;
    }

    getItemStock(item) {
        if (item.special) return 1;
        if (item.value <= 3) return 5;
        if (item.value <= 10) return 3;
        if (item.value <= 20) return 2;
        return 1;
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
        document.getElementById('menu-stats').innerHTML = `
            ${rl}
            <div class="stat-line"><span>等级</span><span>Lv.${p.level}</span></div>
            <div class="stat-line"><span>经验</span><span>${p.exp}/100</span></div>
            <div class="stat-line"><span>气血</span><span>${p.hp}/${p.maxHp}</span></div>
            <div class="stat-line"><span>精力</span><span>${p.energy}/${p.maxEnergy}</span></div>
            <div class="stat-line"><span>银两</span><span>${p.gold} 两</span></div>
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

    /* ─── 地点系统 ─── */

    enterLocation(locationId, clear = true) {
        const loc = getAllLocations().find(l => l.id === locationId);
        if (!loc) return;
        this.player.locationId = locationId;
        this.currentLocation = loc;
        this.player.locationVenues = loc.venues.map(v => ({
            ...v,
            npcs: v.npcs.map(n => ({
                ...n,
                _defaultItems: n.items.map(i => ({ ...i })),
                items: n.items.map(i => {
                    const stock = this.getItemStock(i);
                    return { ...i, stock, maxStock: stock };
                }),
            })).filter(n => !this.killedNpcs.has(loc.id + ':' + v.name + ':' + n.npcName)),
        }));
        this.assignBeauties(loc);
        const tl = getLocationTypeLabel(loc.id);
        if (clear) this.clearLog();
        this.clearChoices();
        this.addMessage(`━━━ ${tl.label} · ${loc.name} ━━━`, 'system');
        this.addMessage(`「${loc.desc}」`, 'info');
        this.addMessage(`人口 ${loc.population.toLocaleString()}  |  面积 ${loc.area}${loc.areaUnit}  |  经济 ${getEconomyLabel(loc.economy)}`, 'info');
        if (loc.factions && loc.factions.length) this.addMessage(`本地势力：${loc.factions.map(f => f.name).join('、')}`, 'system');
        if (loc.nearestCity) {
            const city = getAllLocations().find(l => l.id === loc.nearestCity);
            if (city) this.addMessage(`最近城镇：${getLocationTypeLabel(city.id).label} · ${city.name}（${loc.distanceToCity}）`, 'info');
        }
        this.addMessage('你打算怎么做？', 'narrator');
        this.showLocationChoices();
        this.updateStatsBar();
    }

    showLocationChoices() {
        this.showChoices([
            { text: '外出 · 四处走走', action: () => this.showOutdoorChoices() },
            { text: '居家 · 闭门修炼', action: () => this.showHomeChoices() },
            { text: '【个人状态】', action: () => this.showCharacterStatus() },
            { text: '【背包】', action: () => this.showInventory() },
        ]);
    }

    /* ─── 外出：场所系统 ─── */

    showOutdoorChoices() {
        const loc = this.currentLocation;
        const choices = this.player.locationVenues.map(v => ({
            text: v.name,
            action: () => this.enterVenue(v),
        }));
        choices.push({ text: '前往其他地方', action: () => this.showTravelOptions() });
        choices.push({ text: '回去', action: () => this.showLocationChoices() });
        this.addMessage(`—— ${loc.name}的街市 ——`, 'system');
        this.showChoices(choices);
    }

    enterVenue(venue) {
        this.clearChoices();
        this.addMessage(`你走进${venue.name}。`, 'narrator');
        const alive = venue.npcs.filter(n => !n._killed);
        if (alive.length === 0) {
            this.addMessage('里面空无一人……', 'narrator');
            setTimeout(() => this.showOutdoorChoices(), 400);
            return;
        }
        const choices = alive.map(npc => ({
            text: npc.npcName,
            action: () => this.interactNpc(venue, npc),
        }));
        choices.push({ text: `离开${venue.name}`, action: () => this.showOutdoorChoices() });
        this.showChoices(choices);
    }

    interactNpc(venue, npc) {
        if (npc.isBeauty) { this.interactBeauty(venue, npc); return; }
        this.clearChoices();
        this.addMessage(`${npc.npcName}：「${npc.npcDesc}」`, 'info');
        const choices = [
            { text: '闲谈', action: () => this.chatWithNpc(venue, npc) },
            { text: '购买', action: () => this.buyFromNpc(venue, npc) },
            { text: '出售', action: () => this.sellToNpc(venue, npc) },
        ];
        if (!npc.civilian && npc.combatPower > 0 && !npc._defeated) {
            choices.push({ text: '对决', action: () => this.duelWithNpc(venue, npc, { label: '对决' }) });
        }
        choices.push({ text: '不义之举', action: () => this.showUnrighteousActs(venue, npc) });
        choices.push({ text: '返回', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    showUnrighteousActs(venue, npc) {
        this.clearChoices();
        this.addMessage(`你心中泛起了些见不得光的念头……`, 'narrator');
        const choices = [];
        if (!npc._caught) {
            choices.push({ text: '偷窃', action: () => this.attemptSteal(venue, npc) });
        }
        if (!npc._defeated && !npc._killed) {
            choices.push({ text: '偷袭', action: () => this.duelWithNpc(venue, npc, { powerMult: 0.5, initRepCost: 1, noCombatRepChange: true, label: '偷袭' }) });
            choices.push({ text: '暗杀', action: () => this.duelWithNpc(venue, npc, { powerMult: 0.5, initRepCost: 3, noCombatRepChange: true, winGetAllItems: true, label: '暗杀' }) });
        }
        choices.push({ text: '算了', action: () => this.interactNpc(venue, npc) });
        this.showChoices(choices);
    }

    /* ─── 闲谈 ─── */

    chatWithNpc(venue, npc) {
        this.clearChoices();
        const chats = {
            '草药铺': [ '最近山里的药材越来越少，采药得走更远了。', '你懂药理吗？我这有几味好药……', '看你的气色，要不要抓副药调理调理？' ],
            '铁匠铺': [ '这铁是上好的百炼钢，一般人打不动。', '前两天有人来打了把好刀，那气势……', '你要是想打兵器，得自己带好铁来。' ],
            '酒馆': [ '客官来点什么？本店的招牌菜可是一绝。', '听说了吗？最近城外好像不太平。', '我这有坛十八年的女儿红，想不想尝尝？' ],
            '家': [ '村里最近倒是太平，没什么大事。', '你要是想找活干，可以去后山看看。', '唉，今年的收成不太好……' ],
            '府': [ '最近生意不太好做啊……', '你要是有什么好东西，可以卖给我。', '听说镇上来了个陌生人，你可要多加小心。' ],
        };
        const key = Object.keys(chats).find(k => venue.name.includes(k));
        const lines = chats[key] || ['今天天气不错。', '你好啊，有什么事吗？', '这日子一天天过，平淡是福。'];
        this.addMessage(npc.npcName + '：「' + lines[Math.floor(Math.random() * lines.length)] + '」', 'narrator');
        this.player.energy -= 2;
        this.updateStatsBar();
        setTimeout(() => this.interactNpc(venue, npc), 400);
    }

    /* ─── 对决 · 偷袭 · 暗杀 ─── */

    duelWithNpc(venue, npc, options = {}) {
        const { powerMult = 1, initRepCost = 0, noCombatRepChange = false, winGetAllItems = false, label = '对决' } = options;
        this.clearChoices();

        if (initRepCost > 0) {
            this.player.reputation -= initRepCost;
            this.addMessage(`声望 -${initRepCost}（当前 ${this.player.reputation}）`, 'system');
            if (this.player.reputation < 0) {
                this.updateStatsBar();
                this.gameOver('你声名狼藉，江湖再无容身之处……');
                return;
            }
        }

        const effectivePower = Math.floor(npc.combatPower * powerMult);
        const pPower = this.getPlayerCombatPower();
        const nPower = effectivePower;
        const ratio = nPower / Math.max(1, pPower);
        const defense = this.getPlayerDefense();

        this.addMessage(`你${label === '偷袭' ? '趁' + npc.npcName + '不备猛然出手' : label === '暗杀' ? '眼中杀机毕露，直取' + npc.npcName + '要害' : '向' + npc.npcName + '拱手道："请指教！"'}` + '！', 'narrator');

        if (ratio >= 3) {
            this.addMessage(`${npc.npcName}的实力远超你的想象，你一招都没接住！`, 'danger');
            this.addMessage('天地倒转，你重重摔在地上……', 'danger');
            this.player.hp = 0;
            this.updateStatsBar();
            this.gameOver(`${npc.npcName}的实力远在你之上，你……死了。`);
            return;
        }

        if (ratio >= 1.5) {
            const rawDmg = Math.max(1, nPower - defense);
            const dmg = Math.floor(rawDmg * 1.5);
            this.player.hp -= dmg;
            this.addMessage(`${npc.npcName}迅速反击，你完全无法招架！`, 'danger');
            this.addMessage(`你口吐鲜血，受到了 ${dmg} 点伤害！`, 'system');
            npc._defeated = true;
            if (this.player.hp <= 0) {
                this.updateStatsBar();
                this.gameOver('你伤重不治……');
                return;
            }
            if (!noCombatRepChange) {
                this.player.reputation = Math.max(0, this.player.reputation - 1);
                this.addMessage(`声望 -1（当前 ${this.player.reputation}）`, 'system');
            }
            this.updateStatsBar();
            setTimeout(() => this.interactNpc(venue, npc), 500);
            return;
        }

        if (ratio >= 0.67) {
            const winChance = 1 / (1 + ratio);
            if (Math.random() < winChance) {
                this.addMessage(`你与${npc.npcName}缠斗数十回合，终占上风！`, 'event');
                npc._defeated = true;
                if (label === '暗杀') { npc._killed = true; this.killedNpcs.add(this.currentLocation.id + ':' + venue.name + ':' + npc.npcName); this.addMessage(`${npc.npcName}缓缓倒下，再无声息……`, 'danger'); }
                if (winGetAllItems) {
                    const loot = [...npc.items];
                    loot.forEach(it => { const cloned = { ...it }; if (!this.autoEquip(cloned)) this.player.items.push(cloned); });
                    npc.items = [];
                    this.addMessage(`你从${npc.npcName}身上搜刮了所有物品！`, 'event');
                } else if (!noCombatRepChange) {
                    this.player.reputation += 1;
                    this.player.exp += 10;
                    this.addMessage(`声望 +1，经验 +10`, 'system');
                    this.checkLevelUp();
                }
            } else {
                const rawDmg = Math.max(1, nPower - defense);
                const dmg = Math.floor(rawDmg * 0.3) + 1;
                this.player.hp -= dmg;
                this.addMessage(`你未能得手，反被${npc.npcName}所伤。`, 'danger');
                this.addMessage(`你受了 ${dmg} 点伤。`, 'system');
                npc._defeated = true;
                if (this.player.hp <= 0) {
                    this.updateStatsBar();
                    this.gameOver('你伤重不治……');
                    return;
                }
                if (!noCombatRepChange) {
                    this.player.reputation = Math.max(0, this.player.reputation - 1);
                    this.addMessage(`声望 -1（当前 ${this.player.reputation}）`, 'system');
                }
            }
            this.updateStatsBar();
            setTimeout(() => this.interactNpc(venue, npc), 500);
            return;
        }

        this.addMessage(`${npc.npcName}在你面前毫无还手之力，瞬间落败！`, 'event');
        npc._defeated = true;
        if (label === '暗杀') { npc._killed = true; this.killedNpcs.add(this.currentLocation.id + ':' + venue.name + ':' + npc.npcName); this.addMessage(`${npc.npcName}缓缓倒下，再无声息……`, 'danger'); }
        if (winGetAllItems) {
            const loot = [...npc.items];
            loot.forEach(it => { const cloned = { ...it }; if (!this.autoEquip(cloned)) this.player.items.push(cloned); });
            npc.items = [];
            this.addMessage(`你从${npc.npcName}身上搜刮了所有物品！`, 'event');
        } else if (!noCombatRepChange) {
            this.player.reputation += 2;
            this.player.exp += 15;
            this.addMessage(`声望 +2，经验 +15`, 'system');
            this.checkLevelUp();
        }
        this.updateStatsBar();
        setTimeout(() => npc._killed ? this.enterVenue(venue) : this.interactNpc(venue, npc), 500);
    }

    /* ─── 购买 ─── */

    buyFromNpc(venue, npc) {
        this.clearChoices();
        const avail = npc.items.filter(it => it.stock > 0);
        if (avail.length === 0) {
            this.addMessage(npc.npcName + '：「不好意思，货都卖完了。」', 'narrator');
            setTimeout(() => this.interactNpc(venue, npc), 400);
            return;
        }
        this.addMessage(`—— ${venue.name} · ${npc.npcName}的货 ——`, 'system');
        const choices = avail.map((item, idx) => {
            const price = item.value * 3;
            return {
                text: `${item.name}（${price}两 · 余${item.stock}）—— ${item.desc}`,
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
        const choices = p.items.map((item, idx) => {
            const price = Math.max(1, Math.floor(item.value * 0.5));
            return {
                text: `${item.name} → 售价 ${price}两`,
                action: () => this.sellItem(venue, npc, idx, price),
            };
        });
        choices.push({ text: '算了', action: () => this.interactNpc(venue, npc) });
        this.showChoices(choices);
    }

    sellItem(venue, npc, idx, price) {
        this.clearChoices();
        const p = this.player;
        const item = p.items[idx];
        p.gold += price;
        p.items.splice(idx, 1);
        npc.items.push({ ...item, stock: 1, maxStock: 1 });
        this.addMessage(`你卖掉了${item.name}，获得 ${price}两。`, 'event');
        this.updateStatsBar();
        setTimeout(() => this.sellToNpc(venue, npc), 400);
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
                text: `［偷］${item.name}（余${item.stock} · 价值 ${item.value}两 · 难度 ${diff} · ~${pct}%）`,
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
            const stolen = { ...item };
            if (!this.autoEquip(stolen)) this.player.items.push(stolen);
            item.stock--;
            if (item.stock <= 0) this.addMessage(`${npc.npcName}身上已经没有这种物品了。`, 'info');
            this.updateStatsBar();
            setTimeout(() => this.interactNpc(venue, npc), 400);
        } else if (roll < chance + 0.12) {
            this.addMessage(`${npc.npcName}似乎察觉到了什么，回头看了一眼。你赶紧缩回手。`, 'narrator');
            this.addMessage('好险！差点被发现……', 'system');
            this.player.energy -= 5;
            this.updateStatsBar();
            setTimeout(() => this.interactNpc(venue, npc), 500);
        } else {
            this.addMessage(`「干什么！」${npc.npcName}一把抓住你的手腕！`, 'danger');
            this.addMessage('你奋力挣脱，狼狈逃开。周围的人都在指指点点。', 'danger');
            this.player.reputation -= 1;
            npc._caught = true;
            this.addMessage(`声望 -1（当前 ${this.player.reputation}）`, 'system');
            if (this.player.reputation < 0) {
                this.gameOver('你偷盗失手被当场拿获，被扭送官府。江湖之路，到此为止……');
                return;
            }
            this.player.energy -= 10;
            this.updateStatsBar();
            setTimeout(() => this.enterVenue(venue), 500);
        }
    }

    /* ─── 背包 ─── */

    showInventory() {
        this.clearChoices();
        const p = this.player;
        if (p.items.length === 0) {
            this.addMessage('你的背包空空如也。', 'narrator');
        } else {
            this.addMessage('—— 背包 ——', 'system');
            for (const item of p.items) {
                this.addMessage(`${item.name}：${item.desc}（价值 ${item.value}两）`, 'info');
            }
        }
        this.addMessage(`银两：${p.gold}两 | 物品：${p.items.length}件`, 'system');
        setTimeout(() => this.showLocationChoices(), 300);
        this.showChoices([{ text: '收起背包', action: () => this.showLocationChoices() }]);
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
        this.addMessage('', 'narrator');
        this.addMessage('—— 装备 ——', 'system');
        let combatStr = `战斗力：${this.getPlayerCombatPower()}`;
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
        this.showChoices([
            { text: '练习外功', action: () => this.showExternalPractice() },
            { text: '练习心法', action: () => this.practiceInternal() },
            { text: '睡到明天', action: () => this.sleepToTomorrow() },
            { text: '回去', action: () => this.showLocationChoices() },
        ]);
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
            const choices = skills.map(s => ({ text: s.name, action: () => this.practiceExternalSkill(s) }));
            choices.push({ text: '算了', action: () => this.showHomeChoices() });
            this.showChoices(choices);
        }
    }

    exercise() {
        this.clearChoices();
        this.player.attrs.root += 1;
        this.player.maxHp += 1;
        this.player.hp = this.player.maxHp;
        this.player.exp += 3;
        this.player.day += 1;
        this.addMessage('你扎稳马步，一趟拳法打完，浑身大汗淋漓。', 'narrator');
        this.addMessage('虽然动作笨拙，但感觉筋骨舒展开了不少。', 'event');
        this.addMessage(`根骨 +1（${this.player.attrs.root}），气血 +1（${this.player.maxHp}），经验 +3`, 'system');
        this.checkLevelUp();
        this.updateStatsBar();
        setTimeout(() => this.showLocationChoices(), 400);
    }

    practiceExternalSkill(skill) {
        this.clearChoices();
        this.addMessage(`你开始练习${skill.name}……`, 'narrator');
        this.addMessage('你反复演练招式，武艺更加精纯了。', 'event');
        this.player.exp += 10;
        this.player.day += 1;
        this.addMessage('获得 10 点经验', 'system');
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
        this.player.maxEnergy += 1;
        this.player.energy = this.player.maxEnergy;
        this.player.exp += 5;
        this.player.day += 1;
        this.addMessage(`精力上限 +1（${this.player.maxEnergy}），经验 +5`, 'system');
        this.checkLevelUp();
        this.updateStatsBar();
        setTimeout(() => this.showLocationChoices(), 400);
    }

    sleepToTomorrow() {
        this.clearChoices();
        this.addMessage('你回到住处，吹灭油灯，倒在床上沉沉睡去……', 'narrator');
        this.addMessage('一夜无梦。', 'narrator');
        this.player.hp = this.player.maxHp;
        this.player.energy = this.player.maxEnergy;
        this.player.day += 1;
        this.addMessage('一觉醒来，神清气爽。气血和精力已完全恢复。', 'system');
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
            this.player.locationVenues.forEach(v => v.npcs = v.npcs.filter(n => !n.isBeauty));
            this.assignBeauties(this.currentLocation);
        }
        this.updateStatsBar();
        setTimeout(() => this.showLocationChoices(), 400);
    }

    checkLevelUp() {
        if (this.player.exp >= 100) {
            this.player.exp = 0;
            this.player.level++;
            this.player.maxHp += 5;
            this.player.maxEnergy += 3;
            this.player.hp = this.player.maxHp;
            this.player.energy = this.player.maxEnergy;
            this.addMessage(`━━━ 恭喜！升至 Lv.${this.player.level}！气血 +5，精力 +3 ━━━`, 'system');
        }
    }

    /* ─── 旅行 ─── */

    showTravelOptions() {
        this.clearChoices();
        const others = getAllLocations().filter(l => l.id !== this.player.locationId).sort(() => Math.random() - 0.5).slice(0, 4);
        const choices = others.map(loc => ({ text: `前往 ${getLocationTypeLabel(loc.id).label} · ${loc.name}`, action: () => this.travelTo(loc.id) }));
        choices.push({ text: '算了', action: () => this.showOutdoorChoices() });
        this.addMessage('你盘算着下一站去哪儿……', 'narrator');
        this.showChoices(choices);
    }

    travelTo(locationId) {
        this.clearChoices();
        this.addMessage('你收拾好行囊踏上了旅程……', 'narrator');
        this.player.energy -= 10;
        const luck = Math.random() < this.player.attrs.luck / 200;
        const danger = Math.random() < 0.15;
        setTimeout(() => {
            if (danger && this.player.attrs.root < 25) {
                this.addMessage('路上遇到毛贼！你被打了一顿抢走几两银子。', 'danger');
                this.player.gold = Math.max(0, this.player.gold - 5);
                this.player.hp -= 15;
            } else if (danger) {
                this.addMessage('路上遇到毛贼劫道，你打发了他们，缴获了些银两。', 'event');
                this.player.gold += 3; this.player.exp += 5;
            } else if (luck) {
                this.addMessage('运气不错！路边发现一株百年灵芝。', 'event');
                this.player.items.push({ ...getItem('ginseng_100'), name: '百年灵芝' });
            } else {
                this.addMessage('一路风平浪静。', 'narrator');
            }
            this.updateStatsBar();
            setTimeout(() => this.enterLocation(locationId), 400);
        }, 600);
    }

    /* ─── 美女系统 ─── */

    assignBeauties(loc) {
        const beauties = this.beautyMap[loc.id];
        if (!beauties || beauties.length === 0) return;
        const venues = this.player.locationVenues;
        if (venues.length === 0) return;
        for (const b of beauties) {
            if (this.killedNpcs.has('beauty_' + b.id)) continue;
            const vi = Math.floor(Math.random() * venues.length);
            venues[vi].npcs.push({
                npcName: b.name,
                npcDesc: '一位容貌出众的女子。',
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
        this.addMessage(`${bd.name}：「${bd.faceDesc}」`, 'html');
        this.addMessage(`好感度：${bd.favorability}`, 'info');
        const choices = [
            { text: '鉴赏', action: () => this.appreciateBeauty(venue, beauty) },
            { text: '聊天', action: () => this.chatBeauty(venue, beauty) },
            { text: '行动', action: () => this.actBeauty(venue, beauty) },
        ];
        if (bd.favorability >= 40) choices.push({ text: '亲密行为', action: () => this.intimateBeauty(venue, beauty) });
        choices.push({ text: '不义之举', action: () => this.evilBeauty(venue, beauty) });
        choices.push({ text: '离开', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    appreciateBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.addMessage(`你细细打量着${bd.name}……`, 'narrator');
        this.addMessage(`容貌：${bd.faceDesc}`, 'html');
        this.addMessage(`身材：${bd.bodyDesc}`, 'html');
        this.addMessage(`穿着：${bd.clothing}`, 'html');
        this.addMessage(`年龄：约${bd.age}岁  |  身高：${bd.height}cm`, 'info');
        this.addMessage(`三围：${bd.bust}-${bd.waist}-${bd.hips}`, 'info');
        this.showChoices([{ text: '返回', action: () => this.interactBeauty(venue, beauty) }]);
    }

    chatBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const fav = bd.favorability;
        if (fav < 10) {
            this.addMessage(`${bd.name}只是淡淡地看了你一眼，不愿多谈。`, 'narrator');
        } else if (fav < 20) {
            this.addMessage(`${bd.name}：「公子有什么事吗？」语气客气而疏离。`, 'narrator');
            if (!bd.known.name) { bd.known.name = true; this.addMessage(`你得知了她的名字——${bd.name}。`, 'event'); }
        } else if (fav < 40) {
            this.addMessage(`${bd.name}的态度缓和了许多，愿意和你说几句话。`, 'narrator');
            if (!bd.known.age) { bd.known.age = true; this.addMessage(`她今年${bd.age}岁。`, 'info'); }
        } else {
            this.addMessage(`${bd.name}对你嫣然一笑，亲近了许多。`, 'narrator');
            if (!bd.known.family) {
                bd.known.family = true;
                const fam = bd.married ? '已经嫁人' : '尚未婚配';
                const kid = bd.hasChildren ? '，育有子女' : '';
                this.addMessage(`她告诉你她${fam}${kid}。`, 'info');
            }
        }
        this.showChoices([{ text: '返回', action: () => this.interactBeauty(venue, beauty) }]);
    }

    actBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.addMessage(`你想做些什么？`, 'narrator');
        const choices = [
            { text: '送礼', action: () => this.giftBeauty(venue, beauty) },
            { text: '送诗', action: () => this.poemBeauty(venue, beauty) },
        ];
        choices.push({ text: '返回', action: () => this.interactBeauty(venue, beauty) });
        this.showChoices(choices);
    }

    giftBeauty(venue, beauty) {
        this.clearChoices();
        const p = this.player;
        const bd = beauty._beautyData;
        const giftable = p.items.filter(it => it.slot !== undefined || ['food','wine','jewelry','art','clothing'].includes(it.category));
        if (giftable.length === 0) {
            this.addMessage('你翻遍行囊，没什么拿得出手的东西。', 'narrator');
            setTimeout(() => this.actBeauty(venue, beauty), 400);
            return;
        }
        this.addMessage(`挑一件礼物送给${bd.name}：`, 'narrator');
        const choices = giftable.map((item, idx) => {
            const favGain = Math.max(1, Math.floor(item.value * 0.5));
            return { text: `${item.name}（好感 +${favGain}）`, action: () => this.doGift(venue, beauty, item, idx, favGain) };
        });
        choices.push({ text: '算了', action: () => this.actBeauty(venue, beauty) });
        this.showChoices(choices);
    }

    doGift(venue, beauty, item, idx, favGain) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.player.items.splice(idx, 1);
        bd.favorability = Math.min(100, bd.favorability + favGain);
        this.addMessage(`你将${item.name}送给${bd.name}，她很高兴。`, 'event');
        this.addMessage(`好感度 +${favGain}（当前 ${bd.favorability}）`, 'system');
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
            const gain = 5 + Math.floor(this.player.attrs.wit * 0.1);
            bd.favorability = Math.min(100, bd.favorability + gain);
            this.addMessage(`你吟了一首自己作的小诗，${bd.name}眼中闪过一丝惊喜。`, 'event');
            this.addMessage(`好感度 +${gain}（当前 ${bd.favorability}）`, 'system');
        } else {
            this.addMessage(`你吟了一首诗，但${bd.name}似乎没听懂，尴尬地笑了笑。`, 'narrator');
            bd.favorability = Math.max(0, bd.favorability - 1);
        }
        setTimeout(() => this.interactBeauty(venue, beauty), 400);
    }

    intimateBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const choices = [];
        if (bd.favorability >= 40) choices.push({ text: '接吻', action: () => this.kissBeauty(venue, beauty) });
        if (bd.favorability >= 70) choices.push({ text: '云雨', action: () => this.sexBeauty(venue, beauty) });
        choices.push({ text: '返回', action: () => this.interactBeauty(venue, beauty) });
        this.showChoices(choices);
    }

    kissBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const height = 155 + Math.min(35, Math.floor(this.player.attrs.root * 0.35));
        this.addMessage(`你轻轻揽住${bd.name}的腰，低头吻了上去。`, 'narrator');
        if (height >= 175) {
            this.addMessage(`${bd.name}需要微微仰头才能迎上你的唇，双颊绯红。`, 'narrator');
        } else {
            this.addMessage(`${bd.name}配合地微微低头，温热的气息扑面而来。`, 'narrator');
        }
        this.addMessage(`良久，唇分。${bd.name}羞红了脸，轻轻推开你。`, 'narrator');
        bd.favorability = Math.min(100, bd.favorability + 3);
        this.updateStatsBar();
        setTimeout(() => this.interactBeauty(venue, beauty), 500);
    }

    sexBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.addMessage(`夜色渐深，红烛摇曳。`, 'narrator');
        this.addMessage(`芙蓉帐暖，春宵一刻……`, 'narrator');
        this.addMessage(`（此处省略三千字）`, 'system');
        this.addMessage(`云收雨歇，${bd.name}依偎在你怀中，满脸幸福。`, 'narrator');
        bd.favorability = Math.min(100, bd.favorability + 8);
        this.player.energy -= 20;
        this.updateStatsBar();
        setTimeout(() => this.interactBeauty(venue, beauty), 500);
    }

    evilBeauty(venue, beauty) {
        this.clearChoices();
        this.addMessage(`你心中涌起邪恶的念头……`, 'narrator');
        this.showChoices([
            { text: '强奸', action: () => this.rapeBeauty(venue, beauty) },
            { text: '暗杀', action: () => this.killBeauty(venue, beauty) },
            { text: '算了', action: () => this.interactBeauty(venue, beauty) },
        ]);
    }

    rapeBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.player.reputation -= 2;
        this.addMessage(`你扑向${bd.name}，她惊恐地挣扎尖叫！`, 'danger');
        this.addMessage(`你强行占有了她……`, 'danger');
        this.addMessage(`声望 -2（当前 ${this.player.reputation}）`, 'system');
        bd.favorability = Math.max(0, bd.favorability - 30);
        if (this.player.reputation < 0) {
            this.updateStatsBar();
            this.gameOver('你恶贯满盈，江湖再无容身之处……');
            return;
        }
        this.updateStatsBar();
        setTimeout(() => this.enterVenue(venue), 500);
    }

    killBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        this.player.reputation -= 6;
        this.addMessage(`你趁${bd.name}不备，狠狠扼住了她的咽喉！`, 'danger');
        this.addMessage(`${bd.name}挣扎了几下，便不再动弹……`, 'danger');
        this.addMessage(`声望 -6（当前 ${this.player.reputation}）`, 'system');
        if (this.player.reputation < 0) {
            this.updateStatsBar();
            this.gameOver('你恶贯满盈，江湖再无容身之处……');
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

    /* ─── 游戏结束 ─── */

    gameOver(reason) {
        document.getElementById('gameover-reason').textContent = reason;
        document.getElementById('gameover-overlay').classList.remove('hidden');
    }
}

const game = new Game();
