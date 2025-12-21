from fastapi import FastAPI

app = FastAPI(title="Adaptive Test Series API")

@app.get("/")
def root():
    return {"message": "Backend is running 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}
