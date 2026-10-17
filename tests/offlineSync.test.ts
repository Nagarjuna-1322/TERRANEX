import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
test('offline sync preserves new arrivals, scopes accounts, and prevents overlapping uploads', async () => {
  const storage = new Map<string,string>();
  const auth = { currentUser: { uid:'officer-a' } };
  let finish: (v: object) => void = () => {};
  let calls = 0;
  const api = { syncOfflineQueue: () => { calls++; return new Promise(resolve => { finish=resolve; }); } };
  const source = readFileSync(new URL('../src/services/offlineSync.ts',import.meta.url),'utf8');
  const module = { exports: {} as any };
  const context = { exports:module.exports, module, require:(name:string)=>name==='./firebase'?{auth}:{api},
    localStorage:{getItem:(k:string)=>storage.get(k)||null,setItem:(k:string,v:string)=>storage.set(k,v),removeItem:(k:string)=>storage.delete(k)},
    navigator:{onLine:true},console,window:{addEventListener(){},removeEventListener(){}} };
  vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,context);
  const service=module.exports.OfflineSyncService;
  const key='terranex_pending_sync_queue:officer-a';
  storage.set(key,JSON.stringify([{id:'first'}]));
  const upload=service.syncPendingItems();
  await service.syncPendingItems();
  assert.equal(calls,1);
  storage.set(key,JSON.stringify([{id:'first'},{id:'arrived-during-upload'}]));
  finish({success:true,syncedIds:['first'],syncedCount:1});
  await upload;
  assert.equal(JSON.parse(storage.get(key)!).length,1);
  assert.equal(JSON.parse(storage.get(key)!)[0].id,'arrived-during-upload');
  auth.currentUser.uid='officer-b';
  assert.equal(service.getQueue().length,0);
  storage.set('terranex_pending_sync_queue:officer-b','{}');
  assert.equal(service.getQueue().length,0);
});
