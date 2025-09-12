// // // import React, { useEffect, useRef, useState } from "react";
// // // import { AnimatePresence, motion } from "framer-motion";
// // // import { Mic, MicOff, X, TestTube, Shuffle, Play, Square, Loader } from "lucide-react";
// // // import { SpeechSimulation } from "../services/speechSimulation"

// // // // Dava Brand Colors
// // // const COLORS = {
// // //   primary: "#192B37",
// // //   accent: "#F99C11",
// // //   secondary: "#F99C11",
// // //   gray: "#47555F",
// // //   lightBg: "#E8EAEB",
// // //   neutralBg: "#D1D5D7",
// // //   textSecondary: "#A3AAAF",
// // // };

// // // const speechSim = new SpeechSimulation();

// // // // Test commands for quick testing
// // // const testCommands = [
// // //   "Set temperature to 24 degrees",
// // //   "Turn up the volume",
// // //   "Turn on the lights",
// // //   "Heat the seats",
// // //   "Play some music",
// // //   "Make it cooler",
// // //   "Dim the lights",
// // //   "Stop the music",
// // //   "Volume to 50",
// // //   "Turn off climate control",
// // //   "Brighten the lights",
// // //   "Set temperature to 18"
// // // ];

// // // // --- TUNABLE UI KNOBS ---
// // // const CHAT_MAX_WIDTH_PX = 560;
// // // const SHEET_MAX_WIDTH = "max-w-3xl";
// // // const SHEET_HEIGHT = "h-[60%]";

// // // const QuickTestButtons = ({ onTestCommand, onRandomCommand, onCorruptedCommand }) => (
// // //   <div className="border-t border-white/10 p-4">
// // //     <div className="flex justify-between items-center mb-3">
// // //       <p className="text-white/70 text-sm font-medium">Quick Test Commands:</p>
// // //       <div className="flex gap-2">
// // //         <button
// // //           onClick={onRandomCommand}
// // //           className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-colors"
// // //         >
// // //           <Shuffle size={12} />
// // //           Random
// // //         </button>
// // //         <button
// // //           onClick={onCorruptedCommand}
// // //           className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-colors"
// // //         >
// // //           <TestTube size={12} />
// // //           Corrupted
// // //         </button>
// // //       </div>
// // //     </div>

// // //     <div className="grid grid-cols-2 gap-2">
// // //       {testCommands.slice(0, 8).map((cmd, i) => (
// // //         <button
// // //           key={i}
// // //           onClick={() => onTestCommand(cmd)}
// // //           className="text-xs px-3 py-2 rounded-lg bg:white/10 text-white/80 hover:bg-white/20 transition-colors text-left truncate"
// // //           title={cmd}
// // //         >
// // //           {cmd}
// // //         </button>
// // //       ))}
// // //     </div>
// // //   </div>
// // // );

// // // export default function VoiceModal({ open, onClose, dispatchAction, onNavigate, closeOnSuccess = true }) {
// // //   const [phase, setPhase] = useState("idle");
// // //   const [input, setInput] = useState("");
// // //   const [sending, setSending] = useState(false);
// // //   const [log, setLog] = useState([]);
// // //   const inputRef = useRef(null);
// // //   const chatEndRef = useRef(null);

// // //   useEffect(() => {
// // //     if (chatEndRef.current) {
// // //       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
// // //     }
// // //   }, [log]);

// // //   useEffect(() => {
// // //     if (open) {
// // //       setPhase("listening");
// // //       setLog([]);
// // //       setInput("");
// // //       setTimeout(() => inputRef.current?.focus(), 100);
// // //     } else {
// // //       try {
// // //         window.speechSynthesis?.cancel();
// // //       } catch {}
// // //       setPhase("idle");
// // //     }
// // //   }, [open]);

// // //   const speak = (text) => {
// // //     try {
// // //       const utterance = new SpeechSynthesisUtterance(text);
// // //       utterance.rate = 1;
// // //       utterance.pitch = 1;
// // //       utterance.lang = "en-US";
// // //       window.speechSynthesis?.speak(utterance);
// // //     } catch (error) {
// // //       console.log("Speech synthesis not available");
// // //     }
// // //   };

// // //   const parseCommand = async (text) => {
// // //     try {
// // //       console.log('🎯 Parsing command:', text);

// // //       const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
// // //       const response = await fetch(`${backendUrl}/api/nlp/process-voice`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ text, timestamp: Date.now() })
// // //       });

// // //       if (!response.ok) {
// // //         throw new Error(`Backend error: ${response.status}`);
// // //       }

// // //       const result = await response.json();
// // //       console.log('🎯 Backend result:', result);

// // //       if (result.confidence > 0.7) {
// // //         return {
// // //           action: result.action,
// // //           value: result.parameters,
// // //           response: `✅ ${generateResponseText(result.action, result.parameters)} (${(result.confidence * 100).toFixed(0)}% confident)`,
// // //           confidence: result.confidence,
// // //           success: true,
// // //           page: result.page
// // //         };
// // //       } else {
// // //         return {
// // //           action: null,
// // //           response: `🤔 I'm not sure about that command (${(result.confidence * 100).toFixed(0)}% confidence). Could you try rephrasing?`,
// // //           confidence: result.confidence,
// // //           success: false
// // //         };
// // //       }
// // //     } catch (error) {
// // //       console.error('❌ Voice parsing error:', error);
// // //       // Optional: add a local fallback if you have one
// // //       return {
// // //         action: null,
// // //         response: "⚠️ I couldn't process that just now. Please try again.",
// // //         success: false
// // //       };
// // //     }
// // //   };

// // //   function generateResponseText(action, parameters = {}) {
// // //     const responses = {
// // //       'climate_set_temperature': `Setting temperature to ${parameters.temperature}°C`,
// // //       'climate_turn_on': 'Turning on climate control',
// // //       'infotainment_set_volume': `Setting volume to ${parameters.volume}%`,
// // //       'lights_turn_on': 'Turning on interior lights',
// // //       'seats_heat_on': 'Activating seat heating',
// // //     };
// // //     return responses[action] || 'Command executed successfully';
// // //   }

// // //   // ✅ FIXED: make async and await parseCommand; close on success
// // //   const handleSend = async () => {
// // //     if (!input.trim() || sending) return;

// // //     setSending(true);
// // //     setPhase("processing");

