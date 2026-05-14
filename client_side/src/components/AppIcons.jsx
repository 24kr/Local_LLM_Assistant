import { getFileTypeMeta } from "../utils/fileTypes";
import { FILE_TONES, getCapabilityMeta } from "../utils/capabilityMeta";

function joinClassNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SvgIcon({
  size = 20,
  className = "",
  viewBox = "0 0 24 24",
  strokeWidth = 1.8,
  children,
  ...props
}) {
  return (
    <svg
      className={joinClassNames("app-icon", className)}
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </g>
    </svg>
  );
}

export function ChatBubbleIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M7 18.5H4.5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H12l-5 3v-3Z" />
      <path d="M8 10h8" />
      <path d="M8 14h5" />
    </SvgIcon>
  );
}

export function LibraryIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M4 5.5 8 4l3 14-4 1.5-3-14Z" />
      <path d="M10 4.5h4.5a2 2 0 0 1 2 2v13H10v-15Z" />
      <path d="M16.5 6H19a2 2 0 0 1 2 2v11h-4.5V6Z" />
    </SvgIcon>
  );
}

export function SettingsIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m12 2 1 2.5 2.7.6-.8 2.6 1.8 2-1.8 2 .8 2.6-2.7.6L12 22l-1-2.5-2.7-.6.8-2.6-1.8-2 1.8-2-.8-2.6 2.7-.6L12 2Z" />
      <circle cx="12" cy="12" r="3.2" />
    </SvgIcon>
  );
}

export function RagOnIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5 4.5h9a2 2 0 0 1 2 2v13H7a2 2 0 0 0-2 2V4.5Z" />
      <path d="M7 19.5h10a2 2 0 0 0 2-2V8.5" />
      <path d="M8.5 9h5" />
      <path d="M8.5 12.5h5" />
      <path d="m17.5 5.5 1.5 1.5 3-3" />
    </SvgIcon>
  );
}

export function RagOffIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5 4.5h9a2 2 0 0 1 2 2v13H7a2 2 0 0 0-2 2V4.5Z" />
      <path d="M7 19.5h10a2 2 0 0 0 2-2V8.5" />
      <path d="M6 6 18 18" />
    </SvgIcon>
  );
}

export function PlusIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </SvgIcon>
  );
}

export function DownloadIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 4v11" />
      <path d="m7.5 11.5 4.5 4.5 4.5-4.5" />
      <path d="M5 19.5h14" />
    </SvgIcon>
  );
}

export function UploadIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 20V9" />
      <path d="m7.5 12.5 4.5-4.5 4.5 4.5" />
      <path d="M5 4.5h14" />
    </SvgIcon>
  );
}

export function TrashIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M4.5 7.5h15" />
      <path d="M9 4.5h6" />
      <path d="M7 7.5v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-11" />
      <path d="M10 10.5v6" />
      <path d="M14 10.5v6" />
    </SvgIcon>
  );
}

export function RefreshIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M20 6v5h-5" />
      <path d="M4 18v-5h5" />
      <path d="M18 11a7 7 0 0 0-12-3" />
      <path d="M6 13a7 7 0 0 0 12 3" />
    </SvgIcon>
  );
}

export function AlertIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 4 21 20H3L12 4Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </SvgIcon>
  );
}

export function CloseIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </SvgIcon>
  );
}

export function PaperclipIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m9 13.5 5.8-5.8a3 3 0 1 1 4.2 4.2l-7.6 7.6a5 5 0 1 1-7-7L12 5" />
    </SvgIcon>
  );
}

export function SendIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M4 11.5 20 4l-4 16-3.5-5L4 11.5Z" />
      <path d="M12.5 15 20 4" />
    </SvgIcon>
  );
}

export function BotIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="5" y="7" width="14" height="11" rx="3" />
      <path d="M12 3.5v3" />
      <path d="M8 12h.01" />
      <path d="M16 12h.01" />
      <path d="M9 15.5h6" />
    </SvgIcon>
  );
}

export function VisionIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.8" />
    </SvgIcon>
  );
}

export function CodeIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m9 7-5 5 5 5" />
      <path d="m15 7 5 5-5 5" />
      <path d="m13 5-2 14" />
    </SvgIcon>
  );
}

export function EmbeddingIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="7" cy="12" r="2" />
      <circle cx="17" cy="7" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M8.8 11.2 15.2 7.8" />
      <path d="M8.8 12.8 15.2 16.2" />
    </SvgIcon>
  );
}

export function PaletteIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 4a8 8 0 1 0 0 16h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h4a4 4 0 0 0 0-8h-4Z" />
      <path d="M7.5 10h.01" />
      <path d="M9.5 7.5h.01" />
      <path d="M13.5 7h.01" />
    </SvgIcon>
  );
}

export function BrainIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M9 6.5a3.5 3.5 0 0 1 7 0 3 3 0 0 1 2.5 3 3 3 0 0 1-1 2.2 3.2 3.2 0 0 1 .5 1.8 3.5 3.5 0 0 1-3.5 3.5H9.5A3.5 3.5 0 0 1 6 13.5c0-.7.2-1.3.5-1.8A3 3 0 0 1 5.5 9.5a3 3 0 0 1 2.5-3Z" />
      <path d="M12 6v12" />
      <path d="M9.5 10H12" />
      <path d="M12 14h2.5" />
    </SvgIcon>
  );
}

