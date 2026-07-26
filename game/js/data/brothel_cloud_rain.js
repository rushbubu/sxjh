/* ─── 勾栏云雨系统（独立于云雨系统） ───
   调用方式：
     startBrothelRain(prostitute, player, {
       addMessage, showChoices, clearChoices, updateStatsBar,
       sleepToTomorrow,
     });
   其中 prostitute 是 generateProstitutes 生成的妓女对象
   player = this.player
*/

// ─── 独立页面 DOM 管理 ───

function _brBuildLayout() {
    const logEl = document.getElementById('log');
    logEl.innerHTML = '';
    const layout = document.createElement('div');
    layout.id = 'sex-layout';
    layout.innerHTML =
        '<div id="sex-panel">' +
        '<div class="sex-arousal-row"><span class="sex-a-label sex-female-label">女</span><div class="sex-a-track"><div class="sex-a-fill sex-fa-fill" id="br-fa-fill"></div></div><span class="sex-a-val" id="br-fa-text">0</span></div>' +
        '<div class="sex-arousal-row"><span class="sex-a-label sex-male-label">男</span><div class="sex-a-track"><div class="sex-a-fill sex-ma-fill" id="br-ma-fill"></div></div><span class="sex-a-val" id="br-ma-text">0</span></div>' +
        '<div class="sex-clothes" id="br-clothes"></div>' +
        '</div>' +
        '<div id="sex-scene-log"></div>';
    logEl.appendChild(layout);
}

function _brAddMessage(text, type) {
    const log = document.getElementById('sex-scene-log');
    if (!log) return;
    const msg = document.createElement('div');
    msg.className = 'msg msg-' + type;
    msg.textContent = text;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
}

