// ── TRANSLATIONS ───────────────────────────────────────────────────
export const TRANSLATIONS = ['WEB', 'KJV', 'ASV'] as const
export type Translation = (typeof TRANSLATIONS)[number]

export const TRANSLATION_LABELS: Record<Translation, string> = {
  WEB: 'World English Bible',
  KJV: 'King James Version',
  ASV: 'American Standard Version',
}

// ── EMOTION GROUPS ─────────────────────────────────────────────────
export type Trigger = { value: string; label: string }

export type EmotionGroup = {
  value: string       // maps to emotion_tag in DB
  label: string
  emoji: string
  description: string
  triggers: Trigger[]
}

export const EMOTION_GROUPS: EmotionGroup[] = [
  {
    value: 'sadness_grief',
    label: 'Sadness / Grief',
    emoji: '😢',
    description: 'Carrying a heaviness today',
    triggers: [
      { value: 'loss',           label: 'Loss or death' },
      { value: 'disappointment', label: 'Disappointment' },
      { value: 'heartbreak',     label: 'Heartbreak' },
      { value: 'mourning',       label: 'Mourning' },
      { value: 'missing_someone',label: 'Missing someone' },
    ],
  },
  {
    value: 'anxiety_fear',
    label: 'Anxiety / Fear',
    emoji: '😰',
    description: 'Worry or dread pressing in',
    triggers: [
      { value: 'uncertainty', label: 'Uncertainty about the future' },
      { value: 'health',      label: 'Health concerns' },
      { value: 'relationships', label: 'Relationship fears' },
      { value: 'finances',    label: 'Financial stress' },
      { value: 'panic',       label: 'Overwhelm / panic' },
    ],
  },
  {
    value: 'anger_frustration',
    label: 'Anger / Frustration',
    emoji: '😤',
    description: 'Something feels unjust or overwhelming',
    triggers: [
      { value: 'injustice',    label: 'Injustice or unfairness' },
      { value: 'betrayal',     label: 'Betrayal' },
      { value: 'conflict',     label: 'Conflict with someone' },
      { value: 'unmet_needs',  label: 'Unmet needs' },
      { value: 'helplessness', label: 'Feeling powerless' },
    ],
  },
  {
    value: 'loneliness_isolation',
    label: 'Loneliness',
    emoji: '🫂',
    description: 'Feeling unseen or disconnected',
    triggers: [
      { value: 'isolation',      label: 'Physical isolation' },
      { value: 'misunderstood',  label: 'Feeling misunderstood' },
      { value: 'community_loss', label: 'Loss of community' },
      { value: 'invisible',      label: 'Feeling invisible' },
    ],
  },
  {
    value: 'shame_guilt',
    label: 'Shame / Guilt',
    emoji: '😔',
    description: 'A weight of regret or unworthiness',
    triggers: [
      { value: 'failure',      label: 'A failure or mistake' },
      { value: 'sin',          label: 'Sin or moral failure' },
      { value: 'past',         label: 'Past decisions' },
      { value: 'unworthiness', label: 'Feeling unworthy of love' },
    ],
  },
  {
    value: 'overwhelm_exhaustion',
    label: 'Overwhelm / Exhaustion',
    emoji: '😩',
    description: 'Running on empty',
    triggers: [
      { value: 'burnout',    label: 'Burnout' },
      { value: 'too_much',   label: 'Too many responsibilities' },
      { value: 'sleep',      label: 'Lack of sleep / rest' },
      { value: 'caretaking', label: 'Caretaking fatigue' },
    ],
  },
  {
    value: 'joy_gratitude',
    label: 'Joy / Gratitude',
    emoji: '🌱',
    description: 'Something good is happening',
    triggers: [
      { value: 'blessing',        label: 'A blessing received' },
      { value: 'answered_prayer', label: 'Answered prayer' },
      { value: 'celebration',     label: 'Something to celebrate' },
      { value: 'wonder',          label: 'A sense of wonder' },
    ],
  },
  {
    value: 'peace_contentment',
    label: 'Peace / Contentment',
    emoji: '☮️',
    description: 'A quiet settledness',
    triggers: [
      { value: 'stillness',  label: 'Stillness and rest' },
      { value: 'trust',      label: 'Growing in trust' },
      { value: 'acceptance', label: 'Acceptance' },
      { value: 'presence',   label: "Sense of God's presence" },
    ],
  },
]

// ── INTRO TEMPLATES ────────────────────────────────────────────────
// Short framing text shown above the scripture passage.
export const INTRO_TEMPLATES: Record<string, string> = {
  default:
    'God sees where you are right now. This passage meets you there.',
  sadness_grief:
    'In grief, God draws near to the brokenhearted. Let these words hold you.',
  anxiety_fear:
    "When worry presses in, God's Word anchors us. Breathe and read slowly.",
  anger_frustration:
    'God is not afraid of your anger. Bring it honestly to this text.',
  loneliness_isolation:
    'You are not as alone as it feels. Someone else has walked this path.',
  shame_guilt:
    'There is no condemnation for those in Christ. Let grace speak first.',
  overwhelm_exhaustion:
    '"Come to me, all you who are weary." Jesus said those words for moments like this.',
  joy_gratitude:
    'Gratitude is a spiritual practice. Let Scripture deepen it.',
  peace_contentment:
    'Rest here. Let this passage affirm what your heart is already sensing.',
}

