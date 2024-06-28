type GenerateSdkContext = {
  openapis: {
    /** Used as prefix for the operation (e.g. `sdk.userCrud.create`). If not given, can be inferred from `openapi.info.title` or, if not existent, from `openapiUrl` */
    slug?: string;
    envKeyName: string;
    /** If given, will only put this subset in the SDK */
    operationIds?: string[];
    openapiUrl: string;
  }[];
};

type GenerateSdkResponse = {
  sdk?: string;
};
/**
Has the ability to generate a single SDK for multiple (subsets of) openapis.
*/
const generateSdk = async (context: GenerateSdkContext) => {
  const { openapis } = context;
  //start with openapi-fetch-typescript
  // Turn multiple openapis into 1 big Typescript SDK file
  const sdk = `// sdk for ${openapis.length} openapis: ${openapis
    .map((x) => x.slug)
    .join(", ")}`;
  return { sdk } satisfies GenerateSdkResponse;
};

export const POST = async (request: Request) => {
  try {
    const body: GenerateSdkContext = await request.json();

    // Via endpoint and get a single typesafe SDK client back
    const response = await generateSdk(body);

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response("Invalid Body", { status: 400 });
  }
};
