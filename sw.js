if(!self.define){let e,i={};const n=(n,c)=>(n=new URL(n+".js",c).href,i[n]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()})).then((()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(c,o)=>{const s=e||("document"in self?document.currentScript.src:"")||location.href;if(i[s])return;let r={};const d=e=>n(e,s),b={module:{uri:s},exports:r,require:d};i[s]=Promise.all(c.map((e=>b[e]||d(e)))).then((e=>(o(...e),r)))}}define(["./workbox-74f2ef77"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"404.html",revision:"5cc273909b2e447bee9efda922b53657"},{url:"assets/index-BPSZrHF3.css",revision:null},{url:"assets/index-DKa1zjUF.js",revision:null},{url:"assets/index.es-3eeMWTG4.js",revision:null},{url:"assets/purify.es-Bf0oSh3b.js",revision:null},{url:"index.html",revision:"d2103078d05cdc1a122c34c54995c56d"},{url:"offline.html",revision:"ab4beca7ee13e9bbaf0317a84b5c298f"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"favicon.svg",revision:"b2270fb3ea905742769e84a9a968a4fd"},{url:"icons/android-icon-144x144.png",revision:"3a49979247e55c392801bf62eb1e1db3"},{url:"icons/android-icon-192x192.png",revision:"33246f080ba4c90b19b6f221d60fdb8d"},{url:"icons/android-icon-36x36.png",revision:"95cb37fea6279e1e69f88b61af445fbc"},{url:"icons/android-icon-48x48.png",revision:"f0488b82568d46f28d48167ff2352a47"},{url:"icons/android-icon-72x72.png",revision:"c1d64c52b43ed3069f2cb6b5d8d93b65"},{url:"icons/android-icon-96x96.png",revision:"cf5b8f823db9223ecbf19370f7aa0860"},{url:"icons/apple-icon-114x114.png",revision:"b344cc7f491cd581555fdb00e6366904"},{url:"icons/apple-icon-120x120.png",revision:"7a9f8bf873a7b7aad8fb4c38f85ed475"},{url:"icons/apple-icon-144x144.png",revision:"3a49979247e55c392801bf62eb1e1db3"},{url:"icons/apple-icon-152x152.png",revision:"6dc0e3b574bb2c052957ec56abbe8db2"},{url:"icons/apple-icon-180x180.png",revision:"d555fc4eeb994134c09b3ee9c15ba11d"},{url:"icons/apple-icon-57x57.png",revision:"49fa26e9867af8f7ca99867fd64ab5b4"},{url:"icons/apple-icon-60x60.png",revision:"65fdac476d4726c2ddd2ea90c7564bd8"},{url:"icons/apple-icon-72x72.png",revision:"c1d64c52b43ed3069f2cb6b5d8d93b65"},{url:"icons/apple-icon-76x76.png",revision:"3b2410ddd3ec0572eff57250480ed49f"},{url:"icons/apple-icon-precomposed.png",revision:"33246f080ba4c90b19b6f221d60fdb8d"},{url:"icons/apple-icon.png",revision:"33246f080ba4c90b19b6f221d60fdb8d"},{url:"icons/favicon-16x16.png",revision:"6782ad9d8b09493480d3df575eb27d63"},{url:"icons/favicon-32x32.png",revision:"813862839030b06c4ac007efe5c0c176"},{url:"icons/favicon-96x96.png",revision:"cde9773b132c0b43bd0154c87a08f154"},{url:"icons/icon-144x144.png",revision:"3a49979247e55c392801bf62eb1e1db3"},{url:"icons/icon-192x192.png",revision:"9ef2da4aa08e74e5b3bb14c4d5273afc"},{url:"icons/icon-512x512.png",revision:"62443cdbf72b2e42b73a506a97fd9b54"},{url:"icons/icons-16x16.png",revision:"6782ad9d8b09493480d3df575eb27d63"},{url:"icons/ms-icon-144x144.png",revision:"3a49979247e55c392801bf62eb1e1db3"},{url:"icons/ms-icon-150x150.png",revision:"0fb06098f1f73678ca7b67481ab2ea75"},{url:"icons/ms-icon-310x310.png",revision:"2699788ce5c83894e7ce8ad5b051932f"},{url:"icons/ms-icon-70x70.png",revision:"d0fa243ef9ce0ca522e5e7e3580ca68e"},{url:"manifest.webmanifest",revision:"aefa7d6f76af19da0dc4ba5417bee1b0"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/offline.html"))),e.registerRoute((({url:e})=>e.origin===self.location.origin),new e.CacheFirst({cacheName:"example-cache",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:86400})]}),"GET")}));
