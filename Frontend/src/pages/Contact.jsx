import React from 'react'
import PageHero from '../components/common/PageHero'
import ContactBanner from '../components/ContactContent/ContactBanner'
import ContactForm from '../components/ContactContent/ContactForm'
import contactHeroImage from '../assets/contactimg.jpg' 

const Contact = () => {
  return (
    <div>
      <PageHero
        title="Get in Touch with Our Team"
        description="Have questions? Our support team is here to help you navigate bulk pharmaceutical trade with confidence."
        gradient="from-cyan-700/90 via-teal-700/90 to-emerald-800/90" 
        backgroundImage={contactHeroImage}
        animationType="zoom" 
      />
      <ContactBanner />
      <ContactForm />
    </div>
  )
}

export default Contact