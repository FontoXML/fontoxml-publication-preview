import documentsManager from 'fontoxml-documents/src/documentsManager';
import t from 'fontoxml-localization/src/t';
import uiManager from 'fontoxml-modular-ui/src/uiManager';
import triggerNotification from 'fontoxml-notifications/src/triggerNotification';
import addAction from 'fontoxml-operations/src/addAction';
import operationsManager from 'fontoxml-operations/src/operationsManager';
import selectionManager from 'fontoxml-selection/src/selectionManager';

import { getDocumentPreviewUrl } from './getDocumentPreviewUrl';
import PublicationPreviewModal from './ui/PublicationPreviewModal';

function waitForWindowLoad(windowWithPreview: Window): Promise<Window> {
	return Promise.race([
		new Promise<Window>((resolve) => {
			setTimeout(() => {
				resolve(windowWithPreview);
			}, 3000);
		}),
		new Promise<Window>((resolve) => {
			windowWithPreview.addEventListener('load', function onLoad() {
				windowWithPreview.removeEventListener('load', onLoad);
				resolve(windowWithPreview);
			});
		}),
	]);
}

function openPreviewWindow(): Window | null {
	const preloaderUrl = new URL(
		'assets/preview-preloader.html',
		window.location.origin + window.location.pathname
	);
	preloaderUrl.searchParams.append('title', t('Loading preview…'));
	preloaderUrl.searchParams.append(
		'subtitle',
		t(
			'If this page does not close automatically, close it when the download is finished.'
		)
	);

	return window.open(preloaderUrl);
}

function showErrorNotification(message) {
	const { dismiss } = triggerNotification(t('Preview error'), {
		colorName: 'toast-error-color',
		dismissAfterMs: 8000,
		icon: 'circle-exclamation',
		message,
		onClick: () => {
			dismiss();
		},
	});
}

export default function install(): void {
	addAction<{
		documentId: string;
		forceDownload: boolean;
		variant: string;
	}>(
		'openPublicationPreviewUrlInNewWindow',
		async function openPublicationPreviewUrlInNewWindow(stepData) {
			const window = openPreviewWindow();
			if (!window) {
				showErrorNotification(
					t(
						'Your browser blocked the preview window from opening. This might happen in certain browsers when using a keyboard shortcut to open the preview.'
					)
				);
			}

			const documentId =
				stepData.documentId || selectionManager.focusedDocumentId;
			const remoteDocumentId =
				documentsManager.getRemoteDocumentId(documentId);

			// When using the iframe CMS connector, invoke
			// 'getDocumentPreviewUrlFromIframe' here instead.
			const previewUrlPromise = getDocumentPreviewUrl(
				remoteDocumentId,
				stepData.variant,
				stepData.forceDownload
			);

			const windowPromise = waitForWindowLoad(window);

			const savePromise = operationsManager.executeOperation(
				'save-all-documents-and-wait'
			);

			return Promise.all([previewUrlPromise, windowPromise, savePromise])
				.then((values) => {
					values[1].postMessage(
						{ previewUrl: values[0] },
						window.location.origin + window.location.pathname
					);
				})
				.catch((_err) => {
					showErrorNotification(
						t(
							'Something went wrong while opening the preview window.\nPlease try again.'
						)
					);
				});
		},
		function getStateForOpenPublicationPreviewUrlInNewWindow(stepData) {
			return {
				enabled:
					!!stepData.documentId ||
					!!selectionManager.focusedDocumentId,
				active: false,
			};
		}
	);

	selectionManager.selectionChangeNotifier.addCallback(() => {
		operationsManager.invalidateOperationStatesByStepType(
			'action',
			'openPublicationPreviewUrlInNewWindow'
		);
	});

	uiManager.registerReactComponent(
		'PublicationPreviewModal',
		PublicationPreviewModal
	);
}
