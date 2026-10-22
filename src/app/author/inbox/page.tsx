import { redirect } from "next/navigation";

export default function AuthorInboxRedirect() {
  redirect("/author-dashboard?menu=Email%20Box");
}
