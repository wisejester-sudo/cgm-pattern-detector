"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";

const variables = [
  { name: "{{customer_name}}", description: "Customer's full name" },
  { name: "{{tech_name}}", description: "Technician's name" },
  { name: "{{status}}", description: "Current job status" },
  { name: "{{eta}}", description: "Estimated time of arrival" },
  { name: "{{company_name}}", description: "Your company name" },
];

const defaultTemplate = `Hi {{customer_name}},

This is {{tech_name}} from {{company_name}}. I'm {{status}} for your service appointment.

{{eta}}

Reply to this message if you have any questions!`;

export default function SettingsPage() {
  const [template, setTemplate] = useState(defaultTemplate);
  const [saved, setSaved] = useState(false);

  const characterCount = template.length;
  const smsLimit = 1600;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const insertVariable = (variable: string) => {
    setTemplate((prev) => prev + variable);
  };

  const previewMessage = template
    .replace("{{customer_name}}", "Sarah Johnson")
    .replace("{{tech_name}}", "Mike")
    .replace("{{company_name}}", "CoolAir HVAC")
    .replace("{{status}}", "on my way")
    .replace("{{eta}}", "I should arrive in about 15 minutes.");

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Configure your SMS templates and preferences
        </p>
      </div>

      {/* SMS Template Editor */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>SMS Template Editor</CardTitle>
            <CardDescription>
              Customize the messages sent to your customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>Message Template</FieldLabel>
                  <span
                    className={`text-xs ${
                      characterCount > smsLimit
                        ? "text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {characterCount} / {smsLimit}
                  </span>
                </div>
                <Textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </Field>

              <Field>
                <FieldLabel>Insert Variables</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {variables.map((v) => (
                    <Button
                      key={v.name}
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(v.name)}
                      title={v.description}
                    >
                      {v.name}
                    </Button>
                  ))}
                </div>
              </Field>

              <Button onClick={handleSave} className="w-full">
                {saved ? "Saved!" : "Save Template"}
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              See how your message will appear to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">SMS Preview</Badge>
              </div>
              <div className="bg-card rounded-lg p-3 shadow-sm border">
                <p className="text-sm whitespace-pre-wrap">{previewMessage}</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Available Variables</h4>
              <ul className="space-y-1.5">
                {variables.map((v) => (
                  <li key={v.name} className="text-sm">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {v.name}
                    </code>
                    <span className="text-muted-foreground ml-2">
                      {v.description}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
