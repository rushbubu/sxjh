/* ═══ 皇宫系统：场所数据 + 全部游戏逻辑（妃嫔寝宫注入 / 御膳房偷膳 / 珍宝馆） ═══ */

const PALACE_VENUES = [
    v('午门', '李公公', '皇宫内务总管，掌管宫廷采买，皇帝面前的红人。', ['nine_dragon_cup', 'dragon_tea', 'incense', 'gold_silk_armor', 'silk_gold', 'peony_painting', 'brocade_robe', 'silver_ingot'], false, 150),
    v('太和殿', '皇帝', '大燕王朝当今圣上，端坐龙椅之上，不怒自威。', ['nine_dragon_cup', 'dragon_tea', 'gold_silk_armor', 'silk_gold', 'silver_ingot'], false, 200),
    v('御花园', '御花园总管', '打理御花园的老太监，最心疼那些奇花异草。', ['peony_painting', 'dragon_tea', 'incense'], false, 60),
    v('太液池', '守池太监', '太液池边看守的老太监，说这池中养着皇家的珍稀龙鲤。', [], false, 0),
    v('御膳房', '御厨', '御膳房的掌勺御厨，煎炒烹炸无一不精。', [], false, 0),
    v('珍宝馆', '珍宝馆总管', '掌管皇宫历代奇珍的老太监，昼伏夜出，寸步不离珍宝馆，目光如鹰。', [], false, 160),
    v('御林军营地', '御林军统领', '御林军统领，一身铁甲寒光凛凛，是御前禁军中最精锐的存在。', [], false, 160),
];

class PalaceManager {
    constructor(game) {
        this.game = game;
        this.palaceConsorts = null;
        this._palaceInjected = false;
    }

    /* ─── 皇宫场所与妃嫔寝宫注入 ─── */

    injectPalaceVenues() {
        if (this._palaceInjected) return;
        this._palaceInjected = true;
        const g = this.game;
        const shendu = WORLD.big_cities.find(c => c.id === 'shendu');
        if (!shendu) return;
        // 基础皇宫场所（自 world.js 迁来，此处注入回神都，保持原先的相对位置）
        if (!shendu.venues.some(x => x.name === '午门')) {
            const anchor = shendu.venues.findIndex(x => x.name === '百草堂');
            const at = anchor === -1 ? shendu.venues.length : anchor;
            shendu.venues.splice(at, 0,
                ...PALACE_VENUES.map(v => ({ ...v, npcs: v.npcs.map(n => ({ ...n, items: n.items.slice() })) })));
        }
        if (!this.palaceConsorts) {
            const usedNames = new Set(Object.values(g.beautyMap || {}).flat().map(b => b.name));
            this.palaceConsorts = {
                donggong: generateConsorts('donggong', usedNames),
                lenggong: generateConsorts('lenggong', usedNames),
            };
        }
        const mkVenue = (c) => {
            const group = c._lenggong ? '冷宫' : '东宫';
            return {
                name: `${group}·${c.name}寝宫`,
                _isPalaceConsortVenue: true,
                npcs: [{
                    npcName: c.name,
                    npcDesc: `${c._lenggong ? '居于冷宫的失宠妃嫔' : '东宫的妃嫔'}，${c.faceDesc}`,
                    isBeauty: true,
                    _beautyData: c,
                    civilian: true,
                    combatPower: 0,
                    items: [],
                }],
            };
        };
        const consortVenues = [
            ...this.palaceConsorts.donggong.map(mkVenue),
            ...this.palaceConsorts.lenggong.map(mkVenue),
        ];
        let idx = shendu.venues.findIndex(v => v.name === '御林军营地');
        if (idx === -1) idx = shendu.venues.findIndex(v => v.name === '午门');
        shendu.venues.splice(idx + 1, 0, ...consortVenues);
    }

    isPalaceVenue(venue) {
        return venue && (PALACE_VENUES.some(pv => pv.name === venue.name) || venue.name.includes('寝宫'));
    }

    /* ─── 御膳房偷膳 ─── */

    royalKitchenSteal(venue, npc) {
        const g = this.game;
        g.clearChoices();
        const night = g.player.timePeriod === '黄昏' || g.player.timePeriod === '子时';
        const intro = night
            ? '此刻宫门深锁，御膳房早已熄了灶火，案上还摆着御厨们用过的残羹剩菜。'
            : '御厨们正忙得脚不沾地，灶台上摆着一道道刚出锅的御膳珍馐。';
        g.addMessage(`你溜进御膳房，${intro}`, 'narrator');
        g.showChoices([
            { text: night ? '偷剩菜（难度略低）' : '偷御膳正餐（难度极高）', action: () => this.stealKitchenFood(venue, night) },
            { text: '算了', action: () => g.interactNpc(venue, npc) },
        ]);
    }

