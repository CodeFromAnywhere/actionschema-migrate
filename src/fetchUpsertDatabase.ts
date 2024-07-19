import { tryParseJson } from "from-anywhere";

interface CreateDatabaseResponse {
  isSuccessful: boolean;
  message?: string;
  authToken?: string;
  adminAuthToken?: string;
  openapiUrl?: string;
}

interface CreateDatabaseParams {
  databaseSlug: string;
  schemaString: string;
  authToken?: string;
  adminAuthToken: string;
}

export async function fetchUpsertDatabase(
  params: CreateDatabaseParams,
): Promise<CreateDatabaseResponse | null> {
  try {
    const url = "https://data.actionschema.com/upsertDatabase";

    const { adminAuthToken, ...rest } = params;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + adminAuthToken,
      },
      body: JSON.stringify(rest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return tryParseJson<CreateDatabaseResponse>(await response.text());
  } catch (e) {
    console.log("HMMMM", e);
    return null;
  }
}
