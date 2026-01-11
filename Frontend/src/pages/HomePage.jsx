import React from 'react'
import { CheckCircle, Shield, Truck, Users, BarChart, Lock } from 'lucide-react'
import Hero from '../components/HomeContent/Hero'
import WhyChooseUs from '../components/HomeContent/WhyChooseUs'
import AboutUsHome from '../components/HomeContent/AboutUsHome'
import TestimonialsComp from '../components/TestimonialsContent/TestimonialsComp'
import FaqSection from '../components/HomeContent/FaqSection'
import JoinBanner from '../components/HomeContent/JoinBanner'

const HomePage = () => {

  return (
    <div className="">
      <Hero />
      <WhyChooseUs />
      <AboutUsHome />
      <TestimonialsComp />
      <FaqSection />
      <JoinBanner />
    </div>
  )
}

export default HomePage