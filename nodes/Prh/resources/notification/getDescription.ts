import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGetDescription = {
	operation: ['getDescription'],
	resource: ['notification'],
};

export const getDescriptionDescription: INodeProperties[] = [
	{
		displayName: 'Code',
		name: 'code',
		type: 'options',
		required: true,
		default: 'CF',
		displayOptions: { show: showOnlyForGetDescription },
		description: 'Which code list to retrieve',
		options: [
			{
				name: 'Company Form',
				value: 'CF',
				description: 'Codes for company forms (e.g. OY, KY, AY)',
			},
			{
				name: 'Entry Code',
				value: 'EC',
				description: 'Codes for register entry types (e.g. TASE, HAL, NIMP)',
			},
		],
	},
	{
		displayName: 'Language',
		name: 'lang',
		type: 'options',
		required: true,
		default: 'EN',
		displayOptions: { show: showOnlyForGetDescription },
		description: 'Language for the code descriptions',
		options: [
			{ name: 'English', value: 'EN' },
			{ name: 'Finnish', value: 'FI' },
			{ name: 'Swedish', value: 'SV' },
		],
	},
];
