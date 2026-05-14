import { CloudDownloadIcon, CloseIcon, RocketIcon } from "./AppIcons";

export default function UpdateBanner({ updateInfo, onDismiss, onInstall }) {
  if (!updateInfo) return null;

  const isReady = updateInfo.downloaded;
  const BannerIcon = isReady ? RocketIcon : CloudDownloadIcon;

  return (
    <div className={`update-banner ${isReady ? "update-banner--ready" : "update-banner--available"}`}>
      <BannerIcon className="update-banner__icon" size={16} />
      <span className="update-banner__text">
        {isReady
          ? `v${updateInfo.version} downloaded — restart to apply the update`
          : `v${updateInfo.version} is available — downloading in the background…`}
      </span>
      <div className="update-banner__actions">
        {isReady && (
          <button className="update-banner__btn update-banner__btn--install" onClick={onInstall}>
            Restart &amp; Install
          </button>
        )}
        <button className="update-banner__btn update-banner__btn--dismiss" onClick={onDismiss} title="Dismiss">
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
}
