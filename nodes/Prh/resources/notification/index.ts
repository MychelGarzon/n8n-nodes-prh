import type {
	DeclarativeRestApiSettings,
	IExecutePaginationFunctions,
	INodeExecutionData,
	INodeProperties,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, sleep } from 'n8n-workflow';
import { getDescription } from './get';
import { getByRecordNumberDescription } from './getByRecordNumber';
import { searchDescription } from './search';
import { getDescriptionDescription } from './getDescription';

const showOnlyForNotification = {
	resource: ['notification'],
};

const NOTICES_BASE_URL = 'https://avoindata.prh.fi/opendata-registerednotices-api/v3';

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

export const notificationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForNotification,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get company details and public notice history',
				description: "Look up a company's registered notification history by Business ID",
				routing: {
					request: {
						method: 'GET',
						url: `=${NOTICES_BASE_URL}/{{$parameter["businessId"]}}`,
					},
				},
			},
			{
				name: 'Get By Record Number',
				value: 'getByRecordNumber',
				action: 'Get a public notice by record number',
				description: 'Look up a specific public notice by its year and record number',
				routing: {
					request: {
						method: 'GET',
						url: `=${NOTICES_BASE_URL}/publicnotices/{{$parameter["recordYear"]}}/{{$parameter["recordNumber"]}}`,
					},
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search for notifications by criteria',
				description:
					'Search registered notifications by company name, Business ID, location, or date ranges',
				routing: {
					request: {
						method: 'GET',
						url: `${NOTICES_BASE_URL}/`,
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
			{
				name: 'Get Description',
				value: 'getDescription',
				action: 'Get a code list description',
				description:
					'Look up what a set of PRH register codes mean (e.g. company form codes, entry codes)',
				routing: {
					request: {
						method: 'GET',
						url: `${NOTICES_BASE_URL}/description`,
						qs: {
							code: '={{$parameter["code"]}}',
							lang: '={{$parameter["lang"]}}',
						},
					},
				},
			},
		],
		default: 'get',
	},
	...getDescription,
	...getByRecordNumberDescription,
	...searchDescription,
	...getDescriptionDescription,
];
