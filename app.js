const $ = (id) => document.getElementById(id);
document.querySelectorAll(".tab").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === btn));
  document.querySelectorAll(".view").forEach(x => x.classList.toggle("active", x.id === btn.dataset.tab));
}));
$("today").textContent = new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(new Date());
function number(v){return Number(v||0).toLocaleString("en-IN")}
function setBar(id,value,total){$(id).style.width=(total?Math.min(100,Math.max(0,value/total*100)):0)+"%"}
async function loadDashboard(){
  try{
    const r=await fetch("/api/dashboard-api",{headers:{"Accept":"application/json"}});
    if(!r.ok) throw new Error("API unavailable ("+r.status+")");
    const d=await r.json();
    const v=d.today||{};
    $("visitors").textContent=number(v.visitors);$("clicks").textContent=number(v.clicks);
    $("requests").textContent=number(v.joinRequests);$("verified").textContent=number(v.verifiedJoins);
    $("events").textContent=number(v.metaEventsSent);
    $("joinRate").textContent=(v.visitors?((v.verifiedJoins/v.visitors)*100).toFixed(1):"0.0")+"%";
    $("fVisitors").textContent=number(v.visitors);$("fClicks").textContent=number(v.clicks);$("fVerified").textContent=number(v.verifiedJoins);
    setBar("barClicks",v.clicks,v.visitors);setBar("barVerified",v.verifiedJoins,v.visitors);
    $("webhookHealth").textContent=d.health?.telegramWebhook||"Not verified";
    $("dbHealth").textContent=d.health?.database||"Not configured";
    $("metaHealth").textContent=d.health?.metaCapi||"Not configured";
    $("checks").innerHTML=(d.checks||["Backend returned data but no setup checklist."]).map(x=>"<p>"+escapeHtml(x)+"</p>").join("");
    const days=d.daily||[];
    if(days.length){$("dailyChart").classList.remove("empty");$("dailyChart").innerHTML=days.map(x=>`<div class="bar-wrap"><div class="bar" title="${number(x.joins)} joins" style="height:${Math.max(3,Number(x.joins)/Math.max(1,...days.map(y=>Number(y.joins)))*155)}px"></div><small>${escapeHtml(x.date.slice(5))}</small></div>`).join("")}
    const rows=d.campaigns||[];
    $("campaignRows").innerHTML=rows.length?rows.map(x=>`<tr><td>${escapeHtml(x.campaign||"Unattributed")}</td><td>${number(x.visitors)}</td><td>${number(x.clicks)}</td><td>${number(x.verifiedJoins)}</td><td>${x.costPerJoin==null?"—":"₹"+Number(x.costPerJoin).toFixed(2)}</td></tr>`).join(""):'<tr><td colspan="5" class="muted">No connected campaign data yet.</td></tr>';
  }catch(e){
    $("checks").innerHTML="<p>Backend is not connected yet. Deploy the Netlify project, configure environment variables and database, then reload.</p>";
    $("webhookHealth").textContent="Not connected";$("dbHealth").textContent="Not connected";$("metaHealth").textContent="Not connected";
  }
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
loadDashboard();
