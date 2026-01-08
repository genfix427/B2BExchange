import React from 'react'
import PageHero from '../components/common/PageHero'
import ShippingInfo from '../components/ShippingContent/ShippingInfo'

const Shipping = () => {
  return (
    <div>
      <PageHero
        title="Reliable B2B Shipping Solutions"
        description="Optimized logistics and trusted partners ensure safe, fast, and compliant delivery of bulk pharmaceutical orders."
        gradient="from-teal-500 via-emerald-600 to-slate-700"
      />
      <ShippingInfo />
    </div>
  )
}

export default Shipping
