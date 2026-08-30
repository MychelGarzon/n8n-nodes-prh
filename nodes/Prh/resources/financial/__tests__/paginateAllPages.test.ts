import type {
	DeclarativeRestApiSettings,
	IDataObject,
	IExecutePaginationFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { paginateAllPages } from '../index';

jest.mock('n8n-workflow', () => {
	const actual = jest.requireActual('n8n-workflow');
	return {
		...actual,
		sleep: jest.fn().mockResolvedValue(undefined),
	};
});

function makeItem(json: IDataObject): INodeExecutionData {
	return { json };
}

function createMockContext(makeRoutingRequest: jest.Mock) {
	return {
		getItemIndex: () => 0,
		getNode: () => ({ name: 'PRH Financial Statements' }),
		makeRoutingRequest,
	} as unknown as IExecutePaginationFunctions;
}

function baseRequestOptions(qs: IDataObject): DeclarativeRestApiSettings.ResultOptions {
	return {
		options: { url: '/financials', qs },
	} as unknown as DeclarativeRestApiSettings.ResultOptions;
}

describe('paginateAllPages', () => {
	it('stops and aggregates results once a page returns no items', async () => {
		const makeRoutingRequest = jest
			.fn()
			.mockResolvedValueOnce([
				makeItem({ financialDate: '2020-12-31' }),
				makeItem({ financialDate: '2021-12-31' }),
			])
			.mockResolvedValueOnce([]);

		const context = createMockContext(makeRoutingRequest);
		const result = await paginateAllPages.call(
			context,
			baseRequestOptions({ businessId: '0100379-9' }),
		);

		expect(result).toHaveLength(2);
		expect(makeRoutingRequest).toHaveBeenCalledTimes(2);
	});

	it('returns an empty array immediately when the first page is empty', async () => {
		const makeRoutingRequest = jest.fn().mockResolvedValueOnce([]);
		const context = createMockContext(makeRoutingRequest);

		const result = await paginateAllPages.call(
			context,
			baseRequestOptions({ businessId: '2521859-1' }),
		);

		expect(result).toEqual([]);
		expect(makeRoutingRequest).toHaveBeenCalledTimes(1);
	});

	it('preserves original query parameters while incrementing the page number', async () => {
		const makeRoutingRequest = jest
			.fn()
			.mockResolvedValueOnce([makeItem({ financialDate: '2024-12-31' })])
			.mockResolvedValueOnce([]);

		const context = createMockContext(makeRoutingRequest);
		await paginateAllPages.call(context, baseRequestOptions({ businessId: '0100379-9' }));

		const firstCallOptions = makeRoutingRequest.mock.calls[0][0];
		const secondCallOptions = makeRoutingRequest.mock.calls[1][0];

		expect(firstCallOptions.options.qs).toEqual({ businessId: '0100379-9', page: 1 });
		expect(secondCallOptions.options.qs).toEqual({ businessId: '0100379-9', page: 2 });
	});

	it('throws a clear rate-limit message on a 429, including items already retrieved', async () => {
		const makeRoutingRequest = jest
			.fn()
			.mockResolvedValueOnce([makeItem({ financialDate: '2024-12-31' })])
			.mockRejectedValueOnce({ statusCode: 429 });

		const context = createMockContext(makeRoutingRequest);

		await expect(
			paginateAllPages.call(context, baseRequestOptions({ financialDate: '2024-12-31' })),
		).rejects.toThrow(/rate limit/i);
	});

	it('throws a clear message naming the failed page on other errors', async () => {
		const makeRoutingRequest = jest.fn().mockRejectedValueOnce(new Error('network error'));
		const context = createMockContext(makeRoutingRequest);

		await expect(
			paginateAllPages.call(context, baseRequestOptions({ businessId: '0100379-9' })),
		).rejects.toThrow(/page 1/i);
	});
});
