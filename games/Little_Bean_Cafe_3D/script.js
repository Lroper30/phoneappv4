import * as THREE from 'three';

// LITTLE BEAN CAFE — first-person café owner simulator
// Built for VS Code. Run with Live Server (Three.js loads as an ES module).

const $ = id => document.getElementById(id);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

const ui = {
  title: $('titleScreen'), pause: $('pauseScreen'), hud: $('hud'),
  crosshair: $('crosshair'), hint: $('interactionHint'), hintText: $('hintText'),
  message: $('message'), orders: $('orderPanel'), tasks: $('taskPanel'),
  bottom: $('bottomBar'), tip: $('tipText'), station: $('stationModal'),
  shop: $('shopModal'), cook: $('cookModal'), endDay: $('endDayModal')
};

const renderer = new THREE.WebGLRenderer({ canvas: $('world'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bb4b4);
scene.fog = new THREE.Fog(0x9bb4b4, 34, 105);

const camera = new THREE.PerspectiveCamera(76, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.68, 8.2);
const player = { x: 0, z: 8.2, yaw: 0, pitch: -0.02, speed: 5.0, radius: 0.32, moving: false }; // Slightly faster base movement for smoother café navigation.
scene.add(camera);

const hemi = new THREE.HemisphereLight(0xfff2d7, 0x56634c, 2.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe5bb, 2.4);
sun.position.set(-7, 12, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
scene.add(sun);

const mats = {};
function mat(name, color, roughness=0.82, metalness=0) {
  if (!mats[name]) mats[name] = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return mats[name];
}
const M = {
  wall: mat('wall',0xe8d9bf), sage: mat('sage',0x879c7d), darkGreen: mat('darkGreen',0x2c493a),
  wood: mat('wood',0x8c5b3c), woodLight: mat('woodLight',0xc18a59), floor: mat('floor',0xb48a62),
  cream: mat('cream',0xfff3df), black: mat('black',0x262b27), metal: mat('metal',0x858d89,.3,.65),
  glass: new THREE.MeshStandardMaterial({color:0x9ac8cf,roughness:.15,metalness:.12,transparent:true,opacity:.38}),
  coffee: mat('coffee',0x3e2418), leaf: mat('leaf',0x3e7750), red: mat('red',0xb95c48),
  gold: mat('gold',0xd9b16d,.35,.3), tile: mat('tile',0xd9cdb8), white: mat('white',0xf6f2e8),
  blue: mat('blue',0x6c8eaa), skin: mat('skin',0xc58e69), skin2: mat('skin2',0x8f5d43),
  pink: mat('pink',0xdba0a2), yellow: mat('yellow',0xe5bd63), concrete: mat('concrete',0xb8b6a9)
};

const colliders = [];
const interactables = [];
const customers = [];
const occupiedCafeSeats = new Set();
const cafeSeatSpots = [
  {x:-7,z:-1.3,yaw:Math.PI/2},{x:-5,z:-1.3,yaw:-Math.PI/2},{x:-6,z:-2.45,yaw:0},
  {x:-1.05,z:-.1,yaw:Math.PI/2},{x:1.05,z:-.1,yaw:-Math.PI/2},{x:0,z:1.05,yaw:0},
  {x:5,z:-1.2,yaw:Math.PI/2},{x:7,z:-1.2,yaw:-Math.PI/2},{x:6,z:-2.3,yaw:0},
  {x:-7,z:4,yaw:Math.PI/2},{x:-5,z:4,yaw:-Math.PI/2},{x:-6,z:5.1,yaw:0},
  {x:-1.1,z:5,yaw:Math.PI/2},{x:1.1,z:5,yaw:-Math.PI/2},
  {x:5,z:4,yaw:Math.PI/2},{x:7,z:4,yaw:-Math.PI/2}
];
const decorative = [];
const world = new THREE.Group();
scene.add(world);

function box(parent, name, x,y,z, sx,sy,sz, material, options={}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz), material);
  mesh.name = name || '';
  mesh.position.set(x,y,z);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  parent.add(mesh);
  if (options.collider) colliders.push({x,z,hx:sx/2,hz:sz/2, top:y+sy/2, bottom:y-sy/2, mesh});
  return mesh;
}
function cyl(parent, name, x,y,z, radiusTop,radiusBottom,height, material, segments=16) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop,radiusBottom,height,segments),material);
  mesh.name=name||''; mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function sphere(parent,name,x,y,z,radius,material,segments=16) {
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,segments,12),material);
  mesh.name=name||'';mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh;
}
function addInteractable(name, label, x,z, radius, action) {
  const obj={name,label,x,z,radius,action,mesh:null};
  interactables.push(obj); return obj;
}

// Environment shell
box(world,'floor',0,-.16,0,22,.3,24,M.floor);
for (let x=-10.5;x<=10.5;x+=1.5) {
  for (let z=-11.5;z<=11.5;z+=1.5) {
    const tile = new THREE.Mesh(new THREE.BoxGeometry(1.46,.012,1.46), ((Math.round(x+z)%2)===0?M.tile:M.floor));
    tile.position.set(x,-.002,z); tile.receiveShadow=true; world.add(tile);
  }
}
// Rear wall is assembled below from solid sections and framed window openings.
// The side walls are fully continuous structurally, with framed glazing built into two genuine openings each.
for(const side of [-1,1]){
  const sideName=side<0?'left wall':'right wall';
  const wx=side*11;
  const windowCenters=[-6.4,2.4], windowWidth=2.65;
  const ranges=[[-12,windowCenters[0]-windowWidth/2],
    [windowCenters[0]+windowWidth/2,windowCenters[1]-windowWidth/2],
    [windowCenters[1]+windowWidth/2,12]];
  for(const [a,b] of ranges){
    if(b-a>.15)box(world,sideName+' solid section',(wx),2,(a+b)/2,.35,4,b-a,M.wall,{collider:true});
  }
  for(const wz of windowCenters){
    box(world,sideName+' lower window wall',wx,.49,wz,.35,.98,windowWidth,M.wall,{collider:true});
    box(world,sideName+' upper window wall',wx,3.4,wz,.35,1.2,windowWidth,M.wall,{collider:true});
    box(world,'side elevation glass window',wx,1.9,wz,.055,1.78,windowWidth-.08,M.glass,{castShadow:false});
    for(const dz of [-windowWidth/2-.035,windowWidth/2+.035])
      box(world,'side elevation window vertical frame',wx-side*.035,1.9,wz+dz,.14,1.98,.11,M.woodLight,{castShadow:false});
    for(const wy of [.91,2.89])
      box(world,'side elevation window horizontal frame',wx-side*.035,wy,wz,.14,.11,windowWidth+.18,M.woodLight,{castShadow:false});
    box(world,'side elevation window center mullion',wx-side*.06,1.9,wz,.14,1.8,.07,M.woodLight,{castShadow:false});
    box(world,'side elevation exterior window sill',wx+side*.11,.91,wz,.22,.12,windowWidth+.18,M.wood,{castShadow:false});
  }
}
// Rear elevation has its own pair of framed windows, so the cafe reads as a finished building from every side.
const rearWindowCenters=[-6.3,6.3], rearWindowWidth=2.8;
for(const [a,b] of [[-11,-7.7],[-4.9,4.9],[7.7,11]]){
  box(world,'back wall solid section',(a+b)/2,2,-12,b-a,4,.35,M.wall,{collider:true});
}
for(const wx of rearWindowCenters){
  box(world,'back wall lower window section',wx,.49,-12,rearWindowWidth,.98,.35,M.wall,{collider:true});
  box(world,'back wall upper window section',wx,3.4,-12,rearWindowWidth,1.2,.35,M.wall,{collider:true});
  box(world,'rear elevation cafe window glass',wx,1.9,-12,rearWindowWidth-.08,1.78,.055,M.glass,{castShadow:false});
  for(const dx of [-rearWindowWidth/2-.035,rearWindowWidth/2+.035])
    box(world,'rear elevation cafe window vertical frame',wx+dx,1.9,-11.96,.11,1.98,.14,M.woodLight,{castShadow:false});
  for(const wy of [.91,2.89])
    box(world,'rear elevation cafe window horizontal frame',wx,wy,-11.96,rearWindowWidth+.18,.11,.14,M.woodLight,{castShadow:false});
  box(world,'rear elevation cafe window mullion',wx,1.9,-11.94,.075,1.8,.15,M.woodLight,{castShadow:false});
  box(world,'rear elevation cafe window sill',wx,.91,-12.03,rearWindowWidth+.2,.12,.26,M.wood,{castShadow:false});
}
// Proper enclosed storefront shell: real wall sections surround the doorway and front windows.
// Every window is an actual opening in the wall, not glass pasted over an opaque panel.
box(world,'solid front facade left outer pier',-6.9,1.7,12,1.6,3.4,.38,M.wall,{collider:true});
box(world,'solid front facade left inner pier',-2.02,1.7,12,2.04,3.4,.38,M.wall,{collider:true});
box(world,'solid front facade right inner pier',2.02,1.7,12,2.04,3.4,.38,M.wall,{collider:true});
box(world,'solid front facade right outer pier',6.9,1.7,12,1.6,3.4,.38,M.wall,{collider:true});
for(const wx of [-4.5,4.5]){
  box(world,'solid front facade window sill wall',wx,.49,12,3,.98,.38,M.wall,{collider:true});
  box(world,'solid front facade window head wall',wx,3.08,12,3,.64,.38,M.wall,{collider:true});
  // Double glazed-looking panes with warm wood frames and crossbars.
  box(world,'front shop window glass',wx,1.9,12,2.82,1.78,.055,M.glass,{castShadow:false});
  for(const dx of [-1.53,1.53])box(world,'front shop window frame',wx+dx,1.9,11.96,.105,1.98,.14,M.woodLight,{castShadow:false});
  for(const wy of [.91,2.89])box(world,'front shop window horizontal frame',wx,wy,11.96,3.16,.11,.14,M.woodLight,{castShadow:false});
  box(world,'front shop window center mullion',wx,1.9,11.94,.075,1.8,.15,M.woodLight,{castShadow:false});
  box(world,'front shop window sill',wx,.91,12.03,3.18,.12,.26,M.wood,{castShadow:false});
  // Interior curtain panels add depth when viewed from inside the cafe.
  for(const side of [-1,1]){
    const curtain=box(world,'front window curtain',wx+side*1.31,1.95,11.78,.18,1.72,.08,M.cream,{castShadow:false});
    curtain.material=mat('windowCurtain'+side,0xe8d6bb);
  }
}
box(world,'front header',0,3.45,12,1.9,.4,.38,M.wall);
box(world,'front facade left corner return',-9.5,1.7,12,3,3.4,.38,M.wall,{collider:true});
box(world,'front facade right corner return',9.5,1.7,12,3,3.4,.38,M.wall,{collider:true});
// Full-height, clearly framed entry: sidelights, jambs, glass transom, panel rails and metal hardware.
box(world,'entry left jamb',-.86,1.58,11.72,.18,3.16,.32,M.wood);
box(world,'entry right jamb',.86,1.58,11.72,.18,3.16,.32,M.wood);
box(world,'entry top frame',0,3.12,11.72,1.9,.2,.34,M.wood);
box(world,'entry threshold',0,.08,12.02,1.72,.12,.48,M.woodLight);
for(const sx of [-1.78,1.78]){
  box(world,'entry glass sidelight',sx,1.7,11.82,1.58,2.55,.08,M.glass);
  box(world,'sidelight outer trim',sx+(sx<0?-.82:.82),1.7,11.72,.09,2.72,.12,M.woodLight);
  box(world,'sidelight bottom trim',sx,.36,11.69,1.64,.12,.15,M.woodLight);
  box(world,'sidelight top trim',sx,3.03,11.69,1.64,.12,.15,M.woodLight);
  box(world,'sidelight mid rail',sx,1.25,11.68,1.55,.06,.1,M.woodLight);
}
box(world,'entry transom glass',0,3.43,11.8,1.55,.38,.06,M.glass);
box(world,'entry transom divider',0,3.43,11.68,.07,.4,.08,M.woodLight);
const doorPivot=new THREE.Group();doorPivot.position.set(-.75,0,11.78);world.add(doorPivot);
box(doorPivot,'front door',.75,1.55,0,1.5,3.1,.16,M.woodLight);
box(doorPivot,'door glass',.75,1.88,-.105,1.16,1.86,.07,M.glass);
box(doorPivot,'door lower inset panel',.75,.62,-.11,1.12,.68,.07,M.wood);
box(doorPivot,'door upper rail',.75,2.88,-.13,1.35,.1,.08,M.wood);
box(doorPivot,'door lower rail',.75,1.02,-.13,1.35,.1,.08,M.wood);
box(doorPivot,'door left stile',.19,1.9,-.13,.1,1.9,.08,M.wood);
box(doorPivot,'door right stile',1.31,1.9,-.13,.1,1.9,.08,M.wood);
box(doorPivot,'door glass crossbar',.75,2.05,-.15,1.12,.07,.08,M.woodLight);
box(doorPivot,'door bottom kick plate',.75,.22,-.13,1.25,.12,.08,M.metal);
for(const hy of [.45,1.55,2.55])box(doorPivot,'door hinge',.12,hy,.105,.12,.22,.1,M.metal);
// Matching lever hardware on both faces so the door is usable from either side.
cyl(doorPivot,'door handle spindle',1.22,1.18,0,.045,.045,.34,M.metal,12);
sphere(doorPivot,'inside door knob',1.22,1.18,-.23,.075,M.gold,16);
sphere(doorPivot,'outside door knob',1.22,1.18,.23,.075,M.gold,16);
box(doorPivot,'inside door push plate',1.22,.95,-.19,.12,.32,.035,M.metal);
box(doorPivot,'outside door push plate',1.22,.95,.19,.12,.32,.035,M.metal);
let doorOpen=0,doorTarget=0,doorChimeCooldown=0;

// Exterior visible through front windows. Layered paving gives the entrance a finished storefront feel.
const outsideGround = box(world,'continuous city foundation',0,-.34,68,160,.22,112,mat('cityGround',0x9d9e91));
box(world,'outside pavement',0,-.12,15,160,.24,8,M.concrete);
box(world,'extended outdoor plaza',0,-.12,25,160,.24,20,M.concrete);
box(world,'front walkway',0,-.055,20.5,4.2,.11,13,M.tile);
// Decorative storefront canopy, warm lights, and a readable street-facing sign.
box(world,'front canopy frame',0,3.02,12.72,12.2,.18,1.45,M.wood);
box(world,'canopy underside',0,2.91,12.72,11.9,.08,1.35,M.cream);
for(let i=0;i<12;i++){
  const x=-5.5+i;
  box(world,'awning stripe',x,3.12,12.72,.48,.08,1.28,i%2===0?M.red:M.cream,{castShadow:false});
}
for(const x of [-5.6,5.6]){
  box(world,'awning support',x,2.45,12.96,.12,1.05,.12,M.black);
  sphere(world,'storefront wall light',x,2.65,12.25,.13,M.yellow,12);
}
box(world,'exterior cafe sign backing',0,3.48,12.34,8.2,.82,.2,M.darkGreen);
const outsideSignCanvas=document.createElement('canvas');outsideSignCanvas.width=800;outsideSignCanvas.height=150;
const outsideCtx=outsideSignCanvas.getContext('2d');
outsideCtx.fillStyle='#2c493a';outsideCtx.fillRect(0,0,800,150);
outsideCtx.fillStyle='#f5d79e';outsideCtx.font='bold 66px Georgia';outsideCtx.textAlign='center';outsideCtx.fillText('LITTLE BEAN CAFE',400,93);
const outsideSignTexture=new THREE.CanvasTexture(outsideSignCanvas);outsideSignTexture.colorSpace=THREE.SRGBColorSpace;
const outsideSignFace=new THREE.Mesh(new THREE.PlaneGeometry(7.9,.68),new THREE.MeshBasicMaterial({map:outsideSignTexture}));
outsideSignFace.position.set(0,3.48,12.455);world.add(outsideSignFace);
for(const y of [3.07,3.89])box(world,'front sign gold frame',0,y,12.46,8.25,.055,.07,M.gold,{castShadow:false});
for(const x of [-4.1,4.1])box(world,'front sign gold side frame',x,3.48,12.46,.055,.86,.07,M.gold,{castShadow:false});
let storeName='Little Bean Café';
let rearSignCanvas=null, rearSignCtx=null, rearSignTexture=null, rearSignFace=null;
function drawStoreName(){
  const clean=(storeName||'My Café').trim().slice(0,28)||'My Café';
  outsideCtx.clearRect(0,0,800,150);outsideCtx.fillStyle='#2c493a';outsideCtx.fillRect(0,0,800,150);
  outsideCtx.fillStyle='#f5d79e';outsideCtx.font='bold 58px Georgia';outsideCtx.textAlign='center';outsideCtx.textBaseline='middle';
  let display=clean.toUpperCase();if(display.length>17)outsideCtx.font='bold 42px Georgia';outsideCtx.fillText(display,400,75,750);outsideSignTexture.needsUpdate=true;
  if(typeof signCanvas!=='undefined'&&typeof signTexture!=='undefined'){
    const c=signCanvas.getContext('2d');c.clearRect(0,0,512,180);c.fillStyle='#262b27';c.fillRect(0,0,512,180);
    c.fillStyle='#e7c78f';c.font='bold 29px Georgia';c.textAlign='center';c.fillText(clean.toUpperCase(),256,53,485);
    c.fillStyle='#f5ead8';c.font='22px Arial';c.fillText('COFFEE  •  TEA  •  PASTRIES',256,96);
    c.font='17px Arial';c.fillText('GOOD DAYS START HERE',256,139);signTexture.needsUpdate=true;
  }
  const hud=$('storeNameHud');if(hud)hud.textContent=clean;
  const title=$('titleStoreName');if(title){title.textContent=clean;}
  if(rearSignCtx&&rearSignTexture){
    rearSignCtx.clearRect(0,0,600,100);rearSignCtx.fillStyle='#2c493a';rearSignCtx.fillRect(0,0,600,100);
    rearSignCtx.fillStyle='#f5d79e';rearSignCtx.font='bold 38px Georgia';rearSignCtx.textAlign='center';rearSignCtx.textBaseline='middle';
    rearSignCtx.fillText(clean.toUpperCase(),300,50,570);rearSignTexture.needsUpdate=true;
  }
}

