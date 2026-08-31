import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGetAllFinancials = {
	operation: ['getAllFinancials'],
	resource: ['financial'],
};

export const getAllFinancialsDescription: INodeProperties[] = [
	{
		displayName: 'Financial Period End Date',
		name: 'financialDate',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 2024-12-31',
		displayOptions: { show: showOnlyForGetAllFinancials },
		description:
			'End date of the financial period to search for, in the format yyyy-mm-dd. Returns all companies that filed a digital financial statement for this period end date.',
		routing: {
			send: {
				type: 'query',
				property: 'financialDate',
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForGetAllFinancials },
		description: 'Whether to return all results or only up to a given limit',
		routing: {
			send: {
				paginate: '={{ $value }}',
			},
		},
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: {
			show: {
				...showOnlyForGetAllFinancials,
				returnAll: [false],
			},
		},
		description: 'Results are returned 100 per page. Use this to request a specific page.',
		routing: {
			send: {
				type: 'query',
				property: 'page',
			},
		},
	},
];
