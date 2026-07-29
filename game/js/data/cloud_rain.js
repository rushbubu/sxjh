/* ─── 云雨系统（独立于 Game 类） ───
   调用方式：
      startCloudRain(bd, player, {
        addMessage, showChoices, clearChoices, updateStatsBar,
        sleepToTomorrow, ensureRedRecord,
      });
   其中 bd = beauty._beautyData（或 prostitute 对象）
   player = this.player
*/

function _crPickScene(bd) {
    const s = pickScene(window.FLIRT_SCENES, bd.inner);
    return { step2: fmtLine(s.s2, bd), step3: fmtLine(s.s3, bd), step4: fmtLine(s.s4, bd), end: fmtLine(s.end, bd) };
}

// ─── 独立页面 DOM 管理 ───

function _sexBuildLayout() {
    const logEl = document.getElementById('log');
    logEl.innerHTML = '';
    const layout = document.createElement('div');
    layout.id = 'sex-layout';
    layout.innerHTML =
        '<div id="sex-panel">' +
        '<div class="sex-arousal-row"><span class="sex-a-label sex-female-label">女</span><div class="sex-a-track"><div class="sex-a-fill sex-fa-fill" id="sex-fa-fill"></div></div><span class="sex-a-val" id="sex-fa-text">0</span></div>' +
        '<div class="sex-arousal-row"><span class="sex-a-label sex-male-label">男</span><div class="sex-a-track"><div class="sex-a-fill sex-ma-fill" id="sex-ma-fill"></div></div><span class="sex-a-val" id="sex-ma-text">0</span></div>' +
        '<div class="sex-clothes" id="sex-clothes"></div>' +
        '</div>' +
        '<div id="sex-scene-log"></div>';
    logEl.appendChild(layout);
}

function _sexAddMessage(text, type) {
    const log = document.getElementById('sex-scene-log');
    if (!log) return;
    const msg = document.createElement('div');
    msg.className = 'msg msg-' + type;
    msg.textContent = text;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
}

function _sexUpdatePanel(state) {
    const faFill = document.getElementById('sex-fa-fill');
    const faText = document.getElementById('sex-fa-text');
    const maFill = document.getElementById('sex-ma-fill');
    const maText = document.getElementById('sex-ma-text');
    const clothesEl = document.getElementById('sex-clothes');
    if (faFill) faFill.style.width = state.femaleArousal + '%';
    if (faText) faText.textContent = state.femaleArousal;
    if (maFill) maFill.style.width = state.maleArousal + '%';
    if (maText) maText.textContent = state.maleArousal;
    if (clothesEl) {
        let html = '';
        for (const key of ['outer', 'pants', 'inner', 'bra', 'panties']) {
            const on = state.clothes[key];
            const label = CLOTHING_NAMES[key][0];
            html += '<span class="sex-c-icon' + (on ? '' : ' sex-c-off') + '">' + label + '</span>';
        }
        clothesEl.innerHTML = html;
    }
}

function _getAvailableClothes(state) {
    return UNDRESS_ORDER.filter(k => state.clothes[k]);
}

// ─── 详细云雨场景主流程 ───

function startDetailedSexScene(bd, player, callbacks) {
    const root = player.attrs.root || 10;
    bd._sexState = {
        femaleArousal: 0,
        maleArousal: 0,
        clothes: { outer: true, pants: true, inner: true, bra: true, panties: true },
        orgasmCount: 0,
        lastAction: null,
        canSquirt: Math.random() < 0.3,
        finished: false,
        ejacCount: 0,
        ejacLimit: _getEjacLimit(root),
        holdRounds: _getHoldRounds(root),
        overClock: 0,
    };
    _sexBuildLayout();
    callbacks.clearChoices();
    const venueName = bd._sexVenue || bd._currentVenueName || '闺房';
    _sexAddMessage(pickSexStartDesc(venueName), 'narrator');
    if (bd._wasVirgin) {
        _sexAddMessage(pickFirstTimeDesc(bd), 'narrator');
    }
    _renderSexMain(bd, player, callbacks);
}

