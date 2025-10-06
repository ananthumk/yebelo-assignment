#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Project root: $PROJECT_ROOT"

# detect docker compose command
if command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
elif docker compose version >/dev/null 2>&1; then
  DC="docker compose"
else
  echo "Error: neither 'docker-compose' nor 'docker compose' is available in PATH."
  echo "Install Docker Compose or use a Docker CLI that supports 'docker compose'."
  exit 1
fi

echo "Using compose command: $DC"

echo "1) Starting Docker services (Redpanda + console)..."
$DC -f "$PROJECT_ROOT/docker-compose.yml" up -d

echo "2) Waiting for Redpanda to start..."
sleep 5

run_node_service() {
  svc_dir="$1"
  if [ -d "$svc_dir" ]; then
    echo "-> Found service at $svc_dir"
    cd "$svc_dir"
    if [ -f package.json ]; then
      npm install --silent
      if grep -q "\"dev\"" package.json; then
        npm run dev &
      elif grep -q "\"start\"" package.json; then
        npm start &
      else
        if [ -f dist/index.js ]; then
          node dist/index.js &
        elif [ -f index.js ]; then
          node index.js &
        fi
      fi
    fi
    cd "$PROJECT_ROOT"
    sleep 1
  fi
}

# Start ingestion (if present)
run_node_service "$PROJECT_ROOT/ingestion"

# Start rsi_processor (if Node based)
run_node_service "$PROJECT_ROOT/rsi_processor"

# If rsi_processor is Rust, hint to run manually
if [ -d "$PROJECT_ROOT/rsi_processor" ] && [ -f "$PROJECT_ROOT/rsi_processor/Cargo.toml" ]; then
  echo "Note: rsi_processor appears to be Rust. Run it with: (cd \"$PROJECT_ROOT/rsi_processor\" && cargo run)"
fi

# Start frontend
run_node_service "$PROJECT_ROOT/frontend-dashboard"

echo "All startup commands issued. Check logs or terminals for output."
echo "To tail docker logs: $DC -f \"$PROJECT_ROOT/docker-compose.yml\" logs -f"
