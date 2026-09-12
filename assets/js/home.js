/* ============================================================
   祈愿龙珠 · 首页 — 黑洞公转 / 吞噬龙珠 / 超新星重生
   ============================================================ */
'use strict';
(function(){
  const scene=$('#scene');if(!scene)return;
  const title=$('#homeTitle');
  const bh=$('#blackhole');
  const rand=(a,b)=>a+Math.random()*(b-a);

  /* ---------- 龙珠 ---------- */
  const balls=[];
  function spawnPos(b,farFromBh){
    const r=scene.getBoundingClientRect(),tr=title.getBoundingClientRect();
    for(let tries=0;tries<40;tries++){
      b.x=rand(r.width*.07,r.width*.93);b.y=rand(r.height*.09,r.height*.88);
      const inTitle=b.x>tr.left-r.left-70&&b.x<tr.right-r.left+70&&b.y>tr.top-r.top-70&&b.y<tr.bottom-r.top+70;
      if(inTitle)continue;
      if(farFromBh&&Math.hypot(b.x-bhX,b.y-bhY)<300)continue;
      break;
    }
  }
  for(let i=0;i<7;i++){
    const el=document.createElement('div');el.className='dball2';
    el.innerHTML=BALL_SVG(i+1);
    const size=rand(38,52);el.style.width=el.style.height=size+'px';
    scene.appendChild(el);
    const b={el,size,x:0,y:0,vx:rand(.25,.55)*(Math.random()<.5?-1:1),vy:rand(.18,.4)*(Math.random()<.5?-1:1),
      state:'free',t0:0,sx:0,sy:0,scale:1,op:1};
    spawnPos(b,false);balls.push(b);
  }

  /* ---------- 吞噬 → 超新星重生 ---------- */
  function respawn(b){
    spawnPos(b,true);                       // 选一个远离黑洞的位置
    const s=document.createElement('div');  // 超新星闪光
    s.className='supernova';s.style.left=b.x+'px';s.style.top=b.y+'px';
    scene.appendChild(s);setTimeout(()=>s.remove(),1100);
    setTimeout(()=>{                        // 龙珠自超新星迸发
      b.vx=rand(.3,.6)*(Math.random()<.5?-1:1);b.vy=rand(.22,.45)*(Math.random()<.5?-1:1);
      b.state='burst';b.t0=performance.now();b.scale=0;b.op=1;
    },380);
  }

  /* ---------- 主循环 ---------- */
  let bhX=innerWidth/2,bhY=200;
  function frame(now){
    const r=scene.getBoundingClientRect(),tr=title.getBoundingClientRect();
    const cx=tr.left-r.left+tr.width/2, cy=tr.top-r.top+tr.height/2;
    const rx=Math.min(innerWidth*.34,460), ry=rx*.4;
    const t=now*.00022;
    bhX=cx+Math.cos(t)*rx; bhY=cy+Math.sin(t)*ry;
    const behind=Math.sin(t)<0;                       // 上半圈 = 转到标题背后
    const depth=.82+.36*(Math.sin(t)+1)/2;            // 近大远小
    bh.style.transform=`translate(${bhX-60}px,${bhY-60}px) scale(${depth})`;
    bh.style.zIndex=behind?2:4;
    bh.style.opacity=behind?.78:1;

    for(const b of balls){
      if(b.state==='free'){
        b.x+=b.vx;b.y+=b.vy;
        if(b.x<b.size/2||b.x>r.width-b.size/2)b.vx*=-1;
        if(b.y<b.size/2||b.y>r.height-b.size/2)b.vy*=-1;
        if(Math.hypot(b.x-bhX,b.y-bhY)<64){           // 被黑洞捕获
          b.state='devour';b.t0=now;b.sx=b.x;b.sy=b.y;
          bh.classList.remove('fed');void bh.offsetWidth;bh.classList.add('fed');
        }
      }else if(b.state==='devour'){                   // 螺旋吸入
        const p=Math.min(1,(now-b.t0)/480),e=p*p;
        const ang=p*Math.PI*2.2,rad=(1-e)*26;
        b.x=b.sx+(bhX-b.sx)*e+Math.cos(ang)*rad;
        b.y=b.sy+(bhY-b.sy)*e+Math.sin(ang)*rad;
        b.scale=1-e*.95;b.op=1-p*.35;
        if(p>=1){b.state='waiting';b.op=0;setTimeout(()=>respawn(b),680);}
      }else if(b.state==='burst'){                    // 自超新星弹出
        const p=Math.min(1,(now-b.t0)/420);
        b.scale=p<.6?(p/.6)*1.25:1.25-(p-.6)/.4*.25;
        if(p>=1){b.state='free';b.scale=1;}
      }
      b.el.style.opacity=b.op;
      b.el.style.transform=`translate(${b.x-b.size/2}px,${b.y-b.size/2}px) scale(${b.scale})`;
    }
    requestAnimationFrame(frame);
  }
  if(REDUCED){bh.style.transform=`translate(${innerWidth*.72}px,180px)`;}
  else requestAnimationFrame(frame);

  /* ---------- 数据规模计数 ---------- */
  const formTotal=RACES.reduce((a,r)=>a+r.forms.reduce((x,g)=>x+g.list.length,0),0)
    +UNIVERSAL_GROUPS.reduce((a,g)=>a+(g.keys?128:g.list.length),0);
  const map={cRaces:RACES.length,cForms:formTotal,cKi:KI_BASE.length+KI_EXTRA.length,
    cStrike:STRIKES.length,cSkill:SKILLS.length+SKILLS_SPECIAL.length,cClass:CLASSES.length};
  Object.entries(map).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.dataset.to=v;});
})();