// // //     const userMessage = { role: "user", text: input.trim(), id: Date.now() };
// // //     setLog((prevLog) => [...prevLog, userMessage]);

// // //     const currentInput = input.trim();
// // //     setInput("");

// // //     try {
// // //       const command = await parseCommand(currentInput); // <-- await

// // //       // If parse failed / uncertain
// // //       if (!command?.action) {
// // //         const aiMessage = { role: "ai", text: command.response, id: Date.now() + Math.random() };
// // //         setLog((prevLog) => [...prevLog, aiMessage]);
// // //         speak(command.response);
// // //         setPhase("listening");
// // //         setSending(false);
// // //         return;
// // //       }

// // //       // Success path
// // //       const aiMessage = { role: "ai", text: command.response, id: Date.now() + Math.random() };
// // //       setLog((prevLog) => [...prevLog, aiMessage]);
// // //       speak(command.response);

// // //       try {
// // //         dispatchAction?.(command.action, command.value);
// // //       } catch (error) {
// // //         console.error("Action dispatch failed:", error);
// // //       }

// // //       if (onNavigate && command.page) {
// // //         setTimeout(() => onNavigate(command.page), 400);
// // //       }

// // //       // ✅ Close after success (optionally after a tiny delay)
// // //       if (closeOnSuccess) {
// // //         try { window.speechSynthesis?.cancel(); } catch {}
// // //         onClose?.();
// // //       } else {
// // //         setPhase("listening");
// // //       }
// // //     } catch (e) {
// // //       console.error(e);
// // //       setPhase("listening");
// // //     } finally {
// // //       setSending(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (!open) return;

// // //     const handleKeydown = (e) => {
// // //       if (e.key === "Escape") {
// // //         onClose?.();
// // //       } else if (e.key === "Enter" && !e.shiftKey) {
// // //         e.preventDefault();
// // //         // fire-and-forget is fine here; handleSend handles its own async state
// // //         handleSend();
// // //       }
// // //     };

// // //     window.addEventListener("keydown", handleKeydown);
// // //     return () => window.removeEventListener("keydown", handleKeydown);
// // //   }, [open, input, sending]);

// // //   const VoiceWave = () => (
// // //     <div className="flex items-center justify-center gap-1 h-16">
// // //       {[...Array(5)].map((_, i) => (
// // //         <motion.div
// // //           key={i}
// // //           className="w-1 rounded-full"
// // //           style={{ backgroundColor: COLORS.accent }}
// // //           animate={
// // //             phase === "listening"
// // //               ? { height: ["4px", "32px", "4px"], opacity: [0.4, 1, 0.4] }
// // //               : phase === "processing"
// // //               ? { height: ["8px", "20px", "8px"], opacity: [0.6, 0.9, 0.6] }
// // //               : { height: "4px", opacity: 0.3 }
// // //           }
// // //           transition={{
// // //             duration: phase === "listening" ? 1.5 : 1,
// // //             repeat: phase === "listening" || phase === "processing" ? Infinity : 0,
// // //             delay: i * 0.1,
// // //             ease: "easeInOut",
// // //           }}
// // //         />
// // //       ))}
// // //     </div>
// // //   );

// // //   const ChatBubble = ({ message, isUser }) => (
// // //     <motion.div
// // //       className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-3`}
// // //       initial={{ opacity: 0, y: 14, scale: 0.98 }}
// // //       animate={{ opacity: 1, y: 0, scale: 1 }}
// // //       transition={{ type: "spring", stiffness: 240, damping: 22, duration: 0.35 }}
// // //     >
// // //       <div
// // //         className={`max-w-[72%] px-4 py-3 rounded-2xl shadow-md ${
// // //           isUser
// // //             ? "rounded-br-lg text-white"
// // //             : "rounded-bl-lg text-gray-900 bg-white border border-gray-200"
// // //         }`}
// // //         style={{ backgroundColor: isUser ? COLORS.accent : undefined }}
// // //       >
// // //         <p className="text-[15px] leading-6 font-medium antialiased">{message.text}</p>
// // //       </div>
// // //     </motion.div>
// // //   );

// // //   return (
// // //     <AnimatePresence mode="wait">
// // //       {open && (
// // //         <motion.div
// // //           className="fixed inset-0 z-50 flex"
// // //           initial={{ opacity: 0 }}
// // //           animate={{ opacity: 1 }}
// // //           exit={{ opacity: 0 }}
// // //           transition={{ duration: 0.25 }}
// // //         >
// // //           <div
// // //             className="absolute inset-0"
// // //             style={{
// // //               backgroundColor: "rgba(0,0,0,0.35)",
// // //               backdropFilter: "blur(4px)",
// // //               WebkitBackdropFilter: "blur(4px)",
// // //             }}
// // //             onClick={() => {
// // //               try { window.speechSynthesis?.cancel(); } catch {}
// // //               onClose?.();
// // //             }}
// // //           />

// // //           <div className="relative flex flex-col justify-end h-full w-full">
// // //             <motion.div
// // //               className={`${SHEET_HEIGHT} w-full ${SHEET_MAX_WIDTH} mx-auto flex flex-col backdrop-blur-sm border border-white/10 rounded-t-3xl items-center shadow-2xl`}
// // //               style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
// // //               initial={{ y: "100%" }}
// // //               animate={{ y: 0 }}
// // //               exit={{ y: "100%" }}
// // //               transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.35 }}
// // //             >
// // //               <motion.div
// // //                 className="flex justify-between items-center p-6 border-b border-white/10 w-full"
// // //                 initial={{ y: -16, opacity: 0 }}
// // //                 animate={{ y: 0, opacity: 1 }}
// // //                 transition={{ delay: 0.08 }}
// // //               >
// // //                 <div className="flex items-center gap-3 mx-auto">
// // //                   <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.accent }}>
// // //                     <Mic size={16} className="text-white" />
// // //                   </div>
// // //                   <div>
// // //                     <p className="text-white/80 font-bold text-m">
// // //                       {phase === "listening" ? "Listening..." : phase === "processing" ? "Thinking..." : "Ready"}
// // //                     </p>
// // //                   </div>
// // //                 </div>

// // //                 <button
// // //                   onClick={() => {
// // //                     try { window.speechSynthesis?.cancel(); } catch {}
// // //                     onClose?.();
// // //                   }}
// // //                   className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
// // //                 >
// // //                   <X size={16} className="text-white" />
// // //                 </button>
// // //               </motion.div>

