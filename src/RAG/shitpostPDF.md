Shitpost Analyzer
This document provides an overview of shitposts on social media (particularly X/Twitter), including definitions, characteristics, examples, and guidelines for identification. It is designed for use in a Retrieval Augmented Generation (RAG) system to help classify Twitter post bodies as shitposts or not. Since only the post body (text) will be analyzed, the focus is on textual features.
The content includes:

Definitions and key characteristics.
Numerous examples of shitposts collected from recent X posts.
Examples of non-shitposts for contrast.
A simple Python program for basic shitpost detection based on rules derived from characteristics (e.g., keyword matching, length, capitalization, etc.).
Additional details for advanced analysis (e.g., potential ML approaches using available libraries like Torch).

You can copy this content into a word processor (e.g., Google Docs, Microsoft Word) and export it as a PDF named "shitpost_analyzer.pdf".
1. Definition of a Shitpost
A shitpost is a type of social media post that is intentionally low-effort, absurd, humorous, or provocative, often with little to no value or relevance. It disrupts normal discourse and thrives on reactions. Key sources define it as:

"Utterly worthless and inane posts" (Urban Dictionary via masters of media).
"Deliberately provocative or 'good posts with bad behavior'" – imaginative, funny, and indifferent to quality or reception (Medium articles).
Vulgar or chaotic performance art on social media, often amplified by outraged or engaged responses (Lifehacker, Merriam-Webster).

Shitposts are common on platforms like X, Reddit, and forums, and can include text, images, or memes, but here we focus on text bodies.
2. Characteristics of a Shitpost
Based on web sources, shitposts typically exhibit:

Absurdity or Randomness: Content that makes no sense, is out of context, or wildly exaggerated (e.g., "It's sad that a family can be torn apart by something as simple as wild dogs").
Low Effort/Quality: Short, poorly written, or indifferent to grammar/spelling.
Humor/Irony/Provocation: Sarcasm, irony, or baiting reactions (e.g., racist jokes, over-the-top statements).
Indifference to Reception: Posted without caring about likes, shares, or backlash.
Memetic Elements: References to memes, all caps for emphasis, emojis, or repetitive phrases.
In-Group References: Jokes that mock or appeal to a specific audience (e.g., "in-group making fun").
Negatives for Non-Shitposts: Serious, informative, coherent, or value-adding content (e.g., news, advice, personal stories without absurdity).

Textual indicators for detection (from post bodies):

Short length (<100 characters).
High use of caps, exclamation points, or emojis.
Keywords like "shitpost", "lol", "haha", "wtf", absurd animals/objects, or violent/hyperbolic language.
Lack of structure (no clear point or call to action).

3. Examples of Shitposts
Here are 50+ examples pulled from recent X posts (paraphrased or direct quotes for brevity; original IDs included for reference). These demonstrate absurdity, humor, and low effort.

"It's sad that a family can be torn apart by something as simple as wild dogs" [post:9]
"Saw a couple walking around with matching shirts and matching pants IM GONNA KILL MYSELF" [post:10]
"‘You guys like racist jokes? So a Black, a Jew, and an Arab walk in a bar’" [post:11]
"I almost sent ts then realized it's probably a joke" [post:12]
"T-this maybe? (Is it considered shitpost? Idk) At least my fav among recent shitposts" [post:13]
"A bit buzzed rn and ppl might unfollow for me this but here you go. Shitposting." [post:14]
"one of my many 'shitpost done serious' examples really like the outcome tho" [post:15]
"Gotta say returns from bereavement.mp4 is probably my favorite shitpost" [post:16]
"A red and a blue ship have just collided in the Caribbean. Apparently the survivors are marooned." [post:17]
"If you need an example of a brain dead tweet to start your ember months. Here you go" [post:18]
"Women will literally leave the car in a live safari with Tigers just to argue with their husbands…." [post:19]
"genuinely incomprehensible shitpost I found" [post:20]
"shitpost so good it has people on twitter actually mad about it, goddamn" [post:21]
"What do you call a monkey in a minefield? BABOOOOOOM!" [post:22]
"Do you guys need a hand (I'm cleaning my room)" [post:23]
"Imagine if they joked about something controllable like fat chicks. It would be over" [post:24]
"'Turn this into a shitpost. No words just images. Go wild' 🍌" [post:25]
"My mom said we can get a cake when he dies" [post:26]
"“I’ll fuck your dad and give them a child they actually love” is the best one I’ve heard" [post:27]
"Don't tell me to listen when you've got nothing to say" [post:28]
"JY: Dont you know this thing? It's mixing cocktail CY: we're underage facepalm" [post:29]
"top left “AAAAAAA I'M A DUMB LOOK AT MEEEEEEE!”" [post:30]
""What do we want?" "Maturity!" "When do we want it?" "Haha. You said tit."" [post:31]
"If I had a £ per time I have seen 'Otters have a favourite pebble'..." [post:32]
"Man Shoves Shit Into ATM Attempting To Make It Poop Cash" [post:33]
"“Sensible Right Wing Politics? You fucking SPAZ..." [post:34]
"You know . . . if you really think about it, the Declaration of Independence is kind of the OG of shitposts." [post:35]
"If Twitter CIA cut-outs battle And the battle's in a Bot(-tle)..." [post:36]
"A piece of sandpaper walks into a bar. The bartender says 'what will it be?'" [post:37]
"Idk dude I just wanted to tweet something" [post:38]
"The only ones I’ve seen that have been funny to me:" [post:39]
"Reminder that @/shitpost_2049 posted a VERY racist meme..." [post:40]
"Apparently our local Police station has had it's toilet stolen. Police have nothing to go on." [post:41]
"Ayo “us” Ppl might unfollow for me this but I’m buzzed again..." [post:42]
"Boomers When Someone Doesn't Wanna Waste Their Life on a dead end 9-5 job" [post:43]
"immensely shitposty line in jimmy buffett's 'margaritaville'" [post:44]
"Pokemon Twitter: if you like HGSS I will dox you..." [post:45]
"a 'How much is 2+2?' b 'How dare you to ask me!'" [post:46]
"The cost of living has now become so expensive that the wife is having sex with me because she can't afford batteries!" [post:47]
"I don't get why people validate lesbian trans men YOURE STRAIGHT" [post:48]
"I'm not saying that I hate you but.. I would unplug your life support machine to charge my phone." [post:49]
"If you try to touch my nuts, you better be prepared to lose an arm!" [post:50]
"Would you watch a Reboot or new Season of Dinosaurs?" [post:51]
"This popped up on my timeline so I’m just going to leave it here" [post:52]
"“it’s like a banana but it’s full of shit”" [post:53]
"If you are a white female and you shit your pants, are you a shitass or a baby" [post:54]
"Curiga sampe sekarang masih shitpost asbun" [post:55]
"Prison pocket?" [post:58]
"Abraham Lincoln took ishowspeed to the Abraham Lincoln statue😂😂🇺🇲" [post:60, post:62, post:145]
"The serenity of a man who's dealt with real monsters." [post:64]
"Y'all remember the Lemon Pepper Steppers?" [post:73]
And more from additional posts (e.g., absurd fights, memes about politicians, random complaints).