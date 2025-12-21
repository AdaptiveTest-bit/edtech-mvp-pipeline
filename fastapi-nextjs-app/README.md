# fastapi-nextjs-app

This folder contains the FastAPI backend and a Next.js frontend scaffold.

## Backend — Quick start (macOS / Linux)

1. Change into the backend folder:

```bash
cd fastapi-nextjs-app/backend
```

2. Create a virtual environment (Python 3):

```bash
python3 -m venv .venv
```

3. Activate the virtual environment:

```bash
source .venv/bin/activate
```

4. Install dependencies:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

5. Run the FastAPI server (from `backend`):

```bash
uvicorn main:app --reload
```

Alternative: run directly with the `main()` entrypoint:

```bash
python main.py
```

Notes:
- `uvicorn` is already listed in `backend/requirements.txt`; if you add dependencies, update that file.
- To run from the repository root (outside `backend`) use:

```bash
uvicorn fastapi-nextjs-app.backend.main:app --reload
```

## Backend — Windows

1. Create the venv (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

## Troubleshooting

- If `uvicorn` is missing: `pip install uvicorn` or add `uvicorn==<version>` to `backend/requirements.txt` and reinstall.
- If you see errors about a nested `.git` directory when running `git add`, this repository contains a nested Git repository. To add the folder as a regular tracked directory, move or remove the nested `.git` directory:

```bash
mv fastapi-nextjs-app/.git fastapi-nextjs-app/.git.backup
git add fastapi-nextjs-app
```

(Only do this if you do not intend `fastapi-nextjs-app` to be a submodule.)

## Next steps

- Optionally add a `Makefile` or `scripts` for common commands.
- Ask me to add `uvicorn` to `requirements.txt` or to create run scripts.
