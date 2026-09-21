// Legal page content (CLONE_SPEC.md Part 2 §P4) as typed blocks.
// ORIGINAL PLACEHOLDER TEXT for a design clone — not a real policy. Only the
// structure of the originals is mirrored (block order, heading hierarchy, list
// usage and nesting, approximate lengths); none of their wording is used.
//
// Block types
//   { type: 'p', align?: 'center' | 'justify', content }
//   { type: 'ul', items: [content] }
//   { type: 'ol', items: [{ value, content, sub?: [item] }] }   // sub -> nested <ol>
// `content` is a string or an array of inline runs:
//   'text' | { b: 'bold' } | { u: 'underlined term' } | { a: 'link text', href } | { br: true }

const COMPANY = 'Rig AI Inc.'
const EMAIL = 'placeholder@example.com'

// Sentence pool for long filler paragraphs. Written for this clone.
const POOL = [
  'This paragraph is placeholder copy that stands in for a real clause while the layout is being reviewed.',
  'Nothing written here describes an actual practice, promise or obligation of any company or product.',
  'The sample wording is long enough to wrap across several lines so that justified text can be checked.',
  'Readers should treat each sentence as filler and consult a qualified professional for genuine guidance.',
  'In a finished document this space would explain what is covered, when it applies and who it affects.',
  'Terms such as service, account and content are used loosely here and carry no defined meaning.',
  'Section numbers, headings and list markers are included only to demonstrate the visual hierarchy.',
  'Where a real policy would list exceptions, this version simply repeats neutral statements of similar length.',
  `The placeholder company is called ${COMPANY} purely so that a name appears in context.`,
  `Questions about this sample can be sent to ${EMAIL}, which is not a monitored inbox.`,
  'Dates, figures and time periods shown on this page are illustrative and should not be relied upon.',
  'Each block keeps roughly the same length as its counterpart so that the page height stays comparable.',
  'Nothing in this text creates rights for anyone, and no part of it is intended to be enforceable.',
  'A production version would be drafted with care, reviewed by counsel and updated as practices change.',
  'Until then, the words on this page exist to exercise typography, spacing, alignment and indentation.',
  'Some paragraphs are intentionally long so that the rhythm of a dense legal page can be evaluated.',
  'Others are short, which mirrors the mix of brief notices and longer explanations found in such documents.',
  'Links, underlined phrases and bold lead-ins appear where the layout calls for them, not where meaning requires.',
  'Any resemblance between this filler and a real agreement is coincidental and should be disregarded.',
  'The design clone renders this content from structured blocks rather than from pasted markup.',
]
const SENTENCES = POOL.map((t) => t.split(' '))
let sIdx = 0 // next sentence
let wIdx = 0 // word offset inside it (fragments may stop mid-sentence)

// Next n words of the pool, verbatim.
function take(n) {
  const out = []
  while (out.length < n) {
    const words = SENTENCES[sIdx % SENTENCES.length]
    out.push(words[wIdx])
    if (++wIdx >= words.length) (wIdx = 0), sIdx++
  }
  return out.join(' ')
}
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const stop = (t) => t.replace(/[.,;:]+$/, '') + '.'

// Standalone filler paragraph of ~n words: starts on a sentence boundary and,
// when a sentence end is within 6 words, finishes there.
function w(n) {
  if (wIdx) (wIdx = 0), sIdx++
  let out = []
  while (out.length < n) {
    const words = SENTENCES[sIdx % SENTENCES.length]
    const room = n - out.length
    if (words.length <= room + 6) {
      out = out.concat(words)
      sIdx++
    } else {
      out = out.concat(words.slice(0, room))
      wIdx = room
    }
  }
  return stop(out.join(' '))
}
const W = (n) => w(n).toUpperCase()
// Inline filler run of n words (continues mid-sentence around bold/underlined/
// link runs). Resolved lazily in norm() so a paragraph's first run can start on
// a sentence boundary.
const f = (n) => ({ f: n })

// Mixed content: fragments become text, the first is capitalised and the last
// one closes the sentence.
function norm(content) {
  if (!Array.isArray(content)) return content
  const lastF = content.map((r) => typeof r === 'object' && 'f' in r).lastIndexOf(true)
  return content.map((r, i) => {
    if (typeof r !== 'object' || !('f' in r)) return r
    if (i === 0 && wIdx) (wIdx = 0), sIdx++
    let t = take(r.f)
    if (i === 0) t = cap(t)
    if (i === lastF && i === content.length - 1) t = stop(t)
    return t
  })
}

