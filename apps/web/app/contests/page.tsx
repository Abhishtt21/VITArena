import { Contests } from "../../components/Contests";
import { ActionButtons } from "../../components/ActionButtons";
import ErrorHandler from "./error-handler";

export default async function ContestsPage() {
  return (
    <main>
      <ErrorHandler />
      <ActionButtons />
      <Contests />
    </main>
  );
}

export const dynamic = "force-dynamic";






