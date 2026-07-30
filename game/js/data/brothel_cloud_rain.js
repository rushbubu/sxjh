/* ─── 勾栏云雨系统（独立于云雨系统） ───
   调用方式：
      startBrothelRain(prostitute, player, {
        addMessage, showChoices, clearChoices, updateStatsBar,
        sleepToTomorrow,
      });
     其中 prostitute 是 generateProstitutes 生成的妓女对象
     player = this.player
*/

// ─── 妓院专属衣物（性感风） ───
const BR_CLOTHING_NAMES = {
    outer: '薄纱披肩', pants: '开裆纱裤', inner: '贴身小衣', bra: '绣花抹胸', panties: '透明亵裤',
};
const BR_UNDRESS_ORDER = ['outer', 'pants', 'inner', 'bra', 'panties'];

const BR_UNDRESS_DESC = {
    outer: [
        '你勾住她肩头那件薄纱披肩的系带轻轻一扯——轻绡滑落，香肩半露，里头那件贴身小衣根本遮不住胸前的曲线，两粒凸起隔着薄薄的布料若隐若现。',
        '你从她肩头缓缓剥下那件半透的罗衫，烛光穿过轻纱，在她雪白的肌肤上投下朦胧的光影。她配合地转了转身子，让衣衫顺着脊背滑落在地上，堆成一圈轻云。',
    ],
    pants: [
        '你解开她腰间那条开裆纱裤的系绳，轻薄的纱料顺着大腿滑下——那白生生的腿根在纱影里若隐若现，股缝深处隐约可见一缕幽色。她微微分开双腿，任你褪尽。',
        '你捏住她纱裤的边缘缓缓往下卷，那透明纱料贴着肌肤滑过，露出一双光裸修长的玉腿。她抬起一只脚让裤管脱落，脚尖轻轻蹭了蹭你的小腿。',
    ],
    inner: [
        '你撩起她那件贴身小衣的下摆，指尖划过她平坦光洁的小腹——那料子薄得几乎透明，能看见底下抹胸绣着的鸳鸯花样。她轻轻吸了口气，小腹随之收得更紧。',
        '你从她头顶褪下那件贴身小衣，她顺从地举起双臂——那一瞬，胸前的曲线在抹胸下呼之欲出，烛光在她光裸的腰侧镀了一层蜜色的光。',
    ],
};

const BR_BRA_REMOVE_DESC = [
    '你指尖勾住抹胸上缘那根细细的系带，轻轻一抽——绣着鸳鸯戏水的布料松了开来，一对白嫩嫩的乳儿跃然而出，{nipple_desc}，烛光下泛着温润的光。',
    '你解开她胸前的抹胸，那薄薄一片绣花布料飘然落下，{bust_desc}的酥胸再无遮掩地袒露在你面前，{nipple_desc}。',
    '她主动抬手让你解开抹胸后的系结，布料滑落的一瞬，她挺了挺胸，{bust_desc}的双峰颤巍巍地晃了晃，{nipple_desc}。',
];
const BR_BRA_REACTION = [
    '她低头看了看自己裸露的胸脯，拿手托了托，吃吃笑道：「爷瞧瞧……这对宝贝养了好些年了，就等着爷来疼呢。」',
    '她双手捧起自己的奶子，送到你眼前，腻声浪道：「官人……您摸摸……这奶子又软又弹，保管比您府上那些庸脂俗粉强了百倍。」',
    '她非但没有遮掩，反而挺起胸膛往你跟前凑了凑，眼波流转：「怎么？看呆了？这才哪儿到哪儿呢……后面还有更销魂的。」',
];

const BR_PANTIES_REMOVE_DESC = [
    '你勾住她腰间那根细细的带子，将那透明的亵裤缓缓拉下——{pubic_desc}，氤氲着暧昧的水光。',
    '她配合地抬起腰，任你将那条透明亵裤褪到膝弯。{pubic_desc}。那薄薄的纱料上沾着浅浅的水渍，在烛光下泛着亮晶晶的光。她咬着嘴唇笑了笑：「爷……您还没碰呢……它自己就湿了。」',
];
const BR_PANTIES_REACTION = [
    '她慢慢转过身去，弯腰翘起腚子，拿手掰开那水光潋滟的花瓣儿，回头浪声笑道：「爷……您倒是看仔细了……这水灵灵的小骚屄……可专等着爷的肉棒子来喂呢。」',
    '她并着腿轻轻蹭了蹭，花唇之间拉出一道细细的银丝，她拿指尖蘸了，送到你唇边，媚声道：「爷尝尝……甜的……奴家特地用花蜜洗过身子……就等着爷来品。」',
];

// ─── 妓院专属抚触场景数据（独立于通用场景） ───