// Subtle wall pilasters and base trim visually tie the entrance into the painted facade.
for(const x of [-7.7,-1.02,1.02,7.7]){
  box(world,'painted facade pilaster',x,1.68,11.77,.12,3.25,.12,M.woodLight,{castShadow:false});
}
box(world,'front wall base trim',0,.18,11.77,21.7,.18,.14,M.woodLight,{castShadow:false});
box(world,'welcome mat',-.75,.012,13.65,1.8,.035,.85,mat('welcomeMat',0x394b42),{castShadow:false});
for(const x of [-8.7,8.7]){
  box(world,'storefront corner trim',x,1.7,12.02,.22,3.3,.28,M.woodLight);
}

box(world,'street curb',0,.08,34,22,.16,1.1,M.black);
box(world,'street asphalt',0,-.12,38,22,.24,7,mat('asphalt',0x555b59));
for(let x=-9;x<=9;x+=3) box(world,'road marking',x,-.005,38,.95,.02,.12,M.cream,{castShadow:false});
// Patio furniture and landscaping sit on the same ground plane as the outdoor path.
for(const [tx,tz] of [[-5,17],[5,17],[-5,23],[5,23]]){
  const patioTable=new THREE.Group();patioTable.position.set(tx,0,tz);world.add(patioTable);
  cyl(patioTable,'patio table top',0,.78,0,.72,.72,.12,M.woodLight,28);
  cyl(patioTable,'patio table stem',0,.4,0,.12,.15,.65,M.black,16);
  cyl(patioTable,'patio table base',0,.08,0,.4,.4,.12,M.black,20);
  for(const [cx,cz,rot] of [[-1.05,0,Math.PI/2],[1.05,0,-Math.PI/2]]){
    const seat=new THREE.Group();seat.position.set(tx+cx,0,tz+cz);seat.rotation.y=rot;world.add(seat);
    box(seat,'patio chair seat',0,.46,0,.62,.12,.62,M.wood);
    box(seat,'patio chair back',0,.83,-.25,.62,.65,.1,M.wood);
    for(const dx of [-.23,.23])for(const dz of [-.22,.22])box(seat,'patio chair leg',dx,.22,dz,.07,.44,.07,M.black);
  }
  colliders.push({x:tx,z:tz,hx:.76,hz:.76,top:1,bottom:0});
  for(const [cx,cz] of [[tx-1.05,tz],[tx+1.05,tz]])colliders.push({x:cx,z:cz,hx:.31,hz:.31,top:1,bottom:0});
}
// Trees, low hedges, and planters frame the plaza without blocking the central route.
for(const [tx,tz] of [[-9,19],[-9,27],[9,19],[9,27]]){
  cyl(world,'outdoor tree trunk',tx,.95,tz,.24,.3,1.9,M.wood,12);
  sphere(world,'outdoor tree canopy',tx,2.35,tz,1.05,M.leaf,16);
  sphere(world,'outdoor tree canopy',tx-.55,2.05,tz+.15,.72,M.darkGreen,14);
  sphere(world,'outdoor tree canopy',tx+.52,2.1,tz-.12,.74,M.leaf,14);
  colliders.push({x:tx,z:tz,hx:.38,hz:.38,top:2,bottom:0});
}
box(world,'sidewalk planter left',-7.6,.18,23,1.1,.36,7,M.wood);
box(world,'sidewalk planter right',7.6,.18,23,1.1,.36,7,M.wood);
for(const x of [-7.6,7.6]){
  for(let z=20;z<=26;z+=1.5){sphere(world,'patio hedge',x,.62,z,.48,M.leaf,12);}
  colliders.push({x,z:23,hx:.58,hz:3.6,top:1.2,bottom:0});
}

for (let i=0;i<7;i++) {
  const tx=-9+i*3;
  box(world,'outside planter',tx,.05,17.6,1.7,.35,.7,M.wood);
  cyl(world,'plant pot',tx,.28,17.6,.48,.56,.55,mat('pot'+i,0x9e6c4d));
  for(let j=0;j<4;j++){
    const leaf=sphere(world,'outside bush',tx+(Math.random()-.5)*.5,.62+Math.random()*.25,17.6+(Math.random()-.5)*.4,.32,M.leaf);
    leaf.scale.set(1,1.4,1);
  }
}
// OWNER-BUILT FRONT PARK: landscaped green space fills the plaza between the café and street.
// A clear central path leads from the café entrance through the park to the road.
box(world,'front park lawn left',-6.05,.018,27.1,7.7,.075,8.8,mat('frontParkGrassL',0x78936a));
box(world,'front park lawn right',6.05,.018,27.1,7.7,.075,8.8,mat('frontParkGrassR',0x78936a));
box(world,'front park central stone path',0,.065,27.1,3.2,.055,8.9,mat('frontParkPath',0xcfc7b5));
for(const side of [-1,1]){
  // Low planted borders and flower clusters make the park feel designed rather than empty.
  box(world,'front park planter border',side*10.25,.19,27.1,.38,.34,9.1,M.wood);
  for(let i=0;i<7;i++){
    const z=23.5+i*1.15;
    cyl(world,'front park flower pot',side*(8.95+(i%2)*.35),.19,z,.24,.28,.32,mat('parkPot'+side+i,0x9d7053),12);
    for(let j=0;j<4;j++)sphere(world,'front park flower',side*(8.95+(i%2)*.35)+(Math.random()-.5)*.25,.43,z+(Math.random()-.5)*.25,.13,[M.pink,M.yellow,M.red,M.white][(i+j)%4],10);
  }
  for(const z of [24.3,29.7]){
    cyl(world,'front park tree trunk',side*8.1,1.05,z,.19,.23,2.1,M.wood,12);
    sphere(world,'front park tree canopy',side*8.1,2.45,z,.9,M.leaf,14);
    sphere(world,'front park tree canopy highlight',side*8.45,2.55,z+.12,.55,mat('parkLeafLight'+side+z,0x5f8a59),12);
    colliders.push({x:side*8.1,z,hx:.35,hz:.35,top:2.8,bottom:0});
  }
  box(world,'front park bench seat',side*5.7,.55,26.7,1.7,.14,.48,M.wood,{collider:true});
  box(world,'front park bench back',side*5.7,.95,26.48,1.7,.68,.12,M.wood,{collider:true});
  for(const lx of [-.62,.62])for(const lz of [-.14,.14])box(world,'front park bench leg',side*5.7+lx,.27,26.7+lz,.1,.54,.1,M.black,{collider:true});
}
for(const x of [-1.25,1.25]){
  box(world,'park path lamp post',x,.95,30.8,.09,1.9,.09,M.black);
  sphere(world,'park path lamp globe',x,1.95,30.8,.2,M.yellow,12);
}

// WALKABLE MINI-CITY: broad streets, sidewalks, shopfronts, apartments, parks and street furniture.
// The café opens directly onto the plaza; the player can keep walking through the whole district.
const cityGroundMat=mat('cityGround',0x9d9e91), asphaltMat=mat('cityAsphalt',0x41494b), sidewalkMat=mat('citySidewalk',0xc7c4b8);
box(world,'city ground',0,-.22,30,160,.18,180,cityGroundMat);
// Main road continues from the café and intersects two cross streets.
box(world,'main city road',0,-.105,77,112,.16,9,asphaltMat);
for(let x=-54;x<=54;x+=3){box(world,'main road dashed line',x,-.015,77,1.35,.025,.13,M.cream,{castShadow:false});}
for(const rx of [-42,-28,-14,14,28,42]){
  box(world,'cross street',rx,-.1,78,7,.18,78,asphaltMat);
  for(let z=43;z<=112;z+=3) box(world,'cross street dash',rx,-.005,z,.13,.025,1.25,M.cream,{castShadow:false});
  // Raised sidewalks line each cross street.
  box(world,'cross street sidewalk',rx-4.1,.02,78,1.1,.22,78,sidewalkMat);
  box(world,'cross street sidewalk',rx+4.1,.02,78,1.1,.22,78,sidewalkMat);
  // Crosswalk stripes near the main intersection.
  for(let k=-3;k<=3;k++){
    // Zebra crossing across the main avenue, centered on the actual intersection.
    box(world,'crosswalk stripe',rx+k*.72,.005,77,.42,.025,6.2,M.cream,{castShadow:false});
    // Matching crossings across the side street on both sides of the avenue.
    box(world,'side street crosswalk north',rx+k*.72,.006,72.8,.42,.025,.55,M.cream,{castShadow:false});
    box(world,'side street crosswalk south',rx+k*.72,.006,81.2,.42,.025,.55,M.cream,{castShadow:false});
  }
}
// Sidewalks and curbs on both sides of the main road.
for(const side of [-1,1]){
  box(world,'long city sidewalk',0,.015,77+side*5.35,112,.22,1.6,sidewalkMat);
  box(world,'long curb',0,.08,77+side*4.45,112,.18,.22,M.concrete);
}
// City blocks between intersections. Each building has a grounded footprint, visible windows and a collision body.
const buildingColors=[0xc8b9a5,0xaebfb7,0xd6c7b3,0xb7aaa6,0xd7c9a5,0x9fb1bd,0xd1b5a3,0xb6bca2,0xb7a4a0,0xc7b6a0];
const trimColors=[0xf1e7d5,0xd9c7a8,0xeee2cf,0xb6c4c1];
let buildingIndex=0;
for(const bx of [-49,-35,-21,-7,7,21,35,49]){
  for(const bz of [53,65,87,99,111]){
    if(Math.abs(bx)<11 && bz<66) continue;
    const width=(buildingIndex%5===0?6.9:buildingIndex%3===0?5.9:4.9+(buildingIndex%2)*.35);
    const depth=(buildingIndex%4===0?8.6:7.2+(buildingIndex%2)*.65);
    const floors=buildingIndex%6===0?10:buildingIndex%5===0?8:4+(buildingIndex%5);
    const height=floors*2.65;
    const frontZ=bz-depth/2, backZ=bz+depth/2, wallMat=mat('cityBuilding'+buildingIndex,buildingColors[buildingIndex%buildingColors.length]);
    const trim=mat('cityTrim'+buildingIndex,trimColors[buildingIndex%trimColors.length]);
    // Main grounded shell plus a distinct roof silhouette for each block.
    box(world,'city building',bx,height/2,bz,width,height,depth,wallMat,{collider:true,castShadow:false});
    const variant=buildingIndex%5;
    if(variant===0){box(world,'stepped roof crown',bx,height+.48,bz,width*.72,.96,depth*.72,wallMat,{castShadow:false});}
    else if(variant===1){box(world,'corner roof tower',bx+width*.24,height+.68,bz-depth*.18,width*.32,1.36,depth*.34,wallMat,{castShadow:false});}
    else if(variant===2){box(world,'mansard roof band',bx,height+.18,bz,width+.38,.36,depth+.38,trim,{castShadow:false});}
    else if(variant===3){cyl(world,'round rooftop turret',bx-width*.22,height+.42,bz,.82,.95,.84,wallMat,12);}
    else {box(world,'roof penthouse',bx-width*.16,height+.48,bz+depth*.08,width*.42,.96,depth*.48,wallMat,{castShadow:false});}
    box(world,'building roof ledge',bx,height+.12,bz,width+.2,.22,depth+.2,trim,{castShadow:false});
    // Storefront faces the street, with a recessed-looking entry and sign.
    box(world,'shopfront glass',bx,1.42,frontZ-.055,width*.56,2.12,.08,M.glass,{castShadow:false});
    box(world,'shopfront door',bx+width*.31,1.08,frontZ-.12,.82,2.05,.12,M.woodLight,{castShadow:false});
    box(world,'shop sign',bx,2.72,frontZ-.12,width*.68,.46,.1,[M.gold,M.sage,M.red,M.blue][buildingIndex%4],{castShadow:false});
    box(world,'storefront sign canopy',bx,2.25,frontZ-.25,width*.72,.12,.5,[M.red,M.darkGreen,M.blue,M.wood][buildingIndex%4],{castShadow:false});
    for(const dx of [-width*.38,width*.38])box(world,'storefront pilaster',bx+dx,1.28,frontZ-.15,.14,2.55,.18,trim,{castShadow:false});
    // Repeated windows and sills on all four elevations, so buildings remain detailed when viewed from behind or from the side.
    for(let floor=1;floor<floors;floor++){
      const wy=1.05+floor*2.65;
      for(const wx of [-.31,0,.31]){
        const ww=width*.145;
        box(world,'front apartment window',bx+wx*width,wy,frontZ-.06,ww,1.12,.09,M.blue,{castShadow:false});
        box(world,'front window sill',bx+wx*width,wy-.61,frontZ-.105,ww+.12,.09,.12,trim,{castShadow:false});
        box(world,'rear apartment window',bx+wx*width,wy,backZ+.06,ww,1.12,.09,M.blue,{castShadow:false});
        box(world,'rear window sill',bx+wx*width,wy-.61,backZ+.105,ww+.12,.09,.12,trim,{castShadow:false});
      }
      for(const sideX of [-1,1]){
        for(const wz of [-.28,.05,.32]){
          const zw=depth*wz;
          box(world,'side apartment window',bx+sideX*(width/2+.06),wy,bz+zw,.09,1.12,depth*.115,M.blue,{castShadow:false});
          box(world,'side window sill',bx+sideX*(width/2+.105),wy-.61,bz+zw,.12,.09,depth*.115+.12,trim,{castShadow:false});
        }
      }
    }
    // Fire escapes on the front and back walls with visible rails and zig-zag ladders.
    if(buildingIndex%3!==1){
      for(const faceZ of [frontZ-.24,backZ+.24]){
        for(let floor=1;floor<floors-1;floor+=2){
          const side=faceZ< bz?-1:1, fy=1.25+floor*2.65;
          box(world,'fire escape landing',bx+width*.34,fy,faceZ,width*.3,.1,.5,M.metal,{castShadow:false});
          box(world,'fire escape rail',bx+width*.34,fy+.25,faceZ+side*.22,width*.3,.06,.06,M.black,{castShadow:false});
          box(world,'fire escape ladder',bx+width*.34,fy-.25,faceZ+side*.28,.07,.62,.07,M.metal,{castShadow:false});
        }
      }
    }
    // Masonry courses and corner quoins add depth to the facade from oblique views.
    for(let band=1;band<floors;band+=2){
      const y=band*2.65;
      box(world,'front masonry course',bx,y,frontZ-.09,width,.045,.08,trim,{castShadow:false});
      box(world,'rear masonry course',bx,y,backZ+.09,width,.045,.08,trim,{castShadow:false});
      box(world,'left masonry course',bx-width/2-.09,y,bz,.08,.045,depth,trim,{castShadow:false});
      box(world,'right masonry course',bx+width/2+.09,y,bz,.08,.045,depth,trim,{castShadow:false});
    }
    for(const sx of [-1,1])for(const sz of [-1,1])box(world,'building corner quoin',bx+sx*(width/2+.055),height*.48,bz+sz*(depth/2+.055),.13,height*.96,.13,trim,{castShadow:false});
    // Rooftop HVAC and water tanks ground directly onto the roof.
    if(buildingIndex%2===0){
      box(world,'rooftop HVAC unit',bx+width*.18,height+.36,bz+depth*.12,width*.24,.55,depth*.2,M.metal,{castShadow:false});
      cyl(world,'rooftop water tank',bx-width*.22,height+.65,bz-depth*.18,.55,.55,.9,M.wood,12);
      for(const vx of [-.22,.22])cyl(world,'rooftop vent',bx+vx,height+.35,bz-depth*.25,.1,.13,.55,M.metal,10);
    }
    buildingIndex++;
  }
}
// REAR NEIGHBORHOOD: a second city block wraps around the back of the café.
// Buildings sit beyond the rear wall and to either side, so the player can walk around the shop and see a continuous town.
box(world,'rear neighborhood avenue',0,-.105,-27,118,.16,8.5,asphaltMat);
for(let x=-56;x<=56;x+=3) box(world,'rear avenue lane marking',x,-.005,-27,1.3,.025,.12,M.cream,{castShadow:false});
for(const sideX of [-1,1]){
  box(world,'rear avenue sidewalk',0,.015,-27+sideX*5,118,.22,1.5,sidewalkMat);
  box(world,'rear avenue curb',0,.08,-27+sideX*4.2,118,.18,.2,M.concrete);
}
const rearColors=[0xc6b4a2,0xa9bdb7,0xd7c6ac,0xb5a7a3,0xd6c9a7,0xa7b7c5,0xc9ab98,0xb6bd9f];
let rearIndex=0;
for(const bx of [-50,-37,-24,24,37,50]){
  for(const bz of [-19,-39,-54]){
    const width=6.3+(rearIndex%3)*.65, depth=7.5+(rearIndex%2)*1.1;
    const floors=3+(rearIndex%5), height=floors*2.6;
    const frontZ=bz-depth/2, backZ=bz+depth/2;
    const facade=mat('rearBlock'+rearIndex,rearColors[rearIndex%rearColors.length]);
    const trim=mat('rearTrim'+rearIndex,trimColors[rearIndex%trimColors.length]);
    box(world,'rear district building',bx,height/2,bz,width,height,depth,facade,{collider:true,castShadow:false});
    box(world,'rear building roof rim',bx,height+.12,bz,width+.24,.22,depth+.24,trim,{castShadow:false});
    if(rearIndex%3===0){box(world,'rear rooftop penthouse',bx-width*.18,height+.6,bz,width*.42,1.1,depth*.48,facade,{castShadow:false});}
    else if(rearIndex%3===1){cyl(world,'rear rooftop turret',bx+width*.2,height+.5,bz,.7,.8,1,facade,12);}
    else {box(world,'rear stepped roof',bx,height+.35,bz,width*.72,.7,depth*.72,facade,{castShadow:false});}
    // Shopfronts face the rear avenue, with the same detail visible from any approach.
    box(world,'rear district storefront glass',bx,1.35,frontZ-.06,width*.58,1.95,.09,M.glass,{castShadow:false});
    box(world,'rear district shop door',bx+width*.31,1.02,frontZ-.12,.72,1.9,.12,M.woodLight,{castShadow:false});
    box(world,'rear district shop sign',bx,2.55,frontZ-.12,width*.7,.42,.1,[M.gold,M.sage,M.red,M.blue][rearIndex%4],{castShadow:false});
    for(let floor=1;floor<floors;floor++){
      const wy=1.1+floor*2.55;
      for(const wx of [-.3,0,.3]){
        const ww=width*.14;
        box(world,'rear block front window',bx+wx*width,wy,frontZ-.06,ww,1.05,.09,M.blue,{castShadow:false});
        box(world,'rear block back window',bx+wx*width,wy,backZ+.06,ww,1.05,.09,M.blue,{castShadow:false});
      }
      for(const sx of [-1,1])for(const wz of [-.28,.12,.38]){
        box(world,'rear block side window',bx+sx*(width/2+.055),wy,bz+depth*wz,.09,1.05,depth*.12,M.blue,{castShadow:false});
      }
    }
    for(const sx of [-1,1])for(const sz of [-1,1])box(world,'rear block corner trim',bx+sx*(width/2+.04),height*.48,bz+sz*(depth/2+.04),.12,height*.96,.12,trim,{castShadow:false});
    if(rearIndex%2===0){
      box(world,'rear rooftop air conditioner',bx+width*.2,height+.36,bz,width*.22,.48,depth*.2,M.metal,{castShadow:false});
      cyl(world,'rear rooftop vent',bx-width*.22,height+.32,bz-depth*.2,.12,.14,.55,M.metal,10);
    }
    rearIndex++;
  }
}
for(const [tx,tz] of [[-15,-21],[15,-21],[-15,-42],[15,-42]]){
  cyl(world,'rear street tree trunk',tx,.95,tz,.2,.23,1.9,M.wood,12);
  sphere(world,'rear street tree crown',tx,2.3,tz,1.02,M.leaf,14);
  box(world,'rear tree planter',tx,.12,tz,1.45,.24,1.45,M.wood);
  colliders.push({x:tx,z:tz,hx:.42,hz:.42,top:2.4,bottom:0});
}
// Small public pocket parks with benches and planted trees along side streets.
for(const [px,pz] of [[-35,76],[35,76],[-7,91],[7,91]]){
  box(world,'city pocket park',px,-.01,pz,5.8,.12,7.2,mat('parkGrass'+px+''+pz,0x77906c));
  for(const [tx,tz] of [[px-1.7,pz-2],[px+1.7,pz+2]]){
    cyl(world,'city tree trunk',tx,.95,tz,.2,.24,1.9,M.wood,12);
    sphere(world,'city tree canopy',tx,2.35,tz,.95,M.leaf,14);
    colliders.push({x:tx,z:tz,hx:.34,hz:.34,top:2,bottom:0});
  }
  box(world,'park bench seat',px,.55,pz,1.65,.14,.48,M.wood,{collider:true});
  for(const lx of [-.62,.62]) for(const lz of [-.15,.15]) box(world,'park bench leg',px+lx,.27,pz+lz,.1,.54,.1,M.black,{collider:true});
  box(world,'park bench back',px,.95,pz-.2,1.65,.7,.12,M.wood,{collider:true});
}
// Lamp posts and bins are positioned on the sidewalk rather than suspended above it.
for(const [lx,lz] of [[-5,72],[5,72],[-5,82],[5,82],[-18,72],[18,72],[-32,100],[32,100],[-46,107],[46,107]]){
  cyl(world,'street lamp post',lx,1.65,lz,.07,.09,3.3,M.black,10);
  box(world,'street lamp arm',lx+.3,3.12,lz,.7,.08,.08,M.black);
  sphere(world,'street lamp globe',lx+.62,3.08,lz,.18,M.yellow,12);
  colliders.push({x:lx,z:lz,hx:.16,hz:.16,top:3.3,bottom:0});
}
for(const [bx,bz] of [[-4,52],[4,64],[-18,82],[18,96]]){
  box(world,'street bin',bx,.48,bz,.48,.96,.48,M.darkGreen,{collider:true});
}