// // //               <motion.div
// // //                 className="px-6 border-b border-white/10 w-full flex justify-center"
// // //                 initial={{ scale: 0.96, opacity: 0 }}
// // //                 animate={{ scale: 1, opacity: 1 }}
// // //                 transition={{ delay: 0.16 }}
// // //               >
// // //                 <VoiceWave />
// // //               </motion.div>

// // //               <div className="flex-1 px-5 py-4 overflow-hidden w-full flex justify-center">
// // //                 <div
// // //                   className="h-full overflow-y-auto w-full"
// // //                   style={{ maxWidth: CHAT_MAX_WIDTH_PX }}
// // //                 >
// // //                   {log.length === 0 ? (
// // //                     <motion.div className="text-center py-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
// // //                       <p className="text-white/80 text-sm leading-relaxed">
// // //                         Try commands like:<br />"Set temperature to 22"<br />"Turn up the volume"<br />"Turn on the lights"
// // //                       </p>
// // //                     </motion.div>
// // //                   ) : (
// // //                     <div className="space-y-2">
// // //                       {log.map((message) => (
// // //                         <ChatBubble key={message.id} message={message} isUser={message.role === "user"} />
// // //                       ))}
// // //                       <div ref={chatEndRef} />
// // //                     </div>
// // //                   )}
// // //                 </div>
// // //               </div>

// // //               <motion.div
// // //                 className="p-5 border-t border-white/10 w-full flex justify-center"
// // //                 initial={{ y: 14, opacity: 0 }}
// // //                 animate={{ y: 0, opacity: 1 }}
// // //                 transition={{ delay: 0.24 }}
// // //               >
// // //                 <div className="flex gap-3 w-full" style={{ maxWidth: CHAT_MAX_WIDTH_PX }}>
// // //                   <input
// // //                     ref={inputRef}
// // //                     value={input}
// // //                     onChange={(e) => setInput(e.target.value)}
// // //                     placeholder="Type your command..."
// // //                     className="flex-1 px-4 py-3 rounded-xl bg-white text-[#192B37] placeholder-gray-500 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3DD17B] focus:border-transparent transition-all duration-200"
// // //                     disabled={sending}
// // //                   />
// // //                   <motion.button
// // //                     onClick={handleSend}
// // //                     disabled={sending || !input.trim()}
// // //                     className="px-5 py-3 rounded-xl font-semibold text-white transition-all duration-200 disabled:opacity-50"
// // //                     style={{ backgroundColor: COLORS.accent }}
// // //                     whileHover={!sending && input.trim() ? { scale: 1.03 } : {}}
// // //                     whileTap={!sending && input.trim() ? { scale: 0.97 } : {}}
// // //                   >
// // //                     Send
// // //                   </motion.button>
// // //                 </div>
// // //               </motion.div>
// // //             </motion.div>
// // //           </div>
// // //         </motion.div>
// // //       )}
// // //     </AnimatePresence>
// // //   );
// // // }














// // import React, { useEffect, useRef, useState } from "react";
// // import { AnimatePresence, motion } from "framer-motion";
// // import { Mic, MicOff, X, TestTube, Shuffle, Play, Square, Loader } from "lucide-react";
// // import { SpeechSimulation } from "../services/speechSimulation"

// // // Dava Brand Colors
// // const COLORS = {
// //   primary: "#192B37",
// //   accent: "#F99C11",
// //   secondary: "#F99C11",
// //   gray: "#47555F",
// //   lightBg: "#E8EAEB",
// //   neutralBg: "#D1D5D7",
// //   textSecondary: "#A3AAAF",
// // };

// // const speechSim = new SpeechSimulation();

// // // Test commands for quick testing
// // const testCommands = [
// //   "Set temperature to 24 degrees",
// //   "Turn up the volume",
// //   "Turn on the lights",
// //   "Heat the seats",
// //   "Play some music",
// //   "Make it cooler",
// //   "Dim the lights",
// //   "Stop the music",
// //   "Volume to 50",
// //   "Turn off climate control",
// //   "Brighten the lights",
// //   "Set temperature to 18"
// // ];

// // // --- TUNABLE UI KNOBS ---
// // const CHAT_MAX_WIDTH_PX = 560;
// // const SHEET_MAX_WIDTH = "max-w-3xl";
// // const SHEET_HEIGHT = "h-[60%]";

// // const QuickTestButtons = ({ onTestCommand, onRandomCommand, onCorruptedCommand }) => (
// //   <div className="border-t border-white/10 p-4">
// //     <div className="flex justify-between items-center mb-3">
// //       <p className="text-white/70 text-sm font-medium">Quick Test Commands:</p>
// //       <div className="flex gap-2">
// //         <button
// //           onClick={onRandomCommand}
// //           className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition-colors"
// //         >
// //           <Shuffle size={12} />
// //           Random
// //         </button>
// //         <button
// //           onClick={onCorruptedCommand}
// //           className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-colors"
// //         >
// //           <TestTube size={12} />
// //           Corrupted
// //         </button>
// //       </div>
// //     </div>

// //     <div className="grid grid-cols-2 gap-2">
// //       {testCommands.slice(0, 8).map((cmd, i) => (
// //         <button
// //           key={i}
// //           onClick={() => onTestCommand(cmd)}
// //           className="text-xs px-3 py-2 rounded-lg bg:white/10 text-white/80 hover:bg-white/20 transition-colors text-left truncate"
// //           title={cmd}
// //         >
// //           {cmd}
// //         </button>
// //       ))}
// //     </div>
// //   </div>
// // );

// // export default function VoiceModal({ open, onClose, dispatchAction, onNavigate, closeOnSuccess = true }) {
// //   const [phase, setPhase] = useState("idle");
// //   const [input, setInput] = useState("");
// //   const [sending, setSending] = useState(false);
// //   const [log, setLog] = useState([]);
// //   const [isRecording, setIsRecording] = useState(false);
// //   const [recordingSupported, setRecordingSupported] = useState(false);
// //   const [transcriptionStatus, setTranscriptionStatus] = useState("");
  
// //   const inputRef = useRef(null);
// //   const chatEndRef = useRef(null);
// //   const mediaRecorderRef = useRef(null);
// //   const audioChunksRef = useRef([]);

