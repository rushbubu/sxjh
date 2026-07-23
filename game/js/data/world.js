const ECONOMY_LEVELS = [
    { key: 'destitute', label: '赤贫' },
    { key: 'poor', label: '贫困' },
    { key: 'subsistence', label: '温饱' },
    { key: 'moderate', label: '小康' },
    { key: 'wealthy', label: '富裕' },
    { key: 'very_wealthy', label: '极富' },
    { key: 'lavish', label: '奢靡' },
];

const LOCATION_TYPES = {
    big_city: { label: '大城', color: '#e0a040' },
    small_city: { label: '小城', color: '#80a0c0' },
    village: { label: '村庄', color: '#608060' },
};

function v(name, npcName, npcDesc, itemIds, civilian = true, combatPower = 0, martialArt = null) {
    return {
        name,
        npcs: [{ npcName, npcDesc, civilian, combatPower, items: itemIds.map(id => getItem(id)).filter(Boolean), martialArt }],
    };
}

/* ═══ 场所定义 ═══
   每个地点的 venues 数组包含该处的所有场所。
   玩家"外出"时看到的就是这些场所列表。
*/

const WORLD = {
    big_cities: [
        {
            id: 'jingcheng', name: '京城',
            desc: '大燕王朝的都城，天子脚下。街道宽阔，商铺林立，往来的无不是达官显贵、豪商巨贾。',
            population: 2100000, area: 85, areaUnit: 'km²', economy: 'lavish',
            factions: [],
            venues: [
                v('醉仙楼', '莫三千', '笑眯眯的掌柜，一手"醉拳"出神入化，柜台下藏着一坛坛好酒。', ['wine_daughter', 'dragon_tea', 'wine_bamboo', 'nine_dragon_cup'], false, 60),
                v('兵器铺', '公孙冶', '须发皆白的老铁匠，打造的兵器名动江湖。', ['blue_sword', 'gold_silk_armor', 'steel_blade', 'dagger'], false, 65),
                v('珠宝行', '周宝山', '手指上戴着五个翡翠扳指的大商人，店内珠光宝气。', ['necklace_gold', 'jade_ring', 'bangle_jade', 'ring_silver']),
                v('绸缎庄', '赵锦华', '衣饰华贵的绸缎商人，店里的云锦是贡品级别。', ['brocade_robe', 'silk_robe', 'silk_scarf']),
                v('怡红院', '柳妈妈', '风韵犹存的老鸨，手里的丝绢轻轻一甩便香风四溢。', ['wine_daughter', 'pastry', 'silk_scarf', 'incense']),
                v('聚宝阁', '钱四海', '坐在柜台后的神秘商人，据说没有他弄不到的东西。', ['qin_bamboo', 'peony_painting', 'moon_poem', 'silver_ingot'], false, 50),
                v('镇国武馆', '岳啸天', '气度沉凝的武馆总教头，一双铁掌开碑裂石。', ['chest_mirror', 'steel_blade'], false, 70),
            ],
        },
        {
            id: 'suzhou', name: '姑苏',
            desc: '江南水乡的中心城市，河流纵横，画舫穿梭。以丝绸、茶叶、瓷器闻名天下。',
            population: 1500000, area: 62, areaUnit: 'km²', economy: 'very_wealthy',
            factions: [],
            venues: [
                v('听雨楼', '花想容', '神秘的美人楼主，武功深不可测，消息灵通。', ['dragon_tea', 'wine_bamboo', 'tang_painting', 'screen_2side'], false, 70),
                v('珍宝阁', '沈万三', '富可敌国的大商人，阁中奇珍异宝无数。', ['jade_ring', 'necklace_gold', 'silver_ingot', 'bangle_jade']),
                v('绣庄', '苏绣娘', '心灵手巧的绣娘，苏绣技艺冠绝天下。', ['silk_robe', 'silk_scarf', 'screen_2side', 'shu_embroidery']),
                v('茶庄', '陆羽', '品茶大师，店中茶香四溢，汇集天下名茶。', ['dragon_tea', 'tea_cake', 'pastry']),
                v('潇湘阁', '云想容', '风韵犹存的女掌柜，年轻时曾是江南名妓。', ['wine_daughter', 'dragon_tea', 'incense']),
                v('兵器铺', '欧冶子', '自称欧冶子后人，打造的刀剑削铁如泥。', ['blue_sword', 'steel_blade', 'gold_silk_armor'], false, 60),
                v('江南武馆', '柳如风', '一袭白衣的武馆馆主，剑法轻灵飘逸，人称"江南第一剑"。', ['steel_blade', 'chest_mirror'], false, 65),
            ],
        },
        {
            id: 'changan', name: '长安',
            desc: '千年古都，武林圣地。大光明寺是天下武学正宗源头。',
            population: 1200000, area: 90, areaUnit: 'km²', economy: 'wealthy',
            factions: [],
            venues: [
                v('古玩店', '司徒明', '留着山羊胡的古董商人，店内古物琳琅满目。', ['qin_bamboo', 'peony_painting', 'writing_brush', 'ink_stick']),
                v('铁匠铺', '雷炎', '肌肉虬结的铁匠，炉火烧得比别家旺三分。', ['blue_sword', 'gold_silk_armor', 'steel_blade', 'chest_mirror'], false, 55),
                v('药店', '孙思邈', '白发苍苍的老郎中，药柜里摆满了各种丹药瓶罐。', ['jinchuang', 'huisheng', 'neili_dan', 'jiedu_san', 'qingxin_wan', 'ginseng_100', 'powder_clear', 'herb_bandage']),
                v('珠宝斋', '胡商', '西域来的珠宝商人，兜售各种奇珍异宝。', ['jade_ring', 'bangle_jade', 'necklace_gold', 'jade_fish']),
                v('春风楼', '杨玉弦', '长安城最有名的老鸨，人脉极广，手中掌握着长安一半的胭脂行当。', ['wine_bamboo', 'pastry', 'incense']),
                v('大光明寺', '了尘大师', '白眉垂肩的得道高僧，目光深邃如古井。', ['incense', 'buddha_relic', 'herb_bandage'], false, 80),
                v('长安武馆', '秦仲', '虎背熊腰的西北硬汉，拳法刚猛霸道，门下弟子数百。', ['steel_blade', 'chest_mirror'], false, 75),
                v('禅武道场', '无名僧', '来历不明的苦行僧，曾在雪山顶上独坐七日七夜。', ['incense', 'herb_bandage'], false, 110),
            ],
        },
    ],
    small_cities: [
        {
            id: 'luoyang', name: '洛阳',
            desc: '中原腹地的千年古城，自古兵家必争之地。武馆镖局众多。',
            population: 520000, area: 28, areaUnit: 'km²', economy: 'moderate',
            factions: [],
            venues: [
                v('金刀镖局', '王振威', '"金刀无敌"王振威，正指挥镖师们装卸货物。', ['steel_blade', 'chest_mirror', 'dagger'], false, 45),
                v('画坊', '唐伯虎', '落魄不羁的画师，身边堆满了画卷。', ['peony_painting', 'stationary', 'writing_brush']),
                v('铁匠铺', '李铁锤', '膀大腰圆的铁匠，正抡着大锤。', ['steel_blade', 'knife_wood', 'hoe_iron'], false, 30),
                v('杂货铺', '马掌柜', '精明的商人，货物齐全。', ['silk_robe', 'stationary', 'flint', 'ration']),
                v('牡丹院', '花三娘', '手里摇着团扇的中年妇人，眼神精明，洛阳城的风月场都归她说了算。', ['wine_daughter', 'wine_rice', 'pastry']),
                v('酒楼', '宋厨子', '手艺一绝的大厨，招牌菜是洛阳水席。', ['wine_daughter', 'pastry', 'wine_bamboo', 'ration']),
                v('洛阳武馆', '周侗', '名震中原的拳师，一双铁拳打遍洛阳无敌手。', ['chest_mirror', 'steel_blade'], false, 50),
            ],
        },
        {
            id: 'chengdu', name: '成都',
            desc: '天府之国的中心，茶馆遍布，蜀中江湖人士聚集之地。',
            population: 480000, area: 30, areaUnit: 'km²', economy: 'wealthy',
            factions: [],
            venues: [
                v('蜀绣坊', '云锦绣', '灵巧的绣娘，店内挂满精美绣品。', ['shu_embroidery', 'silk_robe', 'silk_scarf']),
                v('酒馆', '杜康', '酿酒世家的传人，店中酒香飘十里。', ['wine_daughter', 'wine_bamboo', 'wine_rice', 'pastry']),
                v('首饰铺', '金巧手', '正在打磨银器的工匠，手艺精湛。', ['ring_silver', 'bangle_jade', 'jade_fish']),
                v('锦官阁', '薛涛笺', '蜀中赫赫有名的女老板，琴棋书画样样精通。', ['dragon_tea', 'stationary', 'incense']),
                v('茶馆', '竹叶青', '清雅的茶楼老板，泡得一手好茶。', ['dragon_tea', 'tea_cake', 'incense']),
                v('药店', '白药仙', '背着药箱的郎中，专治疑难杂症，柜中丹药齐全。', ['jinchuang', 'huisheng', 'neili_dan', 'jiedu_san', 'qingxin_wan', 'ginseng_100', 'powder_clear', 'herb_bandage']),
                v('蜀中武馆', '铁罗汉', '蜀中唐门的外门弟子，一手铁砂掌威震巴蜀。', ['chest_mirror', 'steel_blade'], false, 45),
            ],
        },
        {
            id: 'xiangyang', name: '襄阳',
            desc: '扼守中原的门户重镇，城墙高厚，军民尚武成风。',
            population: 380000, area: 22, areaUnit: 'km²', economy: 'subsistence',
            factions: [],
            venues: [
                v('军需铺', '赵铁衣', '退伍老兵开的铺子，卖的都是军旅硬货。', ['dark_arrow', 'steel_blade', 'chest_mirror'], false, 40),
                v('杂货铺', '周六斤', '朴实的庄稼汉，店里都是日常所需。', ['cloth_coarse', 'ration', 'flint', 'wine_rice']),
                v('铁匠铺', '冯大锤', '正在修补兵器的铁匠，墙上挂着各式刀剑。', ['steel_blade', 'knife_wood', 'hoe_iron'], false, 30),
                v('汉水楼', '楚红袖', '豪爽的女掌柜，店里的女儿红远近闻名。', ['wine_bamboo', 'wine_daughter', 'ration']),
                v('酒楼', '刘一刀', '豪爽的掌柜，招牌菜是红烧狮子头。', ['wine_bamboo', 'ration', 'pastry'], false, 25),
                v('襄阳武馆', '郭威', '守城将领退下来的老兵，教的全是战场上的杀人技。', ['chest_mirror', 'steel_blade'], false, 55),
            ],
        },
        {
            id: 'suzhou_city', name: '苏州',
            desc: '以园林甲天下，小桥流水，吴侬软语。',
            population: 420000, area: 25, areaUnit: 'km²', economy: 'wealthy',
            factions: [],
            venues: [
                v('绣坊', '秋娘', '正在赶制绣品的绣娘，双手上下翻飞。', ['screen_2side', 'silk_scarf', 'silk_robe']),
                v('糕点铺', '甜婆', '慈眉善目的老太太，做的桂花糕远近闻名。', ['pastry', 'tea_cake', 'wine_rice']),
                v('书斋', '文徵明', '温文尔雅的读书人，收藏了不少名家字帖。', ['stationary', 'writing_brush', 'ink_stick', 'moon_poem']),
                v('茶馆', '碧螺春', '茶艺精湛的女子，泡出的龙井香飘满街。', ['dragon_tea', 'tea_cake', 'pastry']),
                v('烟雨阁', '苏小小', '温婉的江南女子，轻声细语间别有一番风情。', ['dragon_tea', 'pastry', 'silk_scarf']),
                v('苏州武馆', '顾云飞', '书香门第出身的武师，一手太极拳使得行云流水。', ['steel_blade', 'chest_mirror'], false, 40),
            ],
        },
        {
            id: 'dali', name: '大理',
            desc: '西南边陲的佛国，苍山洱海间古寺林立。',
            population: 280000, area: 20, areaUnit: 'km²', economy: 'moderate',
            factions: [],
            venues: [
                v('天龙寺', '本因方丈', '白眉垂肩的高僧，双手合十，庄严肃穆。', ['buddha_relic', 'incense', 'herb_bandage'], false, 55),
                v('集市', '段三娘', '摆摊的当地妇人，卖些药材和土产。', ['ginseng_100', 'herb_ginseng_small', 'powder_clear']),
                v('银器铺', '金花婆婆', '白族老匠人，打了一辈子银饰。', ['ring_silver', 'jade_fish', 'bangle_jade']),
                v('酒馆', '风花雪月', '临街的小酒馆，自酿的青梅酒别具风味。', ['wine_rice', 'wine_bamboo', 'ration']),
                v('大理武馆', '段正淳', '段氏皇族的旁支子弟，一阳指已有三分火候。', ['steel_blade', 'chest_mirror'], false, 50),
            ],
        },
        {
            id: 'yangzhou', name: '扬州',
            desc: '淮左名都，竹西佳处。运河与长江交汇处的繁华之地。',
            population: 340000, area: 18, areaUnit: 'km²', economy: 'wealthy',
            factions: [],
            venues: [
                v('盐帮总舵', '钱四海', '大腹便便的盐帮帮主，手里盘着两个玉核桃。', ['moon_poem', 'tea_cake', 'dragon_tea', 'silver_ingot'], false, 40),
                v('醉花楼', '赛西施', '风姿绰约的酒楼女掌柜，花雕酒远近闻名。', ['wine_daughter', 'wine_bamboo', 'pastry']),
                v('书肆', '柳如是', '才女出身的书肆老板，店内书香四溢。', ['moon_poem', 'stationary', 'writing_brush', 'ink_stick']),
                v('珠宝铺', '波斯客', '远道而来的波斯商人，带来不少异域珍品。', ['jade_ring', 'necklace_gold', 'ring_silver']),
                v('扬州武馆', '燕云飞', '轻功冠绝淮左的武师，来去如风，人称"燕云十八骑"传人。', ['steel_blade', 'chest_mirror'], false, 45),
            ],
        },
    ],
    villages: [
        // helper: name, id, desc, pop, area, economy, nearestCity, distance, [herbalist, blacksmith, tavern, chief, rich]
        ...[
            ['桃源村','taoyuan','群山环抱中的宁静村落，遍植桃树。',380,2,'subsistence','xiangyang','2天脚程','李郎中','陈铁匠','赵二娘','李伯','刘财主'],
            ['枫林渡','fenglin','江边的渡口村落，秋日枫叶如火。',620,1.5,'moderate','suzhou_city','1天脚程','王大夫','张铁匠','钱掌柜','张老汉','钱员外'],
            ['白云庄','baiyun','建在山腰上的大庄子，常年云雾缭绕。',260,3,'subsistence','xiangyang','1天脚程','云游郎中','云铁匠','云管事','云庄主','云夫人'],
            ['黑水村','heishui','沼泽边的渔村，常年瘴气弥漫。',220,1.8,'destitute','yangzhou','2天脚程','瘴郎中','老渔头','孙二娘','钱老大','孙渔霸'],
            ['清溪镇','qingxi','因村中清澈见底的小溪得名。',480,1.2,'moderate','suzhou_city','半日脚程','水郎中','洪铁匠','溪边客','赵里正','李员外'],
            ['虎头寨','hutou','由匪寨演变的村落，尚武之风犹存。',350,2.5,'subsistence','xiangyang','1天脚程','赛华佗','龙铁锤','虎妞','龙寨主','虎二爷'],
            ['流云村','liuyun','草原上的游牧村落，以放牧为生。',400,8,'subsistence','changan','3天脚程','蒙大夫','铁木尔','马奶酒','巴特尔','巴图尔'],
            ['双月湾','shuangyue','海边渔村，村前海湾形似两轮弯月。',560,1.5,'moderate','yangzhou','1天脚程','海郎中','陈铁锚','月娘','陈伯','海老板'],
            ['龙门村','longmen','黄河边上的小村，传说曾有鲤鱼跃龙门。',320,1,'subsistence','luoyang','2天脚程','孙郎中','孟铁匠','鲤大娘','孙大爷','孟掌柜'],
            ['翠微村','cuiwei','大山深处的村落，四周竹林环绕。',180,1.2,'destitute','xiangyang','3天脚程','竹郎中','竹铁匠','竹酒翁','竹翁','竹员外'],
            ['金川镇','jinchuan','两河交汇处的繁忙集镇，方圆百里最大集散地。',1200,3.5,'moderate','yangzhou','2天脚程','金郎中','金大锤','酒缸周','周会长','钱百万'],
            ['山神庙','shanshen','以古老山神庙为中心的村落。',150,0.8,'destitute','jingcheng','2天脚程','山郎中','刘铁匠','庙前酒','刘庙祝','陈施主'],
            ['西口村','xikou','关外边陲村落，汉胡杂居，民风粗犷豪放。',300,4,'subsistence','changan','4天脚程','蒙大夫','胡铁匠','驼铃酒','马把头','胡老板'],
            ['东坡村','dongpo','苏东坡曾贬谪居住之地。',280,1,'subsistence','suzhou','2天脚程','苏郎中','苏铁匠','东坡酒','苏老学究','黄员外'],
            ['烟霞村','yanxia','山谷中的村落，早晚云雾如烟霞。出产贡茶。',420,1.5,'moderate','chengdu','1天脚程','陆郎中','陆铁匠','陆茶寮','陆管事','陆老爷'],
            ['大黄庄','dahuang','平原上的大庄子，周围良田千亩。',680,5,'moderate','luoyang','1天脚程','黄郎中','黄铁匠','黄酒坛','黄百万','黄老爷'],
            ['苗疆寨','miaojiang','苗人聚居的村寨，保留着蛊术和巫文化。',350,3,'subsistence','dali','3天脚程','蛊婆婆','苗铁匠','寨中酒','阿公','苗富商'],
            ['墨渊村','moyuan','建在废弃矿坑附近的村落，后山有前朝秘密。',200,1,'destitute','chengdu','2天脚程','墨郎中','墨铁匠','黑酒翁','老矿头','矿东家'],
            ['芦花荡','luhua','湖荡湿地中的水村，家家有船。',450,6,'subsistence','yangzhou','半日脚程','芦郎中','芦铁匠','芦花酒','吴老大','吴掌柜'],
            ['松涛庄','songtao','松林中的清幽居所，原是退休官员别院。',190,1.2,'subsistence','suzhou','1天脚程','王郎中','王铁匠','松风酒','王员外','王庄头'],
        ].map(([name,id,desc,pop,area,economy,nearestCity,distance,...staff]) => {
            const [herbalNpc, smithNpc, tavernNpc, chiefNpc, richNpc] = staff;
            const villageTier = Math.min(5, Math.floor(pop / 150)); // 1-5 tier
            const baseCp = 12 + villageTier * 3; // 15-27
            const venues = [
                v('草药铺', herbalNpc, `村里的草药郎中。`, ['herb_bandage', 'powder_clear', 'herb_ginseng_small']),
                v('铁匠铺', smithNpc, `村里的铁匠，手艺还不错。`, ['knife_wood', 'hoe_iron', 'pot_iron', 'dagger', 'band_head', 'pants_coarse', 'bracers_cloth', 'shoes_straw'], false, baseCp),
                v('酒馆', tavernNpc, `小酒馆里飘出阵阵酒香。`, ['wine_rice', 'ration', 'pastry']),
                v(`${chiefNpc}家`, chiefNpc, `村长的家，${chiefNpc}正在院子里忙活。`, ['tea_cake', 'incense']),
            ];
            const warriorNames = ['寨主', '庄主', '把头', '渔霸'];
            if (warriorNames.some(w => chiefNpc.includes(w))) {
                venues[3].npcs[0].civilian = false;
                venues[3].npcs[0].combatPower = baseCp + 8;
            }
            venues[3].npcs[0].isChief = true;
            if (richNpc && richNpc !== chiefNpc) {
                venues.push(v(`${richNpc}府`, richNpc, `村里的富户，宅子比别家气派不少。`, ['silk_robe', 'silk_scarf', 'silver_ingot']));
                if (warriorNames.some(w => richNpc.includes(w))) {
                    venues[venues.length - 1].npcs[0].civilian = false;
                    venues[venues.length - 1].npcs[0].combatPower = baseCp + 5;
                }
            }
            venues.push({ name: '断桥', npcs: [] });
            venues.push({ name: '小溪', npcs: [] });
            venues.push({ name: '田埂', npcs: [] });
            venues.push({ name: '小树林', npcs: [] });
            const villageRep = { destitute:12, poor:12, subsistence:14, moderate:16 }[economy] || 12;
            const guardBase = { destitute:10, poor:12, subsistence:15, moderate:20 }[economy] || 10;
            return { id, name, desc, population:pop, area, areaUnit:'km²', economy, nearestCity, distanceToCity:distance,
                repThreshold: villageRep, guardianPower: guardBase + Math.floor(pop / 100), venues,
                travelDays: parseTravelDays(distance),
                npcs: venues.flatMap(v => v.npcs.map(n => ({ name: n.npcName, desc: n.npcDesc, civilian: n.civilian, combatPower: n.combatPower, items: [...n.items], isChief: n.isChief || false, martialArt: n.martialArt || null }))) };
        }),
    ],
};

