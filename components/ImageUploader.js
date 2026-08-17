"use client";

// Uploads straight from the browser to Cloudinary using an unsigned
// upload preset — this never passes through our own API routes, which
// matters because Vercel serverless functions cap request bodies at
// 4.5MB. Same reasoning as the presigned-URL approach for CRC Core's
// video uploads, just simpler since Cloudinary handles unsigned uploads
// natively without us needing to generate a presigned URL ourselves.

import { useState, useRef } from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function ImageUploader({ value, onChange, multiple = false, label }) {
  // Single mode: value is a string URL (or empty). Multiple mode: value is an array of URLs.
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const images = multiple ? value || [] : value ? [value] : [];

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error?.message || "Upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  }

  async function handleFiles(fileList) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      setError(
        "Cloudinary isn't set up yet — add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to .env.local (see README)."
      );
      return;
    }

    setError("");
    setUploading(true);

    try {
      const files = Array.from(fileList);
      const urls = await Promise.all(files.map(uploadFile));

      if (multiple) {
        onChange([...(value || []), ...urls]);
      } else {
        onChange(urls[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(url) {
    if (multiple) {
      onChange((value || []).filter((u) => u !== url));
    } else {
      onChange("");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-xs text-[#666]">{label}</label>}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed px-4 py-6 text-center text-sm cursor-pointer transition-colors ${
          dragOver ? "border-[#1a1a1a] bg-[#f0f0ee]" : "border-[#d5d5d0] bg-white"
        }`}
      >
        {uploading ? "Uploading…" : "Drag & drop images, or click to browse"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="text-xs text-[#b3261e]">{error}</p>}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative w-16 h-16">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#1a1a1a] text-white text-[10px] leading-none rounded-full flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
