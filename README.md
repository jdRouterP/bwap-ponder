# Example ERC20 token API

This example shows how to create a GraphQL API for an ERC20 token using Ponder. It uses the Adventure Gold token contract on Ethereum ([Link](https://etherscan.io/address/0x32353A6C91143bfd6C7d363B546e62a9A2489A20)).

## Sample queries

### Get the current balance and all approvals for an account

```graphql
{
  account(id: "0x1337f7970E8399ccbc625647FCE58a9dADA5aA66") {
    balance
    approvals {
      spender
      amount
    }
  }
}
```

### Get the top 10 accounts by balance

```graphql
{
  accounts(first: 10, orderBy: "balance", orderDirection: "desc") {
    id
    balance
  }
}
```

### Get the current owner of the token contract

```graphql
{
  accounts(where: { isOwner: true }) {
    id
  }
}
```

### Get all transfer events for an account

```graphql
{
  account(id: "0x1337f7970E8399ccbc625647FCE58a9dADA5aA66") {
    transferEventsTo {
      from
      amount
    }
    transferEventsFrom {
      to
      amount
    }
  }
}
```

## Database Setup

The application uses PostgreSQL as its database. When running with Docker Compose, the database is automatically configured and connected. The default credentials are:

- Database: ponder_db
- Username: ponder
- Password: ponderpass
- Host: localhost (or postgres when accessing from within Docker)
- Port: 5432

### Local Development

For local development without Docker, you'll need to:

1. Install PostgreSQL
2. Create a database named `ponder_db`
3. Set the DATABASE_URL in your .env.local file:
   ```
   DATABASE_URL=postgresql://ponder:ponderpass@localhost:5432/ponder_db
   ```

### Production Deployment

For production, make sure to:
1. Use strong, unique passwords
2. Configure proper database backups
3. Set up appropriate database access controls
