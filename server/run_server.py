import uvicorn

if __name__ == "__main__":
    # host="0.0.0.0" - permite acesso de qualquer IP
    # port=8000 - porta onde o servidor vai rodar
    # reload=True - reinicia automaticamente quando há mudanças no código
    uvicorn.run(
        "main:app",  # main é o arquivo main.py e app é a instância do FastAPI
        host="0.0.0.0",
        port=8000,
        reload=True
    )
