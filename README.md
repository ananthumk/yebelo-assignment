# Yebelo — Real-time Trading Analytics (RSI) Assignment

Summary
- Build a streaming pipeline (Redpanda) → ingestion → Rust RSI processor → NextJS dashboard.
- Tech stack: Docker, Redpanda, Rust, NextJS + TypeScript, Recharts.

Quick start (from repo root)
1. Start Redpanda + Console
   - docker-compose up -d
   - docker-compose -f docker-compose.yml logs -f

2. Start services (examples)
   - Ingestion (if nodejs): cd ingestion && npm install && npm run dev
   - RSI processor (Rust): cd rsi_processor && cargo run
   - Frontend: cd frontend-dashboard && npm install && npm run dev

Convenience scripts (cross-platform)
- Bash (WSL/Git Bash/macOS): ./scripts/run_all.sh
- PowerShell (Windows): ./scripts/run_all.ps1

What the scripts do
- Starts docker-compose services (redpanda + console)
- Attempts to auto-detect and run `ingestion`, `rsi_processor`, and `frontend-dashboard` if folders exist:
  - For Node-based services, runs `npm run dev` or `npm start`
  - For Rust `rsi_processor`, you should run `cargo run` manually if preferred

Topics to create in Redpanda Console
- trade-data
- rsi-data

Development notes
- Frontend: ensure chart containers have explicit width/height; Recharts' ResponsiveContainer needs sizing to render.
- When upstream data is missing, components generate deterministic dummy data to keep UI visible for development.

AI tool usage (document in submission)
- Mention which AI(s) you used for config, code generation, debugging, or explanations (e.g., "Used ChatGPT to generate docker-compose and README").

Submission checklist
- GitHub repo with code and README
- 1–2 min demo video showing:
  - Messages in Redpanda (console)
  - RSI calculations being published
  - Frontend chart showing updates
- Provide repo link + video link to evaluator

Troubleshooting
- If charts are blank: verify parent container has non-zero width/height and ResponsiveContainer set to width="100%" height="100%".
- If services fail to start: inspect logs, check ports (9092, 9644, 8080).

Contact
- Add notes about any deviations or assumptions in your submission.