function _brUpdatePanel(state) {
    const faFill = document.getElementById('br-fa-fill');
    const faText = document.getElementById('br-fa-text');
    const maFill = document.getElementById('br-ma-fill');
    const maText = document.getElementById('br-ma-text');
    const clothesEl = document.getElementById('br-clothes');
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

function _brGetAvailableClothes(state) {
    return UNDRESS_ORDER.filter(k => state.clothes[k]);
}

// ─── 勾栏云雨主流程 ───

function startBrothelRain(prostitute, player, callbacks) {
    const root = player.attrs.root || 10;
    prostitute._brState = {
        femaleArousal: 0,
        maleArousal: 0,
        clothes: { outer: true, pants: true, inner: true, bra: true, panties: true },
        orgasmCount: 0,
        canSquirt: Math.random() < 0.3,
        finished: false,
        ejacCount: 0,
        ejacLimit: _brGetEjacLimit(root),
        holdRounds: _brGetHoldRounds(root),
        overClock: 0,
    };
    _brBuildLayout();
    callbacks.clearChoices();
    const venueName = '香闺';
    _brAddMessage('你随' + prostitute.name + '走进香闺，房中熏香袅袅，红烛摇曳。她回眸一笑，轻解罗裳。', 'narrator');
    _brRenderMain(prostitute, player, callbacks);
}

function _brRenderMain(prostitute, player, callbacks) {
    const s = prostitute._brState;
    if (s.finished) return;
    _brUpdatePanel(s);

    if (s.femaleArousal >= 100) {
        s.femaleArousal = Math.min(s.femaleArousal, 100);
        return _brHandleImpendingOrgasm(prostitute, player, callbacks);
    }

    if (s.maleArousal >= 100) {
        if (s.overClock >= s.holdRounds) {
            return _brShowEjacMenu(prostitute, player, callbacks);
        }
        s.overClock++;
    }

    callbacks.clearChoices();
    const choices = [];

    if (s.femaleArousal < 30) {
        choices.push({ text: '揩油', action: () => _brShowForeplayMenu(prostitute, player, callbacks) });
    } else {
        choices.push({ text: '抚摸', action: () => _brShowForeplayMenu(prostitute, player, callbacks) });
        if (_brGetAvailableClothes(s).length > 0) {
            choices.push({ text: '脱衣', action: () => _brShowUndressMenu(prostitute, player, callbacks) });
        }
        if (s.femaleArousal >= 30) {
            choices.push({ text: '侍奉', action: () => _brShowServiceMenu(prostitute, player, callbacks) });
        }
        if (s.femaleArousal >= 60) {
            choices.push({ text: '正戏', action: () => _brShowSexMenu(prostitute, player, callbacks) });
        }
    }

    choices.push({ text: '结束', action: () => _brEndSexScene(prostitute, player, callbacks) });
    callbacks.showChoices(choices);
}

// ─── 抚摸 ───

function _brShowForeplayMenu(prostitute, player, callbacks) {
    callbacks.clearChoices();
    const parts = [
        { key: 'face', label: '脸蛋' }, { key: 'chest', label: '胸脯' },
        { key: 'waist', label: '腰肢' }, { key: 'arms', label: '玉臂' },
        { key: 'hips', label: '臀部' }, { key: 'legs', label: '玉腿' },
        { key: 'feet', label: '玉足' },
    ];
    const choices = parts.map(p => ({
        text: '抚摸' + p.label,
        action: () => _brDoForeplay(prostitute, player, callbacks, p.key),
    }));
    choices.push({ text: '返回', action: () => _brRenderMain(prostitute, player, callbacks) });
    callbacks.showChoices(choices);
}

function _brGetForeplayPair(part, prostitute) {
    const scenes = FOREPLAY_SCENES[part];
    if (!scenes) return ['你抚摸着她的身体。', ''];
    const pool = [];
    if (scenes.common) pool.push(...scenes.common);
    const inner = prostitute ? prostitute.inner : null;
    if (inner && scenes[inner]) pool.push(...scenes[inner]);
    if (pool.length === 0) return ['你抚摸着她的身体。', ''];
    const pair = pool[Math.floor(Math.random() * pool.length)];
    return pair;
}

function _brDoForeplay(prostitute, player, callbacks, part) {
    callbacks.clearChoices();
    const pair = _brGetForeplayPair(part, prostitute);
    _brAddMessage(pair[0], 'narrator');
    const s = prostitute._brState;
    s.femaleArousal = Math.min(100, s.femaleArousal + 5);
    const mAValues = { chest: 4, hips: 4, waist: 2, legs: 2, face: 1, arms: 1, feet: 1 };
    s.maleArousal = Math.min(100, s.maleArousal + (mAValues[part] || 1));
    _brUpdatePanel(s);
    const mA = s.maleArousal;
    const fA = s.femaleArousal;

    const praises = {
        face: function(p) {
            const desc = p.faceDesc || '好模样';
            return '她握住你的手贴在颊边，舌尖轻轻舔了舔你的指缝，眼波盈盈：「爷……您摸摸奴家这张脸，' + desc + '，可入得了爷的眼？」';
        },
        chest: function(p) {
            const breast = _getBreastShort(p);
            const cup = _getCupLabel(p.bust);
            const color = _getColor(p, COLORS_YOUNG, COLORS_MATURE);
            return '她挺起' + breast + '，往你掌心里送，咬着下唇吃吃笑：「爷……您捏捏，' + cup + '罩杯的奶子，外头可不好找……' + color + '的奶头儿又嫩又翘，您不想尝尝？」';
        },
        waist: function(p) {
            const w = p.waist;
            const h = p.hips;
            const label = p.heightLabel || '好';
            const ratio = w > 0 ? (h / w).toFixed(1) : 0;
            if (w <= 22) return '她' + label + '的腰肢一扭一扭地往你怀里蹭，仰着脸儿娇声道：「爷……您摸摸奴家这蛇腰……才' + w + '寸，' + ratio + '的腰臀比……勾死个人了……您倒是往下摸摸呀……」';
            return '她软软地靠进你怀里，拉着你的手按在自己腰间，扭着身子道：「爷……您量量奴家这腰……' + w + '寸的细腰，' + h + '寸的胯……您不想试试这腰扭起来是什么滋味？」';
        },
        arms: function(p) {
            const h = p.height;
            if (h >= 168) return '她攀着你的肩头，将两条藕臂举到你面前，腻声道：「爷闻闻……奴家日日用玫瑰花露泡着，专等着爷来疼呢……您看奴家这胳膊，又细又长，缠在您脖子上不知道有多舒服……」';
            return '她攀着你的肩头，两条白生生的胳膊挂在你脖子上，整个人挂在你身上，吐气如兰：「爷……您抱紧奴家……奴家这胳膊没多大力气……全靠爷搂着呢……」';
        },
        hips: function(p) {
            const buttDesc = _getButtDesc(p);
            const buttNoun = _getButtNoun(p);
            const hips = p.hips;
            const ph = _getPHLabel(p);
            if (hips >= 35) return '她扭过身去，将那' + buttDesc + '的大白腚子凑到你手边，回头浪笑道：「爷……您摸摸奴家这肥腚……' + hips + '寸的肉臀，又圆又弹，' + ph + '的骚毛儿底下那水帘洞早等着爷来探了……您不想试试？」';
            return '她扭过身去，将那一双' + buttNoun + '送到你手边，回头媚笑道：「爷……您摸摸……' + buttDesc + '，比外头那些黄花大闺女的有肉头多了……您要是不信，掰开来瞧瞧，保管满意。」';
        },
        legs: function(p) {
            const h = p.height;
            const hips = p.hips;
            if (h >= 168) return '她撩起裙角，露出一截' + (h >= 172 ? '白生生' : '修长') + '的腿，拿脚尖轻轻蹭你的小腿肚，声音又媚又黏：「爷……您说奴家这双' + (h >= 172 ? '大长腿' : '长腿') + '……要是盘在您腰上……那' + hips + '寸的胯骨夹着您的腰……您受不受得住？」';
            return '她拉起你的手放在自己大腿上，顺着那' + (h >= 160 ? '匀称' : '浑圆') + '的腿线缓缓滑动，吃吃笑道：「爷……您摸摸奴家这腿……别看个子不高，这腿上的肉可结实着呢……夹起人来……哼……」';
        },
        feet: function(p) {
            const h = p.height;
            if (h >= 170) return '她褪了绣鞋，将一双' + (h >= 174 ? '大' : '纤长') + '脚送到你面前，脚趾灵活地勾了勾你的裤管，咯咯浪笑：「爷……您可别嫌奴家脚大……这双大脚伺候起爷来，比那些小脚娘儿们有劲儿多了……」';
            return '她褪了绣鞋，露出一双白嫩嫩的小脚，拿足尖轻轻拨弄你的掌心，咬着嘴唇道：「爷……您要是不嫌脏，奴家这双脚……也能让您快活似神仙……」';
        },
    };
    const praise = praises[part](prostitute);

    callbacks.showChoices([{ text: '继续', action: () => _brForeplayStep2(prostitute, player, callbacks, pair[1], praise, mA, fA) }]);
}

function _brForeplayStep2(prostitute, player, callbacks, line2, praise, mA, fA) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    s.maleArousal = mA;
    s.femaleArousal = fA;
    _brUpdatePanel(s);
    if (line2) _brAddMessage(line2, 'narrator');
    if (praise) {
        callbacks.showChoices([{ text: '继续', action: () => _brForeplayStep3(prostitute, player, callbacks, praise, mA, fA) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
    }
}

function _brForeplayStep3(prostitute, player, callbacks, praise, mA, fA) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    s.maleArousal = mA;
    s.femaleArousal = fA;
    _brUpdatePanel(s);
    _brAddMessage(praise, 'event');
    callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
}

// ─── 脱衣 ───

function _brShowUndressMenu(prostitute, player, callbacks) {
    callbacks.clearChoices();
    const available = _brGetAvailableClothes(prostitute._brState);
    if (available.length === 0) {
        _brAddMessage('她已经一丝不挂了。', 'narrator');
        return _brRenderMain(prostitute, player, callbacks);
    }
    const next = available[0];
    _brAddMessage('她身上还穿着' + CLOTHING_NAMES[next] + '。', 'narrator');
    callbacks.showChoices([
        { text: '脱下' + CLOTHING_NAMES[next], action: () => _brDoUndress(prostitute, player, callbacks, next) },
        { text: '返回', action: () => _brRenderMain(prostitute, player, callbacks) },
    ]);
}

function _brDoUndress(prostitute, player, callbacks, key) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    s.clothes[key] = false;

    if (key === 'bra') {
        _brAddMessage(getBraRemoveDesc(prostitute.bust), 'narrator');
        _brAddMessage(getBraReaction(prostitute), 'narrator');
        _brAddMessage(prostitute.name + '双手托着两只大奶子，颤巍巍地晃了晃，浪声道：「爷您瞧瞧……奴家这对宝贝，又白又嫩，奶头儿还是粉的……您含一口试试，保管比蜜还甜。」', 'event');
    } else if (key === 'panties') {
        _brAddMessage(getPantiesRemoveDesc(prostitute), 'narrator');
        _brAddMessage(getPantiesReaction(prostitute), 'narrator');
        _brAddMessage('她慢慢转过身去，弯腰翘起腚子，拿手掰开那毛茸茸的花瓣儿，回头浪笑：「爷……您倒是看仔细了……这水灵灵的骚屄……专等着爷的肉棒子来疼呢……」', 'event');
    } else {
        const descs = UNDRESS_DESC[key];
        if (descs) _brAddMessage(descs[Math.floor(Math.random() * descs.length)], 'narrator');
    }
    s.femaleArousal = Math.min(100, s.femaleArousal + 1);
    _brUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
}

// ─── 侍奉 ───

function _brShowServiceMenu(prostitute, player, callbacks) {
    callbacks.clearChoices();
    const choices = [
        { text: '接吻', action: () => _brDoService(prostitute, player, callbacks, 'kiss') },
        { text: '口交', action: () => _brDoService(prostitute, player, callbacks, 'blowjob') },
        { text: '冰火两重天', action: () => _brDoService(prostitute, player, callbacks, 'icefire') },
        { text: '电光毒龙钻', action: () => _brDoService(prostitute, player, callbacks, 'dragon') },
        { text: '足交', action: () => _brDoService(prostitute, player, callbacks, 'footjob') },
    ];
    if (prostitute.bust >= 36) {
        choices.push({ text: '乳交', action: () => _brDoService(prostitute, player, callbacks, 'titjob') });
        choices.push({ text: '喂奶', action: () => _brDoService(prostitute, player, callbacks, 'nursing') });
    }
    choices.push({ text: '把玩玉乳', action: () => _brDoService(prostitute, player, callbacks, 'breast') });
    choices.push({ text: '小戏花园', action: () => _brDoService(prostitute, player, callbacks, 'garden') });
    choices.push({ text: '返回', action: () => _brRenderMain(prostitute, player, callbacks) });
    callbacks.showChoices(choices);
}

function _brDoService(prostitute, player, callbacks, type) {
    callbacks.clearChoices();
    const desc = pickServiceDesc(type);
    const segments = (_splitDesc || function(t){return[t]})(desc);
    _brAddMessage(segments[0], 'narrator');
    const s = prostitute._brState;
    if (type === 'kiss') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 4);
        s.maleArousal = Math.min(100, s.maleArousal + 3);
        _brAddMessage('良久唇分，她舔了舔嘴唇，眼神迷离，淫声浪气道：「乖乖……爷这舌头是蜜罐子里浸出来的吧？缠得奴家魂儿都要飞了……您再伸进来，奴家还要。」', 'event');
    } else if (type === 'breast') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 6);
        s.maleArousal = Math.min(100, s.maleArousal + 2);
        _brAddMessage('她仰着脖子，挺着两只大奶子往你手里送，嘴里哼哼唧唧：「啊……好爷……您捏着奴家的奶头儿拧一拧……对……就这劲儿……奴家的骚水儿都要淌出来了……」', 'event');
    } else if (type === 'nursing') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 8);
        s.maleArousal = Math.min(100, s.maleArousal + 3);
        _brAddMessage('她捧起一只白嫩嫩的奶子，将乳头送到你唇边，柔声哄道：「乖……张嘴，奴家这奶水可是拿桂花蜜调过的，又甜又香，别处可喝不着。」你含住那红艳艳的乳头，轻轻一吸，一股带着花香的甜腻乳汁涌入口中。她仰起脖子，喉间发出一声舒服的叹息：「啊……好爷……您吸得奴家心尖儿都颤了……这边还有，别光顾着一只呀……」', 'event');
        _brUpdatePanel(s);
        callbacks.showChoices([
            { text: '叫一声妈妈', action: () => _brNursingMomStep(prostitute, player, callbacks) },
            { text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) },
        ]);
        return;
    } else if (type === 'garden') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 10);
        s.maleArousal = Math.min(100, s.maleArousal + 3);
        _brAddMessage('她主动分开了双腿，拿手指拨开那两片肥嫩的花唇，露出里头红艳艳的嫩肉，淫水顺着指尖往下淌。她喘着气道：「爷……您看看……奴家这骚屄都湿成什么样了……您那肉棒子再不来……奴家可要自己捅了……」', 'event');
    } else if (type === 'blowjob') {
        s.maleArousal = Math.min(100, s.maleArousal + 10);
        s.femaleArousal = Math.min(100, s.femaleArousal + 4);
        _brAddMessage('她抬起头，嘴角挂着一丝晶亮亮的涎水，拿舌尖舔了舔唇，媚眼如丝：「好爷……您这根宝贝又粗又长……奴家的嘴都酸了……您说……是奴家的嘴舒服，还是外头那些娘儿们的骚屄舒服？」', 'event');
    } else if (type === 'icefire') {
        s.maleArousal = Math.min(100, s.maleArousal + 12);
        s.femaleArousal = Math.min(100, s.femaleArousal + 5);
        _brAddMessage('她含了一口冰镇梅子汤，将那凉丝丝的小嘴儿裹住你的龟头，你只觉一阵冰彻骨髓的快感直冲颅顶；不等你喘匀，她又换了一口热参汤，温温热热地含住整根，舌尖在马眼上打转。一冰一火交替往复，她抬眼瞅着你，喉间发出呜呜的浪笑，那股子酥麻劲儿叫你腰眼直发软。', 'event');
    } else if (type === 'dragon') {
        s.maleArousal = Math.min(100, s.maleArousal + 5);
        s.femaleArousal = Math.min(100, s.femaleArousal + 12);
        _brAddMessage('她叫你翻身趴着，自己俯下头去，湿润的舌尖沿着你的会阴一路舔到后庭，绕着那褶皱打圈儿。她一边拿手指轻轻拨弄你的前头，一边用舌尖忽轻忽重地刺着那紧缩的穴口，嘴里含含糊糊地哼唧：「好爷……您这后头可嫩着呢……奴家舔着舔着，自己倒先湿透了……」', 'event');
    } else if (type === 'footjob') {
        s.maleArousal = Math.min(100, s.maleArousal + 10);
        s.femaleArousal = Math.min(100, s.femaleArousal + 4);
        _brAddMessage('她拿脚趾轻轻夹弄着你的阳物，又用脚心来回蹭着龟头，一边浪笑：「爷……您这根肉棒子被奴家的脚伺候着……是不是别有一番滋味？要不……您射在奴家脚上，奴家给您舔干净……」', 'event');
    } else if (type === 'titjob') {
        s.maleArousal = Math.min(100, s.maleArousal + 10);
        s.femaleArousal = Math.min(100, s.femaleArousal + 4);
        _brAddMessage('她捧着两只白嫩嫩的奶子夹住你的阳物，上下套弄着，低头看着那紫红的龟头从乳沟里一出一进，吃吃浪笑：「好爷……您瞧瞧……奴家这对奶子把您伺候得多好……您说……是奶子舒服还是屄舒服？」', 'event');
    } else {
        s.maleArousal = Math.min(100, s.maleArousal + 10);
        s.femaleArousal = Math.min(100, s.femaleArousal + 4);
    }
    _brUpdatePanel(s);
    if (segments.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _brShowServiceSegment(prostitute, player, callbacks, segments, 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
    }
}

