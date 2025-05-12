import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error("路由组件加载失败:", error);
  }
  render() {
    return this.state.hasError 
      ? <div>页面加载失败，请刷新或检查网络</div>
      : this.props.children;
  }
}

// 使用React.lazy进行组件懒加载
const Login = React.lazy(() => import("../pages/Login"));
const Home = React.lazy(() => import("../pages/Home"));
const Order = React.lazy(() => import("../pages/Order"));
const UserManager = React.lazy(() => import("../pages/userManager"));
const LayoutComponent = React.lazy(() => import("../pages/Layout"));
const ActivityManager = React.lazy(() => import("../pages/Activity/activityManager"));
const ActivityController = React.lazy(() => import("../pages/Activity/activityController"));
const CouponAdd = React.lazy(() => import("../pages/coupon/couponAdd"));
const Merchant = React.lazy(() => import("../pages/Merchant/merchant"));
const CouponPage = React.lazy(() => import("../pages/coupon/couponPage"));
const UserOrder = React.lazy(() => import("../pages/UserOrder/userOrder"));

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.user);

  
  if (!token ) {
    return <Navigate to="/login" replace />;
  }

  return (  children
  );
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <ErrorBoundary>
      <Suspense fallback={<div>加载中...</div>}>
        <Login />
      </Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: "/",
    element: (
      <ErrorBoundary>
      <ProtectedRoute>
        <LayoutComponent />
      </ProtectedRoute>
      </ErrorBoundary>
    ),
    children: [
      { path: "/home", element:<Suspense fallback={<div>加载首页中...</div>}><Home /></Suspense>  },
      { path: "/activitymanager", element:<Suspense fallback={<div>加载活动添加页面中...</div>}><ActivityManager /></Suspense>  },
      { path: "/order", element:<Suspense fallback={<div>加载订单管理中...</div>}><Order /></Suspense>  },
      { path: "/usermanager", element: <Suspense fallback={<div>加载用户反馈管理中...</div>}><UserManager /></Suspense> },
      { path: "/activitycontroller", element: <Suspense fallback={<div>加载活动管理中...</div>}><ActivityController /></Suspense> },
      { path: "/couponadd", element: <Suspense fallback={<div>加载优惠券管理中...</div>}><CouponAdd /></Suspense> },
      { path: "/couponPage", element: <Suspense fallback={<div>加载优惠券中...</div>}><CouponPage /></Suspense> },
      { path: "/activities/:activityId/coupons", element:<Suspense fallback={<div>加载优惠券中...</div>}><CouponPage /></Suspense>  },
      { path: "merchant1", element: <Suspense fallback={<div>加载商家管理中...</div>}><Merchant /></Suspense> },
      { path: "/userOrder", element: <Suspense fallback={<div>加载用户订单管理中...</div>}><UserOrder /></Suspense> },
    ]
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default router;