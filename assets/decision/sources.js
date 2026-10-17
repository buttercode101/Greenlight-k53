export const SOURCES = {
  signs: {
    title: "Road signs and markings",
    url: "https://www.rtmc.co.za/images/rtmc/docs/RoadSafetyEngineering/Road_Traffic_Signs_charts.pdf",
    description:
      "Department of Transport sign-code chart; simplified artwork is paired with its specific code.",
  },
  practical: {
    title: "Light-vehicle practical preparation",
    url: "https://www.gov.za/sites/default/files/gcis_document/201409/28446c.pdf",
    description:
      "Published Code B procedures. Observation exercises rehearse selected steps, not a full practical driving test.",
  },
  rules: {
    title: "Rules of the road",
    url: "https://www.southafrica.net/ug/en/travel/category/what-you-need-to-know/getting-around-south-africa-by-car",
    description:
      "South African Tourism road guidance gives the general 60/100/120 limits. Posted limits and vehicle-specific limits take precedence.",
  },
  safety: {
    title: "Road safety guidance",
    url: "https://www.sanews.gov.za/node/84503",
    description:
      "RTMC road-safety advice published 23 September 2026: safe speed, seatbelts, vehicle checks, following gaps and sober driving.",
  },
};
const sections = {
  S01: "Chart sheet 1, R1 Stop / sheet 2 RTM1 stop line",
  S02: "Chart sheet 1 R2 Give Way",
  S03: "Chart sheet 1 R3 No Entry",
  S04: "Chart sheet 1 R201 speed limit",
  S05: "Chart sheet 1 R201 speed limit",
  S06: "Chart sheet 1 R105 proceed left",
  S07: "Chart sheet 1 R106 proceed right",
  S08: "Chart sheet 1 R211 left turn prohibited",
  S09: "Chart sheet 1 R212 right turn prohibited",
  S10: "Chart sheet 2 W308 children",
  S11: "Chart sheet 5 temporary warnings",
  S12: "Chart sheet 2 RM1 longitudinal marking",
  S13: "Chart sheet 2 guidance/longitudinal markings",
  S14: "Chart sheet 1 R216 parking prohibited (P-legend depiction)",
  S15: "Chart sheet 1 R217 stopping prohibited (S-legend depiction)",
  S16: "Chart sheet 1 R4.2 one-way right",
  S17: "Chart sheet 1 R201 posted maximum speed",
  S18: "Chart sheet 1 R101 minimum speed",
  S19: "Chart sheet 2 W307 pedestrians",
  S20: "Chart sheet 2 W201 circle ahead",
  S21: "Chart sheet 2 W333 slippery surface",
  S22: "Chart sheet 1 R213 U-turn prohibited",
  S23: "Chart sheet 1 R103 keep left",
  S24: "Chart sheet 1 S1 red signal",
  S25: "Chart sheet 2 RM13 parking restriction marking",
  S26: "Chart sheet 2 RTM4 pedestrian crossing",
  S27: "Chart sheet 2 W332 speed hump",
  S28: "Chart sheet 1 S1 flashing red",
  R01: "Module 38, yield-controlled intersection",
  R02: "Module 38, yield-controlled intersection",
  R03: "Module 37 Note A, four-way stop; earlier arrival",
  R04: "Module 37 Note A, four-way stop; earlier arrival",
  R05: "Module 38, yield-controlled intersection",
  R06: "Module 45, roundabout priority",
  R07: "Module 45, Note B mini-circle yield-line order",
  R08: "Module 45, Note A exit signals",
  R09: "Module 45, Note B mini-circle signals",
  R10: "Module 46, pedestrian crossing",
  R11: "Module 46, pedestrian crossing",
  R12: "Module 37, scholar patrol",
  R13: "Module 35, turning right",
  R14: "Module 44, steady amber intersection",
  R15: "Module 41, steady red intersection",
  R16: "Module 42, green light and intersection clearance",
  R17: "Chart sheet 1 S6 flashing amber",
  R18: "Department of Tourism, traffic-light malfunction guidance",
  R19: "Module 38, yield control at the driveway exit",
  R20: "Module 53, freeway entering",
  R21: "General speed limits, light vehicle; rule 292(a)",
  R22: "General speed limits, light vehicle; rule 292(b)",
  R23: "General speed limits, light vehicle; rule 292(c)",
  R24: "Module 27, following distance",
  R25: "Module 50, overtaking to the right of a hazard",
  R26: "RTMC advice: never drive under the influence of alcohol or drugs",
  R27: "Module 10, use of horn to warn of danger",
  R28: "Module 35, right turn waiting position",
  R29: "RTMC advice: ensure all occupants wear seat belts",
  R30: "Module 54, freeway exit preparation",
  R31: "Module 31, parking and checking before opening doors",
  R32: "Module 46, pedestrian crossing",
  R33: "Module 31, stopping for parking and securing the vehicle",
  R34: "Module 45, lane and exit planning",
  O01: "Module 12, observation before moving off; selected steps",
  O02: "Module 28, lane changing; mirrors/blind spot, signal, repeat blind spot, steer safely, cancel",
  O03: "Module 34, turning left; selected observation steps",
  O04: "Module 6 Note: rear-view check before brake-light signal",
  O05: "Module 50, overtaking to the right of a hazard; selected observation steps",
  O06: "Module 50, returning after overtaking",
  O07: "Module 12, intersection clearance before moving",
  O08: "Modules 15/19, reversing observation and glossary blind-spot checks",
  O09: "Module 28, left lane changing; selected steps",
  O10: "Module 53, freeway entry observation",
  C01: "Glossary: disengage clutch / Modules 12 and 23",
  C02: "Modules 29/31, service and parking brakes",
  C03: "Module 1, pre-trip fluid checks",
  C04: "Module 5, continuous observation",
  C05: "Module 1, tyre tread, sidewalls and inflation checks",
  C06: "Module 2, seat and mirror setup",
  C07: "Module 1, dipped and main beam operation checks",
  C08: "Module 1/2, interior light operation checks",
  C09: "Module 1/2, direction indicator checks",
  C10: "Module 2, cockpit setup before moving",
};
export function questionSource(q) {
  const source =
    q.id === "R18"
      ? {
          title: "Road travel safety",
          url: "https://www.tourism.gov.za/Pages/Safety--Travel-Tips-Info.aspx",
          description:
            "Department of Tourism: malfunctioning traffic lights are treated as a four-way stop.",
        }
      : q.topic === "signs" || q.id === "R17"
        ? SOURCES.signs
        : ["R26", "R29"].includes(q.id)
          ? SOURCES.safety
          : ["R21", "R22", "R23"].includes(q.id)
            ? SOURCES.rules
            : SOURCES.practical;
  return {
    ...source,
    section: sections[q.id] ?? q.rule,
    checked: "18 October 2026",
    review: "source-checked; independent instructor review not claimed",
  };
}
