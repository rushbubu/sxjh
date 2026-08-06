/* ─── 强奸系统（完全复制云雨架构，独立数据，修改此处不影响云雨） ───
 * 修改提示：把所有「强奸」「蹂躏」等字眼以及下方所有对白
 * 替换成你想要的女NPC反馈即可。数据分为两部分：
 *   上部：场景数据（对白/描述）
 *   下部：逻辑函数（流程控制）
 */

// ═══════════════════════════════════════════
// 第一部分：场景数据（修改此处文本即可定制反馈）
// ═══════════════════════════════════════════

// 抚摸场景
const RAPE_FOREPLAY_SCENES = {
    face: [
        '你用力撬开她的嘴巴，舌头长驱直入，贪婪的吮吸着她的香舌。',
        '你用硕大的龟头拍打着她的脸蛋。',
        '你按住她的头，用肉棒狠狠的抽插她的嘴巴。',
        '你将龟头狠狠的顶进她的喉咙。',
    ],
    chest: [
        '你粗鲁的手伸进她的衣领，抓握住她柔软的乳房。',
        '你用指尖夹住她娇嫩的乳头，感受着她的身体微微颤抖。',
        '你用大手揉捏着她的胸脯，虽然隔着衣物，仍能感受到那份柔软与弹性。',
        '你用嘴含住她粉嫩的乳头，即便她在反抗，你依然感到乳首逐渐变硬。',
    ],
    waist: [
        '你粗暴地揽住她的腰，手掌死死扣住她腰侧的软肉，她痛得倒吸一口凉气。',
        '你的手在她腰间用力掐了一把，她的身子猛地一僵，却不敢反抗。',
        '你从她两侧狠狠掐住她的腰线，她疼得眼泪都快出来了，却咬紧牙关不吭声。',
    ],
    arms: [
        '你一把抓住她的手腕，反拧到她背后，她痛呼一声，再也动弹不得。',
        '你粗暴地将她的手臂按在头顶，另一只手在她身上肆意揉捏。',
        '你揪住她的胳膊把她拽到身前，她吃痛地挣扎了几下便放弃了。',
    ],
    hips: [
        '你的手狠狠拍在她的臀肉上，发出一声脆响，她惊叫着往前一缩。',
        '你掐住她的臀瓣用力揉捏，她咬着嘴唇闷哼了一声。',
        '你的手掌覆上她的臀部，指尖陷入软肉中，她浑身紧绷却没有躲开。',
        '你将发烫的肉棒顶在她柔软的臀瓣中间，肉棒被柔软的臀肉夹住，你感受到她紧绷的身体在颤抖。',
    ],
    legs: [
        '你蛮横地分开她的双腿，抚摸着她的大腿嫩肉，她拼命并拢却敌不过你的力气。',
        '你的手沿着她的大腿内侧用力滑过，她浑身一颤，双腿不由自主地夹紧。',
        '你按住她的膝盖将双腿大大分开，欣赏她双腿间的风光，她羞愤地别过头去。',
    ],
    feet: [
        '你握住她的脚踝，将她的腿高高抬起，她失去平衡倒在床上。',
        '你粗暴地抓起她的脚，扯掉她的鞋袜，她徒劳地蹬了几下腿。',
        '你按住她的脚踝分开她的双腿，她再也无力抵抗。',
    ],
};

function rapePickForeplay(part, tier) {
    let pool;
    if (tier >= 3 && typeof RAPE_FOREPLAY_SCENES_T3 !== 'undefined') pool = RAPE_FOREPLAY_SCENES_T3[part];
    if (!pool && tier >= 2 && typeof RAPE_FOREPLAY_SCENES_T2 !== 'undefined') pool = RAPE_FOREPLAY_SCENES_T2[part];
    if (!pool) pool = RAPE_FOREPLAY_SCENES[part];
    return pool ? pool[Math.floor(Math.random() * pool.length)] : '你抚摸着她的身体，她的呼吸渐渐急促。';
}

const RAPE_UNDRESS_DESC = {
    outer: [
        '你粗暴地扯开了她的外套，布料撕裂的声音在寂静中格外刺耳。',
        '你抓住她的衣领用力一扯，外衣应声而开，露出里面的衣物。',
    ],
    pants: [
        '你蛮横地扯下她的裤子，露出她雪白修长的双腿。',
        '她的裤子被你强行褪下，她拼命挣扎却无济于事。',
    ],
    inner: [
        '你撩起她的内衬，指尖划过她的小腹，她剧烈地颤抖起来。',
        '你将她的内衬从头顶扯下，她被迫举起双手，胸前曲线暴露无遗。',
    ],
};

const RAPE_BRA_REMOVE_DESC = [
    '你扯开她肚兜的系带，那薄薄的布料滑落，一对{bust_desc}的玉兔跃然而出，{nipple_desc}。',
    '你一把扯下她胸前的肚兜，{bust_desc}的酥胸袒露在你面前，{nipple_desc}。',
    '她的肚兜被你粗暴地扯开，{bust_desc}的双峰再无遮掩，{nipple_desc}。',
];
function rapeGetBraRemoveDesc(bust) {
    let bustDesc, nippleDesc;
    if (bust >= 36) { bustDesc = '饱满丰腴'; nippleDesc = '乳晕如铜钱般大小，乳头已微微挺立'; }
    else if (bust >= 34) { bustDesc = '盈盈一握'; nippleDesc = '粉嫩的乳头如樱桃般点缀其上'; }
    else if (bust >= 32) { bustDesc = '玲珑可爱'; nippleDesc = '淡粉色的乳晕小巧精致，乳头微微凸起'; }
    else { bustDesc = '娇小玲珑'; nippleDesc = '乳晕如花瓣般淡雅，乳头如花蕊般挺立'; }
    const tpl = RAPE_BRA_REMOVE_DESC[Math.floor(Math.random() * RAPE_BRA_REMOVE_DESC.length)];
    return tpl.replace('{bust_desc}', bustDesc).replace('{nipple_desc}', nippleDesc);
}

const RAPE_PANTIES_REMOVE_DESC = [
    '你褪下她的亵裤，{pubic_desc}。那{labia_desc}的私密之处已经微微湿润。',
    '她的亵裤被你扯下，{pubic_desc}。花蕊般的秘处隐约可见。',
    '你强行脱下她的亵裤，{pubic_desc}。那{labia_desc}的花径入口处暴露无遗。',
];
function rapeGetPantiesRemoveDesc(bd) {
    const hips = bd.hips || 32;
    const waist = bd.waist || 22;
    let pubic, labia;
    const ph = typeof _getPHLabel === 'function' ? _getPHLabel(bd) : '';
    if (ph === '乌黑浓密' || ph === '茂密如林') pubic = '芳草萋萋，一片浓密的黑森林覆盖着那饱满的丘陵';
    else if (ph === '稀疏柔软') pubic = '稀疏的芳草掩映着那神秘的花谷';
    else if (ph === '无毛光洁') pubic = '那处光洁如脂，仅有浅浅的茸毛';
    else if (hips >= 36) pubic = '芳草萋萋，一片浓密的黑森林覆盖着那饱满的丘陵';
    else if (hips >= 33) pubic = '稀疏的芳草掩映着那神秘的花谷';
    else pubic = '那处光洁如脂，仅有浅浅的茸毛';
    const pp = typeof _getPPLabel === 'function' ? _getPPLabel(bd) : null;
    if (pp) labia = pp.adj;
    else if (hips - waist >= 14) labia = '肥美丰腴';
    else if (hips - waist >= 10) labia = '粉嫩饱满';
    else labia = '紧致小巧';
    const tpl = RAPE_PANTIES_REMOVE_DESC[Math.floor(Math.random() * RAPE_PANTIES_REMOVE_DESC.length)];
    return tpl.replace('{pubic_desc}', pubic).replace('{labia_desc}', labia);
}

const RAPE_BRA_REACTIONS = {
    unmarried: [
        '她又怕又羞，用双手遮住了脸，不敢看你的脸。',
        '"求求你……放过我……"她低声哭泣着，却不敢反抗。',
        '她的身子剧烈发抖，胸脯随着急促的呼吸上下起伏。',
    ],
    married: [
        '她脸色煞白，双手护在胸前往后缩：「别……别过来……」',
        '"你……你敢！我男人不会放过你的！"她声音发颤，色厉内荏。',
        '她咬着嘴唇别过头去，身子却僵在原地，一动也不敢动。',
    ],
    widow: [
        '她冷笑一声：「呵，男人。」却没有躲开，只是直直地看着你。',
        '"我早就知道会有这一天……"她闭上眼睛，像是认了命。',
        '她深吸一口气，胸脯高高挺起，眼中带着几分讥诮：「就这点胆子？」',
    ],
};
const RAPE_PANTIES_REACTIONS = {
    unmarried: [
        '她死死并拢双腿，却被你蛮横分开，泪水顺着脸颊滑落。',
        '"不要……求你了……"她的声音细若蚊吟，双腿却在你掌下不住地打颤。',
        '她的双腿被强行分开，羞愤地别过头去，眼泪无声地淌了满脸。',
    ],
    married: [
        '"你……你不得好死！"她嘴上咒骂着，双腿却被你硬生生掰开。',
        '她拼命夹紧双腿，却敌不过你的力气，那处隐秘的花园被迫暴露在你眼前。',
        '"畜生……你会遭报应的……"她咬着牙关，声音里带着哭腔。',
    ],
    widow: [
        '她冷笑一声，主动分开了双腿：「想看就看吧，又不是没被人看过。」',
        '她咬着嘴唇别过脸去，眼角有泪光闪动，身子却在你的掌下不住地发抖。',
        '她闭上眼，双腿微微分开，像是在承受一场避无可避的命运。',
    ],
};
function rapeGetBraReaction(bd) {
    const r = RAPE_BRA_REACTIONS[bd.surface] || RAPE_BRA_REACTIONS.unmarried;
    return r[Math.floor(Math.random() * r.length)];
}
function rapeGetPantiesReaction(bd) {
    const r = RAPE_PANTIES_REACTIONS[bd.surface] || RAPE_PANTIES_REACTIONS.unmarried;
    return r[Math.floor(Math.random() * r.length)];
}

