Phase 1: Infrastructure Setup

Project overview

This repository contains a simple pipeline prototype for streaming trade data into Redpanda (Kafka-compatible), processing RSI, and displaying a live dashboard built with Next.js + Recharts.

What is included
- docker-compose.yml - boots Redpanda and Redpanda Console for local testing
- ingestion/producer.py - reads `trades_data.csv` and produces messages to the `trade-data` topic
- ingestion/consumer.py - simple consumer example that prints messages from the topic
- ingestion/api_server.py - FastAPI server that consumes Kafka in the background and exposes:
  - GET /latest: JSON list of recent messages
  - GET /tokens: list of recent token_address values
  - GET /stream: Server-Sent Events (SSE) stream of new messages
- frontend-dashboard/ - Next.js app (React) that connects to the SSE stream and renders charts

Quick start (Windows PowerShell)

1) Start Redpanda (Docker Compose)

	cd "<project-root>"
	docker-compose up -d

	- Redpanda broker: http://localhost:9092
	- Console UI: http://localhost:8080

2) Install Python deps for ingestion and the API server

	cd ingestion
	python -m pip install -r requirements.txt

3) Produce messages to Kafka (one-time stream from CSV)

	# from the ingestion folder
	python producer.py

4) Run the FastAPI API server (in another terminal)

	# from the ingestion folder
	uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload

	The server will connect to Kafka and begin serving recent messages and an SSE stream at:

	- http://localhost:8000/latest
	- http://localhost:8000/stream (SSE)

5) Run the frontend (Next.js)

	cd ../frontend-dashboard
	npm install
	npm run dev

	Open http://localhost:3000 and the dashboard will connect to the SSE stream and render live charts.

Troubleshooting
- If the frontend shows no data, make sure the API server is running and that the producer has published messages to topic `trade-data`.
- Check Redpanda Console at http://localhost:8080 and verify topic `trade-data` exists and has messages.
- If Kafka connection fails, ensure Docker is running and port 9092 is reachable from your host.

Notes and next steps
- The FastAPI server provided is a lightweight example. For production use consider using an async Kafka client and more robust offset management.
- The frontend filters messages by `token_address` when the token selector is set. The mapping from CSV fields to display values (e.g., price) is handled naively and may require adjustments depending on source fields.

```
