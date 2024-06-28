export interface paths {
    "/create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["read"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/update": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["update"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/remove": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["remove"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: never;
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    items: {
                        /** @description Every key is an 'appId' that is needed by (one of the) tools.
                         *
                         *     Every value is an object containing the authorization details. */
                        keys?: {
                            [key: string]: {
                                secret?: string;
                            } | undefined;
                        };
                        threadIds?: string[];
                    }[];
                };
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful: boolean;
                        message: string;
                        /** @description The rowIds created */
                        result?: string[];
                    };
                };
            };
        };
    };
    read: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    search?: string;
                    vectorSearch?: {
                        propertyKey: string;
                        input: string;
                        topK: number;
                        minimumSimilarity: number;
                    };
                    rowIds?: string[];
                    startFromIndex?: number;
                    maxRows?: number;
                    filter?: {
                        /** @enum {string} */
                        operator: "equal" | "notEqual" | "endsWith" | "startsWith" | "includes" | "includesLetters" | "greaterThan" | "lessThan" | "greaterThanOrEqual" | "lessThanOrEqual" | "isIncludedIn" | "isFalsy" | "isTruthy";
                        value: string;
                        objectParameterKey: string;
                    }[];
                    sort?: {
                        /** @enum {string} */
                        sortDirection: "ascending" | "descending";
                        objectParameterKey: string;
                    }[];
                    objectParameterKeys?: string[];
                    ignoreObjectParameterKeys?: string[];
                };
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful: boolean;
                        message: string;
                        $schema?: string;
                        items?: {
                            [key: string]: {
                                /** @description Every key is an 'appId' that is needed by (one of the) tools.
                                 *
                                 *     Every value is an object containing the authorization details. */
                                keys?: {
                                    [key: string]: {
                                        secret?: string;
                                    } | undefined;
                                };
                                threadIds?: string[];
                            } | undefined;
                        };
                        schema?: {
                            [key: string]: unknown;
                        };
                        canWrite?: boolean;
                        hasMore?: boolean;
                    };
                };
            };
        };
    };
    update: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description The id (indexed key) of the item to update. Update that functions as upsert. If the id didn't exist, it will be created. */
                    id: string;
                    /** @description Agent User is a kv store where the key is an Authorization token, where the value contains app-specific info of that user. */
                    partialItem: {
                        /** @description Every key is an 'appId' that is needed by (one of the) tools.
                         *
                         *     Every value is an object containing the authorization details. */
                        keys?: {
                            [key: string]: {
                                secret?: string;
                            } | undefined;
                        };
                        threadIds?: string[];
                    };
                };
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful: boolean;
                        message: string;
                    };
                };
            };
        };
    };
    remove: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description Which IDs should be removed */
                    rowIds: string[];
                };
            };
        };
        responses: {
            /** @description OpenAPI */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        isSuccessful: boolean;
                        message: string;
                        /** @description The number of items deleted */
                        deleteCount?: number;
                    };
                };
            };
        };
    };
}


undefined
  
export const operationUrlObject = {
  "create": {
    "method": "post",
    "path": "/create"
  },
  "read": {
    "method": "post",
    "path": "/read"
  },
  "update": {
    "method": "post",
    "path": "/update"
  },
  "remove": {
    "method": "post",
    "path": "/remove"
  }
}
export const operationKeys = Object.keys(operationUrlObject);