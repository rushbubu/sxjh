/* ═══════════════════════════════════════
   门派系统 — 八大势力
   每个门派有独立驻地、贡献体系、专属武学与内功
═══════════════════════════════════════ */

const FACTION_SKILLS = {
    // ── 少林 ──
    f_shaolin_fist:    { name: '罗汉拳',       desc: '少林入门拳法，拳路沉稳，步步为营。',              luckReq: 15, type: 'fist',  quality: 'blue'  },
    f_shaolin_staff:   { name: '少林棍法',     desc: '棍扫一大片，少林棍法势大力沉，攻守兼备。',          luckReq: 15, type: 'bludgeon', quality: 'blue' },
    f_shaolin_palm:    { name: '大力金刚掌',   desc: '佛门至高掌法，一掌击出有金刚降魔之威。',            luckReq: 25, type: 'palm',  quality: 'gold'  },
    f_shaolin_finger:  { name: '金刚指',       desc: '一指弹出可碎金裂石，是少林七十二绝技之一。',        luckReq: 22, type: 'finger', quality: 'purple'},
    f_shaolin_claw:    { name: '龙爪手',       desc: '少林七十二绝技之一，爪力可洞金穿石。',              luckReq: 28, type: 'fist',  quality: 'purple'},

    // 少林七十二绝技（通过门派研习获取）
    f_shaolin_chang_quan:{ name: '少林长拳',   desc: '少林入门拳法，拳路工整扎实，是少林武学之根基。',                   luckReq: 10, type: 'fist',  quality: 'green' },
    f_shaolin_wei_tuo:  { name: '韦陀杵',     desc: '少林护法绝技，拳势如杵，刚猛无匹，中者如受重杵一击。',                  luckReq: 16, type: 'fist',  quality: 'purple'},
    f_shaolin_da_jin_gang:   { name: '大金刚掌',   desc: '少林至高掌法之一，掌力雄浑如金刚降世，摧山断岳。',                luckReq: 24, type: 'palm',  quality: 'purple'},
    f_shaolin_xu_mi:         { name: '须弥山掌',   desc: '掌力隔空而至，如须弥山压顶，令人避无可避。',                       luckReq: 24, type: 'palm',  quality: 'purple'},
    f_shaolin_jin_gang_bo_re:{ name: '金刚般若掌', desc: '融金刚之刚与般若之慧于一体，掌法精妙绝伦。',                     luckReq: 26, type: 'palm',  quality: 'purple'},
    f_shaolin_xiang_mo:      { name: '降魔掌',     desc: '少林降魔卫道之掌法，堂堂正正，势不可挡。',                         luckReq: 22, type: 'palm',  quality: 'purple'},
    f_shaolin_yi_pai:        { name: '一拍两散',   desc: '一掌拍出，玉石俱焚，对手内息尽数溃散。',                           luckReq: 26, type: 'palm',  quality: 'purple'},
    f_shaolin_duo_luo:       { name: '多罗叶指',   desc: '一指弹出如多罗叶纷飞，指力纵横交错，不可捉摸。',                   luckReq: 22, type: 'finger',quality: 'purple'},
    f_shaolin_wu_xiang:      { name: '无相劫指',   desc: '无相无形，指力悄然而至，中者如遭劫数。',                           luckReq: 22, type: 'finger',quality: 'purple'},
    f_shaolin_mo_he:         { name: '摩诃指',     desc: '大摩诃指法，指力磅礴，有包容万象之势。',                          luckReq: 22, type: 'finger',quality: 'purple'},
    f_shaolin_da_li_jin_gang:{ name: '大力金刚指', desc: '指力可碎金裂石，是少林硬功指法之最。',                              luckReq: 24, type: 'finger',quality: 'purple'},
    f_shaolin_yi_zhi:        { name: '一指禅',     desc: '少林至高指法之一，一指可破天下万法。',                              luckReq: 24, type: 'finger',quality: 'purple'},
    f_shaolin_da_zhi:        { name: '大智无定指', desc: '指法变幻莫测，无迹可寻，蕴大智慧于其中。',                           luckReq: 22, type: 'finger',quality: 'purple'},
    f_shaolin_qu_fan_nao:    { name: '去烦恼指',   desc: '一指拂过，令人烦恼尽消，中者浑然不觉。',                           luckReq: 22, type: 'finger',quality: 'purple'},
    f_shaolin_tian_zhu:      { name: '天竺佛指',   desc: '自天竺传来的佛门指法，古拙质朴而威力无穷。',                       luckReq: 22, type: 'finger',quality: 'purple'},
    f_shaolin_ran_mu:        { name: '燃木刀法',   desc: '少林刀法绝技，刀气炽热可燃木生火。',                               luckReq: 22, type: 'blade',  quality: 'purple'},
    f_shaolin_fu_mo:         { name: '伏魔杖法',   desc: '少林镇寺杖法，杖影如山，妖魔辟易。',                               luckReq: 22, type: 'bludgeon',quality: 'purple'},
    f_shaolin_feng_mo:       { name: '疯魔杖法',   desc: '杖法癫狂如疯似魔，以攻为守，不死不休。',                           luckReq: 20, type: 'bludgeon',quality: 'purple'},
    f_shaolin_qin_na:        { name: '少林擒拿十八打', desc: '少林擒拿手法集大成者，锁扣缠拿变化无穷。',                   luckReq: 18, type: 'fist',  quality: 'purple'},
    f_shaolin_bo_luo_mi:     { name: '波罗密手',   desc: '以佛法波罗密为喻，掌法如渡彼岸，精妙绝伦。',                      luckReq: 22, type: 'palm',  quality: 'purple'},
    f_shaolin_da_ci_da_bei:  { name: '大慈大悲千手式', desc: '以千手千眼之意演化，攻守兼备，无懈可击。',                   luckReq: 26, type: 'palm',  quality: 'purple'},
    f_shaolin_jia_sha:       { name: '袈裟伏魔功', desc: '以袈裟为兵器，柔软中蕴含刚劲，伏魔于无形。',                         luckReq: 24, type: 'fist',  quality: 'purple'},
    f_shaolin_po_na:         { name: '破衲功',     desc: '看似破旧袈裟，实则暗藏内劲，可卸力反击。',                          luckReq: 20, type: 'fist',  quality: 'purple'},
    f_shaolin_tie_xiu:       { name: '铁袖功',     desc: '铁袖一挥，劲风如刀，柔中带刚，防不胜防。',                          luckReq: 20, type: 'fist',  quality: 'purple'},
    f_shaolin_xiu_li:        { name: '袖里乾坤',   desc: '大袖一挥，包容万物，以柔克刚，纳敌攻势于无形。',                     luckReq: 22, type: 'fist',  quality: 'purple'},
    f_shaolin_shi_zi_hou:    { name: '金刚禅狮子吼', desc: '以佛门狮子吼音功震摄心神，一声断喝可令敌胆裂。',                 luckReq: 26, type: 'fist',  quality: 'orange'},
    f_shaolin_bu_huai:       { name: '金刚不坏体神功', desc: '少林第一护体神功，练成后金刚不坏，刀枪不入。',                  luckReq: 28, type: 'fist',  quality: 'orange'},
    f_shaolin_xi_sui:        { name: '洗髓经',     desc: '少林无上内功秘典，洗髓伐脉，脱胎换骨。',                              luckReq: 30, type: 'fist',  quality: 'orange'},
    f_shaolin_yi_jin:        { name: '易筋经',     desc: '少林镇寺之宝，武林至尊内功，练成后天下无敌。',                         luckReq: 35, type: 'fist',  quality: 'gold'  },

    // ── 武当 ──
    f_wudang_fist:     { name: '太极拳',       desc: '以柔克刚，四两拨千斤，武当镇派绝学。',              luckReq: 18, type: 'fist',  quality: 'purple'},
    f_wudang_sword:    { name: '太极剑法',     desc: '剑走圆转，绵绵不绝，剑气如太极图般浑圆一体。',      luckReq: 22, type: 'sword', quality: 'gold'  },
    f_wudang_palm:     { name: '武当绵掌',     desc: '看似轻柔无力，实则内劲暗藏，中者如遭重锤。',        luckReq: 16, type: 'palm',  quality: 'blue'  },
    f_wudang_light:    { name: '梯云纵',       desc: '武当轻功绝技，纵身一跃可踏云而上。',                luckReq: 18, type: 'fist',  quality: 'purple'},

    // ── 西岳（华山百年后改名）──
    f_xiyue_sword:     { name: '西岳剑法',     desc: '西岳派入门剑法，脱胎于华山剑法，更加凌厉直接。',    luckReq: 14, type: 'sword', quality: 'blue'  },
    f_xiyue_cloud:     { name: '云台剑法',     desc: '西岳派镇派剑法之一，剑出如云台耸立，巍峨不可撼。',  luckReq: 22, type: 'sword', quality: 'purple'},
    f_xiyue_breaking:  { name: '破岳剑诀',     desc: '西岳派至高剑诀，一剑既出，可破山岳。',              luckReq: 32, type: 'sword', quality: 'gold'  },

    // ── 丐帮 ──
    f_beggar_staff:    { name: '打狗棒法',     desc: '丐帮镇帮之宝，棒法精妙绝伦，进退自如。',            luckReq: 22, type: 'bludgeon', quality: 'purple'},
    f_beggar_palm:     { name: '降龙十八掌',   desc: '天下至刚至阳的掌法，一掌既出，有排山倒海之势。',    luckReq: 32, rootReq: 40, type: 'palm',  quality: 'orange'  },
    f_beggar_fist:     { name: '逍遥游',       desc: '丐帮身法拳法，如逍遥神仙，来去自如。',              luckReq: 16, type: 'fist',  quality: 'blue'  },

    // ── 峨眉 ──
    f_emei_sword:      { name: '峨眉剑法',     desc: '峨眉派入门剑法，剑式优雅中暗藏杀机。',              luckReq: 14, type: 'sword', quality: 'blue'  },
    f_emei_yitian:     { name: '倚天剑诀',     desc: '峨眉镇派绝学，剑气凌厉，有倚天之势。',              luckReq: 24, type: 'sword', quality: 'purple'},
    f_emei_palm:       { name: '四象掌法',     desc: '演天地四象之变的掌法，蕴含周易玄机。',              luckReq: 20, type: 'palm',  quality: 'purple'},

    // ── 唐门 ──
    f_tang_dart:       { name: '穿心镖',       desc: '唐门入门暗器手法，出手无声，专破护体真气。',        luckReq: 16, type: 'fist',  quality: 'blue'  },
    f_tang_poison:     { name: '五毒掌',       desc: '以五种剧毒淬炼掌力，中者毒入骨髓。',                luckReq: 22, type: 'palm',  quality: 'purple'},
    f_tang_rain:       { name: '暴雨梨花针',   desc: '唐门至强暗器，一瞬之间射出千百毒针，避无可避。',    luckReq: 30, type: 'fist',  quality: 'gold'  },

    // ── 日月神教 ──
    f_sunmoon_palm:    { name: '天魔掌',       desc: '日月神教镇教掌法，掌力阴邪霸道，中者经脉逆乱。',    luckReq: 20, type: 'palm',  quality: 'purple'},
    f_sunmoon_sword:   { name: '葵花宝典·剑',  desc: '从葵花宝典中悟出的剑法，快如鬼魅，防不胜防。',      luckReq: 30, type: 'sword', quality: 'gold'  },

    // ── 金钱帮 ──
    f_money_palm:      { name: '金元宝掌',     desc: '以金钱为引的掌法，一掌拍出金光四射，晃人眼目。',    luckReq: 14, type: 'palm',  quality: 'blue'  },
    f_money_abacus:    { name: '算盘功',       desc: '以算盘为兵刃的奇门功夫，噼啪作响间取人性命。',      luckReq: 18, type: 'bludgeon', quality: 'purple'},
};

