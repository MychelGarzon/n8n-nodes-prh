import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGet = {
	operation: ['get'],
	resource: ['notification'],
};

export const getDescription: INodeProperties[] = [
	{
		displayName: 'Business ID',
		name: 'businessId',
		type: 'string',
		required: true,
		default: '',
		placeholder: '0100379-9',
		displayOptions: { show: showOnlyForGet },
		description:
			'The Finnish Business ID (Y-tunnus) to look up company details and public notice history for',
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		displayOptions: { show: showOnlyForGet },
		description: 'Whether to return a simplified version of the response instead of the raw data',
	},
];
