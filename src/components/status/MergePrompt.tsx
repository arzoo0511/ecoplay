import { useAuth } from "../../context/AuthContext";

export default function MergePrompt() {
  const { showMergePrompt, confirmMerge, skipMerge } = useAuth();

  if (!showMergePrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900">
          You have local progress
        </h2>
        <p className="mt-3 text-sm text-gray-700">
          Would you like to import your guest progress into your account? Your
          highest score will be kept.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={confirmMerge}
            className="flex-1 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 px-4 py-3 font-bold text-white transition-all hover:from-green-600 hover:via-emerald-600 hover:to-blue-600"
          >
            Import Progress
          </button>
          <button
            onClick={skipMerge}
            className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-800 transition-all hover:bg-gray-50"
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
