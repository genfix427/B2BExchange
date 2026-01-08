import React from 'react'
import PageHero from '../components/common/PageHero'
import ContactBanner from '../components/ContactContent/ContactBanner'
import ContactForm from '../components/ContactContent/ContactForm'

const Contact = () => {
  return (
    <div>
      <PageHero
        title="Get in Touch with Our Team"
        description="Have questions? Our support team is here to help you navigate bulk pharmaceutical trade with confidence."
        gradient="from-cyan-700 via-teal-700 to-emerald-800"
      />
      <ContactBanner />
      <ContactForm />
    </div>
  )
}

export default Contact
