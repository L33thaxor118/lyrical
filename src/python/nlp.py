import tensorflow_hub as hub
import numpy as np

encodingModel = hub.load("https://tfhub.dev/google/universal-sentence-encoder/4")

# Input: raw lyrics text with newline characters
# Output: 512 dimension vector embedding representing the overall meaning of the lyrics
def produce_embedding(lyrics: str):
    # Step 1: Split the text into phrases based on line breaks
    lines = lyrics.split("\n")
    
    # Step 2: Calculate embeddings for each phrase
    embeddings = encodingModel(lines)
    
    # Step 3: Compute the average of all phrase embeddings
    average_embedding = np.mean(embeddings.numpy(), axis=0)
    
    # Step 4: Return the average embedding as a standard python list
    return average_embedding.tolist()