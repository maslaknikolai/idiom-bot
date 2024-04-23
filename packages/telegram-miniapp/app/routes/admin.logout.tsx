import { ActionFunctionArgs } from "@remix-run/node";
import { getSession, destroySession } from "../sessions";
import { redirect } from "react-router-dom";

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/admin/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};