// //   // Check for microphone support
// //   useEffect(() => {
// //     const checkMicrophoneSupport = async () => {
// //       try {
// //         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
// //         stream.getTracks().forEach(track => track.stop()); // Stop the test stream
// //         setRecordingSupported(true);
// //       } catch (error) {
// //         console.error("Microphone not available:", error);
// //         setRecordingSupported(false);
// //       }
// //     };
    
// //     if (open && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
// //       checkMicrophoneSupport();
// //     }
// //   }, [open]);

// //   useEffect(() => {
// //     if (chatEndRef.current) {
// //       chatEndRef.current.scrollIntoView({ behavior: "smooth" });
// //     }
// //   }, [log]);

// //   useEffect(() => {
// //     if (open) {
// //       setPhase("listening");
// //       setLog([]);
// //       setInput("");
// //       setTranscriptionStatus("");
// //       setTimeout(() => inputRef.current?.focus(), 100);
// //     } else {
// //       stopRecording();
// //       try {
// //         window.speechSynthesis?.cancel();
// //       } catch {}
// //       setPhase("idle");
// //     }
// //   }, [open]);

// //   const speak = (text) => {
// //     try {
// //       const utterance = new SpeechSynthesisUtterance(text);
// //       utterance.rate = 1;
// //       utterance.pitch = 1;
// //       utterance.lang = "en-US";
// //       window.speechSynthesis?.speak(utterance);
// //     } catch (error) {
// //       console.log("Speech synthesis not available");
// //     }
// //   };

// //   const startRecording = async () => {
// //     try {
// //       setTranscriptionStatus("Starting recording...");
      
// //       const stream = await navigator.mediaDevices.getUserMedia({ 
// //         audio: {
// //           echoCancellation: true,
// //           noiseSuppression: true,
// //           autoGainControl: true,
// //         }
// //       });
      
// //       audioChunksRef.current = [];
      
// //       // Use webm format for better compatibility
// //       const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      
// //       mediaRecorderRef.current = new MediaRecorder(stream, {
// //         mimeType: mimeType
// //       });
      
// //       mediaRecorderRef.current.ondataavailable = (event) => {
// //         if (event.data.size > 0) {
// //           audioChunksRef.current.push(event.data);
// //         }
// //       };
      
// //       mediaRecorderRef.current.onstop = async () => {
// //         const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
// //         await sendAudioForTranscription(audioBlob, mimeType.split('/')[1]);
        
// //         // Stop all tracks
// //         stream.getTracks().forEach(track => track.stop());
// //       };
      
// //       mediaRecorderRef.current.start();
// //       setIsRecording(true);
// //       setPhase("listening");
// //       setTranscriptionStatus("Recording... (tap to stop)");
      
// //     } catch (error) {
// //       console.error("Error starting recording:", error);
// //       setTranscriptionStatus("Recording failed: " + error.message);
// //       setPhase("idle");
// //     }
// //   };

// //   const stopRecording = () => {
// //     if (mediaRecorderRef.current && isRecording) {
// //       mediaRecorderRef.current.stop();
// //       setIsRecording(false);
// //       setPhase("processing");
// //       setTranscriptionStatus("Processing audio...");
// //     }
// //   };

// //   const sendAudioForTranscription = async (audioBlob, format) => {
// //     try {
// //       setPhase("processing");
// //       setTranscriptionStatus("Transcribing speech...");
      
// //       const formData = new FormData();
// //       formData.append('audio', audioBlob, `recording.${format}`);
// //       formData.append('format', format);
      
// //       const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
// //       const response = await fetch(`${backendUrl}/api/nlp/process-voice-audio`, {
// //         method: 'POST',
// //         body: formData
// //       });
      
// //       if (!response.ok) {
// //         throw new Error(`Transcription failed: ${response.status}`);
// //       }
      
// //       const result = await response.json();
// //       console.log('🎯 Voice processing result:', result);
      
// //       if (result.success && result.transcription.text) {
// //         const transcribedText = result.transcription.text;
// //         setInput(transcribedText);
        
// //         // Add transcription to log
// //         setLog(prev => [...prev, {
// //           type: "user",
// //           text: `🎤 "${transcribedText}"`,
// //           timestamp: Date.now()
// //         }]);
        
// //         // Process the command result
// //         if (result.command_result && result.command_result.confidence > 0.5) {
// //           const responseText = generateResponseText(
// //             result.command_result.action, 
// //             result.command_result.parameters,
// //             result.command_result.confidence
// //           );
          
// //           // Add assistant response to log
// //           setLog(prev => [...prev, {
// //             type: "assistant", 
// //             text: responseText,
// //             timestamp: Date.now()
// //           }]);
          
// //           // Speak the response
// //           speak(responseText);
          
// //           // Dispatch the action to update UI
// //           if (result.execution_result?.success) {
// //             const action = result.command_result.action;
// //             const parameters = result.command_result.parameters;
            
// //             // Map action to your existing dispatch format
// //             if (action.startsWith('climate_')) {
// //               dispatchAction?.({ type: "CLIMATE_UPDATE", payload: parameters });
// //             } else if (action.startsWith('lights_')) {
// //               dispatchAction?.({ type: "LIGHTS_UPDATE", payload: parameters });
// //             } else if (action.startsWith('infotainment_')) {
// //               dispatchAction?.({ type: "INFOTAINMENT_UPDATE", payload: parameters });
// //             } else if (action.startsWith('seats_')) {
// //               dispatchAction?.({ type: "SEATS_UPDATE", payload: parameters });
// //             }
// //           }
          
// //           setTranscriptionStatus("✅ Command executed successfully!");
          
// //           if (closeOnSuccess) {
// //             setTimeout(() => onClose?.(), 2000);
// //           }
// //         } else {
// //           const confidence = result.command_result?.confidence || 0;
// //           const responseText = `🤔 I heard "${transcribedText}" but I'm not sure what to do (${(confidence * 100).toFixed(0)}% confidence). Could you try rephrasing?`;
          
// //           setLog(prev => [...prev, {
// //             type: "assistant",
// //             text: responseText,
// //             timestamp: Date.now()
// //           }]);
          
// //           speak(responseText);
// //           setTranscriptionStatus("⚠️ Command unclear, please try again");
// //         }
// //       } else {
// //         throw new Error(result.error || "No speech detected");
// //       }
      
// //     } catch (error) {
// //       console.error('❌ Voice processing error:', error);
// //       const errorText = `⚠️ I couldn't process that audio. ${error.message}`;
      
