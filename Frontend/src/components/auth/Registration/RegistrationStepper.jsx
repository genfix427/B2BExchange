import React from 'react'
import { useSelector } from 'react-redux'
import { CheckCircle } from 'lucide-react'

const RegistrationStepper = () => {
  const { currentStep, formData } = useSelector((state) => state.registration)
  
  const steps = [
    { number: 1, title: 'Pharmacy Info', completed: !!formData.pharmacyInfo },
    { number: 2, title: 'Pharmacy Owner', completed: !!formData.pharmacyOwner },
    { number: 3, title: 'Primary Contact', completed: !!formData.primaryContact },
    { number: 4, title: 'Pharmacy License', completed: !!formData.pharmacyLicense },
    { number: 5, title: 'Pharmacy Questions', completed: !!formData.pharmacyQuestions },
    { number: 6, title: 'Referral Info', completed: !!formData.referralInfo },
    { number: 7, title: 'Documents & Account', completed: !!formData.documents }
  ]
  
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-50 border-green-600 text-green-600' 
                    : currentStep === step.number 
                    ? 'bg-blue-50 border-blue-600 text-blue-600' 
                    : 'bg-gray-50 border-gray-300 text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="font-medium">{step.number}</span>
                  )}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  currentStep === step.number 
                    ? 'text-blue-600' 
                    : step.completed 
                    ? 'text-green-600' 
                    : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 ${
                  steps[index + 1].completed ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RegistrationStepper