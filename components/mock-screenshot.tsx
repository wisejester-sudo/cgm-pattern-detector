"use client"

import { 
  User, 
  MapPin, 
  Phone, 
  Clock, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare,
  Bell,
  Briefcase,
  MoreVertical,
  ChevronRight
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface MockScreenshotProps {
  type: 
    | "create-job" 
    | "dispatch" 
    | "customer-sms" 
    | "live-tracking" 
    | "job-complete"
    | "tech-sms"
    | "tech-view"
    | "tech-status"
    | "tech-photos"
    | "tech-complete"
}

export function MockScreenshot({ type }: MockScreenshotProps) {
  return (
    <div className="relative">
      {/* Browser/Phone Frame */}
      <div className="bg-card border rounded-2xl shadow-2xl overflow-hidden">
        {/* Browser Header */}
        {!type.startsWith("tech-") && (
          <div className="bg-muted/50 px-4 py-3 border-b flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 text-center">
              <div className="inline-flex items-center gap-2 bg-background px-3 py-1 rounded-full text-xs text-muted-foreground">
                getdispatchly.co/dashboard
              </div>
            </div>
          </div>
        )}

        {/* SMS Message View (Phone) */}
        {(type === "customer-sms" || type === "tech-sms") && (
          <div className="bg-gray-100 p-4">
            <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
              {/* Phone Header */}
              <div className="bg-gray-800 text-white p-3 text-center text-sm">
                <div className="w-16 h-1 bg-gray-600 rounded-full mx-auto mb-2" />
                Messages
              </div>
              {/* Message Thread */}
              <div className="p-4 space-y-3">
                {type === "customer-sms" ? (
                  <>
                    <div className="bg-primary text-white p-3 rounded-2xl rounded-tl-sm text-sm">
                      Hi Sarah! Mike from Cool Air HVAC is en route to your location. Estimated arrival: 2:15 PM.
                      <div className="text-right text-xs opacity-70 mt-1">2:05 PM</div>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tr-sm text-sm ml-4 border border-gray-200">
                      Great, thank you!
                      <div className="text-right text-xs text-muted-foreground mt-1">2:06 PM</div>
                    </div>
                    <div className="bg-primary text-white p-3 rounded-2xl rounded-tl-sm text-sm">
                      Mike has arrived and is starting the repair work.
                      <div className="text-right text-xs opacity-70 mt-1">2:18 PM</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-200 text-foreground p-3 rounded-2xl rounded-tr-sm text-sm">
                      <div className="font-semibold mb-1">Dispatchly</div>
                      New job assigned! Johnson Residence - AC Repair. 123 Oak Street. Tap to view: getdispatchly.co/t/abc123
                      <div className="text-right text-xs text-muted-foreground mt-1">8:30 AM</div>
                    </div>
                    <div className="bg-primary text-white p-3 rounded-2xl rounded-tl-sm text-sm ml-4">
                      On my way
                      <div className="text-right text-xs opacity-70 mt-1">8:32 AM</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Job View */}
        {type === "create-job" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create New Job</h3>
              <Badge variant="outline">Draft</Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Customer Name</label>
                <div className="border rounded-lg px-3 py-2 bg-muted/30 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>Sarah Johnson</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                <div className="border rounded-lg px-3 py-2 bg-muted/30 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>(555) 123-4567</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                <div className="border rounded-lg px-3 py-2 bg-muted/30 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>123 Oak Street, Springfield</span>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Service Type</label>
                <div className="border rounded-lg px-3 py-2 bg-muted/30">
                  AC Repair - Not cooling properly
                </div>
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                <div className="flex gap-2">
                  <Badge className="bg-red-100 text-red-700">High</Badge>
                  <Badge variant="outline">Medium</Badge>
                  <Badge variant="outline">Low</Badge>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <label className="text-xs text-muted-foreground mb-2 block">Assign Technician</label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 border rounded-lg hover:border-primary cursor-pointer bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">MJ</div>
                      <div>
                        <div className="font-medium">Mike Johnson</div>
                        <div className="text-xs text-muted-foreground">Available</div>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center justify-between p-2 border rounded-lg hover:border-primary cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">SC</div>
                      <div>
                        <div className="font-medium">Sarah Chen</div>
                        <div className="text-xs text-muted-foreground">On Job</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1">Cancel</Button>
              <Button className="flex-1 shadow-lg shadow-primary/20">
                Create Job
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Dispatch Board */}
        {type === "dispatch" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Dispatch Board</h3>
                <p className="text-sm text-muted-foreground">Wednesday, March 18</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  5 Available
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  3 Working
                </Badge>
              </div>
            </div>
            
            <div className="space-y-3">
              {[
                { name: "Mike Johnson", status: "En Route", time: "10:30 AM", color: "bg-blue-500", job: "Johnson AC Repair" },
                { name: "Sarah Chen", status: "Working", time: "11:15 AM", color: "bg-yellow-500", job: "Smith Heating Install" },
                { name: "David Park", status: "Complete", time: "9:45 AM", color: "bg-green-500", job: "Garcia Maintenance" },
                { name: "Alex Rivera", status: "Available", time: "—", color: "bg-green-500", job: null }
              ].map((tech, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${tech.color}`} />
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                      {tech.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-xs text-muted-foreground">{tech.job || "No active job"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={tech.status === "Available" ? "outline" : "secondary"}>
                      {tech.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground w-16 text-right">{tech.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Tracking */}
        {type === "live-tracking" && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Job #1245 - Johnson AC Repair</h3>
              <Badge>Working</Badge>
            </div>
            
            <div className="space-y-6">
              {/* Timeline */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Job Created</div>
                    <div className="text-sm text-muted-foreground">8:15 AM by Dispatch Manager</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Assigned to Mike Johnson</div>
                    <div className="text-sm text-muted-foreground">8:20 AM</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">En Route</div>
                    <div className="text-sm text-muted-foreground">8:32 AM - ETA 2:15 PM</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Started Work</div>
                    <div className="text-sm text-muted-foreground">2:18 PM - 2 hours ago</div>
                  </div>
                </div>
              </div>
              
              {/* Photos */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photos from Technician
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center border">
                      <div className="text-center">
                        <Camera className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">Photo {i}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Complete */}
        {type === "job-complete" && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">Job Complete</h3>
              <p className="text-muted-foreground">Job #1245 - Johnson AC Repair</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">Sarah Johnson</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Technician</span>
                  <span className="font-medium">Mike Johnson</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Time</span>
                  <span className="font-medium">2:18 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Time</span>
                  <span className="font-medium">4:45 PM</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-muted-foreground">Total Time</span>
                  <span className="font-medium">2h 27m</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Technician Notes</label>
                <div className="border rounded-lg p-3 text-sm bg-muted/30">
                  Replaced faulty capacitor and cleaned condenser coils. System cooling properly now. Recommended annual maintenance plan. Customer signed up for yearly service.
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Photos (4)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center border">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1">View History</Button>
                <Button className="flex-1">Close Job</Button>
              </div>
            </div>
          </div>
        )}

        {/* Tech Mobile View */}
        {(type === "tech-view" || type === "tech-status" || type === "tech-photos" || type === "tech-complete") && (
          <div className="bg-gray-100 p-4">
            <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-lg overflow-hidden min-h-[600px]">
              {/* Phone Header */}
              <div className="bg-primary text-white p-4">
                <div className="w-16 h-1 bg-white/30 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-70">Job #1245</div>
                  <div className="text-sm font-medium">2:18 PM</div>
                </div>
              </div>
              
              {/* Job Content */}
              <div className="p-4 space-y-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Sarah Johnson</div>
                      <div className="text-sm text-muted-foreground">123 Oak Street</div>
                      <div className="text-sm text-muted-foreground">Springfield, ST 12345</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>(555) 123-4567</span>
                    <Button size="sm" variant="ghost" className="ml-auto h-6 text-xs">
                      Call
                    </Button>
                  </div>
                </div>
                
                {/* Service Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">AC Repair</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Not cooling properly. Unit is 8 years old. Customer mentioned strange noise last week.
                  </p>
                  <Badge className="mt-2 bg-red-100 text-red-700">High Priority</Badge>
                </div>
                
                {/* Status Update Buttons */}
                {(type === "tech-view" || type === "tech-status") && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Update Status</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button 
                        variant={type === "tech-status" ? "default" : "outline"} 
                        size="sm" 
                        className="flex-col h-auto py-2"
                      >
                        <MapPin className="h-4 w-4 mb-1" />
                        <span className="text-xs">En Route</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-col h-auto py-2">
                        <Clock className="h-4 w-4 mb-1" />
                        <span className="text-xs">Working</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-col h-auto py-2">
                        <CheckCircle2 className="h-4 w-4 mb-1" />
                        <span className="text-xs">Complete</span>
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Photo Upload */}
                {(type === "tech-photos" || type === "tech-view") && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Photos</h4>
                    {type === "tech-photos" ? (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                          <Camera className="h-8 w-8 text-gray-400" />
                        </div>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border relative">
                            <Camera className="h-6 w-6 text-muted-foreground" />
                            <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        Add Photos
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Complete Form */}
                {type === "tech-complete" && (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="font-semibold text-green-800">Job Complete!</div>
                      <div className="text-sm text-green-600">Total time: 2h 27m</div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes</label>
                      <div className="border rounded-lg p-3 text-sm bg-gray-50">
                        Replaced faulty capacitor and cleaned condenser coils. System cooling properly now.
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Photos Uploaded (4)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border">
                            <Camera className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      Submit & Close Job
                    </Button>
                  </div>
                )}
                
                {/* Quick Actions */}
                {type !== "tech-complete" && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Caption */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        {type === "create-job" && "Create jobs in under 60 seconds with our streamlined form"}
        {type === "dispatch" && "Real-time dispatch board shows all technician locations and status"}
        {type === "customer-sms" && "Customers receive automatic SMS updates at every step"}
        {type === "live-tracking" && "Track job progress in real-time with photos and notes"}
        {type === "job-complete" && "Review completed jobs with photos, notes, and time tracking"}
        {type === "tech-sms" && "Technicians receive job details via SMS with instant access"}
        {type === "tech-view" && "Mobile-optimized job view - no app download required"}
        {type === "tech-status" && "One-tap status updates keep everyone informed"}
        {type === "tech-photos" && "Upload photos directly from the field"}
        {type === "tech-complete" && "Mark jobs complete and add final notes"}
      </div>
    </div>
  )
}
