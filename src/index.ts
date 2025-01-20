import { ponder } from "ponder:registry";
import { transferEvent } from "ponder:schema";
import { rabbitMQProducer } from "./services/rabbitmq-producer";

// Initialize RabbitMQ connection when the app starts
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
rabbitMQProducer.initialize(RABBITMQ_URL).catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await rabbitMQProducer.shutdown();
  process.exit(0);
});

ponder.on("ERC20:Transfer", async ({ event, context }) => {
  const hash = deriveHash(event.transaction.input);
  if (!hash) return;

  const transferData = {
    id: event.transaction.hash,
    block_number: Number(event.block.number),
    tx_hash: event.transaction.hash,
    amount: event.args.amount,
    timestamp: Number(event.block.timestamp),
    from: event.args.from,
    to: event.args.to,
    hash: hash,
  };

  await context.db.insert(transferEvent).values(transferData);

  // Publish transfer event to RabbitMQ
  await rabbitMQProducer.publishTransfer({
    event_data: [{
      from: event.args.from.toLowerCase(),
      to: event.args.to.toLowerCase(),
      value: event.args.amount.toString(),
      transaction_information: {
        address: event.log.address.toLowerCase(),
        input: event.transaction.input,
        network: context.network.name,
        transaction_hash: event.transaction.hash,
      },
      network: context.network.name,
      event_name: 'Transfer'
    }],
    event_name: 'Transfer',
    network: context.network.name
  }, context.network.name);
});

function deriveHash(input: `0x${string}`) {
  if (input.length !== 202) return null;
  return `0x${input.slice(input.length - 64)}` as `0x${string}`;
}

