/* ============================================================
   祈愿龙珠 · 全种族 WIKI — 渲染与交互
   ============================================================ */
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=v=>v===null||v===undefined?'<span class="na">—</span>':String(v);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------------- 星空 ---------------- */
(function stars(){
  const cv=$('#stars'),ctx=cv.getContext('2d');let W,H,arr=[];
  function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;
    arr=Array.from({length:Math.min(180,W*H/9000)},()=>({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+.3,tw:Math.random()*Math.PI*2,sp:Math.random()*.25+.05,hue:Math.random()<.12?35:215}));
  }
  resize();addEventListener('resize',resize);
  (function loop(t){ctx.clearRect(0,0,W,H);
    for(const s of arr){s.tw+=.02;s.y+=s.sp;if(s.y>H)s.y=-2;
      const a=.25+.55*Math.abs(Math.sin(s.tw));
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fillStyle=`hsla(${s.hue},90%,80%,${a})`;ctx.fill();}
    requestAnimationFrame(loop);})();
})();

/* ---------------- 龙珠 ---------------- */
function starPoints(cx,cy,r,rot=-Math.PI/2){let p='';for(let i=0;i<5;i++){const a=rot+i*2*Math.PI/5;p+=`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)} `;}return p;}
function ballSVG(n){
  const R=7,spots=[[32,32],[22,24],[42,24],[22,40],[42,40],[32,20],[32,44]];
  const polys=spots.slice(0,n).map(([x,y])=>`<polygon points="${starPoints(x,y,R)}"/>`).join('');
  return `<svg viewBox="0 0 64 64"><g fill="rgba(196,30,20,.92)">${polys}</g></svg>`;
}
(function heroBalls(){
  const host=$('#dballs');if(!host)return;
  const pos=[[6,14,64],[84,10,52],[14,74,46],[78,78,70],[48,4,40],[30,88,44],[66,88,56]];
  pos.forEach(([x,y,s],i)=>{
    const d=document.createElement('div');d.className='dball';
    d.style.cssText=`left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${-i*1.1}s;animation-duration:${6+i*.7}s`;
    d.innerHTML=ballSVG(i+1);host.appendChild(d);
  });
})();

/* ---------------- 数字滚动 ---------------- */
function countUp(el,to,suffix=''){const t0=performance.now(),dur=1400;
  (function step(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*e)+suffix;if(p<1)requestAnimationFrame(step);})(t0);}

