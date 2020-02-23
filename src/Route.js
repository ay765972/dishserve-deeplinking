import * as routePath from "./Utils/RouteUrl";
import Loadable from "react-loadable";
import MppContainer from "./Mpp/Containers/MppContainer";
import StaticPageWrapper from "./StaticPage/StaticPageWrapper";
import MyAccountWrapperContainer from "./MyAccount/Containers/MyAccountWrapperContainer";
import DesignerContainer from "./Home/Containers/DesignerContainer";

const HomeContainer = Loadable({
  loader: () => import("./Home/Containers/HomeContainer"),
  loading() {
    return <div>Loading...</div>;
  }
});
const SppContainers = Loadable({
  loader: () => import("./Spp/Containers/SppContainers"),
  loading() {
    return <div>Loading...</div>;
  }
});

const CartContainer = Loadable({
  loader: () => import("./Cart/Containers/CartContainer"),
  loading() {
    return <div>Loading...</div>;
  }
});
const CheckoutContainer = Loadable({
  loader: () => import("./CheckOut/Containers/CheckoutContainer"),
  loading() {
    return <div>Loading...</div>;
  }
});
const MyItemsWrapperContainer = Loadable({
  loader: () => import("./MyItems/Containers/MyItemsWrapperContainer"),
  loading() {
    return <div>Loading...</div>;
  }
});
const LandingMppOrStaticPageContainer = Loadable({
  loader: () => import("./Home/Containers/LandingMppOrStaticPageContainer"),
  loading() {
    return <div>Loading...</div>;
  }
});
export default [
  {
    component: HomeContainer,
    path: routePath.HOME_ROUTE,
    exact: true
  },
  {
    component: HomeContainer,
    path: routePath.HOME_ARABIC_ROUTE,
    exact: true
  },
  {
    component: SppContainers,
    path: routePath.SPP_ROUTE,
    exact: true
  },
  {
    component: SppContainers,
    path: routePath.SPP_PRODUCT_ID_ROUTE,
    exact: true
  },
  {
    component: DesignerContainer,
    path: routePath.DESIGNER_PATH
  },
  {
    component: CartContainer,
    path: routePath.CART_PATH,
    exact: true
  },
  {
    component: CheckoutContainer,
    path: routePath.CHECKOUT_PATH,
    exact: true
  },
  {
    component: MyAccountWrapperContainer,
    path: routePath.MY_ACCOUNTS_PATH
  },
  {
    component: MyItemsWrapperContainer,
    path: routePath.MY_ITEMS
  },
  {
    component: LandingMppOrStaticPageContainer,
    path: routePath.LANDING_BANNER_REGEX
  },
  {
    component: StaticPageWrapper,
    path: routePath.STATIC_PAGE_REGEX
  },
  {
    component: MppContainer,
    path: "*"
  }
];
