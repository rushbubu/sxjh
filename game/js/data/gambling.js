/* ─── 赌博系统 ───
 * 骰宝（押大小）+ 猜单双
 * 赢钱微提悟性，输赢看属性双判
 * 城市赌徒会出老千，男主可阻拦
 * 赢超30两触发打手黑吃黑
 * 净负值达标赌徒传授赌徒心经，修炼解锁赌技
 */

const GAMBLING_SKILL_TIERS = [
    { level: 1, name: '初级赌技', internalName: '初级赌徒心经', netLossReq: -30, luckReq: 0,   neiliCost: 5,  boost: 0.08 },
    { level: 2, name: '中级赌技', internalName: '中级赌徒心经', netLossReq: -50, luckReq: 30, neiliCost: 10, boost: 0.12 },
    { level: 3, name: '高级赌技', internalName: '高级赌徒心经', netLossReq: -80, luckReq: 50, neiliCost: 15, boost: 0.16 },
    { level: 4, name: '大师赌技', internalName: '大师赌徒心经', netLossReq: -120, luckReq: 70, neiliCost: 20, boost: 0.20 },
];

// ─── 初始化：为所有街角添加赌徒NPC ───

function setupStreetGamblers(world) {
    const names = ['刘三', '胡老六', '王麻子', '赵四', '李拐子', '钱串子', '孙瘸子', '周赖子'];
    const descs = {
        1: '一个胡子拉碴的汉子蹲在墙角，面前摆着三颗骰子和一个破碗。',
        2: '一个精明的中年男人靠在墙边，手里把玩着骰子，目光锐利。',
        3: '一个穿着绸缎的瘦削男子倚在墙角，指尖翻动着一枚铜钱，眼神闪烁不定。',
    };
    const casinoNames = ['胡三爷', '金六指', '白七爷', '马九爷', '沈万赌', '雷老虎'];
    const casinoDescs = {
        2: '一家不大的赌坊，几张桌子围满了赌客，庄家是个精明的中年人，手法极快。',
        3: '气派的赌坊大厅里灯火通明，数十张赌桌一字排开，坐镇的老板目光如炬。',
    };
    for (const loc of world.villages || []) {
        const corner = loc.venues.find(v => v.name === '街角');
        if (!corner) continue;
        const n = names[Math.floor(Math.random() * names.length)];
        corner.npcs.push({
            npcName: n,
            npcDesc: descs[1],
            civilian: true,
            combatPower: 6,
            items: [],
            gamblerLevel: 1,
            isBeauty: false,
            isChief: false,
            martialArt: null,
        });
    }
    for (const loc of [...(world.small_cities || []), ...(world.big_cities || [])]) {
        const isBigCity = world.big_cities && world.big_cities.includes(loc);
        const level = isBigCity ? 3 : 2;
        const n = casinoNames[Math.floor(Math.random() * casinoNames.length)];
        if (!loc.venues.find(v => v.name === '赌坊')) {
            loc.venues.push({
                name: '赌坊',
                npcs: [{
                    npcName: n,
                    npcDesc: casinoDescs[level],
                    civilian: false,
                    combatPower: level * 5 + 10,
                    items: [],
                    gamblerLevel: level,
                    isBeauty: false,
                    isChief: false,
                    martialArt: null,
                }],
            });
        }
    }
}

// ─── 胜率计算 ───

function _gambleWinChance(player, gameType) {
    const wit = player.attrs.wit || 10;
    const dex = player.attrs.dexterity || 10;
    let base;
    if (gameType === 'dice') {
        base = Math.min(0.90, 0.40 + wit * 0.003 + dex * 0.001);
    } else {
        base = Math.min(0.90, 0.40 + dex * 0.003 + wit * 0.001);
    }
    if (player._gamblingSkillActive) {
        const level = player._gamblingSkillLevel || 0;
        if (level > 0) {
            const tier = GAMBLING_SKILL_TIERS[level - 1];
            base = Math.min(0.95, base + tier.boost);
        }
    }
    return base;
}

function _cheatDetectChance(player) {
    const wit = player.attrs.wit || 10;
    const dex = player.attrs.dexterity || 10;
    return Math.min(0.95, (wit + dex) / 200);
}

// ─── 入口 ───

