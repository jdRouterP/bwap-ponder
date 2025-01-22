import { ponder } from "ponder:registry";
import {
  crossTransfer,
  transferEvent,
} from "ponder:schema";
import { depositAddress, solverAddress } from "./constants";

ponder.on("ERC20:Transfer", async ({ event, context }) => {
  const hash = deriveHash(event.transaction.input);

  if (!hash) {
    return;
  }
  if (depositAddress[context.network.chainId].includes(event.args.to.toLowerCase())) {
    await context.db.insert(crossTransfer).values({
      id: hash,
      src_hash: event.transaction.hash,
      dst_hash: null,
      status: "PENDING",
      created_at: Number(event.block.timestamp),
      sender: event.args.from,
      from_amount: event.args.amount,
      from_token: event.log.address,
      from_chain: context.network.chainId,
    }).onConflictDoNothing();
  } else if (solverAddress[context.network.chainId].includes(event.args.from.toLowerCase())) {
    const crossTransferItem = await context.db.find(crossTransfer, {
      id: hash,
    });
    if (!crossTransferItem) {
      return;
    }
    if (crossTransferItem.status === "COMPLETED") {
      return;
    }
    await context.db.update(crossTransfer, {
      id: hash
    }).set({
      dst_hash: event.transaction.hash,
      status: "COMPLETED",
      filled_at: Number(event.block.timestamp),
      receiver: event.args.to,
      to_amount: event.args.amount,
      to_token: event.log.address,
      to_chain: context.network.chainId,
    });
  }

  const type: "WITHDRAWAL" | "DEPOSIT" = solverAddress[context.network.chainId].includes(event.args.from.toLowerCase()) ? "WITHDRAWAL" : "DEPOSIT";

  await context.db.insert(transferEvent).values({
    id: event.transaction.hash,
    block_number: Number(event.block.number),
    tx_hash: event.transaction.hash,
    amount: event.args.amount,
    timestamp: Number(event.block.timestamp),
    from: event.args.from,
    to: event.args.to,
    hash,
    type,
  });
});

function deriveHash(input: `0x${string}`) {
  if (input.length !== 202) {
    return null;
  }
  // last 32 bytes
  return `0x${input.slice(input.length - 64)}` as `0x${string}`;
}

