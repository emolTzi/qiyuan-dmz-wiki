/* ============================================================
   祈愿龙珠 · 全种族 WIKI — 数据库
   数据源：服务端运行配置（2026-09 快照）· DragonMineZ 2.1.3 祈愿魔改版
   ============================================================ */

const STAT_META = [
  { k:'STR', cn:'力量',   en:'Strength',   color:'#ff7a18', desc:'近战伤害与打击攻击伤害的重要来源（在打击公式中占 25% 权重）。' },
  { k:'SPD', cn:'速度',   en:'Speed',      color:'#3ee2ff', hot:true, desc:'本服最重要的改版属性（旧称 SKP）。打击/连招伤害的主属性，同时换算为移动速度、攻击速度、冷却缩减、气功施法缩减、突进距离与闪避。前期投入收益极高：投入 1% 上限即先拿走 20% 收益。' },
  { k:'RES', cn:'抗性',   en:'Resistance', color:'#a06bff', desc:'减伤属性。形态对 RES 的倍率取「(DEF倍率 + STM倍率) ÷ 2」。' },
  { k:'VIT', cn:'体质',   en:'Vitality',   color:'#59ffa0', desc:'生命上限与生命回复。HP = baseHp5 + VIT × hp5VitScaling（本服实际 ×0.5）。' },
  { k:'PWR', cn:'气功强度', en:'Ki Power', color:'#ffc233', desc:'气弹 / 波 / 光束等一切气功伤害的强度属性。' },
  { k:'ENE', cn:'能量',   en:'Energy',     color:'#ff5d9e', desc:'气（Ki/EP）上限与气回复。EP = baseEp5 + ENE × ep5EneScaling。' },
];

const RES_META = [
  { ico:'❤', cn:'HP 生命', desc:'基础 5 + VIT×0.06（实际生效×0.5）' },
  { ico:'✦', cn:'EP 气',   desc:'基础 5 + ENE×0.05，变身/气功/飞行消耗' },
  { ico:'⚡', cn:'SP 体力', desc:'基础 14 + STM×0.15，冲刺/闪避/打击消耗' },
  { ico:'◈', cn:'架势',    desc:'被打击时的破防条，归零眩晕 3 秒' },
  { ico:'✪', cn:'TP 训练点', desc:'技能货币：命中/挖矿/移动/合成均可获得' },
];

const STAT_KEYS = ['STR','SPD','RES','VIT','PWR','ENE'];
const GROWTH_KEYS = ['STR','SPD','STM','DEF','VIT','PWR','ENE'];
const RACE_RES_COMMON = { hp5:'5（实 2.5）', hp5v:'0.06（实 0.03）', ep5:5, ep5e:0.05, sp5:14, sp5s:0.15, tpc:1, tpg:1 };

/* 形态简写构造函数：
   f(id, 中文名, 解锁等级, [STR,SPD,STM,DEF,VIT,PWR,ENE,移速,攻速], [气耗,体耗,血耗], 前置, [变身,叠加,瞬变,自由], [[备注类型,文本]...])
   备注类型：lit=闪电 mdl=模型 mut=互斥 shr=共享 ol=描边 warn=警告 ok=正向 */
const f = (id,name,unlock,m,d,req,mas,notes)=>({id,name,unlock,m,d,req,mas,notes:notes||[]});
const N = {
  ult:['mut','互斥 究极'],
  lit:['lit','闪电特效'],
  ol:['ol','描边'],
  noStack:['warn','不可叠加'],
};
const mdl = s=>['mdl','模型 '+s];
const shr = s=>['shr','共享 '+s];

