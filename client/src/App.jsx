import './App.css'
import Header from './components/header'
import ImageCarousel from './components/imageCarousel'
import Notice from './components/Notice'
import NapBar from './components/napBar'



function App() {
  return (
    <div className="w-full"> 
       <Header />
       {/* <Notice /> */}
       <NapBar/>

      <ImageCarousel />

       {/* <HeroSection /> */}
      {/* Add other sections/components below */}
    </div>
  )
}

export default App