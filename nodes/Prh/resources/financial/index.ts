import type { INodeProperties } from 'n8n-workflow';
import { getFinancialsDescription } from './getFinancials';
import { getAllFinancialsDescription } from './getAllFinancials';
import { getAllStatementsDescription } from './getAllStatements';
import { getFinancialDescription } from './getFinancial';

const showOnlyForFinancial = {
	resource: ['financial'],
};

export const financialDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForFinancial,
		},
		options: [
			{
				name: 'Get Financials',
				value: 'getFinancials',
				action: 'List filed financial periods for a company',
				description:
					'Use a Business ID to list the financial periods a company has filed digital statements for',
				routing: {
					request: {
						method: 'GET',
						url: '/financials',
					},
				},
			},
			{
				name: 'Search All Financials',
				value: 'getAllFinancials',
				action: 'Search companies by financial period end date',
				description:
					'Find all companies that filed a digital financial statement for a given period end date',
				routing: {
					request: {
						method: 'GET',
						url: '/all_financials',
					},
				},
			},
			{
				name: 'Search All Financial Statements',
				value: 'getAllStatements',
				action: 'Search companies by registration date range',
				description:
					'Find all companies that filed a digital financial statement within a registration date range',
				routing: {
					request: {
						method: 'GET',
						url: '/all_financial_statements',
					},
				},
			},
			{
				name: 'Get Financial Statement',
				value: 'getFinancial',
				action: 'Get a single financial statement',
				description:
					'Get the raw digital financial statement (iXBRL) for a company and period. Returns raw XML — use a downstream XML or Code node to extract specific values.',
				routing: {
					request: {
						method: 'GET',
						url: '/financial',
						headers: {
							Accept: 'text/xml',
						},
					},
					output: {
						postReceive: [
							{
								type: 'set',
								properties: {
									value: '={{ { "rawXbrl": $response.body } }}',
								},
							},
						],
					},
				},
			},
		],
		default: 'getFinancials',
	},
	...getFinancialsDescription,
	...getAllFinancialsDescription,
	...getAllStatementsDescription,
	...getFinancialDescription,
];
