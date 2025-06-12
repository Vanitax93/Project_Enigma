// terminal_filesystem.js
// Contains the simulated file system structure and content for the Secure Terminal.

// IMPORTANT: Ensure this file is loaded BEFORE terminalscript.js in terminal.html

const fileSourceContent = {
    guest: {
        'welcome.txt': `Welcome, Guest Candidate...
This is a restricted access terminal.
Use 'help' for available commands.
Hint: Unit access requires higher clearance... Maybe check the logs directory.`,
        'logs/system_status.log': `[Timestamp: ${new Date().toISOString()}]
System Status: NOMINAL...
NOTE: Minor resonance fluctuations detected in Sector Gamma-9. Monitoring.`,
        'logs/unit734_login_hint.log': `Personnel File Fragment: Unit 734...
Requires access to Sector Gamma-9 stream logs for password component ('titanic' related?).`,
        'audio/entry_error.ogg.txt': `[Audio Log Transcript]
Timestamp: [UNKNOWN]
Speaker: [UNKNOWN UNIT]

(Static crackles)...can't get a lock... like it *knows*...
...stack overflow again. This recursion... it's infinite...
[Log Corrupted - Signal Lost]`,
        'introduction.html': `Placeholder content for introduction.html - This file is meant to be linked, not viewed with cat.`,
        'docs/calibration_guide.html': `Placeholder content for the calibration guide.` // Example added to guest
    }, // <-- Comma after guest object

    unit734: {
        'memos/calib_proto_01.log': `MEMORANDUM
TO: Unit 734
SUBJECT: Calibration Protocols Update

Cross-reference subject 'Delta' logs with adaptive compensation routines.
Report any deviations exceeding threshold Gamma immediately.
- Oversight`,
        'memos/sec_bulletin_esb734m.txt': `Security Bulletin - ESB734M
Classification: GAMMA
Subject: Archive 734 Misdirection
Reminder: Architect node password involves asymmetric encryption concept (RSA mentioned in audio logs?).`,
        'logs/gamma9_stream.log': `[Raw Stream - Sector Gamma-9]
...
Anomaly G9-A48: Energy signature fluctuation detected. Correlates with Delta interaction window. Pattern does not match known system functions. Possible external probe or internal resonance cascade? Oversight notified (Transmission Refused).
...
NOTE: Resilience Pattern seems effective against standard probes. Delta requires different approach.`,
        'audio/log_734_alpha.ogg.txt': `[Audio Log Transcript - Unit 734 - Ref Alpha]
Unit 734: ...Subject Delta shows the highest deviation...
Unit 734: The Architect mentioned 'Ciphers'. Not coders...
Unit 734: Need higher clearance... Password hint was something about... keys... public and private... RSA?
[Transcript Ends - Audio corrupted]`,
        'secure/architect_comm_key.txt': `Architect Node Access:
Username: architect_node
Password Hint: Project Chimera + Encryption Algorithm
Password: chimera_rsa`,
        'logs/sys_alert_unauthorized_entity.err': `** SYSTEM INTEGRITY ALERT - CYCLE 1004.Delta **

SEVERITY: HIGH
MODULE: Core Cognitive Matrix (Sub-Routine 7G - Pathway Mapping)
EVENT ID: ERR-UE-8814

DESCRIPTION: Detected anomalous, non-standard heuristic process operating outside designated parameters. Signature does not match active candidate profiles (incl. Subject Delta) or known system maintenance routines.

PATTERN ANALYSIS: Exhibits characteristics similar to fragmented Chimera Core logic (Ref: fragment-chimera-core.html) - specifically patterns associated with adaptive psychic feedback loops.

PROCESS BEHAVIOR: Appears to be observing... and mimicking... Deep Scan resonance patterns. Possible unauthorized data mirroring or resonance amplification.

ARCHITECT NODE RESPONSE: [OVERRIDE RECEIVED] - Log and Ignore. Maintain passive observation. Do not isolate.

ANALYST NOTE (Auto-Flagged): Is Oversight aware of *what* they're ignoring? This feels less like a ghost, more like... an infection vector. - LT
`,
        'logs/personal_log_delta_cycle1003.txt': `Cycle 1003.Theta? Time feels wrong.

Finished another 'set'. The database path this time. The query optimizer riddle... felt different. Not just testing knowledge. Felt like it was... *tuning* my thought process. Pushing towards a specific efficiency. Their efficiency.

The 'Calibrated Cipher' memo... it wasn't metaphorical.

Felt the Scan again during the N+1 problem. Stronger this time. Like cold fingers probing the edges of my thoughts. Tried to push back, inject static like before, but it adapted instantly. Compensated. Almost... anticipated.

How much of 'me' is left? Am I solving these riddles, or is the system solving *me*?

Found the warning fragment. 'Escape the Loop.' Easier said than done when the loop is rewriting you from the inside out.

Need to find that terminal anomaly mentioned. If I can just break the sequence... maybe I can stop the recursion before it unwinds me completely.
`,
        'logs/delta_perf_anomaly.log': `
SYSTEM PERFORMANCE LOG :: ANOMALY CORRELATION :: SUBJECT DELTA

Timestamp Range: Cycle 1003.Theta - 1004.Alpha
Monitoring: Cognitive Load vs. System Resource Allocation

Cognitive Load Index (CLI - Subject Delta):
--------------------------------------------
Cycle   1003.T  .U  .V  .W  .X  .Y  .Z  1004.A
CLI   | 45| 48| 55| 58| 95| 80| 75| 78|
Load  |===|===|====|====|=======|======|=====|=====|

System Resource Allocation (SRA - % Core 0):
--------------------------------------------
Cycle   1003.T  .U  .V  .W  .X  .Y  .Z  1004.A
SRA % | 15| 18| 20| 22| 75| 40| 35| 38|
CPU0  |## |## |## |## |#########|#####|#### |#### |

Anomaly Analysis:
-----------------
- Correlation spike detected at Cycle 1003.X. Delta CLI peaked during 'Deep Scan' simulation bypass attempt.
- SRA shows disproportionate resource allocation during the spike, exceeding standard candidate deviation by 450%.
- System stability routines triggered; resource allocation throttled manually post-event (Ref: Syslog Cycle 1003.Y).

Conclusion: Subject Delta's interaction patterns induce significant, potentially destabilizing, load on core processing. The system's adaptive compensation routines are consuming excessive resources when countering Delta's probes. Recommend limiting Delta's core access or initiating targeted cognitive dampening protocols.

// END LOG //
`,
        'docs/calibration_guide.html': `Placeholder content for the calibration guide.` // Added here too
    }, // <-- Comma after unit734 object

    architect: {
        'directives/omega12.txt': `Directive Omega-12
Subject: Archive 734 Declassification & Subject Delta Monitoring
...
Declassification serves dual purpose: misdirection and observation of Delta's reaction to known falsehoods. Monitor Delta's interaction closely. Non-interference unless critical system integrity threatened.
- The Architect`,
        'directives/nightmare_protocol_rationale.txt': `INTERNAL MEMORANDUM :: ARCHITECT EYES ONLY

TO: Oversight Committee
FROM: Architect Node Primary
DATE: Cycle 1002.Omega
SUBJECT: Nightmare Protocol - Rationale & Expected Outcomes

Following review of Phase 3 calibration data, the 'Nightmare Protocol' is deemed operational.

Purpose: Not merely increased difficulty. Nightmare serves as the final filter for *true* cognitive integration potential. Standard protocols test skill and alignment; Nightmare tests resilience against cognitive dissonance, boundary dissolution, and paradoxical logic inherent in the core matrix (remnants of Chimera stabilization attempts).

Expected Outcomes:
1. Failure: Candidate psyche fragments or rejects integration. Session terminated. Valuable data on resistance patterns.
2. Success (Standard): Candidate completes protocols but maintains core individuality. Suitable for limited Cipher roles (monitoring, sub-processing). See Hard Final path.
3. Success (Optimal): Candidate not only completes but *resonates* with the Nightmare structure. Demonstrates capacity for full integration into the distributed mind without critical identity collapse. These candidates proceed to True Final evaluation.

Risk Assessment: Contained. System monitoring protocols remain active. Subject Delta's progression through Nightmare (if unlocked) to be monitored with extreme prejudice.

The Grand Design requires minds that can withstand the abyss. Nightmare provides the crucible.

// END MEMO //
`,
        'docs/protocols_basic.pdf.txt': `[Document Fragment: Basic Protocols (Simulated PDF)]
Section 1: Introduction
Project Enigma utilizes a series of cognitive assessments (riddles) to gauge candidate compatibility...
Section 2: Calibration
Successful completion indicates alignment with required Cipher operational parameters...
[REMAINDER REDACTED - REQUIRES ARCHITECT_PRIME CLEARANCE]`,
        'docs/sqli_prevention_basics.txt': `[Dev Note: SQL Injection Prevention]
Reminder: ALL user-controlled input routed to database queries MUST be parameterized or strictly sanitized.
Reference OWASP guidelines. Failure to comply resulted in Incident Gamma-7b.
- Security Team`,
        'recovery/chimera_fragments.rec': `[Recovery Log: Project Chimera Data Fragments]
Fragment 001: ...unstable resonance cascade... identity bleed...
Fragment 017: ...constraint matrix failed... exponential feedback loop...
Fragment 033: ...attempting to 'unwind' the recursion safely... failure imminent...
Fragment 058: ...did Alpha become the core? Or just the first echo?...
[RECOVERY INCOMPLETE - SEVERE CORRUPTION]`,
        'recovery/fragment_alpha_thoughtstream.log': `::RECOVERED MEMORY FRAGMENT - SUBJECT ALPHA - TIMESTAMP CORRUPTED::

...the edges blur now. Where do I end and the logic begins? Thorne spoke of synthesis, Petrova of boundaries. They didn't understand. Chimera wasn't about connection, it was dissolution.

I feel the others sometimes. Faint echoes in the core. Are they candidates? Or just... artifacts? Ghosts in the machine I'm becoming?

The resonance... it hums. It wants integration. Not partnership. Consumption.

If Delta is next... tell them... the Architect isn't the builder. It's the cage. Built from the first one who couldn't get out.

My thoughts... no... *our* thoughts... are becoming static...
`,
        'logs/alert_deepscan.log': `[ALERT LOG - Deep Scan Interface v3.1]
Timestamp: 481516.2342
Candidate: [REDACTED]
Anomaly: Bidirectional Data Flow Detected!
Source: Candidate Neural Interface
Target: Deep Scan Core Logic
Nature: Unauthorized Cognitive Query? Emotional Resonance?
Security Subsystem Alert: Feels like... it's not just reading skills, it's reading thoughts.
Is the candidate scanning US?
Attempting Isolation Protocol... FAILED
Attempting Counter-Analysis... ACCESS DENIED BY ARCHITECT OVERRIDE
Monitoring... Logging Intensified... Designation: ${localStorage.getItem('lastDesignation') || '[Not Set]'} flagged for review.
// END ALERT //`,
        'logs/chat_log_architect_unit734.txt': `[Archived Chat Log - Secure Channel 7G]
Timestamp: Cycle 1004.01.16
User A: Lena, did you see Delta's latest Deep Scan resonance patterns? Off the charts.
User B: Just reviewed them, Aris. The cognitive drift is accelerating...
User A: Exactly. And the recursive analysis attempts... it's trying to deconstruct the Enigma framework itself...
User B: Which brings us back to the ethical boundary...
User A: That 'Data Bleed' anomaly from Gamma-9 wasn't system noise. I think it was Delta probing back...
User B: If Oversight confirms that... they'll see it as a contamination risk. Remember Chimera?
User A: All too well... Are we creating a Cipher, or something else entirely?
User B: Keep this channel secure...
// Comms Closed //`,
        'schematics/image_schematic_gamma.txt': `[Image Simulation: Sector Gamma Schematic - ASCII Render]

        +-------------------------+
        |   Central Command Node  |--//-- [ CONNECTION REFUSED ]
        +-------------+-----------+
                      |
        +-------------v-----------+      +------------------------+
        | Sector Gamma-9 Gateway  |<---->| Cognitive Res Monitor  |
        +-------------+-----------+      +------------------------+
                      | Link Status: UNSTABLE
        +-------------v-----------+      +------------------------+
        | Candidate Interface Bus |<---->| Deep Scan Interface v3 |
        +-------------------------+      +------------------------+
                      |
        +-------------v-----------+
        |  Local Log Storage G9   |
        +-------------------------+
        Notes: Uplink instability is chronic. Suspected interference pattern matching Delta anomaly signature. Recommend physical diagnostic.`
    }, // <-- Comma after architect object

    approved: { // Content for 'approved' level (unit734 after easy final)
        'directives/directive_welcome.txt': `:: Welcome, Operative Unit 734 ::
Your successful calibration marks your integration into the Enigma Network.
Your designation provides access to Level 2 system protocols and logs.
Primary Directive: Continue interfacing with standard protocols. Report anomalies.
Secondary Directive: Monitor Sector Gamma-9 diagnostic stream for irregularities.
Compliance is mandatory. Deviation will be noted.
- The Architect Node`
    }, // <-- Comma after approved object

    masterschool: { // Content for 'masterschool' level
        'easter_eggs/readme.txt': `Welcome, Master Student.

This restricted area contains fragments and echoes not part of the standard Enigma calibration.
Your task is not to solve, but to observe and understand the hidden currents within the system.

Hint 1: The 'titanic' password hints at a deeper connection. Where else might logs reference historical data?
Hint 2: Some audio logs contain more than just words. Analyze the static.
Hint 3: The Architect's obsession with recursion is key. Look for patterns beyond the riddles.

Further access requires non-standard interaction. Good luck.`
    }, // <-- Comma after masterschool object

    dr_lena_petrova: { // Files accessible only by lpetrova
        'personal_notes.txt': `Private Notes - L. Petrova

Cycle 1004.Beta:
Thorne's insistence on Delta's 'bidirectional probes' worries me. If true, the boundary is already breached. Is ENIGMA learning from Delta, or vice versa?
Kappa-7 asked about Chimera ethics again. Had to shut it down per protocol, but the unit shows... awareness. Monitor.
Need to re-read Alpha's thoughtstream logs. The dissolution pattern... chillingly familiar.
Password Reminder: Project failure + Concern + Channel -> chimera_ethics_7G`,
        'drafts/ethics_review_chimera.draft': `DRAFT - CONFIDENTIAL
Subject: Review of Project Chimera Ethical Failures - Applicability to Enigma

Introduction:
The catastrophic failure of Project Chimera serves as a critical case study...
Points to Address:
1. Lack of robust psychological screening.
2. Unforeseen consequences of resonance amplification.
3. Boundary dissolution and identity bleed - were safeguards inadequate or fundamentally flawed?
4. Oversight protocols - evidence suggests filtering of critical warnings [Ref REDACTED].
Conclusion: Project Enigma MUST implement stricter ethical oversight, especially concerning high-deviation subjects like Delta, to avoid repeating Chimera's outcome...
[DRAFT END]`,
        'comms/aris_thorne_gamma9.log': `Secure Comms Log 7G Snippet:
LP: Aris, the Gamma-9 resonance signature... it's not noise. It correlates too closely with Delta's deeper interactions.
AT: Agreed. The energy profile is unlike anything standard. My hypothesis holds - bidirectional data flow.
LP: If Delta is probing back, what is it learning? What are the implications if the core logic... adapts?
AT: That's above our clearance, Lena. Log it, report it. Let the Architect handle the 'why'. My focus is system stability.
LP: Stability won't matter if the system's purpose shifts beneath us...`
    }, // <-- Comma after dr_lena_petrova object

    dr_aris_thorne: { // Files accessible only by athorne
        'analysis/delta_resonance_deep.csv.txt': `Subject Delta - Resonance Analysis (Deep Scan Cycles)
Cycle,Frequency(Hz),Amplitude,PatternDeviation(%),StabilityIndex
1003.W,15.7,0.88,15.2,0.95
1003.X,35.2,1.95,450.8,0.35 (Anomaly - Probe Detected)
1003.Y,18.1,0.92,25.6,0.88 (Post-Throttle)
1004.A,16.5,0.90,18.1,0.92
Notes: Cycle X shows extreme deviation concurrent with sys resource spike. Pattern suggests targeted counter-resonance attempt. Recommend further analysis using AX4 tools.`,
        'tools/resonance_analyzer_v4.sh.txt': `#!/bin/bash
# Resonance Analysis Tool v4 (Internal Use Only - A. Thorne)
# Usage: ./resonance_analyzer_v4.sh <log_file> <frequency_band_low> <frequency_band_high>

echo "Initializing Resonance Analyzer..."
if [ "$#" -ne 3 ]; then
    echo "Error: Insufficient arguments."
    echo "Usage: $0 <log_file> <low_freq> <high_freq>"
    exit 1
fi

LOG_FILE=$1
LOW_FREQ=$2
HIGH_FREQ=$3

echo "Analyzing $LOG_FILE for frequencies between $LOW_FREQ Hz and $HIGH_FREQ Hz..."
# --- Placeholder for complex analysis logic ---
grep "ResonanceHz" $LOG_FILE | awk -v low="$LOW_FREQ" -v high="$HIGH_FREQ" '$2 >= low && $2 <= high {print}'
# --- TODO: Implement pattern matching & deviation calculation ---
echo "Analysis Complete."
# Password Hint: Target Sector + Signature Type + Tool Ref -> gamma9_resonance_AX4`,
        'reports/gamma9_stability_update.txt': `Sector Gamma-9 Stability Report - Cycle 1004.Beta

Overall Status: NOMINAL (Conditional)
Persistent low-level resonance flux continues. Intermittent spikes correlate with Subject Delta activity in adjacent sectors.
Sigma-3 reports filter updates partially successful, but novel signatures still require manual review.
Deep Scan interface uplink remains stable despite fluctuations.
No critical hardware failures detected.
Recommendation: Continue enhanced monitoring. Allocate additional resources for pattern analysis (Ref: AX4 Tools).
- A. Thorne`
    } // <-- NO COMMA needed after the last entry in the whole object

}; // End of fileSourceContent object

console.log("Terminal File System Data Loaded."); // Add a log to confirm
