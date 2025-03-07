import './App.css'
import Header from './components/header'
import ImageCarousel from './components/imageCarousel'
import Notice from './components/Notice'



function App() {
  return (
    <div className="w-full"> 
       <Header />
       <Notice />
      <ImageCarousel />

       {/* <HeroSection /> */}
      {/* Add other sections/components below */}
    </div>
  )
}

export default App