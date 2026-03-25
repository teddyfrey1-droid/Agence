import Link from "next/link";

export type DocumentListItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  documentType: string;
  visibility: string;
  createdAt: Date;
};

type Props = {
  documents: DocumentListItem[];
  emptyLabel?: string;
};

export function DocumentList({ documents, emptyLabel = "Aucun document." }: Props) {
  if (documents.length === 0) {
    return <p className="text-sm text-[#6b665f]">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div key={document.id} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-[#fbf8f4] px-4 py-4">
          <div className="min-w-0">
            <div className="truncate font-medium text-ink">{document.fileName}</div>
            <div className="mt-1 text-sm text-[#6b665f]">
              {document.documentType} · {document.visibility} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(document.createdAt)}
            </div>
          </div>
          <Link href={document.fileUrl} target="_blank" className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:border-black/15 hover:bg-white">
            Ouvrir
          </Link>
        </div>
      ))}
    </div>
  );
}
