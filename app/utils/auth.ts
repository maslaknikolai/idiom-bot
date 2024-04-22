import { getSession } from "../sessions";
import { redirect } from "@remix-run/node";

export async function requireAuthentication(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    return redirect("/login");
  }
}
