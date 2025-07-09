"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface SystemHealthProps {
  systemHealth: {
    api: "online" | "offline" | "warning";
    database: "healthy" | "warning" | "critical";
    storage: {
      status: "normal" | "warning" | "critical";
      usage: number;
    };
    cdn: "active" | "inactive";
  } | undefined;
}

export default function SystemHealthCard({ systemHealth }: SystemHealthProps) {
  if (!systemHealth) {
    return null;
  }
  
  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white text-lg sm:text-xl">System Status</CardTitle>
        <CardDescription className="text-gray-400 text-sm">Platform health overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemHealth?.api === 'online' ? 'bg-green-400' : 
              systemHealth?.api === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="text-white text-sm">API Status</span>
          </div>
          <Badge className={`text-xs ${
            systemHealth?.api === 'online' ? 'bg-green-600 text-white' : 
            systemHealth?.api === 'warning' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {systemHealth?.api || 'unknown'}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemHealth?.database === 'healthy' ? 'bg-green-400' : 
              systemHealth?.database === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="text-white text-sm">Database</span>
          </div>
          <Badge className={`text-xs ${
            systemHealth?.database === 'healthy' ? 'bg-green-600 text-white' : 
            systemHealth?.database === 'warning' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {systemHealth?.database}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemHealth?.storage?.status === 'normal' ? 'bg-green-400' : 
              systemHealth?.storage?.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
            }`}></div>
            <span className="text-white text-sm">Storage</span>
          </div>
          <Badge className={`text-xs ${
            systemHealth?.storage?.status === 'normal' ? 'bg-green-600 text-white' : 
            systemHealth?.storage?.status === 'warning' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {systemHealth?.storage?.usage}% Used
          </Badge>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemHealth?.cdn === 'active' ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-white text-sm">CDN</span>
          </div>
          <Badge className={`text-xs ${
            systemHealth?.cdn === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {systemHealth?.cdn}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
