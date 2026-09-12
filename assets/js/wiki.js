/* ============================================================
   祈愿龙珠 · 全种族 WIKI — 分页渲染引擎
   按页面上存在的容器自动渲染对应内容
   ============================================================ */
'use strict';
const fmt=v=>v===null||v===undefined?'<span class="na">—</span>':String(v);

/* ---------------- 形态中文名索引（前置形态翻译用） ---------------- */
const FORM_NAME_INDEX={};
RACES.forEach(r=>r.forms.forEach(g=>g.list.forEach(x=>{FORM_NAME_INDEX[g.gid+'.'+x.id]=x.name||x.id;})));
UNIVERSAL_GROUPS.forEach(g=>{if(!g.absorption)g.list.forEach(x=>{FORM_NAME_INDEX[g.gid+'.'+x.id]=x.name||x.id;});});
const reqName=req=>FORM_NAME_INDEX[req]||null;

/* ---------------- 备注标签玩家化 ---------------- */
function ntagHTML([k,t]){
  if(k==='mdl')return `<span class="ntag mdl">专属外观</span>`;
  if(k==='shr')return `<span class="ntag shr">共享熟练度</span>`;
  if(k==='mut'){const m=t.match(/^互斥\s*(.+)$/);return `<span class="ntag mut">${m?`与「${m[1]}」互斥`:t}</span>`;}
  return `<span class="ntag ${k}">${esc(t)}</span>`;
}

/* ---------------- 雷达图 ---------------- */
function radar(stats,color,size=190){
  const cx=size/2,cy=size/2+4,R=size/2-30,max=6,n=6;
  const pt=(i,v)=>{const a=-Math.PI/2+i*2*Math.PI/n;const r=R*Math.min(v,max)/max;
    return [cx+r*Math.cos(a),cy+r*Math.sin(a)];};
  let rings='';
  [2,4,6].forEach(lv=>{rings+=`<polygon points="${Array.from({length:n},(_,i)=>pt(i,lv).join(',')).join(' ')}" fill="none" stroke="rgba(158,178,255,.14)" stroke-width="1"/>`;});
  let axes='',labels='';
  for(let i=0;i<n;i++){const[x,y]=pt(i,max);
    axes+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(158,178,255,.12)"/>`;
    const[lx,ly]=pt(i,7.6);
    labels+=`<text x="${lx}" y="${ly+3}" text-anchor="middle" font-size="8.5" fill="rgba(160,175,210,.85)" font-family="Rajdhani" font-weight="600" letter-spacing="1">${STAT_KEYS[i]}</text>`;}
  const poly=Array.from({length:n},(_,i)=>pt(i,stats[i]).join(',')).join(' ');
  return `<svg class="rc-radar" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${rings}${axes}
    <polygon points="${poly}" fill="${color}2e" stroke="${color}" stroke-width="1.6" style="filter:drop-shadow(0 0 6px ${color})"/>
    ${Array.from({length:n},(_,i)=>{const[x,y]=pt(i,stats[i]);return `<circle cx="${x}" cy="${y}" r="2.2" fill="${color}"/>`;}).join('')}
    ${labels}</svg>`;
}

/* ---------------- 属性条 ---------------- */
function barRow(k,v,max,color){const w=Math.round(Math.min(v,max)/max*100);
  return `<div class="bar-row"><span class="bl">${k}</span>
    <div class="bar-track"><div class="bar-fill" style="--w:${w}%;--bf1:${color};--bf2:${color}cc"></div></div>
    <span class="bv">${v}</span></div>`;}