function startGambling(gambler, player, callbacks) {
    delete gambler._gamblingSession;
    delete gambler._thugTriggered;
    _gambleShowMenu(gambler, player, callbacks);
}

// ─── 押注金额选择 ───

function _gambleBetSelect(gambler, player, callbacks, gameType) {
    callbacks.clearChoices();
    const maxBet = Math.min(player.gold, 50);
    const choices = [];
    if (player.gold >= 1) choices.push({ text: '1两', action: () => _gamblePlay(gambler, player, callbacks, gameType, 1) });
    if (player.gold >= 5) choices.push({ text: '5两', action: () => _gamblePlay(gambler, player, callbacks, gameType, 5) });
    if (player.gold >= 10) choices.push({ text: '10两', action: () => _gamblePlay(gambler, player, callbacks, gameType, 10) });
    if (maxBet >= 20) choices.push({ text: '全押（' + maxBet + '两）', action: () => _gamblePlay(gambler, player, callbacks, gameType, maxBet) });
    choices.push({ text: '不赌了', action: () => _gambleShowMenu(gambler, player, callbacks) });
    callbacks.showChoices(choices);
}

// ─── 骰宝 / 猜单双 选择 ───

function _gambleShowMenu(gambler, player, callbacks) {
    callbacks.clearChoices();
    if (!gambler._gamblingSession) {
        gambler._gamblingSession = { totalWin: 0, roundCount: 0 };
    }
    callbacks.addMessage('你摸了摸钱袋，掂了掂——囊中还有' + player.gold + '两银子。', 'info');
    const skLevel = player._gamblingSkillLevel || 0;
    if (skLevel > 0) {
        const tier = GAMBLING_SKILL_TIERS[skLevel - 1];
        const canUse = player.neili >= tier.neiliCost;
        if (canUse) {
            const status = player._gamblingSkillActive ? '（已发动✓）' : '';
            callbacks.addMessage('你暗自运转赌技心法，指间隐隐有一股暗劲流转。' + status, 'info');
        }
    }
    callbacks.addMessage('「来来来，想玩点啥？」' + gambler.npcName + '咧嘴一笑。', 'narrator');
    const choices = [
        { text: '骰宝（押大小）', action: () => _gambleBetSelect(gambler, player, callbacks, 'dice') },
        { text: '猜单双', action: () => _gambleBetSelect(gambler, player, callbacks, 'oddEven') },
    ];
    if (skLevel > 0) {
        const tier = GAMBLING_SKILL_TIERS[skLevel - 1];
        const canUse = player.neili >= tier.neiliCost;
        const isActive = !!player._gamblingSkillActive;
        choices.splice(0, 0, {
            text: isActive ? '收起赌技（取消）' : (canUse ? '发动' + tier.name + '（' + tier.neiliCost + '内力）' : '内力不足，无法发动赌技'),
            action: canUse ? () => {
                if (isActive) {
                    player._gamblingSkillActive = false;
                } else {
                    player.neili -= tier.neiliCost;
                    player._gamblingSkillActive = true;
                    callbacks.addMessage('你暗暗催动「' + tier.internalName + '」，一股暗劲流转至指尖，目光变得锐利如鹰。', 'event');
                }
                _gambleShowMenu(gambler, player, callbacks);
            } : undefined,
        });
    }
    choices.push({ text: '不玩了', action: () => {
        const s = gambler._gamblingSession;
        // 净负值已在每局结算时更新，此处不需重复
        delete gambler._gamblingSession;
        player._gamblingSkillActive = false;
        const net = s.totalWin;
        if (net > 0) {
            callbacks.addMessage(gambler.npcName + '数着银子，脸色不太好看：「赢了就想走？下次可不许这么早跑了！」', 'narrator');
        } else if (net < 0) {
            callbacks.addMessage(gambler.npcName + '笑呵呵地收起银子：「承让承让！下回多带点钱再来啊！」', 'narrator');
        } else {
            callbacks.addMessage(gambler.npcName + '把骰子往碗里一丢：「不玩拉倒。」', 'narrator');
        }
        callbacks.updateStatsBar();
        callbacks.gamblerAction(gambler);
    } });
    callbacks.showChoices(choices);
}