// Assign village martial arts (reuse 10 types across all villages)
const VILLAGE_MARTIAL_ARTS = ['mantis', 'xingyi', 'tantui', 'hongquan', 'tongbi', 'baji', 'tiesha', 'mianzhang', 'fuhu', 'feiyan'];
WORLD.villages.forEach((v, vi) => {
    v.venues.forEach(ven => {
        ven.npcs.forEach(n => {
            if (n.combatPower > 0 && !n.martialArt) {
                n.martialArt = VILLAGE_MARTIAL_ARTS[vi % VILLAGE_MARTIAL_ARTS.length];
            }
        });
    });
    v.npcs.forEach(n => {
        if (n.combatPower > 0 && !n.martialArt) {
            n.martialArt = VILLAGE_MARTIAL_ARTS[vi % VILLAGE_MARTIAL_ARTS.length];
        }
    });
});

// Generate flat npcs from venues (for backward compatibility / steal system)
for (const loc of [...WORLD.big_cities, ...WORLD.small_cities]) {
    loc.npcs = loc.venues.flatMap(v => v.npcs.map(n => ({ name: n.npcName, desc: n.npcDesc, civilian: n.civilian, combatPower: n.combatPower, items: [...n.items] })));
}

// Add reputation thresholds and guardian power to all locations
const ecoBonusMap = { destitute:0, poor:2, subsistence:5, moderate:10, wealthy:15, very_wealthy:20, lavish:30 };
for (const loc of getAllLocations()) {
    const b = ecoBonusMap[loc.economy] || 5;
    const t = loc.repThreshold !== undefined ? loc.repThreshold : (loc.population >= 1000000 ? 60 + b : loc.population >= 200000 ? 30 + b : 5 + b);
    const g = loc.guardianPower !== undefined ? loc.guardianPower : (loc.population >= 1000000 ? 200 + b * 5 : loc.population >= 200000 ? 60 + b * 4 : 15 + b * 3 + Math.floor(loc.population / 100));
    loc.repThreshold = t;
    loc.guardianPower = g;
}

