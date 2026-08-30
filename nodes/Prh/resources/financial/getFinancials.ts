import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGetFinancials = {
	operation: ['getFinancials'],
	resource: ['financial'],
};

export const getFinancialsDescription: INodeProperties[] = [
	{
		displayName: 'Business ID',
		name: 'businessId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2521859-1',
		displayOptions: { show: showOnlyForGetFinancials },
		description: 'The Finnish Business ID (Y-tunnus) to search filed financial periods for',
		routing: {
			send: {
				type: 'query',
				property: 'businessId',
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForGetFinancials },
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
				...showOnlyForGetFinancials,
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
