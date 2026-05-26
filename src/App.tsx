import { Routes, Route, useLocation } from "react-router-dom";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import { Modal } from "./components/ui/modal";
import { ROUTES } from "./router/routes";

export default function App() {
  const location = useLocation();
  // Present when Login was opened as a modal (via state.background)
  const background = location.state?.background;

  return (
    <>
      {/*
        When modal is open, render the BACKGROUND location (e.g. "/") here.
        Otherwise render the current location normally.
      */}
      <Routes location={background || location}>
        <Route path={ROUTES.HOME} element={<MainPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<LoginPage />} />
      </Routes>

      {/* If background exists, also render Login as a modal overlay */}
      {background && (
        <Routes>
          <Route
            path={ROUTES.LOGIN}
            element={
              <Modal>
                <LoginPage isModal />
              </Modal>
            }
          />
           <Route                                              
            path={ROUTES.REGISTER}
            element={<Modal><LoginPage isModal /></Modal>}
          />
        </Routes>
      )}
    </>
  );
}
import './App.css'
import {router} from "./router";
import {RouterProvider} from "react-router-dom";

function App() {

  return (
      <RouterProvider router={router}/>
  );
}

export default App