// ── REFLECTION PROMPTS ─────────────────────────────────────────────
export const REFLECTION_PROMPTS: Record<string, string[]> = {
  default: [
    'What stands out to you in this passage?',
    'Where do you see God responding to the person in this story?',
  ],
}

// ── TIME OF DAY ────────────────────────────────────────────────────
export const TIME_OF_DAY_META = {
  morning: { label: 'Morning',  emoji: '🌅', greeting: 'Good morning',   color: 'from-amber-600 to-orange-500' },
  midday:  { label: 'Midday',   emoji: '☀️',  greeting: 'Good afternoon', color: 'from-sky-600 to-blue-500' },
  evening: { label: 'Evening',  emoji: '🌙', greeting: 'Good evening',   color: 'from-indigo-700 to-purple-700' },
} as const

// ── HISTORY SOURCE LABELS ──────────────────────────────────────────
export const HISTORY_SOURCE_LABELS: Record<string, string> = {
  heart_check:      'Heart Check',
  connect_morning:  'Morning Connect',
  connect_midday:   'Midday Connect',
  connect_evening:  'Evening Connect',
}

// ── TRANSLATION ALIAS ──────────────────────────────────────────────
// TranslationCode is an alias for Translation; use either interchangeably.
export type TranslationCode = Translation
export const DEFAULT_TRANSLATION: TranslationCode = 'WEB'

// ── QUESTIONNAIRE OPTIONS (3-step Heart Check flow) ────────────────
export const EMOTION_OPTIONS = [
  { id: 'anxious',    label: 'Anxious' },
  { id: 'sad',        label: 'Heavy or sad' },
  { id: 'frustrated', label: 'Frustrated' },
  { id: 'lonely',     label: 'Lonely' },
  { id: 'overwhelmed',label: 'Overwhelmed' },
  { id: 'uncertain',  label: 'Uncertain' },
  { id: 'ashamed',       label: 'Ashamed or guilty' },
  { id: 'afraid',        label: 'Afraid' },
  { id: 'numb',          label: 'Numb or disconnected' },
  { id: 'confused',      label: 'Confused or lost' },
  { id: 'drained',       label: 'Drained or depleted' },
  { id: 'overstimulated',label: 'Overstimulated or burnt out' },
  { id: 'shocked',       label: 'Shocked or shaken' },
  { id: 'restless',      label: 'Restless or unsettled' },
  { id: 'searching',     label: 'Peaceful but searching' },
  { id: 'joyful',        label: 'Joyful or grateful' },
  { id: 'peaceful',      label: 'At peace' },
  { id: 'hopeful',       label: 'Hopeful' },
  { id: 'excited',       label: 'Excited or expectant' },
  { id: 'loved',         label: 'Loved and blessed' },
  { id: 'courageous',    label: 'Courageous' },
  { id: 'surprised',     label: 'Surprised or in awe' },
  { id: 'content',       label: 'Content and satisfied' },
] as const

export const STATEMENT_OPTIONS = [
  { id: 'future_worry', label: 'Something about the future worries me' },
  { id: 'hurt',         label: 'Someone hurt or disappointed me' },
  { id: 'unseen',       label: 'I feel unseen or misunderstood' },
  { id: 'failed',       label: 'I feel like I failed' },
  { id: 'too_much',     label: 'I am carrying too much responsibility' },
  { id: 'waiting',      label: 'I am waiting for something to change' },
] as const

export const NEED_OPTIONS = [
  { id: 'peace',    label: 'Peace' },
  { id: 'guidance', label: 'Guidance' },
  { id: 'comfort',  label: 'Comfort' },
  { id: 'strength', label: 'Strength' },
  { id: 'hope',     label: 'Hope' },
] as const

export type EmotionOptionId  = (typeof EMOTION_OPTIONS)[number]['id']
export type StatementOptionId = (typeof STATEMENT_OPTIONS)[number]['id']
export type NeedOptionId     = (typeof NEED_OPTIONS)[number]['id']

