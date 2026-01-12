import React from 'react'
import { useSelector } from 'react-redux'
import { CheckCircle } from 'lucide-react'

const RegistrationStepper = () => {
  const { currentStep } = useSelector((state) => state.registration)
  
  const steps = [
    { number: 1, title: 'Pharmacy Info' },
    { number: 2, title: 'Pharmacy Owner' },
    { number: 3, title: 'Primary Contact' },
    { number: 4, title: 'Pharmacy License' },
    { number: 5, title: 'Pharmacy Questions' },
    { number: 6, title: 'Referral Info' },
    { number: 7, title: 'Bank Account' },
    { number: 8, title: 'Documents & Account' }
  ]
  
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          <nav className="flex items-center justify-between">
            <div className="w-full">
              <ol className="flex items-center space-x-4">
                {steps.map((step, index) => (
                  <React.Fragment key={step.number}>
                    <li className="flex items-center">
                      <div className={`flex items-center ${
                        currentStep >= step.number ? 'text-emerald-600' : 'text-gray-500'
                      }`}>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          currentStep >= step.number 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-gray-100'
                        }`}>
                          {currentStep > step.number ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <span className="text-sm font-medium">{step.number}</span>
                          )}
                        </div>
                        <span className="ml-2 text-sm font-medium hidden md:inline">
                          {step.title}
                        </span>
                      </div>
                    </li>
                    
                    {index < steps.length - 1 && (
                      <li className="flex-1">
                        <div className={`h-0.5 w-full ${
                          currentStep > step.number ? 'bg-emerald-600' : 'bg-gray-200'
                        }`} />
                      </li>
                    )}
                  </React.Fragment>
                ))}
              </ol>
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default RegistrationStepper