function _brNursingMomStep(prostitute, player, callbacks) {
    callbacks.clearChoices();
    _brAddMessage('你含着奶头含糊地叫了一声：「妈妈……」', 'narrator');
    _brAddMessage(prostitute.name + '身子一颤，{pp_name}猛地缩了一下，眼中泛起一层水雾。她捧起你的脸，柔声问道：「乖儿子……喜不喜欢妈妈给你喂奶？」'.replace('{pp_name}', '花径'), 'event');
    callbacks.showChoices([
        { text: '喜欢', action: () => _brNursingLike(prostitute, player, callbacks) },
        { text: '不喜欢', action: () => _brNursingDislike(prostitute, player, callbacks) },
    ]);
}

function _brNursingLike(prostitute, player, callbacks) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    s.femaleArousal = Math.min(100, s.femaleArousal + 4);
    s.maleArousal = Math.min(100, s.maleArousal + 2);
    _brUpdatePanel(s);
    _brAddMessage(prostitute.name + '脸上漾开一抹温柔的笑意，把另一只奶子也送到你嘴边，柔声道：「喜欢就好……来，把这边的也喝了……妈妈的奶水多着呢，管够……」说着轻轻抚摸着你的头发，那眼神竟真有几分慈爱，「乖……多吃些……吃飽了才有力气。」', 'event');
    callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
}

