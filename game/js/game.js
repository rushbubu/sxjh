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
            '耳边还回响着他冷冰冰的声音：「师兄，掌门之位，你让也得让，不让也得让。」',
            '万劫深渊，深不见底，自古无人能生还。但你竟没有死。',
            '坠落途中，你伸手乱抓，指尖触碰到了崖壁上的一卷古老竹简——那一刹那，无数文字如洪流般涌入你的脑海。',
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
        document.getElementById('level-text').textContent = p.level;
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
                    return { ...i, stock, maxStock: stock };
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
                '村外': this.player.locationVenues.filter(v => ['断桥', '小溪', '田埂', '小树林'].includes(v.name)),
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

    enterVenue(venue) {
        this.clearChoices();
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
        const alive = venue.npcs.filter(n => !n._killed && !(n.isBeauty && n._beautyData && n._beautyData._chattedToday));
        if (alive.length === 0) {
            this.addMessage('里面空无一人……', 'narrator');
            setTimeout(() => (this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices()), 400);
            return;
        }
        const choices = alive.map(npc => ({
            text: npc.isChief ? `村长 · ${npc.npcName}` : npc.npcName,
            action: () => this.interactNpc(venue, npc),
        }));
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
        this.player.neili -= 2;
        this.updateStatsBar();
        setTimeout(() => this.interactNpc(venue, npc), 400);
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
                    { text: '忍气吞声', action: () => { this.addMessage('你咬了咬牙，转身离开。', 'narrator'); setTimeout(() => this.enterVenue(venue), 300); } },
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
            { text: `容貌：${bd.faceDesc}`, type: 'html' },
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

    chatBeauty(venue, beauty) {
        this.clearChoices();
        const bd = beauty._beautyData;
        if (bd._chattedToday) {
            this.addMessage(`${bd.name}今天已经来过了，改天再来吧。`, 'narrator');
            this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]);
            return;
        }
        const stage = bd.chatLevel;
        const stageLabels = ['粗谈一番', '相谈甚欢', '卧心长谈', '深入交流'];
        const threshold = [10, 30, 50, 70];
        const fav = computeFavorability(this.player, bd) >= 80 ? computeFavorability(this.player, bd) : bd.favorability;

        if (stage >= 4) {
            if (bd._hadSex) {
                if (bd.flirtDay !== this.player.day) { bd.flirtCount = 0; bd.flirtDay = this.player.day; }
                bd.flirtCount++;
                if (bd.flirtCount >= 4) {
                    const mood = bd.inner === 'unmarried' ? '神色羞涩' : bd.inner === 'widow' ? '嘴角挂着玩味的笑意' : '眼中带着热切的期盼';
                    this.addMessage(`夜色渐深，${bd.name}脸颊绯红，${mood}。`, 'narrator');
                    bd._chattedToday = true;
                    this.showChoices([{ text: '……', action: () => this.flirtEventStep2(venue, beauty) }]);
                    return;
                }
                const line = FLIRT_LINES[Math.floor(Math.random() * FLIRT_LINES.length)];
                const isMature = bd.inner === 'married' || bd.inner === 'married_child' || (bd.inner === 'unmarried' && bd.age >= 25);
                const reactions = bd.inner === 'widow' ? WIDOW_REACTIONS : isMature ? MATURE_REACTIONS : SHY_REACTIONS;
                const react = reactions[Math.floor(Math.random() * reactions.length)];
                this.showMessageSequence([
                    { text: `（调情）`, type: 'system' },
                    { text: `你：${line}`, type: 'narrator' },
                    { text: `${bd.name}：${react}`, type: 'html' },
                ], () => {
                    this.updateStatsBar();
                    this.showChoices([
                        { text: '继续调情', action: () => this.chatBeauty(venue, beauty) },
                        { text: '让她离开', action: () => { bd._chattedToday = true; this.clearChoices(); this.addMessage(`${bd.name}离开了${venue.name}。`, 'narrator'); setTimeout(() => this.showOutdoorChoices(), 300); } },
                    ]);
                });
                return;
            }
            this.addMessage(`你们已经无话不谈，但她似乎还不想更进一步……`, 'narrator');
            const intChoices = [
                { text: '接吻', action: () => this.kissBeauty(venue, beauty) },
                { text: '揩油', action: () => this.gropeBeauty(venue, beauty) },
            ];
            if (bd.favorability >= bd.chastity || computeFavorability(this.player, bd) >= bd.chastity) {
                intChoices.push({ text: '云雨', action: () => this.sexBeauty(venue, beauty) });
            }
            intChoices.push({ text: '离开', action: () => this.showOutdoorChoices() });
            this.showChoices(intChoices);
            return;
        }

        if (stage === 0) {
            const attitudeText = fav >= 50 ? '她似乎已经倾心于你。' : fav >= 30 ? '她看起来很喜欢你。' : fav >= 20 ? '她似乎对你有些好感。' : fav >= 10 ? '她对你还算客气。' : fav >= 5 ? '她对你态度平淡。' : null;
            if (!attitudeText) {
                this.showMessageSequence([
                    { text: `你走向${bd.name}，她态度冷冷，似乎不愿与你交谈。`, type: 'narrator' },
                ], () => this.enterVenue(venue));
                return;
            }
            bd.chatLevel = 1;
            const chatLines = this.getChatLines(bd);
            const c = chatLines.s0[Math.floor(Math.random() * chatLines.s0.length)];
            bd._revealed.body = true;
            const msgs = [
                { text: attitudeText, type: 'html' },
                { text: c.narrator, type: 'narrator' },
                { text: `${bd.name}：${c.line}`, type: 'narrator' },
                { text: `一番闲谈之后，你得知她名叫${bd.name}。`, type: 'info' },
            ];
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
            msgs.push({ text: `已将${bd.name}记入红颜录，可通过红颜录查询她的去向。`, type: 'system' });
            const gift = pickRegionalGift(venue.name ? this.currentLocation.id : this.currentLocation.id);
            if (gift) { bd._wantedGift = gift.id; msgs.push({ text: `${bd.name}提到她最近想要一件「${gift.name}」。`, type: 'event' }); }
            bd._chattedToday = true;
            msgs.push({ text: `${bd.name}离开了${venue.name}。`, type: 'narrator' });
            this.showMessageSequence(msgs, () => this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]));
            return;
        }

        if (fav < threshold[stage]) {
            this.showMessageSequence([
                { text: `（${stageLabels[stage]}）`, type: 'system' },
                { text: `${bd.name}对你还不够信任，不愿深谈。（需要好感度≥${threshold[stage]}）`, type: 'narrator' },
                { text: `不妨送些礼物增进感情？`, type: 'narrator' },
            ], () => this.showChoices([{ text: '返回', action: () => this.interactBeauty(venue, beauty) }]));
            return;
        }

        bd.chatLevel = stage + 1;

        const chatLines = this.getChatLines(bd);
        let c;
        if (stage === 1) { c = chatLines.s1[Math.floor(Math.random() * chatLines.s1.length)]; bd._revealed.clothing = true; bd._revealed.height = true; }
        else if (stage === 2) { c = chatLines.s2[Math.floor(Math.random() * chatLines.s2.length)]; bd._revealed.age = true; }
        else if (stage === 3) { c = chatLines.s3[Math.floor(Math.random() * chatLines.s3.length)]; bd._revealed.measurements = true; bd._revealed.marital = true; }

        const msgs = [
            { text: `（${stageLabels[stage]}）`, type: 'system' },
            { text: c.narrator, type: 'narrator' },
            { text: `${bd.name}：${c.line}`, type: 'narrator' },
        ];
        if (stage === 3) {
            msgs.push({ text: `她告诉你她今年${bd.age}岁，${bd.surface === 'unmarried' ? '尚未婚配' : bd.surface === 'widow' ? '夫家已故，守寡至今' : '已嫁人'}${bd.surface === 'married_child' ? '，育有子女' : ''}。`, type: 'info' });
            msgs.push({ text: `你偷偷记下了她的三围：${bd.bust}-${bd.waist}-${bd.hips}。`, type: 'info' });
        }

        const gift = pickRegionalGift(venue.name ? this.currentLocation.id : this.currentLocation.id);
        if (gift) {
            bd._wantedGift = gift.id;
            msgs.push({ text: `${bd.name}提到她最近想要一件「${gift.name}」。`, type: 'event' });
        }

        bd._chattedToday = true;
        msgs.push({ text: `${bd.name}离开了${venue.name}。`, type: 'narrator' });

        this.showMessageSequence(msgs, () => this.showChoices([{ text: '离开', action: () => this.showOutdoorChoices() }]));
    }

    getChatLines(bd) {
        const s = bd.inner;
        const pool = {
            unmarried: {
                s0: [
                    { narrator: `你上前与${bd.name}搭话。她打量了你几眼，微微一笑。`, line: '「公子面生，是外地来的吧？」' },
                    { narrator: `你走向${bd.name}，她好奇地抬起头看你。`, line: '「你是……新来的？以前没见过你呢。」' },
                    { narrator: `${bd.name}正在窗前发呆，听见脚步声回过头来。`, line: '「啊，吓我一跳……你是？」' },
                    { narrator: `你打了个招呼，${bd.name}抿嘴笑了笑。`, line: '「你好呀，我好像没见过你？」' },
                    { narrator: `${bd.name}坐在树下乘凉，看见你走近便直起身子。`, line: '「你也是路过这里的吗？」' },
                ],
                s1: [
                    { narrator: `你与${bd.name}聊得颇为投机，她的话渐渐多了起来。`, line: '「原来公子也是闯江湖的，见多识广呢。」' },
                    { narrator: `${bd.name}听得入了神，眼睛里闪着光。`, line: '「外面的世界真的有那么多有趣的事吗？」' },
                    { narrator: `她托着腮听你说话，不时轻笑出声。`, line: '「你说话真有意思，比村里那些人强多了。」' },
                    { narrator: `${bd.name}拍了拍身边的凳子，示意你坐下说。`, line: '「再给我讲讲外面的故事吧？」' },
                    { narrator: `她给你倒了杯茶，双手捧着递过来。`, line: '「你一定走过很多地方吧……真羡慕你。」' },
                ],
                s2: [
                    { narrator: `${bd.name}对你已颇为信任，聊起了自己的心事。`, line: '「这些事情，我从未对旁人提起过……」' },
                    { narrator: `她低下头，手指轻轻摩挲着杯沿。`, line: '「其实我有时候……也觉得挺孤单的。」' },
                    { narrator: `${bd.name}叹了口气，目光望向远方。`, line: '「有时候想想，人这一辈子到底图什么呢……」' },
                    { narrator: `她咬了咬嘴唇，像在下什么决心。`, line: '「这些话我从来没跟别人说过……你能帮我保密吗？」' },
                    { narrator: `${bd.name}的声音低了下去，带着一丝落寞。`, line: '「你可能觉得我过得挺好……但其实不是这样的。」' },
                ],
                s3: [
                    { narrator: `${bd.name}凝视着你，眼神温柔而深邃。`, line: '「公子是个值得托付的人……」' },
                    { narrator: `她靠近了一些，声音轻轻的。`, line: '「不知道为什么，在你身边我觉得很安心。」' },
                    { narrator: `${bd.name}看着你的眼睛，认真地说。`, line: '「你……你跟别人不一样。我说不上来哪里不一样。」' },
                    { narrator: `她犹豫了一下，伸手轻轻碰了碰你的手背。`, line: '「如果……如果早些遇见你就好了。」' },
                    { narrator: `${bd.name}的脸微微泛红，却没有移开目光。`, line: '「我好像……有点舍不得你走了。」' },
                ],
            },
            married: {
                s0: [
                    { narrator: `${bd.name}正在忙手里的活计，抬头看了你一眼。`, line: '「这位客官面生得很，是路过还是找人？」' },
                    { narrator: `她放下手里的东西，拍了拍身上的灰。`, line: '「哟，有日子没见过生面孔了。」' },
                    { narrator: `${bd.name}打量了你一番，嘴角带着客气的笑。`, line: '「这位是……？恕我眼拙。」' },
                    { narrator: `她一边擦手一边走过来，语气平淡。`, line: '「有事吗？还是走错了门？」' },
                    { narrator: `${bd.name}倚在门框上，目光带着审视。`, line: '「你看起来不像本地人。」' },
                ],
                s1: [
                    { narrator: `几句下来，${bd.name}的态度缓和了许多。`, line: '「看不出来，你还挺会说话的。」' },
                    { narrator: `她忍不住笑了起来，戒备少了几分。`, line: '「你这人倒是有趣，比我家那个木头强。」' },
                    { narrator: `${bd.name}放松了下来，给自己也倒了杯茶。`, line: '「好久没跟人这么聊过了，还挺痛快的。」' },
                    { narrator: `她摇了摇头，嘴角带着一丝无奈的笑意。`, line: '「你这张嘴啊，怕是哄过不少人吧？」' },
                    { narrator: `${bd.name}单手托腮，眼神中有了几分兴致。`, line: '「接着说，我爱听。」' },
                ],
                s2: [
                    { narrator: `${bd.name}沉默了片刻，眼神黯了黯。`, line: '「你以为我现在过得很好吗？其实……」' },
                    { narrator: `她低头看着自己的手，声音很轻。`, line: '「有时候我半夜醒来，会觉得这一辈子就这样了。」' },
                    { narrator: `${bd.name}苦笑了一下，别过脸去。`, line: '「有些事……嫁了人才知道跟想的不一样。」' },
                    { narrator: `她攥着衣角，指节都有些发白。`, line: '「你知道那种……每天都在熬日子的感觉吗？」' },
                    { narrator: `${bd.name}深吸一口气，像是下了很大决心。`, line: '「这些话我从来没跟任何人说过……你是第一个。」' },
                ],
                s3: [
                    { narrator: `${bd.name}看着你的眼神变得复杂起来。`, line: '「你知道……有些事不该做，可心里偏想去做。」' },
                    { narrator: `她咬了咬嘴唇，目光闪烁。`, line: '「你……你让我有点害怕。不是因为你是坏人。」' },
                    { narrator: `${bd.name}的声音有些发颤，却带着某种决心。`, line: '「我好久没有这种……活着的感觉了。」' },
                    { narrator: `她靠近了一步，又退后半步，纠结着。`, line: '「你说……人这一辈子，能不能为自己活一次？」' },
                    { narrator: `${bd.name}深深地看着你，像是要把你刻进眼里。`, line: '「别对我太好……我怕我会当真的。」' },
                ],
            },
            widow: {
                s0: [
                    { narrator: `她叼着一根发簪正在挽头发，斜了你一眼。`, line: '「找谁？要是找隔壁老王，他不在。」' },
                    { narrator: `${bd.name}放下手里的扫帚，拍了拍手。`, line: '「又是一个外乡人。这地方有什么好的，你们一个接一个来。」' },
                    { narrator: `她靠在门边，双手抱胸看着你。`, line: '「看什么看？没见过寡妇？」' },
                    { narrator: `${bd.name}正在剁菜，刀起刀落利落得很。`, line: '「有话快说，我忙着呢。」' },
                ],
                s1: [
                    { narrator: `聊了几句，${bd.name}的态度松动了一些。`, line: '「哼，你这张嘴倒是不招人烦。」' },
                    { narrator: `她放下刀，擦了擦手，终于正眼看了你。`, line: '「行吧，会说话也是本事。坐。」' },
                    { narrator: `${bd.name}嗤笑一声，语气却没那么冲了。`, line: '「你这种人，怕是到哪儿都吃得开。」' },
                    { narrator: `她给你倒了碗水，重重放在你面前。`, line: '「喝吧，没毒。我一个寡妇能把你怎么样？」' },
                    { narrator: `${bd.name}拉了把椅子坐下，翘起二郎腿。`, line: '「说吧，你这种人主动搭话，肯定有所图。」' },
                ],
                s2: [
                    { narrator: `${bd.name}沉默了一阵，眼神黯了下来。`, line: '「你知道一个人守着空房子的滋味吗？我知道。」' },
                    { narrator: `她抬手将鬓边碎发别到耳后，目光幽幽地望向远处。`, line: '「男人都一个德性……活着的时候不珍惜，死了倒清净。」' },
                    { narrator: `${bd.name}冷笑了一声，眼底却有一丝不易察觉的落寞。`, line: '「你以为寡妇好当？白天被人指指点点，晚上……」' },
                    { narrator: `她垂下眼睫，指尖轻轻摩挲着腕上的银镯子。`, line: '「我有时候想，这辈子是不是就这么到头了。」' },
                    { narrator: `${bd.name}把玩着手里的杯子，声音低了下去。`, line: '「别人都觉得寡妇可怜……其实自由得很，就是太自由了，有点冷清。」' },
                ],
                s3: [
                    { narrator: `${bd.name}直直地看着你，目光像要把你看穿。`, line: '「你图什么？直说吧。我经得起。」' },
                    { narrator: `她理了理散落的衣襟，站起身走到你面前。`, line: '「你知道寡妇的好处是什么吗？——不用对你负责。」' },
                    { narrator: `${bd.name}伸手抬起你的下巴，打量着你。`, line: '「你胆子不小，敢来招惹寡妇。不过……我喜欢胆大的。」' },
                    { narrator: `她凑近了一些，你能闻到她身上的皂角味。`, line: '「我这个人很直接的——你想要什么，我都能给。但你得想好了后果。」' },
                    { narrator: `${bd.name}退开半步，解开领口一颗扣子又扣上。`, line: '「看着人模人样的……就是不知道中不中用。」' },
                ],
            },
        };
        return pool[s] || pool.unmarried;
    }

    getFlirtScene(bd) {
        const s = bd.inner;
        const scenes = {
            unmarried: [
                {
                    step2: `${bd.name}脸颊绯红，声音细若蚊吟：「公子……今晚……留下来陪我可好？」说着低下了头，耳根红透。`,
                    step3: `她羞怯地伸出小手，轻轻牵住你的衣角，带你走向她的闺房。脚步轻而慢，像一只受惊的小鹿。`,
                    step4: `红烛摇曳，罗帐轻垂。她背对着你，手指紧张地绞着衣带，半天解不开一个结。「我……我是第一次……」`,
                    end: `云收雨歇，她依偎在你怀中，像一只温顺的小猫，嘴角挂着甜蜜的笑意。`,
                },
                {
                    step2: `${bd.name}偷偷看了你一眼，又飞快低下头去，声音轻得像怕被人听见：「你……你真的想好了？」`,
                    step3: `她犹豫了一下，终究还是把手放进你的掌心。月色下她的侧脸美得像一幅画，睫毛上似乎沾着泪光。`,
                    step4: `她并拢双腿坐在床沿，双手不知该往哪里放。你轻轻抬起她的脸，她闭上眼睛，睫毛不住地颤动。你再无多言，低头吻了下去。`,
                    end: `她枕着你的手臂，小声呢喃：「以后……你会一直对我好吗？」说完害羞地把脸埋进你怀里。`,
                },
                {
                    step2: `${bd.name}绞着手指，咬了咬嘴唇突然抬头：「我……我喜欢你！所以你……你不许负我！」说完自己先红了脸。`,
                    step3: `她鼓起勇气主动牵起你的手，手心全是汗。走到房门口时她回头看你一眼，眼神中既有期待又有不安。`,
                    step4: `她让你闭上眼睛，等睁开时她已经换了一身轻薄纱衣，双手抱着胸口，羞得不敢看你。「不……不许笑我……」`,
                    end: `她蜷在你怀里，用手指在你胸口画着心形，轻声说：「今晚我做了一个梦……一个不想醒来的梦。」`,
                },
                {
                    step2: `${bd.name}背对着你，声音闷闷的：「你……你要是敢负我，我就……我就……」说了半天也没说出个所以然。`,
                    step3: `她转身一把抱住你，把头埋在你胸口不说话。过了一会你感觉胸口的衣襟湿了一片。她哭了，却是笑着哭的。`,
                    step4: `她一边流泪一边吻你，吻到动情处在你耳边说：「我把最珍贵的东西给你……你要好好珍惜我。」`,
                    end: `几番云雨后，她用手指缠着你的头发，似睡非睡地喃喃：「你是我的了……我也是你的了。」`,
                },
                {
                    step2: `${bd.name}站在月光下，白衣胜雪。她对你微微一笑：「今晚月色真美，你想不想……看更美的风景？」`,
                    step3: `她拉着你的手穿过回廊，裙摆拂过台阶上的落花。到了一扇门前，她停下脚步，回头对你俏皮地眨了眨眼。`,
                    step4: `房中早已备好了酒菜。她为你斟了一杯酒，自己先饮了一口，然后红着脸凑上来渡进你口中。`,
                    end: `她靠在窗前看着月亮，你也靠过去。她偏过头轻轻吻了你的脸颊：「今晚……我很开心。」`,
                },
            ],
            married: [
                {
                    step2: `${bd.name}咬着嘴唇，眼神闪烁：「他……他今晚不在家。你……你进来吧。」声音低得几乎听不见。`,
                    step3: `她警惕地看了眼四周，飞快地拉起你的手闪进门内，反手插上了门栓。黑暗中，她的呼吸又急又烫。`,
                    step4: `锦被凌乱，她一边吻你一边去解你的衣带，动作急迫又带着一丝禁忌的颤栗。「快点……别被人发现了……」`,
                    end: `事毕，她靠在你肩头，手指在你胸口轻轻画着圈：「下次……下次什么时候来？」`,
                },
                {
                    step2: `${bd.name}倚在门边，手里拈着一朵花：「你来得可真会挑时候。他出门了，三天后才回。」`,
                    step3: `她转身进屋，脚步比平时轻快许多。你跟着进去，她随手带上了门，却没有插栓——似乎在享受这种危险的感觉。`,
                    step4: `她把你推倒在榻上，自己慢慢解开衣襟，动作妩媚而从容。「急什么？长夜漫漫，有的是时间。」`,
                    end: `她慵懒地伸了个懒腰，翻身趴在你胸口：「明天……还来吗？」眼底带着狡黠的笑意。`,
                },
                {
                    step2: `夜色渐深。她听见敲门声，打开一条门缝看见是你，急忙把你拉了进去。「你怎么这个时辰来了！」`,
                    step3: `她急匆匆把你推进柴房，自己也挤了进来。狭小的空间里两人贴得很近，她屏着呼吸听外面的动静。`,
                    step4: `柴房里堆着干草，她推着你倒在草堆上，一边捂着你的嘴一边笨拙地解你的腰带。「别出声……隔壁有人……」`,
                    end: `她帮你拍掉身上的草屑，脸红得像火烧：「下次……下次别挑这种时候了……」说完自己却忍不住笑了。`,
                },
                {
                    step2: `${bd.name}神色复杂地看着你，沉默了很久才说：「你知道这是错的吧？」可她的手却紧紧抓着你的衣袖不放。`,
                    step3: `她拉着你走进内室，从一个锁着的箱子里拿出一壶酒：「这是我出嫁时埋下的女儿红……本来说好和他一起喝的。」她苦笑了一下。`,
                    step4: `几杯酒下肚，她的脸颊泛起桃花色。她靠在你肩上，声音带着醉意和委屈：「他从来……从来没有好好看过我。」`,
                    end: `她蜷缩在你怀里，像一只终于找到窝的猫。临睡前她迷迷糊糊说了一句：「要是早点遇到你就好了。」`,
                },
                {
                    step2: `${bd.name}正在梳头，从镜子里看见你来了，手上的梳子顿了一下。她没有回头，只是轻声说：「把门带上。」`,
                    step3: `她放下梳子站起身，长发披散在肩上。她走到你面前，伸手帮你整理了一下衣领，动作温柔得像妻子对待丈夫。`,
                    step4: `她拉着你的手放在她腰间，自己踮起脚吻了上来。这个吻绵长而缠绵，像是积压了太久太久的思念。`,
                    end: `她枕在你臂弯里，用手指梳理着你胸口的汗珠。安静了很久，她说：「我是不是个坏女人？」没等你回答，她又说：「可我不后悔。」`,
                },
            ],
            widow: [
                {
                    step2: `${bd.name}一把抓住你的手腕，目光灼热：「还磨蹭什么？进来！」语气不容拒绝。`,
                    step3: `她直接将你拉进屋内，一脚踢上门，把你按在门板上就是一个热吻。动作狂野而熟练。`,
                    step4: `衣衫散落一地，她骑在你身上，居高临下地看着你：「今晚别想轻易下老娘的床。」`,
                    end: `云收雨歇，她意犹未尽地舔了舔嘴唇：「还行，比我家那死鬼强点。明晚还来不来？」`,
                },
                {
                    step2: `${bd.name}正在院里劈柴，一斧头下去木头应声裂开。她抬头看见你，把斧头往地上一插，拍了拍手：「来了？屋里坐。」`,
                    step3: `她倒了碗凉茶递给你，趁你接碗的时候一把抓住你的手腕，力气大得惊人。「喝茶不急，先做点正事。」`,
                    step4: `她把你的双手按在头顶，另一只手熟练地挑开你的衣襟。你刚要说话，她低头吻住你，把你的话全都堵了回去。`,
                    end: `她大字型躺在床上，喘匀了气之后侧过头看你：「你小子体力不错。去，把柴劈了，晚上接着来。」`,
                },
                {
                    step2: `${bd.name}叼着一根草茎靠在门框上，上下打量了你一番，嗤笑一声：「我还以为你不敢来了呢。」`,
                    step3: `她转身进屋，腰带随手一扯扔在地上，边走边脱，到床边时已一丝不挂。她回头看你一眼：「愣着干什么？」`,
                    step4: `她一把将你拽到床上，翻身压住你，手指从你的喉结一路滑到小腹。「今天姐姐心情好，让你见识见识什么叫真正的快活。」`,
                    end: `她披衣坐起，靠在床头，拍了拍你的脸：「不错，有进步。明天这个时辰，自己过来，别让我等。」`,
                },
                {
                    step2: `门没锁，你一推就开了。${bd.name}坐在昏暗的灯下，手里拈着一根针在补衣裳。她没有抬头，只是说了句：「把门锁上。」`,
                    step3: `她咬断线头，把衣裳往旁边一放，这才抬起头来看你。灯光下她的眼神像是一汪深潭，能把人吸进去。`,
                    step4: `她慢慢解开衣襟，露出肩头一道陈旧的疤痕。她拉着你的手去触碰那道疤，声音平静：「他打的。现在他死了。」然后她吻了上来，激烈得像要把你吃掉。`,
                    end: `她趴在床上，脸埋在枕头里。你以为她睡了，却听见她闷闷地说了一句：「以后……别负我。」声音脆弱得像另一个人。`,
                },
                {
                    step2: `${bd.name}今天似乎喝了酒，脸颊泛红，眼神比平时更加大胆。她看见你，直接勾了勾手指：「过来。」`,
                    step3: `她拉着你的衣领把你拽进房里，脚后跟一带关上了门。她把你推到桌沿，欺身压上来，酒气混着体香扑面而来。`,
                    step4: `她一边吻你一边抓起桌上的酒壶灌了一口，然后嘴对嘴喂给你。酒液顺着你们交缠的嘴角淌下，她伸出舌头舔了干净。`,
                    end: `她醉醺醺地趴在你身上，手指在你胸口胡乱画着：「你知不知道……老娘忍了多久……」说着说着声音小了下去，竟是睡着了。`,
                },
            ],
        };
        const pool = scenes[s] || scenes.unmarried;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getKissScene(bd) {
        const s = bd.inner;
        const scenes = {
            unmarried: [
                { narrator: `你轻轻捧起她的脸，她害羞地闭上眼睛，睫毛微微颤动。双唇相触的瞬间，她整个人都僵住了，像一只受惊的小鸟。`, line: '（她没有说话，只是把脸埋进了你的胸口。）' },
                { narrator: `你低头吻她，她先是愣了愣，随后缓缓闭上眼，双手不自觉地攥住了你的衣襟。吻毕她红着脸，半天不敢抬头看你。`, line: '「你……你欺负人。」' },
                { narrator: `她踮起脚尖，飞快地在你脸颊上啄了一下，然后退后半步脸红得像火烧。`, line: '「这……这样可以了吗？」' },
                { narrator: `你揽住她的腰，她微微一颤，顺从地仰起头。吻到动情处，她轻轻哼了一声，双手攀上你的肩膀。`, line: '「公子……」' },
                { narrator: `她正说着话，你突然俯身吻住她。她瞪大眼睛，片刻后缓缓闭上，攥着你衣袖的手指松开又攥紧。`, line: '（她喘匀了气，小声嘟囔了一句：「坏蛋……」）' },
            ],
            married: [
                { narrator: `你揽住她的腰吻了上去，她先是一惊，随即闭上眼睛回应你的吻，带着一种压抑已久的渴望。`, line: '「别在这里……会被人看见的……」' },
                { narrator: `她主动凑上来，双手环住你的脖子。这个吻绵长而用力，仿佛要把所有说不出口的话都融进唇齿之间。`, line: '「我想你了……」' },
                { narrator: `你轻轻抬起她的下巴，她顺从地仰起头，目光迷离。吻到她喘息微微加快时，她咬着嘴唇低笑了一声。`, line: '「你倒是会哄人。」' },
                { narrator: `她从背后抱住你，等你转身时她踮起脚尖吻了上来。吻了一会儿她退开半步，舌尖轻轻舔了舔嘴唇。`, line: '「这个味道……我记住了。」' },
                { narrator: `你们的目光撞在一起，谁也没有说话。她伸手抓住你的衣领把你拉近，额头抵着你的额头。`, line: '「别说话……吻我。」' },
            ],
            widow: [
                { narrator: `你还没动作，她已经一把揪住你的衣领把你拽到面前，狠狠地吻了上来。这个吻带着一股狠劲。`, line: '「怎么？吓着了？」' },
                { narrator: `她单手撑在墙上把你困在中间，另一只手抬起你的下巴：「别动，让我好好尝尝。」然后低头吻了下来。`, line: '「嗯……还行，没让我失望。」' },
                { narrator: `她叼着一根草茎靠在墙边，见你走近伸手勾住你的脖子，把草茎吐掉，笑着吻了上来。`, line: '「青草味的，没尝过吧？」' },
                { narrator: `你们并肩坐着，她忽然侧过头来吻你，一只手按住你的后脑不许你退。吻够了才松开，拇指抹了一下嘴角。`, line: '「怎么？不习惯寡妇的吻？」' },
                { narrator: `她喝了酒，脸颊泛红。她把你拉进怀里低头吻住你，酒香混着她的气息灌进口中。吻完她靠在你肩上。`, line: '「你可别嫌我粗鲁……我就这德性。」' },
            ],
        };
        const pool = scenes[s] || scenes.unmarried;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getGropeScene(bd) {
        const s = bd.inner;
        const scenes = {
            unmarried: [
                { narrator: `你的手轻轻覆上她的腰间，她浑身一颤，却没有躲开，只是咬着嘴唇低下头去。`, line: '「别……别在这里……」' },
                { narrator: `你试探着将手滑到她的腰侧，她隔着衣料按住了你的手，犹豫了片刻又慢慢松开。`, line: '「你……你手老实点……」' },
                { narrator: `你的手掌贴着她的背脊缓缓滑下，她呼吸一滞，整个人软了几分，不得不扶住你的肩膀。`, line: '「我……我站不住了……」' },
                { narrator: `你握住她的手放在自己掌心，另一只手揽住她的腰往怀里带了带。她抬起头看了你一眼，眼波如水。`, line: '「你净会欺负我……」' },
                { narrator: `你的手指顺着她的手臂缓缓滑下，指尖轻轻划过她的手背。她像触电般缩了一下，随即又悄悄把手放了回来。`, line: '（她低着头，耳根红得像要滴血。）' },
            ],
            married: [
                { narrator: `你的手滑到她的腰间，她呼吸微微一促，非但没有躲开反而往你身上靠了靠。`, line: '「别在这里……进屋去……」' },
                { narrator: `你从背后环住她的腰，她先是僵了一下，随即放松了身体靠在你怀里，抓住了你的手腕却没推开。`, line: '「就……就抱一会儿……」' },
                { narrator: `你的手轻轻抚过她的肩头，她偏过头来蹭了蹭你的手，像一只慵懒的猫。她闭着眼轻声说。`, line: '「别停……」' },
                { narrator: `你握住她的手腕将她轻轻拉近，她的气息有些不稳，却还是仰起头迎上你的目光，嘴角带着一丝若有若无的笑。`, line: '「你胆子越来越大了……」' },
                { narrator: `你的手沿着她的背脊缓缓下滑，她咬着嘴唇没有出声，只是手指紧紧攥住了你的衣袖，指甲几乎掐进肉里。`, line: '（她深吸了一口气，努力让自己的声音平稳。）「你真是……」' },
            ],
            widow: [
                { narrator: `你的手刚碰到她的腰，她一把抓住你的手腕，挑了挑眉。`, line: '「往哪儿放呢？倒是不见外。」' },
                { narrator: `她直接拉起你的手按在自己腰上，嗤笑一声。`, line: '「想摸就摸，鬼鬼祟祟的干什么？我还能吃了你不成？」' },
                { narrator: `你的手滑过她的背，她哼了一声，反而挺直了腰往你手上送。`, line: '「怎么？就这点胆量？我还以为你多有本事呢。」' },
                { narrator: `她抓住你的手放在自己腿上，斜眼看着你。`, line: '「想往上还是往下？你倒是说句话呀。」' },
                { narrator: `你刚伸手，她就把你的手按在自己胸口，笑得花枝乱颤。`, line: '「男人那点心思我还不知道？摸吧，反正你也不吃亏。」' },
            ],
        };
        const pool = scenes[s] || scenes.unmarried;
        return pool[Math.floor(Math.random() * pool.length)];
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
            if (!this.redRecord[bd.id]) {
                this.redRecord[bd.id] = {
                    id: bd.id, name: bd.name, age: bd.age, surface: bd.surface, inner: bd.inner,
                    height: bd.height, bust: bd.bust, waist: bd.waist, hips: bd.hips,
                    faceDesc: bd.faceDesc, bodyDesc: bd.bodyDesc, faceScore: bd.faceScore, bodyScore: bd.bodyScore,
                    beautyScore: bd.beautyScore, chastity: bd.chastity, beautyTierLabel: bd.beautyTierLabel, beautyTierColor: bd.beautyTierColor,
                    firstMet: new Date().toLocaleDateString(),
                };
            }
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
