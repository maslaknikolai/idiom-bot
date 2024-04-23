import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact, updateContact } from "../data";
import { requireAuthentication } from "../utils/auth";
import ContactForm from "~/components/ContactForm";

export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  const r = await requireAuthentication(request);
  if (r) {
    return r;
  }
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact });
};

export const action = async ({
    params,
    request,
  }: ActionFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);
    await updateContact(params.contactId, updates);
    return redirect(`/contacts/${params.contactId}`);
  };

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <ContactForm
        first={contact.first}
        last={contact.last}
        twitter={contact.twitter}
        avatar={contact.avatar}
        notes={contact.notes}
      />
    </Form>
  );
}