// Ceiling beams, lights and cozy design
box(world,'ceiling',0,4.15,0,22,.25,24,mat('ceiling',0xd2c4ad));
for(let x=-9;x<=9;x+=3){
  box(world,'ceiling beam',x,3.95,0,.12,.18,23,M.wood);
  const light = new THREE.PointLight(0xffdca1,32,8,2);
  light.position.set(x,3.55,-1); world.add(light);
  const fixture=cyl(world,'pendant shade',x,3.68,-1,.26,.38,.18,M.black);
  cyl(world,'pendant bulb',x,3.56,-1,.1,.1,.07,M.yellow);
}
// FULL-FOOTPRINT ROOF: one continuous slab deliberately overhangs every exterior wall.
// The enclosed shell is 22 x 24 units; this 24.6 x 27 unit deck gives a generous, even overhang.
// Its underside meets the interior ceiling so there are no exposed roof gaps around the perimeter.
const roofDeckMat=mat('roofDeck',0x344b3f);
const roofFasciaMat=mat('roofFascia',0x263b32);
box(world,'exterior roof deck full footprint',0,4.42,0,24.6,.30,27,roofDeckMat,{castShadow:true});
// Continuous fascia closes the roof edge on all four elevations.
box(world,'front roof fascia full width',0,4.37,13.32,24.6,.42,.36,roofFasciaMat,{castShadow:false});
box(world,'rear roof fascia full width',0,4.37,-13.32,24.6,.42,.36,roofFasciaMat,{castShadow:false});
for(const side of [-1,1]){
  box(world,'side roof fascia full depth',side*12.12,4.37,0,.36,.42,27,roofFasciaMat,{castShadow:false});
  // Gutters sit just beyond the fascia and run almost the full side length.
  box(world,'continuous side roof gutter',side*12.34,4.18,0,.12,.12,26.55,M.metal,{castShadow:false});
  for(const z of [-12.85,12.85]){
    box(world,'roof corner cap',side*12.14,4.61,z,.44,.12,.44,M.gold,{castShadow:false});
  }
}
// Low parapets are inset from the outer edge, leaving the entire roof slab continuous beneath them.
for(const z of [-12.35,12.35])box(world,'roof parapet front back',0,4.69,z,23.1,.32,.18,roofFasciaMat,{castShadow:false});
for(const x of [-11.45,11.45])box(world,'roof parapet side',x,4.69,0,.18,.32,24.7,roofFasciaMat,{castShadow:false});
// Rooftop equipment is lifted to sit on the new roof surface rather than being buried in it.
for(const [rx,rz] of [[-7,-7],[6,-7],[-7,5],[7,5]]){
  box(world,'rooftop HVAC base',rx,4.63,rz,1.5,.18,1.15,M.metal,{castShadow:false});
  box(world,'rooftop HVAC housing',rx,4.92,rz,1.15,.42,.85,M.blue,{castShadow:false});
  for(let fin=0;fin<4;fin++)box(world,'rooftop HVAC grille',rx-.38+fin*.25,4.93,rz+.44,.055,.25,.035,M.black,{castShadow:false});
}
cyl(world,'roof exhaust vent',0,4.82,-7,.28,.34,.55,M.metal,16);
cyl(world,'roof exhaust cap',0,5.12,-7,.42,.42,.12,M.black,16);
for(let z=-9;z<=9;z+=3){
  box(world,'exterior side wall course left',-11.19,.32,z, .045,.08,2.8,M.woodLight,{castShadow:false});
  box(world,'exterior side wall course right',11.19,.32,z, .045,.08,2.8,M.woodLight,{castShadow:false});
}
// Architectural pilasters, corner downpipes, lintels and base courses finish all exterior elevations.
for(const side of [-1,1]){
  for(const z of [-10,-2,5,10]){
    box(world,'exterior side pilaster',side*11.19,1.85,z,.12,3.55,.22,M.woodLight,{castShadow:false});
    box(world,'exterior pilaster capital',side*11.19,3.68,z,.22,.14,.28,M.gold,{castShadow:false});
    box(world,'exterior pilaster foot',side*11.19,.24,z,.22,.22,.28,M.gold,{castShadow:false});
  }
  box(world,'exterior corner downpipe',side*11.32,2.05,11.55,.12,3.9,.12,M.metal,{castShadow:false});
  box(world,'exterior rear downpipe',side*11.32,2.05,-11.55,.12,3.9,.12,M.metal,{castShadow:false});
  for(const wz of [-6.4,2.4]){
    box(world,'side window lintel',side*11.21,2.99,wz,.12,.12,2.9,M.woodLight,{castShadow:false});
  }
}
box(world,'rear exterior base course',0,.22,-12.22,21.8,.22,.16,M.woodLight,{castShadow:false});
box(world,'rear exterior upper trim',0,3.9,-12.22,21.8,.12,.16,M.woodLight,{castShadow:false});
box(world,'front exterior upper trim',0,3.98,12.18,21.8,.12,.16,M.woodLight,{castShadow:false});
box(world,'rear service light',0,3.1,-12.22,.28,.28,.08,M.yellow,{castShadow:false});
box(world,'rear cafe name plaque',0,3.55,-12.22,5.8,.55,.12,M.darkGreen,{castShadow:false});
for(const x of [-2.85,2.85])box(world,'rear cafe plaque gold edge',x,3.55,-12.3,.05,.59,.06,M.gold,{castShadow:false});
rearSignCanvas=document.createElement('canvas');rearSignCanvas.width=600;rearSignCanvas.height=100;
rearSignCtx=rearSignCanvas.getContext('2d');rearSignCtx.fillStyle='#2c493a';rearSignCtx.fillRect(0,0,600,100);
rearSignCtx.fillStyle='#f5d79e';rearSignCtx.font='bold 38px Georgia';rearSignCtx.textAlign='center';rearSignCtx.textBaseline='middle';rearSignCtx.fillText('LITTLE BEAN CAFE',300,50);
rearSignTexture=new THREE.CanvasTexture(rearSignCanvas);rearSignTexture.colorSpace=THREE.SRGBColorSpace;
rearSignFace=new THREE.Mesh(new THREE.PlaneGeometry(5.65,.45),new THREE.MeshBasicMaterial({map:rearSignTexture,side:THREE.DoubleSide}));
rearSignFace.position.set(0,3.55,-12.29);rearSignFace.rotation.y=Math.PI;world.add(rearSignFace);

for(let z=-9;z<=9;z+=6){
  box(world,'wall trim',-10.78,1.1,z,.08,2.2,.1,M.wood);
  box(world,'wall trim',10.78,1.1,z,.08,2.2,.1,M.wood);
}
box(world,'feature wall',0,2,-11.78,9.5,2.1,.12,M.sage);
box(world,'menu board',0,2.8,-11.66,5.6,1.3,.13,M.black);
box(world,'menu header stripe',0,3.35,-11.56,5.2,.035,.04,M.gold);
const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=180;
const ctx=signCanvas.getContext('2d');ctx.fillStyle='#262b27';ctx.fillRect(0,0,512,180);
ctx.fillStyle='#e7c78f';ctx.font='bold 32px Georgia';ctx.textAlign='center';ctx.fillText('LITTLE BEAN',256,52);
ctx.fillStyle='#f5ead8';ctx.font='22px Arial';ctx.fillText('COFFEE  •  TEA  •  PASTRIES',256,91);
ctx.font='17px Arial';ctx.fillText('GOOD DAYS START HERE',256,137);
const signTexture=new THREE.CanvasTexture(signCanvas);signTexture.colorSpace=THREE.SRGBColorSpace;
const signFace=new THREE.Mesh(new THREE.PlaneGeometry(5.35,1.1),new THREE.MeshBasicMaterial({map:signTexture}));
signFace.position.set(0,2.8,-11.57);world.add(signFace);
drawStoreName();

// Counter and service area — deliberately lower so the player can see and reach across it.
// Counter and register side lowered again; equipment was lowered to sit flush on each work surface.
box(world,'service counter',0,.32,-5.8,8.4,.72,1.35,M.wood,{collider:true});
box(world,'counter top',0,.74,-5.8,8.65,.12,1.55,M.woodLight);
box(world,'counter front panel',0,.32,-5.08,7.9,.48,.08,M.wood);
for(let x=-3.5;x<=3.5;x+=1.4) box(world,'counter detail',x,.32,-4.99,.06,.36,.035,M.gold,{castShadow:false});
box(world,'barista worktop',-3.2,1.35,-9.45,2.5,.12,1.5,M.black);
box(world,'barista cabinet',-3.2,.65,-9.45,2.5,1.3,1.5,M.sage,{collider:true});
box(world,'back bar worktop',2.9,1.35,-9.55,4.8,.12,1.3,M.woodLight);
box(world,'back bar cabinet',2.9,.65,-9.55,4.8,1.3,1.3,M.wood,{collider:true});
for(let x=1.1;x<=4.7;x+=1.2) box(world,'cabinet door',x,.68,-8.88,.9,.9,.07,M.woodLight);
box(world,'espresso base',-3.2,1.72,-9.35,1.4,.65,.85,M.metal);
box(world,'espresso head',-3.2,2.15,-9.35,1.15,.28,.65,M.black);
for(let x of [-3.55,-2.85]){
  cyl(world,'espresso dial',x,2.19,-8.89,.09,.09,.06,M.gold,16);
  cyl(world,'group head',x,1.52,-9.01,.13,.13,.2,M.metal);
}
box(world,'espresso cup tray',-3.2,1.42,-9.08,1.1,.05,.3,M.metal);
cyl(world,'coffee grinder',-4.05,1.78,-9.48,.22,.22,.62,M.black);
cyl(world,'grinder hopper',-4.05,2.18,-9.48,.18,.13,.22,M.glass);
box(world,'register',-1.45,.98,-5.95,.5,.35,.42,M.black);
box(world,'register screen',-1.45,1.20,-5.94,.42,.2,.05,M.blue);
cyl(world,'milk pitcher',-2.35,1.58,-9.35,.13,.15,.3,M.metal);
cyl(world,'coffee bean jar',-1.75,1.61,-9.35,.16,.16,.36,M.glass);
cyl(world,'jar lid',-1.75,1.82,-9.35,.17,.17,.06,M.wood);
for(let i=0;i<4;i++){
  cyl(world,'cup stack',-4.6,1.51+i*.12,-9.48,.16,.19,.13,M.cream,20);
}
box(world,'pickup shelf',.85,.84,-5.95,1.5,.08,.5,M.woodLight);
for(let x=.4;x<=1.3;x+=.45){
  cyl(world,'paper cup',x,1.02,-5.95,.12,.15,.3,M.cream,16);
  cyl(world,'cup coffee',x,1.18,-5.95,.1,.1,.025,M.coffee,16);
}
box(world,'pastry display base',3.9,1.56,-9.55,1.55,.3,.8,M.black);
box(world,'pastry display glass',3.9,1.92,-9.55,1.5,.42,.74,M.glass);
for(let x=3.4;x<=4.4;x+=.5){
  const croissant=sphere(world,'pastry',x,1.92,-9.47,.19,M.yellow,12);croissant.scale.set(1.2,.55,.75);
}
box(world,'pastry shelf',3.9,1.82,-9.55,1.5,.06,.74,M.woodLight);

// Seating, tables, chairs and table details
function makeChair(x,z,rot=0, material=M.wood){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;world.add(g);
  box(g,'chair seat',0,.52,0,.8,.13,.78,material);
  box(g,'chair back',0,1,-.32,.8,.9,.12,material);
  for(const dx of [-.3,.3])for(const dz of [-.28,.28])box(g,'chair leg',dx,.25,dz,.09,.5,.09,material);
  return g;
}
function makeTable(x,z,round=false){
  const g=new THREE.Group();g.position.set(x,0,z);world.add(g);
  if(round)cyl(g,'tabletop',0,.76,0,.72,.72,.13,M.woodLight,32);
  else box(g,'tabletop',0,.76,0,1.45,.13,1.05,M.woodLight);
  cyl(g,'table pedestal',0,.41,0,.13,.16,.62,M.black,16);
  box(g,'table foot',0,.1,0,.75,.1,.65,M.black);
  // tiny succulent
  cyl(g,'plant pot',0,.89,0,.13,.16,.2,M.cream);
  for(let i=0;i<5;i++){const l=sphere(g,'succulent leaf',Math.cos(i*1.26)*.1,1.19+(i%2)*.03,Math.sin(i*1.26)*.1,.1,M.leaf,10);l.scale.y=.5;}
  return g;
}
makeTable(-6,-1.3,true);makeChair(-7,-1.3,Math.PI/2);makeChair(-5,-1.3,-Math.PI/2);makeChair(-6,-2.45,0);
makeTable(0,-.1,false);makeChair(-1.05,-.1,Math.PI/2);makeChair(1.05,-.1,-Math.PI/2);makeChair(0,1.05,0);
makeTable(6,-1.2,true);makeChair(5,-1.2,Math.PI/2);makeChair(7,-1.2,-Math.PI/2);makeChair(6,-2.3,0);
makeTable(-6,4,true);makeChair(-7,4,Math.PI/2);makeChair(-5,4,-Math.PI/2);makeChair(-6,5.1,0);
makeTable(0,5,false);makeChair(-1.1,5,Math.PI/2);makeChair(1.1,5,-Math.PI/2);
makeTable(6,4,true);makeChair(5,4,Math.PI/2);makeChair(7,4,-Math.PI/2);
// Solid furniture collision volumes keep the player from walking through seating.
for(const [cx,cz,hx,hz] of [[-6,-1.3,.78,.72],[0,-.1,.8,.65],[6,-1.2,.75,.72],[-6,4,.75,.72],[0,5,.8,.62],[6,4,.75,.72]])colliders.push({x:cx,z:cz,hx,hz,top:1.1,bottom:0});
for(const [cx,cz] of [[-7,-1.3],[-5,-1.3],[-6,-2.45],[-1.05,-.1],[1.05,-.1],[0,1.05],[5,-1.2],[7,-1.2],[6,-2.3],[-7,4],[-5,4],[-6,5.1],[-1.1,5],[1.1,5],[5,4],[7,4]])colliders.push({x:cx,z:cz,hx:.34,hz:.34,top:1,bottom:0});
for(const [x,z] of [[-9,-8],[-9,2],[9,-9],[9,3]]){
  cyl(world,'planter pot',x,.45,z,.48,.58,.8,M.woodLight);
  for(let i=0;i<6;i++){
    const leaf=sphere(world,'indoor plant',x+(Math.random()-.5)*.55,.9+Math.random()*.55,z+(Math.random()-.5)*.55,.28,M.leaf);
    leaf.scale.set(.7,1.4,.7);
  }
}
for(let x=-8;x<=8;x+=4){
  box(world,'wall picture frame',x,2.7,-11.55,1.35,1.05,.09,M.woodLight);
  box(world,'wall picture art',x,2.7,-11.48,1.14,.83,.04,[M.sage,M.gold,M.pink,M.blue,M.red][Math.floor((x+8)/4)%5]);
  sphere(world,'art leaf',x-.2,2.75,-11.43,.2,M.leaf,12);
}
box(world,'rug',0,-.005,3,7,.025,2.4,mat('rug',0x71836c));

