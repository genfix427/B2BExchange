import React from 'react'
import PageHero from '../components/common/PageHero'
import FaqComp from '../components/FaqContent/FaqComp'
import FAQHeroImage from '../assets/faqimg.jpg' 

const FAQ = () => {
  return (
    <div>
      <PageHero
        title="Frequently Asked Questions"
        description="Find clear answers about B2BExchange, our compliance-first marketplace, and how licensed healthcare providers can trade with confidence."
        gradient="from-teal-800 via-emerald-800 to-slate-900"
        backgroundImage={FAQHeroImage}
        animationType="zoom"
      />
      <FaqComp />
    </div>
  )
}

export default FAQ
