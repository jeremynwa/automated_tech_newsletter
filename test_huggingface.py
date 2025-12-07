"""
Test script to verify Hugging Face API is working
Run this to check if your HF_API_KEY works
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

HF_API_KEY = os.getenv('HF_API_KEY')
HF_API_URL = "https://router.huggingface.co/models/facebook/bart-large-cnn"

print("=" * 50)
print("Testing Hugging Face API")
print("=" * 50)

if not HF_API_KEY:
    print("❌ ERROR: HF_API_KEY not found in .env file")
    print("Add it like: HF_API_KEY=your_key_here")
    exit(1)

print(f"✓ API Key found: {HF_API_KEY[:10]}...{HF_API_KEY[-4:]}")
print(f"✓ API URL: {HF_API_URL}")
print("\nSending test request...")

test_text = """
Apple unveiled the M4 Pro chip featuring 3nm+ architecture with 50% better 
performance-per-watt. The new MacBook Pro models will ship next month with 
up to 128GB unified memory and support for 8K displays. This represents 
a significant leap in computing power for professional users.
"""

headers = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json",
}

payload = {
    "inputs": test_text.strip(),
    "parameters": {
        "max_length": 150,
        "min_length": 30,
        "do_sample": False
    }
}

try:
    response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
    
    print(f"\n✓ Response Status: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ SUCCESS! Hugging Face API is working")
        result = response.json()
        print("\nResponse:")
        print(result)
        
        # Try to extract summary
        if isinstance(result, list) and result:
            if "summary_text" in result[0]:
                print(f"\n✓ Summary: {result[0]['summary_text']}")
            elif "generated_text" in result[0]:
                print(f"\n✓ Generated: {result[0]['generated_text']}")
        
    elif response.status_code == 503:
        print("⚠️  Model is loading (503 error)")
        print("This is normal - the model needs to warm up")
        print("Try again in 10-20 seconds")
        print(f"\nResponse: {response.text[:200]}")
        
    elif response.status_code == 401:
        print("❌ Authentication failed (401)")
        print("Your API key might be invalid")
        print(f"Response: {response.text}")
        
    elif response.status_code == 404:
        print("❌ Model not found (404)")
        print("The model URL might be wrong")
        print(f"Response: {response.text}")
        
    else:
        print(f"❌ FAILED with status {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
except requests.exceptions.Timeout:
    print("❌ Request timed out (60 seconds)")
    print("The model might be loading - try again")
    
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 50)