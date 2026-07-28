/* ─── 支线任务系统 ─── */

Game.prototype._questSeq = function(messages, onDone) {
    let i = 0;
    const next = () => {
        if (i < messages.length) {
            this.addMessage(messages[i], 'narrator');
            i++;
            this.showChoices([{ text: '……', action: next }]);
        } else if (onDone) {
            onDone();
        }
    };
    next();
};

Game.prototype.questStart = function(questId) {
    if (!this.player.activeQuests) this.player.activeQuests = {};
    if (!this.player.completedQuests) this.player.completedQuests = {};
    if (this.player.completedQuests[questId]) return;
    this.player.activeQuests[questId] = { stage: 'TRIGGER', dayStarted: this.player.day };
    this.questAdvance(questId);
};

Game.prototype.questComplete = function(questId) {
    if (!this.player.activeQuests) return;
    const q = this.player.activeQuests[questId];
    if (!q) return;
    delete this.player.activeQuests[questId];
    if (!this.player.completedQuests) this.player.completedQuests = {};
    this.player.completedQuests[questId] = true;
    this.player.reputation += 10;
    this._adjEvil(5, '支线');
    this.updateStatsBar();
    this.addMessage('声望 +10', 'system');
    this.questCleanupButcher();
};

Game.prototype.questFail = function(questId) {
    if (!this.player.activeQuests) return;
    delete this.player.activeQuests[questId];
    if (!this.player.failedQuests) this.player.failedQuests = {};
    this.player.failedQuests[questId] = true;
    this.questCleanupButcher();
};

Game.prototype.questCleanupButcher = function() {
    if (this._butcherSpawned && this.currentLocation) {
        const venue = this.currentLocation.venues.find(v => v.name === '肉铺');
        if (venue && venue.npcs[0]) delete venue.npcs[0]._questActive;
        this._butcherSpawned = false;
    }
};

Game.prototype.questCheckExpired = function() {
    if (!this.player.activeQuests) return;
    for (const [id, q] of Object.entries(this.player.activeQuests)) {
        if (q.dayStarted < this.player.day) {
            this.questFail(id);
            return id;
        }
    }
    return null;
};

Game.prototype.questAdvance = function(questId) {
    if (!this.player.activeQuests) return;
    const q = this.player.activeQuests[questId];
    if (!q) return;

    switch (questId) {
        case 'rescue_ox': this._questRescueOx(q); break;
    }
};

Game.prototype._questRescueOx = function(q) {
    const s = q.stage;
    if (s === 'TRIGGER') {
        this._questSeq([
            '你走出大门，沿着村道前行……',
            '忽然，你听到不远处传来打斗声和叫骂声。',
            '似乎是一个年轻人正在殴打老人。',
        ], () => {
            this.showChoices([
                { text: '不管闲事', action: () => { this._questSeq(['你摇了摇头，转身离开。多一事不如少一事。'], () => { this.questFail('rescue_ox'); this._showChoicesAfterQuest(); }); } },
                { text: '过去看看', action: () => { q.stage = 'FIGHT_SCENE'; this._questRescueOx(q); } },
        ]);
        });
    } else if (s === 'FIGHT_SCENE') {
        this._questSeq([
            '你快步走近，只见一个二十出头的年轻人正按着一位花甲老人拳打脚踢。',
            '老人蜷缩在地上，满脸是血，口中不住地哀求。',
            '年轻人却不管不顾，一边打一边骂：「老不死的东西！你怎么敢！」',
        ], () => {
            this.showChoices([
                    { text: '离开', action: () => { this._questSeq(['你转身离开，不愿惹事上身。'], () => { this.questFail('rescue_ox'); this._showChoicesAfterQuest(); }); } },
                    { text: '上前阻挠', action: () => {
                        this._questSeq([
                            '你上前一把抓住年轻人的手腕，沉声道：「住手！」',
                            '年轻人猛地甩开你的手，怒目而视：「你是谁？凭什么管我家的事！」',
                            '「少管闲事！不然连你一起打！」他摆开架势，朝你扑了过来。',
                        ], () => {
                            this.startBattle(createGenericEnemy('愤怒的年轻人', 25), () => {
                                q.stage = 'AFTER_BATTLE';
                                this._questRescueOx(q);
                            }, () => {
                                this._questSeq([
                                    '你不是他的对手，被打翻在地。',
                                    '他冷哼一声，扶着老人走了。',
                                ], () => {
                                    this.questFail('rescue_ox');
                                    this._showChoicesAfterQuest();
                                });
                            });
                        });
                    } },
        ]);
        });
    } else if (s === 'AFTER_BATTLE') {
        this._questSeq([
            '你三两下便将他制住，按在地上。',
            '他挣扎了几下，发现挣不脱，便放弃了抵抗。',
            '你喝道：「为何殴打老人？」',
            '他抬起头，你这才看清他满脸泪痕。',
            '「他是我爷爷……」他的声音哽咽了。',
            '你说：「你叫什么名字？」',
            '「小虎……村里人都叫我小虎。」',
        ], () => {
            this._questRescueOxReveal(q);
        });
    }
};

