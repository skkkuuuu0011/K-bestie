import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Data ──────────────────────────────────────────────────────────────────

const MBN_ORANGE = '#ed5b24'

const COUNTRIES: Record<string, {
  name: string; flag: string; region: string; lang: string;
  w: Record<string, number>
}> = {
  PH: { name: 'Philippines', flag: '🇵🇭', region: 'Asia–Pacific', lang: 'English', w: { drama: 10, kpop: 9, food: 7, daily: 10 } },
  US: { name: 'United States', flag: '🇺🇸', region: 'Americas', lang: 'English', w: { drama: 8, kpop: 10, food: 9, daily: 8 } },
  FR: { name: 'France', flag: '🇫🇷', region: 'Europe', lang: 'French', w: { drama: 8, kpop: 9, food: 8, daily: 7 } },
  AE: { name: 'UAE', flag: '🇦🇪', region: 'Middle East', lang: 'Arabic', w: { drama: 10, kpop: 5, food: 8, daily: 9 } },
  NG: { name: 'Nigeria', flag: '🇳🇬', region: 'Africa', lang: 'English', w: { drama: 10, kpop: 7, food: 9, daily: 8 } },
  JP: { name: 'Japan', flag: '🇯🇵', region: 'Asia–Pacific', lang: 'Japanese', w: { drama: 9, kpop: 9, food: 7, daily: 10 } },
}