const BROTHEL_FOREPLAY_SCENES = {
    face: {
        common: [
            ['你捏住她的下巴，将她那张粉黛精致的脸蛋抬起来，端详了片刻：「倒是一副好皮囊。」', '她顺势侧过脸，拿脸颊蹭你的手心，眼波流转：「爷喜欢就好……这张脸往后就是爷的了。」'],
            ['你拇指按在她唇上，缓缓揉开那一点朱红胭脂：「这张嘴……会伺候人么？」', '她张开嘴含住你的指头，舌尖绕着指腹打转，抬眼媚媚地看着你，含糊不清地「唔」了一声。'],
            ['你抚过她的眉眼，顺着鼻梁滑到唇边，轻笑道：「长得倒勾人。」', '她仰起脸任你摆弄，狐媚子般的眼睛冲你抛了个媚眼：「那官人可得多来看看奴家……免得被别人勾了魂去。」'],
            ['你低头吻上她的脸颊，从额头一路轻啄到唇角，温热的鼻息扑在她脸上：「这张脸……怎么亲都亲不够。」', '她搂着你的脖子，眼神软得像化开的蜜：「相公就别停……奴家受得住。」'],
        ],
    },
    chest: {
        common: [
            ['你隔着薄薄的衣料覆上她的胸口，掌心下那团软肉温热而富有弹性，拇指在峰顶轻轻打转，隔着布料也清晰地感觉到那一粒{nipple}凸起：「这里……倒是精神。」', '她挺了挺胸往你掌心里送，吃吃笑道：「它知道相公来了……自己就站起来了。」'],
            ['你解开她领口的扣子，探手进去，握住一团白嫩嫩的乳肉，指尖夹住那{nipple}{nipple_color}乳头轻轻搓弄：「{nipple_color}的这粒……真够敏感的。」', '她轻吸一口气，酥胸起伏着往你手上贴，声音带喘：「相公……轻点儿……人家身子骨弱……」'],
            ['你从她锁骨一路向下抚摸，指尖绕着那{areola}乳晕画圈，时不时拨弄一下那{nipple}乳头：「这身子……倒是会长。」', '她咬着嘴唇笑了笑，眼神迷离：「专为了伺候官人长的……官人喜欢就多摸摸。」'],
            ['你指尖勾住她领口的系带轻轻一拉——衣襟散开，一对白嫩嫩的酥胸裹着温热的香气弹跃出来。那{nipple}乳尖在烛光下泛着{nipple_color}的光，娇娇地翘着。你伸手覆上那团温软的乳肉，拇指轻轻碾过那一粒凸起：「好软……好香。」', '她粉面飞红，别过脸去不敢看你，声如蚊蚋：「爷爷这般直白……是要羞死奴家了……」', '你笑着骂了声：「少来，你个小骚浪蹄子！」说罢俯首含住那{nipple}乳头，舌尖轻轻拨弄着那粒{nipple_color}的珠儿——她「啊」地一声软了腰，指尖不觉绞紧了你的衣襟。'],
        ],
    },
    waist: {
        common: [
            ['你揽住她那盈盈一握的柳腰往怀里一带，手掌顺着腰线滑到胯骨，那腰肢柔若无骨，隔着薄衫都能感到肌肤的温热：「这腰……扭起来怕是要人命。」', '她蛇一样贴在你身上，腰肢轻轻扭了扭，仰头呵气如兰：「爷要不要试试？保准让爷腿软。」'],
            ['你的手从她衣摆下面探进去，贴着光裸的腰侧缓缓摩挲，掌心下那截纤腰细腻滑润，白生生的肌肤不见一丝赘肉：「这腰身……怎么养的？」', '她被你摸得腰肢轻颤，却笑着往你怀里拱：「嗯……专门练过……床上扭腰的本事，奴家认第二没人敢认第一。」'],
            ['你从身后环住她的腰，将她整个人拢进怀里，下巴搁在她肩头，手掌贴着她平坦光洁的小腹缓缓摩挲：「这腰……抱一辈子都不腻。」', '她靠在你怀里，偏过头来蹭你的脸，声音软软的：「那相公可要多来……别让奴家空等。」'],
            ['你扶着她的腰往下一按，让她俯身撑住桌沿——那截纤腰弯成一道诱人的弧线，腰窝深深陷下去，白嫩的背脊随着呼吸轻轻起伏。你手掌顺着腰线滑到那凹陷处，轻轻揉按：「这个姿势……喜欢么？」', '她塌着腰肢回头看你，眼波如水：「爷喜欢的……奴家都喜欢。爷要怎么摆弄……都依爷。」'],
        ],
    },
    arms: {
        common: [
            ['你握住她的手腕，将她两条胳膊举过头顶，打量着她光洁的臂弯：「皮肤倒好。」', '她顺势伸了个懒腰，将玉臂送到你眼前，腻声道：「爷闻闻……奴家日日用花瓣泡澡，浑身上下都是香的。」'],
            ['你的指尖从她肩头顺着玉臂缓缓滑下，停在她腕间：「这里的脉跳得这么快……紧张？」', '她翻过手腕，在你掌心轻轻画着圈：「不是紧张……是盼官人盼了一整天，总算把官人盼来了，心里头热得慌。」'],
            ['你低头吻了吻她手腕内侧，抬眼看着她：「一股胭脂气。」', '她咯咯笑起来，拿手指点了点你的鼻尖：「胭脂气也是香的……等会儿还有更香的地方，官人要不要尝尝？」'],
        ],
    },
    hips: {
        common: [
            ['你握住她那{butt_short}捏了一把，满掌都是白嫩嫩的臀肉，弹滑得腻手：「这屁股……怎得如此软嫩？」', '她回头冲你抛了个媚眼，故意晃了晃腰，让那{butt_short}在你手心里颠了颠：「专门练的……就是为了让相公摸着舒服。」'],
            ['你一巴掌轻拍在她那{butt_short}上，响声清脆，白生生的臀肉微微泛红：「趴好。」', '她乖乖地撑住桌沿，将{butt_short}翘得高高的，回头浪声道：「官人想怎么弄都行……奴家受得住。」'],
            ['你双手掰开那{butt_short}，目光在那道深深的股缝间流连，低头啐了一口：「娘子这里……是香的还是臭的？」', '她脸红了一红，声音却更媚了：「知道相公要来……特地用香汤洗了三遍……相公放心尝。」'],
            ['你双手揉捏着那{butt_short}，十指深深陷进那白嫩饱满的臀肉里，指尖顺着股缝缓缓下滑，在她肥美的阴阜上轻轻按压：「这里……想不想让爷碰？」', '她「嗯」地一声，整个身子都酥了半边，回头时眼底已蒙上一层水雾：「想……冤家碰哪里……奴家都想……」'],
        ],
    },
    legs: {
        common: [
            ['你的手沿着她雪白的大腿外侧缓缓上滑，指腹陷入那紧绷而富有弹性的肌肤，感受着她的轻颤：「腿夹紧点。」', '她依言夹紧双腿，把你的手夹在了温热的腿缝间，咬着下唇吃吃地笑：「爷……这样行不行？」'],
            ['你分开她一双白嫩修长的玉腿，手掌贴着大腿内侧那滑腻的嫩肉摩挲，指尖在腿根处打着转：「这里……滑得跟缎子似的。」', '她任由你摆弄，腿微微分得更开了一些，声如游丝：「相公……您往上摸摸……上面更嫩……」'],
            ['你从她脚踝一路向上抚摸，在小腿肚上揉捏了一把，又顺着膝弯内侧那滑腻的肌肤缓缓上滑：「这小腿绷得真紧……别紧张。」', '她深吸一口气，努力放松了身体，可当你手指滑到大腿根时，她还是不受控制地哆嗦了一下，花径深处涌出一股热流：「冤家……您别逗奴家了……快进来吧……」'],
            ['你抬起她一条腿盘在自己腰间，手掌托着她白嫩的大腿根让她靠稳，那{pp_name}隔着薄薄一层布料贴在你身上，温温热热的：「夹紧了……别掉下来。」', '她双手搂住你的脖子，腿紧紧盘住你的腰，整个人挂在你身上，声音又颤又软：「官人……你顶到奴家了……」'],
        ],
    },
    feet: {
        common: [
            ['你握住她一只小脚，除去绣鞋，拇指在她白嫩的足心划过：「脚倒是小。」', '她痒得脚趾蜷了蜷，却没有缩回去，反而往你手里送了送：「爷……您要是喜欢……奴家这双脚也能伺候爷……」'],
            ['你揉捏着她的足弓，一根一根地拨弄她白嫩嫩的脚趾：「这里……敏感么？」', '她呼吸乱了一瞬，声音又轻又颤：「敏……敏感……相公别捏了……再捏奴家要受不住了……」'],
            ['你抬起她的脚，低头在白皙的脚背上落下一吻，抬眼看着她：「什么味？」', '她脸红透了，声音小了许多：「刚……刚洗过的……没味……」随即又鼓起勇气补了一句：「爷要是嫌……奴家下次用花瓣泡……」'],
        ],
    },
    garden: {
        common: [
            ['你的手掌顺着她光洁的小腹缓缓滑入腿间，隔着那层薄薄的亵裤轻轻按压，掌心感受到一片温热的潮意——那层薄布已经湿透了：「这里……倒是诚实。」', '她「唔」地一声夹紧了腿，把你的手夹在了腿缝里，脸红得发烫：「还不是……都怪爷爷撩拨的……」'],
            ['你拨开那层湿透的布料，{ph}的花丛间泉水已经涓涓渗出，指尖顺着那{pp_name}轻轻一滑，沾了满指晶亮亮的花蜜，在烛光下泛着{pp_color}的光：「湿成这样……想爷了？」', '她咬着嘴唇点头，声音又软又颤：「想……从官人进门那一刻……就在想了……」'],
            ['你拨开那{pp_name}，寻着那粒藏着的花珠，拇指轻轻揉弄起来：「这里……才是要命的地方吧？」', '她「啊——」地一声仰起头，腰肢猛地一颤，双手死死抓住了你的胳膊：「冤家……那里……别……别停……」'],
            ['你拨开那{pp_name}，中指顺着滑腻的花蜜缓缓探入——{pp_color}的花径又紧又热，嫩肉紧紧地吸着你的手指，一抽一送间发出咕叽咕叽的水声。你含住她的耳垂低语：「里面……咬得这么紧。」', '她「啊……啊……」地喘着，腰肢随着你的手指轻轻扭动，眼角泛红，声音带着哭腔：「哥哥……你这不是要了奴家的命么……」'],
        ],
    },
};

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
    return BR_UNDRESS_ORDER.filter(k => state.clothes[k]);
}