    stealKitchenFood(venue, night) {
        const g = this.game;
        g.clearChoices();
        const item = night ? getItem('palace_leftover') : getItem('royal_feast');
        const dex = g.player.attrs.dexterity;
        const chance = Math.max(0.05, Math.min(0.95, dex / (dex + item.stealDiff * 1.5) + (g.player.attrs.luck - 50) / 500));
        const roll = Math.random();
        if (roll < chance) {
            g.addMessage(`你眼疾手快，趁无人注意将「${item.name}」揣进怀里！`, 'event');
            g.addMessage('得手了！你迅速退出御膳房。', 'event');
            g.player.shadowRep += 1;
            g.player._theftCount = (g.player._theftCount || 0) + 1;
            g._adjEvil(2, '偷盗');
            const stolen = { ...item };
            if (!g.autoEquip(stolen)) g.player.items.push(stolen);
            g.updateStatsBar();
            setTimeout(() => g.enterVenue(venue), 400);
        } else {
            g.addMessage('「什么人！」御膳房外传来一声暴喝——巡夜的御林军脚步声由远及近！', 'danger');
            g.addMessage('你仓皇翻窗逃出皇宫，险些被当场拿获！', 'danger');
            g.player.reputation -= 2;
            g.addMessage(`声望 -2（当前 ${g.player.reputation}）`, 'system');
            g.player.neili -= 10;
            if (g.player.reputation <= -40) { g.gameOver('你在皇宫偷膳失手，被御林军擒获押入天牢。江湖之路，到此为止……'); return; }
            g.updateStatsBar();
            setTimeout(() => g.enterVenue(venue), 500);
        }
    }

    /* ─── 珍宝馆偷绝世材料 ─── */

    treasuryTodayItem() {
        // 每日刷新一种绝世材料：玄铁・陨星铁・天蚕丝・龙鳞・凤羽・星髓
        const ids = ['mystic_iron', 'meteor_iron', 'celestial_silk', 'dragon_scale', 'phoenix_plume', 'star_essence'];
        const st = this.game.player._treasuryDaily;
        if (!st || st.day !== this.game.player.day) {
            const pick = ids[Math.floor(Math.random() * ids.length)];
            this.game.player._treasuryDaily = { day: this.game.player.day, itemId: pick };
            return pick;
        }
        return st.itemId;
    }

    treasurySteal(venue, npc) {
        const g = this.game;
        g.clearChoices();
        const itemId = this.treasuryTodayItem();
        const item = getItem(itemId);
        const dex = g.player.attrs.dexterity;
        g.addMessage('珍宝馆戒备森严，四角立着龙纹描金的宝匣，你趁着老太监打盹的间隙潜入。', 'narrator');
        g.addMessage(`馆中今夜陈列的绝世材料是——${item.name}（价值 ${item.value}两）。`, 'info');
        if ((dex || 0) < 100) {
            g.addMessage(`你试着摸向那${item.name}……可守卫岗哨层层交替，你的灵巧（${dex}）还不够炉火纯青。`, 'danger');
            g.addMessage('只差一点就被巡卫发觉，你只得收手退出。', 'narrator');
            g.showChoices([{ text: '罢了', action: () => g.enterVenue(venue) }]);
            return;
        }
        const chance = Math.min(0.6, 0.35 + (dex - 100) * 0.005);
        const pct = Math.floor(chance * 100);
        g.showChoices([
            { text: `摸走${item.name}（约 ${pct}% 得手，失败则惊动卫士）`, action: () => this.treasuryAttempt(venue, npc, item) },
            { text: '收手离开', action: () => g.enterVenue(venue) },
        ]);
    }