function getEconomyLabel(key) {
    const found = ECONOMY_LEVELS.find(e => e.key === key);
    return found ? found.label : '未知';
}

function getLocationTypeLabel(id) {
    if (WORLD.big_cities.find(c => c.id === id)) return LOCATION_TYPES.big_city;
    if (WORLD.small_cities.find(c => c.id === id)) return LOCATION_TYPES.small_city;
    return LOCATION_TYPES.village;
}

function getAllLocations() {
    return [...WORLD.big_cities, ...WORLD.small_cities, ...WORLD.villages];
}

// Assign city NPC martial arts
const CITY_MARTIAL_ARTS = {
    jingcheng: { '莫三千':'zuiquan', '公孙冶':'tiezhang', '聚宝阁·钱四海':'longzhua', '岳啸天':'tiangang' },
    suzhou: { '花想容':'zhuifeng', '欧冶子':'tiezhang', '柳如风':'taiji' },
    changan: { '雷炎':'tiesha', '了尘大师':'jingang', '秦仲':'baji', '无名僧':'nianhua' },
    luoyang: { '王振威':'baji', '李铁锤':'tantui', '周侗':'tongbi' },
    chengdu: { '铁罗汉':'tiesha', '杜康':null },
    xiangyang: { '赵铁衣':'fuhu', '冯大锤':'hongquan', '郭威':'baji' },
    suzhou_city: { '顾云飞':'taiji' },
    dali: { '本因方丈':'yiyangzhi', '段正淳':'yiyangzhi' },
    yangzhou: { '钱四海':'longzhua', '燕云飞':'zhuifeng' },
};
for (const loc of getAllLocations()) {
    const map = CITY_MARTIAL_ARTS[loc.id];
    if (!map) continue;
    loc.venues.forEach(ven => {
        ven.npcs.forEach(n => {
            if (map[n.npcName] !== undefined) n.martialArt = map[n.npcName];
        });
    });
    loc.npcs.forEach(n => {
        if (map[n.name] !== undefined) n.martialArt = map[n.name];
    });
}

