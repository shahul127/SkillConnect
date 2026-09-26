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

    matched = 0
    for concept in concepts:
        concept = normalize_text(concept)
        if concept in answer:
            matched += 1
    return matched / len(concepts)

def evaluate_answer(answer,expected_answer,key_concepts=None):
    answer = normalize_text(answer)
    expected_answer = normalize_text(expected_answer )
    answer_vector = model.encode([answer])
    expected_vector = model.encode([expected_answer])
    similarity = cosine_similarity( answer_vector, expected_vector )[0][0]
    coverage = concept_coverage( answer, key_concepts or [])
    score = (similarity * 0.8 ) + ( coverage * 0.2 )
    score = max( 0, min(1, score))
    return round(score * 100,2)