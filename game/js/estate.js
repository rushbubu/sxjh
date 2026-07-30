/* ─── 庄园管理系统（独立UI界面） ───
 *   通过 EstateManager 类管理
 *   调用方式：
 *     game.estateManager.enterEstate(cityId)
 *
 *   庄园布局（按传统古建分区）：
 *     前院：会客厅
 *     正堂：膳厅
 *     后院：花园、鱼池、浴池
 *     东厢：卧室群（入住红颜的房间）
 *     西厢：练功房、炼丹房、书房
 *     跨院：库房、庖厨
 */

const ESTATE_ZONES = {
    front: { name: '前院', desc: '会客迎宾之所', icon: '🚪', rooms: ['reception'] },
    hall: { name: '正堂', desc: '用膳宴客之地', icon: '🏛', rooms: ['dining'] },
    backyard: { name: '后院', desc: '休闲赏景之园', icon: '🌿', rooms: ['garden'], hasPond: true, hasBath: true },
    eastwing: { name: '东厢', desc: '红颜闺房', icon: '🪟', isBedroom: true },
    westwing: { name: '西厢', desc: '修炼研习之处', icon: '📚', rooms: ['training', 'alchemy', 'study'] },
    sideyard: { name: '跨院', desc: '杂务仓储', icon: '🏠', rooms: ['storage', 'kitchen'] },
};

// ─── 庄园内红颜的时段行为 ───
// 映射: timePeriod -> { zoneKey, description }
const ESTATE_RESIDENT_SCHEDULE = {
    '清晨': { zone: 'backyard', desc: '在花园中散步',       bathChance: 0.4 },
    '正午': { zone: 'hall', desc: '在膳厅用茶' },
    '黄昏': { zone: 'backyard', desc: '在庭院中纳凉',       bathChance: 0.4 },
    '子时': { zone: 'eastwing', desc: '已在闺房就寝' },
};

class EstateManager {
    constructor(game) {
        this.game = game;
    }

    /* ─── 入口：进入庄园 ─── */
    enterEstate(cityId) {
        this.cityId = cityId;
        this.game.clearChoices();
        const house = this.game.player.houses?.[cityId];
        if (!house || house.plotIndex < 2) {
            this.game.addMessage('只有庄园规格的宅院才有独立的庄园界面。', 'narrator');
            this.game.showChoices([{ text: '回去', action: () => this.game.showLocationChoices() }]);
            return;
        }
        this._renderEstate();
    }

