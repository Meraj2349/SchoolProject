import './App.css'
import HeroSection from './components/heroSection'
import Header from './components/header'
import ImageCarousel from './components/imageCarousel'


function App() {
  return (
    <div className="w-full"> 
       <Header />
      <ImageCarousel />

       {/* <HeroSection /> */}
      {/* Add other sections/components below */}
    </div>
  )
}

export default App