// ─── 勾栏云雨主流程 ───

function startBrothelRain(prostitute, player, callbacks) {
    const root = player.attrs.root || 10;
    prostitute._brState = {
        femaleArousal: 0,
        maleArousal: 0,
        clothes: { outer: true, pants: true, inner: true, bra: true, panties: true },
        orgasmCount: 0,
        lastAction: null,
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
        { key: 'hips', label: '臀部' }, { key: 'garden', label: '私处' },
        { key: 'legs', label: '玉腿' }, { key: 'feet', label: '玉足' },
    ];
    const choices = parts.map(p => ({
        text: '抚摸' + p.label,
        action: () => _brDoForeplay(prostitute, player, callbacks, p.key),
    }));
    choices.push({ text: '返回', action: () => _brRenderMain(prostitute, player, callbacks) });
    callbacks.showChoices(choices);
}

function _brGetForeplayPair(part, prostitute, tier) {
    let pool = [];
    if (tier >= 3 && typeof BROTHEL_FOREPLAY_SCENES_T3 !== 'undefined') {
        const t3 = BROTHEL_FOREPLAY_SCENES_T3[part];
        if (t3 && t3.common) pool.push(...t3.common);
    }
    if (pool.length === 0 && tier >= 2 && typeof BROTHEL_FOREPLAY_SCENES_T2 !== 'undefined') {
        const t2 = BROTHEL_FOREPLAY_SCENES_T2[part];
        if (t2 && t2.common) pool.push(...t2.common);
    }
    if (pool.length === 0) {
        const scenes = BROTHEL_FOREPLAY_SCENES[part];
        if (!scenes) return ['你抚摸着她的身体。'];
        if (scenes.common) pool.push(...scenes.common);
    }
    if (pool.length === 0) return ['你抚摸着她的身体。'];
    const state = prostitute._brState;
    if (!state._fpIdx) state._fpIdx = {};
    if (!state._fpIdx[part]) state._fpIdx[part] = 0;
    const idx = state._fpIdx[part];
    state._fpIdx[part] = (idx + 1) % pool.length;
    let pair = pool[idx];
    const render = typeof _renderPosDesc === 'function';
    if (render) {
        pair = pair.map(s => s.indexOf('{') >= 0 ? _renderPosDesc(s, prostitute) : s);
    }
    return pair;
}

function _brDoForeplay(prostitute, player, callbacks, part) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    const tier = Math.min(3, (s.ejacCount || 0) + 1);
    const lines = _brGetForeplayPair(part, prostitute, tier);
    s.femaleArousal = Math.min(100, s.femaleArousal + 5);
    const mAValues = { chest: 4, hips: 4, garden: 4, waist: 2, legs: 2, face: 1, arms: 1, feet: 1 };
    s.maleArousal = Math.min(100, s.maleArousal + (mAValues[part] || 1));
    _brUpdatePanel(s);
    let i = 0;
    const next = () => {
        if (i < lines.length) {
            _brAddMessage(lines[i], 'narrator');
            i++;
            callbacks.showChoices([{ text: '继续', action: next }]);
        } else {
            _brRenderMain(prostitute, player, callbacks);
        }
    };
    next();
}

// ─── 脱衣 ───

function _brGetBraRemoveDesc(bust) {
    let bustDesc, nippleDesc;
    if (bust >= 36) { bustDesc = '饱满丰腴'; nippleDesc = '乳晕如铜钱般大小，那一点樱红早已硬挺挺地翘着'; }
    else if (bust >= 34) { bustDesc = '盈盈一握'; nippleDesc = '粉嫩的乳头如樱桃般点缀其上，娇娇地立着'; }
    else if (bust >= 32) { bustDesc = '玲珑可爱'; nippleDesc = '淡粉色的乳晕小巧精致，乳头微微凸起，泛着水光'; }
    else { bustDesc = '娇小玲珑'; nippleDesc = '乳晕如花瓣般淡雅，乳头如花蕊般挺立，惹人怜爱'; }
    const tpl = BR_BRA_REMOVE_DESC[Math.floor(Math.random() * BR_BRA_REMOVE_DESC.length)];
    return tpl.replace('{bust_desc}', bustDesc).replace('{nipple_desc}', nippleDesc);
}

function _brGetPantiesRemoveDesc(bd) {
    const hips = bd.hips || 32;
    const waist = bd.waist || 22;
    let pubic, labia;
    const ph = typeof _getPHLabel === 'function' ? _getPHLabel(bd) : '';
    if (ph === '乌黑浓密' || ph === '茂密如林') pubic = '芳草萋萋，浓密的黑森林覆着那饱满的丘陵，早已挂了露珠';
    else if (ph === '稀疏柔软') pubic = '稀疏的芳草掩映着那神秘的花谷，谷中水光潋滟';
    else if (ph === '无毛光洁') pubic = '那处光洁如脂，仅有浅浅茸毛，蚌珠微露';
    else if (hips >= 36) pubic = '芳草萋萋，浓密的黑森林覆着那饱满的丘陵，早已挂了露珠';
    else if (hips >= 33) pubic = '稀疏的芳草掩映着那神秘的花谷，谷中水光潋滟';
    else pubic = '那处光洁如脂，仅有浅浅茸毛，蚌珠微露';
    const pp = typeof _getPPLabel === 'function' ? _getPPLabel(bd) : null;
    if (pp) labia = pp.adj;
    else if (hips - waist >= 14) labia = '肥美丰腴，两片花唇微微张开';
    else if (hips - waist >= 10) labia = '粉嫩饱满，紧紧闭合着';
    else labia = '紧致小巧，一线天般的妙处';
    const tpl = BR_PANTIES_REMOVE_DESC[Math.floor(Math.random() * BR_PANTIES_REMOVE_DESC.length)];
    return tpl.replace('{pubic_desc}', pubic).replace('{labia_desc}', labia);
}

