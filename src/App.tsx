import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Home from "../src/pages/Home.tsx";
import About from "../src/pages/About.tsx";

function App() {
  return (
    <div>
      <BrowserRouter>
        {/* <Link className="bg-blue-300" to="/">
          Home
        </Link>{" "}
        |{" "}
        <Link className="bg-blue-300" to="/about">
          About
        </Link> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<h1>Not Found Page</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
