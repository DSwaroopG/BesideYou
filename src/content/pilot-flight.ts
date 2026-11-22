export const phases = [
 { name: "Pre-flight", days: "Day 00 to 06", line: "We learn who your best clients have been. You approve the message.", agency: "Still onboarding. Nothing sent.", notes: ["KICKOFF CALL", "ONBOARDING FORM"] },
 { name: "Take-off", days: "Day 07", line: "First emails go out, each one written for that account.", agency: "Still in kickoff calls, often until day 30.", notes: ["KICKOFF CALL, AGAIN", "STATUS CALL"] },
 { name: "Cruise", days: "Day 08 to 26", line: "We send, manage deliverability and read every reply.", agency: "Sends from your company domain and risks your reputation.", notes: ["SENT FROM YOUR DOMAIN", "VOLUME UP"] },
 { name: "Handover", days: "Around day 27", line: "A reply is qualified, briefed and handed to you within two hours.", agency: "Forwards you an inbox and calls it a lead.", notes: ["INBOX FORWARDED", '"IS THIS A LEAD?"'] },
 { name: "Approach", days: "Day 28 to 59", line: "Each cycle sharpens the list and the message. We report one number.", agency: "Reports activity: sends, opens, meetings booked.", notes: ["ACTIVITY REPORT", "MEETINGS BOOKED"] },
 { name: "Landing", days: "Day 60", line: "Only two ways this ends.", agency: "Still holding. Asks you to renew and try again.", notes: ["RENEW?", "TRY AGAIN?"] },
] as const;
export const boundaries = [0, .15, .27, .49, .61, .79, 1] as const;
export const at = (stage: number, progress: number) => boundaries[stage] + (boundaries[stage + 1] - boundaries[stage]) * progress;
export const fromYou = [
 { text: "Who your best clients have been", stage: 0, progress: .35 },
 { text: "Approval on the message before anything sends", stage: 0, progress: .85 },
 { text: "A reply within 24 hours of each handover", stage: 3, progress: .6 },
] as const;
export const delivered = [
 { text: "Target list from your best clients", stage: 0, progress: .5 },
 { text: "Message written per account", stage: 0, progress: .95 },
 { text: "Sending and deliverability, never your domain", stage: 2, progress: .15 },
 { text: "Every reply read within two hours", stage: 3, progress: .25 },
 { text: "A context brief before each handover", stage: 3, progress: .6 },
 { text: "A system that stays in your business", stage: 5, progress: .75 },
] as const;
export const routes = [
 "M90,560 H240", "M240,560 C320,560 330,300 440,280", "M440,280 C560,262 700,300 820,272",
 "M820,272 C880,258 900,300 930,330", "M930,330 C990,390 1080,420 1150,430", "M1150,430 C1200,430 1210,318 1270,316 L1392,316",
] as const;
export const alternate = "M1150,430 C1200,430 1210,562 1270,564 L1392,564";
export const holding = "M470,522 H650 A42,42 0 0 0 650,438 H470 A42,42 0 0 0 470,522 Z";
export const taxi = "M90,560 C220,560 360,522 470,522";
export const popups = [
 { x:60,y:388,w:236,anchor:[246,554],open:at(1,.2),close:at(2,.3),label:"Day 07 · Take-off",title:"Live inside seven days.",body:"First emails go out, each written for that account." },
 { x:512,y:178,w:256,anchor:[640,286],open:at(2,.3),close:at(3,.4),label:"Day 08 to 26 · Turbulence",title:"Never your domain.",body:"If deliverability takes a hit, it is ours." },
 { x:962,y:176,w:272,anchor:[930,326],open:at(3,.4),close:at(4,.35),label:"Around day 27 · Handover",title:"Briefed and handed to you within two hours.",body:"Your only job: reply within 24 hours." },
 { x:880,y:462,w:262,anchor:[1062,407],open:at(4,.35),close:at(5,.5),label:"Day 28 to 59 · Approach",title:"One number reported.",body:"Conversations that can close. Not sends, not opens." },
 { x:1136,y:190,w:294,anchor:[1332,304],open:at(5,.62),close:2,label:"Destination",title:"3 qualified conversations",body:"With people who can sign, each handed over with a brief." },
 { x:900,y:556,w:244,anchor:[1262,576],open:at(5,.62),close:2,label:"Alternate",title:"Money back, in cash",body:"Not credits. Not a free extension." },
] as const;
export const flightQuestions = [
 { question:"What happens if it does not produce three conversations?",answer:"We pay you back in cash. Not credits, not a free extension. The count at day 60 decides it." },
 { question:"Who actually does the work?",answer:"The same small team from start to finish. No juniors, no subcontractors." },
 { question:"Do you send from my domain?",answer:"No. Your domain is never used for sending. The risk sits on our side." },
 { question:"Is there a lock-in or a minimum term?",answer:"The Pilot is sixty days and ends at day 60. What happens after that is your decision." },
 { question:"What do you need from me to start?",answer:"Who your best clients have been. Approval on the message before anything sends. A reply within 24 hours when we hand a live conversation over." },
] as const;