function _brShowUndressMenu(prostitute, player, callbacks) {
    callbacks.clearChoices();
    const available = _brGetAvailableClothes(prostitute._brState);
    if (available.length === 0) {
        _brAddMessage('她已经一丝不挂了。', 'narrator');
        return _brRenderMain(prostitute, player, callbacks);
    }
    const next = available[0];
    _brAddMessage('她身上还穿着' + BR_CLOTHING_NAMES[next] + '。', 'narrator');
    callbacks.showChoices([
        { text: '脱下' + BR_CLOTHING_NAMES[next], action: () => _brDoUndress(prostitute, player, callbacks, next) },
        { text: '返回', action: () => _brRenderMain(prostitute, player, callbacks) },
    ]);
}

function _brDoUndress(prostitute, player, callbacks, key) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    s.clothes[key] = false;

    if (key === 'bra') {
        _brAddMessage(_brGetBraRemoveDesc(prostitute.bust), 'narrator');
        _brAddMessage(BR_BRA_REACTION[Math.floor(Math.random() * BR_BRA_REACTION.length)], 'narrator');
    } else if (key === 'panties') {
        _brAddMessage(_brGetPantiesRemoveDesc(prostitute), 'narrator');
        _brAddMessage(BR_PANTIES_REACTION[Math.floor(Math.random() * BR_PANTIES_REACTION.length)], 'narrator');
    } else {
        const descs = BR_UNDRESS_DESC[key];
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
    choices.push({ text: '抚弄玉臀', action: () => _brDoService(prostitute, player, callbacks, 'butt') });
    choices.push({ text: '小戏花园', action: () => _brDoService(prostitute, player, callbacks, 'garden') });
    choices.push({ text: '69式', action: () => _brDoService(prostitute, player, callbacks, 'sixty_nine') });
    choices.push({ text: '臀部素股', action: () => _brDoService(prostitute, player, callbacks, 'sumata') });
    choices.push({ text: '返回', action: () => _brRenderMain(prostitute, player, callbacks) });
    callbacks.showChoices(choices);
}

function _brDoService(prostitute, player, callbacks, type) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    s.lastAction = 'service';

    if (type === 'sixty_nine' || type === 'sumata') {
        const tier = Math.min(3, (s.ejacCount || 0) + 1);
        const pos = _brPickSexPosition(type, prostitute, Math.floor(Math.random() * 10), tier);
        _brAddMessage('【' + pos.name + '】', 'system');
        const segments = (_splitDesc || function(t){return[t]})(pos.desc);
        s.maleArousal = Math.min(100, s.maleArousal + pos.mA);
        s.femaleArousal = Math.min(100, s.femaleArousal + pos.fA);
        _brUpdatePanel(s);
        _brShowServiceSegment(prostitute, player, callbacks, segments, 0);
        return;
    }

    const tier = Math.min(3, s.ejacCount + 1);
    const desc = pickServiceDesc(type, tier);
    const segments = (_splitDesc || function(t){return[t]})(desc);
    _brAddMessage(segments[0], 'narrator');
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
    } else if (type === 'butt') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 6);
        s.maleArousal = Math.min(100, s.maleArousal + 2);
        _brAddMessage('她扭了扭腰，将那圆滚滚的屁股蛋子往你手里送了送，回头浪笑道：「好爷……您摸摸奴家这大腚子……又翘又弹，比那未出阁的黄花闺女还有肉头呢……您捏一捏，保管您爱不释手。」', 'event');
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
    callbacks.showChoices([{ text: '继续', action: () => _brNursingAsk(prostitute, player, callbacks) }]);
}

function _brNursingAsk(prostitute, player, callbacks) {
    callbacks.clearChoices();
    _brAddMessage('你含着奶头，含糊地问了一句：「有力气……干嘛？」', 'narrator');
    callbacks.showChoices([{ text: '继续', action: () => _brNursingReply(prostitute, player, callbacks) }]);
}

function _brNursingReply(prostitute, player, callbacks) {
    callbacks.clearChoices();
    _brAddMessage(prostitute.name + '脸上一红，轻轻拍了你一下，啐道：「讨厌……官人明知故问！」', 'event');
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
            '{name}笑道：「爷，咱们换个玩法。」|你只觉龟头一阵温热的包裹，她{ph}的花丛就在你眼前，{pp_color}的嫩肉上沾着晶亮的花蜜。她一边含着你的肉棒吞吐，一边含糊不清地道：「爷……您也尝尝奴家的味儿……看看咸还是甜……」',
            '你们头脚相对地躺着，她熟练地含住你的阳物，舌尖在马眼上打转。|你也拨开她{ph}的花丛，舌尖轻轻舔过那{pp_color}的花瓣。她身子一颤，{pp_name}里涌出一股蜜汁，尽数滴在你脸上。|她赶忙抬起头，抱歉地笑道：「爷……奴家不是故意的……实在是爷的舌头太厉害了……」',
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

function _brPickSexPosition(key, prostitute, idx, tier) {
    let pos;
    if (tier >= 3 && typeof _BR_SEX_POSITIONS_T3 !== 'undefined') pos = _BR_SEX_POSITIONS_T3[key] || _BR_SEX_POSITIONS_T3.normal;
    if (!pos && tier >= 2 && typeof _BR_SEX_POSITIONS_T2 !== 'undefined') pos = _BR_SEX_POSITIONS_T2[key] || _BR_SEX_POSITIONS_T2.normal;
    if (!pos) pos = _BR_SEX_POSITIONS[key] || _BR_SEX_POSITIONS.normal;
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
        { text: '后入式', action: () => _brDoSex(prostitute, player, callbacks, 'doggy') },
        { text: '侧入式', action: () => _brDoSex(prostitute, player, callbacks, 'spoon') },
        { text: '立位', action: () => _brDoSex(prostitute, player, callbacks, 'standing') },
        { text: '桌沿', action: () => _brDoSex(prostitute, player, callbacks, 'edge') },
    ];
    choices.push({ text: '返回', action: () => _brRenderMain(prostitute, player, callbacks) });
    callbacks.showChoices(choices);
}

