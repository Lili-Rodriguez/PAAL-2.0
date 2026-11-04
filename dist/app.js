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
    publisher: 'SLEEP journal',
    url: 'https://doi.org/10.1093/sleep/32.5.599'
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
  },
  cyclicSighing: {
    title: 'Brief structured respiration practices enhance mood and reduce physiological arousal (Balban et al., 2023)',
    publisher: 'Cell Reports Medicine',
    url: 'https://doi.org/10.1016/j.xcrm.2022.100895'
  },
  selfCompassion: {
    title: 'Self-Compassion Break',
    publisher: 'Dr. Kristin Neff',
    url: 'https://self-compassion.org/'
  },
  mindfulParenting: {
    title: 'The effect of mindfulness interventions for parents on parenting stress and youth psychological outcomes: a meta-analysis (Burgdorf, Szabó & Abbott, 2019)',
    publisher: 'Frontiers in Psychology',
    url: 'https://doi.org/10.3389/fpsyg.2019.01336'
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
      { title: 'Arrive', secs: 20, say: 'Hi, I’m PAAL. Let’s take a few minutes, just for you. Sit or stand somewhere comfortable. You don’t need to do this perfectly. Just follow along.' },
      { title: 'Notice', secs: 25, say: 'Feel where your body touches the chair or the floor. Let your shoulders drop a little. Notice your breathing, without trying to change it.' },
      { title: 'Cyclic sighing', breathe: 7, say: 'Now let’s breathe together. Breathe in through your nose, then take one more short sip of air on top. Then let it all out slowly through your mouth. Follow my circle.' },
      { title: 'Soften', secs: 30, say: 'Let your breathing go back to normal. Unclench your jaw. Relax your hands. Notice anything that feels tight, and let it soften just a little.' },
      { title: 'Be kind to yourself', secs: 40, say: 'Put a hand on your chest if you like, and say to yourself: This is a hard moment. Hard moments are part of every parent’s life. May I be kind to myself right now.' },
      { title: 'Choose one thing', secs: 25, say: 'Before you go back, pick one small intention. Maybe: I’ll take one breath before I respond. That’s it. That’s enough.' },
      { title: 'All done', secs: 10, say: 'Well done. You can come back to this anytime, even for one minute. Doing it daily is where the benefits add up.' }
    ]
  },
  {
    id: 'special-time',
    title: 'Special time',
    kind: 'Play together · you and your child',
    minutes: 5,
    tone: 'gold',
    summary: 'Five minutes where your child leads the play and you give them your full, warm attention.',
    basedOn: '“Special time” and the PRIDE skills from Parent-Child Interaction Therapy (PCIT)',
    sources: [SOURCES.pcit, SOURCES.cdcPlay],
    steps: [
      { title: 'Get ready', secs: 20, say: 'Put your phone away and pick a few toys that build or create, like blocks, crayons or play dough. Tell {child}: it’s special time, and you get to choose what we play.' },
      { title: 'Praise', secs: 50, say: 'Praise something specific, like: I love how carefully you’re stacking those! Specific praise tells them exactly what you liked.' },
      { title: 'Reflect', secs: 50, say: 'Repeat or gently build on what they say. If they say “a big tower”, you say: yes, a really big tower!' },
      { title: 'Imitate', secs: 50, say: 'Copy what they’re doing. If they draw a sun, draw a sun too. It shows you’re interested in their game.' },
      { title: 'Describe', secs: 50, say: 'Narrate like a friendly sports announcer: You’re putting the red block on top. Now you’re adding a door.' },
      { title: 'Enjoy', secs: 50, say: 'Show you’re having fun: smile, laugh, use a warm voice. Try to skip questions, instructions and corrections. Just follow their lead.' },
      { title: 'Wrap up', secs: 20, say: 'Let them know special time is ending, and thank them: I loved playing with you. Doing this every day, even for five minutes, makes the biggest difference.' }
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


/* ---------- 2. STATE ---------- */

// A different key from Lili's version ('paal-prototype'), so the two never clash.
const STORAGE_KEY = 'paal-andres';

// profile: { parentName, children: [{ id, name, age, needs?, calm?, game? }], struggles: ['sleep', ...] }
// completed: lesson ids · chat: [{ from: 'me', text } | { from: 'paal', html }]
// care: Lili's Care data – caregivers, care blocks, handoff updates, help requests
// activeChildId: the child picked on the Care page
// activityRuns: { activityId: times finished } · voice: PAAL reads guided activities aloud
function emptyState() {
  return {
    profile: null,
    completed: [],
    chat: [],
    care: { caregivers: [], blocks: [], updates: [], requests: [] },
    activeChildId: null,
    activityRuns: {},
    voice: true
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || typeof saved !== 'object') return emptyState();
    const loaded = { ...emptyState(), ...saved };
    // Older saves (before Care existed) won't have every list
    loaded.care = { ...emptyState().care, ...loaded.care };
    return loaded;
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

// Kids get these colors in order; lavender is last so it doesn't look like PAAL
const CHILD_TONES = ['peach', 'mint', 'sky', 'gold', 'pink', 'lav'];
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

// The kids: round buddies in the same hand-drawn style as PAAL, each in their
// own color, shaped by age. Extras: baby = pacifier and curl, toddler = hair
// tuft, kid = cap, teen = headphones. `index` staggers the bounce.
function kid(tone, age, classes = '', index = 0) {
  const stage = ageStage(age);
  const { w, h, eye: [rx, ry, r] } = STAGES[stage];
  const cx = 305, base = 298;
  const X = dx => (cx + dx * w).toFixed(1);
  const Y = k => (base - k * h).toFixed(1);
  const top = base - 1.04 * h;          // highest point of the head
  const eyeY = top + ry * 2.9;
  const gap = Math.max(w, .8);
  const mouthY = eyeY + ry + 8;
  const armY = base - .38 * h;

  const body = `M${X(-45)} ${base}C${X(-51)} ${Y(.4)} ${X(-43)} ${Y(.84)} ${X(-15)} ${Y(.96)}`
    + `C${X(7)} ${Y(1.04)} ${X(31)} ${Y(.97)} ${X(41)} ${Y(.73)}C${X(51)} ${Y(.48)} ${X(49)} ${Y(.2)} ${X(47)} ${base}Z`;
  const legs = stage === 'baby'
    ? `M${X(-22)} 296L${X(-26)} 304L${X(-36)} 304M${X(24)} 296L${X(30)} 304L${X(40)} 304`
    : `M${X(-23)} 290L${X(-29)} 308L${X(-43)} 308M${X(25)} 290L${X(33)} 308L${X(47)} 308`;
  const lx = cx - 49 * w, rx2 = cx + 49 * w;
  const arms = stage === 'teen'
    ? `M${lx} ${armY}Q${lx - 9} ${armY + 8} ${lx - 8} ${armY + 22}M${rx2} ${armY}Q${rx2 + 9} ${armY + 8} ${rx2 + 8} ${armY + 22}`
    : `M${lx} ${armY}Q${lx - 10} ${armY - 8} ${lx - 13} ${armY - 20}M${rx2} ${armY}Q${rx2 + 10} ${armY - 8} ${rx2 + 13} ${armY - 20}`;
  const mouth = stage === 'baby'
    ? `<ellipse cx="${cx + 4}" cy="${mouthY + 1}" rx="7" ry="4" fill="#9ed9e8" class="char-fill-line"/><circle cx="${cx + 4}" cy="${mouthY + 1}" r="2" fill="#fff"/>`
    : `<path class="char-line" d="M${cx - 3} ${mouthY}Q${cx + 4} ${mouthY + 8} ${cx + 11} ${mouthY}"/>`;

  const extras = {
    baby: `<path class="char-line" d="M${cx - 2} ${top + 1}q-6 -10 2 -12q6 0 3 6"/>`,
    toddler: `<path class="char-line" d="M${cx - 6} ${top + 3}l-3 -8M${cx} ${top + 1}l0 -9M${cx + 6} ${top + 2}l3 -7"/>`,
    kid: `<path class="kid-gear char-fill-line" d="M${cx - 40} ${top + 21}Q${cx - 2} ${top - 34} ${cx + 34} ${top + 20}Q${cx - 3} ${top + 12} ${cx - 40} ${top + 21}Z"/>
      <path class="kid-gear char-fill-line" d="M${cx + 30} ${top + 18}Q${cx + 46} ${top + 13} ${cx + 55} ${top + 22}Q${cx + 42} ${top + 25} ${cx + 30} ${top + 22}Z"/>`,
    teen: `<path class="char-line headphone-band" d="M${cx - 44 * w} ${top + 40}Q${cx - 2} ${top - 70} ${cx + 42 * w} ${top + 40}"/>
      <rect class="kid-gear char-fill-line" x="${cx - 50 * w}" y="${top + 32}" width="11" height="19" rx="5"/>
      <rect class="kid-gear char-fill-line" x="${cx + 37 * w}" y="${top + 32}" width="11" height="19" rx="5"/>`
  };

  return `<svg class="kid kid-${stage} tone-${tone} ${classes}" viewBox="236 146 140 168" aria-hidden="true">
    <path class="char-line" d="${legs}"/>
    <g class="kid-bounce" style="animation-delay: ${-index * 0.7}s">
      <path class="kid-body" d="${body}"/>
      ${eyes([[cx - 10 * gap, eyeY, rx, ry], [cx + 12 * gap, eyeY - 1, rx, ry]], r)}
      <ellipse class="char-cheek" cx="${cx - 20 * w}" cy="${mouthY + 2}" rx="5.5" ry="3.3"/>
      <ellipse class="char-cheek" cx="${cx + 27 * w}" cy="${mouthY + 1}" rx="5.5" ry="3.3"/>
      ${mouth}
      <path class="char-line" d="${arms}"/>
      ${extras[stage]}
    </g>
  </svg>`;
}

// Little illustrations for each lesson, drawn in the lesson's colors.
const star = (x, y, s, delay) => `<path class="art-star art-twinkle" style="animation-delay:${delay}s"
  d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z"/>`;
const heart = (x, y, s, cls = '') => `<path class="${cls}" d="M${x} ${y + 9 * s}C${x - 9 * s} ${y + 3 * s} ${x - 10 * s} ${y - 5 * s} ${x - 4.5 * s} ${y - 6.5 * s}`
  + `C${x - 2 * s} ${y - 7 * s} ${x - .5 * s} ${y - 5.5 * s} ${x} ${y - 4 * s}C${x + .5 * s} ${y - 5.5 * s} ${x + 2 * s} ${y - 7 * s} ${x + 4.5 * s} ${y - 6.5 * s}`
  + `C${x + 10 * s} ${y - 5 * s} ${x + 9 * s} ${y + 3 * s} ${x} ${y + 9 * s}Z"/>`;
const peep = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="4" ry="5" fill="#fff" class="art-plain"/><circle cx="${x + 1}" cy="${y + 1.5}" r="2" fill="#20251f" class="art-plain"/>`;

const LESSON_ART = {
  'bedtime-routine': `
    <path d="M80 20A27 27 0 1 0 106 60A22 22 0 0 1 80 20Z" fill="#f8e7a8"/>
    <path class="art-line" d="M60 44q4 3 8 0M62 56q4 3 8 0"/><circle cx="57" cy="51" r="3" class="art-cheek"/>
    ${star(30, 30, 7, 0)}${star(130, 22, 6, .8)}${star(138, 66, 5, 1.5)}${star(38, 74, 4, 2.1)}
    <path class="art-line art-float" d="M112 42h8l-8 8h8M124 30h6l-6 6h6"/>`,
  'screen-plan': `
    <rect x="30" y="16" width="60" height="70" rx="10" fill="#fff"/>
    <rect x="37" y="24" width="46" height="48" rx="4" fill="var(--kid)"/>
    <path d="M54 39L54 57L69 48Z" fill="#fff"/><circle cx="60" cy="79" r="2" fill="#20251f" class="art-plain"/>
    <rect x="114" y="28" width="10" height="7" rx="2" fill="#fff"/>
    <circle cx="119" cy="57" r="22" fill="#fff"/>
    <path d="M119 37A20 20 0 0 1 137 66L119 57Z" fill="var(--tone)" class="art-plain" opacity=".55"/>
    <path class="art-line art-spin" d="M119 57L119 43"/><path class="art-line" d="M119 57L127 61"/>
    <circle cx="119" cy="57" r="22" fill="none"/>`,
  'calm-tantrums': `
    <path d="M24 60C12 60 12 42 25 42C25 29 42 25 48 34C54 23 73 28 70 43C81 43 81 60 70 60Z" fill="#e6e0eb"/>
    <path d="M47 60L37 76H45L40 90L56 70H48L54 60Z" fill="#f3c94f"/>
    <path class="art-line" d="M84 54H104M98 48L104 54L98 60"/>
    ${heart(130, 52, 2.2, 'art-heart art-pulse')}
    <path class="art-line art-twinkle" d="M108 30l4 5M152 30l-4 5M130 18v7"/>`,
  'responsive-connection': `
    <path class="art-line" d="M12 90H148"/>
    <path d="M22 90C20 64 28 38 48 32C63 28 72 44 67 62C64 74 64 84 66 90Z" fill="#cfb7ef"/>
    ${peep(52, 46)}${peep(61, 48)}<path class="art-line" d="M51 58q5 4 10 0"/>
    <path d="M106 90C102 74 108 61 123 59C138 57 146 70 142 90Z" fill="var(--kid)"/>
    ${peep(119, 72)}${peep(129, 72)}<path class="art-line" d="M119 82q5 4 10 0"/>
    <path class="art-line art-dash" d="M70 40Q88 14 108 52"/>
    <circle cx="88" cy="26" r="7" fill="var(--tone)" class="art-float"/>`,
  'listen-and-name': `
    <path d="M20 18H84A10 10 0 0 1 94 28V54A10 10 0 0 1 84 64H46L32 76V64H20A10 10 0 0 1 10 54V28A10 10 0 0 1 20 18Z" fill="#fff"/>
    <circle cx="36" cy="41" r="4" class="art-dot" fill="#20251f"/><circle cx="52" cy="41" r="4" class="art-dot" fill="#20251f" style="animation-delay:.15s"/>
    <circle cx="68" cy="41" r="4" class="art-dot" fill="#20251f" style="animation-delay:.3s"/>
    <path d="M104 40H142A8 8 0 0 1 150 48V70A8 8 0 0 1 142 78H136V90L124 78H104A8 8 0 0 1 96 70V48A8 8 0 0 1 104 40Z" fill="var(--kid)"/>
    ${heart(123, 58, 1.4, 'art-heart-white art-pulse')}`,
  'play-following': `
    <path class="art-line" d="M12 86H148"/>
    <rect x="22" y="58" width="28" height="28" rx="4" fill="var(--kid)"/>
    <rect x="52" y="58" width="28" height="28" rx="4" fill="#fff"/>
    <rect x="36" y="28" width="28" height="28" rx="4" fill="var(--tone)" transform="rotate(-8 50 42)"/>
    <circle cx="116" cy="66" r="19" fill="#fff" class="art-float"/>
    <path class="art-line" d="M97 66Q116 56 135 66M116 47Q108 66 116 85" style="stroke: var(--tone)"/>
    ${star(140, 28, 6, .4)}${star(96, 22, 4, 1.2)}`
};

function lessonArt(lesson, classes = '') {
  return `<svg class="lesson-svg ${classes}" viewBox="0 0 160 100" aria-hidden="true">${LESSON_ART[lesson.id] || ''}</svg>`;
}

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  care: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M12 13v5M9.5 15.5h5"/></svg>',
  learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14M12 7C9 4.5 5.5 4 3 5v14c3-1 6.5-.5 9 2m0-14c3-2.5 6.5-3 9-2v14c-3-1-6.5-.5-9 2"/></svg>',
  paal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M9 11h.01M15 11h.01"/></svg>'
};


/* ---------- 4. SCREENS ---------- */

// Page frame: sidebar on desktop, bottom tabs on phones.
// Order requested: Home (left) · Learn · Care · PAAL (right).
function shell(active, content) {
  const nav = mobile => `<nav class="${mobile ? 'mobile-nav' : 'side-nav'}" aria-label="Main navigation">
    ${[['home', 'Home'], ['learn', 'Learn'], ['care', 'Care'], ['paal', 'PAAL']].map(([page, label]) =>
      `<a class="nav-item" href="#${page}" ${page === active ? 'aria-current="page"' : ''}>${ICONS[page]}<span>${label}</span></a>`
    ).join('')}
  </nav>`;

  return `<div class="layout">
    <aside class="sidebar">
      <a class="logo" href="#home">paal</a>
      ${nav(false)}
      <div class="side-foot">
        <p>A few more possibilities.<br>A little more confidence.</p>
        <button class="reset" id="reset">Reset demo</button>
      </div>
    </aside>
    <header class="topbar"><a class="logo" href="#home">paal</a><span class="tagline">Your family. Your way.</span></header>
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
      ${paal('paal-lg', true)}
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
  if (cancel) cancel.onclick = () => { location.hash = '#home'; };

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
    pruneCare();
    save();
    location.hash = '#home';
    toast(isNew ? `Welcome to PAAL, ${state.profile.parentName}!` : 'Family details saved');
  };
}


/* Home */

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

// Today's care blocks for every child, earliest first
function todaysBlocks() {
  return state.care.blocks
    .filter(b => b.date === todayKey())
    .sort((a, b) => a.time.localeCompare(b.time));
}

function homeScreen() {
  const p = state.profile;
  const next = LESSONS.find(l => !isDone(l.id));
  const tips = STRUGGLES.filter(s => p.struggles.includes(s.id));
  const blocks = todaysBlocks();
  const nextBlock = blocks.find(b => b.time >= new Date().toTimeString().slice(0, 5)) || blocks[0];
  const childName = id => p.children.find(c => c.id === id)?.name || '';

  return `
    <header class="page-head">
      <div><p class="eyebrow">Home</p><h1>Hi, ${esc(p.parentName)}.</h1></div>
      <a class="btn ghost" href="#edit">Edit family</a>
    </header>

    <section class="children-grid" aria-label="Your children">
      ${p.children.map((c, i) => `<article class="child-card tone-${CHILD_TONES[i % CHILD_TONES.length]}">
        ${kid(CHILD_TONES[i % CHILD_TONES.length], c.age, '', i)}
        <div><h2>${esc(c.name)}</h2><p>${ageLabel(c.age)}</p></div>
      </article>`).join('')}
    </section>

    <a class="card talk-card" href="#paal">
      ${paal('paal-md', true)}
      <div>
        <h2>Talk to PAAL</h2>
        <p>Describe what’s going on with ${esc(childNames())} and get ideas grounded in research.</p>
      </div>
      <span class="btn primary">Start a chat</span>
    </a>

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

      <section class="card care-card">
        <span class="care-icon" aria-hidden="true">${ICONS.care}</span>
        <h2>Schedule care</h2>
        <p class="muted">${blocks.length
          ? `${blocks.length} care block${blocks.length > 1 ? 's' : ''} today. Next: <strong>${formatTime(nextBlock.time)} · ${esc(nextBlock.title)}</strong>
             for ${esc(childName(nextBlock.childId))}${nextBlock.caregiverId ? ` with ${esc(caregiverName(nextBlock.caregiverId))}` : ''}.`
          : 'Nothing scheduled for today yet. Plan pickups, naps and handoffs with the people who help you.'}</p>
        <a class="btn primary" href="#care">Schedule care</a>
      </section>
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
        <div class="lesson-art">${lessonArt(l)}${isDone(l.id) ? '<span class="done-badge">✓</span>' : ''}</div>
        <div class="lesson-copy">
          <h2>${l.title}</h2>
          <p class="muted">${l.teaser}</p>
          <div class="lesson-foot">
            <span>${l.time}</span>
            <span class="status ${isDone(l.id) ? 'done' : ''}">${isDone(l.id) ? '✓ Completed' : 'Start →'}</span>
          </div>
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
    <div class="lesson-hero">${lessonArt(lesson)}</div>
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


/* Care
   Ported from Lili's Care page (her commit fcd8050) and rewritten in this file's
   style: care blocks, handoff updates, help requests, caregiver permissions and a
   shareable caregiver guide. It is a local demo: nothing is sent to anyone.
   (Her "Family toolkit" part is left out because it was the Village content.) */

const CARE_SCOPES = [
  ['plan', 'Today’s care plan'],
  ['guide', 'Child care guide'],
  ['updates', 'Handoff updates'],
  ['requests', 'Help requests']
];

let editingBlockId = null; // the care block being edited, if any

const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// '2026-11-03' for today, in local time
function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// '15:30' -> '3:30 PM'
function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function activeChild() {
  const kids = state.profile.children;
  return kids.find(c => c.id === state.activeChildId) || kids[0];
}

function caregiverName(id) {
  return state.care.caregivers.find(p => p.id === id)?.name || 'no one assigned';
}

// Caregivers allowed to see `scope` for this child (optionally only the assigned one)
function carePeople(scope, childId, assignedId = '') {
  return state.care.caregivers.filter(p =>
    p.permissions.includes(scope) && p.childIds.includes(childId) && (!assignedId || p.id === assignedId));
}

function careAudience(scope, childId, assignedId = '') {
  const people = carePeople(scope, childId, assignedId);
  return people.length ? people.map(p => esc(p.name)).join(', ') : 'No caregivers selected';
}

// After Edit family: drop care records for children who were removed
function pruneCare() {
  const ids = state.profile.children.map(c => c.id);
  for (const key of ['blocks', 'updates', 'requests']) {
    state.care[key] = state.care[key].filter(item => ids.includes(item.childId));
  }
  state.care.caregivers.forEach(p => { p.childIds = p.childIds.filter(id => ids.includes(id)); });
}

function caregiverGuide(child) {
  return `A quick guide for caring for ${child.name} (${ageLabel(child.age).toLowerCase()})

What they need: ${child.needs?.trim() || 'Not added yet'}
What helps them feel calm: ${child.calm?.trim() || 'Not added yet'}
An easy game to play: ${child.game?.trim() || 'Not added yet'}

Shared by their caregiver. Please check with their family about anything that may have changed.`;
}

function careScreen() {
  const kids = state.profile.children;
  const child = activeChild();
  const blocks = state.care.blocks
    .filter(b => b.childId === child.id && b.date === todayKey())
    .sort((a, b) => a.time.localeCompare(b.time));
  const updates = state.care.updates.filter(u => u.childId === child.id).slice().reverse();
  const requests = state.care.requests.filter(r => r.childId === child.id).slice().reverse();
  const editing = state.care.blocks.find(b => b.id === editingBlockId);
  const planPeople = carePeople('plan', child.id);
  const requestPeople = carePeople('requests', child.id);

  const checks = (name, items, selected) => items.map(([value, label]) =>
    `<label class="check"><input type="checkbox" name="${name}" value="${esc(value)}" ${selected.includes(value) ? 'checked' : ''}><span>${esc(label)}</span></label>`
  ).join('');
  const childItems = kids.map(c => [c.id, c.name]);

  const blockList = blocks.length ? blocks.map(b => `<article class="record">
      <span class="record-time">${formatTime(b.time)}</span>
      <div class="record-main">
        <h4>${esc(b.title)}</h4>
        ${b.details ? `<p>${esc(b.details)}</p>` : ''}
        <small>Caregiver: ${esc(caregiverName(b.caregiverId))} · Can see this: ${careAudience('plan', child.id, b.caregiverId)}</small>
      </div>
      <div class="record-actions">
        <button type="button" class="link-btn" data-edit-block="${esc(b.id)}">Edit</button>
        <button type="button" class="link-btn danger" data-delete-block="${esc(b.id)}">Remove</button>
      </div>
    </article>`).join('') : '<p class="empty">No care blocks yet. Add who’s doing what and when for today.</p>';

  const updateList = updates.length ? updates.map(u => `<article class="record note">
      <div class="record-main">
        <h4>${esc(u.kind)} <time>${new Date(u.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</time></h4>
        <p>${esc(u.text)}</p>
        <small>Can see this: ${careAudience('updates', child.id)}</small>
      </div>
    </article>`).join('') : '<p class="empty">No handoff updates yet. Post a short note for the next caregiver.</p>';

  const requestList = requests.length ? requests.map(r => `<article class="record ${r.status === 'accepted' ? 'accepted' : ''}">
      <div class="record-main">
        <h4>${r.status === 'accepted' ? '✓ Accepted in this demo' : 'Help requested'}${r.time ? ` <time>by ${formatTime(r.time)}</time>` : ''}</h4>
        <p>${esc(r.text)}</p>
        <small>Can see this: ${careAudience('requests', child.id, r.caregiverId)}</small>
      </div>
      ${r.status === 'open' ? `<button type="button" class="btn ghost small" data-accept="${esc(r.id)}">Accept in demo</button>` : ''}
    </article>`).join('') : '<p class="empty">No help requests yet. Ask for a hand with a specific part of today.</p>';

  const caregiverList = state.care.caregivers.length ? state.care.caregivers.map(p => `<article class="caregiver">
      <div class="caregiver-head">
        <strong>${esc(p.name)}</strong>
        <button type="button" class="link-btn danger" data-remove-caregiver="${esc(p.id)}">Remove</button>
      </div>
      <div class="caregiver-groups">
        <fieldset><legend>Children</legend>${checks('child-' + p.id, childItems, p.childIds)}</fieldset>
        <fieldset><legend>Can see</legend>${checks('permission-' + p.id, CARE_SCOPES, p.permissions)}</fieldset>
      </div>
    </article>`).join('') + '<button type="button" id="save-permissions" class="btn ghost">Save permissions</button>'
    : '<p class="empty">No caregivers yet. Add a name to preview who could see what. No account is created and no invitation is sent.</p>';

  const caregiverSelect = (people, selectedId, emptyLabel) => `<select name="caregiver">
      ${people.map(p => `<option value="${esc(p.id)}" ${p.id === selectedId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
      <option value="" ${!people.some(p => p.id === selectedId) ? 'selected' : ''}>${emptyLabel}</option>
    </select>`;

  return `
    <header class="page-head">
      <div>
        <p class="eyebrow">Care · ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1>Care, in sync.</h1>
        <p class="muted lead">Make today’s handoffs easier with a simple care plan, quick updates, and specific requests for help.</p>
      </div>
    </header>

    <p class="notice"><strong>Local demo only.</strong> Caregivers and activity are saved only in this browser.
      No invitation, update or request is sent to anyone.</p>

    <div class="child-tabs" role="group" aria-label="Planning for">
      <span class="child-tabs-label">Planning for</span>
      ${kids.map((c, i) => `<button type="button" class="child-tab tone-${CHILD_TONES[i % CHILD_TONES.length]}" data-child="${esc(c.id)}"
        aria-pressed="${c.id === child.id}">${kid(CHILD_TONES[i % CHILD_TONES.length], c.age, 'kid-xs', i)}<span>${esc(c.name)}</span></button>`).join('')}
    </div>

    <div class="care-grid">
      <section class="card care-section" id="schedule">
        <p class="eyebrow">Today’s plan</p>
        <h2>Care blocks</h2>
        <p class="muted">Who’s doing what, and when, for ${esc(child.name)}.</p>
        <div class="records">${blockList}</div>
        <form id="block-form" class="care-form">
          <h3>${editing ? 'Edit care block' : 'Add a care block'}</h3>
          <label class="field"><span>What needs to happen?</span>
            <input name="title" maxlength="100" placeholder="Pickup, snack, quiet time…" value="${esc(editing?.title || '')}"></label>
          <div class="form-row">
            <label class="field"><span>Time</span><input type="time" name="time" value="${esc(editing?.time || '')}"></label>
            <label class="field"><span>Caregiver</span>${caregiverSelect(planPeople, editing?.caregiverId, 'Not assigned')}</label>
          </div>
          <label class="field"><span>Handoff details (optional)</span>
            <textarea name="details" rows="2" maxlength="400" placeholder="Anything the next caregiver should know?">${esc(editing?.details || '')}</textarea></label>
          <p class="audience">Can see the plan: ${planPeople.length ? planPeople.map(p => esc(p.name)).join(', ') : 'no caregivers have care-plan access yet'}</p>
          <div class="form-actions">
            ${editing ? '<button type="button" id="cancel-block" class="btn ghost">Cancel</button>' : ''}
            <button type="submit" class="btn primary">${editing ? 'Save changes' : 'Add to today’s plan'}</button>
          </div>
        </form>
      </section>

      <section class="card care-section">
        <p class="eyebrow">A useful handoff</p>
        <h2>Post an update</h2>
        <p class="muted">Leave a brief note about what happened or what helped.</p>
        <form id="update-form" class="care-form">
          <label class="field"><span>Update type</span>
            <select name="kind"><option>Handoff note</option><option>What helped</option><option>Heads-up</option></select></label>
          <label class="field"><span>Update</span>
            <textarea name="text" rows="3" maxlength="500" placeholder="A short, practical update for the next caregiver…"></textarea></label>
          <p class="audience">Can see updates: ${careAudience('updates', child.id)}</p>
          <div class="form-actions"><button type="submit" class="btn primary">Post update</button></div>
        </form>
        <h3 class="records-title">Recent updates</h3>
        <div class="records">${updateList}</div>
      </section>

      <section class="card care-section">
        <p class="eyebrow">Ask for a hand</p>
        <h2>Request help</h2>
        <p class="muted">Describe one concrete task someone could take on.</p>
        <form id="request-form" class="care-form">
          <label class="field"><span>What would help?</span>
            <textarea name="text" rows="2" maxlength="300" placeholder="Could someone handle pickup today?"></textarea></label>
          <div class="form-row">
            <label class="field"><span>By when?</span><input type="time" name="time"></label>
            <label class="field"><span>Ask a caregiver</span>${caregiverSelect(requestPeople, '', 'No one specific')}</label>
          </div>
          <p class="audience">Can see requests: ${careAudience('requests', child.id)}</p>
          <div class="form-actions"><button type="submit" class="btn primary">Post request</button></div>
        </form>
        <h3 class="records-title">Help requests</h3>
        <div class="records">${requestList}</div>
      </section>

      <section class="card care-section">
        <p class="eyebrow">Who helps</p>
        <h2>Caregivers & permissions</h2>
        <p class="muted">Choose which child and information each caregiver would be allowed to see.</p>
        <div class="records">${caregiverList}</div>
        <form id="caregiver-form" class="care-form">
          <h3>Add a caregiver</h3>
          <label class="field"><span>Caregiver name</span><input name="name" maxlength="60" placeholder="For example, Grandma Jo"></label>
          <fieldset><legend>Children they may see</legend><div class="check-grid">${checks('children', childItems, kids.map(c => c.id))}</div></fieldset>
          <fieldset><legend>Information they may see</legend><div class="check-grid">${checks('permissions', CARE_SCOPES, CARE_SCOPES.map(([s]) => s))}</div></fieldset>
          <div class="form-actions"><button type="submit" class="btn primary">Add caregiver</button></div>
        </form>
      </section>

      <section class="card care-section care-guide">
        <p class="eyebrow">Made to share</p>
        <h2>A quick guide for caregivers</h2>
        <p class="muted">Share what helps ${esc(child.name)} feel supported, wherever they are.</p>
        <div class="guide-grid">
          <form id="guide-form" class="care-form">
            <label class="field"><span>What they need</span>
              <textarea name="needs" rows="2" maxlength="400" placeholder="Allergies, routines, comfort items…">${esc(child.needs || '')}</textarea></label>
            <label class="field"><span>What helps them feel calm</span>
              <textarea name="calm" rows="2" maxlength="400" placeholder="A quiet space, a familiar song…">${esc(child.calm || '')}</textarea></label>
            <label class="field"><span>An easy game to play</span>
              <input name="game" maxlength="200" placeholder="I spy, building blocks…" value="${esc(child.game || '')}"></label>
            <div class="form-actions"><button type="submit" class="btn ghost">Save guide</button></div>
          </form>
          <div class="guide-preview">
            <label class="field"><span>Preview the message</span>
              <textarea id="guide-text" rows="9" readonly>${esc(caregiverGuide(child))}</textarea></label>
            <div class="form-actions">
              <button type="button" id="copy-guide" class="btn ghost">Copy guide</button>
              <button type="button" id="share-guide" class="btn primary">Share guide ↗</button>
            </div>
            <p class="audience">Only share with people you trust. Sending it doesn’t sync later changes.</p>
          </div>
        </div>
      </section>
    </div>`;
}

async function copyGuide() {
  const field = $('#guide-text');
  try {
    await navigator.clipboard.writeText(field.value);
    toast('Caregiver guide copied');
  } catch {
    field.focus();
    field.select();
    toast('Guide selected. Copy it to share with a caregiver.');
  }
}

function bindCare() {
  const child = activeChild();
  const formData = id => new FormData($(id));
  const done = message => { save(); render(); toast(message); };

  document.querySelectorAll('[data-child]').forEach(button => {
    button.onclick = () => { state.activeChildId = button.dataset.child; editingBlockId = null; save(); render(); };
  });

  $('#block-form').onsubmit = event => {
    event.preventDefault();
    const form = formData('#block-form');
    const title = String(form.get('title')).trim(), time = String(form.get('time'));
    if (!title || !time) { toast('Add a care task and a time first.'); return; }
    const existing = state.care.blocks.find(b => b.id === editingBlockId);
    const block = { title, time, details: String(form.get('details')).trim(), caregiverId: String(form.get('caregiver')) };
    if (existing) Object.assign(existing, block);
    else state.care.blocks.push({ id: uid('block'), childId: child.id, date: todayKey(), createdAt: new Date().toISOString(), ...block });
    editingBlockId = null;
    done(existing ? 'Care block updated' : 'Added to today’s plan');
  };
  const cancel = $('#cancel-block');
  if (cancel) cancel.onclick = () => { editingBlockId = null; render(); };
  document.querySelectorAll('[data-edit-block]').forEach(button => {
    button.onclick = () => { editingBlockId = button.dataset.editBlock; render(); $('#block-form').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  });
  document.querySelectorAll('[data-delete-block]').forEach(button => {
    button.onclick = () => {
      state.care.blocks = state.care.blocks.filter(b => b.id !== button.dataset.deleteBlock);
      if (editingBlockId === button.dataset.deleteBlock) editingBlockId = null;
      done('Care block removed');
    };
  });

  $('#update-form').onsubmit = event => {
    event.preventDefault();
    const form = formData('#update-form');
    const text = String(form.get('text')).trim();
    if (!text) { toast('Write a short update first.'); return; }
    state.care.updates.push({ id: uid('update'), childId: child.id, kind: String(form.get('kind')), text, createdAt: new Date().toISOString() });
    done('Update saved in this browser. No one was notified.');
  };

  $('#request-form').onsubmit = event => {
    event.preventDefault();
    const form = formData('#request-form');
    const text = String(form.get('text')).trim();
    if (!text) { toast('Describe what help would be useful.'); return; }
    state.care.requests.push({ id: uid('request'), childId: child.id, text, time: String(form.get('time')),
      caregiverId: String(form.get('caregiver')), status: 'open', createdAt: new Date().toISOString() });
    done('Request saved in this browser. No one was notified.');
  };
  document.querySelectorAll('[data-accept]').forEach(button => {
    button.onclick = () => {
      const request = state.care.requests.find(r => r.id === button.dataset.accept);
      if (request) { request.status = 'accepted'; request.acceptedAt = new Date().toISOString(); }
      done('Marked accepted in this demo');
    };
  });

  $('#caregiver-form').onsubmit = event => {
    event.preventDefault();
    const form = formData('#caregiver-form');
    const name = String(form.get('name')).trim();
    const childIds = form.getAll('children').map(String), permissions = form.getAll('permissions').map(String);
    if (!name) { toast('Add a caregiver name first.'); return; }
    if (!childIds.length || !permissions.length) { toast('Choose at least one child and one thing they can see.'); return; }
    state.care.caregivers.push({ id: uid('caregiver'), name, childIds, permissions });
    done(`${name} added. No invitation was sent.`);
  };
  const savePermissions = $('#save-permissions');
  if (savePermissions) savePermissions.onclick = () => {
    const checked = name => [...document.querySelectorAll(`[name="${CSS.escape(name)}"]:checked`)].map(input => input.value);
    state.care.caregivers.forEach(p => {
      p.childIds = checked('child-' + p.id);
      p.permissions = checked('permission-' + p.id);
    });
    done('Permissions saved in this browser');
  };
  document.querySelectorAll('[data-remove-caregiver]').forEach(button => {
    button.onclick = () => {
      state.care.caregivers = state.care.caregivers.filter(p => p.id !== button.dataset.removeCaregiver);
      done('Caregiver removed');
    };
  });

  $('#guide-form').onsubmit = event => {
    event.preventDefault();
    const form = formData('#guide-form');
    for (const key of ['needs', 'calm', 'game']) child[key] = String(form.get(key)).trim();
    done('Caregiver guide saved');
  };
  $('#copy-guide').onclick = copyGuide;
  $('#share-guide').onclick = async () => {
    if (typeof navigator.share !== 'function') { copyGuide(); return; }
    try { await navigator.share({ title: `Care guide for ${child.name}`, text: $('#guide-text').value }); }
    catch (error) { if (error.name !== 'AbortError') toast('Could not open sharing. Try copying the guide instead.'); }
  };
}


/* PAAL (chat) */

function paalScreen() {
  const kids = state.profile.children;
  const firstName = kids[0]?.name || 'my child';
  const prompts = [
    `Give me quick screen-free ideas to distract ${firstName} right now`,
    `We’re stuck waiting. Quick ideas to keep ${firstName} busy?`,
    ...STRUGGLES
      .filter(s => state.profile.struggles.includes(s.id))
      .map(s => capitalize(s.example.replace('{child}', firstName)))
  ];

  return `<div class="paal-page">
    <p class="kids-line">Here for
      ${kids.map((c, i) => `<span class="kid-chip tone-${CHILD_TONES[i % CHILD_TONES.length]}">${esc(c.name)}</span>`).join('')}
    </p>

    <div class="speech">Hi, I’m PAAL! I can help you with anything you need.</div>

    <div class="chat-wrap">
      <div class="peeker">${paal('paal-peek')}</div>
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

    <section class="activities">
      <h2 class="section-title">Guided by PAAL</h2>
      <p class="muted">Press start and PAAL will walk you through it, step by step.</p>
      <div class="activity-grid">${ACTIVITIES.map(activityCard).join('')}</div>
    </section>
  </div>`;
}

function activityCard(activity) {
  const runs = state.activityRuns[activity.id] || 0;
  const firstKid = state.profile.children[0];
  const art = activity.id === 'parent-reset'
    ? `<div class="mini-stage"><span class="mini-ring"></span>${paal('paal-md')}</div>`
    : `<div class="mini-stage duo">${paal('paal-md', true)}${kid(CHILD_TONES[0], firstKid?.age ?? 4)}</div>`;
  return `<article class="card activity-card tone-${activity.tone}">
    <div class="activity-art">${art}</div>
    <div class="activity-copy">
      <p class="eyebrow">${activity.kind}</p>
      <h3>${activity.title}</h3>
      <p>${activity.summary}</p>
      <p class="method">Based on: ${activity.basedOn}.
        ${activity.sources.map((s, i) => `<a href="${s.url}" target="_blank" rel="noopener">Source ${i + 1}</a>`).join(' · ')}</p>
      <div class="activity-foot">
        <span class="muted">${activity.minutes} min${runs ? ` · done ${runs}×` : ''}</span>
        <button type="button" class="btn primary" data-activity="${activity.id}">▶ Start</button>
      </div>
    </div>
  </article>`;
}


/* ---------- 5. CHAT ---------- */

function paalBubble(html) {
  return `<div class="msg-row">${paal('paal-xs')}<div class="msg bot">${html}</div></div>`;
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

  // "Give me ideas now" wins when it's at least as strong as a topic match
  const quickScore = (t.match(QUICK) || []).length;
  if (quickScore && quickScore >= bestScore) return quickIdeasReply(t, kid ? [kid] : kids);

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

const QUICK = /\b(distract\w*|bored\w*|ideas?|quick\w*|right now|something to do|activit\w*|busy|entertain\w*)\b/g;
const ON_THE_GO = /\b(waiting|wait|car|restaurant|line|store|doctor|plane|airport|queue|stuck)\b/;

// Three random screen-free ideas that fit every child the message is about
function quickIdeasReply(text, children) {
  const ages = children.map(c => Number(c.age));
  const fits = idea => ages.every(a => a >= idea.ages[0] && a <= idea.ages[1]);
  let pool = QUICK_IDEAS.filter(fits);
  if (!pool.length) pool = QUICK_IDEAS.filter(idea => ages.some(a => a >= idea.ages[0] && a <= idea.ages[1]));
  const onTheGo = ON_THE_GO.test(text);
  if (onTheGo && pool.some(i => i.anywhere)) pool = pool.filter(i => i.anywhere);
  const picks = pool.sort(() => Math.random() - .5).slice(0, 3);
  const who = esc(listNames(children.map(c => c.name)));

  return `<p>Here are a few screen-free ideas for ${who} you can start right now${onTheGo ? ', no supplies needed' : ''}:</p>
    <ul class="idea-list">${picks.map(i => `<li><strong>${i.title}:</strong> ${i.how}</li>`).join('')}</ul>
    <p><small>Tip: offer a choice of two (“${picks[0]?.title} or ${picks[1]?.title}?”). Kids join in more easily when they get to pick.
      Ask me again for different ideas.</small></p>`;
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
  document.querySelectorAll('[data-activity]').forEach(button => { button.onclick = () => startActivity(button.dataset.activity); });
  const clear = $('#clear-chat');
  if (clear) clear.onclick = () => { state.chat = []; save(); render(); };
}


/* Guided activity player: a full-screen, calm view where PAAL leads each step
   with a timer, a breathing circle and (optionally) a spoken voice. */

let player = null; // { activity, step, left, paused, timer }

function stepLength(step) {
  return step.breathe ? step.breathe * BREATH_CYCLE : step.secs;
}

function sayText(step) {
  return step.say.replace('{child}', childNames() || 'your child');
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  if (!state.voice || !text) return;
  const line = new SpeechSynthesisUtterance(text);
  line.rate = .9;
  line.pitch = 1.05;
  speechSynthesis.speak(line);
}

const clock = secs => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

// Where we are in a breathing cycle: 0–2s in, 2–3s extra sip, 3–9s out
function breathCue(step, left) {
  const elapsed = stepLength(step) - left;
  const t = elapsed % BREATH_CYCLE;
  const cue = t < 2 ? 'Breathe in through your nose' : t < 3 ? 'One more little sip in' : 'Slowly out through your mouth';
  return `${cue} · breath ${Math.min(Math.floor(elapsed / BREATH_CYCLE) + 1, step.breathe)} of ${step.breathe}`;
}

function startActivity(id) {
  closeActivity();
  player = { activity: ACTIVITIES.find(a => a.id === id), step: 0, left: 0, paused: false };
  document.body.insertAdjacentHTML('beforeend',
    `<div id="player" class="player tone-${player.activity.tone}" role="dialog" aria-modal="true" aria-label="${player.activity.title}"></div>`);
  document.body.classList.add('no-scroll');
  goToStep(0);
  player.timer = setInterval(tick, 1000);
}

function goToStep(index) {
  const steps = player.activity.steps;
  if (index >= steps.length) { finishActivity(); return; }
  player.step = index;
  player.left = stepLength(steps[index]);
  drawPlayer();
  speak(sayText(steps[index]));
}

function drawPlayer() {
  const { activity, step: index, paused } = player;
  const step = activity.steps[index];
  const box = $('#player');
  box.classList.toggle('paused', paused);
  box.innerHTML = `
    <div class="player-top">
      <span class="eyebrow">${activity.title} · ${activity.kind}</span>
      <button type="button" class="player-close" id="player-close" aria-label="Close">✕</button>
    </div>
    <div class="player-stage ${step.breathe ? 'breathing' : ''} ${activity.id === 'special-time' ? 'duo' : ''}">
      <span class="breath-ring" style="animation-delay: -${(stepLength(step) - player.left) % BREATH_CYCLE}s"></span>
      ${paal('paal-lg player-paal', !step.breathe)}
      ${activity.id === 'special-time' ? kid(CHILD_TONES[0], state.profile.children[0]?.age ?? 4) : ''}
    </div>
    <p class="breath-cue" id="breath-cue">${step.breathe ? breathCue(step, player.left) : '&nbsp;'}</p>
    <h2>${step.title}</h2>
    <p class="player-say">${esc(sayText(step))}</p>
    <div class="player-dots" aria-label="Step ${index + 1} of ${activity.steps.length}">
      ${activity.steps.map((_, i) => `<span class="${i < index ? 'done' : i === index ? 'now' : ''}"></span>`).join('')}
    </div>
    <p class="player-time" id="player-time">${clock(player.left)}</p>
    <div class="player-controls">
      <button type="button" class="btn ghost" id="player-voice" aria-pressed="${state.voice}">${state.voice ? '🔊 Voice on' : '🔈 Voice off'}</button>
      <button type="button" class="btn primary" id="player-pause">${paused ? '▶ Resume' : '❚❚ Pause'}</button>
      <button type="button" class="btn ghost" id="player-next">Next →</button>
    </div>`;

  $('#player-close').onclick = closeActivity;
  $('#player-next').onclick = () => goToStep(player.step + 1);
  $('#player-pause').onclick = () => {
    player.paused = !player.paused;
    if ('speechSynthesis' in window) player.paused ? speechSynthesis.pause() : speechSynthesis.resume();
    drawPlayer();
  };
  $('#player-voice').onclick = () => {
    state.voice = !state.voice;
    save();
    speak(state.voice ? sayText(step) : '');
    drawPlayer();
  };
}

function tick() {
  if (!player || player.paused || player.done) return;
  player.left -= 1;
  if (player.left <= 0) { goToStep(player.step + 1); return; }
  const step = player.activity.steps[player.step];
  $('#player-time').textContent = clock(player.left);
  if (step.breathe) $('#breath-cue').textContent = breathCue(step, player.left);
}

function finishActivity() {
  const { activity } = player;
  player.done = true;
  clearInterval(player.timer);
  state.activityRuns[activity.id] = (state.activityRuns[activity.id] || 0) + 1;
  save();
  $('#player').innerHTML = `
    <div class="player-top"><span class="eyebrow">${activity.title}</span>
      <button type="button" class="player-close" id="player-close" aria-label="Close">✕</button></div>
    <div class="player-stage">${paal('paal-lg player-paal', true)}</div>
    <h2>Nice work!</h2>
    <p class="player-say">You’ve done ${activity.title.toLowerCase()} ${state.activityRuns[activity.id]} time${state.activityRuns[activity.id] > 1 ? 's' : ''}. A little every day adds up.</p>
    <p class="player-sources">Based on: ${activity.sources.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a>`).join(' · ')}</p>
    <div class="player-controls">
      <button type="button" class="btn ghost" id="player-again">Do it again</button>
      <button type="button" class="btn primary" id="player-done">Back to PAAL</button>
    </div>`;
  $('#player-close').onclick = closeActivity;
  $('#player-done').onclick = closeActivity;
  $('#player-again').onclick = () => startActivity(activity.id);
}

function closeActivity() {
  if (!player) return;
  clearInterval(player.timer);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  $('#player')?.remove();
  document.body.classList.remove('no-scroll');
  player = null;
  if (currentRoute().page === 'paal') render(); // refresh "done N×"
}

document.addEventListener('keydown', event => { if (event.key === 'Escape') closeActivity(); });


/* ---------- 6. ROUTER ---------- */

// URLs: #home, #learn, #learn/<lesson-id>, #care, #paal, #edit
// Anyone without a profile sees the sign-up page first.
function currentRoute() {
  const [page = '', id = ''] = location.hash.slice(1).split('/');
  if (!state.profile) return { page: 'signup' };
  if (page === 'learn' && id) return { page: 'lesson', id };
  if (['home', 'learn', 'care', 'paal', 'edit'].includes(page)) return { page };
  return { page: 'home' }; // also catches old #family links
}

const TITLES = { signup: 'Welcome', edit: 'Edit family', home: 'Home', learn: 'Learn', lesson: 'Learn', care: 'Care', paal: 'Talk to PAAL' };

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
    home: homeScreen,
    learn: learnScreen,
    lesson: () => lesson ? lessonScreen(lesson) : learnScreen(),
    care: careScreen,
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
  if (route.page === 'care') bindCare();
  if (route.page === 'paal') bindChat();
}

window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
render();