/* 内功定义（仅门派特有内功，通用内功在 items.js 中通过 use.learnInternalSkill 获取） */
const FACTION_INTERNAL_SKILLS = {
    shaolin_heart:  { name: '少林心法',       quality: 'blue'  },
    yijinjing:      { name: '易筋经',         quality: 'gold'  },
    wudang_heart:   { name: '纯阳无极功',     quality: 'purple'},
    xiyue_heart:    { name: '西岳心法',       quality: 'blue'  },
    beggar_heart:   { name: '混天气功',       quality: 'blue'  },
    emei_heart:     { name: '峨眉心法',       quality: 'blue'  },
    tang_heart:     { name: '百毒不侵功',     quality: 'purple'},
    sunmoon_heart:  { name: '吸星大法',       quality: 'gold'  },
    money_heart:    { name: '聚财心法',       quality: 'blue'  },
};

/* ═══ 八大派定义 ═══ */
const FACTIONS = {
    shaolin: {
        id: 'shaolin',
        name: '少林寺',
        icon: '🪷',
        desc: '「天下武功出少林」——千年古刹，七十二绝技冠绝武林。佛门清修之地，戒律森严。',
        locationId: 'changan',
        venueName: '少林寺',
        stewardName: '了尘大师',
        stewardDesc: '白眉垂肩的得道高僧，目光深邃如古井，佛法与武功皆已入化境。',
        stewardPower: 120,
        isEvil: false,
        exclusiveGroup: 'positive', // 正派互斥

        ranks: [
            {
                name: '俗家弟子',
                repRequired: 0,
                reqDesc: '根骨≥25，声望≥30，未犯偷盗杀戒（或财富≥5000可免）',
                requirements: { root: 25, reputation: 30 },
                customCheck: (p) => {
                    if (getPlayerTotalWealth(p) >= 5000) return true; // 有钱可免戒律
                    return (p._theftCount || 0) === 0 && (p._assassinationCount || 0) === 0;
                },
                desc: '初入少林的俗家弟子，在寺中洒扫习武，不落发不受戒。',
                title: '少林俗家',
                bonusDesc: '根骨+2，气血+5',
                statBonuses: { root: 2, maxHp: 5 },
                skillIds: ['f_shaolin_fist', 'f_shaolin_staff', 'f_shaolin_chang_quan'],
                internalIds: ['shaolin_heart'],
            },
            {
                name: '外门弟子',
                repRequired: 40,
                reqDesc: '根骨≥35，声望≥50',
                requirements: { root: 35, reputation: 50 },
                desc: '正式剃度的少林弟子，开始研习更深奥的武学。',
                title: '少林外门',
                bonusDesc: '根骨+3，灵巧+1，气血+10',
                statBonuses: { root: 3, dexterity: 1, maxHp: 10 },
                skillIds: ['f_shaolin_palm', 'f_shaolin_finger', 'f_shaolin_wei_tuo', 'f_shaolin_da_jin_gang', 'f_shaolin_xu_mi', 'f_shaolin_jin_gang_bo_re', 'f_shaolin_xiang_mo', 'f_shaolin_yi_pai'],
                internalIds: ['yijinjing'],
            },
            {
                name: '内门弟子',
                repRequired: 100,
                reqDesc: '根骨≥50，福缘≥30，声望≥80',
                requirements: { root: 50, luck: 30, reputation: 80 },
                desc: '少林武僧中的佼佼者，有资格进入藏经阁研习上乘武学。',
                title: '少林内门',
                bonusDesc: '根骨+5，灵巧+2，福缘+1，气血+20',
                statBonuses: { root: 5, dexterity: 2, luck: 1, maxHp: 20 },
                skillIds: ['f_shaolin_fist', 'f_shaolin_palm', 'f_shaolin_claw', 'f_shaolin_duo_luo', 'f_shaolin_wu_xiang', 'f_shaolin_mo_he', 'f_shaolin_da_li_jin_gang', 'f_shaolin_yi_zhi', 'f_shaolin_da_zhi', 'f_shaolin_qu_fan_nao', 'f_shaolin_tian_zhu', 'f_shaolin_ran_mu', 'f_shaolin_fu_mo', 'f_shaolin_feng_mo', 'f_shaolin_qin_na', 'f_shaolin_bo_luo_mi', 'f_shaolin_da_ci_da_bei', 'f_shaolin_jia_sha', 'f_shaolin_po_na', 'f_shaolin_tie_xiu', 'f_shaolin_xiu_li'],
                internalIds: ['yijinjing'],
            },
            {
                name: '首座弟子',
                repRequired: 180,
                reqDesc: '根骨≥65，福缘≥40，悟性≥30，声望≥120',
                requirements: { root: 65, luck: 40, wit: 30, reputation: 120 },
                desc: '有资格竞争少林首座之位的顶尖高手，已得少林武学真髓。',
                title: '少林首座',
                bonusDesc: '根骨+8，灵巧+3，福缘+2，悟性+2，气血+30',
                statBonuses: { root: 8, dexterity: 3, luck: 2, wit: 2, maxHp: 30 },
                skillIds: ['f_shaolin_palm', 'f_shaolin_claw', 'f_shaolin_finger', 'f_shaolin_shi_zi_hou', 'f_shaolin_bu_huai', 'f_shaolin_xi_sui', 'f_shaolin_yi_jin'],
                internalIds: ['yijinjing'],
            },
        ],
    },

    wudang: {
        id: 'wudang',
        name: '武当派',
        icon: '☯',
        desc: '「太极阴阳，道法自然」——武当为道家武学正宗，以柔克刚，以静制动。',
        locationId: 'suzhou',
        venueName: '武当别院',
        stewardName: '冲虚道长',
        stewardDesc: '仙风道骨的老道士，一手太极拳出神入化，修为深不可测。',
        stewardPower: 110,
        isEvil: false,
        exclusiveGroup: 'positive',

        ranks: [
            {
                name: '入门弟子',
                repRequired: 0,
                reqDesc: '悟性≥25，福缘≥20，济苍生≥30',
                requirements: { wit: 25, luck: 20 },
                customCheck: (p) => (p._worldHelp || 0) >= 30,
                desc: '初入武当的弟子，在观中研习道藏、修炼基本功。',
                title: '武当入门',
                bonusDesc: '悟性+2，福缘+1',
                statBonuses: { wit: 2, luck: 1 },
                skillIds: ['f_wudang_palm', 'f_wudang_fist'],
                internalIds: ['wudang_heart'],
            },
            {
                name: '太极弟子',
                repRequired: 50,
                reqDesc: '悟性≥35，福缘≥25，声望≥40',
                requirements: { wit: 35, luck: 25, reputation: 40 },
                desc: '得传太极拳法的正式弟子，每日在太极殿前练拳悟道。',
                title: '武当太极',
                bonusDesc: '悟性+3，福缘+2，根骨+1',
                statBonuses: { wit: 3, luck: 2, root: 1 },
                skillIds: ['f_wudang_fist', 'f_wudang_light'],
                internalIds: ['wudang_heart'],
            },
            {
                name: '真传弟子',
                repRequired: 110,
                reqDesc: '悟性≥45，福缘≥35，声望≥80，根骨≥30',
                requirements: { wit: 45, luck: 35, reputation: 80, root: 30 },
                desc: '武当派核心弟子，得传太极剑法，剑术已窥堂奥。',
                title: '武当真传',
                bonusDesc: '悟性+4，福缘+3，根骨+2，气血+15',
                statBonuses: { wit: 4, luck: 3, root: 2, maxHp: 15 },
                skillIds: ['f_wudang_sword', 'f_wudang_fist', 'f_wudang_light'],
                internalIds: ['wudang_heart'],
            },
            {
                name: '掌门弟子',
                repRequired: 180,
                reqDesc: '悟性≥55，福缘≥45，声望≥130，根骨≥45',
                requirements: { wit: 55, luck: 45, reputation: 130, root: 45 },
                desc: '武当派掌门候选人，已得太极武学真谛。',
                title: '武当掌门弟子',
                bonusDesc: '悟性+5，福缘+4，根骨+3，灵巧+2，气血+25',
                statBonuses: { wit: 5, luck: 4, root: 3, dexterity: 2, maxHp: 25 },
                skillIds: ['f_wudang_sword', 'f_wudang_fist'],
                internalIds: ['wudang_heart'],
            },
        ],
    },

    xiyue: {
        id: 'xiyue',
        name: '西岳派',
        icon: '⛰️',
        desc: '「西岳峥嵘何壮哉，剑指苍穹破云开」——百年前华山派经历巨变后改名西岳，剑法更加凌厉务实，不再拘泥气剑之争。',
        locationId: 'changan',
        venueName: '西岳剑阁',
        stewardName: '风清扬',
        stewardDesc: '一袭白衣的绝世剑客，神色冷峻，腰间悬一口古剑。他是西岳派百年不遇的剑道奇才。',
        stewardPower: 100,
        isEvil: false,
        exclusiveGroup: 'neutral',

        ranks: [
            {
                name: '外门弟子',
                repRequired: 0,
                reqDesc: '悟性≥20',
                requirements: { wit: 20 },
                desc: '初入西岳的弟子，每日练剑四个时辰，磨砺心性。',
                title: '西岳外门',
                bonusDesc: '悟性+1，灵巧+1',
                statBonuses: { wit: 1, dexterity: 1 },
                skillIds: ['f_xiyue_sword'],
                internalIds: ['xiyue_heart'],
            },
            {
                name: '入室弟子',
                repRequired: 50,
                reqDesc: '悟性≥30，灵巧≥25，声望≥40',
                requirements: { wit: 30, dexterity: 25, reputation: 40 },
                desc: '西岳派正式弟子，得传云台剑法，可入剑阁选剑。',
                title: '西岳入室',
                bonusDesc: '悟性+2，灵巧+2，根骨+1',
                statBonuses: { wit: 2, dexterity: 2, root: 1 },
                skillIds: ['f_xiyue_sword', 'f_xiyue_cloud'],
                internalIds: ['xiyue_heart'],
            },
            {
                name: '剑堂弟子',
                repRequired: 110,
                reqDesc: '悟性≥40，灵巧≥35，声望≥80，福缘≥25',
                requirements: { wit: 40, dexterity: 35, reputation: 80, luck: 25 },
                desc: '西岳派剑堂精英，可修习破岳剑诀。',
                title: '西岳剑堂',
                bonusDesc: '悟性+3，灵巧+3，根骨+2，福缘+1，气血+10',
                statBonuses: { wit: 3, dexterity: 3, root: 2, luck: 1, maxHp: 10 },
                skillIds: ['f_xiyue_cloud', 'f_xiyue_breaking'],
                internalIds: ['xiyue_heart'],
            },
            {
                name: '长老',
                repRequired: 190,
                reqDesc: '悟性≥50，灵巧≥45，声望≥130，福缘≥35',
                requirements: { wit: 50, dexterity: 45, reputation: 130, luck: 35 },
                desc: '西岳派长老，剑法已达化境，可代掌门裁决门派大事。',
                title: '西岳长老',
                bonusDesc: '悟性+4，灵巧+4，根骨+2，福缘+2，气血+20',
                statBonuses: { wit: 4, dexterity: 4, root: 2, luck: 2, maxHp: 20 },
                skillIds: ['f_xiyue_breaking', 'f_xiyue_cloud'],
                internalIds: ['xiyue_heart'],
            },
        ],
    },

    beggar: {
        id: 'beggar',
        name: '丐帮',
        icon: '🏮',
        desc: '「天下第一帮，义字当先」——丐帮弟子遍布天下，消息最灵通，最重江湖义气。',
        locationId: 'jingcheng',
        venueName: '丐帮总舵',
        stewardName: '乔峰',
        stewardDesc: '豪气干云的丐帮帮主，天生神力，降龙十八掌威震武林。',
        stewardPower: 130,
        isEvil: false,
        exclusiveGroup: 'positive',

        ranks: [
            {
                name: '一袋弟子',
                repRequired: 0,
                reqDesc: '声望≥20，根骨≥20',
                requirements: { reputation: 20, root: 20 },
                desc: '初入丐帮的一袋弟子，负责打探消息、乞讨巡逻。',
                title: '丐帮一袋',
                bonusDesc: '根骨+2，声望+5',
                statBonuses: { root: 2 },
                extraRep: 5,
                skillIds: ['f_beggar_fist'],
                internalIds: ['beggar_heart'],
            },
            {
                name: '三袋弟子',
                repRequired: 50,
                reqDesc: '根骨≥30，声望≥50',
                requirements: { root: 30, reputation: 50 },
                desc: '丐帮三袋弟子，开始执掌一方事务，有资格习练打狗棒法。',
                title: '丐帮三袋',
                bonusDesc: '根骨+3，灵巧+1，声望+10',
                statBonuses: { root: 3, dexterity: 1 },
                extraRep: 10,
                skillIds: ['f_beggar_staff', 'f_beggar_fist'],
                internalIds: ['beggar_heart'],
            },
            {
                name: '五袋弟子',
                repRequired: 110,
                reqDesc: '根骨≥40，福缘≥25，声望≥80',
                requirements: { root: 40, luck: 25, reputation: 80 },
                desc: '丐帮五袋弟子，帮中精英，可参与帮务决策。',
                title: '丐帮五袋',
                bonusDesc: '根骨+4，灵巧+2，福缘+1，气血+15，声望+15',
                statBonuses: { root: 4, dexterity: 2, luck: 1, maxHp: 15 },
                extraRep: 15,
                skillIds: ['f_beggar_staff', 'f_beggar_palm'],
                internalIds: ['beggar_heart'],
            },
            {
                name: '八袋长老',
                repRequired: 200,
                reqDesc: '根骨≥55，福缘≥35，声望≥130',
                requirements: { root: 55, luck: 35, reputation: 130 },
                desc: '丐帮八袋长老，帮中辈分最高者之一，可号令数万丐帮弟子。',
                title: '丐帮长老',
                bonusDesc: '根骨+6，灵巧+3，福缘+2，气血+25，声望+20',
                statBonuses: { root: 6, dexterity: 3, luck: 2, maxHp: 25 },
                extraRep: 20,
                skillIds: ['f_beggar_palm', 'f_beggar_staff'],
                internalIds: ['beggar_heart'],
            },
        ],
    },

    emei: {
        id: 'emei',
        name: '峨眉派',
        icon: '🌸',
        desc: '「峨眉天下秀，剑舞动九州」——以女子为主的门派，剑法轻灵飘逸，内功中正平和。',
        locationId: 'chengdu',
        venueName: '峨眉庵',
        stewardName: '灭绝师太',
        stewardDesc: '神情严肃的峨眉掌门，手持倚天剑，一身修为惊世骇俗。',
        stewardPower: 95,
        isEvil: false,
        exclusiveGroup: 'positive',

        ranks: [
            {
                name: '俗家弟子',
                repRequired: 0,
                reqDesc: '颜值≥20（男女皆可，女性优先）',
                requirements: { appearance: 20 },
                desc: '初入峨眉的俗家弟子，在庵中修习剑法基础。',
                title: '峨眉俗家',
                bonusDesc: '灵巧+2，颜值+1',
                statBonuses: { dexterity: 2, appearance: 1 },
                skillIds: ['f_emei_sword'],
                internalIds: ['emei_heart'],
            },
            {
                name: '入室弟子',
                repRequired: 45,
                reqDesc: '灵巧≥25，颜值≥25，声望≥30',
                requirements: { dexterity: 25, appearance: 25, reputation: 30 },
                desc: '正式拜入峨眉门下的弟子，得传峨眉心法和剑法精髓。',
                title: '峨眉入室',
                bonusDesc: '灵巧+3，颜值+2，悟性+1',
                statBonuses: { dexterity: 3, appearance: 2, wit: 1 },
                skillIds: ['f_emei_sword', 'f_emei_palm'],
                internalIds: ['emei_heart'],
            },
            {
                name: '真传弟子',
                repRequired: 100,
                reqDesc: '灵巧≥35，颜值≥30，声望≥75，悟性≥25',
                requirements: { dexterity: 35, appearance: 30, reputation: 75, wit: 25 },
                desc: '峨眉派真传弟子，有资格研习倚天剑诀。',
                title: '峨眉真传',
                bonusDesc: '灵巧+4，颜值+3，悟性+2，根骨+1，气血+10',
                statBonuses: { dexterity: 4, appearance: 3, wit: 2, root: 1, maxHp: 10 },
                skillIds: ['f_emei_yitian', 'f_emei_palm'],
                internalIds: ['emei_heart'],
            },
            {
                name: '掌门弟子',
                repRequired: 170,
                reqDesc: '灵巧≥45，颜值≥35，声望≥120，福缘≥30',
                requirements: { dexterity: 45, appearance: 35, reputation: 120, luck: 30 },
                desc: '峨眉派掌门继承人候选，剑法已臻化境。',
                title: '峨眉掌门弟子',
                bonusDesc: '灵巧+5，颜值+4，悟性+3，根骨+2，福缘+1，气血+20',
                statBonuses: { dexterity: 5, appearance: 4, wit: 3, root: 2, luck: 1, maxHp: 20 },
                skillIds: ['f_emei_yitian', 'f_emei_sword'],
                internalIds: ['emei_heart'],
            },
        ],
    },

    tang: {
        id: 'tang',
        name: '唐门',
        icon: '🎯',
        desc: '「蜀中唐门，暗器无双」——以暗器与毒药闻名天下的神秘世家。',
        locationId: 'chengdu',
        venueName: '唐家堡',
        stewardName: '唐傲',
        stewardDesc: '一身黑衣的唐门家主，神色冷峻，手指间夹着一枚淬毒的银针。',
        stewardPower: 100,
        isEvil: false,
        exclusiveGroup: 'neutral',

        ranks: [
            {
                name: '外门弟子',
                repRequired: 0,
                reqDesc: '灵巧≥25',
                requirements: { dexterity: 25 },
                desc: '唐门外门弟子，习练暗器基础手法和毒药基础。',
                title: '唐门外门',
                bonusDesc: '灵巧+2，根骨+1',
                statBonuses: { dexterity: 2, root: 1 },
                skillIds: ['f_tang_dart'],
                internalIds: ['tang_heart'],
            },
            {
                name: '内门弟子',
                repRequired: 50,
                reqDesc: '灵巧≥35，悟性≥25，声望≥40',
                requirements: { dexterity: 35, wit: 25, reputation: 40 },
                desc: '唐门内门弟子，得传五毒掌和制毒术。',
                title: '唐门内门',
                bonusDesc: '灵巧+3，根骨+2，悟性+1',
                statBonuses: { dexterity: 3, root: 2, wit: 1 },
                skillIds: ['f_tang_poison', 'f_tang_dart'],
                internalIds: ['tang_heart'],
            },
            {
                name: '核心弟子',
                repRequired: 110,
                reqDesc: '灵巧≥45，福缘≥25，声望≥80，悟性≥30',
                requirements: { dexterity: 45, luck: 25, reputation: 80, wit: 30 },
                desc: '唐门核心弟子，接触到唐门最高深的暗器和毒术。',
                title: '唐门核心',
                bonusDesc: '灵巧+4，根骨+3，悟性+2，福缘+1，气血+10',
                statBonuses: { dexterity: 4, root: 3, wit: 2, luck: 1, maxHp: 10 },
                skillIds: ['f_tang_rain', 'f_tang_poison'],
                internalIds: ['tang_heart'],
            },
            {
                name: '唐门长老',
                repRequired: 190,
                reqDesc: '灵巧≥55，福缘≥35，声望≥130，悟性≥40',
                requirements: { dexterity: 55, luck: 35, reputation: 130, wit: 40 },
                desc: '唐门长老，暗器手法出神入化，可一言决定唐门大事。',
                title: '唐门长老',
                bonusDesc: '灵巧+5，根骨+4，悟性+3，福缘+2，气血+20',
                statBonuses: { dexterity: 5, root: 4, wit: 3, luck: 2, maxHp: 20 },
                skillIds: ['f_tang_rain', 'f_tang_poison'],
                internalIds: ['tang_heart'],
            },
        ],
    },

    sunmoon: {
        id: 'sunmoon',
        name: '日月神教',
        icon: '🌙',
        desc: '「日月当空，唯我独尊」——行事诡秘的魔教，武功邪异霸道，被武林正道视为魔道。',
        locationId: 'jingcheng',
        venueName: '日月圣殿',
        stewardName: '向问天',
        stewardDesc: '面容冷峻的日月神教左使，一双眼睛锐利如鹰，武功深不可测。',
        stewardPower: 110,
        isEvil: true,
        exclusiveGroup: 'evil',

        ranks: [
            {
                name: '教众',
                repRequired: 0,
                reqDesc: '声望≥10，暗影声望≥10',
                requirements: { reputation: 10, shadowRep: 10 },
                desc: '初入神教的普通教众，在殿中听候差遣。',
                title: '神教教众',
                bonusDesc: '根骨+1，悟性+1',
                statBonuses: { root: 1, wit: 1 },
                skillIds: ['f_sunmoon_palm'],
                internalIds: ['sunmoon_heart'],
                joinCost: { reputation: -20 }, // 加入魔教损失正道声望
            },
            {
                name: '香主',
                repRequired: 50,
                reqDesc: '根骨≥30，悟性≥25，声望≥40，暗影声望≥20',
                requirements: { root: 30, wit: 25, reputation: 40, shadowRep: 20 },
                desc: '统管一方教务的香主，在上司面前说得上话。',
                title: '神教香主',
                bonusDesc: '根骨+2，悟性+2，灵巧+1',
                statBonuses: { root: 2, wit: 2, dexterity: 1 },
                skillIds: ['f_sunmoon_palm'],
                internalIds: ['sunmoon_heart'],
            },
            {
                name: '堂主',
                repRequired: 110,
                reqDesc: '根骨≥40，悟性≥35，声望≥80，暗影声望≥40',
                requirements: { root: 40, wit: 35, reputation: 80, shadowRep: 40 },
                desc: '统率一堂之众的堂主，手握生杀大权。',
                title: '神教堂主',
                bonusDesc: '根骨+3，悟性+3，灵巧+2，福缘+1，气血+15',
                statBonuses: { root: 3, wit: 3, dexterity: 2, luck: 1, maxHp: 15 },
                skillIds: ['f_sunmoon_sword', 'f_sunmoon_palm'],
                internalIds: ['sunmoon_heart'],
            },
            {
                name: '护法',
                repRequired: 190,
                reqDesc: '根骨≥50，悟性≥45，声望≥130，暗影声望≥60',
                requirements: { root: 50, wit: 45, reputation: 130, shadowRep: 60 },
                desc: '神教护法，仅次于教主的顶尖高手，位高权重。',
                title: '神教护法',
                bonusDesc: '根骨+5，悟性+4，灵巧+3，福缘+2，暗影声望+10，气血+25',
                statBonuses: { root: 5, wit: 4, dexterity: 3, luck: 2, maxHp: 25 },
                extraShadowRep: 10,
                skillIds: ['f_sunmoon_sword', 'f_sunmoon_palm'],
                internalIds: ['sunmoon_heart'],
            },
        ],
    },

    money: {
        id: 'money',
        name: '金钱帮',
        icon: '💰',
        desc: '「天下熙熙，皆为利来；天下攘攘，皆为利往」——以商立帮，富可敌国，唯利是图。',
        locationId: 'suzhou',
        venueName: '金钱帮总舵',
        stewardName: '钱不二',
        stewardDesc: '一身锦袍的金钱帮帮主，手里盘着两个金元宝，笑容可掬之下暗藏锋芒。',
        stewardPower: 70,
        isEvil: false,
        exclusiveGroup: null, // 金钱帮不排斥任何门派身份

        ranks: [
            {
                name: '帮众',
                repRequired: 0,
                reqDesc: '财富≥2000，缴纳1000两会费',
                requirements: {},
                customCheck: (p) => getPlayerTotalWealth(p) >= 2000,
                joinCost: { gold: 1000 },
                desc: '交钱就能入帮的普通帮众，负责帮中杂务和买卖。',
                title: '金钱帮众',
                bonusDesc: '经商折扣+5%',
                statBonuses: {},
                skillIds: ['f_money_palm'],
                internalIds: ['money_heart'],
                extraTradeDiscount: 0.05,
            },
            {
                name: '执事',
                repRequired: 50,
                reqDesc: '上缴200两，声望≥30',
                requirements: { reputation: 30 },
                joinCost: { gold: 200 },
                desc: '帮中执事，掌管一处分号的日常运营。',
                title: '金钱执事',
                bonusDesc: '经商折扣+10%，根骨+1',
                statBonuses: { root: 1 },
                skillIds: ['f_money_abacus', 'f_money_palm'],
                internalIds: ['money_heart'],
                extraTradeDiscount: 0.10,
            },
            {
                name: '掌柜',
                repRequired: 110,
                reqDesc: '声望≥70，悟性≥25（需上缴500两）',
                requirements: { reputation: 70, wit: 25 },
                joinCost: { gold: 500 },
                desc: '金钱帮掌柜，可独立经营一处分号，日进斗金。',
                title: '金钱掌柜',
                bonusDesc: '经商折扣+15%，根骨+2，悟性+2',
                statBonuses: { root: 2, wit: 2 },
                skillIds: ['f_money_abacus', 'f_money_palm'],
                internalIds: ['money_heart'],
                extraTradeDiscount: 0.15,
            },
            {
                name: '大掌柜',
                repRequired: 200,
                reqDesc: '声望≥120，悟性≥35，福缘≥25（需上缴1000两）',
                requirements: { reputation: 120, wit: 35, luck: 25 },
                joinCost: { gold: 1000 },
                desc: '金钱帮大掌柜，帮中决策层，掌控天下商路。',
                title: '金钱大掌柜',
                bonusDesc: '经商折扣+20%，根骨+3，悟性+3，灵巧+2，气血+15',
                statBonuses: { root: 3, wit: 3, dexterity: 2, maxHp: 15 },
                skillIds: ['f_money_abacus', 'f_money_palm'],
                internalIds: ['money_heart'],
                extraTradeDiscount: 0.20,
            },
        ],
    },
};

