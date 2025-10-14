import { useEffect, useState } from "react";
import ApiService from "../services/api";

const Shoutouts = ({ user }) => {
  const [shoutouts, setShoutouts] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch all shoutouts on load
  const fetchShoutouts = async () => {
    try {
      const data = await ApiService.getShoutouts();
      setShoutouts(data);
    } catch (error) {
      console.error("Error fetching shoutouts:", error);
    }
  };

  useEffect(() => {
    fetchShoutouts();
  }, []);

  // Create new shoutout
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const shoutout = await ApiService.createShoutout({ message: newMessage });
      setShoutouts([shoutout, ...shoutouts]); // add new shoutout to top
      setNewMessage("");
    } catch (error) {
      console.error("Error creating shoutout:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Shoutouts</h2>

      {/* New Shoutout Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Give someone a shoutout..."
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Post
        </button>
      </form>

      {/* List of Shoutouts */}
      <div className="space-y-4">
        {shoutouts.length === 0 ? (
          <p>No shoutouts yet.</p>
        ) : (
          shoutouts.map((s) => (
            <div key={s.id} className="p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{s.giver_name}</span>
                {/* Display IST time string from backend */}
                <span className="text-gray-400 text-sm">{s.created_at}</span>
              </div>
              <p>{s.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Shoutouts;
