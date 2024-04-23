import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

import { createEmptyContact, updateContact } from "../data";
import { requireAuthentication } from "../utils/auth";
import ContactForm from "~/components/ContactForm";
import { connectToDatabase } from "mongooseDB";
import { ChatModel } from "models/chat";
import mongoose from "mongoose";


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
    request,
  }: ActionFunctionArgs) => {
    await connectToDatabase();
    const chat = new ChatModel({
      id: 'unique_chat_id',
      players: [
        {
          id: new mongoose.Types.ObjectId(),
          name: 'Иван'
        },
        {
          id: new mongoose.Types.ObjectId(),
          name: 'Мария'
        }
      ],
      games: []
    });

    await chat.save();
    console.log(chat);

    const formData = await request.formData();
    const updates = Object.fromEntries(formData);

    const contact = await createEmptyContact();
    await updateContact(contact.id, updates);

    return redirect(`/`);
  };

export default function EditContact() {
  return (
    <Form id="create-contact" method="post">
      <ContactForm />
    </Form>
  );
}