// ── QUESTIONNAIRE ROUTING ──────────────────────────────────────────
// Maps the 3-step questionnaire answers to a DB emotion_tag + trigger tags.
// All emotionTag values map to one of the 8 core DB tags:
//   sadness_grief | anxiety_fear | anger_frustration | loneliness_isolation
//   shame_guilt | overwhelm_exhaustion | joy_gratitude | peace_contentment
export function mapToEmotionTag(
  heart: string,
  statement: string,
  need: string
): { emotionTag: string; triggers: string[]; routeLabel: string } {
  // ── Sadness / grief family ─────────────────────────────────────
  if (heart === 'sad') {
    return { emotionTag: 'sadness_grief',        triggers: ['heavy_heart'],             routeLabel: 'Sadness and grief' }
  }
  if (heart === 'numb') {
    return { emotionTag: 'sadness_grief',        triggers: ['disconnected'],            routeLabel: 'Numbness and disconnection' }
  }
  // ── Anxiety / fear family ──────────────────────────────────────
  if (heart === 'anxious' || statement === 'future_worry') {
    return { emotionTag: 'anxiety_fear',         triggers: ['uncertainty', 'future'],   routeLabel: 'Anxiety and worry' }
  }
  if (heart === 'afraid') {
    return { emotionTag: 'anxiety_fear',         triggers: ['fear'],                    routeLabel: 'Fear' }
  }
  if (heart === 'uncertain' || statement === 'waiting') {
    return { emotionTag: 'anxiety_fear',         triggers: ['waiting'],                 routeLabel: 'Waiting and uncertainty' }
  }
  if (heart === 'confused') {
    return { emotionTag: 'anxiety_fear',         triggers: ['lost'],                    routeLabel: 'Confusion and searching for clarity' }
  }
  if (heart === 'restless') {
    return { emotionTag: 'anxiety_fear',         triggers: ['unsettled'],               routeLabel: 'Restlessness and unease' }
  }
  if (heart === 'shocked') {
    return { emotionTag: 'anxiety_fear',         triggers: ['shock'],                   routeLabel: 'Shock and shaking' }
  }
  // ── Overwhelm / exhaustion family ─────────────────────────────
  if (heart === 'overwhelmed' || statement === 'too_much') {
    return { emotionTag: 'overwhelm_exhaustion', triggers: ['exhaustion'],              routeLabel: 'Overwhelm and burnout' }
  }
  if (heart === 'drained') {
    return { emotionTag: 'overwhelm_exhaustion', triggers: ['exhaustion'],              routeLabel: 'Depletion and weariness' }
  }
  if (heart === 'overstimulated') {
    return { emotionTag: 'overwhelm_exhaustion', triggers: ['burnout'],                 routeLabel: 'Overstimulation and burnout' }
  }
  // ── Loneliness family ─────────────────────────────────────────
  if (heart === 'lonely' || statement === 'unseen') {
    return { emotionTag: 'loneliness_isolation', triggers: ['unseen'],                  routeLabel: 'Loneliness and feeling unseen' }
  }
  // ── Anger / frustration ────────────────────────────────────────
  if (heart === 'frustrated') {
    return { emotionTag: 'anger_frustration',    triggers: ['conflict'],                routeLabel: 'Anger and frustration' }
  }
  // ── Shame / guilt ─────────────────────────────────────────────
  if (heart === 'ashamed') {
    return { emotionTag: 'shame_guilt',          triggers: ['guilt'],                   routeLabel: 'Shame and guilt' }
  }
  // ── Joy / gratitude family ────────────────────────────────────
  if (heart === 'joyful') {
    return { emotionTag: 'joy_gratitude',        triggers: ['blessing'],                routeLabel: 'Joy and gratitude' }
  }
  if (heart === 'excited') {
    return { emotionTag: 'joy_gratitude',        triggers: ['excitement'],              routeLabel: 'Excitement and expectation' }
  }
  if (heart === 'loved') {
    return { emotionTag: 'joy_gratitude',        triggers: ['blessing'],                routeLabel: 'Feeling loved and blessed' }
  }
  if (heart === 'surprised') {
    return { emotionTag: 'joy_gratitude',        triggers: ['wonder'],                  routeLabel: 'Surprise and awe' }
  }
  // ── Peace / contentment family ────────────────────────────────
  if (heart === 'peaceful') {
    return { emotionTag: 'peace_contentment',    triggers: ['stillness'],               routeLabel: 'Peace and contentment' }
  }
  if (heart === 'hopeful') {
    return { emotionTag: 'peace_contentment',    triggers: ['anticipation'],            routeLabel: 'Hope and expectation' }
  }
  if (heart === 'content') {
    return { emotionTag: 'peace_contentment',    triggers: ['satisfaction'],            routeLabel: 'Contentment and satisfaction' }
  }
  if (heart === 'searching') {
    return { emotionTag: 'peace_contentment',    triggers: ['stillness'],               routeLabel: 'Peaceful but searching' }
  }
  if (heart === 'courageous') {
    return { emotionTag: 'peace_contentment',    triggers: ['strength'],                routeLabel: 'Courage and boldness' }
  }
  return { emotionTag: 'sadness_grief',          triggers: [],                          routeLabel: 'Heart Check' }
}

// ── PRAYER STARTERS ────────────────────────────────────────────────
export const PRAYER_STARTERS = [
  'Jesus, settle my heart.',
  'Jesus, help me listen today.',
  'Jesus, guide my next step.',
  'Jesus, give me patience today.',
  'Jesus, walk with me through this moment.',
  'Jesus is near. He is with you now.',
]