function _renderSexMain(bd, player, callbacks) {
    const s = bd._sexState;
    if (s.finished) return;
    _sexUpdatePanel(s);

    if (s.femaleArousal >= 100) {
        s.femaleArousal = Math.min(s.femaleArousal, 100);
        return _handleImpendingOrgasm(bd, player, callbacks);
    }

    if (s.maleArousal >= 100) {
        if (s.overClock >= s.holdRounds) {
            return _showEjacMenu(bd, player, callbacks);
        }
        s.overClock++;
    }

    callbacks.clearChoices();
    const choices = [];

    if (s.femaleArousal < 30) {
        choices.push({ text: '揩油', action: () => _showForeplayMenu(bd, player, callbacks) });
    } else {
        choices.push({ text: '抚摸', action: () => _showForeplayMenu(bd, player, callbacks) });
        if (_getAvailableClothes(s).length > 0) {
            choices.push({ text: '脱衣', action: () => _showUndressMenu(bd, player, callbacks) });
        }
        if (s.femaleArousal >= 30) {
            choices.push({ text: '侍奉', action: () => _showServiceMenu(bd, player, callbacks) });
        }
        if (s.femaleArousal >= 60) {
            choices.push({ text: '正戏', action: () => _showSexMenu(bd, player, callbacks) });
        }
    }

    choices.push({ text: '结束云雨', action: () => _endSexScene(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

// ─── 抚摸 ───

function _showForeplayMenu(bd, player, callbacks) {
    callbacks.clearChoices();
    const parts = [
        { key: 'face', label: '脸蛋' }, { key: 'chest', label: '胸脯' },
        { key: 'waist', label: '腰肢' }, { key: 'arms', label: '玉臂' },
        { key: 'hips', label: '臀部' }, { key: 'legs', label: '玉腿' },
        { key: 'feet', label: '玉足' },
    ];
    const choices = parts.map(p => ({
        text: '抚摸' + p.label,
        action: () => _doForeplay(bd, player, callbacks, p.key),
    }));
    choices.push({ text: '返回', action: () => _renderSexMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _doForeplay(bd, player, callbacks, part) {
    callbacks.clearChoices();
    const s = bd._sexState;
    const tier = Math.min(3, (s.ejacCount || 0) + 1);
    _sexAddMessage(pickForeplay(part, bd, tier), 'narrator');
    s.femaleArousal = Math.min(100, s.femaleArousal + 5);
    const mAValues = { chest: 4, hips: 4, waist: 2, legs: 2, face: 1, arms: 1, feet: 1 };
    s.maleArousal = Math.min(100, s.maleArousal + (mAValues[part] || 1));
    _sexUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _renderSexMain(bd, player, callbacks) }]);
}

// ─── 脱衣 ───

function _showUndressMenu(bd, player, callbacks) {
    callbacks.clearChoices();
    const available = _getAvailableClothes(bd._sexState);
    if (available.length === 0) {
        _sexAddMessage('她已经一丝不挂了。', 'narrator');
        return _renderSexMain(bd, player, callbacks);
    }
    const next = available[0];
    _sexAddMessage('她身上还穿着' + CLOTHING_NAMES[next] + '。', 'narrator');
    callbacks.showChoices([
        { text: '脱下' + CLOTHING_NAMES[next], action: () => _doUndress(bd, player, callbacks, next) },
        { text: '返回', action: () => _renderSexMain(bd, player, callbacks) },
    ]);
}

function _doUndress(bd, player, callbacks, key) {
    callbacks.clearChoices();
    const s = bd._sexState;
    s.clothes[key] = false;

    if (key === 'bra') {
        _sexAddMessage(getBraRemoveDesc(bd.bust), 'narrator');
        _sexAddMessage(getBraReaction(bd), 'narrator');
        s.femaleArousal = Math.min(100, s.femaleArousal + 1);
    } else if (key === 'panties') {
        _sexAddMessage(getPantiesRemoveDesc(bd), 'narrator');
        _sexAddMessage(getPantiesReaction(bd), 'narrator');
        s.femaleArousal = Math.min(100, s.femaleArousal + 1);
    } else {
        const descs = UNDRESS_DESC[key];
        if (descs) _sexAddMessage(descs[Math.floor(Math.random() * descs.length)], 'narrator');
        s.femaleArousal = Math.min(100, s.femaleArousal + 1);
    }

    _sexUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _renderSexMain(bd, player, callbacks) }]);
}

// ─── 侍奉 ───

function _showServiceMenu(bd, player, callbacks) {
    callbacks.clearChoices();
    const choices = [
        { text: '接吻', action: () => _doService(bd, player, callbacks, 'kiss') },
        { text: '口交', action: () => _doService(bd, player, callbacks, 'blowjob') },
        { text: '足交', action: () => _doService(bd, player, callbacks, 'footjob') },
        { text: '臀部素股', action: () => _doService(bd, player, callbacks, 'sumata') },
    ];
    if (hasCupC(bd.bust)) {
        choices.push({ text: '乳交', action: () => _doService(bd, player, callbacks, 'titjob') });
    }
    choices.push({ text: '把玩玉乳', action: () => _doService(bd, player, callbacks, 'breast') });
    choices.push({ text: '抚弄玉臀', action: () => _doService(bd, player, callbacks, 'butt') });
    choices.push({ text: '小戏花园', action: () => _doService(bd, player, callbacks, 'garden') });
    choices.push({ text: '返回', action: () => _renderSexMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _doService(bd, player, callbacks, type) {
    callbacks.clearChoices();
    const s = bd._sexState;
    s.lastAction = 'service';
    const tier = Math.min(3, (s.ejacCount || 0) + 1);
    const desc = pickServiceDesc(type, tier);
    const segments = (_splitDesc || function(t){return[t]})(desc);
    _sexAddMessage(segments[0], 'narrator');
    if (type === 'kiss') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 4);
        s.maleArousal = Math.min(100, s.maleArousal + 3);
    } else if (type === 'breast') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 6);
        s.maleArousal = Math.min(100, s.maleArousal + 2);
    } else if (type === 'butt') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 6);
        s.maleArousal = Math.min(100, s.maleArousal + 2);
    } else if (type === 'garden') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 10);
        s.maleArousal = Math.min(100, s.maleArousal + 3);
    } else if (type === 'sumata') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 5);
        s.maleArousal = Math.min(100, s.maleArousal + 8);
    } else {
        s.maleArousal = Math.min(100, s.maleArousal + 10);
        s.femaleArousal = Math.min(100, s.femaleArousal + 4);
    }
    _sexUpdatePanel(s);
    if (segments.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _showServiceSegment(bd, player, callbacks, segments, 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _renderSexMain(bd, player, callbacks) }]);
    }
}
function _showServiceSegment(bd, player, callbacks, segments, idx) {
    callbacks.clearChoices();
    _sexAddMessage(segments[idx], 'narrator');
    if (idx < segments.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _showServiceSegment(bd, player, callbacks, segments, idx + 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _renderSexMain(bd, player, callbacks) }]);
    }
}

