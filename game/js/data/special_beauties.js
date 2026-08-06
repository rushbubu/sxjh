/* ─── 特殊 NPC 美人系统 ───
   使用示例（在 game.js 或其他地方调用）：
     registerSpecialBeauty({
         id: 'special_mulan',
         locationId: 'taoyuan',
         fixedVenue: '酒馆',
         name: '花木兰', age: 19, surface: 'unmarried', inner: 'unmarried',
         height: 168, bust: 34, waist: 23, hips: 35,
         faceScore: 92, bodyScore: 88,
         faceDesc: '……', bodyDesc: '……',
         clothing: '一身红装，英姿飒爽。',
         dialogueTree: { ... },  // 自定义对话树（可选）
         onInteract: null,       // 自定义交互函数（可选）
     });
*/

const SPECIAL_BEAUTIES = [];

function registerSpecialBeauty(cfg) {
    const b = {
        id: cfg.id,
        special: true,
        locationId: cfg.locationId,
        fixedVenue: cfg.fixedVenue || null,
        name: cfg.name,
        age: cfg.age,
        surface: cfg.surface,
        inner: cfg.inner || cfg.surface,
        squirtChance: cfg.squirtChance != null ? cfg.squirtChance : (typeof rollSquirtChance === 'function' ? rollSquirtChance() : 15),
        height: cfg.height,
        heightLabel: getHeightLabel(cfg.height),
        faceScore: cfg.faceScore,
        bodyScore: cfg.bodyScore,
        bust: cfg.bust, waist: cfg.waist, hips: cfg.hips,
        faceDesc: cfg.faceDesc || '',
        bodyDesc: cfg.bodyDesc || '',
        clothing: cfg.clothing || '',
        favorability: cfg.favorability || 0,
        requirements: cfg.requirements || [],
        chatLevel: cfg.chatLevel || 0,
        _revealed: cfg._revealed || { face: true, body: true, clothing: true, age: true, height: true, measurements: true, marital: true },
        flirtCount: 0, flirtDay: 0,
        _hadSex: false,
        _wantedGift: null,
        // 扩展字段
        dialogueTree: cfg.dialogueTree || null,
        onInteract: cfg.onInteract || null,
        questFlags: cfg.questFlags || {},
        _questData: cfg._questData || null,
    };
    b.beautyScore = computeBeautyScore(b);
    const tier = getBeautyTier(b.beautyScore);
    b.beautyTier = tier.key;
    b.beautyTierLabel = tier.label;
    b.beautyTierColor = tier.color;
    b.chastity = computeChastity(b);
    SPECIAL_BEAUTIES.push(b);
    return b;
}