const b = (t) => ({ b: t })
const u = (t) => ({ u: t })
const a = (t, href) => ({ a: t, href })
const p = (content, align = 'justify') => ({ type: 'p', align, content: norm(content) })
const pc = (content) => p(content, 'center')
const plain = (content) => ({ type: 'p', content: norm(content) })
const ul = (...items) => ({ type: 'ul', items: items.map(norm) })
const li = (value, content, sub) => ({ value, content: norm(content), sub })
const ol = (...items) => ({ type: 'ol', items })

const NOTICE = p([b('Placeholder text for a design clone — not a real policy.')])

/* ==========================================================================
   Privacy (§P4 "Privacy inventory")
   ========================================================================== */

// Shared tail of every category list (the original repeats one set of purposes).
const PURPOSES = [
  'Sign-up',
  'Running the service',
  'Answering support requests',
  'Sending occasional product updates by email',
  'Improving the sample experience',
  'Security checks',
  'Meeting legal requirements',
  'Internal analytics',
  'Record keeping',
  'Other purposes described elsewhere on this page',
]

const category = (name, ...head) => [plain(name), plain('Examples may include:'), ul(...head, ...PURPOSES)]

const privacyBlocks = [
  NOTICE,
  pc([b('Privacy Policy')]),
  p([b('Last Revised: 1/1/26')]),
  p([
    f(10), ' ', b(COMPANY), ' ', f(10), ' ', b('we'), ', ', b('us'), ' or ', b('our'), ' ', f(3), ' ', b('Service'), ' ',
    f(26), ' ', a('rig.ai', '/'), ' ', f(22), ' ', b('Policy'), ' ', f(55), ' ', a('this page', '/privacy'), ' ', f(33),
  ]),
  p([b('About this notice')]),
  p(w(80)),
  p([b('Changes to this sample policy')]),
  p(w(44)),

  // Flattened table: column headers, then 10 category groups.
  pc([b('Category of sample data')]),
  pc([b('Examples shown for each category')]),
  pc([b('Placeholder reasons a real policy might list')]),
  pc([b('Placeholder note on how long it might be kept')]),
  ...category('Contact details and identifiers', 'Name or preferred handle', 'Email address', 'Account ID', 'A reference code created when you join the list', 'City or region, if provided'),
  ...category('Account information', 'Sign-in method', 'Settings you choose when setting up a sample account', 'Plan or tier names'),
  ...category('Device and usage information', 'Browser type', 'Operating system', 'Screen size', 'Language setting', 'Time zone', 'Referring page', 'Pages viewed in a session, recorded as rough counts only', 'Approximate timing of visits, rounded so that no single visit stands out'),
  ...category('Hardware survey answers', 'Chip family', 'Memory size you selected in the survey', 'Operating system choice, where one was given', 'Model year', 'Free-text notes about your setup, if any were added'),
  ...category('Support messages', 'Message text', 'Attachments'),
  ...category('Referral activity', 'Referral link', 'Referral count', 'Queue position', 'Signup date', 'Share button clicks'),
  ...category('Preferences and settings', 'Email preferences', 'Display theme and similar choices', 'Opt-outs', 'Language'),
  ...category('Waitlist status information', 'Invite status', 'Joined date shown on the dashboard', 'Beta build channel and the date an invite was sent'),
  ...category('Sample inferences drawn from other listed data', 'Likely interests', 'Rough preferences'),
  ...category('Other information you choose to share with us', 'Survey responses written in your own words and sent through a form', 'Feedback notes shared with the team during a closed test'),

  p(w(45)),
  p(w(49)),
  p([f(28), ' ', b('Rig AI'), ' ', f(32)]),
  p(w(80)),
  p([f(73), ' ', a('settings', '/'), ' or ', a('contact', '/'), '.']),
  p([u('Sample note.'), ' ', f(34), ' ', b('you'), ' ', f(90)]),
  p([u('Definitions')]),
  p([f(24), ' ', b('Service'), ' ', f(34)]),
  ul([b('Sample basis.'), ' ', f(54)], [b('Another basis.'), ' ', f(41)], [b('Third basis.'), ' ', f(67)]),
  p(w(80)),
  p([f(19), ' ', a('here', '/privacy'), '.']),
  p([b('How sample data might be shared')]),
  p(w(55)),
  p(w(9)),
  ul(
    [b('Placeholder service providers and vendors.'), ' ', f(32)],
    [b('Placeholder professional advisers.'), ' ', f(33)],
    [b('Placeholder related companies.'), ' ', f(16)],
    [b('Placeholder partners.'), ' ', f(32)],
    [b('Placeholder authorities and regulators.'), ' ', f(119)],
    [b('Placeholder parties to a business transfer.'), ' ', f(20)],
  ),
  p(w(47)),
  p([b('How long sample data is kept')]),
  p([f(18), ' ', u('a sample retention period'), ' ', f(44)]),
  p(w(81)),
  p(w(6)),
  ul(w(47), w(56), w(22)),
  p(w(22)),
  p([u('Sample security.'), ' ', f(102)]),
  p([b('Choices a real policy would describe here')]),
  p(w(79)),
  p(w(24)),
  ul(w(11), w(17), w(10), w(16), w(10)),
  p([f(30), ' ', a('settings', '/'), '.']),
  p([f(6), ' ', b('Rig'), ' ', f(52), ' ', a('this page', '/privacy'), ' ', f(40)]),
  p(w(13)),
  p([u('Regional notes')]),
  p(w(80)),
  p(w(61)),
  p(w(28)),
  p([b('Requests and how to make them')]),
  p(w(12)),
  ul(w(20), w(12), w(11), w(8), w(12), w(12), w(10)),
  p([f(15), ' ', a(EMAIL, `mailto:${EMAIL}`), ' ', f(74)]),
  p([b('Sample regional rights')]),
  p([u('First region.'), ' ', f(92)]),
  p([u('Second region placeholder note.'), ' ', f(92)]),
  p([u('Third region placeholder.'), ' ', f(47)]),
  p([b('Additional placeholder notes for residents of other regions')]),
  p([f(10), ' ', b('A'), ' ', f(10), ' ', b('B'), ' ', f(4), ' ', b('C'), ' ', f(19), ' ', b('D'), ' ', f(10), ' ', b('E'), ' ', f(14)]),
  p(w(60)),
  p([f(49), ' ', a(EMAIL, `mailto:${EMAIL}`), '.']),
  p(w(63)),
  p([u('Sample category heading'), ' and ', u('another sample category'), ' ', f(12)]),
  p([u('A further sample category heading'), ' and ', u('its companion category'), ' ', f(63)]),
  p('Sample: Yes.'),
  p(w(43)),
  p('Sample: No.'),
  p(w(65)),
  p('Sample: No.'),
  p(w(30)),
  ul('Identifiers and contact details', 'Account data', 'Usage data', 'Device data', 'Survey answers', 'Support messages sent to us', 'Referral and queue details', 'Stated preferences', 'Inferences drawn from the items above', 'Anything else you chose to send us'),
  p(w(13)),
  p([f(15), ' ', u('a placeholder request form'), ' below.']),
  ul('Contact details used when joining', 'Account information', 'Survey answers', 'Usage and device information collected', 'Referral data'),
  p('Placeholder: none.'),
  p(w(36)),
  p([u('Sample right one'), ' and ', u('sample right two here'), ' ', f(13)]),
  p([u('How to send a placeholder request to the team')]),
  p([f(36), ' ', a(EMAIL, `mailto:${EMAIL}`), ' ', f(76)]),
  ul(
    [b('Access.'), ' ', f(21)],
    [b('Correction.'), ' ', f(25)],
    [b('Deletion.'), ' ', f(15)],
    [b('Portability of data.'), ' ', f(66)],
    [b('Objection.'), ' ', f(34)],
    [b('Restriction.'), ' ', f(31)],
    [b('Withdrawing consent.'), ' ', f(10)],
    [b('Complaints to a regulator.'), ' ', f(36), ' ', a('here', '/privacy'), '.'],
  ),
  p([u('Contacting the sample team'), ' by ', u('email'), ' ', f(5), ' ', u('or post'), ' ', f(114), ' ', a(EMAIL, `mailto:${EMAIL}`), '.']),
]