function _brNursingDislike(prostitute, player, callbacks) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    s.femaleArousal = Math.min(100, s.femaleArousal + 2);
    _brUpdatePanel(s);
    _brAddMessage(prostitute.name + '轻轻戳了戳你的额头，佯怒道：「小没良心的，妈妈辛辛苦苦喂你奶吃，你倒嫌弃起来了？嗯？」说着自己倒先笑了，低头含住你的嘴唇亲了一口，「那妈妈换个法子疼你……」', 'event');
    callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
}

function _brShowServiceSegment(prostitute, player, callbacks, segments, idx) {
    callbacks.clearChoices();
    _brAddMessage(segments[idx], 'narrator');
    if (idx < segments.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _brShowServiceSegment(prostitute, player, callbacks, segments, idx + 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
    }
}

// ─── 正戏（勾栏专属体位，突出妓院环境和妓女互动） ───

const _BR_SEX_POSITIONS = {
    normal: {
        name: '正常位',
        desc: [
            '{name}仰躺在锦被上，{ph}的双腿轻轻分开，朝你勾了勾手指，浪笑道：「好爷，来嘛……奴家这骚屄都等不及了。」你俯身压上去，肉棒抵着那{pp_color}的{pp_name}口慢慢送了进去。她「啊……」地长叹一声，{butt}向上挺了挺，嘴里含含糊糊道：「对……就这劲儿……爷的肉棒子好烫……烫得奴家心尖儿都化了……」',
            '你压着她{hl}的身子，一下一下地抽送。她{breast_short}随着你的动作轻轻晃动，她低头看着你们交合的地方，吃吃笑道：「爷您瞧瞧……奴家的骚水儿都给您带出来了……把您那根宝贝浸得亮亮堂堂的……好看不好看？」说着{pp_name}猛地缩紧，你闷哼一声，差点交待了。',
            '你们面对面地交合着，{name}忽然搂住你的脖子把你拉下来，在你耳边吹着气道：「好爷……您摸摸奴家的奶……您一边干一边揉……奴家最喜欢了……」。你依言握住她{breast_short}，指尖捻着那{pp_color}的乳尖揉搓，她果然叫得更浪了，{pp_name}咬得你舒爽难当。',
        ], mA: 8, fA: 10,
    },
    cowgirl: {
        name: '女上位',
        desc: [
            '你往榻上一躺，拍了拍{name}的{butt_short}：「自己来。」她咯咯一笑，抬腿跨坐在你腰上，{pp_adj}{pp_name}在你小腹上蹭了蹭，扶着你的肉棒对准了穴口，腰肢一沉——「啊……好满……」她仰起头，喉间发出一声满足的叹息。尔后她便自顾自地上下起伏起来，{breast}在她胸前翻腾得厉害。',
            '她骑在你身上卖力地套弄着，{ph}的腰肢扭得像水蛇一样。她低头看着你享受的表情，喘着气问：「爷……您说……是奴家的骚屄紧……还是外头那些良家妇女的紧？嗯？」说着{pp_name}一缩，绞得你差点答不上话来。',
            '她在你身上颠得香汗淋漓，{hl}的身子上泛着一层细密的汗珠，在烛光下亮晶晶的。她放开了嗓子浪叫：「啊……啊啊……爷……您那肉棒子顶到奴家花心了……顶穿了……奴家要死了……」{butt}啪嗒啪嗒地拍在你大腿上，整个香闺都是淫靡的水声。',
        ], mA: 10, fA: 8,
    },
    reverse_cowgirl: {
        name: '反向女上位',
        desc: [
            '{name}转过身去，背对着你跨坐在你腰上，那圆滚滚的大屁股恰好压在你小腹上。她反手扶住你的肉棒，对准那水光光的{pp_name}一坐到底，然后便开始上下套弄起来。你躺在她身后，眼前尽是那{butt}起起落落、颤巍巍晃动的浪态，肉浪一波接一波地漾开，看得你眼热心跳。',
            '她背对着你卖力地上下颠动，{butt}在你眼前不住地晃荡，臀肉随着她的起落漾开层层肉浪，啪嗒啪嗒地拍在你的大腿上。她扭过头来，媚眼如丝：「好爷……您瞧瞧奴家这大屁股……好不好看？您一边干一邊看着奴家的腚子……是不是比正面更来劲儿？」',
            '她双手撑在你膝盖上，{butt}高高撅起又沉沉落下，在你眼前不住地套弄。你忍不住伸手抓住她那两瓣颤巍巍的臀肉，她「嗯……」地一声，{butt}摇得更欢了，回头浪笑道：「好爷……您抓着奴家的腚子……奴家更有劲儿了……」',
        ], mA: 10, fA: 8,
    },
    sixty_nine: {
        name: '69式',
        desc: [
            '{name}笑道：「爷，咱们换个玩法。」她调转身子，{pp_adj}{pp_name}正好对着你的脸，她自己则俯下身去，一口含住了你的阳物。你只觉龟头一阵温热的包裹，她{ph}的花丛就在你眼前，{pp_color}的嫩肉上沾着晶亮的花蜜。她一边含着你的肉棒吞吐，一边含糊不清地道：「爷……您也尝尝奴家的味儿……看看咸还是甜……」',
            '你们头脚相对地躺着，她熟练地含住你的阳物，舌尖在马眼上打转。你也拨开她{ph}的花丛，舌尖轻轻舔过那{pp_color}的花瓣。她身子一颤，{pp_name}里涌出一股蜜汁，尽数滴在你脸上。她赶忙抬起头，抱歉地笑道：「哎哟……爷……奴家不是故意的……实在是爷的舌头太厉害了……」',
        ], mA: 8, fA: 12,
    },
    doggy: {
        name: '后入式',
        desc: [
            '{name}转过身去，{butt}高高撅起，{pp_adj}{pp_name}在{ph}腿间水光光地翕动着。她回头浪笑：「好爷……从后头来……奴家最喜欢后入了……每一下都能顶到最深……」你扶着肉棒对准那湿淋淋的穴口一挺而入，她「啊——」地一声，{butt}摇得更欢了。',
            '她跪趴在床沿，{butt}在你的撞击下漾开层层肉浪。她回过头来，眼神又骚又浪：「爷……您使点儿劲儿……别心疼奴家……今天不收您加钱！」你笑了，掐着她的腰狠干起来，室内啪啪声和她的浪叫交织成一片。',
        ], mA: 9, fA: 9,
    },
    spoon: {
        name: '侧入式',
        desc: [
            '你从{name}身后贴近，抬起她一条{ph}的腿架在臂弯里，{pp_adj}{pp_name}从下方露了出来。她反手搂着你的脖子，{butt}往后贴紧你小腹：「爷……您从后头慢慢进来……奴家最喜欢这样抱着干了……」你扶着肉棒对准那湿漉漉的入口缓缓送了进去，她舒服地叹了口气。',
            '你们侧拥着交合，你一边揉捏着她的{breast_short}，一边在她耳边说着骚话。她偏过头来与你舌吻，{pp_color}的舌头缠着你的，下身{pp_name}紧紧裹着你一缩一缩的。半晌唇分，她喘着气道：「爷……您这嘴上功夫和下面一样厉害……奴家的魂儿都要被您说丢了……」',
        ], mA: 7, fA: 10,
    },
    sumata: {
        name: '臀部素股',
        desc: [
            '{name}夹紧{ph}的大腿，用腿根儿那团软肉裹着你的阳物上下套弄。她低头看着那紫红的龟头在她腿间一出一进，咬唇浪笑：「好爷……您瞧瞧……光用腿就能把您伺候得舒舒服服的……您说……要是真进了奴家的骚屄……那不得把您夹得精水横流？」说着{pp_name}故意在龟头处蹭了一下，你浑身一颤。',
            '你的肉棒在她{butt_short}之间进出着，{pp_name}里的蜜汁把她的腿根涂得亮晶晶一片。她扭过头来，眼中含着春水：「好人……别在外面磨了……进来吧……奴家痒得不行了……您听，{pp_name}都在咕叽咕叽响了……」',
        ], mA: 6, fA: 7,
    },
    standing: {
        name: '立位',
        desc: [
            '{name}扶着墙弯下腰，{butt}高高撅起，回头媚声道：「爷……站着干最得劲儿……您扶着奴家的腰，想多深就多深。」你走到她身后，扶着肉棒对准{pp_name}一插到底，她「啊……」地一声，{breast_short}贴在墙上蹭来蹭去。',
            '你掐着她的胯骨狠干，{butt}被你撞得啪啪响。{name}的浪叫声越来越大，惊得隔壁房间传来几声咳嗽和笑声。她反倒更兴奋了，回头浪道：「听见没……隔壁都在听着呢……爷您可得卖力些……别让她们笑话奴家伺候得不好……」',
        ], mA: 8, fA: 8,
    },
    edge: {
        name: '桌沿',
        desc: [
            '{name}{butt_short}坐在桌沿，{ph}的双腿大张，自己拿手指掰开那{pp_color}的{pp_name}，露出里头红嫩嫩的芯子，浪声道：「好爷……您瞧清楚了……这骚屄可是专程给您预备的……您那大肉棒子再不来……奴家可要自己捅了……」你扶着肉棒对准穴口一挺而入，她「啊——」地一声弓起了腰。',
            '你将她按在桌边狠干着，{butt}撞在桌沿发出咯吱咯吱的声响。{name}的浪叫一声高过一声，{pp_name}里的蜜水被你的抽送带出，顺着她{ph}的大腿往下淌，滴在地上汇成一小滩。她上气不接下气地浪叫道：「好爷……您太厉害了……奴家要死了……要被您干死了……」',
        ], mA: 9, fA: 9,
    },
};

function _brPickSexPosition(key, prostitute, idx) {
    const pos = _BR_SEX_POSITIONS[key] || _BR_SEX_POSITIONS.normal;
    const i = typeof idx === 'number' ? idx % pos.desc.length : Math.floor(Math.random() * pos.desc.length);
    const template = pos.desc[i];
    const desc = typeof _renderPosDesc === 'function' ? _renderPosDesc(template, prostitute) : template;
    return { name: pos.name, desc, mA: pos.mA, fA: pos.fA };
}

function _brShowSexMenu(prostitute, player, callbacks) {
    callbacks.clearChoices();
    const choices = [
        { text: '正常位', action: () => _brDoSex(prostitute, player, callbacks, 'normal') },
        { text: '女上位', action: () => _brDoSex(prostitute, player, callbacks, 'cowgirl') },
        { text: '反向女上位', action: () => _brDoSex(prostitute, player, callbacks, 'reverse_cowgirl') },
        { text: '69式', action: () => _brDoSex(prostitute, player, callbacks, 'sixty_nine') },
        { text: '后入式', action: () => _brDoSex(prostitute, player, callbacks, 'doggy') },
        { text: '侧入式', action: () => _brDoSex(prostitute, player, callbacks, 'spoon') },
        { text: '立位', action: () => _brDoSex(prostitute, player, callbacks, 'standing') },
        { text: '臀部素股', action: () => _brDoSex(prostitute, player, callbacks, 'sumata') },
        { text: '桌沿', action: () => _brDoSex(prostitute, player, callbacks, 'edge') },
    ];
    choices.push({ text: '返回', action: () => _brRenderMain(prostitute, player, callbacks) });
    callbacks.showChoices(choices);
}

function _brDoSex(prostitute, player, callbacks, key) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    if (!s.posIdx) s.posIdx = {};
    if (!s.posCount) s.posCount = {};
    s.posCount[key] = (s.posCount[key] || 0) + 1;
    const idx = s.posIdx[key] || 0;
    s.posIdx[key] = idx + 1;
    const isFav = prostitute._favPos === key;
    const pos = _brPickSexPosition(key, prostitute, idx);
    _brAddMessage('【' + pos.name + (isFav ? '★' : '') + '】', 'system');
    const segments = (_splitDesc || function(t){return[t]})(pos.desc);
    _brAddMessage(segments[0], 'narrator');
    const fA = isFav ? Math.round(pos.fA * 1.1) : pos.fA;
    s.maleArousal = Math.min(100, s.maleArousal + pos.mA);
    s.femaleArousal = Math.min(100, s.femaleArousal + fA);
    _brUpdatePanel(s);

    const posMoans = {
        normal: '她双腿死死缠住你的腰，两条胳膊搂着你的脖子，挺着肥白的腚子一下一下往上迎凑，嘴里含含糊糊地浪叫：「好爷……亲爷……您这肉棒子顶到奴家花心了……啊……顶穿了……顶穿了……奴家要死了……」',
        cowgirl: '她骑在你腰上颠得满头青丝乱飞，两只大奶子上下翻腾，她低头看着自己的奶浪，又抬眼瞅着你，浪声道：「爷……您躺着别动……看奴家怎么把您伺候舒服了……啊……这姿势……奴家的骚水儿都顺着您的大腿根儿往下流呢……」',
        reverse_cowgirl: '她背对着你跨坐，那圆滚滚的腚子在你小腹上碾磨，扭过头来吐了吐舌头：「好爷……这姿势是不是比正面更够味儿？您躺着享福，奴家自己动……保管把您伺候得舒舒服服的……」说着那水灵灵的骚屄一缩一放地套弄着，你舒服得一句话也说不出来。',
        sixty_nine: '你们头脚相对，她含着你肉棒的同时也把自己的骚屄凑在你脸上，蜜水儿直往下淌。她含含糊糊地浪声道：「爷……您舔得奴家腿都软了……啊……再往里些……舌尖儿再往里些……」说着她自己倒先丢了一回，那肥嫩的花瓣死死贴在你脸上痉挛了好一阵。',
        doggy: '她跪趴在床沿，把个圆滚滚的白腚子高高撅起，摇着屁股回过头来，眼神又骚又浪：「好爷……您从后头干进来……这姿势最是深……能顶到奴家最痒的那块肉……您快些……奴家痒得受不了了……」',
        spoon: '她侧着身子蜷在你怀里，反手勾住你的脖子，把屁股往后一送一送地蹭着你，嘴里哼哼唧唧：「爷……您抱着奴家……从后头慢慢来……奴家最爱这姿势……又暖和又亲热……您那东西顶在奴家屁股缝里……痒到心坎里了……」',
        sumata: '她夹紧两条滑腻腻的大腿，用腿根儿那团软肉紧紧裹住你的阳物，上下套弄着，低头看着那一进一出，咬唇浪笑：「好爷……您瞧……光用腿就能让您快活……您说……要是真进了奴家的骚屄……那还不得把您夹射了？」',
        standing: '她扶着墙弯下腰，把个白花花的屁股撅得老高，回头媚眼如丝：「爷……站着干最是得劲儿……您扶着奴家的腰……想多深就多深……奴家站得稳着呢……」',
        edge: '她一屁股坐到桌沿上，两条腿大大地分开，自己拿手指掰开那水光光的花瓣儿，露出里头红嫩嫩的芯子，浪声道：「好爷……您瞧清楚了……这骚屄可是专程给您预备的……您那大肉棒子再不来……奴家可要哭了……」',
    };
    const moan = posMoans[key];
    if (moan) _brAddMessage(moan, 'event');
    if (segments.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _brShowSexSegment(prostitute, player, callbacks, segments, 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _brAfterSexAction(prostitute, player, callbacks) }]);
    }
}