// ─── 正戏 ───

function _showSexMenu(bd, player, callbacks) {
    callbacks.clearChoices();
    const choices = [
        { text: '正常位', action: () => _doSex(bd, player, callbacks, 'normal') },
        { text: '女上位', action: () => _doSex(bd, player, callbacks, 'cowgirl') },
        { text: '后入式', action: () => _doSex(bd, player, callbacks, 'doggy') },
        { text: '侧入式', action: () => _doSex(bd, player, callbacks, 'spoon') },
    ];
    choices.push({ text: '立位', action: () => _doSex(bd, player, callbacks, 'standing') });
    choices.push({ text: '桌沿', action: () => _doSex(bd, player, callbacks, 'edge') });
    choices.push({ text: '返回', action: () => _renderSexMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _doSex(bd, player, callbacks, key) {
    callbacks.clearChoices();
    const s = bd._sexState;
    s.lastAction = 'sex';
    const tier = Math.min(3, (s.ejacCount || 0) + 1);
    if (!s.posIdx) s.posIdx = {};
    if (!s.posCount) s.posCount = {};
    s.posCount[key] = (s.posCount[key] || 0) + 1;
    const idx = s.posIdx[key] || 0;
    s.posIdx[key] = idx + 1;
    const isFav = bd._favPos === key;
    const pos = pickSexPosition(key, bd, idx, tier);
    _sexAddMessage('【' + pos.name + (isFav ? '★' : '') + '】', 'system');
    const segments = (_splitDesc || function(t){return[t]})(pos.desc);
    _sexAddMessage(segments[0], 'narrator');
    const fA = isFav ? Math.round(pos.fA * 1.1) : pos.fA;
    s.maleArousal = Math.min(100, s.maleArousal + pos.mA);
    s.femaleArousal = Math.min(100, s.femaleArousal + fA);
    _sexUpdatePanel(s);
    if (segments.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _showSexSegment(bd, player, callbacks, segments, 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _afterSexAction(bd, player, callbacks) }]);
    }
}
function _showSexSegment(bd, player, callbacks, segments, idx) {
    callbacks.clearChoices();
    _sexAddMessage(segments[idx], 'narrator');
    if (idx < segments.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _showSexSegment(bd, player, callbacks, segments, idx + 1) }]);
    } else {
        _afterSexAction(bd, player, callbacks);
    }
}

