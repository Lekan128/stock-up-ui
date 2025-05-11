import { Link } from "react-router";

const NotFound = () => {
  return (
    <div>
      <h3>{"Ha ha, you thought you will get me?"}</h3>
      <h2>{"404 not found ;)"}</h2>

      <Link to="/">Home</Link>
    </div>
  );
};

export default NotFound;
