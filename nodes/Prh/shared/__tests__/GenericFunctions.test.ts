import type {
	DeclarativeRestApiSettings,
	IDataObject,
	IExecutePaginationFunctions,
	INodeExecutionData,
} from 'n8n-workflow';
import { paginateByPage } from '../GenericFunctions';

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

function baseRequestOptions(
	qs: IDataObject,
	url = 'https://avoindata.prh.fi/opendata-xbrl-api/v3',
): DeclarativeRestApiSettings.ResultOptions {
	return {
		options: { url, qs },
	} as unknown as DeclarativeRestApiSettings.ResultOptions;
}

describe('paginateByPage (shared across financial, notification, company resources)', () => {
	it('preserves pre-built query parameters (e.g. businessId) while incrementing the page number', async () => {
		const makeRoutingRequest = jest
			.fn()
			.mockResolvedValueOnce([makeItem({ businessId: { value: 'e.g. 0100379-9' } })])
			.mockResolvedValueOnce([]);

		const context = createMockContext(makeRoutingRequest);
		await paginateByPage.call(context, baseRequestOptions({ businessId: 'e.g. 0100379-9' }));

		const firstCallOptions = makeRoutingRequest.mock.calls[0][0];
		const secondCallOptions = makeRoutingRequest.mock.calls[1][0];

		expect(firstCallOptions.options.qs).toEqual({ businessId: 'e.g. 0100379-9', page: 1 });
		expect(secondCallOptions.options.qs).toEqual({ businessId: 'e.g. 0100379-9', page: 2 });
	});

	it('preserves a name search parameter across pages', async () => {
		const makeRoutingRequest = jest
			.fn()
			.mockResolvedValueOnce([makeItem({ businessId: { value: '2521859-1' } })])
			.mockResolvedValueOnce([]);

		const context = createMockContext(makeRoutingRequest);
		await paginateByPage.call(
			context,
			baseRequestOptions(
				{ name: 'KW Catering' },
				'https://avoindata.prh.fi/opendata-registerednotices-api/v3/',
			),
		);

		const firstCallOptions = makeRoutingRequest.mock.calls[0][0];
		expect(firstCallOptions.options.qs).toEqual({ name: 'KW Catering', page: 1 });
	});

	it('stops and aggregates results once a page returns no items', async () => {
		const makeRoutingRequest = jest
			.fn()
			.mockResolvedValueOnce([makeItem({ businessId: { value: 'e.g. 0100379-9' } })])
			.mockResolvedValueOnce([]);

		const context = createMockContext(makeRoutingRequest);
		const result = await paginateByPage.call(
			context,
			baseRequestOptions({ businessId: 'e.g. 0100379-9' }),
		);

		expect(result).toHaveLength(1);
		expect(makeRoutingRequest).toHaveBeenCalledTimes(2);
	});

	it('returns an empty array immediately when the first page is empty', async () => {
		const makeRoutingRequest = jest.fn().mockResolvedValueOnce([]);
		const context = createMockContext(makeRoutingRequest);

		const result = await paginateByPage.call(
			context,
			baseRequestOptions({ name: 'NoSuchCompanyXYZ' }),
		);

		expect(result).toEqual([]);
		expect(makeRoutingRequest).toHaveBeenCalledTimes(1);
	});

	it('accumulates across variable page sizes (e.g. Company resource)', async () => {
		const makeRoutingRequest = jest
			.fn()
			.mockResolvedValueOnce(Array.from({ length: 63 }, (_, i) => makeItem({ id: i })))
			.mockResolvedValueOnce(Array.from({ length: 74 }, (_, i) => makeItem({ id: i + 63 })))
			.mockResolvedValueOnce([]);

		const context = createMockContext(makeRoutingRequest);
		const result = await paginateByPage.call(
			context,
			baseRequestOptions(
				{ name: 'Nokia' },
				'https://avoindata.prh.fi/opendata-ytj-api/v3/companies',
			),
		);

		expect(result).toHaveLength(137);
		expect(makeRoutingRequest).toHaveBeenCalledTimes(3);
	});

	it('throws a clear rate-limit message on a 429, including items already retrieved', async () => {
		const makeRoutingRequest = jest
			.fn()
			.mockResolvedValueOnce([makeItem({ businessId: { value: 'e.g. 0100379-9' } })])
			.mockRejectedValueOnce({ statusCode: 429 });

		const context = createMockContext(makeRoutingRequest);

		await expect(
			paginateByPage.call(context, baseRequestOptions({ location: 'Helsinki' })),
		).rejects.toThrow(/rate limit/i);
	});

	it('throws a clear message naming the failed page on other errors', async () => {
		const makeRoutingRequest = jest.fn().mockRejectedValueOnce(new Error('network error'));
		const context = createMockContext(makeRoutingRequest);

		await expect(
			paginateByPage.call(context, baseRequestOptions({ businessId: 'e.g. 0100379-9' })),
		).rejects.toThrow(/page 1/i);
	});
});
