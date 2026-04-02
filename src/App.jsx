import { useState, useEffect, useMemo, useRef } from "react";
const signs={noTrucks:()=><svg viewBox="0 0 100 100" width="120" height="120"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#c0392b" strokeWidth="7"/><rect x="28" y="48" width="40" height="18" rx="3" fill="#333"/><rect x="28" y="38" width="24" height="14" rx="2" fill="#333"/><circle cx="35" cy="68" r="4" fill="#333"/><circle cx="60" cy="68" r="4" fill="#333"/><line x1="14" y1="86" x2="86" y2="14" stroke="#c0392b" strokeWidth="7" strokeLinecap="round"/></svg>,weightLimit:t=><svg viewBox="0 0 100 100" width="120" height="120"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#c0392b" strokeWidth="7"/><text x="50" y="56" textAnchor="middle" fontSize="26" fontWeight="800" fill="#333">{t||"7.5t"}</text></svg>,heightLimit:t=><svg viewBox="0 0 100 100" width="120" height="120"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#c0392b" strokeWidth="7"/><line x1="32" y1="28" x2="32" y2="72" stroke="#333" strokeWidth="3"/><line x1="68" y1="28" x2="68" y2="72" stroke="#333" strokeWidth="3"/><line x1="28" y1="30" x2="36" y2="30" stroke="#333" strokeWidth="3"/><line x1="28" y1="70" x2="36" y2="70" stroke="#333" strokeWidth="3"/><line x1="64" y1="30" x2="72" y2="30" stroke="#333" strokeWidth="3"/><line x1="64" y1="70" x2="72" y2="70" stroke="#333" strokeWidth="3"/><text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill="#333">{t||"4.0m"}</text></svg>,noOvertakeTruck:()=><svg viewBox="0 0 100 100" width="120" height="120"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#c0392b" strokeWidth="7"/><rect x="18" y="44" width="26" height="14" rx="2" fill="#c0392b"/><rect x="18" y="38" width="16" height="9" rx="1" fill="#c0392b"/><circle cx="24" cy="60" r="3" fill="#c0392b"/><circle cx="38" cy="60" r="3" fill="#c0392b"/><rect x="52" y="44" width="26" height="14" rx="2" fill="#333"/><rect x="52" y="38" width="16" height="9" rx="1" fill="#333"/><circle cx="58" cy="60" r="3" fill="#333"/><circle cx="72" cy="60" r="3" fill="#333"/></svg>,axleWeight:()=><svg viewBox="0 0 100 100" width="120" height="120"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#c0392b" strokeWidth="7"/><line x1="30" y1="55" x2="70" y2="55" stroke="#333" strokeWidth="4"/><circle cx="38" cy="62" r="5" fill="none" stroke="#333" strokeWidth="3"/><circle cx="62" cy="62" r="5" fill="none" stroke="#333" strokeWidth="3"/><text x="50" y="42" textAnchor="middle" fontSize="20" fontWeight="800" fill="#333">10t</text></svg>,envZone:()=><svg viewBox="0 0 100 100" width="120" height="120"><rect x="4" y="4" width="92" height="92" rx="8" fill="#fff" stroke="#333" strokeWidth="3"/><circle cx="50" cy="42" r="22" fill="#4caf50"/><text x="50" y="48" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">EURO</text><text x="50" y="82" textAnchor="middle" fontSize="11" fontWeight="700" fill="#333">Umweltzone</text></svg>,tunnelCatE:()=><svg viewBox="0 0 120 100" width="140" height="120"><rect x="2" y="2" width="116" height="96" rx="6" fill="#1565c0"/><path d="M20 80 L20 35 Q60 10 100 35 L100 80 Z" fill="#fff"/><rect x="45" y="25" width="30" height="22" rx="4" fill="#f57c00"/><text x="60" y="42" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff">E</text><rect x="35" y="60" width="50" height="16" rx="3" fill="#333"/><circle cx="45" cy="78" r="4" fill="#333"/><circle cx="75" cy="78" r="4" fill="#333"/></svg>,dangerousGoods:()=><svg viewBox="0 0 100 100" width="120" height="120"><rect x="10" y="10" width="56" height="56" fill="#f57c00" stroke="#333" strokeWidth="3" transform="rotate(45 38 38)"/><text x="50" y="45" textAnchor="middle" fontSize="26" fontWeight="900" fill="#333">3</text><text x="50" y="65" textAnchor="middle" fontSize="10" fontWeight="600" fill="#333">1203</text></svg>};
const SECTIONS=[
  {id:"aetr",title:"Tachograph & AETR",icon:"\u23F1\uFE0F",desc:"Scenario questions - driving times, breaks, and rest"},
  {id:"cmr",title:"CMR & Administration",icon:"\uD83D\uDCCB",desc:"Documents, customs paperwork, and liability"},
  {id:"tolls",title:"Tolls & EU Navigation",icon:"\uD83D\uDEE3\uFE0F",desc:"Toll systems and low-emission zones"},
  {id:"loading",title:"Loading & Weight Distribution",icon:"\u2696\uFE0F",desc:"Load placement and securing"},
  {id:"signs",title:"Road Signs",icon:"\uD83D\uDEA6",desc:"Road signs relevant for International trailer drivers"},
  {id:"personality",title:"Driver Work Style",icon:"\uD83E\uDDE0",desc:"How you usually act in real work situations"}
];
const QUESTIONS={
  aetr:[
    {q:"A driver starts driving at 06:00. They drive 3 hours, take a 15-minute break, and then drive another 2 hours. How many minutes of rest must they take now?",options:["15 minutes","30 minutes (the second part of a split break)","45 minutes (a completely new break)","None, they still have 30 minutes of driving left"],correct:1,explanation:"A split break must be taken as 15 minutes + 30 minutes. After 3h + 2h = 5h of driving, the 30-minute part should already have been completed before exceeding 4.5 hours."},
    {q:"A driver has already driven 56 hours this week (the maximum). How many hours can they drive next week at most?",options:["56 hours","45 hours","34 hours","44 hours"],correct:2,explanation:"The two-week limit is 90 hours. If the driver did 56 hours in week one, the maximum for week two is 90 - 56 = 34 hours."},
    {q:"In multi-manning (two drivers), what is the minimum daily rest and in what time window?",options:["11h within 24h","9h within 24h","9h within 30h","11h within 30h"],correct:2,explanation:"With multi-manning, the driver must take at least 9 hours of rest within a 30-hour window."},
    {q:"A driver boards a ferry at 22:00 for an 8-hour crossing and has a cabin. What applies?",options:["The whole time counts as driving","The whole time counts as other work","Daily rest may be interrupted max. 2 times, max. 1 hour total for boarding/disembarking, the rest counts as rest","The whole time counts as availability"],correct:2,explanation:"Under Article 9 of Regulation 561/2006, a rest period on a ferry may be interrupted a maximum of two times for a total of up to one hour. The driver must have access to a bunk or cabin."},
    {q:"A reduced weekly rest of 24 hours was taken. By when must the compensation be added back?",options:["By the end of the following week","By the end of the 3rd week, in one block attached to a rest period of at least 9 hours","No compensation is needed if the next weekly rest is 45 hours","Within 6 weeks in separate parts"],correct:1,explanation:"The missing 21 hours must be compensated by the end of the third week and attached in one block to a rest period of at least 9 hours."},
    {q:"Driving starts at 06:00. At 09:30 the driver checks the load for 20 minutes. At 10:15 there is a 15-minute break. At 12:00 there is a 30-minute break. Is there a violation?",options:["No - 15 + 30 = 45 minutes is fine","Yes - checking the load is not a break, so cumulative driving exceeded 4.5 hours","No - 20 + 15 + 30 = 65 minutes is enough","Yes - but only by 5 minutes"],correct:1,explanation:"A load check is other work, not a break. Driving time is 3.5h + 1.5h = 5h before the 30-minute part of the split break, so this is a violation."},
    {q:"How many reduced weekly rests (24h) may be taken in a row?",options:["Unlimited","Maximum 2, then at least 1 regular weekly rest of 45h must follow","Maximum 3","Only 1, then 45h immediately"],correct:1,explanation:"A maximum of 2 reduced weekly rests may be taken in a row. After that, a regular 45-hour weekly rest must follow, plus compensation."},
    {q:"What does 'availability' mean on a tachograph?",options:["The driver is waiting for loading and knows the expected duration in advance","The driver is sleeping in the cab","The driver is driving the vehicle","The driver is taking a break whenever they choose"],correct:0,explanation:"Availability means the driver is not driving and not doing other work, but remains available. For example, waiting with a known expected duration. It does not count as rest."}
  ],
  cmr:[
    {q:"The sender refuses to record reservations in CMR box 18. What do you do?",options:["Load the goods and write nothing","Refuse to load","Write the reservation in box 18 yourself, take photos, and inform the carrier","Load without reservations"],correct:2,explanation:"The driver may record reservations unilaterally. The key is photo evidence and written notice to the carrier."},
    {q:"Who is responsible for damage during transport under the CMR Convention?",options:["Always the driver","The carrier, unless they prove grounds for exemption under Article 17(2)","The sender","The insurance company"],correct:1,explanation:"Under Article 17 CMR, the carrier is responsible unless they can prove grounds for exemption such as the fault of the claimant, inherent defect of the goods, or unavoidable circumstances."},
    {q:"What is a TIR carnet and when is it used?",options:["It replaces the CMR consignment note","It is a customs transit document used for transport through countries without customs checks at every border - the CMR is still required","It is mandatory only for ADR loads","It is no longer used"],correct:1,explanation:"TIR is a customs transit document. The goods are sealed and usually checked only at departure and destination. The CMR remains a separate transport document."},
    {q:"You receive a sealed container. What must be written in the CMR?",options:["A full description of the contents","'Contents unknown' only","Container number, seal number, and a reservation that it is under the sender's seal","Nothing special"],correct:2,explanation:"You should record the container number, the seal number, and a reservation in box 18. Otherwise you may assume responsibility for goods you did not inspect."},
    {q:"Three pallets out of twenty are missing at delivery and the consignee refuses to write it down. What do you do?",options:["Sign without any note","Refuse to sign anything","Write the note in box 24, do not sign a clean CMR, and inform the carrier in writing","Leave without any signature"],correct:2,explanation:"Box 24 is used for remarks at delivery. Never sign a clean CMR when there is a problem. Add written notice and photo evidence."},
    {q:"What is the difference between T1 and T2?",options:["T1 is for EU goods and T2 for non-EU goods","T1 = non-EU goods, T2 = EU goods - both are customs transit documents","T1 means import and T2 means export","They are the same thing"],correct:1,explanation:"T1 is used for transit of non-EU goods. T2 is used for transit of EU goods, for example through a non-EU country like Switzerland."},
    {q:"What is an EUR.1 certificate?",options:["A customs transit document","A preferential origin certificate that may allow reduced or zero customs duty","An invoice for customs purposes","A VAT confirmation"],correct:1,explanation:"EUR.1 confirms preferential origin and can allow lower customs duty under trade agreements."},
    {q:"For ADR Class 3, what does NOT have to be in the cab?",options:["Written instructions","A fire extinguisher","The driver's ADR certificate","A weighing scale"],correct:3,explanation:"A weighing scale is not part of ADR equipment. Mandatory items include written instructions, extinguishers, ADR certificate, high-visibility vest, flashlight, and wheel chocks."}
  ],
  tolls:[
    {q:"Which countries on the Bratislava to Lisbon route use GNSS / satellite tolling?",options:["Germany, Austria, Czech Republic","Germany, Hungary, Slovakia, Czech Republic","All EU countries","Germany and Belgium"],correct:1,explanation:"Satellite / GNSS systems include Germany (Toll Collect), Hungary (HU-GO), Slovakia (SkyToll), and Czech Republic (CzechToll). Austria uses GO-Box (DSRC). France, Spain, Italy, and Portugal mainly use toll gates."},
    {q:"A Euro VI truck is going to Antwerp. What is needed in addition to the toll unit?",options:["Nothing - Euro VI is enough","LEZ registration - online registration is required even for Euro VI","A Belgian sticker","Police permission"],correct:1,explanation:"Belgian low-emission zones require online registration even for Euro VI vehicles. Without registration, there can be a fine."},
    {q:"How is LSVA in Switzerland different?",options:["It is a standard motorway toll","It applies on ALL roads and depends on kilometres, weight, and emission class, so it is significantly more expensive","It only applies to transit traffic","It only applies to mountain passes"],correct:1,explanation:"LSVA applies for every kilometre on any road in Switzerland and depends on weight, emission class, and distance."},
    {q:"You are going to Norway for the first time. Which statement is correct?",options:["Norway is in the EU","AutoPASS OBU is used, registration is required, ferries are part of the system, and there is no interoperability with EU toll systems","There is no toll in Norway","Toll Collect is enough"],correct:1,explanation:"Norway is not in the EU. AutoPASS and registration are required, and ferry charges can be included in the tolling system."},
    {q:"What caused the biggest increase in German toll costs from December 2023?",options:["VAT","The CO2 surcharge based on the emission class","An extension of the road network","New technology"],correct:1,explanation:"The CO2 surcharge significantly increased German toll costs, especially for Euro VI vehicles."},
    {q:"What happens if you lose your ticket on an Italian motorway?",options:["Nothing, the OBU replaces it","You may be charged from the farthest possible entry point - the maximum amount","There is always a fixed 50 EUR fine","You must drive back"],correct:1,explanation:"If the ticket is lost, the charge is usually calculated from the farthest possible entry point. With Telepass this issue normally does not arise."},
    {q:"What is EETS?",options:["One single toll system for the whole EU that already works everywhere","An EU interoperability goal - some providers offer multi-country OBUs, but it is still not fully unified everywhere","The European motorway police","A penalty system"],correct:1,explanation:"EETS is the EU concept for toll interoperability. Some providers offer multi-country solutions, but it is still not fully unified everywhere."},
    {q:"A Euro V truck is going to Stuttgart. What applies?",options:["There is no low-emission zone","A green sticker is always enough","Stuttgart had stricter local rules, including restrictions on Euro V diesel vehicles","A yellow sticker is enough"],correct:2,explanation:"Stuttgart became known for particularly strict local environmental restrictions, including limitations for Euro V diesel vehicles beyond the standard Umweltzone rules."}
  ],
  loading:[
    {q:"What is the maximum load for a tri-axle trailer with wheelbase >= 1.3 m?",options:["18t","21t","24t","27t"],correct:2,explanation:">= 1.3 m wheelbase means a maximum of 24 tonnes. If it is below 1.3 m, the limit is 21 tonnes."},
    {q:"You have 22 tonnes on 10 pallets. Where should the heaviest pallets go?",options:["At the rear","At the front near the kingpin only","The heaviest pallets over the trailer axles and near the kingpin, lighter ones at the ends","It does not matter as long as total weight is below 40t"],correct:2,explanation:"The target is kingpin load around 10-12t and trailer tri-axle max 24t. The heaviest pallets should be placed over the axles and near the kingpin, lighter ones toward the ends."},
    {q:"According to EN 12195-1, what securing forces must be achieved as a percentage of cargo weight?",options:["50 / 30 / 30","80 / 50 / 50 (forward / sideways / rearward)","100 / 80 / 50","80 in all directions"],correct:1,explanation:"The usual rule is 80% forward, 50% sideways, and 50% rearward."},
    {q:"Axle loads are 6.5t / 12.5t / 22t and total weight is 41t. How many violations are there?",options:["1 (total weight only)","2 (total weight + drive axle)","3 (total + drive axle + tri-axle)","1 (drive axle only)"],correct:1,explanation:"41t exceeds the 40t gross limit and 12.5t exceeds the 11.5t drive axle limit. 22t is still below 24t, so there are 2 violations."},
    {q:"What is the correct way to secure steel coils?",options:["Vertically with straps only","Horizontally in a cradle with wedges, straps/chains, and anti-slip mat","Leaning against the trailer wall","With airbags only"],correct:1,explanation:"Steel coils should be transported horizontally in a cradle, secured with wedges, anti-slip material, and straps or chains."},
    {q:"A tanker is filled to 50%. What is the specific risk?",options:["No special risk","Surge effect - liquid movement dramatically changes the center of gravity","Only a problem if there are no baffles","Only fuel consumption changes"],correct:1,explanation:"Surge effect is often worst around 40-60% filling. Baffles, smooth driving, and avoiding harsh maneuvers are important."},
    {q:"Why is the coefficient of friction (mu) important?",options:["It describes tyre resistance","It describes friction between the load and the floor - lower mu means more securing is needed","It only affects braking distance","It only affects fuel consumption"],correct:1,explanation:"For example, wood on metal can be around 0.3, while anti-slip mats may increase it to around 0.6. Higher friction means fewer straps may be needed."},
    {q:"What is the standard maximum GVW for a 5-axle combination in the EU?",options:["36t","38t","40t","44t"],correct:2,explanation:"The standard maximum is 40 tonnes. 44 tonnes may be allowed in some countries for combined transport."}
  ],
  signs:[
    {q:"What does this sign mean?",sign:"noTrucks",options:["No stopping","No entry above a certain weight","No entry for goods vehicles / trucks","One-way street"],correct:2,explanation:"No entry for trucks or goods vehicles."},
    {q:"A red circle with '7.5t' - what does it apply to?",sign:"weightLimit",signArg:"7.5t",options:["Maximum cargo weight","Maximum gross vehicle / combination weight (GVW)","Maximum axle load","Minimum required weight"],correct:1,explanation:"It refers to the maximum gross vehicle or combination weight."},
    {q:"A sign with '4.0m' - what must the driver know?",sign:"heightLimit",signArg:"4.0m",options:["Road width","Maximum height - the driver must know the exact height of the combination with the load","Distance to the bridge","Bridge clearance above water"],correct:1,explanation:"It is a height limit. The driver must know the actual height of the vehicle and load."},
    {q:"A motorway sign with two trucks - what does it mean?",sign:"noOvertakeTruck",options:["No overtaking for all vehicles","No overtaking for trucks over 3.5t","Overtake on the right","Reduced speed only"],correct:1,explanation:"This sign means no overtaking for vehicles over 3.5t. It is common in countries such as Germany, Austria, and France."},
    {q:"What is the difference between an axle load sign '10t' and a normal weight limit sign?",sign:"axleWeight",options:["There is no difference","It refers to the load on one axle, important for bridges and weaker roads","It means cargo weight only","It applies only to rear axles"],correct:1,explanation:"An axle load limit refers to one axle only. It is important on bridges and weaker roads."},
    {q:"'Umweltzone'. A Euro III vehicle without a sticker - what applies?",sign:"envZone",options:["It is only for electric vehicles","There can be a fine, and a green sticker is required in many German zones (typically Euro 4 or above)","It is only an information sign","It is part of the toll system"],correct:1,explanation:"Many Umweltzonen require a green sticker, typically linked to Euro 4 or better. Entering without the required sticker can result in a fine."},
    {q:"Tunnel category 'E' for ADR - what does it mean?",sign:"tunnelCatE",options:["An exception for trucks","Complete prohibition for all ADR vehicles","Electronic toll only","Ventilation category"],correct:1,explanation:"Category E is the strictest tunnel category and means a complete ban for ADR vehicles."},
    {q:"An orange ADR plate with '3' on top and '1203' below - what does it mean?",sign:"dangerousGoods",options:["Registration number","ADR plate - 3 means flammable liquid, 1203 is the UN number for petrol/gasoline","Carrier ID number","Customs document"],correct:1,explanation:"On ADR orange plates, the top number identifies the hazard class and the lower number is the UN number."}
  ]
};
const PERS=[
  {q:"Someone hits your mirror in a parking area and drives away. What do you do?",options:["I get angry and look for them","I call the police immediately","I take photos, report it to dispatch, write a report, and continue","I repair it myself and say nothing"],scores:[0,1,3,1],trait:"stress"},
  {q:"You have been on the road for 3 weeks. It is Friday and you are alone in Poland. How do you usually feel?",options:["Very bad","It is difficult, but I call my family and manage it","I am used to it and I have my routines","I enjoy the quiet"],scores:[0,1,3,2],trait:"independence"},
  {q:"Dispatch changes your route 30 minutes before loading. What is your reaction?",options:["I get angry","I do not like it, but I accept it","No problem, I change the GPS and continue","I ignore it and drive the original route"],scores:[0,1,3,0],trait:"adaptability"},
  {q:"A customs officer speaks only French. What do you do?",options:["I wait until someone speaks English","I use gestures only","I use a translator app, organise the documents calmly, and stay professional","I call dispatch immediately and do nothing else"],scores:[1,1,3,1],trait:"communication"},
  {q:"It is 14:00, you are tired, your destination is 1.5 hours away, and your legal limit still allows you to continue. What do you do?",options:["I continue and drink coffee","I stop for 20 minutes, wash my face, recover, then continue","I continue even if my eyes are closing","I sleep and deliver tomorrow"],scores:[1,3,0,1],trait:"discipline"},
  {q:"The customer claims damage, but you transported the load correctly. What do you do?",options:["I argue with them","I stay silent and sign anything","I stay calm, refuse unfair blame, use photos and CMR reservations, and call dispatch","I leave without any signature"],scores:[0,0,3,0],trait:"professionalism"}
];
const TL={stress:"Stress handling",independence:"Independence",adaptability:"Adaptability",communication:"Communication",discipline:"Discipline",professionalism:"Professionalism"};
function getGrade(k,p){if(k>=82&&p>=70)return"A";if(k>=65&&p>=55)return"B";if(k>=45&&p>=40)return"C";return"FAILED";}
const GI={
  A:{color:"#1fa269",bg:"#eaf8f0",label:"Category A - Excellent",desc:"Very strong knowledge. Suitable for stronger clients and premium opportunities."},
  B:{color:"#c98700",bg:"#fff7e6",label:"Category B - Good",desc:"Good knowledge. Usually suitable after a short introduction or check call."},
  C:{color:"#e07b1f",bg:"#fff2e8",label:"Category C - Conditional",desc:"Needs additional training or follow-up verification before being presented further."},
  FAILED:{color:"#d94b4b",bg:"#fff0f0",label:"Not suitable yet",desc:"The current result shows that more preparation is needed before moving forward."}
};

function normalizePassportNumber(value = "") {
  return value.toUpperCase().replace(/[\s-]+/g, "").replace(/[^A-Z0-9]/g, "");
}

function maskPassportNumber(value = "") {
  const normalized = normalizePassportNumber(value);
  if (!normalized) return "-";
  if (normalized.length <= 4) return normalized;
  return `${normalized.slice(0, 2)}***${normalized.slice(-2)}`;
}

function buildKnowledgeAnswerList(answers) {
  return Object.entries(QUESTIONS).flatMap(([sectionId, list]) =>
    list.map((question, index) => {
      const selectedIndex = answers[`${sectionId}-${index}`];
      return {
        sectionId,
        sectionTitle: SECTIONS.find((s) => s.id === sectionId)?.title || sectionId,
        questionIndex: index,
        question: question.q,
        selectedIndex: selectedIndex ?? null,
        selectedOption: selectedIndex !== undefined ? question.options[selectedIndex] : null,
        correctIndex: question.correct,
        correctOption: question.options[question.correct],
        isCorrect: selectedIndex === question.correct,
        explanation: question.explanation,
      };
    })
  );
}

function buildPersonalityAnswerList(answers) {
  return PERS.map((question, index) => {
    const selectedIndex = answers[`personality-${index}`];
    return {
      sectionId: "personality",
      sectionTitle: "Driver Work Style",
      questionIndex: index,
      question: question.q,
      selectedIndex: selectedIndex ?? null,
      selectedOption: selectedIndex !== undefined ? question.options[selectedIndex] : null,
      selectedScore: selectedIndex !== undefined ? question.scores[selectedIndex] : null,
      trait: question.trait,
      traitLabel: TL[question.trait],
    };
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generatePdfBlobFromElement(element) {
  const [{ jsPDF }, html2canvasModule] = await Promise.all([import("jspdf"), import("html2canvas")]);
  const html2canvas = html2canvasModule.default;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    scrollY: -window.scrollY,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= usableHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    position = margin - (imgHeight - heightLeft);
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= usableHeight;
  }

  return pdf.output("blob");
}

export default function DriverTest() {
  const searchParams = useMemo(() => new URLSearchParams(window.location.search), []);
  const prefilledPassport = useMemo(
    () => normalizePassportNumber(searchParams.get("passport") || searchParams.get("passportNumber") || ""),
    [searchParams]
  );
  const inviteToken = useMemo(() => searchParams.get("token") || searchParams.get("session") || "", [searchParams]);
  const testSessionId = useMemo(
    () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `test_${Date.now()}`),
    []
  );
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || "";

  const [phase, setPhase] = useState("intro");
  const [info, setInfo] = useState({
    name: "",
    phone: "",
    passportNumber: prefilledPassport,
    experience: "",
    licenses: "",
  });
  const [si, setSi] = useState(0);
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState({});
  const [pAns, setPAns] = useState({});
  const [showE, setShowE] = useState(false);
  const [t0, setT0] = useState(null);
  const [submissionState, setSubmissionState] = useState({ status: "idle", error: "" });
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const ref = useRef(null);
  const resultsExportRef = useRef(null);

  const sid = SECTIONS[si]?.id;
  const isPers = sid === "personality";
  const qs = isPers ? PERS : QUESTIONS[sid] || [];
  const cur = qs[qi];
  const key = `${sid}-${qi}`;
  const totalK = Object.values(QUESTIONS).reduce((a, q) => a + q.length, 0);
  const totalAll = totalK + PERS.length;
  const done = Object.keys(ans).length + Object.keys(pAns).length;
  const pct = Math.round((done / totalAll) * 100);
  const passportLocked = Boolean(prefilledPassport);

  useEffect(() => {
    if (phase === "test" && !t0) setT0(Date.now());
  }, [phase, t0]);

  const scroll = () => setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth" }), 50);

  const updateInfo = (field, value) => {
    setInfo((prev) => ({
      ...prev,
      [field]: field === "passportNumber" ? normalizePassportNumber(value) : value,
    }));
  };

  const pick = (index) => {
    if (isPers) {
      setPAns((prev) => ({ ...prev, [key]: index }));
      return;
    }
    if (ans[key] !== undefined) return;
    setAns((prev) => ({ ...prev, [key]: index }));
    setShowE(true);
  };

  const canNext = () => (isPers ? pAns[key] !== undefined : ans[key] !== undefined);

  const next = () => {
    setShowE(false);
    if (qi < qs.length - 1) {
      setQi(qi + 1);
    } else if (si < SECTIONS.length - 1) {
      setSi(si + 1);
      setQi(0);
    } else {
      setPhase("results");
    }
    scroll();
  };

  const calc = () => {
    let mc = 0;
    const sr = {};
    for (const [sectionId, list] of Object.entries(QUESTIONS)) {
      let correctCount = 0;
      list.forEach((question, index) => {
        if (ans[`${sectionId}-${index}`] === question.correct) {
          mc += 1;
          correctCount += 1;
        }
      });
      sr[sectionId] = {
        c: correctCount,
        t: list.length,
        p: Math.round((correctCount / list.length) * 100),
      };
    }

    let pt = 0;
    let pm = 0;
    const ts = {};
    PERS.forEach((question, index) => {
      const chosen = pAns[`personality-${index}`];
      if (chosen !== undefined) {
        pt += question.scores[chosen];
        pm += 3;
        if (!ts[question.trait]) ts[question.trait] = { t: 0, m: 0 };
        ts[question.trait].t += question.scores[chosen];
        ts[question.trait].m += 3;
      }
    });

    const kP = Math.round((mc / totalK) * 100);
    const pP = pm > 0 ? Math.round((pt / pm) * 100) : 0;

    return {
      kP,
      pP,
      grade: getGrade(kP, pP),
      sr,
      ts,
      dur: t0 ? Math.round((Date.now() - t0) / 60000) : 0,
      mc,
      totalK,
    };
  };

  const buildPayload = async () => {
    const results = calc();
    const passportNormalized = normalizePassportNumber(info.passportNumber);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const baseName = `MKD_TEST_${passportNormalized || "NO_PASSPORT"}_${dateStamp}`;
    const knowledgeDetails = buildKnowledgeAnswerList(ans);
    const personalityDetails = buildPersonalityAnswerList(pAns);

    await new Promise((resolve) => setTimeout(resolve, 250));
    const pdfBlob = await generatePdfBlobFromElement(resultsExportRef.current);
    const pdfBase64 = await blobToBase64(pdfBlob);

    const jsonData = {
      source: "ergasia-driver-test-v2",
      matchTarget: "passportNumber",
      submissionId: testSessionId,
      inviteToken,
      finishedAt: new Date().toISOString(),
      candidate: {
        fullName: info.name.trim(),
        phone: info.phone.trim(),
        passportNumberRaw: info.passportNumber.trim(),
        passportNumberNormalized: passportNormalized,
        experience: info.experience.trim(),
        licenses: info.licenses.trim(),
      },
      result: {
        grade: results.grade,
        knowledgePercent: results.kP,
        personalityPercent: results.pP,
        knowledgeScore: results.mc,
        knowledgeTotal: results.totalK,
        durationMinutes: results.dur,
        sections: results.sr,
        traits: results.ts,
      },
      detailedAnswers: {
        knowledge: knowledgeDetails,
        personality: personalityDetails,
      },
      fallback: {
        unmatchedEmail: "yulia@ergasia.group",
        rule: "If no unique ClickUp match is found by normalized passport number, send result for manual review.",
      },
    };

    const jsonBlob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const jsonBase64 = await blobToBase64(jsonBlob);

    return {
      webhookPayload: {
        ...jsonData,
        attachments: {
          pdf: {
            filename: `${baseName}.pdf`,
            mimeType: "application/pdf",
            dataBase64: pdfBase64,
          },
          json: {
            filename: `${baseName}.json`,
            mimeType: "application/json",
            dataBase64: jsonBase64,
          },
        },
      },
      results,
      knowledgeDetails,
      personalityDetails,
      baseName,
    };
  };

  const submitResults = async () => {
    if (hasSubmitted) return;
    setHasSubmitted(true);

    if (!webhookUrl) {
      setSubmissionState({
        status: "error",
        error: "Chýba VITE_N8N_WEBHOOK_URL. Výsledok sa nezapisuje do n8n.",
      });
      return;
    }

    try {
      setSubmissionState({ status: "sending", error: "" });
      const { webhookPayload } = await buildPayload();
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Webhook error ${response.status}`);
      }

      setSubmissionState({ status: "success", error: "" });
    } catch (error) {
      setSubmissionState({
        status: "error",
        error: error?.message || "Nepodarilo sa odoslať výsledok do n8n.",
      });
    }
  };

  useEffect(() => {
    if (phase === "results" && !hasSubmitted) {
      submitResults();
    }
  }, [phase, hasSubmitted]);

  const retrySubmit = () => {
    setHasSubmitted(false);
    setSubmissionState({ status: "idle", error: "" });
  };

  const cc = {
    bg: "#edf3fb",
    card: "#ffffff",
    accent: "#f5a300",
    text: "#10233f",
    dim: "#61748d",
    ok: "#1fa269",
    bad: "#d94b4b",
    border: "#d7e2f0",
    navy: "#0f2f59",
    navySoft: "#173d6b",
  };
  const wrap = {
    fontFamily: "'Segoe UI',system-ui,sans-serif",
    background: "radial-gradient(circle at top left, #ffffff 0%, #f8fbff 35%, #edf3fb 100%)",
    color: cc.text,
    minHeight: "100vh",
  };
  const hdr = {
    background: "linear-gradient(135deg,#123864 0%, #0f2f59 55%, #173d6b 100%)",
    borderBottom: `3px solid ${cc.accent}`,
    padding: "22px 28px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 10px 30px rgba(15,47,89,0.15)",
  };
  const body = { maxWidth: "760px", margin: "0 auto", padding: "30px 18px 42px" };
  const card = {
    background: cc.card,
    border: `1px solid ${cc.border}`,
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "14px",
    boxShadow: "0 12px 28px rgba(16,35,63,0.06)",
  };
  const btnS = (ok) => ({
    background: ok ? `linear-gradient(135deg,${cc.accent},#ffb933)` : "#d7e2f0",
    color: ok ? cc.navy : "#7f8ea3",
    border: "none",
    padding: "16px 28px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "800",
    cursor: ok ? "pointer" : "not-allowed",
    width: "100%",
    transition: "all 0.2s",
    boxShadow: ok ? "0 10px 22px rgba(245,163,0,0.22)" : "none",
  });

  if (phase === "intro") {
    return (
      <div style={wrap}>
        <div ref={ref} />
        <div style={hdr}>
          <div>
            <img
              src="https://ergasia.group/JPG%20copy%20copy.jpg"
              alt="Ergasia logo"
              style={{ height: "74px", width: "auto", display: "block", marginBottom: "8px", borderRadius: "10px", boxShadow: "0 10px 24px rgba(8,27,52,0.18)" }}
            />
            <div style={{ fontSize: "13px", color: "#ffd57a", fontWeight: "700", letterSpacing: "0.4px" }}>QUICK INTERNATIONAL TRAILER DRIVER VERIFICATION</div>
          </div>
        </div>
        <div style={body}>
          <h1 style={{ fontSize: "34px", lineHeight: "1.2", fontWeight: "900", color: cc.navy, margin: "6px 0 10px", textAlign: "center" }}>Get access to better job opportunities for International trailer drivers</h1>
          <p style={{ color: cc.dim, margin: "0 0 28px", fontSize: "17px", lineHeight: "1.65", textAlign: "center", maxWidth: "760px" }}>
            Many of our better-paying employers usually prefer drivers whose knowledge and experience have already been verified.
          </p>
          {SECTIONS.map((section) => (
            <div key={section.id} style={{ ...card, display: "flex", alignItems: "center", gap: "16px", padding: "18px 20px", background: "linear-gradient(180deg,#ffffff 0%, #f8fbff 100%)" }}>
              <span style={{ fontSize: "24px", width: "36px", textAlign: "center" }}>{section.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>{section.title}</div>
                <div style={{ color: cc.dim, fontSize: "12px" }}>{section.desc}</div>
              </div>
              <div style={{ color: cc.accent, fontSize: "12px", fontWeight: "700" }}>
                {section.id === "personality" ? "6" : "8"} q.
              </div>
            </div>
          ))}
          <div style={{ ...card, background: "#111f12", border: "1px solid #1e3a1e", marginTop: "16px" }}>
            <div style={{ fontWeight: "700", color: cc.accent, fontSize: "13px", marginBottom: "6px" }}>WHY IT IS WORTH COMPLETING</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: "13px" }}>
              {[
                ["A", "#22c55e", "Stronger results are often considered first for better-paying opportunities"],
                ["B", "#eab308", "Faster matching with suitable employers"],
                ["C", "#f97316", "Higher chance of being presented to stronger clients"],
                ["FAIL", "#ef4444", "Shorter and easier follow-up interview"],
              ].map(([grade, color, text]) => (
                <div key={grade}>
                  <span style={{ color, fontWeight: "800" }}>{grade}</span> – {text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ ...card, background: "#1a1510", border: "1px solid #3a2a10" }}>
            <div style={{ fontWeight: "700", color: cc.accent, fontSize: "13px", marginBottom: "4px" }}>IMPORTANT</div>
            <p style={{ fontSize: "13px", color: cc.dim, margin: 0, lineHeight: "1.6" }}>
              This short assessment usually takes around 15 minutes. It is not a school exam or a trick test — it simply helps us understand your real practical knowledge and match you with more suitable offers.
            </p>
          </div>
          <button style={btnS(true)} onClick={() => setPhase("info")}>GET ACCESS TO BETTER OFFERS →</button>
        </div>
      </div>
    );
  }

  if (phase === "info") {
    const canContinue = info.name.trim() && info.phone.trim() && normalizePassportNumber(info.passportNumber);

    return (
      <div style={wrap}>
        <div ref={ref} />
        <div style={hdr}>
          <div>
            <img
              src="https://ergasia.group/JPG%20copy%20copy.jpg"
              alt="Ergasia logo"
              style={{ height: "64px", width: "auto", display: "block", marginBottom: "6px", borderRadius: "10px", boxShadow: "0 10px 24px rgba(8,27,52,0.18)" }}
            />
            <div style={{ fontSize: "12px", color: "#ffd57a", fontWeight: "700", letterSpacing: "0.4px" }}>DRIVER DETAILS</div>
          </div>
        </div>
        <div style={{ ...body, maxWidth: "520px" }}>
          {[
            { key: "name", label: "Full name *", placeholder: "John Smith" },
            { key: "phone", label: "Phone number (WhatsApp) *", placeholder: "+421 9XX XXX XXX" },
            {
              key: "passportNumber",
              label: "Passport number *",
              placeholder: "AB123456",
              note: passportLocked ? "Pre-filled from the invitation link. This field is locked." : "Your result will be labeled using your passport number.",
              readOnly: passportLocked,
            },
            { key: "experience", label: "Years of International trailer driving experience", placeholder: "e.g. 5" },
            { key: "licenses", label: "Licences and certificates", placeholder: "C+E, ADR, Code 95" },
          ].map((field) => (
            <div key={field.key} style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: cc.dim, marginBottom: "5px" }}>
                {field.label}
              </label>
              <input
                value={info[field.key]}
                onChange={(e) => updateInfo(field.key, e.target.value)}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
                autoCapitalize={field.key === "passportNumber" ? "characters" : "none"}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: cc.card,
                  border: `1px solid ${cc.border}`,
                  borderRadius: "8px",
                  color: cc.text,
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                  opacity: field.readOnly ? 0.9 : 1,
                }}
              />
              {field.note ? <div style={{ fontSize: "11px", color: cc.dim, marginTop: "6px" }}>{field.note}</div> : null}
            </div>
          ))}
          <button style={btnS(Boolean(canContinue))} onClick={() => canContinue && setPhase("test")}>
            CONTINUE TO VERIFICATION →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "test") {
    const answered = isPers ? pAns[key] !== undefined : ans[key] !== undefined;
    const isSign = Boolean(cur?.sign);
    const SignComp = isSign && signs[cur.sign];

    return (
      <div style={wrap}>
        <div ref={ref} />
        <div style={hdr}>
          <span style={{ fontSize: "24px" }}>{SECTIONS[si].icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", color: cc.accent, fontWeight: "700" }}>
              SECTION {si + 1}/{SECTIONS.length}
            </div>
            <div style={{ fontSize: "16px", fontWeight: "700" }}>{SECTIONS[si].title}</div>
          </div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: cc.accent }}>{pct}%</div>
        </div>
        <div style={{ height: "4px", background: cc.border }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${cc.accent},#d97706)`, transition: "width 0.4s" }} />
        </div>
        <div style={body}>
          <div style={{ display: "flex", gap: "5px", marginBottom: "16px" }}>
            {qs.map((_, index) => {
              const localKey = `${sid}-${index}`;
              const doneLocal = isPers ? pAns[localKey] !== undefined : ans[localKey] !== undefined;
              return <div key={index} style={{ flex: 1, height: "5px", borderRadius: "3px", background: index === qi ? cc.accent : doneLocal ? "#bfe7ce" : cc.border }} />;
            })}
          </div>
          <div style={{ fontSize: "12px", color: cc.dim, fontWeight: "600", marginBottom: "6px" }}>
            Question {qi + 1} of {qs.length}
          </div>
          {isSign && SignComp ? (
            <div style={{ display: "flex", justifyContent: "center", margin: "14px 0", padding: "18px", background: "#f7fbff", borderRadius: "12px", border: `1px solid ${cc.border}` }}>
              {cur.signArg ? signs[cur.sign](cur.signArg) : <SignComp />}
            </div>
          ) : null}
          <h2 style={{ fontSize: "17px", lineHeight: "1.55", marginBottom: "18px", fontWeight: "600" }}>{cur.q}</h2>
          <div style={{ display: "grid", gap: "8px" }}>
            {cur.options.map((option, index) => {
              const selected = isPers ? pAns[key] === index : ans[key] === index;
              const correct = !isPers && answered && cur.correct === index;
              const wrong = !isPers && answered && selected && cur.correct !== index;
              let borderColor = cc.border;
              let background = cc.card;
              if (selected && isPers) {
                borderColor = cc.accent;
                background = "#fff7e6";
              }
              if (correct) {
                borderColor = cc.ok;
                background = "#edf9f1";
              }
              if (wrong) {
                borderColor = cc.bad;
                background = "#fff0f0";
              }

              return (
                <button
                  key={index}
                  onClick={() => pick(index)}
                  disabled={!isPers && answered}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    padding: "14px 16px",
                    background,
                    border: `2px solid ${borderColor}`,
                    borderRadius: "10px",
                    color: cc.text,
                    fontSize: "14px",
                    textAlign: "left",
                    cursor: !isPers && answered ? "default" : "pointer",
                    transition: "all 0.15s",
                    outline: "none",
                    lineHeight: "1.5",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "700",
                      marginTop: "1px",
                      background: correct ? cc.ok : wrong ? cc.bad : selected ? cc.accent : "#ffffff",
                      border: `2px solid ${correct ? cc.ok : wrong ? cc.bad : selected ? cc.accent : cc.border}`,
                      color: selected || correct || wrong ? "#000" : cc.dim,
                    }}
                  >
                    {correct ? "✓" : wrong ? "✗" : String.fromCharCode(65 + index)}
                  </div>
                  <span style={{ paddingTop: "3px" }}>{option}</span>
                </button>
              );
            })}
          </div>
          {showE && !isPers && cur.explanation ? (
            <div
              style={{
                marginTop: "14px",
                padding: "14px 16px",
                borderRadius: "10px",
                background: ans[key] === cur.correct ? "#edf9f1" : "#fff0f0",
                border: `1px solid ${ans[key] === cur.correct ? "#b8e0c4" : "#f0b7b7"}`,
                fontSize: "13px",
                lineHeight: "1.6",
              }}
            >
              <strong style={{ color: ans[key] === cur.correct ? cc.ok : cc.bad }}>
                {ans[key] === cur.correct ? "✓ Correct!" : "✗ Incorrect"}
              </strong>
              <div style={{ marginTop: "5px", color: cc.dim }}>{cur.explanation}</div>
            </div>
          ) : null}
          <button style={{ ...btnS(canNext()), marginTop: "16px" }} onClick={() => canNext() && next()}>
            {si === SECTIONS.length - 1 && qi === qs.length - 1
              ? "SEE MY RESULT"
              : qi === qs.length - 1
                ? `NEXT SECTION: ${SECTIONS[si + 1]?.title} →`
                : "NEXT QUESTION →"}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results") {
    const results = calc();
    const gi = GI[results.grade];
    const knowledgeDetails = buildKnowledgeAnswerList(ans);
    const personalityDetails = buildPersonalityAnswerList(pAns);

    return (
      <div style={wrap}>
        <div ref={ref} />
        <div style={hdr}>
          <div>
            <img
              src="https://ergasia.group/JPG%20copy%20copy.jpg"
              alt="Ergasia logo"
              style={{ height: "64px", width: "auto", display: "block", marginBottom: "6px", borderRadius: "10px", boxShadow: "0 10px 24px rgba(8,27,52,0.18)" }}
            />
            <div style={{ fontSize: "12px", color: "#ffd57a", fontWeight: "700", letterSpacing: "0.4px" }}>VERIFICATION RESULTS</div>
          </div>
        </div>
        <div style={body}>
          <div style={{ background: gi.bg, border: `2px solid ${gi.color}`, borderRadius: "16px", padding: "28px", textAlign: "center", marginBottom: "20px" }}>
            <div style={{ fontSize: "60px", fontWeight: "900", color: gi.color }}>{results.grade}</div>
            <div style={{ fontSize: "16px", fontWeight: "700" }}>{gi.label}</div>
            <div style={{ color: cc.dim, fontSize: "13px", marginTop: "8px" }}>{gi.desc}</div>
          </div>

          <div style={{ ...card, background: "linear-gradient(180deg,#fff8ed 0%, #fff4e3 100%)", border: `1px solid #f0d2a4` }}>
            <div style={{ fontWeight: "700", color: cc.accent, fontSize: "13px", marginBottom: "8px" }}>IMPORTANT</div>
            <div style={{ fontSize: "13px", color: cc.dim, lineHeight: "1.6" }}>
              Your result is being prepared with two attachments: PDF and JSON. Passport: <strong>{maskPassportNumber(info.passportNumber)}</strong>
            </div>
            {submissionState.status === "sending" ? <div style={{ marginTop: "10px", fontSize: "13px", color: cc.accent }}>Creating PDF and sending the result to the system...</div> : null}
            {submissionState.status === "success" ? <div style={{ marginTop: "10px", fontSize: "13px", color: cc.ok }}>Done. Both the PDF and JSON were sent to the n8n webhook.</div> : null}
            {submissionState.status === "error" ? (
              <div style={{ marginTop: "10px", fontSize: "13px", color: cc.bad }}>
                Automatic submission failed: {submissionState.error}
                <div style={{ marginTop: "10px" }}>
                  <button onClick={retrySubmit} style={{ ...btnS(true), maxWidth: "240px" }}>Try sending again</button>
                </div>
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              { label: "Knowledge", value: `${results.kP}%`, sub: `${results.mc}/${results.totalK}` },
              { label: "Work style", value: `${results.pP}%`, sub: "driver profile" },
              { label: "Time", value: `${results.dur} min`, sub: "total" },
            ].map((item) => (
              <div key={item.label} style={{ ...card, textAlign: "center", padding: "14px 8px" }}>
                <div style={{ fontSize: "22px", fontWeight: "800", color: cc.accent }}>{item.value}</div>
                <div style={{ fontSize: "11px", fontWeight: "700", marginTop: "2px" }}>{item.label}</div>
                <div style={{ fontSize: "10px", color: cc.dim }}>{item.sub}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "14px", color: cc.accent, margin: "0 0 10px" }}>Section results</h3>
          {Object.entries(results.sr).map(([sectionId, data]) => {
            const section = SECTIONS.find((item) => item.id === sectionId);
            const color = data.p >= 75 ? cc.ok : data.p >= 50 ? "#eab308" : cc.bad;
            return (
              <div key={sectionId} style={{ ...card, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                  <span style={{ fontWeight: "600" }}>{section?.icon} {section?.title}</span>
                  <span style={{ fontWeight: "800", color }}>{data.p}% ({data.c}/{data.t})</span>
                </div>
                <div style={{ height: "5px", background: cc.border, borderRadius: "3px" }}>
                  <div style={{ height: "100%", width: `${data.p}%`, background: color, borderRadius: "3px", transition: "width 0.8s" }} />
                </div>
              </div>
            );
          })}

          <h3 style={{ fontSize: "14px", color: cc.accent, margin: "20px 0 10px" }}>Driver work style</h3>
          <div style={card}>
            {Object.entries(results.ts).map(([trait, data]) => {
              const percent = Math.round((data.t / data.m) * 100);
              const color = percent >= 70 ? cc.ok : percent >= 40 ? "#eab308" : cc.bad;
              return (
                <div key={trait} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "600" }}>{TL[trait]}</span>
                    <span style={{ color, fontWeight: "700" }}>{percent}%</span>
                  </div>
                  <div style={{ height: "5px", background: cc.border, borderRadius: "3px" }}>
                    <div style={{ height: "100%", width: `${percent}%`, background: color, borderRadius: "3px" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ ...card, background: "#111a10", border: `1px solid ${cc.accent}40`, marginTop: "20px" }}>
            <div style={{ fontWeight: "700", color: cc.accent, fontSize: "13px", marginBottom: "8px" }}>NEXT STEP</div>
            <p style={{ fontSize: "13px", color: cc.dim, margin: 0, lineHeight: "1.6" }}>
              A recruiter may contact you for a short follow-up video call. Please have your documents ready.
            </p>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center", fontSize: "11px", color: cc.dim, borderTop: `1px solid ${cc.border}`, paddingTop: "14px" }}>
            Test ID: {testSessionId} | {info.name} | passport: {maskPassportNumber(info.passportNumber)} | {new Date().toLocaleDateString("sk")} | © ERGASIA s.r.o.
          </div>

          <div style={{ position: "absolute", left: "-10000px", top: 0, width: "820px", background: "#ffffff", color: "#111827", padding: "24px" }}>
            <div ref={resultsExportRef} style={{ fontFamily: "Arial, sans-serif", background: "#ffffff", color: "#111827" }}>
              <div style={{ borderBottom: "3px solid #f59e0b", paddingBottom: "12px", marginBottom: "18px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827" }}>ERGASIA - International Trailer Driver Verification Result</div>
                <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>Generated automatically after the driver completed the verification</div>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "18px" }}>
                <tbody>
                  {[
                    ["Full name", info.name || "-"],
                    ["Phone", info.phone || "-"],
                    ["Passport number", info.passportNumber || "-"],
                    ["Experience", info.experience || "-"],
                    ["Licences", info.licenses || "-"],
                    ["Test ID", testSessionId],
                    ["Date", new Date().toLocaleString("sk")],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={{ width: "180px", padding: "8px", border: "1px solid #d1d5db", fontWeight: 700, background: "#f3f4f6" }}>{label}</td>
                      <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", gap: "12px", marginBottom: "18px" }}>
                {[
                  ["Grade", results.grade],
                  ["Knowledge", `${results.kP}% (${results.mc}/${results.totalK})`],
                  ["Personality", `${results.pP}%`],
                  ["Duration", `${results.dur} min`],
                ].map(([label, value]) => (
                  <div key={label} style={{ flex: 1, border: "1px solid #d1d5db", borderRadius: "8px", padding: "12px", background: "#fafafa" }}>
                    <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>{label}</div>
                    <div style={{ fontSize: "20px", fontWeight: 800 }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px" }}>Section Results</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#ffffff" }}>Section</th>
                      <th style={{ textAlign: "left", padding: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#ffffff" }}>Correct</th>
                      <th style={{ textAlign: "left", padding: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#ffffff" }}>Percent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results.sr).map(([sectionId, data]) => (
                      <tr key={sectionId}>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>{SECTIONS.find((item) => item.id === sectionId)?.title || sectionId}</td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>{data.c}/{data.t}</td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>{data.p}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px" }}>Knowledge Answers</div>
                {knowledgeDetails.map((item, index) => (
                  <div key={`${item.sectionId}-${item.questionIndex}`} style={{ border: "1px solid #d1d5db", borderRadius: "8px", marginBottom: "10px", overflow: "hidden" }}>
                    <div style={{ padding: "10px 12px", background: item.isCorrect ? "#dcfce7" : "#fee2e2", fontWeight: 700 }}>
                      {index + 1}. {item.sectionTitle} - {item.isCorrect ? "Correct" : "Wrong"}
                    </div>
                    <div style={{ padding: "12px" }}>
                      <div style={{ fontWeight: 700, marginBottom: "6px" }}>{item.question}</div>
                      <div style={{ marginBottom: "4px" }}><strong>Selected:</strong> {item.selectedOption || "-"}</div>
                      <div style={{ marginBottom: "4px" }}><strong>Correct:</strong> {item.correctOption}</div>
                      <div style={{ color: "#6b7280" }}>{item.explanation}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "18px", fontWeight: 800, marginBottom: "10px" }}>Personality Answers</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#ffffff" }}>Trait</th>
                      <th style={{ textAlign: "left", padding: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#ffffff" }}>Question</th>
                      <th style={{ textAlign: "left", padding: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#ffffff" }}>Selected answer</th>
                      <th style={{ textAlign: "left", padding: "8px", border: "1px solid #d1d5db", background: "#111827", color: "#ffffff" }}>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalityDetails.map((item) => (
                      <tr key={`personality-${item.questionIndex}`}>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>{item.traitLabel}</td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>{item.question}</td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>{item.selectedOption || "-"}</td>
                        <td style={{ padding: "8px", border: "1px solid #d1d5db" }}>{item.selectedScore ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