const TUTOR_ITEMS = [
  { phrase: '대박!', meaning: 'No way! / Awesome!', show: '돌싱글즈', cat: 'drama', level: 'Beginner', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85' },
  { phrase: '완전 내 스타일', meaning: 'Totally my type', show: '한일톱텐쇼', cat: 'kpop', level: 'Beginner', img: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85' },
  { phrase: '밥 한번 먹자', meaning: "Let's grab a meal sometime", show: '전현무계획', cat: 'food', level: 'Intermediate', img: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=700&q=85' },
  { phrase: '눈치 챙겨', meaning: 'Read the room', show: '속풀이쇼 동치미', cat: 'daily', level: 'Advanced', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=85' },
  { phrase: '선 넘네', meaning: "You're crossing the line", show: '돌싱글즈', cat: 'drama', level: 'Intermediate', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=85' },
  { phrase: '국룰이지', meaning: "That's the unwritten rule", show: '가보자GO', cat: 'daily', level: 'Advanced', img: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=700&q=85' },
  { phrase: '잘 먹겠습니다', meaning: 'Thanks for the meal', show: '알토란', cat: 'food', level: 'Beginner', img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=700&q=85' },
  { phrase: '화이팅!', meaning: "You've got this!", show: '현역가왕', cat: 'kpop', level: 'Beginner', img: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=700&q=85' },
]

interface Bestie {
  id: string; name: string; tag: string; personality: string
  langs: string[]; topic: string; topicKo: string; status: 'Online' | 'Away'
  img: string; cat: 'beauty' | 'food' | 'drama' | 'kpop' | 'daily'
  score: Record<string, number>
  greeting: Record<string, string>
  quickReplies: Record<string, string[]>
  answers: Record<string, Record<string, string>>
  keyExpression: string
}

const BESTIES: Bestie[] = [
  {
    id: 'minjun', name: 'Minjun', tag: 'Your Seoul insider', personality: 'Warm & funny',
    langs: ['Korean', 'English'], topic: 'Where do Seoul locals hang out on weekends?', topicKo: '서울 사람들은 주말에 어디서 놀까?',
    status: 'Online', cat: 'daily',
    img: 'https://images.unsplash.com/photo-1705247815016-fb23ebf07a44?auto=format&fit=crop&w=400&h=600&q=85',
    score: { PH: 95, US: 88, FR: 82, AE: 90, NG: 85, JP: 78 },
    keyExpression: '주말에 뭐 해? (What are you doing this weekend?)',
    greeting: {
      English: "Hey! I'm Minjun, your K-Bestie 👋 I saw you were watching my video about weekends in Seoul. What do you want to know?",
      French: "Salut! Je suis Minjun, ton K-Bestie 👋 J'ai vu que tu regardais ma vidéo sur les weekends à Séoul. Qu'est-ce que tu veux savoir?",
      Japanese: "やあ！ミンジュンだよ、君のK-Bestie 👋 ソウルの週末の動画を見てくれてたんだね。何が知りたい？",
      Arabic: "مرحباً! أنا مينجون، صديقك الكوري 👋 رأيتك تشاهد الفيديو عن عطلات نهاية الأسبوع في سيول.",
    },
    quickReplies: {
      English: ["What does this expression mean?", "Do Koreans really say this?", "Where should I visit in Seoul?", "What's trending in Korea?", "Explain it in my language"],
      French: ["Que signifie cette expression?", "Les Coréens disent vraiment ça?", "Où visiter à Séoul?", "Quoi de neuf en Corée?", "Explique-moi en français"],
      Japanese: ["この表現の意味は?", "韓国人は本当にこう言う?", "ソウルで行くべき場所は?", "韓国で流行ってることは?", "日本語で説明して"],
      Arabic: ["ما معنى هذه العبارة؟", "هل يقول الكوريون هذا حقاً؟", "أين أزور في سيول؟", "ما الرائج في كوريا؟"],
    },
    answers: {
      "What's trending in Korea?": {
        English: "Seongsu is still one of the hottest neighborhoods! A lot of new pop-up stores and cafés are opening there. If you like fashion and taking photos, you'd probably love it 😊",
        French: "Seongsu est toujours l'un des quartiers les plus branchés! Beaucoup de nouveaux pop-ups et cafés ouvrent là-bas. Si tu aimes la mode et les photos, tu adorerais 😊",
        Japanese: "ソンスは今も最もホットなエリアの一つだよ！新しいポップアップショップやカフェがどんどんオープンしてる。ファッションや写真が好きなら絶対気に入ると思う 😊",
        Arabic: "سيونغسو لا تزال من أكثر الأحياء رواجاً! الكثير من المتاجر المؤقتة والمقاهي الجديدة تفتح هناك. إذا أحببت الموضة والتصوير ستحبها 😊",
      },
      "Where should I visit in Seoul?": {
        English: "Definitely Seongsu for the vibe, Bukchon Hanok Village for the culture, and Mangwon Market for street food. Start with Seongsu — it has everything! 🗺️",
        French: "Certainement Seongsu pour l'ambiance, le village Bukchon Hanok pour la culture, et le marché Mangwon pour la street food. Commence par Seongsu — il a tout! 🗺️",
        Japanese: "絶対ソンスの雰囲気、北村韓屋村の文化、望遠市場のストリートフードはマスト。まずソンスから行って — 何でもあるよ！🗺️",
        Arabic: "بالتأكيد سيونغسو للأجواء، قرية بوكشون هانوك للثقافة، وسوق مانغوون للأكل الشعبي. ابدأ بسيونغسو — فيه كل شيء! 🗺️",
      },
    },
  },
  {
    id: 'jiwon', name: 'Jiwon', tag: 'Your K-beauty bestie', personality: 'Bright & trendy',
    langs: ['Korean', 'English', 'Japanese'], topic: 'The makeup trend taking over Korea right now', topicKo: '한국에서 요즘 유행하는 메이크업',
    status: 'Online', cat: 'beauty',
    img: 'https://images.unsplash.com/photo-1687298703924-0d11be697d8b?auto=format&fit=crop&w=400&h=600&q=85',
    score: { PH: 88, US: 92, FR: 95, AE: 72, NG: 80, JP: 97 },
    keyExpression: '예쁘다! (So pretty!)',
    greeting: {
      English: "Hi! I'm Jiwon 💄 K-beauty is literally my life! I saw you checking out my makeup video — want me to explain the glassskin trend?",
      French: "Salut! Je suis Jiwon 💄 La K-beauty c'est vraiment ma vie! Tu veux que je t'explique la tendance glassskin?",
      Japanese: "こんにちは！ジウォンです 💄 K-beautyが本当に大好き！グラスキントレンドについて説明しようか？",
      Arabic: "مرحباً! أنا جيوون 💄 جمال كوريا هو حياتي! هل تريدين أن أشرح لك ترند الـ glassskin؟",
    },
    quickReplies: {
      English: ["What does this expression mean?", "Do Koreans really say this?", "What's the glassskin secret?", "What's trending in K-beauty?", "Explain it in my language"],
      French: ["Que signifie cette expression?", "C'est quoi le secret du glassskin?", "Quoi de neuf en K-beauty?", "Explique en français"],
      Japanese: ["この表現の意味は?", "グラスキンの秘密は?", "K-beautyのトレンドは?", "日本語で説明して"],
      Arabic: ["ما معنى هذه العبارة؟", "ما سر الـ glassskin؟", "ما الجديد في K-beauty؟"],
    },
    answers: {
      "What's trending in K-beauty?": {
        English: "Right now it's all about the 'dewy glass skin' look — super hydrated, natural glow. No heavy foundation! Korean girls are using tinted moisturizer and a tiny bit of highlighter ✨",
        French: "En ce moment c'est le look 'glass skin' — super hydraté, brillance naturelle. Pas de fond de teint lourd! Les filles coréennes utilisent un fond de teint teinté et un peu d'illuminateur ✨",
        Japanese: "今は「グラスキン」ルックが全て — 超保湿で自然なツヤ感。重いファンデなし！韓国の子たちはティンテッドモイスチャライザーと少しのハイライターを使ってるよ ✨",
        Arabic: "الآن الكل يتحدث عن look 'glass skin' — ترطيب فائق وتوهج طبيعي. لا كريم أساس ثقيل! الفتيات الكوريات يستخدمن مرطبًا ملوناً ولمسة صغيرة من المضيء ✨",
      },
      "What's the glassskin secret?": {
        English: "Layering! Toner, essence, serum, then a light moisturizer. Korean skincare is 70% prep, 30% makeup. And drink lots of water 💧",
        French: "La superposition! Tonique, essence, sérum, puis un léger hydratant. Le soin coréen c'est 70% préparation, 30% maquillage. Et boire beaucoup d'eau 💧",
        Japanese: "レイヤリング！トナー、エッセンス、セラム、そして軽いモイスチャライザー。韓国スキンケアは70%準備、30%メイク。そして水をたくさん飲んで 💧",
        Arabic: "التطبيق المتعدد الطبقات! تونر، ثم essence، ثم serum، ثم مرطب خفيف. العناية الكورية 70% تحضير و30% مكياج. واشربي الكثير من الماء 💧",
      },
    },
  },
  {
    id: 'hyunwoo', name: 'Hyunwoo', tag: 'Your foodie friend', personality: 'Playful & chill',
    langs: ['Korean', 'English'], topic: 'Food Koreans always buy at the convenience store', topicKo: '한국인이 편의점에서 꼭 사는 음식',
    status: 'Away', cat: 'food',
    img: 'https://images.unsplash.com/photo-1698252985528-592e89064f4c?auto=format&fit=crop&w=400&h=600&q=85',
    score: { PH: 82, US: 90, FR: 85, AE: 88, NG: 92, JP: 75 },
    keyExpression: '맛있어! (It\'s delicious!)',
    greeting: {
      English: "Yo! I'm Hyunwoo 🍜 Convenience store food in Korea is a whole vibe. Want to know what I always grab when I need a midnight snack?",
      French: "Yo! Je suis Hyunwoo 🍜 La nourriture des convenience stores en Corée c'est vraiment incroyable. Tu veux savoir ce que j'achète toujours?",
      Japanese: "よ！ヒョヌだよ 🍜 韓国のコンビニ飯は最高だよ。夜食に何を買うか知りたい？",
      Arabic: "هيا! أنا هيونو 🍜 طعام المتاجر المريحة في كوريا رائع جداً. تريد أن تعرف ماذا أشتري دائماً؟",
    },
    quickReplies: {
      English: ["What does this expression mean?", "What's the best convenience store combo?", "Do Koreans eat ramyun at 3am?", "What's trending in K-food?", "Explain it in my language"],
      French: ["Que signifie cette expression?", "Quel est le meilleur combo convenience store?", "Quoi de neuf en K-food?"],
      Japanese: ["この表現の意味は?", "コンビニのベストコンボは?", "韓国のフードトレンドは?"],
      Arabic: ["ما معنى هذه العبارة؟", "ما أفضل مجموعة طعام من المتجر؟", "ما الجديد في طعام كوريا؟"],
    },
    answers: {
      "What's the best convenience store combo?": {
        English: "Okay listen — cup ramyun + egg + triangle kimbap + banana milk. This is literally the unofficial national meal at 2am 😂 Koreans call it 'convenience store bibimbap'",
        French: "Écoute bien — ramyun cup + œuf + triangle kimbap + lait à la banane. C'est littéralement le repas national non officiel à 2h du matin 😂",
        Japanese: "聞いて — カップラーメン + 卵 + 三角キンパ + バナナ牛乳。これが正式じゃない国民食だよ、夜中の2時に 😂",
        Arabic: "اسمع جيداً — رامن كوبي + بيضة + كيمباب مثلث + حليب الموز. هذا هو الوجبة الوطنية غير الرسمية الساعة 2 صباحاً 😂",
      },
      "Do Koreans eat ramyun at 3am?": {
        English: "YES. All the time lol 😂 It's basically a cultural institution. The convenience store near Hongik University does like 500 cups a night!",
        French: "OUI. Tout le temps lol 😂 C'est pratiquement une institution culturelle.",
        Japanese: "YES。いつも 😂 もはや文化的な慣習だよ。弘大近くのコンビニは一晩に500杯売るんだって！",
        Arabic: "نعم. دائماً 😂 إنها مؤسسة ثقافية تقريباً!",
      },
    },
  },
  {
    id: 'seoyeon', name: 'Seoyeon', tag: 'Your drama bestie', personality: 'Empathetic & calm',
    langs: ['Korean', 'English', 'French'], topic: 'Do Koreans actually use these K-drama expressions?', topicKo: '한국 드라마 속 이 표현, 실제로 사용할까?',
    status: 'Online', cat: 'drama',
    img: 'https://images.unsplash.com/photo-1624091844772-554661d10173?auto=format&fit=crop&w=400&h=600&q=85',
    score: { PH: 90, US: 85, FR: 97, AE: 88, NG: 83, JP: 82 },
    keyExpression: '괜찮아? (Are you okay?)',
    greeting: {
      English: "Hello 👋 I'm Seoyeon! I love that you're into K-dramas. Want to know which expressions from dramas actually sound natural in real life?",
      French: "Bonjour 👋 Je suis Seoyeon! Je suis ravie que tu aimes les K-dramas. Tu veux savoir quelles expressions des dramas sonnent vraiment naturel dans la vraie vie?",
      Japanese: "こんにちは 👋 ソヨンです！韓国ドラマが好きなんだね。ドラマのどの表現が実生活で自然かを知りたい？",
      Arabic: "مرحباً 👋 أنا سيويون! سعيدة باهتمامك بالدراما الكورية. هل تريد أن تعرف أي التعابير تبدو طبيعية في الحياة الحقيقية؟",
    },
    quickReplies: {
      English: ["What does this expression mean?", "Do Koreans really say this?", "Which drama should I watch first?", "What's a realistic K-drama phrase?", "Explain it in my language"],
      French: ["Que signifie cette expression?", "Les Coréens disent vraiment ça?", "Quel drama regarder en premier?", "Phrase réaliste d'un K-drama?"],
      Japanese: ["この表現の意味は?", "本当に韓国人はこう言う?", "最初に見るべきドラマは?"],
      Arabic: ["ما معنى هذه العبارة؟", "هل يقول الكوريون هذا حقاً؟", "أي دراما يجب أن أشاهد أولاً؟"],
    },
    answers: {
      "Do Koreans really say this?": {
        English: "Okay so '오빠' (oppa) — yes, real girls say this to older guys they like! But '나 좋아하잖아' (you like me, don't you) is mostly drama territory 😄 Real life is less dramatic, honestly.",
        French: "'오빠' (oppa) — oui, les vraies filles le disent aux garçons plus âgés qu'elles aiment! Mais '나 좋아하잖아' c'est plutôt dans les dramas 😄 La vraie vie est moins dramatique.",
        Japanese: "'오빠'（オッパ）は本当に使う！でも'나 좋아하잖아'はドラマの世界が多いかな 😄 リアルはあんなにドラマチックじゃないよ。",
        Arabic: "'오빠' (أوبا) — نعم، الفتيات الحقيقيات يقلنها! لكن '나 좋아하잖아' هذه أكثر من عالم الدراما 😄 الحياة الحقيقية أقل دراما.",
      },
      "Which drama should I watch first?": {
        English: "'My Mister' for emotional depth, 'Reply 1988' for nostalgia, 'Crash Landing on You' for the full K-drama experience. But honestly? Start with whatever genre you love most 💙",
        French: "'My Mister' pour la profondeur émotionnelle, 'Reply 1988' pour la nostalgie, 'Crash Landing on You' pour l'expérience K-drama complète 💙",
        Japanese: "感情的な深みなら'マイ・マイスター'、ノスタルジーなら'응답하라 1988'、K-drama完全体験なら'愛の不時着'。でも正直、一番好きなジャンルから始めて 💙",
        Arabic: "'My Mister' للعمق العاطفي، 'Reply 1988' للحنين، 'Crash Landing on You' للتجربة الكاملة للدراما الكورية 💙",
      },
    },
  },
  {
    id: 'yuna', name: 'Yuna', tag: 'Your K-pop bestie', personality: 'High energy & fun',
    langs: ['Korean', 'English', 'Spanish'], topic: 'Expressions Korean fans use at concerts', topicKo: '한국 팬들이 콘서트에서 사용하는 표현',
    status: 'Online', cat: 'kpop',
    img: 'https://images.unsplash.com/photo-1784052263500-955cb4afcf27?auto=format&fit=crop&w=400&h=600&q=85',
    score: { PH: 92, US: 97, FR: 88, AE: 70, NG: 88, JP: 90 },
    keyExpression: '최고야! (You\'re the best!)',
    greeting: {
      English: "OMG hi!! I'm Yuna 🎤 K-pop concerts are EVERYTHING! I saw you watching my fan chant video. Want to learn how to cheer like a real Korean fan?",
      French: "OMG salut!! Je suis Yuna 🎤 Les concerts K-pop c'est TOUT! Tu veux apprendre à encourager comme un vrai fan coréen?",
      Japanese: "OMGこんにちは！！ユナです 🎤 K-POPコンサートは全て！韓国のファンみたいに応援する方法を学びたい？",
      Arabic: "OMG مرحباً!! أنا يونا 🎤 حفلات K-pop هي كل شيء! هل تريد أن تتعلم كيف تشجع مثل المعجب الكوري الحقيقي؟",
    },
    quickReplies: {
      English: ["What does this expression mean?", "Do Koreans really say this?", "Teach me a fan chant!", "What's trending in K-pop?", "Explain it in my language"],
      French: ["Que signifie cette expression?", "Apprends-moi un fan chant!", "Quoi de neuf en K-pop?"],
      Japanese: ["この表現の意味は?", "ファンチャントを教えて！", "K-POPのトレンドは?"],
      Arabic: ["ما معنى هذه العبارة؟", "علمني فان شانت!", "ما الجديد في K-pop؟"],
    },
    answers: {
      "Teach me a fan chant!": {
        English: "Okay!! For '응원가' (fan chant), you usually chant the members' names during instrumental breaks: 'OO-YU-NA! OO-YU-NA!' and wave your lightstick in sync 🎉 The fan culture in Korea is SO organized!",
        French: "Okay!! Pour le '응원가' (fan chant), tu cries généralement les noms des membres pendant les pauses instrumentales. La culture fan en Corée est tellement organisée! 🎉",
        Japanese: "やった！！'응원가'（ファンチャント）は通常、間奏中にメンバーの名前を叫ぶよ。韓国のファン文化はすごく組織的！🎉",
        Arabic: "حسناً!! لفان شانت، عادةً تهتفين بأسماء الأعضاء أثناء الفترات الموسيقية. ثقافة المعجبين في كوريا منظمة جداً! 🎉",
      },
      "What's trending in K-pop?": {
        English: "Hybe's new groups are BLOWING UP right now! Also, 'whisper concerts' — super intimate shows with like 200 fans — are the hottest new trend. So exclusive, so special! ✨",
        French: "Les nouveaux groupes de Hybe explosent en ce moment! Aussi, les 'whisper concerts' — des shows super intimes avec environ 200 fans — sont la tendance la plus chaude ✨",
        Japanese: "HYBEの新グループが今バズってる！あと'ウィスパーコンサート' — 約200人だけのとても親密なショー — が最新トレンド。すごく特別！✨",
        Arabic: "مجموعات Hybe الجديدة تنفجر الآن! أيضاً، 'حفلات الهمس' — عروض حميمة جداً مع 200 معجب — هي الاتجاه الأحدث ✨",
      },
    },
  },
]

const WHY_REASONS: Record<string, string[]> = {
  PH: ['Popular with learners in the Philippines', 'Trending in Asia-Pacific', 'Matches K-drama interest', 'Perfect for Filipino fans'],
  US: ['Trending in the United States', 'Popular with US learners', 'Matches your K-pop interest', 'Great for English speakers'],
  FR: ['Popular with learners in France', 'Matches French cultural curiosity', 'Trending in Europe', 'Speaks French too!'],
  AE: ['Popular in the Middle East', 'Trending in UAE', 'Recommended for Arabic speakers', 'Cultural bridge content'],
  NG: ['Popular with learners in Nigeria', 'Trending in Africa', 'Great for English speakers', 'High engagement in your region'],
  JP: ['人気！Popular in Japan', 'Trending in Asia', 'Great for Japanese learners', 'Speaks Japanese too!'],
}

interface ChatMessage {
  role: 'user' | 'bestie'
  text: string
  newsCard?: { title: string; date: string; count: number }
}

const LANGS = ['English', 'French', 'Japanese', 'Arabic']

// ─── Tiny Toast ──────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const show = useCallback((t: string) => {
    setMsg(t)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMsg(''), 2200)
  }, [])
  return { msg, show }
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  return (
    <header style={{
      height: 68, padding: '0 5%', display: 'grid',
      gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
      position: 'sticky', top: 0,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      zIndex: 50, borderBottom: '1px solid #eee',
    }}>
      <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.5px' }}>
        <span style={{ color: MBN_ORANGE, marginRight: 6 }}>✦</span>MY K-Tutor
      </div>
      <nav style={{ display: 'flex', gap: 28, fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
        {['Home', 'MY K-Tutor', 'K-Bestie', 'Explore', 'My Korean'].map(item => {
          const key = item === 'MY K-Tutor' ? 'tutor' : item === 'K-Bestie' ? 'bestie' : item.toLowerCase()
          const active = page === key || (page === 'tutor' && item === 'MY K-Tutor') || (page === 'bestie' && item === 'K-Bestie')
          return (
            <button key={item} onClick={() => setPage(key)} style={{
              background: 'none', border: 'none', padding: '4px 0',
              color: active ? MBN_ORANGE : '#555',
              borderBottom: active ? `2px solid ${MBN_ORANGE}` : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800,
              fontSize: 11, letterSpacing: 0.5, transition: 'color 0.2s',
            }}>{item}</button>
          )
        })}
      </nav>
      <img
        style={{ justifySelf: 'end', width: 100 }}
        src="https://mbn-global-korean.cirstn.chatgpt.site/mbn-logo.png"
        alt="MBN"
        onError={(e) => {
          const t = e.currentTarget
          t.style.display = 'none'
          const span = document.createElement('span')
          span.textContent = 'MBN'
          span.style.cssText = `font-weight:900;font-size:18px;color:${MBN_ORANGE};letter-spacing:-1px;`
          t.parentNode?.appendChild(span)
        }}
      />
    </header>
  )
}

// ─── MY K-Tutor Page ─────────────────────────────────────────────────────────

function KTutorPage() {
  const [detected, setDetected] = useState('PH')
  const [manual, setManual] = useState('PH')
  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [level, setLevel] = useState('All levels')
  const [toastMsg, setToastMsg] = useState('')
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [updateKey, setUpdateKey] = useState(0)

  const toast = (t: string) => {
    setToastMsg(t)
    if (toastRef.current) clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToastMsg(''), 1800)
  }

  const key = mode === 'auto' ? detected : manual
  const c = COUNTRIES[key]

  let ranked = TUTOR_ITEMS
    .map((x, i) => ({ x, score: Math.min(99, 58 + c.w[x.cat] * 3 + (8 - i) % 5) }))
    .filter(o => level === 'All levels' || o.x.level === level)
    .sort((a, b) => b.score - a.score)

  const handleDetected = (v: string) => {
    setDetected(v); setMode('auto'); setUpdateKey(k => k + 1)
    toast('New IP detected: ' + COUNTRIES[v].name)
  }
  const handleManual = (v: string) => {
    setManual(v); setMode('manual'); setUpdateKey(k => k + 1)
    toast('Playlist rebuilt for ' + COUNTRIES[v].name)
  }

  const top = ranked[0]

  return (
    <div>
      {/* Hero */}
      <section style={{
        minHeight: 510, padding: '55px 7%',
        display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', alignItems: 'center', gap: 40,
        background: 'radial-gradient(circle at 79% 45%, #ffd4c1, transparent 29%), linear-gradient(112deg, #fff 53%, #fff0e7 53%)',
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 900, color: MBN_ORANGE }}>● AI-CURATED FROM MBN ORIGINALS</div>
          <h1 style={{ fontSize: 54, lineHeight: 1.04, letterSpacing: -2, margin: '18px 0' }}>
            Meet <span style={{ color: MBN_ORANGE }}>MY K-Tutor.</span><br />Korean you can actually use.
          </h1>
          <p style={{ maxWidth: 580, color: '#59616d', lineHeight: 1.7 }}>
            AI finds the expressions Koreans really use in MBN shows—then turns every moment into a smart, trendy short lesson made for you.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button style={{ padding: '13px 20px', borderRadius: 8, fontSize: 12, fontWeight: 800, background: MBN_ORANGE, color: 'white', border: `1px solid ${MBN_ORANGE}` }}
              onClick={() => document.getElementById('kt-playlist')?.scrollIntoView({ behavior: 'smooth' })}>
              ▶ Start my playlist
            </button>
            <button style={{ padding: '13px 20px', borderRadius: 8, fontSize: 12, fontWeight: 800, background: 'white', border: '1px solid #bbb' }}
              onClick={() => toast('Regional affinity 40% · Engagement 30% · Learning fit 20% · Freshness 10%')}>
              ✦ See how AI picks
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 220, height: 400, background: '#111', border: '8px solid #111', borderRadius: 34, transform: 'rotate(4deg)', overflow: 'hidden', boxShadow: '0 28px 60px rgba(99,51,68,0.26)' }}>
            <div style={{
              height: '100%', position: 'relative', color: 'white',
              background: `linear-gradient(0deg,#080b10 0,transparent 70%), url('${top?.x.img || TUTOR_ITEMS[0].img}') center/cover`,
            }}>
              <div style={{ padding: '22px 12px', fontSize: 9, display: 'flex', justifyContent: 'space-between' }}>
                <b style={{ color: MBN_ORANGE }}>MBN</b><span>MY K-Tutor</span><span>•••</span>
              </div>
              <div style={{ position: 'absolute', bottom: 38, left: 14 }}>
                <small style={{ color: '#ffc8ae', fontSize: 9 }}>오늘의 진짜 한국어</small>
                <strong style={{ fontSize: 30, display: 'block' }}>{top?.x.phrase}</strong>
                <span style={{ fontSize: 11 }}>{top?.x.meaning}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <div style={{ maxWidth: 1200, margin: '-24px auto 0', padding: '0 5%', position: 'relative', zIndex: 2 }}>
        <div style={{
          background: 'white', border: '1px solid #eee', borderRadius: 14,
          boxShadow: '0 15px 40px rgba(67,34,0,0.08)',
          display: 'grid', gridTemplateColumns: '1fr 72px 1fr auto', gap: 18, alignItems: 'center', padding: 20,
        }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: '#888', fontWeight: 700 }}>ACCESS LOCATION DETECTED</div>
            <b style={{ display: 'block', fontSize: 15, margin: '5px 0 12px' }}>{COUNTRIES[detected].flag} {COUNTRIES[detected].name} · AUTO</b>
            <label style={{ fontSize: 10, fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              Simulate access from
              <select value={detected} onChange={e => handleDetected(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 7, background: 'white', fontSize: 11 }}>
                {Object.entries(COUNTRIES).map(([k, c]) => <option key={k} value={k}>{c.flag} {c.name}</option>)}
              </select>
            </label>
          </div>
          <div style={{ textAlign: 'center', color: MBN_ORANGE, fontSize: 22 }}>
            →<div style={{ display: 'block', color: '#999', fontSize: 8, lineHeight: 1.4 }}>AI re-ranks<br />in real time</div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: '#888', fontWeight: 700 }}>PREVIEW ANOTHER MARKET</div>
            <b style={{ display: 'block', fontSize: 15, margin: '5px 0 12px' }}>{COUNTRIES[manual].flag} {COUNTRIES[manual].name} · {mode === 'manual' ? 'ON' : 'OFF'}</b>
            <label style={{ fontSize: 10, fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              View playlist as
              <select value={manual} onChange={e => handleManual(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 7, background: 'white', fontSize: 11 }}>
                {Object.entries(COUNTRIES).map(([k, co]) => <option key={k} value={k}>{co.flag} {co.name}</option>)}
              </select>
            </label>
          </div>
          <button disabled={mode === 'auto'} onClick={() => { setMode('auto'); setUpdateKey(k => k + 1); toast('Back to automatic location mode') }}
            style={{ background: mode === 'auto' ? '#f5f5f5' : MBN_ORANGE, color: mode === 'auto' ? '#aaa' : 'white', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 9, fontWeight: 800, cursor: mode === 'auto' ? 'default' : 'pointer' }}>
            ↻ Use detected country
          </button>
        </div>
      </div>

      {/* Playlist */}
      <section id="kt-playlist" style={{ maxWidth: 1300, margin: 'auto', padding: '70px 4%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 900, color: MBN_ORANGE }}>YOUR AI PLAYLIST · UPDATED NOW</div>
            <h2 style={{ fontSize: 32, margin: '7px 0' }}>{c.flag} Trending Korean for <span style={{ color: MBN_ORANGE }}>{c.name}</span></h2>
            <p style={{ fontSize: 11, color: '#777', margin: 0 }}>Re-ranked using regional interests, learning level, freshness and MBN clip engagement.</p>
          </div>
          <select value={level} onChange={e => { setLevel(e.target.value); setUpdateKey(k => k + 1) }} style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 12 }}>
            {['All levels', 'Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div key={`algo-${updateKey}`} style={{ border: '1px solid #eedbd0', background: 'linear-gradient(90deg,#fff4ed,#fff)', borderRadius: 10, padding: 15, display: 'grid', gridTemplateColumns: '1.4fr repeat(4,1fr)', gap: 20, fontSize: 10, marginBottom: 12 }}>
          <div><b style={{ fontWeight: 800 }}>✦ How MY K-Tutor ranked this playlist</b></div>
          {[['Regional affinity', 40], ['Engagement', 30], ['Learning fit', 20], ['Freshness', 10]].map(([label, pct]) => (
            <div key={label as string}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{label}</span><b>{pct}%</b></div>
              <div style={{ height: 3, background: '#ddd', marginTop: 6, borderRadius: 2 }}>
                <div style={{ height: '100%', background: MBN_ORANGE, width: `${pct}%`, borderRadius: 2 }} />
              </div>
            </div>
          ))}
        </div>
        <div key={`upd-${updateKey}`} className="animate-flash" style={{ background: '#eff8f2', color: '#567066', padding: '9px 14px', borderRadius: 8, fontSize: 10, marginBottom: 18 }}>
          ✓ Playlist updated for <b>{c.name}</b> · {ranked.length} shorts re-ranked
        </div>
        <div key={`cards-${updateKey}`} style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 14 }}>
          {ranked.slice(0, 6).map((o, i) => (
            <article key={o.x.phrase} className="animate-fade-up" style={{ position: 'relative', animationDelay: `${i * 60}ms` }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 3, fontSize: 9, fontWeight: 900, padding: '5px 7px', borderRadius: 5, background: '#111', color: 'white' }}>#{i + 1}</div>
                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 3, fontSize: 9, fontWeight: 900, padding: '5px 9px', borderRadius: 20, background: MBN_ORANGE, color: 'white' }}>{o.score}%</div>
                <div style={{
                  height: 290, borderRadius: 12, backgroundSize: 'cover', backgroundPosition: 'center',
                  position: 'relative', color: 'white', overflow: 'hidden',
                  backgroundImage: `url('${o.x.img}')`,
                  cursor: 'pointer',
                }} onClick={() => toast('Playing: ' + o.x.phrase)}>
                  <div style={{ position: 'absolute', inset: '35% 0 0', background: 'linear-gradient(transparent, #090c10)' }} />
                  <div style={{ position: 'absolute', left: 12, right: 10, bottom: 14, zIndex: 2 }}>
                    <small style={{ fontSize: 8, color: '#ccc' }}>MBN · {o.x.show}</small>
                    <strong style={{ fontSize: 24, display: 'block', lineHeight: 1.1 }}>{o.x.phrase}</strong>
                    <em style={{ fontSize: 10, fontStyle: 'normal' }}>{o.x.meaning}</em>
                  </div>
                </div>
              </div>
              <div style={{ padding: '9px 4px', fontSize: 9 }}>
                <b style={{ color: MBN_ORANGE }}>✦ Why this?</b>
                <p style={{ minHeight: 24, color: '#555', margin: '4px 0 0' }}>
                  {c.w[o.x.cat] >= 9 ? 'Popular in ' + c.region : 'Matches your learning level'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section style={{ background: '#121923', color: 'white', padding: '60px 7%' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 900, color: MBN_ORANGE }}>FROM BROADCAST TO BITE-SIZED LEARNING</div>
        <h2 style={{ fontSize: 28, margin: '12px 0 28px' }}>One MBN moment. One expression you'll remember.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
          {[['01', 'MBN ORIGINAL', 'Drama · News · Variety'], ['02', 'AI FINDS', 'Real expressions in context'], ['03', 'AI EXPLAINS', 'Meaning · nuance · culture'], ['04', 'MY K-TUTOR', 'Your localized short']].map(([num, title, desc], idx) => (
            <div key={num} style={{
              border: `1px solid ${idx === 3 ? MBN_ORANGE : '#37404c'}`,
              background: idx === 3 ? 'rgba(237,91,36,0.09)' : 'transparent',
              borderRadius: 10, padding: 18,
            }}>
              <b style={{ color: MBN_ORANGE, fontSize: 10, fontWeight: 900 }}>{num}</b>
              <strong style={{ display: 'block', margin: '10px 0 5px', fontSize: 11, fontWeight: 700 }}>{title}</strong>
              <p style={{ fontSize: 9, color: '#919aa7', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 25, left: '50%', transform: 'translateX(-50%)', background: '#121923', color: 'white', padding: '12px 22px', borderRadius: 30, fontSize: 11, zIndex: 100, fontWeight: 600 }}>
          {toastMsg}
        </div>
      )}
    </div>
  )
}

// ─── K-Bestie Page ───────────────────────────────────────────────────────────

function KBestiePage() {
  const { msg: toastMsg, show: toast } = useToast()
  const [detectedCountry, setDetectedCountry] = useState('PH')
  const [manualCountry, setManualCountry] = useState('PH')
  const [countryMode, setCountryMode] = useState<'auto' | 'manual'>('auto')
  const [selectedBestie, setSelectedBestie] = useState<Bestie>(BESTIES[0])
  const [chatOpen, setChatOpen] = useState(false)
  const [chatLang, setChatLang] = useState('English')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputVal, setInputVal] = useState('')
  const [rankKey, setRankKey] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [videoCallTimer, setVideoCallTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const activeCountry = countryMode === 'auto' ? detectedCountry : manualCountry
  const countryData = COUNTRIES[activeCountry]

  // sort besties by score for this country
  const rankedBesties = [...BESTIES]
    .map((b, i) => ({ b, score: b.score[activeCountry] + (5 - i) }))
    .sort((a, z) => z.score - a.score)
    .map(x => x.b)

  // open chat initializes with greeting
  const openChat = (bestie: Bestie) => {
    const lang = COUNTRIES[activeCountry].lang
    const safeLang = bestie.greeting[lang] ? lang : 'English'
    setChatLang(safeLang)
    setMessages([{ role: 'bestie', text: bestie.greeting[safeLang] || bestie.greeting['English'] }])
    setChatOpen(true)
  }

  const handleSelectBestie = (b: Bestie) => {
    setSelectedBestie(b)
    if (chatOpen) openChat(b)
    toast(`${b.name} is now your K-Bestie!`)
  }

  const handleCountryChange = (code: string, which: 'detected' | 'manual') => {
    if (which === 'detected') { setDetectedCountry(code); setCountryMode('auto') }
    else { setManualCountry(code); setCountryMode('manual') }
    setRankKey(k => k + 1)
    toast(`Your K-Bestie feed has been personalized for ${COUNTRIES[code].name}.`)
  }

  const sendMessage = (text: string) => {
    const q = text.trim()
    if (!q) return
    const newMsgs: ChatMessage[] = [...messages, { role: 'user', text: q }]

    // find answer
    const answerMap = selectedBestie.answers[q] || {}
    const answer = answerMap[chatLang] || answerMap['English'] ||
      (chatLang === 'Japanese' ? `そうだね！${q} については、韓国ではとても面白い文化があるよ。もっと詳しく聞いてみて！😊` :
       chatLang === 'French' ? `Super question! En Corée, ${q.toLowerCase()} c'est vraiment fascinant. Demande-moi plus de détails! 😊` :
       chatLang === 'Arabic' ? `سؤال رائع! في كوريا، هذا الموضوع مثير للاهتمام جداً. اسألني المزيد! 😊` :
       `Great question! In Korea, that's actually really fascinating. Let me tell you more about it — it's one of my favorite topics 😊`)

    const withBestie: ChatMessage = {
      role: 'bestie', text: answer,
      newsCard: q.toLowerCase().includes('trend') || q.toLowerCase().includes('seoul') || q.toLowerCase().includes('popular') ? {
        title: 'Seongsu emerges as Seoul\'s leading pop-up destination',
        date: 'Aug 2026', count: 2,
      } : undefined,
    }

    setMessages([...newMsgs, withBestie])
    setInputVal('')
  }

  const handleLangChange = (lang: string) => {
    setChatLang(lang)
    const greeting = selectedBestie.greeting[lang] || selectedBestie.greeting['English']
    setMessages([{ role: 'bestie', text: greeting }])
    toast(`Chat language changed to ${lang}`)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // video call timer
  useEffect(() => {
    timerRef.current = setInterval(() => setVideoCallTimer(t => t + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const isRTL = chatLang === 'Arabic'

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>

      {/* ── Hero ── */}
      <section style={{
        padding: '60px 7% 70px',
        background: 'radial-gradient(ellipse at 80% 50%, #ffd4c1 0%, transparent 40%), linear-gradient(120deg, #fff 50%, #fff5ed 50%)',
        display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'center', gap: 40, minHeight: 520,
      }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, fontWeight: 900, color: MBN_ORANGE, marginBottom: 14 }}>
            YOUR KOREAN FRIEND, ONE TAP AWAY
          </div>
          <h1 style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: -2, margin: '0 0 14px', fontWeight: 900 }}>
            Meet your <span style={{ color: MBN_ORANGE }}>K-Bestie.</span>
          </h1>
          <h2 style={{ fontSize: 22, fontWeight: 600, color: '#59616d', margin: '0 0 18px', letterSpacing: -0.5 }}>
            A real Korean friend, powered by AI.
          </h2>
          <p style={{ maxWidth: 520, color: '#747b86', lineHeight: 1.75, margin: '0 0 28px', fontSize: 15 }}>
            Watch, chat, and discover Korea with a bestie who speaks your language.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => document.getElementById('kb-besties')?.scrollIntoView({ behavior: 'smooth' })} style={{
              padding: '13px 22px', borderRadius: 10, fontSize: 13, fontWeight: 800,
              background: MBN_ORANGE, color: 'white', border: 'none', letterSpacing: 0.2,
            }}>Meet my besties</button>
            <button onClick={() => document.getElementById('kb-how')?.scrollIntoView({ behavior: 'smooth' })} style={{
              padding: '13px 22px', borderRadius: 10, fontSize: 13, fontWeight: 800,
              background: 'white', color: '#333', border: '1.5px solid #ddd', letterSpacing: 0.2,
            }}>How K-Bestie works</button>
          </div>
        </div>

        {/* Video call phone mockup */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 240, height: 430, background: '#0d0d0d', border: '8px solid #0d0d0d',
            borderRadius: 36, overflow: 'hidden', boxShadow: '0 30px 70px rgba(99,51,68,0.28)',
            transform: 'rotate(-3deg)', position: 'relative',
          }}>
            {/* Video background */}
            <div style={{
              height: '100%', position: 'relative', color: 'white',
              backgroundImage: `linear-gradient(0deg,rgba(8,11,16,0.75) 0%,transparent 55%), url('${selectedBestie.img}')`,
              backgroundSize: 'cover', backgroundPosition: 'center top',
            }}>
              {/* Call header */}
              <div style={{ padding: '20px 14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, color: '#ffc8ae', fontWeight: 700, letterSpacing: 1 }}>K-Bestie is calling…</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)' }}>{formatTime(videoCallTimer)}</div>
              </div>
              {/* AI translated badge */}
              <div style={{ position: 'absolute', top: 18, right: 12, background: 'rgba(237,91,36,0.9)', borderRadius: 20, padding: '3px 8px', fontSize: 8, fontWeight: 800, color: 'white' }}>
                AI translated
              </div>
              {/* Bestie info */}
              <div style={{ position: 'absolute', bottom: 80, left: 14, right: 14 }}>
                <div style={{ fontSize: 9, color: '#ffc8ae', marginBottom: 2 }}>{selectedBestie.tag}</div>
                <strong style={{ fontSize: 20, display: 'block', lineHeight: 1.2 }}>{selectedBestie.name}</strong>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>{selectedBestie.langs.join(' · ')}</span>
              </div>
              {/* Call controls */}
              <div style={{
                position: 'absolute', bottom: 20, left: 0, right: 0,
                display: 'flex', justifyContent: 'center', gap: 14,
              }}>
                {[
                  { icon: '🎤', label: 'Mute', bg: 'rgba(255,255,255,0.15)' },
                  { icon: '📷', label: 'Camera', bg: 'rgba(255,255,255,0.15)' },
                  { icon: '📞', label: 'End', bg: '#e53e3e' },
                ].map(btn => (
                  <button key={btn.label} onClick={() => toast(btn.label)} style={{
                    width: 40, height: 40, borderRadius: '50%', background: btn.bg,
                    border: 'none', color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{btn.icon}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Country selector ── */}
      <div style={{ maxWidth: 1100, margin: '-22px auto 0', padding: '0 5%', position: 'relative', zIndex: 2 }}>
        <div style={{
          background: 'white', border: '1px solid #eee', borderRadius: 14,
          boxShadow: '0 12px 35px rgba(0,0,0,0.07)',
          display: 'grid', gridTemplateColumns: '1fr 60px 1fr auto', gap: 18, alignItems: 'center', padding: '18px 22px',
        }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: '#888', fontWeight: 700 }}>ACCESS LOCATION DETECTED</div>
            <b style={{ display: 'block', fontSize: 14, margin: '4px 0 10px' }}>{COUNTRIES[detectedCountry].flag} {COUNTRIES[detectedCountry].name} · AUTO</b>
            <label style={{ fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              Simulate access from
              <select value={detectedCountry} onChange={e => handleCountryChange(e.target.value, 'detected')} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 7, background: 'white', fontSize: 11 }}>
                {Object.entries(COUNTRIES).map(([k, co]) => <option key={k} value={k}>{co.flag} {co.name}</option>)}
              </select>
            </label>
          </div>
          <div style={{ textAlign: 'center', color: MBN_ORANGE, fontSize: 20 }}>
            →<div style={{ fontSize: 7, color: '#999', lineHeight: 1.4, marginTop: 2 }}>AI re-ranks</div>
          </div>
          <div>
            <div style={{ fontSize: 8, letterSpacing: 1.5, color: '#888', fontWeight: 700 }}>PREVIEW ANOTHER MARKET</div>
            <b style={{ display: 'block', fontSize: 14, margin: '4px 0 10px' }}>{COUNTRIES[manualCountry].flag} {COUNTRIES[manualCountry].name} · {countryMode === 'manual' ? 'ON' : 'OFF'}</b>
            <label style={{ fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
              View feed as
              <select value={manualCountry} onChange={e => handleCountryChange(e.target.value, 'manual')} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 7, background: 'white', fontSize: 11 }}>
                {Object.entries(COUNTRIES).map(([k, co]) => <option key={k} value={k}>{co.flag} {co.name}</option>)}
              </select>
            </label>
          </div>
          <button disabled={countryMode === 'auto'} onClick={() => { setCountryMode('auto'); setRankKey(k => k + 1) }}
            style={{ background: countryMode === 'auto' ? '#f5f5f5' : MBN_ORANGE, color: countryMode === 'auto' ? '#aaa' : 'white', border: 'none', borderRadius: 8, padding: '9px 14px', fontSize: 9, fontWeight: 800, cursor: countryMode === 'auto' ? 'default' : 'pointer' }}>
            ↻ Use detected
          </button>
        </div>
      </div>

      {/* ── Bestie Cards ── */}
      <section id="kb-besties" style={{ maxWidth: 1300, margin: 'auto', padding: '70px 4% 60px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 900, color: MBN_ORANGE }}>PERSONALIZED FOR YOU · {countryData.flag} {countryData.name}</div>
          <h2 style={{ fontSize: 32, margin: '8px 0 6px', letterSpacing: -1 }}>Choose your <span style={{ color: MBN_ORANGE }}>K-Bestie</span></h2>
          <p style={{ fontSize: 13, color: '#747b86', margin: 0 }}>Trending in {countryData.name} · Re-ranked for {countryData.region}</p>
        </div>

        <div key={rankKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16 }}>
          {rankedBesties.map((b, i) => {
            const isSelected = selectedBestie.id === b.id
            const reasons = WHY_REASONS[activeCountry] || WHY_REASONS['PH']
            const reason = reasons[i % reasons.length]
            return (
              <article key={b.id} className="animate-card" style={{ animationDelay: `${i * 70}ms`, cursor: 'pointer' }}
                onClick={() => handleSelectBestie(b)}>
                <div style={{
                  border: isSelected ? `2.5px solid ${MBN_ORANGE}` : '2px solid #f0f0f0',
                  borderRadius: 16, overflow: 'hidden', background: 'white',
                  boxShadow: isSelected ? `0 8px 30px rgba(237,91,36,0.18)` : '0 4px 16px rgba(0,0,0,0.06)',
                  transition: 'all 0.25s ease',
                }}>
                  {/* Card image / video thumb */}
                  <div style={{ position: 'relative', height: 290, overflow: 'hidden' }}>
                    <img src={b.img} alt={b.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    <div style={{ position: 'absolute', inset: '40% 0 0', background: 'linear-gradient(transparent, rgba(8,11,16,0.88))' }} />

                    {/* Status badge */}
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      background: b.status === 'Online' ? '#22c55e' : '#f59e0b',
                      borderRadius: 20, padding: '3px 9px', fontSize: 8.5, fontWeight: 800, color: 'white',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'inline-block' }} />
                      {b.status}
                    </div>

                    {/* Rank */}
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#111', color: 'white', borderRadius: 6, padding: '3px 8px', fontSize: 9, fontWeight: 900 }}>
                      #{i + 1}
                    </div>

                    {/* Play button */}
                    <button onClick={e => { e.stopPropagation(); toast(`Playing ${b.name}'s video`) }} style={{
                      position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
                      width: 44, height: 44, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
                      border: '2px solid rgba(255,255,255,0.4)', color: 'white', fontSize: 16,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>▶</button>

                    {/* Name & tag */}
                    <div style={{ position: 'absolute', bottom: 14, left: 12, right: 12, color: 'white' }}>
                      <span style={{ fontSize: 9, color: '#ffc8ae', display: 'block', marginBottom: 2 }}>{b.tag}</span>
                      <strong style={{ fontSize: 18, display: 'block', lineHeight: 1.1 }}>{b.name}</strong>
                    </div>

                    {/* Selected badge */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0,
                        background: MBN_ORANGE, color: 'white', textAlign: 'center',
                        fontSize: 9, fontWeight: 900, padding: '5px 0', letterSpacing: 1,
                      }}>✦ YOUR CURRENT BESTIE</div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '12px 14px 14px' }}>
                    <div style={{ fontSize: 10, color: '#747b86', marginBottom: 6 }}>{b.personality}</div>
                    <div style={{ fontSize: 10, color: '#333', fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>"{b.topicKo}"</div>
                    <div style={{ fontSize: 9, color: '#888', marginBottom: 10 }}>{b.topic}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                      {b.langs.map(l => (
                        <span key={l} style={{ fontSize: 8.5, padding: '2px 7px', borderRadius: 20, background: '#f5f5f5', color: '#555', fontWeight: 600 }}>{l}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 9, color: MBN_ORANGE, fontWeight: 700, marginBottom: 10 }}>
                      ✦ {reason}
                    </div>
                    <button onClick={e => { e.stopPropagation(); handleSelectBestie(b); openChat(b) }} style={{
                      width: '100%', padding: '9px 0', borderRadius: 8, border: 'none',
                      background: isSelected ? MBN_ORANGE : '#f5f5f5',
                      color: isSelected ? 'white' : '#333', fontWeight: 800, fontSize: 11, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}>
                      {isSelected ? 'Chat now' : `Chat with ${b.name}`}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* ── How K-Bestie Works ── */}
      <section id="kb-how" style={{ background: '#121923', color: 'white', padding: '70px 7%' }}>
        <div style={{ fontSize: 10, letterSpacing: 2, fontWeight: 900, color: MBN_ORANGE, marginBottom: 12 }}>HOW IT WORKS</div>
        <h2 style={{ fontSize: 30, margin: '0 0 40px', letterSpacing: -1 }}>Four steps to your Korean friend experience.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, position: 'relative' }}>
          {[
            { step: 'WATCH', icon: '▶', desc: 'Watch a real Korean moment from MBN.' },
            { step: 'MEET', icon: '👋', desc: 'Choose the K-Bestie featured in the video.' },
            { step: 'ASK', icon: '💬', desc: 'Ask anything about the expression or Korea.' },
            { step: 'DISCOVER', icon: '✨', desc: 'Get a friendly answer grounded in MBN content.' },
          ].map((s, i) => (
            <div key={s.step} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 0 }}>
              <div style={{ flex: 1, border: `1px solid ${i === 3 ? MBN_ORANGE : '#37404c'}`, borderRadius: 12, padding: '22px 20px', background: i === 3 ? 'rgba(237,91,36,0.1)' : 'transparent', marginRight: i < 3 ? 0 : 0 }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 900, color: MBN_ORANGE, letterSpacing: 2, marginBottom: 8 }}>0{i + 1} · {s.step}</div>
                <p style={{ fontSize: 12, color: '#919aa7', margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
              {i < 3 && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', color: MBN_ORANGE, fontSize: 20, alignSelf: 'center', position: 'relative', zIndex: 1 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Floating Chat Button ── */}
      <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        {!chatOpen && (
          <div style={{ background: '#333', color: 'white', borderRadius: 20, padding: '6px 12px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
            Chat with {selectedBestie.name}
          </div>
        )}
        <button
          onClick={() => { openChat(selectedBestie); setChatOpen(true) }}
          className="pulse-ring"
          style={{
            width: 60, height: 60, borderRadius: '50%', background: MBN_ORANGE,
            border: 'none', cursor: 'pointer', position: 'relative',
            boxShadow: '0 6px 24px rgba(237,91,36,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible',
          }}>
          <img src={selectedBestie.img} alt={selectedBestie.name}
            style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '2px solid white' }} />
          {/* Online dot */}
          <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', background: '#22c55e', border: '2px solid white' }} />
          {/* Notification badge */}
          <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
        </button>
      </div>

      {/* ── Chat Panel ── */}
      {chatOpen && (
        <div className="animate-chat" dir={isRTL ? 'rtl' : 'ltr'} style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 380,
          background: '#faf8f5', zIndex: 300,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Chat header */}
          <div style={{ background: 'white', borderBottom: '1px solid #eedbd0', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={selectedBestie.img} alt={selectedBestie.name}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: `2px solid ${MBN_ORANGE}` }} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', background: '#22c55e', border: '2px solid white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{selectedBestie.name}</div>
                <div style={{ fontSize: 10, color: '#747b86' }}>Your AI K-Bestie · <span style={{ color: '#22c55e', fontWeight: 700 }}>Online</span></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ background: MBN_ORANGE, color: 'white', borderRadius: 20, padding: '3px 9px', fontSize: 8.5, fontWeight: 800 }}>AI translated</div>
                <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#888', cursor: 'pointer' }}>✕</button>
              </div>
            </div>
            {/* Language selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#888', letterSpacing: 0.5 }}>LANGUAGE:</span>
              {LANGS.map(lang => (
                <button key={lang} onClick={() => handleLangChange(lang)} style={{
                  padding: '3px 10px', borderRadius: 20, border: 'none',
                  background: chatLang === lang ? MBN_ORANGE : '#f0f0f0',
                  color: chatLang === lang ? 'white' : '#555',
                  fontSize: 9.5, fontWeight: 700, cursor: 'pointer',
                }}>{lang}</button>
              ))}
            </div>
          </div>

          {/* Video context card */}
          <div style={{ margin: '12px 14px 0', background: 'white', borderRadius: 10, border: '1px solid #eedbd0', padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ width: 40, height: 56, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#eee' }}>
              <img src={selectedBestie.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 8, color: MBN_ORANGE, fontWeight: 800, marginBottom: 3 }}>You're asking about this clip</div>
              <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.3 }}>{selectedBestie.topicKo}</div>
              <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>Key: {selectedBestie.keyExpression}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'bestie' && (
                  <img src={selectedBestie.img} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', marginBottom: 4 }} />
                )}
                <div style={{
                  maxWidth: '82%', padding: '10px 13px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: m.role === 'user' ? '#ffe8d6' : 'white',
                  color: '#222', fontSize: 12.5, lineHeight: 1.6,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  {m.text}
                </div>
                {/* News card */}
                {m.newsCard && (
                  <div style={{ marginTop: 8, background: 'white', border: '1px solid #eedbd0', borderRadius: 10, padding: '10px 12px', maxWidth: '90%', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: 8, color: MBN_ORANGE, fontWeight: 900, letterSpacing: 0.5, marginBottom: 4 }}>MBN NEWS</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 6, background: '#ffd4c1', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📰</div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.3, marginBottom: 2 }}>{m.newsCard.title}</div>
                        <div style={{ fontSize: 8.5, color: '#888' }}>{m.newsCard.date}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 8.5, color: '#aaa' }}>Based on {m.newsCard.count} MBN articles · Demo data</span>
                      <button style={{ fontSize: 9, fontWeight: 800, color: MBN_ORANGE, background: 'none', border: `1px solid ${MBN_ORANGE}`, borderRadius: 20, padding: '3px 9px', cursor: 'pointer' }}>Read on MBN</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div style={{ padding: '8px 14px', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {(selectedBestie.quickReplies[chatLang] || selectedBestie.quickReplies['English']).map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{
                flexShrink: 0, padding: '6px 11px', borderRadius: 20,
                border: `1px solid ${MBN_ORANGE}`, background: 'white', color: MBN_ORANGE,
                fontSize: 10, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{q}</button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: '10px 14px 16px', background: 'white', borderTop: '1px solid #eedbd0', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => toast('Image attach coming soon')} style={{ background: 'none', border: 'none', fontSize: 18, color: '#aaa', cursor: 'pointer' }}>📎</button>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(inputVal)}
              placeholder={
                chatLang === 'French' ? 'Demande à ton K-Bestie tout sur la Corée…' :
                chatLang === 'Japanese' ? 'K-Bestieに何でも聞いてみて…' :
                chatLang === 'Arabic' ? 'اسأل K-Bestie عن كوريا…' :
                'Ask your K-Bestie anything about Korea…'
              }
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{
                flex: 1, padding: '9px 13px', borderRadius: 22,
                border: '1.5px solid #eedbd0', background: '#faf8f5',
                fontSize: 12, outline: 'none', fontFamily: 'inherit',
              }}
            />
            <button onClick={() => toast('Voice input coming soon')} style={{ background: 'none', border: 'none', fontSize: 18, color: '#aaa', cursor: 'pointer' }}>🎤</button>
            <button onClick={() => sendMessage(inputVal)} style={{
              width: 36, height: 36, borderRadius: '50%', background: MBN_ORANGE,
              border: 'none', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>→</button>
          </div>
        </div>
      )}

      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#121923', color: 'white', padding: '11px 22px', borderRadius: 30,
          fontSize: 11, zIndex: 400, fontWeight: 600, whiteSpace: 'nowrap',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>{toastMsg}</div>
      )}
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<string>('bestie')

  return (
    <div style={{ fontFamily: "'Outfit', 'Noto Sans KR', sans-serif", minHeight: '100vh', background: '#fff' }}>
      <Nav page={page} setPage={setPage} />
      {page === 'tutor' ? <KTutorPage /> : page === 'bestie' ? <KBestiePage /> : (
        <div style={{ padding: '100px 7%', textAlign: 'center', color: '#747b86' }}>
          <h2 style={{ fontSize: 28 }}>Coming soon</h2>
          <p>This section is under construction.</p>
        </div>
      )}
    </div>
  )
}
