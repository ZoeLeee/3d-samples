import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import "./shaders";
import ErrorPage from "./view/ErrorPage";
import Root from "./view/Root";
import Contact from "./view/Test";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bjs",
    element: <div>bjs列表</div>,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