// Assign 武馆/道场 martial arts
const ARENA_MARTIAL_ARTS = ['zuiquan', 'wuying', 'tiangang', 'jingang', 'nianhua', 'yiyangzhi', 'longzhua', 'taiji', 'zhuifeng', 'baji', 'tiesha'];
getAllLocations().forEach(loc => {
    loc.venues.forEach(ven => {
        if (ven.name.includes('武馆') || ven.name.includes('道场')) {
            ven.npcs.forEach((n, i) => {
                n.martialArt = ARENA_MARTIAL_ARTS[i % ARENA_MARTIAL_ARTS.length];
            });
        }
    });
});

/* ─── 区域系统 ─── */

const REGIONS = {
    xibei: { name: '西北', color: '#d4a050' },
    dongbei: { name: '东北', color: '#50a0d4' },
    xinan: { name: '西南', color: '#50d480' },
    dongnan: { name: '东南', color: '#d48050' },
    zhongbu: { name: '中部', color: '#c0c050' },
};

const LOCATION_REGION = {
    // 西北
    changan: 'xibei', liuyun: 'xibei', xikou: 'xibei',
    // 东北
    jingcheng: 'dongbei', luoyang: 'dongbei', longmen: 'dongbei', dahuang: 'dongbei', shanshen: 'dongbei',
    // 西南
    chengdu: 'xinan', dali: 'xinan', yanxia: 'xinan', miaojiang: 'xinan', moyuan: 'xinan',
    // 东南
    suzhou: 'dongnan', yangzhou: 'dongnan', suzhou_city: 'dongnan',
    fenglin: 'dongnan', qingxi: 'dongnan', shuangyue: 'dongnan', jinchuan: 'dongnan', luhua: 'dongnan', songtao: 'dongnan', dongpo: 'dongnan',
    // 中部
    xiangyang: 'zhongbu', taoyuan: 'zhongbu', baiyun: 'zhongbu', heishui: 'zhongbu', hutou: 'zhongbu', cuiwei: 'zhongbu',
};

