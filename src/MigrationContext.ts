export interface OpenAPIConfig {
  /**
   * A unique identifier for this OpenAPI configuration.
   */
  slug: string;

  /**
   * Can be an URL or relative path, leading to an OpenAPI specification.
   */
  openapiUrlOrPath: string;

  /**
   * Provide an authorization key that is available as environment variable,
   * to be used as Authorization header (bearer by default)
   *
   * If not given, will not include an Authorization header
   */
  envKeyName?: string;

  /**
   * If given, selects only these operationIds from the openapi.
   */
  operationIds?: string[];
}

/** TODO: Get this from schema. This may be an exception though, haha. */
export type MigrationContext = {
  relativeOutputPath?: string;
  useJsImportSuffix?: boolean;
  /**any json schemas we need in typescript*/
  relativeJsonSchemaBasePath?: string;
  remoteJsonSchemaUrls?: string[];

  /**
   * Remote or local (partial) OpenAPIs that need to be included in the SDK.
   */
  openapis: OpenAPIConfig[];

  /** agent schemas that need to become an agent API */
  relativeAgentBasePath?: string;
  remoteAgentUrls?: string[];
  customAgentServer?: string;

  /** file prompts that need to be accessible through the actionschema CLI */
  relativeFilePromptBasePath?: string;
  remoteFilePromptUrls?: string[];

  /**✅ crud schemas we need to be a crud api*/
  relativeCrudSchemaBasePath?: string;
  remoteCrudSchemaUrls?: string[];
  customCrudServer?: string;
  crudSlugPrefix?: string;
};