function _brDoSex(prostitute, player, callbacks, key) {
    callbacks.clearChoices();
    const s = prostitute._brState;
    s.lastAction = 'sex';
    const tier = Math.min(3, (s.ejacCount || 0) + 1);
    if (!s.posIdx) s.posIdx = {};
    if (!s.posCount) s.posCount = {};
    s.posCount[key] = (s.posCount[key] || 0) + 1;
    const idx = s.posIdx[key] || 0;
    s.posIdx[key] = idx + 1;
    const isFav = prostitute._favPos === key;
    const pos = _brPickSexPosition(key, prostitute, idx, tier);
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

// 正戏女性独自高潮文本链（勾栏，插入中，女性到，男性未射）
const _BR_FEMALE_SOLO_ORGASM = [
    [
        '她的花径骤然缩紧，蜜壶内壁的嫩肉层层叠叠地绞了上来，死死缠着你的阳物。她仰着头发出一声长长的浪吟，花蜜喷涌而出。',
        '你只觉阳具被那又湿又热的软肉紧紧裹住，酥麻感从脊椎直冲头顶。你掐着她的胯骨，咬紧牙关才没有丢。',
    ],
    [
        '她身子猛地绷紧，腰肢向上拱起，花心深处一阵剧烈的痉挛——她到了。湿热的花液顺着棒身淌了出来，打湿了身下的床单。',
        '她的花径一缩一缩地吸吮着你，她喘着气回过头来，媚笑道：「好爷……您可真是……奴家都快活死了……您还忍着呢？」',
    ],
    [
        '她浑身剧烈地颤抖起来，花径痉挛着死死咬住你，一股热流从花心深处涌出。她浪叫着一把搂住你的脖子，双腿死死缠着你的腰。',
        '那紧窒的软肉一收一放地绞动，你深吸一口气，勉强守住精关。她在你耳边喘息着：「乖乖……您这定力……奴家服了……」',
    ],
];

// 正戏同步高潮文本链（勾栏，插入中，双方同时到）
const _BR_SYNC_ORGASM = [
    [
        '她的花径猛地收紧，像一张小嘴死死咬住你的阳物，你根本来不及抽出，便被那阵剧烈的痉挛绞得精关失守——',
        '滚烫的阳精尽数喷洒在她花心深处，她在这股热流的冲击下达到了顶峰，满足地浪吟了一声。',
    ],
    [
        '她高潮时的痉挛让你再也无法忍耐，精关一泄如注。滚烫的阳精尽数浇灌在她花心深处，她身子一颤，满意地笑道：「好爷……都射给奴家了……真乖……」',
    ],
    [
        '她的花心深处一阵剧烈的收缩，龟头被那湿热紧窒的软肉死死咬住，你闷哼一声，抵着她的花心将阳精尽数喷洒而出。她舒服地叹了口气，在你耳边吃吃笑道：「乖乖……这可真是要了奴家的命了……」',
    ],
];

function _brHandleImpendingOrgasm(prostitute, player, callbacks) {
    const s = prostitute._brState;
    callbacks.clearChoices();

    // Chain A — 侍奉高潮
    if (s.lastAction === 'service') {
        return _brServiceSoloOrgasm(prostitute, player, callbacks);
    }

    // 试算 maleArousal +20 后是否触发同步高潮
    const maleAfterBoost = Math.min(100, s.maleArousal + 20);

    if (maleAfterBoost >= 100) {
        // Chain C — 同步高潮
        s.maleArousal = maleAfterBoost;
        _brUpdatePanel(s);
        return _brSyncOrgasm(prostitute, player, callbacks);
    } else {
        // Chain B — 正戏女性独自高潮
        return _brFemaleSoloOrgasm(prostitute, player, callbacks);
    }
}

// ─── Chain A：侍奉高潮 ───

function _brServiceSoloOrgasm(prostitute, player, callbacks) {
    const s = prostitute._brState;
    _brAddMessage('她身子猛地绷紧，双腿之间一阵剧烈的痉挛收缩——竟在侍奉中丢了身子。', 'narrator');
    s.orgasmCount++;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _brUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _brServiceOrgasmDone(prostitute, player, callbacks) }]);
}

function _brServiceOrgasmDone(prostitute, player, callbacks) {
    _brAddMessage('（高潮）', 'system');
    _brAddMessage(_brGetOrgasmReaction(prostitute, false), 'narrator');
    _brUpdatePanel(prostitute._brState);
    callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
}

// ─── Chain B：正戏女性独自高潮 ───

function _brFemaleSoloOrgasm(prostitute, player, callbacks) {
    const s = prostitute._brState;
    const pool = _BR_FEMALE_SOLO_ORGASM;
    const idx = Math.floor(Math.random() * pool.length);
    const segs = pool[idx];

    _brAddMessage(segs[0], 'narrator');
    s.orgasmCount++;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _brUpdatePanel(s);

    if (segs.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _brFemaleSoloStep2(prostitute, player, callbacks, segs, 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _brFemaleSoloDone(prostitute, player, callbacks) }]);
    }
}

function _brFemaleSoloStep2(prostitute, player, callbacks, segs, idx) {
    callbacks.clearChoices();
    _brAddMessage(segs[idx], 'narrator');
    if (idx < segs.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _brFemaleSoloStep2(prostitute, player, callbacks, segs, idx + 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _brFemaleSoloDone(prostitute, player, callbacks) }]);
    }
}

function _brFemaleSoloDone(prostitute, player, callbacks) {
    const s = prostitute._brState;
    _brAddMessage('（高潮）', 'system');
    _brAddMessage(_brGetOrgasmReaction(prostitute, false), 'narrator');
    // 男性未射精，不扣 maleArousal
    _brUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _brRenderMain(prostitute, player, callbacks) }]);
}

// ─── Chain C：正戏同步高潮 ───

function _brSyncOrgasm(prostitute, player, callbacks) {
    const s = prostitute._brState;
    const pool = _BR_SYNC_ORGASM;
    const idx = Math.floor(Math.random() * pool.length);
    const segs = pool[idx];

    _brAddMessage(segs[0], 'narrator');
    _brUpdatePanel(s);

    if (segs.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _brSyncStep2(prostitute, player, callbacks, segs, 1) }]);
    } else {
        _brSyncAfterText(prostitute, player, callbacks);
    }
}

function _brSyncStep2(prostitute, player, callbacks, segs, idx) {
    callbacks.clearChoices();
    _brAddMessage(segs[idx], 'narrator');
    if (idx < segs.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _brSyncStep2(prostitute, player, callbacks, segs, idx + 1) }]);
    } else {
        _brSyncAfterText(prostitute, player, callbacks);
    }
}

