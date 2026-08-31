import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGetFinancial = {
	operation: ['getFinancial'],
	resource: ['financial'],
};

export const getFinancialDescription: INodeProperties[] = [
	{
		displayName: 'Business ID',
		name: 'businessId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 0100379-9',
		displayOptions: { show: showOnlyForGetFinancial },
		description: 'The Finnish Business ID (Y-tunnus) to fetch the financial statement for',
		routing: {
			send: {
				type: 'query',
				property: 'businessId',
			},
		},
	},
	{
		displayName: 'Financial Period End Date',
		name: 'financialDate',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 2024-12-31',
		displayOptions: { show: showOnlyForGetFinancial },
		description:
			'End date of the financial period, in the format yyyy-mm-dd. Must match a period actually filed by this company — use the "Get Financials" operation first to find valid dates for a given Business ID.',
		routing: {
			send: {
				type: 'query',
				property: 'financialDate',
			},
		},
	},
];
