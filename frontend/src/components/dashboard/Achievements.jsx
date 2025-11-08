import { useEffect, useState } from "react";
import ApiService from "../../services/api";
import { toast } from "react-hot-toast";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getAchievements();
      // Structure: { title, badge, label, given, received, count, milestone }
      setAchievements(res.achievements || []);
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
      toast.error("Failed to load achievements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const formatCount = (count, label) => `${count} ${label}${count !== 1 ? "s" : ""}`;

  const renderProgressBar = (value, milestone, color) => {
    const widthPercent = milestone ? Math.min((value / milestone) * 100, 100) : 100;
    return (
      <div className="w-full h-4 bg-gray-200 rounded-full">
        <div
          className={`h-4 rounded-full ${color}`}
          style={{ width: `${widthPercent}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
        Achievements
      </h1>
      <p className="text-gray-500">
        Track your contributions, reactions, comments, tagged users, and milestones.
      </p>

      {loading ? (
        <p className="text-gray-500 mt-4">Loading...</p>
      ) : achievements.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {achievements.map((a, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl shadow hover:shadow-md transition bg-gradient-to-r from-indigo-50 to-purple-50"
            >
              {/* Badge */}
              <div className="text-3xl mb-2 text-center">{a.badge || "🏅"}</div>
              
              {/* Title */}
              <p className="text-center font-medium text-gray-700 mb-2">{a.title}</p>

              {/* Given vs Received Stats */}
              {a.given !== undefined && a.received !== undefined ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Given</p>
                    {renderProgressBar(a.given, a.milestone, "bg-indigo-500")}
                    <p className="text-sm text-gray-700 mt-1">
                      {formatCount(a.given, a.label)} {a.milestone ? `(${a.given}/${a.milestone})` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Received</p>
                    {renderProgressBar(a.received, a.milestone, "bg-green-500")}
                    <p className="text-sm text-gray-700 mt-1">
                      {formatCount(a.received, a.label)} {a.milestone ? `(${a.received}/${a.milestone})` : ""}
                    </p>
                  </div>
                </div>
              ) : (
                // Single-count achievements like monthly contributor, top tagged
                <div className="text-center mt-2">
                  {a.count !== undefined && (
                    <>
                      <p className="text-indigo-700 font-bold text-2xl">
                        {formatCount(a.count, a.label)}
                      </p>
                      {a.milestone && renderProgressBar(a.count, a.milestone, "bg-indigo-500")}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No achievements yet.</p>
      )}
    </div>
  );
}