    /* ─── 渲染庄园主界面 ─── */
    _renderEstate() {
        const logEl = document.getElementById('log');
        logEl.innerHTML = '';
        const container = document.createElement('div');
        container.id = 'estate-layout';
        container.style.cssText = 'padding:10px;max-height:500px;overflow-y:auto;';

        const house = this.game.player.houses[this.cityId];
        const cityName = cityIdToName(this.cityId);

        // 标题
        const title = document.createElement('div');
        title.style.cssText = 'font-size:18px;font-weight:bold;text-align:center;padding:8px;border-bottom:2px solid #8b6b4d;color:#5a3d2b;margin-bottom:10px;';
        title.textContent = `🏯 ${cityName}庄园`;
        container.appendChild(title);

        // 时段 + 入住人数
        const info = document.createElement('div');
        info.style.cssText = 'text-align:center;font-size:13px;color:#666;margin-bottom:12px;';
        const period = this.game.player.timePeriod || '清晨';
        info.textContent = `【${period}】入住：${house.residents.length}人 | 卧室：${house.bedroomCount}间`;
        container.appendChild(info);

        // 区域网格
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;';

        Object.entries(ESTATE_ZONES).forEach(([key, zone]) => {
            const card = document.createElement('div');
            card.style.cssText = 'border:1px solid #d4c5a9;border-radius:6px;padding:8px;cursor:pointer;background:#faf6ef;transition:background .2s;';
            card.onmouseenter = () => { card.style.background = '#f0e6d3'; };
            card.onmouseleave = () => { card.style.background = '#faf6ef'; };

            let titleText = `${zone.icon} ${zone.name}`;
            let contentText = zone.desc;

            if (zone.isBedroom) {
                // 东厢：列出卧室中的红颜
                const residents = house.residents || [];
                const bedroomCount = house.bedroomCount || 0;
                const residentNames = residents.map(id => {
                    const bd = this._getBeautyById(id);
                    return bd ? bd.name : '?';
                });
                contentText = `卧室${bedroomCount}间`;
                if (residentNames.length > 0) {
                    contentText += ' · ' + residentNames.join('、');
                }
                if (residentNames.length === 0) {
                    contentText += '（空房）';
                }
            } else if (zone.hasPond && house.features?.pond?.level > 0) {
                contentText += ' · 鱼池Lv.' + house.features.pond.level;
            } else if (zone.hasBath && house.features?.bath?.level > 0) {
                const bath = house.features.bath;
                const cfg = HOUSE_BATH_CONFIG[bath.type];
                contentText += ' · ' + (cfg ? cfg.icon : '') + '浴池Lv.' + bath.level;
            } else {
                const built = (zone.rooms || []).filter(r => house.rooms[r]);
                if (built.length > 0) {
                    const names = built.map(r => (HOUSE_ROOM_TYPES[r] || { name: r }).name);
                    contentText = names.join('、');
                }
            }

            card.innerHTML = `<div style="font-weight:bold;font-size:14px;color:#5a3d2b;">${titleText}</div><div style="font-size:12px;color:#888;margin-top:3px;">${contentText}</div>`;
            card.onclick = () => this._onZoneClick(key);
            grid.appendChild(card);
        });
        container.appendChild(grid);

        // 按钮行
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;';

        // 管家按钮（所有管理功能）
        const butlerBtn = this._createBtn('👤 管家', '#6b4226', () => this._showButlerMenu());
        btnRow.appendChild(butlerBtn);

        // 翻牌侍寝（子时可用）
        if (period === '子时' && house.residents.length > 0) {
            const flipBtn = this._createBtn('🃏 翻牌侍寝', '#a03535', () => this._showFlipMenu());
            btnRow.appendChild(flipBtn);
        }

        // 沐浴
        if (house.features?.bath?.level > 0) {
            const bathBtn = this._createBtn('🛁 沐浴', '#3a7ca5', () => this._bathAction());
            btnRow.appendChild(bathBtn);
        }

        // 就寝（无红颜时）
        if (period === '子时' && house.residents.length === 0) {
            const sleepBtn = this._createBtn('💤 就寝', '#5a7a5a', () => {
                this.game.clearChoices();
                document.getElementById('log').innerHTML = '';
                this.game.sleepToTomorrow(true);
            });
            btnRow.appendChild(sleepBtn);
        }

        // 离开庄园
        const leaveBtn = this._createBtn('🚪 离开庄园', '#888', () => {
            document.getElementById('log').innerHTML = '';
            this.game.showHomeChoices();
        });
        btnRow.appendChild(leaveBtn);

        container.appendChild(btnRow);
        logEl.appendChild(container);
    }

    _createBtn(text, color, onClick) {
        const btn = document.createElement('button');
        btn.textContent = text;
        btn.style.cssText = `padding:6px 14px;border:1px solid ${color};border-radius:4px;background:white;color:${color};cursor:pointer;font-size:13px;`;
        btn.onmouseenter = () => { btn.style.background = color; btn.style.color = 'white'; };
        btn.onmouseleave = () => { btn.style.background = 'white'; btn.style.color = color; };
        btn.onclick = onClick;
        return btn;
    }

