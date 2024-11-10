const tf = require('@tensorflow/tfjs-node');
const use = require('@tensorflow-models/universal-sentence-encoder');
var term = require( 'terminal-kit' ).terminal ;

term.insertLine(2)
term.nextLine(2)

const songs = [
  {
    name: "Lover, you should have come over",
    author: "Jeff Buckley",
    lyrics: "Looking out the door I see the rain Fall upon the funeral mourners Parading in a wake of sad relations As their shoes fill up with water. Maybe I'm too young To keep good love from going wrong But tonight you're on my mind So... you'll never know. Broken down and hungry for your love With no way to feed it. Where are you tonight? Child, ya know how much I need it. Too young to hold on And too old to just break free and run. Sometimes a man gets carried away When he feels like should be having his fun. Much too blind to see the damage he's done. Sometimes a man must awake to find that Really he has no one. So I'll wait for you, love And I'll burn. Will I ever see your sweet return? Oh, will I ever learn? Oh-oh, lover, you should've come over 'Cause it's not too late. Lonely is the room, the bed is made. The open window lets the rain in. Burning in the corner is the only one who dreams He had you with him. My body turns And yearns for a sleep that won't ever come. It's never over. My kingdom for a kiss upon her shoulder. It's never over. All my riches for her smiles When I've slept so soft against her. It's never over. All my blood for the sweetness of her laughter. It's never over. She is the tear that hangs inside my soul forever. Oh, but maybe I'm just too young To keep good love from going wrong. Oh-oh-oh, lover You should've come over, yeah, yes. Yes, I feel too young to hold on And much too old to break free and run. Too deaf, dumb and blind to see the damage I've done. Sweet lover, you should've come over. Oh, love, well I've waited for you Lover, lover, lover Lover, love, love, love, love, love, love! Lover, you should've come over 'Cause it's not too late.",
    embedding: null,
  },
  {
    name: "Digital Bath",
    author: "Deftones",
    lyrics: "You move like I want to. To see like your eyes do. We are downstairs Where no one can see. New life break away. Tonight I feel like more. Tonight I. You make the water warm. You taste foreign. And I know you can see The cord break away. 'Cause tonight I feel like more. Tonight I feel like more. Feel like more. Tonight You breathed. Then you stopped. I breathed then dried you off. And tonight I feel, feel like more. Tonight I feel like Feel like more Tonight I feel like more. Feel like more Tonight.",
    embedding: null,
  },
  {
    name: "Criminal",
    author: "Fiona Apple",
    lyrics: "I've been a bad, bad girl I've been careless with a delicate man. And it's a sad, sad world When a girl will break a boy just because she can. Don't you tell me to deny it. I've done wrong and I want to suffer for my sins. I've come to you 'cause I need guidance to be true And I just don't know where I can begin. Ooh, what I need is a good defense 'Cause I'm feeling like a criminal And I need to be redeemed To the one I've sinned against. Because he's all I ever knew of love. Heaven help me for the way I am Save me from these evil deeds before I get them done. I know tomorrow brings the consequence at hand But I keep living this day like the next will never come. Oh, help me but don't tell me to deny it. I've got to cleanse myself of all these lies 'til I'm good enough for him. I've got a lot to lose and I'm bettin' high so I'm begging you Before it ends just tell me where to begin. What I need is a good defense 'Cause I'm feeling like a criminal And I need to be redeemed To the one I've sinned against Because he's all I ever knew of love. Let me know the way Before there's hell to pay. Give me room to lay the law and let me go. I've got to make a play To make my lover stay So what would an angel say the devil wants to know. What I need is a good defense 'Cause I'm feeling like a criminal And I need to be redeemed To the one I've sinned against. Because he's all I ever knew of love. What I need is a good defense 'Cause I'm feeling like a criminal And I need to be redeemed To the one I've sinned against. Because he's all I ever knew of love.",
    embedding: null,
  }
]

async function getEmbedding(text) {
  const model = await use.load()
  const embedding = await model.embed(text)
  return embedding
}

async function processSongs() {
  const songsWithEmbeddings = []
  let songsProcessed = 0
  var progressBar = term.progressBar( {
    width: 80 ,
    title: 'Computing lyric embeddings...' ,
    eta: true ,
    percent: true
  } ) ;
  for(const song of songs) {
    const embedding = await getEmbedding(song.lyrics)
    songsWithEmbeddings.push({...song, embedding: embedding})
    songsProcessed++
    progressBar.update(songsProcessed / songs.length)
  }
  return songsWithEmbeddings
}

function calculateSimilarity(embedding1, embedding2 ) {
  const dotProduct = embedding1.mul(embedding2).sum();

  const magnitudeA = tf.sqrt(embedding1.square().sum());
  const magnitudeB = tf.sqrt(embedding2.square().sum());

  const cosineSimilarity = dotProduct.div(magnitudeA.mul(magnitudeB));
  return cosineSimilarity
}

async function getMatchingSong(inputEmbedding, songsWithEmbeddings) {
  return new Promise((resolve, reject)=>{
    const songsWithSimilarity = []
    for (const song of songsWithEmbeddings) {
      const sim = calculateSimilarity(inputEmbedding, song.embedding)
      songsWithSimilarity.push({...song, similarity: sim})
    }
    resolve(songsWithSimilarity.reduce((max, obj) => (obj.similarity > max.similarity ? obj : max), songsWithSimilarity[0]))
  })
}

async function main() {
  const songsWithEmbeddings = await processSongs()
  term.nextLine(2)
  term.magenta("Feed me a line: ")
  term.inputField(
    function( error , input ) {
      getEmbedding(input).then((embedding)=>{
        term.nextLine(1)
        getMatchingSong(embedding, songsWithEmbeddings).then((matchingSong)=>{
          term.green("Sounds like: ")
          term("%s by %s\n\n" , matchingSong.name , matchingSong.author )
          process.exit(0)
        })
      })
    }
  )
}

main();