/* ---------------- 滚动监听 ---------------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');
  $$('.hc b',e.target).forEach(b=>countUp(b,+b.dataset.to,b.dataset.suffix||''));
  io.unobserve(e.target);}}),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

const spy=new IntersectionObserver(es=>{es.forEach(e=>{
  if(e.isIntersecting){const id=e.target.id;
    $$('.nav-link').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+id));}});},
  {rootMargin:'-40% 0px -55% 0px'});
$$('section[id],footer[id]').forEach(s=>spy.observe(s));

addEventListener('scroll',()=>{
  const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight);
  $('#progressBar').style.width=(p*100)+'%';
  $('#toTop').classList.toggle('show',h.scrollTop>700);
},{passive:true});
$('#toTop').onclick=()=>scrollTo({top:0,behavior:'smooth'});

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
    const notes=x.notes.map(([k,t])=>`<span class="ntag ${k}">${esc(t)}</span>`).join('')||'<span class="na">—</span>';
    const name=x.name?`<span class="cn">${x.name}</span><span class="fid">${x.id}</span>`
                     :`<span class="fid" style="font-size:12px">${x.id}</span>`;
    return `<tr><td>${name}</td><td>${x.unlock}</td>
      ${mcell(0)}${mcell(1)}${mcell(3)}${mcell(5)}${mcell(6)}${mcell(7)}${mcell(8)}
      ${dcell(0)}${dcell(1)}${dcell(2)}
      <td class="mas">${x.req?`<code style="font-size:10.5px;color:#8fd8ff">${x.req}</code>`:'<span class="na">—</span>'}</td>
      <td class="mas">${mas}</td><td style="white-space:normal;min-width:150px">${notes}</td></tr>`;
  }).join('');
  return `<div class="ftable-scroll"><table class="ft"><thead><tr>
    <th>形态</th><th>解锁</th><th>STR</th><th>SPD</th><th>DEF</th><th>PWR</th><th>ENE</th><th>移速</th><th>攻速</th>
    <th>气耗</th><th>体耗</th><th>血耗</th><th>前置形态</th><th>门槛<small style="display:block;font-size:9px;color:var(--dim2)">变/叠/瞬/自</small></th><th>被动 / 备注</th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
}
function formGroupHTML(g){
  const tp=g.tp?`<span class="fg-tp">TP 售价：<b>${g.tp.map(p=>p===-1?'任务解锁':p).join(' / ')}</b></span>`:'';
  return `<div class="form-group reveal">
    <div class="fg-head"><h5>${g.group}</h5><span class="fg-id">${g.gid}</span>
    <span class="fg-count">${g.list.length} 形态</span>${tp}</div>
    ${formTable(g.list)}</div>`;
}

/* ---------------- 种族卡 ---------------- */
function raceCard(r,i){
  const formsN=r.forms.reduce((a,g)=>a+g.list.length,0);
  return `<div class="race-card panel reveal" data-delay="${i%4}" style="--rc:${r.color}" data-race="${r.id}">
    <span class="corner tl"></span><span class="corner br"></span>
    <div class="rc-top"><div><h3>${r.name}</h3><span class="rid">${r.id}</span></div>
      <span class="tag ${r.source==='原生'?'gn':'pk'}">${r.source}</span></div>
    ${radar(r.stats,r.color)}
    <p class="rc-desc">${r.desc}</p>
    <div class="rc-foot">
      <span class="tag cy">${formsN} 形态</span>
      <span class="tag gold">${r.racial.name.split('（')[0].split('/')[0]}</span>
      ${r.unlock?`<span class="tag rd">${r.unlock.includes('权限')?'权限门控':'免费'}</span>`:''}
    </div></div>`;
}
function renderRaceCards(){$('#raceGrid').innerHTML=RACES.map(raceCard).join('');
  $$('#raceGrid .race-card').forEach(c=>c.addEventListener('click',()=>{
    activateRace(c.dataset.race);
    $('#raceDetail').scrollIntoView({behavior:'smooth'});}));
  $$('#raceGrid .reveal').forEach(el=>io.observe(el));
}

/* ---------------- 种族详情 ---------------- */
function barRow(k,v,max,color){const w=Math.round(Math.min(v,max)/max*100);
  return `<div class="bar-row"><span class="bl">${k}</span>
    <div class="bar-track"><div class="bar-fill" style="--w:${w}%;--bf1:${color};--bf2:${color}cc"></div></div>
    <span class="bv">${v}</span></div>`;}
