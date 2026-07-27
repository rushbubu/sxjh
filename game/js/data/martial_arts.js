const SKILL_QUALITIES = {
    white:  { name: '普通', maxLevel: 3, color: '#a0a0a0', fixedBase: 2, fixedPerLevel: 2, maxLevelCoeff: 1.05 },
    green:  { name: '良好', maxLevel: 3, color: '#50a050', fixedBase: 3, fixedPerLevel: 3, maxLevelCoeff: 1.08 },
    blue:   { name: '精良', maxLevel: 4, color: '#5080c0', fixedBase: 5, fixedPerLevel: 5, maxLevelCoeff: 1.10 },
    purple: { name: '卓越', maxLevel: 4, color: '#a060d0', fixedBase: 8, fixedPerLevel: 8, baseCoeff: 1.10, maxLevelCoeff: 1.20 },
    orange: { name: '绝世', maxLevel: 5, color: '#d08040', fixedBase: 10, fixedPerLevel: 10, baseCoeff: 1.15, maxLevelCoeff: 1.25 },
    gold:   { name: '传说', maxLevel: 5, color: '#d0a040', fixedBase: 12, fixedPerLevel: 12, baseCoeff: 1.20, maxLevelCoeff: 1.35 },
};

const MARTIAL_ARTS = {
    // 村庄武学
    mantis:    { name: '螳螂拳',   desc: '模仿螳螂捕食之态的拳法，出手迅捷，虚实相生。',          luckReq: 10, type: 'fist',  quality: 'green' },
    xingyi:    { name: '形意拳',   desc: '以意导气，以气催力，内外合一，刚柔并济。',                luckReq: 10, type: 'fist',  quality: 'white' },
    tantui:    { name: '谭腿',     desc: '北派腿法正宗，出腿如鞭，扫堂如风。',                       luckReq: 10, type: 'kick',  quality: 'green' },
    hongquan:  { name: '洪拳',     desc: '大开大合的硬桥硬马功夫，势大力沉。',                       luckReq: 10, type: 'fist',  quality: 'green' },
    tongbi:    { name: '通臂拳',   desc: '通臂达肩，放长击远，拳出如箭。',                           luckReq: 12, type: 'fist',  quality: 'green' },
    baji:      { name: '八极拳',   desc: '文有太极安天下，武有八极定乾坤。拳法刚猛爆烈。',            luckReq: 12, type: 'fist',  quality: 'green' },
    tiesha:    { name: '铁砂掌',   desc: '以铁砂练掌，掌风过处，碎石裂碑。',                         luckReq: 14, type: 'palm',  quality: 'purple', element: '火' },
    mianzhang: { name: '绵掌',     desc: '看似轻柔无力，实则内劲暗藏，中者如遭重锤。',               luckReq: 10, type: 'palm',  quality: 'white' },
    fuhu:      { name: '伏虎拳',   desc: '少林入门拳法，拳路沉稳，步步为营。',                       luckReq: 12, type: 'fist',  quality: 'green' },
    feiyan:    { name: '飞燕腿',   desc: '轻灵如燕的腿法，专攻上三路，令人防不胜防。',               luckReq: 12, type: 'kick',  quality: 'green' },

    // 基础拳掌
    wang_ba_quan:  { name: '王八拳', desc: '毫无章法的乱拳，但抡起来虎虎生风，全凭一股蛮劲。',        luckReq: 6,  type: 'fist',  quality: 'white' },
    ye_gou_quan:   { name: '野狗拳', desc: '如野狗撕咬般毫无套路可言，专攻下三路，阴狠毒辣。',       luckReq: 6,  type: 'fist',  quality: 'white' },
    chang_quan:    { name: '长拳',   desc: '江湖最常见的入门拳法，四平八稳，招正势圆。',             luckReq: 8,  type: 'fist',  quality: 'white' },
    wang_ba_zhang: { name: '王八掌', desc: '龟缩防守的掌法，看似笨拙实则稳如磐石，以静制动。',       luckReq: 6,  type: 'palm',  quality: 'white' },
    kuai_zhang:    { name: '快掌',   desc: '以快制胜的掌法，出掌如风，让人眼花缭乱，应接不暇。',    luckReq: 8,  type: 'palm',  quality: 'white' },
    kai_shan_zhang:{ name: '开山掌', desc: '大开大合的掌法，掌力雄浑，一往无前，有开山之势。',      luckReq: 10, type: 'palm',  quality: 'white' },

    // 城市武馆
    zuiquan:   { name: '醉拳',     desc: '形醉意不醉，步醉心不醉，看似东倒西歪实则暗藏杀机。',       luckReq: 15, type: 'fist',  quality: 'purple' },
    taiji:     { name: '太极拳',   desc: '以柔克刚，四两拨千斤，武林中最深奥的拳法之一。',            luckReq: 15, type: 'fist',  quality: 'orange', element: '阴阳' },
    tiezhang:  { name: '铁掌',     desc: '掌力沉雄，一掌下去铁板留痕，是硬功中的极品。',              luckReq: 15, type: 'palm',  quality: 'blue' },
    caidao:    { name: '柴刀十八路',desc: '樵夫砍柴多年自悟的刀法，看似粗鄙实则招招实用，专攻下盘。',  luckReq: 14, type: 'blade', quality: 'blue' },
    zhuifeng:  { name: '追风剑法', desc: '快如流星，疾似追风，剑出必见血。',                          luckReq: 18, type: 'sword', quality: 'purple', element: '风' },
    longzhua:  { name: '龙爪手',   desc: '少林七十二绝技之一，爪力可洞金穿石。',                      luckReq: 20, type: 'fist',  quality: 'purple' },
    tiangang:  { name: '天罡拳',   desc: '三十六路天罡拳，拳拳相扣，连绵不绝。',                      luckReq: 22, type: 'fist',  quality: 'blue' },
    jingang:   { name: '金刚伏魔掌', desc: '佛门至高掌法，一掌击出有金刚降魔之威。',                  luckReq: 25, type: 'palm',  quality: 'purple', element: '阳' },
    wuying:    { name: '无影脚',   desc: '出脚无影，收脚无声，中者甚至不知自己如何中招。',            luckReq: 20, type: 'kick',  quality: 'purple', element: '风' },
    nianhua:   { name: '拈花指',   desc: '佛祖拈花，迦叶一笑。指法轻柔如拂花，实则可隔空点穴。',      luckReq: 25, type: 'finger',quality: 'purple', element: '阴' },

    // 门派武学
    shaolin_quan: { name: '少林拳', desc: '少林入门拳法，根基扎实，堂堂正正，有金刚之势。',           luckReq: 14, type: 'fist',  quality: 'blue' },
    wudang_quan:  { name: '武当拳', desc: '武当基础拳法，以柔克刚，绵里藏针，暗合太极之道。',         luckReq: 14, type: 'fist',  quality: 'blue' },

    // 特殊 / 道场
    yiyangzhi: { name: '一阳指',   desc: '大理段氏绝学，以指代剑，凌空点穴，天下无双。',              luckReq: 20, type: 'finger',quality: 'gold', element: '阳' },

    // 掌法绝学
    bo_re_zhang:     { name: '般若掌',   desc: '少林七十二绝技之一，掌中蕴藏无上佛法，中者如受当头棒喝。',         luckReq: 22, type: 'palm',  quality: 'purple', element: '阳' },
    han_bing_shen_zhang:{ name: '寒冰神掌', desc: '至阴至寒的掌法，掌风过处寒冰凝结，中者经脉冻僵。',             luckReq: 24, type: 'palm',  quality: 'purple', element: '冰' },
    qian_shou_ru_lai_zhang:{ name: '千手如来掌', desc: '佛门至高掌法，一掌化千，千掌归一，无懈可击。',            luckReq: 28, type: 'palm',  quality: 'orange', element: '阳' },

    // 少林七十二绝技 — 拳法
    shao_lin_chang_quan:{ name: '少林长拳', desc: '少林入门拳法，拳路工整扎实，是少林武学之根基。',                  luckReq: 10, type: 'fist',  quality: 'green' },
    luo_han_quan:     { name: '罗汉拳',   desc: '少林基础拳法，招式沉稳大气，有罗汉降魔之势。',                        luckReq: 12, type: 'fist',  quality: 'blue' },
    wei_tuo_chu:      { name: '韦陀杵',   desc: '少林护法绝技，拳势如杵，刚猛无匹，中者如受重杵一击。',                  luckReq: 16, type: 'fist',  quality: 'purple', element: '阳' },

    // 少林七十二绝技 — 掌法
    da_jin_gang_zhang: { name: '大金刚掌', desc: '少林至高掌法之一，掌力雄浑如金刚降世，摧山断岳。',                     luckReq: 24, type: 'palm',  quality: 'purple', element: '阳' },
    xu_mi_shan_zhang:  { name: '须弥山掌', desc: '掌力隔空而至，如须弥山压顶，令人避无可避。',                            luckReq: 24, type: 'palm',  quality: 'purple', element: '阳' },
    jin_gang_bo_re_zhang:{ name: '金刚般若掌', desc: '融金刚之刚与般若之慧于一体，掌法精妙绝伦。',                      luckReq: 26, type: 'palm',  quality: 'purple', element: '阳' },
    xiang_mo_zhang:    { name: '降魔掌',   desc: '少林降魔卫道之掌法，堂堂正正，势不可挡。',                              luckReq: 22, type: 'palm',  quality: 'purple', element: '阳' },
    yi_pai_liang_san:  { name: '一拍两散', desc: '一掌拍出，玉石俱焚，对手内息尽数溃散。',                                luckReq: 26, type: 'palm',  quality: 'purple', element: '阳' },

    // 少林七十二绝技 — 指法
    duo_luo_ye_zhi:     { name: '多罗叶指', desc: '一指弹出如多罗叶纷飞，指力纵横交错，不可捉摸。',                      luckReq: 22, type: 'finger', quality: 'purple', element: '阳' },
    wu_xiang_jie_zhi:   { name: '无相劫指', desc: '无相无形，指力悄然而至，中者如遭劫数。',                                luckReq: 22, type: 'finger', quality: 'purple', element: '阳' },
    mo_he_zhi:          { name: '摩诃指',   desc: '大摩诃指法，指力磅礴，有包容万象之势。',                               luckReq: 22, type: 'finger', quality: 'purple', element: '阳' },
    da_li_jin_gang_zhi: { name: '大力金刚指', desc: '指力可碎金裂石，是少林硬功指法之最。',                               luckReq: 24, type: 'finger', quality: 'purple', element: '阳' },
    yi_zhi_chan:        { name: '一指禅',   desc: '少林至高指法之一，一指可破天下万法。',                                 luckReq: 24, type: 'finger', quality: 'purple', element: '阳' },
    da_zhi_wu_ding_zhi: { name: '大智无定指', desc: '指法变幻莫测，无迹可寻，蕴大智慧于其中。',                            luckReq: 22, type: 'finger', quality: 'purple', element: '阳' },
    qu_fan_nao_zhi:     { name: '去烦恼指', desc: '一指拂过，令人烦恼尽消，中者浑然不觉。',                                luckReq: 22, type: 'finger', quality: 'purple', element: '阳' },
    tian_zhu_fo_zhi:    { name: '天竺佛指', desc: '自天竺传来的佛门指法，古拙质朴而威力无穷。',                            luckReq: 22, type: 'finger', quality: 'purple', element: '阳' },

    // 少林七十二绝技 — 刀棍
    ran_mu_dao_fa:      { name: '燃木刀法', desc: '少林刀法绝技，刀气炽热可燃木生火。',                                    luckReq: 22, type: 'blade',   quality: 'purple', element: '火' },
    fu_mo_zhang_fa:     { name: '伏魔杖法', desc: '少林镇寺杖法，杖影如山，妖魔辟易。',                                    luckReq: 22, type: 'bludgeon', quality: 'purple', element: '阳' },
    feng_mo_zhang_fa:   { name: '疯魔杖法', desc: '杖法癫狂如疯似魔，以攻为守，不死不休。',                                luckReq: 20, type: 'bludgeon', quality: 'purple', element: '阳' },

    // 少林七十二绝技 — 手法
    shao_lin_qin_na:    { name: '少林擒拿十八打', desc: '少林擒拿手法集大成者，锁扣缠拿变化无穷。',                        luckReq: 18, type: 'fist',  quality: 'purple', element: '阳' },
    bo_luo_mi_shou:     { name: '波罗密手', desc: '以佛法波罗密为喻，掌法如渡彼岸，精妙绝伦。',                             luckReq: 22, type: 'palm',  quality: 'purple', element: '阳' },
    da_ci_da_bei_qian_shou_shi:{ name: '大慈大悲千手式', desc: '以千手千眼之意演化，攻守兼备，无懈可击。',               luckReq: 26, type: 'palm',  quality: 'purple', element: '阳' },

    // 少林七十二绝技 — 功法
    jia_sha_fu_mo_gong:{ name: '袈裟伏魔功', desc: '以袈裟为兵器，柔软中蕴含刚劲，伏魔于无形。',                          luckReq: 24, type: 'fist',  quality: 'purple', element: '阳' },
    po_na_gong:        { name: '破衲功',   desc: '看似破旧袈裟，实则暗藏内劲，可卸力反击。',                               luckReq: 20, type: 'fist',  quality: 'purple', element: '阳' },
    tie_xiu_gong:      { name: '铁袖功',   desc: '铁袖一挥，劲风如刀，柔中带刚，防不胜防。',                               luckReq: 20, type: 'fist',  quality: 'purple', element: '阳' },
    xiu_li_qian_kun:   { name: '袖里乾坤', desc: '大袖一挥，包容万物，以柔克刚，纳敌攻势于无形。',                          luckReq: 22, type: 'fist',  quality: 'purple', element: '阳' },
    jin_gang_chan_shi_zi_hou:{ name: '金刚禅狮子吼', desc: '以佛门狮子吼音功震摄心神，一声断喝可令敌胆裂。',              luckReq: 26, type: 'fist',  quality: 'orange', element: '阳' },

    // 少林七十二绝技 — 无上内功
    jin_gang_bu_huai_ti:{ name: '金刚不坏体神功', desc: '少林第一护体神功，练成后金刚不坏，刀枪不入。',                   luckReq: 28, type: 'fist',  quality: 'orange', element: '阳' },
    xi_sui_jing:       { name: '洗髓经',   desc: '少林无上内功秘典，洗髓伐脉，脱胎换骨。',                                 luckReq: 30, type: 'fist',  quality: 'orange', element: '阳' },
    yi_jin_jing:       { name: '易筋经',   desc: '少林镇寺之宝，武林至尊内功，练成后天下无敌。',                            luckReq: 35, type: 'fist',  quality: 'gold',   element: '阳' },

    // 爪系武学（可造成撕裂）
    hei_hu_tao_xin: { name: '黑虎掏心', desc: '虎爪之形，猛恶无比，专取人心，爪风如刀。',             luckReq: 12, type: 'fist',  quality: 'green' },
    hu_zhua_shou:   { name: '虎爪手',   desc: '模仿猛虎扑击之势，爪爪带风，撕裂筋骨。',                luckReq: 14, type: 'fist',  quality: 'green' },
    long_hu_zhua:   { name: '龙虎爪',   desc: '融龙虎之形于一体，爪力可穿金裂石，威力无穷。',          luckReq: 18, type: 'fist',  quality: 'blue' },
};

function getMartialArt(id) {
    return MARTIAL_ARTS[id] || null;
}

function getSkillFixedPower(quality, level) {
    const q = SKILL_QUALITIES[quality];
    if (!q) return 0;
    return q.fixedBase + q.fixedPerLevel * (level - 1);
}

function getSkillCoefficient(quality, level) {
    const q = SKILL_QUALITIES[quality];
    if (!q) return 1.0;
    if (q.baseCoeff) {
        if (level >= q.maxLevel) return q.maxLevelCoeff;
        return q.baseCoeff;
    }
    if (level >= q.maxLevel) return q.maxLevelCoeff;
    return 1.0;
}

function getSkillActionCost(skill) {
    if (skill.quality === 'gold' || skill.quality === 'orange') return 3;
    if (skill.quality === 'purple' || skill.quality === 'blue') return 2;
    return 1;
}

function getSkillPowerTotal(basePower, weaponPower, fixedPower, coefficient) {
    return Math.floor((basePower + weaponPower + fixedPower) * coefficient);
}
