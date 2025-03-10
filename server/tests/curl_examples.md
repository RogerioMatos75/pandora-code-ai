# Exemplos de Requisições com Curl

## Análise de Código Simples

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "def soma(a, b):\n    return a + b"
  }'
```

## Análise de Código Mais Complexo

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "code": "class Calculator:\n    def add(self, a, b):\n        return a + b\n    def subtract(self, a, b):\n        return a - b"
  }'
```
