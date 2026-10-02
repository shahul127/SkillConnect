import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

model = SentenceTransformer(
    "vishnuexe/Morgan-Tanglish-v7"
)

def normalize_text(text):
    return " ".join(
        re.findall( r"\w+",str(text).lower(),flags=re.UNICODE)
    )
def concept_coverage(answer, concepts):
    answer = normalize_text(answer)
    if not concepts:
        return 0
    answer_words = set(answer.split())
    matched = 0
    for concept in concepts:
        concept_words = normalize_text(concept).split()
        if not concept_words:
            continue
        matched_words = 0
        for word in concept_words:
            if word in answer_words:
                matched_words += 1
                continue

            for answer_word in answer_words:
                if len(word) >= 5 and (
                    word in answer_word or answer_word in word
                ):
                    matched_words += 1
                    break

        concept_score = matched_words / len(concept_words)
        if concept_score >= 0.5:
            matched += 1

    return matched / len(concepts)

def evaluate_answer(answer,expected_answer,key_concepts=None):
    answer = normalize_text(answer)
    expected_answer = normalize_text(expected_answer )
    answer_vector = model.encode([answer])
    expected_vector = model.encode([expected_answer])
    similarity = cosine_similarity( answer_vector, expected_vector )[0][0]
    coverage = concept_coverage( answer, key_concepts or [])
    score = (similarity * 0.9 ) + ( coverage * 0.1 )
    score = max( 0, min(1, score))
    print("Similarity:", similarity)
    print("Coverage:", coverage)
    print("Concepts:", key_concepts)
    print("Final Score:", score * 100)

    return round(score * 100,2)