    /* ─── 区域点击 ─── */
    _onZoneClick(zoneKey) {
        const house = this.game.player.houses[this.cityId];
        const period = this.game.player.timePeriod || '清晨';

        if (zoneKey === 'eastwing') {
            // 东厢：展示卧室列表 & 入住红颜
            this._showBedroomWing();
            return;
        }
        if (zoneKey === 'backyard') {
            // 后院：花园/鱼池/浴池
            const beautiesHere = this._getBeautiesInZone('backyard');
            // 黄昏和清晨：红颜有概率在浴池
            const sched = ESTATE_RESIDENT_SCHEDULE[this.game.player.timePeriod || '清晨'];
            const inBath = sched && sched.bathChance && Math.random() < sched.bathChance && house.features?.bath?.level > 0;
            if (inBath && beautiesHere.length > 0) {
                const bd = beautiesHere[Math.floor(Math.random() * beautiesHere.length)];
                const cfg = HOUSE_BATH_CONFIG[house.features.bath.type];
                this.game.addMessage(`你走向${cfg ? cfg.name : '浴池'}，听到水声——${bd.name}正在里面沐浴。水汽氤氲中，她光洁的肩背若隐若现。`, 'narrator');
                this.game.showChoices([
                    { text: '一起洗', action: () => {
                        this.game.addMessage(`${bd.name}看到你进来，脸颊泛红，却没有躲开。`, 'narrator');
                        this._bathAction(bd);
                    }},
                    { text: '不打扰她', action: () => this._renderEstate() },
                ]);
                return;
            }
            if (beautiesHere.length > 0) {
                this._showZoneWithBeauties('后院', beautiesHere);
            } else {
                this.game.addMessage('后院清幽雅致，花木扶疏。', 'narrator');
                if (house.features?.pond?.level > 0) {
                    this.game.addMessage('一方鱼池碧波荡漾，锦鲤悠然游弋。', 'info');
                }
                if (house.features?.bath?.level > 0) {
                    const bath = house.features.bath;
                    const cfg = HOUSE_BATH_CONFIG[bath.type];
                    this.game.addMessage(cfg ? cfg.name + '水汽氤氲。' : '浴池水汽氤氲。', 'info');
                }
                this.game.showChoices([
                    ...(house.features?.pond?.level > 0 ? [{ text: '观赏鱼池', action: () => this._viewPond() }] : []),
                    ...(house.features?.bath?.level > 0 ? [{ text: '沐浴', action: () => this._bathAction() }] : []),
                    { text: '回去', action: () => this._renderEstate() },
                ]);
            }
            return;
        }

        // 其他区域：看是否有红颜在此
        const beautiesHere = this._getBeautiesInZone(zoneKey);
        if (beautiesHere.length > 0) {
            this._showZoneWithBeauties(ESTATE_ZONES[zoneKey].name, beautiesHere);
        } else {
            this.game.addMessage(`你来到${ESTATE_ZONES[zoneKey].name}。${ESTATE_ZONES[zoneKey].desc}。`, 'narrator');
            const built = (ESTATE_ZONES[zoneKey].rooms || []).filter(r => house.rooms[r]);
            if (built.length > 0) {
                built.forEach(r => {
                    const rt = HOUSE_ROOM_TYPES[r];
                    if (rt) this.game.addMessage(`${rt.icon} ${rt.name} Lv.${house.rooms[r]}：${rt.levels[house.rooms[r] - 1].desc}`, 'info');
                });
            } else {
                this.game.addMessage('这里暂时空置着。', 'info');
            }
            this.game.showChoices([{ text: '回去', action: () => this._renderEstate() }]);
        }
    }

    /* ─── 东厢：卧室区域 ─── */
    _showBedroomWing() {
        this.game.clearChoices();
        const house = this.game.player.houses[this.cityId];
        const period = this.game.player.timePeriod || '清晨';

        this.game.addMessage('—— 东厢 · 闺房 ——', 'system');
        this.game.addMessage(`卧室${house.bedroomCount}间，已入住${house.residents.length}人`, 'info');

        const choices = [];

        if (house.residents.length > 0) {
            house.residents.forEach(id => {
                const bd = this._getBeautyById(id);
                if (!bd) return;
                // 根据时段判断她在哪
                const sched = ESTATE_RESIDENT_SCHEDULE[period] || ESTATE_RESIDENT_SCHEDULE['清晨'];
                const inRoom = sched.zone === 'eastwing';
                const inBath = sched.bathChance && house.features?.bath?.level > 0;
                const bathStatus = inBath ? '或在浴池沐浴' : '';
                const status = inRoom ? '（在房内）' : `（在${ESTATE_ZONES[sched.zone]?.name || '院中'}${sched.desc}${bathStatus ? '，' + bathStatus : ''}）`;
                choices.push({
                    text: `${bd.name}${status}`,
                    action: () => this._interactResident(bd, inRoom),
                });
            });
        }

        choices.push({ text: '回去', action: () => this._renderEstate() });
        this.game.showChoices(choices);
    }

