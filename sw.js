if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let l={};const t=e=>i(e,o),c={module:{uri:o},exports:l,require:t};s[o]=Promise.all(n.map((e=>c[e]||t(e)))).then((e=>(r(...e),l)))}}define(["./workbox-74f2ef77"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"404.html",revision:"cd8504a0c4f8cca4be5c457f4b61e650"},{url:"assets/index-BPSZrHF3.css",revision:null},{url:"assets/index-DuVM4wi6.js",revision:null},{url:"assets/index.es-BevIDtXz.js",revision:null},{url:"assets/purify.es-Bf0oSh3b.js",revision:null},{url:"index.html",revision:"15780883b0543a6400e34261ce763d5c"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"icons/icon-192x192.png",revision:"9ef2da4aa08e74e5b3bb14c4d5273afc"},{url:"icons/icon-512x512.png",revision:"62443cdbf72b2e42b73a506a97fd9b54"},{url:"manifest.webmanifest",revision:"46018ff0618d8a2b1610be43ff4cd89b"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute((({url:e})=>e.origin===self.location.origin),new e.CacheFirst({cacheName:"example-cache",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:86400})]}),"GET")}));
