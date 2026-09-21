// Page copy. Placeholder text written to match the original's structure,
// line breaks and approximate length — swap in your own copy here.

export const nav = {
  links: [{ label: 'Blog', href: '/blog' }],
  cta: { label: 'Get Early Access', href: '/waitlist' },
}

export const hero = {
  titleLines: ['Your code, your machine.', 'Zero cloud. Zero caps.'],
  sub: 'A full coding agent that lives on your laptop. Nothing to call home. Nothing to meter.',
  primary: 'Join Waitlist',
  secondary: 'Our Approach',
  ticker: [
    'No telemetry',
    'Local inference',
    'Fully offline',
    'Your box, your call',
    'No tokens, no meter',
    'Purpose-built model',
    'Whole-repo context',
  ],
}

export const problem = {
  badge: 'The problem',
  titleLines: ['Your AI rents you back.', 'And it keeps a log.'],
  cards: [
    {
      label: 'Data harvesting',
      num: '001',
      title: 'Your code feeds their model.',
      body: ['Each prompt. Each diff. Each patch.', 'It all passes through servers you never see — sharpening a product built to compete with you.'],
    },
    {
      label: 'Metered access',
      num: '002',
      title: 'They ration your output.',
      body: ['Throttles, quotas, surprise bills.', 'Just as the work gets interesting, a counter somewhere says stop.'],
    },
    {
      label: 'Quiet swaps',
      num: '003',
      title: 'They swap the model.',
      body: ['When traffic spikes, a lighter model quietly takes over. Same invoice, weaker answers.'],
    },
    {
      label: 'Network reliance',
      num: '004',
      title: 'They set your pace.',
      body: ['Every suggestion waits on a trip to a distant data center.', 'Small stalls that add up all day long.'],
    },
  ],
}

export const intro = {
  badge: 'Introducing Rig',
  titleLines: ['All on-device.', 'Yours to keep.'],
  desc: 'An end-to-end coding agent that runs on hardware you already own. No quotas. No servers in the loop.',
}

export const offline = {
  badge: 'Offline',
  title: 'Work offline',
  body: 'Planes. Hotel Wi-Fi. Dead routers. Keep shipping anyway.',
  cards: { cloud: 'Cloud servers', machine: 'Your machine', active: 'Rig model active', nothing: 'Nothing leaves', severed: 'Severed' },
}

export const threeCol = [
  { badge: 'Unlimited', title: 'Lose the meter', body: 'Rewrite an entire module. Chase an idea for hours. Loop agents without watching a bill.' },
  { badge: 'Privacy', title: 'Cut the cord', body: 'Source, keystrokes and files stay on disk. Not scrubbed. Not pooled. Never uploaded.' },
  { badge: 'Latency', title: 'Skip the wait', body: 'No detour through a data center. Inference runs locally, in a handful of milliseconds.', dim: true },
]

export const how = {
  badge: 'Our Approach',
  title: 'Focus beats size.',
  body: 'Rig is one integrated system — model, context, tools and runtime — built together for a single purpose: shipping real code.',
  steps: [
    {
      num: 'Step 01',
      title: 'A narrow model, trained only for code.',
      body: [
        'Every weight is spent on coding, planning, tool calls and structured edits. The whole training run targets engineering work and nothing else.',
        'Tightening the scope puts the capability where it counts — stronger reasoning, cleaner diffs, steadier tool use.',
      ],
      cardTitle: 'Training Focus',
    },
    {
      num: 'Step 02',
      title: 'Full reasoning power, compressed to fit your laptop.',
      body: [
        'The model is compressed to run well on everyday hardware — while carefully keeping the reasoning behaviour that matters most intact.',
        'The payoff is an 8 GB model that sits comfortably in memory on a MacBook. Real reasoning. Local execution. Nothing per token.',
      ],
      cardTitle: 'Compression',
    },
    {
      num: 'Step 03',
      title: 'A purpose-built runtime tuned just for Apple Silicon.',
      body: [
        'Inference runs on a bespoke engine tuned closely for Apple Silicon. Model, context engine and tools are all built together as one system.',
        'That tight coupling is what makes running locally quick, dependable and practical.',
      ],
      cardTitle: 'Runtime',
    },
  ],
  // How overlay card (one per step, same order as `steps`). Each card is a list
  // of blocks separated by a blank line:
  //   { caption }                       dim single line
  //   { bars: [{ label, fill, value, rig }] }   ASCII bar rows, 20 cells;
  //        fill = full cells (0-20), a fraction adds a sliver, null = no bar;
  //        rig = highlighted row (bright label, green bar + value)
  //   { lines: [string | [[tone, text], ...]], tone }  free text lines
  cards: [
    [
      { caption: 'Weights devoted to code' },
      {
        bars: [
          { label: 'Rig', fill: 20, value: '100%', rig: true },
          { label: 'General models', fill: 4, value: '~10–20%' },
        ],
      },
      { tone: 'dim', lines: ['Broad models divide their capacity', 'between chat, translation, fiction', 'and everything else.'] },
      { tone: 'bright', lines: ['Rig spends every single weight', 'on engineering.'] },
    ],
    [
      { caption: 'Memory footprint (RAM needed)' },
      {
        bars: [
          { label: 'Frontier APIs', fill: 20, value: '200+ GB' },
          { label: 'Open models', fill: 6, value: '30–140 GB' },
          { label: 'Rig', fill: 0.25, value: '8 GB', rig: true },
        ],
      },
      { tone: 'dim', lines: ['Sits inside 16 GB unified RAM.', [['dim', 'Quality drop: '], ['green', '<0.3%']]] },
    ],
    [
      { caption: 'Time to first token' },
      {
        bars: [
          { label: 'Rig', fill: 0.25, value: '300 ms', rig: true },
          { label: 'Hosted APIs', fill: 20, value: '400–1,200 ms' },
        ],
      },
      { caption: 'Price per 1K tokens' },
      {
        bars: [
          { label: 'Rig', fill: null, value: '$0.00', rig: true },
          { label: 'Hosted APIs', fill: 20, value: '$0.01–0.06' },
        ],
      },
    ],
  ],
}

