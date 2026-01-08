import React from 'react'
import { motion } from "framer-motion";

const HiwCta = () => {
  return (
    <div className='bg-linear-to-br from-teal-900 via-teal-800 to-emerald-900 text-white py-12'>
      {/* Closing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-24 text-center "
        >
          <h3 className="text-2xl md:text-3xl font-bold text-gray-100">
            Save More. Stay Compliant. Grow with B2BExchange.
          </h3>

          <p className="mt-4 text-gray-200 max-w-3xl mx-auto">
            Our team is here to guide you through onboarding and help you unlock
            the full potential of compliant pharmaceutical trading.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="tel:18336979333"
              className="px-8 py-4 bg-teal-600 text-white rounded-full font-semibold hover:bg-teal-700 transition"
            >
              1-833-MYRXEED (697-9333)
            </a>
            <a
              href="mailto:info@b2bexchange.com"
              className="px-8 py-4 border border-teal-600 text-teal-600 rounded-full hover:bg-teal-50 transition"
            >
              info@b2bexchange.com
            </a>
          </div>
        </motion.div>
    </div>
  )
}

export default HiwCta
