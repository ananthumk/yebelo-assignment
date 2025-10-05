use rdkafka::consumer::{Consumer, StreamConsumer};
use rdkafka::ClientConfig;
use rdkafka::message::Message;
use tokio_stream::StreamExt;
use serde::{Deserialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize)]
struct Trade {
    token_address: String,
    price_in_sol: f64,
}

// RSI calculation for last 14 prices
fn calculate_rsi(prices: &[f64]) -> f64 {
    let mut gains = 0.0;
    let mut losses = 0.0;
    for i in 1..prices.len() {
        let diff = prices[i] - prices[i-1];
        if diff > 0.0 {
            gains += diff;
        } else {
            losses -= diff;
        }
    }
    let avg_gain = gains / 14.0;
    let avg_loss = losses / 14.0;
    if avg_loss == 0.0 {
        return 100.0;
    }
    let rs = avg_gain / avg_loss;
    100.0 - (100.0 / (1.0 + rs))
}

#[tokio::main]
async fn main() {
    let consumer: StreamConsumer = ClientConfig::new()
        .set("group.id", "rsi-group")
        .set("bootstrap.servers", "localhost:9092")
        .set("auto.offset.reset", "earliest")
        .create()
        .expect("Failed to create consumer");

    consumer.subscribe(&["trade-data"]).expect("Can't subscribe");

    let mut message_stream = consumer.stream();
    let mut price_history: HashMap<String, Vec<f64>> = HashMap::new();

    println!("Consuming messages...");

    while let Some(message) = message_stream.next().await {
        match message {
            Ok(m) => {
                let payload = match m.payload_view::<str>() {
                    Some(Ok(s)) => s,
                    _ => continue,
                };

                let trade: Trade = match serde_json::from_str(payload) {
                    Ok(t) => t,
                    Err(_) => continue,
                };

                let history = price_history.entry(trade.token_address.clone()).or_default();
                history.push(trade.price_in_sol);

                if history.len() >= 14 {
                    let rsi = calculate_rsi(&history[history.len() - 14..]);
                    println!("RSI for token {}: {:.2}", trade.token_address, rsi);
                }
            },
            Err(e) => println!("Error receiving message: {:?}", e),
        }
    }
}
