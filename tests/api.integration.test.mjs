import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = 18000 + Math.floor(Math.random() * 1000);
const dir = await mkdtemp(join(tmpdir(), 'pakdasht-test-'));
const dbFile = join(dir, 'test.sqlite');
let child;

const base = `http://127.0.0.1:${port}`;
async function request(path, options={}) {
  const headers = {'Content-Type':'application/json', ...(options.headers||{})};
  const r = await fetch(base + path, {...options, headers});
  const d = r.status === 204 ? null : await r.json().catch(()=>({}));
  return {r,d};
}
async function register({username, role='INSPECTOR', organizationName='سازمان آزمون X'}) {
  const position=role==='MANAGER'?'UNION_PRESIDENT':'UNION_INSPECTOR';
  return request('/api/auth/register',{method:'POST',body:JSON.stringify({
    firstName:role==='MANAGER'?'مدیر':'بازرس', lastName:username, personnelCode:username,
    mobile:'09120000000', username, password:'Integration-Password-2026!', organizationName,
    role, position, presidentCode:position==='UNION_PRESIDENT'?'aaa123':''
  })});
}
async function login(username) {
  const password=username==='manager.demo'?'Integration-Manager-2026!':'Integration-Password-2026!';
  const {r,d}=await request('/api/auth/login',{method:'POST',body:JSON.stringify({username,password})});
  assert.equal(r.status,200);
  const set=r.headers.get('set-cookie');
  assert.match(set,/session_token=.*HttpOnly/);
  return set.split(';')[0];
}
async function authRequest(cookie,path,options={}) {
  return request(path,{...options,headers:{...(options.headers||{}),Cookie:cookie}});
}
function point(i){return {latitude:35.4700+i*0.0002,longitude:51.6800+i*0.0002,accuracy:8,timestamp:new Date(Date.now()+i*1000).toISOString()};}

before(async () => {
  child = spawn(process.execPath, ['api/server.mjs'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: {...process.env, NODE_ENV:'development', PORT:String(port), DB_FILE:dbFile, DEMO_MODE:'true', ALLOW_REGISTRATION:'true', AUTH_RATE_LIMIT_MAX:'100', RATE_LIMIT_MAX:'1000', DEMO_MANAGER_PASSWORD:'Integration-Manager-2026!', DEMO_INSPECTOR_PASSWORD:'Integration-Inspector-2026!'},
    stdio:['ignore','pipe','pipe']
  });
  await new Promise((resolve,reject)=>{ const timer=setTimeout(()=>reject(new Error('server start timeout')),5000); child.stdout.on('data',d=>{if(String(d).includes('Pakdasht Inspection listening on')){clearTimeout(timer);resolve();}}); child.on('error',reject); });
});
after(async()=>{child?.kill('SIGTERM');await rm(dir,{recursive:true,force:true});});

test('health endpoint reports a live development database', async()=>{
  const {r,d}=await request('/api/health'); assert.equal(r.status,200); assert.equal(d.ok,true); assert.equal(d.database,'sqlite');
});

test('login establishes an HttpOnly session cookie and me authenticates with it', async()=>{
  const cookie=await login('manager.demo');
  const {r,d}=await authRequest(cookie,'/api/auth/me'); assert.equal(r.status,200); assert.equal(d.user.role,'MANAGER');
});

test('cross-origin API requests are rejected when origin is not allow-listed', async()=>{
  const {r}=await request('/api/health',{headers:{Origin:'https://evil.example'}}); assert.equal(r.status,403);
});

test('mission lifecycle keeps one ACTIVE mission, attaches tracking to it, completes it, then allows a new mission', async()=>{
  const reg=await register({username:'mission.inspector',organizationName:'سازمان مأموریت X'}); assert.equal(reg.r.status,201);
  const cookie=await login('mission.inspector');
  const start1=await authRequest(cookie,'/api/missions',{method:'POST',body:JSON.stringify(point(0))});
  assert.equal(start1.r.status,201);
  const mission1=start1.d.id;
  const startAgain=await authRequest(cookie,'/api/missions',{method:'POST',body:JSON.stringify(point(1))});
  assert.equal(startAgain.r.status,409); assert.equal(startAgain.d.error,'ACTIVE_MISSION_EXISTS'); assert.equal(startAgain.d.missionId,mission1);
  for(let i=1;i<=100;i++){
    const t=await authRequest(cookie,`/api/missions/${mission1}/track`,{method:'POST',body:JSON.stringify(point(i))});
    assert.equal(t.r.status,201); assert.equal(t.d.accepted,true);
  }
  const list1=await authRequest(cookie,'/api/missions');
  assert.equal(list1.r.status,200); assert.equal(list1.d.items.filter(m=>m.status==='ACTIVE').length,1); assert.equal(list1.d.items.length,1);
  const route1=await authRequest(cookie,`/api/route/${mission1}`); assert.equal(route1.r.status,200); assert.equal(route1.d.points.length,100);
  assert.deepEqual(route1.d.points.map(p=>p.seq),Array.from({length:100},(_,i)=>i));
  const end=await authRequest(cookie,`/api/missions/${mission1}/end`,{method:'POST',body:JSON.stringify(point(6))}); assert.equal(end.r.status,200);
  const list2=await authRequest(cookie,'/api/missions'); assert.equal(list2.d.items.find(m=>m.id===mission1).status,'COMPLETED'); assert.equal(list2.d.items.filter(m=>m.status==='ACTIVE').length,0);
  const start2=await authRequest(cookie,'/api/missions',{method:'POST',body:JSON.stringify(point(7))}); assert.equal(start2.r.status,201); assert.notEqual(start2.d.id,mission1);
});

