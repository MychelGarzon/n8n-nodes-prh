import type {
	DeclarativeRestApiSettings,
	IExecutePaginationFunctions,
	INodeExecutionData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, sleep } from 'n8n-workflow';

// A short delay between pages when auto-following "Return All" pagination.
// PRH's docs don't publish an explicit rate limit (unlike Fingrid, which
// documents "1 request per 2 seconds"), so this is a conservative
// precaution rather than a documented requirement.
const PAGE_DELAY_MS = 500;

/**
 * Shared pagination logic for all three PRH resources (Financial,
 * Notification, Company). Each resource's query parameters are already
 * built into requestOptions.options.qs by the time this runs (via each
 * field's own routing.send), so this just re-issues the request with an
 * incrementing `page`, stopping once a page comes back empty.
 *
 * A custom function is used instead of n8n's built-in `generic`
 * pagination type because that type did not reliably preserve query
 * parameters on continuation requests, confirmed via live testing
 * against the real PRH API.
 *
 * Errors are caught and re-thrown as NodeApiError with a clearer,
 * PRH-specific message:
 * - 429: PRH's rate limit was hit despite the delay between pages
 * - other errors: passed through with the page number that failed and
 *   how many items were already retrieved, to make debugging a partial
 *   "Return All" fetch easier
 */
export async function paginateByPage(
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
					description: `Hit the rate limit while fetching page ${page} of results. ${results.length} item(s) were successfully retrieved before this happened. Wait a moment and try again, or turn off "Return All" and fetch specific pages instead.`,
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
		await sleep(PAGE_DELAY_MS);
	}

	return results;
}
