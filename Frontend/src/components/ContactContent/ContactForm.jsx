import { motion } from "framer-motion";

export default function ContactForm() {
  return (
    <section className="relative py-28 bg-linear-to-b from-slate-50 to-white overflow-hidden">

      {/* Subtle background dots */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle,#14b8a6_1px,transparent_1px)] bg-size-[26px_26px]" />

      <div className="relative max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Send Us a Message
          </h2>
          <p className="mt-3 text-gray-600">
            Fill out the form below and our team will reach out shortly.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8"
        >
          {/* Name */}
          <div className="grid gap-6 md:grid-cols-2">
            <Input label="First Name" />
            <Input label="Last Name" />
          </div>

          {/* Contact */}
          <div className="grid gap-6 md:grid-cols-2">
            <Input label="Phone Number" placeholder="(800) 000-0000" />
            <Input label="Email Address" type="email" />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="4"
              className="w-full border-b-2 border-gray-300 focus:border-teal-600 outline-none transition resize-none py-2"
            />
          </div>

          {/* Recaptcha placeholder */}
          <div className="text-sm text-gray-500">
            reCAPTCHA verification required
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="relative w-full py-4 bg-teal-600 text-white font-semibold rounded-xl overflow-hidden hover:bg-teal-700 transition cursor-pointer" 
          >
            Submit
          </button>
        </motion.form>
      </div>
    </section>
  );
}

function Input({ label, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border-b-2 border-gray-300 focus:border-teal-600 outline-none transition py-2"
      />
    </div>
  );
}
