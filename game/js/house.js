class HouseManager {
    constructor(game) {
        this.game = game;
    }

    /* ─── 房产中介入口 ─── */
    showEstateAgent(venue, cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses?.[cityId];
        g.addMessage(`你走进${venue.name}，一个穿着绸缎长衫的掌柜笑眯眯地迎了上来。`, 'narrator');
        g.addMessage(`「这位爷，您看房？咱${cityIdToName(cityId)}的地段那可是……」`, 'info');
        if (house) {
            g.addMessage(`（你在此城已有一处${house.plotName || '宅院'}）`, 'system');
        }
        const choices = [];
        if (!house) {
            choices.push({ text: '我想看看有什么合适的宅子', action: () => this._showPlots(cityId) });
        } else {
            choices.push({ text: '我来看看我的宅子', action: () => this._showHouseMenu(cityId) });
            choices.push({ text: '我想换个大点的宅子', action: () => this._showUpgradePlot(cityId) });
        }
        choices.push({ text: '告辞', action: () => g.enterVenue(venue) });
        g.showChoices(choices);
    }

    /* ─── 查看房源（3种规格） ─── */
    _showPlots(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const tier = getCityTier(cityId);
        if (!tier) { g.addMessage('此城无法购房。', 'narrator'); g.showChoices([{ text: '回去', action: () => g.showLocationChoices() }]); return; }
        const plots = CITY_PLOTS[tier];
        g.addMessage(`掌柜的拿出几卷地契：「您瞧瞧，这都是本城最好的地段。」`, 'narrator');
        const choices = plots.map((plot, i) => {
            const price = getCityLandPrice(cityId, i);
            return {
                text: `${plot.name}（${price.toLocaleString()}两）—— ${plot.desc}（最多${plot.maxRooms}间房/${plot.maxBedrooms}间卧室）`,
                action: () => this._confirmPurchase(cityId, i),
            };
        });
        choices.push({ text: '我再想想', action: () => g.showLocationChoices() });
        g.showChoices(choices);
    }

    _confirmPurchase(cityId, plotIndex) {
        this.game.clearChoices();
        const g = this.game;
        const tier = getCityTier(cityId);
        const plot = CITY_PLOTS[tier][plotIndex];
        const price = getCityLandPrice(cityId, plotIndex);
        g.addMessage(`「${plot.name}，${price.toLocaleString()}两，一手交钱一手交契。」掌柜微笑着等你决定。`, 'narrator');
        g.addMessage(`宅子规格：最多可建${plot.maxRooms}种房间，${plot.maxBedrooms}间卧室。`, 'info');
        g.showChoices([
            { text: `买下（${price.toLocaleString()}两）`, action: () => {
                g.clearChoices();
                if (g.player.gold < price) {
                    g.addMessage('你摸了摸钱袋——囊中羞涩。', 'narrator');
                    g.showChoices([{ text: '回去', action: () => this._showPlots(cityId) }]);
                    return;
                }
                g.player.gold -= price;
                if (!g.player.houses) g.player.houses = {};
                g.player.houses[cityId] = {
                    plotIndex,
                    plotName: plot.name,
                    maxRooms: plot.maxRooms,
                    maxBedrooms: plot.maxBedrooms,
                    maxLevel: plot.maxLevel,
                    landPrice: price,
                    rooms: {},      // { roomType: level }
                    bedroomCount: 0, // 卧室间数
                    residents: [],   // beauty keys
                };
                g.addMessage(`你签下地契，付了银两。从此在${cityIdToName(cityId)}有了自己的${plot.name}！`, 'narrator');
                g.addMessage(`掌柜的将钥匙交到你手中：「恭喜恭喜！以后想添置什么尽管来找我。」`, 'info');
                g.updateStatsBar();
                setTimeout(() => this._showHouseMenu(cityId), 500);
            }},
            { text: '太贵了', action: () => this._showPlots(cityId) },
        ]);
    }

    /* ─── 换大宅（补差价） ─── */
    _showUpgradePlot(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses?.[cityId];
        if (!house) return;
        const tier = getCityTier(cityId);
        const plots = CITY_PLOTS[tier];
        const currentIdx = house.plotIndex;
        const available = plots.filter((p, i) => i > currentIdx);
        if (available.length === 0) {
            g.addMessage('掌柜的摊手：「您这已经是本城最好的宅子了。」', 'narrator');
            g.showChoices([{ text: '回去', action: () => this._showHouseMenu(cityId) }]);
            return;
        }
        g.addMessage('掌柜的翻出几卷地契：「想换大宅？您看这几处——」', 'narrator');
        const choices = available.map((plot, ai) => {
            const i = currentIdx + 1 + ai;
            const newPrice = getCityLandPrice(cityId, i);
            const diff = newPrice - house.landPrice;
            return {
                text: `${plot.name}（补差价${diff.toLocaleString()}两）—— ${plot.desc}`,
                action: () => {
                    g.clearChoices();
                    if (g.player.gold < diff) {
                        g.addMessage('你摸了摸钱袋——囊中羞涩。', 'narrator');
                        g.showChoices([{ text: '回去', action: () => this._showUpgradePlot(cityId) }]);
                        return;
                    }
                    g.player.gold -= diff;
                    house.plotIndex = i;
                    house.plotName = plot.name;
                    house.landPrice = newPrice;
                    house.maxRooms = plot.maxRooms;
                    house.maxBedrooms = plot.maxBedrooms;
                    house.maxLevel = plot.maxLevel;
                    g.addMessage(`你补齐差价，换到了${plot.name}！掌柜的连连恭喜。`, 'narrator');
                    g.updateStatsBar();
                    setTimeout(() => this._showHouseMenu(cityId), 500);
                },
            };
        });
        choices.push({ text: '算了', action: () => this._showHouseMenu(cityId) });
        g.showChoices(choices);
    }

    /* ─── 宅院管理主菜单 ─── */
    _showHouseMenu(cityId) {
        // 庄园级别重定向到独立庄园界面
        const house = this.game.player.houses?.[cityId];
        if (house && house.plotIndex >= 2) {
            this.game.estateManager.enterEstate(cityId);
            return;
        }
        this.game.clearChoices();
        const g = this.game;
        if (!house) return;
        const totalValue = this.getPropertyValue(cityId);
        const repBonus = getHouseRepBonus(totalValue);
        const repLabel = getHouseRepLabel(totalValue);
        const roomCount = Object.keys(house.rooms).length;
        const roomList = Object.entries(house.rooms).map(([type, lv]) => {
            const rt = HOUSE_ROOM_TYPES[type];
            return rt ? `${rt.name} Lv.${lv}` : null;
        }).filter(Boolean);
        g.addMessage(`—— 你在${cityIdToName(cityId)}的${house.plotName} ——`, 'system');
        g.addMessage(`宅院估值：${totalValue.toLocaleString()}两（${repLabel} · 声望+${repBonus}）`, 'info');
        g.addMessage(`房间：${roomCount}/${house.maxRooms}种 | 卧室：${house.bedroomCount}/${house.maxBedrooms}间 | 入住：${house.residents.length}人`, 'info');
        if (roomList.length > 0) {
            g.addMessage(`已有：${roomList.join('、')}`, 'info');
        }
        const pp = g.player._portablePond;
        if (pp) {
            g.addMessage(`随身鱼袋中有一条${pp.name}。`, 'info');
        }
        const hasPond = house.features?.pond?.level > 0;
        if (hasPond) {
            const pond = house.features.pond;
            const totalStock = (pond.stock?.goldfish || 0) + (pond.stock?.koi || 0) + (pond.stock?.turtle || 0);
            const pc = HOUSE_POND_CONFIG;
            const lvCfg = pc.levels[pond.level - 1];
            g.addMessage(`鱼池 Lv.${pond.level}（${totalStock}/${lvCfg.maxStock}尾）`, 'info');
        }
        const hasBath = house.features?.bath?.level > 0;
        if (hasBath) {
            const bath = house.features.bath;
            const cfg = HOUSE_BATH_CONFIG[bath.type];
            g.addMessage(`${cfg.icon} ${cfg.name} Lv.${bath.level}`, 'info');
        }
        const choices = [
            { text: '增建房间', action: () => this._showBuildRoom(cityId) },
            { text: '升级房间', action: () => this._showUpgradeRoom(cityId) },
            { text: '增建/升级卧室', action: () => this._showBedroomMenu(cityId) },
        ];
        if (hasPond) {
            choices.push({ text: '鱼池', action: () => this._showPondMenu(cityId) });
        } else {
            choices.push({ text: '修建鱼池', action: () => this._showBuildPond(cityId) });
        }
        if (hasBath) {
            choices.push({ text: '沐浴', action: () => this._showBathMenu(cityId) });
        } else {
            choices.push({ text: '修建浴池', action: () => this._showBuildBath(cityId) });
        }
        choices.push({ text: '管理入住', action: () => this._showResidentMenu(cityId) });
        choices.push({ text: '离开', action: () => g.showLocationChoices() });
        g.showChoices(choices);
    }

    /* ─── 增建房间 ─── */
    _showBuildRoom(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const currentCount = Object.keys(house.rooms).length;
        if (currentCount >= house.maxRooms) {
            g.addMessage('宅子里已经没有空地再建新房间了。', 'narrator');
            g.showChoices([{ text: '回去', action: () => this._showHouseMenu(cityId) }]);
            return;
        }
        const builtTypes = Object.keys(house.rooms);
        const available = Object.entries(HOUSE_ROOM_TYPES).filter(([id]) => !builtTypes.includes(id));
        if (available.length === 0) {
            g.addMessage('所有类型的房间都已经建了。', 'narrator');
            g.showChoices([{ text: '回去', action: () => this._showHouseMenu(cityId) }]);
            return;
        }
        g.addMessage('你想建什么样的房间？', 'narrator');
        const choices = available.map(([id, rt]) => {
            const lv1 = rt.levels[0];
            return {
                text: `${rt.icon} ${rt.name}（${lv1.cost.toLocaleString()}两）—— ${rt.desc}`,
                action: () => {
                    g.clearChoices();
                    const maxLv = house.maxLevel;
                    if (g.player.gold < lv1.cost) {
                        g.addMessage('囊中羞涩，建不起。', 'narrator');
                        this._showBuildRoom(cityId);
                        return;
                    }
                    g.player.gold -= lv1.cost;
                    house.rooms[id] = 1;
                    g.addMessage(`你请来工匠，在宅中建了一间${rt.name}。${lv1.desc}`, 'narrator');
                    g.updateStatsBar();
                    setTimeout(() => this._showHouseMenu(cityId), 500);
                },
            };
        });
        choices.push({ text: '算了', action: () => this._showHouseMenu(cityId) });
        g.showChoices(choices);
    }

    /* ─── 升级房间 ─── */
    _showUpgradeRoom(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const upgradable = Object.entries(house.rooms).filter(([type, lv]) => lv < house.maxLevel);
        if (upgradable.length === 0) {
            g.addMessage('所有房间都已升到最高级了。', 'narrator');
            g.showChoices([{ text: '回去', action: () => this._showHouseMenu(cityId) }]);
            return;
        }
        g.addMessage('你想升级哪个房间？', 'narrator');
        const choices = upgradable.map(([type, lv]) => {
            const rt = HOUSE_ROOM_TYPES[type];
            const nextLv = rt.levels[lv];
            return {
                text: `${rt.icon} ${rt.name} Lv.${lv} → Lv.${lv + 1}（${nextLv.cost.toLocaleString()}两）—— ${nextLv.desc}`,
                action: () => {
                    g.clearChoices();
                    if (g.player.gold < nextLv.cost) {
                        g.addMessage('囊中羞涩，升不起。', 'narrator');
                        this._showUpgradeRoom(cityId);
                        return;
                    }
                    g.player.gold -= nextLv.cost;
                    house.rooms[type] = lv + 1;
                    g.addMessage(`工匠一番施工，${rt.name}升级到了Lv.${lv + 1}。${nextLv.desc}`, 'narrator');
                    g.updateStatsBar();
                    setTimeout(() => this._showHouseMenu(cityId), 500);
                },
            };
        });
        choices.push({ text: '算了', action: () => this._showHouseMenu(cityId) });
        g.showChoices(choices);
    }

    /* ─── 卧室管理（增建/升级） ─── */
    _showBedroomMenu(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const cfg = HOUSE_BEDROOM_CONFIG;
        const currentCount = house.bedroomCount;
        const curLv = house._bedroomLevel || 0;
        g.addMessage(`卧室：${currentCount}/${house.maxBedrooms}间（当前等级Lv.${curLv}）`, 'info');
        const choices = [];
        if (currentCount < house.maxBedrooms) {
            const cost = cfg.levels[0].cost;
            choices.push({
                text: `增建一间卧室（${cost.toLocaleString()}两）`,
                action: () => {
                    g.clearChoices();
                    if (g.player.gold < cost) {
                        g.addMessage('囊中羞涩。', 'narrator');
                        this._showBedroomMenu(cityId);
                        return;
                    }
            g.player.gold -= cost;
            house.bedroomCount++;
            if (!house._bedroomLevel) house._bedroomLevel = 1;
            g.addMessage(`你请工匠新建了一间${cfg.levels[0].desc}`, 'narrator');
                    g.updateStatsBar();
                    setTimeout(() => this._showHouseMenu(cityId), 500);
                },
            });
        }
        if (curLv < house.maxLevel) {
            const nextLv = cfg.levels[curLv];
            choices.push({
                text: `升级所有卧室 Lv.${curLv} → Lv.${curLv + 1}（每间${nextLv.cost.toLocaleString()}两 × ${currentCount}间）`,
                action: () => {
                    g.clearChoices();
                    const total = nextLv.cost * currentCount;
                    if (g.player.gold < total) {
                        g.addMessage('囊中羞涩。', 'narrator');
                        this._showBedroomMenu(cityId);
                        return;
                    }
                    g.player.gold -= total;
                    house._bedroomLevel = curLv + 1;
                    g.addMessage(`工匠将所有卧室升级到Lv.${curLv + 1}。${nextLv.desc}`, 'narrator');
                    g.updateStatsBar();
                    setTimeout(() => this._showHouseMenu(cityId), 500);
                },
            });
        }
        choices.push({ text: '回去', action: () => this._showHouseMenu(cityId) });
        g.showChoices(choices);
    }

    /* ─── 鱼池 ─── */

    _showBuildPond(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const pc = HOUSE_POND_CONFIG;
        const lv1 = pc.levels[0];
        g.addMessage('你想在院中挖一处鱼池？掌柜的帮你算了算开销。', 'narrator');
        g.addMessage(`${pc.name}：${lv1.cost.toLocaleString()}两 — ${lv1.desc}`, 'info');
        g.showChoices([
            { text: `修建鱼池（${lv1.cost.toLocaleString()}两）`, action: () => {
                g.clearChoices();
                if (g.player.gold < lv1.cost) {
                    g.addMessage('囊中羞涩。', 'narrator');
                    this._showHouseMenu(cityId);
                    return;
                }
                g.player.gold -= lv1.cost;
                if (!house.features) house.features = {};
                house.features.pond = { level: 1, stock: { goldfish: 0, koi: 0, turtle: 0 }, wildFish: [] };
                g.addMessage(`工匠们抡锄挥锹，不几日便在院中挖出了一方鱼池。${lv1.desc}`, 'narrator');
                g.updateStatsBar();
                setTimeout(() => this._showHouseMenu(cityId), 500);
            }},
            { text: '算了', action: () => this._showHouseMenu(cityId) },
        ]);
    }

    _showPondMenu(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const pond = house.features.pond;
        const pc = HOUSE_POND_CONFIG;
        const lvCfg = pc.levels[pond.level - 1];
        const stock = pond.stock || { goldfish: 0, koi: 0, turtle: 0 };
        const totalStock = stock.goldfish + stock.koi + stock.turtle;
        g.addMessage(`—— 鱼池 Lv.${pond.level} ——`, 'system');
        g.addMessage(lvCfg.desc, 'info');
        const wildFish = pond.wildFish || [];
        g.addMessage(`蓄养：${totalStock}/${lvCfg.maxStock}尾 | 放养野鱼：${wildFish.length}尾`, 'info');
        const parts = [];
        if (stock.goldfish) parts.push(`金鱼×${stock.goldfish}`);
        if (stock.koi) parts.push(`锦鲤×${stock.koi}`);
        if (stock.turtle) parts.push(`灵龟×${stock.turtle}`);
        wildFish.forEach(f => parts.push(`${f.name}（野）`));
        if (parts.length > 0) {
            g.addMessage(`池中：${parts.join('、')}`, 'info');
        }
        const choices = [];
        // 随身鱼袋转入
        const pp = g.player._portablePond;
        if (pp) {
            choices.push({ text: `从随身鱼袋中取出${pp.name}`, action: () => {
                g.clearChoices();
                if (!pond.wildFish) pond.wildFish = [];
                pond.wildFish.push({ id: pp.id, name: pp.name, _viewed: false });
                g.player._portablePond = null;
                g.addMessage(`你将${pp.name}从青瓷缸中轻轻倒入鱼池。它摆了摆尾，悠然游向深处。`, 'narrator');
                g.updateStatsBar();
                setTimeout(() => this._showPondMenu(cityId), 400);
            }});
        }
        // 从背包放入观赏鱼（花鸟鱼市场买的或钓鱼所得均可）
        const invFish = g.player.items.filter(i => i.id.startsWith('fish_') || i.id.startsWith('fish_mkt_'));
        if (invFish.length > 0) {
            choices.push({ text: '放入观赏鱼（从背包）', action: () => this._showPondFromInventory(cityId) });
        }
        if (totalStock < lvCfg.maxStock) {
            choices.push({ text: '放入（购买）', action: () => this._showPondAddStock(cityId) });
        }
        if (totalStock > 0) {
            choices.push({ text: '捞取', action: () => this._showPondRemoveStock(cityId) });
        }
        if (pond.level < house.maxLevel) {
            choices.push({ text: `升级鱼池（${pc.levels[pond.level].cost.toLocaleString()}两）`, action: () => {
                g.clearChoices();
                const cost = pc.levels[pond.level].cost;
                if (g.player.gold < cost) {
                    g.addMessage('囊中羞涩。', 'narrator');
                    this._showPondMenu(cityId);
                    return;
                }
                g.player.gold -= cost;
                pond.level++;
                g.addMessage(`工匠一番扩建，鱼池变大了许多。${pc.levels[pond.level - 1].desc}`, 'narrator');
                g.updateStatsBar();
                setTimeout(() => this._showPondMenu(cityId), 500);
            }});
        }
        choices.push({ text: '观赏', action: () => {
            g.clearChoices();
            const wf = pond.wildFish || [];
            // 检查是否有未观赏过的稀有鱼
            const rareTiers = ['purple','orange','gold','red'];
            const unviewedRare = wf.filter(f => {
                if (f._viewed) return false;
                return f.tier && rareTiers.includes(f.tier);
            });
            let luckGained = 0;
            if (unviewedRare.length > 0) {
                unviewedRare.forEach(f => f._viewed = true);
                luckGained = unviewedRare.length * 5;
                g.player.attrs.luck += luckGained;
                const names = unviewedRare.map(f => f.name).join('、');
                g.addMessage(`你惊喜地发现鱼池中多了${names}！仔细观赏之下，福缘似有增长。`, 'narrator');
                g.addMessage(`福缘 +${luckGained}（当前 ${g.player.attrs.luck}）`, 'system');
            }
            if (totalStock === 0 && wf.length === 0) {
                g.addMessage('池中空无一物，只有一汪清水映着蓝天白云。', 'narrator');
            } else {
                const descs = [];
                if (stock.goldfish) descs.push(`${stock.goldfish}尾金鱼在荷叶间悠然穿梭`);
                if (stock.koi) descs.push(`${stock.koi}尾锦鲤翻腾跃动，鳞光闪烁`);
                if (stock.turtle) descs.push(`一只灵龟伏在池底石上，半眯着眼睛`);
                wf.forEach(f => descs.push(`一尾${f.name}悠然自得地在池中游弋`));
                g.addMessage(`你坐在池边，看着${descs.join('，')}，心中一片宁静。`, 'narrator');
                if (luckGained === 0) g.addMessage('心神安宁，疲劳尽消。', 'info');
            }
            g.updateStatsBar();
            g.showChoices([{ text: '回去', action: () => this._showPondMenu(cityId) }]);
        }});
        choices.push({ text: '回去', action: () => this._showHouseMenu(cityId) });
        g.showChoices(choices);
    }

    _showPondAddStock(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const pond = house.features.pond;
        const lvCfg = HOUSE_POND_CONFIG.levels[pond.level - 1];
        const stock = pond.stock;
        const totalStock = stock.goldfish + stock.koi + stock.turtle;
        const remaining = lvCfg.maxStock - totalStock;
        if (remaining <= 0) {
            g.addMessage('鱼池已满，再也放不下了。', 'narrator');
            g.showChoices([{ text: '回去', action: () => this._showPondMenu(cityId) }]);
            return;
        }
        g.addMessage('你想放入什么？（可多次放入）', 'narrator');
        const choices = HOUSE_POND_CONFIG.stockTypes.map(st => ({
            text: `${st.name}（${st.cost.toLocaleString()}两）— ${st.desc}`,
            action: () => {
                g.clearChoices();
                const s = pond.stock;
                const current = s[st.id] || 0;
                const total = s.goldfish + s.koi + s.turtle;
                if (total >= lvCfg.maxStock) {
                    g.addMessage('鱼池已满。', 'narrator');
                    this._showPondMenu(cityId);
                    return;
                }
                if (g.player.gold < st.cost) {
                    g.addMessage('囊中羞涩。', 'narrator');
                    this._showPondAddStock(cityId);
                    return;
                }
                g.player.gold -= st.cost;
                s[st.id] = (s[st.id] || 0) + 1;
                g.addMessage(`你放入一尾${st.name}。池中泛起一圈涟漪，${st.name}欢快地游向深处。`, 'narrator');
                g.updateStatsBar();
                setTimeout(() => this._showPondAddStock(cityId), 400);
            },
        }));
        choices.push({ text: '够了', action: () => this._showPondMenu(cityId) });
        g.showChoices(choices);
    }

    _showPondRemoveStock(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const stock = house.features.pond.stock;
        const available = HOUSE_POND_CONFIG.stockTypes.filter(st => (stock[st.id] || 0) > 0);
        if (available.length === 0) {
            g.showChoices([{ text: '回去', action: () => this._showPondMenu(cityId) }]);
            return;
        }
        g.addMessage('你想捞起什么？', 'narrator');
        const choices = available.map(st => ({
            text: `${st.name}（池中${stock[st.id]}尾）`,
            action: () => {
                g.clearChoices();
                stock[st.id]--;
                g.addMessage(`你捞起一尾${st.name}。它在网兜里扑腾了几下，被你放进了水桶。`, 'narrator');
                const itemId = 'pond_' + st.id;
                const itemDef = getItem(itemId);
                if (itemDef) g.player.items.push({ ...itemDef });
                g.addMessage(`获得${st.name}一尾。`, 'system');
                g.updateStatsBar();
                setTimeout(() => this._showPondRemoveStock(cityId), 400);
            },
        }));
        choices.push({ text: '算了', action: () => this._showPondMenu(cityId) });
        g.showChoices(choices);
    }

    /* ─── 从背包放入观赏鱼 ─── */
    _showPondFromInventory(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const pond = house.features.pond;
        const invFish = g.player.items.filter(i => (i.id.startsWith('fish_') || i.id.startsWith('fish_mkt_')) && !['water_weed','old_shoe','rusty_can'].includes(i.id));
        if (invFish.length === 0) {
            g.addMessage('背包里没有适合放入鱼池的鱼。', 'narrator');
            this._showPondMenu(cityId);
            return;
        }
        g.addMessage('你想把哪条鱼放入鱼池？', 'narrator');
        const choices = invFish.map((item, idx) => ({
            text: item.tier ? `${item.name}【${ITEM_TIER_LABELS[item.tier] || item.tier}】` : item.name,
            action: () => {
                g.clearChoices();
                g.player.items.splice(g.player.items.indexOf(item), 1);
                if (!pond.wildFish) pond.wildFish = [];
                pond.wildFish.push({ id: item.id, name: item.name, tier: item.tier || null, _viewed: false });
                const tierLabel = item.tier ? `【${ITEM_TIER_LABELS[item.tier] || item.tier}】` : '';
                g.addMessage(`你将${tierLabel}${item.name}放入鱼池。鱼儿在水中欢快地游了一圈，似乎很喜欢新家。`, 'narrator');
                g.updateStatsBar();
                setTimeout(() => this._showPondMenu(cityId), 400);
            },
        }));
        choices.push({ text: '算了', action: () => this._showPondMenu(cityId) });
        g.showChoices(choices);
    }

    /* ─── 浴池 ─── */
    _showBuildBath(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        if (house.features?.bath) {
            g.addMessage('这里已经有浴池了。', 'narrator');
            this._showHouseMenu(cityId);
            return;
        }
        const hasHotspring = HOTSPRING_CITIES.includes(cityId);
        const options = [HOUSE_BATH_CONFIG.normal];
        if (hasHotspring) options.push(HOUSE_BATH_CONFIG.hotspring);
        if (options.length === 1) {
            // 只有露天浴池可选，直接建
            if (!house.features) house.features = {};
            house.features.bath = { type: 'normal', level: 1 };
            g.player.gold -= HOUSE_BATH_CONFIG.normal.levels[0].cost;
            g.addMessage(`你雇人在庭院中修建了一座${HOUSE_BATH_CONFIG.normal.name}。`, 'narrator');
            g.addMessage(HOUSE_BATH_CONFIG.normal.levels[0].desc, 'narrator');
            g.updateStatsBar();
            this._showHouseMenu(cityId);
            return;
        }
        g.addMessage('你想修建哪种浴池？', 'narrator');
        const choices = options.map(cfg => ({
            text: `${cfg.icon} ${cfg.name}（${cfg.levels[0].cost.toLocaleString()}两）— ${cfg.levels[0].desc}`,
            action: () => {
                g.clearChoices();
                if (!house.features) house.features = {}; house.features.bath = { type: cfg === HOUSE_BATH_CONFIG.normal ? 'normal' : 'hotspring', level: 1 };
                g.player.gold -= cfg.levels[0].cost;
                g.addMessage(`你雇人在庭院中修建了一座${cfg.name}。`, 'narrator');
                g.addMessage(cfg.levels[0].desc, 'narrator');
                g.updateStatsBar();
                this._showHouseMenu(cityId);
            },
        }));
        choices.push({ text: '算了', action: () => this._showHouseMenu(cityId) });
        g.showChoices(choices);
    }

    _showBathMenu(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        const bath = house.features?.bath;
        if (!bath || bath.level === 0) {
            g.addMessage('这里没有浴池。', 'narrator');
            this._showHouseMenu(cityId);
            return;
        }
        const cfg = HOUSE_BATH_CONFIG[bath.type];
        const lvCfg = cfg.levels[bath.level - 1];
        g.addMessage(`—— ${cfg.icon} ${cfg.name} Lv.${bath.level} ——`, 'system');
        g.addMessage(lvCfg.desc, 'narrator');
        g.addMessage('你可以在这里沐浴放松。', 'info');
        const choices = [
            { text: '沐浴', action: () => {
                g.clearChoices();
                const hpRec = lvCfg.healHp;
                const nlRec = lvCfg.healNeili;
                const p = g.player;
                const oldHp = p.attrs.hp;
                const oldNl = p.attrs.neiliMax - p.attrs.neiliCost;
                p.attrs.hp = Math.min(p.attrs.hp + hpRec, p.attrs.hpMax);
                p.attrs.neiliCost = Math.max(p.attrs.neiliCost - nlRec, 0);
                g.addMessage(`你宽衣解带，步入${cfg.name}。热水包裹全身，疲惫一扫而空。`, 'narrator');
                g.addMessage(`体力 +${p.attrs.hp - oldHp}，内力 +${nlRec}`, 'system');
                g.addMessage('浑身舒畅，神清气爽。', 'info');
                g.updateStatsBar();
                this._showBathMenu(cityId);
            }},
        ];
        if (bath.level < cfg.levels.length) {
            const nextLv = cfg.levels[bath.level];
            choices.push({ text: `升级浴池（${nextLv.cost.toLocaleString()}两）`, action: () => {
                g.clearChoices();
                if (g.player.gold < nextLv.cost) {
                    g.addMessage('囊中羞涩。', 'narrator');
                    this._showBathMenu(cityId);
                    return;
                }
                g.player.gold -= nextLv.cost;
                bath.level++;
                g.addMessage(`你扩建了${cfg.name}。`, 'narrator');
                g.addMessage(cfg.levels[bath.level - 1].desc, 'narrator');
                g.updateStatsBar();
                this._showBathMenu(cityId);
            }});
        }
        choices.push({ text: '回去', action: () => this._showHouseMenu(cityId) });
        g.showChoices(choices);
    }

    /* ─── 入住管理 ─── */
    _getAllIntimateBeauties() {
        const g = this.game;
        const result = [];
        for (const locId of Object.keys(g.beautyMap || {})) {
            for (const bd of g.beautyMap[locId]) {
                if (bd.chatLevel >= 4 && bd._hadSex) {
                    result.push(bd);
                }
            }
        }
        return result;
    }

    _getBeautyById(id) {
        const g = this.game;
        for (const locId of Object.keys(g.beautyMap || {})) {
            const found = g.beautyMap[locId].find(b => b.id === id);
            if (found) return found;
        }
        return null;
    }

    _showResidentMenu(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        g.addMessage(`—— 入住管理（${house.residents.length}人 / ${house.bedroomCount}间卧室） ——`, 'system');
        if (house.residents.length > 0) {
            g.addMessage('已入住：', 'info');
            house.residents.forEach(id => {
                const bd = this._getBeautyById(id);
                g.addMessage(`  ${bd ? bd.name : '未知女子'}`, 'info');
            });
        }
        const choices = [];
        if (house.residents.length < house.bedroomCount) {
            choices.push({ text: '接红颜入住', action: () => this._showAddResident(cityId) });
        }
        if (house.residents.length > 0) {
            choices.push({ text: '让红颜搬走', action: () => this._showRemoveResident(cityId) });
        }
        choices.push({ text: '回去', action: () => this._showHouseMenu(cityId) });
        g.showChoices(choices);
    }

    _showAddResident(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        if (house.residents.length >= house.bedroomCount) {
            g.addMessage('卧室已满，无法再接人入住。', 'narrator');
            g.showChoices([{ text: '回去', action: () => this._showResidentMenu(cityId) }]);
            return;
        }
        const intimate = this._getAllIntimateBeauties().filter(b => !house.residents.includes(b.id));
        if (intimate.length === 0) {
            g.addMessage('没有可以接来的红颜知己。（需要亲密关系且已同房过的女子）', 'narrator');
            g.showChoices([{ text: '回去', action: () => this._showResidentMenu(cityId) }]);
            return;
        }
        g.addMessage('你想接谁来住？', 'narrator');
        const choices = intimate.map(bd => ({
            text: bd.name,
            action: () => {
                g.clearChoices();
                house.residents.push(bd.id);
                g.addMessage(`${bd.name}搬进了你在${cityIdToName(cityId)}的宅子。`, 'narrator');
                setTimeout(() => this._showResidentMenu(cityId), 500);
            },
        }));
        choices.push({ text: '算了', action: () => this._showResidentMenu(cityId) });
        g.showChoices(choices);
    }

    _showRemoveResident(cityId) {
        this.game.clearChoices();
        const g = this.game;
        const house = g.player.houses[cityId];
        if (house.residents.length === 0) {
            g.showChoices([{ text: '回去', action: () => this._showResidentMenu(cityId) }]);
            return;
        }
        g.addMessage('你想让谁搬走？', 'narrator');
        const choices = house.residents.map(id => {
            const bd = this._getBeautyById(id);
            return {
                text: bd ? bd.name : '未知女子',
                action: () => {
                    g.clearChoices();
                    house.residents = house.residents.filter(k => k !== id);
                    g.addMessage(`${bd ? bd.name : '该女子'}搬离了你的宅子。`, 'narrator');
                    setTimeout(() => this._showResidentMenu(cityId), 500);
                },
            };
        });
        choices.push({ text: '算了', action: () => this._showResidentMenu(cityId) });
        g.showChoices(choices);
    }

    /* ─── 全局宅院总览 ─── */
    _showGlobalHouseMenu() {
        this.game.clearChoices();
        const g = this.game;
        const houses = g.player.houses || {};
        const cityIds = Object.keys(houses);
        if (cityIds.length === 0) {
            g.addMessage('你名下没有任何房产。', 'narrator');
            g.showChoices([{ text: '回去', action: () => g.showHomeChoices() }]);
            return;
        }
        const totalValue = this.getTotalPropertyValue();
        const maxRep = this.getMaxRepBonus();
        g.addMessage(`—— 名下宅院总览 ——`, 'system');
        g.addMessage(`总估值：${totalValue.toLocaleString()}两 | 声望加成：+${maxRep}`, 'info');
        cityIds.forEach(cId => {
            const h = houses[cId];
            const val = this.getPropertyValue(cId);
            const label = getHouseRepLabel(val);
            g.addMessage(`  ${cityIdToName(cId)}：${h.plotName}（估值${val.toLocaleString()}两 · ${label}）`, 'info');
        });
        const choices = cityIds.map(cId => {
            const h = houses[cId];
            // 庄园级别直接进入独立庄园界面
            if (h.plotIndex >= 2) {
                return {
                    text: `🏯 ${cityIdToName(cId)}的${h.plotName}`,
                    action: () => this.game.estateManager.enterEstate(cId),
                };
            }
            return {
                text: `${cityIdToName(cId)}的${h.plotName}`,
                action: () => this._showHouseMenu(cId),
            };
        });
        choices.push({ text: '回去', action: () => g.showHomeChoices() });
        g.showChoices(choices);
    }

    /* ─── 计算房产总价 ─── */
    getPropertyValue(cityId) {
        const house = this.game.player.houses?.[cityId];
        if (!house) return 0;
        let total = house.landPrice || 0;
        for (const [type, lv] of Object.entries(house.rooms)) {
            const rt = HOUSE_ROOM_TYPES[type];
            if (rt) {
                for (let l = 0; l < lv; l++) {
                    if (rt.levels[l]) total += rt.levels[l].cost;
                }
            }
        }
        const bdLv = house._bedroomLevel || 0;
        let bedroomUnitValue = 0;
        for (let l = 0; l < bdLv; l++) {
            bedroomUnitValue += HOUSE_BEDROOM_CONFIG.levels[l].cost;
        }
        total += bedroomUnitValue * house.bedroomCount;
        // 鱼池
        if (house.features?.pond?.level > 0) {
            const pc = HOUSE_POND_CONFIG;
            const pond = house.features.pond;
            for (let l = 0; l < pond.level; l++) {
                total += pc.levels[l].cost;
            }
            const stock = pond.stock || {};
            for (const st of pc.stockTypes) {
                total += st.value * (stock[st.id] || 0);
            }
            const wildFish = pond.wildFish || [];
            for (const wf of wildFish) {
                const itemDef = getItem(wf.id);
                if (itemDef) total += itemDef.value;
            }
        }
        // 浴池
        if (house.features?.bath?.level > 0) {
            const cfg = HOUSE_BATH_CONFIG[house.features.bath.type];
            if (cfg) {
                for (let l = 0; l < house.features.bath.level; l++) {
                    total += cfg.levels[l].cost;
                }
            }
        }
        return total;
    }

    /* ─── 房产总价值（所有城市） ─── */
    getTotalPropertyValue() {
        const houses = this.game.player.houses || {};
        return Object.keys(houses).reduce((sum, cityId) => sum + this.getPropertyValue(cityId), 0);
    }

    /* ─── 房产声望加成（最高房产档次） ─── */
    getMaxRepBonus() {
        const houses = this.game.player.houses || {};
        let maxValue = 0;
        for (const cityId of Object.keys(houses)) {
            const v = this.getPropertyValue(cityId);
            if (v > maxValue) maxValue = v;
        }
        return getHouseRepBonus(maxValue);
    }
}

function cityIdToName(id) {
    for (const c of WORLD.big_cities) if (c.id === id) return c.name;
    for (const c of WORLD.small_cities) if (c.id === id) return c.name;
    return id;
}