export const capabilities = {
  badge: 'Capabilities',
  title: 'Your hardware, uncapped.',
  items: [
    { title: 'Grasps your code architecture.', body: 'Builds a linked picture of modules, dependencies and call paths, so that it reasons across many files the way your whole system is actually laid out.' },
    { title: 'Follows every link, avoids breakage.', body: 'Changes that honour function signatures, type boundaries and dependency graphs — fewer bugs, fewer regressions.' },
    { title: 'Plans before it moves.', body: 'Explore → Plan → Execute loops make sure each step is thought through before anything is changed.' },
    { title: 'Handles long multi-step workflows.', body: 'Refactors, test suites, entire new features — it chains together tools, code edits, web lookups and shell commands as the task demands.' },
    { title: 'Sandboxes every agent.', body: 'Each agent gets its own workspace, so experiments stay safe, parallel runs never collide with each other, and code changes wait until you merge them.' },
    { title: 'Runs flat out.', body: 'A custom Rust inference engine tuned for CUDA and Metal — hitting as many as 144 tokens a second on the laptop you already have.' },
  ],
}

export const stats = [
  { label: 'Latency', value: '0ms', note: 'No network hop' },
  { label: 'Privacy', value: '100%', note: 'Air-gapped by default' },
  { label: 'Cost / Token', value: '$0', note: 'Your chip, your tokens' },
  { label: 'Uptime', value: 'Local', note: 'No cloud to go down' },
]

export const terminal = {
  badge: 'Engineered intelligence',
  title: 'Made for tinkerers',
  left: [
    { title: 'Custom Model', desc: 'Tuned for everyday hardware' },
    { title: 'Inference', desc: 'Cross-platform, written in Rust' },
    { title: 'Context Graph', desc: 'Whole-repo code awareness' },
  ],
  right: [
    { title: 'Terminal UI', desc: 'Native Rust, instant response' },
    { title: 'Heavily Tuned', desc: 'Reliable tool calls and plans' },
    { title: 'Opinionated', desc: 'Built around correct code' },
  ],
  prompts: ['explain this regex to me', 'write tests for the auth module', 'refactor utils into smaller files', 'find the memory leak in server.rs'],
  // Static text shown in the prompt line before typing starts.
  typingInitial: 'explain this regex to ',
  windowTitle: 'rig://127.0.0.1 · offline',
  // Boot session lines (after the `λ` command and the ASCII logo).
  command: 'rig init',
  boot: ['> Probing hardware...', '> Detected M4 · 16GB RAM', '> Loading RIG model', '> Indexing 1,904 files · 63,550 symbols'],
  bootOk: 'OK',
  ready: { mark: '✓', text: 'Ready.', network: 'Network', telemetry: 'Telemetry', off: 'OFF' },
  bezel: ['Neural Core', 'RG-800', 'On-Device'],
}

export const earlyAccess = {
  badge: 'Early access',
  title: 'Rig is nearly here.',
  desc: 'We’re opening the doors to engineers who want to try it on real projects and steer what ships.',
  placeholder: 'you@company.com',
  button: 'Join Waitlist',
  // Success / error states (EarlyAccess agent; placeholder copy).
  errorEmpty: 'Enter your email to join.',
  errorInvalid: 'That email doesn’t look right.',
  successHeading: 'Your spot is saved.',
  successPosition: 'Queue position: ',
  referralLabel: 'Share to jump the queue',
  copyLabel: 'Copy referral link',
  dashboardLink: 'Track your place in line →',
}

