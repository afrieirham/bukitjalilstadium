import { useRef, useState } from "react";

import { Link, useSearchParams } from "react-router";

import { PageContainer } from "~/components/core/app-shell";
import { Button, buttonVariants } from "~/components/core/button";
import { Input } from "~/components/core/input";
import { sections } from "~/components/widget/seat-plan-data";
import { useHydrated } from "~/hooks/use-hydrated";
import { useTurnstile } from "~/hooks/use-turnstile";
import { sectionSlug } from "~/lib/contributions";
import { SITE_NAME, SITE_URL } from "~/lib/site";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  validateFields,
  type SubmissionDraft,
} from "~/lib/submission";
import { cn } from "~/lib/utils";

const sectionIds = sections.map((section) => section.id);

export function meta() {
  const title = `Share a photo | ${SITE_NAME}`;
  const description =
    "Share photos of the view from your seat at Stadium Bukit Jalil (TM Stadium Nasional). Every contribution is reviewed before it appears.";

  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: `${SITE_URL}/contribute` },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: `${SITE_URL}/og.png` },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

type PhotoStatus = "queued" | "uploading" | "uploaded" | "failed";

interface PhotoUpload {
  file: File;
  status: PhotoStatus;
  percent: number;
  key?: string;
  error?: string;
}

