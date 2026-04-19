from transformers import pipeline
import torch

device = 0 if torch.cuda.is_available() else -1

print("Using device:", "GPU" if device == 0 else "CPU")

classifier = pipeline(
    "sentiment-analysis",
    model="distilbert-base-uncased-finetuned-sst-2-english",
    device=device
)

def predict_sentiment(text):
    result = classifier(text)[0]

    label = result['label']
    score = result['score']

    if label == "POSITIVE":
        label = "Positive"
    else:
        label = "Negative"

    return label, round(score, 2)