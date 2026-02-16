"use strict";(()=>{var T="jeopardy_packs",$="jeopardy_game";function x(e){localStorage.setItem(T,JSON.stringify(e))}function m(){let e=localStorage.getItem(T);return e?JSON.parse(e):[]}function h(e){localStorage.setItem($,JSON.stringify(e))}function E(){let e=localStorage.getItem($);return e?JSON.parse(e):null}function P(){localStorage.removeItem($)}async function H(){try{let e=await fetch("packs/index.json");if(!e.ok)return;let t=await e.json(),n=m(),o=new Set(n.map(s=>s.title)),a=!1;for(let s of t){let d=await fetch(`packs/${s}`);if(!d.ok)continue;let c=await d.json();!c.title||o.has(c.title)||(n.push(c),o.add(c.title),a=!0)}a&&x(n)}catch{}}function l(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function p(e,t){document.getElementById("custom-modal")?.remove();let n=!!t,o=document.createElement("div");o.id="custom-modal",o.className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",o.innerHTML=`
    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl text-center space-y-4">
      <p class="text-lg">${l(e)}</p>
      <div class="flex gap-3 justify-center">
        ${n?`
          <button id="modal-cancel" class="bg-gray-700 hover:bg-gray-600 px-5 py-2.5 rounded-xl transition-colors">\u041E\u0442\u043C\u0435\u043D\u0430</button>
          <button id="modal-ok" class="bg-red-600 hover:bg-red-500 px-5 py-2.5 rounded-xl font-bold transition-colors">\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C</button>
        `:`
          <button id="modal-ok" class="bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl font-bold transition-colors">\u041E\u043A</button>
        `}
      </div>
    </div>
  `,document.body.appendChild(o),o.addEventListener("click",a=>{a.target===o&&B()}),document.getElementById("modal-ok").addEventListener("click",()=>{B(),t&&t()}),document.getElementById("modal-cancel")?.addEventListener("click",B)}function B(){document.getElementById("custom-modal")?.remove()}var i=null,f=-1;function A(){k(),document.getElementById("btn-create-pack")?.addEventListener("click",()=>{i={title:"",categories:[]},f=-1,j()}),document.getElementById("btn-import-pack")?.addEventListener("click",()=>{let e=document.createElement("input");e.type="file",e.accept=".json",e.onchange=()=>{let t=e.files?.[0];if(!t)return;let n=new FileReader;n.onload=()=>{try{let o=JSON.parse(n.result);if(!o.title||!o.categories)throw new Error;let a=m();a.push(o),x(a),k()}catch{p("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 JSON \u0444\u0430\u0439\u043B")}},n.readAsText(t)},e.click()})}function k(){let e=document.getElementById("pack-list"),t=m();if(t.length===0){e.innerHTML=`
      <p class="text-gray-500 text-center py-8">\u041D\u0435\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0445 \u043D\u0430\u0431\u043E\u0440\u043E\u0432. \u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u0438\u043B\u0438 \u0438\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u0443\u0439\u0442\u0435 JSON.</p>
    `;return}e.innerHTML=t.map((n,o)=>`
    <div class="bg-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
      <div class="min-w-0">
        <h3 class="font-bold text-lg truncate">${l(n.title||"\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F")}</h3>
        <p class="text-gray-400 text-sm">${n.categories.length} \u043A\u0430\u0442. / ${n.categories.reduce((a,s)=>a+s.questions.length,0)} \u0432\u043E\u043F\u0440.</p>
      </div>
      <div class="flex gap-2 shrink-0">
        <button data-edit-pack="${o}" class="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm transition-colors">\u0420\u0435\u0434.</button>
        <button data-export-pack="${o}" class="bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded-lg text-sm transition-colors">JSON</button>
        <button data-delete-pack="${o}" class="bg-red-600 hover:bg-red-500 px-3 py-2 rounded-lg text-sm transition-colors">\u0423\u0434.</button>
      </div>
    </div>
  `).join(""),e.querySelectorAll("[data-edit-pack]").forEach(n=>{n.addEventListener("click",()=>{let o=parseInt(n.dataset.editPack);f=o,i=JSON.parse(JSON.stringify(t[o])),j()})}),e.querySelectorAll("[data-export-pack]").forEach(n=>{n.addEventListener("click",()=>{let o=parseInt(n.dataset.exportPack);z(t[o])})}),e.querySelectorAll("[data-delete-pack]").forEach(n=>{n.addEventListener("click",()=>{let o=parseInt(n.dataset.deletePack);p(`\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0430\u0431\u043E\u0440 "${t[o].title}"?`,()=>{t.splice(o,1),x(t),k()})})})}function j(){if(!i)return;let e=document.getElementById("editor-area");document.getElementById("editor-list-area").classList.add("hidden"),e.classList.remove("hidden"),e.innerHTML=`
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
  `,v(),document.getElementById("pack-title").addEventListener("input",n=>{i.title=n.target.value}),document.getElementById("btn-add-category").addEventListener("click",()=>{i.categories.push({name:"",questions:[]}),v()}),document.getElementById("btn-save-pack").addEventListener("click",_),document.getElementById("btn-cancel-edit").addEventListener("click",N)}function v(){if(!i)return;let e=document.getElementById("categories-container");e.innerHTML=i.categories.map((t,n)=>`
    <div class="bg-gray-800/50 rounded-xl p-4 space-y-3 border border-gray-700/50">
      <div class="flex items-center gap-3">
        <input data-cat-name="${n}" type="text" value="${l(t.name)}"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none font-bold"
          placeholder="\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" />
        <button data-remove-cat="${n}" class="text-red-400 hover:text-red-300 text-sm transition-colors">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button>
      </div>

      <div data-questions="${n}" class="space-y-2">
        ${t.questions.map((o,a)=>`
          <div class="bg-gray-900/50 rounded-lg p-3 space-y-2">
            <div class="flex gap-2">
              <input data-q-value="${n}-${a}" type="number" value="${o.value}" step="100" min="0"
                class="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-gold text-center font-bold focus:border-blue-500 focus:outline-none"
                placeholder="\u0421\u0443\u043C\u043C\u0430" />
              <input data-q-question="${n}-${a}" type="text" value="${l(o.question)}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                placeholder="\u0412\u043E\u043F\u0440\u043E\u0441" />
              <button data-remove-q="${n}-${a}" class="text-red-400 hover:text-red-300 text-xs transition-colors">\u2715</button>
            </div>
            <div class="flex gap-2">
              <input data-q-answer="${n}-${a}" type="text" value="${l(o.answer)}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-emerald-400 focus:border-blue-500 focus:outline-none"
                placeholder="\u041E\u0442\u0432\u0435\u0442" />
            </div>
            <div class="flex gap-2 items-center">
              <input data-q-image-url="${n}-${a}" type="text" value="${l(o.image||"")}"
                class="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-blue-400 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="URL \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0438 (https://...)" />
              ${o.image?`<button data-clear-image="${n}-${a}" class="text-red-400 hover:text-red-300 text-xs transition-colors shrink-0">\u2715</button>`:""}
            </div>
          </div>
        `).join("")}
      </div>

      <button data-add-q="${n}" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">
        + \u0412\u043E\u043F\u0440\u043E\u0441
      </button>
    </div>
  `).join(""),e.querySelectorAll("[data-cat-name]").forEach(t=>{t.addEventListener("input",()=>{let n=parseInt(t.dataset.catName);i.categories[n].name=t.value})}),e.querySelectorAll("[data-remove-cat]").forEach(t=>{t.addEventListener("click",()=>{let n=parseInt(t.dataset.removeCat);i.categories.splice(n,1),v()})}),e.querySelectorAll("[data-q-value]").forEach(t=>{t.addEventListener("input",()=>{let[n,o]=t.dataset.qValue.split("-").map(Number);i.categories[n].questions[o].value=parseInt(t.value)||0})}),e.querySelectorAll("[data-q-question]").forEach(t=>{t.addEventListener("input",()=>{let[n,o]=t.dataset.qQuestion.split("-").map(Number);i.categories[n].questions[o].question=t.value})}),e.querySelectorAll("[data-q-answer]").forEach(t=>{t.addEventListener("input",()=>{let[n,o]=t.dataset.qAnswer.split("-").map(Number);i.categories[n].questions[o].answer=t.value})}),e.querySelectorAll("[data-q-image-url]").forEach(t=>{t.addEventListener("input",()=>{let[n,o]=t.dataset.qImageUrl.split("-").map(Number);i.categories[n].questions[o].image=t.value.trim()||void 0})}),e.querySelectorAll("[data-clear-image]").forEach(t=>{t.addEventListener("click",()=>{let[n,o]=t.dataset.clearImage.split("-").map(Number);i.categories[n].questions[o].image=void 0,v()})}),e.querySelectorAll("[data-remove-q]").forEach(t=>{t.addEventListener("click",()=>{let[n,o]=t.dataset.removeQ.split("-").map(Number);i.categories[n].questions.splice(o,1),v()})}),e.querySelectorAll("[data-add-q]").forEach(t=>{t.addEventListener("click",()=>{let n=parseInt(t.dataset.addQ),o=i.categories[n].questions,a=o.length>0?o[o.length-1].value:0;o.push({value:a+100,question:"",answer:""}),v()})})}function _(){if(!i)return;if(!i.title.trim()){p("\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043D\u0430\u0431\u043E\u0440\u0430");return}let e=m();f>=0?e[f]=i:e.push(i),x(e),N()}function N(){i=null,f=-1;let e=document.getElementById("editor-area"),t=document.getElementById("editor-list-area");e.classList.add("hidden"),e.innerHTML="",t.classList.remove("hidden"),k()}function z(e){let t=JSON.stringify(e,null,2),n=new Blob([t],{type:"application/json"}),o=URL.createObjectURL(n),a=document.createElement("a");a.href=o,a.download=`${e.title||"pack"}.json`,a.click(),URL.revokeObjectURL(o)}var r=null,L=null,g=new Set,Q=!1;function G(){K();let e=document.getElementById("players-inputs");e.innerHTML="",q(),q(),Q||(Q=!0,document.getElementById("btn-add-player")?.addEventListener("click",q),document.getElementById("btn-start-game")?.addEventListener("click",Y))}function K(){let e=document.getElementById("pack-select");if(!e)return;let t=m();e.innerHTML=t.length===0?'<option value="">\u041D\u0435\u0442 \u043D\u0430\u0431\u043E\u0440\u043E\u0432 \u2014 \u0441\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0432 \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440\u0435</option>':t.map((n,o)=>`<option value="${o}">${l(n.title||"\u0411\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F")} (${n.categories.length} \u043A\u0430\u0442.)</option>`).join("")}function q(){let e=document.getElementById("players-inputs"),t=e.children.length+1,n=document.createElement("div");n.className="flex gap-2 items-center",n.innerHTML=`
    <input type="text" class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
      placeholder="\u0418\u0433\u0440\u043E\u043A ${t}" value="\u0418\u0433\u0440\u043E\u043A ${t}" />
    <button class="text-red-400 hover:text-red-300 text-sm transition-colors remove-player">\u2715</button>
  `,n.querySelector(".remove-player").addEventListener("click",()=>{e.children.length>1&&n.remove()}),e.appendChild(n)}function Y(){let e=m(),t=document.getElementById("pack-select"),n=parseInt(t.value);if(isNaN(n)||!e[n]){p("\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u0430\u0431\u043E\u0440 \u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432");return}let o=e[n],s=document.getElementById("players-inputs").querySelectorAll('input[type="text"]'),d=Array.from(s).map(I=>({name:I.value.trim()||"\u0418\u0433\u0440\u043E\u043A",score:0}));if(d.length===0){p("\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u043D\u043E\u0433\u043E \u0438\u0433\u0440\u043E\u043A\u0430");return}let c=document.getElementById("timer-input"),y=parseInt(c.value)||0,M=o.categories.map(I=>I.questions.map(()=>!1));r={pack:o,players:d,timer:y,answered:M,currentQuestion:null},h(r),w(),u("board")}function O(){let e=E();e&&(r=e,w(),u("board"))}function w(){if(!r)return;let e=document.getElementById("game-board"),{pack:t,answered:n}=r,o=Math.max(...t.categories.map(s=>s.questions.length)),a=`<div class="grid gap-1.5" style="grid-template-columns: minmax(110px, 180px) repeat(${o}, minmax(0, 1fr))">`;t.categories.forEach((s,d)=>{a+=`<div class="bg-board flex items-center justify-center py-3 px-3 rounded-l-lg font-bold text-sm text-gold text-center leading-tight">${l(s.name)}</div>`;for(let c=0;c<o;c++){let y=s.questions[c];if(!y){a+='<div class="bg-gray-900/30 rounded p-1"></div>';continue}n[d]?.[c]?a+='<div class="bg-gray-800/30 rounded py-3 text-center"></div>':a+=`
          <button data-cell="${d}-${c}"
            class="bg-cell hover:bg-blue-700 rounded py-3 px-3 text-center font-black text-xl text-gold transition-colors cursor-pointer">
            ${y.value}
          </button>`}}),a+="</div>",e.innerHTML=a,e.querySelectorAll("[data-cell]").forEach(s=>{s.addEventListener("click",()=>{let[d,c]=s.dataset.cell.split("-").map(Number);F(d,c)})}),D(),ee()}function D(){if(!r)return;let e=document.getElementById("scoreboard");e.innerHTML=`
    <div class="flex flex-wrap gap-3 justify-center">
      ${r.players.map(t=>`
        <div class="bg-gray-800 rounded-xl px-5 py-2.5 text-center min-w-[110px]">
          <div class="text-sm text-gray-400 truncate">${l(t.name)}</div>
          <div class="text-2xl font-black ${t.score>=0?"text-gold":"text-red-400"}">${t.score}</div>
        </div>
      `).join("")}
    </div>
  `}function F(e,t){if(!r)return;r.currentQuestion={catIdx:e,qIdx:t},g=new Set;let n=r.pack.categories[e].questions[t],o=n.image?l(n.image):"",a=document.getElementById("screen-question");a.innerHTML=`
    <div class="w-full mx-auto flex flex-col items-center gap-6">
      <!-- \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F \u0438 \u0441\u0443\u043C\u043C\u0430 -->
      <div class="text-center">
        <span class="text-gray-400 text-sm">${l(r.pack.categories[e].name)}</span>
        <span class="text-gold font-black text-3xl ml-3">${n.value}</span>
      </div>

      <!-- \u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 -->
      ${o?`<img src="${o}" class="max-h-[70vh] w-auto rounded-xl object-contain" alt="\u0412\u043E\u043F\u0440\u043E\u0441" />`:""}

      <!-- \u0412\u043E\u043F\u0440\u043E\u0441 -->
      <div class="text-2xl md:text-4xl font-bold text-center leading-snug px-4">
        ${l(n.question)}
      </div>

      <!-- \u0422\u0430\u0439\u043C\u0435\u0440 -->
      <div id="timer-display" class="text-6xl font-black text-gray-600 ${r.timer===0?"hidden":""}">
        ${r.timer}
      </div>

      <!-- \u041E\u0442\u0432\u0435\u0442 (\u0441\u043A\u0440\u044B\u0442) -->
      <div id="answer-block" class="hidden text-center space-y-2">
        <div class="text-gray-400 text-sm">\u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442:</div>
        <div class="text-3xl font-bold text-emerald-400">${l(n.answer)}</div>
      </div>

      <!-- \u041A\u043D\u043E\u043F\u043A\u0438 \u0438\u0433\u0440\u043E\u043A\u043E\u0432: \u0432\u044B\u0431\u043E\u0440 \u043A\u043E\u043C\u0443 \u043D\u0430\u0447\u0438\u0441\u043B\u0438\u0442\u044C -->
      <div id="player-buttons" class="flex flex-wrap gap-3 justify-center">
        ${r.players.map((s,d)=>`
          <button data-toggle-player="${d}"
            class="px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 text-white">
            ${l(s.name)}
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
  `,u("question"),Z(),a.querySelectorAll("[data-toggle-player]").forEach(s=>{s.addEventListener("click",()=>{let d=parseInt(s.dataset.togglePlayer);W(d,s)})}),document.getElementById("btn-show-answer").addEventListener("click",()=>{R(),document.getElementById("btn-skip-question")?.classList.remove("hidden")}),document.getElementById("btn-confirm-next").addEventListener("click",()=>{X(n.value)}),document.getElementById("btn-skip-question").addEventListener("click",()=>{b(),J(),r.currentQuestion=null,C()}),document.getElementById("btn-back-board").addEventListener("click",()=>{b(),r.currentQuestion=null,w(),u("board")})}function W(e,t){g.has(e)?(g.delete(e),t.className="px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-gray-600 bg-gray-700 hover:bg-gray-600 text-white"):(g.add(e),t.className="px-5 py-3 rounded-xl font-bold transition-all text-sm md:text-base border-2 border-emerald-400 bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50");let n=document.getElementById("btn-confirm-next"),o=document.getElementById("btn-skip-question"),a=document.getElementById("selection-hint");g.size>0?(n?.classList.remove("hidden"),o?.classList.add("hidden"),a&&(a.textContent=`\u041E\u0447\u043A\u0438 \u043F\u043E\u043B\u0443\u0447\u0430\u0442: ${Array.from(g).map(s=>r.players[s].name).join(", ")}`)):(n?.classList.add("hidden"),!document.getElementById("answer-block")?.classList.contains("hidden")&&o?.classList.remove("hidden"),a&&(a.textContent="\u041D\u0430\u0436\u043C\u0438 \u043D\u0430 \u0438\u0433\u0440\u043E\u043A\u0430 \u2014 \u0435\u043C\u0443 \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u0442\u0441\u044F \u043E\u0447\u043A\u0438"))}function X(e){r&&(b(),g.forEach(t=>{r.players[t].score+=e}),J(),h(r),r.currentQuestion=null,C())}function C(){if(!r)return;r.answered.every(t=>t.every(n=>n))?S():(w(),u("board"))}function J(){if(!r||!r.currentQuestion)return;let{catIdx:e,qIdx:t}=r.currentQuestion;r.answered[e][t]=!0,h(r)}function R(){b(),document.getElementById("answer-block")?.classList.remove("hidden")}function Z(){if(!r||r.timer===0)return;let e=r.timer,t=document.getElementById("timer-display");t.textContent=String(e),t.classList.remove("text-gray-600"),t.classList.add("text-white"),L=window.setInterval(()=>{e--,t.textContent=String(e),e<=5&&(t.classList.remove("text-white"),t.classList.add("text-red-400")),e<=0&&(b(),t.textContent="\u23F0",R(),document.getElementById("btn-skip-question")?.classList.remove("hidden"))},1e3)}function b(){L!==null&&(clearInterval(L),L=null)}function ee(){if(!r)return;let e=r.answered.every(n=>n.every(o=>o)),t=document.getElementById("btn-end-game");t&&t.classList.toggle("hidden",e),e&&S()}function U(){document.getElementById("btn-end-game")?.addEventListener("click",()=>{p("\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u0438\u0433\u0440\u0443 \u0438 \u043F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0438\u0442\u043E\u0433\u0438?",()=>{S()})})}function S(){if(!r)return;b();let e=[...r.players].sort((o,a)=>a.score-o.score),t=e[0]?.score??0,n=document.getElementById("results-content");n.innerHTML=`
    <div class="w-full space-y-3">
      ${e.map((o,a)=>{let s=o.score===t&&a===0;return`
        <div class="flex items-center gap-4 ${s?"bg-gold/10 border border-gold/30":"bg-gray-800"} rounded-xl p-4">
          <div class="text-3xl font-black ${s?"text-gold":"text-gray-500"} w-10 text-center">${a+1}</div>
          <div class="flex-1">
            <div class="font-bold text-lg ${s?"text-gold":""}">${s?"\u{1F451} ":""}${l(o.name)}</div>
          </div>
          <div class="text-2xl font-black ${o.score>=0?"text-emerald-400":"text-red-400"}">${o.score}</div>
        </div>`}).join("")}
    </div>
  `,P(),u("results")}var te="home",V=["home","setup","board","question","results","editor"];function u(e){te=e,V.forEach(t=>{let n=document.getElementById(`screen-${t}`);n&&n.classList.toggle("hidden",t!==e)}),window.location.hash=e}async function ne(){await H();let e=document.getElementById("btn-continue");if(e){let o=E();e.classList.toggle("hidden",!o)}let t=["home","setup","editor"],n=window.location.hash.replace("#","");n&&t.includes(n)?u(n):u("home"),window.addEventListener("hashchange",()=>{let o=window.location.hash.replace("#","");o&&V.includes(o)&&u(o)}),document.getElementById("btn-new-game")?.addEventListener("click",()=>{G(),u("setup")}),document.getElementById("btn-continue")?.addEventListener("click",()=>{O()}),document.getElementById("btn-editor")?.addEventListener("click",()=>{u("editor")}),A(),U(),document.querySelectorAll("[data-nav]").forEach(o=>{o.addEventListener("click",()=>{let a=o.dataset.nav;u(a)})})}document.addEventListener("DOMContentLoaded",ne);})();
//# sourceMappingURL=bundle.js.map