/* ─── 工具函数 ─── */

function getFaction(id) {
    return FACTIONS[id] || null;
}

function getFactionSkill(id) {
    return FACTION_SKILLS[id] || null;
}

/* 是否为门派专属武学（供过滤用） */
function isFactionSkill(skillId) {
    return skillId.startsWith('f_');
}

/* 获取某玩家所属门派的当前 rank 对象 */
function getCurrentRank(player) {
    if (!player.faction) return null;
    const f = FACTIONS[player.faction];
    if (!f) return null;
    return f.ranks[player.factionRank || 0] || null;
}

/* 检查玩家属性是否满足某 rank 的加入/晋升要求 */
function meetsRankRequirements(player, rank) {
    const req = rank.requirements;
    if (req.root != null && (player.attrs.root || 0) < req.root) return false;
    if (req.wit != null && (player.attrs.wit || 0) < req.wit) return false;
    if (req.luck != null && (player.attrs.luck || 0) < req.luck) return false;
    if (req.dexterity != null && (player.attrs.dexterity || 0) < req.dexterity) return false;
    if (req.appearance != null && (player.attrs.appearance || 0) < req.appearance) return false;
    if (req.reputation != null && (player.reputation || 0) < req.reputation) return false;
    if (req.shadowRep != null && (player.shadowRep || 0) < req.shadowRep) return false;
    // 自定义检查（用于门派特殊要求，如偷盗次数、济苍生等）
    if (rank.customCheck && !rank.customCheck(player)) return false;
    return true;
}