const RACES = [
/* ================= 地球人 ================= */
{
  id:'human', name:'地球人', color:'#3ee2ff', aura:'#7FFFFF', source:'原生',
  desc:'拥有全面战斗技巧的地球种族。虽缺少其他种族的先天力量，但极具智慧且坚韧顽强，以毅力与勇气著称，能通过训练与自律克服自身局限。',
  traits:['有性别','无尾巴','体型 ×0.9375','气焰 #7FFFFF'],
  stats:[2,3,1,0,2,5],
  growth:[0.5,0.5,0.6,0.4,0.6,0.7,2.0],
  racial:{
    name:'潜能爆发 / 气再生强化',
    lines:[
      '<b>发动</b>：按 <b>小键盘 0</b> 释放潜能爆发（Alternate Passives 路径）。',
      '<b>积攒</b>：造成伤害 +0.8/点、受伤 +1.2/点，上限 100；潜能值 ≥ 25 才能发动。',
      '<b>效果</b>：持续 50 秒 × 潜能比例，伤害倍率最高 <b>×2.1</b>，期间每秒 +15 气；冷却 60 秒。',
      '<b>被动</b>：气再生 <b>+25%</b>（改造人造人 ×2 = +50%）；气 ≥ 85% 时战力 +20%（STR/SPD/PWR/DEF）。',
      '<b>气攻修正</b>：气功消耗 ×0.75（改造人造人 ×0.50）；人造人气功伤害 ×0.85、被动气回 ×2。',
      '<b>隐藏被动</b>：非人造人蓄气时按原气耗 ×0.125 以血换伤，累积值在气弹命中时一次性附加。',
    ]
  },
  tp:[['超级形态',[21000,42000,65000,104000]],['人造人形态',[42000,104000]],['变异形态',[-1,-1,-1]]],
  forms:[
    { group:'超级形态', gid:'superforms', list:[
      f('buffed','强化',1,[1.6,1.75,1,1.38,1,1.45,1,1,1],[0.08,0,0],null,[0,25,40,0],[mdl('buffed')]),
      f('fullpower','全功率',2,[2.1,2.25,1,1.81,1,1.9,1,1,1],[0.16,0,0],'superforms.buffed',[25,25,40,50],[]),
      f('overdrive','超载',3,[2.85,3,1,2.44,1,2.6,1,1,1],[0.34,0,0],'superforms.fullpower',[25,25,40,50],[N.lit]),
      f('solaris','索拉里斯',4,[4.7,4.9,1,2.88,1,4.2,1,1,1],[0.28,0,0],'superforms.overdrive',[25,25,40,50],[]),
    ]},
    { group:'人造人形态', gid:'androidforms', list:[
      f('androidbase','人造人基础形态',0,[2,2,1,1.75,1,2.3,1,1,1],[0,0.03,0],null,[0,25,40,0],[N.ult]),
      f('superandroid','超级人造人',1,[2.9,2.9,1,2.38,1,3.3,1,1,1],[0,0.05,0],'androidforms.androidbase',[25,25,40,50],[N.ult]),
      f('fusedandroid','融合人造人',2,[3.7,3.7,1,3,1,4.2,1,1,0.85],[0,0.08,0],'androidforms.superandroid',[25,25,40,50],[N.ult,N.lit,mdl('buffed')]),
    ]},
    { group:'变异形态', gid:'legendaryforms', list:[
      f('shiyoken','四身拳',1,[3.4,3.4,1,2.62,1,3.4,1,1,1],[0.22,0,0],null,[0,25,40,0],[N.ult,N.lit]),
      f('shin_shiyoken','新·四身拳',2,[4.3,4.3,1,3.25,1,4.3,1,1,1],[0.28,0,0],'legendaryforms.shiyoken',[25,25,40,50],[N.ult,N.lit,mdl('buffed')]),
      f('chou_shiyoken','超·四身拳',3,[5,5,1,3.62,1,5,1,1,1],[0.34,0,0],'legendaryforms.shin_shiyoken',[25,25,40,50],[N.ult,N.lit,mdl('4arms'),N.ol]),
    ]},
  ]
},
/* ================= 赛亚人 ================= */
{
  id:'saiyan', name:'赛亚人', color:'#ffc233', aura:'#7FFFFF', source:'原生',
  desc:'天生为战斗而生的战士种族。每次战斗后变强的天赋使他们成为可怕的对手，甚至能变身为强大的超级赛亚人，将能力提升到难以想象的程度。',
  traits:['有性别','有尾巴','体型 ×0.9375','气焰 #7FFFFF'],
  stats:[5,3,2,1,1,1],
  growth:[0.7,1.0,0.8,0.6,0.4,0.5,0.8],
  racial:{
    name:'怒气（Fury）/ 濒死复活（Zenkai）',
    lines:[
      '<b>全自动被动</b>，无需按键。首次点燃提示「赛亚人之怒觉醒！」。',
      '<b>怒气</b>：血量低于 90% 时生效，血越低越强，倍率 1 + 强度/20 × 0.85，加成 <b>STR / SPD / PWR</b>。',
      '<b>Zenkai 条件</b>：DMZ 等级 ≥ 100、层数 < 3、不在冷却中；血量跌至 ≤15% 后<b>连续保持 8 秒</b>结算（回到 15% 以上计时清零）。',
      '<b>Zenkai 效果</b>：回复 20% 最大生命，并对 STR/SPD/PWR 写入「当前属性 × 7.5%」的<b>永久加成</b>；上限 3 层。',
      '<b>冷却</b>：900 秒（15 分钟）。',
      '<b>revamp 叠加</b>：血量 ≤ 25% 触发叠层（最多 24 层、免死触发时 48 层），每层 +0.5% 六维；每次使用效率 −2%。',
    ]
  },
  tp:[['超级形态',[13000,21000,31000,42000,52000,65000,78000,104000,-1,250000]],['神之形态',[80000,160000,320000,1000000]],['变异形态',[-1,-1,-1,1500000,5000000]],['野兽形态',[650000]]],
  forms:[
    { group:'超级赛亚人阶段', gid:'ssgrades', list:[
      f('supersaiyan','超级赛亚人',1,[1.5,1.5,1,1.31,1,1.5,1,1,1],[0.08,0,0],null,[0,25,40,0],[]),
      f('supersaiyangrade2','超级赛亚人二阶',2,[1.75,1.75,1,1.5,1,1.75,1,0.9,1],[0.12,0,0],'ssgrades.supersaiyan',[25,25,40,50],[mdl('buffed')]),
      f('supersaiyangrade3','超级赛亚人三阶',3,[2.75,2.75,1,2,1,2.75,1,0.7,0.75],[0.48,0,0],'ssgrades.supersaiyangrade2',[25,25,40,50],[mdl('buffed')]),
    ]},
    { group:'超级赛亚人', gid:'supersaiyan', list:[
      f('supersaiyanmastered','圆满超级赛亚人',4,[1.75,1.75,1,1.44,1,1.75,1,1,1],[0.03,0,0],null,[0,25,40,0],[]),
      f('supersaiyan2','超级赛亚人2',5,[2.25,2.25,1,1.81,1,2.25,1,1,1],[0.16,0,0],'supersaiyan.supersaiyanmastered',[25,25,40,50],[N.lit]),
      f('supersaiyan3','超级赛亚人3',6,[3,3,1,2.44,1,3,1,1,1],[0.34,0,0],'supersaiyan.supersaiyan2',[25,25,40,50],[N.lit]),
      f('supersaiyan4','超级赛亚人4',8,[4.6,4.6,1,2.88,1,4.6,1,1,1],[0.24,0,0],'supersaiyan.supersaiyan3',[25,25,40,50],[N.lit,mdl('ssj4d'),N.ol]),
      f('supersaiyan5daima',null,9,[null,null,null,null,null,null,null,null,null],[null,null,null],'supersaiyan.supersaiyan4',[null,null,null,null],[N.lit,mdl('ssj4d')]),
    ]},
    { group:'巨猿', gid:'oozaru', list:[
      f('oozaru','巨猿',0,[1.2,1.2,1,1.12,1,1.2,1,0.8,0.25],[0.05,0,0],null,[0,25,40,0],[mdl('oozaru')]),
      f('goldenoozaru','黄金巨猿',7,[2,2,1,2.12,1,2,1,0.85,0.25],[0.24,0,0],'oozaru.oozaru',[25,25,40,50],[mdl('oozaru')]),
      f('supersaiyan4','超级赛亚人4',8,[4.6,4.6,1,2.88,1,4.6,1,1,1],[0.24,0,0],'oozaru.goldenoozaru',[25,25,40,50],[mdl('ssj4gt')]),
      f('supersaiyan5',null,9,[8,8,1,5.5,1,8,1,1,null],[0.5,0,null],'oozaru.supersaiyan4',[null,null,null,null],[N.lit,mdl('ssj4gt')]),
      f('supersaiyan4fp','SSJ 4 全功率',9,[4.75,4.75,1,3.55,1,4.75,1,1,1],[0.32,0,0],'oozaru.supersaiyan4',[100,25,40,50],[N.ult,N.lit,mdl('ssj4gt')]),
      f('supersaiyan4lb','SSJ 4 极限突破',10,[6.25,6.25,1,4.57,1,6.25,1,1,1],[0.45,0,0],'oozaru.supersaiyan4fp',[100,25,40,50],[N.ult,N.lit,mdl('ssj4gt'),N.ol]),
    ]},
    { group:'神之形态', gid:'godforms', list:[
      f('supersaiyangod','超级赛亚人之神',1,[4.4,4.4,1,3.29,1,4.4,1,1.09,1.05],[0.25,0,0],null,[0,0,29.6,43.9],[shr('超赛蓝'),N.ol]),
      f('supersaiyanblue','超级赛亚人蓝',2,[5.37,5.37,1,3.9,1,5.37,1,1.15,1.1],[0.29,0,0],'godforms.supersaiyangod',[25.2,0,32.8,47.7],[shr('蓝进化'),N.ol]),
      f('supersaiyanblueevolved','超级赛亚人蓝·进化',3,[6.56,6.56,1,4.64,1,6.56,1,1.21,1.15],[0.35,0,0],'godforms.supersaiyanblue',[30,0,36,51.5],[shr('圆满蓝'),N.lit,N.ol]),
      f('supersaiyanblueperfected','圆满超级赛亚人蓝',4,[8.01,8.01,1,5.55,1,8.01,1,1.27,1.2],[0.41,0,0],'godforms.supersaiyanblueevolved',[35,0,41,56],[N.lit,N.ol]),
      f('supersaiyanrose','超级赛亚人玫红',4,[5.37,5.37,1,3.9,1,5.37,1,1.15,1.1],[0.29,0,0],'godforms.supersaiyangod',[25.2,0,32.8,47.7],[shr('玫红进化'),N.lit,N.ol]),
      f('supersaiyanroseevolved','超级赛亚人玫红·进化',4,[6.56,6.56,1,4.64,1,6.56,1,1.21,1.15],[0.35,0,0],'godforms.supersaiyanrose',[30,0,36,51.5],[shr('玫红3'),N.lit,N.ol]),
      f('supersaiyanrose3','超级赛亚人玫红3',4,[8.01,8.01,1,5.67,1,8.01,1,1.27,1.2],[0.41,0,0],'godforms.supersaiyanroseevolved',[35,0,41,56],[shr('玫红全功率'),N.lit,N.ol]),
      f('supersaiyanrosefullpower','超级赛亚人玫红·全功率',4,[9.77,9.77,1,6.91,1,9.77,1,1.33,1.25],[0.47,0,0],'godforms.supersaiyanrose3',[42,0,48,62],[N.lit,N.ol]),
    ]},
    { group:'变异形态', gid:'legendaryforms', list:[
      f('ikari','愤怒',1,[3.4,3.4,1,2.62,1,3.4,1,1,1],[0.1,0,0],null,[0,25,40,0],[N.ult,mdl('buffed'),N.ol]),
      f('ssjhybrid','混合超级赛亚人',2,[4.3,4.3,1,3.25,1,4.3,1,1,1],[0.16,0,0],'legendaryforms.ikari',[25,25,40,50],[N.ult,N.lit,mdl('buffed')]),
      f('ssjfullpower','超级赛亚人全功率',3,[5,5,1,3.62,1,5,1,1,1],[0.26,0,0],'legendaryforms.ssjhybrid',[25,25,40,50],[N.ult,N.lit,mdl('buffed')]),
      f('ssjlegendary3','SSJ 3 愤怒',4,[7,7,1,5.08,1,7,1,1,1],[0.4,0,0],'legendaryforms.ssjfullpower',[25,25,40,50],[N.ult,N.lit,mdl('buffed')]),
      f('ssjlegendary4','SSJ 4 愤怒',5,[10,10,1,7.12,1,10,1,1,1],[0.6,0,0],'legendaryforms.ssjlegendary3',[25,25,40,50],[N.ult,N.lit,mdl('ssj4gt'),N.ol]),
    ]},
    { group:'野兽形态', gid:'beastforms', list:[
      f('beast','野兽',1,[8.01,8.01,1,5.55,1,8.01,1,1.27,1.2],[0.41,0,0],null,[0,0,39.2,55.3],[N.noStack,N.ol,['warn','须向悟饭学习']]),
    ]},
  ]
},
/* ================= 半赛亚人 ================= */
{
  id:'half_saiyan', name:'半赛亚人', color:'#ffdf6b', aura:'#7FFFFF', source:'SU 附加包',
  unlock:'免费解锁',
  desc:'地球人与赛亚人的混血后裔，六维全 5 的均衡面板。完全复用赛亚人的怒气与濒死复活，形态路线与赛亚人一致但少了神之形态与野兽形态。',
  traits:['有性别','有尾巴','体型 ×0.9375','气焰 #7FFFFF'],
  stats:[5,5,5,5,5,5],
  growth:[0.6,0.6,0.6,0.6,0.6,0.6,0.6],
  racial:{
    name:'怒气 / 濒死复活（复用赛亚人）',
    lines:[
      '种族技能完全复用 <b>saiyan</b>：怒气 Fury 与 Zenkai 濒死复活，规则与赛亚人一致。',
      '<b>Zenkai</b>：等级 ≥100、血 ≤15% 连续 8 秒 → 回 20% 血 + STR/SPD/PWR 永久 +7.5%，3 层上限，冷却 15 分钟。',
    ]
  },
  tp:[['超级形态',[13000,21000,31000,42000,52000,65000,78000,104000]],['变异形态',[-1,-1,-1]]],
  forms:[
    { group:'超级赛亚人阶段', gid:'ssgrades', list:[
      f('supersaiyan','超级赛亚人',1,[1.5,1.5,1,1.31,1,1.5,1,1,1],[0.08,0,0],null,[0,25,40,0],[]),
      f('supersaiyangrade2','超级赛亚人二阶',2,[1.75,1.75,1,1.5,1,1.75,1,0.9,1],[0.12,0,0],'ssgrades.supersaiyan',[25,25,40,50],[mdl('buffed')]),
      f('supersaiyangrade3','超级赛亚人三阶',3,[2.75,2.75,1,2,1,2.75,1,0.7,0.75],[0.48,0,0],'ssgrades.supersaiyangrade2',[25,25,40,50],[mdl('buffed')]),
    ]},
    { group:'超级赛亚人', gid:'supersaiyan', list:[
      f('supersaiyanmastered','圆满超级赛亚人',4,[1.75,1.75,1,1.44,1,1.75,1,1,1],[0.03,0,0],null,[0,25,40,0],[]),
      f('supersaiyan2','超级赛亚人2',5,[2.25,2.25,1,1.81,1,2.25,1,1,1],[0.16,0,0],'supersaiyan.supersaiyanmastered',[25,25,40,50],[N.lit]),
      f('supersaiyan3','超级赛亚人3',6,[3,3,1,2.44,1,3,1,1,1],[0.34,0,0],'supersaiyan.supersaiyan2',[25,25,40,50],[N.lit]),
      f('supersaiyan4','超级赛亚人4',8,[4.6,4.6,1,2.88,1,4.6,1,1,1],[0.24,0,0],'supersaiyan.supersaiyan3',[25,25,40,50],[N.lit,mdl('ssj4d'),N.ol]),
      f('supersaiyan5daima',null,9,[null,null,null,null,null,null,null,null,null],[null,null,null],'supersaiyan.supersaiyan4',[null,null,null,null],[N.lit,mdl('ssj4d')]),
    ]},
    { group:'巨猿', gid:'oozaru', list:[
      f('oozaru','巨猿',0,[1.2,1.2,1,1.12,1,1.2,1,0.8,0.25],[0.05,0,0],null,[0,25,40,0],[mdl('oozaru')]),
      f('goldenoozaru','黄金巨猿',7,[2,2,1,2.12,1,2,1,0.85,0.25],[0.24,0,0],'oozaru.oozaru',[25,25,40,50],[mdl('oozaru')]),
      f('supersaiyan4','超级赛亚人4',8,[4.6,4.6,1,2.88,1,4.6,1,1,1],[0.24,0,0],'oozaru.goldenoozaru',[25,25,40,50],[mdl('ssj4gt')]),
      f('supersaiyan5',null,9,[8,8,1,5.5,1,8,1,1,null],[0.5,0,null],'oozaru.supersaiyan4',[null,null,null,null],[N.lit,mdl('ssj4gt')]),
    ]},
    { group:'变异形态', gid:'legendaryforms', list:[
      f('ikari','愤怒',1,[3.4,3.4,1,2.62,1,3.4,1,1,1],[0.1,0,0],null,[0,25,40,0],[N.ult,mdl('buffed'),N.ol]),
      f('ssjhybrid','混合超级赛亚人',2,[4.3,4.3,1,3.25,1,4.3,1,1,1],[0.16,0,0],'legendaryforms.ikari',[25,25,40,50],[N.ult,N.lit,mdl('buffed')]),
      f('ssjfullpower','超级赛亚人全功率',3,[6,6,1,3.62,1,6,1,1,1],[0.3,0,0],'legendaryforms.ssjhybrid',[25,25,40,50],[N.ult,N.lit,mdl('buffed')]),
    ]},
  ]
},
/* ================= 那美克星人 ================= */
{
  id:'namekian', name:'那美克星人', color:'#7fff00', aura:'#7FFF00', source:'原生',
  desc:'和平而强大的种族，拥有强大的再生能力，与魔法和自然有着天然联系。以智慧、能量控制以及与同族合体增强力量的能力而闻名。',
  traits:['无性别','无尾巴','体型 ×0.9375','气焰 #7FFF00'],
  stats:[2,2,3,2,2,2],
  growth:[0.8,0.3,0.9,1.0,1.0,0.4,1.4],
  racial:{
    name:'同化 / 重生（Renascer）/ 再生',
    lines:[
      '<b>同化</b>：径向菜单「动作 → 种族技能」→ 按住 G。范围 3 格；目标限那美克星人玩家 / 那美克星战士 / 商人 / 比克。',
      '<b>同化效果</b>：回复 35% 生命 + 每层 STR/SPD/PWR +7.5%（revamp 层为自身原始属性 +15%），上限 4 层；revamp 层<b>无冷却</b>、每次使用效率 −2%。',
      '<b>重生</b>：按 <b>小键盘 0</b>，需血量 ≤ 30% 且气 ≥ 200；回复 60% 生命并永久 +0.02 Heritage（上限 0.5），冷却 240 秒。',
      '<b>再生被动</b>：脱战 6 秒后每秒回复 min(5%, 1.5%×(1+平静/10)) 最大生命。',
      '<b>专属打击技</b>：那美克回复——恢复最大生命 20%，消耗等量体力，冷却 60 秒。',
    ]
  },
  tp:[['超级形态',[23000,47000,78000,-1,220000]],['神之形态',[80000,160000,320000,1000000]],['变异形态',[-1,-1,-1]]],
  forms:[
    { group:'超级形态', gid:'superforms', list:[
      f('giant','巨人',1,[2,2,1,1.75,1,2,1,1,0.25],[0.09,0,0],null,[0,25,40,0],[]),
      f('fullpower','全功率',2,[2.85,2.85,1,2.31,1,2.85,1,1,1],[0.18,0,0],'superforms.giant',[25,25,40,50],[]),
      f('supernamekian','超级那美克星人',3,[3.75,3.75,1,2.88,1,3.75,1,1,1],[0.27,0,0],'superforms.fullpower',[25,25,40,50],[N.lit,mdl('namekian_buffed')]),
    ]},
    { group:'原始那美克星人', gid:'primalnamekian', list:[
      f('primalnamekian',null,4,[4.75,4.75,1,3.5,1,4.75,1,1,1],[0.28,0,0],null,[0,25,40,50],[N.lit,mdl('namekian_buffed'),N.ol]),
    ]},
    { group:'神之形态', gid:'divineforms', list:[
      f('potentialunleashed','潜能解放',1,[6.5,6.5,1,4.5,1,6.5,1,1.12,1.08],[0.33,0,0],'superforms.supernamekian',[30,25,36,51],[shr('橙色'),N.ol]),
      f('golden','橙色那美克星人',2,[8.01,8.01,1,5.55,1,8.01,1,1.27,1.2],[0.41,0,0],'divineforms.potentialunleashed',[34.8,25,41,56],[shr('觉醒橙色巨人'),N.ol]),
      f('awakenedgoldengiant','觉醒橙色巨人',3,[11.94,11.94,1,8.27,1,11.94,1,0.71,0.58],[0.58,0,0],'divineforms.golden',[44.4,25,50,63],[shr('超级那美克星人之神'),mdl('namekian_buffed'),N.ol]),
      f('supernamekiangod','超级那美克星人之神',4,[13.5,13.5,1,9.35,1,13.5,1,1.3,1.22],[0.64,0,0],'divineforms.awakenedgoldengiant',[52,0,58,70],[N.lit,N.ol]),
    ]},
    { group:'变异形态', gid:'legendaryforms', list:[
      f('evilnamek','邪恶那美克星人',1,[3.4,3.4,1,2.62,1,3.4,1,1,1],[0.18,0,0],null,[0,25,40,0],[N.ult,N.lit]),
      f('evilgiantnamek','邪恶巨大那美克星人',2,[4.3,4.3,1,3.25,1,4.3,1,0.75,0.25],[0.25,0,0],'legendaryforms.evilnamek',[25,25,40,50],[N.ult,mdl('namekian_buffed')]),
      f('buffednamek','强化那美克星人',3,[5,5,1,3.62,1,5,1,1,1],[0.24,0,0],'legendaryforms.evilgiantnamek',[25,25,40,50],[N.ult,N.lit,mdl('namekian_buffed'),N.ol]),
    ]},
  ]
},
/* ================= 冰冻恶魔 ================= */
{
  id:'frostdemon', name:'冰冻恶魔', color:'#a06bff', aura:'#5F00FF', source:'原生',
  desc:'拥有巨大力量和无限残忍的星际征服者种族。变强与变身的能力使他们成为可怕的敌人——尽管外表纤弱，却是宇宙中最致命的生物之一。',
  traits:['无性别','无尾巴','体型 ×0.7375','气焰 #5F00FF'],
  stats:[0,3,1,0,5,4],
  growth:[0.1,0.7,0.3,0.5,0.3,1.0,2.0],
  racial:{
    name:'自然进化 / TP 天赋',
    lines:[
      '<b>纯被动，无按键</b>：「自然进化」每 25 分钟自动 +0.1（精神时光屋内翻倍 +0.2），上限 2.0，加成 STR/SPD/PWR。',
      '<b>死亡惩罚</b>：死亡使进化值减半。',
      '<b>TP 天赋</b>：TP 获取 <b>+25%</b>（加法叠加到其他来源）。',
      '<b>revamp 叠加</b>：每损失 1% 生命，速度与战力 +0.5%；打击体力消耗 −50%。',
    ]
  },
  tp:[['超级形态',[18000,31000,52000,83000,117000]],['变异形态',[-1,-1,-1]]],
  forms:[
    { group:'进化形态', gid:'evolutionforms', list:[
      f('second','第二形态',1,[1.65,1.65,1,1.38,1,1.65,1,1,1],[0,0,0],null,[0,25,40,0],[]),
      f('third','第三形态',2,[2.1,2.1,1,1.81,1,2.1,1,1,1],[0,0,0],'evolutionforms.second',[25,25,40,50],[mdl('frostdemon_third')]),
      f('final','最终形态',3,[2.6,2.6,1,2.19,1,2.6,1,1,1],[0,0,0],'evolutionforms.third',[25,25,40,50],[]),
      f('fullpower','全功率',4,[3.15,3.15,1,2.5,1,3.15,1,1,0.75],[0.22,0,0],'evolutionforms.final',[25,25,40,50],[mdl('frostdemon_fp')]),
      f('fifth','第五形态',5,[3.9,3.9,1,3,1,3.9,1,1,1],[0.28,0,0],'evolutionforms.fullpower',[25,25,40,50],[N.lit,mdl('frostdemon_fifth')]),
    ]},
    { group:'变异形态', gid:'legendaryforms', list:[
      f('mecha','机械',1,[3.5,3.5,1,2.69,1,3.5,1,1,1],[0,0,0],null,[0,25,40,0],[N.ult,N.lit,mdl('frostdemon_mecha')]),
      f('metal','金属',2,[4.4,4.4,1,3.31,1,4.4,1,1,1],[-0.05,0,0],'legendaryforms.mecha',[25,25,40,50],[N.ult,N.lit,mdl('frostdemon_fp')]),
      f('metalcore','金属核心',3,[5.1,5.1,1,3.69,1,5.1,1,1,0.25],[-0.1,0,0],'legendaryforms.metal',[25,25,40,50],[N.ult,mdl('frostdemon_metalcore')]),
    ]},
  ]
},
/* ================= 生化人造人 ================= */
{
  id:'bioandroid', name:'生化人造人', color:'#22c55e', aura:'#1AA700', source:'原生',
  desc:'被人工创造的生命，融合了最强大种族的 DNA。凭借吸收其他生命并将力量提升到难以想象程度的能力，适应力强且危险，被设计为无敌。',
  traits:['无性别','无尾巴','体型 ×0.9375','气焰 #1AA700'],
  stats:[2,3,1,1,2,3],
  growth:[0.5,0.6,0.6,0.6,0.6,0.4,1.6],
  racial:{
    name:'汲取 / 召唤小沙鲁 / 适应与完美',
    lines:[
      '<b>汲取</b>：按住 G <b>立即执行</b>（无蓄力），冷却 180 秒。对双方施加眩晕、瞬移到目标身后吸附 5 秒，结束将其击飞。',
      '<b>汲取结算</b>：每秒扣除目标最大生命 25%÷5，按扣除量回血并额外获得 5 倍的气；目标血 ≤1 直接击杀。',
      '<b>召唤小沙鲁</b>：按 <b>小键盘 0</b>，最多 3 只 Cell Jr.，共享 10% 战力，冷却 120 秒，超出 24 格自动召回。',
      '<b>完美</b>：每 120 分钟 +1%（上限 60%）；<b>适应</b>：每损失 10% 生命 +1%（分 10 档）。',
      '<b>专属打击技</b>：安卓吸收——束缚目标 3 段打击，每段实际扣血的一半同时回血回气。',
    ]
  },
  tp:[['超级形态',[26000,57000,88000,125000,300000]],['变异形态',[-1,-1,-1]]],
  forms:[
    { group:'生物进化', gid:'bioevolution', list:[
      f('semiperfect','半完全体',1,[1.75,1.75,1,1.5,1,1.75,1,1,1],[0,0,0],null,[0,25,40,0],[mdl('bioandroid_semi')]),
      f('perfect','完全体',2,[2.4,2.4,1,2.06,1,2.4,1,1,1],[0,0,0],'bioevolution.semiperfect',[25,25,40,50],[mdl('bioandroid_perfect')]),
      f('superperfect','超完全体',3,[3.05,3.05,1,2.44,1,3.05,1,1,1],[0.16,0,0],'bioevolution.perfect',[25,25,40,50],[N.lit,mdl('bioandroid_perfect')]),
      f('ultraperfect','究极完全体',4,[3.9,3.9,1,3,1,3.9,1,0.6,0.55],[0.28,0,0],'bioevolution.superperfect',[25,25,40,50],[N.lit,mdl('bioandroid_ultra')]),
      f('corruptedgiant','污染巨人',5,[13.2,13.2,1,8.79,1,13.2,1,0.66,0.55],[0.63,0,0],'bioevolution.ultraperfect',[46.8,25,47.2,64.8],[N.lit,mdl('bioandroid_ultra'),N.ol]),
    ]},
    { group:'变异形态', gid:'legendaryforms', list:[
      f('xeno','Xeno',1,[3.5,3.5,1,2.69,1,3.5,1,1,1],[0.06,0,0],null,[0,25,40,0],[N.ult,N.lit,mdl('bioandroid_ultra')]),
      f('xenofp','Xeno 全功率',2,[4.4,4.4,1,3.31,1,4.4,1,1,1],[0.16,0,0],'legendaryforms.xeno',[25,25,40,50],[N.ult,N.lit,mdl('bioandroid_xeno')]),
      f('xenomax','Xeno 极限',3,[5.1,5.1,1,3.69,1,5.1,1,1,1],[0.22,0,0],'legendaryforms.xenofp',[25,25,40,50],[N.ult,N.lit,mdl('bioandroid_xeno')]),
    ]},
  ]
},
/* ================= 魔人 ================= */
{
  id:'majin', name:'魔人', color:'#ff6dff', aura:'#FF6DFF', source:'原生',
  desc:'充满魔力且难以预料、拥有巨大破坏潜力的种族，具备独特的再生与变形能力。虽然看起来爱玩或孩子气，但释放真正力量时极为危险。',
  traits:['有性别','无尾巴','体型 ×0.9375','气焰 #FF6DFF'],
  stats:[3,2,2,1,2,3],
  growth:[0.7,0.6,0.6,1.0,0.8,0.5,1.6],
  racial:{
    name:'吸收 / 复活',
    lines:[
      '<b>吸收</b>：径向菜单「动作 → 种族技能」→ 按住 G。<b>范围 8 格</b>（其他种族动作仅 3 格）。',
      '<b>压制条件</b>：目标当前血量 ≤ 你的最大伤害且你的等级更高；不能吸收大师 NPC / 打拳机 / 友方阵营。',
      '<b>吸收效果</b>：回复 30% 生命，复制目标 4% 属性到 STR/SPD/PWR（怪物取最大生命 ×4%），上限 3 层。',
      '<b>复活</b>：按「块」逐个回复 25% 生命，冷却 3600 秒（60 分钟）。',
      '<b>吸收怪物</b>：可获得常驻被动——骷髅·抗箭 / 僵尸·再生 / 爬行者·抗爆 / 蜘蛛·跳跃 / 末影人·速度 / 烈焰人·抗火 / 女巫·夜视 / 守卫者·水下呼吸 / 铁傀儡·力量。',
      '<b>专属打击技</b>：睡眠恢复——静止引导，把技能气耗转化为治疗。',
      '<b>吸收形态</b>：独占 128 条「魔人吸收」形态组（见「通用形态」章），覆盖被吸收对象的形态并各有界王拳变体。',
    ]
  },
  tp:[['超级形态',[23000,47000,78000,114000]],['变异形态',[-1,-1,-1]]],
  forms:[
    { group:'纯粹形态', gid:'pureforms', list:[
      f('kid','小孩',1,[1.75,1.75,1,1.5,1,1.75,1,1,1],[0,0,0],null,[0,25,40,0],[mdl('majin_kid')]),
      f('evil','邪恶',2,[2.25,2.25,1,2,1,2.25,1,1,1],[0,0,0],'pureforms.kid',[25,25,40,50],[mdl('majin_evil')]),
      f('super','超级',3,[3,3,1,2.56,1,3,1,1,1],[0,0,0],'pureforms.evil',[25,25,40,50],[mdl('majin_super')]),
      f('ultra','究极',4,[4.6,4.6,1,3,1,4.6,1,1,1],[0.22,0,0],'pureforms.super',[25,25,40,50],[N.lit,mdl('majin_ultra')]),
    ]},
    { group:'变异形态', gid:'legendaryforms', list:[
      f('innocencedemon','无邪恶魔',1,[3.4,3.4,1,2.62,1,3.4,1,1,1],[0,0,0],null,[0,25,40,0],[N.ult,mdl('janemba_fat')]),
      f('giantinnocencedemon','巨大无邪恶魔',2,[4.3,4.3,1,3.25,1,4.3,1,1,0.25],[0.25,0,0],'legendaryforms.innocencedemon',[25,25,40,50],[N.ult,mdl('janemba_fat')]),
      f('superdemon','超级恶魔',3,[6.5,6.5,1,3.62,1,6.5,1,1,1],[0.15,0,0],'legendaryforms.giantinnocencedemon',[25,25,40,50],[N.ult,mdl('janemba_super')]),
    ]},
  ]
},
];

