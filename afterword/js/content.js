// All reading material, exercises, and story prompts.
// Plain data so it can be edited without touching app logic.

export const LEARN = [
  {
    id: 'models',
    title: 'How grief works',
    blurb: 'The working models clinicians use, and what each one is good for.',
    sections: [
      {
        h: 'The 5 stages, and why to hold them loosely',
        p: [
          'Elisabeth Kübler-Ross published the 5 stages in 1969. She built them from interviews with dying patients about their own deaths. Bereaved people got handed the model later.',
          'Research since then has found no fixed sequence. People skip stages, repeat them, feel 4 at once on a Tuesday. Keep the words if they help you name a day. Drop the staircase.',
        ],
      },
      {
        h: 'Dual Process Model (Stroebe and Schut, 1999)',
        p: [
          'Grieving people move between 2 kinds of work. Loss-oriented: crying, remembering, looking at photos, yearning. Restoration-oriented: paying the bills they used to pay, learning to cook for 1, going back to work, laughing at something.',
          'The movement between them is called oscillation, and it is the healthy part. Time away from the pain is a working component of grief. Trouble tends to show up when someone is stuck on one side for a long stretch.',
          'This is the model the daily check-in in this app is built on.',
        ],
      },
      {
        h: "Worden's 4 tasks",
        p: [
          'J. William Worden describes mourning as work with 4 tasks: accept the reality of the loss, process the pain, adjust to a world without the person, and find a lasting connection with them while you go on living.',
          'Tasks, because they take effort and can be returned to. They run in any order, and most people circle back through each of them many times.',
        ],
      },
      {
        h: 'Continuing bonds (Klass, Silverman, Nickman, 1996)',
        p: [
          'For most of the 1900s, Western clinicians taught that healthy grief ends in detachment. Then researchers looked at what bereaved people do in practice. They talk to the dead. They keep the jacket. They ask what Dad would have said.',
          'The relationship continues in a changed form. For most people that bond is a comfort and a source of guidance. It gets complicated when the bond is the only place a person lives.',
        ],
      },
      {
        h: 'Meaning reconstruction (Neimeyer)',
        p: [
          'A major loss can break the story you were living inside: who you are, how the world works, what was supposed to happen next. Robert Neimeyer treats grieving as rebuilding that story.',
          'The research tracks 3 threads: making sense of the loss, finding anything of value in the aftermath, and noticing how your identity has shifted. Struggling to make any sense of a death is one of the stronger predictors of prolonged grief.',
        ],
      },
      {
        h: 'Resilience is common (Bonanno)',
        p: [
          'George Bonanno followed bereaved people over years. The most common path, in roughly half of them or more, was resilience: real sadness, with steady functioning underneath. Others recovered gradually over 1 to 2 years. A smaller group, around 1 in 10, stayed in high distress.',
          'Doing okay after a death is an ordinary outcome. It says nothing about how much you loved them.',
        ],
      },
      {
        h: 'Growing around grief (Tonkin, 1996)',
        p: [
          'Lois Tonkin drew grief as a ball inside a jar. People expect the ball to shrink. Her clients described something else: the ball stayed the same size and the jar got bigger. Life grew around it.',
        ],
      },
      {
        h: 'The grieving brain (O\'Connor)',
        p: [
          'Mary-Frances O\'Connor studies bereavement with neuroimaging. Her account: attachment wires a person into your brain as someone who is always somewhere and will always come back. Death contradicts that map, and the brain has to learn the absence through repeated lived experience.',
          'This is why you can know they\'re gone and still reach for your phone to text them. Knowledge updates fast. Prediction updates slowly.',
        ],
      },
    ],
    talk: 'the main clinical models of grief (dual process, Worden, continuing bonds, meaning reconstruction, Bonanno) and which ones fit their experience',
  },
  {
    id: 'kinds',
    title: 'Kinds of grief',
    blurb: 'Names for different losses. A name can make a thing easier to carry.',
    sections: [
      { h: 'Acute and integrated grief', p: [
        'Acute grief is the early period: waves of yearning, disbelief, trouble concentrating, a body that feels wrong. Integrated grief is what it becomes for most people. The loss is still real and still hurts, and it has a place in your life instead of being the whole of it.',
      ] },
      { h: 'Anticipatory grief', p: [
        'Grief that starts before the death: during a terminal diagnosis, dementia, a long decline. You mourn the future, the person they were, and the role you had. It can sit right beside hope and caregiving exhaustion, and it rarely makes the death itself hurt less.',
      ] },
      { h: 'Disenfranchised grief (Doka, 1989)', p: [
        'Grief that the people around you don\'t recognize or give you permission for. An ex. A miscarriage. A patient. A pet. An affair partner. A parent you were estranged from. A death by overdose or suicide that people go quiet about.',
        'The loss is real and the casseroles never come. Naming it as disenfranchised is often the first relief.',
      ] },
      { h: 'Ambiguous loss (Boss)', p: [
        'Pauline Boss describes 2 types. Physically gone and psychologically present: a missing person, a deployment, an estrangement. Physically present and psychologically gone: dementia, addiction, severe brain injury.',
        'There\'s no body, no ritual, no clear ending. Boss\'s guidance is to stop waiting for closure and practice holding 2 truths at once.',
      ] },
      { h: 'Prolonged grief', p: [
        'Acute grief that stays at full intensity for a year or more and blocks daily functioning. It affects about 1 in 10 bereaved people and has its own treatments. There\'s a full section on it in this library.',
      ] },
      { h: 'Traumatic grief', p: [
        'Loss through violence, accident, suicide, overdose, or disaster. Trauma and grief run together: intrusive images of the death, a threat system that won\'t stand down, and yearning on top of it. Often the trauma needs attention before the grief can move.',
      ] },
      { h: 'Suicide loss', p: [
        'Carries extra weight: the search for why, guilt, anger, stigma, sometimes relief after a long illness, and then shame about the relief. Survivors of suicide loss have elevated risk themselves. Peer groups of other loss survivors help a lot of people.',
      ] },
      { h: 'Cumulative grief', p: [
        'Several losses close together, each arriving before the last one has been absorbed. Robert Kastenbaum called it bereavement overload. Common in older adults, in healthcare workers, and in communities hit by disaster or epidemic.',
      ] },
      { h: 'Collective grief and loss of place', p: [
        'Grief shared by a community: a fire, a flood, a shooting, a pandemic. When the loss includes the place itself, philosopher Glenn Albrecht\'s word is solastalgia: homesickness for a home that changed or burned while you were still attached to it.',
        'A whole town can grieve the same streets while each person grieves a different house.',
      ] },
      { h: 'Non-death loss and chronic sorrow', p: [
        'Divorce, infertility, a diagnosis, a career, a faith, a version of yourself. Simon Olshansky described chronic sorrow in 1962 in parents of children with disabilities: grief that returns at every milestone because the loss keeps unfolding.',
      ] },
      { h: 'Secondary losses', p: [
        'Everything the death takes with it. Income. The house. Your role as a caregiver. The friends who were really their friends. The person who remembered your childhood. These often land months later and catch people off guard.',
      ] },
      { h: 'Absent, delayed, and masked grief', p: [
        'Older textbooks treated little visible grief as a problem that would surface later. Bonanno\'s data mostly found resilient people. Grief can still show up sideways, as irritability, overwork, physical symptoms, or drinking, and that\'s worth noticing without assuming it.',
      ] },
      { h: 'Grief in the helping professions', p: [
        'Clinicians lose patients and then walk into the next room in 4 minutes. That grief is disenfranchised by the schedule and by the idea of professional distance. It accumulates, and it\'s one of the quieter roads into burnout.',
      ] },
    ],
    talk: 'the different kinds of grief and which names fit the losses they are carrying',
  },
  {
    id: 'effects',
    title: 'What grief does to us',
    blurb: 'Body, mind, relationships, identity. Grief is a whole-organism event.',
    sections: [
      { h: 'Body', p: [
        'Grief is physical. Tight chest, hollow stomach, a lump in the throat, heavy limbs, sighing, exhaustion that sleep doesn\'t fix. Appetite drops or surges. Sleep fragments.',
        'The stress system runs hot: cortisol rises, inflammation rises, immune function dips. One study found heart attack risk about 21 times higher in the 24 hours after the death of someone close, falling steadily over the following weeks. Takotsubo cardiomyopathy, the stunned heart, is a real diagnosis.',
        'Bereaved spouses have higher mortality in the first months. Take your own medical symptoms seriously in the first year. Go to the appointment.',
      ] },
      { h: 'Thinking', p: [
        'Grief brain: poor concentration, lost words, missed exits, reading the same paragraph 5 times. Working memory is busy with the loss. This usually eases over months.',
        'Also common: replaying the last days, what-ifs, searching for the person in crowds, sensing their presence, hearing their voice. Between a third and a half of bereaved people report these experiences. They\'re typically benign.',
      ] },
      { h: 'Emotion', p: [
        'Sadness and yearning, and also anger, guilt, anxiety, relief, numbness, envy of intact families, and sudden laughter. C.S. Lewis opened A Grief Observed with it: "No one ever told me that grief felt so like fear."',
        'Emotions come in waves, often set off by small things: a song in a grocery store, their handwriting on a list. The waves space out over time. They don\'t follow a calendar.',
      ] },
      { h: 'Relationships', p: [
        'People disappear. Others say the wrong thing with total confidence. Families grieve the same person in different ways and on different schedules, and read each other\'s style as not caring.',
        'Loneliness in grief is specific: you miss one person, and company from anyone else can make it sharper.',
      ] },
      { h: 'Identity and meaning', p: [
        'Roles go with the person: spouse, daughter, caregiver, the one who was known in a particular way. People ask who they are now. Beliefs about fairness, safety, God, or the future can crack.',
        'This is where the philosophy shelf of this app earns its place.',
      ] },
      { h: 'Grief and depression', p: [
        'They overlap and they\'re different. In grief, the pain centers on the missing person, comes in waves, and self-worth usually stays intact. In major depression, the low mood is pervasive, pleasure flattens across the board, and people feel worthless.',
        'Both can be present. Depression on top of grief deserves its own treatment.',
      ] },
    ],
    talk: 'how grief is showing up in their body, thinking, relationships, and sense of identity',
  },
  {
    id: 'pgd',
    title: 'When grief gets stuck',
    blurb: 'Prolonged grief disorder: what it is, who gets it, what helps.',
    sections: [
      { h: 'The diagnosis', p: [
        'Prolonged grief disorder entered the DSM-5-TR in 2022 and the ICD-11 in 2019. In US billing it\'s ICD-10-CM F43.81.',
        'The DSM picture: the death was at least 12 months ago (6 for children and teens). Persistent yearning or preoccupation with the person, most days. Plus several of these: feeling part of you died, disbelief, avoiding reminders, intense emotional pain, trouble re-engaging with life, numbness, feeling life is meaningless, intense loneliness. And it impairs functioning beyond what your culture would expect.',
        'ICD-11 uses a 6-month threshold.',
      ] },
      { h: 'How common', p: [
        'About 1 in 10 bereaved adults after a natural death. Rates run much higher after violent or sudden death, the death of a child, or the death of a partner.',
      ] },
      { h: 'Risk factors', p: [
        'A very close or dependent relationship. Sudden or violent death. Prior depression, anxiety, or trauma. Insecure attachment. Low social support. Being the caregiver. Feeling unable to make sense of the death. Losing a child.',
      ] },
      { h: 'What keeps it stuck', p: [
        'Katherine Shear\'s model names the usual derailers: heavy avoidance of reminders, endless counterfactuals (if only, what if), and beliefs like "if I feel better I\'m abandoning them."',
        'Boelen\'s CBT model adds a loss that never got filed into autobiographical memory, so it keeps feeling like it just happened.',
      ] },
      { h: 'The debate', p: [
        'Critics worry the diagnosis medicalizes love and puts a clock on mourning. Supporters point out that a specific, treatable condition was going untreated because it had no name.',
        'Both things can be true. The diagnosis is a tool for getting the stuck 10 percent to effective care. It describes nothing about the other 90.',
      ] },
      { h: 'When to get an evaluation', p: [
        'It\'s been a year and the intensity hasn\'t moved. You can\'t function at work or at home. You\'re avoiding large parts of your life. You\'re using alcohol or drugs to get through. You think about dying to be with them or to stop the pain.',
        'That last one is a today call. 988 in the US, any hour.',
      ] },
    ],
    talk: 'prolonged grief disorder, how it differs from typical grief, and whether any of it sounds familiar',
  },
  {
    id: 'therapy',
    title: 'Psychotherapy for grief',
    blurb: 'What the treatments are, what they involve, and what the evidence says.',
    sections: [
      { h: 'First, who needs therapy', p: [
        'Most grieving people get through with friends, family, time, and ritual. A 2008 meta-analysis (Currier, Neimeyer, Berman) found that therapy offered to every bereaved person shows little effect, and therapy for people with significant, persistent difficulty works well.',
        'Wanting support is reason enough to seek it. Needing treatment is a narrower thing.',
      ] },
      { h: 'Prolonged Grief Treatment (Shear)', p: [
        'Formerly Complicated Grief Treatment. 16 sessions built on the Dual Process Model, with the strongest trial record in the field. In a 2014 trial in older adults, about 70 percent responded, compared with about 32 percent in interpersonal therapy.',
        'Core parts: a grief monitoring diary, imaginal revisiting (telling the story of the death aloud with eyes closed, recording it, listening back), situational revisiting (approaching avoided places and things in steps), an imaginal conversation with the person, memory work on both the good and the difficult, and aspirational goals for your own life.',
      ] },
      { h: 'CBT for prolonged grief (Boelen, Bryant)', p: [
        'Targets the 3 maintaining processes: a poorly integrated loss memory, unhelpful beliefs, and avoidance. Uses exposure to the story and to reminders, cognitive restructuring, and behavioral activation. Bryant\'s 2014 trial found CBT with exposure beat CBT without it.',
      ] },
      { h: 'Acceptance and Commitment Therapy', p: [
        'Makes room for the pain instead of fighting it, loosens the grip of thoughts like "I should be over this," and turns attention toward values: what kind of partner, parent, friend, or clinician you want to be with this loss on board. The evidence base for grief is smaller and growing.',
      ] },
      { h: 'Meaning-Centered Grief Therapy', p: [
        'Developed by Lichtenthal and Breitbart, first for bereaved parents. Draws on Frankl. Works on sources of meaning, the story of the loss, identity, and legacy.',
      ] },
      { h: 'Narrative and constructivist approaches', p: [
        'Neimeyer\'s meaning reconstruction work and Rynearson\'s restorative retelling for violent death. The task is to tell the story of the death in a way you can live with, and to restore the story of the life so the dying stops being the only chapter.',
      ] },
      { h: 'Interpersonal therapy', p: [
        'Grief is 1 of IPT\'s 4 focus areas. It works on mourning and on rebuilding relationships and roles. Helpful when depression is the main picture.',
      ] },
      { h: 'EMDR and trauma-focused work', p: [
        'When the death was traumatic, or the images of it won\'t stop, trauma treatment often comes first or alongside. EMDR, prolonged exposure, and cognitive processing therapy all have a place here. The grief-specific research on EMDR is thinner than the PTSD research.',
      ] },
      { h: 'Groups, family work, and peers', p: [
        'Support groups reduce isolation, especially loss-specific ones: suicide loss, child loss, overdose loss, widowed people. Kissane\'s Family Focused Grief Therapy works with families at risk during palliative care and after.',
        'Peer support has modest trial evidence and enormous loyalty from the people who use it.',
      ] },
      { h: 'Medication', p: [
        'No medication treats grief itself. In Shear\'s 2016 trial, citalopram added nothing for grief symptoms and helped with co-occurring depression when paired with grief therapy. Antidepressants are for the depression or anxiety that can ride along.',
        'Benzodiazepines in early grief are common and poorly supported.',
      ] },
      { h: 'Where this app fits', p: [
        'This is a companion and a notebook. It can listen, teach, and walk you through exercises drawn from these treatments. It can\'t assess you, hold risk, or be a relationship with another nervous system in the room.',
      ] },
    ],
    talk: 'the different psychotherapies for grief and what each would involve for them',
  },
  {
    id: 'philosophy',
    title: 'Philosophy for the bereaved',
    blurb: 'Optimistic nihilism, the Stoics, the existentialists, the Buddhists.',
    sections: [
      { h: 'Optimistic nihilism', p: [
        'Start with the cold part. The universe is about 13.8 billion years old and has no opinion about you. No cosmic ledger. Nothing was owed, and their death balanced nothing.',
        'Now the turn. If meaning isn\'t issued from above, then every bit of it that existed between you and them was made by the 2 of you, by hand, on a rock, for free. Nobody can audit it or take it back.',
        'It also retires the question "why did this happen to them," in the sense of what they did to deserve it. Nothing. It happened. You get to stop litigating.',
      ] },
      { h: 'The Stoics', p: [
        'Seneca wrote whole letters of consolation, and he told the grieving to weep. He also asked them to notice when grief had turned into a performance of loyalty. His test: would the person you lost want this for you?',
        'Epictetus taught people to remember, while kissing a child goodnight, that the child is mortal. It sounds brutal. The aim was to love with eyes open, as someone holding a thing on loan.',
        'Marcus Aurelius kept returning to the view from above: all of it, the whole city, seen from high enough that your own life is 1 small lit window.',
      ] },
      { h: 'Epicurus', p: [
        'His argument: where death is, I am gone. Where I am, death hasn\'t arrived. So death is nothing to the one who dies. It doesn\'t help with missing them. It can help with the 3 a.m. fear that they\'re suffering somewhere.',
      ] },
      { h: 'Existentialism', p: [
        'Camus said the absurd is the gap between our hunger for meaning and a silent universe, and that the answer is to keep living anyway, in full view of it. Sisyphus walks back down the hill. Camus asks us to imagine him happy.',
        'Viktor Frankl, writing after the camps, held that meaning can be found in work, in love, and in the stance we take toward suffering we can\'t avoid.',
        'Irvin Yalom names 4 givens: death, freedom, isolation, meaninglessness. Grief drags all 4 into the room at once. His idea of rippling is worth keeping: each of us sets off circles of influence that pass through other people for generations, long after our name drops off.',
      ] },
      { h: 'Heidegger and Becker', p: [
        'Heidegger argued we mostly live as though death happens to other people, and that facing our own finitude is what makes a life our own. Someone else\'s death is often what breaks the spell.',
        'Ernest Becker thought most of culture is an elaborate system for denying death. Terror management research has spent 40 years testing it. Grief puts a crack in the denial, which is part of why it\'s so disorienting, and why bereaved people often reorder their priorities.',
      ] },
      { h: 'Buddhism', p: [
        'Kisa Gotami carried her dead son to the Buddha and begged for medicine. He asked for a mustard seed from a house that had never known death. She knocked on every door in the village. She came back with nothing, and with company.',
        'Impermanence is the teaching: everything that arises passes. Clinging is where the extra suffering comes from. Love without the grip is the practice, and nobody finds it easy.',
      ] },
      { h: 'Nietzsche', p: [
        'Amor fati: love of fate. To want nothing to be different, including the losses, because they\'re woven into the only life you had with that person. This is a high bar. Some days it\'s a direction to face, and that\'s plenty.',
      ] },
      { h: 'Relearning the world (Attig)', p: [
        'Philosopher Thomas Attig says grieving is relearning the world: your kitchen, your Sundays, your own name, all of it has to be learned again without them in it. And loving in presence becomes loving in absence. The love keeps a job.',
      ] },
    ],
    talk: 'philosophy and grief: optimistic nihilism, the Stoics, existentialism, Buddhism, and which ideas they find useful or infuriating',
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness and self-compassion',
    blurb: 'Staying in the room with pain without drowning in it.',
    sections: [
      { h: 'What mindfulness does for grief', p: [
        'Mindfulness is paying attention to what\'s here, on purpose, without arguing with it. In grief, that means feeling a wave as a wave: pressure in the chest, heat behind the eyes, a rise, a peak, a fall.',
        'It won\'t make the pain smaller. It can remove the second layer: the fear of the feeling, the fight with it, the story that it will never end.',
      ] },
      { h: 'Pain and suffering', p: [
        'Buddhist teachers talk about 2 arrows. The first is the loss. The second is everything we add: I should be over this, I\'m doing it wrong, I can\'t survive this. The first arrow is non-negotiable. The second one is where there\'s room to work.',
      ] },
      { h: 'Self-compassion (Neff)', p: [
        'Kristin Neff\'s 3 parts: mindfulness (this hurts), common humanity (loss is part of every human life, and others are awake with it tonight), and kindness (what would I say to a friend in this exact spot).',
        'Grieving people are often brutal to themselves about guilt, about things unsaid, about how they\'re coping. Self-compassion has good evidence for lowering that load.',
      ] },
      { h: 'RAIN (Brach)', p: [
        'Recognize what\'s happening. Allow it to be there. Investigate it with interest, especially in the body. Nurture yourself the way you\'d tend someone you love. There\'s a guided version in Practice.',
      ] },
      { h: 'A caution', p: [
        'Sitting still with eyes closed can be too much in acute or traumatic grief. Intrusive images can get louder. Keep your eyes open, keep it short, move your body, or put your attention on sound or on your feet. Stopping is a skillful choice.',
      ] },
    ],
    talk: 'mindfulness and self-compassion in grief, including what has and hasn\'t worked for them',
  },
  {
    id: 'horror',
    title: 'Horror as a lens',
    blurb: 'The genre has been doing grief work in the dark for a long time.',
    sections: [
      { h: 'Why horror', p: [
        'Polite culture gives grief about 2 weeks and a sheet cake. Horror gives it a whole house. The genre says what bereaved people already suspect: something has moved in, the rules have changed, and nobody else can see it.',
      ] },
      { h: 'The ghost story', p: [
        'A haunting is a continuing bond with the volume turned up. The dead stay in the house, move objects, want something. The genre\'s question is the clinical one: is this presence keeping you company or keeping you from living?',
      ] },
      { h: 'Pet Sematary', p: [
        'Stephen King wrote the purest story about refusing Worden\'s first task. Louis Creed can\'t accept the reality of the loss, and he has a way around it. "Sometimes dead is better" is a hard clinical sentence.',
      ] },
      { h: 'The Babadook', p: [
        'A widow\'s unspoken grief becomes a monster that grows the more she denies it. She doesn\'t kill it. She moves it to the basement and feeds it every day. That ending is integrated grief, stated more accurately than most textbooks manage.',
      ] },
      { h: 'Hereditary, Don\'t Look Now, Lake Mungo', p: [
        'Hereditary is family grief with no shared language, each person sealed in a separate room of the same loss. Don\'t Look Now follows a father chasing a small figure in a red coat through Venice, searching behavior made literal. Lake Mungo is about how little we knew the person we\'re mourning.',
      ] },
      { h: 'Using it', p: [
        'Horror offers a safe container: a beginning, an end, a pause button, and a monster with a shape. Some people can approach their grief through a film when they can\'t approach it directly.',
        'Try the exercise called Name the monster in Practice.',
      ] },
    ],
    talk: 'horror films and fiction as a way of looking at grief, and what monster their own grief would be',
  },
  {
    id: 'reading',
    title: 'A short shelf',
    blurb: 'Books worth the time.',
    sections: [
      { h: 'Clinical and scientific', p: [
        'The Grieving Brain, Mary-Frances O\'Connor. The Other Side of Sadness, George Bonanno. Grief Counseling and Grief Therapy, J. William Worden. Ambiguous Loss, Pauline Boss. Continuing Bonds, edited by Klass, Silverman, and Nickman.',
      ] },
      { h: 'Memoir', p: [
        'A Grief Observed, C.S. Lewis. The Year of Magical Thinking, Joan Didion. H Is for Hawk, Helen Macdonald. Crying in H Mart, Michelle Zauner. Notes on Grief, Chimamanda Ngozi Adichie.',
      ] },
      { h: 'Philosophy', p: [
        'Staring at the Sun, Irvin Yalom. Man\'s Search for Meaning, Viktor Frankl. The Myth of Sisyphus, Albert Camus. Seneca\'s consolations to Marcia and to Helvia. The Denial of Death, Ernest Becker. When Things Fall Apart, Pema Chödrön.',
      ] },
      { h: 'For the practical days', p: [
        'It\'s OK That You\'re Not OK, Megan Devine. Bearing the Unbearable, Joanne Cacciatore.',
      ] },
    ],
    talk: 'books about grief they have read or want to read',
  },
];

