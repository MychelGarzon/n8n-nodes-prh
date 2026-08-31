import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSearch = {
	operation: ['search'],
	resource: ['company'],
};

export const searchDescription: INodeProperties[] = [
	{
		displayName: 'Company Name',
		name: 'name',
		type: 'string',
		default: '',
		placeholder: 'Nokia',
		displayOptions: { show: showOnlyForSearch },
		description: 'A company name or a prefix of it',
		routing: {
			send: {
				type: 'query',
				property: 'name',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Business ID',
		name: 'businessId',
		type: 'string',
		default: '',
		placeholder: '0100379-9',
		displayOptions: { show: showOnlyForSearch },
		description: 'A Finnish Business ID (Y-tunnus)',
		routing: {
			send: {
				type: 'query',
				property: 'businessId',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: { show: showOnlyForSearch },
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
				...showOnlyForSearch,
				returnAll: [false],
			},
		},
		description: 'Use this to request a specific page of results',
		routing: {
			send: {
				type: 'query',
				property: 'page',
			},
		},
	},
];
