import amqp, { Channel, Connection } from 'amqplib';

// #[derive(Debug, Clone, Serialize, Deserialize)]
// pub struct DepositEvent {
//     pub event_id: String,
//     pub chain_id: u64,
//     pub chain_name: String,
//     pub from_address: String,
//     pub to_address: String,
//     pub amount: String,
//     pub token_address: Option<String>,
//     pub timestamp: u64,
//     pub transaction_hash: String,
//     pub block_number: u64,
// }

type TransactionInformation = {
    address: string;
    input: string;
    network: string;
    transaction_hash: string;
}

type EventData = {
    from: string;
    to: string;
    transaction_information: TransactionInformation;
    value: string;
    network?: string;
    event_name?: string;
}

type TransferEvent = {
    event_data: EventData[];
    event_name: string;
    network: string;
}

export class RabbitMQProducer {
    private connection: Connection | null = null;
    private channel: Channel | null = null;
    private exchangeName: string = '';
    private queueName: string = '';
    async initialize(url: string, _exchangeName: string, _queueName: string) {
        try {
            this.exchangeName = _exchangeName;
            this.queueName = _queueName;
            this.connection = await amqp.connect(url);
            this.channel = await this.connection.createChannel();

            // Declare the exchange
            await this.channel.assertExchange(this.exchangeName, 'direct', {
                durable: true,
                autoDelete: false
            });

            // Declare and bind the queue
            await this.channel.assertQueue(this.queueName, {
                durable: true,
                autoDelete: false
            });
            await this.channel.bindQueue(this.queueName, this.exchangeName, '');

            console.log('🐰 Connected to RabbitMQ');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    async publishTransfer(data: TransferEvent, routingKey: string) {
        if (!this.channel) {
            throw new Error('RabbitMQ channel not initialized');
        }

        try {
            console.log('Publishing message:', data);
            const message = Buffer.from(JSON.stringify(data));
            this.channel.publish(this.exchangeName, routingKey, message, {
                persistent: true,
                contentType: 'application/json'
            });
        } catch (error) {
            console.error('Failed to publish message:', error);
            throw error;
        }
    }

    async shutdown() {
        try {
            await this.channel?.close();
            await this.connection?.close();
            console.log('Closed RabbitMQ connection');
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
}

// Create singleton instance
export const rabbitMQProducer = new RabbitMQProducer(); 