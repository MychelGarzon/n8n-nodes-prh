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
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		typeOptions: {
			minValue: 1,
		},
		displayOptions: { show: showOnlyForGetFinancials },
		description:
			'If the search returns more than 100 results, they are split across pages. Use this to request a specific page.',
		routing: {
			send: {
				type: 'query',
				property: 'page',
			},
		},
	},
];