    treasuryAttempt(venue, npc, item) {
        const g = this.game;
        g.clearChoices();
        const dex = g.player.attrs.dexterity;
        const chance = Math.min(0.6, 0.35 + (dex - 100) * 0.005);
        const roll = Math.random();
        if (roll < chance) {
            g.addMessage(`你的指尖快如鬼魅，轻轻探向宝匣——「咔」的一声暗锁被挑开，${item.name}无声落入掌中！`, 'event');
            g.addMessage('得手了！你将绝世材料收入囊中，悄无声息地退出珍宝馆。', 'event');
            g.player.shadowRep += 1;
            g._adjEvil(2, '偷盗');
            const stolen = { ...item };
            g.player.items.push(stolen);
            g.updateStatsBar();
            setTimeout(() => g.enterVenue(venue), 400);
        } else {
            g.addMessage('「咔嚓——」你指尖微顿，竟牵动了宝匣下的暗铃！珍宝馆外顿时传来急促的脚步声！', 'danger');
            g.addMessage('御林军甲胄铿锵作响，你已被团团围住！杀出一条血路！', 'danger');
            g.player.reputation -= 2;
            g.player.shadowRep += 1;
            g.updateStatsBar();
            this.treasuryBattle(venue, 1);
        }
    }

    treasuryBattle(venue, wave) {
        const g = this.game;
        // 三波：第一波1名御林卫士，第二波2名，第三波御林精锐・鎏金甲士
        const waves = [
            { label: '第一波', name: '御林卫士', cp: 55, count: 1 },
            { label: '第二波', name: '御林卫士', cp: 55, count: 2 },
            { label: '第三波', name: '御林精锐・鎏金甲士', cp: 70, count: 3 },
        ];
        if (wave > 3) {
            g.addMessage('三波卫士尽数被你击退，你趁乱翻出宫墙，扬长而去！', 'success');
            g.showChoices([{ text: '离开', action: () => g.enterVenue(venue) }]);
            return;
        }
        const w = waves[wave - 1];
        const name = w.count > 1 ? `${w.name}×${w.count}` : w.name;
        const cp = w.count > 1 ? Math.floor(w.cp * w.count * 0.8) : w.cp;
        const enemy = createGenericEnemy(name, cp);
        g.addMessage(`${w.label}：${name}拦住了去路！`, 'battle');
        g.startBattle(enemy,
            () => this.treasuryBattle(venue, wave + 1),
            () => this.treasuryCaught(venue),
            () => this.treasuryFlee(venue));
    }

    treasuryCaught(venue) {
        const g = this.game;
        g.addMessage('你寡不敌众，被御林军当场擒获！', 'danger');
        g.addMessage('御林军将你五花大绑，掷出宫门外，还被抄走了身上一半银两。', 'danger');
        g.player.gold = Math.floor(g.player.gold / 2);
        g.player.reputation -= 2;
        g.player.neili = Math.floor(g.player.neili / 2);
        g.addMessage(`银两损失一半（剩余 ${g.player.gold}两）· 声望 -2（当前 ${g.player.reputation}）`, 'system');
        if (g.player.reputation <= -40) { g.gameOver('你屡犯皇宫，被御林军押入天牢。江湖之路，到此为止……'); return; }
        g.updateStatsBar();
        setTimeout(() => g.enterVenue(venue), 500);
    }

    treasuryFlee(venue) {
        const g = this.game;
        g.addMessage('你无心恋战，寻了个破绽拔足狂奔，身后喊杀声渐远……', 'narrator');
        g.addMessage('总算侥幸逃出皇宫，只是气喘吁吁，狼狈不堪。', 'danger');
        g.player.neili = Math.floor(g.player.neili / 2);
        g.player.reputation -= 1;
        g.updateStatsBar();
        setTimeout(() => g.enterVenue(venue), 500);
    }

    /* ─── 皇宫中间分组（前朝三大殿/御苑/后三宫・珍宝馆…） ─── */

    palaceGroups() {
        const vs = this.game.player.locationVenues || [];
        const groups = [
            {
                label: '前朝三大殿',
                desc: '午门之外的宫门内，大朝议政的殿宇巍峨，御林禁军的营地也设在此间护驾。',
                venues: vs.filter(v => ['午门', '太和殿', '御花园', '御林军营地'].includes(v.name)),
            },
            {
                label: '御苑',
                desc: '太液池水波涟涟，游鱼可数；御膳房珍馐百味，香飘十里。',
                venues: vs.filter(v => ['太液池', '御膳房'].includes(v.name)),
            },
            {
                label: '后三宫·珍宝馆',
                desc: '后宫妃嫔寝居之处，东宫佳丽如云，冷宫亦有红颜，珍宝馆深藏历代奇珍。',
                venues: vs.filter(v => v._isPalaceConsortVenue || v.name === '珍宝馆'),
            },
        ];
        return groups.filter(x => x.venues.length > 0);
    }