function _brShowSexSegment(prostitute, player, callbacks, segments, idx) {
    callbacks.clearChoices();
    _brAddMessage(segments[idx], 'narrator');
    if (idx < segments.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _brShowSexSegment(prostitute, player, callbacks, segments, idx + 1) }]);
    } else {
        _brAfterSexAction(prostitute, player, callbacks);
    }
}

function _brAfterSexAction(prostitute, player, callbacks) {
    const s = prostitute._brState;
    if (s.femaleArousal >= 100) {
        return _brHandleImpendingOrgasm(prostitute, player, callbacks);
    }
    if (s.maleArousal >= 100) {
        callbacks.clearChoices();
        return callbacks.showChoices([
            { text: '射精', action: () => _brShowEjacMenu(prostitute, player, callbacks) },
            { text: '继续', action: () => _brShowSexMenu(prostitute, player, callbacks) },
        ]);
    }
    _brShowSexMenu(prostitute, player, callbacks);
}

// ─── 高潮 ───

function _brHandleImpendingOrgasm(prostitute, player, callbacks) {
    const s = prostitute._brState;
    const isSquirt = s.canSquirt && s.orgasmCount <= 1;
    callbacks.clearChoices();

    _brAddMessage('她的花径骤然缩紧，一阵阵剧烈的颤抖从深处传来，紧紧绞住你的阳物。温热的花蜜喷涌而出，浇淋在你的龟头之上。', 'narrator');

    s.maleArousal = Math.min(100, s.maleArousal + 20);
    _brUpdatePanel(s);

    callbacks.showChoices([{ text: '继续', action: () => _brImpendingNext1(prostitute, player, callbacks, isSquirt) }]);
}

