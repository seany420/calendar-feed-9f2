// Question template, score dimensions, subgenres, clinical lenses, and voice rules.
// Everything here is a default. Questions and voice rules are editable in Settings.
window.HL = window.HL || {};

HL.DEFAULT_QUESTIONS = [
  { id: 'gut', label: 'Gut check', prompt: 'Where did this land in your body, and when? Start with the first physical reaction you remember.' },
  { id: 'context', label: 'Viewing context', prompt: 'Where, when, with whom, and what state were you in going in? Tired, wired, grieving, numb?' },
  { id: 'premise', label: 'The setup', prompt: 'Spoiler-light setup for someone who hasn\'t seen it. 2 or 3 sentences.' },
  { id: 'monster', label: 'The monster, really', prompt: 'What is the threat standing in for? Name it in plain language.' },
  { id: 'scene', label: 'The scene', prompt: 'Which moment did the most work on you, and how did the film pull it off?' },
  { id: 'coping', label: 'Who copes, who breaks', prompt: 'Track the defenses: denial, avoidance, hypervigilance, gallows humor, bargaining. Who adapts and who collapses?' },
  { id: 'burnout', label: 'Burnout read', prompt: 'Where do you see exhaustion, cynicism and detachment, or a collapsed sense of efficacy? Who is running on empty, and what keeps them running?' },
  { id: 'system', label: 'The system', prompt: 'What family, institution, job, or structure fails these people? Who benefits from it staying broken?' },
  { id: 'nihilism', label: 'Optimistic nihilism', prompt: 'This film\'s universe doesn\'t care. What do the characters build, protect, or enjoy anyway? Does the film let that count?' },
  { id: 'room', label: 'In the room', prompt: 'If one of these characters walked into your clinic, what would you notice first? What would you say in the first 5 minutes?' },
  { id: 'craft', label: 'Craft', prompt: 'What works and what doesn\'t: sound, pacing, performances, effects, the ending.' },
  { id: 'takeaway', label: 'Take it home', prompt: 'What can a reader or listener carry into their own week from this film?' },
  { id: 'verdict', label: 'Verdict', prompt: 'One line. The pull quote.' },
  { id: 'warnings', label: 'Who should watch', prompt: 'Who should watch, who should skip, and what content notes matter?' }
];

HL.DEFAULT_SCORES = [
  { id: 'dread', label: 'Dread' },
  { id: 'craft', label: 'Craft' },
  { id: 'burnout', label: 'Burnout relevance' },
  { id: 'nihilism', label: 'Nihilism quotient' },
  { id: 'rewatch', label: 'Rewatchability' }
];

HL.SUBGENRES = {
  'supernatural': 'Supernatural', 'slasher': 'Slasher', 'folk': 'Folk horror', 'body': 'Body horror',
  'cosmic': 'Cosmic horror', 'psychological': 'Psychological', 'creature': 'Creature feature',
  'zombie': 'Zombie', 'vampire': 'Vampire', 'werewolf': 'Werewolf', 'possession': 'Possession',
  'haunted-house': 'Haunted house', 'found-footage': 'Found footage', 'sci-fi': 'Sci-fi horror',
  'comedy': 'Horror comedy', 'giallo': 'Giallo', 'survival': 'Survival', 'home-invasion': 'Home invasion',
  'witchcraft': 'Witchcraft', 'cannibal': 'Cannibal', 'anthology': 'Anthology', 'social': 'Social horror',
  'gothic': 'Gothic', 'satanic': 'Satanic / occult', 'surreal': 'Surreal', 'exploitation': 'Exploitation',
  'animated': 'Animated'
};

HL.PIPELINE = {
  none: 'Not started',
  notes: 'Notes in progress',
  draft: 'Drafted',
  published: 'Published'
};

