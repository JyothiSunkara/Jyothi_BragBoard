import DashboardContent from "./DashboardContent";
import ShoutOutFeed from "./ShoutOutFeed";
import ShoutOutForm from "./ShoutOutForm";
import MyShoutOuts from "./MyShoutOuts";

const MainContent = ({ activeView, user, shoutouts, handleDeleteShout }) => {
  switch (activeView) {
    case "dashboard":
      return <DashboardContent currentUser={user} />;
    case "feed":
      return (
        <ShoutOutFeed
          currentUser={user}
          shoutouts={shoutouts}
          handleDeleteShout={handleDeleteShout}
        />
      );
    case "create":
      return <ShoutOutForm currentUser={user} />;
    case "my-shoutouts":
      return (
        <MyShoutOuts
          currentUser={user}
          shoutouts={shoutouts}
          handleDeleteShout={handleDeleteShout}
        />
      );
    default:
      return <div className="text-gray-500">Coming soon...</div>;
  }
};

export default MainContent;
