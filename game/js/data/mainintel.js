/* ─── 主线情报系统 ───
 * 4 个情报贩子（听风阁）散落在除中部外的四大地区各一座城：
 *   西北·长安 / 东北·京城 / 西南·成都 / 东南·姑苏
 * 城中酒楼、赌坊、茶馆、茶肆、黑市的 NPC 均有「打探情报」选项，
 * 情报内容随主线阶段（mainQuest）变化，扩展新阶段只需加分支。
 */

const INTEL_AGENT_VENUES = [
    { cityId: 'changan',  npcName: '路不平', npcDesc: '瘦削的情报贩子，一双眼睛滴溜溜转着，仿佛能看穿人心。' },
    { cityId: 'jingcheng', npcName: '赛百晓', npcDesc: '摇着蒲扇的情报贩子，自称这世上没有他不知道的事。' },
    { cityId: 'chengdu',  npcName: '包打听', npcDesc: '蹲在门口嗑瓜子的情报贩子，耳朵比谁都灵。' },
    { cityId: 'suzhou',   npcName: '活地图', npcDesc: '温吞吞的情报贩子，说话慢条斯理，消息却准得吓人。' },
];

function setupIntelAgents(world) {
    for (const def of INTEL_AGENT_VENUES) {
        const loc = world.big_cities.find(c => c.id === def.cityId) || world.small_cities.find(c => c.id === def.cityId);
        if (!loc) continue;
        if (loc.venues.some(v => v._isIntelVenue)) continue;
        loc.venues.push({
            name: '听风阁',
            _isIntelVenue: true,
            _intelCityId: def.cityId,
            npcs: [{
                npcName: def.npcName,
                npcDesc: def.npcDesc,
                civilian: true,
                combatPower: 0,
                items: [],
                _isIntelAgent: true,
            }],
        });
    }
}

/* 打探情报的提问列表：新增问题只需往这里加一条，并在 game.js 的
   intelMenu 里注册对应的处理分支。 */
const INTEL_QUESTIONS = [
    { key: 'disciple', text: '打听师弟沈清寒' },
    { key: 'factions', text: '打听门派势力' },
];

/* 听风阁各分号的线索文案（主线3·城中打探阶段） */
const INTEL_AGENT_CLUES = {
    changan: [
        '「西北道上风沙大，消息却传得快。」他压低声音：「半年前有商队说，在凉州一带见过一个白衣少年，佩着剑，行色匆匆，像是在躲什么人。」',
        '「我这有一桩旧闻——」他往四周看了看：「去年冬天，一个外乡人曾在长安城外打听过沈清寒这个名字，后来往西去了，再没音讯。」',
    ],
    jingcheng: [
        '「旧都的茶楼里有人提过——」他摇着蒲扇：「一个佩剑的少年四处打听沈清寒，说那是他失散多年的师弟。」',
        '「京城这地方，达官显贵的耳目多。」他压低嗓门：「有人见过沈清寒在旧都出现过，跟几个面色阴沉的汉子说了几句话，就走了。」',
    ],
    chengdu: [
        '「蜀道难行，但消息传得比马还快。」他嗑着瓜子：「上个月有贩子说，沈清寒曾在峨眉山脚露过面，身后远远吊着几个黑衣人。」',
        '「成都茶馆多，闲话也多。」他嘿嘿一笑：「有个跑江湖的说，沈清寒往南去了，像是要去大理的方向。」',
    ],
    suzhou: [
        '「江南水乡藏不住人。」他慢条斯理地说：「有人说沈清寒在姑苏城外出现过，跟一伙黑巾蒙面的人接头，之后就没了踪影。」',
        '「烟雨迷蒙，最易藏身。」他敲着桌面：「我听说沈清寒最后露面是在苏州码头，上了条往北去的船。」',
    ],
};

/* 暗杀组织各区域的巢穴：四大非中部区域各一座山（险地）。
   情报贩子按男主当前所在区域推荐对应那座。 */
function getRegionMountain(regionId) {
    return (WORLD.danger_zones || []).find(z => getRegion(z.id) === regionId) || null;
}

/* 暗杀组织（各区域巢穴山）埋伏战 */
const INTEL_AMBUSH = {
    enemyName: '蒙面杀手',
    enemyCp: 42,
    intro: [
        '你踏上蜿蜒的山道，两侧林木忽然无风自动。',
        '「呼啦」一声，两道黑影从树梢跃下，一前一后堵住了你的去路！',
        '黑衣蒙面的杀手一言不发，手中短刃寒光一闪——埋伏！',
    ],
    win: [
        '你拼尽全力将两名杀手击倒在地，最后一个黑衣人临死前嘶声道：「组……组织不会放过你的……」',
        '你在他身上搜了搜，除了一枚刻着乌鸦图案的铁牌，别无他物。',
    ],
};