    /* ─── 获取在某区域的红颜列表 ─── */
    _getBeautiesInZone(zoneKey) {
        const house = this.game.player.houses[this.cityId];
        const period = this.game.player.timePeriod || '清晨';
        const sched = ESTATE_RESIDENT_SCHEDULE[period];
        if (!sched) return [];
        if (sched.zone !== zoneKey) return [];
        return (house.residents || [])
            .map(id => this._getBeautyById(id))
            .filter(Boolean);
    }

    /* ─── 显示区域中的红颜 ─── */
    _showZoneWithBeauties(zoneName, beauties) {
        this.game.clearChoices();
        this.game.addMessage(`你在${zoneName}遇到了${beauties.map(b => b.name).join('和')}。`, 'narrator');
        const choices = beauties.map(bd => ({
            text: bd.name,
            action: () => this._interactResident(bd, false),
        }));
        choices.push({ text: '回去', action: () => this._renderEstate() });
        this.game.showChoices(choices);
    }

    /* ─── 与入住红颜互动 ─── */
    _interactResident(bd, inRoom) {
        this.game.clearChoices();
        this.game.addMessage(`${bd.name}${inRoom ? '正在房中' : '正在此处'}。`, 'narrator');
        const period = this.game.player.timePeriod || '清晨';
        const choices = [];

        choices.push({ text: '闲聊', action: () => this._estateChat(bd) });

        if (bd.favorability >= 40 || bd._hadSex) {
            choices.push({ text: '调情', action: () => this._estateFlirt(bd) });
        }

        if (bd.favorability >= 60 || (bd._hadSex && bd.favorability >= 30)) {
            if (!inRoom) {
                choices.push({ text: '在此欢好', action: () => this._startEstateSex(bd, null) });
            }
            choices.push({ text: '回房欢好', action: () => this._startEstateSex(bd, null) });
        }

        if (period === '子时' && inRoom) {
            choices.push({ text: '就寝', action: () => {
                this.game.clearChoices();
                document.getElementById('log').innerHTML = '';
                this.game.sleepToTomorrow(true);
            }});
        }

        choices.push({ text: '算了', action: () => this._renderEstate() });
        this.game.showChoices(choices);
    }

    /* ─── 庄园闲聊 ─── */
    _estateChat(bd) {
        this.game.clearChoices();
        const lines = [
            `${bd.name}微笑着看着你：「相公回来了？我让人备了茶。」`,
            `${bd.name}坐在窗前做女红，见你进来便放下针线：「你来啦？」`,
            `${bd.name}正在看一本闲书，抬头见你，浅浅一笑：「要不要一起坐坐？」`,
            `${bd.name}：「庄园里一切都好，就是怪想你的。」`,
            `${bd.name}给你倒了杯茶：「刚沏的，你尝尝。」`,
        ];
        this.game.addMessage(lines[Math.floor(Math.random() * lines.length)], 'narrator');
        this.game.showChoices([
            { text: '继续聊聊', action: () => this._estateChat(bd) },
            { text: '不说了', action: () => this._interactResident(bd, true) },
        ]);
    }

    /* ─── 庄园调情 ─── */
    _estateFlirt(bd) {
        this.game.clearChoices();
        const flirtLines = [
            `你凑近${bd.name}耳边低语了几句，她脸颊飞红，轻轻捶了你一下：「没正经。」`,
            `你从背后环住${bd.name}的腰，下巴搁在她肩头。她身子微微一僵，随即放松下来，靠在你怀里。`,
            `你捏了捏${bd.name}的手心，她抬眼看你，目光里带着些许羞涩和期待。`,
            `${bd.name}被你逗得面红耳赤，小声啐了一口：「大白天的……说这些……」`,
        ];
        this.game.addMessage(flirtLines[Math.floor(Math.random() * flirtLines.length)], 'narrator');
        bd.favorability = Math.min(100, (bd.favorability || 0) + 2);
        this.game.showChoices([
            { text: '继续调情', action: () => this._estateFlirt(bd) },
            { text: '要了她', action: () => this._startEstateSex(bd, null) },
            { text: '算了', action: () => this._renderEstate() },
        ]);
    }

    /* ─── 启动庄园云雨 ─── */
    _startEstateSex(bd, roomName) {
        const g = this.game;
        startEstateFling(bd, g.player, {
            addMessage: (...a) => g.addMessage(...a),
            showChoices: (...a) => g.showChoices(...a),
            clearChoices: () => g.clearChoices(),
            updateStatsBar: () => g.updateStatsBar(),
            sleepToTomorrow: (v) => g.sleepToTomorrow(v),
            roomName: roomName || (this.cityId ? cityIdToName(this.cityId) + '庄园卧房' : '闺房'),
        });
    }

