'use strict';

/* ==========================================================
   PAAL – a parenting companion prototype
   ----------------------------------------------------------
   Plain HTML/CSS/JS. No build step, no backend.

     1. CONTENT  – struggles, tips and lessons (edit the text here)
     2. STATE    – what the parent entered, saved in this browser
     3. HELPERS  – small utilities and the PAAL mascot
     4. SCREENS  – one function per page; each returns HTML
     5. CHAT     – PAAL's scripted, keyword-based answers
     6. ROUTER   – reads the #hash in the URL and draws the page
   ========================================================== */


/* ---------- 1. CONTENT ---------- */

const SOURCES = {
  bedtimeRoutine: {
    title: 'A nightly bedtime routine: impact on sleep in young children (Mindell et al., 2009)',
    publisher: 'SLEEP journal, via PubMed',
    url: 'https://pubmed.ncbi.nlm.nih.gov/?term=Mindell+nightly+bedtime+routine+impact+on+sleep'
  },
  mediaPlan: {
    title: 'Family Media Plan',
    publisher: 'American Academy of Pediatrics',
    url: 'https://www.healthychildren.org/English/fmp/Pages/MediaPlan.aspx'
  },
  pcit: {
    title: 'Parent-Child Interaction Therapy (PCIT)',
    publisher: 'PCIT International',
    url: 'https://www.pcit.org/'
  },
  harvardServe: {
    title: 'Serve and Return',
    publisher: 'Harvard University Center on the Developing Child',
    url: 'https://developingchild.harvard.edu/science/key-concepts/serve-and-return/'
  },
  cdcCommunication: {
    title: 'Tips for Connecting and Communicating',
    publisher: 'Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov/parenting-toddlers/communication/index.html'
  },
  cdcPlay: {
    title: 'Child-led Play',
    publisher: 'Centers for Disease Control and Prevention',
    url: 'https://www.cdc.gov/parenting-toddlers/communication/child-led-play.html'
  }
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


/* ---------- 2. STATE ---------- */

// A different key from Lili's version ('paal-prototype'), so the two never clash.
const STORAGE_KEY = 'paal-andres';

// profile: { parentName, children: [{ id, name, age }], struggles: ['sleep', ...] }
// completed: lesson ids · chat: [{ from: 'me', text } | { from: 'paal', html }]
function emptyState() {
  return { profile: null, completed: [], chat: [] };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' ? { ...emptyState(), ...saved } : emptyState();
  } catch {
    return emptyState();
  }
}

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* private mode: keep working in memory */ }
}

let state = loadState();


/* ---------- 3. HELPERS ---------- */

const $ = selector => document.querySelector(selector);

const esc = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CHILD_TONES = ['peach', 'lav', 'mint', 'sky', 'gold', 'pink'];
const TONE_COLORS = { lav: '#b892ea', peach: '#f4a37f', mint: '#7cc59a', sky: '#7fb0dc', gold: '#e6c25a', pink: '#e994b8' };

// ['Mia', 'Leo', 'Sam'] -> 'Mia, Leo and Sam'
function listNames(names) {
  return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names.at(-1);
}

