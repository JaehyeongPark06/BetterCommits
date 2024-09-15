import cohere
from dotenv import load_dotenv
import os
import json

# Load the .env file
load_dotenv()
cohere_api_key = os.getenv('COHERE_API_KEY')

# Ensure the API key is available
if not cohere_api_key:
    raise ValueError("API key not found in environment. Check .env file.")

# Initialize the Cohere client with the API key
cohere_client = cohere.Client(cohere_api_key)

# Load documents from training-data.json
try:
    with open(r'data/training-data.json', 'r') as f:
        documents = json.load(f)
except FileNotFoundError:
    raise FileNotFoundError("The training-data.json file was not found.")
except json.JSONDecodeError:
    raise ValueError("Error decoding the training-data.json file. Ensure it contains valid JSON.")

# Send a message using Cohere's chat model
try:
    userCodeChange = "load_dotenv() cohere_api_key = os.getenv('COHERE_API_KEY')"
    userInput = "erm I added API"
    response = cohere_client.chat(
        model="command-r",
        message="Please rephrase and make sure that the suggestion follows commit message structure and that it is concise. Keep the response to three sentences max. No need for the niceties." + userInput + userCodeChange,
        documents=documents  # Pass the loaded JSON data as the documents input
    )

    # Print the response
    print(response.text)

except Exception as e:
    print(f"An error occurred: {e}")
