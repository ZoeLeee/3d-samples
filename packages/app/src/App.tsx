import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./App.css";
import "./github.css";
import "./shaders";
import ErrorPage from "./view/ErrorPage";
import Root from "./view/Root";
import { RenderBJS } from "./components/render-bjs";
import SamplesComponent from "./components/samples";
import { RenderTJS } from "./components/render-threejs";
import { LoadingComponent } from "./components/loading";
import { useStores } from "./stores/stores";
import Samples2DComponent from "./components/samples/2d";
import { VisualList } from "./view/2d/VisualList";

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
    path: "/2d",
    element: <Samples2DComponent />,
  },
  {
    path: "/bjs/:id",
    element: <RenderBJS />,
  },
  {
    path: "/tjs/:id",
    element: <RenderTJS />,
  },
  {
    path: "/2d/vis-list",
    element: <VisualList />,
  },
]);

function App() {
  const [loading, title] = useStores((state) => [state.loading, state.title]);

  return (
    <>
      <RouterProvider router={router} />
      {loading && <LoadingComponent title={title} />}
    </>
  );
}

export default App;
