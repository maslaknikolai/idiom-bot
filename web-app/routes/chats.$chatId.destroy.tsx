import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteContact } from "../data";
import { requireAuthentication } from "../utils/auth";

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  const r = await requireAuthentication(request);
  if (r) {
    return r;
  }
  invariant(params.chatId, "Missing chatId param");
  await deleteContact(params.chatId);
  return redirect("/");
};