export function DatabaseIcon(props) {
  return (
    <SvgIcon {...props}>
      <ellipse cx="12" cy="6.5" rx="7" ry="3" />
      <path d="M5 6.5v11c0 1.7 3.1 3 7 3s7-1.3 7-3v-11" />
      <path d="M5 12.5c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </SvgIcon>
  );
}

export function ServerIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="4.5" width="16" height="6" rx="2" />
      <rect x="4" y="13.5" width="16" height="6" rx="2" />
      <path d="M8 7.5h.01" />
      <path d="M8 16.5h.01" />
      <path d="M12 7.5h4" />
      <path d="M12 16.5h4" />
    </SvgIcon>
  );
}

export function DesktopIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="3" y="4.5" width="18" height="12" rx="2" />
      <path d="M9 19.5h6" />
      <path d="M12 16.5v3" />
    </SvgIcon>
  );
}

export function CalendarIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M8 3.5v4" />
      <path d="M16 3.5v4" />
      <path d="M4 9.5h16" />
    </SvgIcon>
  );
}

export function ChunksIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="4" y="4.5" width="7" height="7" rx="1.5" />
      <rect x="13" y="4.5" width="7" height="7" rx="1.5" />
      <rect x="4" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13" y="13.5" width="7" height="7" rx="1.5" />
    </SvgIcon>
  );
}

export function ImageIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m6.5 16 3.5-3.5 2.5 2.5 3.5-4 2.5 5" />
    </SvgIcon>
  );
}

export function OpenIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M14 5h5v5" />
      <path d="m10 14 9-9" />
      <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
    </SvgIcon>
  );
}

export function InfoIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v5" />
      <path d="M12 7.5h.01" />
    </SvgIcon>
  );
}

export function LockIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 1 1 7 0v2.5" />
    </SvgIcon>
  );
}

export function BoltIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z" />
    </SvgIcon>
  );
}

export function CheckCircleIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </SvgIcon>
  );
}

export function XCircleIcon(props) {
  return (
    <SvgIcon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6" />
      <path d="M15 9 9 15" />
    </SvgIcon>
  );
}

export function RocketIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M14.5 4.5c2.2 0 4 1.8 4 4 0 5-3.7 8-8.5 10.5-2.2-4.8-5.2-8.5-5.2-10.7a4 4 0 0 1 4-4c1.2 0 2.2.5 3 1.2.8-.7 1.7-1 2.7-1Z" />
      <circle cx="14.5" cy="9.5" r="1.2" />
      <path d="m7.5 16.5-2 4 4-2" />
    </SvgIcon>
  );
}

export function CloudDownloadIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M8 18H7a4 4 0 1 1 1.1-7.8A5.5 5.5 0 0 1 18.8 9 3.5 3.5 0 1 1 19 18h-3" />
      <path d="M12 11v8" />
      <path d="m8.5 15.5 3.5 3.5 3.5-3.5" />
    </SvgIcon>
  );
}

export function SaveIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M5 4.5h11l3 3v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-15Z" />
      <path d="M8 4.5v5h7v-5" />
      <path d="M9 17h6" />
    </SvgIcon>
  );
}


export function ModelCapabilityIcon({ capability, size = 16, className = "" }) {
  const { Icon } = getCapabilityMeta(capability, {
    VisionIcon,
    CodeIcon,
    ChatBubbleIcon,
    EmbeddingIcon,
    BotIcon,
  });
  return <Icon size={size} className={className} />;
}

export function getCapabilityBadgeMeta(capability) {
  return getCapabilityMeta(capability, {
    VisionIcon,
    CodeIcon,
    ChatBubbleIcon,
    EmbeddingIcon,
    BotIcon,
  });
}

export function FileTypeIcon({ filename = "", ext = "", size = 28, className = "" }) {
  const lookup = filename || (ext ? `file.${ext.replace(/^\./, "")}` : "");
  const meta = getFileTypeMeta(lookup);
  const tone = FILE_TONES[meta.tone] || FILE_TONES.slate;
  const label = meta.label.slice(0, 4).toUpperCase();

  return (
    <svg
      className={joinClassNames("app-icon", "file-type-icon", className)}
      width={size}
      height={size}
      viewBox="0 0 28 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 2.5h9.2L23 9.3v17.2A3.5 3.5 0 0 1 19.5 30h-12A3.5 3.5 0 0 1 4 26.5V6A3.5 3.5 0 0 1 7.5 2.5Z"
        fill="#FFFFFF"
        stroke={tone.accent}
        strokeWidth="1.5"
      />
      <path d="M16.2 2.5V8a1.5 1.5 0 0 0 1.5 1.5H23" fill={tone.background} stroke={tone.accent} strokeWidth="1.5" />
      <rect x="6.2" y="17.5" width="14.6" height="8" rx="2.2" fill={tone.background} />
      <path d="M8.8 13h9.2" stroke={tone.accent} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.8 10h6.8" stroke={tone.accent} strokeOpacity=".45" strokeWidth="1.5" strokeLinecap="round" />
      <text
        x="13.5"
        y="22.8"
        fill={tone.text}
        fontSize="5.2"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        textAnchor="middle"
      >
        {label}
      </text>
    </svg>
  );
}
