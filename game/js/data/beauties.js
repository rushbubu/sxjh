const SURNAMES = ['李','王','张','柳','花','苏','林','白','云','夏','秋','冬','梅','兰','竹','桃','莲','荷','月','水','谢','叶','沈','秦','顾','唐','萧'];
const GIVEN_NAMES = ['娘','儿','姐','姑','莲','荷','梅','兰','竹','菊','桃','杏','薇','蕾','翠','香','秀','英','瑶','雪','晴','霜','露','烟','霞','蝶','燕','莺','凤','凰','娥','婵','姬','妃','媛'];

const FACE_DESCS = [
    '面如芙蓉，眉似远山，一双杏眼含情脉脉。',
    '瓜子脸，柳叶眉，肤若凝脂，唇不点而朱。',
    '鹅蛋脸型，丹凤眼微微上挑，自带三分媚意。',
    '圆润的鹅蛋脸，梨涡浅笑，说不出的甜美可人。',
    '五官精致如画，眉宇间透着一股英气。',
    '肤白胜雪，眉眼弯弯，一笑起来眼如新月。',
    '面容清秀，虽不是倾国倾城，却有一种说不出的耐看。',
    '桃腮杏眼，鼻梁挺直，整张脸像是精雕细琢过一般。',
    '面若银盘，眼如水杏，端庄中带着几分艳丽。',
    '眉如翠羽，肌如白雪，腰如束素，齿如含贝。',
];

const BODY_DESCS = [
    '身段婀娜，曲线玲珑，举手投足间风情万种。',
    '体态丰腴，凹凸有致，该瘦的地方瘦，该有肉的地方有肉。',
    '身姿修长，腰肢纤细如柳，走起路来步步生莲。',
    '肩若削成，腰如约素，身材比例恰到好处。',
    '身形娇小玲珑，却前凸后翘，别有一番韵味。',
    '高挑匀称，一双长腿尤其引人注目。',
    '体态丰满圆润，肌肤细腻光滑，如羊脂美玉。',
    '骨肉匀停，既不过分丰满也不显单薄，恰到好处。',
];

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

const BEAUTY_TIERS = [
    { min: 0, key: 'white', label: '凡品', color: '#cccccc' },
    { min: 21, key: 'green', label: '良品', color: '#66cc66' },
    { min: 41, key: 'blue', label: '精品', color: '#6699ff' },
    { min: 56, key: 'purple', label: '上品', color: '#cc66ff' },
    { min: 71, key: 'red', label: '极品', color: '#ff6666' },
    { min: 86, key: 'orange', label: '绝品', color: '#ffaa33' },
    { min: 96, key: 'black', label: '神品', color: '#ffd700' },
];

function getBeautyTier(score) {
    for (let i = BEAUTY_TIERS.length - 1; i >= 0; i--) {
        if (score >= BEAUTY_TIERS[i].min) return BEAUTY_TIERS[i];
    }
    return BEAUTY_TIERS[0];
}

function computeBeautyScore(beauty) {
    const faceIdx = FACE_DESCS.indexOf(beauty.faceDesc);
    const bodyIdx = BODY_DESCS.indexOf(beauty.bodyDesc);
    const faceScore = Math.max(0, faceIdx) / (FACE_DESCS.length - 1) * 30;
    const bodyScore = Math.max(0, bodyIdx) / (BODY_DESCS.length - 1) * 20;
    const idealWaist = 24;
    const waistDiff = Math.abs(beauty.waist - idealWaist);
    const measScore = Math.max(0, 30 - waistDiff * 3);
    const ageScore = beauty.age <= 20 ? 20 : beauty.age <= 25 ? 15 : beauty.age <= 30 ? 10 : 5;
    return Math.min(100, Math.round(faceScore + bodyScore + measScore + ageScore));
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
    } else { // widow
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

function generateBeauties(locationId, type) {
    const count = type === 'village' ? 1 : type === 'small_city' ? 5 : 10;
    return Array.from({ length: count }, (_, i) => {
        const name = pick(SURNAMES) + pick(GIVEN_NAMES);
        const r = Math.random();
        let ms, age;
        if (r < 0.35) { ms = 'unmarried'; age = rand(16, 21); }
        else if (r < 0.55) { ms = 'married'; age = rand(22, 35); }
        else if (r < 0.80) { ms = 'married_child'; age = rand(22, 35); }
        else { ms = 'widow'; age = rand(22, 40); }
        const faceDesc = pick(FACE_DESCS);
        const bodyDesc = pick(BODY_DESCS);
        const b = {
            id: `beauty_${locationId}_${i}`,
            name, age,
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