Game.prototype._questRescueOxReveal = function(q) {
    this._questSeq([
        '你松开手，他坐在地上，双手抱头。',
        '他擦干眼泪，这才缓缓道来。',
        '「我爹走得早……家里就剩那头老黄牛犁地，撑了三十年……」',
        '「今年地里没打出多少粮，家里锅都揭不开了……我老婆饿得没奶水，娃儿整夜哭……」',
        '「爷爷他……背着我，把牛卖了……才卖了十两银子……」',
        '说到这，他再也忍不住，放声大哭。',
        '一个大男人，哭得像个孩子。',
        '「我打小就在那牛背上长大的……那牛老实啊，犁地从来不偷懒，一年到头就指着它吃饭……」',
        '「冬天它暖窝，夏天它驮柴，我爹在的时候拿它当命根子……」',
        '「那牛老了……陪了我二十年，就这么让人牵走了……」',
        '「我去肉铺想赎回来，可那张屠户咬死三十两，少一个子儿都不干！」',
        '「我没钱……我没法子啊……」他用力捶着自己的头。',
    ], () => {
        this.showChoices([
            { text: '不管了', action: () => { this._questSeq(['你叹了口气，转身离去。'], () => { this.questFail('rescue_ox'); this._showChoicesAfterQuest(); }); } },
            { text: '给他三十两', action: () => this._questRescueOxGiveMoney(q) },
            { text: '我来想办法', action: () => this._questRescueOxThink(q) },
        ]);
    });
};

Game.prototype._questRescueOxGiveMoney = function(q) {
    if (this.player.gold < 30) {
        this._questSeq([
            '你摸了摸钱袋，只有' + this.player.gold + '两银子……不够三十两。',
            '你惭愧地摇了摇头。',
        ], () => {
            this._questRescueOxThink(q);
        });
        return;
    }
    this.player.gold -= 30;
    this.updateStatsBar();
    this._questSeq([
        '你掏出三十两银子递给他。',
        '他瞪大了眼睛，连连摆手：「这……这怎么行！我不能要你的钱！」',
        '你不由分说，将银子塞进他手里。',
        '他捧着银子，浑身颤抖，扑通一声跪在地上。',
        '「恩人！大恩人！」他连连磕头，额头都磕破了。',
        '他擦干眼泪，飞奔而去。',
        '过了不久，你听到远处传来一声悠长的牛哞。',
        '他牵着那头老黄牛回来了，牛尾巴悠闲地甩着。',
        '老黄牛用头蹭着年轻人的手，像在安慰他。',
        '年轻人牵着牛，朝你深深一揖。',
    ], () => {
        this.questComplete('rescue_ox');
        this._showChoicesAfterQuest();
    });
};

Game.prototype._questRescueOxThink = function(q) {
    this._questSeq([
        '你拍了拍他的肩膀：「你先带爷爷回家治伤，这事我来想办法。」',
        '他感激地看着你，扶着爷爷一瘸一拐地走了。',
        '你决定去集市找那屠户谈谈。',
    ], () => {
        q.stage = 'SPAWN_BUTCHER';
        this._questSpawnButcher();
        this._showChoicesAfterQuest();
    });
};

Game.prototype._questSpawnButcher = function() {
    if (this._butcherSpawned) return;
    if (!this.currentLocation) return;
    const venue = this.currentLocation.venues.find(v => v.name === '肉铺');
    if (venue && venue.npcs[0]) venue.npcs[0]._questActive = true;
    this._butcherSpawned = true;
};

Game.prototype.questInteractButcher = function(venue, npc) {
    this.clearChoices();
    this.addMessage(`${npc.npcName}：「买肉？」他手中的剔骨刀在灯光下泛着寒光。`, 'narrator');
    const choices = [];
    if (this.player.activeQuests && this.player.activeQuests.rescue_ox && ['SPAWN_BUTCHER','BUTCHER_ACTIVE'].includes(this.player.activeQuests.rescue_ox.stage)) {
        choices.push({ text: '【支线】要求还牛', action: () => this._questButcherNegotiate(venue, npc) });
    }
    choices.push({ text: '买肉', action: () => this.buyFromNpc(venue, npc) });
    choices.push({ text: '出售', action: () => this.sellToNpc(venue, npc) });
    choices.push({ text: '离开', action: () => this.enterVenue(venue) });
    this.showChoices(choices);
};