function childNames() {
  return listNames(state.profile.children.map(c => c.name));
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

// Lili's lavender mascot, built from spans so it can be any size.
// Extra classes: mascot-sm / mascot-lg / mascot-xl, mascot-wave, mascot-bob
function mascot(classes = '') {
  return `<div class="mascot ${classes}" aria-hidden="true">
    <span class="mascot-eye left"></span><span class="mascot-eye right"></span>
    <span class="mascot-cheek left"></span><span class="mascot-cheek right"></span>
    <span class="mascot-mouth"></span>
  </div>`;
}

const ICONS = {
  family: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 3.5 4.8"/></svg>',
  learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14M12 7C9 4.5 5.5 4 3 5v14c3-1 6.5-.5 9 2m0-14c3-2.5 6.5-3 9-2v14c-3-1-6.5-.5-9 2"/></svg>',
  paal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9 11h.01M15 11h.01"/></svg>'
};


/* ---------- 4. SCREENS ---------- */

// Page frame: sidebar on desktop, bottom tabs on phones.
// Order requested: Family (left) · Learn · PAAL (right).
function shell(active, content) {
  const nav = mobile => `<nav class="${mobile ? 'mobile-nav' : 'side-nav'}" aria-label="Main navigation">
    ${[['family', 'Family'], ['learn', 'Learn'], ['paal', 'PAAL']].map(([page, label]) =>
      `<a class="nav-item" href="#${page}" ${page === active ? 'aria-current="page"' : ''}>${ICONS[page]}<span>${label}</span></a>`
    ).join('')}
  </nav>`;

  return `<div class="layout">
    <aside class="sidebar">
      <a class="logo" href="#family">paal</a>
      ${nav(false)}
      <div class="side-foot">
        <p>A few more possibilities.<br>A little more confidence.</p>
        <button class="reset" id="reset">Reset demo</button>
      </div>
    </aside>
    <header class="topbar"><a class="logo" href="#family">paal</a><span class="tagline">Your family. Your way.</span></header>
    <main class="main">${content}</main>
    ${nav(true)}
  </div>`;
}


/* Sign-up (first visit) and Edit family use the same form. */

let draft = null; // the form while it's being filled in

function newChild() {
  return { id: 'c' + Math.random().toString(36).slice(2, 9), name: '', age: '' };
}

function startDraft() {
  draft = state.profile
    ? structuredClone(state.profile)
    : { parentName: '', children: [newChild()], struggles: [] };
}

function signupScreen() {
  const editing = Boolean(state.profile);

  const ageOptions = selected => ['<option value="">Age</option>',
    ...Array.from({ length: 18 }, (_, n) =>
      `<option value="${n}" ${String(n) === String(selected) ? 'selected' : ''}>${n === 0 ? 'Under 1' : n}</option>`)
  ].join('');

  const childRow = (child, i) => `<div class="child-row">
    <label class="field"><span>Child ${i + 1} name</span>
      <input id="name-${child.id}" value="${esc(child.name)}" placeholder="e.g. Mia" autocomplete="off"></label>
    <label class="field"><span>Age</span><select id="age-${child.id}">${ageOptions(child.age)}</select></label>
    ${draft.children.length > 1 ? `<button type="button" class="remove-child" data-remove="${child.id}" aria-label="Remove child ${i + 1}">×</button>` : ''}
  </div>`;

  const struggleOption = s => `<label class="struggle-option tone-${s.tone}">
    <input type="checkbox" name="struggle" value="${s.id}" ${draft.struggles.includes(s.id) ? 'checked' : ''}>
    <span><strong>${s.label}</strong><small>Based on: ${s.method}</small></span>
  </label>`;

  return `<div class="signup">
    <div class="signup-intro">
      ${mascot('mascot-xl mascot-wave')}
      <p class="eyebrow">${editing ? 'Your family' : 'Welcome to paal'}</p>
      <h1>${editing ? 'Edit your family.' : 'Let’s get to know your family.'}</h1>
      <p class="muted">A few quick questions so PAAL can suggest ideas that fit you. Everything stays on this device.</p>
    </div>

    <form id="signup-form" class="card signup-form" novalidate>
      <div id="form-errors" class="form-errors" tabindex="-1" hidden></div>

      <label class="field"><span>Your name</span>
        <input id="parent-name" value="${esc(draft.parentName)}" placeholder="e.g. Andres" autocomplete="given-name"></label>

      <fieldset>
        <legend>Your children</legend>
        ${draft.children.map(childRow).join('')}
        <button type="button" id="add-child" class="link-btn">+ Add another child</button>
      </fieldset>

      <fieldset>
        <legend>Where do you struggle most?</legend>
        <p class="hint">Choose as many as you like.</p>
        <div class="struggle-grid">${STRUGGLES.map(struggleOption).join('')}</div>
      </fieldset>

      <div class="form-actions">
        ${editing ? '<button type="button" id="cancel-edit" class="btn ghost">Cancel</button>' : ''}
        <button type="submit" class="btn primary">${editing ? 'Save changes' : 'Start with PAAL'}</button>
      </div>
    </form>
  </div>`;
}

function readDraft() {
  draft.parentName = $('#parent-name').value.trim();
  draft.children = draft.children.map(c => ({
    ...c,
    name: $(`#name-${c.id}`).value.trim(),
    age: $(`#age-${c.id}`).value
  }));
  draft.struggles = [...document.querySelectorAll('input[name=struggle]:checked')].map(input => input.value);
}

function signupErrors(form) {
  const errors = [];
  if (!form.parentName) errors.push('Add your name.');
  form.children.forEach((c, i) => {
    if (!c.name) errors.push(`Add a name for child ${i + 1}.`);
    if (c.age === '') errors.push(`Choose an age for ${c.name || 'child ' + (i + 1)}.`);
  });
  if (!form.struggles.length) errors.push('Choose at least one thing PAAL can help with.');
  return errors;
}

function bindSignup() {
  $('#add-child').onclick = () => {
    readDraft();
    draft.children.push(newChild());
    render();
    $(`#name-${draft.children.at(-1).id}`).focus();
  };

  document.querySelectorAll('[data-remove]').forEach(button => {
    button.onclick = () => {
      readDraft();
      draft.children = draft.children.filter(c => c.id !== button.dataset.remove);
      render();
    };
  });

  const cancel = $('#cancel-edit');
  if (cancel) cancel.onclick = () => { location.hash = '#family'; };

  $('#signup-form').onsubmit = event => {
    event.preventDefault();
    readDraft();
    const errors = signupErrors(draft);
    const box = $('#form-errors');
    if (errors.length) {
      box.innerHTML = `<p>Almost there! Please check:</p><ul>${errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul>`;
      box.hidden = false;
      box.focus();
      return;
    }
    const isNew = !state.profile;
    state.profile = draft;
    save();
    location.hash = '#family';
    toast(isNew ? `Welcome to PAAL, ${state.profile.parentName}!` : 'Family details saved');
  };
}


/* Family (home page) */

// A ring split into one colored slice per lesson; slices fill in as lessons are completed.
function progressRing() {
  const slice = 360 / LESSONS.length;
  const gap = 3;
  const stops = LESSONS.map((lesson, i) => {
    const start = i * slice, end = start + slice - gap;
    const color = isDone(lesson.id) ? TONE_COLORS[lesson.tone] : '#efe9e2';
    return `${color} ${start}deg ${end}deg, transparent ${end}deg ${start + slice}deg`;
  });
  return `<div class="ring" style="background: conic-gradient(${stops.join(', ')})">
    <div class="ring-center"><strong>${doneCount()}</strong><span>of ${LESSONS.length}</span></div>
  </div>`;
}

function progressMessage(done, total) {
  if (done === 0) return 'You haven’t started any lessons yet. The first one takes about 4 minutes.';
  if (done === total) return 'You completed every lesson. Amazing work!';
  if (done / total >= 0.5) return 'More than halfway there. Keep going!';
  return 'Great start! Every lesson adds a new idea to your toolbox.';
}

function familyScreen() {
  const p = state.profile;
  const next = LESSONS.find(l => !isDone(l.id));
  const tips = STRUGGLES.filter(s => p.struggles.includes(s.id));

  return `
    <header class="page-head">
      <div><p class="eyebrow">Your family</p><h1>Hi, ${esc(p.parentName)}.</h1></div>
      <a class="btn ghost" href="#edit">Edit family</a>
    </header>

    <section class="children-grid" aria-label="Your children">
      ${p.children.map((c, i) => `<article class="child-card tone-${CHILD_TONES[i % CHILD_TONES.length]}">
        <span class="avatar">${esc(c.name.charAt(0).toUpperCase())}</span>
        <div><h2>${esc(c.name)}</h2><p>${ageLabel(c.age)}</p></div>
      </article>`).join('')}
      <a class="child-card add-child" href="#edit">+ Add a child</a>
    </section>

    <div class="home-grid">
      <section class="card progress-card">
        ${progressRing()}
        <div class="progress-copy">
          <h2>Your learning</h2>
          <p class="muted">${progressMessage(doneCount(), LESSONS.length)}</p>
          <ul class="lesson-dots">
            ${LESSONS.map(l => `<li><a class="dot tone-${l.tone} ${isDone(l.id) ? 'done' : ''}" href="#learn/${l.id}"
              title="${esc(l.title)}${isDone(l.id) ? ' (completed)' : ''}"><span class="sr-only">${esc(l.title)}</span></a></li>`).join('')}
          </ul>
          <a class="btn primary" href="#learn${next ? '/' + next.id : ''}">${next ? 'Next lesson' : 'Review lessons'}</a>
        </div>
      </section>

      <a class="card talk-card" href="#paal">
        ${mascot('mascot-lg mascot-wave')}
        <div>
          <h2>Talk to PAAL</h2>
          <p>Describe what’s going on with ${esc(childNames())} and get ideas grounded in research.</p>
          <span class="btn primary">Start a chat</span>
        </div>
      </a>
    </div>

    <section>
      <h2 class="section-title">PAAL’s tips for you</h2>
      <div class="tips-grid">
        ${tips.map(s => `<article class="card tip-card tone-${s.tone}">
          <span class="tag">${s.label}</span>
          <h3>${s.title}</h3>
          <p class="method">${s.method}</p>
          <p>${s.summary}</p>
          <a href="#learn/${s.lessonId}">Read the lesson →</a>
        </article>`).join('')}
      </div>
    </section>`;
}


/* Learn */

function learnScreen() {
  const done = doneCount(), total = LESSONS.length, pct = Math.round(done / total * 100);
  return `
    <header class="page-head"><div><p class="eyebrow">Learn</p><h1>Lessons</h1></div></header>

    <section class="card progress">
      <div class="progress-label"><span>${done} of ${total} lessons completed</span><span>${pct}%</span></div>
      <div class="progress-track" role="progressbar" aria-label="Lessons completed"
        aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}">
        <div class="progress-fill" style="width: ${pct}%"></div>
      </div>
    </section>

    <div class="lesson-grid">
      ${LESSONS.map(l => `<a class="card lesson-card tone-${l.tone}" href="#learn/${l.id}">
        <span class="lesson-band"></span>
        <h2>${l.title}</h2>
        <p class="muted">${l.teaser}</p>
        <div class="lesson-foot">
          <span>${l.time}</span>
          <span class="status ${isDone(l.id) ? 'done' : ''}">${isDone(l.id) ? '✓ Completed' : 'Start →'}</span>
        </div>
      </a>`).join('')}
    </div>`;
}

function lessonScreen(lesson) {
  const done = isDone(lesson.id);
  const body = content => Array.isArray(content)
    ? `<ol>${content.map(step => `<li>${step}</li>`).join('')}</ol>`
    : `<p>${content}</p>`;

  return `<article class="lesson tone-${lesson.tone}">
    <a class="back" href="#learn">← All lessons</a>
    <p class="eyebrow">${lesson.time} read</p>
    <h1>${lesson.title}</h1>
    ${lesson.sections.map(([heading, content]) => `<section><h2>${heading}</h2>${body(content)}</section>`).join('')}
    <section class="sources">
      <h2>Sources</h2>
      <ul>${lesson.sources.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a> · ${s.publisher}</li>`).join('')}</ul>
    </section>
    <button id="toggle-complete" class="btn ${done ? 'ghost' : 'primary'}">${done ? '✓ Completed · mark as not done' : 'Mark as complete'}</button>
  </article>`;
}

function bindLesson(lesson) {
  $('#toggle-complete').onclick = () => {
    state.completed = isDone(lesson.id)
      ? state.completed.filter(id => id !== lesson.id)
      : [...state.completed, lesson.id];
    save();
    render();
    if (isDone(lesson.id)) toast(`Lesson complete! ${doneCount()} of ${LESSONS.length} done.`);
  };
}


/* PAAL (chat) */

function paalScreen() {
  const kids = state.profile.children;
  const firstName = kids[0]?.name || 'my child';
  const prompts = STRUGGLES
    .filter(s => state.profile.struggles.includes(s.id))
    .map(s => capitalize(s.example.replace('{child}', firstName)));

  return `<div class="paal-page">
    <p class="kids-line">Here for
      ${kids.map((c, i) => `<span class="kid-chip tone-${CHILD_TONES[i % CHILD_TONES.length]}">${esc(c.name)}</span>`).join('')}
    </p>

    <div class="speech">Hi, I’m PAAL! I can help you with anything you need.</div>

    <div class="chat-wrap">
      <div class="peeker">${mascot('mascot-xl mascot-bob')}</div>
      <span class="hand left" aria-hidden="true"></span><span class="hand right" aria-hidden="true"></span>

      <section class="card chat-card" aria-label="Chat with PAAL">
        <div id="chat-log" class="chat-log" aria-live="polite">${state.chat.map(messageMarkup).join('')}</div>
        ${state.chat.length ? '' : `<div class="chips"><span class="chips-label">Try:</span>
          ${prompts.map(text => `<button type="button" class="chip" data-prompt="${esc(text)}">${esc(text)}</button>`).join('')}</div>`}
        <form id="chat-form" class="chat-form">
          <label for="chat-input" class="sr-only">Describe what’s going on</label>
          <textarea id="chat-input" rows="2" placeholder="Describe what’s going on…"></textarea>
          <button class="btn primary" type="submit">Send</button>
        </form>
      </section>
    </div>

    <p class="fine-print">PAAL shares general, research-based ideas, not medical advice.
      ${state.chat.length ? '<button id="clear-chat" class="link-btn">Clear chat</button>' : ''}</p>
  </div>`;
}


/* ---------- 5. CHAT ---------- */

function paalBubble(html) {
  return `<div class="msg-row">${mascot('mascot-sm')}<div class="msg paal">${html}</div></div>`;
}

function messageMarkup(message) {
  return message.from === 'me' ? `<div class="msg me">${esc(message.text)}</div>` : paalBubble(message.html);
}

const SAFETY = /\b(emergency|danger|abus\w*|suicid\w*|not breathing|unconscious|poison\w*|hurt (him|her|them)sel\w*)\b/;

// Scripted answers: find the topic whose keywords appear most in the message.
function paalReply(text) {
  const t = text.toLowerCase();
  const kids = state.profile.children;
  const kid = kids.find(c => c.name && t.includes(c.name.toLowerCase())) || (kids.length === 1 ? kids[0] : null);
  const who = kid ? esc(kid.name) : 'your child';

  if (SAFETY.test(t)) {
    return `<p>If anyone might be in danger right now, please call <strong>911</strong> (or your local emergency number) right away.</p>
      <p>For anything urgent about your child’s health, contact your pediatrician. I’m a prototype and can only share general ideas.</p>`;
  }
  if (/^(hi|hello|hey|hola)\b/.test(t) && t.length < 25) {
    return `<p>Hi ${esc(state.profile.parentName)}! Tell me what’s going on with ${esc(childNames())}: bedtime, screens, big feelings, or anything else, and I’ll share ideas that research says can help.</p>`;
  }
  if (/\bthank/.test(t)) {
    return `<p>You’re welcome! You’re doing a great job by looking for ideas. I’m here whenever you need me.</p>`;
  }

  let best = null, bestScore = 0;
  for (const s of STRUGGLES) {
    const score = (t.match(s.pattern) || []).length;
    if (score > bestScore) { best = s; bestScore = score; }
  }

  if (!best) {
    return `<p>I’m not sure I understood that one yet. I’m a prototype, so right now I know most about
      <strong>sleep</strong>, <strong>screens</strong>, <strong>tantrums</strong> and <strong>everyday connection</strong>.
      Could you tell me a bit more?</p>`;
  }

  return `<p>${best.intro.replace('{child}', who)}</p>
    <p><strong>${best.title}</strong><br><small>${best.method}</small></p>
    <ol>${best.steps.map(step => `<li>${step}</li>`).join('')}</ol>
    <p class="chat-links"><a href="#learn/${best.lessonId}">Open the full lesson</a> ·
      <a href="${best.source.url}" target="_blank" rel="noopener">Source</a></p>`;
}

let replying = false;

function sendMessage(text) {
  text = text.trim();
  if (!text || replying) return;
  state.chat.push({ from: 'me', text });
  save();
  render();

  // Show "typing…" for a moment so it feels like a conversation
  replying = true;
  $('#chat-log').insertAdjacentHTML('beforeend', paalBubble('<span class="typing"><span></span><span></span><span></span></span>'));
  scrollChat();

  setTimeout(() => {
    state.chat.push({ from: 'paal', html: paalReply(text) });
    replying = false;
    save();
    if (currentRoute().page === 'paal') {
      render();
      if (!matchMedia('(pointer: coarse)').matches) $('#chat-input').focus(); // don't pop the phone keyboard
    }
  }, 700);
}

function scrollChat() {
  const log = $('#chat-log');
  if (log) log.scrollTop = log.scrollHeight;
}

function bindChat() {
  const input = $('#chat-input');
  scrollChat();
  $('#chat-form').onsubmit = event => { event.preventDefault(); sendMessage(input.value); };
  input.onkeydown = event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(input.value); }
  };
  document.querySelectorAll('[data-prompt]').forEach(chip => { chip.onclick = () => sendMessage(chip.dataset.prompt); });
  const clear = $('#clear-chat');
  if (clear) clear.onclick = () => { state.chat = []; save(); render(); };
}


/* ---------- 6. ROUTER ---------- */

// URLs: #family, #learn, #learn/<lesson-id>, #paal, #edit
// Anyone without a profile sees the sign-up page first.
function currentRoute() {
  const [page = '', id = ''] = location.hash.slice(1).split('/');
  if (!state.profile) return { page: 'signup' };
  if (page === 'learn' && id) return { page: 'lesson', id };
  if (['family', 'learn', 'paal', 'edit'].includes(page)) return { page };
  return { page: 'family' };
}

const TITLES = { signup: 'Welcome', edit: 'Edit family', family: 'Family', learn: 'Learn', lesson: 'Learn', paal: 'Talk to PAAL' };

function render() {
  const route = currentRoute();
  document.title = `paal · ${TITLES[route.page]}`;

  if (route.page === 'signup' || route.page === 'edit') {
    if (!draft) startDraft();
    $('#app').innerHTML = `<div class="signup-page"><span class="logo">paal</span>${signupScreen()}</div>`;
    bindSignup();
    return;
  }

  draft = null;
  const lesson = route.page === 'lesson' ? LESSONS.find(l => l.id === route.id) : null;
  const screens = {
    family: familyScreen,
    learn: learnScreen,
    lesson: () => lesson ? lessonScreen(lesson) : learnScreen(),
    paal: paalScreen
  };
  $('#app').innerHTML = shell(route.page === 'lesson' ? 'learn' : route.page, screens[route.page]());

  $('#reset').onclick = () => {
    if (!confirm('Reset the demo? This clears your family details, lessons and chat on this device.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    state = emptyState();
    location.hash = '';
    render();
  };
  if (lesson) bindLesson(lesson);
  if (route.page === 'paal') bindChat();
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
render();