    showPalaceMenu() {
        const g = this.game;
        g.clearChoices();
        g._groupContext = { _isPalaceMenu: true };
        const choices = this.palaceGroups().map(grp => ({
            text: grp.label,
            action: () => this.showPalaceGroup(grp),
        }));
        choices.push({ text: '离开皇宫', action: () => { g._groupContext = null; g.showOutdoorChoices(); } });
        g.addMessage('—— 皇宫 ——', 'system');
        g.showChoices(choices);
    }

    showPalaceGroup(grp) {
        const g = this.game;
        g.clearChoices();
        g._groupContext = { _palaceGroup: grp };
        const choices = grp.venues.map(v => ({ text: v.name, action: () => g.enterVenue(v) }));
        choices.push({ text: '回去', action: () => this.showPalaceMenu() });
        g.addMessage(`—— ${grp.label} ——`, 'system');
        g.showChoices(choices);
    }

    /* ─── 皇宫专属交互选项 ─── */

    addVenueChoices(venue, npc, choices) {
        if (venue.name === '御膳房') {
            choices.splice(0, 0, { text: '偷御膳', action: () => this.royalKitchenSteal(venue, npc) });
        }
        if (venue.name === '珍宝馆') {
            choices.splice(0, 0, { text: '夜探珍宝馆', action: () => this.treasurySteal(venue, npc) });
        }
        if (venue.name === '太液池') {
            choices.splice(0, 0, { text: '垂钓太液池', action: () => this.pondFishing(venue) });
        }
    }

    /* ─── 太液池垂钓：池中珍稀龙鲤 ─── */

    pondFishing(venue) {
        const g = this.game;
        const hasRod = g.player.items.some(i => i.id === 'fishing_rod');
        if (!hasRod) {
            g.addMessage('太液池水澄如镜，波光粼粼。可惜你没有鱼竿，只能望池兴叹。', 'narrator');
            g.showChoices([{ text: '离开', action: () => g.interactNpc(venue, venue.npcs[0]) }]);
            return;
        }
        const hasBait = g.player.items.some(i => i.id === 'bait_bug');
        if (!hasBait) {
            g.addMessage('你拿出鱼竿在池边坐下，却发现鱼钩上空空如也——没有虫饵，池中的龙鲤不会上钩。', 'narrator');
            g.showChoices([{ text: '离开', action: () => g.interactNpc(venue, venue.npcs[0]) }]);
            return;
        }
        const day = g.player.day;
        const caught = (g.player._taiPondDay === day) ? (g.player._taiPondCount || 0) : 0;
        const dailyLimit = 3;
        const choices = [
            { text: '垂钓', action: () => {
                g.clearChoices();
                const idx = g.player.items.findIndex(i => i.id === 'bait_bug');
                if (idx !== -1) g.player.items.splice(idx, 1);
                const c = g.player._taiPondDay === g.player.day ? (g.player._taiPondCount || 0) : 0;
                if (c >= dailyLimit) {
                    g.addMessage('守池太监拦住你：「今日珍鲤已钓尽，明日再来吧。」', 'info');
                    g.updateStatsBar();
                    setTimeout(() => this.pondFishing(venue), 400);
                    return;
                }
                const table = [
                    { id: 'fish_tai_silver', weight: 40 },
                    { id: 'fish_tai_gold', weight: 25 },
                    { id: 'fish_mkt_purple', weight: 15 },
                    { id: 'fish_mkt_orange', weight: 10 },
                    { id: 'fish_mkt_gold', weight: 5 },
                    { id: 'fish_tai_dragon', weight: 2 },
                ];
                const total = table.reduce((s, x) => s + x.weight, 0);
                let roll = Math.random() * total;
                let picked = table[0].id;
                for (const x of table) { roll -= x.weight; if (roll <= 0) { picked = x.id; break; } }
                const item = getItem(picked) || { name: picked };
                g.player.items.push({ ...item });
                g.addMessage(`提竿而收——你钓到了一尾『${item.name}』！`, 'system');
                g.player._taiPondDay = g.player.day;
                g.player._taiPondCount = c + 1;
                g.advanceTime();
                g.updateStatsBar();
                setTimeout(() => this.pondFishing(venue), 400);
            }},
            { text: '收起鱼竿', action: () => g.interactNpc(venue, venue.npcs[0]) },
        ];
        g.addMessage(`太液池水澄澈如镜，池中龙鲤游弋，金鳞闪烁。今日已钓得 ${caught}/${dailyLimit} 尾。`, 'info');
        g.showChoices(choices);
    }
}