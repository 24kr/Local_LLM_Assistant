from __future__ import annotations

import json
import mimetypes
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from fastapi import UploadFile


class AttachmentStore:
    def __init__(
        self,
        attachments_dir: Path,
        metadata_path: Path,
        allowed_extensions: List[str],
        max_file_size_mb: int,
    ):
        self.attachments_dir = attachments_dir
        self.metadata_path = metadata_path
        self.allowed_extensions = {ext.lower() for ext in allowed_extensions}
        self.max_file_size_bytes = max_file_size_mb * 1024 * 1024

        self.attachments_dir.mkdir(parents=True, exist_ok=True)
        self.metadata_path.parent.mkdir(parents=True, exist_ok=True)

        if not self.metadata_path.exists():
            self._save([])

    def _load(self) -> List[Dict]:
        try:
            with open(self.metadata_path, "r", encoding="utf-8") as file:
                return json.load(file)
        except (json.JSONDecodeError, FileNotFoundError):
            return []

    def _save(self, data: List[Dict]) -> None:
        with open(self.metadata_path, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2)

    def resolve_record_path(self, record: Dict) -> Path:
        """Resolve record path robustly for both old relative and new absolute metadata."""
        raw_path = record.get("path", "")
        candidate = Path(raw_path) if raw_path else Path()

        if candidate and candidate.exists():
            return candidate

        stored_filename = record.get("stored_filename")
        if stored_filename:
            fallback = self.attachments_dir / stored_filename
            if fallback.exists():
                return fallback

        if candidate and candidate.name:
            by_name = self.attachments_dir / candidate.name
            if by_name.exists():
                return by_name

        return self.attachments_dir / (stored_filename or candidate.name)

    def is_supported(self, filename: str) -> bool:
        return Path(filename).suffix.lower() in self.allowed_extensions

    def _get_file_type(self, extension: str) -> str:
        image_exts = {".png", ".jpg", ".jpeg", ".svg", ".ico", ".gif", ".tif", ".tiff", ".webp", ".bmp"}
        if extension in image_exts:
            return "image"
        if extension in {".txt", ".pdf", ".docx", ".doc", ".xlsx", ".xls", ".csv", ".md"}:
            return "document"
        if extension in {
            ".html", ".css", ".js", ".jsx", ".json", ".cpp", ".py", ".ts", ".tsx",
            ".env", ".bat", ".sh", ".php", ".cs", ".rb", ".java", ".go", ".rs",
            ".yaml", ".yml", ".xml", ".sql", ".c", ".h"
        }:
            return "code"
        return "file"

    async def save_uploads(
        self,
        files: List[UploadFile],
        chat_id: Optional[str] = None,
        message_id: Optional[str] = None,
    ) -> Tuple[List[Dict], List[str]]:
        records = self._load()
        saved_records: List[Dict] = []
        unsupported_files: List[str] = []

        for upload in files:
            filename = Path(upload.filename or "attachment").name
            extension = Path(filename).suffix.lower()

            if extension not in self.allowed_extensions:
                unsupported_files.append(filename)
                continue

            attachment_id = uuid.uuid4().hex
            stored_filename = f"{attachment_id}{extension}"
            target_path = self.attachments_dir / stored_filename

            total_size = 0
            with open(target_path, "wb") as buffer:
                while chunk := await upload.read(8192):
                    total_size += len(chunk)
                    if total_size > self.max_file_size_bytes:
                        buffer.close()
                        target_path.unlink(missing_ok=True)
                        raise ValueError(
                            f"Attachment '{filename}' exceeds the {self.max_file_size_bytes // (1024 * 1024)}MB limit"
                        )
                    buffer.write(chunk)

            mime_type = upload.content_type or mimetypes.guess_type(filename)[0] or "application/octet-stream"
            record = {
                "id": attachment_id,
                "chat_id": chat_id,
                "message_id": message_id,
                "filename": filename,
                "stored_filename": stored_filename,
                "path": str(target_path.resolve()),
                "mime_type": mime_type,
                "size": total_size,
                "extension": extension,
                "file_type": self._get_file_type(extension),
                "upload_date": datetime.now().isoformat(),
            }
            records.append(record)
            saved_records.append(record)

        self._save(records)
        return saved_records, unsupported_files

    def list_attachments(self) -> List[Dict]:
        records = self._load()
        normalized_records = []

        for record in records:
            normalized = dict(record)
            normalized["path"] = str(self.resolve_record_path(record))
            normalized_records.append(normalized)

        return sorted(normalized_records, key=lambda item: item.get("upload_date", ""), reverse=True)

    def get_attachment(self, attachment_id: str) -> Optional[Dict]:
        for record in self._load():
            if record.get("id") == attachment_id:
                normalized = dict(record)
                normalized["path"] = str(self.resolve_record_path(record))
                return normalized
        return None

    def get_attachments_by_ids(self, attachment_ids: List[str]) -> List[Dict]:
        """Bulk-resolve attachments by IDs with a single metadata load."""
        if not attachment_ids:
            return []

        records = self._load()
        id_set = set(attachment_ids)
        index = {record.get("id"): record for record in records if record.get("id") in id_set}

        resolved: List[Dict] = []
        for attachment_id in attachment_ids:
            record = index.get(attachment_id)
            if not record:
                continue

            normalized = dict(record)
            normalized["path"] = str(self.resolve_record_path(record))
            resolved.append(normalized)

        return resolved

    def delete_attachment(self, attachment_id: str) -> Optional[Dict]:
        records = self._load()
        remaining = []
        deleted_record = None

        for record in records:
            if record.get("id") == attachment_id:
                deleted_record = record
                continue
            remaining.append(record)

        if not deleted_record:
            return None

        target_path = self.resolve_record_path(deleted_record)
        if target_path.exists():
            target_path.unlink(missing_ok=True)

        self._save(remaining)
        return deleted_record