const $=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const backendConfig=window.PAAL_SUPABASE_CONFIG||{};
const backendConfigured=typeof backendConfig.url==='string'&&backendConfig.url.startsWith('https://')&&typeof backendConfig.anonKey==='string'&&backendConfig.anonKey.length>20;
const cachedAuthUserId=backendConfigured?sessionStorage.getItem('paal-auth-user-id'):'';
const dataStorageKey=backendConfigured?(cachedAuthUserId?'paal-prototype-user-'+cachedAuthUserId:'paal-prototype-unauthed'):'paal-prototype';
let supabaseClient=null,authUser=null,authMode=backendConfigured&&sessionStorage.getItem('paal-password-recovery')==='true'?'recovery':'signin',authNotice='',authNoticeType='error',authUnavailable=false;
const helpTopics=[
 {group:'Everyday routines',topics:['After-school routines','Morning routines','Bedtime transitions','Mealtimes','Leaving the house','Transitions between activities']},
 {group:'Screens and play',topics:['Screen-time alternatives','Turning screens off','Handling boredom','Independent play','Creative and outdoor play']},
 {group:'Connection and emotions',topics:['Connection and quality time','Big feelings and frustration','Calming down','Social skills and friendships','Sibling relationships']},
 {group:'Family life',topics:['Boundaries and cooperation','Consistency across caregivers','Learning and homework routines','Caregiver capacity and schedules','Something else']}
];
let nextChildId=0;
function newChild(){return {id:'child-'+Date.now().toString(36)+'-'+(++nextChildId),name:'',age:'5',goals:[],otherGoal:'',needs:'',helps:'',regulation:'',game:''}}
function migrateFamily(old){
 if(Array.isArray(old?.children)&&old.children.length){return {...old,children:old.children.map(c=>({...newChild(),...c,goals:Array.isArray(c.goals)?c.goals:[]}))}}
 const child={...newChild(),age:old?.age||'5',goals:old?.goal?[old.goal]:[],needs:old?.needs||'',helps:old?.helps||''};
 return {name:'',children:[child],activeChildId:child.id};
}
const initial={family:migrateFamily(null),saved:[],feedback:[],filters:['At home','Low energy','No extra materials'],concern:'',started:false,readResources:[],weeklyGoals:null,goalHistory:[],care:{caregivers:[],blocks:[],updates:[],requests:[]}};
let data;try{data={...structuredClone(initial),...JSON.parse(localStorage.getItem(dataStorageKey)||'{}')}}catch{data=structuredClone(initial)}
data.family=migrateFamily(data.family);
if(!data.family.children.some(child=>child.id===data.family.activeChildId))data.family.activeChildId=data.family.children[0].id;
data.feedback=Array.isArray(data.feedback)?data.feedback:[];
data.feedback.forEach(item=>{if(!item.childId)item.childId=data.family.activeChildId});
data.readResources=Array.isArray(data.readResources)?data.readResources:[];data.goalHistory=Array.isArray(data.goalHistory)?data.goalHistory:[];data.lessonProgress=Array.isArray(data.lessonProgress)?data.lessonProgress:[];data.lessonComments=data.lessonComments&&typeof data.lessonComments==='object'?data.lessonComments:{};data.lessonAnswers=data.lessonAnswers&&typeof data.lessonAnswers==='object'?data.lessonAnswers:{};
const careScopes=[['plan','Today’s care plan'],['guide','Child care guide'],['toolkit','Family toolkit'],['updates','Handoff updates'],['requests','Help requests']];
data.care=data.care&&typeof data.care==='object'?data.care:structuredClone(initial.care);
for(const key of ['caregivers','blocks','updates','requests'])data.care[key]=Array.isArray(data.care[key])?data.care[key]:[];
let carePermissionsMigrated=false;
data.care.caregivers=data.care.caregivers.filter(person=>person&&typeof person==='object'&&typeof person.id==='string').map(person=>{const permissions=Array.isArray(person.permissions)?person.permissions.filter(scope=>careScopes.some(([key])=>key===scope)):[];if(!person.toolkitPermissionConfigured){carePermissionsMigrated=true;if(!permissions.includes('toolkit'))permissions.push('toolkit')}return {...person,name:String(person.name||''),permissions,toolkitPermissionConfigured:true,childIds:Array.isArray(person.childIds)?person.childIds.filter(id=>data.family.children.some(child=>child.id===id)):[]}});
for(const key of ['blocks','updates','requests'])data.care[key]=data.care[key].filter(item=>item&&typeof item==='object'&&data.family.children.some(child=>child.id===item.childId));
const previousFilters=JSON.stringify(data.filters);const filterGroups=[['Setting',['At home','Out and about','At someone else’s home']],['Energy',['Low energy','A little energy','Ready to join in']],['Resources',['No extra materials','Everyday items','Materials available']]];const validFilters=filterGroups.flatMap(([,values])=>values);data.filters=(Array.isArray(data.filters)?data.filters:initial.filters).filter(value=>validFilters.includes(value));for(const [,values] of filterGroups)if(!data.filters.some(value=>values.includes(value)))data.filters.push(values[0]);const filtersChanged=previousFilters!==JSON.stringify(data.filters);
function currentWeekKey(date=new Date()){const monday=new Date(date);monday.setHours(0,0,0,0);monday.setDate(monday.getDate()-(monday.getDay()+6)%7);return `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`}
const weekKey=currentWeekKey();let weekChanged=false;if(!data.weeklyGoals||!Array.isArray(data.weeklyGoals.items))data.weeklyGoals={week:weekKey,items:[]};else if(data.weeklyGoals.week!==weekKey){data.goalHistory.unshift(data.weeklyGoals);data.weeklyGoals={week:weekKey,items:[]};data.goalHistory=data.goalHistory.slice(0,8);weekChanged=true}for(const week of [data.weeklyGoals,...data.goalHistory])for(const goal of week.items||[])if(goal.category==='Learning'){goal.category='Individual';weekChanged=true}
delete data.points;if(weekChanged||filtersChanged||carePermissionsMigrated)persist();
let familyDraft=structuredClone(data.family);
let page='family',lastPage='options',selected=null,feedbackChoice='',tab='saved',progressTab='learning',activeLessonId=null,query='',offset=0,resourceCategory='All',activeRecognition=null;
let editingCareBlockId=null;
function activeChild(){return data.family.children.find(c=>c.id===data.family.activeChildId)||data.family.children[0]}
function childLabel(c,i){return c.name.trim()||'Child '+(i+1)}
function collectFamily(formData){return {...familyDraft,name:String(formData.get('family-name')||'').trim(),children:familyDraft.children.map(c=>({...c,name:String(formData.get('name-'+c.id)||'').trim(),age:String(formData.get('age-'+c.id)||'5'),goals:formData.getAll('goals-'+c.id).map(String),otherGoal:String(formData.get('other-'+c.id)||'').trim(),needs:String(formData.get('needs-'+c.id)||'').trim(),helps:String(formData.get('helps-'+c.id)||'').trim(),regulation:String(formData.get('regulation-'+c.id)||'').trim(),game:String(formData.get('game-'+c.id)||'').trim()}))}}
function familyErrors(family){let errors=[];family.children.forEach((c,i)=>{const label=childLabel(c,i);if(!c.goals.length)errors.push(label+': choose at least one area for support.');if(c.goals.includes('Something else')&&!c.otherGoal)errors.push(label+': describe the other area you want help with.');if(!c.needs.trim())errors.push(label+': add needs and preferences, or write “No specific needs”.')});return errors}
function familyProfileComplete(family){return family.children.length>0&&familyErrors(family).length===0}
async function copyCaregiverGuide(){
 const field=$('#caregiver-guide-text');
 if(!field)return;
 try{
  if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(field.value);toast('Caregiver guide copied. You can send it to another caregiver.');return}
 }catch(error){
  field.focus();field.select();toast('Guide selected. Copy it to share with a caregiver.');return;
 }
 field.focus();field.select();toast('Guide selected. Copy it to share with a caregiver.');
}
async function shareCaregiverGuide(){
 const field=$('#caregiver-guide-text');
 if(!field)return;
 const index=data.family.children.findIndex(child=>child.id===data.family.activeChildId);
 const title=`Care guide for ${childLabel(activeChild(),index)}`;
 if(typeof navigator.share!=='function'){await copyCaregiverGuide();return}
 try{await navigator.share({title,text:field.value})}
 catch(error){if(error.name!=='AbortError')toast('Could not open sharing. Try copying the guide instead.')}
}
function localDateKey(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`}
function carePeople(scope,childId,assignedId=''){return data.care.caregivers.filter(person=>person.permissions.includes(scope)&&person.childIds.includes(childId)&&(!assignedId||person.id===assignedId))}
function careAudience(scope,childId,assignedId=''){const people=carePeople(scope,childId,assignedId);return people.length?people.map(person=>esc(person.name)).join(', '):'No caregivers selected'}
function careScopeOptions(name,selected=[]){return careScopes.map(([scope,label])=>`<label class="care-check"><input type="checkbox" name="${esc(name)}" value="${scope}" ${selected.includes(scope)?'checked':''}><span>${label}</span></label>`).join('')}
function careChildOptions(name,selected=[]){const checked=name==='children'?[data.family.activeChildId]:selected;return data.family.children.map((child,index)=>`<label class="care-check"><input type="checkbox" name="${esc(name)}" value="${esc(child.id)}" ${checked.includes(child.id)?'checked':''}><span>${esc(childLabel(child,index))}</span></label>`).join('')}
function careBlockMarkup(child,today){
 const blocks=data.care.blocks.filter(block=>block.childId===child.id&&block.date===today).sort((a,b)=>a.time.localeCompare(b.time));
 return blocks.length?`<div class="care-record-list">${blocks.map(block=>`<article class="care-record"><div class="care-record-time">${esc(block.time)}</div><div class="care-record-main"><h3>${esc(block.title)}</h3>${block.details?`<p>${esc(block.details)}</p>`:''}<small>Caregiver: ${esc(data.care.caregivers.find(person=>person.id===block.caregiverId)?.name||'Not assigned')}</small><small class="care-audience">Local access preview · ${careAudience('plan',child.id,block.caregiverId)}</small></div><div class="care-record-actions"><button type="button" class="link" data-care-edit="${esc(block.id)}">Edit</button><button type="button" class="link care-remove" data-care-delete="${esc(block.id)}">Remove</button></div></article>`).join('')}</div>`:`<p class="care-empty">No care blocks yet. Add who’s doing what and when for today.</p>`;
}
function careUpdatesMarkup(child){
 const updates=data.care.updates.filter(update=>update.childId===child.id).slice().reverse();
 return updates.length?`<div class="care-record-list">${updates.map(update=>`<article class="care-note"><div class="care-note-meta"><strong>${esc(update.kind)}</strong><time>${new Date(update.createdAt).toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})}</time></div><p>${esc(update.text)}</p><small class="care-audience">Local access preview · ${careAudience('updates',child.id)}</small></article>`).join('')}</div>`:`<p class="care-empty">No handoff updates yet. Post a short note for the next caregiver.</p>`;
}
function careRequestsMarkup(child){
 const requests=data.care.requests.filter(request=>request.childId===child.id).slice().reverse();
 return requests.length?`<div class="care-record-list">${requests.map(request=>`<article class="care-request ${request.status==='accepted'?'is-accepted':''}"><div class="care-request-copy"><div class="care-note-meta"><strong>${request.status==='accepted'?'Accepted in this demo':'Help requested'}</strong>${request.time?`<time>By ${esc(request.time)}</time>`:''}</div><p>${esc(request.text)}</p><small class="care-audience">Local access preview · ${careAudience('requests',child.id,request.caregiverId)}</small>${request.status==='accepted'?'<small class="care-accepted-note">Marked accepted in this browser; no caregiver was notified.</small>':''}</div>${request.status==='open'?`<button type="button" class="secondary care-accept" data-care-accept="${esc(request.id)}">Accept in demo</button>`:''}</article>`).join('')}</div>`:`<p class="care-empty">No help requests yet. Ask for a hand with a specific part of today.</p>`;
}
function careMarkup(){
 const child=activeChild(),childIndex=data.family.children.findIndex(item=>item.id===child.id),today=localDateKey(),editing=data.care.blocks.find(block=>block.id===editingCareBlockId&&block.childId===child.id),planCaregivers=carePeople('plan',child.id),requestCaregivers=carePeople('requests',child.id);
 return `<div class="care-page"><div class="care-intro"><div class="eyebrow">Today, together · ${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div><h1>Care, in sync.</h1><p class="lead">Make today’s handoffs easier with a simple care plan, quick updates, and specific requests for help.</p></div><div class="care-demo-notice" role="note"><strong>Local demo only · No account or backend connected.</strong><span>Caregivers and activity here are saved only in this browser. No invitation, update, or request is sent or delivered to anyone.</span></div><div class="care-child-picker"><label for="care-child">Planning for</label><select id="care-child">${data.family.children.map((item,index)=>`<option value="${esc(item.id)}" ${item.id===child.id?'selected':''}>${esc(childLabel(item,index))} · age ${esc(item.age)}</option>`).join('')}</select><button type="button" class="link" data-go="family-edit">Edit child details</button></div><section class="care-access-section"><div class="care-section-heading"><div><div class="eyebrow">Local access preview</div><h2>Caregiver permissions</h2><p class="muted">Choose which child and information each named demo caregiver would be allowed to see.</p></div></div><div class="care-access-list">${data.care.caregivers.map(person=>`<article class="care-access-card"><div class="care-person-heading"><div><strong>${esc(person.name)}</strong><span>Demo caregiver · no invitation sent</span></div><button type="button" class="link care-remove" data-caregiver-remove="${esc(person.id)}">Remove</button></div><div class="care-access-groups"><fieldset><legend>Children</legend>${careChildOptions('child-'+person.id,person.childIds)}</fieldset><fieldset><legend>Information</legend>${careScopeOptions('permission-'+person.id,person.permissions)}</fieldset></div></article>`).join('')||'<p class="care-empty">No caregivers added yet. Add a fictional name to preview permissions; this does not create an account or send an invitation.</p>'}</div>${data.care.caregivers.length?'<button type="button" class="secondary care-save-access" id="save-care-permissions">Save demo permissions</button>':''}<form id="caregiver-add-form" class="care-form care-add-form"><h3>Add a caregiver to this demo</h3><label class="field"><span>Caregiver name</span><input name="name" maxlength="60" placeholder="For example, Grandma Jo" required></label><fieldset class="care-choice-group"><legend>Children they may see</legend><div class="care-check-grid">${careChildOptions('children',data.family.children.map(item=>item.id))}</div></fieldset><fieldset class="care-choice-group"><legend>Information they may see</legend><div class="care-check-grid">${careScopeOptions('permissions',['plan','guide','toolkit','updates','requests'])}</div></fieldset><button class="secondary" type="submit">Add to local demo</button></form></section><div class="care-grid"><section class="care-section"><div class="care-section-heading"><div><div class="eyebrow">Today’s plan</div><h2>Care blocks</h2><p class="muted">Add who’s doing what and when. Each block shows its configured audience.</p></div></div><form id="care-block-form" class="care-form"><h3>${editing?'Edit care block':'Add a care block'}</h3><label class="field"><span>What needs to happen?</span><input name="title" maxlength="100" placeholder="Pickup, snack, quiet time…" value="${esc(editing?.title||'')}" required></label><div class="inline-grid"><label class="field"><span>Time</span><input type="time" name="time" value="${esc(editing?.time||'')}" required></label><label class="field"><span>Caregiver</span><select name="caregiver">${planCaregivers.map(person=>`<option value="${esc(person.id)}" ${person.id===editing?.caregiverId?'selected':''}>${esc(person.name)}</option>`).join('')}<option value="" ${!editing?.caregiverId||!planCaregivers.some(person=>person.id===editing.caregiverId)?'selected':''}>Not assigned</option></select></label></div><label class="field"><span>Handoff details <span class="muted">(optional)</span></span><textarea name="details" rows="3" maxlength="400" placeholder="Anything the next caregiver should know?">${esc(editing?.details||'')}</textarea></label><p class="care-form-audience">Local access preview · ${planCaregivers.length?planCaregivers.map(person=>esc(person.name)).join(', '):'No caregivers currently have care-plan access'}</p><div class="care-form-actions"><button class="primary" type="submit">${editing?'Save changes':'Add to today’s plan'}</button>${editing?'<button type="button" class="link" id="cancel-care-edit">Cancel</button>':''}</div></form>${careBlockMarkup(child,today)}</section><section class="care-section"><div class="care-section-heading"><div><div class="eyebrow">A useful handoff</div><h2>Post an update</h2><p class="muted">Leave a brief note about what happened or what helped.</p></div></div><form id="care-update-form" class="care-form"><label class="field"><span>Update type</span><select name="kind"><option>Handoff note</option><option>What helped</option><option>Heads-up</option></select></label><label class="field"><span>Update</span><textarea name="text" rows="4" maxlength="500" placeholder="A short, practical update for the next caregiver…" required></textarea></label><p class="care-form-audience">Local access preview · ${careAudience('updates',child.id)}</p><button class="primary" type="submit">Post local update</button></form><div class="care-subsection"><h3>Recent updates</h3>${careUpdatesMarkup(child)}</div><div class="care-request-section"><div class="care-section-heading"><div><div class="eyebrow">Ask for a hand</div><h2>Request help</h2><p class="muted">Describe one concrete task someone could take on.</p></div></div><form id="care-request-form" class="care-form"><label class="field"><span>What would help?</span><textarea name="text" rows="3" maxlength="300" placeholder="Could someone handle pickup today?" required></textarea></label><div class="inline-grid"><label class="field"><span>By when?</span><input type="time" name="time"></label><label class="field"><span>Ask a caregiver</span><select name="caregiver">${requestCaregivers.map(person=>`<option value="${esc(person.id)}">${esc(person.name)}</option>`).join('')}<option value="" selected>No one specific</option></select></label></div><p class="care-form-audience">Local access preview · ${careAudience('requests',child.id)}</p><button class="primary" type="submit">Post local request</button></form><div class="care-subsection"><h3>Help requests</h3>${careRequestsMarkup(child)}</div></div></section></div></div>`;
}
function careLibraryMarkup(){
 const libraryTabs=[['saved','Saved ideas'],['history','What we tried'],['resources','Resources']];
 const toolkitCaregivers=carePeople('toolkit',activeChild().id);
 return `<section class="care-library"><div class="care-section-heading"><div><div class="eyebrow">Handy for the next handoff</div><h2>Family toolkit</h2><p class="muted">Saved ideas, things you’ve tried, and trusted resources—all alongside today’s care plan.</p></div></div><p class="care-library-access"><strong>Toolkit access for ${esc(childLabel(activeChild(),data.family.children.findIndex(child=>child.id===activeChild().id)))}:</strong> ${toolkitCaregivers.length?toolkitCaregivers.map(person=>esc(person.name)).join(', '):'No caregivers have this permission'} <span>· Local demo permission only; no one can access this from another account or device.</span></p><div class="tabs care-library-tabs" role="tablist" aria-label="Family toolkit">${libraryTabs.map(([key,label])=>`<button type="button" class="tab ${tab===key?'active':''}" role="tab" aria-selected="${tab===key}" data-care-library-tab="${key}">${label}</button>`).join('')}</div>${tab==='resources'?`<label class="sr-only" for="care-library-search">Search trusted resources</label><input class="search" id="care-library-search" type="search" placeholder="Find a trusted resource" value="${esc(query)}"><div id="care-library-resources">${resourceList()}</div>`:`<label class="sr-only" for="care-library-search">Search ${tab==='history'?'past attempts':'saved ideas'}</label><input class="search" id="care-library-search" type="search" placeholder="${tab==='history'?'Search past attempts':'Search saved ideas'}" value="${esc(query)}"><div id="care-library-list">${toolkitList()}</div>${tab==='saved'?'<button type="button" class="link" data-go="today">Find an idea to save →</button>':''}`}</section>`;
}
function familyScene(){return `<div class="family-scene" aria-hidden="true"><div class="scene-moon"><span></span></div><div class="scene-lamp"></div><div class="scene-door"><span></span></div><div class="scene-body"></div><div class="scene-child"><span class="child-hair"></span><span class="child-eye left"></span><span class="child-eye right"></span><span class="child-smile"></span></div><div class="scene-pebble">☺</div></div>`}
function familyActivityMarkup(child){
 const feedback=data.feedback.filter(item=>!item.childId||item.childId===child.id).slice(-5).reverse();
 if(!feedback.length)return `<div class="family-empty"><div class="family-empty-icon" aria-hidden="true">✦</div><div><h3>Your family's story starts here.</h3><p>When you try an idea and check in on how it went, it will show up here.</p><button class="link" data-go="today">Find something to try →</button></div></div>`;
 return `<div class="family-activity-list">${feedback.map(item=>{const idea=ideas.find(entry=>entry.id===item.id),result=item.result==='Helped'?'worked':item.result==="Didn't fit"?'didn’t fit':'partly worked',icon=item.result==='Helped'?'✓':item.result==="Didn't fit"?'↻':'~',tone=item.result==='Helped'?'mint':item.result==="Didn't fit"?'rose':'sky';return `<article class="family-activity"><span class="activity-icon ${tone}" aria-hidden="true">${icon}</span><div class="activity-copy"><h3>${esc(idea?.title||'An idea you tried')} <span>${esc(result)}</span></h3>${item.note?`<p>${esc(item.note)}</p>`:''}<small>${new Date(item.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})} · ${esc(item.result)}</small></div><button class="activity-open" type="button" data-family-idea="${esc(item.id)}" aria-label="Revisit ${esc(idea?.title||'idea')}">›</button></article>`}).join('')}</div>`;
}
function familyWeekMarkup(){const goals=data.weeklyGoals.items,done=goals.filter(goal=>goal.done).length;return `<section class="family-week-section"><div class="family-section-heading"><span class="family-section-mascot mint-mascot" aria-hidden="true">☺</span><div><div class="eyebrow">Small steps count</div><h2>This week, together</h2></div><button type="button" class="family-text-button" data-go="progress">See your goals →</button></div><div class="family-week-card"><div class="family-week-summary"><div><strong>${goals.length?`${done} of ${goals.length}`:'A little at a time'}</strong><span>${goals.length?'goals reached this week':'Choose a small goal that feels right'}</span></div><div class="family-week-progress" role="progressbar" aria-label="Weekly goals reached" aria-valuemin="0" aria-valuemax="${goals.length||1}" aria-valuenow="${done}"><span style="width:${goals.length?done/goals.length*100:0}%"></span></div></div>${goals.length?goalList(goals,'Family',''):`<div class="family-goal-empty"><p>No goals yet. There are no scores—just small steps that work for your family.</p><div class="family-goal-suggestions"><button type="button" data-goal-suggestion="Family" data-goal-text="Spend 10 minutes doing something we both enjoy">Share a moment</button><button type="button" data-goal-suggestion="Individual" data-goal-text="Read or look through a book together">Read together</button><button type="button" data-go="progress">Make your own +</button></div></div>`}</div></section>`}
function familyIdeasMarkup(){const suggestions=options().slice(0,3);return `<section class="family-ideas-section"><div class="family-section-heading"><span class="family-section-mascot lavender-mascot" aria-hidden="true">✦</span><div><div class="eyebrow">Curious what might fit?</div><h2>A few ideas to explore</h2></div><button type="button" class="family-text-button" data-go="today">Find your own →</button></div><div class="family-idea-list">${suggestions.map((idea,index)=>`<button type="button" class="family-idea-card" data-family-idea="${idea.id}"><span class="family-idea-icon idea-tone-${index+1}" aria-hidden="true">${['✎','◉','✿'][index]}</span><span class="family-idea-copy"><strong>${esc(idea.title)}</strong><span>${esc(idea.desc)}</span><small>${esc(idea.time)} · ${esc(idea.supplies)}</small></span><span class="family-idea-arrow" aria-hidden="true">→</span></button>`).join('')}</div></section>`}
function caregiverGuide(child,index){const name=childLabel(child,index);return `A quick guide for caring for ${name} (age ${child.age})\n\nWhat they need: ${child.needs.trim()||'Not added yet'}\nWhat helps them feel calm: ${child.regulation.trim()||child.helps.trim()||'Not added yet'}\nAn easy game to play: ${child.game.trim()||'Not added yet'}\nWhat already helps: ${child.helps.trim()||'Not added yet'}\n\nShared by their caregiver. Please check with their family about anything that may have changed.`}
function familyHomeMarkup(){const child=activeChild(),index=data.family.children.findIndex(item=>item.id===child.id),focus=child.helps.trim()||child.goals[0]||'Getting to know what works best',guide=caregiverGuide(child,index);return `<div class="family-home"><div class="family-child-tabs" role="tablist" aria-label="Choose a child">${data.family.children.map((item,i)=>`<button class="family-child-tab ${item.id===child.id?'active':''}" type="button" role="tab" aria-selected="${item.id===child.id}" data-family-child="${item.id}">${esc(childLabel(item,i))}, ${esc(item.age)}</button>`).join('')}<button class="family-add-tab" type="button" data-add-family-child>+ Add</button></div><section class="family-profile-card"><div class="family-profile-copy"><div class="eyebrow">${esc(data.family.name||'Your family')}</div><h1>${esc(childLabel(child,index))}<span>, ${esc(child.age)}</span></h1><p>${esc(focus)}</p><button class="family-edit-button" type="button" data-edit-family>Edit family <span aria-hidden="true">↗</span></button></div>${familyScene()}<span class="profile-sparkle sparkle-one" aria-hidden="true">✦</span><span class="profile-sparkle sparkle-two" aria-hidden="true">✧</span></section><section class="caregiver-guide"><div class="caregiver-guide-heading"><div><div class="eyebrow">Made to share</div><h2>A quick guide for caregivers</h2><p class="muted">Share what helps ${esc(childLabel(child,index))} feel supported, wherever they are.</p></div><button class="primary caregiver-share-button" type="button" data-share-guide>Share guide <span aria-hidden="true">↗</span></button></div><label class="caregiver-guide-label" for="caregiver-guide-text">Preview the message</label><textarea id="caregiver-guide-text" class="caregiver-guide-preview" readonly rows="7">${esc(guide)}</textarea><button class="link caregiver-copy-button" type="button" data-copy-guide>Copy guide</button><p class="caregiver-guide-note">Only share with people you trust. This stays in this browser; sending it to someone else does not sync future changes.</p></section><section class="family-latest"><div class="family-latest-heading"><div><div class="eyebrow">A little at a time</div><h2>Latest from ${esc(childLabel(child,index))}</h2></div><button type="button" class="family-see-all" data-go="toolkit">See your village <span aria-hidden="true">→</span></button></div>${familyActivityMarkup(child)}</section>${familyWeekMarkup()}${familyIdeasMarkup()}<div class="family-footer"><span class="family-footer-mascot" aria-hidden="true">☺</span><p>Every family has its own rhythm. Small moments count.</p></div></div>`}
function familyMarkup(){return `<div class="split"><section><div class="eyebrow">Your family unit</div><h1>About your family.</h1><p class="muted">Add each child and tell us what would make support useful. You can update your family anytime.</p><form id="family-form"><label class="field"><span>Family name <span class="muted">(optional)</span></span><input name="family-name" value="${esc(familyDraft.name||'')}" placeholder="A name for your family unit" autocomplete="off" maxlength="80"></label><div id="family-errors" class="error" role="alert" tabindex="-1"></div>${familyDraft.children.map((c,i)=>`<fieldset class="child-section"><legend>${esc(childLabel(c,i))}</legend><div class="child-header"><span class="muted">Child ${i+1} of ${familyDraft.children.length}</span>${familyDraft.children.length>1?`<button class="remove-child" type="button" data-remove-child="${c.id}" aria-label="Remove ${esc(childLabel(c,i))}">Remove child</button>`:''}</div><div class="inline-grid"><label class="field"><span>Nickname <span class="muted">(optional)</span></span><input name="name-${c.id}" value="${esc(c.name)}" placeholder="e.g. Alex" autocomplete="off" maxlength="60"></label><label class="field"><span>Age <span aria-hidden="true">*</span></span><select name="age-${c.id}" required>${Array.from({length:11},(_,n)=>n+2).map(a=>`<option ${String(a)===String(c.age)?'selected':''} value="${a}">${a} years</option>`).join('')}</select></label></div><div class="field"><span id="goals-label-${c.id}">What do you need help with? <span aria-hidden="true">*</span></span><p class="muted">Choose all that apply.</p><div class="topic-groups" role="group" aria-labelledby="goals-label-${c.id}">${helpTopics.map(g=>`<div class="topic-group"><h3>${g.group}</h3><div class="topic-grid">${g.topics.map(t=>`<label class="topic-choice"><input type="checkbox" name="goals-${c.id}" value="${esc(t)}" ${c.goals.includes(t)?'checked':''}><span>${t}</span></label>`).join('')}</div></div>`).join('')}</div></div><label class="field" id="other-field-${c.id}" ${c.goals.includes('Something else')?'':'hidden'}><span>What else would you like help with? *</span><input name="other-${c.id}" value="${esc(c.otherGoal)}" ${c.goals.includes('Something else')?'required':''} placeholder="Describe the area you have in mind" maxlength="300"></label><label class="field"><span>Needs and preferences <span aria-hidden="true">*</span></span><textarea name="needs-${c.id}" required aria-describedby="needs-hint-${c.id}" placeholder="Interests, sensory or accessibility needs, routines, available time or space…">${esc(c.needs)}</textarea><small class="muted" id="needs-hint-${c.id}">What should options take into account? If none, write “No specific needs”.</small></label><label class="field"><span>What already helps? <span class="muted">(optional)</span></span><input name="helps-${c.id}" value="${esc(c.helps)}" placeholder="Activities or approaches that work for this child" maxlength="300"></label><label class="field"><span>What helps them feel calm? <span class="muted">(optional)</span></span><textarea name="regulation-${c.id}" rows="3" maxlength="500" placeholder="For example: a quiet space, a familiar song, or a few minutes to reset">${esc(c.regulation||'')}</textarea></label><label class="field"><span>An easy game to play together <span class="muted">(optional)</span></span><input name="game-${c.id}" value="${esc(c.game||'')}" placeholder="A favorite simple game, with anything needed" maxlength="300"></label></fieldset>`).join('')}<button class="add-child" type="button" id="add-child">+ Add another child</button><div class="actions"><button class="primary" type="submit">Save family unit <span>→</span></button></div><p class="muted">* Required for each child.</p></form><div class="notice">This demo saves your family unit in this browser, without an account. Use fictional details while exploring.</div></section><aside class="panel lav family-aside"><div class="small-art">${art()}</div><h2>One family. Different needs.</h2><p class="muted">Keep each child’s preferences together, then choose who you’re finding options for.</p><p class="muted">${familyDraft.children.length} ${familyDraft.children.length===1?'child':'children'} in your family unit</p></aside></div>`}
function childSelector(){return `<label class="child-picker"><span>Finding options for</span><select id="active-child" aria-label="Choose a child">${data.family.children.map((c,i)=>`<option value="${c.id}" ${c.id===activeChild().id?'selected':''}>${esc(childLabel(c,i))} · age ${esc(c.age)}</option>`).join('')}</select></label><button type="button" class="link" data-go="family-edit">Edit family</button>`}
function persist(){try{data.feedback.forEach(item=>{if(!item.childId)item.childId=data.family.activeChildId});localStorage.setItem(dataStorageKey,JSON.stringify(data))}catch{toast('Browser storage is unavailable. Changes last for this visit.')}}
function addWeeklyGoal(category,title){const text=String(title||'').trim();if(!text)return false;data.weeklyGoals.items.push({id:'goal-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),category,text,done:false});persist();return true}
function toast(t){$('#announcer').innerHTML='<div class="toast">'+esc(t)+'</div>';setTimeout(()=>$('#announcer').innerHTML='',3000)}
const icons={
 today:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
 learn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14M12 7C9 4.5 5.5 4 3 5v14c3-1 6.5-.5 9 2m0-14c3-2.5 6.5-3 9-2v14c-3-1-6.5-.5-9 2"/></svg>',
 family:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8"/></svg>',
 care:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M12 13v5M9.5 15.5h5"/></svg>'
};

// The four sign-up options. Each one has a research-based answer that
// PAAL shows on the Family page and uses in the chat.
// `pattern` = words in a chat message that point to this topic.
// `{child}` is replaced with the child's name (or "your child").
const STRUGGLES = [
  {
    id: 'sleep',
    label: 'Putting them to sleep',
    tone: 'lav',
    pattern: /\b(sleep\w*|asleep|bed\w*|nap\w*|night\w*|wak\w*|tired)\b/g,
    example: '{child} won’t fall asleep at night',
    intro: 'Bedtime struggles are really common, and there’s good research on this. Here’s what tends to help {child} wind down:',
    title: 'A calm, predictable bedtime routine',
    method: 'Bedtime-routine research by Jodi Mindell and colleagues',
    teaser: 'The same short routine every night helps children fall asleep faster.',
    summary: 'In a well-known study led by sleep researcher Jodi Mindell, babies and toddlers whose parents followed the same simple routine every night fell asleep faster and woke up less, within just a few weeks.',
    steps: [
      'Pick a bedtime and keep it the same every night, weekends included.',
      'Use the same 3–4 calm steps in the same order, about 20–30 minutes in total: for example bath, pajamas, a book, a cuddle.',
      'Turn screens off at least an hour before bed and keep the lights dim.',
      'Say goodnight while they’re drowsy but still awake, so they learn to fall asleep on their own.',
      'Give it two to three weeks. Routines work through repetition.'
    ],
    nuance: 'Every child is different. Illness, travel, new siblings and growth spurts can throw sleep off for a while. If sleep problems last or you’re worried, talk with your pediatrician.',
    source: SOURCES.bedtimeRoutine,
    lessonId: 'bedtime-routine'
  },
  {
    id: 'screens',
    label: 'Taking them off screens',
    tone: 'sky',
    pattern: /\b(screens?|tablets?|ipads?|phones?|tv|television|youtube|videos?|games?|gaming|cartoons?|shows?|devices?)\b/g,
    example: '{child} fights me when I turn off the tablet',
    intro: 'Turning screens off is hard for lots of kids (and grown-ups!). Here’s the approach pediatricians recommend:',
    title: 'Plan screen time, then make the ending predictable',
    method: 'American Academy of Pediatrics media guidance',
    teaser: 'Agree on limits ahead of time and give warnings before it ends.',
    summary: 'The American Academy of Pediatrics and the World Health Organization recommend clear, consistent limits (about an hour a day of quality content for ages 2–5) and planning screen time ahead instead of negotiating it every time.',
    steps: [
      'Decide together when and where screens are used, for example after dinner, but not at meals or in bedrooms.',
      'Agree on the ending before it starts: “Two episodes, then we turn it off.”',
      'Give a 5-minute and a 1-minute warning, or use a visual timer.',
      'Use “when–then”: “When the tablet is off, then we can go to the park.”',
      'Have the next activity ready, and stay calm and consistent if they protest. It gets easier with repetition.'
    ],
    nuance: 'The goal isn’t zero screens. Video calls with family and watching together are different from solo scrolling. Choose limits that fit your family, and model them yourself when you can.',
    source: SOURCES.mediaPlan,
    lessonId: 'screen-plan'
  },
  {
    id: 'tantrums',
    label: 'Controlling temper tantrums',
    tone: 'peach',
    pattern: /\b(tantrums?|meltdowns?|temper|angry|anger|mad|scream\w*|yell\w*|hit|hits|hitting|kick\w*|cry\w*|upset|frustrat\w*|outbursts?)\b/g,
    example: '{child} has big tantrums when told no',
    intro: 'Tantrums are exhausting, and they’re a normal part of growing up. Here’s a well-studied way to respond when {child} melts down:',
    title: 'Stay calm, keep it short, and praise the calm',
    method: 'Parent-Child Interaction Therapy (PCIT) by Sheila Eyberg',
    teaser: 'Give lots of attention to calm behavior and very little to the tantrum.',
    summary: 'PCIT is one of the most studied approaches for tantrums and defiance in young children. Its core idea: give lots of warm, positive attention to calm behavior, and very little attention to tantrum behavior that isn’t dangerous.',
    steps: [
      'Keep everyone safe first. Move your child or nearby objects if you need to.',
      'Stay calm and use few words: “You’re really mad. I’m right here.”',
      'Don’t argue, bribe or lecture during the tantrum. Calmly ignore yelling and whining, but never unsafe behavior.',
      'The moment they calm down, give warm, specific praise: “You calmed your body. That was hard!”',
      'Every day, spend 5 minutes of “special time” letting them lead the play while you praise, describe and copy what they do.'
    ],
    nuance: 'Tantrums are most common between ages 1 and 4. If they are very frequent, very long, or involve hurting themselves or others, talk with your pediatrician. Trained PCIT therapists can help too.',
    source: SOURCES.pcit,
    lessonId: 'calm-tantrums'
  },
  {
    id: 'learn',
    label: 'I just want to learn',
    tone: 'mint',
    pattern: /\b(learn\w*|talk\w*|play\w*|connect\w*|bond\w*|language|develop\w*|brain|teach\w*|grow\w*)\b/g,
    example: 'How can I help {child} learn and grow?',
    intro: 'I love that you want to learn! One of the most powerful everyday things you can do with {child} is called “serve and return”:',
    title: 'Serve and return: small back-and-forth moments',
    method: 'Harvard Center on the Developing Child',
    teaser: 'Everyday back-and-forth moments build your child’s brain.',
    summary: 'Harvard researchers found that everyday back-and-forth moments, where your child “serves” with a look, sound or point and you “return” it, help build the brain connections behind language and social skills.',
    steps: [
      'Notice the serve: what is your child looking at, pointing to or saying?',
      'Return it with a smile, a nod, or a few words about it.',
      'Give it a name: “That’s a big red truck!”',
      'Take turns and wait. Give them time to respond.',
      'Follow their lead when they’re ready to move on to something new.'
    ],
    nuance: 'You don’t need to be available every moment. Even short exchanges count.',
    source: SOURCES.harvardServe,
    lessonId: 'responsive-connection'
  }
];

// Lessons for the Learn page. The first three come from the struggles above;
// the rest are Lili's original lessons.
// A section body can be a string (paragraph) or a list of steps.
const LESSONS = [
  ...STRUGGLES.filter(s => s.id !== 'learn').map(s => ({
    id: s.lessonId,
    title: s.title,
    teaser: s.teaser,
    time: '4 min',
    tone: s.tone,
    sections: [['The idea', s.summary], ['Try it', s.steps], ['A useful nuance', s.nuance]],
    sources: [s.source]
  })),
  {
    id: 'responsive-connection',
    title: 'Small moments of back-and-forth connection',
    teaser: 'How ordinary responses to a child’s cues can support connection and early communication.',
    time: '4 min',
    tone: 'mint',
    sections: [
      ['The idea', 'When a young child points, babbles, shows you something, or seeks comfort, a responsive back-and-forth exchange can support early communication and relationships. Harvard’s Center on the Developing Child calls these exchanges “serve and return.”'],
      ['What it can look like', 'Notice what has your child’s attention. Pause, respond with a word, gesture, or shared look, then give them room to respond in their own way. A short exchange counts; it does not need to become a planned activity.'],
      ['A useful nuance', 'Caregivers cannot be perfectly available every moment. Stress, disability, sensory needs, culture, and a child’s temperament shape what connection looks like. This is a helpful model, not a test of parental performance.']
    ],
    sources: [SOURCES.harvardServe, SOURCES.cdcCommunication]
  },
  {
    id: 'listen-and-name',
    title: 'Listening before solving',
    teaser: 'Reflecting a child’s message or feeling can communicate that you are paying attention.',
    time: '3 min',
    tone: 'pink',
    sections: [
      ['The idea', 'The CDC recommends active listening: giving attention, reflecting what a child said, and naming a possible feeling without insisting that your guess is right. This can create space for a child to share more.'],
      ['Try a low-pressure phrase', '“It sounds like that was frustrating. Did I get that right?” If the child corrects you, follow their lead. Some children prefer fewer words, more processing time, or a nonverbal response.'],
      ['Keep expectations realistic', 'Listening is not a guarantee that a child will calm down or agree. You can validate a feeling while still holding a necessary safety boundary. Choose a moment and communication style that fit your child.']
    ],
    sources: [SOURCES.cdcCommunication]
  },
  {
    id: 'play-following',
    title: 'Following your child’s lead in play',
    teaser: 'Use shared play to connect without turning every moment into a lesson.',
    time: '4 min',
    tone: 'gold',
    sections: [
      ['The idea', 'Child-led play gives a child room to choose the activity and direction while an adult follows with attention. The CDC describes imitation and specific descriptions as ways to show interest and support interaction.'],
      ['Try it', 'Join with a similar toy or describe what your child is doing: “You lined up the blue blocks.” Wait to see whether they invite more. You can keep it brief and use materials or movement that work for your family.'],
      ['A useful nuance', 'Play preferences vary. A child may want parallel play, movement, quiet, or no adult joining right then. Following their cues matters more than performing a particular play technique.']
    ],
    sources: [SOURCES.cdcPlay, SOURCES.cdcCommunication]
  }
];


// Guided activities below the chat. PAAL walks you through each step.
// A step lasts `secs` seconds, or `breathe` breathing cycles of 9 seconds
// (2s in through the nose, 1s extra sip in, 6s slowly out through the mouth).
// `{child}` is replaced with the children's names.
const BREATH_CYCLE = 9;
const ACTIVITIES = [
  {
    id: 'parent-reset',
    title: 'Parent reset',
    kind: 'Guided meditation · for you',
    minutes: 4,
    tone: 'lav',
    summary: 'A short breathing and self-kindness practice for when you feel stretched thin.',
    basedOn: 'Cyclic sighing (Stanford study, Balban et al., 2023), Kristin Neff’s self-compassion break, and mindful-parenting research',
    sources: [SOURCES.cyclicSighing, SOURCES.selfCompassion, SOURCES.mindfulParenting],
    steps: [
      { title: 'Arrive', secs: 18, say: 'Hi, I’m PAAL. Let’s take a few minutes, just for you. Sit or stand somewhere comfortable. You don’t need to do this perfectly. Just follow along.' },
      { title: 'Notice', secs: 25, say: 'Feel where your body touches the chair or the floor. Let your shoulders drop a little. Notice your breathing, without trying to change it.' },
      { title: 'Cyclic sighing', breathe: 8, say: 'Now let’s breathe together. Breathe in through your nose, then take one more short sip of air on top. Then let it all out slowly through your mouth. Follow my circle.' },
      { title: 'Soften', secs: 30, say: 'Let your breathing go back to normal. Unclench your jaw. Relax your hands. Notice anything that feels tight, and let it soften just a little.' },
      { title: 'Be kind to yourself', secs: 40, say: 'Put a hand on your chest if you like, and say to yourself: This is a hard moment. Hard moments are part of every parent’s life. May I be kind to myself right now.' },
      { title: 'Choose one thing', secs: 25, say: 'Before you go back, pick one small intention. Maybe: I’ll take one breath before I respond. That’s it. That’s enough.' },
      { title: 'All done', secs: 12, say: 'Well done. You can come back to this anytime, even for one minute. Doing it daily is where the benefits add up.' }
    ]
  }
];

// Screen-free ideas PAAL suggests in the chat, matched to the child's age.
// ages = [youngest, oldest]; anywhere = needs no supplies (good for waiting rooms or the car)
const QUICK_IDEAS = [
  { title: 'Mirror faces', ages: [0, 2], anywhere: true, how: 'Make a surprised face, a silly face, a happy face, and let them copy you (or copy them!).' },
  { title: 'Sing and bounce', ages: [0, 3], anywhere: true, how: 'A knee-bounce song like “Row, Row, Row Your Boat” with a big “whee!” at the end.' },
  { title: 'Pots-and-spoons band', ages: [0, 3], how: 'Hand over a pot and a wooden spoon and drum along to a song you sing together.' },
  { title: 'Freeze dance', ages: [2, 10], how: 'Sing or hum a song and stop suddenly. Everyone freezes like a statue!' },
  { title: 'I spy colors', ages: [2, 12], anywhere: true, how: '“I spy something… blue!” Take turns guessing and spying.' },
  { title: 'Tape road', ages: [2, 6], how: 'Make a road on the floor with painter’s tape and drive toy cars along it.' },
  { title: 'Little kitchen helper', ages: [2, 10], how: 'Give a real job: washing vegetables, stirring, tearing lettuce, setting out spoons.' },
  { title: 'Water painting', ages: [2, 8], how: 'A brush and a cup of water on the sidewalk or a fence. The art “disappears” as it dries.' },
  { title: 'Simon says', ages: [3, 10], anywhere: true, how: 'Mix silly moves (hop like a frog) with calm ones (touch your nose, whisper your name).' },
  { title: 'Sock basketball', ages: [3, 12], how: 'Roll up socks and shoot them into a laundry basket. Step back after every basket.' },
  { title: 'Scavenger hunt', ages: [3, 12], anywhere: true, how: 'Find something red, something soft and something round. Older kids: something that starts with “B”.' },
  { title: 'Pillow fort', ages: [3, 10], how: 'Couch cushions and a blanket. Read or play inside with a flashlight.' },
  { title: 'Story chain', ages: [4, 17], anywhere: true, how: 'Take turns adding one sentence to a silly story: “Once there was a dragon who hated…”' },
  { title: 'Would you rather', ages: [5, 17], anywhere: true, how: '“Would you rather have a pet dinosaur or a flying bike?” Take turns asking.' },
  { title: 'Paper airplane contest', ages: [5, 17], how: 'Fold planes and see whose flies furthest, then try a new design.' },
  { title: 'Quick card game', ages: [5, 17], how: 'A round of Go Fish, War or Uno.' },
  { title: '20 questions', ages: [6, 17], anywhere: true, how: 'Think of an animal or a person; everyone else asks yes/no questions to guess it.' },
  { title: 'Snack chef', ages: [6, 17], how: 'Let them make a snack for everyone: fruit skewers, a sandwich or popcorn.' }
];
// Stable ids for saving ideas (family_saved_ideas.idea_id), e.g. 'freeze-dance'
QUICK_IDEAS.forEach(idea => { idea.id = idea.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); });


/* ---------- 2. STATE ---------- */

// A different key from Lili's version ('paal-prototype'), so the two never clash.
const STORAGE_KEY = 'paal-andres';
const DATA_VERSION = 2;

// Saved data uses the same names as the tables and columns in Lili's Supabase schema
// (supabase/migrations/20261103220000_initial_shared_care.sql), so it can be synced later as-is:
//   profile           → profiles                        { display_name }
//   family            → families                        { name, children }
//   family.children   → family_children                 [{ id, nickname, age, goals: ['sleep', …, 'other'], other_goal }]
//   guides[child_id]  → child_care_guides               { needs, what_helps, calming_strategies, easy_game }
//   care.caregivers   → family_memberships (caregivers) [{ id, display_name }]
//   care.permissions  → family_member_child_permissions [{ caregiver_id, child_id, can_view_plan, can_view_guide, can_view_toolkit, can_view_updates, can_view_requests }]
//   care.blocks       → care_blocks                     [{ id, child_id, care_date, starts_at, title, details, assigned_to, created_at }]
//   care.updates      → handoff_updates                 [{ id, child_id, kind, body, created_at }]
//   care.requests     → help_requests                   [{ id, child_id, body, needed_by, assigned_to, status, accepted_by, accepted_at, created_at }]
//   saved_ideas       → family_saved_ideas              [{ id, child_id, idea_id, created_at }]
//   idea_feedback     → family_idea_feedback            [{ id, child_id, idea_id, result, note, created_at }]
// App-only (no table yet): completed lessons, chat, activeChildId, activityRuns, voice.

// What a caregiver may see for a child (the can_view_* columns)
const CARE_SCOPES = [
  ['plan', 'Today’s care plan'],
  ['guide', 'Child care guide'],
  ['toolkit', 'Saved ideas (family toolkit)'],
  ['updates', 'Handoff updates'],
  ['requests', 'Help requests']
];

function permissionRow(caregiver_id, child_id, scopes) {
  return { caregiver_id, child_id, ...Object.fromEntries(CARE_SCOPES.map(([s]) => [`can_view_${s}`, scopes.includes(s)])) };
}

function emptyState() {
  return {
    version: DATA_VERSION,
    profile: null,
    family: null,
    guides: {},
    care: { caregivers: [], permissions: [], blocks: [], updates: [], requests: [] },
    saved_ideas: [],
    idea_feedback: [],
    completed: [],
    chat: [],
    activeChildId: null,
    activityRuns: {},
    voice: true
  };
}

// Upgrade data saved by version 1 of this app, which used different names
function migrate(saved) {
  if (saved.version >= DATA_VERSION) return saved;
  const next = { ...emptyState(), ...saved, version: DATA_VERSION, profile: null };
  const old = saved.profile;
  if (old && Array.isArray(old.children)) {
    next.profile = { display_name: old.parentName || '' };
    next.family = {
      name: old.parentName ? `${old.parentName}’s family` : 'My family',
      children: old.children.map(c => ({ id: c.id, nickname: c.name || '', age: Number(c.age) || 0, goals: [...(old.struggles || [])], other_goal: '' }))
    };
    next.guides = Object.fromEntries(old.children.map(c =>
      [c.id, { needs: c.needs || '', what_helps: '', calming_strategies: c.calm || '', easy_game: c.game || '' }]));
  }
  const care = saved.care || {};
  next.care = {
    caregivers: (care.caregivers || []).map(p => ({ id: p.id, display_name: p.name || '' })),
    permissions: (care.caregivers || []).flatMap(p => (p.childIds || []).map(childId => permissionRow(p.id, childId, p.permissions || []))),
    blocks: (care.blocks || []).map(b => ({ id: b.id, child_id: b.childId, care_date: b.date, starts_at: b.time, title: b.title,
      details: b.details || '', assigned_to: b.caregiverId || '', created_at: b.createdAt })),
    updates: (care.updates || []).map(u => ({ id: u.id, child_id: u.childId, kind: u.kind, body: u.text, created_at: u.createdAt })),
    requests: (care.requests || []).map(r => ({ id: r.id, child_id: r.childId, body: r.text, needed_by: r.time || '',
      assigned_to: r.caregiverId || '', status: r.status, accepted_by: r.status === 'accepted' ? (r.caregiverId || 'owner') : '',
      accepted_at: r.acceptedAt || '', created_at: r.createdAt }))
  };
  return next;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return emptyState();
    const loaded = migrate(saved);
    return { ...emptyState(), ...loaded, care: { ...emptyState().care, ...loaded.care } };
  } catch {
    return emptyState();
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* private mode: keep working in memory */ }
}

let state = loadState();
save(); // stores upgraded (migrated) data right away


/* ---------- 3. HELPERS ---------- */

const $ = selector => document.querySelector(selector);

const esc = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Kids get these colors in order; lavender is last so it doesn't look like PAAL
const CHILD_TONES = ['peach', 'mint', 'sky', 'gold', 'pink', 'lav'];
const TONE_COLORS = { lav: '#b892ea', peach: '#f4a37f', mint: '#7cc59a', sky: '#7fb0dc', gold: '#e6c25a', pink: '#e994b8' };

// ['Mia', 'Leo', 'Sam'] -> 'Mia, Leo and Sam'
function listNames(names) {
  return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names.at(-1);
}

function familyKids() {
  return state.family.children;
}

function childNames() {
  return listNames(familyKids().map(c => c.nickname));
}

function ageLabel(age) {
  const n = Number(age);
  return n === 0 ? 'Under 1 year' : n === 1 ? '1 year old' : `${n} years old`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function isDone(lessonId) {
  return state.completed.includes(lessonId);
}

function doneCount() {
  return LESSONS.filter(l => isDone(l.id)).length;
}

function toast(message) {
  $('#announcer').innerHTML = `<div class="toast">${esc(message)}</div>`;
  setTimeout(() => { $('#announcer').innerHTML = ''; }, 3000);
}

// Shared eyes for both characters: white eyes, pupils that glance around, a sparkle.
function eyes(spots, r) {
  return `<g class="char-eyes">
    ${spots.map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff"/>`).join('')}
    <g class="char-pupils">
      ${spots.map(([x, y]) => `<circle cx="${x + 2}" cy="${y + 4}" r="${r}" fill="#20251f"/><circle cx="${x + 2 - r / 3}" cy="${y + 4 - r / 3}" r="${r / 3}" fill="#fff"/>`).join('')}
    </g>
  </g>`;
}

// The PAAL character: the tall purple friend from Lili's original illustration
// (same body outline and legs as her art() drawing), with a smile and rosy cheeks.
// Sizes: paal-xs / paal-md / paal-lg / paal-peek (see styles.css)
// wave = true adds arms, one of them waving.
function paal(classes = '', wave = false) {
  return `<svg class="paal ${classes}" viewBox="84 64 184 250" aria-hidden="true">
    <path class="char-line" d="M112 286L98 308L127 308M182 286L192 307L212 309"/>
    <g class="paal-sway">
      <path class="paal-body" d="M100 297C96 236 119 179 148 133C166 104 192 66 221 74C257 82 251 114 227 147C198 187 191 244 192 296Z"/>
      ${eyes([[219, 102, 10, 13], [239, 111, 10, 13]], 6)}
      <ellipse class="char-cheek" cx="203" cy="127" rx="7" ry="4.5"/>
      <ellipse class="char-cheek" cx="234" cy="134" rx="4.5" ry="3.5"/>
      <path class="char-line" d="M207 136Q217 149 228 139"/>
      ${wave ? '<path class="char-line" d="M118 200Q100 214 96 236"/><path class="char-line paal-wave" d="M206 172Q236 168 250 136"/>' : ''}
    </g>
  </svg>`;
}

// Kids grow with their age: a short round baby, up to a taller teen.
function ageStage(age) {
  const n = Number(age);
  return n <= 1 ? 'baby' : n <= 4 ? 'toddler' : n <= 9 ? 'kid' : 'teen';
}

// w = width, h = height, eye = [eye width, eye height, pupil size]
const STAGES = {
  baby:    { w: .74, h: 58,  eye: [7, 8.5, 3.6] },
  toddler: { w: .9,  h: 82,  eye: [8.5, 11, 4.4] },
  kid:     { w: 1,   h: 104, eye: [9, 11.5, 4.5] },
  teen:    { w: .94, h: 128, eye: [8.5, 11, 4.3] }
};
function rightNowControls(){return `<section class="right-now" aria-label="Right now preferences"><div class="right-now-heading"><span>Right now</span><p>Choose what fits today. You can change these anytime.</p></div>${filterGroups.map(([group,values])=>`<fieldset class="filter-group"><legend>${group}</legend><div class="filter-options">${values.map(value=>`<button type="button" class="filter-option ${data.filters.includes(value)?'selected':''}" aria-pressed="${data.filters.includes(value)}" data-filter="${value}" data-group="${values.join('|')}">${value}</button>`).join('')}</div></fieldset>`).join('')}</section>`}
const quickMoments=[['After-school screens','My child asks for screens after school. What else could we try?'],['Bedtime','Bedtime transitions are hard for us. What could help?'],['Big feelings','My child is having big feelings. How can I connect?']];
function quickMomentMarkup(){return `<div class="quick-moments" aria-label="Common moments"><span class="quick-character" aria-hidden="true">${art()}</span>${quickMoments.map(([label,concern])=>`<button type="button" class="quick-moment" data-quick-concern="${esc(concern)}">${esc(label)}</button>`).join('')}</div>`}
function options(){let terms=(data.concern+' '+activeChild().goals.join(' ')+' '+activeChild().otherGoal).toLowerCase();return [...ideas].sort((a,b)=>score(b,terms)-score(a,terms))}function score(x,t){const energy=data.filters.find(value=>['Low energy','A little energy','Ready to join in'].includes(value));const setting=data.filters.find(value=>['At home','Out and about','At someone else’s home'].includes(value));const resource=data.filters.find(value=>['No extra materials','Everyday items','Materials available'].includes(value));return x.tags.reduce((n,w)=>n+(t.includes(w)?2:0),0)+(resource==='No extra materials'&&x.supplies==='No supplies'?4:resource==='Materials available'&&x.supplies!=='No supplies'?3:resource==='Everyday items'&&x.supplies==='Paper + crayons'?2:0)+(energy==='Low energy'&&['notice','draw'].includes(x.id)?-2:energy==='A little energy'&&['connect','story','book'].includes(x.id)?1:energy==='Ready to join in'&&['draw','notice'].includes(x.id)?2:0)+(setting==='Out and about'&&['notice','story'].includes(x.id)?2:0)+(setting==='At someone else’s home'&&x.supplies==='No supplies'?1:0)}
function navigate(p){if(activeRecognition)activeRecognition.stop();if(p==='toolkit'){p='care';if(page==='feedback')tab='history';else if(tab==='resources')tab='saved'}else if(p==='resources'){p='care';tab='resources'}if(page==='family-edit'&&p==='today')p='family';if(p==='family-edit'&&page!=='family-edit')familyDraft=structuredClone(data.family);page=p;query='';render();window.scrollTo({top:0,behavior:'instant'})}function selectIdea(id,from){selected=ideas.find(x=>x.id===id);lastPage=from||page;navigate('detail')}function saveIdea(id){if(data.saved.includes(id)){data.saved=data.saved.filter(x=>x!==id);toast('Removed from your toolkit')}else{data.saved.push(id);toast('Saved to your toolkit')}persist();render()}
function nav(mobile=false){const items=[['today','Today','today'],['progress','Learn','learn'],['care','Care','care'],['family','Family','family']];return `<nav class="${mobile?'mobile-nav':'side-nav'}" aria-label="Main navigation">${items.map(([route,label,icon])=>{const active=(route==='today'&&(['today','options','detail','feedback','circumstances'].includes(page))&&!(page==='detail'&&['toolkit','care'].includes(lastPage))&&!(page==='feedback'&&['toolkit','care'].includes(lastPage)))||(route==='progress'&&page==='progress')||(route==='care'&&(page==='care'||(page==='detail'&&lastPage==='care')||(page==='feedback'&&lastPage==='care')))||(route==='family'&&(page==='family'||page==='family-edit'));return `<button class="${mobile?'':'nav-item '}${active?'active':''}" data-go="${route}"${active?' aria-current="page"':''}><span aria-hidden="true">${icons[icon]}</span>${label}</button>`}).join('')}</nav>`}
function shell(content){$('#app').innerHTML=`<div class="layout ${page==='welcome'?'welcome-page':''}"><aside class="sidebar"><button class="logo" data-go="welcome" aria-label="Paal welcome">paal</button>${nav()}<div class="side-foot"><span class="prototype">Interactive prototype</span><p>A few more possibilities.<br>A little more confidence.</p><button class="reset" id="reset">Reset demo</button></div></aside><main class="main"><header class="topbar"><button class="logo" data-go="welcome">paal</button><span class="tagline">Your family. Your way.</span>${backendConfigured?`<span class="account-email">${esc(authUser.email||'')}</span><button class="secondary sign-out" id="sign-out">Sign out</button>`:`<button class="profile" data-go="family" aria-label="Family profile">♙</button>`}</header><div class="fade">${content}</div></main>${nav(true)}</div>`;bind();bindCare();bindCareLibrary();$('#sign-out')?.addEventListener('click',async()=>{const {error}=await supabaseClient.auth.signOut();if(error){toast('Could not sign out: '+error.message)}})}
function render(){if(backendConfigured&&(!authUser||authMode==='recovery')){renderAuth();return}if(page==='toolkit')page='care';else if(page==='resources'){page='care';tab='resources'}let content='';if(page==='welcome')content=`<div class="hero"><div><div class="eyebrow">A companion for everyday parenting</div><h1>More ways to handle everyday parenting.</h1><p class="lead">Options and resources that fit your family, your circumstances, and the moment you're in.</p><div class="actions"><button class="primary" data-go="family">Get started <span>↗</span></button><button class="link" id="explore">Explore the demo</button></div></div><div class="art">${art()}</div></div><div class="welcome-foot"><span>Tailored to your circumstances</span><span>Practical options</span><span>Room to try again</span></div><p class="muted">An interactive concept with sample suggestions. No account needed.</p>`;
if(page==='family')content=familyHomeMarkup().replace('See your village','Open care toolkit');
if(page==='care')content=careMarkup()+careLibraryMarkup();
if(page==='family-edit')content=familyMarkup();
if(page==='progress')content=progressShell();
if(page==='today')content=`<div class="split"><section><div class="eyebrow">Today</div><h1>What's happening today?</h1><p class="muted">Start with a moment you’d like another way to handle.</p><form id="ask-form"><div class="quick-start"><span class="badge">A common moment</span>${quickMomentMarkup()}</div><label for="concern" class="badge">Or describe what's happening</label><div class="voice-entry"><button class="voice-button" id="voice-input" type="button">Speak instead</button><span id="voice-status" role="status" aria-live="polite"></span></div><textarea class="concern" id="concern" name="concern" placeholder="A sentence is enough. What’s happening?">${esc(data.concern)}</textarea><details class="right-now-details"><summary>Adjust for right now <span>${esc(data.filters.join(' · '))}</span></summary>${rightNowControls()}${childSelector()}</details><button class="primary" type="submit">Find options <span>→</span></button></form></section><aside><div class="panel lav"><div class="small-art">${art()}</div><h2>A few more possibilities.</h2><p class="muted">You don't need the perfect words. Tell us what’s going on.</p></div>${data.saved.length?`<button class="row" onclick="selectIdea('${data.saved[0]}','today')"><span class="grow"><span class="muted">Pick up where you left off</span><h3>${esc(ideas.find(x=>x.id===data.saved[0])?.title||'Your toolkit')}</h3></span><span class="arrow">↗</span></button>`:''}<div class="notice">Demo suggestions use simple topic and circumstance matching. They are examples to explore, not individualized professional guidance.</div></aside></div>`;
if(page==='circumstances')content=`<div class="content"><button class="back" data-go="today">← Back</button><div class="eyebrow">Make it realistic</div><h1>What works for you right now?</h1><p class="muted">Choose what fits this moment. There is no time limit.</p>${rightNowControls()}<button class="primary" data-go="today">Use these circumstances <span>→</span></button></div>`;
if(page==='options'){let opts=options(),shown=[opts[offset%opts.length],opts[(offset+1)%opts.length]];content=`<div class="content options-page"><button class="back" data-go="today">← Back</button><section class="parent-pause"><div class="pause-art">${art()}</div><div><div class="eyebrow">First, a moment for you</div><h1>Pause. Take one slow breath.</h1><p>You don’t have to solve everything at once. You’re paying attention and looking for a way forward. That matters.</p></div></section><div class="eyebrow">What’s happening</div><p class="options-concern">${esc(data.concern||activeChild().goals.join(', '))}</p><div class="options-heading"><h2>Two approaches you could try</h2><p class="muted">Choose what feels manageable, adapt it, or skip both.</p></div><div class="option-list">${shown.map((x,i)=>`<button class="row option-card" data-idea="${x.id}"><span class="row-no">0${i+1}</span><span class="grow"><h2>${x.title}</h2><p class="option-desc">${x.desc}</p><div class="meta">${x.time} · ${x.supplies}</div></span><span class="arrow">›</span></button>`).join('')}</div><div class="actions"><button class="link" id="more">Show other options</button><button class="link" data-go="circumstances">Adjust what fits right now</button></div><p class="muted citation-hint">Each suggestion includes its sources. There isn’t one right answer for every family.</p></div>`}
if(page==='detail'){let x=selected||ideas[0];selected=x;content=`<div class="split"><section><button class="back" data-go="${lastPage}">← Back</button><div class="eyebrow">One approach to try</div><h1>${x.title}.</h1><p class="muted">${x.time} · ${x.supplies}</p><ol class="steps">${x.steps.map((s,i)=>`<li><span>${i+1}</span>${s}</li>`).join('')}</ol><div class="quote"><span class="badge">Words you could try</span><p>“${x.quote}”</p></div><details><summary>If this doesn't work</summary><p>${x.fallback}</p></details><details><summary>About this suggestion + resources</summary><p>This suggestion is a practical example, not a rule. Adapt it to your child’s needs, your family’s context, and what feels safe and workable.</p><button class="link" data-go="resources">Explore resource categories →</button></details>${citationMarkup(ideaSources[x.id]||[sources.cdcCommunication])}<div class="actions"><button class="primary" id="try">I'll try this <span>→</span></button><button class="link" data-save="${x.id}">${data.saved.includes(x.id)?'✓ Saved · Remove':'♡ Save for later'}</button></div></section><aside class="panel lav"><div class="small-art">${art()}</div><h2>Make it your own.</h2><p class="muted">You know your family. A small adjustment can make an option feel more realistic.</p></aside></div>`}
if(page==='feedback')content=`<div class="content feedback-panel"><div class="feedback-character" aria-hidden="true">${art()}</div><div class="eyebrow">Room to learn</div><h1>How did it go?</h1><p>${esc((selected||ideas[0]).title)}</p><div class="feedback-choices" role="group" aria-label="Did the suggestion help?">${['Helped','Partly',"Didn't fit"].map(c=>`<button class="${feedbackChoice===c?'selected':''}" data-feedback="${esc(c)}" aria-pressed="${feedbackChoice===c}">${c}</button>`).join('')}</div><label class="field"><span>Anything you'd change? <span class="muted">(optional)</span></span><textarea id="feedback-note" placeholder="A quick note, if you'd like…"></textarea></label><p class="muted">Your response stays in your family’s browser toolkit.</p><div class="actions"><button class="primary" id="save-feedback">Save feedback <span>→</span></button><button class="link" data-go="today">Skip</button></div></div>`;
if(page==='toolkit')content=`<div class="content"><div class="eyebrow">Family toolkit</div><h1>A little help, all in one place.</h1><p class="muted">Keep saved ideas, reflections, and trusted resources close by.</p><input class="search" id="toolkit-search" type="search" aria-label="Search toolkit" placeholder="Find an idea or resource" value="${esc(query)}"><div class="tabs"><button class="tab ${tab==='saved'?'active':''}" data-tab="saved">Saved ideas</button><button class="tab ${tab==='history'?'active':''}" data-tab="history">What we tried</button><button class="tab" data-go="resources">Resources ↗</button></div><div id="toolkit-list">${toolkitList()}</div><div class="actions"><button class="link" data-go="today">+ Find another option</button></div></div>`;
if(page==='resources')content=`<div class="content resource-page"><button class="back" data-go="toolkit">← Your toolkit</button><div class="resource-intro"><div><div class="eyebrow">Explore at your pace</div><h1>Find what fits.</h1></div><div class="resource-character" aria-hidden="true">${art()}</div></div>${resourceList()}</div>`;
shell(content)}
const resources=[{title:'HealthyChildren.org',category:'Parent guidance',desc:'Parent information from the American Academy of Pediatrics.',url:'https://www.healthychildren.org/'},{title:'ZERO TO THREE',category:'Parent guidance',desc:'Explore resources focused on babies, toddlers, and their caregivers.',url:'https://www.zerotothree.org/'},{title:'Reading Rockets',category:'Books & learning',desc:'Explore reading activities and resources for families.',url:'https://www.readingrockets.org/'},{title:'PBS KIDS for Parents',category:'Play & outdoors',desc:'Browse activities, play ideas, and family resources.',url:'https://www.pbs.org/parents/'},{title:'Your local library',category:'Books & learning',desc:'An idea to explore: check your library for story times, books, and family events.',url:null},{title:'A nearby park',category:'Play & outdoors',desc:'An idea to explore: choose a familiar, accessible outdoor spot for your family.',url:null}];
function progressMarkup(){const goals=data.weeklyGoals.items,done=goals.filter(goal=>goal.done).length,learning=goals.filter(goal=>goal.category==='Individual'),family=goals.filter(goal=>goal.category==='Family'),weekStart=new Date(`${data.weeklyGoals.week}T12:00:00`),weekEnd=new Date(weekStart);weekEnd.setDate(weekEnd.getDate()+6);const dateLabel=`${weekStart.toLocaleDateString(undefined,{month:'short',day:'numeric'})}–${weekEnd.toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;return `<div class="content progress-page"><div class="eyebrow">A week that works for your family</div><h1>Small goals, together.</h1><p class="muted">Choose a few things you’d like to learn or try this week. Plans can change; progress is just noticing what happened.</p><section class="week-summary"><div><span class="week-label">THIS WEEK · ${dateLabel}</span><h2>${done} of ${goals.length} goals reached</h2><div class="goal-meter" role="progressbar" aria-label="Weekly goals reached" aria-valuemin="0" aria-valuemax="${goals.length||1}" aria-valuenow="${done}"><span style="width:${goals.length?done/goals.length*100:0}%"></span></div></div><div class="week-characters">${art()}<p>You’re finding your family’s own rhythm.</p></div></section><div class="goal-columns"><section class="goal-group"><div class="progress-heading"><h2>Individual goals</h2><span class="goal-count">${learning.filter(goal=>goal.done).length}/${learning.length}</span></div>${goalList(learning,'Individual','No individual goals yet. Add one below when you’re ready.')}</section><section class="goal-group"><div class="progress-heading"><h2>Family goals</h2><span class="goal-count">${family.filter(goal=>goal.done).length}/${family.length}</span></div>${goalList(family,'Family','No family goals yet. Add one below when you’re ready.')}</section></div><section class="goal-builder"><div class="progress-heading"><h2>Add a goal for this week</h2><span class="muted">Keep it small and specific</span></div><div class="goal-suggestions"><button type="button" data-goal-suggestion="Individual" data-goal-text="Read or look through a book together">Read together</button><button type="button" data-goal-suggestion="Individual" data-goal-text="Explore one educational resource">Explore a resource</button><button type="button" data-goal-suggestion="Family" data-goal-text="Spend 10 minutes doing something we both enjoy">Share a moment</button><button type="button" data-goal-suggestion="Family" data-goal-text="Try one calmer transition this week">Try a new routine</button></div><form id="goal-form" class="goal-form"><label><span>Goal type</span><select name="category"><option>Family</option><option>Individual</option></select></label><label class="goal-text-field"><span>Your goal</span><input name="goal" maxlength="100" placeholder="For example, read together before bed" required></label><button class="primary" type="submit">Add goal <span>+</span></button></form></section><div class="progress-footer"><button class="link" data-go="resources">Browse learning resources →</button><span>Goals are saved privately in this browser. You can update or remove them anytime.</span></div></div>`}
function progressShell(){return `<div class="content progress-shell"><div class="progress-switch" role="tablist" aria-label="Progress views"><button class="${progressTab==='goals'?'active':''}" role="tab" aria-selected="${progressTab==='goals'}" data-progress-tab="goals">Weekly goals</button><button class="${progressTab==='learning'?'active':''}" role="tab" aria-selected="${progressTab==='learning'}" data-progress-tab="learning">Learning</button></div>${progressTab==='learning'?learningMarkup():progressMarkup()}</div>`}
function citationMarkup(list){return `<section class="citations"><h2>Sources</h2><ul>${list.map(source=>`<li><a href="${source.url}" target="_blank" rel="noopener noreferrer">${esc(source.title)}</a><span>${esc(source.publisher)}</span></li>`).join('')}</ul></section>`}
function lessonCommentsMarkup(lesson){const comments=data.lessonComments[lesson.id]||[];return `<section class="lesson-comments"><div class="progress-heading"><div><div class="eyebrow">Your reflection</div><h2>Make this lesson yours.</h2></div><span class="muted">Private in this browser</span></div><p class="muted">What might you try, adapt, or want to remember? Add a note for yourself or your family.</p><form class="lesson-comment-form" data-lesson-comment-form="${lesson.id}"><label class="sr-only" for="lesson-comment">Your private lesson comment</label><textarea id="lesson-comment" name="comment" maxlength="600" placeholder="Write a thought, question, or small next step…" required></textarea><button class="secondary" type="submit">Save note</button></form>${comments.length?`<ol class="lesson-comment-list">${comments.slice().reverse().map(comment=>`<li><p>${esc(comment.text)}</p><time datetime="${esc(comment.date)}">${new Date(comment.date).toLocaleString()}</time></li>`).join('')}</ol>`:'<p class="lesson-comment-empty">Your notes will appear here.</p>'}</section>`}
function learningMarkup(){const lesson=lessons.find(item=>item.id===activeLessonId);if(lesson){const completed=data.lessonProgress.includes(lesson.id),activity=lessonActivities[lesson.id],answer=data.lessonAnswers[lesson.id],progress=Math.round(data.lessonProgress.length/lessons.length*100);return `<article class="lesson-reader"><div class="lesson-progress-row"><button type="button" class="lesson-close" data-lesson-back aria-label="Back to all lessons">×</button><div class="lesson-progress-track" role="progressbar" aria-label="Lessons completed" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div><span class="lesson-mascot" aria-hidden="true">☺</span></div><p class="lesson-progress-note">No scores. Just steps.</p><div class="eyebrow">✦ &nbsp; New from neuroscience · ${lesson.time}</div><h1>${esc(lesson.title)}</h1><p class="lead">${esc(lesson.summary)}</p><div class="lesson-body">${lesson.sections.map(([heading,body])=>`<section><h2>${esc(heading)}</h2><p>${esc(body)}</p></section>`).join('')}</div>${activity?`<section class="lesson-activity"><div class="eyebrow">Pause and reflect</div><h2>${esc(activity.prompt)}</h2><p class="muted">No right answer. Choose what fits today, or just use it as a prompt to think.</p><div class="lesson-choices" role="group" aria-label="Reflection choices">${activity.choices.map(choice=>`<button type="button" class="lesson-choice ${answer===choice?'selected':''}" data-lesson-answer="${esc(choice)}" aria-pressed="${answer===choice}">${esc(choice)}</button>`).join('')}</div>${answer?`<p class="lesson-response" role="status">${esc(activity.responses[answer])}</p>`:''}</section>`:''}${lessonCommentsMarkup(lesson)}${citationMarkup(lesson.sources)}<button class="primary" data-lesson-complete="${lesson.id}" ${completed?'disabled':''}>${completed?'Lesson completed':'Mark lesson complete'} <span>${completed?'✓':'→'}</span></button></article>`}return `<section class="learning-library"><div class="lesson-library-mascot" aria-hidden="true">☺</div><div class="eyebrow">Research-informed, practical, and flexible</div><h1>Learn at your pace.</h1><p class="muted">Short lessons connect child-development research with everyday family life. Each lesson includes its sources and room for context.</p><div class="lesson-list">${lessons.map(lesson=>`<article class="lesson-card"><div><span class="lesson-time">${lesson.time}</span>${data.lessonProgress.includes(lesson.id)?'<span class="lesson-complete-label">Completed</span>':''}<h2>${esc(lesson.title)}</h2><p class="muted">${esc(lesson.summary)}</p><span class="lesson-source-count">${lesson.sources.length} cited ${lesson.sources.length===1?'source':'sources'}</span></div><button class="primary" data-start-lesson="${lesson.id}">Start lesson <span>→</span></button></article>`).join('')}</div><div class="lesson-note"><div class="small-art">${art()}</div><p>Evidence offers useful directions, not one right way to parent. Your child, culture, access needs, and family circumstances matter. This curated library links to research-informed sources; it does not search academic databases live.</p></div><button class="link" data-go="resources">Browse more parenting resources →</button></section>`}
function goalList(goals,category,emptyText){if(!goals.length)return `<p class="goal-empty">${emptyText}</p>`;return `<ul class="goal-list">${goals.map(goal=>`<li class="goal-item ${goal.done?'is-done':''}"><label><input type="checkbox" data-goal-toggle="${esc(goal.id)}" ${goal.done?'checked':''}><span>${esc(goal.text)}</span></label><button type="button" data-goal-remove="${esc(goal.id)}" aria-label="Remove goal: ${esc(goal.text)}">×</button></li>`).join('')}</ul>`}
function resourceList(){let list=resources.filter(r=>(resourceCategory==='All'||r.category===resourceCategory)&&(r.title+' '+r.desc).toLowerCase().includes(query.toLowerCase()));return list.map(r=>{const id=resources.indexOf(r),read=data.readResources.includes(id);return `<article class="resource"><div class="category-count">${esc(r.category)}</div><h3>${esc(r.title)}</h3><p class="muted">${esc(r.desc)}</p><div class="resource-actions">${r.url?`<a href="${r.url}" target="_blank" rel="noopener noreferrer">Visit resource ↗</a>`:''}<button class="read-toggle" data-read-resource="${id}" ${read?'disabled':''}>${read?'✓ Read':'Mark as read'}</button></div></article>`}).join('')||`<div class="character-empty"><div class="empty-character" aria-hidden="true">${art()}</div><p class="empty">No matches. Try another search.</p></div>`}
function toolkitList(){if(tab==='history')return data.feedback.filter(f=>(ideas.find(x=>x.id===f.id)?.title+' '+f.note).toLowerCase().includes(query.toLowerCase())).slice().reverse().map(f=>`<article class="row"><div class="grow"><h3>${esc(ideas.find(x=>x.id===f.id)?.title)}</h3><span class="meta">${esc(f.result)} · ${new Date(f.date).toLocaleDateString()}</span>${f.note?`<p class="muted">${esc(f.note)}</p>`:''}</div><button class="link" data-idea="${f.id}">Revisit</button></article>`).join('')||`<div class="character-empty"><div class="empty-character" aria-hidden="true">${art()}</div><p class="empty">Your reflections will appear here after you try an idea.</p></div>`;return ideas.filter(x=>data.saved.includes(x.id)&&x.title.toLowerCase().includes(query.toLowerCase())).map(x=>`<div class="row"><button class="grow" style="text-align:left;padding:0" data-idea="${x.id}"><h3>${x.title}</h3><span class="meta">${x.time} · ${x.supplies}</span></button><button class="save-toggle" data-save="${x.id}" aria-label="Remove ${x.title}">Remove</button></div>`).join('')||`<div class="character-empty"><div class="empty-character" aria-hidden="true">${art()}</div><p class="empty">Save an option you like and it will be waiting here.</p></div>`}
function bind(){document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{if(page==='today'&&$('#concern')){data.concern=$('#concern').value;persist()}let destination=b.dataset.go;if(destination==='family'&&page==='welcome'&&!familyProfileComplete(data.family))destination='family-edit';navigate(destination)});document.querySelectorAll('[data-idea]').forEach(b=>b.onclick=()=>selectIdea(b.dataset.idea,page));document.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>saveIdea(b.dataset.save));document.querySelectorAll('[data-progress-tab]').forEach(button=>button.onclick=()=>{progressTab=button.dataset.progressTab;activeLessonId=null;render()});document.querySelectorAll('[data-start-lesson]').forEach(button=>button.onclick=()=>{activeLessonId=button.dataset.startLesson;render()});document.querySelectorAll('[data-lesson-answer]').forEach(button=>button.onclick=()=>{data.lessonAnswers[activeLessonId]=button.dataset.lessonAnswer;persist();render()});document.querySelectorAll('[data-lesson-comment-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const text=String(new FormData(form).get('comment')||'').trim();if(!text)return;const id=form.dataset.lessonCommentForm;data.lessonComments[id]=data.lessonComments[id]||[];data.lessonComments[id].push({text,date:new Date().toISOString()});persist();render();toast('Private note saved')}));$('[data-lesson-back]')?.addEventListener('click',()=>{activeLessonId=null;render()});
$('[data-lesson-complete]')?.addEventListener('click',event=>{const id=event.currentTarget.dataset.lessonComplete;if(!data.lessonProgress.includes(id)){data.lessonProgress.push(id);persist();render();toast('Lesson added to your learning record')}});$('#goal-form')?.addEventListener('submit',event=>{event.preventDefault();const form=new FormData(event.target);if(addWeeklyGoal(String(form.get('category')),String(form.get('goal')))){render();toast('Weekly goal added')}});document.querySelectorAll('[data-quick-concern]').forEach(button=>button.onclick=()=>{data.concern=button.dataset.quickConcern;data.started=true;offset=0;persist();navigate('options')});document.querySelectorAll('[data-goal-suggestion]').forEach(button=>button.onclick=()=>{if(addWeeklyGoal(button.dataset.goalSuggestion,button.dataset.goalText)){render();toast('Weekly goal added')}});document.querySelectorAll('[data-goal-toggle]').forEach(input=>input.onchange=()=>{const goal=data.weeklyGoals.items.find(item=>item.id===input.dataset.goalToggle);if(goal){goal.done=input.checked;persist();render()}});document.querySelectorAll('[data-goal-remove]').forEach(button=>button.onclick=()=>{data.weeklyGoals.items=data.weeklyGoals.items.filter(goal=>goal.id!==button.dataset.goalRemove);persist();render()});$('#explore')?.addEventListener('click',()=>{data.started=true;data.concern='My child asks for videos after school. What else could we try?';persist();navigate('today')});$('#family-form')?.addEventListener('submit',e=>{e.preventDefault();familyDraft=collectFamily(new FormData(e.target));const errors=familyErrors(familyDraft);if(errors.length){$('#family-errors').innerHTML=errors.map(e=>'<p>'+esc(e)+'</p>').join('');$('#family-errors').focus();return}data.family=structuredClone(familyDraft);if(!data.family.children.some(c=>c.id===data.family.activeChildId))data.family.activeChildId=data.family.children[0].id;data.started=true;persist();navigate('today');toast('Family unit saved')});
$('#add-child')?.addEventListener('click',()=>{familyDraft=collectFamily(new FormData($('#family-form')));const c=newChild();familyDraft.children.push(c);render();document.querySelector('[name="name-'+c.id+'"]').focus()});
document.querySelectorAll('[data-remove-child]').forEach(b=>b.onclick=()=>{familyDraft=collectFamily(new FormData($('#family-form')));familyDraft.children=familyDraft.children.filter(c=>c.id!==b.dataset.removeChild);render();$('#add-child').focus()});
document.querySelectorAll('[name^="goals-"]').forEach(input=>input.addEventListener('change',()=>{const id=input.name.slice(6);const checked=Array.from(document.querySelectorAll('[name="goals-'+id+'"]:checked')).some(x=>x.value==='Something else');const field=$('#other-field-'+id);field.hidden=!checked;field.querySelector('input').required=checked}));
$('#active-child')?.addEventListener('change',e=>{data.family.activeChildId=e.target.value;persist();toast('Options will use this child’s topics')});
$('#ask-form')?.addEventListener('submit',e=>{e.preventDefault();data.concern=$('#concern').value.trim()||'My child asks for videos after school. What else could we try?';data.started=true;offset=0;persist();navigate('options')});$('.example')?.addEventListener('click',()=>{$('#concern').value='Bedtime is always a struggle';$('#concern').focus()});document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{if($('#concern'))data.concern=$('#concern').value;let vals=b.dataset.group.split('|');data.filters=data.filters.filter(v=>!vals.includes(v));data.filters.push(b.dataset.filter);persist();render()});$('#more')?.addEventListener('click',()=>{offset=(offset+2)%ideas.length;render()});$('#try')?.addEventListener('click',()=>{feedbackChoice='';navigate('feedback')});document.querySelectorAll('[data-feedback]').forEach(b=>b.onclick=()=>{feedbackChoice=b.dataset.feedback;document.querySelectorAll('[data-feedback]').forEach(x=>{x.classList.toggle('selected',x.dataset.feedback===feedbackChoice);x.setAttribute('aria-pressed',x.dataset.feedback===feedbackChoice)})});$('#save-feedback')?.addEventListener('click',()=>{if(!feedbackChoice){toast('Choose Helped, Partly, or Didn’t fit first.');return}let id=(selected||ideas[0]).id;data.feedback.push({id,result:feedbackChoice,note:$('#feedback-note').value,date:new Date().toISOString()});if(feedbackChoice==='Helped'&&!data.saved.includes(id))data.saved.push(id);persist();tab='history';navigate('toolkit');toast('Reflection saved')});document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});$('#toolkit-search')?.addEventListener('input',e=>{query=e.target.value;$('#toolkit-list').innerHTML=toolkitList();bindList()});$('#resource-search')?.addEventListener('input',e=>{query=e.target.value;$('#resource-list').innerHTML=resourceList()});document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{resourceCategory=b.dataset.category;document.querySelectorAll('[data-category]').forEach(x=>x.classList.toggle('selected',x===b));$('#resource-list').innerHTML=resourceList()});$('#reset')?.addEventListener('click',()=>{if(confirm('Reset family details, saved ideas, and feedback in this browser?')){data=structuredClone(initial);persist();familyDraft=structuredClone(data.family);navigate('family');toast('Demo reset')}})}
function bindCareLibrary(){
 if(page!=='care')return;
 document.querySelectorAll('[data-care-library-tab]').forEach(button=>button.addEventListener('click',()=>{tab=button.dataset.careLibraryTab;query='';render()}));
 $('#care-library-search')?.addEventListener('input',event=>{query=event.target.value;if(tab==='resources')$('#care-library-resources').innerHTML=resourceList();else{$('#care-library-list').innerHTML=toolkitList();bindCareLibraryList()}});
}
function bindCareLibraryList(){
 document.querySelectorAll('#care-library-list [data-idea]').forEach(button=>button.onclick=()=>selectIdea(button.dataset.idea,'care'));
 document.querySelectorAll('#care-library-list [data-save]').forEach(button=>button.onclick=()=>saveIdea(button.dataset.save));
}
function bindCare(){
 if(page!=='care')return;
 $('#care-child')?.addEventListener('change',event=>{data.family.activeChildId=event.target.value;persist();editingCareBlockId=null;render()});
 $('#caregiver-add-form')?.addEventListener('submit',event=>{
  event.preventDefault();const form=new FormData(event.currentTarget),name=String(form.get('name')||'').trim(),permissions=form.getAll('permissions').map(String),childIds=form.getAll('children').map(String);
  if(!name){toast('Add a caregiver name for this local demo.');return}
  if(!permissions.length||!childIds.length){toast('Choose at least one child and one information permission.');return}
  data.care.caregivers.push({id:'caregiver-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),name,permissions,toolkitPermissionConfigured:true,childIds});persist();render();toast('Caregiver added to this browser’s demo only; no invitation was sent.')
 });
 $('#save-care-permissions')?.addEventListener('click',()=>{
  data.care.caregivers.forEach(person=>{person.permissions=Array.from(document.querySelectorAll(`[name="permission-${CSS.escape(person.id)}"]:checked`),input=>input.value);person.toolkitPermissionConfigured=true;person.childIds=Array.from(document.querySelectorAll(`[name="child-${CSS.escape(person.id)}"]:checked`),input=>input.value)});persist();render();toast('Demo permissions saved in this browser; nothing was shared.')
 });
 $('#care-block-form')?.addEventListener('submit',event=>{
  event.preventDefault();const form=new FormData(event.currentTarget),id=editingCareBlockId,existing=data.care.blocks.find(block=>block.id===id),block={id:id||'care-block-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),childId:activeChild().id,date:localDateKey(),time:String(form.get('time')||''),title:String(form.get('title')||'').trim(),details:String(form.get('details')||'').trim(),caregiverId:String(form.get('caregiver')||''),createdAt:existing?.createdAt||new Date().toISOString()};
  if(!block.title||!block.time){toast('Add a care task and time before saving.');return}
  if(existing)Object.assign(existing,block);else data.care.blocks.push(block);editingCareBlockId=null;persist();render();toast(existing?'Care block updated in this browser’s demo.':'Care block added to today’s local demo plan.')
 });
 $('#cancel-care-edit')?.addEventListener('click',()=>{editingCareBlockId=null;render()});
 $('#care-update-form')?.addEventListener('submit',event=>{
  event.preventDefault();const form=new FormData(event.currentTarget),text=String(form.get('text')||'').trim();if(!text){toast('Write a short update before posting.');return}
  data.care.updates.push({id:'care-update-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),childId:activeChild().id,kind:String(form.get('kind')||'Handoff note'),text,createdAt:new Date().toISOString()});persist();render();toast('Update saved in this browser; no caregiver was notified.')
 });
 $('#care-request-form')?.addEventListener('submit',event=>{
  event.preventDefault();const form=new FormData(event.currentTarget),text=String(form.get('text')||'').trim();if(!text){toast('Describe what help would be useful.');return}
  data.care.requests.push({id:'care-request-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),childId:activeChild().id,text,time:String(form.get('time')||''),caregiverId:String(form.get('caregiver')||''),status:'open',createdAt:new Date().toISOString()});persist();render();toast('Request saved in this browser; no caregiver was notified.')
 });
 document.querySelectorAll('[data-care-edit]').forEach(button=>button.addEventListener('click',()=>{editingCareBlockId=button.dataset.careEdit;const block=data.care.blocks.find(item=>item.id===editingCareBlockId);if(block)data.family.activeChildId=block.childId;render();$('#care-block-form')?.scrollIntoView({behavior:'smooth',block:'center'})}));
 document.querySelectorAll('[data-care-delete]').forEach(button=>button.addEventListener('click',()=>{data.care.blocks=data.care.blocks.filter(block=>block.id!==button.dataset.careDelete);if(editingCareBlockId===button.dataset.careDelete)editingCareBlockId=null;persist();render();toast('Care block removed from this browser’s demo.')}));
 document.querySelectorAll('[data-care-accept]').forEach(button=>button.addEventListener('click',()=>{const request=data.care.requests.find(item=>item.id===button.dataset.careAccept);if(request?.status==='open'){request.status='accepted';request.acceptedAt=new Date().toISOString();persist();render();toast('Marked accepted in this demo; no caregiver was notified.')}}));
 document.querySelectorAll('[data-caregiver-remove]').forEach(button=>button.addEventListener('click',()=>{data.care.caregivers=data.care.caregivers.filter(person=>person.id!==button.dataset.caregiverRemove);persist();render();toast('Caregiver removed from this browser’s demo access list.')}));
}
function bindList(){document.querySelectorAll('#toolkit-list [data-idea]').forEach(b=>b.onclick=()=>selectIdea(b.dataset.idea,'toolkit'));document.querySelectorAll('#toolkit-list [data-save]').forEach(b=>b.onclick=()=>saveIdea(b.dataset.save))}
document.addEventListener('click',event=>{const readButton=event.target.closest('[data-read-resource]');if(readButton&&!readButton.disabled){const id=Number(readButton.dataset.readResource);if(resources[id]&&!data.readResources.includes(id)){data.readResources.push(id);persist();render();toast('Reading marked for this browser')}}});
document.addEventListener('click',event=>{const button=event.target.closest('#voice-input');if(!button)return;const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition,status=$('#voice-status'),textarea=$('#concern');if(!Recognition){status.textContent='Voice input is not supported in this browser. You can type instead.';return}if(activeRecognition){activeRecognition.stop();return}const recognition=new Recognition();activeRecognition=recognition;recognition.lang=navigator.language||'en-US';recognition.interimResults=true;recognition.maxAlternatives=1;let startingText='';recognition.onstart=()=>{startingText=textarea.value.trim();button.textContent='Stop listening';button.setAttribute('aria-pressed','true');status.textContent='Listening. Your words will appear here.'};recognition.onresult=event=>{const transcript=Array.from(event.results).map(item=>item[0].transcript).join(' ').trim();if(transcript){textarea.value=[startingText,transcript].filter(Boolean).join(' ');status.textContent='Listening. You can edit your words as you go.'}};recognition.onerror=error=>{status.textContent=error.error==='not-allowed'?'Microphone access was blocked. Check your browser permissions.':error.error==='no-speech'?'No speech was detected. Try again or type instead.':'Voice input could not start. You can type instead.'};recognition.onend=()=>{if(activeRecognition===recognition)activeRecognition=null;if(button.isConnected){button.textContent='Speak instead';button.setAttribute('aria-pressed','false')}if(status.textContent.startsWith('Listening.'))status.textContent=textarea.value.trim()!==startingText?'Voice input added. Edit or continue when you’re ready.':'No speech detected. You can try again or type instead.'};try{recognition.start()}catch{activeRecognition=null;status.textContent='Voice input could not start. You can type instead.'}});
document.addEventListener('click',event=>{const childTab=event.target.closest('[data-family-child]');if(childTab){data.family.activeChildId=childTab.dataset.familyChild;persist();render();return}if(event.target.closest('[data-add-family-child]')){familyDraft=structuredClone(data.family);const child=newChild();familyDraft.children.push(child);familyDraft.activeChildId=child.id;page='family-edit';render();document.querySelector(`[name="name-${child.id}"]`)?.focus();return}if(event.target.closest('[data-edit-family]')){navigate('family-edit');return}const ideaButton=event.target.closest('[data-family-idea]');if(ideaButton)selectIdea(ideaButton.dataset.familyIdea,'family')});
document.addEventListener('click',event=>{if(event.target.closest('[data-share-guide]'))shareCaregiverGuide();if(event.target.closest('[data-copy-guide]'))copyCaregiverGuide()});
function renderAuth(){
 const recovery=authMode==='recovery',signup=authMode==='signup';
 const title=authUnavailable?'Account service unavailable':recovery?'Choose a new password':signup?'Create your account':'Welcome back';
 const message=authNotice?`<p class="auth-message ${authNoticeType==='success'?'success':''}" role="status">${esc(authNotice)}</p>`:'';
 $('#app').innerHTML=`<main class="auth-page"><a class="logo auth-logo" href="./" aria-label="Paal home">paal</a><section class="auth-card"><div class="eyebrow">Your family. Your way.</div><h1>${title}</h1><p class="muted">${authUnavailable?'Try again once your connection is restored.':recovery?'Use at least 8 characters for your new password.':signup?'Create an account to access your family space.':'Sign in to continue to your family space.'}</p>${message}${authUnavailable?'<button class="secondary" id="auth-retry" type="button">Reload</button>':`<form id="auth-form">${signup?'<label class="field"><span>Your name</span><input name="name" autocomplete="name" maxlength="80" required></label>':''}<label class="field"><span>Email</span><input id="auth-email" name="email" type="email" autocomplete="email" required></label><label class="field"><span>${recovery?'New password':'Password'}</span><input name="password" type="password" autocomplete="${recovery?'new-password':signup?'new-password':'current-password'}" minlength="8" required></label><button class="primary auth-submit" type="submit">${recovery?'Update password':signup?'Create account':'Sign in'} <span aria-hidden="true">→</span></button></form>${!recovery?`<div class="auth-links">${signup?'Already have an account?':'New to paal?'} <button class="link" id="auth-toggle">${signup?'Sign in':'Create account'}</button></div>`:`<div class="auth-links"><button class="link" id="auth-toggle">Back to sign in</button></div>`}${!signup&&!recovery?'<button class="link auth-forgot" id="auth-forgot">Forgot password?</button>':''}`}<p class="notice auth-privacy">Your account signs you in, but family details are still saved only in this browser. Cloud data sync and caregiver invitations are not connected yet.</p></section></main>`;
 $('#auth-form')?.addEventListener('submit',async event=>{
  event.preventDefault();const form=new FormData(event.currentTarget),email=String(form.get('email')||'').trim(),password=String(form.get('password')||'');
  authNotice='';authNoticeType='error';
  try{
   if(recovery){const {error}=await supabaseClient.auth.updateUser({password});if(error)throw error;sessionStorage.removeItem('paal-password-recovery');authNotice='Your password has been updated. You can continue using this page.';authNoticeType='success';authMode='signin'}
   else if(signup){const name=String(form.get('name')||'').trim();const {data:result,error}=await supabaseClient.auth.signUp({email,password,options:{data:{name},emailRedirectTo:window.location.origin}});if(error)throw error;if(!result.session){authNotice='Check your email for a confirmation link, then return here to sign in.';authNoticeType='success';authMode='signin'}}
   else{const {error}=await supabaseClient.auth.signInWithPassword({email,password});if(error)throw error}
  }catch(error){authNotice=error.message||'Authentication failed. Please try again.'}
  render();
 });
 $('#auth-retry')?.addEventListener('click',()=>window.location.reload());
 $('#auth-toggle')?.addEventListener('click',()=>{authMode=signup||recovery?'signin':'signup';authNotice='';renderAuth()});
 $('#auth-forgot')?.addEventListener('click',async()=>{
  const email=$('#auth-email').value.trim();if(!email){authNotice='Enter your email address first.';renderAuth();$('#auth-email')?.focus();return}
  try{const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});if(error)throw error;authNotice='If an account exists for that email, a password reset link is on its way.';authNoticeType='success'}catch(error){authNotice=error.message||'Could not send the reset link.';authNoticeType='error'}renderAuth()
 });
}
function applyAuthSession(session,eventName=''){
 if(eventName==='PASSWORD_RECOVERY'){sessionStorage.setItem('paal-password-recovery','true');authMode='recovery';authNotice='';}
 const user=session?.user||null,cached=sessionStorage.getItem('paal-auth-user-id');
 if(user&&cached!==user.id){sessionStorage.setItem('paal-auth-user-id',user.id);window.location.reload();return}
 if(!user&&cached){sessionStorage.removeItem('paal-auth-user-id');window.location.reload();return}
 authUser=user;page=user?(localStorage.getItem(dataStorageKey)?'family':'family-edit'):'auth';render();
}
async function initializeAuth(){
 if(!backendConfigured){render();return}
 $('#app').innerHTML='<main class="auth-page"><p class="muted">Connecting to account service…</p></main>';
 if(!window.supabase?.createClient){authUnavailable=true;authNotice='Supabase could not load. Check your internet connection and reload.';renderAuth();return}
 try{
  supabaseClient=window.supabase.createClient(backendConfig.url,backendConfig.anonKey);
  supabaseClient.auth.onAuthStateChange((event,session)=>applyAuthSession(session,event));
  const {data:sessionData,error}=await supabaseClient.auth.getSession();if(error)throw error;
  applyAuthSession(sessionData.session);
 }catch(error){authNotice=error.message||'Could not connect to the account service.';renderAuth()}
}
initializeAuth();