/* ================= 暗影龙（7 个子种族） ================= */
const SD_COMMON = {
  source:'SU 附加包', unlock:'LuckPerms 权限门控 su.raceunlock.*',
  traits:['无性别','无尾巴','体型 ×0.9375'],
  stats:[5,5,5,5,5,5],
  growth:[0.6,0.6,0.6,0.6,0.6,0.6,0.6],
  racial:{
    name:'恶意（Malice）',
    lines:[
      '按 V（激活种族技能）不会发动独立动作——<b>恶意能量通过技术栏的招式释放</b>（切换标准消耗 25）。',
      '⚠️ 该技能由附加包提供，更细的能量机制在服务端实现中未公开；以游戏内实测为准。',
    ]
  },
  tp:[['超级形态',[50000]]],
};
const sdRace = (id,name,color,aura,model,formId,formModel,formName,m,d)=>({
  id, name, color, aura, ...SD_COMMON,
  desc:'由龙珠负能量孕育的暗影龙。六维全 5，持有独特的「恶意」力量；形态路线极简，仅一档超级形态。',
  racial:SD_COMMON.racial,
  forms:[{ group:'超级形态', gid:'superforms', list:[
    f(formId,formName,1,m,d,null,[0,25,40,0],[mdl(formModel)]),
  ]}],
});
RACES.push(
  sdRace('shadow_dragon','暗影龙 · 七星','#7fffff','#7FFFFF','omega2','omega_shenron','omega',null,[1.75,1.75,1,1.44,1,1.75,1,1,1],[0.08,0,0]),
  sdRace('shadow_dragon_2star','暗影龙 · 二星','#9cad7f','#9CAD7F','2stars','omega_shenron','omega',null,[1.75,1.75,1,1.44,1,1.75,1,1,1],[0.08,0,0]),
  sdRace('shadow_dragon_3star','暗影龙 · 三星','#cff6ff','#CFF6FF','3or4stars','omega_shenron','omega',null,[1.75,1.75,1,1.44,1,1.75,1,1,1],[0.08,0,0]),
  sdRace('shadow_dragon_4star','暗影龙 · 四星','#ff7a33','#FF7A33','3or4stars','full_power','4starsfullpower',null,[1.5,1.5,1,1.44,1,1.75,1,1,1],[0.08,0,0]),
  sdRace('shadow_dragon_5star','暗影龙 · 五星','#4dff3d','#4DFF3D','5stars','full_power','5starsfullpower',null,[1.5,1.5,1,1.44,1,1.75,1,1,1],[0.08,0,0]),
  sdRace('shadow_dragon_6star','暗影龙 · 六星','#33b5e5','#33B5E5','6stars','true_form','6starstrueform',null,[1.5,1.5,1,1.44,1,1.75,1,1,1],[0.08,0,0]),
  sdRace('shadow_dragon_7star','暗影龙 · 七星龙珠','#c79a5e','#C79A5E','7stars','true_form','7starstrue',null,[1.5,1.5,1,1.44,1,1.75,1,1,1],[0.08,0,0]),
);
/* 七星本体的形态技能为任务/特殊解锁 */
RACES[7].tp = [['超级形态',[-1]]];
RACES[7].desc = '暗影龙之首——一星龙（Omega Shenron）之姿。六维全 5；形态为 omega_shenron，形态技能不可 TP 购买（-1，需任务/特殊途径解锁）。';

