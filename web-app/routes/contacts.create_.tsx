import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import invariant from "tiny-invariant";

import { createEmptyContact, updateContact } from "../data";
import { requireAuthentication } from "../utils/auth";
import ContactForm from "~/components/ContactForm";


export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const r = await requireAuthentication(request);
  if (r) {
    return r;
  }
  return json({});
};

export const action = async ({
    params,
    request,
  }: ActionFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    const contact = await createEmptyContact();
    await updateContact(contact.id, updates);

    return redirect(`/contacts/${params.contactId}`);
  };

export default function EditContact() {
  return (
    <Form id="create-contact" method="post">
      <ContactForm />
    </Form>
  );
}
