import type { INodeProperties } from 'n8n-workflow';
import { paginateByPage } from '../../shared/GenericFunctions';
import { searchDescription } from './search';

const showOnlyForCompany = {
	resource: ['company'],
};

const YTJ_BASE_URL = 'https://avoindata.prh.fi/opendata-ytj-api/v3';

export const companyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCompany,
		},
		options: [
			{
				name: 'Search',
				value: 'search',
				action: 'Search for companies by name or business ID',
				description:
					'Search the Finnish Business Information System by company name or Business ID',
				routing: {
					request: {
						method: 'GET',
						url: `${YTJ_BASE_URL}/companies`,
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty' as const,
								properties: {
									property: 'companies',
								},
							},
						],
					},
					operations: {
						pagination: paginateByPage,
					},
				},
			},
		],
		default: 'search',
	},
	...searchDescription,
];
