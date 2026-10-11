---
title: "Trade-offs in Aggregate Design when implementing CQRS in Elixir"
date: 2025-12-29T16:27Z
---

## Introduction

Event sourcing with CQRS is a powerful feature, but it presents difficult design decisions which can challenge dogmatic Domain Driven Design theory. Ultimately as with all software engineering trade-offs, the business need dictates whether the complexity is worth it.

It's not an easy decision to introduce the CQRS pattern when simpler ones appear to be adequate, at least on the surface. In this blog post we'll cover how we used it to solve the seemingly simple problem of waitlist notifications. We'll also cover how it addressed the need for efficient analytics and history tracking of sales.

This post walks through our implementation of CQRS (Command Query Responsibility Segregation) with the [Commanded](https://github.com/commanded/commanded) library to build a complete inventory audit trail. We'll cover:

-   **The business problem**: Why simple inventory tracking wasn't enough
-   **Evaluating alternatives**: From database triggers to CQRS, and why we chose what we did
-   **Aggregate design**: The critical decision of small vs large aggregates
-   **Implementation**: Commands, events, aggregates, projectors, handlers, and the service layer
-   **Event handlers**: How we used the event stream to solve notifying customers when sold-out items become available
-   **Production challenges**: EventStore on managed PostgreSQL
-   **Test synchronization without sleep calls**: Writing deterministic tests without brittle sleep calls
-   **Key lessons**: What we'd do the same, and what we learned

Let's dive in.

* * *

## The Business Problem

### Notifying Customers When Inventory Becomes Available

Inventory in the system can increase for an item for many reasons: refunds, swaps, or an administrator increasing capacity for an event. The question we are trying to answer is whether a sold out item just became available due to any of these reasons, and if so, can we notify people who signed up to get notified when it became available?

Popular events sell out fairly quickly leaving many disappointed, and instead of having people call the organizer asking to allocate more tickets or people coming refreshing the page to see if something opened up, we decided to implement a "post sell out waitlist" where people can sign up to receive notifications if inventory became available.

### Improving Auditability

We also wanted to improve the auditability and granularity of how we track inventory changes over time. The existing system tracked `inventory_quantity` on each item, but had no history of how it got there, at least not one that is easy and efficient to read. We could do several joins and some in-memory calculations to replay how sales went, but the user experience would be slow and the data wouldn't be conducive to analytics. We wanted efficient reads of sales history for both customer analytics and internal system auditability and debugging, so we know where things went wayward when problems inevitably happen. Customers also wanted to know:

-   How did this show sell out earlier than expected?
-   Who adjusted the capacity, and when?
-   What was the inventory level at any point in time and what happened to get it there?

We didn't just need to know _what_ changed, but _why_ it changed and _who_ made it happen.

* * *

## Evaluating the Options

### Option 1: Database Triggers

PostgreSQL triggers could automatically log changes to the variants table:

```
CREATE TRIGGER log_inventory_change
AFTER UPDATE OF inventory_quantity ON product_variants
FOR EACH ROW EXECUTE FUNCTION log_variant_change();
```

This is easy to implement, transparent and requires no application code changes as the database does the work.

The problem with this approach is that business context is completely lost. The trigger sees "quantity changed from 100 to 98" but can't distinguish a sale from a return from an admin adjustment. Maintenance becomes a separate concern from application logic. The days or PL/SQL where business logic sits inside the database are long gone, and application logic holds business rules. This method doesn't have easy access to the larger context of why data is being manipulated.

### Option 2: Ecto Callbacks

We could use Ecto's lifecycle callbacks to log changes:

```
defmodule ProductVariant do
  use Ecto.Schema

  after_update :log_inventory_change

  defp log_inventory_change(changeset) do
    # Log the change...
  end
end
```

This keeps the code in Elixir and there is some entity specific business context available via the changeset. The logic lives "near" the entity so it's hard to miss and the language seems logical. The issue with this pattern is that it's brittle as it still has to calculate in code why the change happened, which means the changeset will need to be bloated and carry more information than it actually is changing.

For example, just because we're updating the quantity from one value to another, the changeset would have to carry much more information than that to serve the auditability needs. It's also easy to bypass with direct `Repo.update_all` calls.

It also tightly couples the business transaction with logging needs.

### Option 3: Manual Logging in Context Functions

We could add explicit log inserts alongside every inventory-changing operation:

```
def process_refund(params) do
  # Update inventory
  Repo.update!(variant, inventory_quantity: params.quantity)

  # Log the change
  Repo.insert!(%InventoryLog{
    variant_id: params.variant_id,
    reason: "refund",
    quantity_change: -params.quantity,
    order_id: params.order_id
  })
end
```

We could do this for sales, swaps etc, and have the full business context available while having explicit code that writes to the log table.

This is easy to forget in some code paths and you have logging code scattered across the codebase. Consistency guaranteed decrease as if the log fails, the transaction will fail which may not be what we always want. There is lots of code duplication as the log entity needs to be constructed in multiple places.

### Option 4: CQRS with Large Aggregates

CQRS with Commanded can work if we use aggregates at the Order level. An `OrderInventory` aggregate would track all inventory changes for an entire order. We get transactional consistency across all line items in an order.

However, aggregate boundary design is hard, and when multiple operations touch the same order we run into consistency challenges. The larger aggregate state needs to load/rebuild frequently and cross-order operations like admin adjustments don't fit the model well as it's not happening within the context of an order. We could design multiple aggregates like OrderInventory and AdminInventory but now there is overlap in concepts and language, which violates some core principles of Domain Driven Design.

Invariants are also hard to construct as the relationship between orders, item inventory and an admin's workflow spans many entities, making the invariant brittle.

### Option 5: CQRS with Small Aggregates (Chosen One)

CQRS with Commanded but with smaller aggregates specific to an item/variant's inventory is what we landed on. Specifically, a `VariantInventory` aggregate per product variant which tracks that items inventory and doesn't explicitly tie the aggregate to larger entities like Order. A big reason we chose this was the guidance provided by Vaughn Vernon in his three-part series ([1](http://dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_1.pdf), [2](http://dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_2.pdf), [3](http://dddcommunity.org/wp-content/uploads/files/pdf_articles/Vernon_2011_3.pdf)) discussing aggregate modelling.

There's also minimal contention as different variants get processed concurrently due to the simpler aggregate state. It's easy to reason about as each aggregate answers one question: "What happened to this variant's inventory?"

The audit requirements demanded explicit business intent capture. We needed "this inventory decreased because of a sale on order #123," not just "inventory\_quantity changed from 100 to 98."

CQRS with Commanded gave us:

1.  Explicit commands that capture intent (RecordSale, RecordReturn, RecordAdminAdjustment)
2.  Immutable events stored in an append-only log (EventStore)
3.  Separation of write model (aggregates) from read model (projections)
4.  Inventory changes are naturally variant-scoped
5.  High concurrency during ticket sales demands minimal contention
6.  Each aggregate tracks one thing, making it easy to understand and debug

Eric Evans' DDD "Blue Book" often implies larger aggregates that enforce complex invariants. But when the domain naturally partitions (inventory per variant), smaller aggregates reduce complexity and improve performance.

The cons may be that cross-variant operations require multiple commands and we can't enforce cross-variant business rules in a single transaction. This is not currently a business requirement for us, so we went with the smaller, more purposeful aggregates rather than a more traditional one.

## Architecture Overview

### The CQRS Pattern in Our Context

Here's the flow from a sale to the audit log:

```
Service Layer (Inventory.record_order_sales)
    ↓
Command (RecordSale)
    ↓
Router (InventoryRouter)
    ↓
Aggregate (VariantInventory.execute)
    ↓
Event (InventoryChanged)
    ↓
Projector (InventoryProjector)
    ↓
Handler (InventoryHandler)
    ↓   
Read Model (inventory_events table)
```

The sequence diagram illustrates this further: ![cqrs-sequence-diagram](/images/cqrs-sequence-diagram.svg)

[Open in New Window](/images/cqrs-sequence-diagram.svg)

Each layer has a specific responsibility:

-   **Commands** represent intent ("record a sale of 2 tickets")
-   **Aggregates** enforce business rules and produce events
-   **Events** represent facts that happened ("inventory changed")
-   **Projectors** build read models optimized for queries
-   **Handlers** implement side effects (e.g., sending out emails)

### Key Components

| Component | Module | Purpose |
| --- | --- | --- |
| Application | `Amplify.CommandedApplication` | Commanded application, supervises everything |
| Router | `Amplify.CQRS.Routers.InventoryRouter` | Routes commands to aggregates by variant\_id |
| Aggregate | `Amplify.CQRS.Aggregates.VariantInventory` | Business logic, produces events |
| Event | `Amplify.CQRS.Events.InventoryChanged` | Immutable fact record |
| Projector | `Amplify.CQRS.Projectors.InventoryProjector` | Writes to inventory\_events table |
| Handler | `Amplify.CQRS.Handlers.InventoryHandler` | Checks if any business actions with side effects need to be taken |
| Service | `Amplify.Services.Inventory` | Clean API for callers |

* * *

## Implementation Deep Dive

### Command Design

We have six command types, each capturing specific business intent:

```
# Record a sale from an order
defmodule Amplify.CQRS.Commands.Inventory.RecordSale do
  defstruct [
    :variant_id,
    :order_id,
    :quantity_sold,
    :actor_id,
    :actor_type,
    metadata: %{}
  ]
end

# Record an admin capacity adjustment
defmodule Amplify.CQRS.Commands.Inventory.RecordAdminAdjustment do
  defstruct [
    :variant_id,
    :quantity_remaining,  # Absolute value, not delta
    :actor_id,
    :actor_type,
    metadata: %{}
  ]
end

# Other commands: RecordReturn, RecordSwapIn, RecordSwapOut, RecordVariantCreated
```

Notice the difference: `RecordSale` has `quantity_sold` (a delta), while `RecordAdminAdjustment` has `quantity_remaining` (an absolute value). This matches how humans think about these operations. A sale may reduce inventory by 2, but when an admin makes a change they change the overall capacity of an event from 50 to 60 and enter the number 60 into the UI instead of 10 (60-50). This is a tenet of Domain Driven Design where our language matches the business context of an operation.

### The Single Event Approach

We use one event type for all inventory changes:

```
defmodule Amplify.CQRS.Events.InventoryChanged do
  @derive Jason.Encoder
  defstruct [
    :variant_id,
    :order_id,
    :return_id,
    :reason,              # :sale, :return, :admin_adjustment, :swap_in, :swap_out
    :actor_id,
    :actor_type,
    quantity_remaining: 0,
    quantity_sold: 0,
    quantity_adjustment: 0,
    was_sold_out: false,
    is_sold_out: false,
    metadata: %{}
  ]
end
```

Why one event type instead of `InventorySold`, `InventoryReturned`, etc.? Simplicity. The `reason` field captures the business intent, and the projector handles all events uniformly. We can always split into multiple event types later if needed, but we opted to go for a simpler approach to start.

### The Aggregate

The aggregate is where business logic lives. It's identified by `variant_id`:

```
defmodule Amplify.CQRS.Routers.InventoryRouter do
  use Commanded.Commands.Router

  alias Amplify.CQRS.Aggregates.VariantInventory
  alias Amplify.CQRS.Commands.Inventory.{RecordSale, RecordAdminAdjustment, ...}

  # Each variant_id gets its own aggregate instance
  identify(VariantInventory, by: :variant_id, prefix: "variant-inventory-")

  dispatch([RecordSale, RecordAdminAdjustment, ...],
    to: VariantInventory,
    identity: :variant_id)
end
```

The aggregate's `execute/2` function takes a command and returns an event:

```
defmodule Amplify.CQRS.Aggregates.VariantInventory do
  defstruct [
    :variant_id,
    quantity_remaining: 0,
    quantity_sold: 0,
    is_sold_out: false
  ]

  def execute(%__MODULE__{} = state, %RecordSale{} = cmd) do
    new_sold = state.quantity_sold + cmd.quantity_sold
    new_remaining = state.quantity_remaining - cmd.quantity_sold
    new_sold_out = new_remaining <= 0

    %InventoryChanged{
      variant_id: cmd.variant_id,
      order_id: cmd.order_id,
      reason: :sale,
      actor_id: cmd.actor_id,
      actor_type: cmd.actor_type,
      quantity_remaining: new_remaining,
      quantity_sold: new_sold,
      quantity_adjustment: -cmd.quantity_sold,
      was_sold_out: state.is_sold_out,
      is_sold_out: new_sold_out
    }
  end

  def execute(%__MODULE__{} = state, %RecordAdminAdjustment{} = cmd) do
    # Admin adjustments set absolute quantity, not delta
    adjustment = cmd.quantity_remaining - state.quantity_remaining
    %InventoryChanged{
      ...
    }
  end

  # apply/2 updates state from events (for rebuilding from event stream)
  def apply(%__MODULE__{} = state, %InventoryChanged{} = event) do
    %__MODULE__{state |
      variant_id: event.variant_id,
      quantity_remaining: event.quantity_remaining,
      quantity_sold: event.quantity_sold,
      is_sold_out: event.is_sold_out
    }
  end
end
```

### The Projector and Read Model

The projector subscribes to events and writes to the database. Importantly, it enriches the event with `product_id` and `account_id` that we derive from the variant:

```
defmodule Amplify.CQRS.Projectors.InventoryProjector do
  use Commanded.Projections.Ecto,
    application: Amplify.CommandedApplication,
    repo: Amplify.Repo,
    name: "InventoryProjector",
    consistency: :strong

  project(%InventoryChanged{} = event, _metadata, fn multi ->
    # Derive product_id and account_id from the variant
    {product_id, account_id} = get_product_and_account_ids(event.variant_id)

    changeset =
      %InventoryEvent{}
      |> Ecto.Changeset.change(%{
        variant_id: event.variant_id,
        product_id: product_id,
        account_id: account_id,
        order_id: event.order_id,
        return_id: event.return_id,
        reason: to_string(event.reason),
        actor_id: event.actor_id,
        actor_type: to_string(event.actor_type),
        quantity_remaining: event.quantity_remaining,
        quantity_adjustment: event.quantity_adjustment,
        was_sold_out: event.was_sold_out,
        is_sold_out: event.is_sold_out
      })

    Ecto.Multi.insert(multi, :inventory_event, changeset)
  end)

  defp get_product_and_account_ids(variant_id) do
    query = from v in ProductVariant,
      join: p in assoc(v, :product),
      where: v.id == ^variant_id,
      select: {p.id, p.account_id}

    Repo.one(query) || {nil, nil}
  end
end
```

This is a key design decision: commands only need `variant_id`, and the projector derives additional context. This keeps commands simple and decoupled. We could have passed in `product_id` and `account_id` as part of the command and event, but that seemed like unnecessary proliferation of data, especially when they can be easily and consistently derived.

### The Service Layer: Encapsulating CQRS Complexity

Client code shouldn't need to know about commands, aggregates, or Commanded. The service layer provides a clean API:

```
defmodule Amplify.Services.Inventory do
  alias Amplify.CQRS.Commands.Inventory.{RecordSale, RecordReturn, ...}
  alias Amplify.Context.Orders

  def record_order_sales(order_id, opts \\ []) do
    order = Orders.get_order(order_id)
    dispatch_opts = if opts[:consistency] == :strong,
      do: [consistency: :strong],
      else: []

    Enum.each(order.line_items, fn line_item ->
      cmd = %RecordSale{
        variant_id: line_item.variant_id,
        order_id: order_id,
        quantity_sold: line_item.quantity,
        actor_id: nil,
        actor_type: :system
      }
      Amplify.CommandedApplication.dispatch(cmd, dispatch_opts)
    end)

    :ok
  end

  def record_admin_adjustment(variant_id, quantity_remaining, user_id) do
     ...
  end
end
```

Compare what client code looks like with and without the service layer:

**Without service layer:**

```
# In AMQP worker - messy, repeated, error-prone
order = Orders.get_order(order_id)
Enum.each(order.line_items, fn li ->
  cmd = %RecordSale{
    variant_id: li.variant_id,
    order_id: order_id,
    quantity_sold: li.quantity,
    actor_id: nil,
    actor_type: :system,
    metadata: %{}
  }
  Amplify.CommandedApplication.dispatch(cmd)
end)
```

**With service layer:**

```
# Clean, single line
Inventory.record_order_sales(order_id)
```

* * *

## Design Decisions and Trade-offs

### Small vs Large Aggregates: A Deep Dive

This was our most impactful architectural decision.

Eric Evans' "Blue Book" tends toward larger aggregates that enforce invariants across related entities. An Order aggregate containing LineItems ensures order totals stay consistent. This makes sense when you need transactional guarantees across the whole.

For inventory tracking, we chose one aggregate per variant rather than per-order or per-product:

1.  **Natural Domain Boundaries**: When someone buys 2 GA and 1 VIP ticket, those are independent inventory operations. There's no invariant requiring atomic updates across variants.
    
2.  **Concurrency and Contention**: During a hot ticket sale, hundreds of concurrent purchases hit the system. With per-product aggregates, every purchase would serialize. With per-variant, GA and VIP process in parallel.
    
3.  **Aggregate Loading Cost**: Commanded rebuilds aggregate state by replaying events. Large aggregates accumulate more events, making each command slower.
    
4.  **Cognitive Simplicity**: Each `VariantInventory` answers one question: "What happened to this variant's inventory?"
    

The trade-off here can be seen in ticket swaps where that affect two variants, but due to our design we can only update one aggregate atomically. The solution is to dispatch two commands (`RecordSwapOut`, `RecordSwapIn`). We lose atomic guarantee but can correlate via `order_id`. In this case, eventual consistency is more than acceptable. My personal view is that eventually consistency is often acceptable and developers tend to over-index to strong consistency models only out of habit or an unfounded fear. We sometimes forget that not too long ago, almost everything was a batch job and never strongly consistent. I digress.

### Strong vs Eventual Consistency

CQRS often emphasizes eventual consistency, but we needed both:

-   For admin adjustments through the UI, we need strong consistency as users expect to see their change immediately as they're waiting on a screen.
-   Background order processing can be oK with eventual consistency as there is no user waiting so we can focus on maximizing throughput.
-   For tests we need strong consistency so we can have deterministic assertions without sleep calls (e.g., waiting for background processes to finish making for brittle tests)

```
# Background jobs: eventual (default)
Inventory.record_order_sales(order_id)

# Admin UI: strong
Inventory.record_admin_adjustment(variant_id, 100, user_id)  # Always strong

# Tests: strong for determinism
Inventory.record_order_sales(order_id, consistency: :strong)
```

### Multiple Sources of Truth for Inventory

As it stands, we have two sources of truth for the inventory number. The first is the value in the `inventory_quantity` column in the table, and the second is the aggregate. This is an acceptable trade-off as we use the aggregate event sourcing to determine moment in time actions and auditability, while the `inventory_quantity` field can really be thought of as a read projection which will eventually go away.

* * *

## Integration and Testing

### AMQP Message Handlers

Sometimes new events can come in from other systems via a queue, and our inventory service integrates cleanly with AMQP workers listening for messages. In both examples below we use eventual consistency due to reasons stated earlier.

```
def handle_deliver(%{queue: "new_order_queue"}, message) do
  order_id = message.payload

  # ... other order processing ...

  # One line to record all inventory changes
  Inventory.record_order_sales(order_id)

  :ok
end

def handle_deliver(%{queue: "return_processed_queue"}, message) do
  return_id = message.payload

  # ... refund processing ...

  Inventory.record_return(return_id)

  :ok
end
```

### End-to-End Testing Without Sleep Calls

One of the best aspects of this architecture is testability. Look at this test:

```
test "records sale for each line item in order" do
  # Setup: create test data
  account = insert(:account)
  product = insert(:event_product, account: account)
  variant1 = insert(:product_variant, product: product, inventory_quantity: 100)
  variant2 = insert(:product_variant, product: product, inventory_quantity: 50)
  customer = insert(:customer)

  order = create_order(customer: customer)
  insert(:line_item, order: order, variant: variant1, quantity: 2)
  insert(:line_item, order: order, variant: variant2, quantity: 3)

  # Execute: call the service layer with strong consistency
  :ok = Inventory.record_order_sales(order.id, consistency: :strong)

  # Assert: query the read model immediately - no sleep needed!
  events = Repo.all(from e in InventoryEvent, order_by: e.inserted_at)
  assert length(events) == 2

  [event1, event2] = events
  assert event1.variant_id == variant1.id
  assert event1.quantity_adjustment == -2
  assert event1.reason == "sale"
  assert event1.order_id == order.id

  assert event2.variant_id == variant2.id
  assert event2.quantity_adjustment == -3
end
```

This test exercises the _entire_ CQRS stack:

1.  Service Layer (`Inventory.record_order_sales`) loads the order and constructs commands
2.  Router routes commands to the correct aggregate instances
3.  Aggregate (`VariantInventory.execute`) produces events
4.  EventStore persists the events
5.  Projector writes to the `inventory_events` table
6.  Database stores the read model

And we can assert immediately after the call because `consistency: :strong` blocks until the projection completes. No `Process.sleep(100)` hoping the async work finished.

The naive approach with eventual consistency:

```
# Bad: flaky, slow, non-deterministic
Inventory.record_order_sales(order_id)
Process.sleep(100)  # Hope 100ms is enough... it often isn't
event = Repo.one(InventoryEvent)  # Might still be nil!
```

Problems with sleep:

-   Unreliable: 100ms might not be enough under load, and you're always hitting the "floor" waiting time even though you may not need it. And there's no guarantees it's enough.
-   Slow: 100ms per test × hundreds of tests = minutes wasted during CI and in local development.
-   It is inherently non-deterministic making continuous integration flaky and unreliable.

Strong consistency in tests solves all of this.

* * *

## Closing the Loop: Waitlist Notifications

Remember the business problem from the introduction? We needed to notify customers when sold-out tickets become available. With our CQRS architecture in place, we now have all the pieces to solve this.

### The Missing Piece: Event Handlers

Commanded provides [Event Handlers](https://hexdocs.pm/commanded/events.html#event-handlers) that subscribe to the event stream and react to events. Unlike projectors (which build read models), handlers execute side effects which is perfect for triggering notifications.

Here's our waitlist notification handler:

```
defmodule Amplify.CQRS.Handlers.InventoryHandler do
  @moduledoc """
  Event handler that monitors inventory changes and triggers waitlist notifications
  when inventory becomes available (transitions from sold out to available).
  """

  use Commanded.Event.Handler,
    application: Amplify.CommandedApplication,
    name: "InventoryHandler",
    consistency: :strong

  alias Amplify.CQRS.Events.InventoryChanged

  require Logger

  @impl Commanded.Event.Handler
  def handle(%InventoryChanged{} = event, _metadata) do
    if inventory_became_available?(event) do
      # write code to handle waitlist notifications
    end

    :ok
  end

  # Check if inventory transitioned from sold out to available
  defp inventory_became_available?(%InventoryChanged{was_sold_out: true, is_sold_out: false}) do
    true
  end

  defp inventory_became_available?(_event), do: false
end
```

### The Power of Event-Driven Design

Notice what's happening here. We didn't have to:

1.  Modify any existing code as the handler subscribes to the same events the projector already receives
2.  Add notification logic to business operations and the service layer doesn't know or care about waitlists
3.  Track "previous state" manually as the aggregate already computed `was_sold_out` and `is_sold_out`

The pattern match is elegant: `%InventoryChanged{was_sold_out: true, is_sold_out: false}` captures exactly the transition we care about which is inventory that _was_ sold out but _isn't anymore_.

### Testing Event Transitions

We verify the handler's detection logic by testing the events it would receive. The beautify of `ExUnit` and how easily it integrates with databases gives confidence to our tests. We do almost zero manual testing of even the most complex use cases due to a strong integration test suite.

```
test "event correctly tracks sold out to available transition" do
  account = insert(:account)
  product = insert(:event_product, account: account)
  variant = insert(:product_variant, product: product, inventory_quantity: 0)
  user = insert(:user)

  # First, record sold out state
  :ok = Inventory.record_admin_adjustment(variant.id, 0, user.id)

  # Now increase inventory - this creates the waitlist trigger event
  :ok = Inventory.record_admin_adjustment(variant.id, 50, user.id)

  events = Repo.all(from e in InventoryEvent, order_by: [desc: e.inserted_at], limit: 1)
  [event] = events

  # This event represents the exact transition the handler looks for
  assert event.was_sold_out == true
  assert event.is_sold_out == false
  assert event.quantity_remaining == 50
end
```

### Why This Architecture Shines

This is where CQRS pays off. The business asked: "Can we notify people when tickets become available?" With traditional CRUD, we'd need to:

1.  Find every place inventory gets updated
2.  Add "was it sold out before?" checks to each location
3.  Hope we didn't miss any code paths
4.  Couple notification logic to inventory operations

With event sourcing, we added one handler that subscribes to the event stream. Every inventory change - sales, returns, swaps, admin adjustments - flows through the same pipeline. The handler sees them all, filters for the transition it cares about, and triggers notifications.

The aggregate already tracked the state transition (`was_sold_out` → `is_sold_out`) because we designed events to capture complete before/after context. We can't anticipate what features are needed next, but this design gives us extensibility as new features become subscribers to existing events, not modifications to existing code. This is fundamentally why we decided the complexity was worth it.

* * *

## Challenges and Resolutions

### EventStore Setup on Managed PostgreSQL

When deploying to production on DigitalOcean's managed PostgreSQL, we hit an issue:

```
** (Postgrex.Error) ERROR 3D000 (invalid_catalog_name): database "postgres" does not exist
```

The Problem was that `EventStore.Tasks.Create.exec` connects to a `postgres` maintenance database to create the EventStore database. Managed PostgreSQL often doesn't have this default database so we needed to specify a `default_database` in our event store configuration which wasn't needed locally.

### Swap Operations Spanning Two Variants

Ticket swaps move inventory from one variant to another. But with per-variant aggregates, we can't atomically update both.

The solution, as earlier touched on, was to dispatch two commands and correlate via `order_id`:

```
def record_swap(order_id, swapped_out_variant_id, swapped_in_variant_id, opts \\ []) do
  order = Orders.get_order(order_id)
  quantity = get_swap_quantity(order, swapped_out_variant_id)

  # Two separate commands, same order_id for correlation
  dispatch(%RecordSwapOut{
    variant_id: swapped_out_variant_id,
    order_id: order_id,
    quantity_returned: quantity
  }, opts)

  dispatch(%RecordSwapIn{
    variant_id: swapped_in_variant_id,
    order_id: order_id,
    quantity_sold: quantity
  }, opts)

  :ok
end
```

For audit purposes, this is fine. We can query both events by `order_id` to see the complete swap.

* * *

## Lessons Learned

### Start Simple

A single event type with a `reason` field was the right starting point. We can always split into `InventorySold`, `InventoryReturned`, etc. later if we need stronger typing. Starting with many event types adds complexity before you understand the domain.

### Commands Capture Intent, Events Capture Facts

Commands describe what you want to do: "Record a sale of 2 tickets." Events describe what happened: "Inventory changed, reason: sale, adjustment: -2." This separation is where the audit value comes from.

### Projector Enrichment is Powerful

Keeping commands minimal (`variant_id` only) and letting the projector derive `product_id` and `account_id` kept the command interface clean. The projector can afford the extra query; commands should be lightweight.

### Make Room for Side Effects

The handlers feature for Commander is critical for implementing side effects. It is an extensible escape hatch where you can do whatever you like (within reason) and aren't tied to CQRS rules like avoiding side effects in aggregate state mutations, always ensuring methods which transform commands to events don't fail, etc.

### Strong Consistency Has Its Place

Despite CQRS literature emphasizing eventual consistency, having the option for strong consistency was essential for:

-   Admin UI responsiveness
-   Deterministic tests
-   Critical operations where "fire and forget" isn't acceptable

* * *

## Conclusion

### The Aggregate Design Decision

The most impactful choice wasn't whether to use CQRS - it was aggregate sizing.

| Consideration | Large Aggregates | Small Aggregates |
| --- | --- | --- |
| Invariant enforcement | Strong (atomic) | Weak (eventual) |
| Contention under load | High | Low |
| Event stream size | Large, slow rebuild | Small, fast rebuild |
| Cognitive load | Higher | Lower |
| Cross-entity operations | Single command | Multiple commands |

For inventory tracking, small aggregates (per-variant) won because:

1.  No cross-variant invariants require atomic enforcement
2.  High concurrency demands low contention
3.  Simple aggregates are easier to debug and evolve

### Key Takeaways

-   Start with the smallest aggregate boundary that makes sense for your domain
-   Use strong consistency selectively: admin UIs and tests, not background processing
-   Encapsulate CQRS behind a service layer: callers shouldn't know about commands
-   Design events with before/after context - you'll thank yourself when new features need state transitions
-   The "right" aggregate size depends on your invariants, not DDD orthodoxy
-   Decide what is a "running total" versus what is a snapshot in your read-only projections; this will depend on the business problem you're trying to solve

### Should You Use CQRS?

Before reaching for CQRS, evaluate whether your audit needs justify the complexity.

If you need "who changed what when", simple logging might suffice. If you need "why did this change and what was the business intent", CQRS shines. If you need "react to state transitions across the system", CQRS with event handlers is ideal.

For our inventory tracking, the explicit command-driven approach forces developers to think about _why_ inventory changes. That's where the audit value comes from. And when the business asked "can you also notify waitlisted customers when tickets are no longer available?" we added a single event handler with no modifications to existing code. That's the real payoff of event-driven architecture, and that's why the added complexity was worth it.
