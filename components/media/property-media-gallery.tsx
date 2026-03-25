type Props = {
  media: Array<{
    id: string;
    fileUrl: string;
    title: string | null;
    isCover: boolean;
    isPublic: boolean;
  }>;
};

export function PropertyMediaGallery({ media }: Props) {
  if (media.length === 0) {
    return <p className="text-sm text-[#6b665f]">Aucun média ajouté pour le moment.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {media.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-[1.25rem] border border-line bg-[#fbf8f4]">
          <img src={item.fileUrl} alt={item.title ?? "Média du bien"} className="h-56 w-full object-cover" />
          <div className="space-y-2 px-4 py-4">
            <div className="font-medium text-ink">{item.title || "Image sans titre"}</div>
            <div className="flex flex-wrap gap-2 text-xs text-[#6b665f]">
              {item.isCover ? <span className="rounded-full border border-black/10 px-2 py-1">Cover</span> : null}
              <span className="rounded-full border border-black/10 px-2 py-1">{item.isPublic ? "Public" : "Interne"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
