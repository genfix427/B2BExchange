import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Shield, Truck, Users, BarChart, Lock } from 'lucide-react'

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Verified Vendors Only',
      description: 'All pharmacies and vendors are thoroughly verified and licensed.'
    },
    {
      icon: <Truck className="h-8 w-8" />,
      title: 'Fast Shipping',
      description: 'Reliable shipping with real-time tracking for all orders.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'B2B Network',
      description: 'Connect with hundreds of pharmacies and pharmaceutical companies.'
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: 'Market Insights',
      description: 'Access pricing trends and inventory analytics.'
    },
    {
      icon: <Lock className="h-8 w-8" />,
      title: 'Secure Transactions',
      description: 'Bank-level security for all financial transactions.'
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Quality Assurance',
      description: 'All products meet strict quality standards and regulations.'
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              B2B Pharmaceutical Marketplace
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Connect with verified pharmacies and pharmaceutical vendors for seamless wholesale transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Register as Vendor
              </Link>
              <Link
                to="/how-it-works"
                className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Medical Marketplace?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform is designed specifically for pharmaceutical professionals, ensuring compliance, security, and efficiency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-teal-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Grow Your Pharmaceutical Business?
          </h2>
          <p className="text-gray-600 mb-8">
            Join hundreds of pharmacies and vendors already using our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 border-2 border-teal-600 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage