import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { api } from "@/lib/api";

function useSearchParam(key) {
  const search = typeof window !== "undefined" ? window.location.search : "";
  return new URLSearchParams(search).get(key);
}

export default function InvitePage() {
  const [, navigate] = useLocation();
  const token        = useSearchParam("token");

  const [preview, setPreview] = useState(null);
  const [status,  setStatus]  = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No invite token in URL.");
      return;
    }
    api.get(`/invites/preview?token=${token}`)
      .then(data => {
        if (data.status === "accepted") {
          setStatus("already");
          setPreview(data);
        } else {
          setPreview(data);
          setStatus("ready");
        }
      })
      .catch(err => {
        setStatus("error");
        setMessage(err.message || "Invalid or expired link.");
      });
  }, [token]);

  async function handleAccept() {
    const userToken = localStorage.getItem("token");
    if (!userToken) {
      navigate(`/login?redirect=/invite?token=${token}`);
      return;
    }
    setStatus("accepting");
    try {
      const res = await api.post("/invites/accept", { token });
      setStatus("success");
      setTimeout(() => navigate(`/board?project=${res.projectId}`), 2000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to accept invite.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E6EF] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] w-full max-w-sm p-8 text-center">

        <div className="h-14 w-14 bg-[#5243F0] rounded-2xl grid place-items-center mx-auto mb-5 text-2xl">
          📋
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-8 w-8 rounded-full border-2 border-[#5243F0]/20 border-t-[#5243F0] animate-spin" />
            <p className="text-sm text-[#8E92A4]">Loading invite…</p>
          </div>
        )}

        {/* Ready to accept */}
        {status === "ready" && preview && (
          <>
            <h1 className="text-xl font-bold text-[#1B1C22] mb-2">You're invited! 🎉</h1>
            <p className="text-[#8E92A4] text-sm mb-4">
              <strong className="text-[#1B1C22]">
                {preview.invitedBy?.name || preview.invitedBy?.email}
              </strong>{" "}
              invited you to join
            </p>
            <div className="bg-[#F4F5F7] border border-[#E4E6EF] rounded-xl px-4 py-3 mb-5">
              <p className="font-bold text-[#5243F0] text-base">{preview.project?.name}</p>
              {preview.project?.description && (
                <p className="text-xs text-[#8E92A4] mt-1">{preview.project.description}</p>
              )}
            </div>
            <button
              onClick={handleAccept}
              className="w-full py-3 bg-[#5243F0] hover:bg-[#4537D6] text-white font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(82,67,240,0.3)] active:scale-95"
            >
              Accept & Join Project
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full mt-2 py-2 text-sm text-[#8E92A4] hover:text-[#1B1C22] transition-colors"
            >
              Decline
            </button>
          </>
        )}

        {/* Already a member */}
        {status === "already" && (
          <>
            <h2 className="font-bold text-[#1B1C22] text-lg mb-2">Already a member ✅</h2>
            <p className="text-sm text-[#8E92A4] mb-4">
              You already accepted this invite to{" "}
              <strong>{preview?.project?.name}</strong>.
            </p>
            <button
              onClick={() => navigate(`/board?project=${preview?.project?._id}`)}
              className="w-full py-3 bg-[#5243F0] text-white font-bold rounded-xl transition-all"
            >
              Go to Project →
            </button>
          </>
        )}

        {/* Accepting spinner */}
        {status === "accepting" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="h-8 w-8 rounded-full border-2 border-[#5243F0]/20 border-t-[#5243F0] animate-spin" />
            <p className="text-sm text-[#8E92A4]">Joining project…</p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="h-14 w-14 bg-green-50 border border-green-200 rounded-full grid place-items-center mx-auto mb-4 text-3xl">
              ✅
            </div>
            <h2 className="font-bold text-[#1B1C22] text-lg">You're in!</h2>
            <p className="text-sm text-[#8E92A4] mt-1">Redirecting to your board…</p>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="text-4xl mb-3">❌</div>
            <h2 className="font-bold text-[#1B1C22] text-lg mb-1">Link Invalid</h2>
            <p className="text-sm text-[#8E92A4] mb-4">{message}</p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2 bg-[#5243F0] text-white rounded-xl text-sm font-semibold"
            >
              Go Home
            </button>
          </>
        )}

      </div>
    </div>
  );
}
