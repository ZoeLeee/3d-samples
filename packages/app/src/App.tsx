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
  const [loading, title] = useStores((state) => [state.loading, state.title]);

  return (
    <>
      <RouterProvider router={router} />
      {loading && <LoadingComponent title={title} />}
      {/* <GithubOutlined />; */}
      <a
        className="github-fork-ribbon"
        href="https://github.com/ZoeLeee/3d-samples"
        target="_blank"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub"
      >
        Fork me on GitHub
      </a>
    </>
  );
}

export default App;
