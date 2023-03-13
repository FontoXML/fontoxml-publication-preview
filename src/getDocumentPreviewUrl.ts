import configurationManager from 'fontoxml-configuration/src/configurationManager';
import connectorsManager from 'fontoxml-configuration/src/connectorsManager';
import RequestData from 'fontoxml-connector/src/RequestData';
import type { CmsClientResponse } from 'fontoxml-connector/src/types';

const scope = configurationManager.get('scope');
const cmsClient = connectorsManager.getCmsClient();

const cmsBaseUrl = scope.cmsBaseUrl
	? new URL(scope.cmsBaseUrl)
	: new URL('connectors/cms/standard/', window.location.origin + window.location.pathname);

export async function getDocumentPreviewUrl(
	remoteDocumentId: string,
	variant?: string,
	forceDownload?: boolean
): Promise<string> {
	const url = new URL('document/preview', cmsBaseUrl);

	url.searchParams.append(
		'context',
		JSON.stringify(cmsClient.createContext())
	);

	url.searchParams.append('documentId', remoteDocumentId);

	if (variant) {
		url.searchParams.append('variant', variant);
	}

	if (forceDownload) {
		url.searchParams.append('forceDownload', 'true');
	}

	// Return a promise to make this function interchangeable with
	// 'getDocumentPreviewUrlFromIframe'.
	return Promise.resolve(url.href);
}

export default function createResponseValidator(
	remoteDocumentId: string
): (response: CmsClientResponse) => void {
	return function validatePreviewUrlResponse(response: CmsClientResponse) {
		if (!response.ok || !response.body?.url) {
			throw new Error(
				`Failed to retrieve a preview URL for document '${remoteDocumentId}'.`
			);
		}
	};
}

export async function getDocumentPreviewUrlFromIframe(
	remoteDocumentId: string,
	variant?: string,
	forceDownload?: boolean
): Promise<string> {
	const queryParams: {
		context: string;
		documentId: string;
		forceDownload?: string;
		variant?: string;
	} = {
		context: JSON.stringify(cmsClient.createContext()),
		documentId: remoteDocumentId,
	};

	if (variant) {
		queryParams.variant = variant;
	}

	if (forceDownload) {
		queryParams.forceDownload = 'true';
	}

	const requestData = new RequestData();
	requestData.addQueryParameters(queryParams);

	const validateResponse = createResponseValidator(remoteDocumentId);

	return connectorsManager
		.getCmsClient()
		.sendRequest<{ url: string }>(
			'GET',
			'/document/preview/url',
			requestData,
			{
				validateResponse,
			}
		)
		.then((response) => {
			return response.body.url;
		});
}
