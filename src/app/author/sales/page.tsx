import { redirect } from "next/navigation";

export default function AuthorSalesRedirect() {
  redirect("/author-dashboard?menu=Sales%20Reports");
}
