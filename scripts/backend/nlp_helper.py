import cohere
from dotenv import load_dotenv
import os
import json

# Import the get_commit_message function from cohere_code.py
from cohere_code import get_commit_message

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
    # Get the commit message to be used as userInput from cohere_code.py
    userInput = get_commit_message()
    
    response = cohere_client.chat(
        model="command-r",
        message="Your primary goal is to suggest a better commit message so that it is compliant with Angular Commit Format Structure in mind. This userInput '" + userInput + "' is to provide context. Keep the response short and concise in one line. Two lines max. Please just provide the commit message and no explanations.",
        documents=documents,  # Pass the loaded JSON data as the documents input
        max_tokens=300,
        temperature=0.7
    )

    # Print the response
    print(response.text)

except Exception as e:
    print(f"An error occurred: {e}")
