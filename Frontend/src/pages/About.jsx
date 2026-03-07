import React from 'react'
import PageHero from '../components/common/PageHero'
import AboutBanner from '../components/AboutContent/AboutBanner'
import AboutFeatures from '../components/AboutContent/AboutFeatures'
import AboutHeroImage from '../assets/aboutimg.jpg'

const About = () => {
  return (
    <div>
      <PageHero
        title="Built for Pharmacists. Designed for Scale."
        description="Our platform connects independent pharmacies and distributors across the U.S. to streamline bulk trade and strengthen supply chains."
        gradient="from-emerald-400 via-teal-500 to-slate-700"
        backgroundImage={AboutHeroImage}
        animationType="zoom"
      />
      <AboutBanner />
      <AboutFeatures />
    </div>
  )
}

export default About
