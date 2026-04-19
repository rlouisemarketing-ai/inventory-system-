'use client'

import { useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
import { EMOTION_OPTIONS, NEED_OPTIONS, STATEMENT_OPTIONS } from '@/lib/constants'
import PassageCard from './PassageCard'
import ReflectionEditor from './ReflectionEditor'

type Stage = 'q1' | 'q2' | 'q3' | 'result' | 'reflect' | 'pray-time' | 'pray'
type PrayTime = 'moment' | '5min' | '15min' | 'open'

const PRAY_TIME_OPTIONS: { id: PrayTime; label: string; sublabel: string }[] = [
  { id: 'moment', label: 'Just a moment',    sublabel: '1–2 minutes' },
  { id: '5min',   label: 'About 5 minutes',  sublabel: 'A few short prayers' },
  { id: '15min',  label: 'About 15 minutes', sublabel: 'Deeper, structured prayer' },
  { id: 'open',   label: 'Open-ended',       sublabel: 'No time limit' },
]

const PRAY_EXAMPLES_BY_EMOTION: Record<string, Record<PrayTime, string>> = {
  anxious: {
    moment:  'e.g. "Jesus, my heart is racing. I can\u2019t calm my spiraling thoughts on my own. Your word says that if I trust you, I will receive peace \u2014 so thank you for giving me your peace right now. Help me relax, settle my mind, and give you all of my thoughts. Amen."',
    '5min':  'e.g. "Jesus, I\u2019m anxious about [what\u2019s worrying you]. / Your word says to cast all my anxiety on you because you care for me \u2014 so I cast this on you now. / Guard my heart and mind with your peace that passes all understanding. Amen." (1 Pet. 5:7; Phil. 4:6\u20137)',
    '15min': 'e.g. "Father, your word says \u2018Do not fear, for I am with you\u2019 \u2014 I need that promise today. / I confess I\u2019ve been managing my fears instead of trusting you with them. / I ask for peace that passes understanding to guard my heart. / I trust you hold what I can\u2019t see. / Thank you that you never sleep and never leave. / In Jesus\u2019 name, Amen." (Isa. 41:10; Phil. 4:7)',
    open:    'Pour out every worry before God. His word says he cares for you (1 Pet. 5:7) and that his peace will guard your heart when you bring your anxious thoughts to him. Write freely, then close with Amen.',
  },
  sad: {
    moment:  'e.g. "Jesus, I\u2019m heavy today. Your word says you are close to the brokenhearted \u2014 I need you close right now. Just be near. Amen." (Ps. 34:18)',
    '5min':  'e.g. "Jesus, I\u2019m grieving [what\u2019s broken or lost]. / Your word says you were a man of sorrows, acquainted with grief \u2014 so you understand this. / Be close to me the way you promise to be. / Thank you that weeping may last for the night, but joy comes in the morning. Amen." (Isa. 53:3; Ps. 30:5)',
    '15min': 'e.g. "Father, your word calls you the God of all comfort \u2014 I need that comfort today. / I confess I\u2019ve avoided you in this pain. / I ask not just for the grief to end, but for your presence in it. / I trust you are working even in what hurts. / Thank you that you wept at Lazarus\u2019 tomb \u2014 grief is not foreign to you. / In Jesus\u2019 name, Amen." (2 Cor. 1:3\u20134; John 11:35)',
    open:    'Tell God everything \u2014 what you\u2019ve lost, what you miss, what still hurts. The Psalms are full of honest lament. Bring yours the same way. He draws near to the brokenhearted (Ps. 34:18). End with Amen.',
  },
  frustrated: {
    moment:  'e.g. "God, I\u2019m frustrated and I\u2019m bringing it to you. Your word says to be slow to anger \u2014 help me get there. Please hear me and help me. Amen." (James 1:19\u201320)',
    '5min':  'e.g. "Lord, I\u2019m frustrated with [what\u2019s happening]. / Your word says to pour out my heart to you like water \u2014 so here it is. / Help me see what\u2019s mine to hold and what\u2019s yours. / Thank you that you are just and nothing escapes your notice. Amen." (Lam. 2:19)',
    '15min': 'e.g. "Father, I\u2019m angry about [what feels wrong or unjust]. / Your word says \u2018In your anger do not sin\u2019 \u2014 I need that grace right now. / I confess I\u2019ve let this turn to bitterness. Soften me. / I ask for wisdom to respond well, and trust that you see injustice clearly. / Thank you that you are the God who makes all things right. / In Jesus\u2019 name, Amen." (Eph. 4:26; Rom. 12:19)',
    open:    'Write out the frustration honestly. God invites honest lament throughout the Psalms. Tell him what happened, how it made you feel, and what you wish were different. End with Amen.',
  },
  lonely: {
    moment:  'e.g. "Jesus, I feel invisible today. Your word says you will never leave me nor forsake me \u2014 remind me of that right now. Amen." (Deut. 31:8)',
    '5min':  'e.g. "Jesus, I feel unseen even in rooms full of people. / Your word says you know me completely \u2014 every part of me. / Will you be the presence that truly stays? / Thank you that you were forsaken at the cross so I would never have to be. Amen." (Ps. 139; Heb. 13:5)',
    '15min': 'e.g. "Father, your word says you set the lonely in families \u2014 I need that to be real in my life. / I confess I\u2019ve pulled away from both you and the people around me. / I ask you to draw near, and give me eyes to see the community you\u2019ve provided. / Thank you that Jesus was fully forsaken so I would never be. / In Jesus\u2019 name, Amen." (Ps. 68:6; Heb. 13:5)',
    open:    'Tell God what the loneliness actually feels like \u2014 the quiet, the invisible moments, what you long for. He sees every part of you (Psalm 139). End with Amen.',
  },
  overwhelmed: {
    moment:  'e.g. "Jesus, I\u2019m weary and I\u2019m coming to you. Your word says you will give me rest \u2014 I receive that right now. Amen." (Matt. 11:28)',
    '5min':  'e.g. "Lord, I have too much and I don\u2019t know where to begin. / Your word says to cast all my cares on you because you sustain me \u2014 so I cast this on you. / Show me what\u2019s mine to carry and what I can set down. / Thank you that your yoke is easy and your burden is light. Amen." (Ps. 55:22; Matt. 11:30)',
    '15min': 'e.g. "Father, your word says those who hope in you will renew their strength \u2014 I need that renewal today. / I confess I\u2019ve taken on more than you asked me to carry. / I ask for wisdom about what to keep and what to release, and rest that truly restores me. / Thank you that you built rest into creation \u2014 you don\u2019t ask me to keep grinding. / In Jesus\u2019 name, Amen." (Isa. 40:31; Ps. 127:2)',
    open:    'List everything that feels like too much. Lay it before God piece by piece. His word says he sustains those who cast their cares on him (Psalm 55:22). Then ask what he\u2019d have you set down. End with Amen.',
  },
  uncertain: {
    moment:  'e.g. "God, I don\u2019t know what to do. Your word says to trust you with all my heart and not lean on my own understanding \u2014 help me do that right now. Amen." (Prov. 3:5\u20136)',
    '5min':  'e.g. "Lord, I\u2019m in a season of not knowing. / Your word says if I lack wisdom, I should ask you \u2014 and you give generously without finding fault. / I\u2019m asking. Show me where to go and where to wait. / Thank you that you are not confused, even when I am. Amen." (James 1:5)',
    '15min': 'e.g. "Father, your word says you know the plans you have for me \u2014 plans for a future and a hope. / I confess I\u2019ve been looking for certainty more than seeking you. / I ask for wisdom, and for peace while I wait. / I trust you direct the steps of those who commit their way to you. / Thank you that you\u2019ve guided me before. I believe you\u2019ll do it again. / In Jesus\u2019 name, Amen." (Jer. 29:11; Prov. 3:5\u20136)',
    open:    'Write out all the questions you\u2019ve been sitting with. Bring each uncertainty before God. His word says he gives wisdom generously to those who ask (James 1:5). End with Amen.',
  },
  ashamed: {
    moment:  'e.g. "Jesus, I\u2019m carrying shame I can\u2019t shake. Your word says there is no condemnation for those who are in you \u2014 I receive that grace right now. Amen." (Rom. 8:1)',
    '5min':  'e.g. "Lord, I need to confess... / Your word says if I confess my sins, you are faithful and just to forgive and cleanse me. / Thank you that you remove my sin as far as the east is from the west. Amen." (1 John 1:9; Ps. 103:12)',
    '15min': 'e.g. "Father, like David I come to you broken. I have sinned and the weight of it presses on me. / I confess... / Your word says create in me a clean heart, O God \u2014 I ask that now. / Thank you that there is no condemnation in Christ. / In Jesus\u2019 name, Amen." (Ps. 51; Rom. 8:1)',
    open:    'Write out what you\u2019re carrying \u2014 the guilt, the regret, the shame. Then bring it to the God who casts sin into the depths of the sea (Mic. 7:19). He is more ready to forgive than we are to confess. End with Amen.',
  },
  afraid: {
    moment:  'e.g. "Lord, I am afraid. Your word says you take hold of my right hand and tell me not to fear \u2014 hold me now. Amen." (Isa. 41:13)',
    '5min':  'e.g. "God, fear is pressing in. / Your word says you have not given me a spirit of fear, but of power, love, and a sound mind. / I claim that today. / Thank you that perfect love casts out fear. Amen." (2 Tim. 1:7; 1 John 4:18)',
    '15min': 'e.g. "Father, your word says \u2018The LORD is my light and my salvation \u2014 whom shall I fear?\u2019 I need that today. / I confess I\u2019ve let fear take more space than faith. / I ask for courage that comes from knowing you are with me. / Thank you that you hold what I\u2019m afraid of. / In Jesus\u2019 name, Amen." (Ps. 27:1)',
    open:    'Name what you\u2019re afraid of \u2014 every fear, every worst case. Bring it all into the light of God\u2019s presence. His word says he takes hold of your right hand and tells you not to fear (Isa. 41:13). End with Amen.',
  },
  numb: {
    moment:  'e.g. "God, I feel far away \u2014 even from you. Your word says there is nowhere I can go from your Spirit. Even here, you are. Amen." (Ps. 139:7)',
    '5min':  'e.g. "Lord, I don\u2019t have much to bring today \u2014 just emptiness. / Your word says the Spirit intercedes for us with groans too deep for words. / Let him pray what I can\u2019t. / Thank you that you don\u2019t require me to feel close to actually be close. Amen." (Rom. 8:26)',
    '15min': 'e.g. "Father, I feel like a bruised reed \u2014 and your word says you will not break me. / I confess I\u2019ve drifted and I don\u2019t know how I got here. / I ask you to breathe new life into me. / I trust you are present even in my numbness. / Thank you for not giving up on me. / In Jesus\u2019 name, Amen." (Isa. 42:3; Ezek. 36:26)',
    open:    'Write even if it feels empty. Even \u201cI don\u2019t know what to say\u201d is a prayer. His word says the Spirit intercedes for us when we don\u2019t have words (Rom. 8:26). Put whatever is there on the page, then close with Amen.',
  },
  confused: {
    moment:  'e.g. "Lord, I can\u2019t make sense of this. Your word says to trust you with all my heart and not lean on my own understanding \u2014 help me do that right now. Amen." (Prov. 3:5)',
    '5min':  'e.g. "God, my mind is foggy and I don\u2019t know where to turn. / Your word says you will show me the way I should go \u2014 I need that. / I ask for wisdom and clarity, the kind only you can give. / Thank you that you are not confused, even when I am. Amen." (Ps. 32:8; James 1:5)',
    '15min': 'e.g. "Father, I am lost in my own thinking. / Your word says not to lean on my own understanding \u2014 I confess I\u2019ve been doing exactly that. / I ask you to clear the fog and show me what\u2019s true. / I trust that when I acknowledge you, you will direct my path. / Thank you that you light my way. / In Jesus\u2019 name, Amen." (Prov. 3:5\u20136; Ps. 119:105)',
    open:    'Write out the confusion \u2014 all the mixed signals, the questions you can\u2019t answer, the fog you can\u2019t see through. God promises to show you the way (Psalm 32:8). End with Amen.',
  },
  drained: {
    moment:  'e.g. "Jesus, I\u2019m empty. Your word says you give strength to the weary and increase the power of the weak \u2014 I receive that right now. Amen." (Isa. 40:29)',
    '5min':  'e.g. "Lord, I have nothing left to give. / Your word says to come to you when I\u2019m weary and you will give me rest. / I come. / Thank you that you restore my soul \u2014 you don\u2019t just tell me to push through. Amen." (Matt. 11:28; Ps. 23:3)',
    '15min': 'e.g. "Father, like Elijah under the broom tree, I\u2019m done. I have nothing left. / I confess I haven\u2019t let myself stop \u2014 or let you in. / I ask you to meet me here and replenish what I can\u2019t restore on my own. / Thank you that you care for your weary servants with gentleness. / In Jesus\u2019 name, Amen." (1 Kings 19; Isa. 40:29\u201331)',
    open:    'Write honestly about the depletion \u2014 what drained you, what you\u2019re running low on, what you need. God met Elijah in his exhaustion with food and rest, not a rebuke (1 Kings 19). End with Amen.',
  },
  overstimulated: {
    moment:  'e.g. "God, I need everything to slow down. Your word says to be still and know that you are God \u2014 I\u2019m being still right now. Amen." (Ps. 46:10)',
    '5min':  'e.g. "Lord, I\u2019m overloaded and I can\u2019t process anymore. / Even Jesus pulled away from the crowds to be with you. / I pull away now. / Help me quiet the noise and just be in your presence. / Thank you for the invitation to come apart and rest. Amen." (Mark 6:31)',
    '15min': 'e.g. "Father, your word says you calm the storm and bring stillness. I need that today \u2014 inside and out. / I confess I haven\u2019t protected space for quiet and it\u2019s wearing me down. / I ask you to restore my capacity to be present. / Thank you that you are a God of peace, not chaos. / In Jesus\u2019 name, Amen." (Ps. 107:29; Ps. 131:2)',
    open:    'You don\u2019t have to pray organized thoughts. Just sit. Write whatever surfaces. His word says he calms the storm and brings things to stillness (Psalm 107:29). End with Amen when you\u2019re ready.',
  },
  shocked: {
    moment:  'e.g. "God, I don\u2019t have words. Something has shaken me and I\u2019m bringing it to you. You are my refuge \u2014 I run to you right now. Amen." (Ps. 46:1)',
    '5min':  'e.g. "Lord, I\u2019m shaken by [what happened]. / Your word says you are an ever-present help in trouble \u2014 I need that help now. / When my heart is overwhelmed, lead me to the rock that is higher than I. / Thank you that you are solid when everything else feels unstable. Amen." (Ps. 46:1; Ps. 61:2)',
    '15min': 'e.g. "Father, I am still processing what happened. I don\u2019t understand it yet. / Your word says when you pass through the waters, I will be with you \u2014 I claim that right now. / I confess I am scared and I need you to anchor me. / I ask for your peace that doesn\u2019t make sense given the circumstances. / Thank you that you are not shaken, even when I am. / In Jesus\u2019 name, Amen." (Isa. 43:2; Phil. 4:7)',
    open:    'Write what happened \u2014 or just what you\u2019re feeling right now if you can\u2019t yet. You don\u2019t need to make sense of it. God is an ever-present help in trouble (Psalm 46:1). End with Amen.',
  },
  restless: {
    moment:  'e.g. "Lord, my heart can\u2019t settle. Your word says my soul finds rest in you alone \u2014 I return to that rest right now. Amen." (Ps. 62:1)',
    '5min':  'e.g. "God, something in me is unsettled and I can\u2019t name it. / Your word says to cast all my anxieties on you because you care for me. / I cast this restlessness on you now. / Thank you that your peace guards hearts and minds. Amen." (1 Pet. 5:7; Phil. 4:7)',
    '15min': 'e.g. "Father, I can\u2019t seem to be still \u2014 there\u2019s an unease I can\u2019t shake. / Your word says to be still before you and wait patiently. / I confess I\u2019ve been running from the quiet instead of into you. / I ask you to reveal what\u2019s underneath the restlessness. / Thank you that you satisfy the restless heart. / In Jesus\u2019 name, Amen." (Ps. 37:7; Ps. 62:1)',
    open:    'Write about the restlessness \u2014 what you\u2019re reaching for, what feels unfinished or unsettled. Augustine wrote, \u201cOur heart is restless until it rests in you.\u201d Bring the reach to God. End with Amen.',
  },
  searching: {
    moment:  'e.g. "Lord, something in me is reaching for more of you. Your word says I will find you when I seek you with all my heart \u2014 I\u2019m seeking. Draw me deeper. Amen." (Jer. 29:13)',
    '5min':  'e.g. "Jesus, I\u2019m grateful but hungry for more of you. / Your word says my soul pants for you like a deer pants for water \u2014 let that longing grow. / Show me where you want to meet me in this season. / Thank you for the peace you\u2019ve given, and for the desire for more. Amen." (Ps. 42:1\u20132)',
    '15min': 'e.g. "Father, like Paul I want to truly know you, not just know about you. / I confess I sometimes mistake stillness for arrival. I\u2019m still learning. / I ask you to deepen my roots and show me what\u2019s next in this quiet season. / Thank you for seasons of peace, and for a God who reveals himself to those who seek. / In Jesus\u2019 name, Amen." (Phil. 3:10; Jer. 29:13)',
    open:    'Write freely about what your heart is reaching for \u2014 the questions, the desires, the sense of \u201cthere must be more.\u201d His word says you will find him when you seek with all your heart (Jer. 29:13). End with Amen.',
  },
  surprised: {
    moment:  'e.g. "God, I didn\u2019t see this coming. Your word says you do immeasurably more than all we ask or imagine \u2014 thank you for this. Amen." (Eph. 3:20)',
    '5min':  'e.g. "Lord, I\u2019m in awe of what just happened. / Your word says this is the LORD\u2019s doing and it is marvelous in our eyes. / I worship you for it. / Help me hold this moment and not rush past it. / Thank you for surprising me with your goodness. Amen." (Ps. 118:23)',
    '15min': 'e.g. "Father, many are the wonders you have done \u2014 I\u2019m experiencing one right now. / I confess I sometimes expect too little of you. / I ask you to grow my wonder and keep my heart open to what you\u2019re doing. / I trust that this is from your hand. / Thank you for being a God who still does surprising things. / In Jesus\u2019 name, Amen." (Ps. 40:5; Eph. 3:20)',
    open:    'Write about what surprised you \u2014 what you didn\u2019t expect, what moved you, what you\u2019re still taking in. His word says he does more than we can ask or imagine (Ephesians 3:20). End with Amen.',
  },
  content: {
    moment:  'e.g. "Lord, I am satisfied in you today. Your word says godliness with contentment is great gain \u2014 I receive this contentment as a gift from you. Amen." (1 Tim. 6:6)',
    '5min':  'e.g. "Father, I have learned contentment in this moment \u2014 or rather, you\u2019ve given it to me. / Your word says the LORD is my shepherd, I shall not want \u2014 I feel that today. / I ask you to help this rootedness stay with me. / Thank you for the simplicity of being full. Amen." (Phil. 4:11; Ps. 23:1)',
    '15min': 'e.g. "Father, Paul said he had learned the secret of contentment in every state \u2014 I want to learn that too. / I confess I often let restlessness creep in even in good seasons. / I ask you to deepen this contentment, to let it become a settled part of who I am. / I trust that you are enough \u2014 now and always. / Thank you for this gift of sufficiency. / In Jesus\u2019 name, Amen." (Phil. 4:11\u201313; Ps. 16:5\u20136)',
    open:    'Write about what\u2019s good right now \u2014 the ordinary blessings, the quiet satisfaction, the sense that you have enough. His word says godliness with contentment is great gain (1 Timothy 6:6). End with Amen.',
  },
  excited: {
    moment:  'e.g. "Lord, my heart is full of anticipation. Your word says you complete the good work you begin in us \u2014 I trust you with what\u2019s ahead. Amen." (Phil. 1:6)',
    '5min':  'e.g. "Jesus, I\u2019m full of anticipation about [what you\u2019re excited for]. / Your word says you give us the desires of our hearts when we delight in you. / I hold this expectation with open hands. / Thank you for the gift of something good to look forward to. Amen." (Ps. 37:4)',
    '15min': 'e.g. "Father, I feel hope and excitement stirring \u2014 I believe it\u2019s from you. / I confess I sometimes let excitement shift into anxiety. Help me hold this with peace. / I ask you to align my hopes with your purposes. / I trust you work all things together for good. / Thank you for a future worth looking forward to. / In Jesus\u2019 name, Amen." (Rom. 8:28; Phil. 1:6)',
    open:    'Write out what you\u2019re excited about \u2014 the dreams, the hopes, the things ahead. Present them to God with open hands. His word says he who began a good work in you will carry it to completion (Phil. 1:6). End with Amen.',
  },
  loved: {
    moment:  'e.g. "Father, I feel your love today. Your word says nothing can separate me from your love \u2014 I rest in that right now. Amen." (Rom. 8:38\u201339)',
    '5min':  'e.g. "Lord, I\u2019m overwhelmed by how good you\u2019ve been. / Your word says to give thanks to the LORD, for he is good and his love endures forever. / I do that now, for [specific things]. / Thank you for lavishing your love on me. Amen." (Ps. 107:1; 1 John 3:1)',
    '15min': 'e.g. "Father, your word says I am rooted and established in your love \u2014 a love too wide, too long, too high, too deep to fully grasp. / I confess I sometimes doubt your love when life is hard. / I ask you to make your love felt, not just known. / Thank you for the cross, the clearest proof. / In Jesus\u2019 name, Amen." (Eph. 3:17\u201319)',
    open:    'Write about where you\u2019ve seen God\u2019s love lately \u2014 in people, in provision, in answered prayer, in small mercies. His love endures forever (Ps. 107:1). End with Amen.',
  },
  courageous: {
    moment:  'e.g. "Lord, I feel your strength today. Your word says to be strong and courageous, for you are with me wherever I go \u2014 I go in that confidence. Amen." (Josh. 1:9)',
    '5min':  'e.g. "God, I can feel you strengthening me for what\u2019s ahead. / Your word says I can do all things through Christ who gives me strength. / I step into today with that. / Thank you for the boldness that comes from being with you. Amen." (Phil. 4:13; Acts 4:13)',
    '15min': 'e.g. "Father, your word says to be strong in the Lord and in his mighty power. I want to walk in that today. / I confess I\u2019ve shrunk back from [what you\u2019ve been avoiding]. / I ask for Spirit-given boldness to take the next step. / Thank you that you go before me and behind me. / In Jesus\u2019 name, Amen." (Eph. 6:10; Ps. 139:5)',
    open:    'Write about what you\u2019re stepping into \u2014 the task, the conversation, the next right thing. Ask God to strengthen you for it. His word says he goes before you and is with you (Deut. 31:8). End with Amen.',
  },
  joyful: {
    moment:  'e.g. "Jesus, my heart is full today. Your word says to enter your gates with thanksgiving \u2014 so I come with gratitude for [what you\u2019re thankful for]. Thank you. Amen." (Ps. 100:4)',
    '5min':  'e.g. "Lord, I want to bless your name today. / Your word says to give thanks in all circumstances \u2014 thank you for [specific blessings]. / I rejoice in you always, just as you command. Amen." (1 Thess. 5:18; Phil. 4:4)',
    '15min': 'e.g. "Father, bless the LORD, O my soul \u2014 and forget not all his benefits. / I confess I don\u2019t always notice your goodness. Help me pay attention. / I ask for a heart that stays grateful even when circumstances change. / Thank you for this season of joy. / In Jesus\u2019 name, Amen." (Ps. 103:1\u20135)',
    open:    'Pour out your praise freely. List what God has done, what you\u2019re grateful for, what has surprised you with goodness. His word says he inhabits the praises of his people (Ps. 22:3). End with Amen.',
  },
  peaceful: {
    moment:  'e.g. "Jesus, I\u2019m resting in you today. Your word says you will keep in perfect peace the mind that stays fixed on you \u2014 I fix my mind on you now. Amen." (Isa. 26:3)',
    '5min':  'e.g. "Lord, your peace is real today. / Your word says the peace you give is not as the world gives \u2014 it surpasses understanding. / I receive it and I rest in it. / Thank you for this gift. Amen." (John 14:27; Phil. 4:7)',
    '15min': 'e.g. "Father, your word says you lead me beside still waters and restore my soul. I feel that today. / I confess I often rush through seasons of peace without receiving them. / I ask you to use this quiet to root me deeper and prepare me for what\u2019s ahead. / Thank you for rest. You are a good Shepherd. / In Jesus\u2019 name, Amen." (Ps. 23)',
    open:    'Rest in writing. Tell God what feels settled and good. His word says he gives peace not as the world gives (John 14:27). Receive it fully, then close with Amen.',
  },
  hopeful: {
    moment:  'e.g. "God, my heart is lifting today. Your word says you are the God of hope \u2014 fill me with joy and peace as I trust in you. Amen." (Rom. 15:13)',
    '5min':  'e.g. "Lord, I can feel hope rising. / Your word says you have plans for me \u2014 plans for a future and a hope, not for harm. / I hold on to that today. / Thank you that hope in you does not disappoint. Amen." (Jer. 29:11; Rom. 5:5)',
    '15min': 'e.g. "Father, your word says those who hope in the LORD will renew their strength \u2014 I feel that today. / I confess hope hasn\u2019t always come easily. Thank you for this season. / I ask you to let this hope take deep root so it holds when things get hard. / Thank you that great is your faithfulness, new every morning. / In Jesus\u2019 name, Amen." (Isa. 40:31; Lam. 3:23)',
    open:    'Write out what you\u2019re hoping for \u2014 the prayers, the anticipations, what your heart is lifting toward. His word says hope in him will not disappoint (Rom. 5:5). End with Amen.',
  },
  default: {
    moment:  'e.g. "Jesus, settle my heart. Your word says to cast all my cares on you because you care for me \u2014 I\u2019m doing that now. Remind me you are near. Amen." (1 Pet. 5:7)',
    '5min':  'e.g. "Jesus, I bring this to you. / Your word says you are near to all who call on you in truth \u2014 I\u2019m calling. / Help me trust you with what I can\u2019t control. / Thank you that you already know, and that you are good. Amen." (Ps. 145:18)',
    '15min': 'e.g. "Father, your word is a lamp to my feet and a light to my path \u2014 I need that light today. / I confess I\u2019ve been trying to handle this myself. / I ask for your peace, wisdom, and presence. / Thank you for never leaving me. / In Jesus\u2019 name, Amen." (Ps. 119:105)',
    open:    'A blank page to pour out whatever is on your heart \u2014 raw, honest, unfiltered. His word says he is near to all who call on him in truth (Psalm 145:18). Write until you feel heard, then close with Amen.',
  },
}

const PRAY_STARTERS_BY_EMOTION: Record<string, Record<PrayTime, string>> = {
  anxious: {
    moment:  'Jesus, my heart is racing. I can\u2019t calm my spiraling thoughts on my own. Your word says that if I trust you, I will receive peace \u2014 so thank you for giving me your peace right now. Help me relax, settle my mind, and give you all of my thoughts. Amen.',
    '5min':  'Jesus, I\u2019m anxious about...\n\nYour word says to cast all my anxiety on you because you care for me (1 Peter 5:7) \u2014 so I cast this on you now.\n\nGuard my heart and mind with your peace that passes all understanding (Philippians 4:7). Amen.',
    '15min': 'Father,\n\nYour word says, \u201cDo not fear, for I am with you; do not be dismayed, for I am your God\u201d (Isaiah 41:10). I need that promise today.\n\nI\u2019ve been struggling with...\n\nI confess I\u2019ve been trying to manage my fears instead of trusting you with them.\n\nI ask for the peace that passes all understanding to guard my heart and mind (Philippians 4:7).\n\nI trust you with what I cannot see or control.\n\nThank you that you never sleep, never leave, and hold my future in your hands.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  sad: {
    moment:  'Jesus, I\u2019m heavy today. Your word says you are close to the brokenhearted (Psalm 34:18) \u2014 I need you close right now. Just be near. Amen.',
    '5min':  'Jesus, I\u2019m grieving...\n\nYour word says you were a man of sorrows, acquainted with grief (Isaiah 53:3) \u2014 so you understand this.\n\nBe close to me the way you promise to be. Thank you that weeping may last for the night, but joy comes in the morning (Psalm 30:5). Amen.',
    '15min': 'Father,\n\nYour word calls you \u201cthe God of all comfort\u201d (2 Corinthians 1:3) \u2014 I need that comfort today. I\u2019ve been carrying...\n\nI confess I\u2019ve sometimes avoided you in this pain, as if grief were too heavy even for you.\n\nI ask not just for the grief to end, but for your presence in it. Comfort me in a way only you can.\n\nI trust you are working even in what I don\u2019t understand.\n\nThank you that you wept at Lazarus\u2019s tomb (John 11:35) \u2014 grief is not foreign to you.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  frustrated: {
    moment:  'God, I\u2019m frustrated and I\u2019m bringing it to you. Your word says to be slow to anger (James 1:19) \u2014 help me get there. Please hear me and help me. Amen.',
    '5min':  'Lord, I\u2019m frustrated with...\n\nYour word says to pour out my heart to you like water before you (Lamentations 2:19) \u2014 so here it is.\n\nHelp me see what\u2019s mine to hold and what\u2019s yours. Thank you that you are just and nothing escapes your notice. Amen.',
    '15min': 'Father,\n\nI\u2019m going to be honest \u2014 I\u2019m angry about...\n\nYour word says, \u201cIn your anger do not sin\u201d (Ephesians 4:26) \u2014 I need that grace right now.\n\nI confess I\u2019ve let this frustration harden into bitterness. Soften me where I\u2019ve grown rigid.\n\nI ask for wisdom to respond well, and I trust you to handle the justice I can\u2019t enforce (Romans 12:19).\n\nThank you that you see what happened and you are not indifferent. You are the God who makes all things right.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  lonely: {
    moment:  'Jesus, I feel invisible today. Your word promises you will never leave me nor forsake me (Deuteronomy 31:8) \u2014 remind me of that right now. Amen.',
    '5min':  'Jesus, the loneliness has been heavy. I feel unseen even in rooms full of people.\n\nYour word says you know me completely \u2014 even the number of hairs on my head (Matthew 10:30). Help me feel that truth today.\n\nThank you that you were forsaken at the cross so I would never have to be (Hebrews 13:5). Amen.',
    '15min': 'Father,\n\nI feel alone in a way that\u2019s hard to explain \u2014 not just by myself, but unknown.\n\nYour word says you set the lonely in families (Psalm 68:6). I need that to be real in my life.\n\nI confess I\u2019ve pulled away from you and from the people around me, afraid of being hurt or unseen.\n\nI ask you to draw near in a way I can feel. Give me eyes to see the community you\u2019ve placed around me.\n\nI trust that you know me completely and I am not hidden from you (Psalm 139).\n\nThank you that Jesus was fully forsaken at the cross so that I would never have to be.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  overwhelmed: {
    moment:  'Jesus, I\u2019m weary and I\u2019m coming to you. Your word says you will give me rest \u2014 I receive that right now. Amen. (Matthew 11:28)',
    '5min':  'Lord, I have too much and I don\u2019t know where to begin.\n\nYour word says to cast all my cares on you because you sustain me (Psalm 55:22) \u2014 so I\u2019m casting this on you now.\n\nShow me what\u2019s mine to carry and what I can set down. Thank you that your yoke is easy and your burden is light (Matthew 11:30). Amen.',
    '15min': 'Father,\n\nYour word says those who hope in you will renew their strength \u2014 they will soar on wings like eagles (Isaiah 40:31). I need that renewal today.\n\nI\u2019ve been trying to hold everything together, including...\n\nI confess I\u2019ve taken on more than you asked me to carry, and I haven\u2019t stopped to ask you what to set down.\n\nI ask for wisdom about what to keep and what to release. I ask for rest that actually restores me.\n\nI trust that you will provide what I need \u2014 not just energy, but clarity and grace.\n\nThank you that you built rest into creation (Psalm 127:2) \u2014 you don\u2019t ask me to keep grinding.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  uncertain: {
    moment:  'God, I don\u2019t know what to do. Your word says to trust you with all my heart and not lean on my own understanding (Proverbs 3:5) \u2014 help me do that right now. Amen.',
    '5min':  'Lord, I\u2019m in a season of not knowing \u2014 and the uncertainty is unsettling.\n\nYour word says if any of us lacks wisdom, we should ask you \u2014 and you give generously to all without finding fault (James 1:5). I\u2019m asking.\n\nShow me where I need to move and where I need to wait. Thank you that you are not confused, even when I am. Amen.',
    '15min': 'Father,\n\nYour word says you know the plans you have for me \u2014 plans for a future and a hope (Jeremiah 29:11). I need to trust that today.\n\nI\u2019ve been second-guessing myself about...\n\nI confess I\u2019ve been looking for certainty more than I\u2019ve been looking for you.\n\nI ask for wisdom \u2014 the kind you promised to give generously (James 1:5). And for peace in the waiting.\n\nI trust that you direct the steps of those who commit their way to you (Proverbs 3:6).\n\nThank you that you\u2019ve guided me before, even when I didn\u2019t realize it. I believe you\u2019ll do it again.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  ashamed: {
    moment:  'Jesus, I\u2019m carrying shame I can\u2019t shake. Your word says there is no condemnation for those who are in you (Romans 8:1) \u2014 I receive that grace right now. Amen.',
    '5min':  'Lord, I need to confess...\n\nYour word says if I confess my sins, you are faithful and just to forgive and to cleanse me from all unrighteousness (1 John 1:9). I bring this to you now.\n\nThank you that you remove my sin as far as the east is from the west (Psalm 103:12). Amen.',
    '15min': 'Father,\n\nLike David, I come to you broken. I have sinned and the weight of it presses on me.\n\nYour word says, \u201cCreate in me a clean heart, O God, and renew a right spirit within me\u201d (Psalm 51:10). That is my prayer today.\n\nI confess...\n\nI ask for your forgiveness, your cleansing, and the joy of your salvation restored to me.\n\nI trust that there is now no condemnation for those who are in Christ Jesus (Romans 8:1).\n\nThank you that your grace is greater than my guilt.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  afraid: {
    moment:  'Lord, I am afraid. Your word says you take hold of my right hand and tell me not to fear \u2014 hold me right now. Amen. (Isaiah 41:13)',
    '5min':  'God, fear is pressing in today.\n\nYour word says you have not given me a spirit of fear, but of power, love, and a sound mind (2 Timothy 1:7). I claim that today.\n\nThank you that perfect love casts out fear \u2014 and your love is perfect (1 John 4:18). Amen.',
    '15min': 'Father,\n\nYour word says, \u201cThe LORD is my light and my salvation \u2014 whom shall I fear? The LORD is the stronghold of my life \u2014 of whom shall I be afraid?\u201d (Psalm 27:1). I need that truth today.\n\nI\u2019ve been afraid of...\n\nI confess I\u2019ve let fear take up more space than faith lately.\n\nI ask for courage that comes not from my circumstances, but from knowing you are with me.\n\nI trust you hold what I\u2019m afraid of \u2014 and you are not afraid.\n\nThank you that I will not be overwhelmed.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  numb: {
    moment:  'God, I feel far away \u2014 even from you. Your word says there is nowhere I can go from your Spirit \u2014 even here, you are present (Psalm 139:7). I rest in that. Amen.',
    '5min':  'Lord, I don\u2019t have much to bring today \u2014 just emptiness.\n\nYour word says the Spirit intercedes for us with groans too deep for words (Romans 8:26). Let him pray what I can\u2019t.\n\nThank you that you don\u2019t require me to feel close to actually be close. Amen.',
    '15min': 'Father,\n\nI feel like I\u2019ve drifted \u2014 from you, from myself. I don\u2019t know how I got here.\n\nYour word says a bruised reed you will not break (Isaiah 42:3). I\u2019m trusting that today.\n\nI confess I\u2019ve been going through the motions without really meeting you.\n\nI ask you to breathe new life into me \u2014 create in me a new heart (Ezekiel 36:26). Wake up what has grown numb.\n\nI trust that you are present even when I can\u2019t feel it.\n\nThank you for not giving up on me.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  confused: {
    moment:  'Lord, I can\u2019t make sense of this. Your word says to trust you with all my heart and not lean on my own understanding (Proverbs 3:5) \u2014 help me do that right now. Amen.',
    '5min':  'God, my mind is foggy and I don\u2019t know where to turn.\n\nYour word says you will instruct me and show me the way I should go (Psalm 32:8). I need that today.\n\nI ask for wisdom and clarity, the kind only you can give. Thank you that you are not confused, even when I am. Amen.',
    '15min': 'Father,\n\nI am lost in my own thinking. The more I try to reason through this, the more tangled it gets.\n\nYour word says, \u201cTrust in the LORD with all your heart and lean not on your own understanding\u201d (Proverbs 3:5). I confess I\u2019ve been doing exactly that \u2014 leaning on my own understanding.\n\nI ask you to clear the fog. Show me what is true and what I\u2019m missing.\n\nI trust that when I acknowledge you in all my ways, you will direct my paths (Proverbs 3:6).\n\nThank you that your word is a lamp to my feet \u2014 enough light for the next step, even if not the whole road.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  drained: {
    moment:  'Jesus, I\u2019m empty. Your word says you give strength to the weary and increase the power of the weak (Isaiah 40:29) \u2014 I receive that right now. Amen.',
    '5min':  'Lord, I have nothing left to give.\n\nYour word says to come to you when I\u2019m weary and you will give me rest (Matthew 11:28). I come.\n\nThank you that you restore my soul \u2014 you don\u2019t just tell me to push through (Psalm 23:3). Amen.',
    '15min': 'Father,\n\nLike Elijah under the broom tree, I\u2019m done. I\u2019ve been running on fumes and I\u2019ve hit the wall.\n\nYour word says you give strength to the weary and increase the power of the weak (Isaiah 40:29). I need that today.\n\nI confess I haven\u2019t let myself stop \u2014 or let you in \u2014 when I\u2019ve been depleted.\n\nI ask you to meet me here and replenish what I cannot restore on my own. Food for my soul, rest for my spirit.\n\nI trust that those who hope in you will renew their strength \u2014 they will soar on wings like eagles (Isaiah 40:31).\n\nThank you that you care for your weary servants with gentleness, not more demands.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  overstimulated: {
    moment:  'God, I need everything to slow down. Your word says to be still and know that you are God (Psalm 46:10) \u2014 I\u2019m being still right now. Amen.',
    '5min':  'Lord, I\u2019m overloaded and I can\u2019t process any more.\n\nYour word says even Jesus pulled away from the crowds to rest and be with you (Mark 6:31). I pull away now.\n\nHelp me quiet the noise inside and just be in your presence. Thank you for the invitation to come apart and rest. Amen.',
    '15min': 'Father,\n\nI am overstimulated \u2014 too much input, too many demands, too much noise. I can\u2019t think clearly and I can\u2019t settle.\n\nYour word says, \u201cBe still before the LORD and wait patiently for him\u201d (Psalm 37:7). I\u2019m trying to do that now.\n\nI confess I haven\u2019t protected space for quiet. I\u2019ve let the world\u2019s pace become my pace.\n\nI ask you to restore my capacity \u2014 to think, to feel, to be present. Calm my inner world the way you calmed the storm.\n\nI trust that you are a God of peace, not chaos (1 Corinthians 14:33).\n\nThank you for stillness. Help me receive it.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  shocked: {
    moment:  'God, I don\u2019t have words. Something has shaken me and I\u2019m bringing it to you. You are my refuge \u2014 I run to you right now. Amen. (Psalm 46:1)',
    '5min':  'Lord, I\u2019m shaken by what happened.\n\nYour word says you are an ever-present help in trouble (Psalm 46:1) \u2014 I need that help right now.\n\nWhen my heart is overwhelmed, lead me to the rock that is higher than I (Psalm 61:2).\n\nThank you that you are solid when everything else feels unstable. Amen.',
    '15min': 'Father,\n\nI am still processing what happened. I don\u2019t understand it yet and I\u2019m not sure I\u2019m supposed to yet.\n\nYour word says, \u201cWhen you pass through the waters, I will be with you\u201d (Isaiah 43:2). I claim that right now.\n\nI confess I am scared and I need you to anchor me in something that doesn\u2019t move.\n\nI ask for your peace that surpasses understanding \u2014 the kind that doesn\u2019t make sense given the circumstances (Philippians 4:7).\n\nI trust that you are not shaken by what has shaken me.\n\nThank you that you are God, and that you are here.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  restless: {
    moment:  'Lord, my heart can\u2019t settle. Your word says my soul finds rest in you alone (Psalm 62:1) \u2014 I return to that rest right now. Amen.',
    '5min':  'God, something in me is unsettled and I can\u2019t quite name it.\n\nYour word says to cast all my anxieties on you because you care for me (1 Peter 5:7). I cast this restlessness on you now.\n\nThank you that your peace guards hearts and minds in Christ Jesus (Philippians 4:7). Amen.',
    '15min': 'Father,\n\nI can\u2019t seem to be still. There\u2019s an unease beneath the surface I can\u2019t shake \u2014 a sense that something is unfinished or unseen.\n\nYour word says, \u201cBe still before the LORD and wait patiently for him\u201d (Psalm 37:7). That\u2019s harder than it sounds.\n\nI confess I\u2019ve been running from the quiet instead of running into you.\n\nI ask you to reveal what\u2019s underneath the restlessness. Is there something I need to hear, to face, to release?\n\nI trust that you satisfy the restless heart that comes to you.\n\nThank you that my soul finds rest in you alone \u2014 not in having the answers, but in having you.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  searching: {
    moment:  'Lord, something in me is reaching for more of you. Your word says I will find you when I seek you with all my heart (Jeremiah 29:13) \u2014 I\u2019m seeking. Draw me deeper. Amen.',
    '5min':  'Jesus, I\u2019m grateful today \u2014 but hungry for more of you.\n\nYour word says my soul pants for you like a deer pants for streams of water (Psalm 42:1) \u2014 let that longing grow in me.\n\nShow me where you want to meet me in this season. Thank you for the peace you\u2019ve given, and for the desire for more. Amen.',
    '15min': 'Father,\n\nLike Paul, I want to truly know you \u2014 not just know about you (Philippians 3:10). I come to you from a place of rest, but with a longing I can\u2019t fully name.\n\nI confess I sometimes mistake stillness for arrival \u2014 as if I\u2019ve figured it out. I\u2019m still learning.\n\nI ask you to deepen my roots in this quiet season. Show me what\u2019s next and help me hunger for you above everything else.\n\nI trust that you are not done with me \u2014 this stillness is the soil of your work.\n\nThank you for seasons of peace, and for a God who reveals himself to those who seek.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  surprised: {
    moment:  'God, I didn\u2019t see this coming. Your word says you do immeasurably more than all we ask or imagine (Ephesians 3:20) \u2014 thank you for this. Amen.',
    '5min':  'Lord, I\u2019m in awe of what just happened.\n\nYour word says this is the LORD\u2019s doing and it is marvelous in our eyes (Psalm 118:23). I worship you for it.\n\nHelp me hold this moment and not rush past it. Thank you for surprising me with your goodness. Amen.',
    '15min': 'Father,\n\nMany are the wonders you have done \u2014 and I\u2019m standing in the middle of one right now (Psalm 40:5).\n\nI confess I sometimes expect too little of you. I fit you into what I think is possible and you quietly exceed it.\n\nI ask you to grow my wonder. Keep my heart open and my expectations surrendered to yours.\n\nI trust that this is from your hand \u2014 and that you do immeasurably more than all we ask or imagine (Ephesians 3:20).\n\nThank you for being a God who still surprises, still moves, still shows up in ways I didn\u2019t anticipate.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  content: {
    moment:  'Lord, I am satisfied in you today. Your word says godliness with contentment is great gain (1 Timothy 6:6) \u2014 I receive this contentment as a gift from you. Amen.',
    '5min':  'Father, I have a sense of fullness today \u2014 that I have what I need.\n\nYour word says the LORD is my shepherd, I shall not want (Psalm 23:1). I feel that right now.\n\nI ask you to help this rootedness stay with me. Thank you for the simplicity of being full. Amen.',
    '15min': 'Father,\n\nPaul said he had learned the secret of contentment in every state \u2014 whether full or hungry, whether having plenty or being in need (Philippians 4:11\u201312). I want to learn that too.\n\nToday I feel it. And I want to receive it fully, not rush past it.\n\nI confess I often let restlessness creep in even in good seasons, always reaching for the next thing.\n\nI ask you to deepen this contentment, to let it become a settled part of who I am \u2014 not dependent on circumstances.\n\nI trust that you are enough. Now and always.\n\nThank you for this gift of sufficiency. The LORD is my chosen portion and my cup (Psalm 16:5).\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  excited: {
    moment:  'Lord, my heart is full of anticipation. Your word says you complete the good work you begin in us (Philippians 1:6) \u2014 I trust you with what\u2019s ahead. Amen.',
    '5min':  'Jesus, I\u2019m full of anticipation about...\n\nYour word says you give us the desires of our hearts when we delight in you (Psalm 37:4). I hold this expectation with open hands.\n\nThank you for the gift of something good to look forward to. Amen.',
    '15min': 'Father,\n\nI feel hope and excitement stirring \u2014 and I believe it\u2019s from you.\n\nYour word says you work all things together for good for those who love you (Romans 8:28). I\u2019m trusting that today.\n\nI confess I sometimes let excitement shift into anxiety. Help me hold this with peace, not pressure.\n\nI ask you to align my hopes with your purposes. Redirect anything that\u2019s off course.\n\nI trust that the good work you\u2019ve begun in me, you will complete (Philippians 1:6).\n\nThank you for a future worth looking forward to.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  loved: {
    moment:  'Father, I feel your love today. Your word says nothing can separate me from your love \u2014 not anything in all creation (Romans 8:38\u201339). I rest in that right now. Amen.',
    '5min':  'Lord, I\u2019m overwhelmed by how good you\u2019ve been.\n\nYour word says to give thanks to the LORD, for he is good and his love endures forever (Psalm 107:1). So I give thanks for...\n\nThank you for lavishing your love on me (1 John 3:1). Amen.',
    '15min': 'Father,\n\nYour word says I am rooted and established in love \u2014 and that your love is too wide, too long, too high, too deep to fully grasp (Ephesians 3:17\u201319). I want to grasp more of it today.\n\nI confess I sometimes doubt your love when life gets hard, as if your love were conditional on my circumstances.\n\nI ask you to make your love real to me \u2014 not just a doctrine but a felt presence.\n\nI trust that nothing \u2014 nothing \u2014 can separate me from your love in Christ Jesus (Romans 8:38\u201339).\n\nThank you for the cross. It is the clearest proof.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  courageous: {
    moment:  'Lord, I feel your strength today. Your word says to be strong and courageous, for you are with me wherever I go (Joshua 1:9) \u2014 I go in that confidence. Amen.',
    '5min':  'God, I can feel you strengthening me for what\u2019s ahead.\n\nYour word says I can do all things through Christ who gives me strength (Philippians 4:13). I step into today with that.\n\nThank you for the boldness that comes from being with you. Amen.',
    '15min': 'Father,\n\nYour word says, \u201cBe strong in the Lord and in his mighty power\u201d (Ephesians 6:10). I want to walk in that today.\n\nI\u2019ve been holding back from...\n\nI confess I\u2019ve let fear or doubt keep me from the next step.\n\nI ask for Spirit-given boldness \u2014 not recklessness, but courageous faithfulness.\n\nI trust that you go before me and behind me, and your hand is upon me (Psalm 139:5).\n\nThank you that courage is not the absence of fear, but faith in action.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  joyful: {
    moment:  'Jesus, my heart is full today. Your word says to enter your gates with thanksgiving and your courts with praise (Psalm 100:4) \u2014 so I come with gratitude for... Thank you. Amen.',
    '5min':  'Lord, I want to bless your name today.\n\nYour word says to give thanks in all circumstances (1 Thessalonians 5:18) \u2014 so I thank you for...\n\nI rejoice in you always, just as you said (Philippians 4:4). Amen.',
    '15min': 'Father,\n\nYour word says, \u201cBless the LORD, O my soul, and forget not all his benefits\u201d (Psalm 103:2). I don\u2019t want to forget.\n\nToday I\u2019m grateful for...\n\nI confess I don\u2019t always notice your goodness. Help me pay attention even in ordinary moments.\n\nI ask for a heart that stays grateful when this season changes.\n\nThank you for the gift of joy. It is from you.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  peaceful: {
    moment:  'Jesus, I\u2019m resting in you today. Your word says you will keep in perfect peace the mind that stays fixed on you (Isaiah 26:3) \u2014 I fix my mind on you now. Amen.',
    '5min':  'Lord, your peace is real today.\n\nYour word says the peace you give is not as the world gives \u2014 it surpasses all understanding (Philippians 4:7). I receive it and I rest in it.\n\nThank you for this gift. Help me not rush through it. Amen.',
    '15min': 'Father,\n\nYour word says, \u201cHe makes me lie down in green pastures, he leads me beside still waters, he restores my soul\u201d (Psalm 23:2\u20133). I feel that today.\n\nI confess I often move too quickly through seasons of peace without receiving them fully. Help me stay here a moment.\n\nI ask you to use this quiet to root me deeper and prepare me for what\u2019s ahead.\n\nI trust you are at work even in rest.\n\nThank you for this gift of peace. You are a good Shepherd.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  hopeful: {
    moment:  'God, my heart is lifting today. Your word says you are the God of hope \u2014 fill me with joy and peace as I trust in you (Romans 15:13). Amen.',
    '5min':  'Lord, I can feel hope rising.\n\nYour word says you have plans for me \u2014 plans for a future and a hope, not for harm (Jeremiah 29:11). I hold on to that today.\n\nThank you that hope in you does not disappoint (Romans 5:5). Amen.',
    '15min': 'Father,\n\nYour word says those who hope in the LORD will renew their strength \u2014 they will soar on wings like eagles (Isaiah 40:31). I feel that hope today.\n\nI confess hope hasn\u2019t always come easily for me. Thank you for this season of lifting.\n\nI ask you to let this hope take deep root, so it holds when things get hard again.\n\nI trust that you are faithful in every season.\n\nThank you \u2014 great is your faithfulness, new every morning (Lamentations 3:23).\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
  default: {
    moment:  'Jesus, settle my heart. Your word says to cast all my cares on you because you care for me (1 Peter 5:7) \u2014 I\u2019m doing that right now. Remind me you are near. Amen.',
    '5min':  'Jesus, I bring this to you.\n\nYour word says you are near to all who call on you in truth (Psalm 145:18) \u2014 I\u2019m calling.\n\nHelp me trust you with what I can\u2019t control. Thank you that you already know, and that you are good. Amen.',
    '15min': 'Father,\n\nYour word says you are a lamp to my feet and a light to my path (Psalm 119:105). I need that light today as I bring you...\n\nI confess I\u2019ve been trying to carry this myself.\n\nI ask for your peace, your wisdom, and your presence in this season.\n\nI trust you with what I can\u2019t carry alone.\n\nThank you for never leaving me.\n\nIn Jesus\u2019 name, Amen.',
    open:    '',
  },
}

const PRAY_SUBTITLES: Record<PrayTime, string> = {
  moment:  'Even one sentence reaches heaven.',
  '5min':  'Use the prompts to guide your prayer.',
  '15min': 'Take your time with each prompt.',
  open:    'Write as long as you\u2019d like.',
}

export default function HeartCheckFlow() {
  const [stage, setStage] = useState<Stage>('q1')
  const [heart, setHeart] = useState('')
  const [statement, setStatement] = useState('')
  const [need, setNeed] = useState('')
  const [entry, setEntry] = useState<any>(null)
  const [passage, setPassage] = useState<any>(null)
  const [routeLabel, setRouteLabel] = useState('')
  const [prayTime, setPrayTime] = useState<PrayTime>('moment')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supa = useMemo(() => supabaseBrowser(), [])

  async function authToken() {
    const { data } = await supa.auth.getSession()
    return data.session?.access_token ?? null
  }

  async function submit() {
    setSubmitError(null)
    setIsSubmitting(true)
    try {
      const token = await authToken()
      const res = await fetch('/api/heart-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ heart, statement, need }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error ?? 'Something went wrong. Please try again.')
      setEntry(json.entry)
      setPassage(json.passage)
      setRouteLabel(json.route)
      setStage('result')
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function saveReflection(text: string) {
    if (!entry?.id) return
    const token = await authToken()
    await fetch('/api/history', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ entryId: entry.id, reflectionText: text }),
    })
  }

  async function savePrayer(text: string) {
    if (!entry?.id) return
    const token = await authToken()
    await fetch('/api/history', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ entryId: entry.id, prayerText: text }),
    })
  }

  // ── Q1: How are you feeling? ──────────────────────────────────────
  if (stage === 'q1') {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-serif text-sage-800">Heart Check</h1>
        <p className="text-sage-500 text-sm">What&apos;s on your heart right now?</p>
        <div className="grid gap-2">
          {EMOTION_OPTIONS.map(o => (
            <button
              key={o.id}
              className={`rounded-xl border px-4 py-3 text-left text-sage-800 transition-colors ${
                heart === o.id
                  ? 'border-sage-500 bg-sage-100'
                  : 'border-sage-200 bg-white hover:border-sage-400 hover:bg-sage-50'
              }`}
              onClick={() => { setHeart(o.id); setStage('q2') }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Q2: Which statement fits? ─────────────────────────────────────
  if (stage === 'q2') {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-serif text-sage-800">Which statement feels closest?</h1>
        <div className="grid gap-2">
          {STATEMENT_OPTIONS.map(o => (
            <button
              key={o.id}
              className={`rounded-xl border px-4 py-3 text-left text-sage-800 transition-colors ${
                statement === o.id
                  ? 'border-sage-500 bg-sage-100'
                  : 'border-sage-200 bg-white hover:border-sage-400 hover:bg-sage-50'
              }`}
              onClick={() => { setStatement(o.id); setStage('q3') }}
            >
              {o.label}
            </button>
          ))}
        </div>
        <button className="text-sm text-sage-500 hover:text-sage-700 underline underline-offset-2" onClick={() => setStage('q1')}>
          Back
        </button>
      </div>
    )
  }

  // ── Q3: What do you need? ─────────────────────────────────────────
  if (stage === 'q3') {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-serif text-sage-800">What would help most right now?</h1>
        <div className="grid gap-2">
          {NEED_OPTIONS.map(o => (
            <button
              key={o.id}
              className={`rounded-xl border px-4 py-3 text-left text-sage-800 transition-colors ${
                need === o.id
                  ? 'border-sage-500 bg-sage-100'
                  : 'border-sage-200 bg-white hover:border-sage-400 hover:bg-sage-50'
              }`}
              onClick={() => setNeed(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {submitError && (
          <p className="text-sm text-red-500 rounded-lg bg-red-50 border border-red-200 px-3 py-2">{submitError}</p>
        )}
        <div className="flex gap-3">
          <button
            className="rounded-xl border border-sage-300 px-4 py-2 text-sm text-sage-700 hover:bg-sage-50 transition-colors"
            onClick={() => setStage('q2')}
          >
            Back
          </button>
          <button
            className="rounded-xl bg-sage-600 px-5 py-2 text-sm text-white hover:bg-sage-700 disabled:opacity-40 transition-colors"
            disabled={!need || isSubmitting}
            onClick={() => submit()}
          >
            {isSubmitting ? 'Loading…' : 'Continue'}
          </button>
        </div>
      </div>
    )
  }

  // ── Result: Passage card ──────────────────────────────────────────
  if (stage === 'result') {
    if (!passage) {
      return (
        <div className="space-y-4">
          <p className="text-sage-500 text-sm">Something went wrong loading your passage.</p>
          <button className="text-sm text-sage-500 hover:text-sage-700 underline underline-offset-2" onClick={() => setStage('q1')}>
            Start over
          </button>
        </div>
      )
    }
    const reference = `${passage.book} ${passage.chapter}:${passage.verseStart}–${passage.verseEnd}`
    return (
      <div className="space-y-4">
        <PassageCard
          routeLabel={routeLabel}
          reference={reference}
          translation={passage.translation}
          text={passage.text}
          peopleLinks={passage.peopleLinks ?? []}
          onReflect={() => setStage('reflect')}
          onPray={() => setStage('pray-time')}
        />
        <button
          className="text-sm text-sage-500 hover:text-sage-700 underline underline-offset-2"
          onClick={() => setStage('q1')}
        >
          Start a new Heart Check
        </button>
      </div>
    )
  }

  // ── Reflect ───────────────────────────────────────────────────────
  if (stage === 'reflect') {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-serif text-sage-800">Reflection</h1>
        <p className="text-sage-500 text-sm">What stands out to you in this passage?</p>
        <ReflectionEditor
          initialText={entry?.reflection_text ?? ''}
          onChangeDebounced={saveReflection}
        />
        <div className="flex gap-3">
          <button
            className="rounded-xl border border-sage-300 px-4 py-2 text-sm text-sage-700 hover:bg-sage-50 transition-colors"
            onClick={() => setStage('result')}
          >
            Back
          </button>
          <button
            className="rounded-xl bg-sage-600 px-5 py-2 text-sm text-white hover:bg-sage-700 transition-colors"
            onClick={() => setStage('pray-time')}
          >
            Continue to Prayer
          </button>
        </div>
      </div>
    )
  }

  // ── Pray: time picker ─────────────────────────────────────────────
  if (stage === 'pray-time') {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-serif text-sage-800">How much time do you have to pray?</h1>
        <div className="grid gap-2">
          {PRAY_TIME_OPTIONS.map(o => (
            <button
              key={o.id}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                prayTime === o.id
                  ? 'border-sage-500 bg-sage-100'
                  : 'border-sage-200 bg-white hover:border-sage-400 hover:bg-sage-50'
              }`}
              onClick={() => { setPrayTime(o.id); setStage('pray') }}
            >
              <div className="text-sage-800">{o.label}</div>
              <div className="text-xs text-sage-400 mt-0.5">{o.sublabel}</div>
              <div className="text-xs text-sage-400 mt-1.5 italic leading-relaxed">
                {(PRAY_EXAMPLES_BY_EMOTION[heart] ?? PRAY_EXAMPLES_BY_EMOTION.default)[o.id]}
              </div>
            </button>
          ))}
        </div>
        <button
          className="text-sm text-sage-500 hover:text-sage-700 underline underline-offset-2"
          onClick={() => setStage('reflect')}
        >
          Back
        </button>
      </div>
    )
  }

  // ── Pray ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-serif text-sage-800">Prayer</h1>
      <p className="text-sage-500 text-sm">{PRAY_SUBTITLES[prayTime]}</p>
      <ReflectionEditor
        initialText={entry?.prayer_text ?? (PRAY_STARTERS_BY_EMOTION[heart] ?? PRAY_STARTERS_BY_EMOTION.default)[prayTime]}
        onChangeDebounced={savePrayer}
      />
      <div className="flex gap-3">
        <button
          className="rounded-xl border border-sage-300 px-4 py-2 text-sm text-sage-700 hover:bg-sage-50 transition-colors"
          onClick={() => setStage('pray-time')}
        >
          Back
        </button>
        <button
          className="rounded-xl bg-sage-600 px-5 py-2 text-sm text-white hover:bg-sage-700 transition-colors"
          onClick={() => setStage('q1')}
        >
          Done
        </button>
      </div>
    </div>
  )
}
