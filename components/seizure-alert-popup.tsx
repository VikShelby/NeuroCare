"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Phone, Clock, Loader2, CheckCircle } from "lucide-react";

interface SeizureAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  caree: {
    name: string;
    email: string;
  };
}

// Emergency phone number - change this to test with your own number
const EMERGENCY_PHONE_NUMBER = "+355696697667"; // Replace with your test number

export function SeizureAlertPopup() {
  const [alerts, setAlerts] = useState<SeizureAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [isCallingEmergency, setIsCallingEmergency] = useState(false);
  const [callStatus, setCallStatus] = useState<"idle" | "calling" | "success" | "error">("idle");
  const [callMessage, setCallMessage] = useState("");

  // Poll for new alerts
  const checkAlerts = useCallback(async () => {
    try {
      console.log("[SeizureAlertPopup] Polling for alerts...");
      const res = await fetch("/api/notifications/check-alerts");
      const data = await res.json();
      console.log("[SeizureAlertPopup] Response:", data);
      
      if (res.ok && data.alerts && data.alerts.length > 0) {
        console.log("[SeizureAlertPopup] Found", data.alerts.length, "alerts!");
        // Add new alerts that haven't been dismissed
        const newAlerts = data.alerts.filter(
          (a: SeizureAlert) => !dismissed.has(a.id)
        );
        if (newAlerts.length > 0) {
          setAlerts((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const unique = newAlerts.filter(
              (a: SeizureAlert) => !existingIds.has(a.id)
            );
            return [...prev, ...unique];
          });
        }
      }
    } catch (err) {
      console.error("[SeizureAlertPopup] Error:", err);
    }
  }, [dismissed]);

  useEffect(() => {
    console.log("[SeizureAlertPopup] Component mounted, starting polling");
    // Check immediately
    checkAlerts();

    // Poll every 3 seconds
    const interval = setInterval(checkAlerts, 3000);

    return () => clearInterval(interval);
  }, [checkAlerts]);

  const dismissAlert = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    setCallStatus("idle");
    setCallMessage("");

    // Also tell server to mark as read
    fetch("/api/notifications/dismiss-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId: id }),
    }).catch(() => {});
  };

  const dismissAll = () => {
    alerts.forEach((a) => dismissAlert(a.id));
  };

  // Call emergency services using ElevenLabs
  const handleCallEmergency = async () => {
    setIsCallingEmergency(true);
    setCallStatus("calling");
    setCallMessage("Initiating emergency call...");

    try {
      const response = await fetch("/api/make-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          recipientPhoneNumber: EMERGENCY_PHONE_NUMBER,
          // Pass caree info for the AI agent context
          context: {
            careeName: alerts[0]?.caree?.name,
            alertType: alerts[0]?.type,
            timestamp: alerts[0]?.timestamp,
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCallStatus("success");
        setCallMessage(`Call connected! ID: ${data.call_id}`);
      } else {
        setCallStatus("error");
        setCallMessage(data.error || "Failed to initiate call");
      }
    } catch (error) {
      setCallStatus("error");
      setCallMessage("Network error - could not connect");
    } finally {
      setIsCallingEmergency(false);
    }
  };

  if (alerts.length === 0) return null;

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={dismissAll}
      >
        {/* Alert Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Red Header */}
          <div className="bg-red-500 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {alerts[0]?.title || "EMERGENCY ALERT"}
                  </h2>
                  <p className="text-red-100 text-sm">Immediate attention required</p>
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alerts[0]?.id)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Caree Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {alerts[0]?.caree?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {alerts[0]?.caree?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">{alerts[0]?.caree?.email}</p>
              </div>
            </div>

            {/* Alert Message */}
            <p className="text-gray-700 mb-6 text-center">
              {alerts[0]?.message}
            </p>

            {/* Time */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Clock className="w-4 h-4" />
              <span>
                {alerts[0]?.timestamp
                  ? new Date(alerts[0].timestamp).toLocaleTimeString()
                  : "Just now"}
              </span>
            </div>

            {/* Call Status Message */}
            {callMessage && (
              <div className={`mb-4 p-3 rounded-lg text-center text-sm ${
                callStatus === "success" ? "bg-green-50 text-green-700" :
                callStatus === "error" ? "bg-red-50 text-red-700" :
                "bg-blue-50 text-blue-700"
              }`}>
                {callStatus === "success" && <CheckCircle className="w-4 h-4 inline mr-2" />}
                {callMessage}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleCallEmergency}
                disabled={isCallingEmergency || callStatus === "success"}
                className={`w-full py-3 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  callStatus === "success" 
                    ? "bg-green-500 text-white cursor-default"
                    : isCallingEmergency
                    ? "bg-red-400 text-white cursor-wait"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isCallingEmergency ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Calling...
                  </>
                ) : callStatus === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Call Connected
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Call Emergency Services
                  </>
                )}
              </button>
              <button
                onClick={() => dismissAlert(alerts[0]?.id)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                I'm responding - Dismiss Alert
              </button>
            </div>

            {/* Multiple alerts indicator */}
            {alerts.length > 1 && (
              <p className="text-center text-sm text-gray-400 mt-4">
                +{alerts.length - 1} more alert{alerts.length > 2 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
