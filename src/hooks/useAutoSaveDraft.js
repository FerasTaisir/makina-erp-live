import { useEffect, useRef, useState } from "react";

export function useAutoSaveDraft(storageKey, form, setForm, editingId, setEditingId) {
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  const didLoadDraftRef = useRef(false);

  useEffect(() => {
    if (didLoadDraftRef.current) return;

    try {
      const savedDraft = localStorage.getItem(storageKey);

      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);

        if (parsedDraft?.form) {
          setForm((prev) => ({
            ...prev,
            ...parsedDraft.form,
          }));

          if (setEditingId) {
            setEditingId(parsedDraft.editingId || null);
          }

          setAutoSaveStatus("Draft restored");
        }
      }
    } catch (error) {
      console.error("Restore draft error:", error);
    } finally {
      didLoadDraftRef.current = true;
    }
  }, [storageKey, setForm, setEditingId]);

  useEffect(() => {
    if (!didLoadDraftRef.current) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            form,
            editingId: editingId || null,
            savedAt: new Date().toISOString(),
          })
        );

        setAutoSaveStatus("Draft saved");
      } catch (error) {
        console.error("Auto save draft error:", error);
        setAutoSaveStatus("Draft save failed");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [storageKey, form, editingId]);

  useEffect(() => {
    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  function clearDraft() {
    localStorage.removeItem(storageKey);
    setAutoSaveStatus("");
  }

  return {
    autoSaveStatus,
    setAutoSaveStatus,
    clearDraft,
  };
}