const RAPE_SERVICE_DESC = {
    blowjob: [
        '你掐住她的下巴迫使她张开嘴，肉棒猛地捅了进去。她呜呜地叫着，泪水顺着脸颊滑落。',
        '你按住她的后脑，将她的头死死按在胯下，肉棒在她喉咙深处进进出出，她几乎喘不过气来。',
        '她被迫张着嘴含住你的肉棒，你的每一次挺进都让她干呕不止，涎水顺着嘴角流了满襟。',
        '你揪着她的头发，像使用一个物件般在她的嘴里抽插。她双目失神，口中发出含混的呜咽。',
        '你掰开她的嘴，把龟头顶进她的喉咙，她拼命拍打着你的大腿，你却毫不松手。',
    ],
    footjob: [
        '你抓起她的脚踩在你的肉棒上，她惊恐地缩回脚，却被你死死按住。',
        '你强迫她用双脚夹住你的肉棒，她徒劳地挣扎了几下，最终还是屈服了。',
        '你握着她的脚踝，用她的脚底板搓弄着你的肉棒，她闭着眼，泪水无声滑落。',
    ],
    titjob: [
        '你将她按倒在地，用双乳夹住你的肉棒。她屈辱地别过头，任由你摆布。',
        '你抓着她的头发让她跪好，把那对雪白的乳房挤在一起裹住你的肉棒。她咬着嘴唇，眼中噙着泪。',
        '她被迫跪在你身前，双乳在你手中被挤作一团，夹着你的肉棒上下滑动。她浑身都在发抖。',
        '你用她的乳沟包裹着肉棒，龟头在她唇边进出，她被迫一次次舔过顶端。',
    ],
    breast: [
        '你一把扯开她的衣襟，双手粗暴地揉捏着她的乳房。她疼得倒吸冷气，却不敢推开你。',
        '你掐住她的乳头用力拧了一把，她惨叫一声，泪水夺眶而出。',
        '你低头咬住她的乳头，她痛得弓起身子，双手死死抓着你的肩膀却不敢用力。',
        '你含住她的乳尖用力吸吮，另一只手在她乳肉上留下道道红痕。她咬着嘴唇，呜咽着承受着。',
        '你一手掐着她的脖子，一手揉捏着她的乳房。她呼吸困难，却连反抗的力气都没有了。',
    ],
    garden: [
        '你的手粗暴地探入她的腿间，她浑身一颤，双腿猛地夹紧。',
        '你强行拨开她的花瓣，手指毫不怜惜地捅了进去。她发出一声痛苦的闷哼。',
        '你的手指插进她的下体，在她体内粗暴地抽送着，她咬着手背，眼泪簌簌地往下掉。',
        '你用指尖狠狠扣弄着她的花心，她的身子猛地弓起，口中发出一声压抑的尖叫。',
        '你俯下身，舌尖粗暴地探入她的花径，她拼命扭动腰肢想要躲开，却被你死死按住。',
    ],
    butt: [
        '你粗暴地将她翻转过去，双手狠狠抓住她的臀瓣用力揉捏。她疼得倒吸一口凉气，身体绷得死紧，却不敢挣扎。',
        '你掐住她丰满的臀部，指尖深深陷入那柔软的臀肉中。她咬着嘴唇，眼泪顺着脸颊滑落，身子在你的掌下不住地发抖。',
        '你一巴掌重重拍在她的屁股上，发出一声脆响。她痛呼一声，雪白的臀瓣上顿时浮起一道鲜红的掌印。你掐着那道红痕用力揉搓，她呜咽着，整个人蜷缩起来。',
        '你将她按在地上，强迫她高高撅起臀部。你从后面掐着她的臀瓣，指节陷入那饱满的曲线中，留下一道道红痕。她趴在地上一动不敢动，只有肩膀在无声地耸动。',
        '你抓住她的臀肉用力分开，那隐秘的股缝暴露在你眼前。她惊恐地扭动着腰肢想要躲避，却被你死死按住，只能任由你摆布。',
    ],
};
function rapePickServiceDesc(type, tier) {
    let pool;
    if (tier >= 3 && typeof RAPE_SERVICE_DESC_T3 !== 'undefined') pool = RAPE_SERVICE_DESC_T3[type];
    if (!pool && tier >= 2 && typeof RAPE_SERVICE_DESC_T2 !== 'undefined') pool = RAPE_SERVICE_DESC_T2[type];
    if (!pool) pool = RAPE_SERVICE_DESC[type];
    return pool ? pool[Math.floor(Math.random() * pool.length)] : '她温柔地侍奉着你。';
}

const PRIVATE_PART_TYPES = [
    { name: '蝴蝶穴', adj: '蝴蝶般展翅的', desc: '两片阴唇薄而舒展，形如蝶翼' },
    { name: '馒头穴', adj: '饱满肥嫩的', desc: '阴阜饱满圆润，两瓣鼓鼓囊囊' },
    { name: '一线天', adj: '紧窄如丝的', desc: '阴唇紧合如线，只在顶端露一点缝隙' },
    { name: '鲍鱼穴', adj: '肥厚多汁的', desc: '大阴唇肥厚如鲍鱼' },
    { name: '花瓣穴', adj: '层叠如花的', desc: '小阴唇层层叠叠如花瓣般绽开' },
    { name: '葫芦穴', adj: '葫芦形的', desc: '上窄下宽，形如葫芦，入口紧窄' },
    { name: '蜜桃穴', adj: '蜜桃般的', desc: '两瓣阴唇圆润饱满如熟透的蜜桃' },
    { name: '玉蚌穴', adj: '玉蚌含珠的', desc: '两瓣紧紧闭合如蚌壳' },
    { name: '菱角穴', adj: '菱角似的', desc: '两瓣尖锐分明，中间一道深缝' },
    { name: '倒挂穴', adj: '倒挂金钟的', desc: '阴唇外翻如钟，内里一览无余' },
];
const PUBIC_HAIR_TYPES = ['无毛光洁', '稀疏柔软', '乌黑浓密', '茂密如林'];

// 乳房形状
const BREAST_SHAPES = [
    { key: '圆盘形', desc: '双峰如两只倒扣的玉盘铺展在胸前' },
    { key: '半球形', desc: '那对玉乳浑圆饱满，如半剖的瓜儿扣在胸上' },
    { key: '水滴型', desc: '一双乳儿状如垂露，上部微平下部鼓胀' },
    { key: '吊钟乳', desc: '两只豪乳沉沉甸甸地垂着，乳廓饱满丰腴' },
    { key: '纺锤形', desc: '那对乳峰修长优美，线条流畅，乳尖微微朝下' },
];
// 乳晕大小
const AREOLA_TYPES = ['铜钱般小巧的', '指甲盖般精巧的', '大而饱满的', '杯口般宽大的'];
// 乳头形状
const NIPPLE_TYPES = ['樱桃般小巧的', '草莓般红润的', '葡萄般圆润的', '石榴般饱满的'];
// 颜色（未婚浅 / 已婚深）
const COLORS_YOUNG = ['淡粉', '粉红', '粉嫩', '樱粉'];
const COLORS_MATURE = ['深红', '浅褐', '褐', '深褐'];
// 臀部形状
const BUTT_SHAPES = [
    { key: '紧翘型', desc: '两瓣臀肉紧实上翘，绷出两道诱人的弧线', noun: '紧翘的臀瓣' },
    { key: '圆润型', desc: '臀部浑圆饱满，曲线玲珑有致', noun: '圆润的丰臀' },
    { key: '丰满型', desc: '丰臀肥美，满掌都是软绵绵的触感', noun: '丰满的肉臀' },
    { key: '蜜桃臀', desc: '两瓣臀肉圆润饱满，如熟透的水蜜桃般诱人', noun: '蜜桃般的臀瓣' },
    { key: '肥美型', desc: '一双臀瓣肥厚多肉，颤颤巍巍', noun: '肥厚多肉的臀瓣' },
    { key: '宽大型', desc: '骨盆宽大，臀部饱满浑圆，曲线夸张如熟透的蜜瓜', noun: '饱满浑圆的丰臀' },
];

function _hashRange(bd, seeds, mod) {
    const h = (bd.bust || 30) * seeds[0] + (bd.waist || 24) * seeds[1] + (bd.hips || 34) * seeds[2] + (bd.age || 20) * seeds[3] + (bd.height || 160) * seeds[4];
    return Math.abs(h) % mod;
}
function _isMature(bd) { return bd.inner === 'married' || bd.inner === 'married_child' || bd.inner === 'widow'; }
function _getColor(bd, youngArr, matureArr) {
    const arr = _isMature(bd) ? matureArr : youngArr;
    return arr[_hashRange(bd, [3,7,11,13,17], arr.length)];
}

function _getPPLabel(bd) {
    if (bd._ppIdx === undefined) bd._ppIdx = _hashRange(bd, [7,13,19,23,0], 10);
    return PRIVATE_PART_TYPES[bd._ppIdx];
}
function _getPHLabel(bd) {
    if (bd._phIdx === undefined) bd._phIdx = _hashRange(bd, [11,17,5,3,0], 4);
    return PUBIC_HAIR_TYPES[bd._phIdx];
}
function _getSizeDesc(bust) {
    if (bust >= 36) return ['沉甸甸的', '两只丰腴饱满的', '一双胀鼓鼓的豪乳'];
    if (bust >= 34) return ['饱满鼓胀的', '一双丰盈的', '两只乳鸽般鼓胀的玉峰'];
    if (bust >= 32) return ['盈盈一握的', '一双娇巧的', '两只恰到好处的'];
    return ['初具规模的', '一双小巧的', '两只笋尖般微微隆起的'];
}
function _getBreastDesc(bd) {
    const sizes = _getSizeDesc(bd.bust);
    const shape = BREAST_SHAPES[_hashRange(bd, [3,5,7,11,13], BREAST_SHAPES.length)];
    const areola = AREOLA_TYPES[_hashRange(bd, [7,11,13,17,19], AREOLA_TYPES.length)];
    const nipple = NIPPLE_TYPES[_hashRange(bd, [5,7,11,13,3], NIPPLE_TYPES.length)];
    const color = _getColor(bd, COLORS_YOUNG, COLORS_MATURE);
    const s = sizes[0];
    const descs = {
        '圆盘形': `${sizes[1]}乳儿在胸前铺展开来，乳廓宽宽地摊开，如两只倒扣的玉盘。${areola}乳晕嵌在峰顶，${nipple}乳头俏生生立着，泛着${color}的光泽`,
        '半球形': `${sizes[2]}浑圆饱满，如半剖的瓜儿扣在胸前，乳峰挺拔，峰峦起伏。${areola}乳晕恰到好处，${nipple}乳头微微凸起，${color}的一圈儿分外惹眼`,
        '水滴型': `${sizes[1]}乳儿状如垂露，上部微平下部鼓胀，${s}坠着。${areola}乳晕，${nipple}乳头含苞欲放，呈${color}色泽`,
        '吊钟乳': `${sizes[2]}沉沉甸甸地垂着，乳廓饱满丰腴，乳尖微微指向下方。${areola}乳晕大而显眼，${nipple}乳头俏生生缀在峰尖，${color}的乳晕边缘分明`,
        '纺锤形': `${sizes[1]}乳峰修长优美，线条流畅，${areola}乳晕不大不小，${nipple}乳头俏生生立在顶端，${color}的乳粒宛如一粒玛瑙`,
    };
    return descs[shape.key] || `${sizes[1]}玉乳盈盈可握，${areola}乳晕，${nipple}乳头，呈${color}`;
}
function _getBreastShort(bd) {
    const sizes = _getSizeDesc(bd.bust);
    const shape = BREAST_SHAPES[_hashRange(bd, [3,5,7,11,13], BREAST_SHAPES.length)];
    const nouns = {
        '圆盘形': '圆盘乳',
        '半球形': '半球乳',
        '水滴型': '水滴乳',
        '吊钟乳': '吊钟乳',
        '纺锤形': '纺锤乳',
    };
    return sizes[1] + (nouns[shape.key] || '乳房');
}
function _getButtDesc(bd) {
    const shape = BUTT_SHAPES[_hashRange(bd, [7,11,13,17,19], BUTT_SHAPES.length)];
    return shape.desc;
}
function _getButtNoun(bd) {
    const shape = BUTT_SHAPES[_hashRange(bd, [7,11,13,17,19], BUTT_SHAPES.length)];
    return shape.noun;
}
function _getPPColor(bd) {
    return _getColor(bd, COLORS_YOUNG, COLORS_MATURE);
}
function _getCupLabel(bust) {
    if (bust >= 36) return 'D';
    if (bust >= 34) return 'C';
    if (bust >= 32) return 'B';
    return 'A';
}
function _getHeightLabel(height) {
    if (height < 155) return '娇小玲珑';
    if (height < 160) return '小鸟依人';
    if (height < 165) return '匀称';
    if (height < 170) return '高挑修长';
    if (height < 178) return '身材高挑';
    return '高挑出众';
}

