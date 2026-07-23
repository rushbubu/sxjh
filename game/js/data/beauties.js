const SURNAMES = ['李','王','张','柳','花','苏','林','白','云','夏','秋','冬','梅','兰','竹','桃','莲','荷','月','水','谢','叶','沈','秦','顾','唐','萧'];
const GIVEN_NAMES = ['娘','儿','姐','姑','莲','荷','梅','兰','竹','菊','桃','杏','薇','蕾','翠','香','秀','英','瑶','雪','晴','霜','露','烟','霞','蝶','燕','莺','凤','凰','娥','婵','姬','妃','媛'];
const GIVEN_NAMES_2CHAR = [
    '师师','小小','如是','想容','诗音','若曦','紫嫣','婉清','语嫣','梦琪',
    '清漪','浣纱','拂柳','映雪','含烟','如霜','画眉','知秋','怜月','惜花',
    '采莲','听荷','问柳','寻梅','踏雪','吟霜','弄影','飞燕','惊鸿','倾城',
    '寄萍','浣青','芷柔','若兰','清荷','晓蕾','冰月','寒烟','素心','凝霜',
    '相思','莫愁','无双','如梦','依依','楚楚','纤纤','翩翩','冉冉','泠泠',
];

const FACE_TIERS = {
    low: [
        '面容清秀，虽不是倾国倾城，却有一种说不出的耐看。',
        '五官清秀，眉眼温婉，看着让人心生亲近。',
    ],
    mid: [
        '瓜子脸，柳叶眉，肤若凝脂，唇不点而朱。',
        '鹅蛋脸型，丹凤眼微微上挑，自带三分媚意。',
        '圆润的鹅蛋脸，梨涡浅笑，说不出的甜美可人。',
        '五官端正，眉宇间透着一股英气，别有一番韵味。',
    ],
    high: [
        '面如芙蓉，眉似远山，一双杏眼含情脉脉。',
        '肤白胜雪，眉眼弯弯，一笑起来眼如新月，令人心醉。',
        '桃腮杏眼，鼻梁挺直，整张脸宛如画中仙子。',
    ],
    top: [
        '眉如翠羽，肌如白雪，齿如含贝，倾国倾城之貌。',
        '面若银盘，眼如水杏，端庄中带着摄人心魄的艳丽。',
        '五官精雕细琢，肤若凝脂，双目流转间风华绝代。',
    ],
};

const BODY_DESCS_UNMARRIED = {
    low: ['身段匀称，亭亭玉立。', '体态轻盈，少女身姿婀娜。'],
    mid: ['身姿修长，腰肢纤细如柳，步步生莲。', '体态匀称，曲线初显，别有一番青春韵味。'],
    high: ['肩若削成，腰如约素，身材清秀而窈窕。', '高挑匀称，双腿修长，身段柔美动人。'],
    top: ['身段婀娜，曲线玲珑，举手投足间风情初绽。', '体态纤浓得宜，增一分则肥减一分则瘦。'],
};

const BODY_DESCS_MARRIED = {
    low: ['体态匀称，身姿端正，举止间落落大方。', '身段适中，不胖不瘦，有着成熟的风韵。'],
    mid: ['体态丰腴，腰肢柔韧，曲线凹凸有致。', '身姿圆润，肌肤光洁，少妇风韵迷人。'],
    high: ['身姿丰盈，曲线优美，该瘦的地方瘦该有的地方有。', '体态饱满，腰如约素，成熟的风情令人心动。'],
    top: ['身段丰腴有致，凹凸玲珑，举手投足间风情万种。', '骨肉匀停，丰而不腻，恰到好处的少妇身段。'],
};

const BODY_DESCS_WIDOW = {
    low: ['身段清减，弱质纤纤。', '体态瘦削，衣带渐宽。'],
    mid: ['身姿清瘦，腰肢纤细，带着几分楚楚之姿。', '体态纤弱，曲线柔和，让人心生怜惜。'],
    high: ['身段苗条，曲线若隐若现，清冷中带着韵味。', '腰肢纤细，身姿优雅，素衣下别有风致。'],
    top: ['身段窈窕，虽清减却不失曲线，别有清冷风韵。', '体态纤细而匀称，素衣难掩动人曲线。'],
};

