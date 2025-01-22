import { ponder } from "ponder:registry";
import { transferEvent } from "ponder:schema";
import { holesky, avalancheFuji } from 'viem/chains';
import { erc20ABI } from '../abis/erc20ABI';
import { createPublicClient, webSocket } from 'viem';

import { rabbitMQProducer } from "./services/rabbitmq-producer";

// Initialize RabbitMQ connection when the app starts
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = process.env.EXCHANGE_NAME || 'cross_transfers';
const QUEUE_NAME = process.env.QUEUE_NAME || 'cross_transfers_queue';
rabbitMQProducer.initialize(RABBITMQ_URL, EXCHANGE_NAME, QUEUE_NAME).catch(console.error);
const holeskyClient = createPublicClient({
  chain: holesky,
  transport: webSocket(process.env.PONDER_WS_URL_17000)
});

const fujiClient = createPublicClient({
  chain: avalancheFuji,
  transport: webSocket(process.env.PONDER_WS_URL_43113)
});

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
type TransactionInformation = {
  address: string;
  input: string;
  network: string;
  transaction_hash: string;
};

type EventData = {
  from: string;
  to: string;
  transaction_information: TransactionInformation;
  value: string;
  network?: string;
  event_name?: string;
};

type TransferEvent = {
  event_data: EventData[];
  event_name: string;
  network: string;
};
// Watch for Transfer events with filters
// const unwatchHolesky = holeskyClient.watchContractEvent({
//   address: '0x9cCad419A897FD2D4C7aC34B0D0B89bE1E9A6f8b',
//   abi: erc20ABI,
//   eventName: 'Transfer',
//   args: {
//     to: '0x25FA874601756484e51807b14Cc8114812F342BE'
//   },
//   onLogs: logs => {
//     console.log('Holesky Filtered Transfer Event:', logs);
//     logs.forEach(async log => {
//       if (!log.args.from || !log.args.to || !log.args.amount) return;

//       const tx = await holeskyClient.getTransaction({ hash: log.transactionHash });
//       const eventData: EventData = {
//         from: log.args.from,
//         to: log.args.to,
//         value: log.args.amount.toString(),
//         transaction_information: {
//           address: log.address,
//           input: tx.input,
//           network: 'holesky',
//           transaction_hash: log.transactionHash
//         },
//         network: 'holesky',
//         event_name: 'Transfer'
//       };

//       const transferEvent: TransferEvent = {
//         event_data: [eventData],
//         event_name: 'Transfer',
//         network: 'holesky'
//       };

//       console.log('Publishing transfer event to RabbitMQ:', transferEvent);

//       rabbitMQProducer.publishTransfer(transferEvent, 'holesky')
//         .catch(err => console.error('Failed to publish to RabbitMQ:', err));
//     });
//   }
// });

// const unwatchFuji = fujiClient.watchContractEvent({
//   address: '0x16a2779b4F52424C89CbC897E53e5e954A25E72F',
//   abi: erc20ABI,
//   eventName: 'Transfer',
//   args: {
//     to: '0x25FA874601756484e51807b14Cc8114812F342BE'
//   },
//   onLogs: logs => {
//     console.log('Fuji Filtered Transfer Event:', logs);
//     logs.forEach(async log => {
//       if (!log.args.from || !log.args.to || !log.args.amount) return;

//       const tx = await fujiClient.getTransaction({ hash: log.transactionHash });
//       const eventData: EventData = {
//         from: log.args.from,
//         to: log.args.to,
//         value: log.args.amount.toString(),
//         transaction_information: {
//           address: log.address,
//           input: tx.input, // Actual transaction input
//           network: 'avalancheFuji',
//           transaction_hash: log.transactionHash
//         },
//         network: 'avalancheFuji',
//         event_name: 'Transfer'
//       };

//       const transferEvent: TransferEvent = {
//         event_data: [eventData],
//         event_name: 'Transfer',
//         network: 'avalancheFuji'
//       };

//       console.log('Publishing transfer event to RabbitMQ:', transferEvent);

//       rabbitMQProducer.publishTransfer(transferEvent, 'avalancheFuji')
//         .catch(err => console.error('Failed to publish to RabbitMQ:', err));
//     });
//   },
// });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down log watchers...');
  // unwatchHolesky();
  // unwatchFuji();
  // await rabbitMQProducer.shutdown();
  process.exit(0);
});

console.log('🚀 Log watchers started');