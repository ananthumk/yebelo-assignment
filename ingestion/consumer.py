import json
from confluent_kafka import Consumer, KafkaError

conf = {
    'bootstrap.servers': 'localhost:9092',
    'group.id': 'my-consumer-group',
    'auto.offset.reset': 'earliest'
}

consumer = Consumer(conf)

def consume_messages():
    consumer.subscribe(['trade-data'])

    print("Starting message consumption...")

    try:
        while True:
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    print('End of partition event')
                else:
                    print(f"Error: {msg.error()}")
            else:
                data = json.loads(msg.value().decode('utf-8'))
                print(json.dumps(data, indent=4))  # Pretty print JSON messages
    except KeyboardInterrupt:
        pass
    finally:
        consumer.close()
        print("Consumer closed.")

if __name__ == '__main__':
    consume_messages()
