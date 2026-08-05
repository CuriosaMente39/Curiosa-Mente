const questions = [
  {phase:1,q:"Qual região do cérebro está mais relacionada ao planejamento, à tomada de decisões e ao controle do comportamento?",o:["Lobo frontal","Lobo occipital","Cerebelo","Medula espinal"],a:0,e:"O lobo frontal participa do planejamento, da tomada de decisões, do controle do comportamento e de vários aspectos do movimento voluntário."},
  {phase:1,q:"Qual estrutura ajuda principalmente no equilíbrio e na coordenação dos movimentos?",o:["Hipotálamo","Cerebelo","Lobo temporal","Tálamo"],a:1,e:"O cerebelo ajusta a coordenação, a precisão dos movimentos, a postura e o equilíbrio."},
  {phase:1,q:"Qual lobo cerebral está diretamente ligado ao processamento da visão?",o:["Frontal","Parietal","Occipital","Temporal"],a:2,e:"O lobo occipital, localizado na região posterior do cérebro, contém áreas importantes para o processamento visual."},
  {phase:1,q:"Qual lobo está muito relacionado à audição e à memória?",o:["Temporal","Occipital","Parietal","Frontal"],a:0,e:"O lobo temporal participa do processamento auditivo e contém estruturas importantes para a memória."},
  {phase:1,q:"Qual estrutura conecta o encéfalo à medula espinal e ajuda a controlar funções vitais?",o:["Corpo caloso","Tronco encefálico","Hipocampo","Cerebelo"],a:1,e:"O tronco encefálico conecta o encéfalo à medula e participa do controle da respiração, frequência cardíaca e estado de alerta."},
  {phase:2,q:"Qual estrutura atua como uma importante estação de retransmissão de informações sensoriais para o córtex cerebral?",o:["Tálamo","Hipocampo","Amígdala","Ponte"],a:0,e:"O tálamo recebe e encaminha muitas informações sensoriais para áreas apropriadas do córtex cerebral."},
  {phase:2,q:"Qual estrutura está especialmente envolvida na formação de novas memórias?",o:["Bulbo","Hipocampo","Lobo occipital","Nervo óptico"],a:1,e:"O hipocampo é essencial para a formação e consolidação de novas memórias."},
  {phase:2,q:"Qual estrutura participa do controle da temperatura corporal, fome, sede e equilíbrio hormonal?",o:["Hipotálamo","Cerebelo","Tálamo","Lobo parietal"],a:0,e:"O hipotálamo ajuda a manter o equilíbrio interno do corpo e controla funções como temperatura, fome, sede e atividade hormonal."},
  {phase:2,q:"Qual estrutura liga os dois hemisférios cerebrais, permitindo comunicação entre eles?",o:["Corpo caloso","Mesencéfalo","Hipófise","Cerebelo"],a:0,e:"O corpo caloso é um grande conjunto de fibras nervosas que conecta os hemisférios direito e esquerdo."},
  {phase:2,q:"O lobo parietal está especialmente relacionado a qual função?",o:["Processamento das sensações corporais e orientação espacial","Produção de hormônios","Controle direto da frequência cardíaca","Formação do líquor"],a:0,e:"O lobo parietal integra sensações do corpo, como toque e posição, e ajuda na orientação espacial."},
  {phase:3,q:"Qual parte do tronco encefálico contém centros importantes para respiração e controle cardiovascular?",o:["Bulbo (medula oblonga)","Hipocampo","Lobo frontal","Corpo caloso"],a:0,e:"O bulbo contém centros importantes para respiração, frequência cardíaca, pressão arterial e reflexos como tosse e deglutição."},
  {phase:3,q:"Qual meninge é a camada mais externa, resistente e protetora?",o:["Pia-máter","Aracnoide","Dura-máter","Epêndima"],a:2,e:"A dura-máter é a meninge mais externa e resistente. A aracnoide é intermediária e a pia-máter é delicada e aderida ao tecido nervoso."},
  {phase:3,q:"Qual líquido ajuda a proteger mecanicamente o encéfalo e a medula espinal?",o:["Plasma","Líquido cefalorraquidiano","Linfa","Bile"],a:1,e:"O líquido cefalorraquidiano circula ao redor e dentro do sistema nervoso central, ajudando na proteção e no equilíbrio do ambiente químico."},
  {phase:3,q:"Qual célula é a principal unidade funcional responsável por receber e transmitir sinais nervosos?",o:["Hemácia","Neurônio","Osteócito","Fibroblasto"],a:1,e:"O neurônio recebe, processa e transmite informações por sinais elétricos e químicos."},
  {phase:3,q:"Qual parte do neurônio geralmente recebe a maior parte dos sinais vindos de outras células?",o:["Dendritos","Bainha de mielina","Terminal axônico","Nódulo de Ranvier"],a:0,e:"Os dendritos são prolongamentos especializados principalmente na recepção de sinais de outros neurônios."}
];

let current=0, score=0, answered=false, soundOn=true, deferredPrompt=null;
const $=s=>document.querySelector(s);
const screens=[...document.querySelectorAll(".screen")];

