import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

type RedemptionStatus = "issued" | "redeemed";

type IssuedRewardRecord = {
  id: string;
  businessId: string;
  feedbackId: string;
  code: string;
  status: RedemptionStatus;
  issuedAt?: { seconds: number };
  redeemedAt?: { seconds: number } | null;
};

type RedemptionsPageProps = {
  businessId: string | null;
};

const formatTimestamp = (ts?: { seconds: number } | null) => {
  if (!ts?.seconds) return "—";
  return new Date(ts.seconds * 1000).toLocaleString();
};

const RedemptionsPage = ({ businessId }: RedemptionsPageProps) => {
  const [records, setRecords] = useState<IssuedRewardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "issued" | "redeemed">("all");

  useEffect(() => {
    const loadRecords = async () => {
      if (!businessId) {
        setRecords([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const q = query(collection(db, "issuedRewards"), where("businessId", "==", businessId));
        const snap = await getDocs(q);

        const rows = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<IssuedRewardRecord, "id">),
        }));

        rows.sort((a, b) => (b.issuedAt?.seconds ?? 0) - (a.issuedAt?.seconds ?? 0));
        setRecords(rows);
      } catch (error) {
        console.error("Failed to load redemptions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
  }, [businessId]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch = record.code.toLowerCase().includes(searchText.toLowerCase().trim());
      const matchesStatus = statusFilter === "all" ? true : record.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, searchText, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Reward Redemptions</h2>
        <span className="text-sm text-gray-500">{filteredRecords.length} record(s)</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by code"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "issued" | "redeemed")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="issued">Not redeemed</option>
          <option value="redeemed">Redeemed</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Issued</th>
              <th className="px-4 py-3 font-medium">Redeemed</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredRecords.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No rewards found for the selected filters.
                </td>
              </tr>
            )}

            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Loading reward redemptions...
                </td>
              </tr>
            )}

            {!loading &&
              filteredRecords.map((record) => (
                <tr key={record.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-semibold tracking-wide text-gray-900">{record.code}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        record.status === "redeemed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {record.status === "redeemed" ? "Redeemed" : "Not redeemed"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatTimestamp(record.issuedAt)}</td>
                  <td className="px-4 py-3 text-gray-700">{formatTimestamp(record.redeemedAt ?? null)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RedemptionsPage;