function _afterSexAction(bd, player, callbacks) {
    const s = bd._sexState;
    if (s.femaleArousal >= 100) {
        return _handleImpendingOrgasm(bd, player, callbacks);
    }
    if (s.maleArousal >= 100) {
        callbacks.clearChoices();
        return callbacks.showChoices([
            { text: '射精', action: () => _showEjacMenu(bd, player, callbacks) },
            { text: '继续正戏', action: () => _showSexMenu(bd, player, callbacks) },
        ]);
    }
    _showSexMenu(bd, player, callbacks);
}

// ─── 高潮 ───

// 正戏女性独自高潮文本链（插入中，女性到，男性未射）
const _FEMALE_SOLO_ORGASM = [
    [
        '她的花径骤然缩紧，一阵阵剧烈的颤抖从深处传来，紧紧绞住你的阳物。温热的花蜜喷涌而出，浇淋在你的龟头之上。',
        '你只觉阳具被又湿又热的软肉死死缠住，酥麻感从脊椎直冲头顶，几乎要把你化掉。',
    ],
    [
        '她身子猛地绷紧，腰肢向上拱起，花心深处一阵剧烈的痉挛——她到了高潮。湿热的花液顺着棒身淌了下来。',
        '她的花径一缩一缩地吸吮着你，你深吸一口气，生生压住了那股射意。',
    ],
    [
        '她浑身剧烈地颤抖起来，阴道痉挛着死死咬住你，一股热流从花心深处涌出。她仰着头，喉间发出破碎的呻吟。',
        '那湿热紧窒的软肉紧紧地裹着你，一收一放地绞动，你咬着牙勉强守住精关。',
    ],
    [
        '"啊……啊……天哪……"她仰着头呻吟道。体内多年的空虚在这一刻被彻底填满，她不禁抱着你的脸吻了上去。',
    ],
];

// 正戏同步高潮文本链（插入中，双方同时到）
const _SYNC_ORGASM = [
    [
        '她的花径猛地收紧，像一张小嘴死死咬住你的阳物，你根本来不及抽出，便被那阵剧烈的痉挛绞得精关失守——',
        '滚烫的阳精尽数喷洒在她花心深处，她在这股热流的冲击下达到了顶峰。',
    ],
    [
        '她高潮时的痉挛让你再也无法忍耐，精关一泄如注——滚烫的阳精尽数浇灌在她花心深处。她满足地叹息着，把你搂得更紧了些。',
    ],
    [
        '她的花心深处一阵剧烈的收缩，龟头被那湿热紧窒的软肉死死咬住，你闷哼一声，抵着她的花心将阳精尽数喷洒而出。她在你身下战栗着，享受着那股滚烫的冲击。',
    ],
];

