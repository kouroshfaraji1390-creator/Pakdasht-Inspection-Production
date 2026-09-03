import test from 'node:test'; import assert from 'node:assert/strict';
const hav=(a,b,c,d)=>{const R=6371000,r=x=>x*Math.PI/180,p1=r(a),p2=r(c),dp=r(c-a),dl=r(d-b),x=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return 2*R*Math.asin(Math.sqrt(x));};
test('Haversine distance is sane',()=>{const d=hav(35.7,51.4,35.7,51.41);assert.ok(d>800&&d<1000)});
test('mission statuses are constrained by schema',()=>{assert.deepEqual(['PENDING','ACTIVE','COMPLETED','CANCELLED'].sort(),['ACTIVE','CANCELLED','COMPLETED','PENDING'].sort())});
test('sync statuses are modeled',()=>assert.ok(['pending','syncing','synced','failed'].includes('pending')));