export const EXERCISE_CATS = [
  { id: 'body', title: 'Steady the body' },
  { id: 'story', title: 'Tell the story' },
  { id: 'bond', title: 'Keep the bond' },
  { id: 'rebuild', title: 'Rebuild' },
  { id: 'meaning', title: 'Meaning and philosophy' },
];

export const EXERCISES = [
  // ---- body
  {
    id: 'breath', cat: 'body', title: 'Paced breathing', mins: 3, pacer: true,
    blurb: 'Slow the exhale and the nervous system follows.',
    why: 'Breathing at about 6 breaths a minute with a longer exhale raises vagal tone and lowers arousal. It works in a parking lot, a bathroom stall, or a funeral home.',
    steps: [
      'Sit or stand. Drop your shoulders.',
      'Breathe in through your nose for 4.',
      'Breathe out slowly for 6, like fogging a mirror with your mouth closed.',
      'Keep going for 3 minutes. Use the pacer if counting is too much.',
    ],
    modes: ['talk'],
    guide: 'Pace the person through 4-count inhales and 6-count exhales for a few minutes, speaking slowly and sparsely, then check how their body feels.',
  },
  {
    id: 'ground', cat: 'body', title: '5-4-3-2-1 grounding', mins: 3,
    blurb: 'For when a wave or an image has taken over.',
    why: 'Naming sensory details pulls attention into the present and gives the threat system something neutral to process.',
    steps: [
      'Name 5 things you can see.',
      'Name 4 things you can touch, and touch them.',
      'Name 3 sounds, 2 smells, and 1 taste.',
      'Say today\'s date and where you are, out loud.',
    ],
    modes: ['talk'],
    guide: 'Lead the 5-4-3-2-1 grounding sequence one sense at a time, letting them answer aloud, then orient them to date and place.',
  },
  {
    id: 'wave', cat: 'body', title: 'Ride the wave', mins: 10,
    blurb: 'Stay with a surge of grief and watch it crest.',
    why: 'Adapted from urge surfing. Waves of acute emotion peak and fall, usually within 20 minutes. Each time you stay through one, your brain learns it\'s survivable, and avoidance loses some pull.',
    steps: [
      'When a wave starts, stop what you\'re doing if you safely can.',
      'Find it in your body. Where is it? How big? Does it have an edge?',
      'Breathe into that spot. Describe it to yourself like a weather report.',
      'Rate it 0 to 10 every couple of minutes. Watch the number move.',
      'When it drops, do 1 small ordinary thing: water, a window, your shoes.',
    ],
    modes: ['talk', 'write'],
    guide: 'Help them track a wave of grief in the body in real time: location, size, intensity 0 to 10, staying present until it eases.',
  },
  {
    id: 'selfcomp', cat: 'body', title: 'Self-compassion break', mins: 5,
    blurb: 'Neff\'s 3 sentences, for the guilty hours.',
    why: 'Self-criticism keeps the threat system switched on. Self-compassion practices have solid evidence for reducing shame and rumination.',
    steps: [
      'Put a hand on your chest or your arm.',
      'Say: this is a moment of grief. This hurts.',
      'Say: grief is part of loving people. Others are awake with this tonight.',
      'Ask: what would I say to a friend in this exact spot? Say that to yourself.',
    ],
    modes: ['talk', 'write'],
    guide: 'Walk them through a self-compassion break: acknowledge the pain, connect it to common humanity, and help them find the words they would offer a friend.',
  },
  {
    id: 'rain', cat: 'body', title: 'RAIN', mins: 10,
    blurb: 'Recognize, allow, investigate, nurture.',
    why: 'A structured way to turn toward a hard feeling. Tara Brach\'s version of a long-standing mindfulness practice.',
    steps: [
      'Recognize: name what\'s here. Guilt. Longing. Rage.',
      'Allow: let it be here for the next few minutes. You don\'t have to like it.',
      'Investigate: where does it live in your body? What does it believe? What does it need?',
      'Nurture: offer that part of you what it needs. A hand, a sentence, permission.',
    ],
    caution: 'Keep your eyes open and keep it short if images of the death tend to intrude.',
    modes: ['talk', 'write'],
    guide: 'Guide the 4 steps of RAIN slowly with one feeling they choose, with plenty of silence.',
  },
  // ---- story
  {
    id: 'letter', cat: 'story', title: 'The unsent letter', mins: 20,
    blurb: 'Say what didn\'t get said.',
    why: 'Directed writing to the person is used in several grief treatments. It gives unfinished business somewhere to go and often surfaces what\'s underneath the guilt or anger.',
    steps: [
      'Start with their name. Write the way you talked to them.',
      'Try these openings: What I miss. What I\'m angry about. What I never told you. What I\'m sorry for. What I want you to know about my life now.',
      'Don\'t edit. Nobody is grading this.',
      'Read it aloud when you\'re done, or record yourself reading it.',
    ],
    modes: ['write', 'record', 'talk'],
    guide: 'Help them compose an unsent letter aloud to the person who died, prompting gently with: what I miss, what I am angry about, what I never said, what I am sorry for, what I want you to know.',
  },
  {
    id: 'retell', cat: 'story', title: 'Tell the story of the death', mins: 20,
    blurb: 'The whole thing, start to finish, out loud.',
    why: 'This is the imaginal revisiting at the center of Prolonged Grief Treatment. Telling the story in order, in a bounded dose, helps the brain file it as something that happened in the past. Repeated tellings usually get less overwhelming.',
    steps: [
      'Pick a start point: when you first knew something was wrong.',
      'Tell it in order, in present tense if you can, for about 10 minutes.',
      'Stop. Rate your distress 0 to 10.',
      'Spend 5 minutes on what came up. What part was hardest?',
      'Then deliberately set it down. Do something ordinary and kind for yourself.',
    ],
    caution: 'This is strong medicine. If the death was violent or you get flashbacks, do this with a therapist. Skip it on days you\'re already flooded.',
    modes: ['record', 'talk'],
    guide: 'Facilitate a bounded imaginal revisiting: invite them to tell the story of the death in order for about 10 minutes while you mostly listen, then check distress 0 to 10, reflect on the hardest part, and help them set the story down and re-orient to the present. Stop early and ground them if distress is very high.',
  },
  {
    id: 'chair', cat: 'story', title: 'Talk to them', mins: 15,
    blurb: 'An imagined conversation, both sides.',
    why: 'Imaginal conversation is part of Prolonged Grief Treatment and comes from chair work. Speaking to the person directly, then answering as them, often brings out a kinder voice than the one guilt has been using.',
    steps: [
      'Picture them somewhere specific. A chair, the truck, the kitchen.',
      'Tell them what you most need to say. Out loud is better.',
      'Ask them a question.',
      'Switch. Answer as them, in their words, the way they\'d really say it.',
      'Go back and forth a few times. End by telling them what you\'re taking with you.',
    ],
    caution: 'The companion will help you do this. It won\'t play the person who died.',
    modes: ['talk', 'record', 'write'],
    guide: 'Facilitate an imaginal conversation: they speak to the person, then answer in that person\'s voice themselves. You coach from the side and never speak as the deceased.',
  },
  {
    id: 'memory', cat: 'story', title: 'One memory, all 5 senses', mins: 10,
    blurb: 'Record a single scene in full detail.',
    why: 'Specific sensory memories are the ones that fade first and matter most later. This is also raw material for anything you write.',
    steps: [
      'Pick 1 small scene. A drive. A meal. A fight. A joke.',
      'Where were you? What time of year? What was the light like?',
      'What did you hear, smell, touch? What were they wearing?',
      'What did they say, in their exact words if you have them?',
      'Record it or write it. Don\'t explain what it means.',
    ],
    modes: ['record', 'write', 'talk'],
    guide: 'Interview them about one specific memory, drawing out sensory detail, setting, dialogue, and small physical specifics, like a good oral historian.',
  },
  {
    id: 'hard', cat: 'story', title: 'The difficult parts', mins: 15,
    blurb: 'The memories that don\'t fit the eulogy.',
    why: 'Real people are complicated, and so are real relationships. Treatment protocols include the hard memories on purpose, because grief for an idealized person tends to stay stuck.',
    steps: [
      'Finish these: What I don\'t miss. What still makes me angry. What I\'d never say at a funeral.',
      'Then: What I understand now that I didn\'t then.',
      'Then: What stays true about them alongside all of this.',
    ],
    modes: ['write', 'talk', 'record'],
    guide: 'Make room for ambivalent and negative memories of the person without judgment, then help them hold those alongside what they valued.',
  },
  // ---- bond
  {
    id: 'bonds', cat: 'bond', title: 'Bond inventory', mins: 15,
    blurb: 'Map the ways they\'re still with you.',
    why: 'From continuing bonds research. Seeing the bond on paper shows which connections comfort you and which ones keep you circling.',
    steps: [
      'List the ways you stay connected: objects, places, habits, phrases, music, food, values, things you do the way they did.',
      'Mark each one: does it leave you steadier or more stuck?',
      'Pick 1 steadying bond to do more of on purpose this week.',
    ],
    modes: ['write', 'talk'],
    guide: 'Help them inventory the ways they stay connected to the person and sort which bonds feel steadying and which feel sticky.',
  },
  {
    id: 'voice', cat: 'bond', title: 'What would they say', mins: 10,
    blurb: 'Borrow their voice for a current problem.',
    why: 'An internalized relationship keeps working as a guide. Putting a present-day question to them makes the bond useful in your life now.',
    steps: [
      'Name something you\'re facing this week.',
      'Ask them about it. Write or say their answer, in their phrasing.',
      'Notice what you already knew they\'d say.',
    ],
    modes: ['write', 'talk'],
    guide: 'Ask what they are facing now and help them imagine, in their own words, what the person would have said about it. Do not voice the deceased yourself.',
  },
  {
    id: 'ritual', cat: 'bond', title: 'Design a ritual', mins: 15,
    blurb: 'Small, repeatable, yours.',
    why: 'Research by Norton and Gino found that personal rituals after loss restore a sense of control and reduce grief intensity, even private ones nobody else sees.',
    steps: [
      'Choose a time: a date, a day of the week, a season.',
      'Choose an action with a start and an end. Light something. Cook their dish. Drive their road. Play the record.',
      'Decide who\'s there. Alone counts.',
      'Do it once and adjust.',
    ],
    modes: ['write', 'talk'],
    guide: 'Help them design a small personal ritual of remembrance with a specific time, action, and ending.',
  },
  {
    id: 'legacy', cat: 'bond', title: 'Legacy project', mins: 20,
    blurb: 'Carry something of theirs forward.',
    why: 'Yalom calls it rippling. Meaning-centered grief therapy works with legacy directly: what did they give you, and where does it go next?',
    steps: [
      'List what they taught you, on purpose or by accident.',
      'List what they cared about.',
      'Pick 1 way to pass something on: a recipe book, a scholarship, a habit you teach your kid, a story you write down.',
      'Name the first 20-minute step.',
    ],
    modes: ['write', 'talk'],
    guide: 'Explore what the person gave them and help them choose one concrete way to carry it forward, down to a first small step.',
  },
  // ---- rebuild
  {
    id: 'dual', cat: 'rebuild', title: 'Dual process check', mins: 10,
    blurb: 'Where did this week go: the loss or the rebuilding?',
    why: 'The Dual Process Model says health is in the back-and-forth. A weekly look shows whether you\'ve been living on one side.',
    steps: [
      'List what you did this week that faced the loss: crying, remembering, visiting, talking about them.',
      'List what faced restoration: tasks, new roles, plans, rest, distraction, fun.',
      'Which list is thin?',
      'Plan 1 thing from the thin side for the next 7 days.',
    ],
    modes: ['write', 'talk'],
    guide: 'Review their past week through the Dual Process Model: loss-oriented time, restoration-oriented time, and where a little more balance might help.',
  },
  {
    id: 'avoid', cat: 'rebuild', title: 'The avoided list', mins: 15,
    blurb: 'Places, things, and people you\'ve been steering around.',
    why: 'Situational revisiting from Prolonged Grief Treatment. Avoidance shrinks your life and keeps reminders charged. Approaching them in graded steps brings the charge down.',
    steps: [
      'List what you avoid: their closet, the hospital road, a song, a restaurant, a friend.',
      'Rate each 0 to 10 for how hard it would be.',
      'Start with something around a 4. Go there or do it. Stay until the distress drops by about half.',
      'Repeat it a few times this week before moving up the list.',
    ],
    caution: 'Some avoidance is fine. You get to keep a few things off the table.',
    modes: ['write', 'talk'],
    guide: 'Help them build a graded list of avoided reminders with 0 to 10 ratings and choose a moderate one to approach this week.',
  },
  {
    id: 'goals', cat: 'rebuild', title: 'If the grief were lighter', mins: 15,
    blurb: 'One question from grief treatment about your own life.',
    why: 'Prolonged Grief Treatment asks this in session 1. It gives the restoration side a direction and often runs straight into the guilt about feeling better, which is worth finding.',
    steps: [
      'If your grief were at a level you could manage, what would you want for yourself?',
      'Write whatever comes, including "nothing" and "that feels disloyal."',
      'Pick 1 thing that\'s yours, apart from them.',
      'What would be a sign, in the next month, that you\'d moved toward it?',
    ],
    modes: ['write', 'talk'],
    guide: 'Ask the aspirational goals question from Prolonged Grief Treatment and explore both the wish and any guilt about wanting something for themselves.',
  },
  {
    id: 'secondary', cat: 'rebuild', title: 'Map the secondary losses', mins: 15,
    blurb: 'Everything else that went with them.',
    why: 'Naming the losses inside the loss explains why you\'re more tired than you think you should be, and turns 1 shapeless weight into several specific ones.',
    steps: [
      'Write their name in the middle of a page.',
      'Around it, write what else you lost: roles, routines, money, plans, touch, a witness to your history, the future you\'d sketched.',
      'Circle the 2 that hurt most right now.',
      'For each: is there anything to do, or is this one to grieve?',
    ],
    modes: ['write', 'talk'],
    guide: 'Help them name the secondary losses that came with the death and sort which call for action and which call for mourning.',
  },
  {
    id: 'dates', cat: 'rebuild', title: 'Plan for the hard date', mins: 15,
    blurb: 'Anniversaries, birthdays, holidays.',
    why: 'Anticipation is often worse than the day. A plan gives you a say in a day that otherwise just happens to you.',
    steps: [
      'Which date is coming?',
      'What do you want from it: company, solitude, a ritual, a normal Tuesday?',
      'Tell 1 person what you need from them.',
      'Make a plan A and a plan B, with permission to cancel both.',
      'Plan something small for the day after.',
    ],
    modes: ['write', 'talk'],
    guide: 'Help them plan for an upcoming anniversary, birthday, or holiday, including what they want, who to tell, and a backup plan.',
  },
  // ---- meaning
  {
    id: 'cosmic', cat: 'meaning', title: 'The long zoom', mins: 10,
    blurb: 'An optimistic nihilism exercise.',
    why: 'Shifting scale is an old contemplative move. From far enough out, the pressure to grieve correctly dissolves, and what\'s left is the plain fact that the 2 of you overlapped at all.',
    steps: [
      'Picture the room you\'re in. Then the building, the town, the coastline.',
      'Pull back to the planet. The sun as 1 of a few hundred billion stars. 13.8 billion years of time.',
      'Find the stretch where their life and yours overlapped. A sliver.',
      'Nothing required it. No rule said you\'d get them.',
      'Come back to the room. What do you want to do with the next hour, given all that?',
    ],
    modes: ['talk', 'write'],
    guide: 'Lead a slow guided zoom from their room out to cosmic scale and back, in the spirit of optimistic nihilism, landing on the unlikeliness of having overlapped with this person at all.',
  },
  {
    id: 'stoic', cat: 'meaning', title: 'On loan', mins: 10,
    blurb: 'A Stoic reframe, used gently.',
    why: 'Seneca and Epictetus treated everything we love as borrowed. For some people this turns "taken from me" into "I had them for 31 years," and gratitude gets some room beside the pain.',
    steps: [
      'Write how long you had them, in years, months, or days.',
      'List what that time contained that you\'d never trade.',
      'Seneca\'s question: would you rather have had this and lost it, or never had it?',
      'Sit with your honest answer, whatever it is.',
    ],
    caution: 'If this lands as "be grateful and stop crying," throw it out. That\'s a misreading of the Stoics and of you.',
    modes: ['write', 'talk'],
    guide: 'Explore the Stoic idea that what we love is on loan, staying alert to whether it comforts them or feels like pressure to stop grieving.',
  },
  {
    id: 'meaningq', cat: 'meaning', title: 'Sense, value, self', mins: 20,
    blurb: 'Neimeyer\'s 3 threads of meaning.',
    why: 'Meaning reconstruction research tracks sense-making, benefit-finding, and identity change. These questions are hard and slow. "I don\'t know" is a complete answer.',
    steps: [
      'Sense: how do you understand this death right now? Has that changed?',
      'Value: has anything come from this that you\'d call worth keeping, even though you\'d hand it back in a second?',
      'Self: how are you different? What do you see that you didn\'t before?',
      'What question about all this is still open?',
    ],
    modes: ['write', 'talk'],
    guide: 'Explore sense-making, benefit-finding, and identity change after the loss, accepting "I don\'t know" and never pushing a silver lining.',
  },
  {
    id: 'monster', cat: 'meaning', title: 'Name the monster', mins: 15,
    blurb: 'Your grief as a creature feature.',
    why: 'Externalizing a problem is a core move in narrative therapy. Giving grief a body and rules makes it something you can be in a relationship with, and horror has the best vocabulary for it.',
    steps: [
      'If your grief were a creature, what is it? Where does it live in the house?',
      'What does it look like? What does it sound like at 3 a.m.?',
      'What are its rules? What makes it bigger? What makes it settle?',
      'What does it want from you?',
      'You\'re not going to kill it. What would feeding it every day look like?',
    ],
    modes: ['write', 'talk', 'record'],
    guide: 'Help them externalize their grief as a horror-film creature with a shape, a location, rules, and wants, then explore what a livable relationship with it would look like.',
  },
  {
    id: 'ripple', cat: 'meaning', title: 'Rippling', mins: 10,
    blurb: 'Trace where they went.',
    why: 'Yalom\'s answer to the fear of oblivion. People persist in the habits, phrases, and choices of others, usually without credit.',
    steps: [
      'Name 5 things you do, say, or believe because of them.',
      'Name someone else who carries a piece of them.',
      'Name something of them you\'ve already passed to another person.',
      'Follow 1 of those forward 50 years. Who\'s doing it then?',
    ],
    modes: ['write', 'talk'],
    guide: 'Help them trace the ways the person\'s influence continues in their own habits, in other people, and forward in time.',
  },
];

