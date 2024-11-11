import tkit from 'terminal-kit'
import tf from '@tensorflow/tfjs-node'
import use from '@tensorflow-models/universal-sentence-encoder'
import { Tensor2D } from "@tensorflow/tfjs-node"

const term = tkit.realTerminal

interface Song {
    name: string,
    author: string,
    lyrics: string,
    embedding?: Tensor2D
}

function calculateSimilarity(embedding1: Tensor2D, embedding2: Tensor2D ) {
    const dotProduct = tf.sum(tf.mul(embedding1, embedding2));

    const magnitudeA = tf.sqrt(tf.sum(tf.square(embedding1)));
    const magnitudeB = tf.sqrt(tf.sum(tf.square(embedding2)));
    
    const cosineSimilarity = dotProduct.div(magnitudeA.mul(magnitudeB));
    return cosineSimilarity
  }

  export async function getEmbedding(text: string): Promise<Tensor2D> {
    const model = await use.load()
    const sentences = text.match( /[^\.!\?]+[\.!\?]+/g ) || []
    const embeddings = []
    for (const sentence of sentences) {
        const embedding = await model.embed(sentence)
        embeddings.push(embedding)
    }
    const stackedEmbeddings = tf.stack(embeddings as any)
    const meanEmbedding = tf.mean(stackedEmbeddings, 0)

    return meanEmbedding as any
  }

  export async function processSongs(songs: Array<Song>) {
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

export async function getMatchingSong(inputEmbedding: Tensor2D, songsWithEmbeddings: Array<Song>): Promise<Song> {
    return new Promise((resolve, reject)=>{
      const songsWithSimilarity = []
      for (const song of songsWithEmbeddings) {
        const sim = calculateSimilarity(inputEmbedding, song.embedding!)
        songsWithSimilarity.push({...song, similarity: sim})
      }
      resolve(songsWithSimilarity.reduce((max, obj) => (obj.similarity > max.similarity ? obj : max), songsWithSimilarity[0]))
    })
  }