/* ================= 全种族通用形态 ================= */
const UNIVERSAL_GROUPS = [
  { name:'界王拳', gid:'kaioken', type:'叠加形态', who:'全种族', price:'1 000 / 1 500 / 2 500 / 4 000 / 7 500 TP', master:'北界王',
    note:'短时效爆发叠加技：以持续失血为代价换取全属性提升，各级之间共享 25% 熟练度。互斥「究极」。',
    list:[
      f('x2',null,1,[1.1,1.1,1,1.12,1,1.1,1,1.1,1.1],[0,0,0.03],null,[0,0,40,0],[N.ult]),
      f('x3',null,2,[1.2,1.2,1,1.25,1,1.2,1,1.2,1.2],[0,0,0.06],null,[0,0,40,50],[N.ult]),
      f('x4',null,3,[1.35,1.35,1,1.44,1,1.35,1,1.35,1.35],[0,0,0.1],null,[0,0,40,50],[N.ult]),
      f('x10',null,4,[1.5,1.5,1,1.62,1,1.5,1,1.5,1.5],[0,0,0.11],null,[0,0,40,50],[N.ult]),
      f('x20',null,5,[1.65,1.65,1,1.81,1,1.65,1,1.65,1.65],[0,0,0.15],null,[0,0,40,50],[N.ult]),
    ]},
  { name:'究极（潜能解放）', gid:'ultimate', type:'叠加形态', who:'全种族', price:'剧情解锁（-1）', master:'老界王神（好感 > 61 且潜力解放 10 级）',
    note:'叠加在最强基础形态之上：实际倍率 = 当前最强基础形态倍率 + 究极倍率 − 1，自动跟随底层形态强度。',
    list:[
      f('ultimate',null,1,[2,2,1,1.19,1,2,1,1,1],[0,0,0],null,[0,0,40,0],[N.noStack,N.ult]),
    ]},
  { name:'自在极意', gid:'ultrainstinct', type:'特殊形态', who:'仅赛亚人', price:'技能 75 000 / 150 000 TP；形态本体 500 000 TP（默认需小游戏解锁）', master:'维斯',
    note:'真实倍率由 DMZ Super 覆盖下发：兆 ×4（满熟练 ×9）、极 ×6（满熟练 ×14）；闪避率 兆 10%→70% / 极 40%→80%。激活时持续累积体力透支，≥100 强制解除并附加虚弱 II + 缓慢 II；持有自我极意怒气时不能开启「极」。熟练度 +0.02/秒，成功闪避 +0.5。',
    list:[
      f('sign','兆（Sign）',1,[1.5,1.5,1,1.5,1,1.5,1,1.5,1.5],[0,0,0],null,[0,0,0,0],[N.ult,N.lit,['warn','表中为占位倍率']]),
      f('mastered','极（Mastered）',1,[6,6,1,6,1,6,1,6,2],[0,0,0],null,[0,25,40,0],[N.noStack,N.ult,N.lit,['warn','表中为占位倍率']]),
    ]},
  { name:'自我极意', gid:'ultraego', type:'特殊形态', who:'仅赛亚人', price:'技能 75 000 / 150 000 TP；形态本体 500 000 TP', master:'比鲁斯',
    note:'真实倍率同由 DMZ Super 覆盖：兆 ×4（满熟练 ×9）、极 ×6（满熟练 ×14）；怒气满时额外 +2.5 / +3.5。激活每秒耗怒 0.002（熟练度最高减免 99%），怒气归零强制解除并冷却 20 秒。熟练度 +0.01/秒，受伤 +0.02。',
    list:[
      f('sign','兆（Sign）',1,[1.5,1.5,1,1.5,1,1.5,1,1.5,1.5],[0,0,0],null,[0,0,0,0],[N.ult,N.lit,['warn','表中为占位倍率']]),
      f('mastered','极（Mastered）',1,[6,6,1,6,1,6,1,6,2],[0,0,0],null,[0,25,40,0],[N.noStack,N.ult,N.lit,['warn','表中为占位倍率']]),
    ]},
  { name:'冰冻恶魔神形态', gid:'frostgodforms', type:'形态组', who:'仅冰冻恶魔', price:'100 000 / 500 000 TP', master:'弗利萨',
    note:'把神之力叠加在进化之路上的顶级形态。互斥第二/第三形态。',
    list:[
      f('golden','黄金',1,[8.85,8.85,1,6.07,1,8.85,1,1.3,1.22],[0.45,0,0],null,[0,0,40.8,57.2],[['mut','互斥 第二/第三形态']]),
      f('black','黑色',2,[14.58,14.58,1,9.65,1,14.58,1,1.45,1.34],[0.69,0,0],'frostgodforms.golden',[49.2,0,48.8,66.7],[['mut','互斥 第二/第三形态'],N.lit]),
    ]},
  { name:'冰冻恶魔细胞样本', gid:'friezabiodata', type:'形态组', who:'仅生化人造人', price:'350 000 / 1 500 000 TP', master:'沙鲁',
    note:'解析冰冻恶魔细胞获得的黄金/黑色进化。',
    list:[
      f('goldenbioandroid','黄金',1,[5.94,5.94,1,4.26,1,5.94,1,1.18,1.13],[0.32,0,0],null,[0,0,34.4,49.6],[]),
      f('blackbioandroid','黑色',2,[9.78,9.78,1,6.65,1,9.78,1,1.33,1.25],[0.48,0,0],'friezabiodata.goldenbioandroid',[39.6,0,42.4,59.1],[N.lit]),
    ]},
  { name:'那美克星人细胞样本', gid:'piccolobiodata', type:'形态组', who:'仅生化人造人', price:'400 000 / 1 750 000 TP', master:'沙鲁',
    note:'解析那美克星细胞获得的橙色进化。',
    list:[
      f('orangebioandroid','橙色',1,[7.25,7.25,1,5.07,1,7.25,1,1.24,1.17],[0.38,0,0],null,[0,0,37.6,53.4],[]),
      f('orangegiantbioandroid','橙色巨人',2,[10.81,10.81,1,7.3,1,10.81,1,0.74,0.62],[0.53,0,0],'piccolobiodata.orangebioandroid',[42,0,44,61],[]),
    ]},
  { name:'魔人吸收', gid:'absorption', type:'吸收形态', who:'仅魔人', price:'—', master:'—',
    note:'共 128 条形态：吸收不同对象后获得对应形态，每条均有「_kaioken」界王拳变体。基准条目 majin_base 全倍率 1.0、无消耗，熟练度上限 100（命中 +0.05 / 受击 +0.02 / 每 5 秒 +0.15）。进化门槛：熟练度 50，可进化 evolutionforms / bioevolution / pureforms / superforms(supernamekian) / androidforms 等组。',
    absorption:true,
    keys:'majin_base|majin_base_kaioken|majin_ultra|majin_ultra_kaioken|saiyan_ssjfullpower|saiyan_ssjfullpower_kaioken|frostdemon_fifth|frostdemon_fifth_kaioken|namekian_base|namekian_base_kaioken|saga_frieza_final|saga_frieza_final_kaioken|saga_broly_lssj|saga_broly_lssj_kaioken|frostdemon_second|frostdemon_second_kaioken|bioandroid_base|bioandroid_base_kaioken|saiyan_base|saiyan_base_kaioken|saga_janemba|saga_janemba_kaioken|frostdemon_base|frostdemon_base_kaioken|bioandroid_semiperfect|bioandroid_semiperfect_kaioken|human_overdrive|human_overdrive_kaioken|saga_buu_super|saga_buu_super_kaioken|saiyan_supersaiyanmastered|saiyan_supersaiyanmastered_kaioken|saiyan_ssjhybrid|saiyan_ssjhybrid_kaioken|namekian_fullpower|namekian_fullpower_kaioken|saiyan_goldenoozaru|saiyan_goldenoozaru_kaioken|frostdemon_fullpower|frostdemon_fullpower_kaioken|human_base|human_base_kaioken|human_fullpower|human_fullpower_kaioken|human_buffed|human_buffed_kaioken|saga_gotenks_ssj3|saga_gotenks_ssj3_kaioken|saga_cell_perfect|saga_cell_perfect_kaioken|frostdemon_third|frostdemon_third_kaioken|bioandroid_ultraperfect|bioandroid_ultraperfect_kaioken|frostdemon_final|frostdemon_final_kaioken|saiyan_supersaiyan2|saiyan_supersaiyan2_kaioken|human_superandroid|human_superandroid_kaioken|bioandroid_superperfect|bioandroid_superperfect_kaioken|saga_vegeta_majin|saga_vegeta_majin_kaioken|saiyan_supersaiyan3|saiyan_supersaiyan3_kaioken|saiyan_supersaiyan4|saiyan_supersaiyan4_kaioken|majin_evil|majin_evil_kaioken|namekian_giant|namekian_giant_kaioken|saga_buu_fat|saga_buu_fat_kaioken|saga_gohan_ultimate|saga_gohan_ultimate_kaioken|human_solaris|human_solaris_kaioken|majin_superdemon|majin_superdemon_kaioken|namekian_supernamekian|namekian_supernamekian_kaioken|human_androidbase|human_androidbase_kaioken|human_shiyoken|human_shiyoken_kaioken|majin_kid|majin_kid_kaioken|saga_frieza_golden|saga_frieza_golden_kaioken|namekian_evilnamek|namekian_evilnamek_kaioken|bioandroid_perfect|bioandroid_perfect_kaioken|majin_super|majin_super_kaioken|saga_buu_kid|saga_buu_kid_kaioken|frostdemon_metal|frostdemon_metal_kaioken|saiyan_supersaiyan|saiyan_supersaiyan_kaioken|frostdemon_mecha|frostdemon_mecha_kaioken|frostdemon_metalcore|frostdemon_metalcore_kaioken|saga_vegetto|saga_vegetto_kaioken|saiyan_ikari|saiyan_ikari_kaioken|namekian_buffednamek|namekian_buffednamek_kaioken|saiyan_supersaiyangrade3|saiyan_supersaiyangrade3_kaioken|saiyan_oozaru|saiyan_oozaru_kaioken|saiyan_supersaiyangrade2|saiyan_supersaiyangrade2_kaioken|mob_minecraft_blaze|mob_minecraft_skeleton|mob_minecraft_guardian|mob_minecraft_stray|mob_minecraft_enderman|mob_minecraft_witch|mob_minecraft_spider|mob_minecraft_zombie|mob_minecraft_creeper|mob_minecraft_iron_golem'.split('|'),
  },
];