function _checkSutraReward(gambler, player, callbacks, sessionNet) {
    if (!player._sutraReceived) player._sutraReceived = [];
    const totalLoss = gambler._netLoss || 0;
    for (const tier of GAMBLING_SKILL_TIERS) {
        if (player._sutraReceived.includes(tier.level)) continue;
        if (tier.internalName === '初级赌徒心经' && totalLoss <= tier.netLossReq) {
            player._sutraReceived.push(tier.level);
            _giveSutraItem(gambler, player, callbacks, tier);
            return;
        }
        if (totalLoss <= tier.netLossReq && player._sutraReceived.includes(tier.level - 1)) {
            player._sutraReceived.push(tier.level);
            _giveSutraItem(gambler, player, callbacks, tier);
            return;
        }
    }
}

function _giveSutraItem(gambler, player, callbacks, tier) {
    const item = getItem('sutra_gambler_' + tier.level);
    if (!item) return;
    player.items.push({ ...item });
    callbacks.addMessage(gambler.npcName + '叹了口气，从怀里摸出一本皱巴巴的册子递给你：「你输得不少啊……这本' + tier.internalName + '你拿回去琢磨琢磨，下次别输这么惨了。」', 'narrator');
    callbacks.addMessage('获得「' + item.name + '」', 'event');
}

// ─── 骰子游戏 ───

function _gamblePlay(gambler, player, callbacks, gameType, bet) {
    callbacks.clearChoices();
    if (gameType === 'dice') {
        callbacks.addMessage(gambler.npcName + '抄起三颗骰子哗啦啦丢进碗里：「押大还是押小？」', 'narrator');
        callbacks.showChoices([
            { text: '押大', action: () => _gambleResolve(gambler, player, callbacks, 'dice', bet, 'big') },
            { text: '押小', action: () => _gambleResolve(gambler, player, callbacks, 'dice', bet, 'small') },
            { text: '算了', action: () => _gambleBetSelect(gambler, player, callbacks, gameType) },
        ]);
    } else {
        const coinCount = Math.floor(Math.random() * 20) + 10;
        callbacks.addMessage(gambler.npcName + '从怀里抓出一把铜钱，飞快地数了数，攥在手心里：「单还是双？猜对了翻倍！」', 'narrator');
        callbacks.showChoices([
            { text: '猜单', action: () => _gambleResolve(gambler, player, callbacks, 'oddEven', bet, 'odd') },
            { text: '猜双', action: () => _gambleResolve(gambler, player, callbacks, 'oddEven', bet, 'even') },
            { text: '算了', action: () => _gambleBetSelect(gambler, player, callbacks, gameType) },
        ]);
    }
}

// ─── 结果结算 ───

