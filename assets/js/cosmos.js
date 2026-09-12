/* ============================================================
   祈愿龙珠 · 全种族 WIKI — 宇宙共享层
   星野 / 鼠标星尘 / 导航与页脚 / 滚动显现
   ============================================================ */
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- 站点地图 ---------------- */
const NAV=[
  ['index.html','首页'],['races.html','种族'],['forms.html','形态'],
  ['ki.html','气功'],['strikes.html','近战'],['skills.html','技能'],
  ['classes.html','职业'],['advanced.html','进阶'],['guide.html','属性'],
];
const BALL_SVG=(()=>{ // 龙珠 SVG 生成器（n 星）
  const pts=(cx,cy,r)=>{let p='';for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;p+=`${(cx+r*Math.cos(a)).toFixed(1)},${(cy+r*Math.sin(a)).toFixed(1)} `;}return p;};
  const spots=[[32,32],[22,24],[42,24],[22,40],[42,40],[32,18],[32,46]];
  return n=>{const polys=spots.slice(0,n).map(([x,y])=>`<polygon points="${pts(x,y,6.6)}"/>`).join('');
    return `<svg viewBox="0 0 64 64"><defs><radialGradient id="dbg${n}" cx="35%" cy="30%"><stop offset="0%" stop-color="#ffd97a"/><stop offset="100%" stop-color="#e8520a"/></radialGradient></defs><circle cx="32" cy="32" r="29" fill="url(#dbg${n})"/><circle cx="26" cy="22" r="8" fill="rgba(255,255,255,.35)"/><g fill="rgba(196,30,20,.92)">${polys}</g></svg>`;};
})();

/* ---------------- 导航 + 进度条 + 回顶 ---------------- */
(function chrome(){
  const here=(location.pathname.split('/').pop()||'index.html');
  const nav=document.createElement('nav');nav.id='topnav';
  nav.innerHTML=`<a class="brand" href="index.html">
      <svg class="brand-ball" viewBox="0 0 64 64"><defs><radialGradient id="bb" cx="35%" cy="30%"><stop offset="0%" stop-color="#ffd97a"/><stop offset="100%" stop-color="#e8520a"/></radialGradient></defs><circle cx="32" cy="32" r="30" fill="url(#bb)"/><polygon points="32,18 35.2,27 44.6,27.1 37,33 40,42.3 32,36.6 24,42.3 27,33 19.4,27.1 28.8,27" fill="#c41e14"/></svg>
      <span class="brand-txt"><b>祈愿龙珠</b><span>QIYUAN DMZ WIKI</span></span></a>
    <div class="links">${NAV.map(([h,t])=>`<a class="nav-link${h===here?' active':''}" href="${h}">${t}</a>`).join('')}</div>`;
  document.body.prepend(nav);
  const pb=document.createElement('div');pb.id='progressBar';document.body.prepend(pb);
  const tt=document.createElement('button');tt.id='toTop';tt.title='回到顶部';tt.textContent='↑';document.body.appendChild(tt);
  tt.onclick=()=>scrollTo({top:0,behavior:'smooth'});
  addEventListener('scroll',()=>{const h=document.documentElement;
    pb.style.width=(h.scrollTop/Math.max(1,h.scrollHeight-h.clientHeight)*100)+'%';
    tt.classList.toggle('show',h.scrollTop>700);},{passive:true});
})();

/* ---------------- 页脚 ---------------- */
(function footer(){
  const f=document.createElement('footer');f.id='about';f.className='chapter';
  f.innerHTML=`<div class="wrap"><div class="foot-grid">
      <div><h6>关于本 Wiki</h6><p>「祈愿龙珠」全种族玩家 Wiki —— 数据整理自服务端运行配置（2026-09 快照），基于 DragonMineZ 2.1.3 祈愿魔改版，面向玩家呈现。</p></div>
      <div><h6>阅读指引</h6><ul>
        <li>▸ 形态表高亮数字 = 该形态组内最高倍率</li>
        <li>▸ 消耗为负 = 该形态反过来恢复对应资源</li>
        <li>▸ 门槛四项依次为：变身 / 叠加 / 瞬变 / 自由</li>
        <li>▸ 标「任务解锁」的条目无法直接用 TP 购买</li></ul></div>
      <div><h6>声明</h6><p>本站为非官方玩家资料站，仅作数据查询参考；游戏内实际数值以服务器当前版本为准。Dragon Ball 相关版权归原作所有。</p></div>
    </div>
    <div class="foot-bottom"><span>QIYUAN DMZ WIKI · 2026-09 数据快照</span>
      <span class="fbs"><svg width="14" height="14" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#ff7a18"/><polygon points="32,20 34.7,27.8 43,27.9 36.3,32.9 38.8,40.9 32,36 25.2,40.9 27.7,32.9 21,27.9 29.3,27.8" fill="#c41e14"/></svg>集齐七颗龙珠，召唤神龙</span></div></div>`;
  document.body.appendChild(f);
})();

