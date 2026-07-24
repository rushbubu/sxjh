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

const ITEM_TIER_LABELS = { blue:'蓝色', purple:'紫色', orange:'橙色', gold:'金色' };

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

        this.player = {
            attrs,
            hp: 10, maxHp: 10,
            neili: 0, maxNeili: 0,
            day: 1, level: 1, exp: 0,
            gold: 0, reputation: 10,
            shadowRep: 0,
            timePeriod: '清晨',
            items: [],
            equipment: { rightHand:null, leftHand:null, head:null, upperBody:null, lowerBody:null, boots:null, bracers:null, accessory1:null, accessory2:null },
            externalSkills: [],
            internalSkills: ['天之经'],
            locationId: null,
            villageBlacklist: {},
        };

        const sv = WORLD.villages[Math.floor(Math.random() * WORLD.villages.length)];
        this.player.locationId = sv.id;
        this.player.startingVillage = sv.id;
        this.player.mainQuest = 0;
        this.player._questFirstEntry = true;
        const usedNames = new Set();
        this.beautyMap = {};
        for (const loc of getAllLocations()) {
            const type = loc.nearestCity ? 'village' : WORLD.big_cities.find(c => c.id === loc.id) ? 'big_city' : 'small_city';
            this.beautyMap[loc.id] = generateBeauties(loc.id, type, usedNames);
        }
        this.brothelProstitutes = {};
        for (const loc of getAllLocations()) {
            if (loc.id === 'dali') continue;
            const type = loc.nearestCity ? null : WORLD.big_cities.find(c => c.id === loc.id) ? 'big_city' : 'small_city';
            if (type) this.brothelProstitutes[loc.id] = generateProstitutes(loc.id, type, usedNames);
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
            '最后的记忆，是华山之巅。',
            '那一剑从背后刺入，穿胸而过——你的师弟沈清寒，你最信任的师弟，在你全力激战之时，递出了致命一剑。',
            '你——华山派大弟子，江湖上赫赫有名的剑客——坠入了万劫深渊。',
            '耳边还回响着他冷冰冰的声音：「师兄，这掌门之位就归我了。」',
            '万劫深渊，深不见底，自古无人能生还。但你竟没有死。',
            '坠落途中，怀里的古老竹简突然发光——是师父交给你的天之书残本。',
            '那是《天之经》残本，上古无上心法。经文虽不全，却已深深刻入你的魂魄。',
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
        p.hp = Math.max(0, p.hp); p.neili = Math.max(0, p.neili);
        const ri = this.getRepInfo(p.reputation);
        const wi = this.getWealthInfo(p.gold);
        document.getElementById('gold-text').textContent = p.gold + ' 两';
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
            return `${s.name} Lv.${s.level}/${s.maxLevel}（${q.name}）`;
        }).join('、') : '无';
        const intSkills = p.internalSkills.length ? p.internalSkills.join('、') : '无';
        document.getElementById('menu-stats').innerHTML = `
            ${rl}
            <div class="stat-line"><span>等级</span><span>Lv.${p.level}</span></div>
            <div class="stat-line"><span>经验</span><span>${p.exp}/${this.getExpToNextLevel(p.level)}</span></div>
            <div class="stat-line"><span>气血</span><span>${p.hp}/${p.maxHp}</span></div>
            <div class="stat-line"><span>内力</span><span>${p.neili}/${p.maxNeili}</span></div>
            <div class="stat-line"><span>银两</span><span>${p.gold} 两</span></div>
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
                this.showChoices([{ text: '……', action: next }]);
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
            npcs: v.npcs.map(n => ({
                ...n,
                _defaultItems: n.items.map(i => ({ ...i })),
                items: n.items.map(i => {
                    const stock = this.getItemStock(i);
                    const item = { ...i, stock, maxStock: stock };
                    if (['blue','purple','orange','gold'].includes(item.tier)) item.name += ` ［${ITEM_TIER_LABELS[item.tier]}］`;
                    return item;
                }),
            })).filter(n => !this.killedNpcs.has(loc.id + ':' + v.name + ':' + n.npcName)),
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
        locSegs.push({ text: `「${loc.desc}」`, type: 'info' });
        locSegs.push({ text: `人口 ${loc.population.toLocaleString()}  |  面积 ${loc.area}${loc.areaUnit}  |  经济 ${getEconomyLabel(loc.economy)}`, type: 'info' });
        if (loc.factions && loc.factions.length) {
            locSegs.push({ text: `本地势力：${loc.factions.map(f => f.name).join('、')}`, type: 'system' });
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
            { text: '【睡到明天】', action: () => this.sleepToTomorrow() },
            { text: '【个人状态】', action: () => this.showCharacterStatus() },
            { text: '【背包】', action: () => this.showInventory() },
            { text: '【红颜录】', action: () => this.showRedRecord() },
        ]);
    }

    /* ─── 外出：场所系统 ─── */

    showOutdoorChoices() {
        const loc = this.currentLocation;
        const choices = [];
        const isVillage = !!loc.nearestCity;
        if (isVillage) {
            const groups = {
                '市集': this.player.locationVenues.filter(v => ['草药铺', '铁匠铺', '酒馆'].includes(v.name)),
                '村外': this.player.locationVenues.filter(v => ['小树林', '断桥', '小溪', '田埂'].includes(v.name)),
            };
            const others = this.player.locationVenues.filter(v =>
                !['草药铺', '铁匠铺', '酒馆', '断桥', '小溪', '田埂', '小树林'].includes(v.name)
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
            const specialResidences = ['醉花楼'];
            const isCityShop = v =>
                specialResidences.includes(v.name) ? false :
                specialShops.includes(v.name) ? true :
                shopKeys.some(s => v.name.includes(s)) || v.name.includes('楼');
            const groups = {
                '街市': this.player.locationVenues.filter(v => isCityShop(v)),
                '居民区': this.player.locationVenues.filter(v => !isCityShop(v)),
            };
            for (const [label, list] of Object.entries(groups)) {
                if (list.length > 0) choices.push({ text: label, action: () => this.showGroupVenues(label, list) });
            }
        }
        choices.push({ text: '前往其他地方', action: () => this.showTravelOptions() });
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
            if (['街角', '断桥', '小溪', '田埂', '小树林'].includes(venue.name)) return false;
            return true;
        }
        // 黄昏商店歇业，住宅/怡红院等仍营业
        if (t === '黄昏') {
            if (['街角', '断桥', '小溪', '田埂', '小树林'].includes(venue.name)) return false;
            if (['草药铺', '铁匠铺', '酒馆'].includes(venue.name)) return true;
            return false;
        }
        return false;
    }

    getVenueLockDifficulty(venue) {
        // 根据场所物品总价值估算撬锁难度
        const items = venue.npcs && venue.npcs.length > 0 ? venue.npcs[0].items : [];
        const totalValue = items.reduce((s, id) => {
            const item = getItem(id);
            return s + (item ? item.value : 0);
        }, 0);
        if (totalValue >= 100) return 50;
        if (totalValue >= 50) return 35;
        if (totalValue >= 20) return 25;
        return 15;
    }

    attemptPickLock(venue) {
        this.clearChoices();
        const dex = this.player.attrs.dexterity || 10;
        const diff = this.getVenueLockDifficulty(venue);
        const successChance = Math.min(0.9, dex / (diff + dex));
        this.addMessage(`你屏住呼吸，摸到门前，掏出随身铁片试着撬锁……`, 'narrator');
        if (Math.random() < successChance) {
            this.addMessage('锁「咔」一声开了！你闪身溜了进去，没有惊动任何人。', 'system');
            this.player.shadowRep += 1;
            this.updateStatsBar();
            this.enterVenueInner(venue);
        } else {
            this.addMessage('你正专心撬锁，突然远处传来一声大喝：「有贼！」', 'danger');
            this.player.reputation = Math.max(0, this.player.reputation - 5);
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
                { text: '撬锁', action: () => this.attemptPickLock(venue) },
                { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
            ]);
            return;
        }
        this.enterVenueInner(venue);
    }

    enterVenueInner(venue) {
        // Landlord gate check for starting village quest
        if (this.player.mainQuest === 1 && this.player.startingVillage === this.player.locationId && venue.name.endsWith('府')) {
            this.addMessage(`你来到${venue.name}门前，只见朱门紧闭，门口站着两个虎背熊腰的家丁。`, 'narrator');
            this.addMessage(`其中一个家丁上前一步，横臂拦住去路：「站住！你是何人？我家老爷岂是你想见就见的？」`, 'narrator');
            const loc = this.currentLocation;
            const repNeed = 20 + Math.floor(Math.random() * 6);
            const goldNeed = Math.max(50, 80 + (loc.economy === 'moderate' ? 50 : 0));
            this.showChoices([
                { text: `报上名号（需要${repNeed}点声望）`, action: () => {
                    if (this.player.reputation >= repNeed) {
                        this.addMessage(`你朗声道：「在下华山${this.player.attrs.name || '无名'}，有事求见你家老爷。」`, 'narrator');
                        this.addMessage(`家丁上下打量了你一番，态度缓和了些：「原来是江湖上的朋友，失敬失敬！快请进！」`, 'narrator');
                        this.landlordQuestGrant(venue);
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
                        this.landlordQuestGrant(venue);
                    } else {
                const short = goldNeed - this.player.gold;
                this.addMessage(`你摸了摸钱袋，还差${short}两。家丁冷笑一声：「没钱还想见我家老爷？打发叫花子呢！」`, 'narrator');
                        setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400);
                    }
                }},
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

        const nightTime = this.player.timePeriod === '黄昏' || this.player.timePeriod === '子时';
        const alive = venue.npcs.filter(n =>
            !n._killed
            && !(n.isBeauty && n._beautyData && n._beautyData._chattedToday)
            && !(nightTime && n._forestType)
        );
        if (alive.length === 0) {
            this.addMessage('里面空无一人……', 'narrator');
            if (venue.name === '小树林' && this.player.items.some(i => i.id === 'knife_wood')) {
                this.showChoices([
                    { text: '砍柴（根骨 +1）', action: () => {
                        this.clearChoices();
                        this.player.attrs.root += 1;
                        this.player.exp += 2;
                        this.addMessage('你抡起柴刀，劈了半个时辰的柴火。出了一身汗，但筋骨更结实了。', 'narrator');
                        this.addMessage(`根骨 +1（当前 ${this.player.attrs.root}），经验 +2`, 'system');
                        this.advanceTime();
                        this.updateStatsBar();
                        setTimeout(() => this.enterVenueInner(venue), 400);
                    }},
                    { text: '离开', action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) },
                ]);
            } else {
                setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400);
            }
            return;
        }
        const choices = alive.map(npc => ({
            text: npc.isChief ? `村长 · ${npc.npcName}` : npc.npcName,
            action: () => this.interactNpc(venue, npc),
        }));
        // 小树林：有柴刀可自行砍柴
        if (venue.name === '小树林' && this.player.items.some(i => i.id === 'knife_wood')) {
            choices.splice(choices.length, 0, { text: '砍柴（根骨 +1）', action: () => {
                this.clearChoices();
                this.player.attrs.root += 1;
                this.player.exp += 2;
                this.addMessage('你抡起柴刀，劈了半个时辰的柴火。出了一身汗，但筋骨更结实了。', 'narrator');
                this.addMessage(`根骨 +1（当前 ${this.player.attrs.root}），经验 +2`, 'system');
                this.advanceTime();
                this.updateStatsBar();
                setTimeout(() => this.enterVenueInner(venue), 400);
            }});
        }
        choices.push({ text: `离开${venue.name}`, action: () => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()) });
        this.showChoices(choices);
    }

    landlordQuestGrant(venue) {
        this.clearChoices();
        const landlord = venue.npcs[0];
        const loc = this.currentLocation;
        const gift = Math.max(30, 50 + (loc.economy === 'moderate' ? 30 : 0));
        this.player.gold += gift;
        this.player.mainQuest = 2;
        this.showMessageSequence([
            { text: `你走进${venue.name}，${landlord.npcName}正端坐在太师椅上喝茶。`, type: 'narrator' },
            { text: `${landlord.npcName}见你进来，放下茶盏：「你就是他们说的那位少侠？不知找老夫有何贵干？」`, type: 'narrator' },
            { text: `你拱手道：「晚辈想打听一个人——沈清寒。」`, type: 'narrator' },
            { text: `${landlord.npcName}沉吟片刻：「沈清寒……这个名字老夫倒是在一次商旅中听人提过。」`, type: 'narrator' },
            { text: `${landlord.npcName}：「此人似乎与中原武林的一些大人物有来往，具体的老夫也不甚清楚。」`, type: 'narrator' },
            { text: `${landlord.npcName}：「老夫建议你去城里打听打听，那些酒楼茶肆里三教九流的人多，消息比我这小地方灵通得多。」`, type: 'narrator' },
            { text: `${landlord.npcName}：「这点盘缠你拿着，就当老夫结个善缘。」`, type: 'narrator' },
            { text: `获得了 ${gift} 两银子。`, type: 'system' },
            { text: `你现在可以离开村庄，前往其他地方打探消息了。`, type: 'info' },
        ], () => {
            this.showChoices([
                { text: '多谢老员外', action: () => { this.addMessage('你辞别了员外，走出了大门。', 'narrator'); setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400); } },
            ]);
        });
    }

    landlordFightGuards(venue) {
        this.clearChoices();
        this.addMessage(`你大喝一声：「让开！」挥拳朝家丁冲了过去。`, 'narrator');
        const guardPower = this.currentLocation.guardianPower || 20;
        const enemy = createGuardEnemy('家丁', guardPower);
        this.startBattle(enemy,
            () => {
                this.showMessageSequence([
                    { text: `三拳两脚，两个家丁便躺在地上哀嚎不止。`, type: 'narrator' },
                    { text: `大门「吱呀」一声开了，${venue.npcs[0].npcName}站在门口，面色不悦。`, type: 'narrator' },
                    { text: `${venue.npcs[0].npcName}：「少侠好身手，既然能打到这来，那就进来说话吧。」`, type: 'narrator' },
                ], () => this.landlordQuestGrant(venue));
            },
            () => {
                this.addMessage(`你虽然勇猛，但家丁显然练过几年把式，几招下来便把你架住扔了出去。`, 'danger');
                this.addMessage(`你摔了个灰头土脸，只得狼狈离去。`, 'narrator');
                setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400);
            }
        );
    }

    isBrothelVenue(venue) {
        return ['怡红院','醉花楼','潇湘阁','春风楼','牡丹院','锦官阁','汉水楼','烟雨阁'].includes(venue.name);
    }

    interactNpc(venue, npc) {
        if (npc.isBeauty) { this.interactBeauty(venue, npc); return; }
        if (npc.isChief) { this.chiefAction(venue, npc); return; }
        if (this.isBrothelVenue(venue)) { this.interactBrothel(venue, npc); return; }
        if (venue.name === '街角') { this.beggarAction(venue, npc); return; }
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
        // 小树林：猎人或樵夫专属
        if (npc._forestType === 'hunter' && !npc._killed) {
            choices.splice(choices.length, 0, { text: '帮助打猎', action: () => this.huntWithHunter(venue, npc) });
        }
        if (npc._forestType === 'woodcutter' && !npc._killed) {
            choices.splice(choices.length, 0, { text: '帮助砍柴', action: () => this.chopWithWoodcutter(venue, npc) });
        }
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

    /* ─── 闲谈 ─── */

    chatWithNpc(venue, npc) {
        this.clearChoices();
        const chats = {
            '草药铺': [ '最近山里的药材越来越少，采药得走更远了。', '你懂药理吗？我这有几味好药……', '看你的气色，要不要抓副药调理调理？' ],
            '铁匠铺': [ '这铁是上好的百炼钢，一般人打不动。', '前两天有人来打了把好刀，那气势……', '你要是想打兵器，得自己带好铁来。' ],
            '酒馆': [ '客官来点什么？本店的招牌菜可是一绝。', '听说了吗？最近城外好像不太平。', '我这有坛十八年的女儿红，想不想尝尝？' ],
            '家': [ '村里最近倒是太平，没什么大事。', '你要是想找活干，可以去后山看看。', '唉，今年的收成不太好……' ],
            '府': [ '最近生意不太好做啊……', '你要是有什么好东西，可以卖给我。', '听说镇上来了个陌生人，你可要多加小心。' ],
            '街角': [ '行行好，赏口饭吃吧……', '我已经三天没吃东西了……', '这年头，活着真难啊。', '大爷您行行好，我给你磕头了！' ],
            '猎人': [ '后山的猎物越来越精了，不好打。', '你要是想试试身手，可以跟我进山。', '猎了一辈子，这山里的东西没人比我更熟。', '昨天打了个大家伙，够吃好几天了。' ],
            '樵夫': [ '这柴劈起来也有门道，顺着纹路才省力。', '山上的木头硬得很，我这把刀都快卷刃了。', '每天砍柴，倒也自在。', '你要是有空，可以搭把手。' ],
        };
        const key = Object.keys(chats).find(k => venue.name.includes(k) || (npc._forestType && npc._forestType === k));
        const lines = chats[key] || ['今天天气不错。', '你好啊，有什么事吗？', '这日子一天天过，平淡是福。'];
        this.addMessage(npc.npcName + '：「' + lines[Math.floor(Math.random() * lines.length)] + '」', 'narrator');
        this.player.neili -= 2;
        this.updateStatsBar();
        setTimeout(() => this.interactNpc(venue, npc), 400);
    }

    /* ─── 乞丐系统 ─── */

    beggarAction(venue, npc) {
        this.clearChoices();
        this.addMessage(`墙角的老乞丐缩了缩脖子，咧嘴露出一口黄牙：「爷，赏口饭吃吧……」`, 'narrator');
        this.showChoices([
            { text: '打听消息（1两）', action: () => this.beggarIntel(venue, npc) },
            { text: '暴打一顿', action: () => this.beatBeggar(venue, npc) },
            { text: '离开', action: () => this.enterVenue(venue) },
        ]);
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
        this.player.reputation = Math.max(0, this.player.reputation - 3);
        this.addMessage(`你揪起乞丐的衣领，恶狠狠地瞪了他一眼。`, 'narrator');
        this.addMessage(`乞丐吓得瑟瑟发抖：「大爷饶命！我说！我什么都说！」`, 'narrator');
        this.addMessage(`声望 -3（当前 ${this.player.reputation}）`, 'system');
        this.updateStatsBar();
        this.beggarIntelBeauties(venue, npc, true);
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
                    const action = ['晃悠', '采花', '洗衣', '闲坐', '纳凉', '赏景', '等人'][Math.floor(Math.random() * 7)];
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

    /* ─── 猎人系统 ─── */

    huntWithHunter(venue, npc) {
        this.clearChoices();
        const root = this.player.attrs.root || 10;
        const dex = this.player.attrs.dexterity || 10;
        const successChance = Math.min(0.9, (root + dex) / 100);

        // 猎物表：{ name, dexGain, weight, isDangerous }
        const preyTable = [
            { name: '兔子', dexGain: 1, weight: 30, isDangerous: false },
            { name: '蛇', dexGain: 1, weight: 25, isDangerous: false },
            { name: '山羊', dexGain: 2, weight: 18, isDangerous: false },
            { name: '鹿', dexGain: 2, weight: 12, isDangerous: false },
            { name: '狐狸', dexGain: 3, weight: 7, isDangerous: false },
            { name: '野狗', dexGain: 3, weight: 4, isDangerous: true },
            { name: '野猪', dexGain: 4, weight: 2, isDangerous: true },
            { name: '狼', dexGain: 4, weight: 1.5, isDangerous: true },
            { name: '老虎', dexGain: 5, weight: 0.5, isDangerous: true },
        ];

        // 按权重随机选猎物
        const totalWeight = preyTable.reduce((s, p) => s + p.weight, 0);
        let roll = Math.random() * totalWeight;
        let prey = preyTable[0];
        for (const p of preyTable) {
            roll -= p.weight;
            if (roll <= 0) { prey = p; break; }
        }

        this.addMessage(`${npc.npcName}带你进山打猎。林中走了一阵，发现了一只${prey.name}！`, 'narrator');
        this.advanceTime();

        if (prey.isDangerous) {
            // 危险猎物：判定成功则拿下，失败则逃跑
            if (Math.random() < successChance) {
                const gain = prey.dexGain;
                this.player.attrs.dexterity += gain;
                this.addMessage(`你张弓搭箭，一箭命中！${npc.npcName}竖起大拇指：「好箭法！」`, 'event');
                this.addMessage(`灵巧 +${gain}（当前 ${this.player.attrs.dexterity}）`, 'system');
                this.player._huntCount = (this.player._huntCount || 0) + 1;
            } else {
                this.addMessage(`那${prey.name}发现了你们，低吼着作势欲扑。你和${npc.npcName}对视一眼——「跑！」`, 'narrator');
                this.addMessage('你们撒腿就跑，总算逃过一劫。打猎失败。', 'danger');
            }
        } else {
            // 温顺猎物：判定成功则拿下，失败则脱靶
            if (Math.random() < successChance) {
                const gain = prey.dexGain;
                this.player.attrs.dexterity += gain;
                this.addMessage(`你屏息凝神，一箭射出——正中${prey.name}！`, 'event');
                this.addMessage(`灵巧 +${gain}（当前 ${this.player.attrs.dexterity}）`, 'system');
                this.player._huntCount = (this.player._huntCount || 0) + 1;
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
        this.advanceTime();
        this.player.attrs.root += 1;
        this.player.exp += 3;
        this.addMessage(`根骨 +1（当前 ${this.player.attrs.root}），经验 +3`, 'system');

        const chopCount = this.player._chopCount;
        const shadowRep = this.player.shadowRep || 0;

        // 第3次且里声望为0：送柴刀
        if (chopCount === 3 && shadowRep === 0) {
            this.addMessage(`${npc.npcName}擦了把汗，看了看你：「你小子老实本分，我这有把柴刀你用得上，拿去吧。」`, 'narrator');
            this.player.items.push({ ...getItem('knife_wood') });
            this.addMessage('获得了柴刀！', 'event');
        }

        // 第5次且里声望为0：教蓝色刀法
        if (chopCount === 5 && shadowRep === 0) {
            if (!this.player.externalSkills.some(s => s.id === 'caidao')) {
                this.addMessage(`${npc.npcName}满意地点点头：「你人不错，又肯下力气。我这几手砍柴的功夫，你想学吗？」`, 'narrator');
                const art = getMartialArt('caidao');
                if (art) {
                    const skillObj = { id: 'caidao', name: art.name, desc: art.desc, type: art.type, quality: art.quality, level: 1, maxLevel: 4 };
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
                this.showChoices([
                    { text: '忍气吞声', action: () => { this.addMessage('你咬了咬牙，没有发作。', 'narrator'); setTimeout(() => this.enterVenue(venue), 300); } },
                    { text: '一顿毒打', action: () => this.confrontChief(venue, npc, 'beat') },
                    { text: '痛下杀手', action: () => this.confrontChief(venue, npc, 'kill') },
                    { text: '离开', action: () => this.enterVenue(venue) },
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
                choices.push({ text: '对决', action: () => this.duelWithNpc(venue, npc, { label: '对决' }) });
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
                    const action = ['散步', '采花', '洗衣', '闲坐', '纳凉', '赏景', '等人'][Math.floor(Math.random() * 7)];
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
        chief._sonBeaten = true;

        const enemy = generateChiefSonEnemy(sonName, sonPower);
        this.startBattle(enemy,
            () => {
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
                    { text: `声望 +${repGain}（当前 ${this.player.reputation}）`, type: 'system' },
                ], () => setTimeout(() => this.chiefAction(venue, chief), 300));
            },
            () => {
                if (this.player.hp <= 0) {
                    this.gameOver(`你被${sonName}打成重伤……`);
                    return;
                }
                this.addMessage(`你捂着脸逃离了村子。`, 'narrator');
                this.showChoices([{ text: '灰溜溜离开', action: () => this.enterVenue(venue) }]);
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
                            if (this.player.reputation < 0) { this.gameOver(`你在${loc.name}恶行败露，声名狼藉，再无容身之处……`); return; }
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
                        () => {
                            const goldLoss = Math.min(this.player.gold, 20 + Math.floor(Math.random() * 30));
                            this.player.gold = Math.max(0, this.player.gold - goldLoss);
                            this.player.reputation -= 3;
                            this.updateStatsBar();
                            if (this.player.reputation < 0) { this.gameOver(`你在${loc.name}犯下的事已经传遍四方，江湖再无容身之处……`); return; }
                            this.showMessageSequence([
                                { text: '你奋力抵抗，但护卫的实力远在你之上！', type: 'danger' },
                                { text: '三招之内，你便被制服在地。', type: 'danger' },
                                { text: `你被痛打一顿，丢了 ${goldLoss} 两银子。`, type: 'system' },
                                { text: `声望 -3（当前 ${this.player.reputation}）`, type: 'system' },
                                { text: `村民们将遍体鳞伤的你扔出了村子。`, type: 'narrator' },
                            ], () => this.showChoices([{ text: '昏睡过去', action: () => this.sleepToTomorrow(true) }]));
                        }
                    );
                } },
                { text: '逃跑', action: () => {
                    this.clearChoices();
                    const goldLoss = Math.min(this.player.gold, 5 + Math.floor(Math.random() * 15));
                    this.player.gold = Math.max(0, this.player.gold - goldLoss);
                    this.player.reputation -= 2;
                    this.player.villageBlacklist[loc.id] = this.player.day + 30;
                    this.updateStatsBar();
                    if (this.player.reputation < 0) { this.gameOver(`你在${loc.name}犯下的事已经传遍四方，江湖再无容身之处……`); return; }
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
        const { powerMult = 1, initRepCost = 0, noCombatRepChange = false, winGetAllItems = false, label = '对决' } = options;
        this.clearChoices();

        if (initRepCost > 0) {
            this.player.reputation -= initRepCost;
            this.addMessage(`声望 -${initRepCost}（当前 ${this.player.reputation}）`, 'system');
            if (this.player.reputation < 0) {
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
            this.addMessage(`你向${npc.npcName}拱手道："请指教！"`, 'narrator');
        }

        this.startBattle(enemy,
            () => {
                this.addMessage(`你将${npc.npcName}击倒在地！`, 'event');
                if (label === '暗杀') {
                    npc._killed = true;
                    this.killedNpcs.add(this.currentLocation.id + ':' + venue.name + ':' + npc.npcName);
                    this.addMessage(`${npc.npcName}缓缓倒下，再无声息……`, 'danger');
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
                this.addMessage(`${npc.npcName}将你击倒在地。`, 'danger');
                npc._defeated = true;
                if (!noCombatRepChange) {
                    this.player.reputation = Math.max(0, this.player.reputation - 1);
                    this.addMessage(`声望 -1（当前 ${this.player.reputation}）`, 'system');
                }
                if (this.player.hp <= 0) {
                    this.gameOver(`你被${npc.npcName}重创，伤重不治……`, npc);
                    return;
                }
                this.updateStatsBar();
                setTimeout(() => this.interactNpc(venue, npc), 500);
            }
        );
    }

    /* ─── 小树林偷袭 ─── */

    forestAmbush(venue, npc) {
        this.clearChoices();
        this.player.reputation -= 1;
        this.player.shadowRep += 1;
        this.addMessage(`你趁${npc.npcName}不备猛然出手！偷袭扣除了 1 点声望。`, 'system');
        if (this.player.reputation < 0) {
            this.updateStatsBar();
            this.gameOver(`你名声已臭，连对${npc.npcName}下黑手的资格都没有了……`);
            return;
        }
        this.updateStatsBar();

        const enemy = generateNpcEnemy(npc);
        enemy.hp = Math.max(5, Math.floor(enemy.hp * 0.8));
        enemy.maxHp = enemy.hp;

        this.startBattle(enemy,
            () => {
                this.addMessage(`你击倒了${npc.npcName}！`, 'event');
                this.showLootChoices(venue, npc);
            },
            () => {
                this.addMessage(`${npc.npcName}将你击倒在地。`, 'danger');
                npc._defeated = true;
                if (this.player.hp <= 0) {
                    this.gameOver(`你被${npc.npcName}重创，伤重不治……`, npc);
                    return;
                }
                this.updateStatsBar();
                setTimeout(() => this.enterVenueInner(venue), 500);
            }
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
        this.player.reputation = Math.max(0, this.player.reputation - repCost);
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
            this.player.externalSkills.push({ id: npc.martialArt, name: art.name, desc: art.desc, type: art.type, quality: art.quality, level: 1, maxLevel: qData.maxLevel });
            this.addMessage(`${npc.npcName}将${art.name}倾囊相授！你领悟了「${art.name}」的奥义！`, 'event');
            this.player.exp += 20;
            this.checkLevelUp();
        } else {
            this.addMessage(`${npc.npcName}本想将${art.name}传授于你，可惜你福缘不够，未能领悟。`, 'info');
        }
    }

    /* ─── 战斗系统 ─── */

    startBattle(enemy, onWin, onLose, onFlee) {
        this.battleState = {
            enemy: enemy,
            log: [],
            onWin: onWin,
            onLose: onLose || (() => {}),
            onFlee: onFlee || (() => {}),
        };
        this.clearChoices();
        document.getElementById('log').innerHTML = '';
        this.renderBattleHUD();
        this.showBattleActions();
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
        this.showChoices([
            { text: '普通攻击', action: () => this.battleNormalAttack() },
            { text: '外功招式', action: () => this.showBattleSkillMenu() },
            { text: '使用物品', action: () => this.showBattleItemMenu() },
            { text: '逃跑', action: () => this.attemptFlee() },
        ]);
    }

    battleNormalAttack() {
        const basePower = Math.floor(this.player.attrs.root * 0.5 + this.player.attrs.dexterity * 0.5);
        let weaponPower = 0;
        for (const s of ['rightHand', 'leftHand']) {
            if (this.player.equipment[s]) weaponPower += this.player.equipment[s].value;
        }
        const dmg = Math.max(1, Math.floor(basePower * 1.0 + weaponPower * 0.6 + Math.floor(Math.random() * 4) - 1));
        const e = this.battleState.enemy;
        e.hp -= dmg;
        this.battleState.log.push({ text: `你使出一记重击，造成 <b>${dmg}</b> 点伤害！`, cls: 'battle-log-hit' });

        if (e.hp <= 0) {
            this.resolveBattleVictory();
            return;
        }
        setTimeout(() => this.enemyTurn(), 300);
    }

    showBattleSkillMenu() {
        const skills = this.player.externalSkills;
        if (skills.length === 0) {
            this.battleState.log.push({ text: '你尚未习得任何外功招式。', cls: 'battle-log-info' });
            this.showBattleActions();
            return;
        }
        const choices = skills.map((sk, i) => {
            const fixedPower = getSkillFixedPower(sk.quality, sk.level);
            const neiliCost = Math.max(1, Math.floor(fixedPower * 0.4));
            const canUse = this.player.neili >= neiliCost;
            return {
                text: `${sk.name} Lv.${sk.level}（内力${neiliCost}）${canUse ? '' : ' [不足]'}`,
                action: canUse ? () => this.battleUseSkill(i) : null,
            };
        });
        choices.push({ text: '返回', action: () => this.showBattleActions() });
        this.showChoices(choices);
    }

    battleUseSkill(skillIndex) {
        const sk = this.player.externalSkills[skillIndex];
        const basePower = Math.floor(this.player.attrs.root * 0.5 + this.player.attrs.dexterity * 0.5);
        let weaponPower = 0;
        for (const s of ['rightHand', 'leftHand']) {
            if (this.player.equipment[s]) weaponPower += this.player.equipment[s].value;
        }
        if (sk.type === 'fist' || sk.type === 'kick') weaponPower = 0;
        const fixedPower = getSkillFixedPower(sk.quality, sk.level);
        const coeff = getSkillCoefficient(sk.quality, sk.level);
        const combatPwr = getSkillPowerTotal(basePower, weaponPower, fixedPower, coeff);
        const dmg = Math.max(1, Math.floor(combatPwr * 0.55 + Math.floor(Math.random() * 3) - 1));
        const neiliCost = Math.max(1, Math.floor(fixedPower * 0.4));
        this.player.neili -= neiliCost;

        const e = this.battleState.enemy;
        e.hp -= dmg;
        this.battleState.log.push({ text: `你使出<span style="color:#ffd700">${sk.name}</span>！造成 <b>${dmg}</b> 点伤害！（内力 -${neiliCost}）`, cls: 'battle-log-hit' });

        if (e.hp <= 0) {
            this.resolveBattleVictory();
            return;
        }
        setTimeout(() => this.enemyTurn(), 400);
    }

    showBattleItemMenu() {
        const healingItems = [];
        for (let i = 0; i < this.player.items.length; i++) {
            const it = this.player.items[i];
            if (it.id === 'jinchuang' || it.id === 'huisheng' || it.id === 'neili_dan') {
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
        if (item.id === 'neili_dan') {
            this.player.neili = Math.min(this.player.maxNeili, this.player.neili + 20);
            msg += ' 内力恢复 20 点。';
            this.battleState.log.push({ text: msg, cls: 'battle-log-info' });
        } else {
            const heal = item.id === 'jinchuang' ? 30 : 50;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
            msg += ` 气血恢复 ${heal} 点。`;
            this.battleState.log.push({ text: msg, cls: 'battle-log-info' });
        }
        this.updateStatsBar();
        setTimeout(() => this.enemyTurn(), 300);
    }

    attemptFlee() {
        const e = this.battleState.enemy;
        const fleeChance = Math.min(0.85, (this.player.attrs.dexterity * 3) / Math.max(1, e.combatPower));
        if (Math.random() < fleeChance) {
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
            setTimeout(() => this.enemyTurn(), 300);
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
        const moveName = move.neiliCost ? `<span style="color:#f0a0a0">${move.name}</span>` : move.name;
        this.battleState.log.push({ text: `${e.name}使出了${moveName}！你受到 <b>${dmg}</b> 点伤害。`, cls: 'battle-log-self' });

        this.updateStatsBar();
        if (this.player.hp <= 0) {
            this.battleState.log.push({ text: '你眼前一黑，倒了下去……', cls: 'battle-log-self' });
            this.renderBattleHUD();
            setTimeout(() => {
                document.getElementById('log').innerHTML = '';
                const cb = this.battleState.onLose;
                this.battleState = null;
                this.player.hp = 0;
                this.updateStatsBar();
                cb();
            }, 800);
            return;
        }
        this.showBattleActions();
    }

    resolveBattleVictory() {
        this.renderBattleHUD();
        this.updateStatsBar();
        const cb = this.battleState.onWin;
        this.battleState = null;
        document.getElementById('log').innerHTML = '';
        cb();
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
            if (this.player.reputation < 0) {
                this.gameOver('你偷盗失手被当场拿获，被扭送官府。江湖之路，到此为止……');
                return;
            }
            this.player.neili -= 10;
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
            this.player.day += 1;
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
        this.player.maxNeili += 1;
        this.player.neili = this.player.maxNeili;
        this.player.exp += 5;
        this.player.day += 1;
        this.addMessage(`内力上限 +1（${this.player.maxNeili}），经验 +5`, 'system');
        this.addMessage('运功完毕，你收功归元，沉沉睡去。', 'narrator');
        this.checkLevelUp();
        this.updateStatsBar();
        setTimeout(() => this.showLocationChoices(), 400);
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
        this.addMessage(`你大喝一声，挡在路人身前！`, 'event');

        const enemy = createTravelEnemy(evt.enemyKey);
        this.startBattle(enemy,
            () => {
                const goldReward = enemy.goldReward || Math.floor(totalPower * 1.5);
                this.player.gold += goldReward;
                this.player.exp += enemy.expReward || totalPower;
                const isEasy = totalPower <= this.getPlayerCombatPower('full') * 0.67;
                if (isEasy) {
                    this.player.reputation += 1;
                    this.addMessage(`你三招两式便将${evt.label}击退！路人纷纷喝彩。`, 'event');
                    this.addMessage(`获得 ${goldReward} 两银子、${enemy.expReward || totalPower} 点经验，声望 +1`, 'system');
                } else {
                    const repGain = Math.min(10, 3 + Math.floor((totalPower / Math.max(1, this.getPlayerCombatPower('full'))) * 2));
                    this.player.reputation += repGain;
                    this.addMessage(`你一番苦战，终于将${evt.label}击退！路人千恩万谢。`, 'event');
                    this.addMessage(`获得 ${goldReward} 两银子、${enemy.expReward || totalPower} 点经验，声望 +${repGain}`, 'system');
                }
                this.checkLevelUp();
                this.updateStatsBar();
                setTimeout(() => this.enterLocation(locationId), 600);
            },
            () => {
                if (this.player.hp <= 0) {
                    this.gameOver(`你在路途中遭遇${evt.label}，伤重不治……`);
                    return;
                }
                this.addMessage(`你且战且退，终于脱身。`, 'narrator');
                setTimeout(() => this.enterLocation(locationId), 600);
            }
        );
    }

    resolveTravelStandby(locationId, evt) {
        this.clearChoices();
        this.addMessage('你冷漠地站在一旁，没有出手。', 'narrator');
        const rep = this.player.reputation;
        const ratingIdx = getRatingIndex(rep);
        if (ratingIdx <= 2) {
            this.addMessage('你名声不显，路人也不敢指望你什么。', 'info');
        } else {
            const tierMin = RATINGS[ratingIdx].min;
            const penalty = Math.max(1, Math.floor(tierMin / 10));
            this.player.reputation = Math.max(0, this.player.reputation - penalty);
            this.addMessage(`路人失望地看着你：「见死不救，算什么江湖中人！」`, 'danger');
            this.addMessage(`声望 -${penalty}（当前 ${this.player.reputation}）`, 'system');
            if (this.player.reputation < 0) { this.gameOver('你声名狼藉，江湖再无容身之处……'); return; }
        }
        this.updateStatsBar();
        setTimeout(() => this.enterLocation(locationId), 600);
    }

    /* ─── 美女系统 ─── */

    assignBeauties(loc) {
        const beauties = this.beautyMap[loc.id];
        if (!beauties || beauties.length === 0) return;
        const venues = this.player.locationVenues;
        if (venues.length === 0) return;
        const publicVenues = venues.filter(v => !v.name.includes('家') && !v.name.includes('府'));
        if (publicVenues.length === 0) return;
        for (const b of beauties) {
            if (this.killedNpcs.has('beauty_' + b.id)) continue;
            const vi = Math.floor(Math.random() * publicVenues.length);
            b._currentLocId = loc.id;
            b._currentVenueName = publicVenues[vi].name;
            publicVenues[vi].npcs.push({
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
        // 聊过天的女NPC不再显示，留在场所继续看其他NPC
        if (bd._chattedToday) {
            this.enterVenueInner(venue);
            return;
        }
        const effFav = computeFavorability(this.player, bd) >= 80 ? computeFavorability(this.player, bd) : bd.favorability;
        this.addMessage(`${bd.name}「${bd.faceDesc}」`, 'html');
        const choices = [
            { text: '鉴赏', action: () => this.appreciateBeauty(venue, beauty) },
            { text: '聊天', action: () => this.chatBeauty(venue, beauty) },
            { text: '行动', action: () => this.actBeauty(venue, beauty) },
        ];
        if (effFav >= 80) choices.push({ text: '亲密行为', action: () => this.intimateBeauty(venue, beauty) });
        choices.push({ text: '不义之举', action: () => this.evilBeauty(venue, beauty) });
        choices.push({ text: '离开', action: () => this.enterVenue(venue) });
        this.showChoices(choices);
    }

    appreciateBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const msgs = [
            { text: `你细细打量着${bd.name}……`, type: 'narrator' },
            { text: (() => { const f = computeFavorability(this.player, bd) >= 80 ? computeFavorability(this.player, bd) : bd.favorability; return f >= 50 ? '她似乎已经倾心于你。' : f >= 30 ? '她看起来很喜欢你。' : f >= 20 ? '她似乎对你有些好感。' : f >= 10 ? '她对你还算客气。' : f >= 5 ? '她对你态度平淡。' : '她态度冷冷，不愿搭理你。'; })(), type: 'html' },
            { text: `<span style="color:${bd.beautyTierColor}">【${bd.beautyTierLabel}】</span> 颜值 ${bd.faceScore||'?'}  身材 ${bd.bodyScore||'?'}  评分 ${bd.beautyScore}`, type: 'html' },
        ];
        if (bd._revealed.body) msgs.push({ text: `身材：${bd.bodyDesc}`, type: 'html' });
        if (bd._revealed.clothing) msgs.push({ text: `穿着：${bd.clothing}`, type: 'html' });
        if (bd._revealed.age) msgs.push({ text: `年龄：约${bd.age}岁`, type: 'info' });
        if (bd._revealed.height) msgs.push({ text: `身高：${bd.height}cm`, type: 'info' });
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
                height: bd.height, bust: bd.bust, waist: bd.waist, hips: bd.hips,
                beautyScore: bd.beautyScore, beautyTierLabel: bd.beautyTierLabel, beautyTierColor: bd.beautyTierColor,
                faceScore: bd.faceScore, bodyScore: bd.bodyScore, faceDesc: bd.faceDesc, bodyDesc: bd.bodyDesc,
                chastity: bd.chastity, _currentLocId: bd._currentLocId,
                sexCount: 0, lastTime: this.player.day,
            };
        }
    }

    _getAttitudeText(fav) {
        return fav >= 50 ? '她似乎已经倾心于你。' : fav >= 30 ? '她看起来很喜欢你。' : fav >= 20 ? '她似乎对你有些好感。' : fav >= 10 ? '她对你还算客气。' : fav >= 5 ? '她对你态度平淡。' : null;
    }

    _pickChatLine(bd, stage) {
        const pool = window.CHAT_LINES[bd.inner] || window.CHAT_LINES.unmarried;
        const c = randomEntry(pool['s' + stage]);
        return { narrator: fmtLine(c.n, bd), line: c.l };
    }

    _pickFlirtScene(bd) {
        const s = pickScene(window.FLIRT_SCENES, bd.inner);
        return { step2: fmtLine(s.s2, bd), step3: fmtLine(s.s3, bd), step4: fmtLine(s.s4, bd), end: fmtLine(s.end, bd) };
    }

    _pickKissScene(bd) {
        const s = pickScene(window.KISS_SCENES, bd.inner);
        return { narrator: fmtLine(s.n, bd), line: fmtLine(s.l, bd) };
    }

    _pickGropeScene(bd) {
        const s = pickScene(window.GROPE_SCENES, bd.inner);
        return { narrator: fmtLine(s.n, bd), line: fmtLine(s.l, bd) };
    }

    _chatFirstMet(venue, beauty) {
        const bd = beauty._beautyData;
        const fav = computeFavorability(this.player, bd) >= 80 ? computeFavorability(this.player, bd) : bd.favorability;
        const attitudeText = this._getAttitudeText(fav);
        if (!attitudeText) {
            this.showMessageSequence([
                { text: `你走向${bd.name}，她态度冷冷，似乎不愿与你交谈。`, type: 'narrator' },
            ], () => this.enterVenue(venue));
            return;
        }
        bd.chatLevel = 1;
        const c = this._pickChatLine(bd, 0);
        bd._revealed.body = true;
        const msgs = [
            { text: attitudeText, type: 'html' },
            { text: c.narrator, type: 'narrator' },
            { text: `${bd.name}：${c.line}`, type: 'narrator' },
            { text: `一番闲谈之后，你得知她名叫${bd.name}。`, type: 'info' },
        ];
        this._ensureRedRecord(bd);
        msgs.push({ text: `已将${bd.name}记入红颜录，可通过红颜录查询她的去向。`, type: 'system' });
        const gift = pickRegionalGift(this.currentLocation.id);
        if (gift) { bd._wantedGift = gift.id; msgs.push({ text: `${bd.name}提到她最近想要一件「${gift.name}」。`, type: 'event' }); }
        bd._chattedToday = true;
        msgs.push({ text: `${bd.name}离开了${venue.name}。`, type: 'narrator' });
        this.showMessageSequence(msgs, () => this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]));
    }

    _chatProgressive(venue, beauty) {
        const bd = beauty._beautyData;
        const stage = bd.chatLevel;
        const stageLabels = ['粗谈一番', '相谈甚欢', '卧心长谈', '深入交流'];
        bd.chatLevel = stage + 1;
        const c = this._pickChatLine(bd, stage);
        if (stage === 1) { bd._revealed.clothing = true; bd._revealed.height = true; }
        else if (stage === 2) { bd._revealed.age = true; }
        else if (stage === 3) { bd._revealed.measurements = true; bd._revealed.marital = true; }
        const msgs = [
            { text: `（${stageLabels[stage]}）`, type: 'system' },
            { text: c.narrator, type: 'narrator' },
            { text: `${bd.name}：${c.line}`, type: 'narrator' },
        ];
        if (stage === 3) {
            msgs.push({ text: `她告诉你她今年${bd.age}岁，${bd.surface === 'unmarried' ? '尚未婚配' : bd.surface === 'widow' ? '夫家已故，守寡至今' : '已嫁人'}${bd.surface === 'married_child' ? '，育有子女' : ''}。`, type: 'info' });
            msgs.push({ text: `你偷偷记下了她的三围：${bd.bust}-${bd.waist}-${bd.hips}。`, type: 'info' });
        }
        const gift = pickRegionalGift(this.currentLocation.id);
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
            this.addMessage(`夜色渐深，${bd.name}脸颊绯红，${getFlirtMood(bd)}。`, 'narrator');
            bd._chattedToday = true;
            this.showChoices([{ text: '……', action: () => this.flirtEventStep2(venue, beauty) }]);
            return;
        }
        const line = randomEntry(FLIRT_LINES);
        const react = getReaction(bd);
        this.showMessageSequence([
            { text: '（调情）', type: 'system' },
            { text: `你：${line}`, type: 'narrator' },
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
        this.addMessage('你们已经无话不谈，但她似乎还不想更进一步……', 'narrator');
        const intChoices = [
            { text: '接吻', action: () => this.kissBeauty(venue, beauty) },
            { text: '揩油', action: () => this.gropeBeauty(venue, beauty) },
        ];
        if (bd.favorability >= bd.chastity || computeFavorability(this.player, bd) >= bd.chastity) {
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
        const threshold = [10, 30, 50, 70];
        const fav = computeFavorability(this.player, bd) >= 80 ? computeFavorability(this.player, bd) : bd.favorability;

        if (stage >= 4) {
            if (bd._hadSex) return this._chatFlirtMode(venue, beauty);
            return this._chatPostIntimate(venue, beauty);
        }
        if (stage === 0) return this._chatFirstMet(venue, beauty);
        if (fav < threshold[stage]) {
            const stageLabels = ['粗谈一番', '相谈甚欢', '卧心长谈', '深入交流'];
            this.showMessageSequence([
                { text: `（${stageLabels[stage]}）`, type: 'system' },
                { text: `${bd.name}对你还不够信任，不愿深谈。（需要好感度≥${threshold[stage]}）`, type: 'narrator' },
                { text: '不妨送些礼物增进感情？', type: 'narrator' },
            ], () => this.showChoices([{ text: '返回', action: () => this.interactBeauty(venue, beauty) }]));
            return;
        }
        this._chatProgressive(venue, beauty);
    }


    getFlirtScene(bd) {
        return this._pickFlirtScene(bd);
    }

    getKissScene(bd) {
        return this._pickKissScene(bd);
    }

    getGropeScene(bd) {
        return this._pickGropeScene(bd);
    }

    flirtEventStep2(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const scene = this.getFlirtScene(bd);
        this.addMessage(scene.step2, 'narrator');
        this.showChoices([{ text: '……', action: () => this.flirtEventStep3(venue, beauty) }]);
    }

    flirtEventStep3(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const scene = this.getFlirtScene(bd);
        this.addMessage(scene.step3, 'narrator');
        this.showChoices([{ text: '……', action: () => this.flirtEventStep4(venue, beauty) }]);
    }

    flirtEventStep4(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const scene = this.getFlirtScene(bd);
        this.addMessage(scene.step4, 'narrator');
        this.showChoices([{ text: '……', action: () => this.flirtEventStep5(venue, beauty) }]);
    }

    flirtEventStep5(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        bd._flirtPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
        bd._flirtPoemIdx = 0;
        this.flirtShowPoemLine(venue, beauty);
    }

    flirtShowPoemLine(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const poem = bd._flirtPoem;
        const idx = bd._flirtPoemIdx;
        if (idx < poem.lines.length) {
            if (idx === 0 && !bd._flirtIntroShown) {
                this.addMessage('有道是：', 'narrator');
                bd._flirtIntroShown = true;
                this.showChoices([{ text: '……', action: () => this.flirtShowPoemLine(venue, beauty) }]);
            } else {
                this.addMessage(`　　${poem.lines[idx]}`, 'poem');
                bd._flirtPoemIdx = idx + 1;
                this.showChoices([{ text: '……', action: () => this.flirtShowPoemLine(venue, beauty) }]);
            }
        } else {
            const scene = this.getFlirtScene(bd);
            this.addMessage(scene.end, 'narrator');
            bd._hadSex = true;
            bd.favorability = Math.min(100, bd.favorability + 8);
            this.player.neili -= 20;
            this._ensureRedRecord(bd);
            delete bd._flirtPoem;
            delete bd._flirtPoemIdx;
            delete bd._flirtIntroShown;
            this.updateStatsBar();
            this.player._sleptWithBeauty = true;
            this.showChoices([{ text: '沉沉睡去……', action: () => {
                this.clearChoices();
                this.sleepToTomorrow(true);
                this.addMessage(`你从${bd.name}的闺房中醒来，昨夜风流如梦，神清气爽。`, 'narrator');
            } }]);
        }
    }

    actBeauty(venue, beauty) {
        this.clearChoices();
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
        if (p.items.length === 0) {
            this.addMessage('你翻遍行囊，空空如也。', 'narrator');
            setTimeout(() => this.actBeauty(venue, beauty), 400);
            return;
        }
        this.addMessage(`挑一件礼物送给${bd.name}：`, 'narrator');
        const choices = p.items.map((item, idx) => {
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
        let bonus = 0;
        if (bd._wantedGift && item.id === bd._wantedGift) {
            bonus = 15;
            bd._wantedGift = null;
            this.addMessage(`这正是她想要的！她眼中闪过惊喜的光芒。`, 'event');
        }
        bd.favorability = Math.min(100, bd.favorability + favGain + bonus);
        this.addMessage(`你将${item.name}送给${bd.name}，她很高兴。`, 'event');
        this.addMessage(`好感度 +${favGain + bonus}（当前 ${bd.favorability}）`, 'system');
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
        const choices = [
            { text: '接吻', action: () => this.kissBeauty(venue, beauty) },
            { text: '揩油', action: () => this.gropeBeauty(venue, beauty) },
        ];
        if (bd.favorability >= bd.chastity || computeFavorability(this.player, bd) >= bd.chastity) {
            choices.push({ text: '云雨', action: () => this.sexBeauty(venue, beauty) });
        } else {
            choices.push({ text: `云雨（需好感≥${bd.chastity}，当前${bd.favorability}）`, action: null });
        }
        choices.push({ text: '返回', action: () => this.interactBeauty(venue, beauty) });
        this.showChoices(choices);
    }

    kissBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const scene = this.getKissScene(bd);
        this.addMessage(scene.narrator, 'narrator');
        this.addMessage(scene.line, 'narrator');
        bd.favorability = Math.min(100, bd.favorability + 3);
        this.updateStatsBar();
        setTimeout(() => this.interactBeauty(venue, beauty), 500);
    }

    gropeBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        const scene = this.getGropeScene(bd);
        this.addMessage(scene.narrator, 'narrator');
        this.addMessage(scene.line, 'narrator');
        bd.favorability = Math.min(100, bd.favorability + 2);
        this.updateStatsBar();
        setTimeout(() => this.interactBeauty(venue, beauty), 500);
    }

    sexBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        bd._flirtPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
        bd._flirtPoemIdx = 0;
        this.flirtEventStep2(venue, beauty);
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
            this.gameOver(`你对${bd.name}犯下的罪行天理不容，你恶贯满盈，江湖再无容身之处……`);
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
        ], () => this.showChoices([
            { text: '聊天', action: () => {
                this.clearChoices();
                this.addMessage(`你和${prostitute.name}闲聊了几句，她笑语盈盈。`, 'narrator');
                this.showChoices([{ text: '返回', action: () => this.brothelInteractProstitute(venue, npc, prostitute) }]);
            }},
            { text: `共度春宵（${prostitute.price}两）`, action: () => {
                if (this.player.gold < prostitute.price) {
                    this.addMessage(`你囊中羞涩，${prostitute.price}两银子都拿不出来。`, 'narrator');
                    this.showChoices([{ text: '讪讪离开', action: () => this.brothelInteractProstitute(venue, npc, prostitute) }]);
                    return;
                }
                this.player.gold -= prostitute.price;
                this.addMessage(`你付了${prostitute.price}两银子，${prostitute.name}微微一笑，牵起你的手走向闺房……`, 'narrator');
                this.brothelSexProstitute(prostitute);
            }},
            { text: '离开', action: () => this.brothelShowGirls(venue, npc) },
        ]));
    }

    brothelSexProstitute(prostitute) {
        this.clearChoices();
        prostitute._flirtPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
        prostitute._flirtPoemIdx = 0;
        this.flirtEventStep2(this.currentLocation, { _beautyData: prostitute });
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
            if (found && found._currentLocId) {
                const loc = getAllLocations().find(l => l.id === found._currentLocId);
                const region = getRegionLabel(found._currentLocId);
                locStr = `【${region}】${loc ? loc.name : found._currentLocId} · ${found._currentVenueName || '街上'}`;
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
        const ms = r.surface === 'unmarried' ? '未婚' : r.surface === 'married' ? '已婚' : r.surface === 'married_child' ? '已婚已育' : '寡妇';
        this.showMessageSequence([
            { text: `${r.name}  ${ms}  ${r.age}岁  ${r.height}cm  ${r.bust}-${r.waist}-${r.hips}`, type: 'info' },
            { text: `<span style="color:${r.beautyTierColor}">【${r.beautyTierLabel}】</span>颜值 ${r.faceScore||'?'}  身材 ${r.bodyScore||'?'}  评分 ${r.beautyScore}  忠贞 ${r.chastity}`, type: 'html' },
            { text: `容貌：${r.faceDesc}`, type: 'info' },
            { text: `身材：${r.bodyDesc}`, type: 'info' },
            { text: `今日位置：${locStr}`, type: 'narrator' },
        ], () => this.showChoices([
            { text: '返回列表', action: () => this.showRedRecord() },
            { text: '收起', action: () => this.showLocationChoices() },
        ]));
    }

    /* ─── 游戏结束 ─── */

    gameOver(reason, npc = null) {
        this.addMessage(`━━━ Game Over ━━━`, 'system');
        setTimeout(() => {
            document.getElementById('gameover-reason').textContent = reason;
            document.getElementById('gameover-overlay').classList.remove('hidden');
        }, 3000);
    }
}

const game = new Game();
