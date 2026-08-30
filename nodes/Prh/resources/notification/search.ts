import type { INodeProperties } from 'n8n-workflow';

const showOnlyForSearch = {
	operation: ['search'],
	resource: ['notification'],
};

export const searchDescription: INodeProperties[] = [
	{
		displayName: 'Company Name',
		name: 'name',
		type: 'string',
		default: '',
		placeholder: 'Asuntotekniikka',
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
		displayName: 'Location',
		name: 'location',
		type: 'string',
		default: '',
		placeholder: 'Helsinki',
		displayOptions: { show: showOnlyForSearch },
		description: 'Town or city where the company is registered',
		routing: {
			send: {
				type: 'query',
				property: 'location',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Registered From',
		name: 'registrationDateStart',
		type: 'string',
		default: '',
		placeholder: '2020-01-01',
		displayOptions: { show: showOnlyForSearch },
		description: 'Start of the company registration date range, in the format yyyy-mm-dd',
		routing: {
			send: {
				type: 'query',
				property: 'registrationDateStart',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Registered To',
		name: 'registrationDateEnd',
		type: 'string',
		default: '',
		placeholder: '2024-12-31',
		displayOptions: { show: showOnlyForSearch },
		description: 'End of the company registration date range, in the format yyyy-mm-dd',
		routing: {
			send: {
				type: 'query',
				property: 'registrationDateEnd',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Notice Registered From',
		name: 'noticeRegistrationDateStart',
		type: 'string',
		default: '',
		placeholder: '2024-01-01',
		displayOptions: { show: showOnlyForSearch },
		description: 'Start of the notification registration date range, in the format yyyy-mm-dd',
		routing: {
			send: {
				type: 'query',
				property: 'noticeRegistrationDateStart',
				value: '={{ $value || undefined }}',
			},
		},
	},
	{
		displayName: 'Notice Registered To',
		name: 'noticeRegistrationDateEnd',
		type: 'string',
		default: '',
		placeholder: '2024-12-31',
		displayOptions: { show: showOnlyForSearch },
		description: 'End of the notification registration date range, in the format yyyy-mm-dd',
		routing: {
			send: {
				type: 'query',
				property: 'noticeRegistrationDateEnd',
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
		description: 'Results are returned 50 per page. Use this to request a specific page.',
		routing: {
			send: {
				type: 'query',
				property: 'page',
			},
		},
	},
];