function _renderPosDesc(template, bd) {
    const pp = _getPPLabel(bd);
    const ph = _getPHLabel(bd);
    const isV = bd._wasVirgin;
    const breastDesc = _getBreastDesc(bd);
    const breastShort = _getBreastShort(bd);
    const buttDesc = _getButtDesc(bd);
    const buttShort = _getButtNoun(bd);
    const ppColor = _getPPColor(bd);
    let out = template;
    const isM = _isMature(bd);
    out = out.replace(/\{v_if:([^}]+)\}/g, (_, t) => isV ? t : '');
    out = out.replace(/\{v_else:([^}]+)\}/g, (_, t) => isV ? '' : t);
    out = out.replace(/\{m_if:([^}]+)\}/g, (_, t) => isM ? t : '');
    out = out.replace(/\{m_else:([^}]+)\}/g, (_, t) => isM ? '' : t);
    const nipple = NIPPLE_TYPES[_hashRange(bd, [5,7,11,13,3], NIPPLE_TYPES.length)];
    const areola = AREOLA_TYPES[_hashRange(bd, [7,11,13,17,19], AREOLA_TYPES.length)];
    const nipColor = _getColor(bd, COLORS_YOUNG, COLORS_MATURE);
    return out
        .replace(/{name}/g, bd.name)
        .replace(/{bust}/g, bd.bust)
        .replace(/{waist}/g, bd.waist)
        .replace(/{hips}/g, bd.hips)
        .replace(/{cup}/g, _getCupLabel(bd.bust))
        .replace(/{hl}/g, _getHeightLabel(bd.height))
        .replace(/{breast}/g, breastDesc)
        .replace(/{breast_short}/g, breastShort)
        .replace(/{butt}/g, buttDesc)
        .replace(/{butt_short}/g, buttShort)
        .replace(/{pp_name}/g, pp.name)
        .replace(/{pp_adj}/g, pp.adj)
        .replace(/{pp_desc}/g, pp.desc)
        .replace(/{pp_color}/g, ppColor)
        .replace(/{ph}/g, ph)
        .replace(/{nipple}/g, nipple)
        .replace(/{areola}/g, areola)
        .replace(/{nipple_color}/g, nipColor)
        .replace(/{v}/g, isV ? '处女' : '');
}

const RAPE_SEX_POSITIONS = {
    normal: {
        name: '正常位',
        desc: [
            '{name}的{hl}身子被你狠狠压在地上，你粗暴地分开她{ph}的双腿，那{pp_desc}、呈{pp_color}的{pp_name}毫无遮蔽地暴露在你眼前。你挺起肉棒对准那{pp_adj}入口，一插到底。「啊——！」她惨叫一声，泪水夺眶而出：「求求你……不要……」你呵斥道：「闭嘴！」抬手扇了她一巴掌，开始疯狂抽送。',
            '你掐着她的脖子将她按倒，{name}拼命挣扎却无济于事。你低头看见她那{pp_adj}{pp_name}，{ph}的阴毛沾满了她流出的淫水。{breast_short}，在你身下被压得变了形状。你握住肉棒对准猛地挺入，她浑身一僵，指甲深深掐进你的手臂。「呜……畜生……」她咬着嘴唇骂你，却被你几下猛冲顶得支离破碎。',
            '你把她双腿扛在肩上，那{pp_desc}、{pp_color}的{pp_adj}{pp_name}完全呈现在你眼前。{name}偏过头不敢看你，{ph}的小穴一张一合地翕动着。你俯下身，一口唾沫吐在她穴口，然后挺腰将肉棒整根没入。她「呃」地一声哽住，整个身子都在发抖。你拍打着她的臀部，呵斥道：「放松点！」{butt}，在你的掌下抖动着肉浪。',
            '你将她按在地上，她那两只丰腴饱满的乳儿在胸前铺展开来，乳廓宽宽地摊开，如两只倒扣的玉盘。大而饱满的乳晕嵌在峰顶，细长如豆的乳头俏生生立着，泛着深红的光泽的乳房在你掌中变换着形状。|你摆开她雪白的双腿，只见{ph}的私密处，{pp_desc}。|你握住肉棒狠狠插进她的{pp_name}，感受到洞口狭窄紧绷，你笑着问她：「{v_if:还是个处子？那老子今天给你开苞。}{v_else:这骚穴被多少人插过？}」|她咬着牙不答话，你冷笑一声，猛地贯穿了她，肉棒在她{pp_adj}肉穴中大力抽插。{v_if:龟头上传来一阵突破阻碍的触感，你抽出肉棒低头一看，只见那根肉棒上沾满了点点落红——她竟真是个处子。你心中一阵得意，更加用力地抽送起来。}',
            '你抓着{name}的脚踝将她的腿掰到最大，{pp_adj}{pp_name}完全敞开。{ph}的耻毛间那{pp_desc}、{pp_color}的肉缝正瑟瑟发抖。你吐了口唾沫抹在龟头上，对准那紧窄的入口狠狠撞了进去。「啊——！」她痛得弓起身子，{breast_short}随着她的动作晃动着。你不管不顾地抽插起来，每一下都顶到最深处。',
        ], mA: 10, fA: 5,
    },
    cowgirl: {
        name: '女上位',
        desc: [
            '你强迫{name}跨坐在你身上，捏开她的嘴塞进两根手指搅弄着，命令道：「自己坐下去。」她含着泪摇头，你一巴掌扇在她胸前——{breast_short}被打得一颤，你呵斥道：「别让我说第二遍！」她颤抖着扶住你的肉棒，那{pp_desc}、{pp_color}的{pp_name}对准龟头，一闭眼坐了下去——「唔——」她发出一声压抑的呜咽。',
            '你躺在地上，{name}被迫骑在你胯间。你扶着她的{ph}腰肢迫使她上下起伏，{breast}的双乳随着动作上下晃动。你威胁道：「自己动，不然老子干到明天。」她咬着嘴唇，笨拙地扭动着腰肢，{pp_adj}{pp_name}吞吐着你的肉棒，发出噗嗤的水声。',
            '你命令道：「骑上来。」同时拍了拍她的屁股，{butt}。{name}犹豫了一下，被你一把拽到身上。你掐着她的胯骨往下按，{pp_adj}{pp_name}将你的肉棒一点一点吞了进去。「不……太深了……」她仰着头，喉间发出破碎的呻吟。你不管她的求饶，摁着她的腰强迫她上上下下地套弄着。',
            '{name}骑在你身上被迫起伏着，{hl}的身子在月光下泛着白腻的光。你抬头含住她的乳尖——{breast_short}的味道在你口中化开。她「啊」地叫出声，身子一软差点倒下。你抓住她的{ph}阴毛狠狠一扯，她吃痛地绷直了腰，你的肉棒趁势顶入最深处。',
            '你握着{name}的腰强迫她上下套弄，她的{pp_adj}{pp_name}紧咬着你的肉棒，{pp_color}的嫩肉随之一翻一翻，{ph}间一片泥泞。她咬着手指不想出声，你却故意用力往上一顶，她「嗯——」地一声漏了出来。你淫笑道：「叫出来，老子爱听。」她羞愤地别过头，泪水在眼眶里打转。',
        ], mA: 10, fA: 5,
    },
    doggy: {
        name: '后入式',
        desc: [
            '你一把将{name}翻过去，让她跪趴在地上。{hl}的身段在你面前弯成一道美妙的弧线，{pp_adj}{pp_name}从{ph}股缝间若隐若现。你一巴掌拍在她圆润的臀瓣上——{butt}，在白嫩的臀肉上留下五道指痕，你呵斥道：「撅高点！」她哭着照做了，你挺腰将龟头送入{pp_name}从后面一插到底。',
            '她跪趴着，屁股被你撞得啪啪作响，{butt}荡起层层肉浪。你揪着她{ph}的阴毛往里顶，每一下都撞得她往前一耸。{name}咬着枕巾呜呜地哭，却被你从后面撞得支离破碎。「不……不行了……」她告饶着，你却越插越狠。',
            '你一手按着她的后颈将她压在地上，一手扶着{name}的腰，从后面狠狠插进她{pp_adj}{pp_name}。她惊呼一声，整张脸贴在泥土里。{breast_short}被地面挤压着。你俯下身贴着她耳朵，冷冷道：「这就是跟我作对的下场。」然后开始了狂风暴雨般的冲刺。',
            '从后面这个角度，你能清楚地看见{pp_desc}、{pp_color}的{pp_name}是怎样被你的肉棒撑开到极限的。{name}的{ph}臀肉在你的撞击下荡起层层肉浪。她回过头来，满脸泪痕地求你：「求你……轻一点……」你捂住她的嘴，下身反而插得更深更快。',
            '你让她趴在石头上，{hl}的腰肢弯成新月。她那{pp_adj}{pp_name}毫无遮掩地暴露在你面前，{pp_color}的阴唇沾满了亮晶晶的淫水。你握住肉棒在穴口磨了两下，她紧张地绷紧了身子。{butt}在你眼前轻轻颤抖。你不给她反应的时间，猛地插了进去。',
        ], mA: 10, fA: 5,
    },
    spoon: {
        name: '侧入式',
        desc: [
            '你从侧面贴上去，抬起{name}的一条腿。{hl}的身子侧卧在你怀中，{pp_adj}{pp_name}从下方暴露出来，{pp_color}的嫩肉微微翕动。你扶着肉棒对准，缓缓插了进去。她咬着嘴唇，一声不吭地承受着，只有眼泪顺着眼角无声滑落。{breast_short}在你掌中轻轻起伏。',
            '你们侧躺着，你从身后拥着她，一手揉捏着她的乳房——{breast_short}，下身在她{pp_name}里缓缓抽送。{ph}的阴毛蹭着你的小腹，{name}在你怀里轻轻发抖。她在你耳边喘息着，声音带着哭腔：「快……快好了吗……」你含住她的耳垂，轻笑道：「早着呢。」',
            '侧卧的姿势让你们贴得极紧，{pp_name}把你的肉棒裹得严严实实。你一手掐着她的脖子，一手抄起她{ph}的大腿，下身用力挺进。{butt}在你小腹上挤压变形。{name}呼吸困难，双手无力地抓着你的手臂，喉咙里发出含混的呜咽。',
            '你从侧面缓缓进入{name}，她{hl}的身子在你怀中蜷缩着。你能感觉到她那{pp_desc}、{pp_color}的{pp_name}是怎样一张一合地咬着你的。她偏过头不看你，却躲不开你喷在她耳边的热气。你凑在她耳边低语道：「{v_if:第一次就在这种地方，可惜了。}{v_else:这洞可真是极品。}」',
            '你从侧面捞起她的一条腿，{name}的{pp_adj}{pp_name}完全向你敞开，{pp_color}的嫩肉一览无余。你扶着肉棒不紧不慢地插着，故意在洞口磨蹭。她终于忍不住了，小声哀求：「进……进来吧……」你满意地笑了，一挺腰整根没入。',
        ], mA: 10, fA: 5,
    },
    standing: {
        name: '立位',
        desc: [
            '你将她抵在树干上，抬起她一条腿盘在自己腰间。{name}的{hl}身子被你压在粗糙的树皮上，{ph}的小穴被迫大张，{pp_color}的{pp_adj}{pp_name}在月光下泛着水光。你吐了口唾沫抹在龟头上，挺身插了进去。她呜咽着，后脑勺抵着树干无处可逃。',
            '你让她双手撑着树干，从后面抬起她一条腿。{name}单腿站立摇摇欲坠，整个人的重心都落在你们交合之处。{pp_adj}{pp_name}将你咬得死紧，{pp_color}的嫩肉被你的肉棒撑得发白。你每抽动一下，她便发出一声压抑的闷哼。{butt}在你胯下有节奏地颤动着。',
            '你将她按在墙上，{pp_desc}的{pp_name}在她{ph}腿间若隐若现，{pp_color}的肉缝泛着湿润的光。你一手扶着肉棒抵住那微微翕动的穴口，龟头沿着{pp_color}的嫩肉上下滑动了两下，沾满了她泌出的淫液，然后腰身一挺，「噗嗤」一声整根没了进去。{name}踮着脚尖，被你撞得一下一下撞在墙上。她双手撑着墙面勉强支撑，指甲在粗糙的墙面上留下道道划痕。{breast_short}紧贴着冰冷的墙面。「呜……放……放过我……」你从后面捂住她的嘴，下身一刻不停地冲刺着。',
            '你让她弯下腰扶着石桌，{hl}的上身贴在冰凉的桌面上。你从后面靠近她，{pp_adj}{pp_name}在{ph}腿间微微翕动，{pp_color}的花瓣挂着露珠般的淫液。你握着肉棒在她穴口拨弄了两下，沾满了一手黏滑，然后对准一挺而入。她倒吸一口凉气，桌面上的手指紧紧蜷起。{butt}在你的撞击下啪啪作响。',
            '你将{name}翻转过来面对着你，抬起她一条腿架在胳膊上。{breast}的双乳紧贴着你的胸膛，{pp_adj}{pp_name}在你的肉棒下面微微颤抖，{pp_color}的穴口一张一合。你低头吻——不，是咬住了她的嘴唇，在她吃痛张嘴的时候下身狠狠挺了进去。',
        ], mA: 10, fA: 5,
    },
};
function rapePickSexPosition(key, bd, idx, tier) {
    let pos;
    if (tier >= 3 && typeof RAPE_SEX_POSITIONS_T3 !== 'undefined') pos = RAPE_SEX_POSITIONS_T3[key] || RAPE_SEX_POSITIONS_T3.normal;
    if (!pos && tier >= 2 && typeof RAPE_SEX_POSITIONS_T2 !== 'undefined') pos = RAPE_SEX_POSITIONS_T2[key] || RAPE_SEX_POSITIONS_T2.normal;
    if (!pos) pos = RAPE_SEX_POSITIONS[key] || RAPE_SEX_POSITIONS.normal;
    const i = typeof idx === 'number' ? idx % pos.desc.length : Math.floor(Math.random() * pos.desc.length);
    const template = pos.desc[i];
    return { name: pos.name, desc: _renderPosDesc(template, bd), mA: pos.mA, fA: pos.fA };
}