function _brImpendingNext1(prostitute, player, callbacks, isSquirt) {
    callbacks.clearChoices();
    _brAddMessage('你只觉阳具被又湿又热的软肉死死缠住，酥麻感从脊椎直冲头顶，几乎要把你化掉。', 'narrator');

    const s = prostitute._brState;
    if (s.maleArousal >= 100) {
        callbacks.showChoices([{ text: '继续', action: () => _brImpendingNext2(prostitute, player, callbacks, isSquirt) }]);
    } else {
        s.orgasmCount++;
        callbacks.showChoices([{ text: '继续', action: () => _brImpendingDone(prostitute, player, callbacks, isSquirt, false) }]);
    }
}

function _brImpendingNext2(prostitute, player, callbacks, isSquirt) {
    callbacks.clearChoices();
    _brAddMessage('她的花径猛地收紧，像一张小嘴死死咬住你的阳物，你根本来不及抽出，便被那阵剧烈的痉挛绞得精关失守——', 'narrator');
    callbacks.showChoices([{ text: '继续', action: () => _brImpendingNext3(prostitute, player, callbacks, isSquirt) }]);
}

function _brImpendingNext3(prostitute, player, callbacks, isSquirt) {
    callbacks.clearChoices();
    _brAddMessage('滚烫的阳精尽数喷洒在她花心深处，她在这股热流的冲击下达到了顶峰。', 'narrator');
    prostitute._brState.orgasmCount++;
    prostitute._brState.wasInternal = true;
    callbacks.showChoices([{ text: '继续', action: () => _brImpendingDone(prostitute, player, callbacks, isSquirt, true) }]);
}

