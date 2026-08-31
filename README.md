# n8n-nodes-prh

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=MychelGarzon_n8n-nodes-prh&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=MychelGarzon_n8n-nodes-prh)

This is an n8n community node. It lets you use all three of the Finnish Patent and Registration Office (PRH) open data APIs in your n8n workflows: Digital Financial Statement (XBRL) data, Registered Notices (company registration and public notice history), and the Finnish Business Information System (company search).

All three APIs are public and require no authentication.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Data license](#data-license)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

### Financial

Access PRH's Digital Financial Statement (XBRL) data:

- **Get Financials** — list the financial periods a company has filed digital statements for, given a Finnish Business ID.
- **Search All Financials** — find all companies that filed a digital financial statement for a given period end date.
- **Search All Financial Statements** — find all companies that filed a digital financial statement within a registration date range (data available from 1 July 2023 onward).
- **Get Financial Statement** — get the full digital financial statement for a company and period, given a Business ID and the period end date. Returns the raw iXBRL XML document as a single `rawXbrl` field — pipe this into an XML or Code node if you need to extract specific values, since the underlying taxonomy uses coded element names rather than plain labels like "Revenue" or "Net Income."

### Notification

Access PRH's Registered Notices data — company details, public notice history, and reference code lists:

- **Get** — get a company's full details and public notice history by Business ID.
- **Get By Record Number** — look up a specific public notice by its year and record number.
- **Search** — search for companies by name, Business ID, location, company form, or registration/notification date ranges.
- **Get Description** — look up what a set of PRH register codes mean (currently: Company Form and Entry Code lists), in English, Finnish, or Swedish.

### Company

Access the Finnish Business Information System (BIS/YTJ):

- **Search** — search for companies by name or Business ID.

**Return All**: every list/search operation across all three resources supports a **Return All** toggle. When enabled, the node automatically pages through all results and returns them as a flat list, with a short delay between pages. When disabled, you can request a specific page number.

## Credentials

No authentication is required. All three PRH open data APIs used by this node are public and open.

## Compatibility

Tested against n8n v1.x (Node.js 24+). No known version incompatibility issues at this time.

## Usage

This node is useful for due diligence, vendor or customer credit checks, or automating financial and registration data collection for Finnish trade register entities.

Typical workflows:

- Use **Get Financials** to find which periods a company has filed for, then feed a confirmed Business ID + period end date into **Get Financial Statement** to retrieve the full filing.
- Use **Company → Search** or **Notification → Search** to find companies by name or location, then **Notification → Get** to retrieve their full public notice history.
- Use **Get Description** to decode the entry codes and company form codes that appear throughout responses.

Not every Finnish company has digital financial statements on file — smaller entities in particular may return no results from the Financial resource.

**Error handling**: all Return All-enabled operations provide clear error messages if a rate limit is hit or a page fails, including how many results were already retrieved. Single-lookup operations (Get Financial Statement, Get, Get By Record Number, Get Description) return PRH's standard error response for failures — for example, an HTTP 400 when no financial statement exists for a given Business ID and period, which is expected for companies without digital filings.

## Data license

PRH's open data is published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode) (see also the [human-readable summary](https://creativecommons.org/licenses/by/4.0/)). Attribution required when displaying or republishing the data:

    Source PRH / avoindata.prh.fi, license CC 4.0 BY

This data is provided "as-is" without warranties of any kind, per the license terms.

This node is free and open-source. If you plan to build a commercial product on top of PRH's data, review [PRH's Open Data terms](https://avoindata.prh.fi/en) directly.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [PRH Open Data — Digital Financial Statement API docs](https://avoindata.prh.fi/en/xbrl/swagger-ui)
- [PRH Open Data — Registered Notices API docs](https://avoindata.prh.fi/en/krek/swagger-ui)
- [PRH Open Data — Business Information System API docs](https://avoindata.prh.fi/en/ytj/swagger-ui)

## Version history

- **0.6.x** — Added the Company resource (Finnish Business Information System API) with Search. Refactored shared pagination logic into `shared/GenericFunctions.ts` to remove code duplication across resources.
- **0.5.x** — Added the Notification resource (PRH Registered Notices API): Get, Get By Record Number, Search (with Return All pagination and Company Form filtering), and Get Description. Added test coverage for pagination logic.
- **0.3.x** — Replaced built-in pagination with a custom, tested pagination implementation for reliability. Added clear error messages for rate limits and request failures during Return All.
- **0.2.0** — First functional release. Implements all four PRH Digital Financial Statement API operations: Get Financials, Search All Financials, Search All Financial Statements, and Get Financial Statement (raw XML).
- **0.1.x** — Initial scaffold and name reservation on npm.
