import type {
	DeclarativeRestApiSettings,
	IExecutePaginationFunctions,
	INodeExecutionData,
	INodeProperties,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, sleep } from 'n8n-workflow';
import { getFinancialsDescription } from './getFinancials';
import { getAllFinancialsDescription } from './getAllFinancials';
import { getAllStatementsDescription } from './getAllStatements';
import { getFinancialDescription } from './getFinancial';

const showOnlyForFinancial = {
	resource: ['financial'],
};

// Flattens each page's nested `financials` array into individual n8n
// output items, so results (across one page or all pages) come out as
// a flat list rather than one item per page wrapper.
const listOutputPostReceive = [
	{
		type: 'rootProperty' as const,
		properties: {
			property: 'financials',
		},
	},
];

/**
 * Custom pagination for the three list/search operations. Only invoked
 * when "Return All" is on (via send.paginate). Builds each page's
 * request from the original (correctly built) options, just overriding
 * `page`, and stops once a page comes back empty.
 *
 * A custom function is used instead of n8n's built-in `generic`
 * pagination type because that type did not reliably preserve the
 * original request's other query parameters on continuation requests,
 * confirmed via live testing against the real PRH API.
 *
 * Errors are caught and re-thrown as NodeApiError with a clearer,
 * PRH-specific message:
 * - 429: PRH's rate limit was hit despite the delay between pages
 * - other errors: passed through with the page number that failed and
 *   how many items were already retrieved, to make debugging a partial
 *   "Return All" fetch easier
 *
 * Note: n8n's RoutingNode only calls operations.pagination (built-in or
 * custom) when a parameter's routing.send.paginate is active. There is
 * no equivalent extension point for a single, non-paginated request —
 * confirmed via live testing — so this pattern only applies to
 * operations that genuinely have a "Return All" toggle.
 */
async function paginateAllPages(
	this: IExecutePaginationFunctions,
	requestOptions: DeclarativeRestApiSettings.ResultOptions,
): Promise<INodeExecutionData[]> {
	const results: INodeExecutionData[] = [];
	let page = 1;
	const itemIndex = this.getItemIndex();

	while (true) {
		const pageOptions: DeclarativeRestApiSettings.ResultOptions = {
			...requestOptions,
			options: {
				...requestOptions.options,
				qs: {
					...requestOptions.options.qs,
					page,
				},
			},
		};

		let pageItems: INodeExecutionData[];
		try {
			pageItems = await this.makeRoutingRequest(pageOptions);
		} catch (error) {
			const statusCode =
				(error as { statusCode?: number; response?: { statusCode?: number } }).statusCode ??
				(error as { response?: { statusCode?: number } }).response?.statusCode;

			if (statusCode === 429) {
				throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
					message: 'PRH API rate limit exceeded',
					description: `Hit the rate limit while fetching page ${page} of "Return All" results. ${results.length} item(s) were successfully retrieved before this happened. Wait a moment and try again, or turn off "Return All" and fetch specific pages instead.`,
					itemIndex,
				});
			}

			throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
				message: `PRH API request failed on page ${page}`,
				description: `${results.length} item(s) were successfully retrieved from earlier pages before this error occurred.`,
				itemIndex,
			});
		}

		results.push(...pageItems);

		if (pageItems.length === 0) {
			break;
		}

		page += 1;
		await sleep(500);
	}

	return results;
}

export const financialDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForFinancial,
		},
		options: [
			{
				name: 'Get Financials',
				value: 'getFinancials',
				action: 'List filed financial periods for a company',
				description:
					'Use a Business ID to list the financial periods a company has filed digital statements for',
				routing: {
					request: {
						method: 'GET',
						url: '/financials',
					},
					output: {
						postReceive: listOutputPostReceive,
					},
					operations: {
						pagination: paginateAllPages,
					},
				},
			},
			{
				name: 'Search All Financials',
				value: 'getAllFinancials',
				action: 'Search companies by financial period end date',
				description:
					'Find all companies that filed a digital financial statement for a given period end date',
				routing: {
					request: {
						method: 'GET',
						url: '/all_financials',
					},
					output: {
						postReceive: listOutputPostReceive,
					},
					operations: {
						pagination: paginateAllPages,
					},
				},
			},
			{
				name: 'Search All Financial Statements',
				value: 'getAllStatements',
				action: 'Search companies by registration date range',
				description:
					'Find all companies that filed a digital financial statement within a registration date range',
				routing: {
					request: {
						method: 'GET',
						url: '/all_financial_statements',
					},
					output: {
						postReceive: listOutputPostReceive,
					},
					operations: {
						pagination: paginateAllPages,
					},
				},
			},
			{
				name: 'Get Financial Statement',
				value: 'getFinancial',
				action: 'Get a single financial statement',
				description:
					'Get the raw digital financial statement (iXBRL) for a company and period. Returns raw XML — use a downstream XML or Code node to extract specific values.',
				routing: {
					request: {
						method: 'GET',
						url: '/financial',
						headers: {
							Accept: 'text/xml',
						},
					},
					output: {
						postReceive: [
							{
								type: 'set',
								properties: {
									value: '={{ { "rawXbrl": $response.body } }}',
								},
							},
						],
					},
				},
			},
		],
		default: 'getFinancials',
	},
	...getFinancialsDescription,
	...getAllFinancialsDescription,
	...getAllStatementsDescription,
	...getFinancialDescription,
];
