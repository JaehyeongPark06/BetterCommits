import cohere
from dotenv import load_dotenv
import os

# Load the .env file
load_dotenv()
cohere_api_key = os.getenv('COHERE_API_KEY')

# Initialize the Cohere client with the API key
cohere_client = cohere.Client(cohere_api_key)

# Send a message using Cohere's chat model
response = cohere_client.chat(
    model="command-r",
    message="Where does the tallest penguin live?",
    documents=[
    {"title": "Tall penguins", "snippet": "Emperor penguins are the tallest."},
    {"title": "Penguin habitats", "snippet": "Emperor penguins only live in Antarctica."},
    {"title": "What are animals?", "snippet": "Animals are different from plants."}
    ]
)

# Print the response
print(response.text)

