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
		displayName: 'Company Form',
		name: 'companyForm',
		type: 'options',
		default: '',
		displayOptions: { show: showOnlyForSearch },
		description: 'Filter by legal company form',
		options: [
			{ name: 'Any', value: '' },
			{ name: 'Association for Carrying on Economic Activity', value: 'TYH' },
			{ name: 'Branch of a Foreign Trader', value: 'SL' },
			{ name: 'Co-Operative', value: 'OK' },
			{ name: 'Co-Operative Bank', value: 'OP' },
			{ name: 'European Co-Operative Bank', value: 'SCP' },
			{ name: 'European Co-Operative Society', value: 'SCE' },
			{ name: 'European Company', value: 'SE' },
			{ name: 'European Economic Interest Grouping', value: 'ETY' },
			{ name: 'Finnish Branch of a European Economic Interest Grouping', value: 'ETS' },
			{ name: 'Foundation', value: 'SÄÄ' },
			{ name: 'Housing Company', value: 'AOY' },
			{ name: 'Insurance Association', value: 'VY' },
			{ name: 'Limited Company', value: 'OY' },
			{ name: 'Limited Insurance Company', value: 'VOY' },
			{ name: 'Limited Liability Joint-Stock Property Company', value: 'KOY' },
			{ name: 'Limited Partnership', value: 'KY' },
			{ name: 'Mortgage Society', value: 'HY' },
			{ name: 'Mutual Insurance Company', value: 'KVY' },
			{ name: 'Non-Profit Association', value: 'AYH' },
			{ name: 'Partnership', value: 'AY' },
			{ name: 'Public Limited Company', value: 'OYJ' },
			{ name: 'Public Limited Insurance Company', value: 'VOJ' },
			{ name: 'Public Mutual Insurance Company', value: 'KVJ' },
			{ name: 'Resident-Administered Area', value: 'ASH' },
			{ name: 'Right-Of-Occupancy Association', value: 'ASY' },
			{ name: 'Savings Bank', value: 'SP' },
			{ name: 'State-Owned Company', value: 'VALTLL' },
		],
		routing: {
			send: {
				type: 'query',
				property: 'companyForm',
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