function _brSyncAfterText(prostitute, player, callbacks) {
    const s = prostitute._brState;
    s.orgasmCount++;
    s.ejacCount++;
    s.wasInternal = true;
    s.maleArousal = 70;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    s.overClock = 0;
    _brUpdatePanel(s);
    _brAddMessage('（高潮）', 'system');

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

// ─── 勾栏高潮反应（妓女身份适配） ───

const BR_ORGASM_REACTIONS = [
    '她仰起头，喉间发出一声长长的浪吟，花径一阵阵痉挛着绞紧你。身子软软地瘫在你怀里，还在不住地轻颤。',
    '她死死搂着你的脖子，{pp_name}里一阵剧烈的收缩，像是要把你榨干一般。她带着餍足的喘息笑道：「好爷……您可真是要了奴家的命了……」',
    '她浑身绷紧，{pp_name}痉挛着死死咬住你。片刻后长长地吐出一口气，整个人软得像一摊春水，口中含含糊糊地浪道：「丢了……丢了……爷太厉害了……」',
    '她身子猛地弓起，花径深处涌出一股热流。她伏在你肩上喘息着，吃吃笑道：「乖乖……爷这本事……奴家伺候过这么多客人……头一回丢得这么痛快……」',
    '她双手紧紧抓着床单，身子剧烈地颤抖了几下，然后便软了下来。她闭着眼回味了好一会儿，才睁开眼媚媚地看着你：「爷……您让奴家快活得……话都说不出来了……」',
];

const BR_SQUIRT_REACTIONS = [
    '随着她一声尖叫，一股清澈的爱液从花心深处喷涌而出，打湿了身下的床单。她喘息着，脸上带着满足的媚态：「哎哟……爷……您把奴家弄喷了……」',
    '她猛地弓起身，一股水流从花心深处激射而出。她愣愣地看着那滩水渍，随即吃吃笑道：「好爷……您可真行……奴家好久没这么痛快地喷过了……」',
];

function _brGetOrgasmReaction(prostitute, isSquirt) {
    let text = BR_ORGASM_REACTIONS[Math.floor(Math.random() * BR_ORGASM_REACTIONS.length)];
    if (isSquirt) {
        const s = BR_SQUIRT_REACTIONS[Math.floor(Math.random() * BR_SQUIRT_REACTIONS.length)];
        text += ' ' + s;
    }
    text = text.replace(/{pp_name}/g, _getPPLabel(prostitute).name);
    return text;
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

// ═══════════════════════════════════════════
// 勾栏 Tier 2 体位（第二次及以后，更湿更浪）
// ═══════════════════════════════════════════

const _BR_SEX_POSITIONS_T2 = {
    normal: {
        name: '正常位',
        desc: [
            '{name}仰在床上，{ph}的双腿大张着，那{pp_color}的{pp_name}已经被操得红艳艳的，{pp_desc}的嫩肉向外翻着。你压上去一挺而入，她「啊……」地长叹一声，{butt}向上挺了挺，浪声道：「好爷……您那肉棒子可算进来了……奴家这骚屄等得都快淌干了……」',
            '你压着她{hl}的身子狠干，{breast_short}随着你的撞击上下翻飞。她低头看着你们交合的地方，那处已经被捣出了白沫。她吃吃笑道：「爷您瞧瞧……都把奴家操出沫子了……您可真厉害……」说着{pp_name}猛地缩紧，绞得你闷哼一声。',
            '她搂着你的脖子，在你耳边吹着热气：「好爷……您一边干一边摸奴家的奶……奴家最喜欢了……」你握住她{breast_short}的乳房揉捏着，她果然叫得更浪了，{pp_name}咬得你舒爽难当。蜜汁顺着你的大腿往下淌。',
        ], mA: 10, fA: 12,
    },
    cowgirl: {
        name: '女上位',
        desc: [
            '你往榻上一躺，她迫不及待地跨坐在你身上，扶着你的肉棒对准{pp_name}一坐到底。她仰起头喉间发出一声满足的叹息，随即便自顾自地上下起伏起来。{breast}在她胸前翻腾得厉害，她低头看着自己的乳浪，喘着气浪叫。',
            '她骑在你身上颠得满头青丝乱飞，汗水顺着{hl}的身子往下淌。{ph}的腰肢扭得像水蛇一样，{pp_name}里的蜜汁流得到处都是。她放开了嗓子：「爷……您说……是奴家的骚屄紧……还是您上过的那些良家妇女紧？」',
            '她在你身上颠得浑身汗淋淋的，{butt}啪嗒啪嗒地拍在你腿上。她上气不接下气地浪叫：「啊……爷……您那肉棒子顶到奴家花心了……顶穿了……奴家要死了……」',
        ], mA: 12, fA: 10,
    },
    reverse_cowgirl: {
        name: '反向女上位',
        desc: [
            '{name}背对着你跨坐，那圆滚滚的{butt}在你小腹上碾磨着。她反手扶着你的肉棒对准{pp_name}一坐到底，然后便开始上下套弄。你眼前尽是那{butt}起起落落的浪态，臀肉随着她的动作漾开层层肉浪。',
            '她背对着你颠得{butt}啪啪作响，扭过头来媚眼如丝：「好爷……您瞧着奴家这大屁股……是不是比正面更来劲儿？」你伸手抓住她那两瓣颤巍巍的臀肉，她叫得更欢了，{ph}的腰肢扭得飞快。',
        ], mA: 12, fA: 10,
    },
    sixty_nine: {
        name: '69式',
        desc: [
            '她含着你的肉棒卖力地吞吐着，同时把自己的{pp_name}凑在你脸上。那{pp_color}的嫩肉上沾满了亮晶晶的花蜜，她含含糊糊地道：「爷……您也尝尝……奴家今儿个的蜜水儿特别甜……」',
            '你们头脚相对，她的舌尖在你龟头上打转。你也拨开她{ph}的花丛，舌尖探入那湿滑的甬道。她身子猛地一颤，{pp_name}里涌出一股蜜汁，她赶忙含住你的肉棒用力吸了一下作为补偿。',
        ], mA: 10, fA: 14,
    },
    doggy: {
        name: '后入式',
        desc: [
            '{name}转过身去，{butt}高高撅起，那{pp_desc}的{pp_name}水光光地翕动着。她回头浪笑：「好爷……从后头来……每一下都能顶到最深……」你一挺而入，她「啊——」地一声，{butt}摇得更欢了。{ph}的臀瓣在你撞击下漾开层层肉浪。',
            '她跪趴在床沿，{butt}在你的撞击下红了一片。她回过头来，眼神又骚又浪：「爷……您使点劲儿……别心疼奴家……」你掐着她的腰狠干起来，{pp_name}里的蜜汁被捣成了白沫，糊在穴口。',
        ], mA: 11, fA: 11,
    },
    spoon: {
        name: '侧入式',
        desc: [
            '你从{name}身后贴近，抬起她一条{ph}的腿架在臂弯里，{pp_adj}{pp_name}从下方暴露出来。她反手搂着你的脖子：「爷……从后头慢慢进来……奴家喜欢这样……」你扶着肉棒缓缓送了进去，她舒服地叹了口气。',
            '你们侧拥着交合，你一边揉捏着她的{breast_short}，一边在她耳边说着骚话。她偏过头来与你舌吻，下身{pp_name}紧紧裹着你一缩一缩的。半晌唇分，她喘着气道：「爷……您这嘴上功夫和下面一样厉害……」',
        ], mA: 9, fA: 12,
    },
    sumata: {
        name: '臀部素股',
        desc: [
            '{name}夹紧{ph}的大腿，用腿根那团软肉裹着你的阳物上下套弄。她低头看着那紫红的龟头在她腿间一出一进，咬唇浪笑：「好爷……您瞧瞧……光用腿就能把您伺候得舒舒服服的……要是真进了骚屄，那不得把您夹射了？」',
            '你的肉棒在她{butt_short}之间进出，{pp_name}里的蜜汁把她的腿根涂得亮晶晶。她扭过头来：「好人……别在外面磨了……进来吧……奴家痒得不行了……」',
        ], mA: 8, fA: 9,
    },
    standing: {
        name: '立位',
        desc: [
            '{name}扶着墙弯下腰，{butt}高高撅起。你从后面进入，她「啊……」地一声浪叫：「爷……站着干最得劲儿……您想多深就多深……」你掐着她的胯骨狠干，{butt}被你撞得啪啪响。',
            '你掐着她的腰狠干，{name}的浪叫声越来越大。她回头浪道：「爷……您可得卖力些……别让人笑话奴家伺候得不好……」{breast_short}贴在墙上蹭来蹭去，{pp_name}里的蜜汁顺着大腿往下淌。',
        ], mA: 10, fA: 10,
    },
    edge: {
        name: '桌沿',
        desc: [
            '{name}{butt_short}坐在桌沿，{ph}的双腿大张，自己拿手指掰开那{pp_color}的{pp_name}，露出里头红嫩嫩的芯子：「好爷……您瞧清楚了……这骚屄专程给您预备的……」你扶着肉棒一挺而入，她「啊——」地一声弓起了腰。',
            '你将她按在桌边狠干着，{butt}撞在桌沿发出咯吱咯吱的声响。{name}的浪叫一声高过一声，{pp_name}里的蜜水被带出，顺着{ph}的大腿往下淌。她上气不接下气地道：「好爷……您太厉害了……奴家要死了……」',
        ], mA: 11, fA: 11,
    },
};

// ═══════════════════════════════════════════
// 勾栏 Tier 3 体位（体力耗尽，语无伦次）
// ═══════════════════════════════════════════

const _BR_SEX_POSITIONS_T3 = {
    normal: {
        name: '正常位',
        desc: [
            '{name}仰在床上，{ph}的双腿无力地分着，{pp_adj}{pp_name}已经被操得红肿不堪，白浊和淫水混在一起糊在穴口。你压上去挺入，她只是轻轻地哼了一声，{breast_short}上布满了红痕。她已经叫不出声了，只有喉间偶尔发出含混的呜咽。',
            '你压在她身上抽送着，她{hl}的身子软得像一摊泥。{pp_name}口红肿着，嫩肉向外翻。你每一下都带着黏腻的水声，她也只是偶尔颤一颤。你低头吻她，她微微张开嘴，舌尖却已经没有力气回应了。',
        ], mA: 10, fA: 14,
    },
    cowgirl: {
        name: '女上位',
        desc: [
            '她跨坐在你身上却已经骑不动了，软软地趴在你胸口。{pp_name}还含着你的阳物，一缩一缩地咬着。你扶着她的腰帮她起伏，她随着你的动作发出断断续续的喘息：「爷……奴家真的不行了……腿都软了……」',
            '她背对着你跨坐，{butt}在你小腹上轻轻磨蹭着，已经没有了大幅度的力气。你握着她的腰帮她，她仰着头靠在你肩上：「好爷……您动吧……奴家伺候不了了……」',
        ], mA: 12, fA: 12,
    },
    reverse_cowgirl: {
        name: '反向女上位',
        desc: [
            '她背对着你跨坐，{butt}已经颠不动了，只是轻轻在你小腹上碾磨着。你扶着她的腰帮她上下起伏，她随着你的动作发出软软的呻吟。{pp_name}里的蜜汁顺着你的大腿往下淌，她已经没有力气说话了。',
        ], mA: 12, fA: 12,
    },
    sixty_nine: {
        name: '69式',
        desc: [
            '她含着你的阳物，累得只能偶尔动一动舌尖。{ph}的花丛就在你眼前，{pp_color}的嫩肉上沾满了花蜜和白浊。你已经不需要她的回应了，舌尖探入那湿滑的甬道，她浑身一颤，{pp_name}里涌出一股热流，尽数滴在你脸上。',
        ], mA: 10, fA: 14,
    },
    doggy: {
        name: '后入式',
        desc: [
            '{name}跪趴在床上却已经撑不住了，上半身完全瘫在床上，只有{butt_short}还勉强撅着。那{pp_desc}的{pp_name}红肿着，白浊顺着大腿往下淌。你从后面进入时她只是无力地哼了一声，{butt_short}在你的撞击下被动地晃动着。',
            '她趴在床上脸埋在枕头里，{hl}的身子随着你的撞击轻轻晃动。她已经叫不出声了，只在每一下深顶时发出一声闷闷的呜咽。{butt_short}上全是巴掌印子，{ph}的腿间一片狼藉。',
        ], mA: 11, fA: 13,
    },
    spoon: {
        name: '侧入式',
        desc: [
            '你们侧躺着，你从身后拥着她。她累得睁不开眼了，任你抬起她的腿。{pp_adj}{pp_name}红肿着暴露出来。你缓缓进入时她轻轻地嗯了一声，往后拱了拱贴近你怀里。她在半梦半醒间微微颤着。',
        ], mA: 9, fA: 12,
    },
    sumata: {
        name: '臀部素股',
        desc: [
            '你的肉棒在她{butt_short}之间缓缓进出，她已经没有力气夹紧了，只是软软地趴着任你动作。{pp_name}里的白浊沾满了她的腿根，你的龟头时不时滑进那红肿的穴口，她轻轻颤一下，却没有力气躲开。',
        ], mA: 8, fA: 9,
    },
    standing: {
        name: '立位',
        desc: [
            '{name}扶着墙已经站不稳了，双腿不住地打颤。你从后面进入她，她软软地向前一倒，全靠你扶着她的腰才没有倒下。{butt}在你的撞击下晃动着，她已经叫不出声了，只有喉咙里发出细微的呜咽。',
        ], mA: 10, fA: 10,
    },
    edge: {
        name: '桌沿',
        desc: [
            '{name}趴在桌沿，{hl}的身子摊在冰凉的桌面上。{pp_adj}{pp_name}红肿着，白浊和蜜汁混在一起顺着大腿往下淌。你从后面进入时她只是轻轻「呃」了一声，连抬头的力气都没有了。',
        ], mA: 11, fA: 11,
    },
};

// ═══════════════════════════════════════════
// 勾栏 Tier 2 抚触场景
// ═══════════════════════════════════════════

const BROTHEL_FOREPLAY_SCENES_T2 = {
    face: { common: [
        ['你捏着她的下巴，拇指揉开她唇上残留的口脂：「这张嘴……刚才尝过我的味儿了。」', '她伸出舌尖舔了舔你的指尖，媚眼如丝：「尝过了……还想尝……爷给不给？」'],
        ['你抚着她汗湿的脸颊，低声道：「一脸都是汗……还是好看。」', '她拿脸颊蹭你的手心：「汗也是香的……奴家连汗都是花蜜味儿的。」'],
    ]},
    chest: { common: [
        ['你隔着薄薄的衣料覆上她的胸口，那团软肉滚烫。你拨弄着那凸起的一点，低笑道：「这里……比刚才精神多了。」', '她挺了挺胸往你掌心里送，浪声道：「它知道相公要来……自己就站起来了……爷再摸摸……」'],
        ['你解开她衣襟，对着那对{breast_short}的乳房轻轻吹了口气，眼看着那{nipple}的乳尖在你气息下挺立。你伸出舌尖轻轻一舔，她浑身一颤。', '她低头看着自己的乳尖在你舌尖下变硬，声音又颤又媚：「爷……您别光看不练呀……吸一口……」'],
    ]},
    waist: { common: [
        ['你揽住她汗湿的腰肢往怀里一带，那截纤腰滑不留手。你顺着腰线滑到胯骨，低笑道：「全是汗……滑得抓不住。」', '她蛇一样贴在你身上扭了扭：「爷抓不住……奴家就贴紧些……保管跑不了。」'],
        ['你的手从她衣摆下探进去，贴着光裸的腰侧缓缓摩挲。那肌肤滚烫湿滑，你的指尖每过一处她就轻轻一颤。', '她靠在你怀里，偏过头来蹭你的脸：「好爷……您手凉……摸着真舒服……再往上些……」'],
    ]},
    arms: { common: [
        ['你握住她的手腕举过头顶，沿着她手臂内侧的细汗缓缓滑下。那肌肤滑腻温热，她的呼吸渐渐乱了。', '她任由你摆弄，声音又轻又颤：「爷……您弄得奴家手都软了……等会儿怎么伺候您……」'],
    ]},
    hips: { common: [
        ['你握着那{butt_short}用力揉捏，满掌都是滑腻的触感——汗水和淫水混在一起，让她的臀瓣在你手中不住地打滑。你一巴掌拍上去，声音清脆。', '她乖乖地撅了撅屁股：「好爷……您打重些……奴家受得住……」'],
        ['你双手掰开她的臀瓣，那沾满花蜜的{pp_name}和后庭都暴露出来。你低头啐了一口：「这里……都湿透了。」', '她回头看你，眼中带着媚意：「还不是爷害的……您伸舌头舔舔……就不湿了……」'],
    ]},
    legs: { common: [
        ['你分开她{ph}的双腿，手掌贴着大腿内侧那滑腻的嫩肉缓缓上滑。那处一片湿滑，手指沾满了亮晶晶的蜜汁。你低笑道：「这里……都泛滥成灾了。」', '她羞得别过头，声音却更媚了：「还不是您弄的……爷快些……奴家痒得不行了……」'],
    ]},
    feet: { common: [
        ['你握住她的小脚，低头在脚背上落下一个吻。她痒得脚趾蜷了蜷。你沿着足弓一路吻到脚趾，含住一根轻轻吸吮。', '她惊叫一声想缩回脚：「别……脏……」你却握紧了不放，她红着脸不再挣扎了，呼吸越来越重。'],
    ]},
    garden: { common: [
        ['你的手掌顺着她光洁的小腹滑入腿间，隔着那层薄薄的亵裤轻轻按压——布料已经湿透了。你低笑道：「这里……倒是诚实。」', '她「唔」地一声夹紧了腿：「还不是都怪爷撩拨的……您快些……别逗奴家了……」'],
        ['你拨开那层湿透的布料，{ph}的花丛间泉水涓涓渗出。你顺着那{pp_name}轻轻一滑，沾了满指晶亮亮的花蜜，送到她唇边：「尝尝……你自己的味道。」', '她张嘴含住你的手指，舌尖绕着指腹打转，吃吃得笑道：「甜的……都是爷的功劳。」'],
    ]},
};

// ═══════════════════════════════════════════
// 勾栏 Tier 3 抚触场景（体力耗尽）
// ═══════════════════════════════════════════

const BROTHEL_FOREPLAY_SCENES_T3 = {
    face: { common: [
        ['你捧着她的脸，她疲惫地靠在你掌心里。你的拇指轻轻摩挲着她的颧骨，她闭着眼，睫毛微微颤抖。', '她侧过脸，嘴唇轻轻碰了碰你的掌心，声音哑哑的：「爷手好暖……奴家想睡……」'],
    ]},
    chest: { common: [
        ['你的手轻轻覆上她的胸口，那对{breast_short}的乳房上布满了红痕和吻痕，{nipple}的乳尖红肿着微微发颤。你只是轻轻握着，她低低地「嘶」了一声。', '她低头看了看自己胸口的狼藉，轻轻笑了笑：「爷……您给奴家咬得……真够狠的……」语气里却没有责怪的意思。'],
    ]},
    waist: { common: [
        ['你揽住她的腰，那截腰肢上全是汗，滑不留手。她软软地靠在你怀里，任你的手掌在她腰侧流连。你轻轻揉了揉她腰间的软肉，她含含糊糊地哼了一声。', '她闭着眼在你怀里蹭了蹭：「好爷……别弄了……让奴家歇会儿……」'],
    ]},
    arms: { common: [
        ['你握着她的手腕，她纤细的手臂上还有你留下的红痕。你轻轻揉了揉那些痕迹，她低头看了看：「爷……瞧您给奴家掐的。」语气懒懒的，像是在说一件不相干的事。'],
    ]},
    hips: { common: [
        ['你的手覆上她的{butt_short}，那白嫩的臀瓣上还留着红红的指印。你轻轻揉捏着，她趴在床上含含糊糊地哼了一声。', '你掰开臀瓣，那{pp_name}和股缝之间一片狼藉。你没有触碰那红肿之处，只是轻轻帮她擦了擦。她回过头来，眼神软软地看了你一眼。'],
    ]},
    legs: { common: [
        ['你分开她{ph}的双腿，她的腿软软地任你摆布。大腿内侧的肌肤上全是干涸的痕迹，{pp_name}红肿着。你的手指轻轻划过那些湿痕，她轻轻颤了颤。', '她偏过头去不看，声音闷闷的：「爷……别看……丢人……」'],
    ]},
    garden: { common: [
        ['你的手掌贴着她的小腹，没有再往下探。那处已经红肿不堪，轻轻一碰都让她哆嗦。她抓住你的手，声音又软又哑：「好爷……别碰了……太敏感了……受不住……」', '你把她的手轻轻放在自己腿间，她犹豫了一下，还是轻轻按了按。然后红着脸别过头去。'],
    ]},
};
