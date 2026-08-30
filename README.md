# n8n-nodes-prh

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MychelGarzon_n8n-nodes-prh&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=MychelGarzon_n8n-nodes-prh)

This is an n8n community node. It lets you use the Finnish Patent and Registration Office (PRH) Digital Financial Statement (XBRL) open data API in your n8n workflows.

PRH's open data service provides financial statement data — filed periods, company search by period or registration date, and full digital financial statements — for Finnish companies that have filed using the iXBRL reporting language. The API is public and requires no authentication.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The **Financial** resource supports these operations:

- **Get Financials** — list the financial periods a company has filed digital statements for, given a Finnish Business ID.
- **Search All Financials** — find all companies that filed a digital financial statement for a given period end date.
- **Search All Financial Statements** — find all companies that filed a digital financial statement within a registration date range (data available from 1 July 2023 onward).
- **Get Financial Statement** — get the full digital financial statement for a company and period, given a Business ID and the period end date. Returns the raw iXBRL XML document as a single `rawXbrl` field — pipe this into an XML or Code node if you need to extract specific values, since the underlying taxonomy uses coded element names rather than plain labels like "Revenue" or "Net Income."

**Return All**: Get Financials, Search All Financials, and Search All Financial Statements each support a **Return All** toggle. When enabled, the node automatically pages through all results (100 per page, with a short delay between pages) and returns them as a flat list. When disabled, you can request a specific page number.

## Credentials

No authentication is required. PRH's Digital Financial Statement API is public and open.

## Compatibility

Tested against n8n v1.x (Node.js 24+). No known version incompatibility issues at this time.

## Usage

This node is useful for due diligence, vendor or customer credit checks, or automating financial data collection for Finnish trade register entities.

A typical workflow: use **Get Financials** to find which periods a company has filed for, then feed a confirmed Business ID + period end date into **Get Financial Statement** to retrieve the full filing. Not every Finnish company has digital financial statements on file — smaller entities in particular may return no results.

**Error handling**: Get Financials, Search All Financials, and Search All Financial Statements provide clear error messages if a rate limit is hit or a page fails while using Return All, including how many results were already retrieved. Get Financial Statement returns PRH's standard error response (e.g. HTTP 400) when no statement exists for the given Business ID and period — this is expected for companies without digital filings, or when the period end date doesn't match a real filed period exactly.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [PRH Open Data — Digital Financial Statement API docs](https://avoindata.prh.fi/en/xbrl/swagger-ui)

## Version history

- **0.3.x** — Replaced built-in pagination with a custom, tested pagination implementation for reliability. Added clear error messages for rate limits and request failures during Return All. Added unit tests.
- **0.2.x** — Added Return All pagination support to list/search operations.
- **0.2.0** — First functional release. Implements all four PRH Digital Financial Statement API operations: Get Financials, Search All Financials, Search All Financial Statements, and Get Financial Statement (raw XML).
- **0.1.x** — Initial scaffold and name reservation on npm.
