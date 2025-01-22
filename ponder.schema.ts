import { index, onchainEnum, onchainTable, relations } from "ponder";

export const status = onchainEnum("status", ["PENDING", "COMPLETED", "FAILED"]);

export const type = onchainEnum("type", ["DEPOSIT", "WITHDRAWAL"]);

export const crossTransfer = onchainTable("cross_transfer", (t) => ({
  id: t.text().primaryKey(),
  src_hash: t.hex().notNull(),
  dst_hash: t.hex(),
  created_at: t.integer().notNull(),
  filled_at: t.integer(),
  status: status("status").notNull(),
  sender: t.hex().notNull(),
  receiver: t.hex(),
  from_amount: t.bigint(),
  to_amount: t.bigint(),
}));

export const crossTransferRelations = relations(crossTransfer, ({ one }) => ({
  src: one(transferEvent, {
    fields: [crossTransfer.src_hash],
    references: [transferEvent.id],
  }),
  dst: one(transferEvent, {
    fields: [crossTransfer.dst_hash],
    references: [transferEvent.id],
  }),
}));

export const transferEvent = onchainTable(
  "transfer",
  (t) => ({
    id: t.text().primaryKey(),
    block_number: t.integer().notNull(),
    tx_hash: t.hex().notNull(),
    amount: t.bigint().notNull(),
    timestamp: t.integer().notNull(),
    from: t.hex().notNull(),
    to: t.hex().notNull(),
    hash: t.hex().notNull(),
    type: type("type").notNull(),
  }),
  (table) => ({
    fromIdx: index("from_index").on(table.from),
  }),
);