    /* ─── 翻牌侍寝 ─── */
    _showFlipMenu() {
        this.game.clearChoices();
        const house = this.game.player.houses[this.cityId];
        const residents = (house.residents || []).map(id => this._getBeautyById(id)).filter(Boolean);

        if (residents.length === 0) {
            this.game.addMessage('没有红颜可以侍寝。', 'narrator');
            this.game.showChoices([{ text: '回去', action: () => this._renderEstate() }]);
            return;
        }

        this.game.addMessage('夜色已深，你拿出侍寝牌……', 'narrator');
        const choices = [];

        // 单人选项
        residents.forEach(bd => {
            choices.push({ text: `${bd.name}侍寝`, action: () => this._startEstateSex(bd, '卧房') });
        });

        // 双飞选项（至少2人）
        if (residents.length >= 2) {
            for (let i = 0; i < residents.length; i++) {
                for (let j = i + 1; j < residents.length; j++) {
                    const bd1 = residents[i];
                    const bd2 = residents[j];
                    choices.push({
                        text: `${bd1.name} + ${bd2.name} 双飞侍寝`,
                        action: () => this._startThreesome(bd1, bd2),
                    });
                }
            }
        }

        choices.push({ text: '今晚算了', action: () => this._renderEstate() });
        this.game.showChoices(choices);
    }

    /* ─── 双飞 ─── */
    _startThreesome(bd1, bd2) {
        const g = this.game;
        startEstateThreesome([bd1, bd2], g.player, {
            addMessage: (...a) => g.addMessage(...a),
            showChoices: (...a) => g.showChoices(...a),
            clearChoices: () => g.clearChoices(),
            updateStatsBar: () => g.updateStatsBar(),
            sleepToTomorrow: (v) => g.sleepToTomorrow(v),
            roomName: cityIdToName(this.cityId) + '庄园卧房',
        });
    }

    /* ─── 管家菜单 ─── */
    _showButlerMenu() {
        this.game.clearChoices();
        const house = this.game.player.houses[this.cityId];
        this.game.addMessage('老管家躬身行礼：「老爷，您有何吩咐？」', 'narrator');

        const choices = [
            { text: '增建房间', action: () => this.houseManager._showBuildRoom(this.cityId) },
            { text: '升级房间', action: () => this.houseManager._showUpgradeRoom(this.cityId) },
            { text: '卧室管理', action: () => this.houseManager._showBedroomMenu(this.cityId) },
        ];

        const hasPond = house.features?.pond?.level > 0;
        const hasBath = house.features?.bath?.level > 0;

        if (hasPond) {
            choices.push({ text: '鱼池管理', action: () => this.houseManager._showPondMenu(this.cityId) });
        } else {
            choices.push({ text: '修建鱼池', action: () => this.houseManager._showBuildPond(this.cityId) });
        }
        if (hasBath) {
            choices.push({ text: '浴池管理', action: () => this.houseManager._showBathMenu(this.cityId) });
        } else {
            choices.push({ text: '修建浴池', action: () => this.houseManager._showBuildBath(this.cityId) });
        }
        choices.push({ text: '入住管理', action: () => this.houseManager._showResidentMenu(this.cityId) });
        choices.push({ text: '宅院总览', action: () => this.houseManager._showGlobalHouseMenu() });
        choices.push({ text: '没事了', action: () => this._renderEstate() });

        this.game.showChoices(choices);
    }

