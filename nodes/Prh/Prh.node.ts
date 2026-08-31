import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { financialDescription } from './resources/financial';
import { notificationDescription } from './resources/notification';
import { companyDescription } from './resources/company';

export class Prh implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PRH Open Data',
		name: 'prh',
		icon: { light: 'file:prh.svg', dark: 'file:prh.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Get Finnish company financial, registration, and public notice data from the PRH (Finnish Patent and Registration Office) open data APIs',
		defaults: {
			name: 'PRH Open Data',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [],
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Company',
						value: 'company',
					},
					{
						name: 'Financial',
						value: 'financial',
					},
					{
						name: 'Notification',
						value: 'notification',
					},
				],
				default: 'financial',
			},
			...companyDescription,
			...financialDescription,
			...notificationDescription,
		],
	};
}
