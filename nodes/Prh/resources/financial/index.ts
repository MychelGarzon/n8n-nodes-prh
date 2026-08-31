import type { INodeProperties } from 'n8n-workflow';
import { paginateByPage } from '../../shared/GenericFunctions';
import { getFinancialsDescription } from './getFinancials';
import { getAllFinancialsDescription } from './getAllFinancials';
import { getAllStatementsDescription } from './getAllStatements';
import { getFinancialDescription } from './getFinancial';

const showOnlyForFinancial = {
	resource: ['financial'],
};

const XBRL_BASE_URL = 'https://avoindata.prh.fi/opendata-xbrl-api/v3';

// Flattens each page's nested `financials` array into individual n8n
// output items, so results (across one page or all pages) come out as
// a flat list rather than one item per page wrapper.
const listOutputPostReceive = [
	{
		type: 'rootProperty' as const,
		properties: {
			property: 'financials',
		},
	},
];

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
						url: `${XBRL_BASE_URL}/financials`,
					},
					output: {
						postReceive: listOutputPostReceive,
					},
					operations: {
						pagination: paginateByPage,
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
						url: `${XBRL_BASE_URL}/all_financials`,
					},
					output: {
						postReceive: listOutputPostReceive,
					},
					operations: {
						pagination: paginateByPage,
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
						url: `${XBRL_BASE_URL}/all_financial_statements`,
					},
					output: {
						postReceive: listOutputPostReceive,
					},
					operations: {
						pagination: paginateByPage,
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
						url: `${XBRL_BASE_URL}/financial`,
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