function _brImpendingDone(prostitute, player, callbacks, isSquirt, maleCame) {
    const s = prostitute._brState;
    _brAddMessage('（高潮）', 'system');
    if (!maleCame) {
        _brAddMessage(getOrgasmReaction(prostitute, isSquirt), 'narrator');
    }
    if (maleCame) {
        s.maleArousal = 70;
        s.ejacCount++;
        s.overClock = 0;
    } else {
        s.maleArousal = Math.max(0, s.maleArousal - 30);
    }
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _brUpdatePanel(s);
    if (maleCame && s.ejacCount >= s.ejacLimit) {
        const root = player.attrs.root || 10;
        const label = getRatingLabel(root);
        const msg = '你只觉腰眼一阵酸软，再也无力继续。终究是你' + label + '(' + root + ')的根骨，' + (s.ejacLimit === 1 ? '只能泄这一次。' : '最多只能支持' + s.ejacLimit + '次。') + '你喘息片刻，揽着她温存了一会儿。';
        _brAddMessage(msg, 'narrator');
        return callbacks.showChoices([{ text: '结束', action: () => _brEndSexScene(prostitute, player, callbacks) }]);
    }
    callbacks.showChoices([
        { text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) },
        { text: '结束', action: () => _brEndSexScene(prostitute, player, callbacks) },
    ]);
}

