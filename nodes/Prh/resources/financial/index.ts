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

const XBRL_BASE_URL = 'https://avoindata.prh.fi/opendata-xbrl-api/v3';

const listOutputPostReceive = [
	{
		type: 'rootProperty' as const,
		properties: {
			property: 'financials',
		},
	},
];

export async function paginateAllPages(
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
						url: `${XBRL_BASE_URL}/financials`,
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
						url: `${XBRL_BASE_URL}/all_financials`,
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
						url: `${XBRL_BASE_URL}/all_financial_statements`,
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
						url: `${XBRL_BASE_URL}/financial`,
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