function showScreen(id){
  screens.forEach(s=>s.classList.toggle("active",s.id===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
function play(id){
  if(!soundOn)return;
  const a=$(id); if(a){a.currentTime=0;a.play().catch(()=>{});}
}
function speak(text){
  if(!soundOn || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="pt-BR"; u.rate=.82; u.pitch=1; u.volume=1;
  const voices=speechSynthesis.getVoices();
  const br=voices.find(v=>v.lang?.toLowerCase().startsWith("pt-br")) || voices.find(v=>v.lang?.toLowerCase().startsWith("pt"));
  if(br)u.voice=br;
  speechSynthesis.speak(u);
}
function setRobot(msg){$("#robot-message").textContent=msg}
function renderQuestion(){
  answered=false;
  const item=questions[current];
  $("#phase-label").textContent=`Fase ${item.phase}`;
  $("#question-number").textContent=current+1;
  $("#question-total").textContent=questions.length;
  $("#score").textContent=score;
  $("#question-text").textContent=item.q;
  $("#feedback").hidden=true;
  $("#progress-bar").style.width=`${((current+1)/questions.length)*100}%`;
  $(".progress-track").setAttribute("aria-valuenow",current+1);
  setRobot(item.phase===1?"Vamos começar pelas estruturas principais.":item.phase===2?"Muito bem! Agora vamos aprofundar um pouco.":"Última fase! Você está indo muito bem.");
  const container=$("#options"); container.innerHTML="";
  item.o.forEach((text,i)=>{
    const b=document.createElement("button");
    b.className="option-btn";
    b.innerHTML=`<span class="option-letter">${String.fromCharCode(65+i)}</span><span>${text}</span>`;
    b.addEventListener("click",()=>answer(i,b));
    container.appendChild(b);
  });
  localStorage.setItem("neuroquiz-progress",JSON.stringify({current,score}));
}
function answer(index,button){
  if(answered)return;
  answered=true;
  const item=questions[current];
  const buttons=[...document.querySelectorAll(".option-btn")];
  buttons.forEach(b=>b.disabled=true);
  buttons[item.a].classList.add("correct");
  const correct=index===item.a;
  if(correct){score++;play("#audio-correct");$("#feedback-title").textContent="Muito bem! Resposta correta.";setRobot("Excelente! Seu cérebro está brilhando!");}
  else{button.classList.add("wrong");play("#audio-wrong");$("#feedback-title").textContent="Quase! Vamos aprender juntos.";setRobot("Não tem problema errar. A explicação ajuda a fixar.");}
  $("#score").textContent=score;
  $("#feedback-text").textContent=item.e;
  $("#feedback").hidden=false;
  $("#btn-next").focus();
  speak((correct?"Resposta correta. ":"Vamos revisar. ")+item.e);
}
function next(){
  play("#audio-click");
  if(current<questions.length-1){current++;renderQuestion();}
  else finish();
}
function finish(){
  localStorage.removeItem("neuroquiz-progress");
  $("#final-score").textContent=score;
  let msg= score>=13?"Desempenho excelente! Você demonstrou ótimo conhecimento de neuroanatomia.":
           score>=9?"Muito bom! Você reconheceu muitas estruturas e funções do sistema nervoso.":
           "Parabéns pelo aprendizado! Jogue novamente para reforçar as estruturas e funções.";
  $("#result-message").textContent=msg;
  play("#audio-win"); speak(`Parabéns! Você concluiu o NeuroQuiz com ${score} acertos em ${questions.length} perguntas.`);
  showScreen("screen-result");
}
function startGame(reset=true){
  if(reset){current=0;score=0;}
  showScreen("screen-quiz");renderQuestion();play("#audio-click");
}
$("#btn-start").onclick=()=>startGame(true);
$("#btn-functions").onclick=()=>showScreen("screen-functions");
$("#btn-start-from-functions").onclick=()=>startGame(true);
document.querySelectorAll(".btn-home").forEach(b=>b.onclick=()=>showScreen("screen-home"));
$("#btn-next").onclick=next;
$("#btn-pause").onclick=()=>{speechSynthesis?.cancel();showScreen("screen-pause")};
$("#btn-resume").onclick=()=>showScreen("screen-quiz");
$("#btn-restart-pause").onclick=()=>startGame(true);
$("#btn-restart").onclick=()=>startGame(true);
$("#btn-read-question").onclick=()=>{const q=questions[current];speak(q.q+" Alternativas: "+q.o.map((x,i)=>`${String.fromCharCode(65+i)}, ${x}`).join(". "));};
$("#btn-read-functions").onclick=()=>speak("O lobo frontal participa do pensamento e planejamento. O parietal integra sensações e orientação espacial. O temporal participa da audição e memória. O occipital processa a visão. O cerebelo ajuda no equilíbrio e coordenação. O tronco encefálico controla funções vitais.");
$("#btn-share").onclick=async()=>{
  const text=`Concluí o NeuroQuiz 60+ com ${score} acertos em ${questions.length} perguntas!`;
  if(navigator.share){try{await navigator.share({title:"NeuroQuiz 60+",text});}catch(e){}}
  else{await navigator.clipboard.writeText(text);alert("Resultado copiado!");}
};
$("#btn-sound").onclick=e=>{
  soundOn=!soundOn;e.currentTarget.setAttribute("aria-pressed",soundOn);e.currentTarget.textContent=soundOn?"🔊 Som":"🔇 Som";
  if(!soundOn)speechSynthesis?.cancel();
};
let fontSize=18;
$("#btn-font-up").onclick=()=>{fontSize=Math.min(24,fontSize+1);document.documentElement.style.setProperty("--base-size",fontSize+"px")};
$("#btn-font-down").onclick=()=>{fontSize=Math.max(16,fontSize-1);document.documentElement.style.setProperty("--base-size",fontSize+"px")};
$("#btn-contrast").onclick=e=>{const on=document.body.classList.toggle("high-contrast");e.currentTarget.setAttribute("aria-pressed",on)};
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;$("#btn-install").hidden=false});
$("#btn-install").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$("#btn-install").hidden=true};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