Game.prototype._questButcherNegotiate = function(venue, npc) {
    this._questSeq([
        '你说明来意，张屠户把刀往案板上一插。',
        '「三十两，少一分都不卖。」',
        '「你要是今天不买，明天一早就宰牛！」',
    ], () => {
        this.showChoices([
            { text: '出三十两', action: () => this._questButcherPay(venue, npc) },
            { text: '动武', action: () => {
                this._questSeq(['你冷笑一声：「那我就打到你还！」'], () => {
                    this.startBattle(createGenericEnemy('张屠户', 45), () => {
                        this._questSeq([
                            '张屠户被你打倒在地，连声告饶。',
                            '「好汉饶命！」他喘着粗气，抹了把嘴角的血。',
                            '你冷冷道：「给我个饶你的理由。」',
                            '「你以为我真是黑心屠户？」他苦笑道，「那牛都四十了，瘦得皮包骨，身上切不出十斤肉，谁家买去？」',
                            '你冷笑道：「这么说来，你倒是个好人。」',
                            '「我张屠户是粗人，但也干不出这种缺德事！」',
                            '你默然。你想起前世在华山派时，有华山派罩着，周遭村庄百姓虽不说大富大贵，却也衣食无忧。',
                            '想不到这偏僻之地，竟有如此疾苦。',
                        ], () => {
                            this.showChoices([
                                { text: '把牛抢走还给小虎', action: () => {
                                    this._questSeq([
                                        '你冷哼一声：「你再说也是屠户。牛我带走，你有意见？」',
                                        '张屠户不敢吭声，眼睁睁看你把牛牵出了肉铺。',
                                        '你找到小虎，把牛绳塞进他手里。',
                                        '他不敢相信地看着你，随即抱着牛脖子放声大哭。',
                                    ], () => { this._completeRescueOx(5); });
                                } },
                                { text: '不拿牛，回去给小虎三十两', action: () => {
                                    if (this.player.gold < 30) {
                                        this.addMessage('你摸了摸钱袋，只有' + this.player.gold + '两银子……连三十两都拿不出。', 'narrator');
                                        return;
                                    }
                                    this.player.gold -= 30;
                                    this.updateStatsBar();
                                    this._questSeq([
                                        '你松开手中的刀，缓缓道：「你说得有理。牛你留着，我给小虎三十两，让他们另谋生计。」',
                                        '张屠户怔了一下，随即拱手道：「少侠深明大义，我佩服！」',
                                        '你找到小虎，将三十两银子递给他，告诉他牛已经另有人家了。',
                                        '他虽难过，但捧着银子终究有了活路，再三道谢后扶着爷爷离开了。',
                                    ], () => { this._completeRescueOx(20); });
                                } },
                                { text: '出十两买下牛，再给小虎三十两', action: () => {
                                    if (this.player.gold < 40) {
                                        this.addMessage('你摸了摸钱袋，只有' + this.player.gold + '两银子……凑不出四十两。', 'narrator');
                                        return;
                                    }
                                    this.player.gold -= 40;
                                    this.updateStatsBar();
                                    this._questSeq([
                                        '你叹了口气，掏出十两银子：「牛我买了，这钱你拿着。」',
                                        '又数出三十两：「这钱给小虎一家，就说牛已经有人买了，让他们安心过日子。」',
                                        '张屠户愣愣地看着你，半晌才接过银子，点了点头。',
                                        '你牵着牛找到小虎把牛交给他，又交给他三十两银子。',
                                        '他抱着牛脖子哭了好一阵，又捧着银子连连道谢。',
                                        '牛用他浑浊的眼神看着你，似乎在感激你的所作所为。',
                                        '你叹了口气，只道众生皆苦。',
                                    ], () => { this._completeRescueOx(25); });
                                } },
                            ]);
                        });
                    }, () => {
                        this._questSeq([
                            '张屠户膂力惊人，你不是对手。',
                            '他把你扔出了肉铺。',
                            '你站在门口，感到一阵沮丧。',
                        ], () => {
                            this._showChoicesAfterQuest();
                        });
                    });
                });
            } },
            { text: '算了', action: () => this.questInteractButcher(venue, npc) },
        ]);
    });
};

Game.prototype._questButcherPay = function(venue, npc) {
    if (this.player.gold < 30) {
        this._questSeq([
            '你摸了摸钱袋，只有' + this.player.gold + '两银子。',
            '张屠户嗤笑一声：「没钱还充什么大爷？」',
        ], () => {
            this._showChoicesAfterQuest();
        });
        return;
    }
    this.player.gold -= 30;
    this.updateStatsBar();
    this._questSeq([
        '你数出三十两银子拍在案板上。',
        '张屠户数了数，满意地点了点头，将一头老黄牛从后院牵了出来。',
        '你牵着老黄牛找到年轻人，他远远看见，眼泪就掉下来了。',
        '他抱着牛脖子哭了好一阵，才想起向你道谢。',
    ], () => {
        this.questComplete('rescue_ox');
        this._showChoicesAfterQuest();
    });
};

Game.prototype._completeRescueOx = function(repValue) {
    delete this.player.activeQuests.rescue_ox;
    if (!this.player.completedQuests) this.player.completedQuests = {};
    this.player.completedQuests.rescue_ox = true;
    this.player.reputation += repValue;
    this._adjWorldHelp(repValue);
    this.questCleanupButcher();
    this.updateStatsBar();
    this.addMessage('声望 ' + (repValue >= 0 ? '+' : '') + repValue, 'system');
    this._showChoicesAfterQuest();
};

Game.prototype._showChoicesAfterQuest = function() {
    this.showChoices([
        { text: '继续', action: () => {
            this.clearChoices();
            this._groupContext ? this.showGroupVenues(this._groupContext.label, this._groupContext.venues) : this.showOutdoorChoices();
        } },
    ]);
};