// Station objects and accessible interaction zones
addInteractable('espresso','Use espresso machine',-3.2,-7.65,1.75,'espresso');
addInteractable('register','Serve orders at the register',-.2,-4.25,1.65,'register');
// Second pickup interaction on the kitchen side lets the player serve without walking around the counter.
addInteractable('register-back','Serve orders from the other side of the counter',.2,-7.25,1.65,'register');
addInteractable('pastry','Prepare pastries',3.9,-7.75,1.75,'pastry');
addInteractable('upgrade','Shop / café upgrades',7.8,-4.25,1.65,'shop');
addInteractable('clean','Clean tables',-6,0.2,1.3,'clean');
addInteractable('door','Close for the day',0,10.1,1.6,'close');
addInteractable('menu','Check café menu',0,-10.2,1.4,'menu');

// Subtle station marker glow, only visible when close
const markerMat=new THREE.MeshBasicMaterial({color:0xe3bd7d,transparent:true,opacity:.75});
const markerHighlightMat=new THREE.MeshBasicMaterial({color:0xffe0a0,transparent:true,opacity:.95});
for(const item of interactables){
  const ring=new THREE.Mesh(new THREE.RingGeometry(.35,.43,28),markerMat);
  ring.rotation.x=-Math.PI/2;ring.position.set(item.x,.012,item.z);world.add(ring);item.mesh=ring;
}

// Game state
const state = {
  running:false, paused:false, cash:120, day:1, reputation:1.0,
  customersServed:0, lifetimeServed:0, lifetimeRevenue:0, totalTips:0, mistakes:0, cleaned:0, drinksMade:0, pastriesMade:0,
  orders:[], nextOrderId:1, currentOrder:null, daySeconds:0, openSeconds:0,
  dayDuration:240, orderTimer:0, spawnTimer:0, actionCooldown:0, hudRefreshTimer:0,
  drinkInventory:0, pastryInventory:0, preparedProducts:[], cleanedTables:0, upgrades:new Set(), cafeTheme:'classic', ownedThemes:new Set(['classic']), outdoorSets:0, outdoorTables:0, outdoorChairs:0, placedFurniture:[], businessLevel:1, dailyGoalPaidDay:0, dailyMenuSeen:1, staff:[], staffMeshes:[],
  unlocked:{espresso:true,pastry:true}, activeStation:null, pointerLocked:false, settings:{difficulty:'normal',stock:true,cutscenes:true,rush:true,sound:true,autoDoor:true,sensitivity:12}, stocks:{coffee:12,milk:10,vanilla:6,ice:8,caramel:6,matcha:5,chocolate:10,tea:8,flour:12,berries:7,cinnamon:6}, pendingProduct:null, cookStep:0, doorWasOutside:false,
  tasks:{firstDrink:false,firstServe:false,firstClean:false,firstUpgrade:false}
};
let furniturePlacement = null;
const furnitureGhostMaterial = new THREE.MeshStandardMaterial({color:0x8fc7a0,transparent:true,opacity:.48,roughness:.65,depthWrite:false});
const furnitureRaycaster = new THREE.Raycaster();
const furnitureMouse = new THREE.Vector2();
const furnitureGround = new THREE.Plane(new THREE.Vector3(0,1,0),0);
const furnitureHit = new THREE.Vector3();
const upgradeData=[
  {id:'machine',icon:'☕',name:'Pro espresso machine',desc:'Better coffee boosts order value by $2.',cost:85},
  {id:'seats',icon:'🪑',name:'Extra seating',desc:'Customers are more patient and tips improve.',cost:65},
  {id:'plants',icon:'🪴',name:'Green café makeover',desc:'Adds a reputation boost.',cost:55},
  {id:'pastry',icon:'🥐',name:'Bakery display upgrade',desc:'Pastries sell for $3 more.',cost:75},
  {id:'sign',icon:'✦',name:'Premium street sign',desc:'Attract customers more frequently.',cost:95}
];
const drinkTypes=[
  {name:'Espresso',icon:'☕',price:8,desc:'A rich double shot.',stock:'coffee'},
  {name:'Cappuccino',icon:'🥛',price:11,desc:'Espresso with silky steamed milk.',stock:'milk'},
  {name:'Vanilla Latte',icon:'🤎',price:13,desc:'Smooth latte with vanilla syrup.',stock:'vanilla'},
  {name:'Iced Coffee',icon:'🧊',price:10,desc:'Chilled coffee over ice.',stock:'ice'},
  {name:'Caramel Macchiato',icon:'🍯',price:15,desc:'Espresso, milk, and caramel drizzle.',stock:'caramel'},
  {name:'Matcha Latte',icon:'🍵',price:14,desc:'Earthy matcha whisked with milk.',stock:'matcha'},
  {name:'Hot Chocolate',icon:'🍫',price:9,desc:'Creamy cocoa with a chocolate finish.',stock:'chocolate'},
  {name:'Chai Latte',icon:'🫖',price:12,desc:'Spiced tea with steamed milk.',stock:'tea'}
];
const pastryTypes=[
  {name:'Croissant',icon:'🥐',price:7,desc:'Buttery and flaky.',stock:'flour'},
  {name:'Blueberry Muffin',icon:'🧁',price:8,desc:'Fresh muffin with blueberries.',stock:'berries'},
  {name:'Cinnamon Roll',icon:'🍥',price:9,desc:'Warm cinnamon swirl.',stock:'cinnamon'},
  {name:'Chocolate Cookie',icon:'🍪',price:6,desc:'Soft cookie with chocolate chips.',stock:'chocolate'},
  {name:'Strawberry Tart',icon:'🍓',price:12,desc:'Fruit tart with vanilla cream.',stock:'berries'},
  {name:'Banana Bread',icon:'🍞',price:8,desc:'Moist banana loaf slice.',stock:'flour'}
];
// A new signature item becomes available every in-game day and joins customer orders.
const dailyMenuCatalog=[
  {unlockDay:2,kind:'drink',name:'Honey Oat Latte',icon:'🍯',price:16,desc:'Oat milk latte with local honey.',stock:'milk'},
  {unlockDay:3,kind:'pastry',name:'Lemon Scone',icon:'🍋',price:10,desc:'A tender scone with bright lemon glaze.',stock:'flour'},
  {unlockDay:4,kind:'drink',name:'Brown Sugar Cold Brew',icon:'🧋',price:17,desc:'Slow-steeped coffee with brown sugar.',stock:'coffee'},
  {unlockDay:5,kind:'pastry',name:'Raspberry Danish',icon:'🥮',price:13,desc:'Flaky pastry with raspberry filling.',stock:'berries'},
  {unlockDay:6,kind:'drink',name:'Mocha Cloud',icon:'☁️',price:18,desc:'Chocolate espresso with a creamy foam cap.',stock:'chocolate'},
  {unlockDay:7,kind:'pastry',name:'Pistachio Croissant',icon:'🥐',price:15,desc:'Buttery pastry with a nutty green filling.',stock:'flour'},
  {unlockDay:8,kind:'drink',name:'Rose Vanilla Tea',icon:'🌹',price:14,desc:'Floral tea finished with vanilla.',stock:'tea'},
  {unlockDay:9,kind:'pastry',name:'Caramel Apple Tart',icon:'🍎',price:16,desc:'Warm apple tart with caramel drizzle.',stock:'berries'},
  {unlockDay:10,kind:'drink',name:'Maple Cream Latte',icon:'🍁',price:19,desc:'Espresso, steamed milk, and maple cream.',stock:'vanilla'}
];
function dailySpecialForDay(day){
  const drinkSpecials=[
    {name:'Pistachio Cream Latte',icon:'💚',price:20,desc:'Espresso with pistachio cream.',stock:'milk'},
    {name:'Vanilla Berry Fizz',icon:'🫐',price:18,desc:'A bright berry café refresher.',stock:'berries'},
    {name:'Brown Butter Mocha',icon:'🍫',price:21,desc:'Deep cocoa and smooth espresso.',stock:'chocolate'},
    {name:'Maple Cinnamon Cold Brew',icon:'🍁',price:20,desc:'Cold brew with maple and spice.',stock:'coffee'},
    {name:'Honey Matcha Cloud',icon:'🍵',price:22,desc:'Whisked matcha with honey foam.',stock:'matcha'}
  ];
  const pastrySpecials=[
    {name:'Pistachio Morning Bun',icon:'🥐',price:17,desc:'A flaky bun with pistachio sugar.',stock:'flour'},
    {name:'Blueberry Lemon Loaf',icon:'🍋',price:16,desc:'Lemon loaf with blueberry glaze.',stock:'berries'},
    {name:'Chocolate Hazelnut Tart',icon:'🍫',price:19,desc:'Rich chocolate tart with a nutty finish.',stock:'chocolate'},
    {name:'Apple Crumble Danish',icon:'🍎',price:18,desc:'Warm apple filling with a crisp topping.',stock:'flour'},
    {name:'Strawberry Cream Scone',icon:'🍓',price:17,desc:'Soft scone with strawberry cream.',stock:'berries'}
  ];
  const kind=day%2===0?'drink':'pastry';const source=kind==='drink'?drinkSpecials:pastrySpecials;const item=source[Math.floor((day-11)/2)%source.length];
  return {...item,kind,unlockDay:day,name:`Day ${day} ${item.name}`};
}
function availableMenu(kind){
  const base=kind==='drink'?drinkTypes:pastryTypes;
  const procedural=[];for(let d=11;d<=Math.min(state.day,100);d++){const item=dailySpecialForDay(d);if(item.kind===kind)procedural.push(item);}
  return [...base,...dailyMenuCatalog.filter(item=>item.kind===kind&&item.unlockDay<=state.day),...procedural];
}
const customersData=[
  {name:'Mia',skin:M.skin,shirt:M.pink,hair:0x4b3025,hairStyle:'long',pants:0x39485b,accessory:'badge'},
  {name:'Noah',skin:M.skin2,shirt:M.blue,hair:0x292622,hairStyle:'short',pants:0x303238},
  {name:'Ava',skin:M.skin,shirt:M.yellow,hair:0x8b5a32,hairStyle:'bun',pants:0x526a54,accessory:'scarf'},
  {name:'Leo',skin:M.skin2,shirt:M.darkGreen,hair:0x242323,hairStyle:'short',pants:0x474747,accessory:'badge'},
  {name:'Sofia',skin:M.skin,shirt:M.red,hair:0x38271f,hairStyle:'long',pants:0x42374f,accessory:'scarf'},
  {name:'Ethan',skin:M.skin2,shirt:M.cream,hair:0x5a4637,hairStyle:'short',pants:0x344b61}
];


// Tycoon progression: save cash, staff, themes, upgrades, furniture and the chosen store name.
const SAVE_KEY='littleBeanCafeTycoonSave_v2';
let saveTimer=null;
function saveProgress(){
  try{
    const payload={storeName,cash:state.cash,day:state.day,reputation:state.reputation,lifetimeServed:state.lifetimeServed,lifetimeRevenue:state.lifetimeRevenue,totalTips:state.totalTips,customersServed:state.customersServed,mistakes:state.mistakes,cleaned:state.cleaned,drinksMade:state.drinksMade,pastriesMade:state.pastriesMade,upgrades:[...state.upgrades],cafeTheme:state.cafeTheme,ownedThemes:[...state.ownedThemes],outdoorSets:state.outdoorSets,outdoorTables:state.outdoorTables,outdoorChairs:state.outdoorChairs,placedFurniture:state.placedFurniture,businessLevel:state.businessLevel,dailyGoalPaidDay:state.dailyGoalPaidDay,staff:state.staff,settings:state.settings,stocks:state.stocks,tasks:state.tasks};
    localStorage.setItem(SAVE_KEY,JSON.stringify(payload));
  }catch(e){console.warn('Could not save café progress',e);}
}
function scheduleSave(){if(saveTimer||furniturePlacement)return;saveTimer=setTimeout(()=>{saveTimer=null;if(!furniturePlacement)saveProgress();},1200);}
function loadProgress(){
  try{
    const raw=localStorage.getItem(SAVE_KEY);if(!raw)return null;const d=JSON.parse(raw);
    if(!d||typeof d!=='object')return null;
    for(const k of ['cash','day','reputation','lifetimeServed','lifetimeRevenue','totalTips','customersServed','mistakes','cleaned','drinksMade','pastriesMade','outdoorSets','outdoorTables','outdoorChairs','businessLevel','dailyGoalPaidDay'])if(Number.isFinite(d[k]))state[k]=d[k];
    if(Array.isArray(d.upgrades))state.upgrades=new Set(d.upgrades);if(Array.isArray(d.ownedThemes))state.ownedThemes=new Set(d.ownedThemes);
    if(typeof d.cafeTheme==='string')state.cafeTheme=d.cafeTheme;if(Array.isArray(d.staff))state.staff=d.staff;if(d.settings&&typeof d.settings==='object')state.settings={...state.settings,...d.settings};if(d.stocks&&typeof d.stocks==='object')state.stocks={...state.stocks,...d.stocks};if(d.tasks&&typeof d.tasks==='object')state.tasks={...state.tasks,...d.tasks};if(Array.isArray(d.placedFurniture))state.placedFurniture=d.placedFurniture.filter(f=>f&&['table','chair'].includes(f.id)&&Number.isFinite(f.x)&&Number.isFinite(f.z));
    if(typeof d.storeName==='string'&&d.storeName.trim())storeName=d.storeName.trim().slice(0,28);
    return d;
  }catch(e){console.warn('Could not load café save',e);return null;}
}
function renderBusinessExpansion(root){
  const heading=document.createElement('div');heading.className='shop-section-title';heading.innerHTML='🏗️ <span><strong>RESTAURANT EXPANSION</strong><small>Grow from a neighborhood café into a busy restaurant.</small></span>';root.appendChild(heading);
  const levels=[
    {level:2,cost:240,name:'Bigger dining room',desc:'Serve 3 customers at once and gain 8% more income per level.'},
    {level:3,cost:520,name:'Full-service restaurant',desc:'Serve 4 customers at once, gain another income bonus, and attract bigger orders.'},
    {level:4,cost:950,name:'City favorite',desc:'Premium reputation tier and stronger income from every perfect ticket.'}
  ];
  const current=document.createElement('div');current.className='daily-menu-row';current.innerHTML=`<span>🏆</span><div><strong>Business level ${state.businessLevel} · ${['','Neighborhood Café','Bigger Dining Room','Full-Service Restaurant','City Favorite'][state.businessLevel]||'Restaurant Empire'}</strong><small>Lifetime guests: ${state.lifetimeServed} · Lifetime sales: $${Math.floor(state.lifetimeRevenue)} · Guest capacity: ${customerCapacity()}</small></div><b>LEVEL ${state.businessLevel}</b>`;root.appendChild(current);
  const next=levels.find(x=>x.level===state.businessLevel+1);
  if(next){const row=document.createElement('div');row.className='upgrade-item';row.innerHTML=`<span class="upgrade-emoji">🏗️</span><span class="upgrade-info"><strong>${next.name}</strong><small>${next.desc}</small></span><button class="buy-button" ${state.cash<next.cost?'disabled':''}>EXPAND $${next.cost}</button>`;row.querySelector('button').addEventListener('click',()=>{if(state.businessLevel+1!==next.level||state.cash<next.cost)return;state.cash-=next.cost;state.businessLevel=next.level;state.reputation=Math.min(5,state.reputation+.15);state.spawnTimer=Math.min(state.spawnTimer,3);updateHUD();renderUpgrades();saveProgress();showMessage(`${next.name} unlocked! Your café can handle more guests.`);playSound('success');});root.appendChild(row);}
  else{const max=document.createElement('div');max.className='daily-menu-row';max.innerHTML='<span>⭐</span><div><strong>Top-tier restaurant</strong><small>You have reached the current business expansion tier. Keep earning and serving guests.</small></div><b>MAX LEVEL</b>';root.appendChild(max);}
  const goal=3+Math.floor(state.day/2),bonus=45+state.day*10;const challenge=document.createElement('div');challenge.className='daily-menu-row';challenge.innerHTML=`<span>🎯</span><div><strong>Today's service challenge</strong><small>Serve ${goal} complete orders today for a $${bonus} bonus. Current progress: ${state.customersServed}/${goal}.</small></div><b>${state.customersServed>=goal?'COMPLETE':'IN PROGRESS'}</b>`;root.appendChild(challenge);
}
function restorePlacedFurniture(){
  const setsToRestore=state.outdoorSets;state.outdoorSets=0;
  for(let i=0;i<setsToRestore;i++)buildOutdoorSet();
  for(const f of state.placedFurniture){makeFurnitureObject(f.id,f.x,f.z,f.rotation||0,false);if(f.id==='table')colliders.push({x:f.x,z:f.z,hx:.82,hz:.75,top:1.1,bottom:0});else colliders.push({x:f.x,z:f.z,hx:.38,hz:.38,top:1,bottom:0});}
  if(state.staff.length)syncStaffVisuals();
}