/* ---------------- 形态表 ---------------- */
const MULT_COLS=[['STR',0],['SPD',1],['DEF',3],['PWR',5],['ENE',6],['移速',7],['攻速',8]];
function formTable(list){
  const maxes={};
  MULT_COLS.forEach(([k,i])=>{maxes[i]=Math.max(...list.map(x=>x.m[i]??-Infinity));});
  const rows=list.map(x=>{
    const mcell=i=>{const v=x.m[i];
      if(v===null||v===undefined)return `<td class="mu na">—</td>`;
      const hi=v===maxes[i]&&v>1?' hi':'';
      return `<td class="mu${hi}">×${v}</td>`;};
    const dcell=i=>{const v=x.d[i];
      if(v===null||v===undefined)return `<td class="dr na">—</td>`;
      return `<td class="dr${v<0?' neg':''}">${v}</td>`;};
    const mas=x.mas.every(v=>v===null)?'<span class="na">—</span>':x.mas.map(v=>v===null?'—':v).join(' / ');
    const notes=x.notes.map(ntagHTML).join('')||'<span class="na">—</span>';
    const rn=x.req?reqName(x.req):null;
    return `<tr><td><span class="cn">${x.name||x.id}</span></td><td>${x.unlock>0?'Lv '+x.unlock:'初始'}</td>
      ${mcell(0)}${mcell(1)}${mcell(3)}${mcell(5)}${mcell(6)}${mcell(7)}${mcell(8)}
      ${dcell(0)}${dcell(1)}${dcell(2)}
      <td class="mas">${rn||'<span class="na">—</span>'}</td>
      <td class="mas">${mas}</td><td style="white-space:normal;min-width:150px">${notes}</td></tr>`;
  }).join('');
  return `<div class="ftable-scroll"><table class="ft"><thead><tr>
    <th>形态</th><th>解锁</th><th>力量</th><th>速度</th><th>抗性</th><th>气功</th><th>能量</th><th>移速</th><th>攻速</th>
    <th>气耗</th><th>体耗</th><th>血耗</th><th>前置形态</th><th>门槛<small style="display:block;font-size:9px;color:var(--dim2)">变/叠/瞬/自</small></th><th>被动 / 备注</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}
function formGroupHTML(g){
  const tp=g.tp?`<span class="fg-tp">TP 售价：<b>${g.tp.map(p=>p===-1?'任务解锁':p.toLocaleString()).join(' / ')}</b></span>`:'';
  return `<div class="form-group reveal">
    <div class="fg-head"><h5>${g.group}</h5><span class="fg-count">${g.list.length} 形态</span>${tp}</div>
    ${formTable(g.list)}</div>`;
}

/* ---------------- 属性基石（guide.html） ---------------- */
(function renderGuide(){
  const sg=$('#statGrid');if(!sg)return;
  sg.innerHTML=STAT_META.map((s,i)=>`<div class="stat-card panel reveal${s.hot?' hot':''}" data-delay="${i%3}">
    ${s.hot?'<span class="hot-ribbon">改版核心</span>':''}<span class="corner tl"></span><span class="corner br"></span>
    <div class="sc-top"><span class="sc-badge" style="color:${s.color}">${s.cn[0]}</span><h3>${s.cn}<small>${s.k} · ${s.en.toUpperCase()}</small></h3></div>
    <p>${s.desc}</p></div>`).join('');
  $('#resRow').innerHTML=RES_META.map((r,i)=>`<div class="res-card panel reveal" data-delay="${i%4}">
    <span class="res-ico">${r.ico}</span><div><b>${r.cn}</b><span>${r.desc}</span></div></div>`).join('');
})();

/* ---------------- 种族星系（races.html） ---------------- */
(function renderRaces(){
  const grid=$('#raceGrid');if(!grid)return;
  grid.innerHTML=RACES.map((r,i)=>{
    const formsN=r.forms.reduce((a,g)=>a+g.list.length,0);
    return `<a class="race-card panel reveal" data-delay="${i%4}" style="--rc:${r.color}" href="race.html?r=${r.id}">
      <span class="corner tl"></span><span class="corner br"></span>
      <div class="rc-top"><div><h3>${r.name}</h3></div>
        <span class="tag ${r.source==='原生'?'gn':'pk'}">${r.source}</span></div>
      ${radar(r.stats,r.color)}
      <p class="rc-desc">${r.desc}</p>
      <div class="rc-foot">
        <span class="tag cy">${formsN} 形态</span>
        <span class="tag gold">${r.racial.name.split('（')[0].split('/')[0]}</span>
        ${r.unlock?`<span class="tag rd">${r.unlock.includes('权限')?'权限门控':'免费'}</span>`:''}
      </div><span class="rc-go">进入星域 ⟶</span></a>`;}).join('');
})();

/* ---------------- 种族详情（race.html?r=xxx） ---------------- */
(function renderRaceDetail(){
  const host=$('#racePanel');if(!host)return;
  const id=new URLSearchParams(location.search).get('r');
  const idx=RACES.findIndex(r=>r.id===id);
  if(idx<0){location.replace('races.html');return;}
  const r=RACES[idx];
  document.title=`${r.name} · 种族图鉴 — 祈愿龙珠 WIKI`;
  const statsBars=r.stats.map((v,i)=>barRow(STAT_KEYS[i],v,5,STAT_META[i].color)).join('');
  const growthBars=r.growth.map((v,i)=>barRow(GROWTH_KEYS[i],v,2,'#3ee2ff')).join('');
  const tp=r.tp.map(([g,arr])=>`<span class="tag ${arr[0]===-1?'rd':'gold'}">${g}：${arr.map(p=>p===-1?'任务解锁':p.toLocaleString()).join(' / ')}</span>`).join('');
  const groups=r.forms.map(g=>{
    const tpArr=r.tp.find(t=>t[0]===g.group);
    return formGroupHTML({...g,tp:tpArr?tpArr[1]:null});
  }).join('');
  const prev=RACES[(idx-1+RACES.length)%RACES.length],next=RACES[(idx+1)%RACES.length];
  host.innerHTML=`
    <div class="race-panel show">
      <div class="rp-hero panel reveal" style="--rc:${r.color}">
        <div class="rp-aura"></div><span class="corner tl"></span><span class="corner br"></span>
        <div class="rp-name"><h3>${r.name}</h3>
          <span class="tag ${r.source==='原生'?'gn':'pk'}">${r.source}</span>
          ${r.unlock?`<span class="tag rd">${r.unlock}</span>`:''}</div>
        <p class="rp-desc">${r.desc}</p>
        <div class="rp-chips">${r.traits.map(t=>`<span class="tag">${t}</span>`).join('')}
          <span class="tag" style="border-color:${r.aura};color:${r.aura}">气焰 ●</span></div>
      </div>
      <div class="rp-cols">
        <div class="rp-block panel reveal"><h4>初始六维</h4>
          <div style="display:flex;justify-content:center;margin-bottom:8px">${radar(r.stats,r.color,210)}</div>
          ${statsBars}
          <div class="res-mini" style="margin-top:14px">
            <span>生命基础 <b>${RACE_RES_COMMON.hp5}</b></span><span>生命/体质 <b>${RACE_RES_COMMON.hp5v}</b></span>
            <span>气基础 <b>${RACE_RES_COMMON.ep5}</b></span><span>气/能量 <b>${RACE_RES_COMMON.ep5e}</b></span>
            <span>体力基础 <b>${RACE_RES_COMMON.sp5}</b></span><span>体力/耐力 <b>${RACE_RES_COMMON.sp5s}</b></span>
          </div></div>
        <div class="rp-block panel reveal" data-delay="1"><h4>成长系数</h4>${growthBars}
          <p class="ft-note">每级属性成长 = 种族系数 + 职业系数（逐项相加）。耐力/体质倍率在所有形态中恒为 ×1，故形态表不再列出。</p></div>
      </div>
      <div class="rp-skill panel reveal"><h4>种族技能 · ${r.racial.name}</h4>
        <ul>${r.racial.lines.map(l=>`<li>${l}</li>`).join('')}</ul></div>
      <div class="rp-block panel reveal" style="margin-bottom:18px"><h4>形态技能 TP 售价</h4>
        <div class="rp-chips">${tp}</div></div>
      ${groups}
      <div class="race-pager">
        <a class="btn btn-ghost" href="race.html?r=${prev.id}">⟵ ${prev.name}</a>
        <a class="btn btn-primary" href="races.html">返回种族星系</a>
        <a class="btn btn-ghost" href="race.html?r=${next.id}">${next.name} ⟶</a>
      </div>
    </div>`;
  observeReveals(host);
})();

/* ---------------- 通用形态（forms.html） ---------------- */
(function renderUniversal(){
  const host=$('#uniForms');if(!host)return;
  host.innerHTML=UNIVERSAL_GROUPS.map(g=>{
    if(g.absorption){
      return `<div class="form-group reveal"><div class="fg-head"><h5>${g.name}</h5>
        <span class="fg-count">128 形态</span><span class="fg-tp">适用：<b>${g.who}</b></span></div>
        <div class="info-card panel" style="padding:18px 22px"><p style="font-size:13px;color:var(--dim)">${g.note}</p>
        <details style="margin-top:12px"><summary style="cursor:pointer;color:var(--cyan);font-size:13px;letter-spacing:1px">展开 128 条吸收形态清单 ⌄</summary>
        <div class="mob-chips" style="margin-top:12px">${g.keys.map(kk=>`<span class="mob-chip" style="border-color:rgba(62,226,255,.25);color:#9fe8ff;background:rgba(62,226,255,.05)">${kk.replace(/^majin_|^saga_|^mob_/,'').replace(/_/g,' ')}</span>`).join('')}</div></details></div></div>`;
    }
    return `<div class="form-group reveal"><div class="fg-head"><h5>${g.name}</h5>
      <span class="fg-count">${g.type}</span><span class="fg-tp">适用：<b>${g.who}</b>　售价：<b>${g.price}</b>　导师：<b>${g.master}</b></span></div>
      ${formTable(g.list)}
      <p class="ft-note">▸ ${g.note}</p></div>`;
  }).join('');
})();

/* ---------------- 弹窗 ---------------- */
const modalRoot=document.createElement('div');modalRoot.id='modal';document.body.appendChild(modalRoot);
function openModal(html){modalRoot.innerHTML=`<div class="modal-bg"></div><div class="modal panel"><span class="corner tl"></span><span class="corner br"></span>
  <button class="modal-x" title="关闭">✕</button>${html}</div>`;
  modalRoot.classList.add('open');document.body.style.overflow='hidden';
  $('.modal-bg',modalRoot).onclick=closeModal;$('.modal-x',modalRoot).onclick=closeModal;}
function closeModal(){modalRoot.classList.remove('open');document.body.style.overflow='';}
addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

/* ---------------- 气功 ---------------- */
const CAST_MAP={SMALL_BALL:['瞬发','可自由移动'],LASER:['瞬发','可自由移动'],
  MEDIUM_BALL:['30 tick（1.5 秒）','可自由移动'],DISK:['30 tick（1.5 秒）','可自由移动'],
  BARRAGE:['40 tick（2 秒）','施法中禁止移动'],SHIELD:['40 tick（2 秒）','施法中禁止行动'],
  AREA:['40 tick（2 秒）','施法中禁止行动'],WAVE:['50 tick（2.5 秒）','施法中禁止移动'],
  BEAM:['50 tick（2.5 秒）','施法中禁止移动'],GIANT_BALL:['60 tick（3 秒）','施法中禁止移动'],
  EXPLOSION:['60 tick（3 秒）','施法中禁止移动']};
function kiModal(x){
  const t=KI_TYPES[x.type],[cast,move]=CAST_MAP[x.type]||['—','—'];
  const eff=x.dmg>0?(x.dmg*t.mult).toFixed(2):null;
  const row=(k2,v)=>`<div class="mp-row"><span>${k2}</span><b>${v}</b></div>`;
  openModal(`<div class="modal-hero" style="--kc:${t.color}">
      <span class="ki-type" style="--kc:${t.color}">${t.cn}</span>
      <h3>${x.cn}</h3>${x.en?`<div class="en">${x.en}</div>`:''}</div>
    <p class="modal-desc">${x.desc||'（暂无描述）'}</p>
    <div class="mp-grid">
      ${x.dmg>0?row('伤害倍率','×'+x.dmg)+row('类型修正','×'+t.mult)+row('综合威力','×'+eff):row('定位',x.type==='SHIELD'?'防御护盾（数值为强度）':'战术功能（无伤害）')}
      ${row('施法时间',cast)}${row('移动限制',move)}${row('冷却',x.cd)}${row('TP 售价',x.tp.toLocaleString())}
      ${x.size?row('尺寸',x.size):''}${x.speed?row('弹速',x.speed):''}
      ${row('导师',x.masters||'（无出售渠道）')}
    </div>
    ${x.rest?`<div class="ki-rest">⚑ 种族限制：${x.rest}</div>`:''}
    ${x.hidden?`<div class="ki-rest" style="color:var(--red);border-color:rgba(255,93,93,.4)">⚠ 无导师/任务渠道（疑似剧情或自定义技）</div>`:''}
    ${x.note?`<div class="ki-note">${x.note}</div>`:''}`);
}
let kiType='all',kiQuery='';
function kiCard(x,i){
  const t=KI_TYPES[x.type];
  return `<div class="ki-card panel reveal${x.hidden?' ki-hidden':''}" data-delay="${i%4}" style="--kc:${t.color}" data-ki="${x.id}" tabindex="0" role="button">
    <span class="corner tl"></span><span class="corner br"></span>
    <div class="ki-top"><span class="ki-type">${t.cn}</span>
      <span class="ki-dmg">${x.dmg>0?'×'+x.dmg:'—'}<small>${x.type==='SHIELD'?'强度':'伤害'}</small></span></div>
    <h5>${x.cn}</h5>
    ${x.en?`<div class="en">${x.en}</div>`:''}
    <p class="ki-brief">${x.desc||''}</p>
    <div class="ki-meta">
      <span>冷却 <b>${x.cd}</b></span><span>TP <b>${x.tp.toLocaleString()}</b></span>
    </div>
    ${x.rest?`<div class="ki-rest">⚑ ${x.rest}</div>`:''}
    <span class="rc-go">查看详情 ⟶</span>
  </div>`;
}
(function renderKiPage(){
  const grid=$('#kiBaseGrid');if(!grid)return;
  const ALL={};[...KI_BASE,...KI_EXTRA].forEach(x=>ALL[x.id]=x);
  function renderKi(){
    const base=KI_BASE.filter(kiMatches),extra=KI_EXTRA.filter(kiMatches);
    grid.innerHTML=base.map(kiCard).join('')||'<p style="color:var(--dim2);font-size:13px">无匹配结果</p>';
    $('#kiExtraGrid').innerHTML=extra.map(kiCard).join('')||'<p style="color:var(--dim2);font-size:13px">无匹配结果</p>';
    $('#kiBaseCount').textContent=base.length;$('#kiExtraCount').textContent=extra.length;
    $$('#ki .ki-card').forEach(c=>{
      const open=()=>kiModal(ALL[c.dataset.ki]);
      c.addEventListener('click',open);
      c.addEventListener('keydown',e=>{if(e.key==='Enter')open();});});
    $$('#ki .reveal').forEach(el=>el.classList.add('in'));
  }
  window.kiMatches=function(x){
    const tOK=kiType==='all'||x.type===kiType;
    if(!tOK)return false;
    if(!kiQuery)return true;
    const q=kiQuery.toLowerCase();
    return x.cn.includes(kiQuery)||(x.en||'').toLowerCase().includes(q)||KI_TYPES[x.type].cn.includes(kiQuery);
  };
  const types=['all',...new Set([...KI_BASE,...KI_EXTRA].map(x=>x.type))];
  $('#kiFilters').innerHTML=types.map(t=>{
    const isAll=t==='all',c=isAll?'#ffc233':KI_TYPES[t].color,n=isAll?'全部':KI_TYPES[t].cn;
    return `<button class="kf${isAll?' active':''}" style="--kc:${c}" data-t="${t}">${n}</button>`;}).join('');
  $$('#kiFilters .kf').forEach(b=>b.addEventListener('click',()=>{
    kiType=b.dataset.t;$$('#kiFilters .kf').forEach(x=>x.classList.toggle('active',x===b));renderKi();}));
  $('#kiSearch').addEventListener('input',e=>{kiQuery=e.target.value.trim();renderKi();});
  $('#kiTypeMult').innerHTML=Object.entries(KI_TYPES).map(([k2,v])=>`<tr><td><span class="ki-type" style="--kc:${v.color}">${v.cn}</span></td><td>×${v.mult}</td></tr>`).join('');
  $('#kiCast').innerHTML=KI_CAST.map(r=>`<tr><td>${r[0]}</td><td>${r[1]} · ${r[2]}</td></tr>`).join('');
  renderKi();
})();

/* ---------------- 近战打击技（strikes.html） ---------------- */
(function renderStrikes(){
  const grid=$('#strikeGrid');if(!grid)return;
  grid.innerHTML=STRIKES.map((s,i)=>`<div class="ki-card panel reveal" data-delay="${i%4}" style="--kc:#ff9d5c" data-sk="${i}" tabindex="0" role="button">
    <span class="corner tl"></span><span class="corner br"></span>
    <div class="ki-top"><span class="ki-type">打击技</span><span class="ki-dmg">×${s.dmg}<small>伤害</small></span></div>
    <h5>${s.cn}</h5>
    <p class="ki-brief">${s.desc}</p>
    <div class="ki-meta"><span>时长 <b>${s.dur}</b></span><span>冷却 <b>${s.cd}</b></span><span>TP <b>${s.tp.toLocaleString()}</b></span></div>
    <span class="rc-go">查看详情 ⟶</span></div>`).join('');
  $$('#strikeGrid .ki-card').forEach(c=>{
    const open=()=>{const s=STRIKES[+c.dataset.sk];const row=(k2,v)=>`<div class="mp-row"><span>${k2}</span><b>${v}</b></div>`;
      openModal(`<div class="modal-hero" style="--kc:#ff9d5c"><span class="ki-type" style="--kc:#ff9d5c">打击技</span><h3>${s.cn}</h3></div>
        <p class="modal-desc">${s.desc}</p>
        <div class="mp-grid">${row('伤害倍率','×'+s.dmg)}${row('连段时长',s.dur)}${row('冷却',s.cd)}${row('TP 售价',s.tp.toLocaleString())}${row('导师',s.masters)}</div>
        <div class="ki-note">打击技吃力量与速度双加成：力量提供 25% 权重，速度是主属性。</div>`);};
    c.addEventListener('click',open);
    c.addEventListener('keydown',e=>{if(e.key==='Enter')open();});});
})();

/* ---------------- 技能（skills.html） ---------------- */
(function renderSkills(){
  const grid=$('#skillGrid');if(!grid)return;
  function priceLadder(prices){
    const max=Math.max(...prices.filter(p=>p>0));
    const bars=prices.map(p=>p===-1?`<i class="neg" style="height:100%" title="任务/剧情解锁"></i>`
      :`<i style="height:${Math.max(8,p/max*100)}%" title="${p.toLocaleString()} TP"></i>`).join('');
    const first=prices[0]===-1?'任务':prices[0].toLocaleString(),last=prices[prices.length-1]===-1?'任务':prices[prices.length-1].toLocaleString();
    return `<div class="price-ladder">${bars}</div><div class="price-legend"><span>${first} TP</span><span>${last} TP</span></div>`;
  }
  const card=(s,i)=>`<div class="skill-card panel reveal" data-delay="${i%3}">
    <span class="corner tl"></span><span class="corner br"></span>
    <div class="sk-head"><h5>${s.cn}</h5><span class="lv">${s.lv===1?'1 级':'LV 1–'+s.lv}</span></div>
    ${s.rest?`<div style="margin:2px 0 4px"><span class="tag pk">${s.rest}</span></div>`:''}
    <p class="sk-eff">${s.eff}</p>${priceLadder(s.prices)}</div>`;
  grid.innerHTML=SKILLS.map(card).join('');
  $('#skillSpecialGrid').innerHTML=SKILLS_SPECIAL.map(card).join('');
  $('#tpGrid').innerHTML=TP_SOURCES.map(([v,t])=>`<div class="tp-item panel reveal"><span class="tv">${v}</span><span>${t}</span></div>`).join('');
  $('#masterTable').innerHTML=MASTERS.map(m=>`<tr><td style="text-align:left"><b style="color:#ffd9a8">${m[1]}</b></td><td style="color:var(--dim);font-size:12.5px;text-align:left">${m[2]}</td></tr>`).join('');
})();

/* ---------------- 职业（classes.html） ---------------- */
(function renderClasses(){
  const grid=$('#classGrid');if(!grid)return;
  grid.innerHTML=CLASSES.map((c,i)=>{
    const chips=c.base.map((v,j)=>`<div class="cs"><b>${v}</b><span>${STAT_KEYS[j]}</span></div>`).join('');
    const gmax=Math.max(...c.growth);
    const gb=c.growth.map(v=>`<i style="height:${Math.max(8,v/gmax*100)}%" title="${v}"></i>`).join('');
    const extra=[c.tpCost?`TP 消耗 ${c.tpCost}`:'',c.tpGain?`TP 获取 ${c.tpGain}`:''].filter(Boolean).join(' · ');
    return `<div class="class-card panel reveal" data-delay="${i%3}">
      <span class="corner tl"></span><span class="corner br"></span>
      <h5>${c.cn}</h5>${extra?`<div class="en">${extra}</div>`:''}
      <div class="class-stats">${chips}</div>
      <div class="growth-mini">${gb}</div>
      <div class="price-legend"><span>成长：力量 → 能量</span></div>
      <div class="class-pass">${c.pass}</div></div>`;
  }).join('');
})();

/* ---------------- 进阶系统（advanced.html） ---------------- */
(function renderAdvanced(){
  const grid=$('#advGrid');if(!grid)return;
  grid.innerHTML=ADVANCED.map((a,i)=>`<div class="adv-card panel reveal${a.disabled?' disabled':''}" data-delay="${i%3}">
    <span class="corner tl"></span><span class="corner br"></span>
    <h5><span class="ai">${a.ico}</span>${a.cn}</h5><div class="en">${a.en}</div>
    <ul>${a.lines.map(l=>`<li>${l}</li>`).join('')}</ul></div>`).join('');
})();

observeReveals();