/* ==========================================================================
   Terms (§P4 "Terms inventory") — nested numbered lists, 3 levels deep
   ========================================================================== */

const termsBlocks = [
  NOTICE,
  pc([b('Terms of Service'), { br: true }, b('Revised: 1/1/26')]),
  ol(li(1, [b('ABOUT THESE TERMS')])),
  p([f(7), ' ', u('Service'), ' ', f(53), ' ', u('Terms'), ' ', f(7), ' ', u('Company'), ' ', f(18), ' ', u('you'), ' ', f(3), ' ', u('User'), ' ', f(78)]),
  p(W(63)),
  p([b(W(33)), ' ', W(62)]),
  p(w(166)),
  p([{ br: true }]),
  ol(
    li(2, [b('USING THE SAMPLE SERVICE')], [
      li(1, [b('Eligibility.'), ' ', f(84), ' ', u('Account Holder'), ' ', f(39)]),
      li(2, [b('Sample accounts.'), ' ', f(86)]),
      li(3, [b('Access.'), ' ', f(21), ' ', u('Software'), ' ', f(130)]),
      li(4, [b('Updates.'), ' ', f(52)]),
      li(5, [b('Placeholder beta terms.'), ' ', f(23), ' ', u('Beta'), ' ', f(12), ' ', u('Pre-Release Build Features'), ' ', f(133)]),
      li(6, [b('Usage limits.'), ' ', f(83)]),
      li(7, [b('Sample restrictions.'), ' ', f(72)]),
      li(8, [b('Account security.'), ' ', f(23), ' ', u('Sign-in Details'), ' ', f(143)]),
    ]),
    li(3, [b('CONTENT')], [
      li(1, [b('Your content.'), ' ', f(10), ' ', a('here', '/terms'), ' ', u('User Content'), ' ', f(61)]),
      li(2, [b('A placeholder licence grant.'), ' ', f(5), ' ', u('Licensed Content'), ' ', f(315)]),
      li(3, [b('Sample feedback.'), ' ', f(28)]),
      {
        nestedOnly: true,
        sub: [
          li(1, [b('Sample output.'), ' ', f(31), ' ', u('Generated Output'), ' ', f(78)]),
          li(2, [b('A placeholder note on ownership.'), ' ', f(40)]),
        ],
      },
    ]),
  ),
  p(w(25)),
  ol(
    li(4, [b('Fees placeholder')], [li(1, [b('Sample pricing.'), ' ', f(40)]), li(2, [b('Taxes.'), ' ', f(85)])]),
    li(5, [b('SAMPLE ACCEPTABLE USE')], [
      li(1, w(9), [
        li(1, w(37)), li(2, w(28)), li(3, w(26)), li(4, w(43)), li(5, w(27)), li(6, w(43)),
        li(7, w(11)), li(8, w(24)), li(9, w(17)), li(10, w(18)), li(11, w(27)),
      ]),
      li(2, w(16), [li(1, w(19)), li(2, w(32)), li(3, w(14)), li(4, w(24)), li(5, w(23)), li(6, w(10)), li(7, w(15))]),
      li(3, w(44)),
    ]),
    li(6, [b('Ownership')], [
      li(1, [b('Sample ownership note.'), ' ', f(21), ' ', u('Materials'), ' ', f(14)]),
      li(2, [b('Placeholder marks.'), ' ', f(80)]),
      li(3, [b('Sample notices.'), ' ', f(10), ' ', u('Notice Contact'), ' ', f(115), ' ', a(EMAIL, `mailto:${EMAIL}`), ' ', f(22)]),
      li(4, [b('Reservation.'), ' ', f(200)]),
    ]),
    li(7, [b('Privacy')]),
  ),
  p([f(23), ' ', u('Policy'), ' ', f(52)]),
  ol(
    li(8, [b('Termination')], [
      li(1, [b('Placeholder term length.'), ' ', f(23), ' ', u('Sample Term'), ' ', f(17), ' ', u('Period'), ' ', f(15), ' ', u('Notice'), ' ', f(128), ' ', u('Wind Down'), ' ', f(100)]),
      li(2, [b('Sample suspension notes.'), ' ', f(23), ' ', u('Suspension Event'), ' ', f(67)]),
      li(3, [b('Survival.'), ' ', f(122)]),
    ]),
    li(9, [b('Warranties')], [
      li(1, [b('Sample statements by you.'), ' ', f(100)]),
      li(2, [b('Placeholder disclaimer text.')], [li(1, W(73)), li(2, W(54)), li(3, W(37)), li(4, W(53))]),
    ]),
    li(10, [b('Limitation of Liability')], [li(1, W(145)), li(2, W(111))]),
    li(11, [b('Placeholder Indemnity Terms')], [
      li(1, [f(32), ' ', u('Covered Parties'), ' ', f(26), ' ', u('Sample Claims'), ' ', f(9), ' ', u('Losses'), ' ', f(116)]),
      li(2, w(158)),
      li(3, w(101)),
    ]),
    li(12, [b('Sample Disputes')]),
  ),
  p(w(81)),
  ol(
    li(13, [b('PLACEHOLDER GENERAL TERMS AND NOTICES')], [
      li(1, W(20)),
      li(2, [f(11), ' ', u('Notice'), ' ', f(20), ' ', a(EMAIL, `mailto:${EMAIL}`), ' ', f(109)]),
      li(3, [W(91), ' ', W(10)]),
      li(4, w(53)),
      li(5, w(32)),
    ]),
    li(14, [b('Governing law')]),
  ),
  p(w(88)),
  ol(li(15, [b('Changes to Terms')])),
  p(w(177)),
  ol(li(16, [b('SAMPLE EXPORT CONTROL NOTES')])),
  p(w(52)),
  ol(li(17, [b('Miscellaneous provisions')])),
  p(w(130)),
]

export const legal = {
  privacy: { title: 'Privacy Policy', blocks: privacyBlocks },
  terms: { title: 'Terms of Service', blocks: termsBlocks },
}