function racePanel(r){
  const statsBars=r.stats.map((v,i)=>barRow(STAT_KEYS[i],v,5,STAT_META[i].color)).join('');
  const growthBars=r.growth.map((v,i)=>barRow(GROWTH_KEYS[i],v,2,'#3ee2ff')).join('');
  const tp=r.tp.map(([g,arr])=>`<span class="tag ${arr[0]===-1?'rd':'gold'}">${g}：${arr.map(p=>p===-1?'任务解锁':p.toLocaleString()).join(' / ')}</span>`).join('');
  const groups=r.forms.map(g=>{
    const tpArr=r.tp.find(t=>t[0]===g.group);
    return formGroupHTML({...g,tp:tpArr?tpArr[1]:null});
  }).join('');
  return `<div class="race-panel" id="rp-${r.id}">
    <div class="rp-hero panel" style="--rc:${r.color}">
      <div class="rp-aura"></div><span class="corner tl"></span><span class="corner br"></span>
      <div class="rp-name"><h3>${r.name}</h3><span class="rid">${r.id}</span>
        <span class="tag ${r.source==='原生'?'gn':'pk'}">${r.source}</span>
        ${r.unlock?`<span class="tag rd">${r.unlock}</span>`:''}</div>
      <p class="rp-desc">${r.desc}</p>
      <div class="rp-chips">${r.traits.map(t=>`<span class="tag">${t}</span>`).join('')}
        <span class="tag" style="border-color:${r.aura};color:${r.aura}">气焰 ●</span></div>
    </div>
    <div class="rp-cols">
      <div class="rp-block panel reveal"><h4>初始六维 · Base Stats</h4>${statsBars}
        <div class="res-mini" style="margin-top:14px">
          <span>HP5 基础 <b>${RACE_RES_COMMON.hp5}</b></span><span>HP5/VIT <b>${RACE_RES_COMMON.hp5v}</b></span>
          <span>EP5 基础 <b>${RACE_RES_COMMON.ep5}</b></span><span>EP5/ENE <b>${RACE_RES_COMMON.ep5e}</b></span>
          <span>SP5 基础 <b>${RACE_RES_COMMON.sp5}</b></span><span>SP5/STM <b>${RACE_RES_COMMON.sp5s}</b></span>
        </div></div>
      <div class="rp-block panel reveal" data-delay="1"><h4>成长系数 · Scaling</h4>${growthBars}
        <p class="ft-note">每级属性成长 = 种族系数 + 职业系数（逐项相加）；最终初始属性同理。STM/VIT 倍率在所有形态中恒为 ×1，故形态表未列出。</p></div>
    </div>
    <div class="rp-skill panel reveal"><h4>种族技能 · ${r.racial.name}</h4>
      <ul>${r.racial.lines.map(l=>`<li>${l}</li>`).join('')}</ul></div>
    <div class="rp-block panel reveal" style="margin-bottom:18px"><h4>形态技能 TP 售价</h4>
      <div class="rp-chips">${tp}</div></div>
    ${groups}
  </div>`;
}
function renderRaceDetail(){
  $('#raceTabs').innerHTML=RACES.map((r,i)=>`<button class="race-tab${i===0?' active':''}" style="--tc:${r.color}" data-race="${r.id}"><span class="tdot"></span>${r.name}</button>`).join('');
  $('#racePanels').innerHTML=RACES.map(racePanel).join('');
  $$('#raceTabs .race-tab').forEach(b=>b.addEventListener('click',()=>activateRace(b.dataset.race)));
  activateRace(RACES[0].id,false);
}
function activateRace(id,scroll=false){
  $$('#raceTabs .race-tab').forEach(b=>b.classList.toggle('active',b.dataset.race===id));
  $$('.race-panel').forEach(p=>p.classList.toggle('show',p.id==='rp-'+id));
  $$('.race-panel.show .reveal').forEach(el=>{el.classList.add('in');});
}

/* ---------------- 通用形态 ---------------- */
function renderUniversal(){
  $('#uniForms').innerHTML=UNIVERSAL_GROUPS.map(g=>{
    if(g.absorption){
      return `<div class="form-group reveal"><div class="fg-head"><h5>${g.name}</h5><span class="fg-id">${g.gid}</span>
        <span class="fg-count">128 形态</span><span class="fg-tp">适用：<b>${g.who}</b></span></div>
        <div class="info-card panel" style="padding:18px 22px"><p style="font-size:13px;color:var(--dim)">${g.note}</p>
        <details style="margin-top:12px"><summary style="cursor:pointer;color:var(--cyan);font-size:13px;letter-spacing:1px">展开 128 个形态键 ⌄</summary>
        <div class="mob-chips" style="margin-top:12px">${g.keys.map(kk=>`<span class="mob-chip" style="border-color:rgba(62,226,255,.25);color:#9fe8ff;background:rgba(62,226,255,.05)">${kk}</span>`).join('')}</div></details></div></div>`;
    }
    return `<div class="form-group reveal"><div class="fg-head"><h5>${g.name}</h5><span class="fg-id">${g.gid}</span>
      <span class="fg-count">${g.type}</span><span class="fg-tp">适用：<b>${g.who}</b>　售价：<b>${g.price}</b>　导师：<b>${g.master}</b></span></div>
      ${formTable(g.list)}
      <p class="ft-note">▸ ${g.note}</p></div>`;
  }).join('');
}