    /* ─── 浴池沐浴（companionBd 为可选，指定一同沐浴的红颜） ─── */
    _bathAction(companionBd) {
        this.game.clearChoices();
        const house = this.game.player.houses[this.cityId];
        const bath = house.features?.bath;
        if (!bath) return this._renderEstate();
        const cfg = HOUSE_BATH_CONFIG[bath.type];
        const lvCfg = cfg.levels[bath.level - 1];
        const p = this.game.player;
        const oldHp = p.attrs ? p.attrs.hp : p.hp;
        if (p.attrs) {
            p.attrs.hp = Math.min(p.attrs.hp + lvCfg.healHp, p.attrs.hpMax);
            p.attrs.neiliCost = Math.max(p.attrs.neiliCost - lvCfg.healNeili, 0);
        } else {
            p.hp = Math.min(p.hp + lvCfg.healHp, p.maxHp);
        }
        this.game.addMessage(`你步入${cfg.name}，热水包裹全身，疲惫一扫而空。`, 'narrator');
        const newHp = p.attrs ? p.attrs.hp : p.hp;
        this.game.addMessage(`气血 +${newHp - oldHp}，内力 +${lvCfg.healNeili}`, 'system');
        this.game.updateStatsBar();
        if (companionBd) {
            this.game.addMessage(`${companionBd.name}也在水中，温热的水面下她的胴体若隐若现。`, 'narrator');
            this.game.showChoices([
                { text: '在水里要了她', action: () => this._startEstateSex(companionBd, cfg.name) },
                { text: '洗好了', action: () => this._renderEstate() },
            ]);
            return;
        }
        // 随机检查是否有红颜同在浴池
        const sched = ESTATE_RESIDENT_SCHEDULE[this.game.player.timePeriod || '清晨'];
        if (sched && sched.bathChance) {
            const beautiesHere = this._getBeautiesInZone('backyard');
            if (beautiesHere.length > 0 && Math.random() < sched.bathChance) {
                const bd = beautiesHere[Math.floor(Math.random() * beautiesHere.length)];
                this.game.addMessage(`水汽散去了一些，你发现${bd.name}也在池中。她看见你，脸颊泛红。`, 'narrator');
                this.game.showChoices([
                    { text: '靠近她', action: () => this._bathAction(bd) },
                    { text: '洗好了', action: () => this._renderEstate() },
                ]);
                return;
            }
        }
        this.game.showChoices([{ text: '洗好了', action: () => this._renderEstate() }]);
    }

    /* ─── 观赏鱼池 ─── */
    _viewPond() {
        this.game.clearChoices();
        const house = this.game.player.houses[this.cityId];
        const pond = house.features?.pond;
        if (!pond) return this._renderEstate();
        const pc = HOUSE_POND_CONFIG;
        const lvCfg = pc.levels[pond.level - 1];
        const stock = pond.stock || {};
        const totalStock = stock.goldfish + stock.koi + stock.turtle;
        const wf = pond.wildFish || [];
        const rareTiers = ['purple', 'orange', 'gold', 'red'];
        const unviewedRare = wf.filter(f => !f._viewed && f.tier && rareTiers.includes(f.tier));
        let luckGained = 0;
        if (unviewedRare.length > 0) {
            unviewedRare.forEach(f => f._viewed = true);
            luckGained = unviewedRare.length * 5;
            this.game.player.attrs.luck += luckGained;
            const names = unviewedRare.map(f => f.name).join('、');
            this.game.addMessage(`你惊喜地发现鱼池中多了${names}！仔细观赏之下，福缘似有增长。`, 'narrator');
            this.game.addMessage(`福缘 +${luckGained}（当前 ${this.game.player.attrs.luck}）`, 'system');
        }
        if (totalStock === 0 && wf.length === 0) {
            this.game.addMessage('池中空无一物，只有一汪清水映着月光。', 'narrator');
        } else {
            const descs = [];
            if (stock.goldfish) descs.push(`${stock.goldfish}尾金鱼在荷叶间穿梭`);
            if (stock.koi) descs.push(`${stock.koi}尾锦鲤翻腾跃动`);
            if (stock.turtle) descs.push(`一只灵龟伏在池底`);
            wf.forEach(f => descs.push(`一尾${f.name}悠然游弋`));
            this.game.addMessage(`你坐在池边，看着${descs.join('，')}，心中一片宁静。`, 'narrator');
        }
        this.game.updateStatsBar();
        this.game.showChoices([{ text: '回去', action: () => this._renderEstate() }]);
    }

    /* ─── 辅助：查找红颜 ─── */
    _getBeautyById(id) {
        const g = this.game;
        for (const locId of Object.keys(g.beautyMap || {})) {
            const found = g.beautyMap[locId].find(b => b.id === id);
            if (found) return found;
        }
        return null;
    }

    /* ─── 通过管家访问 HouseManager 的方法 ─── */
    get houseManager() {
        return this.game.houseManager;
    }
}
