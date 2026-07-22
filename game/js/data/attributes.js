const ATTRIBUTES = [
    { id: 1, key: 'root', name: '根骨', desc: '体力、防御、根基、身高' },
    { id: 2, key: 'wit', name: '悟性', desc: '学习、领悟、记忆' },
    { id: 3, key: 'luck', name: '福缘', desc: '运气、机缘、奇遇' },
    { id: 4, key: 'dexterity', name: '灵巧', desc: '身法、偷盗、敏捷' },
    { id: 5, key: 'appearance', name: '颜值', desc: '容貌、气质、异性好感' },
];

const RATINGS = [
    { min: 0, max: 10, label: '残缺', color: '#804040' },
    { min: 11, max: 20, label: '低劣', color: '#806040' },
    { min: 21, max: 30, label: '普通', color: '#808060' },
    { min: 31, max: 40, label: '良好', color: '#608060' },
    { min: 41, max: 50, label: '优秀', color: '#408060' },
    { min: 51, max: 60, label: '极品', color: '#4080a0' },
    { min: 61, max: 70, label: '卓越', color: '#4060c0' },
    { min: 71, max: 80, label: '罕见', color: '#6040c0' },
    { min: 81, max: 90, label: '世所罕见', color: '#a040c0' },
    { min: 91, max: 100, label: '万中无一', color: '#e0a040' },
];

function getRating(value) {
    for (const r of RATINGS) {
        if (value >= r.min && value <= r.max) return r;
    }
    return RATINGS[RATINGS.length - 1];
}

function getRatingLabel(value) {
    return getRating(value).label;
}

function getRatingIndex(value) {
    for (let i = 0; i < RATINGS.length; i++) {
        if (value >= RATINGS[i].min && value <= RATINGS[i].max) return i;
    }
    return RATINGS.length - 1;
}
