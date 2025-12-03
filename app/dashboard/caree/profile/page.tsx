"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Mail, Calendar, Brain, Activity } from "lucide-react"
import { GradientHeading } from "@/components/ui/gradient-heading"

interface UserProfile {
  email: string
  name?: string
  dateOfBirth?: string
  role?: string
  gender?: string
  pronouns?: string
  autismProfile?: {
    diagnosis?: string
    formalDiagnosis?: string
    anxietyFrequency?: string
    focusEase?: number
    overwhelmFrequency?: string
    preferredCommunication?: string
    eyeContactComfort?: number
    usesAAC?: string
    sensorySensitivity?: number
    texturesUncomfortable?: string
    sensorySeeking?: number
    routineImportance?: number
    upsetByChange?: number
    useOrganizationTools?: string
    favoriteHobbies?: string[]
    specialInterestTime?: string
    absorptionLevel?: number
    socialComfort?: number
    preferAloneVsOthers?: number
    hardSocialCues?: string[]
  }
}

export default function CareeProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile/me")
      const data = await res.json()
      if (data.user) {
        setProfile(data.user)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === "loading") {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ap = profile.autismProfile

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-8">
        <GradientHeading size="lg" weight="black">
          Your Profile
        </GradientHeading>
        <p className="text-muted-foreground mt-2">
          View your personal information and autism profile details
        </p>
      </div>

      {/* Basic Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Name</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{profile.name || "Not provided"}</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
            </div>
            {profile.dateOfBirth && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Date of Birth</div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </div>
            )}
            {profile.pronouns && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Pronouns</div>
                <span>{profile.pronouns}</span>
              </div>
            )}
            {profile.gender && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Gender</div>
                <span>{profile.gender}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Autism Profile */}
      {ap && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Autism Spectrum Profile
            </CardTitle>
            <CardDescription>
              Information about your diagnosis and support needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Diagnosis */}
            {(ap.diagnosis || ap.formalDiagnosis) && (
              <div>
                <div className="text-sm font-semibold mb-2">Diagnosis</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ap.diagnosis && (
                    <div>
                      <span className="text-xs text-muted-foreground">ASD Level:</span>
                      <Badge variant="outline" className="ml-2">{ap.diagnosis}</Badge>
                    </div>
                  )}
                  {ap.formalDiagnosis && (
                    <div>
                      <span className="text-xs text-muted-foreground">Formal Diagnosis:</span>
                      <Badge variant="outline" className="ml-2">{ap.formalDiagnosis}</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Emotions & Focus */}
            {(ap.anxietyFrequency || ap.focusEase !== undefined || ap.overwhelmFrequency) && (
              <div>
                <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Emotions & Focus
                </div>
                <div className="space-y-2 text-sm">
                  {ap.anxietyFrequency && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Anxiety Frequency:</span>
                      <span>{ap.anxietyFrequency}</span>
                    </div>
                  )}
                  {ap.focusEase !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Focus Ease:</span>
                      <span>{ap.focusEase}/5</span>
                    </div>
                  )}
                  {ap.overwhelmFrequency && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Overwhelm Frequency:</span>
                      <span>{ap.overwhelmFrequency}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Communication */}
            {(ap.preferredCommunication || ap.eyeContactComfort !== undefined || ap.usesAAC) && (
              <div>
                <div className="text-sm font-semibold mb-2">Communication</div>
                <div className="space-y-2 text-sm">
                  {ap.preferredCommunication && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preferred Method:</span>
                      <span>{ap.preferredCommunication}</span>
                    </div>
                  )}
                  {ap.eyeContactComfort !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eye Contact Comfort:</span>
                      <span>{ap.eyeContactComfort}/5</span>
                    </div>
                  )}
                  {ap.usesAAC && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uses AAC:</span>
                      <span>{ap.usesAAC}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sensory Preferences */}
            {(ap.sensorySensitivity !== undefined || ap.texturesUncomfortable || ap.sensorySeeking !== undefined) && (
              <div>
                <div className="text-sm font-semibold mb-2">Sensory Preferences</div>
                <div className="space-y-2 text-sm">
                  {ap.sensorySensitivity !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sensory Sensitivity:</span>
                      <span>{ap.sensorySensitivity}/5</span>
                    </div>
                  )}
                  {ap.texturesUncomfortable && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Textures Uncomfortable:</span>
                      <span>{ap.texturesUncomfortable}</span>
                    </div>
                  )}
                  {ap.sensorySeeking !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sensory Seeking:</span>
                      <span>{ap.sensorySeeking}/5</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Routines & Change */}
            {(ap.routineImportance !== undefined || ap.upsetByChange !== undefined || ap.useOrganizationTools) && (
              <div>
                <div className="text-sm font-semibold mb-2">Routines & Change</div>
                <div className="space-y-2 text-sm">
                  {ap.routineImportance !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Routine Importance:</span>
                      <span>{ap.routineImportance}/5</span>
                    </div>
                  )}
                  {ap.upsetByChange !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Upset by Change:</span>
                      <span>{ap.upsetByChange}/5</span>
                    </div>
                  )}
                  {ap.useOrganizationTools && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uses Organization Tools:</span>
                      <span>{ap.useOrganizationTools}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Strengths & Interests */}
            {(ap.favoriteHobbies || ap.specialInterestTime || ap.absorptionLevel !== undefined) && (
              <div>
                <div className="text-sm font-semibold mb-2">Strengths & Interests</div>
                <div className="space-y-2 text-sm">
                  {ap.favoriteHobbies && ap.favoriteHobbies.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Favorite Hobbies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ap.favoriteHobbies.map((hobby, i) => (
                          <Badge key={i} variant="secondary">{hobby}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {ap.specialInterestTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time on Interests:</span>
                      <span>{ap.specialInterestTime}</span>
                    </div>
                  )}
                  {ap.absorptionLevel !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Absorption Level:</span>
                      <span>{ap.absorptionLevel}/5</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Interaction */}
            {(ap.socialComfort !== undefined || ap.preferAloneVsOthers !== undefined || ap.hardSocialCues) && (
              <div>
                <div className="text-sm font-semibold mb-2">Social Interaction</div>
                <div className="space-y-2 text-sm">
                  {ap.socialComfort !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Social Comfort:</span>
                      <span>{ap.socialComfort}/5</span>
                    </div>
                  )}
                  {ap.preferAloneVsOthers !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prefer Alone vs Others:</span>
                      <span>{ap.preferAloneVsOthers}/5</span>
                    </div>
                  )}
                  {ap.hardSocialCues && ap.hardSocialCues.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Challenging Social Cues:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ap.hardSocialCues.map((cue, i) => (
                          <Badge key={i} variant="secondary">{cue}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={() => router.push("/dashboard/caree")}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  )
}
