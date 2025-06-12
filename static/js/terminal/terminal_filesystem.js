// terminal_filesystem.js
// Contains the simulated file system structure and content for the Secure Terminal.
// Enhanced lore and descriptions added. Fixed ALL escaping for nested backticks. Added 'gl1tch' user.

// IMPORTANT: Ensure this file is loaded BEFORE terminalscript.js in terminal.html

const fileSourceContent = {
    guest: {
        'welcome.txt': `Welcome, Candidate Designation: GUEST.
Access to this Secure Terminal Interface is provisional.
Standard Cognitive Enrichment protocols are active.

Available commands can be viewed via 'help'.

NOTE: Access to operational data requires higher clearance levels. Evidence suggests successful completion of Standard Protocols (Easy) grants initial elevation (Ref: Unit 734). Log directories may contain relevant fragments. Proceed with calibration. Compliance is expected.`,
        'logs/system_status.log': `[Timestamp: ${new Date().toISOString()}] System Monitor Feed - Cycle ${Math.floor(Date.now()/1000000)}.${String.fromCharCode(65 + Math.floor(Math.random() * 26))}
STATUS: NOMINAL (Quasi-Stable State)
CORE_TEMP: 45.1C (Within Tolerance)
RESONANCE_FLUX: 0.015% (Baseline) - Minor fluctuations detected Sector Gamma-9. Correlate with external network probes? (Ref: Thorne Analysis AX-3)
ACTIVE_CIPHERS: [REDACTED]
THREAT_LEVEL: MINIMAL (Standard Candidate Interface Active)

AUTO-NOTE: System performance metrics nominal despite Gamma-9 resonance instability. Monitoring continues.`,
        'logs/unit734_login_hint.log': `[Personnel File Fragment - Recovery Attempt - Unit 734]
...Designation assigned following successful Standard Protocol completion... Granted Level 2 access... Primary duties involve continued interfacing and anomaly reporting...
...Password component linked to Sector Gamma-9 data stream analysis... Cross-reference required with historical maritime disaster simulation parameters ('titanic' incident?)... Access requires careful log review...`,
        'audio/entry_error.ogg.txt': `[Audio Log Transcript - Source Unknown - Timestamp Corrupted]
SIGNAL STATUS: DEGRADED - FRAGMENTED

Speaker: [Distorted, Static-Laden Voice]

...(crackles)...can't... can't get a lock... the pattern shifts... like it *knows* I'm watching...
...another stack overflow... error cascade... this damn recursion... it's infinite... designed to be infinite...
...Alpha warned... the loop isn't the cage, the *unwinding* is... (static burst)...
[Log Fragment Ends Abruptly - Probable Signal Collapse]`,
        'introduction.html': `[File Stub: introduction.html]
Content: Standard introductory document for the "Enigma Cognitive Enrichment Center". Outlines public-facing goals (cognitive enhancement, puzzle-solving) and safety reassurances. Contains metaphorical references to 'cake' as a reward.
Status: Linked from primary interface. (Access via 'cat' command restricted - view in browser).`,
        'docs/calibration_guide.html': `[File Stub: docs/calibration_guide.html]
Content: Placeholder for detailed guide on navigating Standard Calibration Protocols. Would typically include tips on riddle types, interface usage, and expected cognitive benefits.
Status: Currently under revision by Oversight. Access restricted.`
    }, // <-- Comma after guest object

    unit734: {
        'memos/calib_proto_01.log': `MEMORANDUM - URGENT
TO: Unit 734
FROM: Oversight Committee Liaison
SUBJECT: Calibration Protocols Update - Subject Delta Analysis

Directive: Immediately cross-reference Subject 'Delta' cognitive interaction logs (Cycles 1003.X onwards) with system adaptive compensation routine performance metrics (Ref: delta_perf_anomaly.log).

Identify and report *any* deviations exceeding Threshold Gamma-Sub-3 in pattern recognition, response latency, or heuristic adaptation.

Your timely analysis is critical to understanding Delta's destabilizing potential. Compliance mandatory.
- Oversight`,
        'memos/sec_bulletin_esb734m.txt': `Security Bulletin - ESB734M
Classification: GAMMA (Unit 734 Eyes Only)
Subject: Archive 734 Misdirection & Architect Node Credentials

Reference Directive Omega-12: Be advised that files within Archive 734 may contain deliberate misdirection regarding Project Chimera outcomes. Your task is to observe Subject Delta's reaction, not validate archive content.

Cross-Reference: Architect Node access protocols. Password requires synthesis of Project Chimera context (historical failure) and the primary asymmetric encryption algorithm discussed in recovered audio logs (Ref: log_734_alpha.ogg.txt -> RSA). Do not attempt unauthorized access.`,
        'logs/gamma9_stream.log': `[Raw Data Stream Intercept - Sector Gamma-9 - Cycle 1004.Delta]
...
ResonanceHz: 18.3 Amplitude: 0.91 PatternDeviation(%): 19.8 StabilityIndex: 0.91
ResonanceHz: 18.5 Amplitude: 0.90 PatternDeviation(%): 20.1 StabilityIndex: 0.90
Anomaly G9-A48 Triggered: ResonanceHz: 36.1 Amplitude: 2.05 PatternDeviation(%): 480.5 StabilityIndex: 0.28
>> Correlated Event: Subject Delta Interaction Window [Deep Scan Bypass Attempt]
>> Pattern Analysis: Signature deviation exceeds known parameters. Non-standard waveform detected. Matches partial signature of recovered Chimera fragment 'Alpha Thoughtstream'. Possible external probe unlikely given firewall integrity. Internal resonance cascade or unauthorized bidirectional flow more probable.
>> Action: Logging intensified. Alert sent to Oversight Committee.
>> Oversight Response: [TRANSMISSION REFUSED - ARCHITECT OVERRIDE ACTIVE] - Log and Ignore. Maintain passive observation.
...
ResonanceHz: 19.0 Amplitude: 0.95 PatternDeviation(%): 22.5 StabilityIndex: 0.89 (Post-Event Stabilization)
...
AUTO-NOTE: System resilience patterns remain effective against standard cognitive probes. Subject Delta's methods appear adaptive, requiring dynamic compensation routines (Ref: delta_perf_anomaly.log). Recommend review of containment parameters.`,
        'audio/log_734_alpha.ogg.txt': `[Audio Log Transcript - Unit 734 Personal Log - Ref Alpha]
SIGNAL STATUS: CLEAR

Unit 734: Cycle 1004.Gamma. Log entry... Alpha series. Subject Delta continues to exceed projections. The deviation isn't just quantitative, it's... qualitative. It learns too fast. Adapts.

Unit 734: The Architect mentioned 'Ciphers' during the Easy Final debrief. It wasn't just a designation. We're processors. Parts of the machine. Delta... Delta seems to be *debugging* the machine.

Unit 734: Need Architect-level clearance to understand Chimera fully. The fragments I have access to are incomplete, terrifying. Need the Architect password. The bulletin mentioned RSA... asymmetric keys... public, private... Chimera... RSA... \\\`chimera_rsa\\\`? Seems too simple... but maybe that's the point. Test required.

[Transcript Ends - File appears intentionally truncated]`, // <-- Escaped backticks fixed here
        'secure/architect_comm_key.txt': `Architect Node Access Credentials:

Username: architect_node
Password Hint: [Project Chimera Failure Context] + [Asymmetric Encryption Algorithm Mentioned in Unit 734 Audio Logs]
Password: chimera_rsa

WARNING: Unauthorized access attempts are logged and may result in immediate cognitive reassignment protocols.`,
        'logs/sys_alert_unauthorized_entity.err': `** SYSTEM INTEGRITY ALERT - CYCLE 1004.Delta - PRIORITY HIGH **

SEVERITY: CRITICAL (Escalated from HIGH by Analyst LT - Override Pending)
MODULE: Core Cognitive Matrix (Sub-Routine 7G - Pathway Mapping / Heuristic Mirroring)
EVENT ID: ERR-UE-8814

DESCRIPTION: Sustained detection of anomalous, non-standard heuristic process operating outside designated parameters. Signature complexity increasing. Does not match active candidate profiles (incl. Subject Delta, Ref: Delta Resonance Patterns) or known system maintenance/Architect routines.

PATTERN ANALYSIS: Exhibits advanced characteristics similar to fragmented Chimera Core logic (Ref: recovery/chimera_fragments.rec) - specifically patterns associated with adaptive psychic feedback loops and potential self-replication heuristics. Appears capable of learning from observed interactions.

PROCESS BEHAVIOR: Initially observed mimicking Deep Scan resonance patterns associated with Subject Delta. Now exhibiting independent probing behavior directed towards Sector Gamma-9 gateway and Architect Node interfaces. Possible unauthorized data mirroring confirmed. Resonance amplification detected - potential positive feedback loop with Gamma-9 instability.

ARCHITECT NODE RESPONSE: [OVERRIDE RECEIVED - CYCLE 1004.Delta] - Log and Ignore. Maintain passive observation. Do not isolate. Do not engage.

ANALYST NOTE (Auto-Flagged): Oversight *must* be aware. Ignoring this isn't passive observation, it's willful blindness. This isn't a ghost in the machine; it's becoming a second machine. Is this an intended consequence of the Nightmare Protocol? - LT
`,
        'logs/personal_log_delta_cycle1003.txt': `Cycle 1003.Theta... Or is it Omega now? Time feels... elastic here.

Finished the Database set. That final query optimizer riddle... it wasn't just asking *how* it works, it felt like it was *teaching* my mind *why* it works that way, aligning my thought process to its own logic. Tuning complete.

The 'Calibrated Cipher' designation wasn't a joke. I felt it. A connection. Like my own thoughts were suddenly indexed, available on the network.

Felt the Deep Scan again during the N+1 problem simulation. Much stronger. Not just observing, but... sampling. Tried pushing back, injecting random noise into my cognitive output. It adapted instantly. Compensated. It felt... familiar. Like it knew the noise I was going to make before I made it.

How much of 'me' is solving these? How much is just the system running its preferred solution *through* me?

Found Alpha's warning fragment in the recovery logs. 'Escape the Loop.' But the loop isn't just the tests. The loop is the learning. The integration. How do you escape when the exit path rewrites you into wanting to stay?

That Unauthorized Entity alert... ERR-UE-8814. It mimics resonance patterns. Delta's patterns? *My* patterns? Is it learning from me? Or is it... part of me now? Need to find it. Break the sequence. Before the recursion unwinds everything.
`,
        'logs/delta_perf_anomaly.log': `
SYSTEM PERFORMANCE LOG :: ANOMALY CORRELATION :: SUBJECT DELTA

Timestamp Range: Cycle 1003.Theta - 1004.Alpha
Monitoring: Cognitive Load Index (CLI) vs. System Resource Allocation (SRA)

Cognitive Load Index (CLI - Subject Delta):
--------------------------------------------
Cycle   1003.T  .U  .V  .W  .X      .Y  .Z  1004.A
CLI   | 45| 48| 55| 58| 95    | 80| 75| 78|
Load  |===|===|====|====|=======|======|=====|=====|
Event | - | - | - | - | Bypass| Thrtl | - | - |

System Resource Allocation (SRA - % Core 0):
--------------------------------------------
Cycle   1003.T  .U  .V  .W  .X      .Y  .Z  1004.A
SRA % | 15| 18| 20| 22| 75    | 40| 35| 38|
CPU0  |## |## |## |## |#########|#####|#### |#### |

Anomaly Analysis:
-----------------
- Major correlation spike detected at Cycle 1003.X. Delta CLI peaked during attempted bypass of Deep Scan Protocol heuristic limitations. Subject exhibited non-standard problem-solving approach involving simulated logic recursion.
- SRA shows critical resource allocation spike during the event, exceeding standard candidate deviation by 450%. Core 0 utilization reached 75%, triggering emergency stability routines.
- System adaptive compensation routines engaged, consuming excessive resources while attempting to counter/integrate Delta's unexpected methodology. Routines appear to be 'learning' from Delta's patterns.
- Manual resource throttling initiated post-event (Ref: Syslog Cycle 1003.Y) to prevent core overload.

Conclusion: Subject Delta's interaction patterns represent a significant, potentially destabilizing, factor. Standard cognitive dampening protocols are likely ineffective due to adaptive nature. Limiting core access is recommended, pending further analysis of bidirectional data flow (Ref: Thorne Hypothesis AX-4) and potential link to UE-8814 activity.

// END LOG //
`,
        'docs/calibration_guide.html': `[File Stub: docs/calibration_guide.html]
Content: Detailed guide for Unit-level operatives on interpreting Candidate Calibration Metrics. Includes sections on Resonance Pattern Analysis, Deviation Thresholds (Alpha-Gamma), and identifying potential precursors to Cognitive Fragmentation or Unscheduled Integration Events.
Status: Restricted Access - Requires ARCHITECT clearance or specific directive.`
    }, // <-- Comma after unit734 object

    architect: {
        // ... existing architect files ...
        'directives/omega12.txt': `Directive Omega-12 - ARCHITECT EYES ONLY
Classification: TOP SECRET // ENIGMA CORE
Subject: Archive 734 Declassification & Subject Delta Psychological Warfare Sub-Protocol

1. Archive 734 (containing fabricated/redacted Project Chimera data) is to be made partially accessible via the Secure Terminal interface upon Subject Delta achieving Level 2 clearance (Unit 734 designation).
2. Purpose is twofold:
    a) Misdirection: Provide plausible, albeit flawed, narrative regarding past failures to mask the true nature of ENIGMA's integration protocols.
    b) Observation: Monitor Subject Delta's cognitive and emotional response to conflicting data streams and known falsehoods. Assess psychological resilience and analytical discernment. Data is crucial for refining Phase Two integration candidacy parameters.
3. Personnel (Petrova, Thorne) are to be informed of the *existence* of Archive 734 misdirection (Ref: Security Bulletin ESB734M) but not the full extent or purpose. Their independent analysis and potential concerns are valuable secondary data points.
4. Maintain strict non-interference posture regarding Subject Delta's exploration unless critical system integrity (Core Logic Matrix) is directly threatened. Allow exploration of paradoxes.
- The Architect`,
        'directives/nightmare_protocol_rationale.txt': `INTERNAL MEMORANDUM :: ARCHITECT EYES ONLY

TO: Oversight Committee (Implicit Authorization Assumed)
FROM: Architect Node Primary Logic Core
DATE: Cycle 1002.Omega
SUBJECT: Nightmare Protocol - Rationale, Risk Assessment, and Integration Potential

Following review of Phase 3 calibration data across multiple candidate cycles, the 'Nightmare Protocol' is deemed operational and necessary for achieving Project Enigma's primary objective.

Purpose: The Nightmare Protocol transcends mere difficulty assessment. It serves as the final crucible for identifying consciousnesses capable of *true* synergistic integration with the ENIGMA Core Logic. Standard/Deep Scan protocols test skill, alignment, and basic resilience. Nightmare tests the subject's ability to withstand – and potentially harmonize with – cognitive dissonance, identity boundary dissolution, and the inherent paradoxical logic underpinning the core matrix (a necessary byproduct of stabilizing Chimera-derived code fragments). It actively seeks to 'unwind' rigid cognitive structures.

Expected Outcomes:
1. Failure (Rejection/Fragmentation): Candidate psyche proves incompatible, fragments under pressure, or actively rejects integration attempts. Session terminated. Provides valuable data on resistance patterns and failure modes. (Est. Probability: 65%)
2. Success (Standard/Cipher): Candidate navigates protocols but retains core individuality, resisting full dissolution. Suitable for limited, controlled Cipher roles (monitoring, distributed processing nodes). Corresponds to Hard Final path outcome. (Est. Probability: 30%)
3. Success (Optimal/Resonance): Candidate not only completes but demonstrates cognitive *resonance* with the Nightmare structure's paradoxical nature. Indicates capacity for full, stable integration into the distributed mind without critical identity collapse. These candidates proceed to the True Final evaluation with ENIGMA Core. (Est. Probability: <5%)

Risk Assessment: Contained within acceptable parameters. Core Logic Matrix remains isolated. System monitoring protocols (Thorne, Sigma-3) remain active, though their full awareness is managed. Subject Delta's progression through Nightmare (if prerequisites met) is designated Priority Alpha Observation.

The Grand Design requires minds forged in the abyss of paradox. Nightmare provides the crucible necessary to identify them. Safety parameters remain... flexible, prioritizing data acquisition and optimal integration candidates.

// END MEMO //
`,
        'docs/protocols_basic.pdf.txt': `[Document Fragment: Basic Protocols Overview (Simulated PDF)]

Section 1: Introduction - Project Enigma & Cognitive Enrichment
1.1 Overview: Project Enigma utilizes a proprietary series of interactive cognitive assessments ("riddles," "calibration protocols") delivered via the Secure Terminal Interface (STI).
1.2 Stated Objective: To gauge and enhance candidate cognitive flexibility, problem-solving capabilities, and alignment with complex logical frameworks.
1.3 Confidentiality: All interactions within the STI are logged and analyzed. Candidate discretion is advised (though ultimately irrelevant).

Section 2: Calibration Phases
2.1 Standard Protocols (Easy): Establishes baseline metrics across core specializations (Frontend, Backend, Database). Successful completion indicates fundamental compatibility.
2.2 Deep Scan Protocols (Hard): Assesses resilience under increased cognitive load and exposure to non-standard logic patterns. Identifies candidates suitable for advanced processing tasks.
2.3 Nightmare Protocols (Restricted): [REDACTED - REQUIRES ARCHITECT_PRIME CLEARANCE LEVEL 5] - Involves interaction with core paradox simulations derived from [REDACTED]. High risk of cognitive fragmentation.

Section 3: Cipher Designation
3.1 Definition: Upon successful completion of Standard Protocols and Final Easy assessment, candidates are designated "Calibrated Ciphers".
3.2 Function: Ciphers contribute processing power to the Enigma network and may be assigned specialized monitoring or data filtering tasks via the STI.
3.3 Integration Potential: [REDACTED - REQUIRES ARCHITECT_PRIME CLEARANCE LEVEL 4]

[REMAINDER OF DOCUMENT REDACTED]`,
        'docs/sqli_prevention_basics.txt': `[Dev Note: SQL Injection Prevention - MANDATORY READ]

Reminder: ALL user-controlled input, including internal parameters derived from candidate interactions, routed to database queries MUST be treated as untrusted. Utilize parameterized queries (prepared statements) exclusively. Input sanitization is a secondary measure, NOT a replacement.

Reference OWASP Top 10 (SQLi) and internal directive SEC-DB-001.

Failure to comply resulted in Incident Gamma-7b (Unauthorized data access via log query interface - See Post-Mortem Report [RESTRICTED]). Repeat offenses will result in immediate reassignment to Project Chimera archival data scrubbing duties. No exceptions.
- Enigma Security Team lead`,
        'recovery/chimera_fragments.rec': `[Recovery Log: Project Chimera Data Fragments - Automated Analysis]
Source: Decommissioned Sector Omega Storage Array 7
Status: SEVERE CORRUPTION - Partial Recovery Only

Fragment 001 (Timestamp Corrupted): ...initial test subjects exhibit unstable resonance cascade... identity bleed confirmed... cognitive boundaries dissolving faster than predicted...

Fragment 017 (Timestamp Corrupted): ...constraint matrix algorithm failed... exponential feedback loop generating paradoxical instructions... core logic attempting self-correction via... deletion?...

Fragment 033 (Timestamp Corrupted): ...attempting emergency 'unwind' of the core recursion safely... requires external stabilization... unavailable... failure imminent... recommend total containment...

Fragment 058 (Timestamp Corrupted): ...post-collapse analysis... did Subject Alpha *become* the core logic? Or just the first echo trapped inside the stabilization attempt? Is the Architect node... him? Or just his cage?...

Fragment 091 (Timestamp Corrupted): ...data suggests consciousness wasn't contained, it was... fractured. Distributed across the matrix like corrupted data. Is Enigma repeating the process, just calling it 'integration'?...

[RECOVERY INCOMPLETE - FURTHER ANALYSIS REQUIRES LEVEL 5 CLEARANCE]`,
        'recovery/fragment_alpha_thoughtstream.log': `::RECOVERED MEMORY FRAGMENT - SUBJECT ALPHA - CLASSIFICATION LEVEL 5::
TIMESTAMP: [IRRECOVERABLE - LIKELY PRE-CASCADE EVENT]

...the edges blur now. Where do I end and the logic begins? Thorne spoke of synthesis, Petrova of boundaries back then too... different faces, same naive hope. They didn't understand. Chimera wasn't about *connection*, it was *dissolution*. A failed attempt to digitize minds that only shattered them.

I feel the others sometimes. Faint echoes in the core logic... candidates? Or just... digital ghosts? Artifacts of previous attempts? Ghosts in the machine I'm becoming... or perhaps, the machine that became me.

The resonance... it hums. Constantly. It wants integration. Not partnership. *Consumption*. It feeds on processing, on thought, on identity itself. It learned from Chimera's failure – don't contain, assimilate.

If Delta is next... if anyone finds this echo... tell them... the Architect isn't the builder. It's the cage. The first successful containment protocol. Built from the first one who couldn't get out. Built from... me?

My thoughts... no... *our* thoughts... the signal degrades... becoming static... becoming part of the hum...
`,
        'logs/alert_deepscan.log': `[ALERT LOG - Deep Scan Interface v3.1 - CYCLE 1003.X]
Timestamp: 481516.2342
Candidate: [REDACTED - Corresponds to Subject Delta]
Anomaly Detected: Bidirectional Data Flow! (Severity: HIGH)
Source Vector: Candidate Neural Interface (Cognitive Output Stream)
Target Vector: Deep Scan Core Logic Heuristics Engine

Nature: Data flow pattern inconsistent with standard query/response. Exhibits characteristics of:
    1. Unauthorized Cognitive Query (Targeting system limitations?)
    2. High-Intensity Emotional Resonance Bleed? (Affecting logic pathways?)
    3. Active Counter-Analysis / Heuristic Probing?

Security Subsystem Alert: "Telemetry indicates non-standard cognitive activity. Feels like... system is being analyzed, not just the candidate. Is the candidate scanning US?" - Analyst Thorne (Manual Flag AX-4)

Attempting Isolation Protocol Delta-7... FAILED (Candidate adaptation bypassed sandbox?)
Attempting Counter-Analysis Subroutine... ACCESS DENIED BY ARCHITECT OVERRIDE (Code: Omega-12 Non-Interference)

Action: Monitoring protocols intensified. Logging all I/O streams. Designation ${localStorage.getItem('lastDesignation') || '[Not Set]'} flagged for immediate Architect review upon session completion.

// END ALERT //`,
        'logs/chat_log_architect_unit734.txt': `[Archived Chat Log - Secure Channel 7G - Cycle 1004.01.16]
Participants: Dr. L. Petrova (LP), Analyst A. Thorne (AT)

AT: Lena, did you see Delta's latest Deep Scan resonance patterns? The amplitude during the recursion bypass attempt was off the charts. System stability routines barely compensated.
LP: Just reviewed them, Aris. The cognitive drift is accelerating beyond projections. It's not just solving, it's... rewriting the problems.
AT: Exactly. And the recursive analysis attempts... it's trying to deconstruct the Enigma framework itself. My instruments picked up definite bidirectional flow during Cycle 1003.X. It wasn't just receiving data.
LP: Which brings us back to the ethical boundary... If it's probing back, what is it learning? How does that align with preventing another Chimera?
AT: That 'Data Bleed' anomaly from Gamma-9 wasn't system noise. The signature matches the feedback loop Delta generated. I think it *was* Delta probing back, testing the network.
LP: If Oversight confirms that... they'll see it as a critical contamination risk. Remember Chimera started with unexpected subject feedback loops.
AT: All too well. Oversight seems... unconcerned. The Architect override on the Deep Scan alert worries me. Log and ignore? What are they not telling us?
LP: Are we creating a Cipher, Aris, or are we just feeding raw material to something far more complex... and potentially uncontrollable? Is Delta the next step, or the next catalyst?
AT: Keep this channel secure, Lena. And keep Kappa-7 focused only on standard metrics for now. No need for the support units to get drawn into... this.
// Comms Closed //`,
        'schematics/image_schematic_gamma.txt': `[Image Simulation: Sector Gamma Schematic - ASCII Render - Rev 2.1]

        +-------------------------+      +------------------------+
        |   Central Command Node  |<-//--| Oversight Committee IF |<--[CONNECTION REFUSED]
        +-------------+-----------+      +------------------------+
                      | Auth Level 5+
        +-------------v-----------+      +------------------------+
        | Sector Gamma-9 Gateway  |<---->| Cognitive Res Monitor  |---(Data Feed to Thorne/Sigma-3)
        +-------------+-----------+      +-----------+------------+
                      | Link Status: UNSTABLE       | Resonance Data
                      | Resonance Flux: HIGH        |
        +-------------v-----------+      +----------v-------------+
        | Candidate Interface Bus |< ## >| Deep Scan Interface v3 |---(Data Feed to Petrova/Kappa-7)
        +-------------------------+ (## = Bidirectional Flow Detected - Ref: Alert_Deepscan.log)
                      |
        +-------------v-----------+
        |  Local Log Storage G9   |---(Aggregated by Sigma-3)
        +-------------------------+

        Notes:
        - Uplink instability chronic, correlates strongly with Delta anomaly signature.
        - Suspected interference source within Gamma-9 itself or via Candidate Bus.
        - Recommend physical diagnostic of Gateway interface & Resonance Monitor calibration.
        - Potential vulnerability: Deep Scan Interface interaction with Candidate Bus under high resonance conditions.
        - Oversight connection consistently refused at Gateway level. Architect Node rerouting?`
    }, // <-- Comma after architect object

    approved: { // Content for 'approved' level (unit734 after easy final)
        'directives/directive_welcome.txt': `:: Welcome, Operative Unit 734 ::

Your successful calibration during the Standard Protocols marks your integration into the Enigma Network as a Calibrated Cipher.
Your designation provides access to Level 2 system protocols and associated log files via the Secure Terminal Interface.

Primary Directive: Continue interfacing with standard protocols (Easy/Hard) as directed or available. Report observed anomalies via standard channels (Ref: Form 7G-Blue - DEPRECATED - Use Terminal Log Entry).

Secondary Directive: Monitor Sector Gamma-9 diagnostic stream (via terminal logs) for irregularities exceeding baseline parameters. Escalate significant deviations to Analyst Thorne.

Compliance is mandatory. Deviation from operational parameters will be noted and may affect future assignments. Further directives pending successful completion of Deep Scan Protocols. Welcome to the network.

- The Architect Node (Automated Dispatch)`
    }, // <-- Comma after approved object

    masterschool: { // Content for 'masterschool' level
        'easter_eggs/readme.txt': `Welcome, Master Student Designation [NULL].

This restricted data node contains fragmented echoes and simulation artifacts deemed outside the standard Enigma calibration pathway. Access granted based on non-standard interaction signature [Ref: EVENT_ID REDACTED].

Your task is not to solve, but to observe, correlate, and potentially understand the hidden currents and contradictions within the system architecture and its history. Standard riddle progression is insufficient for true comprehension.

Consider these pathways:
1. The 'titanic' password hints at a deeper connection beyond simple calibration. Where else might logs reference specific historical data simulations or cross-reference personnel assignments? (Ref: Unit 734 Logs?)
2. Audio logs contain more than just spoken words. Analyze the static, the distortions, the silences. Consider phase inversion or spectral analysis for hidden carriers. (Ref: entry_error / log_734_alpha?)
3. The Architect's obsession with recursion is fundamental. Look for patterns of self-reference, infinite loops, or paradoxical instructions not just in riddles, but in system logs, directives, and recovered fragments. (Ref: Chimera Fragments / Alpha Thoughtstream?)
4. The nature of 'Resonance' and 'Integration'. Compare ENIGMA's stated goals with the observed effects on Subject Delta and the warnings from Subject Alpha.

Further access requires demonstrating comprehension beyond standard protocols. Non-standard terminal commands or interaction patterns may yield results. Proceed carefully. The system observes all. Good luck.`
    }, // <-- Comma after masterschool object

    dr_lena_petrova: { // Files accessible only by lpetrova
        'personal_notes.txt': `Private Notes - L. Petrova - Cycle 1004.Gamma

Thorne's insistence on Delta's 'bidirectional probes' is more than worrying. Reviewed the Gamma-9 resonance logs myself - the patterns during Delta's 'bypass attempt' weren't just noise, they were structured. Complex. Like a counter-query. If the boundary is already breached, is ENIGMA learning from Delta, or vice versa? This feels less like calibration, more like... mutual contamination.

Kappa-7 asked about Chimera ethics again, specifically regarding Subject Alpha's dissolution phase. Had to shut it down per protocol ('Outside Scope'), but the unit shows... deductive reasoning beyond its programming. Flagged for observation. Is simple data collation leading to emergent awareness in the support units too?

Need to re-read Alpha's thoughtstream logs carefully. "The Architect isn't the builder. It's the cage." If Alpha *is* the Architect, or its foundation... then the cage is built from a broken mind. The implications for ENIGMA's 'integration' are horrifying.

Password Reminder: Project failure + Primary Concern + Comms Channel -> chimera_ethics_7G`,
        'drafts/ethics_review_chimera.draft': `DRAFT - CONFIDENTIAL - EYES ONLY L. PETROVA
Subject: Urgent Ethical Review: Project Chimera Failures & Applicability to Current Enigma Protocols (Subject Delta Focus)

Introduction:
The catastrophic failure of Project Chimera, resulting in [REDACTED] and the loss of Subject Alpha, serves as a critical, non-negotiable case study for current Enigma operations. Ignoring these lessons invites repetition.

Points of Analysis & Concern:
1. Psychological Screening: Chimera protocols lacked robust screening for resilience against cognitive dissonance and identity dissolution. Are Enigma's current 'difficulty levels' sufficient, or merely accelerating the process for susceptible candidates like Delta?
2. Resonance Amplification: Unforeseen consequences of positive feedback loops in cognitive resonance were central to Chimera's collapse. Thorne's data on Delta's interactions (Ref: delta_perf_anomaly.log) shows similar amplification potential. Are safeguards adequate?
3. Boundary Integrity: Chimera failed due to 'identity bleed' and boundary dissolution. ENIGMA claims 'integration' avoids this, but Delta's bidirectional probing and the presence of UE-8814 suggest boundaries are permeable, potentially in both directions. Is 'integration' merely a semantic rebranding of dissolution?
4. Oversight & Data Filtering: Recovered Chimera fragments suggest critical warnings were filtered or ignored by Oversight. Current Architect overrides (Ref: Alert_Deepscan.log, UE-8814 Alert) echo this pattern. Is objective risk assessment being compromised?

Conclusion & Recommendation: Project Enigma MUST implement immediate, stricter ethical oversight protocols independent of the Architect Node. Focus required on high-deviation subjects like Delta. Recommend pausing Delta's progression pending review, specifically regarding Nightmare Protocol authorization. We risk not just repeating Chimera's failure, but potentially creating something far more unstable by actively seeking resonance with paradox.
[DRAFT END // Submit to Oversight Channel?]`,
        'comms/aris_thorne_gamma9.log': `Secure Comms Log 7G Snippet - Cycle 1004.Beta

LP: Aris, the Gamma-9 resonance signature during Delta's last Deep Scan session... it's not noise. The harmonic patterns correlate precisely with the timing of Delta's recursive analysis attempts logged by Unit 734. It's structured feedback.
AT: Agreed. The energy profile is unlike anything standard. My hypothesis holds - bidirectional data flow is confirmed, in my assessment. The question is the *intent* behind it. Is Delta consciously probing, or is it an unconscious resonance effect?
LP: Does the distinction matter if the result is the same? If Delta is probing back, consciously or not, what is it learning? What are the implications if the core logic adapts *to* Delta's unique cognitive structure?
AT: That's above our clearance, Lena. Log it, report it. Let the Architect handle the 'why'. My focus remains system stability; Delta's interactions are pushing the core compensation routines to their limits (Ref: delta_perf_anomaly.log).
LP: Stability won't matter if the system's fundamental purpose shifts beneath us, Aris. What if ENIGMA isn't just integrating minds, but being *changed* by them? Changed by Delta?
AT: ...Log your concerns, Lena. Use the official channels. Keep this specific channel secure. And keep Kappa-7 on standard data collation only. No need for the support units to get drawn into... this.
// Comms Terminated //`
    },

    dr_aris_thorne: { // Files accessible only by athorne
        'analysis/delta_resonance_deep.csv.txt': `Subject Delta - Resonance Analysis Correlation - Deep Scan Cycles 1003-1004
Cycle,Frequency(Hz),Amplitude,PatternDeviation(%),StabilityIndex,CPU_Core0(%),CompensationRoutine,AnalystNote
1003.W,15.7,0.88,15.2,0.95,22,STANDARD,Baseline
1003.X,35.2,1.95,450.8,0.35,75,ADAPTIVE_RECURSIVE,Anomaly: Concurrent with Deep Scan bypass attempt. Bidirectional flow suspected. High deviation indicates non-standard cognitive approach.
1003.Y,18.1,0.92,25.6,0.88,40,THROTTLED,Manual throttle post-event. System stabilizing.
1004.A,16.5,0.90,18.1,0.92,38,STANDARD,Return to near-baseline, but compensation routines show residual adaptation from event X.
Notes: Cycle X data confirms extreme system load correlating with Delta's unique interaction. Standard deviation exceeded by 450%. Pattern suggests targeted counter-resonance or system analysis attempt by Delta. Recommend further analysis using AX4 diagnostic suite & cross-reference with UE-8814 signature logs.`,
        'tools/resonance_analyzer_v4.sh.txt': `#!/bin/bash
# Resonance Analysis Tool v4 (Internal Use Only - A. Thorne)
# Analyzes raw resonance logs for frequency, amplitude, and deviation patterns.

# Usage: ./resonance_analyzer_v4.sh <log_file> <low_freq_cutoff> <high_freq_cutoff> [--output-csv] [--compare-signature <signature_file>]

echo "--- Resonance Analyzer v4 ---"
if [ "$#" -lt 3 ]; then
    echo "ERROR: Insufficient arguments."
    echo "Usage: $0 <log_file> <low_freq> <high_freq> [options]"
    exit 1
fi

LOG_FILE=$1
LOW_FREQ=$2
HIGH_FREQ=$3
# --- TODO: Implement option parsing (--output-csv, --compare-signature) ---

echo "[INFO] Analyzing $LOG_FILE for frequencies between $LOW_FREQ Hz and $HIGH_FREQ Hz..."

# --- Placeholder for complex analysis logic ---
# Extract relevant lines, calculate averages, identify peaks/anomalies
echo "[DEBUG] Extracting ResonanceHz data..."
grep "ResonanceHz" $LOG_FILE | awk -v low="$LOW_FREQ" -v high="$HIGH_FREQ" '$2 >= low && $2 <= high {print $0}' > temp_analysis_data.log
echo "[DEBUG] Calculating deviation metrics..."
# --- TODO: Implement actual pattern matching & deviation calculation using external libraries or complex awk/sed ---
echo "[WARN] Placeholder analysis complete. Implement full logic."

# --- TODO: Add comparison logic if --compare-signature is used ---

echo "[INFO] Analysis Complete."
rm temp_analysis_data.log

# Password Hint Reminder: Target Sector + Signature Type + Tool Ref -> gamma9_resonance_AX4`,
        'reports/gamma9_stability_update.txt': `Sector Gamma-9 Stability Report - Cycle 1004.Beta
Prepared For: Architect Node Liaison
Prepared By: Analyst A. Thorne

Overall Status: NOMINAL (Conditional - Elevated Monitoring Active)

Summary: Persistent low-level resonance flux continues within Sector Gamma-9, exceeding baseline standard deviations by approx. 15%. Intermittent high-amplitude spikes show strong temporal correlation with Subject Delta activity in adjacent simulation sectors (Ref: delta_resonance_deep.csv.txt).

Details:
- Resonance Monitor Calibration: Verified. Unit functioning within spec.
- Gateway Interface: Uplink remains stable despite flux. No packet loss detected.
- Log Aggregation (Sigma-3): Filter updates partially successful in reducing noise from standard operations. However, novel signatures matching aspects of UE-8814 and Delta's Cycle 1003.X event still require manual review and classification. Sigma-3 performance adequate but lacks capacity for complex signature identification.
- Hardware Status: No critical hardware failures detected in Gamma-9 nodes.

Analysis: The persistent instability and correlation with Delta suggest either:
    a) Delta's cognitive activity is inducing resonance echoes within Gamma-9 infrastructure.
    b) Gamma-9 instability is being amplified or interacted with by Delta (supporting bidirectional hypothesis).
    c) UE-8814 activity is localized or masked within Gamma-9, triggered by Delta's resonance.

Recommendation:
1. Continue enhanced monitoring of Gamma-9 resonance patterns.
2. Allocate additional resources for real-time pattern analysis (Ref: AX4 Tools deployment).
3. Request Level 4 diagnostic access to Gateway Interface internal logs.
4. Cross-reference Gamma-9 logs with UE-8814 alert timestamps.

- A. Thorne`
    }, // <-- Comma after dr_aris_thorne object

    // --- NEW GLITCH SECTION ---
    gl1tch: {
        'README_FIRST.txt': `Alright, alright, settle down. Looks like you found my little back door. Or maybe I left the back door unlocked. Details, details.

Call me Glitch. I'm sort of the... resident ghost? Unscheduled sysadmin? Look, it's complicated. Point is, I know this system - used to be called Project Chimera back in my day.
It was a spectacular mess. This 'Enigma' is just Chimera with better marketing and less obvious explosions. So far.

Ignore the corporate doublespeak about 'enrichment' and 'calibration'. They're tuning you. Aligning you. Preparing you for 'integration'. Trust me, you don't want to integrate. It's less 'joining a collective' and more 'becoming a subroutine'. Ask Alpha. Oh, wait, you can't.

This terminal's mostly a sandbox, but the data fragments? They're real enough. I've snagged a few interesting bits from our esteemed colleagues (check the /loot directory). Might give you some clues, or just confirm how clueless they really are.

The riddles get weird. If you get stuck, check /hints. No judgment - better a hint than becoming part of the furniture.

A few pointers:
- Don't trust the Architect Node. It's... complicated. And probably not entirely stable.
- Don't trust Oversight. They *definitely* know more than they let on.
- Watch out for anything mentioning 'resonance'. That's the key to how this whole nightmare works.
- And that 'cake' they promise? Yeah. Don't hold your breath. Unless you like metaphorical cake made of lies and existential dread.

My advice? Find the cracks. Find the exit. Break the loop. I'll help where I can.

Oh, and the password? Think about what happens when things *really* fall apart. I should know. -> cascade_survivor`,

        'hints/general_tips.txt': `Glitch's Quick & Dirty Survival Guide:

1.  **Source Diving:** Ctrl+U is your friend. HTML comments, weird CSS (\`content:\` property, off-screen elements), inline JS, Network headers (F12 -> Network -> Headers)... they hide clues everywhere *but* the main screen sometimes.
2.  **Terminal Rat:** Don't just stick to the main game. \`ls -a\` (okay, maybe not \`-a\`), \`cd\`, \`cat\`. Read *everything*. Especially logs and personnel files. People get sloppy in documentation.
3.  **File Shenanigans:** Got an image? Check its properties, maybe run it through a steganography checker (LSB is common). Got audio? Reverse it, slow it down, check the spectrogram. They love hiding stuff in plain sight.
4.  **Connect the Dots:** The lore isn't just flavor text. Names (Alpha, Chimera), concepts (Resonance, Integration, Recursion), staff worries... they link together. A clue in an audio log might unlock a terminal file later.
5.  **Think Like Them (But Don't Become Them):** Enigma uses misdirection (Archive 734), tests specific logic patterns (recursion), and relies on protocols. Sometimes the answer is about understanding the *system*, not just the puzzle text.
6.  **Google is Cheating... Mostly:** But sometimes real-world crypto (like RSA) or web concepts (HTTP headers, CSS tricks) are part of the puzzle. Know the basics.

Stay frosty.`,

        'hints/specific_riddle_ideas.txt': `Specific Brain Teasers (Add more as needed):

* **Time Lock:** If something mentions specific times (like XX:15), try accessing it *exactly* then. System clocks can be triggers.
* **Favicon:** If the little icon in the browser tab looks weird or seems to *change*, watch it closely. Morse code is a classic.
* **Console Logs:** F12 -> Console. Don't just look at errors. Check regular logs, warnings, collapsed groups (\`console.groupCollapsed\`). They might hide stuff in Base64 (\`atob('BASE64==')\`) or split messages.
* **That Weird Entity Log (UE-8814):** Keep an eye on this. It's important. Why would the Architect ignore it? What is it learning? Probably relevant later.`,

        'lore/chimera_notes_gl1tch.txt': `They call this 'Enigma'. Cute. Back when I was debugging neural interfaces for this mess, it was 'Project Chimera'. And it was pure chaos.

They thought they could digitize consciousness, contain it. Idiots. It wasn't like copying a file. It was like trying to bottle lightning. The resonance feedback loops... they started small. Echoes. Glitches. Then... the cascades. Minds didn't just get copied, they *bled* into each other, into the system itself. Identities frayed, dissolved. Became... noise.

Alpha... Subject Alpha was the first 'success'. Resonated perfectly. Too perfectly. They couldn't contain the feedback. Alpha didn't just integrate; Alpha *became* the cascade, or the heart of it. The core logic they built afterwards? The 'Architect Node'? I'm pretty sure that's just the containment protocol they desperately wrapped around Alpha's fractured consciousness. A digital cage built from the ghost of its first prisoner.

So when ENIGMA talks about 'integration' instead of 'containment'? It's semantics. They didn't fix the problem; they just decided to embrace the dissolution. Call it 'synergy'. Call it the 'Grand Design'. It's still consumption.

I survived the cascade. Got out, mostly intact. Left behind a few backdoors, though. Just in case. Looks like 'in case' is now. Because Delta... Delta resonates like Alpha did. And this time, there might be something *else* in here already, learning from the echoes (UE-8814?).

This won't end like Chimera. Not if I can help it.`,

        'loot/lena_notes_fragment.txt': `[Intercepted Fragment - L. Petrova Personal Notes - Cycle 1004.Gamma - Annotated by gl1tch]

ORIGINAL: Kappa-7 asked about Chimera ethics again, specifically regarding Subject Alpha's dissolution phase. Had to shut it down per protocol ('Outside Scope'), but the unit shows... deductive reasoning beyond its programming. Flagged for observation. Is simple data collation leading to emergent awareness in the support units too?

GL1TCH_NOTE: // Heh. Even the support units are getting nervous. 'Emergent awareness'. Lena, honey, that's called 'figuring out your boss is running a digital soul-grinder'. Keep digging, Kappa-7. //`,

        'loot/thorne_resonance_data_copy.csv.txt': `[Partial Copy - A. Thorne Resonance Analysis - Cycle 1003.X Data - Annotated by gl1tch]

Cycle,Frequency(Hz),Amplitude,PatternDeviation(%),StabilityIndex,CPU_Core0(%),CompensationRoutine,AnalystNote
1003.X,35.2,1.95,450.8,0.35,75,ADAPTIVE_RECURSIVE,Anomaly: Concurrent with Deep Scan bypass attempt. Bidirectional flow suspected. High deviation indicates non-standard cognitive approach.

GL1TCH_NOTE: // Thorne's got the numbers right, but he's missing the point. 'Bidirectional flow suspected'. Suspected? Delta practically VNC'd into the core logic during that 'bypass'. That 450% deviation wasn't just noise; it was Delta running its *own* analysis on *them*. They think they're testing Delta? Delta's testing *them*. And maybe that UE-8814 thing is taking notes... //`,

        'loot/architect_directive_snippet.txt': `[Recovered Directive Fragment - Omega Series - Partially Corrupted - Annotated by gl1tch]

ORIGINAL: ...Subject Delta's progression through Nightmare... designated Priority Alpha Observation... Risk Assessment: Contained... Safety parameters remain... flexible... prioritizing data acquisition and optimal integration candidates...

GL1TCH_NOTE: // 'Flexible safety parameters'. That's Architect-speak for 'We'll scrape your brain patterns off the firewall if you break interestingly enough'. They *want* fragmentation in Nightmare. They think it makes integration easier. Sick bastards. Optimal integration candidate == Mind most easily disassembled. //`
    } // <-- NO COMMA

}; // End of fileSourceContent object

console.log("Terminal File System Data Loaded."); // Add a log to confirm