/* 能否支付 rank 的加入/晋升花费 */
function canPayRankCost(player, rank) {
    const cost = rank.joinCost || {};
    if (cost.gold != null && (player.gold || 0) < cost.gold) return false;
    return true;
}

/* 支付 rank 花费 */
function payRankCost(player, rank) {
    const cost = rank.joinCost || {};
    if (cost.gold) player.gold -= cost.gold;
    if (cost.reputation) player.reputation += cost.reputation; // negative means lose rep
}

/* 应用 statBonuses + rank-level extras */
function applyStatBonuses(player, rank) {
    const b = rank.statBonuses || {};
    if (b.root) player.attrs.root += b.root;
    if (b.wit) player.attrs.wit += b.wit;
    if (b.luck) player.attrs.luck += b.luck;
    if (b.dexterity) player.attrs.dexterity += b.dexterity;
    if (b.appearance) player.attrs.appearance += b.appearance;
    if (b.maxHp) player.maxHp += b.maxHp;
    if (rank.extraRep) player.reputation += rank.extraRep;
    if (rank.extraShadowRep) player.shadowRep += rank.extraShadowRep;
}

/* 反转去加（叛门时收回） */
function unapplyStatBonuses(player, rank) {
    const b = rank.statBonuses || {};
    if (b.root) player.attrs.root -= b.root;
    if (b.wit) player.attrs.wit -= b.wit;
    if (b.luck) player.attrs.luck -= b.luck;
    if (b.dexterity) player.attrs.dexterity -= b.dexterity;
    if (b.appearance) player.attrs.appearance -= b.appearance;
    if (b.maxHp) player.maxHp -= b.maxHp;
    if (rank.extraRep) player.reputation -= rank.extraRep;
    if (rank.extraShadowRep) player.shadowRep -= rank.extraShadowRep;
}