// //       setLog(prev => [...prev, {
// //         type: "assistant",
// //         text: errorText,
// //         timestamp: Date.now()
// //       }]);
      
// //       setTranscriptionStatus("❌ Processing failed");
// //     } finally {
// //       setPhase("idle");
// //     }
// //   };

// //   const generateResponseText = (action, parameters, confidence) => {
// //     const confidencePercent = Math.round(confidence * 100);
    
// //     if (action.startsWith('climate_')) {
// //       if (parameters.temperature) {
// //         return `✅ Setting temperature to ${parameters.temperature}°C (${confidencePercent}% confident)`;
// //       }
// //       return `✅ Adjusting climate control (${confidencePercent}% confident)`;
// //     } else if (action.startsWith('lights_')) {
// //       if (parameters.brightness) {
// //         return `✅ Setting lights to ${parameters.brightness}% brightness (${confidencePercent}% confident)`;
// //       }
// //       return `✅ Adjusting lighting (${confidencePercent}% confident)`;
// //     } else if (action.startsWith('infotainment_')) {
// //       if (parameters.volume) {
// //         return `✅ Setting volume to ${parameters.volume} (${confidencePercent}% confident)`;
// //       }
// //       return `✅ Adjusting infotainment (${confidencePercent}% confident)`;
// //     } else if (action.startsWith('seats_')) {
// //       return `✅ Adjusting seat settings (${confidencePercent}% confident)`;
// //     }
    
// //     return `✅ Command executed (${confidencePercent}% confident)`;
// //   };

// //   // Original text processing for manual input
// //   const parseCommand = async (text) => {
// //     try {
// //       console.log('🎯 Parsing command:', text);

// //       const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
// //       const response = await fetch(`${backendUrl}/api/nlp/process-voice`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ text, timestamp: Date.now() })
// //       });

// //       if (!response.ok) {
// //         throw new Error(`Backend error: ${response.status}`);
// //       }

// //       const result = await response.json();
// //       console.log('🎯 Backend result:', result);

// //       if (result.confidence > 0.7) {
// //         return {
// //           action: result.action,
// //           value: result.parameters,
// //           response: `✅ ${generateResponseText(result.action, result.parameters, result.confidence)}`,
// //           confidence: result.confidence,
// //           success: true,
// //           page: result.page
// //         };
// //       } else {
// //         return {
// //           action: null,
// //           response: `🤔 I'm not sure about that command (${(result.confidence * 100).toFixed(0)}% confidence). Could you try rephrasing?`,
// //           confidence: result.confidence,
// //           success: false
// //         };
// //       }
// //     } catch (error) {
// //       console.error('❌ Voice parsing error:', error);
// //       return {
// //         action: null,
// //         response: "⚠️ I couldn't process that just now. Please try again.",
// //         confidence: 0,
// //         success: false,
// //         error: error.message
// //       };
// //     }
// //   };

// //   const handleSend = async () => {
// //     if (!input.trim() || sending) return;

// //     setSending(true);
// //     setPhase("processing");

// //     const userMessage = { type: "user", text: input, timestamp: Date.now() };
// //     setLog(prev => [...prev, userMessage]);

// //     try {
// //       const result = await parseCommand(input);

// //       const assistantMessage = {
// //         type: "assistant",
// //         text: result.response,
// //         timestamp: Date.now(),
// //       };

// //       setLog(prev => [...prev, assistantMessage]);
// //       speak(result.response);

// //       if (result.success && result.action) {
// //         dispatchAction?.({ type: "VOICE_COMMAND", payload: result });
        
// //         if (result.page && onNavigate) {
// //           setTimeout(() => onNavigate(result.page), 1000);
// //         }

// //         if (closeOnSuccess) {
// //           setTimeout(() => onClose?.(), 2000);
// //         }
// //         setPhase("idle");
// //       } else {
// //         setPhase("listening");
// //       }
// //     } catch (e) {
// //       console.error(e);
// //       setPhase("listening");
// //     } finally {
// //       setSending(false);
// //     }
// //   };

// //   const handleTestCommand = (command) => {
// //     setInput(command);
// //     setTimeout(() => handleSend(), 100);
// //   };

// //   const handleRandomCommand = () => {
// //     const randomCmd = testCommands[Math.floor(Math.random() * testCommands.length)];
// //     handleTestCommand(randomCmd);
// //   };

// //   const handleCorruptedCommand = () => {
// //     const corrupted = ["dimm ligjts pls", "ste temp too 25", "trn on clima"];
// //     const randomCorrupted = corrupted[Math.floor(Math.random() * corrupted.length)];
// //     handleTestCommand(randomCorrupted);
// //   };

// //   // Recording toggle handler
// //   const handleRecordingToggle = () => {
// //     if (isRecording) {
// //       stopRecording();
// //     } else {
// //       startRecording();
// //     }
// //   };

// //   useEffect(() => {
// //     if (!open) return;

// //     const handleKeydown = (e) => {
// //       if (e.key === "Escape") {
// //         onClose?.();
// //       } else if (e.key === "Enter" && !e.shiftKey) {
// //         e.preventDefault();
// //         handleSend();
// //       } else if (e.key === " " && e.ctrlKey) {
// //         // Ctrl+Space for quick recording toggle
// //         e.preventDefault();
// //         if (recordingSupported) {
// //           handleRecordingToggle();
// //         }
// //       }
// //     };

// //     window.addEventListener("keydown", handleKeydown);
// //     return () => window.removeEventListener("keydown", handleKeydown);
// //   }, [open, input, sending, isRecording, recordingSupported]);

// //   const VoiceWave = () => (
// //     <div className="flex items-center justify-center gap-1 h-16">
// //       {[...Array(5)].map((_, i) => (
// //         <motion.div
// //           key={i}
// //           className="w-1 rounded-full"
// //           style={{ backgroundColor: isRecording ? "#ff4444" : COLORS.accent }}
// //           animate={
// //             isRecording
// //               ? { height: ["4px", "32px", "4px"], opacity: [0.4, 1, 0.4] }
// //               : phase === "listening"
// //               ? { height: ["4px", "24px", "4px"], opacity: [0.4, 1, 0.4] }
// //               : phase === "processing"
// //               ? { height: ["8px", "20px", "8px"], opacity: [0.6, 0.9, 0.6] }
// //               : { height: "4px", opacity: 0.3 }
// //           }
// //           transition={{
// //             duration: isRecording ? 1.0 : phase === "listening" ? 1.5 : 1,
// //             repeat: (isRecording || phase === "listening" || phase === "processing") ? Infinity : 0,
// //             delay: i * 0.1,
// //             ease: "easeInOut",
// //           }}
// //         />
// //       ))}
// //     </div>
// //   );