/* ================= 气功 ================= */
const KI_TYPES = {
  SMALL_BALL:{cn:'小弹',color:'#3ee2ff',mult:1.0}, MEDIUM_BALL:{cn:'中球',color:'#4ade80',mult:1.4},
  GIANT_BALL:{cn:'巨型球',color:'#ff7a18',mult:2.2}, WAVE:{cn:'波',color:'#ffc233',mult:1.6},
  BEAM:{cn:'光束',color:'#a06bff',mult:1.4}, LASER:{cn:'激光',color:'#ff5d5d',mult:0.8},
  DISK:{cn:'气圆斩',color:'#5eead4',mult:1.2}, BARRAGE:{cn:'弹幕',color:'#60a5fa',mult:1.4},
  EXPLOSION:{cn:'爆炸',color:'#fb7185',mult:2.6}, SHIELD:{cn:'护盾',color:'#34d399',mult:1.6},
  AREA:{cn:'领域',color:'#c084fc',mult:1.8},
};
const KI_CAST = [
  ['小弹 / 激光','0（瞬发）','可自由移动'],
  ['中球 / 气圆斩','30 tick（1.5 秒）','可自由移动'],
  ['弹幕','40 tick','禁止移动'],
  ['护盾 / 领域','40 tick','禁止行动'],
  ['波 / 光束','50 tick（2.5 秒）','禁止移动'],
  ['巨型球 / 爆炸','60 tick（3 秒）','禁止移动'],
];
const k = (id,cn,en,type,dmg,size,speed,cd,tp,masters,extra)=>({id,cn,en,type,dmg,size,speed,cd,tp,masters,...(extra||{})});
const KI_BASE = [
  k('ki_barrage','气弹连射','Ki Barrage','BARRAGE',1.00,0.4,1.5,'10s',1000,'天津饭 / 比鲁斯 / 维斯',{note:'一次 40 发齐射；每发命中经验 ×0.34 折算。'}),
  k('masenko','魔闪光','Masenko','WAVE',1.50,1.0,1.2,'10s',1500,'比克 / 悟饭 / 沙鲁'),
  k('kamehameha','龟派气功','Kamehameha','WAVE',2.00,1.0,1.2,'10s',2000,'天津饭 / 维斯'),
  k('galick_gun','伽力克炮','Galick Gun','WAVE',2.00,1.0,1.2,'10s',2000,'贝吉塔 / 沙鲁 / 特兰克斯'),
  k('taiyoken','太阳拳','Solar Flare','SMALL_BALL',0,1.0,0.1,'45s',2000,'天津饭',{note:'不造成伤害：20 格内直视者致盲 12 秒（斜视 9 秒，随距离最多 −3 秒，友军减半）；对怪物清空仇恨，对玩家附加反色。'}),
  k('death_beam','死亡光线','Death Beam','LASER',0.75,0.5,2.0,'10s',2500,'弗利萨 / 沙鲁'),
  k('fake_moon','伪·月亮','Fake Moon','MEDIUM_BALL',0,2.0,0.8,'45s',3000,'贝吉塔',{note:'生成月亮实体：上升 30 格后停驻发光 20 秒。赛亚人注视它（200 格内）即可触发巨猿变身，等价于满月之夜。'}),
  k('kienzan','气圆斩','Kienzan','DISK',1.50,1.0,1.5,'10s',3000,'克林 / 比克 / 沙鲁'),
  k('makkanko','魔贯光杀炮','Special Beam Cannon','BEAM',0.75,0.8,2.0,'10s',3500,'比克 / 悟饭'),
  k('burning_attack','烈焰攻击','Burning Attack','MEDIUM_BALL',1.50,1.5,1.5,'10s',3500,'特兰克斯'),
  k('big_bang','大爆炸攻击','Big Bang Attack','MEDIUM_BALL',2.00,2.0,1.5,'10s',4000,'贝吉塔 / 比鲁斯'),
  k('sokidan','元气球','Spirit Ball','MEDIUM_BALL',1.25,1.5,1.0,'12s',4000,'雅木茶',{note:'颜色固定金黄，可受锁定制导。'}),
  k('kienzan_doble','双重气圆斩','Double Kienzan','DISK',1.75,1.0,1.5,'10s',4000,'克林 / 弗利萨',{note:'一次发射左右两枚：右盘速度 ×1.5，左盘原速。'}),
  k('emperor_death_beam','帝王死亡光线',"Emperor's Death Beam",'LASER',1.25,0.6,2.0,'10s',5000,'弗利萨'),
  k('final_flash','终极闪光','Final Flash','WAVE',2.50,1.5,1.2,'10s',5000,'贝吉塔'),
  k('spiritbomb','元气弹','Spirit Bomb','GIANT_BALL',3.00,5.0,0.5,'10s',10000,'悟空 / 北界王',{note:'尺寸固定 7.0，蓄力 100 tick，有专属充能/发射音效。'}),
  k('supernova','超新星','Supernova','GIANT_BALL',3.00,5.0,0.5,'10s',12000,'弗利萨'),
  k('supernova_cooler','超新星（古拉）','Supernova (Cooler)','GIANT_BALL',3.50,5.5,0.5,'10s',15000,null,{hidden:true}),
  k('final_explosion','终极爆炸','Final Explosion','EXPLOSION',2.25,15.0,null,'10s',20000,'贝吉塔 / 比鲁斯',{note:'用生命换伤害与半径：把血量压到上限下限，按消耗比例提升伤害与爆炸范围。'}),
  k('soul_punisher','灵魂惩罚者','Soul Punisher','MEDIUM_BALL',3.50,5.0,0.5,'45s',25000,'老界王神 / 维斯',{note:'对好感度 ≥ 41 的玩家（或中立关系）伤害 ×0.25。'}),
];
const KI_EXTRA = [
  k('dodonpa','哆哆波','Dodonpa','LASER',1.10,null,null,'8s',1000,'天津饭'),
  k('kamehameha_majin','魔人龟派气功',null,'WAVE',2.10,null,null,'12s',2000,'布欧',{rest:'仅魔人'}),
  k('power_blitz','能量闪击',null,'WAVE',2.10,null,null,'11s',2000,'沙鲁',{rest:'地球人 / 生化人造人'}),
  k('light_grenade','光榴弹',null,'MEDIUM_BALL',2.00,null,null,'12s',2500,'比克'),
  k('kamehameha_super','超级龟派气功',null,'WAVE',2.45,null,null,'12s',2500,'悟空'),
  k('kamehameha_black','黑色龟派气功',null,'WAVE',2.27,null,null,'12s',2500,null,{hidden:true}),
  k('super_galick_gun','超级加力炮',null,'WAVE',2.45,null,null,'14s',2500,'贝吉塔'),
  k('super_masenko','超级魔闪光',null,'WAVE',2.27,null,null,'12s',2500,'悟饭'),
  k('full_power_special_beam_cannon','全功率魔贯光杀炮',null,'BEAM',1.50,null,null,'15s',2500,'比克'),
  k('photon_flash','光子闪光',null,'WAVE',2.27,null,null,'10s',2500,'沙鲁',{rest:'地球人 / 生化人造人'}),
  k('kamehameha_angry','愤怒龟派气功',null,'WAVE',2.54,null,null,'12s',2500,'悟空'),
  k('buster_cannon','巴斯特加农炮',null,'WAVE',2.45,null,null,'14s',2500,'特兰克斯'),
  k('explosive_demon_wave','爆魔烈气弹',null,'WAVE',2.27,null,null,'12s',2500,'比克'),
  k('death_cannon','死亡炮',null,'WAVE',2.62,null,null,'15s',2500,'弗利萨'),
  k('kamehameha_true','真·龟派气功',null,'WAVE',2.80,null,null,'18s',3000,'悟空'),
  k('kamehameha_black_super','超级黑色龟派气功',null,'WAVE',2.98,null,null,'16s',3000,null,{hidden:true}),
  k('final_burst_cannon','最终爆发加农炮',null,'WAVE',3.15,null,null,'18s',3000,'贝吉塔'),
  k('big_bang_crash','大爆炸冲撞',null,'MEDIUM_BALL',2.40,null,null,'12s',3000,'沙鲁'),
  k('ultimate_masenko','终极魔闪光',null,'WAVE',2.80,null,null,'15s',3000,'悟饭'),
  k('eraser_cannon','消抹加农炮',null,'MEDIUM_BALL',2.60,null,null,'12s',3000,null,{hidden:true}),
  k('final_spirit_cannon','最终气功炮',null,'MEDIUM_BALL',2.40,null,null,'12s',3000,null,{hidden:true}),
  k('final_shine_attack','最终闪耀攻击',null,'WAVE',2.98,null,null,'17s',3000,'贝吉塔'),
  k('finish_buster','终结爆裂',null,'MEDIUM_BALL',2.60,null,null,'12s',3000,'特兰克斯'),
  k('big_bang_kamehameha','大爆炸龟派气功',null,'WAVE',3.15,null,null,'18s',3000,'悟空'),
  k('kamehameha_10x','10 倍龟派气功',null,'WAVE',3.50,null,null,'15s',3500,'悟空'),
  k('omega_blaster','欧米伽爆破',null,'MEDIUM_BALL',3.00,null,null,'20s',3500,null,{hidden:true}),
  k('perfect_barrier','完美屏障',null,'SHIELD',4.00,null,null,'30s',6000,'沙鲁',{note:'伤害字段代表护盾强度；治疗型护盾可包裹友军。'}),
  k('android_barrier','人造人屏障',null,'SHIELD',4.60,null,null,'30s',7000,'沙鲁',{rest:'地球人 / 生化人造人',note:'伤害字段代表护盾强度；治疗型护盾可包裹友军。'}),
  k('death_ball','死亡球',null,'GIANT_BALL',3.33,null,null,'20s',8500,'弗利萨'),
  k('vanishing_ball','消失能量球',null,'GIANT_BALL',3.72,null,null,'25s',9500,'布欧',{rest:'仅魔人'}),
  k('supercharged_death_ball','超载死亡球',null,'GIANT_BALL',3.92,null,null,'30s',10000,'弗利萨'),
  k('revenge_death_ball','复仇死亡球',null,'GIANT_BALL',3.92,null,null,'26s',10000,null,{hidden:true}),
  k('negative_karma_ball','恶业能量球',null,'GIANT_BALL',4.12,null,null,'26s',10500,null,{hidden:true}),
  k('golden_death_ball','黄金死亡球',null,'GIANT_BALL',4.31,null,null,'25s',11000,'弗利萨'),
  k('beerus_ball','比鲁斯球',null,'GIANT_BALL',4.51,null,null,'28s',11500,'比鲁斯'),
  k('spiritbomb_super','超级元气弹',null,'GIANT_BALL',4.90,null,null,'60s',12500,'北界王'),
];
const KI_BOSS = '剧情 Boss 从 ID 22 起额外持有 11 个玩家不可学习的气功：哆哆波、10倍龟派气功、复仇死亡球、超级加力炮、大爆炸冲撞、黄金死亡球、爆魔烈气弹、黑色龟派气功、超级黑色龟派气功、消抹加农炮、欧米伽爆破。';