function _handleImpendingOrgasm(bd, player, callbacks) {
    const s = bd._sexState;
    callbacks.clearChoices();

    // Chain A — 侍奉高潮
    if (s.lastAction === 'service') {
        return _serviceSoloOrgasm(bd, player, callbacks);
    }

    // 试算 maleArousal +20 后是否触发同步高潮
    const maleAfterBoost = Math.min(100, s.maleArousal + 20);

    if (maleAfterBoost >= 100) {
        // Chain C — 同步高潮
        s.maleArousal = maleAfterBoost;
        _sexUpdatePanel(s);
        return _syncOrgasm(bd, player, callbacks);
    } else {
        // Chain B — 正戏女性独自高潮
        return _femaleSoloOrgasm(bd, player, callbacks);
    }
}

// ─── Chain A：侍奉高潮 ───

function _serviceSoloOrgasm(bd, player, callbacks) {
    const s = bd._sexState;
    _sexAddMessage('她身子猛地绷紧，双腿之间一阵剧烈的痉挛收缩。', 'narrator');
    s.orgasmCount++;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _sexUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _serviceOrgasmDone(bd, player, callbacks) }]);
}

function _serviceOrgasmDone(bd, player, callbacks) {
    _sexAddMessage('（高潮）', 'system');
    _sexAddMessage(getOrgasmReaction(bd, false), 'narrator');
    _sexUpdatePanel(bd._sexState);
    callbacks.showChoices([{ text: '继续', action: () => _renderSexMain(bd, player, callbacks) }]);
}

// ─── Chain B：正戏女性独自高潮 ───

function _femaleSoloOrgasm(bd, player, callbacks) {
    const s = bd._sexState;
    const pool = _FEMALE_SOLO_ORGASM;
    const idx = Math.floor(Math.random() * pool.length);
    const segs = pool[idx];

    _sexAddMessage(segs[0], 'narrator');
    s.orgasmCount++;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _sexUpdatePanel(s);

    if (segs.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _femaleSoloStep2(bd, player, callbacks, segs, 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _femaleSoloDone(bd, player, callbacks) }]);
    }
}

function _femaleSoloStep2(bd, player, callbacks, segs, idx) {
    callbacks.clearChoices();
    _sexAddMessage(segs[idx], 'narrator');
    if (idx < segs.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _femaleSoloStep2(bd, player, callbacks, segs, idx + 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _femaleSoloDone(bd, player, callbacks) }]);
    }
}

function _femaleSoloDone(bd, player, callbacks) {
    const s = bd._sexState;
    _sexAddMessage('（高潮）', 'system');
    _sexAddMessage(getOrgasmReaction(bd, false), 'narrator');
    // 男性未射精，不扣 maleArousal
    _sexUpdatePanel(s);
    callbacks.showChoices([
        { text: '继续', action: () => _renderSexMain(bd, player, callbacks) },
    ]);
}

// ─── Chain C：正戏同步高潮 ───

function _syncOrgasm(bd, player, callbacks) {
    const s = bd._sexState;
    const pool = _SYNC_ORGASM;
    const idx = Math.floor(Math.random() * pool.length);
    const segs = pool[idx];

    _sexAddMessage(segs[0], 'narrator');
    _sexUpdatePanel(s);

    if (segs.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _syncStep2(bd, player, callbacks, segs, 1) }]);
    } else {
        _syncAfterText(bd, player, callbacks);
    }
}

function _syncStep2(bd, player, callbacks, segs, idx) {
    callbacks.clearChoices();
    _sexAddMessage(segs[idx], 'narrator');
    if (idx < segs.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _syncStep2(bd, player, callbacks, segs, idx + 1) }]);
    } else {
        _syncAfterText(bd, player, callbacks);
    }
}