const REGION_TRAVEL = {
    xibei: ['zhongbu', 'xinan', 'dongbei'],
    dongbei: ['zhongbu', 'xibei', 'dongnan'],
    xinan: ['zhongbu', 'xibei', 'dongnan'],
    dongnan: ['zhongbu', 'dongbei', 'xinan'],
    zhongbu: ['xibei', 'dongbei', 'xinan', 'dongnan'],
};

function getRegion(id) { return LOCATION_REGION[id]; }
function getRegionLabel(id) { const r = REGIONS[LOCATION_REGION[id]]; return r ? r.name : '未知'; }
function canTravel(fromId, toId) {
    const from = getRegion(fromId);
    const to = getRegion(toId);
    if (!from || !to) return true;
    if (from === to) return true;
    return REGION_TRAVEL[from] && REGION_TRAVEL[from].includes(to);
}

function parseTravelDays(str) {
    if (!str) return 1;
    const m = str.match(/(\d+)/);
    if (m) return parseInt(m[1]);
    if (str.includes('半日')) return 0.5;
    return 1;
}

// Travel days for cities (centrality within region)
const CITY_TRAVEL_DAYS = {
    jingcheng: 0, suzhou: 0, changan: 0,
    chengdu: 0, xiangyang: 0,
    luoyang: 1, yangzhou: 1, suzhou_city: 1,
    dali: 2,
};
for (const loc of getAllLocations()) {
    if (loc.travelDays === undefined) {
        loc.travelDays = CITY_TRAVEL_DAYS[loc.id] !== undefined ? CITY_TRAVEL_DAYS[loc.id] : 1;
    }
}

function getTravelDays(fromId, toId) {
    const fromLoc = getAllLocations().find(l => l.id === fromId);
    const toLoc = getAllLocations().find(l => l.id === toId);
    if (!fromLoc || !toLoc) return 1;
    const fromRegion = getRegion(fromId);
    const toRegion = getRegion(toId);
    if (!fromRegion || !toRegion) return 1;
    if (fromRegion === toRegion) {
        return Math.max(1, Math.abs(fromLoc.travelDays - toLoc.travelDays) + 1);
    }
    // cross-region: base + both distances
    if (canTravel(fromId, toId)) {
        return fromLoc.travelDays + toLoc.travelDays + 3;
    }
    return 99; // unreachable
}