const BODY_DESCS_MCHILD = {
    low: ['体态丰盈，身姿圆润，带着为人妇的沉稳。', '身段匀称饱满，举止间有母性的温柔。'],
    mid: ['身姿丰满，腰肢虽不如少女纤细，却自有一番韵味。', '体态圆润，曲线柔和，温婉可亲。'],
    high: ['身段丰腴，腰肢依然柔韧，风韵犹胜少女时。', '体态饱满有致，丰盈中不失曲线，温柔迷人。'],
    top: ['体态丰腴匀停，凹凸有致，成熟的风韵动人心魄。', '身段圆润而不失线条，举手投足间风情万种。'],
};

const BODY_MAP = {
    unmarried: BODY_DESCS_UNMARRIED,
    married: BODY_DESCS_MARRIED,
    widow: BODY_DESCS_WIDOW,
    married_child: BODY_DESCS_MCHILD,
};

const CLOTHING_VILLAGE = [
    '一身粗布荆钗，却掩不住天生丽质。',
    '穿着朴素的碎花布衣，腰间系着蓝布围裙。',
    '青布衣衫，头上只簪了一朵野花，却比任何珠翠都动人。',
];

const CLOTHING_CITY = [
    '一袭水蓝色长裙，腰间束着淡粉色腰带。',
    '身着浅绿色罗裙，外罩轻纱，发髻上插着银簪。',
    '藕荷色短衫配月白色长裙，手中拿着一把团扇。',
    '淡紫色纱衣随风轻扬，隐约可见窈窕身姿。',
];

const CLOTHING_BIG = [
    '一身绯红色织锦长裙，外披金色纱衣，贵气逼人。',
    '白色轻纱长裙，腰系碧玉带，宛如仙子下凡。',
    '云锦裁成的宫装长裙，绣着大朵的牡丹，华美异常。',
    '湖蓝色绸缎长裙，外罩蝉翼纱，行动间如烟似雾。',
    '鹅黄色纱裙层层叠叠，走动时裙摆翻飞如花朵绽放。',
];

const CLOTHING_WIDOW = [
    '一身素白孝服尚未脱去，却更衬得肤白如雪。',
    '青布包头，鬓边簪着一朵白花，神色淡然。',
    '深色粗布衣裙，不施粉黛，眉宇间却有一股说不出的风情。',
    '灰蓝色旧衣浆洗得发白，袖口微微破损，更显楚楚可怜。',
];

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function pick(arr) { return arr[rand(0, arr.length - 1)]; }

function generateRequirements(type) {
    const reqs = [];
    let pool;
    if (type === 'village') {
        pool = ['appearance', 'appearance', 'height', 'height'];
    } else if (type === 'small_city') {
        pool = ['reputation', 'appearance', 'height'];
    } else {
        pool = ['reputation', 'reputation', 'reputation', 'appearance', 'height'];
    }
    const num = rand(1, 3);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, num);

    if (type === 'village') {
        for (const r of shuffled) {
            if (r === 'reputation') reqs.push({ type: 'reputation', min: rand(2, 5) });
            else if (r === 'appearance') reqs.push({ type: 'appearance', min: rand(10, 25) });
            else if (r === 'height') reqs.push({ type: 'height', min: rand(160, 175) });
        }
    } else if (type === 'small_city') {
        for (const r of shuffled) {
            if (r === 'reputation') reqs.push({ type: 'reputation', min: rand(4, 8) });
            else if (r === 'appearance') reqs.push({ type: 'appearance', min: rand(20, 40) });
            else if (r === 'height') reqs.push({ type: 'height', min: rand(165, 175) });
        }
    } else {
        for (const r of shuffled) {
            if (r === 'reputation') reqs.push({ type: 'reputation', min: rand(7, 12) });
            else if (r === 'appearance') reqs.push({ type: 'appearance', min: rand(35, 55) });
            else if (r === 'height') reqs.push({ type: 'height', min: rand(170, 178) });
        }
    }
    return reqs;
}

function getScoreTierKey(score) {
    if (score >= 93) return 'top';
    if (score >= 83) return 'high';
    if (score >= 75) return 'mid';
    return 'low';
}

