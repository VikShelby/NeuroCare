"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  User, 
  Mail, 
  Calendar, 
  Brain, 
  Activity, 
  MessageSquare, 
  Eye,
  Sparkles,
  Heart,
  Users,
  Zap,
  ChevronRight,
  Shield
} from "lucide-react"

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

const ProfileStat = ({ value, label, color = "blue" }: { value: number | string, label: string, color?: string }) => {
  const colorClasses = {
    blue: "from-[#007AFF] to-[#5856D6]",
    green: "from-[#34C759] to-[#30D158]",
    orange: "from-[#FF9500] to-[#FF3B30]",
    purple: "from-[#AF52DE] to-[#5856D6]"
  }
  
  return (
    <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-4 shadow-sm">
      <div className={`text-2xl font-bold bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} bg-clip-text text-transparent`}>
        {typeof value === 'number' ? `${value}/5` : value}
      </div>
      <div className="text-[13px] text-[#8E8E93] mt-1">{label}</div>
    </div>
  )
}

const ProfileSection = ({ 
  title, 
  icon: Icon, 
  children 
}: { 
  title: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  children: React.ReactNode 
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-sm overflow-hidden"
  >
    <div className="px-5 py-4 border-b border-[#E5E5EA] dark:border-[#3A3A3C]">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#8E8E93]" />
        </div>
        <h2 className="text-[17px] font-semibold text-[#1C1C1E] dark:text-white">{title}</h2>
      </div>
    </div>
    <div className="p-5">
      {children}
    </div>
  </motion.div>
)

const ProfileRow = ({ label, value, icon: Icon }: { label: string, value: string, icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#E5E5EA] dark:border-[#3A3A3C] last:border-0">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-4 h-4 text-[#8E8E93]" />}
      <span className="text-[15px] text-[#8E8E93]">{label}</span>
    </div>
    <span className="text-[15px] text-[#1C1C1E] dark:text-white font-medium">{value}</span>
  </div>
)

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "warning" }) => {
  const variants = {
    default: "bg-[#F2F2F7] dark:bg-[#3A3A3C] text-[#1C1C1E] dark:text-white",
    success: "bg-[#34C759]/10 text-[#34C759]",
    warning: "bg-[#FF9500]/10 text-[#FF9500]"
  }
  
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-[13px] font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1C1C1E] dark:text-white">Profile</h1>
        </div>
        <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-8 shadow-sm">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            <span className="text-[#8E8E93]">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1C1C1E] dark:text-white">Profile</h1>
        </div>
        <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#F2F2F7] dark:bg-[#3A3A3C] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[#8E8E93]" />
          </div>
          <h3 className="text-lg font-medium text-[#1C1C1E] dark:text-white mb-2">Profile Not Found</h3>
          <p className="text-[#8E8E93] text-sm mb-6">Unable to load your profile information</p>
          <button 
            onClick={() => router.push("/dashboard/caree")}
            className="px-6 py-2.5 bg-[#007AFF] text-white rounded-full text-sm font-medium hover:bg-[#0056CC] transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const ap = profile.autismProfile

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#007AFF] to-[#5856D6] rounded-2xl p-6 shadow-lg shadow-[#007AFF]/20 mx-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-3xl font-bold text-white">
            {(profile.name || profile.email || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile.name || "Your Profile"}</h1>
            <p className="text-white/70 text-sm mt-1">{profile.email}</p>
            {profile.role && (
              <span className="inline-flex mt-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-white text-xs font-medium">
                {profile.role}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {ap && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ap.socialComfort !== undefined && (
            <ProfileStat value={ap.socialComfort} label="Social Comfort" color="blue" />
          )}
          {ap.focusEase !== undefined && (
            <ProfileStat value={ap.focusEase} label="Focus Ease" color="green" />
          )}
          {ap.routineImportance !== undefined && (
            <ProfileStat value={ap.routineImportance} label="Routine Need" color="purple" />
          )}
          {ap.sensorySensitivity !== undefined && (
            <ProfileStat value={ap.sensorySensitivity} label="Sensory Level" color="orange" />
          )}
        </div>
      )}

      {/* Basic Info */}
      <ProfileSection title="Basic Information" icon={User}>
        {profile.name && <ProfileRow label="Name" value={profile.name} icon={User} />}
        <ProfileRow label="Email" value={profile.email} icon={Mail} />
        {profile.dateOfBirth && (
          <ProfileRow 
            label="Date of Birth" 
            value={new Date(profile.dateOfBirth).toLocaleDateString()} 
            icon={Calendar} 
          />
        )}
        {profile.pronouns && <ProfileRow label="Pronouns" value={profile.pronouns} />}
        {profile.gender && <ProfileRow label="Gender" value={profile.gender} />}
      </ProfileSection>

      {/* Autism Profile */}
      {ap && (
        <>
          {/* Diagnosis */}
          {(ap.diagnosis || ap.formalDiagnosis) && (
            <ProfileSection title="Diagnosis" icon={Shield}>
              <div className="flex flex-wrap gap-2">
                {ap.diagnosis && <Badge>{ap.diagnosis}</Badge>}
                {ap.formalDiagnosis && <Badge variant="success">{ap.formalDiagnosis}</Badge>}
              </div>
            </ProfileSection>
          )}

          {/* Emotions & Focus */}
          {(ap.anxietyFrequency || ap.overwhelmFrequency) && (
            <ProfileSection title="Emotions & Focus" icon={Activity}>
              {ap.anxietyFrequency && (
                <ProfileRow label="Anxiety Frequency" value={ap.anxietyFrequency} icon={Heart} />
              )}
              {ap.overwhelmFrequency && (
                <ProfileRow label="Overwhelm Frequency" value={ap.overwhelmFrequency} icon={Zap} />
              )}
            </ProfileSection>
          )}

          {/* Communication */}
          {(ap.preferredCommunication || ap.eyeContactComfort !== undefined || ap.usesAAC) && (
            <ProfileSection title="Communication" icon={MessageSquare}>
              {ap.preferredCommunication && (
                <ProfileRow label="Preferred Method" value={ap.preferredCommunication} icon={MessageSquare} />
              )}
              {ap.eyeContactComfort !== undefined && (
                <ProfileRow label="Eye Contact Comfort" value={`${ap.eyeContactComfort}/5`} icon={Eye} />
              )}
              {ap.usesAAC && (
                <ProfileRow label="Uses AAC" value={ap.usesAAC} />
              )}
            </ProfileSection>
          )}

          {/* Strengths & Interests */}
          {(ap.favoriteHobbies?.length || ap.specialInterestTime) && (
            <ProfileSection title="Strengths & Interests" icon={Sparkles}>
              {ap.favoriteHobbies && ap.favoriteHobbies.length > 0 && (
                <div className="mb-4">
                  <div className="text-[13px] text-[#8E8E93] mb-2">Favorite Hobbies</div>
                  <div className="flex flex-wrap gap-2">
                    {ap.favoriteHobbies.map((hobby, i) => (
                      <Badge key={i}>{hobby}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {ap.specialInterestTime && (
                <ProfileRow label="Time on Interests" value={ap.specialInterestTime} />
              )}
            </ProfileSection>
          )}

          {/* Social */}
          {ap.hardSocialCues && ap.hardSocialCues.length > 0 && (
            <ProfileSection title="Social Interaction" icon={Users}>
              <div className="text-[13px] text-[#8E8E93] mb-2">Challenging Social Cues</div>
              <div className="flex flex-wrap gap-2">
                {ap.hardSocialCues.map((cue, i) => (
                  <Badge key={i} variant="warning">{cue}</Badge>
                ))}
              </div>
            </ProfileSection>
          )}
        </>
      )}

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => router.push("/dashboard/caree")}
        className="w-full py-4 bg-white dark:bg-[#2C2C2E] rounded-2xl shadow-sm text-[#007AFF] font-medium flex items-center justify-center gap-2 hover:bg-[#F2F2F7] dark:hover:bg-[#3A3A3C] transition-colors"
      >
        Back to Dashboard
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </div>
  )
}
