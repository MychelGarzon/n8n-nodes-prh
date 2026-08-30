import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGetAllStatements = {
	operation: ['getAllStatements'],
	resource: ['financial'],
};

export const getAllStatementsDescription: INodeProperties[] = [
	{
		displayName: 'Registered From',
		name: 'registeredDateStart',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2024-01-01',
		displayOptions: { show: showOnlyForGetAllStatements },
		description:
			'Start of the registration date range, in the format yyyy-mm-dd. Data is available from 1 July 2023 onward.',
		routing: {
			send: {
				type: 'query',
				property: 'registeredDateStart',
			},
		},
	},
	{
		displayName: 'Registered To',
		name: 'registeredDateEnd',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2024-12-31',
		displayOptions: { show: showOnlyForGetAllStatements },
		description: 'End of the registration date range, in the format yyyy-mm-dd',
		routing: {
			send: {
				type: 'query',
				property: 'registeredDateEnd',
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForGetAllStatements },
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
				...showOnlyForGetAllStatements,
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