function makeCustomer(data, x, z, order){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=Math.PI;world.add(g);
  // Layered, more human-shaped characters with readable faces, hands and clothing.
  const shirtMat=data.shirt;
  const pantsMat=mat('pants'+data.name, data.pants||0x454b4b);
  const hairMat=mat('hair'+data.hair,data.hair);
  const skinMat=data.skin;
  box(g,'customer torso',0,1.08,0,.58,.78,.34,shirtMat);
  cyl(g,'customer neck',0,1.53,0,.105,.105,.18,skinMat,10);
  sphere(g,'customer head',0,1.76,0,.255,skinMat,18);
  // Hairstyles vary by customer: swept side hair, curls/bun, or a short fringe.
  sphere(g,'customer hair',0,1.92,-.035,.265,hairMat,16);
  if(data.hairStyle==='long'){
    box(g,'long hair back',0,1.68,-.12,.42,.48,.18,hairMat);
    sphere(g,'left hair lock',-.22,1.72,.015,.09,hairMat,10);
    sphere(g,'right hair lock',.22,1.72,.015,.09,hairMat,10);
  }else if(data.hairStyle==='bun'){
    sphere(g,'hair bun',0,2.08,-.12,.12,hairMat,10);
    box(g,'hair fringe',-.04,1.84,.21,.29,.07,.08,hairMat);
  }else{
    box(g,'customer hair fringe',0,1.84,.19,.38,.12,.13,hairMat);
    box(g,'side swept hair',.12,1.9,.13,.17,.1,.12,hairMat);
  }
  // Ears, eyes, nose and a subtle smile are all modeled geometry, not a flat decal.
  for(const ex of [-.255,.255])sphere(g,'customer ear',ex,1.75,0,.055,skinMat,10);
  for(const ex of [-.09,.09]){
    sphere(g,'customer eye white',ex,1.78,.222,.038,M.white,10);
    sphere(g,'customer pupil',ex+.008,1.78,.254,.019,M.black,8);
    box(g,'customer eyebrow',ex,1.84,.224,.075,.018,.025,hairMat);
  }
  sphere(g,'customer nose',0,1.725,.265,.035,skinMat,8);
  box(g,'customer smile',0,1.665,.245,.085,.018,.018,mat('smile'+data.name,0x75483c),{castShadow:false});
  // Sleeves, arms and hands sit outside the torso so the silhouette reads clearly.
  for(const side of [-1,1]){
    const arm=box(g,'customer upper sleeve',side*.365,1.16,0,.19,.48,.23,shirtMat);
    arm.rotation.z=side*.10;
    const forearm=box(g,'customer forearm',side*.39,.87,.025,.13,.32,.15,skinMat);
    forearm.rotation.z=side*-.04;
    sphere(g,'customer hand',side*.395,.68,.045,.085,skinMat,10);
    box(g,'customer leg',side*.17,.39,0,.19,.62,.22,pantsMat);
    box(g,'customer shoe',side*.17,.085,.065,.22,.13,.34,mat('shoes'+data.name,0x292b2b));
  }
  // A collar and two seams add small details that catch the cafe lighting.
  box(g,'shirt collar',0,1.43,.18,.18,.07,.035,M.cream,{castShadow:false});
  if(data.accessory==='scarf'){
    box(g,'customer scarf',0,1.39,.205,.27,.12,.055,mat('scarf'+data.name,0xb95c48));
  }else if(data.accessory==='badge'){
    box(g,'customer name badge',.17,1.2,.185,.09,.1,.025,M.gold,{castShadow:false});
  }
  g.userData={order,wait:0,served:false,data,baseX:x,baseZ:z,phase:Math.random()*5,arms:g.children.filter(o=>o.name==='customer upper sleeve'),legs:g.children.filter(o=>o.name==='customer leg'),shoes:g.children.filter(o=>o.name==='customer shoe'),torso:g.children.find(o=>o.name==='customer torso'),stage:'approach',targetX:x,targetZ:z,seat:null,route:[],routeIndex:0,patienceUiTimer:0,walkPhase:Math.random()*Math.PI*2};
  customers.push(g); return g;
}
function makeOrder(){
  const drinks=availableMenu('drink').filter(d=>state.upgrades.has('machine')||d.name!=='Iced Coffee');
  const d=drinks[Math.floor(Math.random()*drinks.length)];
  const wantsPastry=Math.random()<(state.upgrades.has('pastry')?.62:.42);
  const pastryMenu=availableMenu('pastry');
  const p=pastryMenu[Math.floor(Math.random()*pastryMenu.length)];
  const items=[{kind:'drink',name:d.name,icon:d.icon,price:d.price}];
  if(wantsPastry)items.push({kind:'pastry',name:p.name,icon:p.icon,price:p.price});
  const total=items.reduce((a,b)=>a+b.price,0);
  return {id:state.nextOrderId++,customer:customersData[Math.floor(Math.random()*customersData.length)].name,items,total,created:state.daySeconds,patience:(state.upgrades.has('seats')?85:65)*(state.staff.some(w=>w.role==='server')?1.65:1)*(state.staff.some(w=>w.role==='host')?1.25:1)*({easy:1.6,normal:1,hard:.72,expert:.52}[state.settings.difficulty]||1)};
}
function customerCapacity(){return cafeSeatSpots.length;}
function findOpenCafeSeat(){
  for(let i=0;i<cafeSeatSpots.length;i++)if(!occupiedCafeSeats.has(i))return {index:i,...cafeSeatSpots[i]};
  return null;
}
function spawnCustomer(){
  if(customers.length>=customerCapacity())return;
  // Reserve a real seat as soon as the guest arrives so several guests in the queue
  // cannot all be promised the same final chair.
  const reservedSeat=findOpenCafeSeat();
  if(!reservedSeat)return;
  occupiedCafeSeats.add(reservedSeat.index);
  const order=makeOrder();
  const queueIndex=customers.filter(c=>c.userData.stage==='approach'||c.userData.stage==='waiting').length;
  const spot=[-.25+Math.min(queueIndex,3)*.72,-4.25];
  const data=customersData.find(c=>c.name===order.customer)||customersData[0];
  const c=makeCustomer(data,0,10.6,order);
  c.userData.stage='approach';c.userData.targetX=spot[0];c.userData.targetZ=spot[1];c.userData.seat=reservedSeat;c.rotation.y=Math.PI;
  state.orders.push(order);
  renderOrders();
  setTip(`${order.customer} is walking to the counter. Prepare the items on their ticket, then serve them so they can take a seat.`);
  showMessage(`${order.customer} arrived and is heading to the counter.`);
}
function removeCustomer(orderId){
  const idx=customers.findIndex(c=>c.userData.order.id===orderId);
  if(idx>=0){const guest=customers[idx];if(guest.userData.seat)occupiedCafeSeats.delete(guest.userData.seat.index);world.remove(guest);customers.splice(idx,1);}
}
function renderOrders(){
  const list=$('orderList');
  if(!state.orders.length){list.innerHTML='<p class="muted">No orders yet. Keep the café ready!</p>';}
  else list.innerHTML=state.orders.map(o=>{const guest=customers.find(c=>c.userData.order.id===o.id);const stage=guest?.userData.stage||'approach';const status=stage==='approach'?'WALKING TO COUNTER':stage==='waiting'?'WAITING FOR FOOD':stage==='to-seat'?'WALKING TO TABLE':stage==='seated'?'SEATED':'LEAVING';return `<div class="order-item" data-order-id="${o.id}"><div class="drink-dot">🧾</div><div class="order-copy"><strong>${escapeHTML(o.customer)}'s order</strong><small>${o.items.map(i=>`${i.icon} ${escapeHTML(i.name)}`).join(' + ')}</small><span class="order-stage">${status}</span><div class="patience-track" aria-label="Customer patience"><div class="patience-fill" style="width:100%"></div></div></div><span class="price">$${o.total}</span></div>`;}).join('');
  $('orderCount').textContent=`${state.orders.length} waiting`;
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function refreshCustomerOrderStatuses(){
  const labels={approach:'WALKING TO COUNTER',waiting:'WAITING FOR FOOD','to-seat':'WALKING TO TABLE',seated:'SEATED',leaving:'LEAVING'};
  for(const guest of customers){const node=document.querySelector(`.order-item[data-order-id="${guest.userData.order.id}"] .order-stage`);if(node)node.textContent=labels[guest.userData.stage]||'IN SERVICE';}
}
function updateHUD(){
  $('cashValue').textContent=`$${Math.floor(state.cash)}`;
  $('dayValue').textContent=state.day;
  $('repValue').textContent=`★ ${state.reputation.toFixed(1)}`;
  const hour=8+Math.floor(state.daySeconds/30);
  const mins=Math.floor((state.daySeconds%30)/30*60);
  $('timeValue').textContent=`${hour>12?hour-12:hour}:${String(mins).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;
  updateTasks();
  scheduleSave();
}
function updateTasks(){
  const tasks=[
    ['firstDrink','Make your first drink'],
    ['firstServe','Serve your first customer'],
    ['firstClean','Clean a table'],
    ['firstUpgrade','Buy your first upgrade']
  ];
  $('taskList').innerHTML=tasks.map(([id,label])=>`<div class="task ${state.tasks[id]?'done':''}"><span class="check">${state.tasks[id]?'✓':''}</span><span>${label}</span></div>`).join('');
  const done=tasks.filter(([id])=>state.tasks[id]).length;
  $('taskProgress').style.width=`${done/tasks.length*100}%`;
}
let messageTimeout=null;
function showMessage(text){
  ui.message.textContent=text;ui.message.classList.remove('hidden');
  clearTimeout(messageTimeout);messageTimeout=setTimeout(()=>ui.message.classList.add('hidden'),2500);
}
function setTip(text){ui.tip.textContent=text;}
function setModal(modal,open){modal.classList.toggle('hidden',!open);}
function openStation(kind){
  state.activeStation=kind;
  if(document.pointerLockElement)document.exitPointerLock();
  if(kind==='shop'){renderUpgrades();setModal(ui.shop,true);return;}
  setModal(ui.station,true);
  const title=$('stationTitle'),desc=$('stationDescription'),content=$('stationContent');
  content.innerHTML='';
  const addOption=(icon,name,description,price,callback)=>{
    const btn=document.createElement('button');btn.className='option-button';
    btn.innerHTML=`<span class="option-icon">${icon}</span><span><strong>${escapeHTML(name)}</strong><small>${escapeHTML(description)}</small></span><span class="option-price">${price}</span>`;
    btn.addEventListener('click',callback);content.appendChild(btn);
  };
  if(kind==='espresso'){
    $('stationEyebrow').textContent='BARISTA STATION';title.textContent='Brew a drink';desc.textContent='Prepare a fresh drink. Match the active ticket to earn the full amount and a happy customer.';
    availableMenu('drink').forEach(d=>addOption(d.icon,d.name,d.desc,`$${d.price}`,()=>makeProduct('drink',d)));
  }else if(kind==='pastry'){
    $('stationEyebrow').textContent='BAKERY COUNTER';title.textContent='Prepare a pastry';desc.textContent='Choose a pastry to add to your serving tray.';
    availableMenu('pastry').forEach(p=>addOption(p.icon,p.name,p.desc,`$${p.price}`,()=>makeProduct('pastry',p)));
  }else if(kind==='register'){
    $('stationEyebrow').textContent='PICKUP COUNTER';title.textContent='Serve your customers';desc.textContent='Serve the customer who has reached the counter. After pickup, they will walk to an available chair and sit down.';
    if(!state.orders.some(o=>customers.some(c=>c.userData.order.id===o.id&&c.userData.stage==='waiting'))){
      const p=document.createElement('p');p.className='muted';p.textContent=state.orders.length?'Customers are walking to the counter. Prepare their items while they arrive.':'No customers are waiting right now. Check the espresso machine or pastries while you wait.';content.appendChild(p);
    }else{
      state.orders.filter(o=>customers.some(c=>c.userData.order.id===o.id&&c.userData.stage==='waiting')).slice(0,8).forEach(o=>{
        const btn=document.createElement('button');btn.className='option-button';
        btn.innerHTML=`<span class="option-icon">🧾</span><span><strong>${escapeHTML(o.customer)} · $${o.total}</strong><small>${o.items.map(i=>`${i.icon} ${escapeHTML(i.name)}`).join(' + ')}</small></span><span class="option-price">SERVE</span>`;
        btn.addEventListener('click',()=>serveOrder(o));content.appendChild(btn);
      });
    }
  }else if(kind==='clean'){
    $('stationEyebrow').textContent='KEEP IT COZY';title.textContent='Clean the café';desc.textContent='Wipe down the tables and keep the café welcoming.';
    addOption('🧽','Wipe the tables','A clean café improves your reputation.','$2 cost',()=>{
      state.cash=Math.max(0,state.cash-2);state.cleaned++;state.tasks.firstClean=true;
      state.reputation=Math.min(5,state.reputation+.12);updateHUD();setModal(ui.station,false);
      showMessage('Tables are sparkling. Reputation improved!');playSound('success');setTip('A tidy café helps customers come back.');
    });
  }else if(kind==='menu'){
    $('stationEyebrow').textContent='TODAY’S MENU';title.textContent='Café menu';desc.textContent='These are the drinks and treats you can make today.';
    availableMenu('drink').forEach(d=>addOption(d.icon,d.name,d.desc,`$${d.price}`,()=>{}));
    availableMenu('pastry').forEach(p=>addOption(p.icon,p.name,p.desc,`$${p.price}`,()=>{}));
    dailyMenuCatalog.filter(item=>item.unlockDay>state.day).slice(0,3).forEach(item=>addOption('🔒',`Day ${item.unlockDay}: ${item.name}`,'Upcoming daily menu unlock',`$${item.price}`,()=>{}));
  }
}
let audioContext=null;
function playSound(type='click'){
  if(!state.settings.sound)return;
  try{
    audioContext ||= new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume();
    const now=audioContext.currentTime;
    const osc=audioContext.createOscillator(),gain=audioContext.createGain();
    osc.connect(gain);gain.connect(audioContext.destination);
    const presets={click:[620,.055,'sine'],coffee:[170,.22,'triangle'],cash:[880,.16,'sine'],door:[660,.3,'sine'],success:[740,.2,'sine'],error:[180,.16,'square']};
    const [freq,duration,wave]=presets[type]||presets.click;
    osc.type=wave;osc.frequency.setValueAtTime(freq,now);
    if(type==='door')osc.frequency.exponentialRampToValueAtTime(980,now+.18);
    if(type==='success')osc.frequency.exponentialRampToValueAtTime(1100,now+.14);
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.11,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.start(now);osc.stop(now+duration+.02);
  }catch(e){/* Audio is an optional enhancement. */}
}
function startCookingCutscene(kind,product){
  const stockKey=product.stock||'coffee';
  if(state.settings.stock&&(state.stocks[stockKey]||0)<=0){showMessage(`Out of ${stockKey}! Open SHOP to restock before preparing this item.`);playSound('error');renderUpgrades();setModal(ui.shop,true);if(document.pointerLockElement)document.exitPointerLock();return;}
  state.pendingProduct={kind,product};state.cookStep=0;
  const steps=kind==='drink'?
    [
      {emoji:'🧼',title:'1 · Set up your cup',desc:'Choose a clean cup and get your station ready.'},
      {emoji:'🫘',title:'2 · Choose the drink base',desc:product.name==='Matcha Latte'?'Measure matcha powder.':product.name==='Chai Latte'?'Measure the spiced tea.':'Measure the coffee or cocoa base.'},
      {emoji:'🥛',title:'3 · Finish the recipe',desc:product.name==='Iced Coffee'?'Add ice and finish the chilled coffee.':product.name==='Vanilla Latte'?'Add milk and vanilla syrup.':product.name==='Caramel Macchiato'?'Finish with steamed milk and caramel.':product.name==='Cappuccino'?'Top the espresso with silky milk foam.':product.name==='Matcha Latte'?'Whisk in milk until smooth.':product.name==='Chai Latte'?'Add warm milk to the spiced tea.':product.name==='Hot Chocolate'?'Whisk cocoa into warm milk.':'Add milk and finish the drink.'}
    ]:
    [
      {emoji:'🧼',title:'1 · Prepare the tray',desc:'Choose a clean tray and set up your baking station.'},
      {emoji:'🥣',title:'2 · Pick the main ingredients',desc:product.name==='Croissant'?'Prepare the flour and buttery dough.':product.name==='Blueberry Muffin'?'Measure the flour and muffin mixture.':product.name==='Cinnamon Roll'?'Prepare the dough for its cinnamon swirl.':product.name==='Chocolate Cookie'?'Mix the cookie dough.':product.name==='Strawberry Tart'?'Prepare the tart dough.':'Mix the loaf batter.'},
      {emoji:'🔥',title:'3 · Bake and finish',desc:product.name==='Blueberry Muffin'?'Fold in blueberries and finish the muffin.':product.name==='Cinnamon Roll'?'Add cinnamon sugar and finish the swirl.':product.name==='Chocolate Cookie'?'Add chocolate chips and bake the cookie.':product.name==='Strawberry Tart'?'Finish with fresh strawberries.':product.name==='Banana Bread'?'Bake and finish the loaf slice.':'Bake until golden and finish the pastry.'}
    ];
  state.cookSteps=steps;
  if(state.settings.cutscenes){
    setModal(ui.station,false);setModal(ui.shop,false);setModal(ui.cook,true);renderCookStep();
    if(document.pointerLockElement)document.exitPointerLock();
  }else finishCooking();
}
let selectedIngredient = '';
let holdCookTimer = null;
let holdCookProgress = 0;
let holdCookReady = false;
const ingredientSets = {
  drink: [
    [{name:'Clean cup',icon:'🥤'},{name:'Dirty mug',icon:'☕'},{name:'Paper bag',icon:'🛍️'}],
    [{name:'Coffee beans',icon:'🫘'},{name:'Strawberries',icon:'🍓'},{name:'Bread flour',icon:'🌾'}],
    [{name:'Espresso',icon:'☕'},{name:'Ice cream',icon:'🍨'},{name:'Tomato sauce',icon:'🍅'}],
    [{name:'Milk',icon:'🥛'},{name:'Pickles',icon:'🥒'},{name:'Lettuce',icon:'🥬'}],
    [{name:'Lid and sleeve',icon:'🧋'},{name:'Raw dough',icon:'🥣'},{name:'Dish soap',icon:'🧼'}]
  ],
  pastry: [
    [{name:'Clean tray',icon:'🍽️'},{name:'Coffee filter',icon:'🧻'},{name:'Ice scoop',icon:'🧊'}],
    [{name:'Flour and sugar',icon:'🌾'},{name:'Coffee beans',icon:'🫘'},{name:'Tea leaves',icon:'🍃'}],
    [{name:'Dough mixture',icon:'🥣'},{name:'Soda water',icon:'🥤'},{name:'Espresso shot',icon:'☕'}],
    [{name:'Oven and topping',icon:'🔥'},{name:'Ice cubes',icon:'🧊'},{name:'Milk foam',icon:'🥛'}],
    [{name:'Fresh garnish',icon:'🍓'},{name:'Coffee grounds',icon:'🫘'},{name:'Paper napkin only',icon:'🧻'}]
  ]
};
function correctIngredient(kind, product, stepIndex){
  const n=product.name.toLowerCase();
  if(stepIndex===0)return kind==='drink'?'Clean cup':'Clean tray';
  if(stepIndex===1){
    if(n.includes('matcha'))return 'Matcha powder';
    if(n.includes('chai'))return 'Spiced tea';
    if(kind==='drink')return n.includes('hot chocolate')?'Warm cocoa':'Coffee beans';
    return 'Flour and sugar';
  }
  if(kind==='drink'){
    if(n.includes('vanilla'))return 'Vanilla syrup';
    if(n.includes('caramel'))return 'Caramel drizzle';
    if(n.includes('cappuccino'))return 'Milk foam';
    if(n.includes('iced'))return 'Ice';
    if(n.includes('hot chocolate'))return 'Warm cocoa';
    if(n.includes('matcha'))return 'Milk';
    if(n.includes('chai'))return 'Milk';
    return 'Milk';
  }
  if(n.includes('blueberry'))return 'Blueberries';
  if(n.includes('strawberry'))return 'Strawberries';
  if(n.includes('chocolate'))return 'Chocolate chips';
  if(n.includes('cinnamon'))return 'Cinnamon sugar';
  return 'Oven and topping';
}
function optionsForCookStep(kind,product,stepIndex){
  const expected=correctIngredient(kind,product,stepIndex);
  const fallback=ingredientSets[kind][stepIndex];
  const options=fallback.map(o=>({...o}));
  const labels={
    'Matcha powder':{name:'Matcha powder',icon:'🍵'},'Spiced tea':{name:'Spiced tea',icon:'🍃'},'Clean cup':{name:'Clean cup',icon:'🥤'},'Clean tray':{name:'Clean tray',icon:'🍽️'},'Flour and sugar':{name:'Flour and sugar',icon:'🌾'},'Coffee beans':{name:'Coffee beans',icon:'🫘'},'Oven and topping':{name:'Oven and topping',icon:'🔥'},
    'Warm cocoa':{name:'Warm cocoa',icon:'🍫'},'Vanilla syrup':{name:'Vanilla syrup',icon:'🍯'},
    'Caramel drizzle':{name:'Caramel drizzle',icon:'🍮'},'Milk foam':{name:'Milk foam',icon:'🥛'},
    'Ice':{name:'Ice',icon:'🧊'},'Blueberries':{name:'Blueberries',icon:'🫐'},
    'Strawberries':{name:'Strawberries',icon:'🍓'},'Chocolate chips':{name:'Chocolate chips',icon:'🍫'},
    'Cinnamon sugar':{name:'Cinnamon sugar',icon:'🧂'},'Milk':{name:'Milk',icon:'🥛'}
  };
  if(!options.some(o=>o.name===expected))options[1]=labels[expected]||{name:expected,icon:'✨'};
  return {expected,options};
}
function renderCookStep(){
  const step=state.cookSteps[state.cookStep];
  $('cookEmoji').textContent=step.emoji;$('cookTitle').textContent=step.title;$('cookDescription').textContent=step.desc;
  $('cookStepLabel').textContent=`STEP ${state.cookStep+1} OF ${state.cookSteps.length} · PICK THE RIGHT INGREDIENT`;
  $('cookProgress').style.width=`${state.cookStep/state.cookSteps.length*100}%`;
  selectedIngredient='';holdCookProgress=0;holdCookReady=false;
  const pending=state.pendingProduct;
  const {expected,options}=optionsForCookStep(pending.kind,pending.product,state.cookStep);
  const tray=$('ingredientChoices');tray.innerHTML='';
  // Randomize option positions so the correct answer is not always in the same spot.
  options.sort(()=>Math.random()-.5);
  options.forEach(opt=>{
    const b=document.createElement('button');b.type='button';b.className='ingredient-choice';b.innerHTML=`<span>${opt.icon}</span><strong>${opt.name}</strong>`;
    b.addEventListener('click',()=>{
      if(holdCookReady)return;
      selectedIngredient=opt.name;
      tray.querySelectorAll('.ingredient-choice').forEach(x=>x.classList.remove('selected','wrong'));
      b.classList.add('selected');
      if(opt.name!==expected){b.classList.add('wrong');$('holdCookButton').textContent='Not quite — choose again';playSound('error');}
      else{$('holdCookButton').textContent='HOLD TO PREPARE';playSound('click');}
    });
    tray.appendChild(b);
  });
  $('holdCookButton').disabled=false;$('holdCookButton').classList.remove('ready');$('holdCookButton').style.setProperty('--hold-progress','0%');$('holdCookButton').textContent='HOLD TO PREPARE';
  $('cookNextButton').disabled=true;$('cookNextButton').textContent='PREPARE THE INGREDIENT FIRST';
  playSound(state.cookStep===2?'coffee':'click');
}
function stopCookHold(){if(holdCookTimer){clearInterval(holdCookTimer);holdCookTimer=null;}}
function beginCookHold(){
  if(!state.pendingProduct||holdCookReady)return;
  const {expected}=optionsForCookStep(state.pendingProduct.kind,state.pendingProduct.product,state.cookStep);
  if(selectedIngredient!==expected){$('holdCookButton').textContent='Choose the correct ingredient first';playSound('error');return;}
  stopCookHold();holdCookProgress=0;
  $('holdCookButton').textContent='KEEP HOLDING…';
  holdCookTimer=setInterval(()=>{
    // Quicker preparation, with extra speed for trained café staff.
    const hasBarista=state.staff.some(w=>w.role==='barista');
    const hasCook=state.staff.some(w=>w.role==='cook');
    holdCookProgress+=12+(hasBarista?4:0)+(hasCook?4:0);
    $('cookProgress').style.width=`${Math.min(100,((state.cookStep+holdCookProgress/100)/state.cookSteps.length)*100)}%`;
    $('holdCookButton').style.setProperty('--hold-progress',`${holdCookProgress}%`);
    if(holdCookProgress>=100){
      stopCookHold();holdCookReady=true;$('holdCookButton').classList.add('ready');$('holdCookButton').textContent='STEP COMPLETE ✓';
      $('cookNextButton').disabled=false;$('cookNextButton').textContent=state.cookStep===state.cookSteps.length-1?'FINISH FOOD':'CONTINUE TO NEXT STEP';
      playSound('success');
    }
  },40);
}
function advanceCookStep(){
  if(!holdCookReady)return;
  if(state.cookStep<state.cookSteps.length-1){state.cookStep++;renderCookStep();}else finishCooking();
}
function finishCooking(){
  stopCookHold();
  const pending=state.pendingProduct;if(!pending)return;
  const {kind,product}=pending;
  if(state.settings.stock){const stockKey=product.stock||'coffee';if((state.stocks[stockKey]||0)<=0){setModal(ui.cook,false);state.pendingProduct=null;showMessage(`Out of ${stockKey}! Buy supplies in the shop.`);playSound('error');return;}state.stocks[stockKey]--;}
  state.preparedProducts.push({kind,name:product.name,icon:product.icon});
  if(kind==='drink'){
    state.drinkInventory++;state.drinksMade++;state.tasks.firstDrink=true;
    showMessage(`${product.name} ready for pickup!`);setTip(`${product.name} made. Check the active ticket and make any missing items.`);
  }else{
    state.pastryInventory++;state.pastriesMade++;
    showMessage(`${product.name} placed on the serving tray!`);setTip(`${product.name} ready. Head to the register to serve an order.`);
  }
  state.pendingProduct=null;setModal(ui.cook,false);playSound('success');updateHUD();
}
function makeProduct(kind,product){
  startCookingCutscene(kind,product);
}


function serveOrder(order){
  const neededDrink=order.items.find(i=>i.kind==='drink');
  const neededPastry=order.items.find(i=>i.kind==='pastry');
  let correct=0,possible=order.items.length;
  // Match the exact requested menu item, not just any drink or pastry.
  for(const needed of order.items){
    const preparedIndex=state.preparedProducts.findIndex(p=>p.kind===needed.kind&&p.name===needed.name);
    if(preparedIndex>=0){
      state.preparedProducts.splice(preparedIndex,1);correct++;
      if(needed.kind==='drink')state.drinkInventory=Math.max(0,state.drinkInventory-1);
      else state.pastryInventory=Math.max(0,state.pastryInventory-1);
    }
  }
  if(correct===0){
    const missing=order.items.map(i=>i.name).join(' and ');
    showMessage(`Not the right recipe yet. This ticket needs: ${missing}.`);
    setTip(`Read the ticket carefully and prepare the exact menu items: ${missing}.`);playSound('error');return;
  }
  const ratio=correct/possible;
  let reward=Math.round(order.total*ratio*(1+(state.businessLevel-1)*.08));
  if(state.upgrades.has('machine')&&neededDrink&&correct>0)reward+=2;
  if(state.upgrades.has('pastry')&&neededPastry&&correct===possible)reward+=3;
  if(state.staff.some(w=>w.role==='cashier'))reward=Math.round(reward*1.08);
  const tip=correct===possible?(state.upgrades.has('seats')?4:2):0;
  state.cash+=reward+tip;state.lifetimeRevenue+=reward+tip;state.totalTips+=tip;playSound('cash');
  if(correct===possible){
    state.customersServed++;state.lifetimeServed++;state.tasks.firstServe=true;state.reputation=Math.min(5,state.reputation+.08);
    showMessage(`Perfect order! Earned $${reward}${tip?` + $${tip} tip`:''}.`);
    setTip('Great service! Keep making drinks and pastries for the next customer.');
  }else{
    state.mistakes++;state.reputation=Math.max(.5,state.reputation-.04);
    showMessage(`Partial order served. Earned $${reward}. Try to match every item.`);
  }
  state.orders=state.orders.filter(o=>o.id!==order.id);
  const guest=customers.find(c=>c.userData.order.id===order.id);
  if(guest){guest.userData.served=true;guest.userData.stage='to-seat';guest.userData.wait=0;const seat=guest.userData.seat;if(seat){
    // Route through a clear side aisle first, then approach the chair from its own row.
    // This avoids the old straight-line path cutting through the middle of tables.
    const laneX=seat.x < -3 ? -8.25 : seat.x > 3 ? 8.25 : (seat.x < 0 ? -2.45 : 2.45);
    guest.userData.route=[{x:laneX,z:-4.65},{x:laneX,z:seat.z},{x:seat.x,z:seat.z}];guest.userData.routeIndex=0;
    guest.userData.targetX=guest.userData.route[0].x;guest.userData.targetZ=guest.userData.route[0].z;
    setTip(`${order.customer} received the order and is walking around the tables to a reserved seat.`);
  }else{guest.userData.stage='leaving';guest.userData.targetX=0;guest.userData.targetZ=11;}}
  renderOrders();updateHUD();saveProgress();setModal(ui.station,false);
}
const cafeThemes=[
  {id:'classic',name:'Classic Garden Café',icon:'🌿',cost:0,wall:0xe8d9bf,feature:0x879c7d,wood:0x8c5b3c,accent:0x2c493a,desc:'The original warm wood and sage-green look.'},
  {id:'coastal',name:'Coastal Blue',icon:'🌊',cost:165,wall:0xd9e8e8,feature:0x6c9eae,wood:0xb78d68,accent:0x315b70,desc:'Sea-glass walls, pale timber, and ocean-blue details.'},
  {id:'tokyo',name:'Tokyo Night',icon:'🏮',cost:220,wall:0xe6d7c9,feature:0x8c3f42,wood:0x4b3030,accent:0x262b35,desc:'Deep charcoal, lacquer red, and warm lantern tones.'},
  {id:'nordic',name:'Nordic Minimal',icon:'❄️',cost:190,wall:0xf0eee6,feature:0xb7c8c1,wood:0xc7a77f,accent:0x718d8b,desc:'Bright walls, natural oak, and calm pale-green accents.'},
  {id:'luxe',name:'Midnight Luxe',icon:'✨',cost:320,wall:0xddd4c5,feature:0x25364a,wood:0x604738,accent:0xc39b58,desc:'Navy feature wall, rich wood, and brass details.'}
];
function applyCafeTheme(themeId){
  const theme=cafeThemes.find(t=>t.id===themeId)||cafeThemes[0];state.cafeTheme=theme.id;
  const wallMat=mat('themeWall_'+theme.id,theme.wall),featureMat=mat('themeFeature_'+theme.id,theme.feature),woodMat=mat('themeWood_'+theme.id,theme.wood),accentMat=mat('themeAccent_'+theme.id,theme.accent);
  world.traverse(obj=>{
    if(!obj.isMesh||!obj.name)return;
    const n=obj.name.toLowerCase();
    // Only recolor café pieces near the building; the city keeps its own palette.
    if(Math.abs(obj.position.z)>14)return;
    if(['back wall','left wall','right wall','solid front facade','front header','front facade left corner','front facade right corner','floor','ceiling'].some(k=>n.includes(k)))obj.material=wallMat;
    else if(n.includes('feature wall'))obj.material=featureMat;
    else if(n.includes('tabletop')||n.includes('chair seat')||n.includes('chair back')||n.includes('chair leg')||n.includes('table pedestal')||n.includes('table foot')||n.includes('counter')||n.includes('canopy frame')||n.includes('wall trim')||n.includes('front wall base trim')||n.includes('painted facade pilaster'))obj.material=woodMat;
    else if(n.includes('exterior cafe sign backing')||n.includes('front sign gold frame')||n.includes('awning stripe'))obj.material=accentMat;
  });
  // Update the actual sign colors without changing the player's chosen store name.
  drawStoreName();
}
function buildOutdoorSet(){
  const slots=[[-4.2,25.1],[4.2,25.1],[-4.2,29.2],[4.2,29.2],[-2.4,31.4],[2.4,31.4]];
  const [x,z]=slots[state.outdoorSets%slots.length];
  const table=makeTable(x,z,state.outdoorSets%2===0);
  table.traverse(o=>{if(o.isMesh&&/tabletop/.test(o.name))o.material=mat('outdoorTable_'+state.cafeTheme,cafeThemes.find(t=>t.id===state.cafeTheme)?.wood||0xc18a59);});
  for(const [dx,dz,rot] of [[-1.15,0,Math.PI/2],[1.15,0,-Math.PI/2],[0,-1.15,0],[0,1.15,Math.PI]]){
    const chair=makeChair(x+dx,z+dz,rot,mat('outdoorChair_'+state.cafeTheme,cafeThemes.find(t=>t.id===state.cafeTheme)?.wood||0x8c5b3c));
    chair.traverse(o=>{if(o.isMesh&&/chair/.test(o.name))o.material=mat('outdoorChair_'+state.cafeTheme,cafeThemes.find(t=>t.id===state.cafeTheme)?.wood||0x8c5b3c);});
  }
  colliders.push({x,z,hx:.8,hz:.8,top:1.1,bottom:0});state.outdoorSets++;
}
function removeFurnitureGhost(){
  const saved=furniturePlacement?.savedCamera;
  if(furniturePlacement?.ghost){world.remove(furniturePlacement.ghost);furniturePlacement.ghost.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
  furniturePlacement=null;$('furniturePlacementBar').classList.add('hidden');$('world').classList.remove('placing-furniture');state.paused=false;
  if(saved){player.yaw=saved.yaw;player.pitch=saved.pitch;camera.position.copy(saved.position);camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;camera.updateMatrixWorld();}
}
function makeFurnitureObject(id,x,z,rot=0,ghost=false){
  const wood=mat('individualOutdoorWood_'+state.cafeTheme,cafeThemes.find(t=>t.id===state.cafeTheme)?.wood||0x8c5b3c);
  const obj=id==='table'?makeTable(x,z,((state.outdoorTables%2)===0)):makeChair(x,z,rot,wood);
  if(id==='table')obj.traverse(o=>{if(o.isMesh&&/tabletop|table pedestal|table foot/.test(o.name))o.material=wood;});
  else obj.traverse(o=>{if(o.isMesh&&/chair/.test(o.name))o.material=wood;});
  if(ghost)obj.traverse(o=>{if(o.isMesh){o.material=furnitureGhostMaterial;o.castShadow=false;o.receiveShadow=false;}});
  return obj;
}
function startFurniturePlacement(id,price,name){
  if(furniturePlacement)return;
  state.cash-=price;
  const ghost=makeFurnitureObject(id,0,0,0,true);
  furniturePlacement={id,price,name,rotation:0,ghost,x:0,z:0,valid:false,savedCamera:{position:camera.position.clone(),yaw:player.yaw,pitch:player.pitch}};
  // Switch to a temporary overhead build view so placement works even if the player was indoors.
  state.paused=true;camera.position.set(0,13,24);camera.lookAt(0,0,24);camera.updateMatrixWorld();
  $('placementTitle').textContent=`Place ${name}`;
  $('furniturePlacementBar').classList.remove('hidden');$('world').classList.add('placing-furniture');
  setModal(ui.shop,false);if(document.pointerLockElement)document.exitPointerLock();
  updateHUD();showMessage(`Choose a clear spot in the front park for your ${name.toLowerCase()}. Click to place it.`);
  setTip('FURNITURE PLACEMENT: move the mouse to position the preview, click to place, R to rotate, or Cancel to get your money back.');
}
function updateFurnitureGhost(clientX,clientY){
  if(!furniturePlacement)return;
  const rect=renderer.domElement.getBoundingClientRect();
  furnitureMouse.x=((clientX-rect.left)/rect.width)*2-1;
  furnitureMouse.y=-((clientY-rect.top)/rect.height)*2+1;
  camera.updateMatrixWorld();furnitureRaycaster.setFromCamera(furnitureMouse,camera);
  if(!furnitureRaycaster.ray.intersectPlane(furnitureGround,furnitureHit)){furniturePlacement.valid=false;return;}
  const x=Math.round(furnitureHit.x*2)/2,z=Math.round(furnitureHit.z*2)/2;
  const inPark=x>=-6.5&&x<=6.5&&z>=16.5&&z<=32.5;
  const hx=furniturePlacement.id==='table'?.85:.43,hz=furniturePlacement.id==='table'?.8:.43;
  const overlaps=colliders.some(c=>Math.abs(x-c.x)<hx+c.hx+.12&&Math.abs(z-c.z)<hz+c.hz+.12&&c.top>0.05&&c.bottom<1.25);
  furniturePlacement.x=x;furniturePlacement.z=z;furniturePlacement.valid=inPark&&!overlaps;
  furniturePlacement.ghost.position.set(x,0,z);furniturePlacement.ghost.rotation.y=furniturePlacement.rotation;
  const tint=furniturePlacement.valid?0x8fc7a0:0xe77b70;
  furnitureGhostMaterial.color.setHex(tint);furnitureGhostMaterial.opacity=.55;
}
function finishFurniturePlacement(){
  if(!furniturePlacement)return;
  const p=furniturePlacement;
  if(!p.valid){showMessage('Choose a clear spot in the front park, away from trees, paths, and other furniture.');playSound('error');return;}
  const {id,x,z,rotation}=p;
  removeFurnitureGhost();
  const obj=makeFurnitureObject(id,x,z,rotation,false);
  if(id==='table'){colliders.push({x,z,hx:.82,hz:.75,top:1.1,bottom:0});state.outdoorTables++;}
  else{colliders.push({x,z,hx:.38,hz:.38,top:1,bottom:0});state.outdoorChairs++;}
  state.placedFurniture.push({id,x,z,rotation});saveProgress();
  updateHUD();saveProgress();showMessage(`${id==='table'?'Table':'Chair'} placed! You can buy and position more furniture from the shop.`);playSound('cash');
  if(state.tasks)state.tasks.firstUpgrade=true;
  setTip('Furniture placed. Open SHOP whenever you want to expand your park seating.');
}
function cancelFurniturePlacement(){
  if(!furniturePlacement)return;
  const refund=furniturePlacement.price;removeFurnitureGhost();state.cash+=refund;updateHUD();showMessage(`Placement cancelled. $${refund} refunded.`);setTip('Placement cancelled. Your money was refunded.');
}

function createStaffCharacter(worker,index){
  const g=new THREE.Group();
  const x=[-2.5,0,2.5][index%3], z=-7.35;
  g.position.set(x,0,z);
  const shirt=mat('staffShirt_'+worker.role,worker.role==='barista'?0x355e50:worker.role==='server'?0x496b91:0x78634f);
  const apron=mat('staffApron_'+worker.role,worker.role==='cleaner'?0xd8c9a8:0x283d35);
  const skin=mat('staffSkin_'+index,0xc88f70), hair=mat('staffHair_'+index,0x352a25);
  box(g,'staff torso',0,1.08,0,.58,.78,.34,shirt);
  box(g,'staff apron',0,1.05,.19,.38,.58,.055,apron);
  cyl(g,'staff neck',0,1.53,0,.105,.105,.18,skin,10);
  sphere(g,'staff head',0,1.76,0,.255,skin,16);
  sphere(g,'staff hair',0,1.92,-.035,.265,hair,14);
  for(const ex of [-.09,.09]){
    sphere(g,'staff eye',ex,1.78,.222,.035,M.white,8);
    sphere(g,'staff pupil',ex,1.78,.252,.017,M.black,8);
  }
  sphere(g,'staff nose',0,1.72,.26,.03,skin,8);
  for(const side of [-1,1]){
    box(g,'staff arm',side*.36,1.12,0,.16,.5,.18,shirt).rotation.z=side*.08;
    box(g,'staff leg',side*.16,.39,0,.19,.62,.2,mat('staffPants_'+index,0x30363a));
    box(g,'staff shoe',side*.16,.08,.04,.21,.13,.3,mat('staffShoe_'+index,0x222222));
  }
  box(g,'staff name badge',.16,1.2,.225,.12,.08,.025,M.gold,{castShadow:false});
  g.userData={role:worker.role,phase:index*1.7};
  world.add(g);return g;
}
function syncStaffVisuals(){
  state.staffMeshes.forEach(g=>world.remove(g));state.staffMeshes=[];
  state.staff.forEach((worker,i)=>state.staffMeshes.push(createStaffCharacter(worker,i)));
}
function renderStaffShop(root){
  const heading=document.createElement('div');heading.className='shop-section-title';
  heading.innerHTML='👥 <span><strong>HIRE YOUR TEAM</strong><small>Workers stay hired between days and are paid at closing.</small></span>';root.appendChild(heading);
  const roles=[
    {role:'barista',icon:'☕',name:'Skilled Barista',cost:95,wage:15,desc:'Prepares drinks faster by shortening each hold-to-prepare step.'},
    {role:'cook',icon:'👨‍🍳',name:'Kitchen Cook',cost:125,wage:18,desc:'Speeds up every cooking step and keeps the kitchen moving.'},
    {role:'server',icon:'🛎️',name:'Friendly Server',cost:80,wage:12,desc:'Customers wait 65% longer before leaving.'},
    {role:'host',icon:'🙂',name:'Front-of-House Host',cost:105,wage:14,desc:'Improves patience and helps guests feel welcome.'},
    {role:'cashier',icon:'💵',name:'Cashier',cost:115,wage:16,desc:'Handles checkout and increases successful order earnings by 8%.'},
    {role:'cleaner',icon:'🧹',name:'Café Cleaner',cost:65,wage:10,desc:'Keeps the café polished and adds reputation at each new day.'}
  ];
  roles.forEach(item=>{
    const hired=state.staff.some(w=>w.role===item.role);
    const row=document.createElement('div');row.className='upgrade-item';
    row.innerHTML=`<span class="upgrade-emoji">${item.icon}</span><span class="upgrade-info"><strong>${item.name}${hired?' · HIRED':''}</strong><small>${item.desc}<br>Hire: $${item.cost} · Daily wage: $${item.wage}</small></span><button class="buy-button" ${hired||state.cash<item.cost?'disabled':''}>${hired?'ON TEAM':'HIRE $'+item.cost}</button>`;
    row.querySelector('button').addEventListener('click',()=>{
      if(hired||state.cash<item.cost)return;
      state.cash-=item.cost;state.staff.push({role:item.role,name:item.name,wage:item.wage});syncStaffVisuals();updateHUD();renderUpgrades();saveProgress();
      showMessage(`${item.name} joined your café team!`);setTip(`${item.name} is on the team. Remember to budget $${item.wage} each day for wages.`);playSound('cash');
    });root.appendChild(row);
  });
  if(state.staff.length){
    const payroll=document.createElement('div');payroll.className='daily-menu-row';
    const total=state.staff.reduce((sum,w)=>sum+w.wage,0);
    payroll.innerHTML=`<span>💵</span><div><strong>Daily payroll: $${total}</strong><small>${state.staff.length} employee${state.staff.length===1?'':'s'} hired</small></div><b>PER DAY</b>`;root.appendChild(payroll);
  }
}

function renderExpansionShop(root){
  const themeHeading=document.createElement('div');themeHeading.className='shop-section-title';themeHeading.innerHTML='🎨 <span><strong>CAFÉ THEMES</strong><small>Give your whole shop a new identity.</small></span>';root.appendChild(themeHeading);
  cafeThemes.forEach(theme=>{
    const owned=state.ownedThemes.has(theme.id),active=state.cafeTheme===theme.id;
    const row=document.createElement('div');row.className='upgrade-item theme-item';
    row.innerHTML=`<span class="upgrade-emoji">${theme.icon}</span><span class="upgrade-info"><strong>${theme.name}${active?' · ACTIVE':''}</strong><small>${theme.desc}</small></span><button class="buy-button" ${(!owned&&state.cash<theme.cost)?'disabled':''}>${active?'ACTIVE':owned?'APPLY':'$'+theme.cost}</button>`;
    row.querySelector('button').addEventListener('click',()=>{
      if(owned){applyCafeTheme(theme.id);renderUpgrades();showMessage(`${theme.name} applied!`);playSound('success');return;}
      if(state.cash<theme.cost)return;state.cash-=theme.cost;state.ownedThemes.add(theme.id);applyCafeTheme(theme.id);updateHUD();renderUpgrades();showMessage(`${theme.name} unlocked!`);playSound('cash');
    });root.appendChild(row);
  });
  const furnitureHeading=document.createElement('div');furnitureHeading.className='shop-section-title';furnitureHeading.innerHTML='🪑 <span><strong>FURNITURE & OUTDOOR SEATING</strong><small>Buy patio sets to grow your park café.</small></span>';root.appendChild(furnitureHeading);
  const furnitureChoices=[
    {id:'table',icon:'🪵',name:'Outdoor café table',price:48,limit:6,desc:'Add one standalone table to the park seating area.'},
    {id:'chair',icon:'🪑',name:'Outdoor café chair',price:19,limit:18,desc:'Add one extra chair to your outdoor seating.'}
  ];
  furnitureChoices.forEach(item=>{
    const count=item.id==='table'?state.outdoorTables:state.outdoorChairs;
    const row=document.createElement('div');row.className='upgrade-item';
    row.innerHTML=`<span class="upgrade-emoji">${item.icon}</span><span class="upgrade-info"><strong>${item.name} · ${count} owned</strong><small>${item.desc}</small></span><button class="buy-button" ${state.cash<item.price||count>=item.limit?'disabled':''}>${count>=item.limit?'MAX OWNED':'$'+item.price}</button>`;
    row.querySelector('button').addEventListener('click',()=>{
      const current=item.id==='table'?state.outdoorTables:state.outdoorChairs;
      if(state.cash<item.price||current>=item.limit)return;
      startFurniturePlacement(item.id,item.price,item.name);
    });root.appendChild(row);
  });
  const nextPrice=95+state.outdoorSets*45;
  const furniture=document.createElement('div');furniture.className='upgrade-item';
  furniture.innerHTML=`<span class="upgrade-emoji">🪑</span><span class="upgrade-info"><strong>Park patio set ${state.outdoorSets+1}</strong><small>One café table and four chairs for the front park. Sets owned: ${state.outdoorSets}.</small></span><button class="buy-button" ${state.cash<nextPrice||state.outdoorSets>=6?'disabled':''}>${state.outdoorSets>=6?'PARK FULL':'$'+nextPrice}</button>`;
  furniture.querySelector('button').addEventListener('click',()=>{if(state.cash<nextPrice||state.outdoorSets>=6)return;state.cash-=nextPrice;buildOutdoorSet();updateHUD();renderUpgrades();showMessage('New table and chairs placed in the front park!');playSound('cash');});root.appendChild(furniture);
  renderStaffShop(root);
  renderBusinessExpansion(root);
  const menuHeading=document.createElement('div');menuHeading.className='shop-section-title';menuHeading.innerHTML='📅 <span><strong>DAILY MENU ROADMAP</strong><small>New signature items unlock as each day passes.</small></span>';root.appendChild(menuHeading);
  const menuRoadmap=[...dailyMenuCatalog.filter(item=>item.unlockDay<=state.day),...dailyMenuCatalog.filter(item=>item.unlockDay>state.day).slice(0,4)];
  if(state.day>=10)menuRoadmap.push(dailySpecialForDay(state.day+1));
  menuRoadmap.slice(-8).forEach(item=>{const unlocked=item.unlockDay<=state.day;const row=document.createElement('div');row.className='daily-menu-row';row.innerHTML=`<span>${unlocked?item.icon:'🔒'}</span><div><strong>${unlocked?item.name:`Day ${item.unlockDay} · ${item.name}`}</strong><small>${unlocked?'Available today':`Unlocks in ${item.unlockDay-state.day} day${item.unlockDay-state.day===1?'':'s'}`}</small></div><b>${unlocked?'UNLOCKED':'COMING SOON'}</b>`;root.appendChild(row);});
}

function renderUpgrades(){
  $('upgradeList').innerHTML='';
  upgradeData.forEach(up=>{
    const owned=state.upgrades.has(up.id);
    const item=document.createElement('div');item.className='upgrade-item';
    item.innerHTML=`<span class="upgrade-emoji">${up.icon}</span><span class="upgrade-info"><strong>${up.name}</strong><small>${up.desc}</small></span><button class="buy-button" ${owned||state.cash<up.cost?'disabled':''}>${owned?'OWNED':'$'+up.cost}</button>`;
    item.querySelector('button').addEventListener('click',()=>{
      if(owned||state.cash<up.cost)return;
      state.cash-=up.cost;state.upgrades.add(up.id);state.tasks.firstUpgrade=true;saveProgress();
      if(up.id==='plants'){
        state.reputation=Math.min(5,state.reputation+.45);
        for(const [x,z] of [[-8,-5],[8,-4],[-8,6],[8,6]]){
          cyl(world,'new upgraded planter',x,.4,z,.42,.5,.7,M.woodLight);
          for(let i=0;i<4;i++)sphere(world,'upgrade foliage',x+(Math.random()-.5)*.4,.85+Math.random()*.4,z+(Math.random()-.5)*.4,.25,M.leaf);
        }
      }
      if(up.id==='sign')state.spawnTimer=Math.max(0,state.spawnTimer-5);
      updateHUD();renderUpgrades();showMessage(`${up.name} purchased!`);
    });
    $('upgradeList').appendChild(item);
  });
  renderSupplies();
  renderExpansionShop($('upgradeList'));
}

function renderSupplies(){
  const root=$('upgradeList');
  const heading=document.createElement('div');heading.className='eyebrow';heading.style.margin='20px 0 5px';heading.textContent='INGREDIENT SUPPLIES';root.appendChild(heading);
  const supplies=[['coffee','Coffee beans',12,'☕'],['milk','Fresh milk',10,'🥛'],['vanilla','Vanilla syrup',6,'🍯'],['ice','Ice',8,'🧊'],['caramel','Caramel syrup',6,'🍮'],['matcha','Matcha powder',5,'🍵'],['chocolate','Chocolate',10,'🍫'],['tea','Tea leaves',8,'🫖'],['flour','Flour',12,'🌾'],['berries','Fresh berries',7,'🫐'],['cinnamon','Cinnamon',6,'🟤']];
  supplies.forEach(([id,label,amount,icon])=>{const row=document.createElement('div');row.className='upgrade-item';row.innerHTML=`<span class="upgrade-emoji">${icon}</span><span class="upgrade-info"><strong>${label}</strong><small>Stock: ${state.stocks[id]||0} · Pack of ${amount}</small></span><button class="buy-button">$${Math.max(8,Math.round(amount*1.7))}</button>`;row.querySelector('button').addEventListener('click',()=>{const price=Math.max(8,Math.round(amount*1.7));if(state.cash<price){showMessage('Not enough cash for those supplies.');playSound('error');return;}state.cash-=price;state.stocks[id]=(state.stocks[id]||0)+amount;updateHUD();renderUpgrades();showMessage(`${label} restocked!`);playSound('cash');});root.appendChild(row);});
}

function closeDay(){
  if(!state.running||state.paused)return;
  state.paused=true;
  const goalTarget=3+Math.floor(state.day/2);
  const goalReward=45+state.day*10;
  const goalMet=state.customersServed>=goalTarget;
  if(goalMet&&state.dailyGoalPaidDay!==state.day){state.cash+=goalReward;state.dailyGoalPaidDay=state.day;state.lifetimeRevenue+=goalReward;showMessage(`Daily goal complete! Bonus earned: $${goalReward}.`);}
  const wages=state.staff.reduce((sum,w)=>sum+w.wage,0);
  if(wages){state.cash=Math.max(0,state.cash-wages);showMessage(`Daily staff wages paid: $${wages}.`);updateHUD();}
  saveProgress();
  setModal(ui.endDay,true);
  const gross=state.customersServed*12;
  $('daySummary').innerHTML=`
    <div class="summary-line"><span>Daily goal (${goalTarget} customers)</span><strong>${goalMet?'COMPLETED +$'+goalReward:'Not completed'}</strong></div>
    <div class="summary-line"><span>Lifetime customers</span><strong>${state.lifetimeServed}</strong></div>
    <div class="summary-line"><span>Lifetime sales</span><strong>$${Math.floor(state.lifetimeRevenue)}</strong></div>
    <div class="summary-line"><span>Customers served</span><strong>${state.customersServed}</strong></div>
    <div class="summary-line"><span>Drinks prepared</span><strong>${state.drinksMade}</strong></div>
    <div class="summary-line"><span>Pastries prepared</span><strong>${state.pastriesMade}</strong></div>
    <div class="summary-line"><span>Orders missed / partial</span><strong>${state.mistakes}</strong></div>
    <div class="summary-line"><span>Staff wages</span><strong>-$${state.staff.reduce((sum,w)=>sum+w.wage,0)}</strong></div>
    <div class="summary-line"><span>Team members</span><strong>${state.staff.length}</strong></div>
    <div class="summary-line"><span>Reputation</span><strong>★ ${state.reputation.toFixed(1)}</strong></div>
    <div class="summary-line total"><span>Current cash</span><strong>$${Math.floor(state.cash)}</strong></div>`;
  if(document.pointerLockElement)document.exitPointerLock();
}
function nextDay(){
  state.day++;state.daySeconds=0;state.customersServed=0;
  if(state.staff.some(w=>w.role==='cleaner'))state.reputation=Math.min(5,state.reputation+.12);state.mistakes=0;state.drinksMade=0;state.pastriesMade=0;
  state.orders=[];state.drinkInventory=0;state.pastryInventory=0;state.preparedProducts=[];state.spawnTimer=2;state.paused=false;saveProgress();
  customers.splice(0).forEach(c=>world.remove(c));occupiedCafeSeats.clear();renderOrders();updateHUD();setModal(ui.endDay,false);
  setTip('A new day begins! Welcome your customers and keep those orders moving.');
  const newItems=dailyMenuCatalog.filter(item=>item.unlockDay===state.day);
  if(newItems.length){showMessage(`Day ${state.day}: New menu item unlocked — ${newItems[0].name}!`);setTip(`Today's new special is ${newItems[0].name}. It's now available at your kitchen station and may appear in customer orders.`);}
  else showMessage(`Day ${state.day} is open!`);
  if(document.pointerLockElement)document.exitPointerLock();
}

// First-person pointer lock controls
const keys={};
let previousTime=performance.now();
function requestLock(){renderer.domElement.requestPointerLock?.();}
function openSettings(){
  $('difficultySelect').value=state.settings.difficulty;
  $('stockToggle').checked=state.settings.stock;$('cutsceneToggle').checked=state.settings.cutscenes;
  $('rushToggle').checked=state.settings.rush;$('soundToggle').checked=state.settings.sound;$('autoDoorToggle').checked=state.settings.autoDoor;
  $('sensitivityRange').value=state.settings.sensitivity;
  setModal($('settingsModal'),true);if(document.pointerLockElement)document.exitPointerLock();
}
function saveSettings(){
  state.settings.difficulty=$('difficultySelect').value;state.settings.stock=$('stockToggle').checked;
  state.settings.cutscenes=$('cutsceneToggle').checked;state.settings.rush=$('rushToggle').checked;
  state.settings.sound=$('soundToggle').checked;state.settings.autoDoor=$('autoDoorToggle').checked;state.settings.sensitivity=Number($('sensitivityRange').value);
  setModal($('settingsModal'),false);showMessage('Settings saved. Your café, your rules!');playSound('click');
}

function startGame(){
  applyCafeTheme(state.cafeTheme||'classic');
  state.running=true;state.paused=false;
  ui.title.classList.add('hidden');ui.pause.classList.add('hidden');
  ui.hud.classList.remove('hidden');ui.crosshair.classList.remove('hidden');
  ui.orders.classList.remove('hidden');ui.tasks.classList.remove('hidden');ui.bottom.classList.remove('hidden');
  updateHUD();renderOrders();
  // Start with a free mouse so the HUD buttons are immediately clickable. Click the world to capture the mouse for looking around.
  if(document.pointerLockElement)document.exitPointerLock();
  showMessage(`Welcome to ${storeName}! Click the game view to look around; press Tab to free your mouse.`);
  setTip(state.settings.stock?'SHOP: click the button or press B. Click the game view to look around; press Tab to free the mouse for menus. Keep ingredients supplied, make a drink, then serve a ticket.':'SHOP: click the button or press B. Click the game view to look around; press Tab to free the mouse for menus. Stock is unlimited. Make a drink, then serve a ticket.');
  state.spawnTimer=2;saveProgress();
}
function pauseGame(){
  if(!state.running||!ui.station.classList.contains('hidden')||!ui.shop.classList.contains('hidden'))return;
  state.paused=true;ui.pause.classList.remove('hidden');
  if(document.pointerLockElement)document.exitPointerLock();
}
function resumeGame(){
  state.paused=false;ui.pause.classList.add('hidden');requestLock();
}
document.addEventListener('pointerlockchange',()=>{
  state.pointerLocked=document.pointerLockElement===renderer.domElement;
});
document.addEventListener('mousemove',e=>{
  if(!state.pointerLocked||state.paused||!state.running)return;
  const sens=(state.settings.sensitivity||12)/12;player.yaw-=e.movementX*.00185*sens;
  player.pitch-=e.movementY*.0015*sens;
  player.pitch=clamp(player.pitch,-1.25,1.25);
});
document.addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(['KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code))e.preventDefault();
  // UI access while playing: Tab releases the mouse without pausing, B opens the shop.
  if(e.code==='KeyR'&&furniturePlacement&&!e.repeat){e.preventDefault();furniturePlacement.rotation+=Math.PI/4;furniturePlacement.ghost.rotation.y=furniturePlacement.rotation;return;}
  if(e.code==='Escape'&&furniturePlacement){cancelFurniturePlacement();return;}
  if(e.code==='Tab'&&state.running&&!e.repeat){e.preventDefault();if(document.pointerLockElement)document.exitPointerLock();else showMessage('Mouse is free — click the game view when you want to look around again.');return;}
  if(e.code==='KeyB'&&state.running&&!e.repeat&&ui.shop.classList.contains('hidden')){renderUpgrades();setModal(ui.shop,true);if(document.pointerLockElement)document.exitPointerLock();return;}
  if(e.code==='Escape'&&state.running&&!$('settingsModal').classList.contains('hidden')){setModal($('settingsModal'),false);return;}
  if(e.code==='Escape'&&state.running&&!ui.cook.classList.contains('hidden')){finishCooking();return;}
  if(e.code==='Escape'&&state.running&&!ui.station.classList.contains('hidden')){setModal(ui.station,false);return;}
  if(e.code==='Escape'&&state.running&&!ui.cook.classList.contains('hidden')){setModal(ui.cook,false);state.pendingProduct=null;return;}
  if(e.code==='Escape'&&state.running&&!ui.endDay.classList.contains('hidden')){setModal(ui.endDay,false);state.paused=false;return;}
  if(e.code==='Escape'&&state.running&&!ui.shop.classList.contains('hidden')){setModal(ui.shop,false);return;}
  if(e.code==='Escape'&&state.running&&!ui.endDay.classList.contains('hidden'))return;
  if(e.code==='Escape'&&state.running){if(state.paused)resumeGame();else pauseGame();}
  if(e.code==='KeyP'&&state.running&&!e.repeat){if(state.paused)resumeGame();else pauseGame();}
  if(e.code==='KeyE'&&state.running&&!state.paused&&ui.station.classList.contains('hidden')&&ui.shop.classList.contains('hidden'))interact();
});
document.addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('pointermove',e=>{if(furniturePlacement)updateFurnitureGhost(e.clientX,e.clientY);});
renderer.domElement.addEventListener('click',e=>{
  if(furniturePlacement){updateFurnitureGhost(e.clientX,e.clientY);finishFurniturePlacement();return;}
  if(state.running&&!state.paused&&!furniturePlacement&&ui.station.classList.contains('hidden')&&ui.shop.classList.contains('hidden')&&ui.cook.classList.contains('hidden')&&!state.pointerLocked)requestLock();
});
const loadedSave=loadProgress();
restorePlacedFurniture();
if(loadedSave)drawStoreName();
const nameInput=$('storeNameInput');
if(nameInput){
  nameInput.value=storeName||'Little Bean Café';
  nameInput.addEventListener('input',()=>{storeName=nameInput.value.trim().slice(0,28)||'My Café';drawStoreName();saveProgress();});
}
$('startButton').addEventListener('click',()=>{storeName=(nameInput?.value||storeName||'My Café').trim().slice(0,28)||'My Café';drawStoreName();saveProgress();startGame();});
$('pauseButton').addEventListener('click',pauseGame);
$('resumeButton').addEventListener('click',resumeGame);
$('resetButton').addEventListener('click',()=>location.reload());
$('closeStation').addEventListener('click',()=>setModal(ui.station,false));
$('closeShop').addEventListener('click',()=>setModal(ui.shop,false));
$('quickShopButton').addEventListener('click',()=>{renderUpgrades();setModal(ui.shop,true);if(document.pointerLockElement)document.exitPointerLock();});
$('settingsButton').addEventListener('click',()=>openSettings());
$('closeSettings').addEventListener('click',()=>setModal($('settingsModal'),false));
$('closeCook').addEventListener('click',()=>{setModal(ui.cook,false);state.pendingProduct=null;stopCookHold();holdCookReady=false;$('holdCookButton').classList.remove('ready');$('holdCookButton').style.setProperty('--hold-progress','0%');});
$('closeEndDay').addEventListener('click',nextDay);
$('closePause').addEventListener('click',resumeGame);
$('rotatePlacement').addEventListener('click',()=>{if(furniturePlacement){furniturePlacement.rotation+=Math.PI/4;furniturePlacement.ghost.rotation.y=furniturePlacement.rotation;}});
$('cancelPlacement').addEventListener('click',cancelFurniturePlacement);
$('cookNextButton').addEventListener('click',advanceCookStep);
$('holdCookButton').addEventListener('pointerdown',e=>{e.preventDefault();beginCookHold();});
for(const ev of ['pointerup','pointerleave','pointercancel'])$('holdCookButton').addEventListener(ev,()=>{if(!holdCookReady&&holdCookTimer){stopCookHold();$('holdCookButton').textContent='Released — hold again';}});
$('cookSkipButton').addEventListener('click',finishCooking);
$('saveSettingsButton').addEventListener('click',saveSettings);
$('nextDayButton').addEventListener('click',nextDay);
window.addEventListener('pagehide',saveProgress);
window.addEventListener('beforeunload',saveProgress);
setInterval(()=>{if(state.running&&!furniturePlacement)saveProgress();},10000);
$('endDayButton')?.addEventListener('click',closeDay);

// Collision uses the player's circle against simple rectangular obstacles.
function blocked(x,z){
  if(x<-74||x>74||z<-64||z>124)return true;
  // The front wall is open only at the entrance; keep players from passing through glass.
  if(z>10.85&&z<12.25&&Math.abs(x)>1.2)return true;
  for(const c of colliders){
    if(Math.abs(x-c.x)<c.hx+player.radius&&Math.abs(z-c.z)<c.hz+player.radius)return true;
  }
  // Collision around bulky equipment, the bakery display, and the rear prep island.
  const props=[[-3.2,-9.35,.82,.48],[-4.05,-9.48,.3,.32],[3.9,-9.55,.86,.5],[2.9,-9.55,2.45,.72],[-3.2,-9.45,1.3,.72]];
  for(const [cx,cz,hx,hz] of props)if(Math.abs(x-cx)<hx+player.radius&&Math.abs(z-cz)<hz+player.radius)return true;
  return false;
}
function movePlayer(dt){
  if(furniturePlacement||!state.running||state.paused||!state.pointerLocked)return;
  const forward=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
  const right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw));
  const dir=new THREE.Vector3();
  if(keys.KeyW||keys.ArrowUp)dir.add(forward);
  if(keys.KeyS||keys.ArrowDown)dir.sub(forward);
  if(keys.KeyD||keys.ArrowRight)dir.add(right);
  if(keys.KeyA||keys.ArrowLeft)dir.sub(right);
  if(dir.lengthSq()>0){
    dir.normalize();const sprint=keys.ShiftLeft||keys.ShiftRight?1.75:1;
    const nx=player.x+dir.x*player.speed*sprint*dt;
    const nz=player.z+dir.z*player.speed*sprint*dt;
    if(!blocked(nx,player.z))player.x=nx;
    if(!blocked(player.x,nz))player.z=nz;
    player.moving=true;
  }else player.moving=false;
  if(!furniturePlacement){camera.position.set(player.x,1.68+(player.moving?Math.sin(performance.now()*.012)*.025:0),player.z);camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;}
}
function interact(){
  let closest=null,best=Infinity;
  const forward=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
  for(const item of interactables){
    const dx=item.x-player.x,dz=item.z-player.z;
    const dist=Math.hypot(dx,dz);
    if(dist>item.radius)continue;
    const dot=(dx*forward.x+dz*forward.z)/(dist||1);
    if(dot<-.25)continue;
    if(dist<best){best=dist;closest=item;}
  }
  if(!closest){showMessage('Move closer to a station and look toward it to interact.');return;}
  if(closest.action==='close'){closeDay();return;}
  openStation(closest.action);
}
function updateHint(){
  if(!state.running||state.paused||!state.pointerLocked||!ui.station.classList.contains('hidden')||!ui.shop.classList.contains('hidden')){
    ui.hint.classList.add('hidden');return;
  }
  let closest=null,best=Infinity;
  const f=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
  for(const item of interactables){
    const dx=item.x-player.x,dz=item.z-player.z,dist=Math.hypot(dx,dz);
    if(dist>item.radius)continue;
    const dot=(dx*f.x+dz*f.z)/(dist||1);
    if(dot<-.25)continue;
    if(dist<best){best=dist;closest=item;}
  }
  if(closest){
    ui.hint.classList.remove('hidden');ui.hintText.textContent=closest.label;
  }else ui.hint.classList.add('hidden');
  for(const item of interactables){
    if(item.mesh)item.mesh.material=closest===item?markerHighlightMat:markerMat;
  }
}
function updateCustomers(dt){
  for(const worker of state.staffMeshes){worker.position.y=Math.sin(performance.now()*.0015+worker.userData.phase)*.012;}
  for(const c of [...customers]){
    const u=c.userData;
    const walking=u.stage==='approach'||u.stage==='to-seat'||u.stage==='leaving';
    if(walking){
      const dx=u.targetX-c.position.x,dz=u.targetZ-c.position.z,dist=Math.hypot(dx,dz);
      if(dist>.08){
        const step=Math.min(dist,2.35*dt);c.position.x+=dx/dist*step;c.position.z+=dz/dist*step;
        // Character face is local +Z; yaw points it along its actual travel direction.
        c.rotation.y=Math.atan2(dx,dz);
        const swing=Math.sin(performance.now()*.009+u.walkPhase)*.22;
        if(u.legs)u.legs.forEach((leg,i)=>{leg.rotation.x=(i===0?1:-1)*swing;});
        if(u.shoes)u.shoes.forEach((shoe,i)=>{shoe.rotation.x=(i===0?1:-1)*swing*.45;});
        if(u.arms)u.arms.forEach((arm,i)=>{arm.rotation.x=(i===0?-1:1)*swing*.55;});
      }else if(u.stage==='approach'){
        u.stage='waiting';u.wait=0;c.position.x=u.targetX;c.position.z=u.targetZ;c.rotation.y=Math.PI;
        showMessage(`${u.order.customer} is at the counter and waiting for their food.`);
      }else if(u.stage==='to-seat'&&u.route&&u.routeIndex<u.route.length-1){
        // Advance through the precomputed aisle waypoints before the final chair approach.
        u.routeIndex++;u.targetX=u.route[u.routeIndex].x;u.targetZ=u.route[u.routeIndex].z;
      }else if(u.stage==='to-seat'){
        u.stage='seated';u.wait=0;c.position.x=u.seat.x;c.position.z=u.seat.z;c.rotation.y=u.seat.yaw;
        // Lower the body and bend the legs into a seated pose, facing inward toward the table.
        c.position.y=-.34;
        if(u.legs)u.legs.forEach((leg,i)=>{leg.rotation.x=-1.05;leg.position.y=.29;});
        if(u.shoes)u.shoes.forEach((shoe,i)=>{shoe.rotation.x=-.15;shoe.position.z=.17;});
        if(u.torso)u.torso.position.y=.98;
        if(u.arms)u.arms.forEach((arm,i)=>{arm.rotation.x=-.2;arm.rotation.z=(i===0?-1:1)*.18;});
        showMessage(`${u.order.customer} sat down to enjoy the order.`);
      }else if(u.stage==='leaving'){
        if(u.seat)occupiedCafeSeats.delete(u.seat.index);
        world.remove(c);const idx=customers.indexOf(c);if(idx>=0)customers.splice(idx,1);
      }
      continue;
    }
    if(u.stage==='waiting'){
      u.wait+=dt;u.patienceUiTimer=(u.patienceUiTimer||0)-dt;
      if(u.patienceUiTimer<=0){
        u.patienceUiTimer=.18;
        const patienceRatio=clamp(1-u.wait/u.order.patience,0,1);
        const ticket=document.querySelector(`.order-item[data-order-id="${u.order.id}"] .patience-fill`);
        if(ticket){ticket.style.width=`${patienceRatio*100}%`;ticket.classList.toggle('low',patienceRatio<.28);}
      }
      c.position.y=Math.sin(performance.now()*.002+u.phase)*.012;
      if(u.arms)u.arms.forEach((arm,i)=>{arm.rotation.z=(i===0?-1:1)*(.10+Math.sin(performance.now()*.0015+u.walkPhase+i)*.035);});
      if(u.wait>u.order.patience){
        state.orders=state.orders.filter(o=>o.id!==u.order.id);
        if(u.seat)occupiedCafeSeats.delete(u.seat.index);
        world.remove(c);const i=customers.indexOf(c);if(i>=0)customers.splice(i,1);
        renderOrders();updateHUD();showMessage(`${u.order.customer} got tired of waiting and left their reserved seat free.`);
      }
    }else if(u.stage==='seated'){
      // Let guests enjoy their food briefly, then free their chair after they reach the exit.
      u.wait+=dt;
      if(u.wait>18){u.stage='leaving';u.targetX=0;u.targetZ=11;}
    }
  }
}
function updateGame(dt){
  if(!state.running||state.paused||!ui.cook.classList.contains('hidden')||!ui.station.classList.contains('hidden')||!ui.shop.classList.contains('hidden')||!$('settingsModal').classList.contains('hidden'))return;
  state.actionCooldown=Math.max(0,state.actionCooldown-dt);
  if(state.daySeconds>=state.dayDuration){closeDay();return;}
  state.daySeconds+=dt;
  state.spawnTimer-=dt;
  if(state.spawnTimer<=0&&customers.length<customerCapacity()){
    spawnCustomer();
    const difficulty={easy:20,normal:14,hard:9,expert:6}[state.settings.difficulty]||14;state.spawnTimer=Math.max(5,(state.upgrades.has('sign')?difficulty-3:difficulty)*2.1+Math.random()*(difficulty*1.05)-(state.businessLevel-1)*1.8);if(state.settings.rush&&Math.random()<.025)state.spawnTimer=7.5;
  }
  updateCustomers(dt);
  // Refresh HUD text and checklist a few times per second instead of rebuilding DOM every frame.
  state.hudRefreshTimer+=dt;
  if(state.hudRefreshTimer>=.25){state.hudRefreshTimer=0;updateHUD();refreshCustomerOrderStatuses();}
  // The hinged entry door swings open as the player approaches and gently closes behind them.
  const nearDoor=state.settings.autoDoor&&Math.abs(player.x)<1.8&&player.z>8.7&&player.z<13.5;
  doorTarget=nearDoor?1.15:0;
  doorOpen=lerp(doorOpen,doorTarget,Math.min(1,dt*4.5));doorPivot.rotation.y=doorOpen;
  if(nearDoor&&!state.doorWasOutside&&doorChimeCooldown<=0){playSound('door');doorChimeCooldown=1.4;}
  state.doorWasOutside=nearDoor;doorChimeCooldown=Math.max(0,doorChimeCooldown-dt);
}
// Cache the small set of animated fixtures once. Traversing the entire café scene every frame
// was unnecessary work and could cause avoidable stutter on school laptops and older computers.
const animatedPendantShades=[];
world.traverse(obj=>{if(obj.name==='pendant shade')animatedPendantShades.push(obj);});
function animate(){
  requestAnimationFrame(animate);
  const now=performance.now();const dt=Math.min((now-previousTime)/1000,.04);previousTime=now;
  movePlayer(dt);updateGame(dt);updateHint();
  for(const shade of animatedPendantShades)shade.rotation.z=Math.sin(now*.0007+shade.position.x)*.025;
  renderer.render(scene,camera);
}
animate();
window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));
});

// Start at the front walkway, facing into the café.
camera.rotation.order='YXZ';
camera.rotation.y=player.yaw;
camera.rotation.x=player.pitch;
camera.position.set(player.x,1.68,player.z);
