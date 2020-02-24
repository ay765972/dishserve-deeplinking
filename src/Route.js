import Loadable from "react-loadable";

const HomeContainer = Loadable({
  loader: () => import("./Home/Components/HomeComponent"),
  loading() {
    return <div>Loading...</div>;
  }
});

export default [
  {
    component: HomeContainer,
    path: "/"
  }
];
