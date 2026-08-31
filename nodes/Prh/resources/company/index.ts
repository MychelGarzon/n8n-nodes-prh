import type {
	IDataObject,
	IExecuteSingleFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { paginateByPage } from '../../shared/GenericFunctions';
import { searchDescription } from './search';

const showOnlyForCompany = {
	resource: ['company'],
};

const YTJ_BASE_URL = 'https://avoindata.prh.fi/opendata-ytj-api/v3';

function pickDescription(
	descriptions: IDataObject[] | undefined,
	languageCode = '3',
): string | undefined {
	if (!descriptions) return undefined;
	const match = descriptions.find((d) => d.languageCode === languageCode);
	return (match?.description as string) ?? (descriptions[0]?.description as string | undefined);
}

function simplifyCompany(company: IDataObject): IDataObject {
	const names = (company.names as IDataObject[]) ?? [];
	const currentName = names.find((n) => n.type === '1' && !n.endDate) ?? names[0];

	const companyForms = (company.companyForms as IDataObject[]) ?? [];
	const currentCompanyForm = companyForms.find((f) => !f.endDate) ?? companyForms[0];

	return {
		businessId: (company.businessId as IDataObject)?.value,
		name: currentName?.name,
		companyForm: pickDescription(currentCompanyForm?.descriptions as IDataObject[] | undefined),
		mainBusinessLine: pickDescription(
			(company.mainBusinessLine as IDataObject)?.descriptions as IDataObject[] | undefined,
		),
		status: company.status,
		tradeRegisterStatus: company.tradeRegisterStatus,
		registrationDate: company.registrationDate,
		endDate: company.endDate,
		website: (company.website as IDataObject)?.url,
	};
}

async function simplifyIfRequested(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const simplify = this.getNodeParameter('simplify', true) as boolean;
	if (!simplify) return items;

	return items.map((item) => ({
		json: simplifyCompany(item.json),
	}));
}

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
							simplifyIfRequested,
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