test('concurrent START requests cannot create duplicate ACTIVE missions', async()=>{
  const reg=await register({username:'concurrent.inspector',organizationName:'سازمان همزمانی X'}); assert.equal(reg.r.status,201);
  const cookie=await login('concurrent.inspector');
  const results=await Promise.all([
    authRequest(cookie,'/api/missions',{method:'POST',body:JSON.stringify(point(0))}),
    authRequest(cookie,'/api/missions',{method:'POST',body:JSON.stringify(point(1))})
  ]);
  assert.equal(results.filter(x=>x.r.status===201).length,1);
  assert.equal(results.filter(x=>x.r.status===409).length,1);
  const list=await authRequest(cookie,'/api/missions');
  assert.equal(list.d.items.filter(m=>m.status==='ACTIVE').length,1);
});

test('same normalized organization name reuses one organization and Manager sees its inspectors only', async()=>{
  const org='اتحادیه پوشاک مشترک';
  assert.equal((await register({username:'orgx.manager',role:'MANAGER',organizationName:org})).r.status,201);
  assert.equal((await register({username:'orgx.inspector1',organizationName:org})).r.status,201);
  assert.equal((await register({username:'orgx.inspector2',organizationName:`  ${org}  `})).r.status,201);
  assert.equal((await register({username:'orgx.inspector3',organizationName:org.replace(' ','  ')})).r.status,201);
  const managerCookie=await login('orgx.manager');
  const managerMe=await authRequest(managerCookie,'/api/auth/me');
  const employeeList=await authRequest(managerCookie,'/api/employees');
  assert.equal(employeeList.r.status,200); assert.equal(employeeList.d.items.length,3);
  const ids=employeeList.d.items.map(x=>x.id); assert.equal(new Set(ids).size,3);
  assert.ok(employeeList.d.items.every(x=>x.role==='INSPECTOR'));
  const inspectorOrgIds=await Promise.all(['orgx.inspector1','orgx.inspector2','orgx.inspector3'].map(async username=>(await authRequest(await login(username),'/api/auth/me')).d.user.organizationId));
  assert.equal(new Set([managerMe.d.user.organizationId,...inspectorOrgIds]).size,1);

  assert.equal((await register({username:'orgy.manager',role:'MANAGER',organizationName:'سازمان Y'})).r.status,201);
  assert.equal((await register({username:'orgy.inspector',organizationName:'سازمان Y'})).r.status,201);
  const yCookie=await login('orgy.inspector');
  const yStart=await authRequest(yCookie,'/api/missions',{method:'POST',body:JSON.stringify(point(0))});
  assert.equal(yStart.r.status,201);
  const crossRoute=await authRequest(managerCookie,`/api/route/${yStart.d.id}`);
  assert.equal(crossRoute.r.status,404);
  const yManagerCookie=await login('orgy.manager');
  const yEmployees=await authRequest(yManagerCookie,'/api/employees');
  assert.equal(yEmployees.r.status,200); assert.equal(yEmployees.d.items.length,1);
  assert.equal(managerMe.d.user.organizationId, (await authRequest(managerCookie,'/api/auth/me')).d.user.organizationId);
});

test('historical route UI builds its polyline from ordered GPS points and does not use start-to-end fallback', async()=>{
  const {readFile}=await import('node:fs/promises');
  const source=await readFile(new URL('../web/app.js',import.meta.url),'utf8');
  const fn=source.slice(source.indexOf('function drawHistoricalRouteMap'),source.indexOf('function requestLocation'));
  assert.match(fn,/valid\.map\(p=>/);
  assert.match(fn,/const xy=valid\.map/);
  assert.match(fn,/<polyline points=\"\$\{xy\.map/);
  assert.doesNotMatch(fn,/start_latitude.*end_latitude/);
});

test('Manager can retrieve an inspector mission route as the real ordered GPS points', async()=>{
  const org='سازمان مسیر تاریخی';
  assert.equal((await register({username:'route.manager',role:'MANAGER',organizationName:org})).r.status,201);
  assert.equal((await register({username:'route.inspector',organizationName:org})).r.status,201);
  const inspectorCookie=await login('route.inspector');
  const managerCookie=await login('route.manager');
  const start=await authRequest(inspectorCookie,'/api/missions',{method:'POST',body:JSON.stringify(point(0))}); assert.equal(start.r.status,201);
  const missionId=start.d.id;
  const routePoints=[
    {latitude:35.4700,longitude:51.6800,accuracy:8,timestamp:new Date(Date.now()+1000).toISOString()},
    {latitude:35.4715,longitude:51.6810,accuracy:8,timestamp:new Date(Date.now()+2000).toISOString()},
    {latitude:35.4710,longitude:51.6830,accuracy:8,timestamp:new Date(Date.now()+3000).toISOString()},
    {latitude:35.4725,longitude:51.6840,accuracy:8,timestamp:new Date(Date.now()+4000).toISOString()},
    {latitude:35.4740,longitude:51.6820,accuracy:8,timestamp:new Date(Date.now()+5000).toISOString()}
  ];
  for(const p of routePoints){const r=await authRequest(inspectorCookie,`/api/missions/${missionId}/track`,{method:'POST',body:JSON.stringify(p)});assert.equal(r.r.status,201)}
  const route=await authRequest(managerCookie,`/api/route/${missionId}`);
  assert.equal(route.r.status,200); assert.equal(route.d.points.length,5); assert.deepEqual(route.d.points.map(p=>p.seq),[0,1,2,3,4]);
  assert.deepEqual(route.d.points.map(p=>[p.latitude,p.longitude]),routePoints.map(p=>[p.latitude,p.longitude]));
});
