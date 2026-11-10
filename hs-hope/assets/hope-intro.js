/* ------------------------------------------------------------
   The Pulse: cinematic intro for HOPE lesson pages
   Optima Academy Online · HOPE (High School)

   HOPE version of the AI Literacy "Sealed Box" intro
   (hs-ai-literacy/Module 1/assets/intro.js) and the science "Lab Flask"
   intro (OAO-Science/shared/intro.js). 2026-11-05.

   Usage (first thing inside <body>):
     <script src="../assets/hope-intro.js"
       data-eyebrow="Unit 1 · Week 1 · Welcome"
       data-title="Welcome to HOPE"
       data-words="HEALTH|EVERYONE|LIFETIME|PERSONAL"
       data-key="hope-intro-u1w1"
       data-sub="You bring the effort. The course brings the game plan."></script>

   A heart-rate monitor draws itself, EFFORT flows in and ENERGY flows
   out, the week's words beat inside the screen, the title rises, and the
   screen dissolves in a pulse of light. Plays once per device
   (localStorage key = data-key), silent, skippable from frame one, a
   "Watch full screen" button for the Canvas iframe case, a reduced-motion
   fallback (one-second title fade), and a "Replay intro" button placed in
   [data-intro-replay] (or the page header). window.HopeIntro.replay()
   plays it again; window.HopeIntro.reset() forgets this device.

   Colors follow the page's OAO tokens (--binary-blue, --bitstream-blue,
   --gamer-green, --gold-lt, --odyssey-orange) with fallbacks, so every
   HOPE page gets the same look without a per-page style block.

   Inside an iframe (Canvas) the stage sits at the top of the frame and the
   buttons move to the top, so a tall embed still shows the whole intro;
   full screen restores the centered layout.
   ------------------------------------------------------------ */
