import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { OverviewPage } from "@/pages/overview-page"
import { SpotDetailPage } from "@/pages/spot-detail-page"

const router = createBrowserRouter([
  {
    path: "/",
    element: <OverviewPage />,
  },
  {
    path: "/spot/:slug",
    element: <SpotDetailPage />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
