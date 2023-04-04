import {Routes, Route, Link, Navigate, Outlet} from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./navbar/Navbar";
import {useSelector} from "react-redux";
import {selectUser} from "./redux/user/userSlice";
function App() {
  const userAuth = useSelector(selectUser)

  const ProtectedRoute = ({
                            user,
                            redirectPath = '/login',
                            children,
                          }) => {
    if (!user) {
      return <Navigate to={redirectPath} replace />;
    }

    return children ? children : <Outlet />;
  };

  return (
      <div>
        <Navbar/>
        <Routes>
          <Route element={<ProtectedRoute user={userAuth} />}>
            {/*<Route path="account" element={<Account />} />*/}
          </Route>
          {/*<Route path='/' element={<HomeThirdEngine />} />*/}
          <Route path='/' element={<Home />} />
        </Routes>
      </div>
  );
}

export default App;

