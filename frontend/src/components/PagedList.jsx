import { Link } from "react-router-dom";
import { truncate } from "../utils/Text";

export default function PagedList({
  title,
  items = [],
  rows = 5,
  rowHeight = 28,
  emptyText = "Nothing yet",
  action = null,
}) {
  return (
    <div className="listBlock paged" style={{ "--rows": rows, "--row-h": `${rowHeight}px` }}>
      <div className="listHeader">
        <div className="listTitleRow">
          <div className="listTitle">{title}</div>
          {action && <span className="inlineAction">{action}</span>}
        </div>
        <div className="listMeta">{items.length}</div>
      </div>

      <div className="listScroll">
        {items.length ? (
          <ul className="listUl">
            {items.map(it => (
              <li key={it.id}>
                <Link to={it.to} className="listLink" title={it.title}>
                  <span className="listLinkText">{truncate(it.title, 60)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="muted">{emptyText}</div>
        )}
      </div>
    </div>
  );
}
