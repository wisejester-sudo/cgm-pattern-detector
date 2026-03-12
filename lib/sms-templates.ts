/**
 * SMS Templates for automated customer notifications
 */

export interface TemplateParams {
  techName?: string
  eta?: string
  cost?: string
  link?: string
  companyName?: string
}

export const templates = {
  en_route: (params: TemplateParams) => 
    `Your technician ${params.techName || "is"} is on the way! ETA: ${params.eta || "Soon"}. Track progress: ${params.link || ""}`,
  
  working: (params: TemplateParams) => 
    `${params.techName || "Your technician"} has arrived and is diagnosing the issue. View updates: ${params.link || ""}`,
  
  issue_found: (params: TemplateParams) => 
    `Issue found. Estimated repair cost: $${params.cost || "TBD"}. Reply YES to approve work. Details: ${params.link || ""}`,
  
  complete: (params: TemplateParams) => 
    `Great news! Work is complete by ${params.techName || "your technician"}. View photos: ${params.link || ""}`,
  
  scheduled: (params: TemplateParams) =>
    `Your service appointment with ${params.companyName || "us"} has been scheduled. ${params.techName ? `Technician: ${params.techName}` : ""} View details: ${params.link || ""}`,
  
  photo_update: (params: TemplateParams) =>
    `${params.techName || "Your technician"} has sent you a photo update. View here: ${params.link || ""}`,
}

export type TemplateType = keyof typeof templates

/**
 * Get the appropriate template for a job status
 */
export function getTemplateForStatus(status: string): TemplateType {
  switch (status) {
    case "en_route":
      return "en_route"
    case "working":
      return "working"
    case "complete":
      return "complete"
    case "scheduled":
    default:
      return "scheduled"
  }
}

/**
 * Render an SMS message from a template
 */
export function renderSMSTemplate(
  templateType: TemplateType,
  params: TemplateParams
): string {
  const template = templates[templateType]
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`)
  }
  return template(params)
}
