const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),babel=require('@babel/core');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
function load(path,mocks){const module={exports:{}};vm.runInNewContext(babel.transformSync(fs.readFileSync(path,'utf8'),{configFile:false,babelrc:false,presets:[['@babel/preset-env',{targets:{node:'current'}}],['@babel/preset-react',{runtime:'automatic'}]]}).code,{module,exports:module.exports,require:n=>mocks[n]||require(n),__:s=>s});return module.exports.default;}
const TYPE=Object.fromEntries(['DISCONNECT_CORE','SET_SYSTEM_INFO','START_CORE_AUTO_CONNECT','STOP_CORE_AUTO_CONNECT'].map(x=>[x,x]));
const reducer=load('src/shared/store/reducers/core/connectionFailed.js',{'consts/actionTypes':TYPE});
assert.equal(reducer(undefined,{}),false);
assert.equal(reducer(false,{type:TYPE.DISCONNECT_CORE,connectionFailed:true}),true);
for(const type of Object.values(TYPE)) assert.equal(reducer(true,{type}),false);
let state;
const CoreStatus=load('src/shared/components/CoreStatus.js',{'react-redux':{useSelector:f=>f(state)},selectors:{isCoreConnected:s=>!!s.core.systemInfo}});
function render(core){state={core,settings:{manualDaemon:false}};return renderToStaticMarkup(React.createElement(CoreStatus));}
assert.match(render({autoConnect:true}),/data-state="connecting"/);
assert.match(render({autoConnect:true,connectionFailed:true}),/data-state="failed"/);
assert.match(render({autoConnect:false,connectionFailed:true}),/data-state="stopped"/);
assert.equal(render({autoConnect:true,systemInfo:{}}),'');
console.log('PASS: Connection failure, reset/recovery, connecting, stopped, and connected status rendering.');
