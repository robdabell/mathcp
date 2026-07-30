export interface AuthEnv {
  AUTH_TOKEN?: string;
}

const encoder = new TextEncoder();

async function tokensMatch(provided: string, expected: string): Promise<boolean> {
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);

  const left = new Uint8Array(providedHash);
  const right = new Uint8Array(expectedHash);
  let difference = 0;

  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }

  return difference === 0;
}

export async function authorizeRequest(
  request: Request,
  env: AuthEnv,
): Promise<Response | null> {
  if (!env.AUTH_TOKEN) {
    return Response.json(
      { error: "Authentication is not configured" },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" },
      },
    );
  }

  const providedToken = authorization.slice("Bearer ".length);
  if (!providedToken || !(await tokensMatch(providedToken, env.AUTH_TOKEN))) {
    return Response.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" },
      },
    );
  }

  return null;
}
