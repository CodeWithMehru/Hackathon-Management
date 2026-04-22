"use client";

import { useState } from "react";
import { Mail, X } from "lucide-react";

export function BroadcastMessageButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setStatusMsg("Subject and message are required.");
      return;
    }

    setIsSending(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/admin/send-broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data || "error" in data) {
        setStatusMsg(data?.error ?? "Failed to send broadcast.");
      } else {
        setStatusMsg(`Successfully sent broadcast to ${data.count} attendees.`);
        setTimeout(() => {
          setIsOpen(false);
          setSubject("");
          setMessage("");
          setStatusMsg(null);
        }, 3000);
      }
    } catch (err) {
      setStatusMsg("An unexpected error occurred.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#194685] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#15386b]"
      >
        <Mail className="h-4 w-4" />
        Broadcast Message
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
              <h2 className="text-lg font-bold text-zinc-900">Broadcast Email</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSend} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-zinc-700">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Welcome to AI Buildathon @ GDC Anantnag"
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-[#194685] focus:ring-2 focus:ring-[#194685]/20"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-zinc-700">
                    Message Body
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here. Include any important links..."
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-[#194685] focus:ring-2 focus:ring-[#194685]/20"
                  />
                </div>

                {statusMsg && (
                  <div
                    className={`rounded-md p-3 text-sm ${
                      statusMsg.includes("Successfully")
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {statusMsg}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="inline-flex items-center rounded-lg bg-[#194685] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#15386b] disabled:opacity-60"
                >
                  {isSending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
