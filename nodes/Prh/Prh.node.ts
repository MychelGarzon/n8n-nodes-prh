import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { financialDescription } from './resources/financial';
import { notificationDescription } from './resources/notification';

export class Prh implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'PRH Financial Statements',
		name: 'prh',
		icon: { light: 'file:prh.svg', dark: 'file:prh.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Get Finnish company financial statement and registration data from the PRH (Finnish Patent and Registration Office) open data APIs',
		defaults: {
			name: 'PRH Financial Statements',
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
			...financialDescription,
			...notificationDescription,
		],
	};
}