/* ---------------- 气功 ---------------- */
let kiType='all',kiQuery='';
function kiCard(x){
  const t=KI_TYPES[x.type];
  return `<div class="ki-card panel reveal${x.hidden?' ki-hidden':''}" style="--kc:${t.color}">
    <span class="corner tl"></span><span class="corner br"></span>
    <div class="ki-top"><span class="ki-type">${t.cn} · ${x.type}</span>
      <span class="ki-dmg">${x.dmg>0?'×'+x.dmg:'—'}<small>DMG</small></span></div>
    <h5>${x.cn}</h5>
    ${x.en?`<div class="en">${x.en}</div>`:''}<div class="kid2">${x.id}</div>
    <div class="ki-meta">
      <span>冷却 <b>${x.cd}</b></span><span>TP <b>${x.tp.toLocaleString()}</b></span>
      ${x.size?`<span>尺寸 <b>${x.size}</b></span>`:''}${x.speed?`<span>速度 <b>${x.speed}</b></span>`:''}
    </div>
    <div class="ki-masters">导师：<b>${x.masters||'（无出售渠道）'}</b></div>
    ${x.rest?`<div class="ki-rest">⚑ ${x.rest}</div>`:''}
    ${x.hidden?`<div class="ki-rest" style="color:var(--red);border-color:rgba(255,93,93,.4)">⚠ 无导师/任务渠道（疑似剧情或自定义技）</div>`:''}
    ${x.note?`<div class="ki-note">${x.note}</div>`:''}
  </div>`;
}
function kiMatches(x){
  const tOK=kiType==='all'||x.type===kiType;
  if(!tOK)return false;
  if(!kiQuery)return true;
  const q=kiQuery.toLowerCase();
  return x.cn.includes(kiQuery)||x.id.toLowerCase().includes(q)||(x.en||'').toLowerCase().includes(q)||KI_TYPES[x.type].cn.includes(kiQuery);
}
function renderKi(){
  const base=KI_BASE.filter(kiMatches),extra=KI_EXTRA.filter(kiMatches);
  $('#kiBaseGrid').innerHTML=base.map(kiCard).join('')||'<p style="color:var(--dim2);font-size:13px">无匹配结果</p>';
  $('#kiExtraGrid').innerHTML=extra.map(kiCard).join('')||'<p style="color:var(--dim2);font-size:13px">无匹配结果</p>';
  $('#kiBaseCount').textContent=base.length;$('#kiExtraCount').textContent=extra.length;
  $$('#ki .reveal').forEach(el=>el.classList.add('in'));
}
function renderKiTools(){
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
}

/* ---------------- 近战技 ---------------- */
function renderStrikes(){
  $('#strikeGrid').innerHTML=STRIKES.map((s,i)=>`<div class="ki-card panel reveal" data-delay="${i%4}" style="--kc:#ff9d5c">
    <span class="corner tl"></span><span class="corner br"></span>
    <div class="ki-top"><span class="ki-type">打击技 · STRIKE</span><span class="ki-dmg">×${s.dmg}<small>DMG</small></span></div>
    <h5>${s.cn}</h5><div class="kid2">${s.id}</div>
    <div class="ki-meta"><span>时长 <b>${s.dur}</b></span><span>冷却 <b>${s.cd}</b></span><span>TP <b>${s.tp.toLocaleString()}</b></span></div>
    <div class="ki-masters">导师：<b>${s.masters}</b></div></div>`).join('');
}