function getFaceDesc(score) {
    return pick(FACE_TIERS[getScoreTierKey(score)]);
}

function getBodyDesc(score, maritalStatus) {
    const arr = BODY_MAP[maritalStatus] || BODY_DESCS_UNMARRIED;
    return pick(arr[getScoreTierKey(score)]);
}

const BEAUTY_TIERS = [
    { min: 0,   key: 'white',  label: '凡品', color: '#cccccc' },
    { min: 20,  key: 'green',  label: '良品', color: '#66cc66' },
    { min: 40,  key: 'blue',   label: '精品', color: '#6699ff' },
    { min: 55,  key: 'purple', label: '上品', color: '#cc66ff' },
    { min: 65,  key: 'red',    label: '极品', color: '#ff6666' },
    { min: 75,  key: 'orange', label: '绝品', color: '#ffaa33' },
    { min: 85,  key: 'black',  label: '神品', color: '#ffd700' },
];

function getBeautyTier(score) {
    for (let i = BEAUTY_TIERS.length - 1; i >= 0; i--) {
        if (score >= BEAUTY_TIERS[i].min) return BEAUTY_TIERS[i];
    }
    return BEAUTY_TIERS[0];
}

function generateBeautyName(type, usedNames) {
    let name;
    do {
        if (type === 'village') {
            name = pick(SURNAMES) + pick(GIVEN_NAMES);
        } else {
            const threeCharChance = type === 'big_city' ? 0.9 : 0.7;
            if (Math.random() < threeCharChance) {
                name = pick(SURNAMES) + pick(GIVEN_NAMES_2CHAR);
            } else {
                name = pick(SURNAMES) + pick(GIVEN_NAMES);
            }
        }
    } while (usedNames && usedNames.has(name));
    if (usedNames) usedNames.add(name);
    return name;
}

function generateBeautyScores(type) {
    let face, body;
    if (type === 'village') {
        face = rand(70, 82); body = rand(70, 82);
    } else if (type === 'small_city') {
        face = rand(72, 90); body = rand(72, 90);
    } else {
        face = rand(75, 98); body = rand(75, 98);
    }
    return { face, body };
}

function computeBeautyScore(beauty) {
    return Math.round((beauty.faceScore + beauty.bodyScore) / 2);
}

function computeChastity(beauty) {
    const score = beauty.beautyScore;
    const s = beauty.inner;
    if (s === 'unmarried') {
        return Math.min(100, 85 + Math.floor((score - 50) * 0.3));
    } else if (s === 'married') {
        return Math.min(85, 50 + Math.floor(score * 0.3));
    } else if (s === 'married_child') {
        return Math.min(80, 40 + Math.floor(score * 0.3));
    } else {
        return Math.min(50, 15 + Math.floor(score * 0.2));
    }
}

function pickRegionalGift(locationId) {
    const region = getRegion(locationId);
    const locs = getAllLocations().filter(l => getRegion(l.id) === region);
    const allItems = locs.flatMap(l => {
        const venues = l.venues || [];
        return venues.flatMap(v => v.npcs ? v.npcs.flatMap(n => n.items || []) : []);
    });
    const giftPool = allItems.filter(it => it && it.value >= 5 && it.value <= 100);
    if (giftPool.length === 0) return null;
    return giftPool[Math.floor(Math.random() * giftPool.length)];
}