// //   const ChatBubble = ({ message, isUser }) => (
// //     <motion.div
// //       className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-3`}
// //       initial={{ opacity: 0, y: 14, scale: 0.98 }}
// //       animate={{ opacity: 1, y: 0, scale: 1 }}
// //       transition={{ type: "spring", stiffness: 240, damping: 22, duration: 0.35 }}
// //     >
// //       <div
// //         className={`max-w-[72%] px-4 py-3 rounded-2xl shadow-md ${
// //           isUser
// //             ? "rounded-br-lg text-white"
// //             : "rounded-bl-lg text-gray-900 bg-white border border-gray-200"
// //         }`}
// //         style={{ backgroundColor: isUser ? COLORS.accent : undefined }}
// //       >
// //         <p className="text-[15px] leading-6 font-medium antialiased">{message.text}</p>
// //       </div>
// //     </motion.div>
// //   );

// //   return (
// //     <AnimatePresence mode="wait">
// //       {open && (
// //         <motion.div
// //           className="fixed inset-0 z-50 flex"
// //           initial={{ opacity: 0 }}
// //           animate={{ opacity: 1 }}
// //           exit={{ opacity: 0 }}
// //           transition={{ duration: 0.25 }}
// //         >
// //           <div
// //             className="absolute inset-0"
// //             style={{
// //               backgroundColor: "rgba(0,0,0,0.35)",
// //               backdropFilter: "blur(4px)",
// //               WebkitBackdropFilter: "blur(4px)",
// //             }}
// //             onClick={() => {
// //               try { window.speechSynthesis?.cancel(); } catch {}
// //               onClose?.();
// //             }}
// //           />

// //           <div className="relative flex flex-col justify-end h-full w-full">
// //             <motion.div
// //               className={`${SHEET_HEIGHT} w-full ${SHEET_MAX_WIDTH} mx-auto flex flex-col backdrop-blur-sm border border-white/10 rounded-t-3xl items-center shadow-2xl`}
// //               style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
// //               initial={{ y: "100%" }}
// //               animate={{ y: 0 }}
// //               exit={{ y: "100%" }}
// //               transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.35 }}
// //             >
// //               <motion.div
// //                 className="flex justify-between items-center p-6 border-b border-white/10 w-full"
// //                 initial={{ y: -16, opacity: 0 }}
// //                 animate={{ y: 0, opacity: 1 }}
// //                 transition={{ delay: 0.08 }}
// //               >
// //                 <div className="flex items-center gap-3 mx-auto">
// //                   <div 
// //                     className="w-8 h-8 rounded-full flex items-center justify-center" 
// //                     style={{ backgroundColor: isRecording ? "#ff4444" : COLORS.accent }}
// //                   >
// //                     <Mic size={16} className="text-white" />
// //                   </div>
// //                   <div>
// //                     <p className="text-white/80 font-bold text-m">
// //                       {isRecording ? "Recording..." : 
// //                        phase === "processing" ? "Processing..." : 
// //                        transcriptionStatus || "Voice Assistant"}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <button
// //                   onClick={() => {
// //                     try { window.speechSynthesis?.cancel(); } catch {}
// //                     onClose?.();
// //                   }}
// //                   className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
// //                 >
// //                   <X size={16} className="text-white" />
// //                 </button>
// //               </motion.div>

// //               <motion.div
// //                 className="px-6 border-b border-white/10 w-full flex justify-center"
// //                 initial={{ scale: 0.96, opacity: 0 }}
// //                 animate={{ scale: 1, opacity: 1 }}
// //                 transition={{ delay: 0.16 }}
// //               >
// //                 <VoiceWave />
// //               </motion.div>

// //               <div className="flex-1 px-5 py-4 overflow-hidden w-full flex justify-center">
// //                 <div
// //                   className="h-full overflow-y-auto w-full"
// //                   style={{ maxWidth: CHAT_MAX_WIDTH_PX }}
// //                 >
// //                   {log.length === 0 ? (
// //                     <TestCommands
// //                       onTestCommand={handleTestCommand}
// //                       onRandomCommand={handleRandomCommand}
// //                       onCorruptedCommand={handleCorruptedCommand}
// //                     />
// //                   ) : (
// //                     <div className="space-y-2">
// //                       {log.map((message, i) => (
// //                         <ChatBubble key={i} message={message} isUser={message.type === "user"} />
// //                       ))}
// //                       <div ref={chatEndRef} />
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               <motion.div
// //                 className="w-full px-5 pb-5 space-y-3"
// //                 initial={{ y: 16, opacity: 0 }}
// //                 animate={{ y: 0, opacity: 1 }}
// //                 transition={{ delay: 0.24 }}
// //               >
// //                 {/* Voice Recording Button */}
// //                 {recordingSupported && (
// //                   <div className="flex justify-center">
// //                     <button
// //                       onClick={handleRecordingToggle}
// //                       disabled={phase === "processing"}
// //                       className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
// //                         isRecording 
// //                           ? "bg-red-500 hover:bg-red-600 animate-pulse" 
// //                           : "bg-green-500 hover:bg-green-600"
// //                       } ${phase === "processing" ? "opacity-50 cursor-not-allowed" : ""}`}
// //                     >
// //                       {phase === "processing" ? (
// //                         <Loader size={24} className="text-white animate-spin" />
// //                       ) : isRecording ? (
// //                         <Square size={24} className="text-white" />
// //                       ) : (
// //                         <Mic size={24} className="text-white" />
// //                       )}
// //                     </button>
// //                   </div>
// //                 )}

// //                 {/* Text Input */}
// //                 <div className="flex gap-3">
// //                   <input
// //                     ref={inputRef}
// //                     type="text"
// //                     value={input}
// //                     onChange={(e) => setInput(e.target.value)}
// //                     placeholder={recordingSupported ? "Type a command or use voice..." : "Type a command..."}
// //                     className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-white/40 focus:outline-none"
// //                   />
// //                   <button
// //                     onClick={handleSend}
// //                     disabled={!input.trim() || sending}
// //                     className="px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //                     style={{ backgroundColor: COLORS.accent }}
// //                   >
// //                     {sending ? "..." : "Send"}
// //                   </button>
// //                 </div>

