import DashboardContent from "./DashboardContent";
import ShoutoutFeed from "./ShoutOutFeed"; // we'll create this
import CreateShoutout from "./ShoutOutForm"; // we'll create this too

const MainContent = ({ activeView, user }) => {
  switch (activeView) {
    case "dashboard":
      return <DashboardContent currentUser={user} />;

    case "feed":
      return <ShoutoutFeed currentUser={user} />;

    case "create":
      return <CreateShoutout currentUser={user} />;

    default:
      return <div className="text-gray-500">Coming soon...</div>;
  }
};

export default MainContent;