function generateBeauties(locationId, type, usedNames) {
    const count = type === 'village' ? rand(1, 2) : type === 'small_city' ? 5 : 10;
    let widowCount = 0;
    let villageStatusPool = ['unmarried','married','married_child','widow'];
    if (count === 2) villageStatusPool = villageStatusPool.sort(() => Math.random() - 0.5).slice(0, 2);
    return Array.from({ length: count }, (_, i) => {
        const name = generateBeautyName(type, usedNames);
        let ms, age;
        if (type === 'village' && count === 2) {
            ms = villageStatusPool[i];
            age = ms === 'unmarried' ? rand(16, 21) : rand(22, 35);
        } else {
            const r = Math.random();
            const rollWidow = () => {
                if (widowCount < 1) { widowCount++; return 'widow'; }
                const rr = Math.random();
                if (rr < 0.44) return 'unmarried';
                if (rr < 0.69) return 'married';
                return 'married_child';
            };
            if (r < 0.35) { ms = 'unmarried'; age = rand(16, 21); }
            else if (r < 0.55) { ms = 'married'; age = rand(22, 35); }
            else if (r < 0.80) { ms = 'married_child'; age = rand(22, 35); }
            else { ms = rollWidow(); age = ms === 'unmarried' ? rand(16, 21) : rand(22, 35); }
        }
        const scores = generateBeautyScores(type);
        const faceScore = scores.face;
        const bodyScore = scores.body;
        const faceDesc = getFaceDesc(faceScore);
        const bodyDesc = getBodyDesc(bodyScore, ms);
        const b = {
            id: `beauty_${locationId}_${i}`,
            name, age, faceScore, bodyScore,
            surface: ms, inner: ms,
            height: rand(155, type === 'big_city' ? 175 : 170),
            bust: rand(32, 38), waist: rand(22, 28), hips: rand(32, 38),
            faceDesc, bodyDesc,
            clothing: ms === 'widow' ? pick(CLOTHING_WIDOW) : pick(type === 'big_city' ? CLOTHING_BIG : type === 'small_city' ? CLOTHING_CITY : CLOTHING_VILLAGE),
            favorability: 0,
            requirements: generateRequirements(type),
            chatLevel: 0,
            _revealed: { face: true },
            flirtCount: 0, flirtDay: 0,
            _hadSex: false,
            _wantedGift: null,
        };
        b.beautyScore = computeBeautyScore(b);
        const tier = getBeautyTier(b.beautyScore);
        b.beautyTier = tier.key;
        b.beautyTierLabel = tier.label;
        b.beautyTierColor = tier.color;
        b.chastity = computeChastity(b);
        return b;
    });
}

function computeFavorability(player, beauty) {
    const reqs = beauty.requirements;
    if (!reqs || reqs.length === 0) return 100;
    const playerHeight = 155 + Math.min(35, Math.floor(player.attrs.root * 0.35));
    let allMet = true;
    let bonus = 0;
    for (const r of reqs) {
        let val, diff;
        if (r.type === 'reputation') { val = player.reputation; diff = val - r.min; }
        else if (r.type === 'appearance') { val = player.attrs.appearance; diff = val - r.min; }
        else if (r.type === 'height') { val = playerHeight; diff = val - r.min; }
        if (diff < 0) { allMet = false; break; }
        const maxBonusPerReq = Math.floor(20 / reqs.length);
        bonus += Math.min(maxBonusPerReq, Math.floor(diff * 2));
    }
    return allMet ? Math.min(100, 80 + bonus) : beauty.favorability;
}

function generateProstitutes(locationId, type, usedNames) {
    const count = 4;
    return Array.from({ length: count }, (_, i) => {
        const name = generateBeautyName(type, usedNames);
        const scores = generateBeautyScores(type);
        const faceScore = scores.face;
        const bodyScore = scores.body;
        const faceDesc = getFaceDesc(faceScore);
        const bodyDesc = getBodyDesc(bodyScore, 'unmarried');
        const p = {
            id: `prostitute_${locationId}_${i}`,
            name, age: rand(18, 28), faceScore, bodyScore,
            surface: 'unmarried', inner: 'unmarried',
            height: rand(158, type === 'big_city' ? 172 : 168),
            bust: rand(33, 38), waist: rand(22, 27), hips: rand(33, 38),
            faceDesc, bodyDesc,
            clothing: pick(type === 'big_city' ? CLOTHING_BIG : CLOTHING_CITY),
            favorability: 30,
            _hadSex: false,
            chatLevel: 0,
            _chattedToday: false,
            _revealed: { face: true, body: true, clothing: true, age: true, height: true, measurements: true, marital: true },
        };
        p.beautyScore = computeBeautyScore(p);
        p.price = Math.max(10, Math.min(100, Math.round((p.beautyScore - 68) * 3 / 10) * 10));
        const tier = getBeautyTier(p.beautyScore);
        p.beautyTier = tier.key;
        p.beautyTierLabel = tier.label;
        p.beautyTierColor = tier.color;
        p.chastity = 0;
        return p;
    });
}