// ─── 射精 ───

function _brShowEjacMenu(prostitute, player, callbacks) {
    const s = prostitute._brState;
    s.maleArousal = 100;
    _brUpdatePanel(s);
    callbacks.clearChoices();
    _brAddMessage('你已到了极限，是时候释放了……', 'narrator');
    callbacks.showChoices([
        { text: '内射', action: () => _brDoEjacInternal(prostitute, player, callbacks) },
        { text: '外射', action: () => _brShowEjacExternalMenu(prostitute, player, callbacks) },
    ]);
}

function _brDoEjacInternal(prostitute, player, callbacks) {
    callbacks.clearChoices();
    _brAddMessage(getCreampieDesc(), 'narrator');
    prostitute._brState.wasInternal = true;
    _brAfterEjac(prostitute, player, callbacks);
}

function _brShowEjacExternalMenu(prostitute, player, callbacks) {
    callbacks.clearChoices();
    const choices = Object.entries(EJAC_LOCATIONS).map(([key, label]) => ({
        text: '射在' + label + '上',
        action: () => _brDoEjacExternal(prostitute, player, callbacks, key),
    }));
    callbacks.showChoices(choices);
}

function _brDoEjacExternal(prostitute, player, callbacks, loc) {
    callbacks.clearChoices();
    _brAddMessage(getEjacDesc(loc), 'narrator');
    _brAfterEjac(prostitute, player, callbacks);
}

function _brAfterEjac(prostitute, player, callbacks) {
    const s = prostitute._brState;
    s.maleArousal = 70;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    s.ejacCount++;
    s.overClock = 0;
    _brUpdatePanel(s);
    if (s.ejacCount >= s.ejacLimit) {
        const root = player.attrs.root || 10;
        const label = getRatingLabel(root);
        const msg = '你只觉腰眼一阵酸软，再也无力继续。终究是你' + label + '(' + root + ')的根骨，' + (s.ejacLimit === 1 ? '只能泄这一次。' : '最多只能支持' + s.ejacLimit + '次。') + '你喘息片刻，揽着她温存了一会儿。';
        _brAddMessage(msg, 'narrator');
        return callbacks.showChoices([{ text: '结束', action: () => _brEndSexScene(prostitute, player, callbacks) }]);
    }
    callbacks.showChoices([
        { text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) },
        { text: '结束', action: () => _brEndSexScene(prostitute, player, callbacks) },
    ]);
}

// ─── 结束 ───

function _brEndSexScene(prostitute, player, callbacks) {
    const s = prostitute._brState;
    s.finished = true;

    if (s.posCount) {
        let maxKey = null, maxCount = 0;
        for (const [k, v] of Object.entries(s.posCount)) {
            if (v > maxCount) { maxCount = v; maxKey = k; }
        }
        if (maxKey) prostitute._favPos = maxKey;
    }

    _brAddMessage('事毕，' + prostitute.name + '慵懒地伸了个懒腰，替你擦了擦身子。', 'narrator');
    prostitute._hadSex = true;
    player.neili -= 15;
    callbacks.updateStatsBar();
    delete prostitute._brState;

    document.getElementById('log').innerHTML = '';
    callbacks.clearChoices();
    callbacks.addMessage('你心满意足地躺在床上，沉沉睡去……', 'narrator');
    callbacks.showChoices([{ text: '沉沉睡去……', action: () => {
        callbacks.clearChoices();
        callbacks.sleepToTomorrow(true);
        callbacks.addMessage('次日清晨，你从' + (callbacks.venue ? callbacks.venue.name : '勾栏') + '的床上醒来，' + prostitute.name + '已经梳妆整齐，笑吟吟地看着你。', 'narrator');
    } }]);
}

// ─── 辅助函数 ───

function _brGetEjacLimit(root) {
    if (root >= 90) return 6;
    if (root >= 70) return 5;
    if (root >= 50) return 4;
    if (root >= 30) return 3;
    if (root >= 15) return 2;
    return 1;
}

function _brGetHoldRounds(root) {
    if (root >= 90) return 5;
    if (root >= 60) return 4;
    if (root >= 35) return 3;
    if (root >= 20) return 2;
    return 1;
}
