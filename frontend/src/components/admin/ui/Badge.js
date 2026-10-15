/** Small coloured label. tone: default | primary | success | warning | danger | info */
export default function Badge({ tone = "default", children }) {
  return <span className={`admin-badge admin-badge-${tone}`}>{children}</span>;
}
