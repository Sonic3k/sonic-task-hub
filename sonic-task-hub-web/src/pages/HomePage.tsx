// src/pages/HomePage.tsx
import { useState, useEffect } from 'react'
import { Users, Database, Zap } from 'lucide-react'

interface ApiStatus {
  status: string
  message: string
}

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Test API connection
    fetch('/api/health')
      .then(response => response.json())
      .then(data => {
        setApiStatus(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('API Error:', error)
        setApiStatus({ status: 'error', message: 'Unable to connect to backend' })
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to sonic-task-hub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your full-stack application is ready! This React frontend is connected to your Spring Boot backend.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* API Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="mr-3 text-blue-600" />
              Backend Connection
            </h2>

            {loading ? (
              <div className="flex items-center text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Checking connection...
              </div>
            ) : (
              <div className={\`flex items-center \${apiStatus?.status === 'error' ? 'text-red-600' : 'text-green-600'}\`}>
                <div className={\`w-3 h-3 rounded-full mr-2 \${apiStatus?.status === 'error' ? 'bg-red-500' : 'bg-green-500'}\`}></div>
                {apiStatus?.message || 'Connected successfully'}
              </div>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">React Frontend</h3>
              <p className="text-gray-600">
                Modern React 18 with TypeScript, Tailwind CSS, and React Router for navigation.
              </p>
              <ul className="mt-4 text-sm text-gray-500">
                <li>• TypeScript for type safety</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Vite for fast development</li>
                <li>• React Router for navigation</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <Zap className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Spring Boot Backend</h3>
              <p className="text-gray-600">
                Robust Spring Boot API with database integration, validation, and error handling.
              </p>
              <ul className="mt-4 text-sm text-gray-500">
                <li>• RESTful API endpoints</li>
                <li>• Database integration</li>
                <li>• Global exception handling</li>
                <li>• Request/response logging</li>
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-xl p-8 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Frontend Development:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Add more components in src/components</li>
                  <li>• Create new pages in src/pages</li>
                  <li>• Set up API services in src/services</li>
                  <li>• Customize styles in src/styles</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Backend Development:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Create controllers in web.controller</li>
                  <li>• Add services for business logic</li>
                  <li>• Define entities for data models</li>
                  <li>• Configure database repositories</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
