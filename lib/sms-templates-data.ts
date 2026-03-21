// Comprehensive HVAC SMS Templates
// Organized by category for easy browsing

export interface SMSTemplateCategory {
  id: string
  name: string
  description: string
  icon: string
  templates: SMSTemplate[]
}

export interface SMSTemplate {
  id: string
  name: string
  description: string
  template_body: string
  category: string
  tags: string[]
  isPopular?: boolean
}

export const smsTemplateCategories: SMSTemplateCategory[] = [
  {
    id: "appointments",
    name: "Appointments",
    description: "Booking, confirmations, and reminders",
    icon: "Calendar",
    templates: [
      {
        id: "apt-confirm",
        name: "Appointment Confirmation",
        description: "Sent immediately after booking",
        template_body: "Hi {customer_name}, your {job_type} is confirmed for {scheduled_time}. Our technician will arrive within the scheduled window. Reply CONFIRM to confirm or call {company_phone} to reschedule.",
        category: "appointments",
        tags: ["confirmation", "booking"],
        isPopular: true
      },
      {
        id: "apt-reminder-24h",
        name: "24-Hour Reminder",
        description: "Day before appointment",
        template_body: "Reminder: Your HVAC appointment is tomorrow at {scheduled_time}. Please ensure clear access to your unit. Reply YES to confirm or call {company_phone} if you need to reschedule.",
        category: "appointments",
        tags: ["reminder", "24-hour"],
        isPopular: true
      },
      {
        id: "apt-reminder-2h",
        name: "2-Hour Reminder",
        description: "Final reminder before arrival",
        template_body: "Hi {customer_name}, {tech_name} will arrive at your home within 2 hours for your {job_type} appointment. Please ensure someone 18+ is present. Questions? Call {company_phone}",
        category: "appointments",
        tags: ["reminder", "2-hour"]
      },
      {
        id: "apt-reschedule",
        name: "Reschedule Offer",
        description: "When customer needs to reschedule",
        template_body: "No problem, {customer_name}! We can reschedule your {job_type} appointment. Reply with your preferred date/time or call {company_phone}. Our next available slots are: [LIST SLOTS]",
        category: "appointments",
        tags: ["reschedule"]
      },
      {
        id: "apt-cancel",
        name: "Cancellation Confirmation",
        description: "Confirm appointment cancellation",
        template_body: "Your appointment for {scheduled_time} has been cancelled. To rebook, call {company_phone} or visit {company_website}. Thank you for choosing {company_name}!",
        category: "appointments",
        tags: ["cancellation"]
      },
      {
        id: "apt-no-show",
        name: "No-Show Follow-up",
        description: "After missed appointment",
        template_body: "Hi {customer_name}, we missed you today for your {job_type} appointment. Please call {company_phone} to reschedule. A no-show fee may apply per our policy.",
        category: "appointments",
        tags: ["no-show", "follow-up"]
      },
      {
        id: "apt-access",
        name: "Access Instructions",
        description: "Request for property access info",
        template_body: "Hi {customer_name}, for your appointment on {scheduled_time}, please reply with: gate code, parking instructions, or any access details. This helps our technician arrive smoothly. Thanks!",
        category: "appointments",
        tags: ["access", "instructions"]
      }
    ]
  },
  {
    id: "technician",
    name: "Technician Updates",
    description: "Real-time status from the field",
    icon: "Truck",
    templates: [
      {
        id: "tech-enroute",
        name: "Technician En Route",
        description: "When tech is heading to customer",
        template_body: "Hi {customer_name}, {tech_name} is on the way to your home! Estimated arrival: {eta}. Track their progress: {tracking_link}",
        category: "technician",
        tags: ["en-route", "tracking"],
        isPopular: true
      },
      {
        id: "tech-arrived",
        name: "Technician Arrived",
        description: "When tech arrives on site",
        template_body: "Hi {customer_name}, {tech_name} has arrived and is beginning your {job_type}. They'll update you on their progress. Thanks for choosing {company_name}!",
        category: "technician",
        tags: ["arrived", "started"]
      },
      {
        id: "tech-working",
        name: "Work in Progress",
        description: "During service/repair",
        template_body: "Update from {tech_name}: Currently working on your {job_type}. Everything is going well. We'll notify you when complete or if any issues arise. Questions? Call {company_phone}",
        category: "technician",
        tags: ["working", "update"]
      },
      {
        id: "tech-delay",
        name: "Delay Notification",
        description: "When running behind schedule",
        template_body: "Hi {customer_name}, {tech_name} is running {delay_minutes} minutes behind due to an unexpected issue at the previous job. New estimated arrival: {eta}. We apologize for the inconvenience!",
        category: "technician",
        tags: ["delay", "late"]
      },
      {
        id: "tech-complete",
        name: "Job Complete",
        description: "Work finished, ready for review",
        template_body: "Great news, {customer_name}! {tech_name} has completed your {job_type}. Summary: {work_summary}. Invoice: {invoice_link}. Please review the work before we leave!",
        category: "technician",
        tags: ["complete", "finished"],
        isPopular: true
      }
    ]
  },
  {
    id: "service",
    name: "Service & Repairs",
    description: "During the service call",
    icon: "Wrench",
    templates: [
      {
        id: "svc-diagnosis",
        name: "Diagnosis Update",
        description: "After identifying the issue",
        template_body: "Hi {customer_name}, {tech_name} has diagnosed the issue: {diagnosis}. Repair estimate: ${estimate}. Reply APPROVE to proceed or call {company_phone} to discuss alternatives.",
        category: "service",
        tags: ["diagnosis", "estimate"]
      },
      {
        id: "svc-parts",
        name: "Parts Required",
        description: "When parts need to be ordered",
        template_body: "Hi {customer_name}, your repair requires parts that aren't in stock. Parts ordered: {parts_list}. Expected arrival: {delivery_date}. We'll schedule return visit once parts arrive.",
        category: "service",
        tags: ["parts", "order"]
      },
      {
        id: "svc-additional",
        name: "Additional Work Needed",
        description: "When extra issues found",
        template_body: "Hi {customer_name}, {tech_name} found an additional issue: {additional_issue}. Extra cost: ${additional_cost}. Reply YES to fix now or NO to address later. Current total: ${total_estimate}",
        category: "service",
        tags: ["additional", "extra"]
      },
      {
        id: "svc-warranty",
        name: "Warranty Info",
        description: "Explain warranty coverage",
        template_body: "Hi {customer_name}, your {repair_type} is covered under warranty! No charge for today's service. Warranty valid until {warranty_date}. Keep this message for your records.",
        category: "service",
        tags: ["warranty", "covered"]
      },
      {
        id: "svc-recommendations",
        name: "Maintenance Recommendations",
        description: "Suggest preventive maintenance",
        template_body: "Hi {customer_name}, {tech_name} recommends: {recommendations}. These can prevent future breakdowns and save money. Interested? Call {company_phone} for a maintenance plan quote.",
        category: "service",
        tags: ["recommendations", "maintenance"]
      }
    ]
  },
  {
    id: "followup",
    name: "Follow-ups",
    description: "After service completion",
    icon: "MessageCircle",
    templates: [
      {
        id: "fu-thankyou",
        name: "Thank You",
        description: "Sent 2 hours after completion",
        template_body: "Thank you {customer_name} for choosing {company_name} for your {job_type}! We hope you're satisfied with {tech_name}'s work. Questions about your service? Call {company_phone} anytime.",
        category: "followup",
        tags: ["thank-you", "appreciation"],
        isPopular: true
      },
      {
        id: "fu-review",
        name: "Review Request",
        description: "Ask for Google review",
        template_body: "Hi {customer_name}, we hope you had a great experience! Would you take 30 seconds to leave a review? Your feedback helps us grow: {review_link}. Thank you!",
        category: "followup",
        tags: ["review", "feedback"]
      },
      {
        id: "fu-satisfaction",
        name: "Satisfaction Check",
        description: "24-hour satisfaction check",
        template_body: "Hi {customer_name}, it's been 24 hours since your {job_type}. Is everything working properly? Reply YES if satisfied or call {company_phone} if you have any concerns. We're here to help!",
        category: "followup",
        tags: ["satisfaction", "check-in"]
      },
      {
        id: "fu-1week",
        name: "1-Week Check-in",
        description: "Verify system is working well",
        template_body: "Hi {customer_name}, just checking in! It's been a week since your {job_type}. Everything still running smoothly? If you notice any issues, call {company_phone} - we stand behind our work!",
        category: "followup",
        tags: ["1-week", "check-in"]
      },
      {
        id: "fu-referral",
        name: "Referral Request",
        description: "Ask for referrals",
        template_body: "Hi {customer_name}, know anyone who needs HVAC service? Refer a friend and you both get $25 off! Share this link: {referral_link}. Thanks for spreading the word about {company_name}!",
        category: "followup",
        tags: ["referral", "discount"]
      }
    ]
  },
  {
    id: "maintenance",
    name: "Maintenance",
    description: "Scheduled maintenance & tune-ups",
    icon: "CalendarDays",
    templates: [
      {
        id: "maint-reminder",
        name: "Maintenance Due",
        description: "Seasonal maintenance reminder",
        template_body: "Hi {customer_name}, your HVAC system is due for {season} maintenance. Regular tune-ups prevent breakdowns and lower energy bills. Schedule now: {booking_link} or call {company_phone}",
        category: "maintenance",
        tags: ["reminder", "seasonal"]
      },
      {
        id: "maint-plan",
        name: "Maintenance Plan Offer",
        description: "Promote maintenance membership",
        template_body: "Hi {customer_name}, join our Maintenance Plan! 2 tune-ups/year, priority service, 15% off repairs, no overtime charges. Only ${monthly_price}/month. Enroll: {plan_link} or call {company_phone}",
        category: "maintenance",
        tags: ["plan", "membership"]
      },
      {
        id: "maint-prep",
        name: "Pre-Season Prep",
        description: "Before summer/winter peaks",
        template_body: "{season} is coming, {customer_name}! Don't wait for a breakdown. Schedule your HVAC tune-up now and beat the rush. Book online: {booking_link} or call {company_phone}",
        category: "maintenance",
        tags: ["pre-season", "prep"]
      },
      {
        id: "maint-complete",
        name: "Maintenance Complete",
        description: "After tune-up service",
        template_body: "Hi {customer_name}, your {season} maintenance is complete! System status: {system_status}. Next recommended service: {next_service_date}. Questions? Call {company_phone}",
        category: "maintenance",
        tags: ["complete", "status"]
      }
    ]
  },
  {
    id: "emergency",
    name: "Emergency & After Hours",
    description: "Urgent situations and off-hours",
    icon: "AlertTriangle",
    templates: [
      {
        id: "emg-response",
        name: "Emergency Response",
        description: "Immediate response to emergency call",
        template_body: "EMERGENCY RECEIVED, {customer_name}! We're prioritizing your call. A technician will contact you within 15 minutes. If this is life-threatening, call 911. Emergency line: {emergency_phone}",
        category: "emergency",
        tags: ["emergency", "urgent"]
      },
      {
        id: "emg-eta",
        name: "Emergency ETA",
        description: "When tech is dispatched urgently",
        template_body: "{customer_name}, {tech_name} is rushing to your location! Emergency ETA: {eta}. Technician will call upon arrival. Stay safe! Emergency updates: {tracking_link}",
        category: "emergency",
        tags: ["emergency", "eta"]
      },
      {
        id: "afterhours",
        name: "After-Hours Request",
        description: "When office is closed",
        template_body: "Hi {customer_name}, we received your after-hours request. Our on-call technician will contact you within 30 minutes. For true emergencies (no heat/cool, gas leak, electrical), we're here 24/7: {emergency_phone}",
        category: "emergency",
        tags: ["after-hours", "on-call"]
      },
      {
        id: "emg-temp",
        name: "Temporary Fix Complete",
        description: "When temporary repair made",
        template_body: "Hi {customer_name}, {tech_name} completed a temporary repair. Your system is working but needs follow-up service. Schedule permanent fix: {booking_link}. Temporary fix warranty: 30 days.",
        category: "emergency",
        tags: ["temporary", "fix"]
      }
    ]
  },
  {
    id: "quotes",
    name: "Quotes & Estimates",
    description: "New system quotes and pricing",
    icon: "FileText",
    templates: [
      {
        id: "quote-request",
        name: "Quote Request Received",
        description: "Acknowledge quote request",
        template_body: "Hi {customer_name}, we received your quote request for {system_type}. Our estimator will contact you within 24 hours to schedule a free in-home consultation. Questions? Call {company_phone}",
        category: "quotes",
        tags: ["quote", "estimate"]
      },
      {
        id: "quote-ready",
        name: "Quote Ready",
        description: "When estimate is prepared",
        template_body: "Hi {customer_name}, your {system_type} quote is ready! Total: ${quote_total}. Review details: {quote_link}. This quote is valid for 30 days. Questions? Call {company_phone} to discuss options.",
        category: "quotes",
        tags: ["quote", "ready"]
      },
      {
        id: "quote-followup",
        name: "Quote Follow-up",
        description: "3 days after quote sent",
        template_body: "Hi {customer_name}, following up on your {system_type} quote (${quote_total}). Any questions? We offer financing options! Call {company_phone} to discuss or schedule installation. Quote expires in {days_remaining} days.",
        category: "quotes",
        tags: ["quote", "follow-up"]
      },
      {
        id: "quote-expiring",
        name: "Quote Expiring Soon",
        description: "7 days before expiration",
        template_body: "Hi {customer_name}, your {system_type} quote expires in 7 days. Current pricing: ${quote_total}. Lock in this price by scheduling now: {booking_link} or call {company_phone}. Prices subject to change after expiration.",
        category: "quotes",
        tags: ["quote", "expiring"]
      }
    ]
  },
  {
    id: "billing",
    name: "Billing & Payments",
    description: "Invoices, payments, and reminders",
    icon: "CreditCard",
    templates: [
      {
        id: "inv-sent",
        name: "Invoice Sent",
        description: "When invoice is generated",
        template_body: "Hi {customer_name}, your invoice for {job_type} is ready! Amount due: ${amount_due}. Pay online: {invoice_link}. Payment due: {due_date}. Questions? Call {company_phone}",
        category: "billing",
        tags: ["invoice", "payment"]
      },
      {
        id: "inv-reminder",
        name: "Payment Reminder",
        description: "3 days before due date",
        template_body: "Hi {customer_name}, friendly reminder: Invoice #{invoice_number} (${amount_due}) is due in 3 days. Pay easily online: {invoice_link} or call {company_phone}. Thank you!",
        category: "billing",
        tags: ["reminder", "due"]
      },
      {
        id: "inv-overdue",
        name: "Overdue Notice",
        description: "After due date passed",
        template_body: "Hi {customer_name}, Invoice #{invoice_number} (${amount_due}) is now overdue. Please submit payment to avoid late fees: {invoice_link}. Need to discuss? Call {company_phone}. We're happy to help!",
        category: "billing",
        tags: ["overdue", "late"]
      },
      {
        id: "pay-confirm",
        name: "Payment Confirmation",
        description: "After payment received",
        template_body: "Thank you {customer_name}! Payment of ${amount_paid} received for Invoice #{invoice_number}. Receipt: {receipt_link}. Balance: ${remaining_balance}. Thank you for your business!",
        category: "billing",
        tags: ["payment", "confirmed"]
      }
    ]
  }
]

// Get all templates as flat array
export const allTemplates = smsTemplateCategories.flatMap(cat => cat.templates)

// Get popular templates
export const popularTemplates = allTemplates.filter(t => t.isPopular)

// Get templates by tag
export function getTemplatesByTag(tag: string): SMSTemplate[] {
  return allTemplates.filter(t => t.tags.includes(tag))
}

// Search templates
export function searchTemplates(query: string): SMSTemplate[] {
  const lowerQuery = query.toLowerCase()
  return allTemplates.filter(t => 
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}
