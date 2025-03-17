import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/navBar";
import Home from "./pages/Home";
import Header from "./components/Header";
import ResultPage from "./pages/Result";
import AllNotice from "./pages/AllNotice";



function App() {
  return (
   
    <Router>
       <Header/>
     
      <div className="p-4">
      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/notice"  element={<AllNotice/>} />

          
        </Routes>
        
      </div>
    </Router>

    
    
  );
}

export default App;