const RAPE_ORGASM_REACTIONS = {
    unmarried: [
        '她的身子剧烈地颤抖起来，花径一阵阵紧缩。她仰着头，泪水从眼角滑落，口中发出破碎的哭腔。',
        '她浑身绷紧，脚趾蜷曲，双手死死抓着地面，泪水无声滑落，喉咙里发出压抑的呜咽。',
        '她弓起身子，像一张拉满的弓，喉咙里发出含混不清的哭喊。花径一阵阵痉挛着绞紧你。',
    ],
    married: [
        '她高声尖叫着，身子猛地绷直，花径痉挛着死死绞住你。泪水顺着她的眼角滑落。',
        '她浑身抽搐着，双手在地上胡乱抓挠，指甲折断也浑然不觉。',
        '"啊……啊……"她发出一声声短促的惊叫，身子像触电般剧烈抖动，花心深处涌出一股热流。',
    ],
    widow: [
        '她发出一声压抑了许久的哭喊，身子剧烈地颤抖起来，眼泪顺着眼角无声滑落。',
        '她咬着嘴唇不想出声，身体却背叛了她——小腹剧烈起伏，花径一阵阵吸吮着你。',
        '她仰着头，泪水与汗水混在一起，喉间发出断断续续的抽泣，身体不住地痉挛着。',
    ],
};
const RAPE_SQUIRT_REACTIONS = {
    unmarried: ['随着她一声凄厉的尖叫，一股清澈的爱液从花心深处喷涌而出，打湿了身下的地面。'],
    married: ['她猛地弓起身，一股水流从花心深处激射而出，洒了一地。她失神地望着屋顶，泪水无声滑落。'],
    widow: ['她尖叫着，一股积蓄已久的潮水奔涌而出，仿佛身体最后一丝力气也被抽干。她瘫软在地，不住地抽泣。'],
};
function rapeGetOrgasmReaction(bd, squirt) {
    const reactions = RAPE_ORGASM_REACTIONS[bd.surface] || RAPE_ORGASM_REACTIONS.unmarried;
    let text = reactions[Math.floor(Math.random() * reactions.length)];
    if (squirt) {
        const s = RAPE_SQUIRT_REACTIONS[bd.surface] || RAPE_SQUIRT_REACTIONS.unmarried;
        text += ' ' + s[Math.floor(Math.random() * s.length)];
    }
    return text;
}

const RAPE_CREAMPIE_DESC = [
    '你抵着她花心深处，将一股股浓精尽数喷洒在她体内。她感受到那滚烫的热流，身子又是一阵轻颤。',
    '你低吼着在她体内爆发，一股股热精灌满了她的花径。她绝望地闭上眼睛，任由你黏稠的精液从腿间淌出。',
    '你死死抵住她的花心，将积蓄的阳精一股脑全射了进去。她浑身一僵，随即瘫软在地，白浊的精液从红肿的花唇间缓缓流出。',
];
const RAPE_EJAC_LOCATIONS = {
    face: '脸', mouth: '口', chest: '胸', belly: '肚子',
    back: '背', butt: '屁股', legs: '腿', feet: '脚',
};
const RAPE_EJAC_DESC = {
    face: [
        '你抽身而出，将一股股浓精狠狠射在她脸上。那白色的浊液溅了她满脸，顺着她的脸颊缓缓滑落。',
        '你握着肉棒对准她的脸，滚烫的精华一道道射在她脸上、眉间、发梢。她闭着眼，睫毛上沾着点点白浊，屈辱地别过头去。',
    ],
    mouth: [
        '你一把揪住她的头发，将龟头塞进她嘴里，在她口中爆发。她想吐出来，却被你死死按住后脑，被迫将你的精华尽数咽了下去。',
        '你捏开她的嘴，将滚烫的精液射进她喉咙里。她被呛得连连咳嗽，白浊从嘴角溢出，顺着下巴滴落。',
    ],
    chest: [
        '你抽身而出，将精华喷射在她饱满的胸脯上。白色的浊液洒在那雪白的峰峦之间，顺着乳沟缓缓流下。',
        '你的浊液射在她胸前，在那对乳房间留下一道道白色的痕迹。她低头看着自己满身的污秽，泪水夺眶而出。',
    ],
    belly: [
        '你抽身而出，将热流射在她平坦的小腹上。那白色的液体顺着她的腹肌缓缓流下，滴落在地。',
        '你的精华喷洒在她的小腹上，星星点点，在那白皙的肌肤上格外刺目。',
    ],
    back: [
        '你让她翻过身趴着，将精华射在她光滑的背脊上。从肩胛到腰窝，留下一道道白色的痕迹。',
        '你从后面按住她，将滚烫的液体喷洒在她的背上。她趴在地上一动不动，只有肩膀在微微耸动。',
    ],
    butt: [
        '你抽身而出，将浊液射在她浑圆的臀部上。白色的液体顺着那饱满的曲线滑落，滴在地上。',
        '你的精华打在她雪白的臀瓣上，在那圆润的曲线上留下一片狼藉。',
    ],
    legs: [
        '你将精华射在她修长的腿上，白浊顺着大腿内侧缓缓流下，在雪白的肌肤上格外扎眼。',
        '你的热流喷洒在她的大腿上，那白浊顺着腿线蜿蜒流下。她蜷缩着身子，无声地哭泣。',
    ],
    feet: [
        '你将精华射在她纤巧的玉足上，白浊沾满了她的脚背和趾缝。她蜷缩着脚趾，不敢看你。',
        '你握着肉棒对准她的脚，一股股热精洒在她的足尖和脚背上。她闭着眼，泪水顺着眼角滑落。',
    ],
};
function rapeGetCreampieDesc() {
    return RAPE_CREAMPIE_DESC[Math.floor(Math.random() * RAPE_CREAMPIE_DESC.length)];
}
function rapeGetEjacDesc(loc) {
    const d = RAPE_EJAC_DESC[loc];
    return d ? d[Math.floor(Math.random() * d.length)] : '你释放了。';
}