/* ---------------- 星野（视差） ---------------- */
(function stars(){
  const cv=$('#stars');if(!cv)return;const ctx=cv.getContext('2d');
  let W,H,layers=[];let mx=0,my=0;
  function resize(){W=cv.width=innerWidth;H=cv.height=innerHeight;
    layers=[0.15,0.4,0.8].map((depth,li)=>Array.from({length:Math.min(70,W*H/26000)},()=>({
      x:Math.random()*W,y:Math.random()*H,r:(Math.random()*1.2+.3)*(0.5+depth),
      tw:Math.random()*Math.PI*2,sp:Math.random()*.06*(0.4+depth)+.01,
      hue:Math.random()<.1?35:(Math.random()<.5?215:265),depth})));
  }
  resize();addEventListener('resize',resize);
  addEventListener('mousemove',e=>{mx=e.clientX/W-.5;my=e.clientY/H-.5;},{passive:true});
  (function loop(){ctx.clearRect(0,0,W,H);
    for(const layer of layers)for(const s of layer){s.tw+=.02;s.y+=s.sp;if(s.y>H+4)s.y=-2;
      const a=.2+.6*Math.abs(Math.sin(s.tw))*(0.4+s.depth*0.75);
      ctx.beginPath();ctx.arc(s.x-mx*28*s.depth,s.y-my*20*s.depth,s.r,0,7);
      ctx.fillStyle=`hsla(${s.hue},90%,82%,${a})`;ctx.fill();}
    if(!REDUCED)requestAnimationFrame(loop);})();
})();

/* ---------------- 鼠标星尘痕迹 ---------------- */
(function trail(){
  if(REDUCED)return;
  const cv=document.createElement('canvas');cv.id='trail';document.body.appendChild(cv);
  const ctx=cv.getContext('2d');let W,H,parts=[],lx=-99,ly=-99;
  const resize=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight;};
  resize();addEventListener('resize',resize);
  addEventListener('mousemove',e=>{
    const d=Math.hypot(e.clientX-lx,e.clientY-ly);
    if(d<6)return;lx=e.clientX;ly=e.clientY;
    const gold=Math.random()<.5;
    parts.push({x:e.clientX,y:e.clientY,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5-.25,
      life:1,r:Math.random()*2.2+1,hue:gold?40:190,sat:gold?100:90});
    if(parts.length>140)parts.splice(0,parts.length-140);
  },{passive:true});
  (function loop(){ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
    parts=parts.filter(p=>p.life>0);
    for(const p of parts){p.life-=.022;p.x+=p.vx;p.y+=p.vy;p.vy-=.004;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life,0,7);
      ctx.fillStyle=`hsla(${p.hue},${p.sat}%,70%,${p.life*.75})`;ctx.fill();
      ctx.beginPath();ctx.arc(p.x,p.y,p.r*p.life*2.6,0,7);
      ctx.fillStyle=`hsla(${p.hue},${p.sat}%,60%,${p.life*.12})`;ctx.fill();}
    requestAnimationFrame(loop);})();
})();

/* ---------------- 滚动显现 ---------------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');
  $$('.hc b',e.target).forEach(b=>{const t0=performance.now(),to=+b.dataset.to,suf=b.dataset.suffix||'';
    (function step(t){const p=Math.min(1,(t-t0)/1400),e2=1-Math.pow(1-p,3);
      b.textContent=Math.round(to*e2)+suf;if(p<1)requestAnimationFrame(step);})(t0);});
  io.unobserve(e.target);}}),{threshold:.12});
function observeReveals(root=document){$$('.reveal',root).forEach(el=>io.observe(el));}
addEventListener('DOMContentLoaded',()=>observeReveals());
