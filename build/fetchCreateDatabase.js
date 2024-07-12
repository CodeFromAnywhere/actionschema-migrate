import { tryParseJson } from "from-anywhere";
export async function fetchCreateDatabase(params) {
    try {
        const url = "https://data.actionschema.com/root/createDatabase";
        const { adminAuthToken, ...rest } = params;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                X_ADMIN_AUTH_TOKEN: adminAuthToken,
            },
            body: JSON.stringify(rest),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return tryParseJson(await response.text());
    }
    catch (e) {
        console.log("HMMMM", e);
        return null;
    }
}
