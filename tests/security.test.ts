import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { authenticate, authorize, validateRequest, validBody, validNewsAnalysis, validClassification } from '../security.ts';

const claims: Record<string, object> = {
  authority: { uid: 'admin', role: 'authority', name: 'Trusted Authority' },
  field: { uid: 'field', role: 'field_officer', name: 'Trusted Officer' },
  driver: { uid: 'driver', role: 'driver', vehicleId: 'veh-own' },
  unassigned: { uid: 'new-user' }
};
const app = express();
app.use('/api', authenticate(async token => {
  if (!claims[token]) throw new Error('Invalid token');
  return claims[token] as DecodedIdToken;
}), authorize, express.json(), validateRequest);
app.use('/api', (req, res) => { res.json({ body: req.body }); });
const server = app.listen(0, '127.0.0.1');
const ready = new Promise<void>(resolve => server.on('listening', resolve));
test.after(() => new Promise<void>((resolve,reject) => server.close(err => err ? reject(err) : resolve())));
async function request(route: string, token?: string, body?: object) {
  await ready;
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  return fetch('http://127.0.0.1:' + address.port + '/api' + route, {
    method: body ? 'POST' : 'GET',
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
}
test('health works, while missing, forged and unassigned tokens cannot access data', async () => {
  assert.equal((await request('/health')).status, 200);
  assert.equal((await request('/vehicles')).status, 401);
  assert.equal((await request('/vehicles','forged')).status, 401);
  assert.equal((await request('/vehicles','unassigned')).status, 403);
  assert.equal((await request('/vehicles','driver')).status, 200);
});
test('legacy login and OTP routes never authenticate', async () => {
  for (const route of ['/auth/login','/auth/register','/auth/verify-otp','/auth/forgot-password']) {
    assert.equal((await request(route, undefined, { otp:'4821', role:'authority' })).status,410);
  }
});
test('field officers cannot elevate themselves or trigger command operations', async () => {
  assert.equal((await request('/emergency-mode','field',{})).status,403);
  assert.equal((await request('/audit-logs','field')).status,403);
  assert.equal((await request('/audit-logs','authority')).status,200);
});
test('drivers can update only the vehicle assigned by trusted claims', async () => {
  assert.equal((await request('/vehicles/veh-other/location','driver',{lat:0,lng:0})).status,403);
  assert.equal((await request('/vehicles/veh-own/location','driver',{lat:0,lng:0})).status,200);
  assert.equal((await request('/vehicles/veh-own/location','driver',{lat:91,lng:0})).status,400);
});
const incident = { type:'Landslide',severity:'High',lat:0,lng:0,roadId:'road-nh13',description:'Observed blockage' };
test('incident identity comes from verified token and malformed reports are rejected', async () => {
  const res = await request('/incidents','field',{...incident,reportedBy:'Forged Authority',reportedRole:'authority'});
  assert.equal(res.status,200);
  assert.equal((await res.json()).body.reportedBy,'Trusted Officer');
  assert.equal((await request('/incidents','field',{...incident,description:{}})).status,400);
});
test('sync rejects unsupported operations and invalid nested payloads atomically', () => {
  assert.equal(validBody('/sync',{items:[{id:'1',type:'GPS_LOG',payload:{}}]}),false);
  assert.equal(validBody('/sync',{items:[null]}),false);
  assert.equal(validBody('/sync',{items:[{id:'1',type:'INCIDENT_REPORT',payload:incident}]}),true);
});
test('numeric and AI inputs are bounded, zero coordinates remain valid', () => {
  assert.equal(validBody('/incidents',incident),true);
  assert.equal(validBody('/roads/r1',{riskScore:'100'}),false);
  assert.equal(validBody('/roads/r1',{riskScore:101}),false);
  assert.equal(validBody('/ai/assistant',{question:'hi',history:[{sender:'user',text:{}}]}),false);
  assert.equal(validBody('/ai/assistant',{question:'x'.repeat(4001)}),false);
  assert.equal(validBody('/incidents',{...incident,imageUrl:'javascript:alert(1)'}),false);
  assert.equal(validBody('/roads/r1',JSON.parse('{"__proto__":{}}')),false);
});
test('demo reset is disabled by default even for authorities', async () => {
  delete process.env.ENABLE_DEMO;
  assert.equal((await request('/demo/reset','authority',{})).status,403);
});

test('AI output cannot introduce invalid operational states', () => {
  assert.equal(validNewsAnalysis({title:'x',highway:'NH-13',location:'x',state:'Assam',category:'LANDSLIDE',status:'OVERRIDE',impactSummary:'x',confidenceScore:90}),false);
  assert.equal(validClassification({incidentType:'Landslide',severity:'High',roadImpact:'FULL_BLOCKAGE',confidence:101,recommendedAction:'x',reasoning:'x'}),false);
});
