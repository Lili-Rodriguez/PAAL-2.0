/* ==========================================================
   PAAL – interactive lessons (the "Learn" tab)

   Each lesson is a short deck of cards you tap through: meet the
   researchers, quick checks, "what would you do?" scenarios, myth-busters
   and a tiny plan to try. Everything the lessons say comes from the same
   sources listed in app.js (LESSONS).

   This file is loaded BEFORE app.js and only uses app.js helpers
   (esc, $, state, save, render, toast, isDone, LESSONS) when a lesson is
   opened. app.js asks it for the lesson screen with PaalLearn.has().

   TO EDIT A LESSON: change its entry in CARDS below. Card types:
     meet    – who found this (photo / logo / initials)
     idea    – one big idea
     quiz    – pick the best answer (also used for scenarios)
     flip    – a myth, tap to reveal the truth
     build   – tap the right pieces to build something
     pledge  – pick one thing to try
   The last card (finish + sources) is added automatically.

   PEOPLE & LOGOS: put a file in dist/learn-img/ and set `photo:` or `logo:`
   on a person/org. Without one, a colored badge with initials is shown.
   Only use images you have the rights to use.
   ========================================================== */

(function () {
  'use strict';

  const PEOPLE = {
    mindell: { kind: 'person', name: 'Dr. Jodi Mindell', role: 'Sleep researcher · Children’s Hospital of Philadelphia', initials: 'JM', hue: '#b892ea' },
    eyberg: { kind: 'person', name: 'Dr. Sheila Eyberg', role: 'Psychologist · created PCIT · University of Florida', initials: 'SE', hue: '#f4a37f' },
    aap: { kind: 'org', name: 'American Academy of Pediatrics', role: 'Pediatricians’ association (AAP)', initials: 'AAP', hue: '#7fb0dc' },
    who: { kind: 'org', name: 'World Health Organization', role: 'United Nations health agency (WHO)', initials: 'WHO', hue: '#5b9bd5' },
    harvard: { kind: 'org', name: 'Center on the Developing Child', role: 'Harvard University', initials: 'H', hue: '#a51c30', logo: 'learn-img/harvard.svg', credit: 'Harvard coat of arms: public domain, via Wikimedia Commons' },
    cdc: { kind: 'org', name: 'Centers for Disease Control and Prevention', role: 'U.S. public health agency (CDC)', initials: 'CDC', hue: '#7cc59a', logo: 'learn-img/cdc.svg', credit: 'CDC logo: public domain, via Wikimedia Commons' }
  };

  const CARDS = {
    /* ---------------- Bedtime ---------------- */
    'bedtime-routine': [
      { type: 'meet', who: ['mindell'], kicker: 'Who found this?',
        text: 'Dr. Mindell studies how children sleep. In her well-known research, babies and toddlers whose parents followed the same simple routine every night fell asleep faster and woke up less, within just a few weeks.' },
      { type: 'idea', icon: '🌙', title: 'Boring bedtimes are powerful',
        text: 'The same few calm steps, in the same order, every night. The repetition is the whole trick: your child’s body learns “this means sleep is coming.”' },
      { type: 'quiz', q: 'In the research, what helped children fall asleep faster?',
        options: [
          { t: 'A fancy sleep gadget', why: 'Not a gadget. It was something much simpler and free.' },
          { t: 'The same simple routine every night', ok: true, why: 'Yes! Repetition teaches the body what comes next.' },
          { t: 'A different, exciting activity each night', why: 'Surprises are fun by day, but at night predictable works better.' }
        ] },
      { type: 'build', title: 'Build tonight’s routine', hint: 'Tap the calm steps. About 3–4 steps, 20–30 minutes in all.',
        items: [
          { t: '🛁 Bath', ok: true }, { t: '👕 Pajamas', ok: true }, { t: '📖 A book', ok: true }, { t: '🤗 A cuddle', ok: true },
          { t: '📺 One more show', why: 'Screens should be off at least an hour before bed.' },
          { t: '🤸 Wrestling', why: 'Too wound up. Keep the last 30 minutes calm and the lights dim.' }
        ], doneText: 'That’s a bedtime routine: calm, short, and the same every night.' },
      { type: 'flip', myth: '“Kids just fall asleep when they’re tired.”',
        truth: 'Tired isn’t enough. A predictable routine helps the body wind down, and it works through repetition, so give it two to three weeks.' },
      { type: 'pledge', title: 'Pick one thing to try tonight',
        options: ['Pick one bedtime and keep it the same, even on weekends', 'Turn screens off an hour before bed', 'Say goodnight while they’re drowsy but still awake'] }
    ],

    /* ---------------- Screens ---------------- */
    'screen-plan': [
      { type: 'meet', who: ['aap', 'who'], kicker: 'Who recommends this?',
        text: 'The American Academy of Pediatrics and the World Health Organization both recommend clear, consistent limits: about an hour a day of quality content for ages 2–5, planned ahead instead of negotiated every time.' },
      { type: 'idea', icon: '🗓️', title: 'Plan it before it starts',
        text: 'Most screen fights happen at the ending. Agree on when, where and how long before the tablet comes out, so “no” never feels like a surprise.' },
      { type: 'quiz', kicker: 'What would you do?', q: 'The tablet time is almost up, and your child is about to protest. What helps most?',
        options: [
          { t: 'Grab it and turn it off', why: 'A sudden ending feels unfair, and it usually makes the protest bigger.' },
          { t: 'Give a 5-minute and a 1-minute warning, then end it as agreed', ok: true, why: 'Yes. Warnings (or a visual timer) make the ending predictable.' },
          { t: 'Give 10 extra minutes to avoid a fight', why: 'It teaches that protesting moves the limit. Staying consistent gets easier with repetition.' }
        ] },
      { type: 'quiz', q: 'Which one is a “when–then”?',
        options: [
          { t: '“Turn it off right now or else!”', why: 'That’s a threat. A when–then is calm and shows what comes next.' },
          { t: '“When the tablet is off, then we can go to the park.”', ok: true, why: 'Exactly. It points to something good that comes right after.' },
          { t: '“Maybe later, we’ll see.”', why: 'Vague answers invite negotiating. Be specific.' }
        ] },
      { type: 'flip', myth: '“The goal is zero screens.”',
        truth: 'It isn’t. Video calls with family and watching together are different from solo scrolling. Choose limits that fit your family, and model them yourself when you can.' },
      { type: 'pledge', title: 'Pick one thing to try this week',
        options: ['Agree on the ending before it starts: “Two episodes, then off”', 'Use a visual timer or a 5-minute warning', 'Have the next activity ready to go'] }
    ],

    /* ---------------- Tantrums ---------------- */
    'calm-tantrums': [
      { type: 'meet', who: ['eyberg'], kicker: 'Who found this?',
        text: 'Dr. Eyberg created Parent-Child Interaction Therapy (PCIT), one of the most studied approaches for tantrums and defiance in young children. Its core idea: lots of warm attention for calm behavior, very little for tantrum behavior that isn’t dangerous.' },
      { type: 'idea', icon: '🔦', title: 'Attention is a spotlight',
        text: 'Children repeat what gets your attention. Shine the spotlight on calm moments, and keep it dim during the tantrum, as long as everyone is safe.' },
      { type: 'quiz', kicker: 'What would you do?', q: 'Your child melts down in the store after hearing “no.” What comes first?',
        options: [
          { t: 'Keep everyone safe, then stay calm with few words', ok: true, why: 'Yes. Safety first, then something like “You’re really mad. I’m right here.”' },
          { t: 'Explain why they’re wrong, in detail', why: 'Long lectures don’t reach a child in the middle of a meltdown.' },
          { t: 'Offer a treat so it stops', why: 'Bribing during a tantrum can teach that tantrums work.' }
        ] },
      { type: 'quiz', q: 'The tantrum ends and your child calms down. What now?',
        options: [
          { t: 'Warm, specific praise: “You calmed your body. That was hard!”', ok: true, why: 'This is the key moment. Praise the calm so it happens more.' },
          { t: 'Remind them how badly they behaved', why: 'It pulls attention back to the tantrum instead of the calm.' },
          { t: 'Say nothing and move on', why: 'You’d miss the best moment to notice the calm.' }
        ] },
      { type: 'flip', myth: '“Ignoring means ignoring everything.”',
        truth: 'You calmly ignore yelling and whining, but never unsafe behavior. If your child could get hurt or hurt someone, step in right away.' },
      { type: 'pledge', title: 'Pick one thing to try this week',
        options: ['Do 5 minutes of “special time” daily, with your child leading the play', 'Practice one calm sentence: “I’m right here”', 'Catch one calm moment a day and praise it'] }
    ],

    /* ---------------- Serve and return ---------------- */
    'responsive-connection': [
      { type: 'meet', who: ['harvard'], kicker: 'Who found this?',
        text: 'Researchers at Harvard’s Center on the Developing Child found that everyday back-and-forth moments help build the brain connections behind language and social skills. They call it “serve and return,” like a tennis rally.' },
      { type: 'idea', icon: '🎾', title: 'Serve and return',
        text: 'Your child “serves” with a look, a sound or a point. You “return” it with a smile, a word or a gesture. A short exchange counts, and it doesn’t need to be a planned activity.' },
      { type: 'quiz', kicker: 'Serve 1: baby points', q: 'A baby points at a dog and babbles. What’s a great return?',
        options: [
          { t: 'Smile and say, “Yes! A big brown dog!”', ok: true, why: 'You noticed, responded and gave it a name.' },
          { t: 'Keep scrolling on your phone', why: 'The serve gets missed. It’s okay now and then, but responses are what build connection.' },
          { t: 'Say “Don’t point.”', why: 'Pointing is communication. Meet it with interest instead.' }
        ] },
      { type: 'quiz', kicker: 'Serve 2: toddler shows you a block', q: 'Your toddler holds up a red block. Which return keeps the rally going?',
        options: [
          { t: '“Good.” (and back to the dishes)', why: 'Nice, but short. Add a few words about what they’re showing you.' },
          { t: '“You found a red block! Where does it go?” Then wait for their answer.', ok: true, why: 'You named it, then paused. Waiting gives them room to respond.' },
          { t: 'Take the block and show them the “right” way to play', why: 'Follow their lead first. Their interest is the point.' }
        ] },
      { type: 'flip', myth: '“I have to be available every single moment.”',
        truth: 'You don’t. Stress, disability, sensory needs, culture and temperament all shape what connection looks like. This is a helpful model, not a test of parental performance.' },
      { type: 'pledge', title: 'Pick one thing to try today',
        options: ['Notice one serve and return it with a few words', 'Name what your child is looking at', 'After you speak, wait a few extra seconds'] }
    ],

    /* ---------------- Listening ---------------- */
    'listen-and-name': [
      { type: 'meet', who: ['cdc'], kicker: 'Who recommends this?',
        text: 'The CDC recommends active listening: giving your full attention, reflecting what your child said, and naming a possible feeling, without insisting your guess is right.' },
      { type: 'idea', icon: '👂', title: 'Listen first, solve later',
        text: 'Before fixing anything, show you heard. That can make space for a child to share more.' },
      { type: 'quiz', kicker: 'What would you say?', q: 'Your child says, “Nobody would play with me at recess!” What’s the best first response?',
        options: [
          { t: '“Don’t worry about it, it’s no big deal.”', why: 'This can make a child feel unheard.' },
          { t: '“It sounds like that was frustrating. Did I get that right?”', ok: true, why: 'You named a possible feeling and checked. If they correct you, follow their lead.' },
          { t: '“Here’s exactly what you should do tomorrow.”', why: 'Solving too fast skips the listening.' }
        ] },
      { type: 'quiz', q: 'You guessed “sad,” but your child says, “No, I was embarrassed.” What now?',
        options: [
          { t: 'Follow their lead: “Embarrassed. Tell me more.”', ok: true, why: 'Your guess doesn’t have to be right. The checking is what counts.' },
          { t: 'Insist you know best', why: 'Then your child stops sharing.' },
          { t: 'Drop the subject for good', why: 'You can gently stay available. “Okay, I’m here if you want to talk.”' }
        ] },
      { type: 'flip', myth: '“If I listen well, my child will calm down and agree.”',
        truth: 'Not guaranteed. You can validate a feeling and still hold a necessary safety boundary. Choose a moment and communication style that fit your child. Some prefer fewer words or more time.' },
      { type: 'pledge', title: 'Pick one thing to try today',
        options: ['Repeat back what my child says before responding', 'Name one possible feeling, then ask “Did I get that right?”', 'Give more time before I jump in with advice'] }
    ],

    /* ---------------- Play ---------------- */
    'play-following': [
      { type: 'meet', who: ['cdc'], kicker: 'Who recommends this?',
        text: 'The CDC describes imitation and specific descriptions as ways to show interest in your child’s play and support interaction.' },
      { type: 'idea', icon: '🧱', title: 'Let them lead the play',
        text: 'Child-led play gives your child room to choose the activity and direction while you follow with attention. Keep it brief, and it doesn’t have to be a lesson.' },
      { type: 'quiz', q: 'Your child lines up blue blocks. Which is a specific description?',
        options: [
          { t: '“Good job!”', why: 'Kind, but not specific. Describe what you see.' },
          { t: '“You lined up the blue blocks.”', ok: true, why: 'Describing what they do shows you’re paying attention, without directing the play.' },
          { t: '“Let’s build a tower instead.”', why: 'That changes their plan. Follow first.' }
        ] },
      { type: 'quiz', q: 'Your child ignores you and keeps playing alone. What does following their lead mean here?',
        options: [
          { t: 'Join with a similar toy or just stay nearby, and wait for an invitation', ok: true, why: 'Parallel play counts. They’ll invite you in when ready.' },
          { t: 'Insist they play with you', why: 'Preferences vary: parallel play, movement, quiet, or no adult right then.' },
          { t: 'Stop trying for the whole day', why: 'A short, easy try later works. Following their cues is the goal.' }
        ] },
      { type: 'flip', myth: '“Playtime should teach something.”',
        truth: 'Following your child’s cues matters more than performing a particular play technique. Brief, relaxed time together counts.' },
      { type: 'pledge', title: 'Pick one thing to try today',
        options: ['Describe what my child is doing for one minute', 'Copy what they do with a similar toy', 'Wait to see if they invite more'] }
    ]
  };

  /* ---------- Lesson covers: what each lesson is based on ----------
     kind = "Study", "Therapy program" or "Guide". Shown on the cover card
     and under the title in the lesson list. */
  const COVERS = {
    'bedtime-routine': { kind: 'Study', study: 'A nightly bedtime routine: impact on sleep in young children and maternal mood',
      by: 'Dr. Jodi A. Mindell, Lauren S. Telofski, Benjamin Wiegand & Ethan S. Kurtz', short: 'Dr. Jodi Mindell et al.', where: 'Sleep (journal) · 2009', people: ['mindell'] },
    'screen-plan': { kind: 'Guide', study: 'Family Media Plan',
      by: 'American Academy of Pediatrics', short: 'American Academy of Pediatrics', where: 'with World Health Organization screen-time guidance', people: ['aap', 'who'] },
    'calm-tantrums': { kind: 'Therapy program', study: 'Parent-Child Interaction Therapy (PCIT)',
      by: 'Dr. Sheila Eyberg', short: 'Dr. Sheila Eyberg', where: 'University of Florida', people: ['eyberg'] },
    'responsive-connection': { kind: 'Research', study: 'Serve and Return',
      by: 'Center on the Developing Child, Harvard University', short: 'Harvard Center on the Developing Child', where: 'Harvard University', people: ['harvard'] },
    'listen-and-name': { kind: 'Guide', study: 'Tips for Connecting and Communicating',
      by: 'Centers for Disease Control and Prevention', short: 'CDC', where: 'U.S. public health agency', people: ['cdc'] },
    'play-following': { kind: 'Guide', study: 'Child-led Play',
      by: 'Centers for Disease Control and Prevention', short: 'CDC', where: 'U.S. public health agency', people: ['cdc'] }
  };

  /* ---------- Themes: how the lesson list is grouped ---------- */
  const THEMES = [
    { id: 'sleep', icon: '😴', title: 'Sleep & Routines', blurb: 'Calmer nights, predictable evenings.', tone: 'lav', lessons: ['bedtime-routine'] },
    { id: 'screens', icon: '📱', title: 'Screens', blurb: 'Limits that don’t turn into battles.', tone: 'sky', lessons: ['screen-plan'] },
    { id: 'feelings', icon: '🌧️', title: 'Big Feelings', blurb: 'Meltdowns, tears and talking it through.', tone: 'peach', lessons: ['calm-tantrums', 'listen-and-name'] },
    { id: 'connection', icon: '💛', title: 'Connection & Play', blurb: 'Small moments that build trust and language.', tone: 'mint', lessons: ['responsive-connection', 'play-following'] }
  ];
  const themeOf = id => THEMES.find(t => t.lessons.includes(id));

  /* ---------- Search and category filter (Learn page) ---------- */
  const FILTER = { q: '', theme: 'all' };
  const fold = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const flat = v => Array.isArray(v) ? v.map(flat).join(' ') : v && typeof v === 'object' ? Object.values(v).map(flat).join(' ') : typeof v === 'string' ? v : '';

  // Everything a lesson could be searched by: title, topic, study, author, theme and its cards
  function findText(l) {
    const c = COVERS[l.id] || {}, t = themeOf(l.id) || {};
    return fold([l.title, l.teaser, c.study, c.by, c.short, c.where, c.kind, t.title, t.blurb, flat(CARDS[l.id]), flat(ACTIONS[l.id])].join(' '));
  }
  const matches = (hay, themeId) => {
    const words = fold(FILTER.q).split(/\s+/).filter(Boolean);
    return (FILTER.theme === 'all' || FILTER.theme === themeId) && words.every(w => hay.includes(w));
  };
  const attrs = l => `data-find="${esc(findText(l))}" data-theme="${esc((themeOf(l.id) || {}).id || 'more')}"${matches(findText(l), (themeOf(l.id) || {}).id) ? '' : ' hidden'}`;

  // Search box + category chips, shown at the top of the Learn page
  function controls() {
    const chip = (id, label, tone = '') => `<button type="button" class="cat ${tone ? 'tone-' + tone : ''}" data-cat="${id}" aria-pressed="${FILTER.theme === id}">${label}</button>`;
    return `<div class="learn-tools">
      <label class="learn-search"><span class="sr-only">Search actions</span><span aria-hidden="true">🔍</span>
        <input id="learn-search" type="search" placeholder="Search actions, topics or authors" value="${esc(FILTER.q)}" autocomplete="off"></label>
      <div class="learn-cats" role="group" aria-label="Categories">
        ${chip('all', 'All')}${THEMES.map(t => chip(t.id, `${t.icon} ${t.title}`, t.tone)).join('')}
      </div>
      <p class="preview-note">★ Ratings are a preview with sample numbers.</p>
    </div>`;
  }

  // Show/hide cards and theme sections without redrawing (keeps typing smooth)
  function applyFilter() {
    let shown = 0;
    document.querySelectorAll('.lesson-card[data-find]').forEach(card => {
      const ok = matches(card.dataset.find, card.dataset.theme);
      card.hidden = !ok;
      if (ok) shown++;
    });
    document.querySelectorAll('.theme').forEach(sec => { sec.hidden = !sec.querySelector('.lesson-card:not([hidden])'); });
    const empty = $('#learn-empty');
    if (empty) { empty.hidden = shown > 0; empty.querySelector('b').textContent = FILTER.q ? `“${FILTER.q}”` : 'this category'; }
    document.querySelectorAll('[data-cat]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cat === FILTER.theme)));
  }

  let toolsBound = false;
  function bindTools() {
    if (toolsBound) return;
    toolsBound = true;
    document.addEventListener('input', e => { if (e.target.id === 'learn-search') { FILTER.q = e.target.value; applyFilter(); } });
    document.addEventListener('click', e => {
      const b = e.target.closest?.('[data-cat]');
      if (!b) return;
      FILTER.theme = FILTER.theme === b.dataset.cat && b.dataset.cat !== 'all' ? 'all' : b.dataset.cat; // tap again to clear
      applyFilter();
    });
  }

  // The lesson list, grouped by theme. `cardHtml` is app.js's card renderer.
  function themed(lessons, cardHtml) {
    const known = new Set(THEMES.flatMap(t => t.lessons));
    const groups = THEMES.map(t => ({ ...t, items: t.lessons.map(id => lessons.find(l => l.id === id)).filter(Boolean) }));
    const other = lessons.filter(l => !known.has(l.id)); // lessons added later without a theme
    if (other.length) groups.push({ id: 'more', icon: '📚', title: 'More lessons', blurb: '', tone: 'gold', items: other });
    bindTools();
    const html = groups.filter(g => g.items.length).map(g => {
      const done = g.items.filter(l => isDone(l.id)).length;
      const visible = g.items.some(l => matches(findText(l), g.id));
      return `<section class="theme tone-${g.tone}" aria-labelledby="theme-${g.id}" ${visible ? '' : 'hidden'}>
        <header class="theme-head">
          <span class="theme-icon" aria-hidden="true">${g.icon}</span>
          <div><h2 id="theme-${g.id}">${esc(g.title)}</h2>${g.blurb ? `<p class="muted">${esc(g.blurb)}</p>` : ''}</div>
          <span class="theme-count">${done}/${g.items.length}</span>
        </header>
        <div class="lesson-grid">${g.items.map(cardHtml).join('')}</div>
      </section>`;
    }).join('');
    const any = lessons.some(l => matches(findText(l), (themeOf(l.id) || {}).id));
    return html + `<p class="learn-empty" id="learn-empty" role="status" ${any ? 'hidden' : ''}>No lessons match <b></b>. Try another word or pick All.</p>`;
  }

  /* ==========================================================
     ACTIONS: each lesson is sold as something a parent can DO.
     name/promise replace the old lesson title; `why` is the evidence card.
     level: how strong the source is (shown as a badge). We say "backed by
     research", never "proven", and every card says what the source did NOT test.
     ========================================================== */
  const ACTIONS = {
    'bedtime-routine': { title: 'The 20-minute wind-down', promise: 'Help your child fall asleep faster and wake up less.',
      why: { level: 'Randomized trial', tier: 'strong', headline: 'Children whose parents added one nightly routine fell asleep faster.',
        finding: 'In a 3-week randomized trial published in Sleep (2009), families who added a consistent nightly routine saw significant improvements in how fast their babies and toddlers fell asleep and in night wakings, and mothers’ mood improved too. Families who changed nothing saw no change.',
        how: 'Predictable cues teach the body what comes next, so winding down gets easier with repetition.',
        limits: 'Sleep was reported by mothers (questionnaires and diaries), and the study focused on infants and toddlers. It tested adding a routine, not any one step in it.',
        source: { label: 'Mindell et al., Sleep, 2009 (PubMed)', url: 'https://pubmed.ncbi.nlm.nih.gov/19480226/' } } },
    'screen-plan': { title: 'The no-fight switch-off', promise: 'End screen time without the meltdown.',
      why: { level: 'Expert guidance', tier: 'guide', headline: 'Pediatricians recommend planning screens ahead and ending them predictably.',
        finding: 'The American Academy of Pediatrics recommends about an hour a day of high-quality content for ages 2–5 (2016 statement) and a Family Media Plan: agree on when, where and how long screens are used.',
        how: 'When the rules are set before screen time starts, there’s less to negotiate in the moment, and warnings make the ending predictable.',
        limits: 'This is expert guidance, not a trial of this exact script. The AAP updates its wording over time, so check healthychildren.org for the current version.',
        source: { label: 'AAP Family Media Plan (HealthyChildren.org)', url: 'https://www.healthychildren.org/English/fmp/Pages/MediaPlan.aspx' } } },
    'calm-tantrums': { title: 'The calm-down reset', promise: 'A calmer way through meltdowns, and a way to reward calm.',
      why: { level: 'Research-backed program', tier: 'strong', headline: 'Praising calm and not rewarding tantrums is the core of a well-studied program.',
        finding: 'Parent-Child Interaction Therapy (PCIT) has been studied for decades. Reviews that pool many studies find it reduces disruptive behavior in young children, roughly ages 2–7.',
        how: 'Children repeat what earns attention. Warm attention for calm moments, and calmly not rewarding tantrums, shifts what they repeat.',
        limits: 'PCIT is delivered by trained therapists with live coaching. This action is a simplified home version, and most results rely on parents’ reports. If tantrums are very frequent, very long or involve hurting, talk to your pediatrician.',
        source: { label: 'PCIT meta-analysis (PubMed)', url: 'https://pubmed.ncbi.nlm.nih.gov/34668468/' } } },
    'responsive-connection': { title: 'The serve-and-return minute', promise: 'Turn ordinary moments into language-building ones.',
      why: { level: 'Expert guidance', tier: 'guide', headline: 'Everyday back-and-forth moments help build language and social skills.',
        finding: 'Harvard’s Center on the Developing Child describes “serve and return” (a child reaches out with a look, sound or gesture and an adult responds) as building the brain connections behind communication and social skills.',
        how: 'Each response tells your child their signals matter, and the back-and-forth practices turn-taking.',
        limits: 'This is a science-based framework from a research center, not a single trial. Short moments count, and no one can do it all day.',
        source: { label: 'Serve and Return (Harvard Center on the Developing Child)', url: 'https://developingchild.harvard.edu/science/key-concepts/serve-and-return/' } } },
    'listen-and-name': { title: 'The “sounds like…” response', promise: 'Help your child feel heard before you try to fix it.',
      why: { level: 'Expert guidance', tier: 'guide', headline: 'Public-health guidance recommends listening and naming feelings first.',
        finding: 'The CDC recommends active listening: give your full attention, reflect what you heard, and name a possible feeling without insisting you’re right.',
        how: 'Feeling understood can make it easier for a child to keep talking, which gives you more to work with.',
        limits: 'Guidance, not a trial. It doesn’t guarantee calm or agreement, and some children prefer fewer words or more time.',
        source: { label: 'Tips for Connecting and Communicating (CDC)', url: 'https://www.cdc.gov/parenting-toddlers/communication/index.html' } } },
    'play-following': { title: 'The 5-minute follow-the-leader', promise: 'Connect through play, with no prep and no lesson plan.',
      why: { level: 'Expert guidance', tier: 'guide', headline: 'Following your child’s lead in play shows interest and supports interaction.',
        finding: 'The CDC suggests following your child’s lead in play, describing what they do and imitating them, as ways to show interest and support interaction.',
        how: 'Choosing the activity gives children room to lead, and your description shows you’re paying attention.',
        limits: 'Guidance, not a trial. Play preferences vary: some children want parallel play, movement, quiet, or no adult right then.',
        source: { label: 'Child-led Play (CDC)', url: 'https://www.cdc.gov/parenting-toddlers/communication/child-led-play.html' } } }
  };

  // PREVIEW ONLY: sample numbers to show how ratings will look. Replace with
  // real data once parents use PAAL. The UI always labels them as samples.
  const RATINGS = {
    'bedtime-routine': { avg: 4.8, count: 2314, helped: 91 },
    'screen-plan': { avg: 4.6, count: 1872, helped: 84 },
    'calm-tantrums': { avg: 4.7, count: 2056, helped: 88 },
    'responsive-connection': { avg: 4.9, count: 1203, helped: 93 },
    'listen-and-name': { avg: 4.7, count: 1448, helped: 89 },
    'play-following': { avg: 4.8, count: 1690, helped: 92 }
  };
  function ratingHtml(id, big) {
    const r = RATINGS[id];
    if (!r) return '';
    return `<div class="rate ${big ? 'big' : ''}" role="img" aria-label="Preview with sample numbers: ${r.avg} out of 5 from ${r.count} sample parents, ${r.helped} percent say it helped">
      <span class="stars" style="--pct:${r.avg / 5 * 100}%" aria-hidden="true">★★★★★</span>
      <strong aria-hidden="true">${r.avg.toFixed(1)}</strong>
      <span class="rate-count" aria-hidden="true">${r.count.toLocaleString('en-US')} parents tried it</span>
      <span class="rate-help" aria-hidden="true">${r.helped}% say it helped</span>
      <span class="rate-preview" aria-hidden="true">Preview · sample numbers</span>
    </div>`;
  }

  // Called once from app.js: swap lesson titles/teasers for the action names
  function rename(lessons) {
    lessons.forEach(l => { const a = ACTIONS[l.id]; if (a) { l.title = a.title; l.teaser = a.promise; } });
  }

  /* ==========================================================
     TOOLS: a tiny plan-maker for every action. The parent answers a few
     taps and gets a ready-to-use plan (with real clock times and word-for-word
     scripts) they can save, copy or print. To add one: give it `fields` and
     a `make(values, child)` that returns { summary, blocks:[{h, lines, ordered}], note }.
     ========================================================== */
  const toMin = t => { const [h, m] = String(t || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
  const fmt = min => { const x = ((min % 1440) + 1440) % 1440, h = Math.floor(x / 60); return `${((h + 11) % 12) + 1}:${String(x % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`; };

  const BED_STEPS = [['🛁 Bath', 10], ['👕 Pajamas', 5], ['🪥 Brush teeth', 5], ['📖 Book', 10], ['🤗 Cuddle and song', 5], ['🚰 Water and potty', 5]];
  const SERVES = {
    'Animals': ['points at a dog', '“Yes! A big brown dog!”'],
    'Trucks and cars': ['holds up a truck', '“You found a big red truck! Where is it going?”'],
    'Drawing': ['shows you a scribble', '“You made lots of blue lines! Tell me about it.”'],
    'Dinosaurs': ['roars like a dinosaur', '“What a big roar! Is it a hungry dinosaur?”'],
    'Snacks': ['points at the banana', '“Banana! You want the yellow banana.”'],
    'Music': ['bangs a beat on the table', '“Bang, bang! Let’s do it again.”']
  };
  const PLAY_LINES = {
    'Blocks': '“You stacked the blue blocks.”', 'Toy cars': '“You’re driving the red car fast.”',
    'Dolls or animals': '“The doggie is going to sleep.”', 'Drawing': '“You’re drawing a big circle.”', 'Play-dough': '“You’re rolling it really long.”'
  };

  const TOOLS = {
    'bedtime-routine': {
      heading: 'Build your wind-down', intro: 'Pick a bedtime and the calm steps. PAAL works out the clock times.',
      fields: [
        { id: 'bed', type: 'time', label: 'Lights out at', def: '19:30' },
        { id: 'steps', type: 'multi', label: 'Calm steps (pick 3–4)', options: BED_STEPS.map(s => s[0]), def: ['👕 Pajamas', '📖 Book', '🤗 Cuddle and song'] }
      ],
      make(v, c) {
        const chosen = BED_STEPS.filter(s => v.steps.includes(s[0])), total = chosen.reduce((n, s) => n + s[1], 0), bed = toMin(v.bed);
        let t = bed - total;
        const lines = chosen.map(s => { const l = `${fmt(t)} · ${s[0]} (${s[1]} min)`; t += s[1]; return l; });
        return {
          summary: `Lights out ${fmt(bed)} · wind-down starts ${fmt(bed - total)}`,
          blocks: [
            { h: 'Screens off', lines: [`${fmt(bed - 60)} · screens off and lights dim (at least an hour before bed)`] },
            { h: `Wind-down (${total} min)`, lines, ordered: true },
            { h: 'Lights out', lines: [`${fmt(bed)} · say goodnight while ${c.name} is drowsy but still awake`] },
            { h: 'Remember', lines: ['Same steps, same order, every night.', 'Give it two to three weeks. Routines work through repetition.'] }
          ],
          note: total < 15 ? 'Tip: most routines run 20–30 minutes in all. Add one more calm step.' : total > 40 ? 'Tip: most routines run 20–30 minutes in all. Try dropping a step.' : ''
        };
      }
    },

    'screen-plan': {
      heading: 'Make your screen plan', intro: 'Decide it now, calmly, so it isn’t a negotiation later.',
      fields: [
        { id: 'when', type: 'choice', label: 'When', options: ['After school', 'After dinner', 'Weekend morning'], def: 'After dinner' },
        { id: 'start', type: 'time', label: 'Starts at', def: '18:00' },
        { id: 'len', type: 'choice', label: 'How long (minutes)', options: ['20', '30', '45', '60'], def: '30' },
        { id: 'next', type: 'choice', label: 'What comes next', options: ['go to the park', 'have a snack', 'read a story', 'take a bath', 'play a game together'], def: 'go to the park' },
        { id: 'rules', type: 'multi', label: 'Family rules', options: ['No screens at meals', 'No screens in bedrooms', 'Watch together sometimes'], def: ['No screens at meals', 'No screens in bedrooms'] }
      ],
      make(v, c) {
        const len = Number(v.len), s = toMin(v.start), end = s + len;
        return {
          summary: `${v.when}, ${len} min, ${fmt(s)} to ${fmt(end)}`,
          blocks: [
            { h: 'The plan', lines: [`${v.when}: ${len} minutes, ${fmt(s)} to ${fmt(end)}`, 'Agree on the ending before it starts.'] },
            { h: 'Say it like this', ordered: true, lines: [
              `Before it starts: “${len} minutes, then it’s off.”`,
              `${fmt(end - 5)}: “Five more minutes, then we turn it off.”`,
              `${fmt(end - 1)}: “One more minute.”`,
              `${fmt(end)}: “Time’s up. When the screen is off, then we ${v.next}.”`] },
            { h: 'Family rules', lines: v.rules },
            { h: 'If they protest', lines: ['Stay calm and consistent. It gets easier with repetition.', `Have the next activity ready before you start.`] }
          ],
          note: c.age >= 2 && c.age <= 5 ? 'For ages 2–5, the AAP suggests about an hour a day of high-quality content at most.' : ''
        };
      }
    },

    'calm-tantrums': {
      heading: 'Make your reset card', intro: 'Choose the words now, so you have them when you’re tired.',
      fields: [
        { id: 'trigger', type: 'choice', label: 'The usual trigger', options: ['Hearing “no”', 'Leaving somewhere fun', 'Screens turning off', 'Bedtime', 'Being told to wait'], def: 'Hearing “no”' },
        { id: 'say', type: 'choice', label: 'Your calm sentence', options: ['You’re really mad. I’m right here.', 'It’s okay to be upset. I’m staying close.', 'I can see this is hard. I’m right here.'], def: 'You’re really mad. I’m right here.' },
        { id: 'praise', type: 'choice', label: 'Your praise for the calm', options: ['You calmed your body. That was hard!', 'You took a big breath. Nice calming!', 'I love how you got calm.'], def: 'You calmed your body. That was hard!' },
        { id: 'sp', type: 'time', label: 'Daily special time at', def: '17:00' },
        { id: 'spm', type: 'choice', label: 'Special time minutes', options: ['5', '10'], def: '5' }
      ],
      make(v, c) {
        return {
          summary: `Calm sentence ready · special time ${fmt(toMin(v.sp))}`,
          blocks: [
            { h: `When ${c.name} melts down (${v.trigger.toLowerCase()})`, ordered: true, lines: [
              'Keep everyone safe. Move your child or nearby objects if you need to.',
              `Stay calm, few words: “${v.say}”`,
              'Don’t argue, bribe or lecture. Calmly ignore yelling and whining, but never unsafe behavior.',
              `The moment they calm down, praise: “${v.praise}”`] },
            { h: 'Every day', lines: [`${fmt(toMin(v.sp))} · ${v.spm} minutes of special time. ${c.name} leads the play; you describe what they do, copy it and praise it.`] }
          ],
          note: 'This is a simplified home version of a therapist-led program. If tantrums are very frequent, very long or involve hurting, talk with your pediatrician.'
        };
      }
    },

    'responsive-connection': {
      heading: 'Pick your serve-and-return moment', intro: 'Choose what your child loves and when you’ll try it.',
      fields: [
        { id: 'interest', type: 'choice', label: 'They love…', options: Object.keys(SERVES), def: 'Animals' },
        { id: 'moment', type: 'choice', label: 'Try it during', options: ['Mealtime', 'Car ride', 'Bath time', 'A walk outside'], def: 'Mealtime' }
      ],
      make(v, c) {
        const [serve, ret] = SERVES[v.interest];
        return {
          summary: `${v.moment.toLowerCase()}, ${v.interest.toLowerCase()}`,
          blocks: [
            { h: `Today, during ${v.moment.toLowerCase()}`, lines: [`Watch for a serve: for example, ${c.name} ${serve}.`, `Return it with a few words: ${ret}`, 'Wait about five seconds. Give them time to answer.'] },
            { h: 'Three steps', ordered: true, lines: ['Notice the serve (a look, a sound, a point).', 'Return it with a smile and a few words.', 'Wait, and follow their lead.'] },
            { h: 'How much', lines: ['One to three exchanges is plenty. Short moments count.'] }
          ],
          note: ''
        };
      }
    },

    'listen-and-name': {
      heading: 'Make your “sounds like…” card', intro: 'Pick a moment that comes up often. PAAL writes the words.',
      fields: [
        { id: 'sit', type: 'choice', label: 'Something that happens', options: ['nobody played with you at recess', 'you lost the game', 'your tower fell over', 'you didn’t get a turn', 'we had to leave the park'], def: 'nobody played with you at recess' },
        { id: 'feel', type: 'choice', label: 'A feeling they might have', options: ['frustrated', 'sad', 'embarrassed', 'left out', 'angry'], def: 'frustrated' }
      ],
      make(v, c) {
        const other = ['sad', 'embarrassed', 'angry', 'left out', 'frustrated'].find(f => f !== v.feel);
        return {
          summary: `“It sounds like you felt ${v.feel}…”`,
          blocks: [
            { h: 'Try saying', lines: [`“It sounds like you felt ${v.feel} when ${v.sit}. Did I get that right?”`] },
            { h: `If ${c.name} corrects you`, lines: [`“Oh, ${other}. Tell me more.” (Your guess doesn’t have to be right.)`] },
            { h: 'If they don’t want to talk', lines: ['“Okay. I’m here if you want to talk.”'] },
            { h: 'Hold off on', lines: ['Fixing and advice, until they’ve had time to feel heard.'] }
          ],
          note: 'Listening doesn’t guarantee calm or agreement. You can validate a feeling and still hold a safety boundary.'
        };
      }
    },

    'play-following': {
      heading: 'Plan your 5 minutes', intro: 'Choose a time and a toy. No prep needed.',
      fields: [
        { id: 'toy', type: 'choice', label: 'Play with', options: Object.keys(PLAY_LINES), def: 'Blocks' },
        { id: 'mins', type: 'choice', label: 'Minutes', options: ['5', '10'], def: '5' },
        { id: 'at', type: 'time', label: 'At', def: '16:30' }
      ],
      make(v, c) {
        return {
          summary: `${v.mins} min with ${v.toy.toLowerCase()} at ${fmt(toMin(v.at))}`,
          blocks: [
            { h: `${fmt(toMin(v.at))} · ${v.mins} minutes with ${v.toy.toLowerCase()}`, ordered: true, lines: [
              `Sit near ${c.name} and let them choose what to do.`,
              `Describe what they do: ${PLAY_LINES[v.toy]}`,
              'Copy them with a similar toy.',
              'Wait to see if they invite more.'] }
          ],
          note: 'If they’d rather play alone or move around, that’s fine. Staying nearby counts.'
        };
      }
    }
  };

  const childCtx = () => {
    const kids = (typeof state !== 'undefined' && state.family && state.family.children) || [];
    const kid = kids.find(k => k.id === state.activeChildId) || kids[0];
    return { name: (kid && kid.nickname) || 'your child', age: kid ? Number(kid.age) : NaN };
  };
  const PLAN_KEY = 'paal-learn-plans', FB_KEY = 'paal-learn-feedback';
  const readJson = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } };
  const writeJson = (k, id, v) => { try { localStorage.setItem(k, JSON.stringify({ ...readJson(k), [id]: v })); } catch { /* storage unavailable */ } };
  const toolInit = (id) => {
    const saved = readJson(PLAN_KEY)[id] || {};
    return Object.fromEntries(TOOLS[id].fields.map(f => [f.id, saved[f.id] !== undefined ? saved[f.id] : (Array.isArray(f.def) ? [...f.def] : f.def)]));
  };
  const planOf = (id, vals) => ({ ...TOOLS[id].make(vals, childCtx()), title: ACTIONS[id].title, kicker: `${childCtx().name}’s plan` });
  const planHtml = p => `<div class="plan"><p class="plan-kicker">${esc(p.kicker)}</p><h3>${esc(p.title)}</h3>${p.blocks.map(b =>
    `<h4>${esc(b.h)}</h4><${b.ordered ? 'ol' : 'ul'}>${b.lines.map(l => `<li>${esc(l)}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`).join('')}${p.note ? `<p class="plan-note">${esc(p.note)}</p>` : ''}</div>`;
  const planText = p => `${p.kicker}: ${p.title}\n\n${p.blocks.map(b => `${b.h}\n${b.lines.map((l, n) => (b.ordered ? `${n + 1}. ` : '- ') + l).join('\n')}`).join('\n\n')}${p.note ? '\n\n' + p.note : ''}\n\nMade with PAAL`;
  function printPlan(p) {
    const w = window.open('', '_blank');
    if (!w) { toast('Allow pop-ups to print your plan.'); return; }
    w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(p.title)}</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:560px;margin:32px auto;padding:0 20px;color:#302d3a}h1{font-size:28px;margin:0 0 4px}.k{color:#777;margin:0}h2{font-size:13px;margin:22px 0 4px;text-transform:uppercase;letter-spacing:.07em;color:#555}li{margin:5px 0}.n{margin-top:24px;color:#555;font-size:14px}footer{margin-top:34px;color:#999;font-size:12px}</style><p class="k">${esc(p.kicker)}</p><h1>${esc(p.title)}</h1>${p.blocks.map(b => `<h2>${esc(b.h)}</h2><${b.ordered ? 'ol' : 'ul'}>${b.lines.map(l => `<li>${esc(l)}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`).join('')}${p.note ? `<p class="n">${esc(p.note)}</p>` : ''}<footer>Made with PAAL</footer>`);
    w.document.close(); w.focus(); w.print();
  }

  /* ---------- Saved pledges (this device only) ---------- */
  const PLEDGE_KEY = 'paal-learn-pledges';
  const readPledges = () => { try { return JSON.parse(localStorage.getItem(PLEDGE_KEY)) || {}; } catch { return {}; } };
  const writePledge = (id, text) => {
    try { localStorage.setItem(PLEDGE_KEY, JSON.stringify({ ...readPledges(), [id]: text })); } catch { /* storage unavailable */ }
  };

  /* ---------- Player state (resets when you open another lesson) ---------- */
  const LC = { id: null, i: 0, answers: {}, anim: '', confetti: false };
  let keysBound = false;

  // Deck: cover, the idea, WHY it works, who found it, quick checks, then the plan-maker
  const cardsFor = lesson => {
    const base = CARDS[lesson.id];
    if (!base) return [];
    const pick = t => base.find(c => c.type === t);
    const rest = base.filter(c => !['meet', 'idea', 'pledge'].includes(c.type));
    return [{ type: 'cover' }, pick('idea'), ACTIONS[lesson.id] ? { type: 'why' } : null, pick('meet'), ...rest, TOOLS[lesson.id] ? { type: 'tool' } : null].filter(Boolean);
  };
  const has = id => Boolean(CARDS[id]);

  // A card is "complete" when you can move on.
  function isComplete(card, i) {
    const a = LC.answers[i] || {};
    switch (card.type) {
      case 'quiz': return a.ok === true;
      case 'flip': return a.revealed === true;
      case 'build': return (a.picked || []).filter(k => card.items[k].ok).length === card.items.filter(x => x.ok).length;
      case 'pledge': return typeof a.choice === 'number';
      default: return true;
    }
  }

  /* ---------- Faces & logos ---------- */
  function avatar(p, size = '') {
    const img = p.photo || p.logo;
    if (img) {
      return `<span class="lc-avatar ${p.kind} has-img ${size}"><img src="${esc(img)}" alt="${p.logo ? esc(p.name) + ' logo' : esc(p.name)}"></span>`;
    }
    return `<span class="lc-avatar ${p.kind} ${size}" style="--hue:${p.hue}" aria-hidden="true">${esc(p.initials)}</span>`;
  }

  /* ---------- One renderer per card type ---------- */
  const RENDER = {
    cover(card, i, lesson) {
      const c = COVERS[lesson.id], theme = themeOf(lesson.id);
      return `<div class="lc-cover">
        ${theme ? `<span class="lc-theme">${theme.icon} ${esc(theme.title)}</span>` : ''}
        <div class="lc-cover-art">${lessonArt(lesson)}</div>
        <h1 class="lc-cover-title">${esc(lesson.title)}</h1>
        <p class="lc-promise">${esc(lesson.teaser)}</p>
        ${c ? `<div class="lc-based">
          <span class="lc-based-label">Based on · ${esc(c.kind)}</span>
          <p class="lc-study">${esc(c.study)}</p>
          <div class="lc-byline">${c.people.map(k => avatar(PEOPLE[k], 'small')).join('')}
            <p class="lc-by"><strong>${esc(c.by)}</strong><span>${esc(c.where)}</span></p></div>
        </div>` : ''}
        ${ratingHtml(lesson.id, true)}
        <p class="lc-meta">${cardsFor(lesson).length + 1} short cards · ends with a plan you can use today</p>
      </div>`;
    },

    why(card, i, lesson) {
      const w = ACTIONS[lesson.id].why;
      return `<p class="lc-kicker">Why it works</p>
        <h2 class="lc-title">${esc(w.headline)}</h2>
        <span class="lc-level ${w.tier}">${w.tier === 'strong' ? '●●●' : '●●○'} ${esc(w.level)}</span>
        <p class="lc-text sm">${esc(w.finding)}</p>
        <div class="lc-mech"><strong>How it likely works</strong><p>${esc(w.how)}</p></div>
        <div class="lc-limits"><strong>Good to know</strong><p>${esc(w.limits)}</p></div>
        <a class="lc-src" href="${esc(w.source.url)}" target="_blank" rel="noopener">Read the source: ${esc(w.source.label)} ↗</a>
        <p class="lc-credit">PAAL says “backed by research,” not “proven.” We show how strong each source is and what it didn’t test.</p>`;
    },

    tool(card, i, lesson) {
      const T = TOOLS[lesson.id];
      const a = LC.answers[i] = LC.answers[i] || { vals: toolInit(lesson.id), saved: false };
      const field = f => f.type === 'time'
        ? `<label class="tf"><span>${esc(f.label)}</span><input type="time" data-tin="${f.id}" value="${esc(a.vals[f.id])}"></label>`
        : `<fieldset class="tf"><legend>${esc(f.label)}</legend><div class="chips">${f.options.map(o => {
            const on = f.type === 'multi' ? a.vals[f.id].includes(o) : a.vals[f.id] === o;
            return `<button type="button" class="lc-chip ${on ? 'on' : ''}" data-tf="${f.id}" data-tv="${esc(o)}" aria-pressed="${on}">${esc(o)}</button>`;
          }).join('')}</div></fieldset>`;
      return `<p class="lc-kicker">Make it easy</p>
        <h2 class="lc-title">${esc(T.heading)}</h2>
        <p class="muted">${esc(T.intro)}</p>
        <div class="tool-fields">${T.fields.map(field).join('')}</div>
        <div id="plan-preview" aria-live="polite">${planHtml(planOf(lesson.id, a.vals))}</div>
        <div class="tool-actions">
          <button type="button" class="btn primary" data-tsave>${a.saved ? '✓ Plan saved' : 'Save my plan'}</button>
          <button type="button" class="btn ghost" data-tcopy>Copy</button>
          <button type="button" class="btn ghost" data-tprint>Print</button>
        </div>`;
    },

    meet(card) {
      const people = card.who.map(k => PEOPLE[k]);
      const credits = people.filter(p => p.credit).map(p => p.credit);
      return `<p class="lc-kicker">${esc(card.kicker)}</p>
        <div class="lc-who-row">${people.map(p => `<div class="lc-who">${avatar(p)}<h2>${esc(p.name)}</h2><p class="muted">${esc(p.role)}</p></div>`).join('')}</div>
        <p class="lc-text">${esc(card.text)}</p>
        ${credits.length ? `<p class="lc-credit">${credits.map(esc).join(' · ')}</p>` : ''}`;
    },

    idea(card) {
      return `<div class="lc-icon" aria-hidden="true">${card.icon}</div>
        <h2 class="lc-title">${esc(card.title)}</h2>
        <p class="lc-text">${esc(card.text)}</p>`;
    },

    quiz(card, i) {
      const a = LC.answers[i] || { tried: [] };
      const last = a.tried.length ? a.tried[a.tried.length - 1] : null;
      return `<p class="lc-kicker">${esc(card.kicker || 'Quick check')}</p>
        <h2 class="lc-title">${esc(card.q)}</h2>
        <div class="lc-options">${card.options.map((o, k) => {
          const state = a.ok && o.ok ? 'right' : a.tried.includes(k) ? 'wrong' : '';
          return `<button type="button" class="lc-option ${state}" data-pick="${k}" ${a.ok ? 'disabled' : ''}>${esc(o.t)}</button>`;
        }).join('')}</div>
        <p class="lc-feedback ${a.ok ? 'good' : ''}" role="status">${last === null ? 'Tap an answer.' : (a.ok ? '✓ ' : 'Not quite. ') + esc(card.options[last].why)}</p>`;
    },

    flip(card, i) {
      const revealed = (LC.answers[i] || {}).revealed;
      return `<p class="lc-kicker">Myth or truth?</p>
        <div class="lc-myth"><span class="lc-tag">Myth</span><p>${esc(card.myth)}</p></div>
        ${revealed
          ? `<div class="lc-truth"><span class="lc-tag good">Truth</span><p>${esc(card.truth)}</p></div>`
          : `<button type="button" class="btn primary lc-reveal" data-reveal>Tap to reveal the truth</button>`}`;
    },

    build(card, i) {
      const a = LC.answers[i] || { picked: [], msg: '' };
      const need = card.items.filter(x => x.ok).length;
      const got = a.picked.filter(k => card.items[k].ok).length;
      return `<p class="lc-kicker">Build it</p>
        <h2 class="lc-title">${esc(card.title)}</h2>
        <p class="muted">${esc(card.hint)}</p>
        <div class="lc-ribbon" aria-label="Your routine">${a.picked.filter(k => card.items[k].ok).map(k => `<span class="lc-chip in">${esc(card.items[k].t)}</span>`).join('') || '<span class="lc-empty">Your routine appears here</span>'}</div>
        <div class="lc-options chips">${card.items.map((it, k) => {
          const taken = a.picked.includes(k) && it.ok;
          return `<button type="button" class="lc-chip ${taken ? 'taken' : ''}" data-build="${k}" ${taken ? 'disabled' : ''}>${esc(it.t)}</button>`;
        }).join('')}</div>
        <p class="lc-feedback ${got === need ? 'good' : ''}" role="status">${got === need ? '✓ ' + esc(card.doneText) : (a.msg ? esc(a.msg) : `${got} of ${need} calm steps`)}</p>`;
    },

    pledge(card, i) {
      const a = LC.answers[i] || {};
      return `<p class="lc-kicker">Your turn</p>
        <h2 class="lc-title">${esc(card.title)}</h2>
        <div class="lc-options">${card.options.map((o, k) =>
          `<button type="button" class="lc-option ${a.choice === k ? 'right' : ''}" data-pledge="${k}">${esc(o)}</button>`).join('')}</div>
        <p class="lc-feedback ${typeof a.choice === 'number' ? 'good' : ''}" role="status">${typeof a.choice === 'number' ? '✓ I’ll save this as your plan. You can change it any time.' : 'There’s no wrong choice. Pick the one that feels easiest.'}</p>`;
    }
  };

  function finishCard(lesson) {
    const done = isDone(lesson.id);
    const plan = readPledges()[lesson.id], fb = readJson(FB_KEY)[lesson.id];
    const nuance = lesson.sections[lesson.sections.length - 1];
    const idx = LESSONS.findIndex(l => l.id === lesson.id);
    const next = LESSONS[idx + 1];
    return `<div class="lc-icon big" aria-hidden="true">${done ? '🎉' : '⭐'}</div>
      <h2 class="lc-title">${done ? 'You did it!' : 'Nice work!'}</h2>
      ${plan ? `<div class="lc-plan"><span class="lc-tag good">Your plan</span><p>${esc(plan)}</p></div>` : ''}
      <div class="lc-fb"><strong>Tried it? How did it go?</strong>
        <div class="lc-fb-row">${['Helped', 'Partly', 'Didn’t fit'].map(o => `<button type="button" class="lc-chip ${fb === o ? 'on' : ''}" data-fb="${o}" aria-pressed="${fb === o}">${o}</button>`).join('')}</div>
        ${fb ? '<p class="muted">Thanks! Once PAAL is live, answers like yours will make up the ratings.</p>' : ''}</div>
      <div class="lc-note"><strong>${esc(nuance[0])}</strong><p>${esc(nuance[1])}</p></div>
      <details class="lc-sources"><summary>Sources</summary>
        <ul>${lesson.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> · ${esc(s.publisher)}</li>`).join('')}</ul>
      </details>
      <div class="lc-finish">
        ${done
          ? `<button type="button" class="btn ghost" data-uncomplete>✓ Tried it · undo</button>`
          : `<button type="button" class="btn primary" data-complete>Mark as tried ✓</button>`}
        ${done && next ? `<a class="btn primary" href="#learn/${next.id}">Next action →</a>` : ''}
        <a class="btn ghost" href="#learn">All actions</a>
      </div>
      ${LC.confetti ? `<div class="lc-confetti" aria-hidden="true">${Array.from({ length: 28 }, (_, n) => `<i style="--x:${(n * 37) % 100}%;--d:${(n % 7) * .12}s;--c:${['#b892ea', '#f4a37f', '#7cc59a', '#7fb0dc', '#e6c25a', '#e994b8'][n % 6]}"></i>`).join('')}</div>` : ''}`;
  }

  /* ---------- The player ---------- */
  function inner(lesson) {
    const cards = cardsFor(lesson);
    const total = cards.length + 1; // + finish card
    const i = Math.min(LC.i, total - 1);
    const onFinish = i === cards.length;
    const card = cards[i];
    const body = onFinish ? finishCard(lesson) : RENDER[card.type](card, i, lesson);
    const canNext = onFinish ? false : isComplete(card, i);
    return `
      <header class="lc-top">
        <a class="lc-close" href="#learn" aria-label="Back to all actions">✕</a>
        <div class="lc-bar" role="progressbar" aria-label="Progress" aria-valuemin="1" aria-valuemax="${total}" aria-valuenow="${i + 1}"><div class="lc-bar-fill" style="width:${(i + 1) / total * 100}%"></div></div>
        <span class="lc-count">${i + 1}/${total}</span>
      </header>
      <section class="lc-card ${LC.anim} type-${onFinish ? 'finish' : card.type}" aria-live="polite">${body}</section>
      <footer class="lc-nav">
        <button type="button" class="btn ghost" id="lc-back" ${i === 0 ? 'disabled' : ''}>← Back</button>
        ${onFinish ? '' : `<button type="button" class="btn primary" id="lc-next" ${canNext ? '' : 'disabled'}>${i === 0 ? 'Start' : i === cards.length - 1 ? 'Finish' : 'Next'} →</button>`}
      </footer>`;
  }

  function screen(lesson) {
    if (LC.id !== lesson.id) { LC.id = lesson.id; LC.i = 0; LC.answers = {}; LC.anim = ''; LC.confetti = false; }
    return `<article class="lc tone-${lesson.tone}" data-lesson="${esc(lesson.id)}">${inner(lesson)}</article>`;
  }

  function go(lesson, delta) {
    const total = cardsFor(lesson).length + 1;
    const next = Math.max(0, Math.min(total - 1, LC.i + delta));
    if (next === LC.i) return;
    LC.anim = delta > 0 ? 'slide-next' : 'slide-back';
    LC.i = next;
    redraw(lesson);
  }

  function redraw(lesson) {
    const root = $('.lc');
    if (!root) return;
    root.innerHTML = inner(lesson);
    LC.anim = ''; // animate only when moving between cards, not when answering
    wire(lesson);
  }

  function wire(lesson) {
    const root = $('.lc');
    const cards = cardsFor(lesson);
    const i = Math.min(LC.i, cards.length);
    const card = cards[i];
    const ans = () => (LC.answers[i] = LC.answers[i] || (card.type === 'quiz' ? { tried: [] } : card.type === 'build' ? { picked: [], msg: '' } : card.type === 'tool' ? { vals: toolInit(lesson.id), saved: false } : {}));

    $('#lc-back')?.addEventListener('click', () => go(lesson, -1));
    $('#lc-next')?.addEventListener('click', () => go(lesson, +1));

    root.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
      const a = ans(), k = Number(b.dataset.pick);
      if (a.ok) return;
      if (card.options[k].ok) a.ok = true;
      if (!a.tried.includes(k)) a.tried.push(k);
      redraw(lesson);
    }));

    root.querySelector('[data-reveal]')?.addEventListener('click', () => { ans().revealed = true; redraw(lesson); });

    root.querySelectorAll('[data-build]').forEach(b => b.addEventListener('click', () => {
      const a = ans(), k = Number(b.dataset.build), it = card.items[k];
      if (it.ok) { if (!a.picked.includes(k)) a.picked.push(k); a.msg = ''; }
      else a.msg = it.why;
      redraw(lesson);
      if (!it.ok) { // little shake on the wrong chip
        const wrong = $(`[data-build="${k}"]`);
        wrong?.classList.add('shake');
      }
    }));

    root.querySelectorAll('[data-pledge]').forEach(b => b.addEventListener('click', () => {
      const k = Number(b.dataset.pledge);
      ans().choice = k;
      writePledge(lesson.id, card.options[k]);
      redraw(lesson);
    }));

    if (card && card.type === 'tool') {
      const a = ans(), T = TOOLS[lesson.id];
      root.querySelectorAll('[data-tf]').forEach(b => b.addEventListener('click', () => {
        const f = T.fields.find(x => x.id === b.dataset.tf), val = b.dataset.tv;
        if (f.type === 'multi') {
          const next = a.vals[f.id].includes(val) ? a.vals[f.id].filter(x => x !== val) : [...a.vals[f.id], val];
          a.vals[f.id] = next.length ? next : [val]; // keep at least one
        } else a.vals[f.id] = val;
        a.saved = false;
        redraw(lesson);
      }));
      root.querySelectorAll('[data-tin]').forEach(input => input.addEventListener('input', () => {
        a.vals[input.dataset.tin] = input.value || a.vals[input.dataset.tin];
        a.saved = false;
        $('#plan-preview').innerHTML = planHtml(planOf(lesson.id, a.vals));
        $('[data-tsave]').textContent = 'Save my plan';
      }));
      root.querySelector('[data-tsave]').addEventListener('click', () => {
        writeJson(PLAN_KEY, lesson.id, a.vals);
        writePledge(lesson.id, planOf(lesson.id, a.vals).summary);
        a.saved = true;
        redraw(lesson);
        toast('Plan saved on this device.');
      });
      root.querySelector('[data-tcopy]').addEventListener('click', async () => {
        const text = planText(planOf(lesson.id, a.vals));
        try { await navigator.clipboard.writeText(text); toast('Plan copied. Paste it anywhere.'); }
        catch { toast('Couldn’t copy. Try Print instead.'); }
      });
      root.querySelector('[data-tprint]').addEventListener('click', () => printPlan(planOf(lesson.id, a.vals)));
    }

    root.querySelectorAll('[data-fb]').forEach(b => b.addEventListener('click', () => { writeJson(FB_KEY, lesson.id, b.dataset.fb); redraw(lesson); }));

    root.querySelector('[data-complete]')?.addEventListener('click', () => {
      if (!isDone(lesson.id)) state.completed = [...state.completed, lesson.id];
      save();
      LC.confetti = true;
      redraw(lesson);
      toast(`Nice! ${doneCount()} of ${LESSONS.length} actions tried.`);
    });
    root.querySelector('[data-uncomplete]')?.addEventListener('click', () => {
      state.completed = state.completed.filter(id => id !== lesson.id);
      save();
      LC.confetti = false;
      redraw(lesson);
    });
  }

  function bind(lesson) {
    wire(lesson);
    if (keysBound) return;
    keysBound = true;
    // Arrow keys move between cards (only while a lesson is open)
    document.addEventListener('keydown', event => {
      const root = $('.lc');
      if (!root || event.target.closest?.('input, textarea, select')) return;
      const lesson = LESSONS.find(l => l.id === root.dataset.lesson);
      if (!lesson) return;
      if (event.key === 'ArrowRight' && !$('#lc-next')?.disabled && $('#lc-next')) go(lesson, +1);
      if (event.key === 'ArrowLeft') go(lesson, -1);
    });
  }

  window.PaalLearn = { has, screen, bind, themed, rename, ratingHtml, controls, attrs, findText, cover: id => COVERS[id] || null, count: id => (CARDS[id] || []).length + 1 };
})();