const RAPE_START_DESC = {
    '小树林': {
        day: [
            '林间光线昏暗，树影婆娑。你将她按倒在铺满落叶的地上，她拼命挣扎却无济于事。',
            '树林深处，你把她压在树下，斑驳的日光透过枝叶在她惊恐的脸上晃动。',
        ],
        dusk: [
            '夕阳的余晖穿过枝叶，在林间投下长长的阴影。你捂住她的嘴将她拖进了树林深处。',
        ],
        night: [
            '林间月光斑驳，树影婆娑。你将她按倒在铺满落叶的地上，她拼命挣扎却无济于事。',
            '树林深处，你把她压在树下，月光透过枝叶在她惊恐的脸上投下斑驳的光影。',
        ],
    },
    '小溪': {
        day: [
            '溪水潺潺流淌，清澈见底。你将她按在溪边的鹅卵石上，水流浸湿了她的衣裳。',
            '溪畔的石头上长满了青苔，你把她推倒在地，水花四溅，她浑身发抖却逃不掉。',
        ],
        dusk: [
            '夕阳映在水面上，泛着粼粼金光。你将她的头按进水里又提起，在她呛咳的时候扯开了她的衣襟。',
        ],
        night: [
            '溪水潺潺流淌，月光在水面上碎成千万片银鳞。你将她的头按进水里又提起，在她呛咳的时候扯开了她的衣襟。',
            '溪畔的石头上冰冷刺骨，你把她推倒在地，水流浸湿了她的衣裳，她浑身发抖却逃不掉。',
        ],
    },
    '田埂': {
        day: [
            '田埂上稻香四溢，远处传来几声狗吠。你将她按倒在田埂上，泥土沾满了她的衣裳。',
            '稻田里水光潋滟，你强硬的把她推倒在田埂上，威胁她不要反抗。',
        ],
        dusk: [
            '夕阳西下，田埂上拉出长长的影子。你将她拖到田埂边按倒在地。',
        ],
        night: [
            '田埂上稻香四溢，蛙声此起彼伏。你将她按在田埂上，泥土沾满了她的衣裳。',
            '稻田里的水映着月光，你把她推倒在田埂上，她半身浸在泥水里，挣扎着却发不出声音。',
        ],
    },
    '断桥': {
        day: [
            '断桥横在水面，桥下的河水浑浊不清。你将她抵在残破的桥栏上，她背后就是冰冷的河水。',
            '半截石桥横在水面，桥下流水幽幽。你捂住她的嘴将她按倒在地。',
        ],
        dusk: [
            '残桥映着落日余晖，拉出一道长长的阴影。你将她抵在桥栏上，她惊恐地挣扎着。',
        ],
        night: [
            '断桥残月，桥下的水面泛着粼粼波光。你将她抵在残破的桥栏上，她背后就是冰冷的河水。',
            '半截石桥横在水面，桥下流水幽幽。你捂住她的嘴将她按倒在地。',
        ],
    },
};
function rapePickStartDesc(venueName, timePeriod) {
    const venue = RAPE_START_DESC[venueName];
    if (!venue) return RAPE_START_FALLBACK[Math.floor(Math.random() * RAPE_START_FALLBACK.length)];
    let period = 'day';
    if (timePeriod === '黄昏') period = 'dusk';
    else if (timePeriod === '夜晚' || timePeriod === '子时') period = 'night';
    const descs = venue[period];
    if (descs && descs.length > 0) return descs[Math.floor(Math.random() * descs.length)];
    const fallback = venue.day || venue.night;
    if (fallback) return fallback[Math.floor(Math.random() * fallback.length)];
    return RAPE_START_FALLBACK[Math.floor(Math.random() * RAPE_START_FALLBACK.length)];
}

const RAPE_END_DESC = [
    '事毕，你站起身来整理衣襟。她蜷缩在地上，像一具被抽空了灵魂的躯壳。',
    '一番暴行过后，你将泄了精的肉棒拔了出来。她一动不动地躺在地上，只有肩膀在微微耸动。',
    '你站起身来，留下她衣衫破碎地躺在地上，把头埋在臂弯里无声地哭泣。',
];
function rapePickEndDesc() {
    return RAPE_END_DESC[Math.floor(Math.random() * RAPE_END_DESC.length)];
}

// ═══════════════════════════════════════════
// 第二部分：逻辑函数（完全复制云雨架构）
// ═══════════════════════════════════════════

