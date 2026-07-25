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
        '<div id="sex-scene-log"></div>' +
        '<div id="sex-panel">' +
        '<div class="sex-arousal-row"><span class="sex-a-label sex-female-label">女</span><div class="sex-a-track"><div class="sex-a-fill sex-fa-fill" id="sex-fa-fill"></div></div><span class="sex-a-val" id="sex-fa-text">0</span></div>' +
        '<div class="sex-arousal-row"><span class="sex-a-label sex-male-label">男</span><div class="sex-a-track"><div class="sex-a-fill sex-ma-fill" id="sex-ma-fill"></div></div><span class="sex-a-val" id="sex-ma-text">0</span></div>' +
        '<div class="sex-clothes" id="sex-clothes"></div>' +
        '</div>';
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
    bd._sexState = {
        femaleArousal: 0,
        maleArousal: 0,
        clothes: { outer: true, pants: true, inner: true, bra: true, panties: true },
        orgasmCount: 0,
        canSquirt: Math.random() < 0.3,
        finished: false,
    };
    _sexBuildLayout();
    callbacks.clearChoices();
    const venueName = bd._sexVenue || bd._currentVenueName || '闺房';
    _sexAddMessage(pickSexStartDesc(venueName), 'narrator');
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

    callbacks.clearChoices();
    const choices = [];

    if (s.femaleArousal < 30) {
        choices.push({ text: '揩油', action: () => _showForeplayMenu(bd, player, callbacks) });
    } else {
        choices.push({ text: '抚摸', action: () => _showForeplayMenu(bd, player, callbacks) });
        if (_getAvailableClothes(s).length > 0) {
            choices.push({ text: '脱衣', action: () => _showUndressMenu(bd, player, callbacks) });
        }
        if (s.femaleArousal >= 50) {
            choices.push({ text: '侍奉', action: () => _showServiceMenu(bd, player, callbacks) });
        }
        if (s.femaleArousal >= 70) {
            choices.push({ text: '正戏', action: () => _showSexMenu(bd, player, callbacks) });
        }
    }

    if (s.maleArousal >= 100) {
        choices.push({ text: '射精', action: () => _showEjacMenu(bd, player, callbacks) });
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
    _sexAddMessage(pickForeplay(part), 'narrator');
    bd._sexState.femaleArousal = Math.min(100, bd._sexState.femaleArousal + 5);
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
    const choices = available.map(k => ({
        text: '脱下' + CLOTHING_NAMES[k],
        action: () => _doUndress(bd, player, callbacks, k),
    }));
    choices.push({ text: '返回', action: () => _renderSexMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
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
        { text: '口交', action: () => _doService(bd, player, callbacks, 'blowjob') },
        { text: '足交', action: () => _doService(bd, player, callbacks, 'footjob') },
    ];
    if (hasCupC(bd.bust)) {
        choices.push({ text: '乳交', action: () => _doService(bd, player, callbacks, 'titjob') });
    }
    choices.push({ text: '把玩玉乳', action: () => _doService(bd, player, callbacks, 'breast') });
    choices.push({ text: '小戏花园', action: () => _doService(bd, player, callbacks, 'garden') });
    choices.push({ text: '返回', action: () => _renderSexMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _doService(bd, player, callbacks, type) {
    callbacks.clearChoices();
    _sexAddMessage(pickServiceDesc(type), 'narrator');
    const s = bd._sexState;
    if (type === 'breast') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 6);
        s.maleArousal = Math.min(100, s.maleArousal + 2);
    } else if (type === 'garden') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 10);
        s.maleArousal = Math.min(100, s.maleArousal + 3);
    } else {
        s.maleArousal = Math.min(100, s.maleArousal + 10);
        s.femaleArousal = Math.min(100, s.femaleArousal + 4);
    }
    _sexUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _renderSexMain(bd, player, callbacks) }]);
}

// ─── 正戏 ───

