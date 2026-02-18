"use strict";(()=>{var Q="jeopardy_packs",L="jeopardy_saves",j="jeopardy_game";function h(n){localStorage.setItem(Q,JSON.stringify(n))}function p(){let n=localStorage.getItem(Q);return n?JSON.parse(n):[]}function g(){let n=[],e=localStorage.getItem(L);if(e)try{n=JSON.parse(e)}catch{}let t=localStorage.getItem(j);if(t){try{let o=JSON.parse(t);n.unshift({id:"legacy_"+Date.now(),name:o.pack.title||"\u0421\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u0430\u044F \u0438\u0433\u0440\u0430",savedAt:Date.now(),state:o})}catch{}localStorage.removeItem(j),localStorage.setItem(L,JSON.stringify(n))}return n}function O(n){let e=g(),t=e.findIndex(o=>o.id===n.id);t>=0?e[t]=n:e.push(n),localStorage.setItem(L,JSON.stringify(e))}function w(n){let e=g().filter(t=>t.id!==n);localStorage.setItem(L,JSON.stringify(e))}async function J(){try{let n=await fetch("packs/index.json");if(!n.ok)return;let e=await n.json(),t=p(),o=new Set(t.map(r=>r.title)),a=!1;for(let r of e){let d=await fetch(`packs/${r}`);if(!d.ok)continue;let c=await d.json();!c.title||o.has(c.title)||(t.push(c),o.add(c.title),a=!0)}a&&h(t)}catch{}}function l(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function v(n,e){document.getElementById("custom-modal")?.remove();let t=!!e,o=document.createElement("div");o.id="custom-modal",o.className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",o.innerHTML=`
    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl text-center space-y-4">
      <p class="text-lg">${l(n)}</p>
      <div class="flex gap-3 justify-center">
        ${t?`
          <button id="modal-cancel" class="bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-xl transition-colors">\u041E\u0442\u043C\u0435\u043D\u0430</button>
          <button id="modal-ok" class="bg-red-600 hover:bg-red-500 px-5 py-2.5 rounded-xl font-bold transition-colors">\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C</button>
        `:`
          <button id="modal-ok" class="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-bold transition-colors">\u041E\u043A</button>
        `}
      </div>
    </div>
  `,document.body.appendChild(o),o.addEventListener("click",a=>{a.target===o&&M()}),document.getElementById("modal-ok").addEventListener("click",()=>{M(),e&&e()}),document.getElementById("modal-cancel")?.addEventListener("click",M)}function M(){document.getElementById("custom-modal")?.remove()}var i=null,E=-1;function C(){S(),document.getElementById("btn-create-pack")?.addEventListener("click",()=>{i={title:"",categories:[]},E=-1,G()}),document.getElementById("btn-import-pack")?.addEventListener("click",()=>{let n=document.createElement("input");n.type="file",n.accept=".json",n.onchange=()=>{let e=n.files?.[0];if(!e)return;let t=new FileReader;t.onload=()=>{try{let o=JSON.parse(t.result);if(!o.title||!o.categories)throw new Error;let a=p();a.push(o),h(a),S()}catch{v("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 JSON \u0444\u0430\u0439\u043B")}},t.readAsText(e)},n.click()})}function S(){let n=document.getElementById("pack-list"),e=p();if(e.length===0){n.innerHTML=`
      <p class="text-gray-500 text-center py-8">\u041D\u0435\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0445 \u043D\u0430\u0431\u043E\u0440\u043E\u0432. \u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u0438\u043B\u0438 \u0438\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0439\u0442\u0435 JSON.</p>
    `;return}n.innerHTML=e.map((t,o)=>`
    <div class="bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
      <div class="min-w-0">
        <h3 class="font-bold text-lg truncate">${l(t.title||"\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F")}</h3>
        <p class="text-gray-400 text-sm">${t.categories.length} \u043A\u0430\u0442. / ${t.categories.reduce((a,r)=>a+r.questions.length,0)} \u0432\u043E\u043F\u0440.</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button data-edit-pack="${o}" class="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm transition-colors">\u0420\u0435\u0434.</button>
        <button data-export-pack="${o}" class="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm transition-colors">JSON</button>
        <button data-delete-pack="${o}" class="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg text-sm transition-colors">\u0423\u0434.</button>
      </div>
    </div>
  `).join(""),n.querySelectorAll("[data-edit-pack]").forEach(t=>{t.addEventListener("click",()=>{let o=parseInt(t.dataset.editPack);E=o,i=JSON.parse(JSON.stringify(e[o])),G()})}),n.querySelectorAll("[data-export-pack]").forEach(t=>{t.addEventListener("click",()=>{let o=parseInt(t.dataset.exportPack);Z(e[o])})}),n.querySelectorAll("[data-delete-pack]").forEach(t=>{t.addEventListener("click",()=>{let o=parseInt(t.dataset.deletePack);v(`\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0430\u0431\u043E\u0440 "${e[o].title}"?`,()=>{e.splice(o,1),h(e),S()})})})}function G(){if(!i)return;let n=document.getElementById("editor-area");document.getElementById("editor-list-area").classList.add("hidden"),n.classList.remove("hidden"),n.innerHTML=`
    <div class="space-y-6">
      <!-- \u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043D\u0430\u0431\u043E\u0440\u0430 -->
      <div>
        <label class="block text-sm text-gray-400 mb-1">\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043D\u0430\u0431\u043E\u0440\u0430</label>
        <input id="pack-title" type="text" value="${l(i.title)}"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041E\u0431\u0449\u0438\u0435 \u0437\u043D\u0430\u043D\u0438\u044F" />
      </div>

      <!-- \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 -->
      <div id="categories-container" class="space-y-4"></div>

      <!-- \u041A\u043D\u043E\u043F\u043A\u0438 -->
      <div class="flex gap-3">
        <button id="btn-add-category" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm transition-colors">
          + \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F
        </button>
      </div>

      <div class="flex gap-3 pt-4 border-t border-gray-800">
        <button id="btn-save-pack" class="bg-emerald-600 hover:bg-emerald-500 font-bold px-6 py-3 rounded-xl transition-colors">
          \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C
        </button>
        <button id="btn-cancel-edit" class="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors">
          \u041E\u0442\u043C\u0435\u043D\u0430
        </button>
      </div>
    </div>
  `,m(),document.getElementById("pack-title").addEventListener("input",t=>{i.title=t.target.value}),document.getElementById("btn-add-category").addEventListener("click",()=>{i.categories.push({name:"",questions:[]}),m()}),document.getElementById("btn-save-pack").addEventListener("click",X),document.getElementById("btn-cancel-edit").addEventListener("click",R)}function m(){if(!i)return;let n=document.getElementById("categories-container");n.innerHTML=i.categories.map((e,t)=>`
    <div class="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700/50">
      <div class="flex items-center gap-3">
        <input data-cat-name="${t}" type="text" value="${l(e.name)}"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-bold"
          placeholder="\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" />
        <button data-remove-cat="${t}" class="text-red-400 hover:text-red-300 text-sm transition-colors">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button>
      </div>

      <div data-questions="${t}" class="space-y-2">
        ${e.questions.map((o,a)=>`
          <div class="bg-gray-900/50 rounded-lg p-3 space-y-2">
            <div class="flex gap-2 items-center">
              <div class="flex flex-col gap-0.5 shrink-0">
                <button data-move-up="${t}-${a}" ${a===0?"disabled":""}
                  class="text-gray-400 hover:text-white text-xs leading-none px-1 disabled:opacity-20 transition-colors">\u25B2</button>
                <button data-move-down="${t}-${a}" ${a===e.questions.length-1?"disabled":""}
                  class="text-gray-400 hover:text-white text-xs leading-none px-1 disabled:opacity-20 transition-colors">\u25BC</button>
              </div>
              <input data-q-value="${t}-${a}" type="number" value="${o.value}" step="100" min="0"
                class="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gold text-center font-bold focus:border-blue-500 focus:outline-none"
                placeholder="\u0421\u0443\u043C\u043C\u0430" />
              <input data-q-question="${t}-${a}" type="text" value="${l(o.question)}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                placeholder="\u0412\u043E\u043F\u0440\u043E\u0441" />
              <button data-duplicate-q="${t}-${a}" class="text-blue-400 hover:text-blue-300 text-xs transition-colors shrink-0" title="\u0414\u0443\u0431\u043B\u0438\u0440\u043E\u0432\u0430\u0442\u044C">\u29C9</button>
              <button data-remove-q="${t}-${a}" class="text-red-400 hover:text-red-300 text-xs transition-colors shrink-0">\u2715</button>
            </div>
            <div class="flex gap-2">
              <input data-q-answer="${t}-${a}" type="text" value="${l(o.answer)}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-emerald-400 focus:border-blue-500 focus:outline-none"
                placeholder="\u041E\u0442\u0432\u0435\u0442" />
            </div>
            <div class="flex gap-2 items-center">
              <input data-q-image-url="${t}-${a}" type="text" value="${l(o.image||"")}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-blue-400 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="URL \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0438 (https://...)" />
              ${o.image?`<button data-clear-image="${t}-${a}" class="text-red-400 hover:text-red-300 text-xs transition-colors shrink-0">\u2715</button>`:""}
            </div>
          </div>
        `).join("")}
      </div>

      <button data-add-q="${t}" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">
        + \u0412\u043E\u043F\u0440\u043E\u0441
      </button>
    </div>
  `).join(""),n.querySelectorAll("[data-cat-name]").forEach(e=>{e.addEventListener("input",()=>{let t=parseInt(e.dataset.catName);i.categories[t].name=e.value})}),n.querySelectorAll("[data-remove-cat]").forEach(e=>{e.addEventListener("click",()=>{let t=parseInt(e.dataset.removeCat);i.categories.splice(t,1),m()})}),n.querySelectorAll("[data-q-value]").forEach(e=>{e.addEventListener("input",()=>{let[t,o]=e.dataset.qValue.split("-").map(Number);i.categories[t].questions[o].value=parseInt(e.value)||0})}),n.querySelectorAll("[data-q-question]").forEach(e=>{e.addEventListener("input",()=>{let[t,o]=e.dataset.qQuestion.split("-").map(Number);i.categories[t].questions[o].question=e.value})}),n.querySelectorAll("[data-q-answer]").forEach(e=>{e.addEventListener("input",()=>{let[t,o]=e.dataset.qAnswer.split("-").map(Number);i.categories[t].questions[o].answer=e.value})}),n.querySelectorAll("[data-q-image-url]").forEach(e=>{e.addEventListener("input",()=>{let[t,o]=e.dataset.qImageUrl.split("-").map(Number);i.categories[t].questions[o].image=e.value.trim()||void 0})}),n.querySelectorAll("[data-clear-image]").forEach(e=>{e.addEventListener("click",()=>{let[t,o]=e.dataset.clearImage.split("-").map(Number);i.categories[t].questions[o].image=void 0,m()})}),n.querySelectorAll("[data-move-up]").forEach(e=>{e.addEventListener("click",()=>{let[t,o]=e.dataset.moveUp.split("-").map(Number),a=i.categories[t].questions;o>0&&([a[o],a[o-1]]=[a[o-1],a[o]],m())})}),n.querySelectorAll("[data-move-down]").forEach(e=>{e.addEventListener("click",()=>{let[t,o]=e.dataset.moveDown.split("-").map(Number),a=i.categories[t].questions;o<a.length-1&&([a[o],a[o+1]]=[a[o+1],a[o]],m())})}),n.querySelectorAll("[data-duplicate-q]").forEach(e=>{e.addEventListener("click",()=>{let[t,o]=e.dataset.duplicateQ.split("-").map(Number),a=i.categories[t].questions,r=JSON.parse(JSON.stringify(a[o]));a.splice(o+1,0,r),m()})}),n.querySelectorAll("[data-remove-q]").forEach(e=>{e.addEventListener("click",()=>{let[t,o]=e.dataset.removeQ.split("-").map(Number);i.categories[t].questions.splice(o,1),m()})}),n.querySelectorAll("[data-add-q]").forEach(e=>{e.addEventListener("click",()=>{let t=parseInt(e.dataset.addQ),o=i.categories[t].questions,a=o.length>0?o[o.length-1].value:0;o.push({value:a+100,question:"",answer:""}),m()})})}function X(){if(!i)return;if(!i.title.trim()){v("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043D\u0430\u0431\u043E\u0440\u0430");return}let n=p();E>=0?n[E]=i:n.push(i),h(n),R()}function R(){i=null,E=-1;let n=document.getElementById("editor-area"),e=document.getElementById("editor-list-area");n.classList.add("hidden"),n.innerHTML="",e.classList.remove("hidden"),S()}function Z(n){let e=JSON.stringify(n,null,2),t=new Blob([e],{type:"application/json"}),o=URL.createObjectURL(t),a=document.createElement("a");a.href=o,a.download=`${n.title||"pack"}.json`,a.click(),URL.revokeObjectURL(o)}var s=null,I=null,x=new Set,D=!1,b="",A="";function _(){ee();let n=document.getElementById("players-inputs");n.innerHTML="",T(),T(),D||(D=!0,document.getElementById("btn-add-player")?.addEventListener("click",T),document.getElementById("btn-start-game")?.addEventListener("click",te))}function ee(){let n=document.getElementById("pack-select");if(!n)return;let e=p();n.innerHTML=e.length===0?'<option value="">\u041D\u0435\u0442 \u043D\u0430\u0431\u043E\u0440\u043E\u0432 \u2014 \u0441\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0432 \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440\u0435</option>':e.map((t,o)=>`<option value="${o}">${l(t.title||"\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F")} (${t.categories.length} \u043A\u0430\u0442.)</option>`).join("")}function T(){let n=document.getElementById("players-inputs"),e=n.children.length+1,t=document.createElement("div");t.className="flex gap-2 items-center",t.innerHTML=`
    <input type="text" class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
      placeholder="\u0418\u0433\u0440\u043E\u043A ${e}" value="\u0418\u0433\u0440\u043E\u043A ${e}" />
    <button class="text-red-400 hover:text-red-300 text-sm transition-colors remove-player">\u2715</button>
  `,t.querySelector(".remove-player").addEventListener("click",()=>{n.children.length>1&&t.remove()}),n.appendChild(t)}function te(){let n=p(),e=document.getElementById("pack-select"),t=parseInt(e.value);if(isNaN(t)||!n[t]){v("\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u0430\u0431\u043E\u0440 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432");return}let o=n[t],r=document.getElementById("players-inputs").querySelectorAll('input[type="text"]'),d=Array.from(r).map(y=>({name:y.value.trim()||"\u0418\u0433\u0440\u043E\u043A",score:0}));if(d.length===0){v("\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u043D\u043E\u0433\u043E \u0438\u0433\u0440\u043E\u043A\u0430");return}let c=document.getElementById("timer-input"),k=parseInt(c.value)||0,P=o.categories.map(y=>y.questions.map(()=>!1));b=Date.now().toString(),A=`${o.title} \xB7 ${d.map(y=>y.name).join(", ")}`,s={pack:o,players:d,timer:k,answered:P,currentQuestion:null},H(),$(),u("board")}function U(n){let e=g().find(t=>t.id===n);e&&(s=e.state,b=e.id,A=e.name,$(),u("board"))}function H(){!s||!b||O({id:b,name:A,savedAt:Date.now(),state:s})}function $(){if(!s)return;let n=document.getElementById("game-board"),{pack:e,answered:t}=s,o=Math.max(...e.categories.map(r=>r.questions.length)),a=`<div class="grid gap-1.5" style="grid-template-columns: minmax(110px, 180px) repeat(${o}, minmax(0, 1fr))">`;e.categories.forEach((r,d)=>{a+=`<div class="bg-board flex items-center justify-center py-3 px-3 rounded-l-lg font-bold text-sm text-gold text-center leading-tight">${l(r.name)}</div>`;for(let c=0;c<o;c++){let k=r.questions[c];if(!k){a+='<div class="bg-gray-900/30 rounded p-1"></div>';continue}t[d]?.[c]?a+='<div class="bg-gray-800/30 rounded py-3 text-center"></div>':a+=`
          <button data-cell="${d}-${c}"
            class="bg-cell hover:bg-blue-700 rounded py-3 px-3 text-center font-black text-xl text-gold transition-colors cursor-pointer">
            ${k.value}
          </button>`}}),a+="</div>",n.innerHTML=a,n.querySelectorAll("[data-cell]").forEach(r=>{r.addEventListener("click",()=>{let[d,c]=r.dataset.cell.split("-").map(Number);oe(d,c)})}),ne(),ie()}function ne(){if(!s)return;let n=document.getElementById("scoreboard");n.innerHTML=`
    <div class="flex flex-wrap gap-3 justify-center">
      ${s.players.map(e=>`
        <div class="bg-gray-800 rounded-xl px-5 py-2.5 text-center min-w-[110px]">
          <div class="text-sm text-gray-400 truncate">${l(e.name)}</div>
          <div class="text-2xl font-black ${e.score>=0?"text-gold":"text-red-400"}">${e.score}</div>
        </div>
      `).join("")}
    </div>
  `}function oe(n,e){if(!s)return;s.currentQuestion={catIdx:n,qIdx:e},x=new Set;let t=s.pack.categories[n].questions[e],o=t.image?l(t.image):"",a=document.getElementById("screen-question");a.innerHTML=`
    <div class="w-full mx-auto flex flex-col items-center gap-6">
      <!-- \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F \u0438 \u0441\u0443\u043C\u043C\u0430 -->
      <div class="text-center">
        <span class="text-gray-400 text-sm">${l(s.pack.categories[n].name)}</span>
        <span class="text-gold font-black text-3xl ml-3">${t.value}</span>
      </div>

      <!-- \u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 -->
      ${o?`<img src="${o}" class="max-h-[70vh] w-auto rounded-xl object-contain" alt="\u0412\u043E\u043F\u0440\u043E\u0441" />`:""}

      <!-- \u0412\u043E\u043F\u0440\u043E\u0441 -->
      <div class="text-2xl md:text-4xl font-bold text-center leading-snug px-4">
        ${l(t.question)}
      </div>

      <!-- \u0422\u0430\u0439\u043C\u0435\u0440 -->
      <div id="timer-display" class="text-6xl font-black text-gray-600 ${s.timer===0?"hidden":""}">
        ${s.timer}
      </div>

      <!-- \u041E\u0442\u0432\u0435\u0442 (\u0441\u043A\u0440\u044B\u0442) -->
      <div id="answer-block" class="hidden text-center space-y-2">
        <div class="text-gray-400 text-sm">\u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442:</div>
        <div class="text-3xl font-bold text-emerald-400">${l(t.answer)}</div>
      </div>

      <!-- \u041A\u043D\u043E\u043F\u043A\u0438 \u0438\u0433\u0440\u043E\u043A\u043E\u0432: \u0432\u044B\u0431\u043E\u0440 \u043A\u043E\u043C\u0443 \u043D\u0430\u0447\u0438\u0441\u043B\u0438\u0442\u044C -->
      <div id="player-buttons" class="flex flex-wrap gap-3 justify-center">
        ${s.players.map((r,d)=>`
          <button data-toggle-player="${d}"
            class="px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 text-white">
            ${l(r.name)}
          </button>
        `).join("")}
      </div>
      <p id="selection-hint" class="text-gray-500 text-xs">\u041D\u0430\u0436\u043C\u0438 \u043D\u0430 \u0438\u0433\u0440\u043E\u043A\u0430 \u2014 \u0435\u043C\u0443 \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u0442\u0441\u044F \u043E\u0447\u043A\u0438</p>

      <!-- \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F -->
      <div class="flex flex-wrap gap-3 justify-center mt-2">
        <button id="btn-show-answer" class="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-xl transition-colors">
          \u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043E\u0442\u0432\u0435\u0442
        </button>
        <button id="btn-confirm-next" class="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold transition-colors hidden">
          \u0414\u0430\u043B\u0435\u0435 \u2192
        </button>
        <button id="btn-skip-question" class="bg-yellow-600 hover:bg-yellow-500 px-6 py-3 rounded-xl font-bold transition-colors hidden">
          \u041D\u0438\u043A\u0442\u043E \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B
        </button>
        <button id="btn-back-board" class="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl transition-colors">
          \u041D\u0430\u0437\u0430\u0434 \u043A \u043F\u043E\u043B\u044E
        </button>
      </div>
    </div>
  `,u("question"),re(),a.querySelectorAll("[data-toggle-player]").forEach(r=>{r.addEventListener("click",()=>{let d=parseInt(r.dataset.togglePlayer);ae(d,r)})}),document.getElementById("btn-show-answer").addEventListener("click",()=>{K(),document.getElementById("btn-skip-question")?.classList.remove("hidden")}),document.getElementById("btn-confirm-next").addEventListener("click",()=>{se(t.value)}),document.getElementById("btn-skip-question").addEventListener("click",()=>{f(),z(),s.currentQuestion=null,V()}),document.getElementById("btn-back-board").addEventListener("click",()=>{f(),s.currentQuestion=null,$(),u("board")})}function ae(n,e){x.has(n)?(x.delete(n),e.className="px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 text-white"):(x.add(n),e.className="px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50");let t=document.getElementById("btn-confirm-next"),o=document.getElementById("btn-skip-question"),a=document.getElementById("selection-hint");x.size>0?(t?.classList.remove("hidden"),o?.classList.add("hidden"),a&&(a.textContent=`\u041E\u0447\u043A\u0438 \u043F\u043E\u043B\u0443\u0447\u0430\u0442: ${Array.from(x).map(r=>s.players[r].name).join(", ")}`)):(t?.classList.add("hidden"),!document.getElementById("answer-block")?.classList.contains("hidden")&&o?.classList.remove("hidden"),a&&(a.textContent="\u041D\u0430\u0436\u043C\u0438 \u043D\u0430 \u0438\u0433\u0440\u043E\u043A\u0430 \u2014 \u0435\u043C\u0443 \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u0442\u0441\u044F \u043E\u0447\u043A\u0438"))}function se(n){s&&(f(),x.forEach(e=>{s.players[e].score+=n}),z(),H(),s.currentQuestion=null,V())}function V(){if(!s)return;s.answered.every(e=>e.every(t=>t))?N():($(),u("board"))}function z(){if(!s||!s.currentQuestion)return;let{catIdx:n,qIdx:e}=s.currentQuestion;s.answered[n][e]=!0,H()}function K(){f(),document.getElementById("answer-block")?.classList.remove("hidden")}function re(){if(!s||s.timer===0)return;let n=s.timer,e=document.getElementById("timer-display");e.textContent=String(n),e.classList.remove("text-gray-600"),e.classList.add("text-white"),I=window.setInterval(()=>{n--,e.textContent=String(n),n<=5&&(e.classList.remove("text-white"),e.classList.add("text-red-400")),n<=0&&(f(),e.textContent="\u23F0",K(),document.getElementById("btn-skip-question")?.classList.remove("hidden"))},1e3)}function f(){I!==null&&(clearInterval(I),I=null)}function ie(){if(!s)return;let n=s.answered.every(t=>t.every(o=>o)),e=document.getElementById("btn-end-game");e&&e.classList.toggle("hidden",n),n&&N()}function Y(){document.getElementById("btn-end-game")?.addEventListener("click",()=>{v("\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0438\u0433\u0440\u0443 \u0438 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0438\u0442\u043E\u0433\u0438?",()=>{N()})})}function N(){if(!s)return;f();let n=[...s.players].sort((t,o)=>o.score-t.score),e=n[0]?.score??0;document.getElementById("results-content").innerHTML=`
    <div class="w-full space-y-3">
      ${n.map((t,o)=>{let a=t.score===e&&o===0;return`
        <div class="flex items-center gap-4 ${a?"bg-gold/10 border border-gold/30":"bg-gray-800"} rounded-xl p-4">
          <div class="text-3xl font-black ${a?"text-gold":"text-gray-500"} w-10 text-center">${o+1}</div>
          <div class="flex-1">
            <div class="font-bold text-lg ${a?"text-gold":""}">${a?"\u{1F451} ":""}${l(t.name)}</div>
          </div>
          <div class="text-2xl font-black ${t.score>=0?"text-emerald-400":"text-red-400"}">${t.score}</div>
        </div>`}).join("")}
    </div>
  `,b&&w(b),b="",u("results")}var le="home",F=["home","setup","board","question","results","editor"];function u(n){le=n,F.forEach(e=>{let t=document.getElementById(`screen-${e}`);t&&t.classList.toggle("hidden",e!==n)}),window.location.hash=n,n==="home"&&B()}function B(){let n=document.getElementById("btn-continue");n&&n.classList.toggle("hidden",g().length===0)}function W(){let n=g().sort((t,o)=>o.savedAt-t.savedAt);if(n.length===0){B();return}document.getElementById("save-picker-modal")?.remove();let e=document.createElement("div");e.id="save-picker-modal",e.className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4",e.innerHTML=`
    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
      <h3 class="text-xl font-bold text-center">\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u0433\u0440\u0443</h3>
      <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
        ${n.map(t=>`
          <div class="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div class="min-w-0 flex-1">
              <div class="font-bold text-sm truncate">${l(t.name)}</div>
              <div class="text-xs text-gray-400">${new Date(t.savedAt).toLocaleString("ru")}</div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button data-resume="${t.id}"
                class="bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                \u25B6
              </button>
              <button data-delete-save="${t.id}"
                class="bg-red-600/80 hover:bg-red-500 px-3 py-1.5 rounded-lg text-sm transition-colors">
                \u2715
              </button>
            </div>
          </div>
        `).join("")}
      </div>
      <button id="save-picker-close"
        class="w-full bg-gray-700 hover:bg-gray-600 py-2.5 rounded-xl text-sm transition-colors">
        \u0417\u0430\u043A\u0440\u044B\u0442\u044C
      </button>
    </div>
  `,document.body.appendChild(e),e.querySelectorAll("[data-resume]").forEach(t=>{t.addEventListener("click",()=>{q(),U(t.dataset.resume)})}),e.querySelectorAll("[data-delete-save]").forEach(t=>{t.addEventListener("click",()=>{w(t.dataset.deleteSave),q(),g().length>0?W():B()})}),document.getElementById("save-picker-close")?.addEventListener("click",q),e.addEventListener("click",t=>{t.target===e&&q()})}function q(){document.getElementById("save-picker-modal")?.remove()}async function de(){await J(),B();let n=["home","setup","editor"],e=window.location.hash.replace("#","");e&&n.includes(e)?u(e):u("home"),window.addEventListener("hashchange",()=>{let t=window.location.hash.replace("#","");t&&F.includes(t)&&u(t)}),document.getElementById("btn-new-game")?.addEventListener("click",()=>{_(),u("setup")}),document.getElementById("btn-continue")?.addEventListener("click",W),document.getElementById("btn-editor")?.addEventListener("click",()=>{u("editor")}),C(),Y(),document.querySelectorAll("[data-nav]").forEach(t=>{t.addEventListener("click",()=>{let o=t.dataset.nav;u(o)})})}document.addEventListener("DOMContentLoaded",de);})();
//# sourceMappingURL=bundle.js.map