export default function Contribute() {
  const [searchParams] = useSearchParams();
  const hydrated = useHydrated();
  const turnstileRef = useRef<HTMLDivElement>(null);
  const { getToken: getTurnstileToken, dispose: disposeTurnstile } =
    useTurnstile(turnstileRef);

  const [chosenSection, setChosenSection] = useState<string | null>(null);
  const prefilled = sectionIds.find(
    (id) => sectionSlug(id) === searchParams.get("section"),
  );
  const section = chosenSection ?? (hydrated ? (prefilled ?? "") : "");

  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [fields, setFields] = useState({
    date: "",
    caption: "",
    row: "",
    seat: "",
    contributorName: "",
    contributorHref: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const accepted = [...fileList].slice(0, MAX_PHOTOS - photos.length);
    setPhotos((current) => [
      ...current,
      ...accepted.map((file) => ({ file, status: "queued" as const, percent: 0 })),
    ]);
  }

  function updatePhoto(index: number, patch: Partial<PhotoUpload>) {
    setPhotos((current) =>
      current.map((photo, position) =>
        position === index ? { ...photo, ...patch } : photo,
      ),
    );
  }

  async function uploadPhoto(index: number, photo: PhotoUpload) {
    const token = await getTurnstileToken();
    const body = new FormData();
    body.set("photo", photo.file);
    body.set("turnstileToken", token);

    const response = await new Promise<{ key?: string; error?: string }>(
      (resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("POST", "/api/photos");

        request.upload.addEventListener("progress", (event) => {
          if (!event.lengthComputable) return;
          updatePhoto(index, {
            status: "uploading",
            percent: Math.round((event.loaded / event.total) * 100),
          });
        });

        request.addEventListener("load", () => {
          try {
            resolve(JSON.parse(request.responseText || "{}"));
          } catch {
            resolve({ error: "The server gave an unexpected answer." });
          }
        });
        request.addEventListener("error", () =>
          reject(new Error("The upload failed. Check your connection.")),
        );

        updatePhoto(index, { status: "uploading" });
        request.send(body);
      },
    );

    if (response.error || !response.key) {
      throw new Error(response.error ?? "That photo could not be uploaded.");
    }

    updatePhoto(index, { status: "uploaded", percent: 100, key: response.key });
    return response.key;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setErrors({});

    const draft: SubmissionDraft = {
      section,
      photos: photos.map((photo) => photo.key ?? ""),
      ...fields,
    };

    // The keys do not exist until the photos upload, so the browser checks the
    // typed fields and the photo count, and the endpoint checks the keys.
    const local = validateFields(draft, sectionIds);
    if (photos.length === 0) local.photos = "Add at least one photo.";
    else if (photos.length > MAX_PHOTOS) local.photos = `Add at most ${MAX_PHOTOS} photos.`;

    if (Object.keys(local).length > 0) {
      setErrors(local);
      return;
    }

    setSending(true);

    try {
      const keys: string[] = [];
      for (const [index, photo] of photos.entries()) {
        if (photo.key) {
          keys.push(photo.key);
          continue;
        }

        try {
          keys.push(await uploadPhoto(index, photo));
        } catch (error) {
          updatePhoto(index, {
            status: "failed",
            error: error instanceof Error ? error.message : "Upload failed.",
          });
          throw new Error("One of your photos could not be uploaded.", {
            cause: error,
          });
        }
      }

      const response = await fetch("/api/contribute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...fields,
          section,
          photos: keys,
          turnstileToken: await getTurnstileToken(),
        }),
      });

      const result = (await response.json()) as {
        prUrl?: string;
        errors?: Record<string, string>;
        error?: string;
      };

      if (!response.ok) {
        setErrors(result.errors ?? { form: result.error ?? "Something went wrong." });
        return;
      }

      // Retire the widget before its container is replaced by the thank-you
      // view, or Turnstile is left holding a widget whose DOM has gone.
      disposeTurnstile();
      setSubmitted(true);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <PageContainer className="flex max-w-2xl flex-col items-start gap-4 py-16">
        <h1 className="text-2xl font-semibold">Thank you</h1>
        <p className="text-muted-foreground">
          Your contribution is pending review. Once it is approved it appears on
          the Section page and in the contributors list.
        </p>
        <Link to={section ? `/${sectionSlug(section)}` : "/"} className={cn(buttonVariants())}>
          Back to {section ? `Section ${section}` : "the seat map"}
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Share a photo</h1>
        <p className="text-muted-foreground">
          Photos help the next person choose a seat. Every contribution is
          reviewed before it appears, and there is no account to create.
        </p>
      </header>

      <form onSubmit={submit} className="flex flex-col gap-6">
        <Field label="Section" error={errors.section} htmlFor="section">
          <select
            id="section"
            name="section"
            value={section}
            onChange={(event) => setChosenSection(event.target.value)}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:ring-3"
          >
            <option value="">Choose a Section</option>
            {sectionIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={`Photos (up to ${MAX_PHOTOS}, ${MAX_PHOTO_BYTES / 1024 / 1024} MB each)`}
          error={errors.photos}
          htmlFor="photos"
        >
          <input
            id="photos"
            type="file"
            accept="image/jpeg,image/png"
            multiple
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
            className="text-sm"
          />
          {photos.length > 0 && (
            <ul className="mt-2 flex flex-col gap-2">
              {photos.map((photo, index) => (
                <li
                  key={`${photo.file.name}-${index}`}
                  className="border-border flex flex-col gap-1 rounded-md border p-2 text-sm"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate">{photo.file.name}</span>
                    <span className="text-muted-foreground shrink-0">
                      {photo.status === "uploaded" && "Uploaded"}
                      {photo.status === "uploading" && `${photo.percent}%`}
                      {photo.status === "queued" && "Ready"}
                      {photo.status === "failed" && "Failed"}
                    </span>
                  </span>
                  {(photo.status === "uploading" || photo.status === "uploaded") && (
                    <span className="bg-muted h-1 w-full overflow-hidden rounded-full">
                      <span
                        className="bg-primary block h-full transition-[width]"
                        style={{ width: `${photo.percent}%` }}
                      />
                    </span>
                  )}
                  {photo.error && (
                    <span className="text-destructive">{photo.error}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date (optional)" error={errors.date} htmlFor="date">
            <Input
              id="date"
              type="date"
              value={fields.date}
              onChange={(event) => setFields({ ...fields, date: event.target.value })}
            />
          </Field>
          <Field label="Row (optional)" error={undefined} htmlFor="row">
            <Input
              id="row"
              value={fields.row}
              onChange={(event) => setFields({ ...fields, row: event.target.value })}
            />
          </Field>
          <Field label="Seat number (optional)" error={undefined} htmlFor="seat">
            <Input
              id="seat"
              value={fields.seat}
              onChange={(event) => setFields({ ...fields, seat: event.target.value })}
            />
          </Field>
          <Field label="Your name (optional)" error={errors.contributorName} htmlFor="name">
            <Input
              id="name"
              value={fields.contributorName}
              onChange={(event) =>
                setFields({ ...fields, contributorName: event.target.value })
              }
              placeholder="Social handle or name"
            />
          </Field>
        </div>

        <Field label="Your link (optional)" error={errors.contributorHref} htmlFor="href">
          <Input
            id="href"
            type="url"
            value={fields.contributorHref}
            onChange={(event) =>
              setFields({ ...fields, contributorHref: event.target.value })
            }
            placeholder="https://"
          />
        </Field>

        <Field label="A note about the view (optional)" error={errors.caption} htmlFor="caption">
          <textarea
            id="caption"
            rows={3}
            value={fields.caption}
            onChange={(event) => setFields({ ...fields, caption: event.target.value })}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-xs outline-none focus-visible:ring-3"
          />
        </Field>

        <div ref={turnstileRef} />

        {errors.form && (
          <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border p-3 text-sm">
            {errors.form}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Submit for review"}
          </Button>
          <span className="text-muted-foreground text-sm">
            Photos are checked, stripped of location data, and reviewed by hand.
          </span>
        </div>
      </form>
    </PageContainer>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
