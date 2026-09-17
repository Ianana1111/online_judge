"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "@/components/icons";
import { apiFetch, ApiError } from "@/lib/api";
import { useLocale } from "@/lib/i18n/LocaleContext";
import { useAuthStore } from "@/store/auth";
import { useFocusTrap } from "@/lib/useFocusTrap";

type Props = { id: string; title: string; author: string; disabled?: boolean; returnToList?: boolean };

export default function AdminDeletePostButton(props: Props) {
  const zh = useLocale().locale === "zh-TW";
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  if (user?.role !== "ADMIN") return null;
  return <>
    <button type="button" disabled={props.disabled} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-verdict-wa transition-colors hover:bg-verdict-wa/10 disabled:opacity-50" onClick={(event) => {
      // Safari does not focus buttons on pointer activation; establish a reliable return target.
      event.currentTarget.focus(); setOpen(true);
    }}>
      <span aria-hidden="true"><TrashIcon /></span>{zh ? "刪除文章" : "Delete post"}
    </button>
    {open && <DeletePostDialog {...props} close={() => setOpen(false)} />}
  </>;
}

function DeletePostDialog({ id, title, author, returnToList, close }: Props & { close: () => void }) {
  const zh = useLocale().locale === "zh-TW", router = useRouter(), qc = useQueryClient();
  const titleId = useId(), descriptionId = useId(), inFlight = useRef(false);
  const dialog = useFocusTrap<HTMLDialogElement>(true);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, [dialog]);

  async function remove() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true); setError("");
    try {
      await apiFetch(`/posts/${id}`, { method: "DELETE" });
    } catch (cause) {
      setError(cause instanceof ApiError && [401, 403].includes(cause.status)
        ? (zh ? "目前帳號沒有刪除權限，請確認管理員登入狀態後再試。" : "Check that you are signed in as an administrator, then retry.")
        : cause instanceof ApiError && cause.status === 404
          ? (zh ? "找不到這篇文章，請關閉視窗並重新整理。" : "This post was not found. Close this dialog and refresh.")
          : (zh ? "刪除失敗，請稍後重試。" : "Deletion failed. Please try again."));
      inFlight.current = false; setBusy(false); return;
    }
    // Cancel old reads before clearing the article, so an in-flight response cannot restore it.
    await qc.cancelQueries({ queryKey: ["posts"] });
    qc.setQueryData(["posts", "detail", id], null);
    void qc.invalidateQueries({ queryKey: ["posts"] });
    void qc.invalidateQueries({ queryKey: ["moderation"] });
    void qc.invalidateQueries({ queryKey: ["discussions"] });
    if (returnToList) router.replace("/discussion");
    router.refresh();
    close();
  }

  return createPortal(<dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); if (!inFlight.current) close(); }}
    className="oj-card fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto p-6 text-ink-100 shadow-2xl backdrop:bg-black/60 sm:p-8">
    <div aria-hidden="true" className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-verdict-wa/10 text-verdict-wa"><TrashIcon className="h-5 w-5" /></div>
    <h2 id={titleId} className="text-xl font-semibold">{zh ? "確定刪除這篇文章？" : "Delete this post?"}</h2>
    <div className="my-5 rounded-xl border border-ink-700 bg-ink-800 p-4">
      <p className="[overflow-wrap:anywhere] font-semibold leading-6">{title}</p>
      <p className="mt-2 [overflow-wrap:anywhere] text-sm text-ink-400">{zh ? "作者：" : "Author: "}{author}</p>
    </div>
    <p id={descriptionId} className="text-sm leading-6 text-ink-300">{zh
      ? "整篇文章將立即下架，包含已公開的版本與待審核的修改，文章下的留言也將無法瀏覽。此操作無法在網站上復原，系統會保留刪除紀錄。"
      : "The entire post will be removed, including its published version and pending edits. Its comments will no longer be accessible. This cannot be undone on the site; a removal record will be retained."}</p>
    {error && <p role="alert" className="mt-4 text-sm leading-6 text-verdict-wa">{error}</p>}
    <div className="mt-6 flex flex-wrap justify-end gap-3">
      <button autoFocus type="button" className="oj-btn-secondary min-h-11" disabled={busy} onClick={close}>{zh ? "取消" : "Cancel"}</button>
      <button type="button" className="min-h-11 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:opacity-60" disabled={busy} onClick={remove}>{busy ? (zh ? "刪除中…" : "Deleting…") : (zh ? "確認刪除文章" : "Confirm deletion")}</button>
    </div>
  </dialog>, document.body);
}