/* ================= 近战技 ================= */
const STRIKES = [
  {id:'meteor',cn:'流星',dmg:1.25,dur:'40 tick',cd:'160 tick',tp:3000,masters:'弗利萨 / 沙鲁 / 特兰克斯 / 维斯'},
  {id:'wolf_fang',cn:'狼牙风风拳',dmg:1.25,dur:'35 tick',cd:'140 tick',tp:3500,masters:'雅木茶'},
  {id:'kaioken_attack',cn:'界王拳攻击',dmg:1.75,dur:'45 tick',cd:'240 tick',tp:5000,masters:'北界王'},
  {id:'dragon_fist',cn:'龙拳',dmg:2.50,dur:'50 tick',cd:'320 tick',tp:6000,masters:'悟空'},
  {id:'deadly_dance',cn:'致命之舞',dmg:1.25,dur:'40 tick',cd:'160 tick',tp:8000,masters:'弗利萨 / 沙鲁 / 克林 / 比鲁斯'},
  {id:'super_god_fist',cn:'超级神拳',dmg:2.00,dur:'25 tick',cd:'240 tick',tp:10000,masters:'悟空 / 比鲁斯 / 维斯'},
  {id:'deadly_dance_vegetto',cn:'致命之舞（贝吉特）',dmg:1.50,dur:'40 tick',cd:'200 tick',tp:12000,masters:'贝吉塔 / 维斯'},
  {id:'oozaru_fist',cn:'巨猿之拳',dmg:2.25,dur:'35 tick',cd:'280 tick',tp:15000,masters:'悟空'},
];

