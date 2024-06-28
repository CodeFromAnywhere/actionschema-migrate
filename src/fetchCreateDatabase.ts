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
}

export async function fetchCreateDatabase(
  params: CreateDatabaseParams,
  adminAuthToken?: string,
): Promise<CreateDatabaseResponse> {
  const url = "https://data.actionschema.com/root/createDatabase";

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (adminAuthToken) {
    headers["X_ADMIN_AUTH_TOKEN"] = adminAuthToken;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as CreateDatabaseResponse;
}
