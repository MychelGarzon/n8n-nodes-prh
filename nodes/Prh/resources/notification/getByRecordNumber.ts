import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGetByRecordNumber = {
	operation: ['getByRecordNumber'],
	resource: ['notification'],
};

export const getByRecordNumberDescription: INodeProperties[] = [
	{
		displayName: 'Record Year',
		name: 'recordYear',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 2026',
		displayOptions: { show: showOnlyForGetByRecordNumber },
		description: 'The year of the public notice record',
	},
	{
		displayName: 'Record Number',
		name: 'recordNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 53107T',
		displayOptions: { show: showOnlyForGetByRecordNumber },
		description: 'The record number of the public notice, as returned by the Get operation',
	},
];
