import type { INodeProperties, IDisplayOptions } from 'n8n-workflow';

function createQueryProperty(
	displayName: string,
	name: string,
	placeholder: string,
	description: string,
	showOptions: IDisplayOptions['show'],
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		placeholder,
		displayOptions: { show: showOptions },
		description,
		routing: {
			send: {
				type: 'query',
				property: name,
				value: '={{ $value || undefined }}',
			},
		},
	};
}

const showOnlyForSearch = {
	operation: ['search'],
	resource: ['notification'],
};

export const searchDescription: INodeProperties[] = [
	createQueryProperty(
		'Company Name',
		'name',
		'Asuntotekniikka',
		'A company name or a prefix of it',
		showOnlyForSearch,
	),
	createQueryProperty(
		'Business ID',
		'businessId',
		'0100379-9',
		'A Finnish Business ID (Y-tunnus)',
		showOnlyForSearch,
	),
	createQueryProperty(
		'Location',
		'location',
		'Helsinki',
		'Town or city where the company is registered',
		showOnlyForSearch,
	),
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
	createQueryProperty(
		'Registered From',
		'registrationDateStart',
		'2020-01-01',
		'Start of the company registration date range, in the format yyyy-mm-dd',
		showOnlyForSearch,
	),
	createQueryProperty(
		'Registered To',
		'registrationDateEnd',
		'2024-12-31',
		'End of the company registration date range, in the format yyyy-mm-dd',
		showOnlyForSearch,
	),
	createQueryProperty(
		'Notice Registered From',
		'noticeRegistrationDateStart',
		'2024-01-01',
		'Start of the notification registration date range, in the format yyyy-mm-dd',
		showOnlyForSearch,
	),
	createQueryProperty(
		'Notice Registered To',
		'noticeRegistrationDateEnd',
		'2024-12-31',
		'End of the notification registration date range, in the format yyyy-mm-dd',
		showOnlyForSearch,
	),
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
		typeOptions: { minValue: 1 },
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
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		displayOptions: { show: showOnlyForSearch },
		description: 'Whether to return a simplified version of the response instead of the raw data',
	},
];