function startRapeDetailedScene(bd, player, callbacks) {
    if (!bd._hadSex) bd._wasVirgin = true;
    const root = player.attrs.root || 10;
    bd._rapeState = {
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
    _sexAddMessage(rapePickStartDesc(venueName, player.timePeriod), 'narrator');
    _renderRapeMain(bd, player, callbacks);
}

function _renderRapeMain(bd, player, callbacks) {
    const s = bd._rapeState;
    if (s.finished) return;
    _sexUpdatePanel(s);

    if (s.femaleArousal >= 100) {
        s.femaleArousal = Math.min(s.femaleArousal, 100);
        return _handleRapeOrgasm(bd, player, callbacks);
    }

    if (s.maleArousal >= 100) {
        if (s.overClock >= s.holdRounds) {
            return _showRapeEjacMenu(bd, player, callbacks);
        }
        s.overClock++;
    }

    callbacks.clearChoices();
    const choices = [];

    if (s.femaleArousal < 30) {
        choices.push({ text: '强行抚摸', action: () => _showRapeForeplay(bd, player, callbacks) });
    } else {
        choices.push({ text: '强行抚摸', action: () => _showRapeForeplay(bd, player, callbacks) });
        if (_getAvailableClothes(s).length > 0) {
            choices.push({ text: '撕扯衣物', action: () => _showRapeUndress(bd, player, callbacks) });
        }
        if (s.femaleArousal >= 30) {
            choices.push({ text: '强迫侍奉', action: () => _showRapeService(bd, player, callbacks) });
        }
        if (s.femaleArousal >= 60) {
            choices.push({ text: '侵犯', action: () => _showRapeSexMenu(bd, player, callbacks) });
        }
    }

    if (s.maleArousal >= 100) {
        choices.push({ text: '射精', action: () => _showRapeEjacMenu(bd, player, callbacks) });
    }

    choices.push({ text: '结束暴行', action: () => _endRapeScene(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _showRapeForeplay(bd, player, callbacks) {
    callbacks.clearChoices();
    const parts = [
        { key: 'face', label: '脸蛋' }, { key: 'chest', label: '胸部' },
        { key: 'waist', label: '腰肢' },
        { key: 'hips', label: '臀部' }, { key: 'legs', label: '大腿' },
    ];
    const choices = parts.map(p => ({
        text: p.label,
        action: () => _doRapeForeplay(bd, player, callbacks, p.key),
    }));
    choices.push({ text: '返回', action: () => _renderRapeMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _doRapeForeplay(bd, player, callbacks, part) {
    callbacks.clearChoices();
    const tier = Math.min(3, (bd._rapeState.ejacCount || 0) + 1);
    _sexAddMessage(rapePickForeplay(part, tier), 'narrator');
    bd._rapeState.femaleArousal = Math.min(100, bd._rapeState.femaleArousal + 5);
    bd._rapeState.maleArousal = Math.min(100, bd._rapeState.maleArousal + 3);
    _sexUpdatePanel(bd._rapeState);
    callbacks.showChoices([{ text: '继续', action: () => _renderRapeMain(bd, player, callbacks) }]);
}

function _showRapeUndress(bd, player, callbacks) {
    callbacks.clearChoices();
    const available = _getAvailableClothes(bd._rapeState);
    if (available.length === 0) {
        _sexAddMessage('她已一丝不挂。', 'narrator');
        return _renderRapeMain(bd, player, callbacks);
    }
    const next = available[0];
    _sexAddMessage('她身上还穿着' + CLOTHING_NAMES[next] + '。', 'narrator');
    callbacks.showChoices([
        { text: '扯下' + CLOTHING_NAMES[next], action: () => _doRapeUndress(bd, player, callbacks, next) },
        { text: '返回', action: () => _renderRapeMain(bd, player, callbacks) },
    ]);
}

function _doRapeUndress(bd, player, callbacks, key) {
    callbacks.clearChoices();
    const s = bd._rapeState;
    s.clothes[key] = false;

    if (key === 'bra') {
        _sexAddMessage(rapeGetBraRemoveDesc(bd.bust), 'narrator');
        _sexAddMessage(rapeGetBraReaction(bd), 'narrator');
        s.femaleArousal = Math.min(100, s.femaleArousal + 1);
    } else if (key === 'panties') {
        _sexAddMessage(rapeGetPantiesRemoveDesc(bd), 'narrator');
        _sexAddMessage(rapeGetPantiesReaction(bd), 'narrator');
        s.femaleArousal = Math.min(100, s.femaleArousal + 1);
    } else {
        const descs = RAPE_UNDRESS_DESC[key];
        if (descs) _sexAddMessage(descs[Math.floor(Math.random() * descs.length)], 'narrator');
        s.femaleArousal = Math.min(100, s.femaleArousal + 1);
    }

    _sexUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _renderRapeMain(bd, player, callbacks) }]);
}

function _showRapeService(bd, player, callbacks) {
    callbacks.clearChoices();
    const choices = [
        { text: '强迫口交', action: () => _doRapeService(bd, player, callbacks, 'blowjob') },
        { text: '强迫足交', action: () => _doRapeService(bd, player, callbacks, 'footjob') },
    ];
    if (hasCupC(bd.bust)) {
        choices.push({ text: '强迫乳交', action: () => _doRapeService(bd, player, callbacks, 'titjob') });
    }
    choices.push({ text: '把玩玉乳', action: () => _doRapeService(bd, player, callbacks, 'breast') });
    choices.push({ text: '搓弄玉臀', action: () => _doRapeService(bd, player, callbacks, 'butt') });
    choices.push({ text: '玩弄花径', action: () => _doRapeService(bd, player, callbacks, 'garden') });
    choices.push({ text: '返回', action: () => _renderRapeMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _doRapeService(bd, player, callbacks, type) {
    callbacks.clearChoices();
    const s = bd._rapeState;
    s.lastAction = 'service';
    const tier = Math.min(3, (s.ejacCount || 0) + 1);
    _sexAddMessage(rapePickServiceDesc(type, tier), 'narrator');
    if (type === 'breast') {
        s.femaleArousal = Math.min(100, s.femaleArousal + 6);
        s.maleArousal = Math.min(100, s.maleArousal + 2);
    } else if (type === 'butt') {
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
    callbacks.showChoices([{ text: '继续', action: () => _renderRapeMain(bd, player, callbacks) }]);
}

function _showRapeSexMenu(bd, player, callbacks) {
    callbacks.clearChoices();
    const choices = [
        { text: '正常位', action: () => _doRapeSex(bd, player, callbacks, 'normal') },
        { text: '女上位', action: () => _doRapeSex(bd, player, callbacks, 'cowgirl') },
        { text: '后入式', action: () => _doRapeSex(bd, player, callbacks, 'doggy') },
        { text: '侧入式', action: () => _doRapeSex(bd, player, callbacks, 'spoon') },
    ];
    choices.push({ text: '立位', action: () => _doRapeSex(bd, player, callbacks, 'standing') });
    choices.push({ text: '返回', action: () => _renderRapeMain(bd, player, callbacks) });
    callbacks.showChoices(choices);
}

function _splitDesc(text) {
    if (text.includes('|')) return text.split('|').map(s => s.trim()).filter(Boolean);
    const segs = [];
    let buf = '';
    for (let i = 0; i < text.length; i++) {
        buf += text[i];
        // Sentence boundary: 。！？ + optional 」』
        if (text[i] === '。' || text[i] === '！' || text[i] === '？') {
            const next = text[i + 1] || '';
            if (next === '」' || next === '』') {
                buf += next;
                i++;
            }
            segs.push(buf.trim());
            buf = '';
        }
    }
    if (buf.trim()) segs.push(buf.trim());
    return segs.length > 1 ? segs : [text];
}

function _doRapeSex(bd, player, callbacks, key) {
    callbacks.clearChoices();
    const s = bd._rapeState;
    s.lastAction = 'sex';
    const tier = Math.min(3, (s.ejacCount || 0) + 1);
    if (!s.posIdx) s.posIdx = {};
    if (!s.posCount) s.posCount = {};
    s.posCount[key] = (s.posCount[key] || 0) + 1;
    const idx = s.posIdx[key] || 0;
    s.posIdx[key] = idx + 1;
    const isFav = bd._favPos === key;
    const pos = rapePickSexPosition(key, bd, idx, tier);
    _sexAddMessage('【' + pos.name + (isFav ? '★' : '') + '】', 'system');
    const segments = _splitDesc(pos.desc);
    _sexAddMessage(segments[0], 'narrator');
    const fA = isFav ? Math.round(pos.fA * 1.1) : pos.fA;
    s.maleArousal = Math.min(100, s.maleArousal + pos.mA);
    s.femaleArousal = Math.min(100, s.femaleArousal + fA);
    _sexUpdatePanel(s);
    if (segments.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _showRapeSexSegment(bd, player, callbacks, segments, 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _afterRapeSex(bd, player, callbacks) }]);
    }
}
function _showRapeSexSegment(bd, player, callbacks, segments, idx) {
    callbacks.clearChoices();
    _sexAddMessage(segments[idx], 'narrator');
    if (idx < segments.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _showRapeSexSegment(bd, player, callbacks, segments, idx + 1) }]);
    } else {
        _afterRapeSex(bd, player, callbacks);
    }
}

function _afterRapeSex(bd, player, callbacks) {
    const s = bd._rapeState;
    if (s.femaleArousal >= 100) {
        return _handleRapeOrgasm(bd, player, callbacks);
    }
    if (s.maleArousal >= 100) {
        callbacks.clearChoices();
        return callbacks.showChoices([
            { text: '射精', action: () => _showRapeEjacMenu(bd, player, callbacks) },
            { text: '继续侵犯', action: () => _showRapeSexMenu(bd, player, callbacks) },
        ]);
    }
    _showRapeSexMenu(bd, player, callbacks);
}

function _handleRapeOrgasm(bd, player, callbacks) {
    const s = bd._rapeState;
    callbacks.clearChoices();

    // Chain A — 侍奉高潮
    if (s.lastAction === 'service') {
        return _rapeServiceSoloOrgasm(bd, player, callbacks);
    }

    // 试算 maleArousal +20 后是否触发同步高潮
    const maleAfterBoost = Math.min(100, s.maleArousal + 20);

    if (maleAfterBoost >= 100) {
        // Chain C — 同步高潮
        s.maleArousal = maleAfterBoost;
        _sexUpdatePanel(s);
        return _rapeSyncOrgasm(bd, player, callbacks);
    } else {
        // Chain B — 正戏女性独自高潮
        return _rapeFemaleSoloOrgasm(bd, player, callbacks);
    }
}

// ─── Chain A：侍奉高潮 ───

function _rapeServiceSoloOrgasm(bd, player, callbacks) {
    const s = bd._rapeState;
    _sexAddMessage('她身子猛地绷紧，双腿之间一阵剧烈的痉挛收缩——竟在被迫侍奉中到了。', 'narrator');
    s.orgasmCount++;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _sexUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _rapeServiceOrgasmDone(bd, player, callbacks) }]);
}

function _rapeServiceOrgasmDone(bd, player, callbacks) {
    _sexAddMessage('（高潮）', 'system');
    _sexAddMessage(rapeGetOrgasmReaction(bd, false), 'narrator');
    _sexUpdatePanel(bd._rapeState);
    callbacks.showChoices([{ text: '继续', action: () => _renderRapeMain(bd, player, callbacks) }]);
}

// ─── Chain B：正戏女性独自高潮（插入中，女性到，男性未射）───

const _RAPE_FEMALE_SOLO_ORGASM = [
    [
        '她的花径骤然缩紧，一阵阵剧烈的颤抖从深处传来。她咬着嘴唇，却压不住喉间溢出的呻吟。',
        '那湿热的软肉紧紧裹着你的阳物，一收一放地绞动。她偏过头，不想让你看到她失态的样子。',
    ],
    [
        '她身子猛地绷紧，阴道痉挛着死死咬住你，一股热流从花心深处涌出。她仰起头，喉间发出破碎的呜咽。',
        '你只觉阳具被那湿热紧窒的软肉绞得酥麻难当，深吸一口气才压住了射意。',
    ],
    [
        '她浑身剧烈地颤抖起来，双腿之间一片湿滑——她不情愿地到了高潮。身体诚实的反应让她羞耻地蜷起了脚趾。',
        '她喘息着，身体还在轻轻抽搐。你停在她体内，感受着她花径一阵阵的收缩。',
    ],
];

function _rapeFemaleSoloOrgasm(bd, player, callbacks) {
    const s = bd._rapeState;
    const pool = _RAPE_FEMALE_SOLO_ORGASM;
    const idx = Math.floor(Math.random() * pool.length);
    const segs = pool[idx];

    _sexAddMessage(segs[0], 'narrator');
    s.orgasmCount++;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    _sexUpdatePanel(s);

    if (segs.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _rapeFemaleSoloStep2(bd, player, callbacks, segs, 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _rapeFemaleSoloDone(bd, player, callbacks) }]);
    }
}

function _rapeFemaleSoloStep2(bd, player, callbacks, segs, idx) {
    callbacks.clearChoices();
    _sexAddMessage(segs[idx], 'narrator');
    if (idx < segs.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _rapeFemaleSoloStep2(bd, player, callbacks, segs, idx + 1) }]);
    } else {
        callbacks.showChoices([{ text: '继续', action: () => _rapeFemaleSoloDone(bd, player, callbacks) }]);
    }
}

function _rapeFemaleSoloDone(bd, player, callbacks) {
    const s = bd._rapeState;
    _sexAddMessage('（高潮）', 'system');
    _sexAddMessage(rapeGetOrgasmReaction(bd, false), 'narrator');
    // 男性未射精，不扣 maleArousal
    _sexUpdatePanel(s);
    callbacks.showChoices([{ text: '继续', action: () => _renderRapeMain(bd, player, callbacks) }]);
}

// ─── Chain C：正戏同步高潮（插入中，双方同时到）───

const _RAPE_SYNC_ORGASM = [
    [
        '她花径的紧缩让你再也无法忍耐，精关一泄如注——滚烫的阳精尽数喷洒在她花心深处。她在你身下战栗着，承受着那股滚烫的冲击。',
    ],
    [
        '她的花心深处一阵剧烈的收缩，龟头被那湿热紧窒的软肉死死咬住，你闷哼一声，抵着她的花心将阳精尽数喷洒而出。',
    ],
    [
        '她的阴道痉挛着死死咬住你，你被她绞得精关失守，一股股浓精尽数灌入她体内。她身子一僵，随即软了下去。',
    ],
];

function _rapeSyncOrgasm(bd, player, callbacks) {
    const s = bd._rapeState;
    const pool = _RAPE_SYNC_ORGASM;
    const idx = Math.floor(Math.random() * pool.length);
    const segs = pool[idx];

    _sexAddMessage(segs[0], 'narrator');
    _sexUpdatePanel(s);

    if (segs.length > 1) {
        callbacks.showChoices([{ text: '继续', action: () => _rapeSyncStep2(bd, player, callbacks, segs, 1) }]);
    } else {
        _rapeSyncAfterText(bd, player, callbacks);
    }
}

function _rapeSyncStep2(bd, player, callbacks, segs, idx) {
    callbacks.clearChoices();
    _sexAddMessage(segs[idx], 'narrator');
    if (idx < segs.length - 1) {
        callbacks.showChoices([{ text: '继续', action: () => _rapeSyncStep2(bd, player, callbacks, segs, idx + 1) }]);
    } else {
        _rapeSyncAfterText(bd, player, callbacks);
    }
}

function _rapeSyncAfterText(bd, player, callbacks) {
    const s = bd._rapeState;
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
        const msg = '你只觉腰眼一阵酸软，再也无力继续。终究是你' + label + '(' + root + ')的根骨，' + (s.ejacLimit === 1 ? '只能泄这一次。' : '最多只能支持' + s.ejacLimit + '次。') + '你喘息片刻，起身整理衣襟。';
        _sexAddMessage(msg, 'narrator');
        return _endRapeScene(bd, player, callbacks);
    }
    callbacks.showChoices([
        { text: '继续', action: () => _renderRapeMain(bd, player, callbacks) },
        { text: '结束暴行', action: () => _endRapeScene(bd, player, callbacks) },
    ]);
}

function _showRapeEjacMenu(bd, player, callbacks) {
    const s = bd._rapeState;
    s.maleArousal = 100;
    _sexUpdatePanel(s);
    callbacks.clearChoices();
    _sexAddMessage('你已到了极限，该释放了……', 'narrator');
    callbacks.showChoices([
        { text: '内射', action: () => _doRapeEjacInternal(bd, player, callbacks) },
        { text: '外射', action: () => _showRapeEjacExternalMenu(bd, player, callbacks) },
    ]);
}