function _syncAfterText(bd, player, callbacks) {
    const s = bd._sexState;
    s.orgasmCount++;
    s.ejacCount++;
    s.wasInternal = true;
    s.maleArousal = 70;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    s.overClock = 0;
    _sexUpdatePanel(s);
    _sexAddMessage('（高潮）', 'system');

    if (s.ejacCount >= s.ejacLimit) {
        const root = player.attrs.root || 10;
        const label = getRatingLabel(root);
        const msg = '你只觉腰眼一阵酸软，再也无力继续。终究是你' + label + '(' + root + ')的根骨，' + (s.ejacLimit === 1 ? '只能泄这一次。' : '最多只能支持' + s.ejacLimit + '次。') + '你喘息片刻，揽着她温存了一会儿。';
        _sexAddMessage(msg, 'narrator');
        return callbacks.showChoices([{ text: '结束云雨', action: () => _endSexScene(bd, player, callbacks) }]);
    }
    callbacks.showChoices([
        { text: '继续', action: () => _renderSexMain(bd, player, callbacks) },
        { text: '结束云雨', action: () => _endSexScene(bd, player, callbacks) },
    ]);
}

// ─── 射精 ───

function _showEjacMenu(bd, player, callbacks) {
    const s = bd._sexState;
    s.maleArousal = 100;
    _sexUpdatePanel(s);
    callbacks.clearChoices();
    _sexAddMessage('你已到了极限，是时候释放了……', 'narrator');
    callbacks.showChoices([
        { text: '内射', action: () => _doEjacInternal(bd, player, callbacks) },
        { text: '外射', action: () => _showEjacExternalMenu(bd, player, callbacks) },
    ]);
}

function _doEjacInternal(bd, player, callbacks) {
    callbacks.clearChoices();
    _sexAddMessage(getCreampieDesc(), 'narrator');
    bd._sexState.wasInternal = true;
    _afterEjac(bd, player, callbacks);
}

function _showEjacExternalMenu(bd, player, callbacks) {
    callbacks.clearChoices();
    const choices = Object.entries(EJAC_LOCATIONS).map(([key, label]) => ({
        text: '射在' + label + '上',
        action: () => _doEjacExternal(bd, player, callbacks, key),
    }));
    callbacks.showChoices(choices);
}

function _doEjacExternal(bd, player, callbacks, loc) {
    callbacks.clearChoices();
    _sexAddMessage(getEjacDesc(loc), 'narrator');
    _afterEjac(bd, player, callbacks);
}

function _afterEjac(bd, player, callbacks) {
    const s = bd._sexState;
    s.maleArousal = 70;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    s.ejacCount++;
    s.overClock = 0;
    _sexUpdatePanel(s);
    if (s.ejacCount >= s.ejacLimit) {
        const root = player.attrs.root || 10;
        const label = getRatingLabel(root);
        const msg = '你只觉腰眼一阵酸软，再也无力继续。终究是你' + label + '(' + root + ')的根骨，' + (s.ejacLimit === 1 ? '只能泄这一次。' : '最多只能支持' + s.ejacLimit + '次。') + '你喘息片刻，揽着她温存了一会儿。';
        _sexAddMessage(msg, 'narrator');
        return callbacks.showChoices([{ text: '结束云雨', action: () => _endSexScene(bd, player, callbacks) }]);
    }
    callbacks.showChoices([
        { text: '继续云雨', action: () => _renderSexMain(bd, player, callbacks) },
        { text: '结束云雨', action: () => _endSexScene(bd, player, callbacks) },
    ]);
}

// ─── 结束 + 小黄诗（在独立页面内） ───