function _showSexMenu(bd, player, callbacks) {
    callbacks.clearChoices();
    const choices = [
        { text: '正常位', action: () => _doSex(bd, player, callbacks, 'normal') },
        { text: '女上位', action: () => _doSex(bd, player, callbacks, 'cowgirl') },
        { text: '后入式', action: () => _doSex(bd, player, callbacks, 'doggy') },
        { text: '侧入式', action: () => _doSex(bd, player, callbacks, 'spoon') },
        { text: '臀部素股', action: () => _doSex(bd, player, callbacks, 'sumata') },
    ];
    choices.push({ text: '立位', action: () => _doSex(bd, player, callbacks, 'standing') });
    choices.push({ text: '桌沿', action: () => _doSex(bd, player, callbacks, 'edge') });
    choices.push({ text: '返回', action: () => _renderSexMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _doSex(bd, player, callbacks, key) {
    callbacks.clearChoices();
    const pos = pickSexPosition(key);
    _sexAddMessage('【' + pos.name + '】', 'system');
    _sexAddMessage(pos.desc, 'narrator');
    const s = bd._sexState;
    s.maleArousal = Math.min(100, s.maleArousal + pos.mA);
    s.femaleArousal = Math.min(100, s.femaleArousal + pos.fA);
    _sexUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _afterSexAction(bd, player, callbacks) }]);
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

function _handleImpendingOrgasm(bd, player, callbacks) {
    const s = bd._sexState;
    const isSquirt = s.canSquirt && s.orgasmCount <= 1;
    callbacks.clearChoices();

    // 将至描写
    _sexAddMessage('她的花径骤然缩紧，一阵阵剧烈的颤抖从深处传来，紧紧绞住你的阳物。温热的花蜜喷涌而出，浇淋在你的龟头之上。', 'narrator');
    _sexAddMessage('你只觉阳具被又湿又热的软肉死死缠住，酥麻感从脊椎直冲头顶，几乎要把你化掉。', 'narrator');

    s.maleArousal = Math.min(100, s.maleArousal + 20);
    _sexUpdatePanel(s);

    // 检查是否同步高潮（男欲也到了100）
    if (s.maleArousal >= 100) {
        // 同步高潮 + 强制内射
        _sexAddMessage('她的花径猛地收紧，像一张小嘴死死咬住你的阳物，你根本来不及抽出，便被那阵剧烈的痉挛绞得精关失守——', 'narrator');
        _sexAddMessage('滚烫的阳精尽数喷洒在她花心深处，她在这股热流的冲击下达到了顶峰。', 'narrator');
        s.orgasmCount++;
        _sexAddMessage(getOrgasmReaction(bd, isSquirt), 'narrator');
        s.femaleArousal = Math.max(0, s.femaleArousal - 30);
        s.maleArousal = Math.max(0, s.maleArousal - 30);
        _sexUpdatePanel(s);
        callbacks.showChoices([
            { text: '继续', action: () => _renderSexMain(bd, player, callbacks) },
            { text: '结束云雨', action: () => _endSexScene(bd, player, callbacks) },
        ]);
        return;
    }

    // 仅女性高潮
    s.orgasmCount++;
    _sexAddMessage('（高潮）', 'system');
    _sexAddMessage(getOrgasmReaction(bd, isSquirt), 'narrator');
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _sexUpdatePanel(s);
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
    s.maleArousal = 0;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _sexUpdatePanel(s);
    callbacks.showChoices([
        { text: '继续云雨', action: () => _renderSexMain(bd, player, callbacks) },
        { text: '结束云雨', action: () => _endSexScene(bd, player, callbacks) },
    ]);
}

// ─── 结束 + 小黄诗（在独立页面内） ───

function _endSexScene(bd, player, callbacks) {
    const s = bd._sexState;
    s.finished = true;
    delete bd._sexState;

    _sexAddMessage(pickSexEndDesc(), 'narrator');

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
            callbacks.showChoices([{ text: '……', action: () => _sexShowPoemLine(bd, player, callbacks) }]);
        } else {
            _sexAddMessage('　　' + poem.lines[idx], 'poem');
            bd._flirtPoemIdx = idx + 1;
            callbacks.showChoices([{ text: '……', action: () => _sexShowPoemLine(bd, player, callbacks) }]);
        }
    } else {
        const scene = _crPickScene(bd);
        _sexAddMessage(scene.end, 'narrator');
        bd._hadSex = true;
        bd.favorability = Math.min(100, bd.favorability + 8);
        player.neili -= 20;
        if (callbacks.ensureRedRecord) callbacks.ensureRedRecord(bd);
        delete bd._flirtPoem;
        delete bd._flirtPoemIdx;
        delete bd._flirtIntroShown;
        callbacks.updateStatsBar();
        player._sleptWithBeauty = true;

        callbacks.showChoices([{ text: '沉沉睡去……', action: () => {
            callbacks.clearChoices();
            // 清除独立页面，不留痕迹
            document.getElementById('log').innerHTML = '';
            callbacks.sleepToTomorrow(true);
            callbacks.addMessage('你从' + bd.name + '的闺房中醒来，昨夜风流如梦，神清气爽。', 'narrator');
        } }]);
    }
}