function _doRapeEjacInternal(bd, player, callbacks) {
    callbacks.clearChoices();
    _sexAddMessage(rapeGetCreampieDesc(), 'narrator');
    bd._rapeState.wasInternal = true;
    _afterRapeEjac(bd, player, callbacks);
}

function _showRapeEjacExternalMenu(bd, player, callbacks) {
    callbacks.clearChoices();
    const choices = Object.entries(RAPE_EJAC_LOCATIONS).map(([key, label]) => ({
        text: '射在' + label + '上',
        action: () => _doRapeEjacExternal(bd, player, callbacks, key),
    }));
    callbacks.showChoices(choices);
}

function _doRapeEjacExternal(bd, player, callbacks, loc) {
    callbacks.clearChoices();
    _sexAddMessage(rapeGetEjacDesc(loc), 'narrator');
    _afterRapeEjac(bd, player, callbacks);
}

function _afterRapeEjac(bd, player, callbacks) {
    const s = bd._rapeState;
    s.maleArousal = 70;
    s.femaleArousal = Math.max(0, s.femaleArousal - 30);
    s.ejacCount++;
    s.overClock = 0;
    _sexUpdatePanel(s);
    if (s.ejacCount >= s.ejacLimit) {
        const root = player.attrs.root || 10;
        const label = getRatingLabel(root);
        const msg = '你只觉腰眼一阵酸软，再也无力继续。终究是你' + label + '(' + root + ')的根骨，' + (s.ejacLimit === 1 ? '只能泄这一次。' : '最多只能支持' + s.ejacLimit + '次。') + '你喘息片刻，起身整理衣襟。';
        _sexAddMessage(msg, 'narrator');
        return _endRapeScene(bd, player, callbacks);
    }
    callbacks.showChoices([
        { text: '继续', action: () => _renderRapeMain(bd, player, callbacks) },
        { text: '结束暴行', action: () => _endRapeScene(bd, player, callbacks) },
    ]);
}

function _endRapeScene(bd, player, callbacks) {
    const s = bd._rapeState;
    s.finished = true;

    if (s.posCount) {
        let maxKey = null, maxCount = 0;
        for (const [k, v] of Object.entries(s.posCount)) {
            if (v > maxCount) { maxCount = v; maxKey = k; }
        }
        if (maxKey) bd._favPos = maxKey;
    }

    _sexAddMessage(rapePickEndDesc(), 'narrator');

    if (s.wasInternal) {
        let msg = pickAfterglowDesc(bd);
        if (bd._wasVirgin) {
            msg += ' 那白浊之间搀着缕缕血丝，顺着红肿的花唇缓缓淌下——处子之血与阳精混在一起，在腿根处晕开一片。';
        }
        _sexAddMessage(msg, 'narrator');
    }

    delete bd._rapeState;
    player.reputation = Math.max(0, player.reputation - 10);
    _sexAddMessage('声望 -10（当前 ' + player.reputation + '）', 'danger');
    bd._hadSex = true;
    bd._raped = true;
    bd.favorability = Math.max(0, bd.favorability - 30);
    player.neili -= 20;
    if (callbacks.ensureRedRecord) callbacks.ensureRedRecord(bd);
    delete bd._flirtPoem;
    delete bd._flirtPoemIdx;
    delete bd._flirtIntroShown;
    callbacks.updateStatsBar();
    player._sleptWithBeauty = true;

    callbacks.showChoices([{ text: '离开', action: () => {
        callbacks.clearChoices();
        document.getElementById('log').innerHTML = '';
        if (player.reputation < 0) {
            callbacks.addMessage('你对' + bd.name + '犯下的罪行天理不容……', 'danger');
            return;
        }
        setTimeout(() => callbacks.enterVenue(callbacks.venue), 100);
    } }]);
}

function startRapeScene(bd, player, callbacks) {
    if (callbacks.venue) bd._sexVenue = callbacks.venue.name || callbacks.venue;
    startRapeDetailedScene(bd, player, callbacks);
}

// ═══════════════════════════════════════════
// 强奸 Tier 2 数据（身体开始妥协，挣扎减弱）
// ═══════════════════════════════════════════

const RAPE_FOREPLAY_SCENES_T2 = {
    face: [
        '你捏开她的嘴，将手指伸进她口中搅弄。她已经没有力气咬你了，只是含含糊糊地呜咽着，口水顺着嘴角流下。',
        '你用龟头拍打着她的脸颊，她偏过头去，却没有躲开。白浊的痕迹沾在她脸上，她闭着眼，睫毛不住地颤抖。',
        '你按住她的后脑将肉棒顶进她嘴里，她无力地含住，喉咙里发出断断续续的干呕声，却没有挣扎。',
    ],
    chest: [
        '你的手伸进她的衣领，抓握住她柔软的乳房。她已经不再反抗了，只是咬着嘴唇，身子在你的触碰下轻轻颤抖。',
        '你隔着衣料咬住她的乳头，她痛得吸了口凉气，身子往后缩了缩，却不敢推开你。',
        '你粗鲁地揉捏着{breast_short}，乳肉在你掌中变换着形状。她低着头，眼泪无声地滴落。',
    ],
    waist: [
        '你的手在她腰间用力掐了一把，她的身子猛地一僵，却没有像之前那样挣扎。你感受到她腰侧的肌肤在你的掌下微微颤抖。',
        '你从她两侧狠狠掐住她的腰线，她疼得倒吸一口凉气，却只是咬紧牙关不吭声，双手无力地垂在身侧。',
    ],
    arms: [
        '你抓住她的手腕反拧到她背后，她没有反抗，任你摆布。你把她拽到身前，她低着头，肩膀在轻轻耸动。',
        '你粗暴地将她的手臂按在头顶，另一只手在她身上肆意揉捏。她闭着眼，泪水顺着眼角滑落。',
    ],
    hips: [
        '你的手狠狠拍在她的臀肉上，发出一声脆响。她往前一缩，却没有叫出声来，只是咬着嘴唇闷哼了一声。',
        '你掐住她的臀瓣用力揉捏，那团软肉在你手中被揉得泛红。她没有躲开，只是趴在地上一动不动。',
        '你的肉棒顶在她柔软的臀瓣中间，她感受到那滚烫的触感，浑身紧绷却没有躲开。',
    ],
    legs: [
        '你蛮横地分开她的双腿，她已经没有力气并拢了，任由你摆弄。你抚摸着她的腿根，她浑身轻轻颤抖。',
        '你的手沿着她的大腿内侧滑过，她的腿在你掌下微微颤抖，却没有像之前那样拼命挣扎。',
    ],
    feet: [
        '你握住她的脚踝将她的腿高高抬起，她失去平衡倒在床上，却连挣扎的力气都没有了。',
        '你粗暴地抓起她的脚分开她的双腿，她徒劳地蹬了一下腿，然后便放弃了，任由你摆布。',
    ],
};

const RAPE_FOREPLAY_SCENES_T3 = {
    face: [
        '你捏开她的嘴，她已经麻木了，空洞地张着嘴任你施为。你的手指在她口中搅弄，她也只是发出无意义的呜咽。',
        '你用龟头在她脸上蹭着，她一动不动，眼神空洞地望着某个虚无的点，仿佛灵魂已经离开了身体。',
        '你按住她的头将肉棒顶进她喉咙深处，她干呕了几声，却没有力气挣扎了，只是被动地承受着。',
    ],
    chest: [
        '你抓握住她柔软的乳房，她没有任何反应——既不躲闪也不反抗，只是呆呆地躺着。你的手指拧着她的乳头，她也只是轻轻皱了皱眉。',
        '你咬住她的乳头，她疼得吸了口凉气，却连推你的手都没有抬起来。那处已经满是红痕和牙印。',
    ],
    waist: [
        '你的手在她腰间掐了一把，她的身子只是微微颤了颤，连躲闪的反应都没有了。她躺在地上一动不动，像一具没有灵魂的躯壳。',
        '你掐着她的腰线，她疼得皱了皱眉，却没有吭声，只是偏过头去闭上了眼睛。',
    ],
    arms: [
        '你抓住她的手腕，她毫无反应。你把她拽到身前，她像一具木偶一样任你摆布，连眼神都是空的。',
        '你将她的手臂按在头顶，她一动不动，只有胸口还在起伏证明她活着。',
    ],
    hips: [
        '你拍打她的臀肉，她已经没有反应了，只是趴在地上任你施为。你掐着那团软肉揉捏，她也只是偶尔发出一声细微的呜咽。',
        '你的肉棒顶在她臀缝间，她就那么安静地趴着，既不躲闪也不迎合。',
    ],
    legs: [
        '你分开她的双腿，她的腿软软地任你摆布。那处已经一片狼藉，沾满了之前的痕迹。她偏过头去，眼神空洞。',
        '你的手沿着她的大腿内侧滑过，她没有任何反应，只是呆呆地望着屋顶。',
    ],
    feet: [
        '你握住她的脚踝分开她的双腿，她的腿毫无反抗地任由你摆布，像两根没有生命的木棍。',
        '你抓起她的脚，她一动不动，连脚趾都没有蜷缩一下。她已经彻底放弃了所有的抵抗。',
    ],
};

