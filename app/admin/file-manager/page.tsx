import { getFiles } from "./actions";
import FileManagerClient from "./FileManagerClient";

export const dynamic = "force-dynamic";

export default async function FileManagerPage() {
  const initialData = await getFiles({ page: 1, pageSize: 24, filter: "all" });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <FileManagerClient initialData={initialData} />
    </div>
  );
}
