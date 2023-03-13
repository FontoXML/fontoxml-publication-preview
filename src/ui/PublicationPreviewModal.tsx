import {
	Button,
	Iframe,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	SpinnerIcon,
	StateMessage,
} from 'fds/components';
import { flex } from 'fds/system';
import React, { useEffect, useState } from 'react';

import documentsManager from 'fontoxml-documents/src/documentsManager';
import type { ModalProps } from 'fontoxml-fx/src/types';
import t from 'fontoxml-localization/src/t';
import selectionManager from 'fontoxml-selection/src/selectionManager';

import { getDocumentPreviewUrl } from '../getDocumentPreviewUrl';

const iframeStyles = [flex('column'), { flex: 1 }];

const closeButtonLabel = t('Close');

const PublicationPreviewModal: React.FC<
	ModalProps<{
		documentId?: string;
		modalIcon?: string;
		modalTitle?: string;
		variant?: string;
	}>
> = ({ cancelModal, data }) => {
	const targetDocumentId =
		data.documentId || selectionManager.focusedDocumentId;

	const remoteDocumentId =
		documentsManager.getRemoteDocumentId(targetDocumentId);

	const fallbackModalTitle = t(
		'Document preview for {DOCUMENT_IDENTIFIERS}',
		{
			DOCUMENT_IDENTIFIERS: `${remoteDocumentId} (${targetDocumentId})`,
		}
	);

	const [documentPreviewUrl, setDocumentPreviewUrl] = useState<string>();
	const [isErrored, setIsErrored] = useState(false);

	useEffect(() => {
		void (
			// When using the iframe CMS connector, invoke
			// 'getDocumentPreviewUrlFromIframe' here instead.
			getDocumentPreviewUrl(remoteDocumentId, data.variant)
				.then((newDocumentPreviewUrl) => {
					setDocumentPreviewUrl(newDocumentPreviewUrl);
				})
				.catch((_err) => {
					setIsErrored(true);
				})
		);
	}, [data.variant, remoteDocumentId]);

	return (
		<Modal size="m" isFullHeight>
			<ModalHeader
				icon={data.modalIcon || 'eye'}
				title={data.modalTitle || fallbackModalTitle}
			/>

			<ModalBody>
				{!documentPreviewUrl && !isErrored && (
					<StateMessage
						visual={<SpinnerIcon />}
						title={t('Loading preview…')}
					/>
				)}

				{isErrored && (
					<StateMessage
						connotation="error"
						visual="exclamation-triangle"
						title={t('Can’t preview this document')}
					/>
				)}

				{documentPreviewUrl && (
					<Iframe applyCss={iframeStyles} src={documentPreviewUrl} />
				)}
			</ModalBody>

			<ModalFooter>
				<Button label={closeButtonLabel} onClick={cancelModal} />
			</ModalFooter>
		</Modal>
	);
};

export default PublicationPreviewModal;
