const MARTIAL_ARTS = {
    // 村庄武学（10种）
    mantis:    { name: '螳螂拳',   desc: '模仿螳螂捕食之态的拳法，出手迅捷，虚实相生。',          luckReq: 10 },
    xingyi:    { name: '形意拳',   desc: '以意导气，以气催力，内外合一，刚柔并济。',                luckReq: 10 },
    tantui:    { name: '谭腿',     desc: '北派腿法正宗，出腿如鞭，扫堂如风。',                       luckReq: 10 },
    hongquan:  { name: '洪拳',     desc: '大开大合的硬桥硬马功夫，势大力沉。',                       luckReq: 10 },
    tongbi:    { name: '通臂拳',   desc: '通臂达肩，放长击远，拳出如箭。',                           luckReq: 12 },
    baji:      { name: '八极拳',   desc: '文有太极安天下，武有八极定乾坤。拳法刚猛爆烈。',            luckReq: 12 },
    tiesha:    { name: '铁砂掌',   desc: '以铁砂练掌，掌风过处，碎石裂碑。',                         luckReq: 12 },
    mianzhang: { name: '绵掌',     desc: '看似轻柔无力，实则内劲暗藏，中者如遭重锤。',               luckReq: 10 },
    fuhu:      { name: '伏虎拳',   desc: '少林入门拳法，拳路沉稳，步步为营。',                       luckReq: 12 },
    feiyan:    { name: '飞燕腿',   desc: '轻灵如燕的腿法，专攻上三路，令人防不胜防。',               luckReq: 12 },

    // 城市武馆
    zuiquan:   { name: '醉拳',     desc: '形醉意不醉，步醉心不醉，看似东倒西歪实则暗藏杀机。',       luckReq: 15 },
    taiji:     { name: '太极拳',   desc: '以柔克刚，四两拨千斤，武林中最深奥的拳法之一。',            luckReq: 15 },
    tiezhang:  { name: '铁掌',     desc: '掌力沉雄，一掌下去铁板留痕，是硬功中的极品。',              luckReq: 15 },
    zhuifeng:  { name: '追风剑法', desc: '快如流星，疾似追风，剑出必见血。',                          luckReq: 18 },
    longzhua:  { name: '龙爪手',   desc: '少林七十二绝技之一，爪力可洞金穿石。',                      luckReq: 20 },
    tiangang:  { name: '天罡拳',   desc: '三十六路天罡拳，拳拳相扣，连绵不绝。',                      luckReq: 22 },
    jingang:   { name: '金刚掌',   desc: '佛门至高掌法，一掌击出有金刚降魔之威。',                    luckReq: 25 },
    wuying:    { name: '无影脚',   desc: '出脚无影，收脚无声，中者甚至不知自己如何中招。',            luckReq: 20 },
    nianhua:   { name: '拈花指',   desc: '佛祖拈花，迦叶一笑。指法轻柔如拂花，实则可隔空点穴。',      luckReq: 25 },

    // 特殊 / 道场
    yiyangzhi: { name: '一阳指',   desc: '大理段氏绝学，以指代剑，凌空点穴，天下无双。',              luckReq: 20 },
};

function getMartialArt(id) {
    return MARTIAL_ARTS[id] || null;
}
