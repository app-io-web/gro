if(!self.define){let s,e={};const i=(i,n)=>(i=new URL(i+".js",n).href,e[i]||new Promise((e=>{if("document"in self){const s=document.createElement("script");s.src=i,s.onload=e,document.head.appendChild(s)}else s=i,importScripts(i),e()})).then((()=>{let s=e[i];if(!s)throw new Error(`Module ${i} didn’t register its module`);return s})));self.define=(n,a)=>{const l=s||("document"in self?document.currentScript.src:"")||location.href;if(e[l])return;let r={};const f=s=>i(s,l),c={module:{uri:l},exports:r,require:f};e[l]=Promise.all(n.map((s=>c[s]||f(s)))).then((s=>(a(...s),r)))}}define(["./workbox-74f2ef77"],(function(s){"use strict";self.skipWaiting(),s.clientsClaim(),s.precacheAndRoute([{url:"404.html",revision:"cd8504a0c4f8cca4be5c457f4b61e650"},{url:"assets/index-4PyhNJko.js",revision:null},{url:"assets/index-BPSZrHF3.css",revision:null},{url:"assets/index.es-DWRlGfBz.js",revision:null},{url:"assets/purify.es-Bf0oSh3b.js",revision:null},{url:"index.html",revision:"680da7baed9e0e035b58d8ea82552f3b"},{url:"registerSW.js",revision:"6012dac1e2a5362a3a74d82c7c3fb13b"},{url:"icons/icon-192x192.png",revision:"9ef2da4aa08e74e5b3bb14c4d5273afc"},{url:"icons/icon-512x512.png",revision:"62443cdbf72b2e42b73a506a97fd9b54"},{url:"splash/splash-1125x2436.png",revision:"0841a8fdde0085b0bc3b8c565929f94a"},{url:"splash/splash-1242x2208.png",revision:"4f1bb83cf7dd91a8fe4b13be28397442"},{url:"splash/splash-1280x1920.png",revision:"ed011a750813801aeb694df62f571a5b"},{url:"splash/splash-1536x2048.png",revision:"43d6fe2b277ed46b9cd3dff8bd3cafff"},{url:"splash/splash-1668x2224.png",revision:"7025da89338cbf63c284e7c9dbfd50ec"},{url:"splash/splash-2048x2732.png",revision:"24fbf17669571cc70b4d4087c0d255c8"},{url:"splash/splash-320x426.png",revision:"8b0bb61de58ec049322b4e09b5a62f3e"},{url:"splash/splash-320x470.png",revision:"cb07188dbc21c59268d0f3e6cf7ddb5a"},{url:"splash/splash-480x640.png",revision:"afaf417d8865b52d4aee9afb8118ef4d"},{url:"splash/splash-720x960.png",revision:"ae3dc764b81af0b8a96afdc0366d409c"},{url:"splash/splash-750x1334.png",revision:"9f7fc0c9d2a5f130ef4af111c175579f"},{url:"splash/splash-960x1280.png",revision:"8941833a78bc31283ea5f9493f2a0de2"},{url:"manifest.webmanifest",revision:"26b4f81e7d855a9af0716f349c7f705b"}],{}),s.cleanupOutdatedCaches(),s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL("index.html"))),s.registerRoute((({url:s})=>s.origin===self.location.origin),new s.CacheFirst({cacheName:"example-cache",plugins:[new s.ExpirationPlugin({maxEntries:50,maxAgeSeconds:86400})]}),"GET")}));