function _gambleResolve(gambler, player, callbacks, gameType, bet, choice) {
    callbacks.clearChoices();
    const s = gambler._gamblingSession;
    const level = gambler.gamblerLevel || 1;

    // 实际结果
    let actual = 'big';
    if (gameType === 'dice') {
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const d3 = Math.floor(Math.random() * 6) + 1;
        const total = d1 + d2 + d3;
        actual = total >= 11 ? 'big' : 'small';
        const diceStr = '【' + d1 + '】【' + d2 + '】【' + d3 + '】' + (total >= 11 ? ' 大！' : ' 小！');
        callbacks.addMessage('骰子落定：' + diceStr, 'narrator');
    } else {
        const coinCount = Math.floor(Math.random() * 20) + 10;
        actual = coinCount % 2 === 0 ? 'even' : 'odd';
        callbacks.addMessage(gambler.npcName + '松开手掌：' + coinCount + '枚铜钱，' + (actual === 'even' ? '双数！' : '单数！'), 'narrator');
    }

    // 悟性+灵巧双判决定输赢
    const chance = _gambleWinChance(player, gameType);
    const playerWon = Math.random() < chance;

    // 老千判断（玩家本该赢时才触发——老千不想让你赢）
    const cheatChance = level >= 2 ? [0, 0.20, 0.35][level - 1] || 0.35 : 0;
    let cheatSucceed = false;
    if (playerWon && Math.random() < cheatChance) {
        const detectChance = _cheatDetectChance(player);
        const detected = Math.random() < detectChance;
        if (detected) {
            callbacks.addMessage('你目光一凝——这厮在揭碗的瞬间指头轻轻拨了一下骰子！果然想动手脚！', 'danger');
            callbacks.addMessage(gambler.npcName + '被你盯得心里发毛，强笑道：「好眼力！」', 'narrator');
            callbacks.showChoices([
                { text: '揭穿他！', action: () => _gambleCounterCheat(gambler, player, callbacks, gameType, bet) },
                { text: '算了，不跟他计较', action: () => {
                    callbacks.addMessage('你冷哼一声，懒得跟他一般见识。', 'narrator');
                    s.totalWin -= bet;
                    player.gold -= bet;
                    _gambleAftermath(gambler, player, callbacks, false, bet);
                } },
            ]);
            return;
        } else {
            cheatSucceed = true;
        }
    }

    if (cheatSucceed) {
        callbacks.addMessage('你输了' + bet + '两。你隐约觉得哪里不对，却又说不上来……', 'narrator');
        s.totalWin -= bet;
        player.gold -= bet;
        _gambleAftermath(gambler, player, callbacks, false, bet);
    } else if (playerWon) {
        callbacks.addMessage('你赢了' + bet + '两！', 'event');
        s.totalWin += bet;
        player.gold += bet;
        player.attrs.wit = Math.min(100, (player.attrs.wit || 0) + 0.05);
        callbacks.addMessage('悟性  +0.05（当前 ' + player.attrs.wit.toFixed(2) + '）', 'system');
        _gambleAftermath(gambler, player, callbacks, true, bet);
    } else {
        callbacks.addMessage('你输了' + bet + '两。手气不好，下次再来。', 'narrator');
        s.totalWin -= bet;
        player.gold -= bet;
        _gambleAftermath(gambler, player, callbacks, false, bet);
    }
}

// ─── 反制老千 ───

function _gambleCounterCheat(gambler, player, callbacks, gameType, bet) {
    callbacks.clearChoices();
    const chance = _cheatDetectChance(player);
    const success = Math.random() < chance;

    if (success) {
        const winAmount = bet * 2;
        callbacks.addMessage('你一把按住他的手腕，冷声道：「当着我的面出千？」', 'event');
        callbacks.addMessage('街边几个闲汉纷纷侧目，' + gambler.npcName + '冷汗涔涔而下：「误会……误会……」', 'narrator');
        player.gold += winAmount;
        const s = gambler._gamblingSession;
        s.totalWin += winAmount;
        player.reputation = Math.min(100, (player.reputation || 0) + 1);
        player.attrs.wit = Math.min(100, (player.attrs.wit || 0) + 0.1);
        callbacks.addMessage('你拿回本金，还多得了' + winAmount + '两！', 'event');
        callbacks.addMessage('声望 +1（当前 ' + player.reputation + '）', 'system');
        callbacks.addMessage('悟性  +0.1（当前 ' + player.attrs.wit.toFixed(2) + '）', 'system');
        callbacks.updateStatsBar();
        callbacks.addMessage('「算你狠……」' + gambler.npcName + '讪讪地把银子推到您面前，周围响起几声喝彩。', 'narrator');
        // 检查黑吃黑
        if (s.totalWin > 30) {
            _gambleThugCheck(gambler, player, callbacks);
        } else {
            _gambleAfterRound(gambler, player, callbacks);
        }
    } else {
        callbacks.addMessage('你一把按住他的手腕喝道：「出千？」' + gambler.npcName + '却反手一抖，骰子/铜钱已经换了回来，一脸无辜：「爷，您这话可就冤枉人了。」', 'narrator');
        callbacks.addMessage('你抓不住证据，周围人反而用怀疑的目光看着你。你只得悻悻放手。', 'narrator');
        const s = gambler._gamblingSession;
        s.totalWin -= bet;
        player.gold -= bet;
        _gambleAftermath(gambler, player, callbacks, false, bet);
    }
}

// ─── 黑吃黑 ───