/* 获取某 rank 可学的武学列表 */
function getLearnableSkills(rank) {
    return (rank.skillIds || []).map(id => FACTION_SKILLS[id]).filter(Boolean);
}

/* 获取某 rank 可学的内功列表 */
function getLearnableInternalSkills(rank) {
    return (rank.internalIds || []).map(id => FACTION_INTERNAL_SKILLS[id]).filter(Boolean);
}

/* ═══ 财富系统 ─── 计算玩家总资产（现金+物品+装备） ═══ */
function getPlayerTotalWealth(player) {
    if (!player) return 0;
    let total = player.gold || 0;
    if (player.items) {
        for (const item of player.items) {
            total += item.value || 0;
        }
    }
    if (player.equipment) {
        for (const slot of Object.values(player.equipment)) {
            if (slot) total += slot.value || 0;
        }
    }
    return total;
}

/* ═══ 爬塔系统 ─── 九关试炼，每关一位守护者 ═══ */
const FACTION_TOWERS = {
    shaolin: {
        towerName: '木人巷',
        towerDesc: '少林寺历代高僧设置的试炼之路，共九关。每一关的木人都蕴含一种武学精要，闯过者可得真传。',
        factionId: 'shaolin',
        levels: [
            { level: 1, name: '第一关·罗汉堂',    guardianName: '罗汉木人',   combatPower: 35,  reward: { type: 'skill', skillId: 'f_shaolin_fist',   label: '罗汉拳谱' } },
            { level: 2, name: '第二关·棍僧阵',    guardianName: '棍僧木人',   combatPower: 50,  reward: { type: 'skill', skillId: 'f_shaolin_staff',  label: '少林棍法谱' } },
            { level: 3, name: '第三关·金刚堂',    guardianName: '金刚铜人',   combatPower: 65,  reward: { type: 'internal', internalId: 'shaolin_heart', label: '少林心法残卷' } },
            { level: 4, name: '第四关·指禅关',    guardianName: '指禅铜人',   combatPower: 80,  reward: { type: 'skill', skillId: 'f_shaolin_finger', label: '金刚指谱' } },
            { level: 5, name: '第五关·降魔阵',    guardianName: '降魔铜人',   combatPower: 95,  reward: { type: 'skill', skillId: 'f_shaolin_palm',    label: '大力金刚掌谱' } },
            { level: 6, name: '第六关·般若台',    guardianName: '般若银人',   combatPower: 110, reward: { type: 'internal', internalId: 'yijinjing',     label: '易筋经残卷·上' } },
            { level: 7, name: '第七关·龙象关',    guardianName: '龙象银人',   combatPower: 125, reward: { type: 'skill', skillId: 'f_shaolin_claw',   label: '龙爪手谱' } },
            { level: 8, name: '第八关·韦陀殿',    guardianName: '韦陀金人',   combatPower: 140, reward: { type: 'internal', internalId: 'yijinjing',     label: '易筋经残卷·下' } },
            { level: 9, name: '第九关·达摩院',    guardianName: '达摩金人',   combatPower: 160, reward: { type: 'title', title: '丈二金身', label: '丈二金身·称号', statBonuses: { root: 10, maxHp: 50 } } },
        ],
    },
    wudang: {
        towerName: '真武九阶',
        towerDesc: '武当派祖师张三丰留下的试炼之路，共九阶。每一阶都有真武大帝座下神将把守，登顶者可获真武传承。',
        factionId: 'wudang',
        levels: [
            { level: 1, name: '第一阶·松风',      guardianName: '松风剑侍',   combatPower: 35,  reward: { type: 'skill', skillId: 'f_wudang_palm',    label: '武当绵掌谱' } },
            { level: 2, name: '第二阶·鹤形',      guardianName: '鹤形道童',   combatPower: 50,  reward: { type: 'skill', skillId: 'f_wudang_fist',    label: '太极拳谱' } },
            { level: 3, name: '第三阶·龟蛇',      guardianName: '龟蛇二老',   combatPower: 65,  reward: { type: 'internal', internalId: 'wudang_heart', label: '纯阳无极功残卷·上' } },
            { level: 4, name: '第四阶·凌云',      guardianName: '凌云剑客',   combatPower: 80,  reward: { type: 'skill', skillId: 'f_wudang_light',   label: '梯云纵谱' } },
            { level: 5, name: '第五阶·绕指',      guardianName: '绕指柔剑',   combatPower: 95,  reward: { type: 'skill', skillId: 'f_wudang_sword',   label: '太极剑法谱' } },
            { level: 6, name: '第六阶·太虚',      guardianName: '太虚真人',   combatPower: 110, reward: { type: 'internal', internalId: 'wudang_heart', label: '纯阳无极功残卷·中' } },
            { level: 7, name: '第七阶·两仪',      guardianName: '两仪道者',   combatPower: 125, reward: { type: 'skill', skillId: 'f_wudang_sword',   label: '太极剑法精要' } },
            { level: 8, name: '第八阶·四象',      guardianName: '四象长老',   combatPower: 140, reward: { type: 'internal', internalId: 'wudang_heart', label: '纯阳无极功残卷·下' } },
            { level: 9, name: '第九阶·玄武',      guardianName: '真武大帝',   combatPower: 160, reward: { type: 'title', title: '真武剑意', label: '真武剑意·称号', statBonuses: { wit: 10, dexterity: 5 } } },
        ],
    },
};

function getFactionTower(factionId) {
    return FACTION_TOWERS[factionId] || null;
}

/* 门派加入时的正道/邪道冲突处理 */
function handleFactionJoinConflict(player, newFactionId) {
    const newF = FACTIONS[newFactionId];
    if (!newF) return;
    // 如果已有门派且属于互斥阵营，退出现有门派
    // 金钱帮（exclusiveGroup===null）不触发任何阵营冲突
    if (newF.exclusiveGroup == null) return true;
    if (player.faction) {
        const oldF = FACTIONS[player.faction];
        // 旧门派也无阵营约束时直接跳过
        if (oldF && oldF.exclusiveGroup == null) return true;
        if (oldF && oldF.exclusiveGroup === newF.exclusiveGroup && oldF.id !== newF.id) {
            // 同阵营不能叛门，只能退出后加入
            return false;
        }
        if (oldF && oldF.exclusiveGroup !== newF.exclusiveGroup) {
            // 跨阵营叛变 — 收回旧门派当前 rank 加成
            const oldRank = oldF.ranks[player.factionRank || 0];
            if (oldRank) unapplyStatBonuses(player, oldRank);
        }
    }
    return true;
}
