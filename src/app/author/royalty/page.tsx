import { redirect } from "next/navigation";

export default function AuthorRoyaltyRedirect() {
  redirect("/author-dashboard?menu=Royalty%20Withdrawal");
}
