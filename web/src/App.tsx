import { BrowserRouter, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Search from "./Search";

const App = () => {
  return (
    <>
      <Toaster position="top-center" duration={1500} theme="dark" />
      <BrowserRouter>
        <Route path="/" element={<Search />} />
        <Route path="/settings" element={<Search />} />
      </BrowserRouter>
    </>
  );
};

export default App;
