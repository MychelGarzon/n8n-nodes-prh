import type { IDataObject, IExecuteSingleFunctions } from 'n8n-workflow';
import { simplifyCompany, simplifyIfRequested } from '../../resources/company';
import { simplifyNotificationCompany, simplifyGetIfRequested } from '../../resources/notification';

// Single shared helper for both suites below — avoids duplicating mock-context
// setup across company and notification test blocks (the exact duplication
// pattern SonarCloud flagged for paginateByPage before it was consolidated).
function createMockSingleContext(simplify: boolean): IExecuteSingleFunctions {
	return {
		getNodeParameter: () => simplify,
	} as unknown as IExecuteSingleFunctions;
}

// Fixtures based on real PRH API responses captured during manual testing.
const dissolvedCompany: IDataObject = {
	businessId: { value: '0101120-3', registrationDate: '1978-03-15', source: '3' },
	names: [
		{ name: 'Nokia Networks Oy', type: '1', registrationDate: '1999-10-01', endDate: '2001-10-01' },
		{
			name: 'Nokia Telecommunications Oy',
			type: '1',
			registrationDate: '1992-07-31',
			endDate: '1999-09-30',
		},
	],
	companyForms: [
		{
			type: '16',
			descriptions: [
				{ languageCode: '3', description: 'Limited company' },
				{ languageCode: '1', description: 'Osakeyhtiö' },
			],
			endDate: '2001-10-01',
		},
	],
	status: '2',
	tradeRegisterStatus: '4',
	registrationDate: '1976-07-23',
	endDate: '2001-10-01',
};

const activeCompanyWithWebsite: IDataObject = {
	businessId: { value: '0112038-9', registrationDate: '1978-03-15', source: '3' },
	names: [{ name: 'Nokia Oyj', type: '1', registrationDate: '1997-09-01' }],
	mainBusinessLine: {
		descriptions: [{ languageCode: '3', description: 'Activities of head offices' }],
	},
	companyForms: [
		{
			type: '17',
			descriptions: [{ languageCode: '3', description: 'Public limited company' }],
		},
	],
	website: { url: 'www.nokia.com' },
	status: '2',
	tradeRegisterStatus: '1',
	registrationDate: '1896-12-19',
};

const notificationCompany: IDataObject = {
	businessId: { value: '0100379-9', registrationDate: '1978-03-15', source: '3' },
	euId: { value: 'FIFPRO.0100379-9', source: '1' },
	names: [{ name: 'Asuntotekniikka Oy', type: '1', registrationDate: '1976-12-03' }],
	mainBusinessLine: {
		descriptions: [
			{ languageCode: '3', description: 'Structural engineering design and technical consultancy' },
		],
	},
	companyForms: [
		{ type: '16', descriptions: [{ languageCode: '3', description: 'Limited company' }] },
	],
	companySituations: [],
	registeredEntries: [{ type: '1', register: '1' }],
	addresses: [{ type: 2, street: 'Haapasaarentie' }],
	publicNotices: [
		{ registrationDate: '2026-04-25', recordNumber: '2026/28802T', entryCodes: ['TASE'] },
	],
	tradeRegisterStatus: '1',
	status: '2',
	registrationDate: '1976-12-03',
	lastModified: '2025-12-31 07:39:20',
};

describe('simplifyCompany (company resource)', () => {
	it('omits endDate and website entirely when absent from the source record', () => {
		const result = simplifyCompany(dissolvedCompany);

		expect(result.name).toBe('Nokia Networks Oy');
		expect(result.endDate).toBe('2001-10-01');
		expect('website' in result).toBe(false);
	});

	it('includes website when present, and picks the current (non-ended) name/form', () => {
		const result = simplifyCompany(activeCompanyWithWebsite);

		expect(result.name).toBe('Nokia Oyj');
		expect(result.companyForm).toBe('Public limited company');
		expect(result.website).toBe('www.nokia.com');
		expect('endDate' in result).toBe(false);
	});

	it('respects the Simplify toggle in the postReceive wrapper', async () => {
		const items = [{ json: activeCompanyWithWebsite }];

		const simplified = await simplifyIfRequested.call(createMockSingleContext(true), items);
		expect(Object.keys(simplified[0].json)).not.toContain('companyForms');

		const raw = await simplifyIfRequested.call(createMockSingleContext(false), items);
		expect(raw).toBe(items);
	});
});

describe('simplifyNotificationCompany (notification resource)', () => {
	it('drops only the five specified admin fields and keeps everything else, including publicNotices, untouched', () => {
		const result = simplifyNotificationCompany(notificationCompany);

		expect('euId' in result).toBe(false);
		expect('companyForms' in result).toBe(false);
		expect('companySituations' in result).toBe(false);
		expect('registeredEntries' in result).toBe(false);
		expect('addresses' in result).toBe(false);

		// Everything else — including fields not explicitly named in the spec —
		// must survive untouched, since this is a blacklist, not a whitelist.
		expect(result.publicNotices).toEqual(notificationCompany.publicNotices);
		expect(result.names).toEqual(notificationCompany.names);
		expect(result.mainBusinessLine).toEqual(notificationCompany.mainBusinessLine);
		expect(result.lastModified).toBe('2025-12-31 07:39:20');
	});

	it('respects the Simplify toggle in the postReceive wrapper', async () => {
		const items = [{ json: notificationCompany }];

		const simplified = await simplifyGetIfRequested.call(createMockSingleContext(true), items);
		expect(Object.keys(simplified[0].json)).not.toContain('euId');

		const raw = await simplifyGetIfRequested.call(createMockSingleContext(false), items);
		expect(raw).toBe(items);
	});
});