export const faq = {
  badge: 'FAQ',
  title: 'Common questions.',
  items: [
    { q: 'What is Rig?', a: 'Rig is an on-device AI coding assistant. It pairs an open-source model, post-trained purely for code, with a custom Rust inference engine tuned for Apple Silicon. You get low-latency agentic coding with no API calls, no usage caps, no telemetry and no per-token cost. Your files never leave your computer. macOS is supported today, with Linux and Windows on the roadmap.' },
    { q: 'Which model does Rig run?', a: 'Rig runs an adapted open-source model, reworked to operate only inside the Rig agent harness, context engine and toolset. That focus lets us cut the model’s footprint without giving up reasoning or coding ability.' },
    { q: 'What hardware do I need?', a: 'Right now Rig targets Apple Silicon Macs (M2 or newer) with 32GB of RAM or more. We’re working to bring that requirement down, ideally to 16GB. Windows and Linux builds are on the way.' },
    { q: 'How does it stack up against big cloud models?', a: 'The model is still being trained, so there are no published benchmarks yet. Internal testing suggests that, combined with our context engine and post-training, it will hold its own against leading models.' },
    { q: 'Can Rig browse the web?', a: 'Yes. Rig ships with the tools you’d expect from a coding agent — web search, reading and writing files, a planning mode and more.' },
    { q: 'What will Rig cost?', a: 'We plan to offer a flat monthly or yearly subscription, priced in line with other coding agents — but fully unlimited and offline.' },
    { q: 'Does Rig collect my data?', a: 'No. Privacy is the point. The only network call is a periodic license check, which tolerates time offline. Conversations and source never leave the device.' },
    { q: 'When can I use it?', a: 'A closed beta is rolling out now — watch your inbox for an invite to test builds and the community Slack. A broader launch is planned for Q3 2026. Our focus is building an assistant that real engineers can trust on the work that matters most.' },
  ],
}

export const cta = {
  title: 'Take back your tools',
  button: 'Request Early Access',
  fine: 'No card required. No meter running.',
}

export const footer = {
  logoAlt: 'Rig',
  tagline: 'On-device AI for engineers who’d rather not depend on the cloud.',
  cols: [
    { title: 'Connect', links: [{ label: 'Twitter', href: '#' }, { label: 'LinkedIn', href: '#' }] },
    { title: 'Legal', links: [{ label: 'Terms of Service', href: '/terms' }, { label: 'Privacy Policy', href: '/privacy' }] },
  ],
  copyright: '© 2026 Rig AI Inc. All rights reserved.',
  status: 'All systems local',
}

// /waitlist page (CLONE_SPEC.md Part 2 §P3). Placeholder wording.
export const waitlistPage = {
  form: {
    badge: 'Waitlist',
    heading: 'Claim your spot',
    description: 'Rig is opening up in waves. Leave your email and we will let you know when your invite is ready, plus a few early build notes.',
    placeholder: 'you@company.com',
    button: 'Join Waitlist',
    errorEmpty: 'Enter your email to join.',
    errorInvalid: 'That email doesn’t look right.',
    featuresHeading: 'What’s included',
    features: [
      'Priority access to beta builds',
      'Occasional notes from the team',
      'An invite to the community chat',
      'A shot at the hardware giveaway',
    ],
  },
  loading: 'Fetching your spot...',
  error: {
    heading: 'We couldn’t find that entry',
    message: 'That referral code isn’t saved in this browser.',
  },
  dashboard: {
    badge: 'You are in line',
    heading: 'Where you stand',
    positionLabel: 'Queue position',
    referralsLabel: 'Friends referred',
    giveaway: {
      heading: 'Hardware giveaway',
      body: [
        'One person on the list will win a new Mac mini on us.',
        'Every friend who signs up with your link adds another entry to the draw. Pass it along to anyone who writes code on a laptop.',
      ],
    },
    survey: {
      heading: 'Tell us your setup',
      description: 'Share the machine you plan to run Rig on so we can test against the configurations people actually use.',
      chipLabel: 'Chip',
      chipPlaceholder: 'Choose your chip',
      chipOptions: [
        'M1', 'M1 Pro', 'M1 Max', 'M1 Ultra',
        'M2', 'M2 Pro', 'M2 Max', 'M2 Ultra',
        'M3', 'M3 Pro', 'M3 Max', 'M3 Ultra',
        'M4', 'M4 Pro', 'M4 Max',
        'M5', 'M5 Pro', 'M5 Max',
        'Intel Mac', 'Windows', 'Linux',
      ],
      ramLabel: 'RAM',
      ramPlaceholder: 'Choose your RAM',
      ramOptions: ['8GB', '16GB', '24GB', '32GB', '36GB', '48GB', '64GB', '96GB', '128GB'],
      submit: 'Save',
      saving: 'Saving...',
      saved: 'Saved!',
    },
    referral: {
      heading: 'Skip ahead',
      description: 'Each friend who joins through your link moves you higher in the queue, and the higher spots get their invites first.',
      linkLabel: 'Your invite link',
      copyLabel: 'Copy invite link',
      shareX: 'Share on X',
      shareLinkedIn: 'Share on LinkedIn',
      shareText: 'I just joined the Rig waitlist. Grab a spot with my link:',
    },
    joined: 'Joined: ',
    devReset: 'Clear local waitlist',
  },
}