(function(){
  var me=document.currentScript;if(!me)return;
  var EYEBROW=me.getAttribute("data-eyebrow")||"";
  var TITLE=me.getAttribute("data-title")||document.title;
  var KEY=me.getAttribute("data-key")||("hope-intro-"+location.pathname);
  var SUB=me.getAttribute("data-sub")||"You bring the effort. The course brings the game plan.";
  var WORDS=["?","MOVE","FUEL","REST","MIND","CONNECT","?"];
  if(me.getAttribute("data-words")){WORDS=["?"].concat(me.getAttribute("data-words").split("|").map(function(s){return s.trim()}).filter(Boolean)).concat(["?"])}
  function tok(name,fb){try{var v=getComputedStyle(document.body||document.documentElement).getPropertyValue(name).trim();return v||fb}catch(e){return fb}}
  var NAVY=tok("--binary-blue","#0E1C42"),SKY=tok("--bitstream-blue","#55C8E8"),GREEN=tok("--gamer-green","#76C043"),GOLD=tok("--gold-lt","#e0b65a"),ORANGE=tok("--odyssey-orange","#F78F1E"),INK="#EEF6FA";
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EMBED=(function(){try{return window.self!==window.top}catch(e){return true}})();
  var DISPLAY="'Wix Madefor Display',\"Segoe UI\",Helvetica,Arial,sans-serif",TEXT="'Wix Madefor Text',\"Segoe UI\",Helvetica,Arial,sans-serif";

  var css=''+
  '.hope-intro{position:fixed;inset:0;z-index:10000;background:'+NAVY+';color:'+INK+';font-family:'+TEXT+';overflow:hidden;display:flex;align-items:center;justify-content:center}'+
  '.hope-intro.hi-embedded{align-items:flex-start;padding-top:min(9vh,64px)}'+
  '.hope-intro:fullscreen{align-items:center;padding-top:0}'+
  '.hope-intro .hi-grid{position:absolute;inset:0;background-image:linear-gradient(color-mix(in srgb,'+SKY+' 8%,transparent) 1px,transparent 1px),linear-gradient(90deg,color-mix(in srgb,'+SKY+' 8%,transparent) 1px,transparent 1px);background-size:26px 26px;pointer-events:none;transition:opacity .4s}'+
  '.hope-intro .hi-glow{position:absolute;inset:0;background:radial-gradient(520px 320px at 50% 42%,color-mix(in srgb,'+GREEN+' 10%,transparent),transparent 70%);pointer-events:none}'+
  '.hope-intro canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}'+
  '.hope-intro .hi-stage{position:relative;width:min(92vw,760px);display:flex;flex-direction:column;align-items:center;gap:1rem;transition:opacity .45s}'+
  '.hope-intro .hi-stage.out{opacity:0}'+
  '.hope-intro svg{display:block;width:min(88vw,620px);height:auto;overflow:visible}'+
  '.hope-intro .ln{fill:none;stroke:'+SKY+';stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}'+
  '.hope-intro .screen{stroke-dasharray:1000;stroke-dashoffset:1000;transition:stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)}'+
  '.hope-intro.p1 .screen{stroke-dashoffset:0}'+
  '.hope-intro .glass{fill:'+SKY+';opacity:0;transition:opacity .6s .3s}'+
  '.hope-intro.p1 .glass{opacity:.06}'+
  '.hope-intro .gridline{stroke:'+SKY+';stroke-width:1;opacity:0;transition:opacity .6s .4s}'+
  '.hope-intro.p1 .gridline{opacity:.14}'+
  '.hope-intro .trace{fill:none;stroke:'+GREEN+';stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:700;stroke-dashoffset:700;transition:stroke-dashoffset 1.3s .35s cubic-bezier(.4,0,.2,1);filter:drop-shadow(0 0 6px color-mix(in srgb,'+GREEN+' 70%,transparent))}'+
  '.hope-intro.p1 .trace{stroke-dashoffset:0}'+
  '.hope-intro .heart{fill:'+ORANGE+';opacity:0;transform-box:fill-box;transform-origin:center;transition:opacity .4s}'+
  '.hope-intro.p2 .heart{opacity:1;animation:hi-beat 1.1s ease-in-out infinite}'+
  '@keyframes hi-beat{0%,100%{transform:scale(1)}14%{transform:scale(1.3)}28%{transform:scale(1)}42%{transform:scale(1.18)}60%{transform:scale(1)}}'+
  '.hope-intro .sweep,.hope-intro .sweep-glow{opacity:0;transition:opacity .4s}'+
  '.hope-intro.p2 .sweep{opacity:1}.hope-intro.p2 .sweep-glow{opacity:.28}'+
  '.hope-intro .arrow{opacity:0;transition:opacity .5s}'+
  '.hope-intro.p2 .arrow{opacity:1}'+
  '.hope-intro .lbl{font-family:'+DISPLAY+';font-weight:800;font-size:13px;letter-spacing:.16em;fill:'+SKY+';opacity:0;transition:opacity .5s}'+
  '.hope-intro.p2 .lbl{opacity:1}'+
  '.hope-intro .tok{font-family:'+TEXT+';font-weight:700;font-size:13px;fill:'+INK+';opacity:0}'+
  '.hope-intro.p2 .tok.in{animation:hi-in 1.1s linear infinite}'+
  '.hope-intro.p2 .tok.out{animation:hi-out 1.1s linear infinite}'+
  '.hope-intro .tok:nth-child(2){animation-delay:.37s!important}.hope-intro .tok:nth-child(3){animation-delay:.74s!important}'+
  '@keyframes hi-in{0%{transform:translateX(-140px);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(0);opacity:0}}'+
  '@keyframes hi-out{0%{transform:translateX(0);opacity:0}15%{opacity:1}85%{opacity:1}100%{transform:translateX(140px);opacity:0}}'+
  '.hope-intro .word{font-family:'+DISPLAY+';font-weight:800;letter-spacing:.08em;fill:'+GOLD+';text-anchor:middle;dominant-baseline:middle;opacity:0;transition:opacity .3s}'+
  '.hope-intro.p3 .word{opacity:1}'+
  '.hope-intro .word.pop{animation:hi-pop .28s cubic-bezier(.3,1.6,.5,1) 1;transform-box:fill-box;transform-origin:center}'+
  '@keyframes hi-pop{0%{transform:translateY(10px) scale(.7);opacity:0}100%{transform:none;opacity:1}}'+
  '.hope-intro .hi-text{text-align:center;opacity:0;transform:translateY(10px);transition:opacity .7s,transform .7s}'+
  '.hope-intro.p4 .hi-text{opacity:1;transform:none}'+
  '.hope-intro .hi-eyebrow{font-family:'+DISPLAY+';font-size:.76rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:'+SKY+';margin:0 0 .5rem}'+
  '.hope-intro h1{margin:0;font-family:'+DISPLAY+';font-size:clamp(1.7rem,4.8vw,2.8rem);font-weight:800;line-height:1.12;letter-spacing:-.02em;color:#fff;text-wrap:balance}'+
  '.hope-intro .hi-sub{margin:.65rem 0 0;font-size:1.02rem;color:#BFD6E2;opacity:0;transition:opacity .6s .5s}'+
  '.hope-intro.p4 .hi-sub{opacity:1}'+
  '.hope-intro .hi-ctl{position:absolute;left:0;right:0;bottom:1.1rem;display:flex;justify-content:space-between;gap:.6rem;padding:0 1.2rem;z-index:2;transition:opacity .3s}'+
  '.hope-intro.hi-embedded .hi-ctl{top:.9rem;bottom:auto}'+
  '.hope-intro:fullscreen .hi-ctl{top:auto;bottom:1.1rem}'+
  '.hope-intro .hi-btn{font-family:'+DISPLAY+';font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:'+SKY+';background:color-mix(in srgb,'+NAVY+' 60%,transparent);border:1px solid color-mix(in srgb,'+SKY+' 60%,transparent);border-radius:10px;padding:.55rem .9rem;cursor:pointer;backdrop-filter:blur(4px)}'+
  '.hope-intro .hi-btn:hover{background:color-mix(in srgb,'+SKY+' 15%,transparent)}'+
  '.hope-intro .hi-btn:focus-visible{outline:3px solid '+GOLD+';outline-offset:2px}'+
  '.hope-intro.hi-done{pointer-events:none}'+
  '.hi-replay{font-family:'+DISPLAY+';font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:'+SKY+';background:none;border:1px solid color-mix(in srgb,'+SKY+' 55%,transparent);border-radius:8px;padding:.35rem .65rem;cursor:pointer;white-space:nowrap}'+
  '.hi-replay:hover{background:color-mix(in srgb,'+SKY+' 14%,transparent)}'+
  '.hi-replay:focus-visible{outline:3px solid '+GOLD+';outline-offset:2px}'+
  'body.hi-lock{overflow:hidden}';
  var style=document.createElement("style");style.textContent=css;document.head.appendChild(style);

  var seen=false;try{seen=!!localStorage.getItem(KEY)}catch(e){}
  var timers=[],raf=0,raf2=0,overlay=null;

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  function svgEl(tag,attrs){var e=document.createElementNS("http://www.w3.org/2000/svg",tag);for(var k in attrs)e.setAttribute(k,attrs[k]);return e}
  function later(fn,ms){timers.push(setTimeout(fn,ms))}
  function clearAll(){timers.forEach(clearTimeout);timers=[];if(raf)cancelAnimationFrame(raf);raf=0;if(raf2)cancelAnimationFrame(raf2);raf2=0}

  function build(){
    overlay=el("div","hope-intro"+(EMBED?" hi-embedded":""));overlay.setAttribute("role","dialog");overlay.setAttribute("aria-label","Intro: "+TITLE);
    overlay.appendChild(el("div","hi-grid"));
    overlay.appendChild(el("div","hi-glow"));
    var canvas=document.createElement("canvas");overlay.appendChild(canvas);
    var stage=el("div","hi-stage");

    // 620 x 300 viewBox. The monitor screen: x 170-450, y 52-248. The trace runs along y=186 inside it.
    var svg=svgEl("svg",{viewBox:"0 0 620 300","aria-hidden":"true"});
    svg.appendChild(svgEl("rect",{"class":"glass",x:"170",y:"52",width:"280",height:"196",rx:"18"}));
    [92,132,172,212].forEach(function(y){svg.appendChild(svgEl("path",{"class":"gridline",d:"M184 "+y+" H436"}))});
    [230,290,350,410].forEach(function(x){svg.appendChild(svgEl("path",{"class":"gridline",d:"M"+x+" 66 V234"}))});
    svg.appendChild(svgEl("rect",{"class":"ln screen",x:"170",y:"52",width:"280",height:"196",rx:"18"}));
    var trace=svgEl("path",{"class":"trace",d:"M184 186 H230 L238 176 L246 186 H262 L268 196 L278 142 L288 214 L296 186 H330 L338 176 L346 186 H362 L368 196 L378 142 L388 214 L396 186 H436"});
    svg.appendChild(trace);
    // a small heart in the top-right corner of the screen, beating with the pulse
    svg.appendChild(svgEl("path",{"class":"heart",d:"M426 86 l-9.5 -9.4 c-2.6 -2.6 -2.6 -6.9 0 -9.5 c2.6 -2.6 6.9 -2.6 9.5 0 c2.6 -2.6 6.9 -2.6 9.5 0 c2.6 2.6 2.6 6.9 0 9.5 Z"}));
    // the sweep dot that travels along the trace
    var sweepGlow=svgEl("circle",{"class":"sweep-glow",cx:"184",cy:"186",r:"9",fill:"#fff"});
    var sweep=svgEl("circle",{"class":"sweep",cx:"184",cy:"186",r:"4",fill:"#fff"});
    svg.appendChild(sweepGlow);svg.appendChild(sweep);
    // EFFORT arrow and what goes in
    var gIn=svgEl("g",{"class":"arrow"});
    gIn.appendChild(svgEl("path",{"class":"ln",d:"M40 150 H160 M146 140 L160 150 L146 160"}));
    var lIn=svgEl("text",{"class":"lbl",x:"40",y:"132"});lIn.textContent="EFFORT";gIn.appendChild(lIn);
    svg.appendChild(gIn);
    var tokIn=svgEl("g",{"class":"arrow"});
    ["minutes","reps","steps"].forEach(function(t){var x=svgEl("text",{"class":"tok in",x:"150",y:"176","text-anchor":"end"});x.textContent=t;tokIn.appendChild(x)});
    svg.appendChild(tokIn);
    // ENERGY arrow and what comes out
    var gOut=svgEl("g",{"class":"arrow"});
    gOut.appendChild(svgEl("path",{"class":"ln",d:"M460 150 H580 M566 140 L580 150 L566 160"}));
    var lOut=svgEl("text",{"class":"lbl",x:"580",y:"132","text-anchor":"end"});lOut.textContent="ENERGY";gOut.appendChild(lOut);
    svg.appendChild(gOut);
    var tokOut=svgEl("g",{"class":"arrow"});
    ["energy","focus","years"].forEach(function(t){var x=svgEl("text",{"class":"tok out",x:"468",y:"176"});x.textContent=t;tokOut.appendChild(x)});
    svg.appendChild(tokOut);
    // the week's word, inside the screen above the trace
    var word=svgEl("text",{"class":"word",x:"310",y:"120","font-size":"30"});word.textContent="?";svg.appendChild(word);
    stage.appendChild(svg);

    var text=el("div","hi-text");
    if(EYEBROW)text.appendChild(el("p","hi-eyebrow",EYEBROW));
    text.appendChild(el("h1",null,TITLE));
    text.appendChild(el("p","hi-sub",SUB));
    stage.appendChild(text);
    overlay.appendChild(stage);

    var ctl=el("div","hi-ctl");
    var fs=el("button","hi-btn","Watch full screen");fs.type="button";
    fs.addEventListener("click",function(){
      var r=overlay.requestFullscreen||overlay.webkitRequestFullscreen;
      if(r){try{var p=r.call(overlay);if(p&&p.catch)p.catch(function(){})}catch(e){}}
    });
    var skip=el("button","hi-btn","Skip intro");skip.type="button";
    skip.addEventListener("click",function(){finish(true)});
    ctl.appendChild(fs);ctl.appendChild(skip);overlay.appendChild(ctl);
    if(!document.fullscreenEnabled&&!document.webkitFullscreenEnabled)fs.hidden=true;

    document.body.appendChild(overlay);document.body.classList.add("hi-lock");
    skip.focus({preventScroll:true});
    return {canvas:canvas,stage:stage,word:word,trace:trace,sweep:sweep,sweepGlow:sweepGlow};
  }

  function play(){
    clearAll();
    if(overlay&&overlay.parentNode)overlay.parentNode.removeChild(overlay);
    var parts=build(),ov=overlay;
    function phase(p,ms){later(function(){ov.classList.add(p)},ms)}
    if(reduce){
      ov.classList.add("p1","p2","p4");
      later(function(){finish(false)},1600);
      return;
    }
    requestAnimationFrame(function(){requestAnimationFrame(function(){ov.classList.add("p1")})});
    phase("p2",900);
    later(function(){sweepAlong(parts)},900);
    phase("p3",1700);
    var i=0;
    function nextWord(){
      if(i>=WORDS.length)return;
      fitWord(parts.word,WORDS[i]);
      parts.word.classList.remove("pop");void parts.word.getBBox();parts.word.classList.add("pop");
      i++;later(nextWord,i===WORDS.length-1?560:(i===1?520:360));
    }
    later(nextWord,1700);
    var wordsEnd=1700+WORDS.length*380;
    phase("p4",wordsEnd+400);
    later(function(){dissolve(parts)},wordsEnd+2300);
  }

  // The sweep dot rides the trace while the monitor is live.
  function sweepAlong(parts){
    var path=parts.trace,L=0;try{L=path.getTotalLength()}catch(e){return}
    var t0=null;
    function f(ts){
      if(!overlay)return;
      if(t0===null)t0=ts;
      var p=((ts-t0)%1500)/1500;
      var pt=path.getPointAtLength(p*L);
      parts.sweep.setAttribute("cx",pt.x);parts.sweep.setAttribute("cy",pt.y);
      parts.sweepGlow.setAttribute("cx",pt.x);parts.sweepGlow.setAttribute("cy",pt.y);
      raf2=requestAnimationFrame(f);
    }
    raf2=requestAnimationFrame(f);
  }

  // Keep the word inside the screen (about 230 units wide at y 120).
  function fitWord(node,text){
    var MAX=230,size=30;
    node.textContent=text;
    node.setAttribute("font-size",size);
    try{
      var w=node.getComputedTextLength();
      while(w>MAX&&size>11){size-=1;node.setAttribute("font-size",size);w=node.getComputedTextLength()}
    }catch(e){}
  }

  function dissolve(parts){
    var ov=overlay;if(!ov)return;
    var cv=parts.canvas,ctx=cv.getContext("2d");
    var W=cv.width=ov.clientWidth,H=cv.height=ov.clientHeight;
    // The pulse starts from the middle of the stage (not the middle of a tall iframe).
    var cx=W/2,cy=H/2;
    try{var sr=parts.stage.getBoundingClientRect(),orr=ov.getBoundingClientRect();cx=sr.left-orr.left+sr.width/2;cy=sr.top-orr.top+sr.height*0.42}catch(e){}
    var cell=Math.max(10,Math.round(Math.min(W,Math.min(H,900))/36));
    var cols=Math.ceil(W/cell),rows=Math.ceil(H/cell);
    var maxd=Math.max(Math.hypot(cx,cy),Math.hypot(W-cx,cy),Math.hypot(cx,H-cy),Math.hypot(W-cx,H-cy));
    var t0=null,DUR=1300,order=[];
    for(var r=0;r<rows;r++)for(var c=0;c<cols;c++){
      var d=Math.hypot(c*cell+cell/2-cx,r*cell+cell/2-cy)/maxd;
      order.push({c:c,r:r,t:d*0.75+Math.random()*0.25});
    }
    var cols3=[GREEN,GOLD,SKY,ORANGE,"#ffffff"];
    var sparks=[];for(var k=0;k<120;k++){var a=Math.random()*Math.PI*2,sp=1.4+Math.random()*3.4;sparks.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:2+Math.random()*4,a:1,c:cols3[k%5]})}
    parts.stage.classList.add("out");
    ov.style.background="transparent";ov.querySelector(".hi-grid").style.opacity="0";ov.querySelector(".hi-glow").style.opacity="0";
    var ctl=ov.querySelector(".hi-ctl");if(ctl)ctl.style.opacity="0";
    function frame(ts){
      if(t0===null)t0=ts;var p=(ts-t0)/DUR;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=NAVY;
      for(var i=0;i<order.length;i++){var o=order[i];if(o.t>p)ctx.fillRect(o.c*cell,o.r*cell,cell+1,cell+1)}
      // one expanding pulse ring
      ctx.globalAlpha=Math.max(0,.55-p*.5);ctx.strokeStyle=GREEN;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(cx,cy,p*maxd*1.1,0,Math.PI*2);ctx.stroke();
      for(var j=0;j<sparks.length;j++){var s=sparks[j];s.vx*=1.012;s.vy*=1.012;s.x+=s.vx;s.y+=s.vy;s.a-=0.011;
        if(s.a>0){ctx.globalAlpha=Math.max(0,s.a);ctx.fillStyle=s.c;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}}
      ctx.globalAlpha=1;
      if(p<1.15)raf=requestAnimationFrame(frame);else finish(false);
    }
    raf=requestAnimationFrame(frame);
  }

  function finish(skipped){
    clearAll();
    if(!overlay)return;
    var ov=overlay;overlay=null;
    try{localStorage.setItem(KEY,"1")}catch(e){}
    if(document.fullscreenElement===ov&&document.exitFullscreen){try{document.exitFullscreen()}catch(e){}}
    if(skipped){ov.style.transition="opacity .35s";ov.style.opacity="0";ov.classList.add("hi-done")}
    document.body.classList.remove("hi-lock");
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov)},skipped?380:0);
  }

  function addReplay(){
    var slot=document.querySelector("[data-intro-replay]")||document.querySelector("header.oao-header")||document.querySelector("header");
    if(!slot||slot.querySelector(".hi-replay"))return;
    var b=el("button","hi-replay","▸ Replay intro");b.type="button";
    b.addEventListener("click",function(){window.scrollTo(0,0);play()});
    slot.appendChild(b);
  }

  window.HopeIntro={replay:function(){play()},reset:function(){try{localStorage.removeItem(KEY)}catch(e){}}};

  if(document.body&&!seen)play();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",addReplay);else addReplay();
})();
