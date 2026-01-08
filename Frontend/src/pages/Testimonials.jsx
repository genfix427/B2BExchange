import React from 'react'
import TestimonialsComp from '../components/TestimonialsContent/TestimonialsComp'
import PageHero from '../components/common/PageHero'

const Testimonials = () => {
  return (
    <div>
      <PageHero
        title="What Our Partners Say"
        description="Hear directly from pharmacies, distributors, and healthcare providers who trust B2BExchange to power their compliant bulk trading operations."
        gradient="from-emerald-700 via-teal-700 to-slate-800"
      />
      <TestimonialsComp />
    </div>
  )
}

export default Testimonials