/* ================= 技能 ================= */
const SKILLS = [
  {id:'sprint',cn:'冲刺',lv:10,prices:[300,600,900,1200,1500,1800,2100,2400,2700,3000],eff:'每级移动速度 <b>+10%</b>（10 级合计 ×2）。需力量释放 ≥ 5 且技能开启。'},
  {id:'jump',cn:'跳跃',lv:10,prices:[300,600,900,1200,1500,1800,2100,2400,2700,3000],eff:'目标跳跃高度 1.0 + 等级×0.1 格；空中可续跳（次数 = 等级）；10 级时 12.25 格内免摔伤。'},
  {id:'kisense',cn:'气感知',lv:10,prices:[300,600,900,1200,1500,1800,2100,2400,2700,3000],eff:'战斗感知半径 10+3×级（10 级 40 格）；搜索感知 30+20×级（230 格）；锁定范围 15+5×级（65 格）。按 F4 三态循环。'},
  {id:'meditation',cn:'冥想',lv:10,prices:[300,600,900,1200,1500,1800,2100,2400,2700,3000],eff:'每级 <b>+5%</b>：同时提升气回复、体力回复与架势回复（不影响生命回复）。'},
  {id:'fly',cn:'飞行',lv:10,prices:[1500,600,900,1200,1500,1800,2100,2400,2700,3000],eff:'按 F 开关（需气控制）。速度 ×(1+0.2×级)，10 级 ×3；气耗随等级下降（启动消耗 14.8%→1%）。快速飞行时暂停气/体力回复。'},
  {id:'kicontrol',cn:'气控制',lv:1,prices:[3000],eff:'纯门禁技能（新手免费送 1 级）：气弹、蓄力、打击、太阳拳、飞行、影分身、气武器等 10 项功能的前置。'},
  {id:'kimanipulation',cn:'气操控',lv:10,prices:[600,1200,1800,2200,2600,2800,3000,3200,3600,4000],eff:'普通气弹伤害 ×(0.5+0.05×级)；解锁气武器（镰刀/爪枪/刃）追加伤害；≥5 级可召唤影分身。需主手为空。'},
  {id:'kiprotection',cn:'气护盾',lv:10,prices:[600,1200,1800,2200,2600,2800,3000,3200,3600,4000],eff:'每级 <b>+2.5% 伤害减免</b>（10 级 25%），消耗减免后伤害 ×0.15 的气；气不足时按比例削弱。'},
  {id:'defense_penetration',cn:'防御穿透',lv:10,prices:[600,1200,1800,2200,2600,2800,3000,3200,3600,4000],eff:'每级 +2.5%（10 级 25%）；可叠加主/副手附魔各 +2.5%/级，总上限 50%。'},
  {id:'healing_reduction',cn:'治疗削减',lv:10,prices:[600,1200,1800,2200,2600,2800,3000,3200,3600,4000],eff:'每级 +2%（10 级 20%）：你的伤害使目标 HP 回复削减 6 秒；附魔每级再 +5%，总上限 40%。'},
  {id:'ki_infusion',cn:'气灌注',lv:10,prices:[600,1200,1800,2200,2600,2800,3000,3200,3600,4000],eff:'近战附加伤害 = 最大气的 2.5%×级（10 级 25%）；每次命中耗气 2.5%→7.5%，气不足则当次不生效。'},
  {id:'kiboost',cn:'气强化',lv:4,prices:[2000,4000,6000,8000],eff:'每级 <b>+25% 主动气回复</b>（4 级 ×2）；仅作用于「按住 C 蓄气」分支。'},
  {id:'potentialunlock',cn:'潜力解放',lv:13,prices:[600,1600,2400,3200,4000,4800,5600,6400,7200,8000,-1,8800,9600],eff:'力量释放上限 50+5×级（10 级 = 100）。<b>实际只能买到 10 级</b>；那美克星大长老（好感≥50 且 10 级）可再 +1 级。'},
  {id:'instant_transmission',cn:'瞬间移动',lv:10,prices:[600,1200,1800,2200,2600,2800,3000,3200,3600,4000],eff:'H 短按瞬移到锁定目标（25+10×级，10 级 125 格）；H 长按（≥5 级）打开传送点界面，可传送 200 格×级 内的玩家。'},
];
const SKILLS_SPECIAL = [
  {id:'kaioken',cn:'界王拳',lv:5,prices:[1000,1500,2500,4000,7500],rest:'全种族',eff:'叠加形态（x2 → x20），各级共享 25% 熟练度。'},
  {id:'ultimate',cn:'究极',lv:1,prices:[-1],rest:'全种族',eff:'剧情解锁：老界王神好感 > 61 且潜力解放 10 级；倍率动态跟随最强基础形态。'},
  {id:'fusion',cn:'融合',lv:5,prices:[25000,5000,10000,15000,20000],rest:'全种族',eff:'解锁合体（融合舞 / 波塔拉耳环）。'},
  {id:'ultrainstinct',cn:'自在极意',lv:2,prices:[75000,150000],rest:'仅赛亚人',eff:'售于维斯；闪避与透支机制见「通用形态」。'},
  {id:'ultraego',cn:'自我极意',lv:2,prices:[75000,150000],rest:'仅赛亚人',eff:'售于比鲁斯；怒气机制见「通用形态」。'},
  {id:'frostgodforms',cn:'神之冰冻形态',lv:2,prices:[100000,500000],rest:'仅冰冻恶魔',eff:'解锁黄金 / 黑色形态购买资格，售于弗利萨。'},
  {id:'friezabiodata',cn:'冰冻恶魔细胞样本',lv:2,prices:[350000,1500000],rest:'仅生化人造人',eff:'解锁黄金 / 黑色进化购买资格，售于沙鲁。'},
  {id:'piccolobiodata',cn:'那美克星人细胞样本',lv:2,prices:[400000,1750000],rest:'仅生化人造人',eff:'解锁橙色 / 橙色巨人进化购买资格，售于沙鲁。'},
];
const TP_SOURCES = [
  ['+2','每次命中'],['+1','被动周期'],['+1','每移动 20 格'],['+1','每挖 1 格'],['+1','每合成 1 件'],
  ['×1.75','精神时光屋内'],['×1.25','难度模式（仅剧情来源）'],['+25%','冰冻恶魔天赋'],['×1.25','突变体持有'],
  ['×2.0','重力训练峰值'],['500 万','波仑伽许愿「数不尽的力量」'],['+5','属性胶囊（每种）'],
];
const MASTERS = [
  ['goku','悟空','飞行、瞬间移动、融合、元气弹、龙拳、超级神拳、巨猿之拳、真·龟派气功、超级龟派气功、愤怒龟派气功、10 倍龟派气功、大爆炸龟派气功'],
  ['vegeta','贝吉塔','防御穿透、潜力解放、伽力克炮、大爆炸攻击、终极闪光、终极爆炸、伪·月亮、致命之舞（贝吉特）、最终爆发加农炮、超级加力炮、最终闪耀攻击'],
  ['piccolo','比克','潜力解放、气控制、魔闪光、魔贯光杀炮、气圆斩、全功率魔贯光杀炮、光榴弹、爆魔烈气弹'],
  ['gohan','悟饭','气强化、气护盾、气感知、魔闪光、魔贯光杀炮、超级魔闪光、终极魔闪光、野兽形态'],
  ['frieza','弗利萨','飞行、跳跃、冲刺、气感知、冥想、潜力解放、瞬间移动、死亡光线、帝王死亡光线、超新星、双重气圆斩、致命之舞、流星、死亡球、超载死亡球、黄金死亡球、死亡炮、神之冰冻形态'],
  ['cell','沙鲁','气控制、气操控、气灌注、气护盾、防御穿透、治疗削减、气强化、气圆斩、伽力克炮、魔闪光、死亡光线、致命之舞、流星、大爆炸冲撞、光子闪光、能量闪击、完美屏障、人造人屏障、那美克星/冰冻恶魔细胞样本'],
  ['krillin','克林','冲刺、气感知、气圆斩、双重气圆斩、致命之舞'],
  ['tien','天津饭','哆哆波、太阳拳、龟派气功、气弹连射、基础被动技'],
  ['yamcha','雅木茶','气控制、气灌注、狼牙风风拳、元气球'],
  ['trunks','特兰克斯','气强化、气护盾、烈焰攻击、伽力克炮、流星、巴斯特加农炮、终结爆裂'],
  ['roshi','龟仙人','跳跃、冥想、气控制'],
  ['kingkai','北界王','界王拳、潜力解放、气操控、界王拳攻击、元气弹、超级元气弹'],
  ['oldkai','老界王神','气灌注、治疗削减、灵魂惩罚者'],
  ['beerus','比鲁斯','自我极意、比鲁斯球 + 大量基础技能（飞行/跳跃/冲刺/冥想/气感知/气控制/气操控/气强化/气护盾/潜力解放/神之形态/究极/穿透/治疗削减/超级神拳/大爆炸/死亡光线/超新星/终极爆炸/气弹连射/致命之舞）'],
  ['whis','维斯','自在极意、龟派气功、灵魂惩罚者、瞬间移动、流星、致命之舞（贝吉特）等大量技能'],
  ['buu','布欧','魔人龟派气功、消失能量球 + 基础被动技'],
  ['tournament_announcer','武道会主持人','不出售技能（纯任务 NPC）'],
];