// Clinical and philosophical lenses. Tag a film with a lens and its prompts appear on the film page.
HL.LENSES = [
  {
    id: 'burnout', name: 'Burnout',
    blurb: 'Maslach\'s model: emotional exhaustion, depersonalization (cynicism, detachment), and a shrinking sense of accomplishment. Horror loves a protagonist who keeps working after the work has stopped making sense.',
    prompts: [
      'Who is depleted before the threat even arrives?',
      'Where does detachment show up as a survival skill, and where does it cost someone?',
      'Is the burnout individual, or is the setting itself a burnout machine?'
    ],
    refs: ['Maslach, C., & Leiter, M. P. (2016). Understanding the burnout experience. World Psychiatry, 15(2), 103-111.']
  },
  {
    id: 'optimistic-nihilism', name: 'Optimistic nihilism',
    blurb: 'No inherent meaning, so the meaning you make is yours. Cosmic indifference as relief instead of threat.',
    prompts: [
      'Does the film treat indifference as horror, or as freedom?',
      'What small, chosen meaning survives the ending?',
      'Where does a character stop asking "why" and start asking "what now"?'
    ],
    refs: ['Camus, A. (1942). The myth of Sisyphus.', 'Yalom, I. D. (1980). Existential psychotherapy. Basic Books.']
  },
  {
    id: 'existential', name: 'Existential givens',
    blurb: 'Yalom\'s ultimate concerns: death, freedom, isolation, meaninglessness. Most horror picks one and leans on it hard.',
    prompts: [
      'Which given is this film really about?',
      'How do characters defend against it, and does the defense hold?'
    ],
    refs: ['Yalom, I. D. (1980). Existential psychotherapy. Basic Books.']
  },
  {
    id: 'terror-management', name: 'Terror management',
    blurb: 'Death awareness drives us toward worldviews, self-esteem, and belonging as buffers. Horror strips the buffers and watches.',
    prompts: [
      'Which cultural buffer does the film attack: religion, family, nation, career?',
      'Do characters cling harder to their worldview as death gets closer?'
    ],
    refs: ['Becker, E. (1973). The denial of death. Free Press.', 'Solomon, S., Greenberg, J., & Pyszczynski, T. (2015). The worm at the core. Random House.']
  },
  {
    id: 'grief', name: 'Grief & ambiguous loss',
    blurb: 'Loss without closure, loss that won\'t stay buried. Half of modern horror is a grief film wearing a mask.',
    prompts: [
      'Is the haunting the grief, or what the grief is hiding?',
      'Where is the loss ambiguous: physically gone but psychologically present, or the reverse?'
    ],
    refs: ['Boss, P. (1999). Ambiguous loss. Harvard University Press.']
  },
  {
    id: 'trauma', name: 'Trauma & inheritance',
    blurb: 'Intrusion, avoidance, hyperarousal, and the stuff families hand down without naming.',
    prompts: [
      'What does the film get right (or wrong) about how trauma replays?',
      'What gets passed down, and who finally names it?'
    ],
    refs: ['van der Kolk, B. (2014). The body keeps the score. Viking.']
  },
  {
    id: 'moral-injury', name: 'Moral injury',
    blurb: 'The wound of doing, failing to prevent, or witnessing something that violates your own moral code. Different from fear. Closer to shame.',
    prompts: [
      'Who has to act against their own values to survive?',
      'Does the film let them carry it, or does it look away?'
    ],
    refs: ['Litz, B. T., et al. (2009). Moral injury and moral repair in war veterans. Clinical Psychology Review, 29(8), 695-706.']
  },
  {
    id: 'caregiver', name: 'Caregiver fatigue',
    blurb: 'Compassion fatigue, the parent or partner or clinician who keeps giving past empty.',
    prompts: [
      'Who is caring for whom, and at what cost?',
      'Where does love turn into obligation, and obligation into resentment?'
    ],
    refs: ['Figley, C. R. (Ed.). (1995). Compassion fatigue. Brunner/Mazel.']
  },
  {
    id: 'family-systems', name: 'Family systems',
    blurb: 'Roles, triangles, secrets, the identified patient. The family as the haunted house.',
    prompts: [
      'Who is the identified patient, and what does that role protect?',
      'What rule does this family never say out loud?'
    ],
    refs: ['Bowen, M. (1978). Family therapy in clinical practice. Jason Aronson.']
  },
  {
    id: 'anxiety', name: 'Anxiety & hypervigilance',
    blurb: 'Threat detection without an off switch. Intolerance of uncertainty. The film as an exposure exercise.',
    prompts: [
      'Is the character\'s vigilance accurate or excessive? Does the film reward it?',
      'How does the film manipulate your own uncertainty?'
    ],
    refs: []
  },
  {
    id: 'isolation', name: 'Isolation & loneliness',
    blurb: 'Cut off by geography, illness, stigma, or a phone with no signal.',
    prompts: [
      'What isolates them, and what would connection have changed?'
    ],
    refs: []
  },
  {
    id: 'body', name: 'The body & medicine',
    blurb: 'Illness, aging, pregnancy, disability, medical systems, bodily autonomy.',
    prompts: [
      'Whose body is out of their control, and who is in control of it instead?',
      'What does the film say about the people paid to care for bodies?'
    ],
    refs: []
  },
  {
    id: 'work', name: 'Work & capitalism',
    blurb: 'The job, the grind, the company town, the boss who is literally a monster.',
    prompts: [
      'What is being extracted from these people?',
      'Could anyone in this film afford to leave?'
    ],
    refs: []
  },
  {
    id: 'disaster', name: 'Disaster & displacement',
    blurb: 'Collective trauma, evacuation, survivor guilt, the town that doesn\'t come back the same.',
    prompts: [
      'What does the film understand about losing a place, not just people?',
      'Who gets to rebuild, and who gets left in the ash?'
    ],
    refs: []
  },
  {
    id: 'addiction', name: 'Addiction & compulsion',
    blurb: 'Craving, relapse, the thing you keep returning to even as it eats you.',
    prompts: ['What is the substance or compulsion standing in for?'],
    refs: []
  },
  {
    id: 'faith', name: 'Faith & scrupulosity',
    blurb: 'Religion as comfort, as control, as obsessive doubt.',
    prompts: ['Does belief protect anyone here, or make them easier to hurt?'],
    refs: []
  },
  {
    id: 'recreational-fear', name: 'Why we watch',
    blurb: 'Horror as threat simulation and rehearsal. Fans and the morbidly curious showed more resilience early in COVID. Benign masochism: enjoying negative feelings in a safe frame.',
    prompts: [
      'What did this film let you rehearse?',
      'Did you leave regulated or dysregulated, and why?'
    ],
    refs: [
      'Scrivner, C., Johnson, J. A., Kjeldgaard-Christiansen, J., & Clasen, M. (2021). Pandemic practice: Horror fans and morbidly curious individuals are more psychologically resilient during the COVID-19 pandemic. Personality and Individual Differences, 168, 110397.',
      'Clasen, M. (2017). Why horror seduces. Oxford University Press.',
      'Rozin, P., Guillot, L., Fincher, K., Rozin, A., & Tsukayama, E. (2013). Glad to be sad, and other examples of benign masochism. Judgment and Decision Making, 8(4), 439-447.'
    ]
  }
];

