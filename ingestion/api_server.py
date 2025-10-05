import asyncio
import json
from collections import deque
from typing import Deque, Dict, Any

from fastapi import FastAPI, Response
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from confluent_kafka import Consumer, KafkaException

app = FastAPI()

# Allow frontend dev server to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shared recent messages buffer
recent: Deque[Dict[str, Any]] = deque(maxlen=2000)
message_counter = 0


def kafka_background_consumer():
    """Runs in a background thread and appends messages from Kafka to `recent`"""
    global message_counter
    conf = {
        'bootstrap.servers': 'localhost:9092',
        'group.id': 'api-server-group',
        'auto.offset.reset': 'earliest',
    }

    consumer = Consumer(conf)
    consumer.subscribe(['trade-data'])

    try:
        while True:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                # handle non-fatal errors
                continue
            try:
                data = json.loads(msg.value().decode('utf-8'))
            except Exception:
                # ignore malformed
                continue
            message_counter += 1
            data['_id'] = message_counter
            recent.append(data)
    except Exception as e:
        print('Kafka consumer error:', e)
    finally:
        try:
            consumer.close()
        except Exception:
            pass


@app.on_event('startup')
def startup_event():
    # Start Kafka consumer in background thread so FastAPI remains async-friendly
    import threading

    t = threading.Thread(target=kafka_background_consumer, daemon=True)
    t.start()


@app.get('/latest')
def get_latest(limit: int = 50):
    """Return the latest trade messages (most recent first)"""
    items = list(recent)[-limit:]
    return JSONResponse(content={'count': len(items), 'items': items})


@app.get('/tokens')
def get_tokens():
    # return unique token_address values from recent messages
    tokens = []
    seen = set()
    for m in reversed(recent):
        ta = m.get('token_address')
        if ta and ta not in seen:
            seen.add(ta)
            tokens.append(ta)
        if len(tokens) >= 100:
            break
    return JSONResponse(content={'tokens': tokens})


async def event_generator():
    """Yield new messages as Server-Sent Events (SSE). This simple implementation polls the
    shared `recent` buffer and yields any new messages.
    """
    last_id = 0
    while True:
        # Send all messages with id > last_id
        to_send = []
        for m in list(recent):
            if m.get('_id', 0) > last_id:
                to_send.append(m)
        if to_send:
            for m in to_send:
                last_id = max(last_id, m.get('_id', 0))
                payload = json.dumps(m, default=str)
                yield f"data: {payload}\n\n"
        await asyncio.sleep(0.5)


@app.get('/stream')
def stream():
    headers = {"Cache-Control": "no-cache", "Content-Type": "text/event-stream"}
    return StreamingResponse(event_generator(), headers=headers)
