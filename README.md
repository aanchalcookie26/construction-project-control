# FIELDNOTE — Construction Project Control & Forecasting

A local React + TypeScript dashboard backed by FastAPI, SQLAlchemy, and SQLite.

## Requirements

- Node.js 20.19+ (Node 22 recommended)
- Python 3.10+

## Run the backend

From the project root:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn app.main:app --app-dir backend --reload
```

The API runs at `http://127.0.0.1:8000`. Interactive API documentation is available at `http://127.0.0.1:8000/docs`.

## Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). To use a different backend URL, create `frontend/.env.local` and set:

```text
VITE_API_URL=http://127.0.0.1:8000
```

## Current functional scope

- Dashboard metrics read from the existing project record; some dashboard chart series, sample work packages, and initial risk flags remain explicitly labelled illustrative.
- Project register and create-project form.
- Task/work-package creation and register.
- Expense entry and ledger; saved expenses increase the project's recorded cost.
- Progress update log; saved updates refresh the project's planned and actual completion values.
- Risk register creation and list.
- Basic earned-value forecast indicators and project CSV export.
- SQLite database is stored at `backend/construction.db`; new tables are created automatically when the API starts.

## API endpoints

- `GET /health`, `GET /projects`, `POST /projects`
- `GET /tasks`, `POST /tasks`, `PATCH /tasks/{task_id}`, `DELETE /tasks/{task_id}`
- `GET /expenses`, `POST /expenses`
- `GET /progress-updates`, `POST /progress-updates`
- `GET /risks`, `POST /risks`, `PATCH /risks/{risk_id}`
- `GET /summary`

This is a local MVP, not a production-ready multi-user system. Authentication, permissions, deployment configuration, audit trails, and automated backups are not included.
