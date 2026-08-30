import type {
	DeclarativeRestApiSettings,
	IExecutePaginationFunctions,
	INodeExecutionData,
	INodeProperties,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, sleep } from 'n8n-workflow';
import { searchDescription } from './search';

const showOnlyForCompany = {
	resource: ['company'],
};

const YTJ_BASE_URL = 'https://avoindata.prh.fi/opendata-ytj-api/v3';

/**
 * Custom pagination for Search (company search). Confirmed via live
 * testing: page size varies (63/74 results seen on different pages,
 * not a fixed number), so this follows the same "stop on empty page"
 * pattern used by the Financial and Notification resources rather
 * than assuming a fixed size.
 *
 * A custom function is used instead of n8n's built-in `generic`
 * pagination type for the same reason as the other resources: that
 * type did not reliably preserve query parameters on continuation
 * requests, confirmed via live testing against the real PRH API.
 */
async function searchPagination(
	this: IExecutePaginationFunctions,
	requestOptions: DeclarativeRestApiSettings.ResultOptions,
): Promise<INodeExecutionData[]> {
	const itemIndex = this.getItemIndex();
	const results: INodeExecutionData[] = [];
	let page = 1;

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
					description: `Hit the rate limit while fetching page ${page} of search results. ${results.length} item(s) were successfully retrieved before this happened. Wait a moment and try again, or turn off "Return All" and fetch specific pages instead.`,
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

export const companyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCompany,
		},
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search for companies by name or business ID',
				description:
					'Search the Finnish Business Information System by company name or Business ID',
				routing: {
					request: {
						method: 'GET',
						url: `${YTJ_BASE_URL}/companies`,
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty' as const,
								properties: {
									property: 'companies',
								},
							},
						],
					},
					operations: {
						pagination: searchPagination,
					},
				},
			},
		],
		default: 'search',
	},
	...searchDescription,
];
