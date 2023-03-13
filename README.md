# Publication Preview

This is a package for Fonto Editor. [Learn more about packages in Fonto](https://documentation.fontoxml.com/latest/application-structure-34b22b57e915#id-950bd16b-604b-12a1-104e-72aaaa5935a0).

## Usage

To use this package, make a copy of the repository and place it in the `packages` directory of your editor instance. Afterwards, register the package in `config/fonto-manifest.json` to make it active.

Once the package is active, you can implement the following operations:

* `download-publication-preview`
* `open-publication-preview`
* `open-publication-preview-in-new-tab`

## Deprecation

This package was originally an add-on for Fonto Editor. However, the add-on has been deprecated and, for those that still require this functionality, this package can be used as an alternative.

Since 8.4.0, the endpoint has also been removed from the development server. This means that you have to implement the original [endpoint](https://documentation.fontoxml.com/8.3/document-saving-loading-locking-and-state-management-2f5963250df3#id-f8f5d106-fef6-34e2-3783-26832d771b83) yourself. For more information about implementing your own routes for the development server, please have a look at our [guide](https://documentation.fontoxml.com/latest/custom-cms-endpoint-e78394bce8b0) on how to do so.

## Support

This package is not maintained. Any changes must be implemented by those who adopt this package.