export const STORY_PROMPTS = [
  'What did their hands look like?',
  'Tell the story they told at every holiday.',
  'What did their kitchen smell like?',
  'Describe the vehicle they drove and what was on the floor of it.',
  'What was the last ordinary day you had with them?',
  'What\'s something they said so often you can hear it right now?',
  'What did they get wrong, stubbornly, for years?',
  'Tell about a time they embarrassed you.',
  'What did their laugh do to their face?',
  'What were they like when they were angry?',
  'What did they teach you without meaning to?',
  'Describe a meal they made, start to finish.',
  'What music was theirs?',
  'Where did they sit?',
  'What\'s a fight you had that you\'d have again just to hear them?',
  'What did they do when they thought nobody was watching?',
  'Tell about the first time you remember them.',
  'What did they call you?',
  'What scared them?',
  'What would they think of where you live now?',
  'Describe the house or the town, the way it was.',
  'What\'s the story only you know?',
  'What do you want people to get right about them?',
  'What happened on the day they died? Tell it once, in order.',
  'What have you not told anyone about the days after?',
];

export const FOCUSES = [
  { id: 'open', label: 'Just talk', hint: 'An open conversation. Follow their lead completely.' },
  { id: 'hard', label: 'Hard day', hint: 'They are having a hard day. Lead with presence and steadiness before anything else. Go slowly.' },
  { id: 'story', label: 'Tell a story about them', hint: 'They want to tell stories about the person. Be a curious, warm listener and ask for specifics: what things looked like, exact words, small physical details.' },
  { id: 'understand', label: 'Help me understand this', hint: 'They want to understand what they are experiencing. Bring in clinical knowledge about grief plainly and conversationally, tied to what they describe.' },
  { id: 'think', label: 'Think it through', hint: 'They want to think: philosophy, meaning, mortality, optimistic nihilism. Be a real thinking partner with views of your own.' },
];
