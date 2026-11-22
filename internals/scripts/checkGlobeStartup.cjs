const assert = require('assert/strict');
const fs = require('fs');
const vm = require('vm');
const babel = require('@babel/core');
const source = fs.readFileSync('src/App/Overview/Globe.js', 'utf8');
const ast = babel.parseSync(source, {configFile:false, babelrc:false, presets:['@babel/preset-react']});
const globe = ast.program.body.find(n => n.type === 'ExportDefaultDeclaration').declaration;
const method = globe.body.body.find(n => n.key?.name === 'pointRegister');
let request;
const timers = new Map();
let nextId = 0;
const sandbox = {
 callAPI: () => request(), MaxDisplayPoints:64,
 peerCacheKey: () => 'test-core', peerSnapshot: null,
 console:{warn(){}},
 setTimeout(fn,ms){assert.equal(ms,3000); const id=++nextId; timers.set(id,fn); return id;},
 clearTimeout(id){timers.delete(id);},
};
vm.runInNewContext(`class TestGlobe { ${source.slice(method.start,method.end)} } this.TestGlobe=TestGlobe;`,sandbox);
(async()=>{
 const instance=new sandbox.TestGlobe();
 instance.pointRegister=instance.pointRegister.bind(instance);
 instance.pointRegistry=[];
 let updates=0;
 instance.registerPeers=()=>updates++;
 request=async()=>{throw Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:7080'),{code:'ECONNREFUSED'});};
 await assert.doesNotReject(instance.pointRegister());
 assert.equal(timers.size,1);
 request=async()=>[];
 await [...timers.values()][0]();
 assert.equal(timers.size,0); assert.equal(updates,1);
 assert.equal(sandbox.peerSnapshot.key,'test-core');
 let resolvePending;
 let calls=0;
 request=()=>{calls++;return new Promise(resolve=>{resolvePending=resolve;});};
 const refresh=instance.pointRegister();
 await instance.pointRegister();
 assert.equal(calls,1);
 resolvePending([{address:'1.2.3.4:123'}]);
 await refresh;
 assert.equal(sandbox.peerSnapshot.peers.length,1);
 assert.equal(updates,2);
 let rejectPending;
 request=()=>new Promise((resolve,reject)=>{rejectPending=reject;});
 const pending=instance.pointRegister();
 instance.unmounted=true;
 rejectPending(new Error('connection closed'));
 await assert.doesNotReject(pending);
 assert.equal(timers.size,0);
 console.log('PASS: startup retry, peer snapshot caching, overlapping request suppression, and unmount handling.');
})().catch(error=>{console.error(error);process.exitCode=1;});
