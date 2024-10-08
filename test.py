import os
from openai import OpenAI

# print(os.getenv("OPENAI_API_KEY"))

client = OpenAI(
    api_key = os.getenv("OPENAI_API_KEY"),
)

completion = client.chat.completions.create(
  model = "gpt-3.5-turbo",
  messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"},
  ]
)

print(completion.choices[0].message.content.strip())