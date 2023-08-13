import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import "./shaders";
import ErrorPage from "./view/ErrorPage";
import Root from "./view/Root";
import { RenderBJS } from "./components/render-bjs";
import SamplesComponent from "./components/samples";
import { RenderTJS } from "./components/render-threejs";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/bjs",
    element: <SamplesComponent />,
  },
  {
    path: "/tjs",
    element: <SamplesComponent />,
  },
  {
    path: "/bjs/:id",
    element: <RenderBJS />,
  },
  {
    path: "/tjs/:id",
    element: <RenderTJS />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
