import React from 'react'
import PageHero from '../components/common/PageHero'
import FaqComp from '../components/FaqContent/FaqComp'

const FAQ = () => {
  return (
    <div>
      <PageHero
        title="Frequently Asked Questions"
        description="Find clear answers about B2BExchange, our compliance-first marketplace, and how licensed healthcare providers can trade with confidence."
        gradient="from-teal-800 via-emerald-800 to-slate-900"
      />
      <FaqComp />
    </div>
  )
}

export default FAQ
