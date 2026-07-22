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

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function pick(arr) { return arr[rand(0, arr.length - 1)]; }

function generateRequirements(type) {
    const reqs = [];
    const pool = ['reputation', 'appearance', 'height'];
    const num = rand(1, 3);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, num);

    if (type === 'village') {
        for (const r of shuffled) {
            if (r === 'reputation') reqs.push({ type: 'reputation', min: rand(2, 5) });
            else if (r === 'appearance') reqs.push({ type: 'appearance', min: rand(10, 25) });
            else if (r === 'height') reqs.push({ type: 'height', min: rand(160, 175), max: rand(180, 190) });
        }
    } else if (type === 'small_city') {
        for (const r of shuffled) {
            if (r === 'reputation') reqs.push({ type: 'reputation', min: rand(4, 8) });
            else if (r === 'appearance') reqs.push({ type: 'appearance', min: rand(20, 40) });
            else if (r === 'height') reqs.push({ type: 'height', min: rand(165, 175), max: rand(180, 190) });
        }
    } else {
        for (const r of shuffled) {
            if (r === 'reputation') reqs.push({ type: 'reputation', min: rand(7, 12) });
            else if (r === 'appearance') reqs.push({ type: 'appearance', min: rand(35, 55) });
            else if (r === 'height') reqs.push({ type: 'height', min: rand(170, 178), max: rand(182, 190) });
        }
    }
    return reqs;
}

function generateBeauties(locationId, type) {
    const count = type === 'village' ? 1 : type === 'small_city' ? 5 : 10;
    return Array.from({ length: count }, (_, i) => {
        const name = pick(SURNAMES) + pick(GIVEN_NAMES);
        const age = rand(18, type === 'big_city' ? 28 : 25);
        const married = type === 'village' ? Math.random() < 0.4 : Math.random() < 0.3;
        return {
            id: `beauty_${locationId}_${i}`,
            name,
            age,
            height: rand(155, type === 'big_city' ? 175 : 170),
            bust: rand(32, 38),
            waist: rand(22, 28),
            hips: rand(32, 38),
            married,
            hasChildren: married ? Math.random() < 0.4 : false,
            faceDesc: pick(FACE_DESCS),
            bodyDesc: pick(BODY_DESCS),
            clothing: pick(type === 'big_city' ? CLOTHING_BIG : type === 'small_city' ? CLOTHING_CITY : CLOTHING_VILLAGE),
            favorability: 0,
            requirements: generateRequirements(type),
            known: { name: false, age: false, family: false },
        };
    });
}
