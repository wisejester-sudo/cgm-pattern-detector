import { createClient } from "@/lib/supabase/server"

export async function getCompanyByUserId(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("owner_id", userId)
    .single()

  if (error) {
    console.error("Error fetching company:", error)
    return null
  }

  return data
}

export async function createCompany(
  userId: string,
  name: string,
  phone: string,
  address?: string
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("companies")
    .insert({
      owner_id: userId,
      name,
      phone,
      address,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating company:", error)
    throw error
  }

  return data
}

export async function updateCompany(
  userId: string,
  updates: {
    name?: string
    phone?: string
    address?: string
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("owner_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating company:", error)
    throw error
  }

  return data
}
