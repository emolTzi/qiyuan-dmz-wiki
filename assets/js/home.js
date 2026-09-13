/* ============================================================
   祈愿龙珠 · 首页 — 引力透镜黑洞 / 吞噬龙珠 / 超新星重生
   ============================================================ */
'use strict';
(function(){
  const scene=$('#scene');if(!scene)return;
  const title=$('#homeTitle');
  const bh=$('#blackhole');
  const rand=(a,b)=>a+Math.random()*(b-a);

  /* ==========================================================
     黑洞渲染器 — 吸积盘引力透镜（Gargantua 风格）
     画布内坐标：视界半径 R，光子环 RING，盘 [DIN, DOUT]
     ========================================================== */
  const cv=bh.querySelector('.bh-cv');
  const ctx=cv.getContext('2d');
  const CW=280,CH=216,CX=CW/2,CY=CH/2+2;
  const R=33,RING=34.6,DIN=38,DOUT=94,SINI=0.985;      // 倾角 ≈80°（近侧视）
  const dpr=Math.min(devicePixelRatio||1,2);
  cv.width=CW*dpr;cv.height=CH*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);

  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const edgeFade=rho=>Math.max(0,Math.min(Math.min(1,(rho-DIN)/7),Math.min(1,(DOUT-rho)/30)));

  /* 盘粒子：内密外疏、开普勒式差速自转 */
  const NR=30,NT=76,pts=[];
  for(let i=0;i<NR;i++){
    const rho=DIN+(DOUT-DIN)*Math.pow(i/(NR-1),1.25);
    for(let j=0;j<NT;j++){
      pts.push({i,rho,th:rand(0,Math.PI*2),
        w:0.00022*Math.pow(DIN/rho,1.5),
        sz:2.1+(1-(rho-DIN)/(DOUT-DIN))*2.2+Math.random()*.8,
        jit:rand(-1.3,1.3),yj:rand(-1.2,1.2),
        al:(0.16+Math.random()*.26)*edgeFade(rho)});
    }
  }

  /* 温度 × 多普勒 颜色表（靠近侧更亮更蓝，远离侧更暗更红） */
  const TEMPS=[[255,246,220],[255,196,118],[240,128,52],[128,56,26]];
  function tempRGB(t){const x=t*(TEMPS.length-1),i=Math.min(TEMPS.length-2,x|0),f=x-i;
    return [0,1,2].map(k=>TEMPS[i][k]+(TEMPS[i+1][k]-TEMPS[i][k])*f);}
  const NB=16,table=[];
  for(let i=0;i<NR;i++){
    const rho=DIN+(DOUT-DIN)*Math.pow(i/(NR-1),1.25);
    const base=tempRGB((rho-DIN)/(DOUT-DIN)),row=[];
    for(let b=0;b<NB;b++){
      const D=0.45+(b/(NB-1))*1.1;
      const r=Math.min(255,base[0]*D*(D<1?1+(D-1)*.15:1));
      const g=Math.min(255,base[1]*D);
      const bl=Math.min(255,base[2]*D*(D>1?1+(D-1)*.9:1));
      row.push([r|0,g|0,bl|0]);
    }
    table.push(row);
  }

  /* 圆形柔光粒子精灵图（懒生成缓存）——盘面由此呈现连续气体质感 */
  const sprites=new Map();
  function getSprite(i,b){
    const key=i*NB+b;let sp=sprites.get(key);
    if(sp)return sp;
    const[r,g,bl]=table[i][b];
    sp=document.createElement('canvas');sp.width=sp.height=32;
    const g2=sp.getContext('2d');
    const rg=g2.createRadialGradient(16,16,0,16,16,16);
    rg.addColorStop(0,`rgba(${r},${g},${bl},1)`);
    rg.addColorStop(.32,`rgba(${r},${g},${bl},.55)`);
    rg.addColorStop(.7,`rgba(${r},${g},${bl},.12)`);
    rg.addColorStop(1,`rgba(${r},${g},${bl},0)`);
    g2.fillStyle=rg;g2.fillRect(0,0,32,32);
    sprites.set(key,sp);
    return sp;
  }

  /* 静态渐变资源 */
  const coreGrad=ctx.createRadialGradient(CX,CY,R*.6,CX,CY,R+7);
  coreGrad.addColorStop(0,'#000');coreGrad.addColorStop(.78,'#000');coreGrad.addColorStop(1,'rgba(0,0,0,0)');
  const ringGrad=ctx.createLinearGradient(CX-RING,CY,CX+RING,CY);
  ringGrad.addColorStop(0,'rgba(255,240,205,.95)');
  ringGrad.addColorStop(.5,'rgba(255,190,110,.55)');
  ringGrad.addColorStop(1,'rgba(200,110,50,.35)');
  /* 暗化晕：黑洞遮蔽背景光，与星空交融 */
  const haloGrad=ctx.createRadialGradient(CX,CY,R*.7,CX,CY,R*3.4);
  haloGrad.addColorStop(0,'rgba(2,4,10,.42)');haloGrad.addColorStop(.45,'rgba(2,4,10,.2)');haloGrad.addColorStop(1,'rgba(2,4,10,0)');

  let pulse=0;                                    // 吞噬脉冲（0..1）
  const fr=new Array(NT*NR*5);                    // 前半盘绘制缓冲 [x,y,sz,sprite,al]×n
  function drawP(x,y,sz,sp,al){ctx.globalAlpha=al;ctx.drawImage(sp,x-sz/2,y-sz/2,sz,sz);}

  function drawBH(dt){
    ctx.clearRect(0,0,CW,CH);
    /* 先铺暗化晕，让黑洞沉入星空而非贴在上面 */
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    ctx.fillStyle=haloGrad;
    ctx.beginPath();ctx.arc(CX,CY,R*3.4,0,7);ctx.fill();
    ctx.globalCompositeOperation='lighter';
    let fn=0;
    for(const p of pts){
      p.th+=p.w*dt;
      const c=Math.cos(p.th),s=Math.sin(p.th);
      const rho=p.rho+p.jit;
      const X=rho*c,Z=rho*s;
      const beta=0.55*(1.15-(p.rho-DIN)/(DOUT-DIN));
      const D=1+beta*(-c);                        // 左侧为靠近观测者的一侧
      const sp=getSprite(p.i,clamp(((D-0.45)/1.1*(NB-1))|0,0,NB-1));
      const sx=CX+X;
      if(Z<0){
        /* 远侧盘：光线被引力弯折，绕到视界上下形成双弧 */
        const h=-Z*SINI;
        const off=Math.sqrt(Math.max(0,RING*RING-X*X))+h*0.42+p.yj;
        drawP(sx,CY-off,p.sz*.95,sp,p.al*.85);    // 上弧（主像）
        drawP(sx,CY+off,p.sz*.9,sp,p.al*.5);      // 下弧（次像，更暗）
      }else{
        fr[fn++]=sx;fr[fn++]=CY+Z*SINI+p.yj*.5;fr[fn++]=p.sz;fr[fn++]=sp;fr[fn++]=p.al;
      }
    }

    /* 事件视界（纯黑阴影 + 软边） */
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    ctx.fillStyle=coreGrad;
    ctx.beginPath();ctx.arc(CX,CY,R+7,0,7);ctx.fill();

    /* 光子环（贴近视界的细亮环，随吞噬脉冲增亮） */
    ctx.globalCompositeOperation='lighter';
    ctx.save();
    ctx.shadowColor='rgba(255,205,120,.85)';ctx.shadowBlur=9+10*pulse;
    ctx.strokeStyle=ringGrad;ctx.lineWidth=1.7+1.6*pulse;
    ctx.beginPath();ctx.arc(CX,CY,RING,0,7);ctx.stroke();
    ctx.restore();

    /* 吞噬冲击波扩散环 */
    if(pulse>0.02){
      ctx.strokeStyle=`rgba(255,220,150,${pulse*.5})`;ctx.lineWidth=1.2;
      ctx.beginPath();ctx.arc(CX,CY,RING+(1-pulse)*46,0,7);ctx.stroke();
      pulse*=0.94;
    }

    /* 前半盘：自视界前方掠过 */
    for(let k=0;k<fn;k+=5){
      ctx.globalAlpha=fr[k+4];
      ctx.drawImage(fr[k+3],fr[k]-fr[k+2]/2,fr[k+1]-fr[k+2]/2,fr[k+2],fr[k+2]);
    }
    ctx.globalAlpha=1;
  }

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

  /* ---------- 对外广播黑洞屏幕坐标（供星野引力透镜使用） ---------- */
  function broadcastBH(){
    const br=bh.getBoundingClientRect();
    window.__BH=(br.bottom<-60||br.top>innerHeight+60)?null:
      {x:br.left+br.width/2,y:br.top+br.height/2,r:R*(br.width/CW)};
  }

  /* ---------- 标题文字引力透镜（SVG 位移贴图，黑洞掠过处文字被弯折） ---------- */
  const lensImg=document.getElementById('gravLensMap');
  const LMS=260;let lensOn=false;
  if(lensImg&&!REDUCED){
    const C=LMS/2,S=52,RC=40;
    const mc=document.createElement('canvas');mc.width=mc.height=LMS;
    const mctx=mc.getContext('2d'),idat=mctx.createImageData(LMS,LMS),px=idat.data;
    for(let y=0;y<LMS;y++)for(let x=0;x<LMS;x++){
      const dx=x-C,dy=y-C,d=Math.sqrt(dx*dx+dy*dy);
      let m=0;
      if(d>1){m=Math.min(26,RC*RC/d);                 // 光线偏折 ∝ 1/d
        if(d>112)m*=Math.max(0,1-(d-112)/34);          // 贴图边缘衰减到 0
      }
      const o=(y*LMS+x)*4;
      px[o]  =clamp(128-(dx/d||0)*m/S*255,0,255);
      px[o+1]=clamp(128-(dy/d||0)*m/S*255,0,255);
      px[o+2]=128;px[o+3]=255;
    }
    mctx.putImageData(idat,0,0);
    const url=mc.toDataURL('image/png');
    lensImg.setAttribute('href',url);
    try{lensImg.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',url);}catch(e){}
  }
  function updateLens(){
    if(!lensImg||REDUCED)return;
    const br=bh.getBoundingClientRect(),tvp=title.getBoundingClientRect();
    const mds=LMS*(br.width/CW);
    const lx=br.left+br.width/2-tvp.left-mds/2, ly=br.top+br.height/2-tvp.top-mds/2;
    const overlap=lx>-mds&&ly>-mds&&lx<tvp.width&&ly<tvp.height;
    if(overlap){
      if(!lensOn){title.style.filter='url(#gravLens)';lensOn=true;}
      lensImg.setAttribute('x',lx);lensImg.setAttribute('y',ly);
      lensImg.setAttribute('width',mds);lensImg.setAttribute('height',mds);
    }else if(lensOn){title.style.filter='none';lensOn=false;}
  }

  /* ---------- 主循环 ---------- */
  let bhX=innerWidth/2,bhY=200,lastT=0;
  function frame(now){
    const dt=Math.min(50,now-lastT||16);lastT=now;
    const r=scene.getBoundingClientRect(),tr=title.getBoundingClientRect();
    const cx=tr.left-r.left+tr.width/2, cy=tr.top-r.top+tr.height/2;
    const rx=Math.min(innerWidth*.34,460), ry=rx*.4;
    const t=now*.00022;
    bhX=cx+Math.cos(t)*rx; bhY=cy+Math.sin(t)*ry;
    const behind=Math.sin(t)<0;                       // 上半圈 = 转到标题背后
    const depth=.82+.36*(Math.sin(t)+1)/2;            // 近大远小
    const bw=bh.offsetWidth,bh2=bh.offsetHeight,kScale=bw/CW*depth;
    bh.style.transform=`translate(${bhX-bw/2}px,${bhY-bh2/2}px) scale(${depth})`;
    bh.style.zIndex=behind?2:4;
    bh.style.opacity=behind?.78:1;
    broadcastBH();
    updateLens();
    drawBH(dt);

    for(const b of balls){
      if(b.state==='free'){
        b.x+=b.vx;b.y+=b.vy;
        if(b.x<b.size/2||b.x>r.width-b.size/2)b.vx*=-1;
        if(b.y<b.size/2||b.y>r.height-b.size/2)b.vy*=-1;
        if(Math.hypot(b.x-bhX,b.y-bhY)<62*kScale){    // 被黑洞捕获
          b.state='devour';b.t0=now;b.sx=b.x;b.sy=b.y;
          pulse=1;
          bh.classList.remove('fed');void bh.offsetWidth;bh.classList.add('fed');
        }
      }else if(b.state==='devour'){                   // 螺旋吸入
        const p=Math.min(1,(now-b.t0)/480),e=p*p;
        const ang=p*Math.PI*2.2,rad=(1-e)*30*kScale;
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
  if(REDUCED){
    bh.style.transform=`translate(${innerWidth*.72}px,180px)`;
    drawBH(0);broadcastBH();
  }
  else requestAnimationFrame(frame);

  /* ---------- 数据规模计数 ---------- */
  const formTotal=RACES.reduce((a,r)=>a+r.forms.reduce((x,g)=>x+g.list.length,0),0)
    +UNIVERSAL_GROUPS.reduce((a,g)=>a+(g.keys?128:g.list.length),0);
  const map={cRaces:RACES.length,cForms:formTotal,cKi:KI_BASE.length+KI_EXTRA.length,
    cStrike:STRIKES.length,cSkill:SKILLS.length+SKILLS_SPECIAL.length,cClass:CLASSES.length};
  Object.entries(map).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.dataset.to=v;});
})();
