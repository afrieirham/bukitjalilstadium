import { index, route, type RouteConfig } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("404", "routes/not-found.tsx", { id: "not-found" }),
  route("contribute", "routes/contribute.tsx"),
  route("contributors", "routes/contributors.tsx"),
  route(":slug", "routes/section.tsx"),
  route("*", "routes/not-found.tsx", { id: "not-found-splat" }),
] satisfies RouteConfig;
