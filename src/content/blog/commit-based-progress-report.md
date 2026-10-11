---
title: "Commit-based Progress Report"
date: 2026-03-29T20:15Z
---

I had to give someone an update on what's new with the app over the last couple months, what value was added and what, if any, technical improvements were made. Took an agent 2 minutes using a common-sense prompt to produce the below. I asked it to scan `git log` and based on that produce an update. The value of commit messages was always important, but now it's even more so since they are the ultimate source of truth (along with the code) on what actually was done.

* * *

# Jump Platform — Changes Summary (Feb 1 – Mar 29, 2026)

## Product Features & Improvements

### Payments & Checkout

-   **Apple Pay & Google Pay** — Customers can now tap to pay with Apple Pay or Google Pay on their phones, making checkout as fast as buying a coffee.
-   **Smarter Email Typo Detection** — If a customer accidentally types "gmial.com" or similar at checkout, a helpful popup suggests the correction before they complete the purchase — fewer missed confirmation emails.
-   **Payment Progress Indicator** — During PayPal payments, customers now see a clear step-by-step progress bar so they're never left wondering if their purchase went through.
-   **Clearer Payment Errors** — When something goes wrong with a payment, customers see a specific, helpful message instead of a generic error — making it easier to retry or fix the issue.
-   **Optimized Payment Processing** — Purchases are now automatically routed to the best payment processor based on currency, meaning lower fees for organizers and faster processing for customers.
-   **Redesigned Quantity Selector** — The ticket quantity picker now uses clean, branded +/- buttons that are easier to tap on mobile devices.

### Tickets & Orders

-   **Text Message Order Details** — After purchasing, customers can text themselves a link to their order details — handy when they need quick access on their phone at the door.
-   **Shareable Order Link** — Every order now has its own link that customers can open without logging in, making it easy to forward order info to a friend or check details from any device.
-   **Invoice Generation** — Customers and organizers can now generate and download a proper invoice for any order — useful for expense reports, accounting, or tax purposes.
-   **Automatic Ticket Grouping** — Returning customers who buy tickets across multiple orders will see all their tickets grouped together automatically — no more hunting through separate emails.
-   **Group Tickets with Friends** — Customers can share an invite link so friends can join their ticket group, making it simple to coordinate who's sitting where at an event.
-   **Badge Printing** — Organizers running conferences or networking events can now print name badges for attendees directly from the platform.
-   **Apple Wallet Passes** — Tickets can be saved to Apple Wallet for one-tap access at the event door — no need to dig through emails.
-   **Smarter Ticket Swap Notifications** — When a ticket is swapped to a different showtime, an updated confirmation email is sent automatically so customers always have the right details.

### Events & Products

-   **Product Options & Variants** — Organizers selling merchandise, food, or other items can now offer options like size and color, each with its own price — customers see a clean picker and the price updates automatically.
-   **Digital Products** — Organizers can sell digital downloads (e.g., recordings, guides) with automatic delivery emails sent right after purchase.
-   **Related Event Suggestions** — Event pages can now highlight related shows or products, helping customers discover more of what they'd enjoy.
-   **Add-Ons Now Available to All** — Every organizer can now offer add-ons (parking, merch, VIP upgrades) alongside their tickets — previously this was limited to select accounts.
-   **Flexible Pricing Display** — Organizers can set special "override" prices that are always visible to customers, useful for early promotions or group deals.

### Passes & Subscriptions

-   **Redesigned Passes Experience** — The passes system got a major refresh with clearer management pages, making it easier for organizers to set up and for customers to understand what they're getting.
-   **Automated Monthly Payouts** — Organizers offering pass-based products now receive their revenue automatically each month — no manual payout requests needed.

### Promotions & Discounts

-   **Buy-One-Get-One Deals** — Organizers can now create BOGO promotions targeted to specific events, customer groups, or date ranges — a powerful tool for filling seats.
-   **Smart Promotion Targeting** — Promotions can be configured to appear only for the right audience based on rules like past purchases, event type, or time window.
-   **One-Click Promo Links** — Organizers can generate a URL that automatically applies a discount when customers click it — perfect for social media posts, emails, or influencer partnerships.
-   **QR Codes for Promo Codes** — Each promo code now comes with a downloadable QR code, ideal for printing on flyers, posters, or table cards at events.

### Marketing & Campaigns

-   **Email Ticket Buyers Directly** — Organizers can send a beautifully designed email to everyone who bought tickets for a specific event — great for pre-show reminders, post-show thank-yous, or upselling future events.
-   **Showtime-Specific Waitlist Alerts** — When a sold-out showtime reopens, only the people who signed up for that exact date and time get notified — no more irrelevant "tickets available!" emails.
-   **Saved Audience Filters** — Organizers can save their favorite email audience filters and reuse them for future campaigns, cutting setup time for repeat sends.
-   **Campaign Performance Tracking** — Email campaigns now show how many orders they generated, so organizers can see exactly which campaigns are driving ticket sales.
-   **Email Health Tool** — A built-in tool that finds and fixes problematic email addresses in the customer database, improving email deliverability and reducing bounces.

### Checkout & Forms

-   **Custom Checkout Questions** — Organizers can add their own questions to checkout (meal preferences, t-shirt sizes, accessibility needs) with a new section header option for organizing longer forms.
-   **Smart Fulfillment Fields** — Checkout automatically asks for the right info based on what's being purchased — shipping address for merchandise, no address needed for digital products.

### Discovery & Search Visibility

-   **Better Google Search Results** — Event pages now show up as rich results in Google with the event date, price range, and venue displayed right in the search listing — helping customers find events faster and driving more clicks.
-   **Fresher Search Listings** — Search engines now see accurate "last updated" dates for events, meaning upcoming shows get crawled and indexed more frequently.
-   **Jump Blvd Landing Page** — A dedicated landing page for Jump Blvd with a custom design and search engine optimization, giving the platform its own public-facing presence.
-   **Multi-Tenant Onboarding** — New organizations joining the platform can now set themselves up through a guided onboarding flow without needing manual help from the Jump team.

