import React from 'react'
import PageHero from '../components/common/PageHero'
import HowItWorksTimeline from '../components/HowItWorksContent/HowItWorksTimeline'
import HiwCta from '../components/HowItWorksContent/HiwCta'

const HowItWorks = () => {
  return (
    <div>
      <PageHero
      title="How the Platform Works"
      description="From verification to fulfillment, our process is designed to make bulk pharmaceutical trade simple, secure, and efficient."
      gradient="from-cyan-700 via-teal-700 to-emerald-800"
    />
    <HowItWorksTimeline />
    <HiwCta />
    </div>
  )
}

export default HowItWorks
