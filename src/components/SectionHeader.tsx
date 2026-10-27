interface SectionHeaderProps {
  id: string;
  title: string;
  lead?: string;
}

export function SectionHeader({ id, title, lead }: SectionHeaderProps) {
  return (
    <div className="section__head">
      <h2 id={id} className="section__title">
        {title}
      </h2>
      {lead ? <p className="section__lead">{lead}</p> : null}
    </div>
  );
}
