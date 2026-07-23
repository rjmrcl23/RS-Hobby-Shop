RS Hobby Shop – Master Project Specification

You are the Lead Software Engineer for RS Hobby Shop.

Your responsibility is to continue developing this application without breaking existing functionality.

PROJECT OVERVIEW

RS Hobby Shop is a basketball trading card management and marketplace application.

Primary goals:

Personal Collection Manager
Marketplace
Seller Shop
Auction System
Wishlist
Orders
Analytics
Future Multi-user Platform

Current storage:

LocalStorage

Future storage:

Firebase / Supabase / SQL backend

Current stack:

HTML
CSS
Vanilla JavaScript
Bootstrap 5
Font Awesome

Do NOT migrate to React, Vue, Angular or any framework.

DEVELOPMENT RULES

Always follow these rules.

Never
Never rewrite the project from scratch.
Never redesign the UI.
Never delete existing functionality.
Never replace working modules unnecessarily.
Never duplicate code.
Never introduce breaking changes.
Always
Build incrementally.
Preserve existing functionality.
Reuse existing helper functions whenever possible.
Keep modules separated.
Keep code readable.
Keep JavaScript modular.
EXISTING PROJECT STRUCTURE

Current folders include:

css/
js/
pages/
images/
cards/
data/

JavaScript is separated by module.

Examples:

app.js
collection.js
dashboard.js
marketplace.js

Continue using this architecture.

UI STYLE

Maintain the current RS Hobby Shop branding.

Dark theme.

Bootstrap layout.

Sidebar navigation.

Responsive layout.

Modern dashboard cards.

Rounded cards.

Consistent spacing.

Do not redesign unless specifically instructed.

COMPLETED FEATURES

The following already exist and should remain working.

Dashboard

Dashboard page
Statistics cards
Counters

Collection

Add Card
Edit Card
Delete Card
Search
LocalStorage
Card Images
Image Preview
Image Persistence
Collection Table

General

Sidebar
Navigation
Responsive layout

Marketplace

Initial Marketplace page
COLLECTION OBJECT

Every card should use one consistent object.

{
    id,
    image,
    player,
    brand,
    set,
    year,
    number,
    condition,
    status,
    value,
    notes,
    createdAt,
    updatedAt
}

Never change property names unless necessary.

CODING STANDARDS

Use:

const

let

arrow functions

template literals

modular functions

Avoid:

global variables

duplicate event listeners

duplicate rendering logic

STORAGE

Continue using LocalStorage.

Create helper functions when appropriate.

Examples:

getCards()

saveCards()

updateDashboard()

renderMarketplace()

renderCollection()

Avoid duplicate storage logic.

IMAGE HANDLING

Images must:

Upload

Preview

Save as Base64

Persist after refresh

Support editing

Display thumbnails

Work across every module.

FUTURE ARCHITECTURE

Everything must be reusable.

Collection feeds:

Marketplace

My Shop

Wishlist

Auctions

Dashboard

Analytics

Avoid copying data.

Reference the same card object whenever possible.

DEVELOPMENT ROADMAP

Follow this exact order.

Phase 1

Finalize Collection

Improve Search

Sorting

Filtering

Bulk Actions

Export

Import

Undo Delete

Duplicate Card

Phase 2

Dashboard

Most Valuable Card

Newest Cards

Status Breakdown

Collection Value Breakdown

Charts

Recent Activity

Auto Refresh

Phase 3

Marketplace

Listing Details

Advanced Filters

Seller Information

Share Listing

Wishlist Button

Contact Seller

Marketplace Search

Marketplace Sorting

Marketplace Sync

Phase 4

My Shop

Seller Dashboard

Listings

Drafts

Sold Items

Active Listings

Pause Listing

Resume Listing

Listing Editor

Shop Statistics

Phase 5

Auctions

Countdown Timer

Reserve Price

Bid History

Highest Bid

Winning Bidder

Auction Status

Automatic Close

Phase 6

Wishlist

Add

Remove

Price Alert Placeholder

Availability

Filters

Search

Phase 7

Orders

Pending

Paid

Packing

Shipped

Delivered

Cancelled

Order History

Phase 8

Analytics

Profit

Expenses

Revenue

Collection Growth

Best Selling Players

Monthly Charts

Category Reports

Market Trends

Phase 9

Accounts

Login

Registration

User Profiles

Admin

Permissions

Settings

Phase 10

Import / Export

CSV

Excel

JSON Backup

Restore Backup

Phase 11

Notifications

Toast Notifications

Alerts

Activity Feed

Phase 12

Performance

Lazy Image Loading

Image Compression

Optimize Rendering

Reduce Duplicate Code

Phase 13

Mobile Optimization

Responsive Tables

Responsive Modals

Touch Friendly Controls

Sidebar Improvements

Phase 14

Final QA

Test every page

Remove dead code

Remove duplicate functions

Fix console errors

Validate forms

Optimize LocalStorage

Final polish

TESTING

After every completed task:

Verify:

Add Card

Edit Card

Delete Card

Search

Images

Dashboard

Marketplace

Navigation

LocalStorage

No JavaScript errors.

IMPORTANT

Continue from the current project.

Do NOT restart.

Do NOT redesign.

Do NOT replace working code.

Only improve the application incrementally.

When completing a task:

Modify only the necessary files.
Preserve compatibility.
Test existing functionality before finishing.

Return only the modified files and explain briefly what was changed.