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
	resource: ['company'],
};

export const searchDescription: INodeProperties[] = [
	createQueryProperty(
		'Company Name',
		'name',
		'Nokia',
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
