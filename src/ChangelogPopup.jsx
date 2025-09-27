import styles from "./ChangelogPopup.module.css";
const CHANGELOG_VERSION = "2025-09-27"; // Update this whenever you add new entries

export default function ChangelogPopup({ changelog = [], onClose, allowOverlayClose = true }) {
  if (!onClose || typeof onClose !== "function") {
    console.warn("ChangelogPopup: onClose prop is required and should be a function.");
  }

  const handleOverlayClick = () => {
    if (allowOverlayClose && onClose) onClose();
  };

  const stop = (e) => e.stopPropagation();

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
        <div className={styles.popup} onClick={stop} role="dialog" aria-modal="true">
            <h2>Changelog</h2>
                <div className="changelog">
                {changelog.map((entry) => (
                    <div key={entry.date} className="changelog-entry">
                    <h3>{entry.date}</h3>
                    <ul>
                        {entry.changes.map((c, i) => (
                        <li key={i}>{c}</li>
                        ))}
                    </ul>
                    </div>
                ))}
                </div>
            <p> </p>
            <div className={styles.buttonRow}>
                <button 
                    type="button" 
                    className={styles.closeButton} 
                    onClick={onClose}
                 >
                  Close   
                </button>
            </div>
        </div>
    </div>
  );
}
