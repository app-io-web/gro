if(!self.define){let e,i={};const s=(s,n)=>(s=new URL(s+".js",n).href,i[s]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=i,document.head.appendChild(e)}else e=s,importScripts(s),i()})).then((()=>{let e=i[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,t)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(i[r])return;let o={};const d=e=>s(e,r),c={module:{uri:r},exports:o,require:d};i[r]=Promise.all(n.map((e=>c[e]||d(e)))).then((e=>(t(...e),o)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/index-DuwQseDT.js",revision:null},{url:"index.html",revision:"5c3f691d27445dd7babb8109725e269c"},{url:"registerSW.js",revision:"6012dac1e2a5362a3a74d82c7c3fb13b"},{url:"manifest.webmanifest",revision:"741916c484d0154c2a1797cd14d26df5"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
