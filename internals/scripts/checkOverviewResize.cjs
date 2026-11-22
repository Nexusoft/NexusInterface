const assert = require('assert/strict');
const fs = require('fs');
const vm = require('vm');
const babel = require('@babel/core');
let nextId = 1;
const frames = new Map();
const requestAnimationFrame = fn => { const id = nextId++; frames.set(id, fn); return id; };
const cancelAnimationFrame = id => frames.delete(id);
const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn()); };
const source = fs.readFileSync('src/App/Overview/Globe.js', 'utf8');
const ast = babel.parseSync(source, {configFile:false, babelrc:false, presets:['@babel/preset-react']});
const globe = ast.program.body.find(n => n.type === 'ExportDefaultDeclaration').declaration;
const methods = globe.body.body.filter(n => ['onWindowResize','resizeGlobe'].includes(n.key?.name)).map(n => source.slice(n.start,n.end)).join('\n');
const sandbox = { requestAnimationFrame, cancelAnimationFrame };
vm.runInNewContext(`class TestGlobe { ${methods} } this.TestGlobe = TestGlobe;`, sandbox);
const instance = new sandbox.TestGlobe();
const sizes = [];
const viewOffsets = [];
Object.assign(instance, {
 props:{modern:true},
 camera:{fov:45, position:{set(){}}, setViewOffset(...args){viewOffsets.push(args);}, updateProjectionMatrix(){}},
 renderer:{setSize(...args){sizes.push(args);}}, controls:{},
 threeRootElement:{clientWidth:600,clientHeight:500,closest(){return null;}},
});
instance.onWindowResize(); instance.onWindowResize();
assert.equal(sizes.length,0); assert.equal(frames.size,1);
flush(); assert.deepEqual(sizes,[[600,500,false]]);
assert.deepEqual(viewOffsets.at(-1), [600,500,0,0,600,500]);
instance.onWindowResize(); flush(); assert.equal(sizes.length,1);
instance.threeRootElement.clientWidth=450;
instance.onWindowResize(); flush(); assert.deepEqual(sizes.at(-1),[450,500,false]);
assert.deepEqual(viewOffsets.at(-1), [450,500,0,0,450,500]);

let observer, cleanup, writes=0;
const container={clientWidth:1000,clientHeight:700,scrollLeft:0,scrollTop:0,addEventListener(){},removeEventListener(){}};
const canvas={parentElement:container,style:{},getContext:()=>({setTransform(){writes++;},clearRect(){}})};
const code = babel.transformSync(fs.readFileSync('src/shared/components/GridTracers.js','utf8'), {
 configFile:false,babelrc:false,presets:[['@babel/preset-env',{targets:{node:'current'}}],['@babel/preset-react',{runtime:'automatic'}]],
}).code;
const moduleMock={exports:{}};
vm.runInNewContext(code,{
 module:moduleMock,exports:moduleMock.exports,requestAnimationFrame,cancelAnimationFrame,
 window:{devicePixelRatio:1,matchMedia:()=>({matches:false,addEventListener(){},removeEventListener(){}})},
 document:{hidden:true,addEventListener(){},removeEventListener(){}},
 ResizeObserver:class {constructor(callback){observer=this;this.callback=callback;} observe(){} disconnect(){this.disconnected=true;}},
 require(name){
  if(name==='react')return {useRef:()=>({current:canvas}),useEffect:fn=>{cleanup=fn();}};
  if(name==='@emotion/styled')return {__esModule:true,default:{canvas:()=> 'canvas'}};
  if(name==='utils/color')return {fade:()=>''};
  return require(name);
 },
});
moduleMock.exports.default();
assert.equal(writes,1);
container.clientWidth=800;
observer.callback(); observer.callback();
assert.equal(writes,1); assert.equal(frames.size,1);
flush(); assert.equal(writes,2); assert.equal(canvas.width,800);
observer.callback(); flush(); assert.equal(writes,2);
assert.equal(canvas.style.width,undefined);
observer.callback(); cleanup();
assert.equal(frames.size,0); assert.equal(observer.disconnected,true);
console.log('PASS: globe and tracer resize callbacks defer writes, coalesce notifications, skip unchanged dimensions, and tracer cleanup cancels pending work.');