// ─── 入口 ───

function startCloudRain(bd, player, callbacks) {
    if (callbacks.venue) bd._sexVenue = callbacks.venue.name || callbacks.venue;
    bd._flirtPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
    bd._flirtPoemIdx = 0;
    delete bd._flirtIntroShown;
    step2(bd, player, callbacks);
}

function step2(bd, player, callbacks) {
    callbacks.clearChoices();
    const scene = _crPickScene(bd);
    callbacks.addMessage(scene.step2, 'narrator');
    callbacks.showChoices([{ text: '……', action: () => step3(bd, player, callbacks) }]);
}

function step3(bd, player, callbacks) {
    callbacks.clearChoices();
    const scene = _crPickScene(bd);
    callbacks.addMessage(scene.step3, 'narrator');
    callbacks.showChoices([{ text: '……', action: () => step4(bd, player, callbacks) }]);
}

function step4(bd, player, callbacks) {
    callbacks.clearChoices();
    const scene = _crPickScene(bd);
    callbacks.addMessage(scene.step4, 'narrator');
    callbacks.showChoices([{ text: '……', action: () => startDetailedSexScene(bd, player, callbacks) }]);
}

function step5(bd, player, callbacks) {
    callbacks.clearChoices();
    bd._flirtPoem = POEMS[Math.floor(Math.random() * POEMS.length)];
    bd._flirtPoemIdx = 0;
    showPoemLine(bd, player, callbacks);
}

function showPoemLine(bd, player, callbacks) {
    callbacks.clearChoices();
    const poem = bd._flirtPoem;
    const idx = bd._flirtPoemIdx;
    if (idx < poem.lines.length) {
        if (idx === 0 && !bd._flirtIntroShown) {
            callbacks.addMessage('有道是：', 'narrator');
            bd._flirtIntroShown = true;
            callbacks.showChoices([{ text: '……', action: () => showPoemLine(bd, player, callbacks) }]);
        } else {
            callbacks.addMessage('　　' + poem.lines[idx], 'poem');
            bd._flirtPoemIdx = idx + 1;
            callbacks.showChoices([{ text: '……', action: () => showPoemLine(bd, player, callbacks) }]);
        }
    } else {
        const scene = _crPickScene(bd);
        callbacks.addMessage(scene.end, 'narrator');
        bd._hadSex = true;
        bd.favorability = Math.min(100, bd.favorability + 8);
        player.neili -= 20;
        if (callbacks.ensureRedRecord) callbacks.ensureRedRecord(bd);
        delete bd._flirtPoem;
        delete bd._flirtPoemIdx;
        delete bd._flirtIntroShown;
        callbacks.updateStatsBar();
        player._sleptWithBeauty = true;
        callbacks.showChoices([{ text: '沉沉睡去……', action: () => {
            callbacks.clearChoices();
            callbacks.sleepToTomorrow(true);
            callbacks.addMessage('你从' + bd.name + '的闺房中醒来，昨夜风流如梦，神清气爽。', 'narrator');
        } }]);
    }
}