// //                 {/* Instructions */}
// //                 <p className="text-center text-white/40 text-xs">
// //                   {recordingSupported 
// //                     ? "Hold the microphone button to record, or type your command"
// //                     : "Type your command and press Enter"
// //                   }
// //                 </p>
// //               </motion.div>
// //             </motion.div>
// //           </div>
// //         </motion.div>
// //       )}
// //     </AnimatePresence>
// //   );
// // }







// // components/VoiceModal.jsx - Simplified Debug Version
// import React, { useState, useEffect, useRef } from "react";
// import { Mic, MicOff, X } from "lucide-react";

// export default function VoiceModal({ open, onClose }) {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcriptionStatus, setTranscriptionStatus] = useState("");
//   const [debugLog, setDebugLog] = useState([]);
  
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const addDebugLog = (message) => {
//     console.log(message);
//     setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
//   };

//   useEffect(() => {
//     if (open) {
//       setDebugLog([]);
//       setTranscriptionStatus("");
//       addDebugLog("Modal opened");
//       checkMicrophoneSupport();
//     }
//   }, [open]);

//   const checkMicrophoneSupport = async () => {
//     addDebugLog("Checking microphone support...");
    
//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       addDebugLog("❌ MediaDevices not supported");
//       setTranscriptionStatus("Microphone API not supported");
//       return;
//     }
    
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       addDebugLog("✅ Microphone access granted");
//       stream.getTracks().forEach(track => track.stop());
//       setTranscriptionStatus("Microphone ready - click to record");
//     } catch (error) {
//       addDebugLog(`❌ Microphone error: ${error.message}`);
//       setTranscriptionStatus(`Microphone error: ${error.message}`);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       addDebugLog("Starting recording...");
//       setTranscriptionStatus("Starting recording...");
      
//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         }
//       });
      
//       audioChunksRef.current = [];
      
//       // Check MediaRecorder support
//       if (!MediaRecorder.isTypeSupported('audio/webm')) {
//         addDebugLog("⚠️ WebM not supported, trying mp4");
//       }
      
//       const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
//       addDebugLog(`Using MIME type: ${mimeType}`);
      
//       mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
//       mediaRecorderRef.current.ondataavailable = (event) => {
//         addDebugLog(`Audio data received: ${event.data.size} bytes`);
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };
      
//       mediaRecorderRef.current.onstop = async () => {
//         addDebugLog("Recording stopped, processing audio...");
//         const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
//         addDebugLog(`Audio blob created: ${audioBlob.size} bytes`);
        
//         await sendAudioForTranscription(audioBlob, mimeType.split('/')[1]);
        
//         // Stop all tracks
//         stream.getTracks().forEach(track => track.stop());
//         addDebugLog("All tracks stopped");
//       };
      
//       mediaRecorderRef.current.onerror = (event) => {
//         addDebugLog(`❌ MediaRecorder error: ${event.error}`);
//       };
      
//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//       setTranscriptionStatus("🔴 Recording... (click to stop)");
//       addDebugLog("✅ Recording started successfully");
      
//     } catch (error) {
//       addDebugLog(`❌ Recording error: ${error.message}`);
//       setTranscriptionStatus(`Recording failed: ${error.message}`);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       addDebugLog("Stopping recording...");
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//       setTranscriptionStatus("Processing audio...");
//     }
//   };

//   const sendAudioForTranscription = async (audioBlob, format) => {
//     try {
//       addDebugLog(`Sending ${audioBlob.size} bytes to backend...`);
//       setTranscriptionStatus("Transcribing speech...");
      
//       const formData = new FormData();
//       formData.append('audio', audioBlob, `recording.${format}`);
//       formData.append('format', format);
      
//       const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
//       addDebugLog(`Posting to: ${backendUrl}/api/nlp/process-voice-audio`);
      
//       const response = await fetch(`${backendUrl}/api/nlp/process-voice-audio`, {
//         method: 'POST',
//         body: formData
//       });
      
//       addDebugLog(`Response status: ${response.status}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }
      
//       const result = await response.json();
//       addDebugLog(`✅ Transcription result: ${JSON.stringify(result)}`);
      
//       if (result.success && result.transcription.text) {
//         setTranscriptionStatus(`✅ "${result.transcription.text}"`);
//       } else {
//         setTranscriptionStatus("❌ No speech detected");
//       }
      
//     } catch (error) {
//       addDebugLog(`❌ Transcription error: ${error.message}`);
//       setTranscriptionStatus(`❌ Error: ${error.message}`);
//     }
//   };

//   const handleRecordingToggle = () => {
//     addDebugLog(`Recording toggle clicked. Current state: ${isRecording}`);
//     if (isRecording) {
//       stopRecording();
//     } else {
//       startRecording();
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex bg-black bg-opacity-50">
//       <div className="bg-white rounded-lg p-6 m-auto max-w-md w-full max-h-[80vh] overflow-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Voice Assistant Debug</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X size={24} />
//           </button>
//         </div>
        
//         <div className="text-center mb-4">
//           <button
//             onClick={handleRecordingToggle}
//             disabled={transcriptionStatus.includes("error") || transcriptionStatus.includes("not supported")}
//             className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold ${
//               isRecording 
//                 ? "bg-red-500 hover:bg-red-600" 
//                 : "bg-green-500 hover:bg-green-600"
//             } ${transcriptionStatus.includes("error") ? "opacity-50 cursor-not-allowed" : ""}`}
//           >
//             {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
//           </button>
          
//           <p className="mt-2 text-sm text-gray-600">
//             {transcriptionStatus || "Click microphone to test"}
//           </p>
//         </div>
        
//         <div className="bg-gray-100 p-3 rounded text-xs max-h-40 overflow-auto">
//           <strong>Debug Log:</strong>
//           {debugLog.map((log, i) => (
//             <div key={i} className="text-gray-700">{log}</div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }











// components/VoiceModal.jsx - Simple listening interface
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, X, Square, Loader } from "lucide-react";

// Dava Brand Colors
const COLORS = {
  primary: "#192B37",
  accent: "#F99C11",
  secondary: "#F99C11",
  gray: "#47555F",
};

