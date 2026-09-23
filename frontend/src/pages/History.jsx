import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { History as HistoryIcon, MessageCirclePlus } from "lucide-react";
import Header from "../components/layout/Header";
import SearchBar from "../components/history/SearchBar";
import FilterDropdown from "../components/history/FilterDropdown";
import HistoryCard from "../components/history/HistoryCard";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/ui/Button";
import { useConversations } from "../hooks/useConversations";

export default function History() {
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return conversations
      .filter((c) => (filter === "all" ? true : c.status === filter))
      .filter((c) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return c.vehicle.toLowerCase().includes(q) || c.issue.toLowerCase().includes(q);
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [conversations, query, filter]);

  return (
    <>
      <Header title="Conversation History" subtitle={`${conversations.length} total diagnoses`} />

      <main className="px-4 sm:px-6 py-6 max-w-3xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <SearchBar value={query} onChange={setQuery} placeholder="Search diagnoses..." />
          <FilterDropdown value={filter} onChange={setFilter} />
        </div>

        {conversations.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No diagnoses yet"
            description="Start your first vehicle diagnosis."
            action={
              <Button icon={MessageCirclePlus} onClick={() => navigate("/chat")}>
                Start Diagnosis
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="No matching conversations"
            description="Try a different search term or filter."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((conv) => (
              <HistoryCard key={conv.id} conversation={conv} onClick={() => navigate(`/chat?id=${conv.id}`)} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
