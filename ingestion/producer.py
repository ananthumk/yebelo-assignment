import pandas as pd
import json
from confluent_kafka import Producer
import time

# Kafka/Redpanda producer configuration
config = {
    'bootstrap.servers': 'localhost:9092',
    'client.id': 'trades-producer'
}

producer = Producer(config)

def delivery_report(err, msg):
    """Called once for each message produced to indicate delivery result."""
    if err is not None:
        print(f'Message delivery failed: {err}')
    else:
        print(f'Message delivered to {msg.topic()} [{msg.partition()}] at offset {msg.offset()}')

def main():
    try:
        # Load CSV data
        print("Loading trades_data.csv...")
        df = pd.read_csv('trades_data.csv')
        print(f"Loaded {len(df)} trade records")
        
        # Stream each row to Redpanda
        for index, row in df.iterrows():
            # Convert row to dictionary, then to JSON
            trade_data = row.to_dict()
            message = json.dumps(trade_data, default=str)  # default=str handles datetime
            
            # Produce message to 'trade-data' topic
            producer.produce(
                topic='trade-data',
                key=str(trade_data.get('token_address', '')),  # Use token_address as key
                value=message.encode('utf-8'),
                callback=delivery_report
            )
            
            # Poll to handle delivery reports
            producer.poll(0)
            
            # Optional: Add small delay between messages for more realistic streaming
            time.sleep(0.01)  # 10ms delay
            
            if (index + 1) % 50 == 0:
                print(f"Produced {index + 1} messages...")
        
        # Wait for any outstanding messages to be delivered
        print("Flushing remaining messages...")
        producer.flush()
        print("All trade messages sent successfully!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        producer.flush()

if __name__ == '__main__':
    main()