/* ---------------- 技能 ---------------- */
function priceLadder(prices){
  const max=Math.max(...prices.filter(p=>p>0));
  const bars=prices.map(p=>p===-1?`<i class="neg" style="height:100%" title="任务/剧情解锁"></i>`
    :`<i style="height:${Math.max(8,p/max*100)}%" title="${p.toLocaleString()} TP"></i>`).join('');
  const first=prices[0]===-1?'任务':prices[0].toLocaleString(),last=prices[prices.length-1]===-1?'任务':prices[prices.length-1].toLocaleString();
  return `<div class="price-ladder">${bars}</div><div class="price-legend"><span>${first} TP</span><span>${last} TP</span></div>`;
}
function skillCard(s,i){return `<div class="skill-card panel reveal" data-delay="${i%3}">
  <span class="corner tl"></span><span class="corner br"></span>
  <div class="sk-head"><h5>${s.cn}</h5><span class="lv">${s.lv===1?'1 级':'LV 1–'+s.lv}</span></div>
  <div class="sid">${s.id}${s.rest?` · <span style="color:var(--rose)">${s.rest}</span>`:''}</div>
  <p class="sk-eff">${s.eff}</p>${priceLadder(s.prices)}</div>`;}
function renderSkills(){
  $('#skillGrid').innerHTML=SKILLS.map(skillCard).join('');
  $('#skillSpecialGrid').innerHTML=SKILLS_SPECIAL.map(skillCard).join('');
  $('#tpGrid').innerHTML=TP_SOURCES.map(([v,t])=>`<div class="tp-item panel"><span class="tv">${v}</span><span>${t}</span></div>`).join('');
  $('#masterTable').innerHTML=MASTERS.map(m=>`<tr><td><b style="color:#ffd9a8">${m[1]}</b> <span style="font-family:Consolas;font-size:10.5px;color:var(--dim2)">${m[0]}</span></td><td style="color:var(--dim);font-size:12.5px">${m[2]}</td></tr>`).join('');
}

/* ---------------- 职业 ---------------- */
function renderClasses(){
  $('#classGrid').innerHTML=CLASSES.map((c,i)=>{
    const chips=c.base.map((v,j)=>`<div class="cs"><b>${v}</b><span>${STAT_KEYS[j]}</span></div>`).join('');
    const gmax=Math.max(...c.growth);
    const gb=c.growth.map(v=>`<i style="height:${Math.max(8,v/gmax*100)}%" title="${v}"></i>`).join('');
    return `<div class="class-card panel reveal" data-delay="${i%3}">
      <span class="corner tl"></span><span class="corner br"></span>
      <h5>${c.cn}</h5><div class="en">${c.id.toUpperCase()}${c.tpCost?` · TP 消耗 ${c.tpCost}`:''}${c.tpGain?` · TP 获取 ${c.tpGain}`:''}</div>
      <div class="class-stats">${chips}</div>
      <div class="growth-mini">${gb}</div>
      <div class="price-legend"><span>成长 STR→ENE</span></div>
      <div class="class-pass">${c.pass}</div></div>`;
  }).join('');
}

/* ---------------- 进阶 ---------------- */
function renderAdvanced(){
  $('#advGrid').innerHTML=ADVANCED.map((a,i)=>`<div class="adv-card panel reveal${a.disabled?' disabled':''}" data-delay="${i%3}">
    <span class="corner tl"></span><span class="corner br"></span>
    <h5><span class="ai">${a.ico}</span>${a.cn}</h5><div class="en">${a.en}</div>
    <ul>${a.lines.map(l=>`<li>${l}</li>`).join('')}</ul></div>`).join('');
}

/* ---------------- 启动 ---------------- */
renderRaceCards();renderRaceDetail();renderUniversal();renderKiTools();renderStrikes();renderSkills();renderClasses();renderAdvanced();
$$('.reveal').forEach(el=>io.observe(el));

/* hero 计数器 */
(function counters(){
  const formTotal=RACES.reduce((a,r)=>a+r.forms.reduce((x,g)=>x+g.list.length,0),0)
    +UNIVERSAL_GROUPS.reduce((a,g)=>a+(g.keys?128:g.list.length),0);
  const map={cRaces:RACES.length,cForms:formTotal,cKi:KI_BASE.length+KI_EXTRA.length,cStrike:STRIKES.length,cSkill:SKILLS.length+SKILLS_SPECIAL.length,cClass:CLASSES.length};
  Object.entries(map).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.dataset.to=v;});
})();
