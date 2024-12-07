import re

def preprocess_lyrics(lyrics: str) -> str | None:
    # Return None if the string is over 5000 characters
    if len(lyrics) > 5000:
        return None

    # Check if the string contains dates in formats like MM/DD/YYYY
    date_regex = r'\b\d{1,2}/\d{1,2}/\d{4}\b'
    if re.search(date_regex, lyrics):
        return None

    # Check if the string contains words in all caps
    all_caps_regex = r'\b[A-Z]{2,}\b'
    if re.search(all_caps_regex, lyrics):
        return None

    # Remove substrings enclosed in brackets or parentheses
    bracket_regex = r'\[.*?\]|\(.*?\)'
    processed_lyrics = re.sub(bracket_regex, '', lyrics)

    # Remove empty lines while preserving newlines
    processed_lyrics = '\n'.join(
        line for line in processed_lyrics.split('\n') if line.strip() != ''
    )

    return processed_lyrics