export default function VoiceModal({ open, onClose, dispatchAction, onNavigate, closeOnSuccess = true }) {
  const [phase, setPhase] = useState("idle");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const [status, setStatus] = useState("");
  
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Check for microphone support
  useEffect(() => {
    const checkMicrophoneSupport = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setRecordingSupported(true);
        setStatus("Ready to listen");
      } catch (error) {
        setRecordingSupported(false);
        setStatus("Microphone not available");
      }
    };
    
    if (open && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      checkMicrophoneSupport();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setPhase("listening");
      setInput("");
      setStatus("Ready to listen");
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      stopRecording();
      try {
        window.speechSynthesis?.cancel();
      } catch {}
      setPhase("idle");
    }
  }, [open]);

  const speak = (text) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.lang = "en-US";
      window.speechSynthesis?.speak(utterance);
    } catch (error) {
      console.log("Speech synthesis not available");
    }
  };

  const startRecording = async () => {
    try {
      setStatus("Starting recording...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      audioChunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await sendAudioForTranscription(audioBlob, mimeType.split('/')[1]);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setPhase("listening");
      setStatus("Listening... tap to stop");
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus("Recording failed");
      setPhase("idle");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setPhase("processing");
      setStatus("Processing...");
    }
  };

  const sendAudioForTranscription = async (audioBlob, format) => {
    try {
      setPhase("processing");
      setStatus("Understanding your command...");
      
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording.${format}`);
      formData.append('format', format);
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/nlp/process-voice-audio`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.transcription.text) {
        const transcribedText = result.transcription.text;
        setStatus(`Heard: "${transcribedText}"`);
        
        // Process the command result
        if (result.command_result && result.command_result.confidence > 0.5) {
          const responseText = `Command executed successfully`;
          setStatus(responseText);
          speak(responseText);
          
          // Dispatch the action
          if (result.execution_result?.success) {
            try {
              dispatchAction?.(result.command_result.action, result.command_result.parameters);
            } catch (error) {
              console.error("Action dispatch failed:", error);
            }
          }
          
          if (closeOnSuccess) {
            setTimeout(() => {
              try { window.speechSynthesis?.cancel(); } catch {}
              onClose?.();
            }, 1500);
          }
        } else {
          const confidence = result.command_result?.confidence || 0;
          const responseText = `Not sure what to do (${(confidence * 100).toFixed(0)}% confidence)`;
          setStatus(responseText);
          speak("I'm not sure what to do with that command");
        }
      } else {
        throw new Error(result.error || "No speech detected");
      }
      
    } catch (error) {
      console.error('Voice processing error:', error);
      setStatus("Couldn't process that audio");
      speak("I couldn't understand that");
    } finally {
      setTimeout(() => {
        setPhase("listening");
        setStatus("Ready to listen");
      }, 2000);
    }
  };

  // Text input processing
  const parseCommand = async (text) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/nlp/process-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, timestamp: Date.now() })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();

      if (result.confidence > 0.7) {
        return {
          action: result.action,
          value: result.parameters,
          success: true
        };
      } else {
        return {
          action: null,
          success: false
        };
      }
    } catch (error) {
      console.error('Voice parsing error:', error);
      return {
        action: null,
        success: false
      };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    setPhase("processing");
    setStatus("Processing your command...");

    const currentInput = input.trim();
    setInput("");

    try {
      const command = await parseCommand(currentInput);

      if (command.success) {
        setStatus("Command executed successfully");
        speak("Command executed");
        
        try {
          dispatchAction?.(command.action, command.value);
        } catch (error) {
          console.error("Action dispatch failed:", error);
        }

        if (closeOnSuccess) {
          setTimeout(() => {
            try { window.speechSynthesis?.cancel(); } catch {}
            onClose?.();
          }, 1500);
        }
      } else {
        setStatus("Command not understood");
        speak("I didn't understand that command");
      }
    } catch (e) {
      console.error(e);
      setStatus("Error processing command");
    } finally {
      setSending(false);
      setTimeout(() => {
        setPhase("listening");
        setStatus("Ready to listen");
      }, 2000);
    }
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      } else if (e.key === " " && e.ctrlKey) {
        e.preventDefault();
        if (recordingSupported) {
          handleRecordingToggle();
        }
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, input, sending, isRecording, recordingSupported]);

  const VoiceWave = () => (
    <div className="flex items-center justify-center gap-1 h-20">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ backgroundColor: isRecording ? "#ff4444" : COLORS.accent }}
          animate={
            isRecording
              ? { height: ["6px", "40px", "6px"], opacity: [0.4, 1, 0.4] }
              : phase === "listening"
              ? { height: ["6px", "30px", "6px"], opacity: [0.4, 0.8, 0.4] }
              : phase === "processing"
              ? { height: ["10px", "25px", "10px"], opacity: [0.6, 0.9, 0.6] }
              : { height: "6px", opacity: 0.3 }
          }
          transition={{
            duration: isRecording ? 0.8 : phase === "listening" ? 1.2 : 0.8,
            repeat: (isRecording || phase === "listening" || phase === "processing") ? Infinity : 0,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(0,0,0,0.35)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={() => {
              try { window.speechSynthesis?.cancel(); } catch {}
              onClose?.();
            }}
          />

          <div className="relative flex flex-col justify-center items-center h-full w-full">
            <motion.div
              className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <button
                  onClick={() => {
                    try { window.speechSynthesis?.cancel(); } catch {}
                    onClose?.();
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
                
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" 
                  style={{ backgroundColor: isRecording ? "#ff4444" : COLORS.accent }}
                >
                  <Mic size={20} className="text-white" />
                </div>
                
                <h2 className="text-white font-bold text-xl mb-2">Voice Assistant</h2>
                <p className="text-white/70 text-sm">{status}</p>
              </div>

              {/* Voice Wave */}
              <div className="mb-8">
                <VoiceWave />
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {/* Voice Recording Button */}
                {recordingSupported && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleRecordingToggle}
                      disabled={phase === "processing"}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                        phase === "processing" ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
                      } ${isRecording ? "animate-pulse" : ""}`}
                      style={{ backgroundColor: COLORS.accent }}
                    >
                      {phase === "processing" ? (
                        <Loader size={24} className="text-white animate-spin" />
                      ) : isRecording ? (
                        <Square size={24} className="text-white" />
                      ) : (
                        <Mic size={24} className="text-white" />
                      )}
                    </button>
                  </div>
                )}

                {/* Instructions */}
                <p className="text-center text-white/50 text-xs">
                  {recordingSupported 
                    ? "Press the microphone to record your voice command"
                    : "Microphone not available"
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}