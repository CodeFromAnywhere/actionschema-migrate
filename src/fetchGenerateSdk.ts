// Type definitions
export type GenerateSdkContext = {
  openapis: {
    /** Used as prefix for the operation (e.g. `sdk.userCrud.create`). If not given, can be inferred from `openapi.info.title` or, if not existent, from `openapiUrl` */
    slug?: string;
    envKeyName: string;
    /** If given, will only put this subset in the SDK */
    operationIds?: string[];
    openapiUrl: string;
  }[];
};

export type GenerateSdkResponse = {
  sdk?: string;
};

const API_URL = "https://migrate.actionschema.com/generateSdk";

export async function fetchGenerateSdk(
  context: GenerateSdkContext,
): Promise<GenerateSdkResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    if (response.status === 400) {
      const errorText = await response.text();
      throw new Error(`Bad Request: ${errorText}`);
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: GenerateSdkResponse = await response.json();
  return data;
}

// Example usage:
// async function example() {
//   try {
//     const context: GenerateSdkContext = {
//       openapis: [
//         {
//           secret: 'your-secret-here',
//           openapiUrl: 'https://example.com/api-spec.json',
//         },
//       ],
//     };
//     const result = await fetchGenerateSdk(context);
//     console.log('SDK:', result.sdk);
//     console.log('Environment variables:', result.env);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }
