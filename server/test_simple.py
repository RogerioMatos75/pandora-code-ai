import asyncio
import aiohttp
import json

async def test_simple():
    code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
"""
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            'http://localhost:8000/analyze',
            json={'code': code}
        ) as response:
            result = await response.json()
            print("\nResultado da análise:")
            print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(test_simple())
