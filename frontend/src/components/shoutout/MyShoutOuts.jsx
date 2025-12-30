import { useState, useEffect } from "react";
import ApiService from "../../services/api";
import ShoutOutFeed from "./ShoutOutFeed";

export default function MyShoutOuts({ currentUser }) {
  const [myShoutouts, setMyShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyShoutouts = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getShoutouts();

      const mine = res.filter(
        (s) =>
          !s.is_deleted &&
          (s.giver_id === currentUser.id || s.receiver_id === currentUser.id)
      );

      setMyShoutouts(
        mine.sort((a, b) => {
          const aTime = new Date(a.edited_at || a.created_at);
          const bTime = new Date(b.edited_at || b.created_at);
          return bTime - aTime;
        })
      );
    } catch (err) {
      console.error("Failed to fetch my shoutouts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyShoutouts();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-6 text-gray-500">
        Loading my shoutouts...
      </div>
    );
  }

  return (
    <ShoutOutFeed
      currentUser={currentUser}
      overrideShoutouts={myShoutouts}
      title="My Shoutouts"
      subtitle="Shoutouts you’ve shared and received 💜"
      showStats
      hideSenderFilter={true}
    />
  );
}