HL.DEFAULT_VOICE = {
  bannedWords: 'delve, realm, harness, unlock, tapestry, crucial, pivotal, leverage, robust, foster, showcase, elevate, empower, seamless, testament, landscape, intricate, meticulous, underscore, transformative, unprecedented, holistic, enduring, interplay',
  bannedPhrases: "it's worth noting, in order to, furthermore, moreover, that said, at the end of the day, ultimately, in today's world, serves as",
  checkEmDash: true,
  checkParallelism: true,
  checkContractions: true,
  checkNumbers: true,
  checkParagraphs: true,
  guide: [
    'Never use em dashes. Use commas, periods, colons, or parentheses.',
    'Never use negative parallelisms ("it\'s not X, it\'s Y", "not just X but Y", "the question isn\'t X"). Delete the negated framing and state the claim.',
    'Open in a specific moment, room, or body. The reader should be somewhere physical by sentence 2.',
    'Short paragraphs, 1 to 3 sentences. Vary sentence length hard.',
    'Numbers as digits. Contractions always. Say "is," not "serves as" or "represents." Don\'t list exactly 3 things.',
    'Take a stance and don\'t hedge it, but use "maybe," "I think," and "I don\'t know" where they\'re honest.',
    'When criticizing a group, put yourself inside the criticism.',
    'End on a concrete image or a blunt binary. Never a summary, never a moral.'
  ].join('\n')
};
