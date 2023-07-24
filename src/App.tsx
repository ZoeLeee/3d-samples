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
    children: [
      {
        path: "contacts/:contactId",
        element: <Contact />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
