import { useEffect, useState } from "react";
import ApiService from "../services/api";

// -------------------- MainContent --------------------
const MainContent = ({ activeView, selectedDepartment, user }) => {
  const renderContent = () => {
    switch (activeView) {
      case "feed":
        return <ShoutOutFeed selectedDepartment={selectedDepartment} user={user} />;
      case "create":
        return <CreateShoutOut user={user} />;
      case "my-shoutouts":
        return <MyShoutOuts user={user} />;
      case "analytics":
        return <Analytics user={user} />;
      default:
        return <ShoutOutFeed selectedDepartment={selectedDepartment} user={user} />;
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">{renderContent()}</div>
    </main>
  );
};

// -------------------- ShoutOut Feed --------------------
const ShoutOutFeed = ({ selectedDepartment, user }) => {
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShoutouts = async () => {
      setLoading(true);
      try {
        const data = await ApiService.getShoutouts(selectedDepartment || "all");
        setShoutouts(data);
      } catch (err) {
        console.error("Error fetching shoutouts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchShoutouts();
  }, [selectedDepartment]);

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Shout-Out Feed
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedDepartment === "all"
                ? "Showing shout-outs from all departments"
                : `Showing shout-outs from ${selectedDepartment} department`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
              🎉 {shoutouts.length} Shout-Outs
            </span>
          </div>
        </div>
      </div>

      {/* Shoutouts List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : shoutouts.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 border border-white/20 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Shout-Outs Yet</h3>
          <p className="text-gray-600 mb-6">
            Be the first to spread some positivity! Create a shout-out to appreciate your colleagues.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shoutouts.map((s) => (
            <div key={s.id} className="p-4 border rounded-lg shadow-sm bg-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{s.giver_name}</span>
                <span className="text-gray-400 text-sm">{s.created_at}</span>
              </div>
              <p>{s.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// -------------------- Create ShoutOut --------------------
const CreateShoutOut = ({ user }) => {
  const [message, setMessage] = useState("");
  const [shoutouts, setShoutouts] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const shoutout = await ApiService.createShoutout({ message });
      setShoutouts([shoutout, ...shoutouts]);
      setMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Create Shout-Out</h2>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          placeholder="Give someone a shoutout..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Post
        </button>
      </form>
    </div>
  );
};

// -------------------- My Shoutouts --------------------
const MyShoutOuts = ({ user }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">My Shout-Outs</h2>
      <p>Coming Soon! This will show your given and received shout-outs.</p>
    </div>
  );
};

// -------------------- Analytics --------------------
const Analytics = ({ user }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Analytics</h2>
      <p>Coming Soon!</p>
    </div>
  );
};

export default MainContent;