function _gambleThugCheck(gambler, player, callbacks) {
    callbacks.clearChoices();
    const s = gambler._gamblingSession;
    callbacks.addMessage('你正要把银子揣进怀里，突然听见身后传来一个粗哑的声音：「小子，赢了不少啊？」', 'danger');
    callbacks.addMessage('你回头一看，' + s.totalWin + '两银子引来了几条恶狼——三个膀大腰圆的打手不知何时堵住了巷口。为首的光头汉子掂着手里的棍子，咧嘴露出一口黄牙：「识相的，把钱留下，爷几个饶你一命。」', 'danger');
    const thugCp = 12 + Math.floor(s.totalWin / 3);
    const enemy = createGenericEnemy('打头的光头', thugCp);
    const enemy2 = createGenericEnemy('两个喽啰', Math.floor(thugCp * 0.6));
    // Use a combined encounter - start a battle with the main thug
    callbacks.showChoices([
        { text: '跟他们拼了！', action: () => {
            callbacks.clearChoices();
            callbacks.addMessage('你攥紧拳头，冷笑道：「想要钱？先问问这双拳头答不答应！」', 'event');
            callbacks.startBattle(enemy,
                // onWin
                () => {
                    callbacks.clearChoices();
                    callbacks.addMessage('你三拳两脚将光头打翻在地，两个喽啰见势不妙抱头鼠窜！', 'event');
                    callbacks.addMessage('围观的闲汉纷纷叫好，你收起银子，拍了拍衣襟。', 'narrator');
                    callbacks.updateStatsBar();
                    _gambleAfterRound(gambler, player, callbacks);
                },
                // onLose
                () => {
                    callbacks.gameOver('你受伤过重，不治身亡');
                }
            );
        } },
        { text: '破财消灾', action: () => {
            const loss = Math.floor(s.totalWin / 2);
            player.gold -= loss;
            s.totalWin -= loss;
            callbacks.clearChoices();
            callbacks.addMessage('你咬了咬牙，把' + loss + '两银子丢在地上：「拿去！」', 'narrator');
            callbacks.addMessage('光头啐了一口：「算你识相！」几个人捡起银子扬长而去。', 'narrator');
            callbacks.addMessage('这一番下来，你净赚' + s.totalWin + '两，虽然被分去了一半，总比人财两空强。', 'info');
            callbacks.updateStatsBar();
            _gambleAfterRound(gambler, player, callbacks);
        } },
    ]);
}

// ─── 每局结算 ───

function _gambleAftermath(gambler, player, callbacks, didWin, bet) {
    gambler._netLoss = (gambler._netLoss || 0) + (didWin ? bet : -bet);
    callbacks.updateStatsBar();
    // 检查是否该给心经
    _checkSutraReward(gambler, player, callbacks, gambler._netLoss);
    const s = gambler._gamblingSession;
    if (player.gold <= 0) {
        callbacks.addMessage('你摸了摸口袋——一文不名了。' + gambler.npcName + '撇了撇嘴：「没钱了还想玩？去去去，别耽误我做生意。」', 'narrator');
        delete gambler._gamblingSession;
        player._gamblingSkillActive = false;
        return callbacks.gamblerAction(gambler);
    }
    if (didWin && s.totalWin > 30 && !gambler._thugTriggered) {
        gambler._thugTriggered = true;
        _gambleThugCheck(gambler, player, callbacks);
    } else {
        _gambleAfterRound(gambler, player, callbacks);
    }
}

function _gambleAfterRound(gambler, player, callbacks) {
    callbacks.clearChoices();
    const s = gambler._gamblingSession;
    callbacks.addMessage('目前净赢 ' + (s.totalWin >= 0 ? '+' : '') + s.totalWin + ' 两。', 'info');
    callbacks.showChoices([
        { text: '再来一把', action: () => _gambleShowMenu(gambler, player, callbacks) },
        { text: '不玩了', action: () => {
            delete gambler._gamblingSession;
            if (s.totalWin > 0) {
                callbacks.addMessage(gambler.npcName + '数着银子，脸色不太好看：「赢了就想走？下次可不许这么早跑了！」', 'narrator');
            } else if (s.totalWin < 0) {
                callbacks.addMessage(gambler.npcName + '笑呵呵地收起银子：「承让承让！下回多带点钱再来啊！」', 'narrator');
            } else {
                callbacks.addMessage(gambler.npcName + '把骰子往碗里一丢：「不玩拉倒。」', 'narrator');
            }
            callbacks.updateStatsBar();
            callbacks.gamblerAction(gambler);
        } },
    ]);
}
