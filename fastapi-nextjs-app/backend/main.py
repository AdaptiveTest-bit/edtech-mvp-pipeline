from fastapi import FastAPI

app = FastAPI(title="FastAPI Backend")

@app.get("/")
def read_root():
    return {"message": "FastAPI backend is running "}

@app.get("/health")
def health_check():
    return {"status": "OK"}

def main():
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
