"use client"

import { useState } from "react"
import { Button } from "antd" // Assuming Button is imported from antd for this example
// ... existing imports ...

const ConnectionsPage = () => {
  const [testResults, setTestResults] = useState(null)
  const [testing, setTesting] = useState(false)
  const [formData, setFormData] = useState({ organization: "", pat: "", project: "" }) // Declare formData variable

  async function testAzureConnection() {
    setTesting(true)
    try {
      const response = await fetch("/api/azure/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: formData.organization,
          pat: formData.pat,
          project: formData.project,
        }),
      })

      const results = await response.json()
      setTestResults(results)
    } catch (error) {
      setTestResults({ error: error.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={testAzureConnection}
        disabled={testing || !formData.organization || !formData.pat}
      >
        {testing ? "Testando..." : "Testar Conexão"}
      </Button>
      {testResults && (
        <div className="mt-4 p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Resultados do Teste:</h4>
          <pre className="text-sm bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(testResults, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default ConnectionsPage
