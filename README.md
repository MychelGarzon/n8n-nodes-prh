# n8n-nodes-prh

This is an n8n community node. It lets you use the Finnish Patent and Registration Office (PRH) Digital Financial Statement (XBRL) open data API in your n8n workflows.

PRH's open data service provides structured profit & loss and balance sheet data for Finnish companies that have filed digital financial statements using the iXBRL reporting language. The API is public and requires no authentication.

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

- **Get Financial Statement** — retrieve a single company's financial statement (profit & loss, balance sheet) for a given period, using a Finnish Business ID and the period end date.
- **Get Financials** — list the financial periods a company has filed digital statements for, using a Finnish Business ID.
- **Search All Financials** — search for companies that filed statements for a given financial period end date.
- **Search All Financial Statements** — search for companies that filed statements within a registration date range.

## Credentials

No authentication is required. PRH's Digital Financial Statement API is public and open.

## Compatibility

Tested against n8n v1.x. No known version incompatibility issues at this time.

## Usage

This node returns structured financial data (not PDFs) for Finnish companies, based on their public iXBRL filings. Useful for due diligence, vendor/customer credit checks, or automating financial data collection for Finnish trade register entities.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [PRH Open Data — Digital Financial Statement API docs](https://avoindata.prh.fi/en/xbrl/swagger-ui)

## Version history

- **0.1.0** — Initial scaffold.
