import type {
	IDataObject,
	IExecuteSingleFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { paginateByPage } from '../../shared/GenericFunctions';
import { getDescription } from './get';
import { getByRecordNumberDescription } from './getByRecordNumber';
import { searchDescription } from './search';
import { getDescriptionDescription } from './getDescription';

const showOnlyForNotification = {
	resource: ['notification'],
};

const NOTICES_BASE_URL = 'https://avoindata.prh.fi/opendata-registerednotices-api/v3';

function pickDescription(
	descriptions: IDataObject[] | undefined,
	languageCode = '3',
): string | undefined {
	if (!descriptions) return undefined;
	const match = descriptions.find((d) => d.languageCode === languageCode);
	return (match?.description as string) ?? (descriptions[0]?.description as string | undefined);
}

function simplifyNotificationCompany(company: IDataObject): IDataObject {
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
		lastModified: company.lastModified,
		publicNotices: company.publicNotices,
	};
}

async function simplifyGetIfRequested(
	this: IExecuteSingleFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const simplify = this.getNodeParameter('simplify', true) as boolean;
	if (!simplify) return items;

	return items.map((item) => ({
		json: simplifyNotificationCompany(item.json),
	}));
}

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
					output: {
						postReceive: [simplifyGetIfRequested],
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
			{
				name: 'Search',
				value: 'search',
				action: 'Search for notifications by criteria',
				description:
					'Search registered notifications by company name, Business ID, location, or date ranges',
				routing: {
					request: {
						method: 'GET',
						url: `${NOTICES_BASE_URL}/`,
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty' as const,
								properties: {
									property: 'companies',
								},
							},
							simplifyGetIfRequested,
						],
					},
					operations: {
						pagination: paginateByPage,
					},
				},
			},
			{
				name: 'Get Description',
				value: 'getDescription',
				action: 'Get a code list description',
				description:
					'Look up what a set of PRH register codes mean (e.g. company form codes, entry codes)',
				routing: {
					request: {
						method: 'GET',
						url: `${NOTICES_BASE_URL}/description`,
						qs: {
							code: '={{$parameter["code"]}}',
							lang: '={{$parameter["lang"]}}',
						},
					},
				},
			},
		],
		default: 'get',
	},
	...getDescription,
	...getByRecordNumberDescription,
	...searchDescription,
	...getDescriptionDescription,
];
