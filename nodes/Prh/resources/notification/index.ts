import type { INodeProperties } from 'n8n-workflow';
import { getDescription } from './get';
import { getByRecordNumberDescription } from './getByRecordNumber';

const showOnlyForNotification = {
	resource: ['notification'],
};

const NOTICES_BASE_URL = 'https://avoindata.prh.fi/opendata-registerednotices-api/v3';

export const notificationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForNotification,
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get company details and public notice history',
				description: "Look up a company's registered notification history by Business ID",
				routing: {
					request: {
						method: 'GET',
						url: `=${NOTICES_BASE_URL}/{{$parameter["businessId"]}}`,
					},
				},
			},
			{
				name: 'Get By Record Number',
				value: 'getByRecordNumber',
				action: 'Get a public notice by record number',
				description: 'Look up a specific public notice by its year and record number',
				routing: {
					request: {
						method: 'GET',
						url: `=${NOTICES_BASE_URL}/publicnotices/{{$parameter["recordYear"]}}/{{$parameter["recordNumber"]}}`,
					},
				},
			},
		],
		default: 'get',
	},
	...getDescription,
	...getByRecordNumberDescription,
];