/* ================= 职业 ================= */
const CLASSES = [
  {id:'warrior',cn:'战士',base:[6,3,2,1,1,0],growth:[1.0,0.7,0.6,0.4,0.6,0.3,1.0],pass:'<b>战意叠层</b>：近战命中且未被格挡 +1 层（最多 10 层，持续 5 秒）。每层耐力回复 +5%、防御穿透 +1%；停止攻击逐渐消退。'},
  {id:'berserker',cn:'狂战士',base:[7,3,2,2,0,0],growth:[1.0,0.8,0.9,0.7,0.7,0.1,0.6],pass:'<b>浴血</b>：每损失 1% 生命，暴击率 +0.5%、暴击伤害 +1%（半血时 +25% / +50%）。'},
  {id:'martialartist',cn:'武术家',base:[4,1,2,2,4,2],growth:[1.0,0.8,0.7,0.7,0.2,1.0,1.2],pass:'<b>收割</b>：对生命低于 50% 的敌人，近战/打击/气攻击伤害 +25%。'},
  {id:'paladin',cn:'圣骑士',base:[5,1,3,1,1,1],growth:[1.0,0.5,0.9,0.9,0.8,0.7,1.6],pass:'<b>守护</b>：队友承受伤害的 15% 转移给你（50 格内）；你回复相当于队友造成伤害 15% 的生命。'},
  {id:'tank',cn:'坦克',base:[3,0,3,3,2,1],growth:[0.7,0.4,0.9,1.0,1.0,0.5,1.6],tpGain:'+25%',pass:'<b>韧性转化</b>：体力回复的 50% 转为额外生命回复；受治疗 +25%；生命低于 30% 时两项翻倍。'},
  {id:'speedster',cn:'疾速者',base:[1,6,0,0,3,2],growth:[0.7,1.0,0.8,0.4,0.6,0.6,1.6],pass:'<b>动量</b>：近战命中叠层（最多 10 层，10 秒）：每层 SPD +1%，并获得 SPD 5% 的额外伤害。'},
  {id:'duelist',cn:'决斗者',base:[2,3,2,2,2,2],growth:[0.7,0.9,1.0,0.6,0.6,0.7,2.0],pass:'<b>招架大师</b>：招架近战 +10% 韧性伤害；招架气弹使其以 +20% 速度转向；攻击破防敌人伤害 +50%、击退 +100%。'},
  {id:'kiassassin',cn:'气刺客',base:[0,4,0,0,6,4],growth:[0.0,0.8,0.5,0.3,0.5,1.0,2.0],pass:'<b>速射</b>：无附加效果的气技施法 −50%、弹速 +50%；有附加效果的气技施法 −20%、弹速 +20%。'},
  {id:'cleric',cn:'牧师',base:[0,2,1,0,4,5],growth:[0.2,0.7,0.6,0.6,1.0,0.9,2.0],tpCost:'−10%',tpGain:'+25%',pass:'<b>祝福</b>：治疗型气技冷却与消耗 −20%；带附加效果时改为冷却 −15%、持续时间 +25%。'},
  {id:'spiritualist',cn:'灵能师',base:[0,2,1,0,6,3],growth:[0.2,0.6,0.4,0.5,0.6,1.0,2.0],pass:'<b>灵能</b>：伤害型气技冷却与消耗 −20%；带附加效果时改为冷却 −15%、持续时间 +25%。'},
  {id:'potentialist',cn:'潜能系',base:[3,3,3,3,3,3],growth:[0.6,0.6,0.6,0.6,0.6,0.6,1.2],pass:'<b>潜能突破</b>：生命 ≤ 50% 时临时突破潜力解放上限（释放 ×1.5，持续 30 秒，冷却 90 秒）。'},
];

/* ================= 进阶系统 ================= */
const ADVANCED = [
  {ico:'☄',cn:'合体',en:'FUSION',lines:[
    '两种方式：<b>融合舞</b>（允许跨种族）与 <b>波塔拉耳环</b>。',
    '属性分享比例：融合舞 0.5~1.0 / 波塔拉 0.75~1.25，七项属性全部参与。',
    '持续 15 分钟，冷却 30 分钟；HP / 气 / 体力按两人融合前百分比的平均值开始并共享。',
    '双方职业被动同时生效；变身会按形态强度差缩短剩余融合时长。']},
  {ico:'✸',cn:'突变体',en:'MUTANT',lines:[
    '每 30 分钟抽取 1 人（概率 0.2），全服同时最多 1 人持有。',
    'TP 获取 ×1.25、形态熟练度获取 ×1.5。',
    '变异形态组倍率增量：有对应技能 ×1.33，无技能 ×0.33。',
    '<b>死亡会失去突变体</b>。']},
  {ico:'🔥',cn:'气超载',en:'KI OVERCHARGE',lines:[
    'DMZ 等级 ≥ 300 解锁：蓄力不松手可突破 175% 上限，最高 1000%。',
    '超过 200% 后每多 +100% 蓄力，额外燃烧 20% 最大气条；气尽自动发射。',
    '超过 800% 发射会浪费全部剩余气；爆炸类超过 500% 开始燃烧生命。',
    '视觉：175% 出气焰、200% 破地、体积最大 14 倍、气圆斩可切地形。']},
  {ico:'🥋',cn:'种族专属打击技',en:'PROTECTED ABILITIES',lines:[
    '<b>安卓吸收</b>（生化人造人 / 安卓升级地球人）：束缚目标 3 段打击，每段实际扣血的一半同时回血回气。',
    '<b>睡眠恢复</b>（魔人）：静止引导，把技能气耗转化为治疗。',
    '<b>那美克回复</b>（那美克星人）：恢复最大生命 20%，消耗等量体力，冷却 60 秒。',
    '以上为受保护能力：不可删除，种族变更时自动移除/返还。']},
  {ico:'♻',cn:'转生',en:'PRESTIGE',disabled:true,lines:[
    '本服配置 Prestige.enabled = false，转生系统不可用。',
    '若开启：初始等级上限 50 000、最多 10 转，每转成长 +50%、TP 加成 +100%。']},
  {ico:'⌁',cn:'关键机制备忘',en:'RULES OF THUMB',lines:[
    '形态倍率为<b>加法叠加</b>：1 + (a−1) + (b−1) + …，不是连乘。',
    '形态消耗 = JSON 基准 × 80 × 战力开方缩放；数值仅供横向比较。',
    '气 / 体力 / 生命任一耗尽 → 叠加形态与基础形态同时强制解除。',
    '熟练度只在保持变身时每 5 秒被动增长；满熟练再乘 maxStatsMultiplier（多为 1.5）。',
    '装备位限制：Advanced 最多 2 个、Ultimate 最多 2 个（气技与打击技合计）。']},
];
