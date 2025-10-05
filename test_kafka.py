from confluent_kafka import Producer

conf = {'bootstrap.servers': 'localhost:9092'}
p = Producer(conf)

def delivery_report(err, msg):
    if err is not None:
        print('Message delivery failed:', err)
    else:
        print('Message delivered')

try:
    p.produce('test-topic', key='key', value='test message', callback=delivery_report)
    p.flush()
except Exception as e:
    print("Error:", e)