### AI & Analytics

-   **Soma AI (Rebrand)** — The built-in AI assistant was rebranded to Soma AI with a refreshed look and feel.
-   **Step-by-Step AI Guides** — Soma AI can now walk organizers through platform features with interactive, step-by-step tutorials — like having a personal onboarding coach.
-   **Historical Sales Analytics** — A new analytics view lets organizers explore their ticket sales history across events and currencies, helping them spot trends and plan future pricing.
-   **AI Conversation Monitoring** — An internal tool that helps the Jump team review how organizers interact with Soma AI, enabling continuous improvements to the AI experience.

### Other Improvements

-   **Capacity-Aware Comp Tickets** — Complimentary ticket invites now check venue capacity before being issued, so organizers never accidentally oversell a show.
-   **Accurate Refund Tracking** — Refundable amounts update in real-time as partial refunds are issued, giving organizers a clear picture of what's left to refund on any order.
-   **Refreshed Order Details Page** — The admin order details view was redesigned with a cleaner layout and quick-action dropdown, making order management faster.
-   **Updated About Page** — A refreshed company about page with improved content and design.
-   **Correct Tax on Absorbed Fees** — Fixed an issue where tax was miscalculated when organizers chose to absorb service fees, ensuring customers are charged the right amount.
-   **Multi-Currency Sales Reports** — Fixed sales reports to correctly show all currencies when an event sells in more than one currency.

* * *

## Technical & Architectural Changes

### Medusa-to-Elixir Migration

-   **Cart Operations** — Replaced Medusa HTTP-based cart operations (add/delete line items, recalculate shipping) with native Elixir modules (`CartOperations`, `CartContext`, `CheckoutService`, `VariantPriceCalculator`), eliminating cross-service HTTP overhead.
-   **Discount Application** — Moved discount/promo code application logic from Medusa to Elixir with native Ecto operations.
-   **Order Totals Calculation** — Individual order totals (tax, shipping, discounts, gift cards, service fees) are now computed entirely in Elixir, replacing the Medusa dependency.
-   **Service Fee Calculation** — Service fee is now derived from `unit_price` at calculation time rather than a stale cached value, fixing accuracy issues with PWYL and absorbed pricing.
-   **Seat Allocations Endpoint** — Migrated the seat allocations API to Elixir to resolve Node.js performance bottlenecks under load.
-   **Campaign Stats Sync** — Moved SendGrid campaign stats sync to Elixir with retry logic for transient API failures.
-   **Reserved Seating Cleanup** — Migrated the 15-minute reserved seat expiry job from Medusa to an Oban worker.
-   **Order Cache Elimination** — Replaced `metadata.cache` reads with direct Ecto column access on the orders table, removing stale-data risk.
-   **Get Order Consolidation** — Replaced `Ecommerce.Orders.get_order` HTTP calls with a direct `Context.Orders.get_order` DB query, reducing latency.
-   **Cart API Expansion** — The cart API now returns full cart and line item totals computed in Elixir, enabling the frontend to rely on Elixir-calculated values.

### PayPal Integration Overhaul

-   **Dead-View PayPal Controller** — Replaced the PayPal LiveView with a traditional Phoenix controller to avoid iframe destruction issues caused by LiveView re-renders.
-   **Authorization Status Check** — Cart completion now verifies PayPal authorization status before proceeding, preventing silent payment failures.
-   **Apple Pay / Google Pay via PayPal** — Integrated PayPal Advanced Checkout SDK with domain verification, cents-to-dollars conversion, and billing contact handling per PayPal docs.

### Fulfillment & Email System

-   **Product-Level Fulfillment Types** — Added `product.fulfillment_type_id` with a derivation hierarchy (variant > product > NULL) and a `Services.Fulfillment` module for resolution logic.
-   **Email Orchestration** — Four separate fulfillment email pipelines (add-on codes, digital downloads, admin notifications, merchandise fulfillment) with Swoosh/MJML templates.
-   **Async Email Dispatch** — Emails are now sent asynchronously to avoid blocking request processing.

### Pricing Engine

-   **Modifier Pricing** — Extended the pricing system to support combination-based pricing with early bird, group, and override types, calculated through `VariantPriceCalculator`.
-   **Dynamic Refund Computation** — `refundable_amount` is now computed at query time (`total - SUM(issued_refunds)`) rather than stored as a mutable column.

### Database & Performance

-   **Ecto Connection Pooling** — Switched to Ecto-managed connection pooling with tuned pool size for better resource utilization.
-   **Race-Safe Token Generation** — Public order tokens use a `WHERE public_token IS NULL` guard to prevent race conditions during concurrent order processing.
-   **Variant Deletion Guard** — Variant combinations referenced by existing orders are now protected from deletion, preventing data integrity issues.

### Frontend Architecture

-   **Centralized Store Layout** — Removed per-LiveView padding in favor of a single layout-level spacing system (`store2` layout).
-   **Shared UI Components** — Extracted `line_item_display`, `OrderDetailsComponents`, `ccreator_link`, and `OrderHelpers` to reduce template duplication across cart, payment, and order pages.

### Observability

-   **PostHog Event Tracking** — SMS sends from cart completion are tracked as PostHog events for funnel analysis.
-   **Email Send Logging** — All outbound emails now log delivery metadata for debugging and deliverability monitoring.
-   **LLM Chats Viewer** — Admin LiveView with paginated session list, infinite scroll via IntersectionObserver, and per-message metadata (model, latency, tokens, ratings).
