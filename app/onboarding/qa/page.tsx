"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { GradientHeading } from "@/components/ui/gradient-heading";
import NeumorphButton from "@/components/ui/neumorph-button";
import { StepTab } from "@/components/ui/step-tab";
import { signIn, signOut, useSession } from "next-auth/react";

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4" />
      <span>{label}</span>
    </label>
  );
}

function OptionGroup({ title, options, value, onChange }: { title: string; options: string[]; value: string[]; onChange: (arr: string[]) => void }) {
  const toggle = (opt: string, v: boolean) => {
    if (v) onChange(Array.from(new Set([...value, opt])));
    else onChange(value.filter((x) => x !== opt));
  };
  return (
    <div>
      <div className="text-xs font-medium text-muted-foreground mb-2">{title}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => (
          <Checkbox key={opt} checked={value.includes(opt)} onChange={(v) => toggle(opt, v)} label={opt} />
        ))}
      </div>
    </div>
  );
}

export default function OnboardingQAPage() {
  const router = useRouter();
  const { status } = useSession();
  const [role, setRole] = useState<"caree" | "caregiver" | null>(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.role) setRole(parsed.role);
      } catch {}
    }
  }, []);

  const steps = useMemo(() => [
    "Emotions & Focus",
    "Communication",
    "Sensory Preferences",
    "Routines & Change",
    "Strengths & Interests",
    "Social Interaction",
  ], []);
  const stepSubtitles = useMemo(() => ([
    "Share how you typically feel day to day and how easily you can focus across different situations.",
    "Tell us the ways you prefer to communicate and how comfortable certain interactions feel for you.",
    "Help us understand which sensory inputs feel comfortable and which can be overwhelming or distracting.",
    "Describe how much routine matters to you and how changes may affect your comfort and wellbeing.",
    "Highlight the topics and activities you enjoy most, and how deeply you engage with them.",
    "Let us know how social settings feel and which cues are most helpful or challenging for you.",
  ]), []);
  
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0);
  const stepSubtitle = stepSubtitles[step] ?? "";
  const questionCounts = [3, 3, 3, 3, 3, 3];
  const advancingRef = useRef(false);

  // selections
  // Emotions & Focus
  const [anxietyFrequency, setAnxietyFrequency] = useState<string>("Rarely");
  const [focusEase, setFocusEase] = useState<number | null>(null);
  const [overwhelmFrequency, setOverwhelmFrequency] = useState<string>("Rarely");
  // Communication
  const [preferredCommunication, setPreferredCommunication] = useState<string>("Face-to-face");
  const [eyeContactComfort, setEyeContactComfort] = useState<number | null>(null);
  const [usesAAC, setUsesAAC] = useState<string>("Yes");
  // Sensory Preferences
  const [sensorySensitivity, setSensorySensitivity] = useState<number | null>(null);
  const [texturesUncomfortable, setTexturesUncomfortable] = useState<string>("Yes");
  const [sensorySeeking, setSensorySeeking] = useState<number | null>(null);
  // Routines & Change
  const [routineImportance, setRoutineImportance] = useState<number | null>(null);
  const [upsetByChange, setUpsetByChange] = useState<number | null>(null);
  const [useOrganizationTools, setUseOrganizationTools] = useState<string>("Yes");
  // Strengths & Interests
  const [favoriteHobbies, setFavoriteHobbies] = useState<string[]>(["Math"]);
  const [specialInterestTime, setSpecialInterestTime] = useState<string>("<1h");
  const [absorptionLevel, setAbsorptionLevel] = useState<number | null>(null);
  // Social Interaction
  const [socialComfort, setSocialComfort] = useState<number | null>(null);
  const [preferAloneVsOthers, setPreferAloneVsOthers] = useState<number | null>(null);
  const [hardSocialCues, setHardSocialCues] = useState<string[]>(["Facial expressions"]);

  const next = () => {
    setStep((s) => Math.min(s + 1, steps.length - 1));
    setSubStep(0);
  };
  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    setSubStep(0);
  };
  const nextSub = (count: number) => {
    setSubStep((i) => {
      const ni = i + 1;
      if (ni < count) return ni;
      // advance step and reset subStep
      if (!advancingRef.current) {
        advancingRef.current = true;
        setStep((s) => Math.min(s + 1, steps.length - 1));
        // reset guard on next tick
        setTimeout(() => { advancingRef.current = false; }, 0);
      }
      return 0;
    });
  };
  const backSub = () => {
    setSubStep((i) => {
      const ni = i - 1;
      if (ni >= 0) return ni;
      // go back a step and set subStep to last question of previous step
      let prevStepIdx = 0;
      setStep((s) => {
        prevStepIdx = Math.max(s - 1, 0);
        return prevStepIdx;
      });
      // return last substep index for the previous step
      return Math.max((questionCounts[prevStepIdx] ?? 1) - 1, 0);
    });
  };

  const persist = () => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("onboardingData") : null;
    const prev = raw ? JSON.parse(raw) : {};
    const autismProfile = {
      anxietyFrequency,
      focusEase: focusEase ?? undefined,
      overwhelmFrequency,
      preferredCommunication,
      eyeContactComfort: eyeContactComfort ?? undefined,
      usesAAC,
      sensorySensitivity: sensorySensitivity ?? undefined,
      texturesUncomfortable,
      sensorySeeking: sensorySeeking ?? undefined,
      routineImportance: routineImportance ?? undefined,
      upsetByChange: upsetByChange ?? undefined,
      useOrganizationTools,
      favoriteHobbies,
      specialInterestTime,
      absorptionLevel: absorptionLevel ?? undefined,
      socialComfort: socialComfort ?? undefined,
      preferAloneVsOthers: preferAloneVsOthers ?? undefined,
      hardSocialCues,
    };
    const data = { ...prev, autismProfile };
    if (typeof window !== "undefined") {
      localStorage.setItem("onboardingData", JSON.stringify(data));
      // Mark onboarding completed for middleware with a short-lived cookie
      try {
        document.cookie = `onboard=1; path=/; max-age=1800`; // 30 minutes
      } catch {}
    }
    return data;
  };

  const continueToEmail = async () => {
    persist();
    if (status === "authenticated") {
      // Ensure reaching register by signing out first.
      await signOut({ callbackUrl: "/register" });
      return;
    }
    router.push("/register");
  };

  const startNewAccount = async () => {
    // For cases where user is already authenticated but wants to create a NEW account.
    persist();
    if (typeof window !== "undefined") {
      // Keep onboardingData; after signOut redirect to register and allow reuse.
    }
    await signOut({ callbackUrl: "/register" });
  };
  const continueWithGoogle = () => {
    persist();
    signIn("google", { callbackUrl: "/onboarding/oauth-finish" });
  };

  const progressPercent = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="max-w-3xl mx-auto py-14 px-4 md:px-0">
          <div className=" space-y-3">
        
        <Progress
          value={progressPercent}
          aria-label={`Progress: ${progressPercent}%`}
        />
        <div className="w-full mt-4 flex items-center justify-between">
          <div className="flex items-start justify-center max-w-[600px] flex-col">
             <GradientHeading size={'sm'} weight={'black'}>{steps[step]}</GradientHeading>
              <span className="text-sm text-muted-foreground ">{stepSubtitle}</span>
           </div>
             <div className="text-right text-xs text-muted-foreground" aria-live="polite">Step {step + 1} of {steps.length}</div>
        </div>

      
      </div>

      {step === 0 && (
       <div className="w-full flex flex-col gap-1">
      
          <CardContent className="pb-8 pt-3 px-0 space-y-6">
            {subStep === 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">How often do you feel anxious or worried?</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  {[
                    { label: 'Rarely', value: 'Rarely', desc: 'Happens infrequently' },
                    { label: 'Sometimes', value: 'Sometimes', desc: 'On and off, situational' },
                    { label: 'Often', value: 'Often', desc: 'Common or frequent' },
                  ].map(o => (
                    <StepTab
                      key={o.label}
                      step={{ title: o.label, short_description: o.desc }}
                      isActive={anxietyFrequency===o.value}
                      isCompleted={anxietyFrequency===o.value}
                      onClick={() => setAnxietyFrequency(o.value)}
                    />
                  ))}
                </div>
              </div>
            )}
            {subStep === 1 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">How easy is it to focus on tasks?</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={focusEase===n? 'primary':'secondary'} onClick={() => setFocusEase(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
            {subStep === 2 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">How often do you feel overwhelmed by noise or too much information?</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  {[
                    { label: 'Rarely', value: 'Rarely', desc: 'Seldom overwhelmed' },
                    { label: 'Sometimes', value: 'Sometimes', desc: 'Depends on environment' },
                    { label: 'Often', value: 'Often', desc: 'Regularly overwhelmed' },
                  ].map(o => (
                    <StepTab
                      key={o.label}
                      step={{ title: o.label, short_description: o.desc }}
                      isActive={overwhelmFrequency===o.value}
                      isCompleted={overwhelmFrequency===o.value}
                      onClick={() => setOverwhelmFrequency(o.value)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
           <div className="flex items-end justify-end gap-2">
            <NeumorphButton size={'small'} intent={'danger'} onClick={() => {
              if (subStep === 0) router.push("/onboarding/profile");
              else backSub();
            }}>Back</NeumorphButton>
            <NeumorphButton size={'small'} onClick={() => nextSub(3)}>Next</NeumorphButton>
          </div>
      </div>  
      )}

      {step === 1 && (
        <div className="w-full flex flex-col gap-1">
        
          <CardContent className="pb-8 pt-3 px-0 space-y-6">
            {subStep === 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Preferred communication</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {['Face-to-face','Text/email','Writing/drawing','Pictures/icons','Other'].map(o => (
                    <StepTab
                      key={o}
                      step={{ title: o, short_description: (
                        o === 'Face-to-face' ? 'Talking in person' :
                        o === 'Text/email' ? 'Messaging or email' :
                        o === 'Writing/drawing' ? 'Expressing via writing/art' :
                        o === 'Pictures/icons' ? 'Using visual symbols' :
                        'Something else'
                      ) }}
                      isActive={preferredCommunication===o}
                      isCompleted={preferredCommunication===o}
                      onClick={() => setPreferredCommunication(o)}
                    />
                  ))}
                </div>
              </div>
            )}
            {subStep === 1 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Comfort with eye contact</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={eyeContactComfort===n? 'primary':'secondary'} onClick={() => setEyeContactComfort(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
            {subStep === 2 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Do you use assistive communication?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Yes','No'].map(o => (
                    <StepTab
                      key={o}
                      step={{ title: o, short_description: o === 'Yes' ? 'AAC like devices/apps' : 'No assistive tools' }}
                      isActive={usesAAC===o}
                      isCompleted={usesAAC===o}
                      onClick={() => setUsesAAC(o)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
             <div className="flex items-end justify-end gap-2">
            <NeumorphButton size={'small'} intent={'danger'} onClick={() => {
              if (subStep === 0) back(); else backSub();
            }}>Back</NeumorphButton>
            <NeumorphButton size={'small'} onClick={() => nextSub(3)}>Next</NeumorphButton>
         </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full flex flex-col gap-1">
          <CardContent className="pb-8 pt-3 px-0 space-y-6">
            {subStep === 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Sensitivity to sounds or lights</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={sensorySensitivity===n? 'primary':'secondary'} onClick={() => setSensorySensitivity(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
            {subStep === 1 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Touch/clothing textures uncomfortable?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Yes','No'].map(o => (
                    <StepTab
                      key={o}
                      step={{ title: o, short_description: o === 'Yes' ? 'Textures often feel uncomfortable' : 'Textures are generally fine' }}
                      isActive={texturesUncomfortable===o}
                      isCompleted={texturesUncomfortable===o}
                      onClick={() => setTexturesUncomfortable(o)}
                    />
                  ))}
                </div>
              </div>
            )}
            {subStep === 2 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Do you seek sensory activities?</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={sensorySeeking===n? 'primary':'secondary'} onClick={() => setSensorySeeking(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <div className="flex items-end justify-end gap-2">
            <NeumorphButton size={'small'} intent={'danger'} onClick={() => { if (subStep===0) back(); else backSub(); }}>Back</NeumorphButton>
            <NeumorphButton size={'small'} onClick={() => nextSub(3)}>Next</NeumorphButton>
         </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full flex flex-col gap-1">
         
          <CardContent className="pb-8 pt-3 px-0 space-y-6">
            {subStep === 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Importance of daily routine</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={routineImportance===n? 'primary':'secondary'} onClick={() => setRoutineImportance(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
            {subStep === 1 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">How upset are you by unexpected changes?</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={upsetByChange===n? 'primary':'secondary'} onClick={() => setUpsetByChange(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
            {subStep === 2 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Use tools like alarms or checklists?</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Yes','No'].map(o => (
                    <StepTab
                      key={o}
                      step={{ title: o, short_description: o === 'Yes' ? 'You rely on tools to stay organized' : 'You rarely use organization tools' }}
                      isActive={useOrganizationTools===o}
                      isCompleted={useOrganizationTools===o}
                      onClick={() => setUseOrganizationTools(o)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <div className="flex items-end justify-end gap-2">
            <NeumorphButton size={'small'} intent={'danger'} onClick={() => { if (subStep===0) back(); else backSub(); }}>Back</NeumorphButton>
            <NeumorphButton size={'small'} onClick={() => nextSub(3)}>Next</NeumorphButton>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full flex flex-col gap-1">
          
          <CardContent className="pb-8 pt-3 px-0 space-y-6">
            {subStep === 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Favorite subjects/hobbies (select up to 3)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {['Math','Science','Art','Music','Computers','Animals','Video games','Other'].map(o => {
                    const active = favoriteHobbies.includes(o);
                    return (
                      <StepTab
                        key={o}
                        step={{ title: o, short_description: (
                          o === 'Math' ? 'Numbers, logic, problem-solving' :
                          o === 'Science' ? 'Experiments, discovery, nature' :
                          o === 'Art' ? 'Drawing, painting, design' :
                          o === 'Music' ? 'Listening, playing instruments' :
                          o === 'Computers' ? 'Programming, hardware, tech' :
                          o === 'Animals' ? 'Pets, wildlife, care' :
                          o === 'Video games' ? 'Play, strategy, storytelling' :
                          'Anything else you enjoy'
                        ) }}
                        isActive={active}
                        isCompleted={active}
                        onClick={() => {
                          const set = new Set(favoriteHobbies);
                          if (active) set.delete(o); else if (set.size<3) set.add(o);
                          setFavoriteHobbies(Array.from(set));
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            {subStep === 1 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Time spent on special interest daily</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {["<1h","1–3h","3+h"].map(o => (
                    <StepTab
                      key={o}
                      step={{ title: o, short_description: (
                        o === '<1h' ? 'Short daily time' :
                        o === '1–3h' ? 'Moderate daily time' :
                        'Extended daily time'
                      ) }}
                      isActive={specialInterestTime===o}
                      isCompleted={specialInterestTime===o}
                      onClick={() => setSpecialInterestTime(o)}
                    />
                  ))}
                </div>
              </div>
            )}
            {subStep === 2 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Absorption when doing something you enjoy</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={absorptionLevel===n? 'primary':'secondary'} onClick={() => setAbsorptionLevel(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <div className="flex items-end justify-end gap-2">
            <NeumorphButton size={'small'} intent={'danger'} onClick={() => { if (subStep===0) back(); else backSub(); }}>Back</NeumorphButton>
            <NeumorphButton size={'small'} onClick={() => nextSub(3)}>Next</NeumorphButton>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="w-full flex flex-col gap-1">
       
          <CardContent className="pb-8 pt-3 px-0 space-y-6">
            {subStep === 0 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Comfort with social situations</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={socialComfort===n? 'primary':'secondary'} onClick={() => setSocialComfort(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
            {subStep === 1 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Prefer being with others or alone?</div>
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5].map(n => (
                    <NeumorphButton key={n} size={'small'} intent={preferAloneVsOthers===n? 'primary':'secondary'} onClick={() => setPreferAloneVsOthers(n)}>{n}</NeumorphButton>
                  ))}
                </div>
              </div>
            )}
            {subStep === 2 && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Hard social cues (select all that apply)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  {["Facial expressions","Jokes/sarcasm","Timing of talking/listening","Nonverbal cues","Eye contact"].map(o => {
                    const active = hardSocialCues.includes(o);
                    return (
                      <StepTab
                        key={o}
                        step={{ title: o, short_description: (
                          o === 'Facial expressions' ? 'Reading emotions from faces' :
                          o === 'Jokes/sarcasm' ? 'Understanding humor or tone' :
                          o === 'Timing of talking/listening' ? 'Knowing when to speak' :
                          o === 'Nonverbal cues' ? 'Gestures and body language' :
                          'Comfort with making eye contact'
                        ) }}
                        isActive={active}
                        isCompleted={active}
                        onClick={() => {
                          const set = new Set(hardSocialCues);
                          if (active) set.delete(o); else set.add(o);
                          setHardSocialCues(Array.from(set));
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
          <div className="flex w-full items-end justify-between">
              <NeumorphButton size={'small'} intent={'danger'} onClick={() => { if (subStep===0) back(); else backSub(); }}>Back</NeumorphButton>
              <NeumorphButton size={'small'} onClick={() => { if (subStep<2) nextSub(3); else { persist(); router.push("/register"); } }}>Continue</NeumorphButton>
            </div>
          </div>
    
      )}
      
    </div>
  );
}
