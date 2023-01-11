import { httpClient } from '../../../common/http/core/http-client';
import { HttpMethod } from '../../../common/http/core/http-method';
import { HttpRequest } from '../../../common/http/core/http-request';
import { createAction } from '../../../framework/action/action';
import { Property } from "../../../framework/property/prop.model";

const BASE_URL = "https://api.sky.blackbaud.com";

export const blackbaudListContacts = createAction({
	name: 'list_contacts',
	description: 'List contacts on blackbaud',
	displayName: 'List Contacts',
	props: {
		authentication: Property.OAuth2({
			description: "",
			displayName: 'Authentication',
			authUrl: "https://app.blackbaud.com/oauth/authorize",
			tokenUrl: "https://oauth2.sky.blackbaud.com/token",
			required: true,
			scope: []
		}),
		subscription_key: Property.ShortText({
			displayName: "Subscription Key",
			required: true
		})
	},
	async run(configValue) {
		const accessToken = configValue.propsValue['authentication']?.access_token;
		let contacts: any[] = [];
		let nextLink: string | undefined = `${BASE_URL}/constituent/v1/constituents?limit=500`;
		while (nextLink !== undefined) {
			const request: HttpRequest<never> = {
				method: HttpMethod.GET,
				url: nextLink,
				headers: {
					"Bb-Api-Subscription-Key": configValue.propsValue['subscription_key'],
					Authorization: `Bearer ${accessToken}`,
				},
			};
			let response = await httpClient.sendRequest<{ count: number; next_link: string; value: unknown[] }>(request);
			contacts = contacts.concat(response.body?.value)
			nextLink = response.body?.next_link;
		}
		return contacts;
	},
});