const RAPE_SERVICE_DESC_T2 = {
    blowjob: [
        '你掐住她的下巴迫她张开嘴，肉棒猛地捅了进去。她呜咽着，却没有推开你，泪水无声地从眼角滑落。',
        '你按住她的后脑，将她的头死死按在胯下。她含着你的肉棒，喉咙里发出含混的呜咽，涎水顺着嘴角流下。',
        '你揪着她的头发，在她嘴里抽插着。她已经不像最初那样拼命挣扎了，只是失神地含着你的阳物，偶尔干呕一下。',
        '你掰开她的嘴，把龟头顶进她的喉咙。她拍打着你的大腿，但挣扎的力气已经小了很多。',
    ],
    footjob: [
        '你抓起她的脚踩在你的肉棒上，她条件反射地缩了一下，却没有像之前那样拼命挣扎，任由你握着她的脚套弄。',
        '你强迫她用双脚夹住你的肉棒，她徒劳地挣扎了一下便放弃了，闭着眼任你摆布。',
    ],
    titjob: [
        '你将她按倒，用她的双乳夹住你的肉棒。她已经不再反抗了，只是屈辱地别过头，任由你摆布。',
        '你抓着她的头发让她跪好，把那对乳房挤在一起裹住你的肉棒。她咬着嘴唇，却没有推开你。',
        '她被迫跪在你身前，双乳在你手中被挤作一团，夹着你的肉棒上下滑动。她的身子在发抖，却没有挣扎。',
    ],
    breast: [
        '你一把扯开她的衣襟，双手粗暴地揉捏着她的乳房。她疼得倒吸冷气，却没有推开你，只是咬着嘴唇不吭声。',
        '你低头咬住她的乳头，她痛得弓起身子，却只是双手抓着你的肩膀，不敢用力推你。',
        '你含住她的乳尖用力吸吮，另一只手在她乳肉上留下道道红痕。她咬着嘴唇呜咽着，却没有反抗。',
    ],
    garden: [
        '你的手粗暴地探入她的腿间，她浑身一颤，却没有像之前那样夹紧双腿。',
        '你强行拨开她的花瓣，手指毫不怜惜地捅了进去。她发出一声痛苦的闷哼，却没有推开你的手。',
        '你的手指在她体内粗暴地抽送着，她咬着手背，眼泪簌簌地往下掉，却没有挣扎。',
        '你俯下身，舌尖粗暴地探入她的花径。她拼命扭动腰肢想要躲开，却被你死死按住，渐渐便不再挣扎了。',
    ],
    butt: [
        '你粗暴地将她翻转过去，双手狠狠抓住她的臀瓣用力揉捏。她疼得吸了口凉气，却已经不像最初那样挣扎了。',
        '你一巴掌重重拍在她的屁股上，雪白的臀瓣上顿时浮起一道鲜红的掌印。她呜咽着，却没有躲开。',
        '你将她按在地上，强迫她撅起臀部。你掐着她的臀瓣揉捏，她趴在地上一动不动，只有肩膀在无声地耸动。',
        '你抓住她的臀肉用力分开，那隐秘的股缝暴露在你眼前。她只是趴着不动，任由你摆布。',
    ],
};

const RAPE_SERVICE_DESC_T3 = {
    blowjob: [
        '你掐住她的下巴迫她张开嘴，她已经麻木了，空洞地张着嘴。你的肉棒在她嘴里进出，她也只是发出含混的呜咽，连挣扎的力气都没有了。',
        '你按住她的后脑，她含着你的肉棒一动不动，眼神空洞地望着前方。涎水顺着嘴角流了满襟，她却连擦都不擦。',
        '你揪着她的头发在她嘴里抽插，她已经没有反应了。你松开手，她含着你的肉棒也不吐出来，就那么呆呆地跪着。',
        '她跪在地上张着嘴，你扶着肉棒在她嘴里进出。她的眼神涣散，偶尔被顶到喉咙深处时发出一声干呕，却没有躲开。',
    ],
    footjob: [
        '你抓起她的脚，她没有任何反应。你握着她的脚套弄着自己的肉棒，她就那么躺着，像一具没有灵魂的躯壳。',
    ],
    titjob: [
        '你将她按倒，用她的双乳夹住你的肉棒。她一动不动地躺着，任由你摆布，连别过头的力气都没有了。',
        '她跪在地上，双乳在你手中被挤作一团。她没有任何反应，眼神空洞地望着前方，只有在你用力时轻轻哼一声。',
    ],
    breast: [
        '你揉捏着她的乳房，她没有任何反应。那团软肉上已经全是红痕和牙印，你捏着那红肿的乳头拧了一把，她也只是皱了皱眉。',
        '你咬住她的乳头，她疼得轻轻吸了口气，却没有推开你，甚至没有抬手。',
    ],
    garden: [
        '你的手探入她的腿间，她没有任何反应。那处已经一片狼藉，你毫不怜惜地捅了进去，她也只是轻轻颤了颤。',
        '你的手指在她体内抽送着，她躺在地上一动不动，只有偶尔被顶到某处时才轻轻哼一声。她已经不再流泪了，只是空洞地望着屋顶。',
    ],
    butt: [
        '你将她翻转过去，她乖乖地趴着。你掐着她的臀瓣揉捏，她没有任何反应。你掰开那臀缝，那处沾满了之前的痕迹。',
        '你一巴掌拍在她屁股上，她也只是轻轻抖了一下。那白嫩的臀瓣上全是红痕，可她连躲都不躲了。',
    ],
};

const RAPE_SEX_POSITIONS_T2 = {
    normal: {
        name: '正常位',
        desc: [
            '{name}的{hl}身子被你压在地上，你分开她{ph}的双腿。那{pp_desc}、{pp_color}的{pp_name}暴露在你眼前，{pp_adj}入口微微翕动着——她的身体已经背叛了她，泌出了湿润的光泽。你挺起肉棒对准那入口一插到底。她闷哼一声，身子绷紧了一瞬又软了下去，双手无力地抓着地面。',
            '你掐着她的脖子将她按倒，她不再像之前那样拼命挣扎了。你低头看见她那{pp_adj}{pp_name}，{ph}的阴毛上沾着亮晶晶的液体——她的身体已经湿润了。你握住肉棒对准猛地挺入，她浑身一僵，指甲掐进你的手臂，却没有推开你。',
            '你把她双腿扛在肩上，那{pp_desc}、{pp_color}的{pp_name}完全呈现在你眼前。她已经不偏过头了，只是闭着眼，那{ph}的穴口一张一合地翕动着。你挺腰将肉棒整根没入，她「呃」地一声哽住，整个身子都在发抖，却没有挣扎。',
        ], mA: 10, fA: 8,
    },
    cowgirl: {
        name: '女上位',
        desc: [
            '你强迫{name}跨坐在你身上，命令道：「自己坐下去。」她含着泪犹豫了一下，还是颤抖着扶住你的肉棒，那{pp_color}的{pp_name}对准龟头，一闭眼坐了下去——「唔——」她发出一声压抑的呜咽，却没有反抗。',
            '你躺在地上，{name}被迫骑在你胯间。你扶着她的腰迫使她上下起伏，{breast}随着动作晃动。她已经不像之前那样抗拒了，只是机械地动着腰肢，{pp_name}吞吐着你的肉棒，发出噗嗤的水声。',
            '你掐着她的胯骨往下按，{pp_adj}{pp_name}将你的肉棒一点一点吞了进去。她咬着嘴唇没有反抗，只是仰着头，喉间发出破碎的呻吟。你摁着她的腰强迫她上下套弄着。',
        ], mA: 10, fA: 8,
    },
    doggy: {
        name: '后入式',
        desc: [
            '你一把将{name}翻过去，让她跪趴在地上。她顺从地撅起了{butt}，那{pp_adj}{pp_name}从{ph}股缝间若隐若现。你一巴掌拍在她圆润的臀瓣上，她只是颤了颤，没有躲。你挺腰将龟头送入{pp_name}从后面一插到底。',
            '她跪趴着，{butt}被你撞得啪啪作响，{name}咬着枕巾呜呜地哭，却没有像之前那样挣扎求饶了。你揪着她{ph}的阴毛往里顶，每一下都撞得她往前一耸。',
            '你一手按着她的后颈将她压在地上，从后面狠狠插进她{pp_adj}{pp_name}。她惊呼一声，却没有挣扎。{breast_short}被地面挤压着。你俯下身，冷冷道：「这不就乖了？」',
        ], mA: 10, fA: 8,
    },
    spoon: {
        name: '侧入式',
        desc: [
            '你从侧面贴上去，抬起{name}的一条腿。{hl}的身子侧卧在你怀中，{pp_adj}{pp_name}从下方暴露出来。她咬着嘴唇一声不吭，却没有推开你。你扶着肉棒对准缓缓插了进去，她轻轻颤了颤。',
            '你们侧躺着，你从身后拥着她，一手揉捏着她的乳房，下身在她{pp_name}里缓缓抽送。{name}在你怀里轻轻发抖，却没有挣扎。她在你耳边喘息着，声音带着哭腔：「好……好了没有……」',
        ], mA: 10, fA: 8,
    },
    standing: {
        name: '立位',
        desc: [
            '你将她抵在树干上，抬起她一条腿。{name}的{hl}身子被你压着，{ph}的小穴被迫大张。你挺身插了进去，她呜咽着，却没有像之前那样拼命挣扎了。',
            '你让她弯下腰扶着石桌，从后面抬起她一条腿。{pp_adj}{pp_name}将你咬得死紧。你每抽动一下她便发出一声压抑的闷哼，{butt}被你撞得微微泛红。',
        ], mA: 10, fA: 8,
    },
};

const RAPE_SEX_POSITIONS_T3 = {
    normal: {
        name: '正常位',
        desc: [
            '{name}躺在地上一动不动，{ph}的双腿无力地分着。那{pp_desc}、{pp_color}的{pp_name}红肿着，白浊和血丝混在一起糊在穴口。你压上去挺入，她只是无力地哼了一声，连眼睛都没有睁开。',
            '你掐着她的脖子在她体内抽送，她已经没有任何反应了，像一具没有灵魂的躯壳。{pp_adj}{pp_name}已经合不拢了，嫩肉向外翻着。她躺在地上一动不动，只有被顶到深处时喉咙里发出一声细微的呜咽。',
        ], mA: 10, fA: 10,
    },
    cowgirl: {
        name: '女上位',
        desc: [
            '你强迫{name}跨坐在你身上，她已经没有力气反抗了，软软地骑在你腰间。你扶着她的腰上下起伏，她随着你的动作前后晃动，口中发出无意识的呻吟。{breast_short}上全是红痕。',
            '她骑在你身上却已经动不了了，只是呆呆地坐着。{pp_name}还含着你的阳物，你掐着她的腰自己用力向上顶。她被你顶得一颠一颠的，却没有叫出声来。',
        ], mA: 10, fA: 10,
    },
    doggy: {
        name: '后入式',
        desc: [
            '{name}趴在地上，{butt}微微撅着却没有力气抬高了。那{pp_desc}的{pp_name}红肿着，白浊顺着大腿往下淌。你从后面进入时她只是无力地哼了一声，{butt}在你的撞击下被动地晃动着。她趴在地上一动不动，脸埋在臂弯里。',
            '你从后面掐着她的腰，她已经跪不住了，上半身完全瘫在地上。每一下都让她发出一声细微的呜咽。{butt_short}上全是巴掌印子，可她已经连躲的力气都没有了。',
        ], mA: 10, fA: 10,
    },
    spoon: {
        name: '侧入式',
        desc: [
            '你从侧面贴上去，她蜷缩着一动不动。你抬起她一条腿，她没有任何反应。你进入时她也只是轻轻颤了颤，便再没有动静了。她闭着眼，任由你在她体内进出。',
        ], mA: 10, fA: 10,
    },
    standing: {
        name: '立位',
        desc: [
            '你将她按在墙上，她已经站不住了，全靠你抵着才不会滑倒。你抬起她一条腿进入，她软软地靠在你身上，没有任何反应。你每一下都顶得很深，她也只是偶尔发出一声细微的呻吟。',
        ], mA: 10, fA: 10,
    },
};