function _endSexScene(bd, player, callbacks) {
    const s = bd._sexState;
    s.finished = true;

    if (s.posCount) {
        let maxKey = null, maxCount = 0;
        for (const [k, v] of Object.entries(s.posCount)) {
            if (v > maxCount) { maxCount = v; maxKey = k; }
        }
        if (maxKey) bd._favPos = maxKey;
    }

    if (s.wasInternal) {
        _sexAddMessage(pickPulloutDesc(bd), 'narrator');
    } else {
        _sexAddMessage(pickSexEndDesc(), 'narrator');
    }

    // 女性体验评价
    const feedback = pickFeedback(bd, s.orgasmCount, s.femaleArousal);
    _sexAddMessage('（' + feedback.label + '）', 'system');

    const feedbackNext = () => {
        callbacks.clearChoices();
        _sexAddMessage(feedback.text, 'narrator');
        const afterglowNext = () => {
            let msg = pickAfterglowDesc(bd);
            if (s.wasInternal && bd._wasVirgin) {
                msg += ' 那白浊之间搀着缕缕血丝，顺着红肿的花唇缓缓淌下——处子之血与阳精混在一起，在身下晕开一片。';
            }
            if (msg) {
                callbacks.clearChoices();
                _sexAddMessage(msg, 'narrator');
                callbacks.showChoices([{ text: '继续', action: () => {
                    delete bd._sexState;
                    if (feedback.showPoem) {
                        _startPoem(bd, player, callbacks);
                    } else {
                        _finishCloudRain(bd, player, callbacks);
                    }
                } }]);
            } else {
                delete bd._sexState;
                if (feedback.showPoem) {
                    _startPoem(bd, player, callbacks);
                } else {
                    _finishCloudRain(bd, player, callbacks);
                }
            }
        };
        callbacks.showChoices([{ text: '继续', action: afterglowNext }]);
    };

    callbacks.showChoices([{ text: '继续', action: feedbackNext }]);
}

function _finishCloudRain(bd, player, callbacks) {
    const scene = _crPickScene(bd);
    _sexAddMessage(scene.end, 'narrator');
    bd._hadSex = true;
    player.neili -= 20;
    if (callbacks.ensureRedRecord) callbacks.ensureRedRecord(bd);
    delete bd._flirtPoem;
    delete bd._flirtPoemIdx;
    delete bd._flirtIntroShown;
    callbacks.updateStatsBar();
    player._sleptWithBeauty = true;

    callbacks.showChoices([{ text: '沉沉睡去……', action: () => {
        callbacks.clearChoices();
        document.getElementById('log').innerHTML = '';
        callbacks.sleepToTomorrow(true);
        let wakeMsg = pickWakeDesc(bd._sexVenue, bd.name);
        if (bd._firstTimeWith) {
            player.attrs.luck = (player.attrs.luck || 0) + 1;
            wakeMsg += ' 福缘 +1（当前 ' + player.attrs.luck + '）';
            delete bd._firstTimeWith;
        }
        callbacks.addMessage(wakeMsg, 'narrator');
    } }]);
}

function _startPoem(bd, player, callbacks) {
    bd._flirtPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
    bd._flirtPoemIdx = 0;
    delete bd._flirtIntroShown;
    _sexShowPoemLine(bd, player, callbacks);
}

function _sexShowPoemLine(bd, player, callbacks) {
    const poem = bd._flirtPoem;
    const idx = bd._flirtPoemIdx;

    if (idx < poem.lines.length) {
        callbacks.clearChoices();
        if (idx === 0 && !bd._flirtIntroShown) {
            _sexAddMessage('有道是：', 'narrator');
            bd._flirtIntroShown = true;
            callbacks.showChoices([{ text: '继续', action: () => _sexShowPoemLine(bd, player, callbacks) }]);
        } else {
            _sexAddMessage('　　' + poem.lines[idx], 'poem');
            bd._flirtPoemIdx = idx + 1;
            callbacks.showChoices([{ text: '继续', action: () => _sexShowPoemLine(bd, player, callbacks) }]);
        }
    } else {
        _finishCloudRain(bd, player, callbacks);
    }
}

// ─── 入口 ───

function startCloudRain(bd, player, callbacks) {
    if (callbacks.venue) bd._sexVenue = callbacks.venue.name || callbacks.venue;
    if (!bd._hadSex) bd._firstTimeWith = true;
    startDetailedSexScene(bd, player, callbacks);
}

