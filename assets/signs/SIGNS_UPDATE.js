/* UPDATED SIGNS ARRAY - Real SADC Road Signs with 5 Categories */
const SIGNS_V2 = [
  /* ===== CATEGORY 1: RESTRICTIVE (Red Circle = DON'T / STOP) ===== */
  {id:'stop',svg:'assets/signs/stop.svg',name:'Stop',fam:'red',cat:'Restrictive',mean:'Come to a complete stop. Wait until safe, then go.',analogy:'Like a teacher holding up a STOP hand — freeze completely.'},
  {id:'giveway',svg:'assets/signs/giveway.svg',name:'Give Way (Yield)',fam:'red',cat:'Restrictive',mean:'Slow down. Let other traffic go first, then join when safe.',analogy:'Like holding a door open — let others pass before you enter.'},
  {id:'noentry',svg:'assets/signs/noentry.svg',name:'No Entry',fam:'red',cat:'Restrictive',mean:'You may NOT enter this road from here. Wrong way!',analogy:'Red circle with bar = "road closed to you".'},
  {id:'speed60',svg:'assets/signs/speed60.svg',name:'Speed Limit 60',fam:'red',cat:'Restrictive',mean:'Do NOT go faster than 60 km/h. Maximum, not a target.',analogy:'Red circle = a strict ceiling, like a toy car\'s speed cap.'},
  {id:'noovertake',svg:'assets/signs/noovertake.svg',name:'No Overtaking',fam:'red',cat:'Restrictive',mean:'Do NOT overtake other vehicles on this stretch of road.',analogy:'Two cars with a red slash = no passing.'},
  {id:'nouturn',svg:'assets/signs/nouturn.svg',name:'No U-Turn',fam:'red',cat:'Restrictive',mean:'You may NOT turn around here.',analogy:'U-arrow crossed out = no going back.'},
  {id:'noleft',svg:'assets/signs/noleft.svg',name:'No Left Turn',fam:'red',cat:'Restrictive',mean:'You may NOT turn left at this point.',analogy:'Arrow left with red slash = no left turn.'},
  {id:'noright',svg:'assets/signs/noright.svg',name:'No Right Turn',fam:'red',cat:'Restrictive',mean:'You may NOT turn right at this point.',analogy:'Arrow right with red slash = no right turn.'},
  {id:'nopark',svg:'assets/signs/nopark.svg',name:'No Parking',fam:'red',cat:'Restrictive',mean:'You may NOT park here at any time.',analogy:'Red circle, P crossed out = no parking.'},
  {id:'nostop',svg:'assets/signs/nostop.svg',name:'No Stopping',fam:'red',cat:'Restrictive',mean:'You may NOT stop here at all — not even to drop someone off.',analogy:'Red circle, X = absolute no stopping.'},
  {id:'redman',svg:'assets/signs/redman.svg',name:'Pedestrian Signal: Red Man',fam:'red',cat:'Restrictive',mean:'Pedestrians must NOT start crossing. Wait.',analogy:'Red man = stop, do not walk.'},
  
  /* ===== CATEGORY 2: MANDATORY (Blue Circle = MUST DO) ===== */
  {id:'turnleft',svg:'assets/signs/turnleft.svg',name:'Mandatory: Turn Left',fam:'blue',cat:'Mandatory',mean:'You MUST turn left here. No other choice.',analogy:'Blue circle = you have to do this.'},
  {id:'keepleft',svg:'assets/signs/keepleft.svg',name:'Mandatory: Keep Left',fam:'blue',cat:'Mandatory',mean:'Stay on the left side of the divider.',analogy:'Blue circle = a rule you must follow.'},
  {id:'minspeed60',svg:'assets/signs/minspeed60.svg',name:'Minimum Speed 60',fam:'blue',cat:'Mandatory',mean:'You MUST drive at least 60 km/h in this lane — no slower.',analogy:'Blue circle with number = a floor, not a ceiling.'},
  {id:'headlightson',svg:'assets/signs/headlightson.svg',name:'Headlights On',fam:'blue',cat:'Mandatory',mean:'Switch your headlights on (dipped) — you must be seen.',analogy:'Blue circle + lamp = lights compulsory.'},
  {id:'buslane',svg:'assets/signs/buslane.svg',name:'Bus Lane Only',fam:'blue',cat:'Mandatory',mean:'Only buses may use this lane. Others may not drive or stop here.',analogy:'Blue box with bus = reserved lane.'},
  {id:'taxilane',svg:'assets/signs/taxilane.svg',name:'Taxi Lane Only',fam:'blue',cat:'Mandatory',mean:'Only minibus taxis may use this lane.',analogy:'Blue box with T = taxi-only.'},
  {id:'disablepark',svg:'assets/signs/disablepark.svg',name:'Disabled Parking Only',fam:'blue',cat:'Mandatory',mean:'Only vehicles carrying a disabled person may park here.',analogy:'Blue box with wheelchair = reserved.'},
  
  /* ===== CATEGORY 3: WARNING (Yellow Triangle = WATCH OUT) ===== */
  {id:'children',svg:'assets/signs/children.svg',name:'Warning: Children',fam:'tri',cat:'Warning',mean:'Children may be near the road. Slow down and watch out.',analogy:'Yellow triangle = caution, like a wet-floor sign.'},
  {id:'curve',svg:'assets/signs/curve.svg',name:'Warning: Curve Ahead',fam:'tri',cat:'Warning',mean:'The road bends ahead. Slow before the curve.',analogy:'Triangle points the danger — bend coming, ease off gas.'},
  {id:'pedestrians',svg:'assets/signs/pedestrians.svg',name:'Warning: Pedestrians',fam:'tri',cat:'Warning',mean:'Pedestrians may be near or crossing the road. Slow down and be prepared to stop.',analogy:'A warning triangle means people are close — be ready.'},
  {id:'animals',svg:'assets/signs/animals.svg',name:'Warning: Animals',fam:'tri',cat:'Warning',mean:'Farm animals may be on the road. Drive slowly.',analogy:'Triangle = something unexpected ahead.'},
  {id:'hill',svg:'assets/signs/hill.svg',name:'Warning: Steep Hill',fam:'tri',cat:'Warning',mean:'Steep uphill or downhill ahead. Use a lower gear.',analogy:'Triangle = road shape changes sharply.'},
  {id:'slippery',svg:'assets/signs/slippery.svg',name:'Warning: Slippery Road',fam:'tri',cat:'Warning',mean:'The road may be slippery, especially when wet. Slow down.',analogy:'Triangle = surface grip drops — take care.'},
  {id:'speedbump',svg:'assets/signs/speedbump.svg',name:'Warning: Speed Bump',fam:'tri',cat:'Warning',mean:'A bump is ahead. Slow right down.',analogy:'Triangle = bump — drop your speed.'},
  {id:'railway',svg:'assets/signs/railway.svg',name:'Warning: Railway Crossing',fam:'tri',cat:'Warning',mean:'Railway tracks ahead. Stop if a train is coming. Never race a train.',analogy:'X = tracks cross the road — extreme caution.'},
  {id:'narrow',svg:'assets/signs/narrow.svg',name:'Warning: Road Narrows',fam:'tri',cat:'Warning',mean:'The road narrows ahead. Keep well to the left.',analogy:'Triangle = space shrinks — ease off.'},
  {id:'rightofway',svg:'assets/signs/rightofway.svg',name:'Priority Road',fam:'tri',cat:'Warning',mean:'You are on a priority road. Continue only when the road and intersection are clear.',analogy:'Priority = you have the advantage (but stay alert).'},
  {id:'crossroads',svg:'assets/signs/crossroads.svg',name:'Warning: Crossroads Ahead',fam:'tri',cat:'Warning',mean:'A four-way crossing is ahead. Slow down and look both ways.',analogy:'Triangle = junction — be careful.'},
  {id:'tjunction',svg:'assets/signs/tjunction.svg',name:'Warning: T-Junction Ahead',fam:'tri',cat:'Warning',mean:'The road ends at a T. You must turn left or right.',analogy:'Triangle = junction shape changes.'},
  {id:'yjunction',svg:'assets/signs/yjunction.svg',name:'Warning: Y-Junction Ahead',fam:'tri',cat:'Warning',mean:'The road splits into a Y ahead. Slow and choose your fork.',analogy:'Triangle = road splits.'},
  {id:'roundabout',svg:'assets/signs/roundabout.svg',name:'Warning: Roundabout Ahead',fam:'tri',cat:'Warning',mean:'A roundabout is coming up. Slow down and be ready to yield to the right.',analogy:'Circle with arrows = go round, yield right.'},
  {id:'school',svg:'assets/signs/school.svg',name:'Warning: School Zone',fam:'tri',cat:'Warning',mean:'Children are around. Slow right down — to 40 km/h if a sign shows it — especially at school times.',analogy:'Triangle with school = extreme caution, slow.'},
  {id:'pedcrossing',svg:'assets/signs/pedcrossing.svg',name:'Warning: Pedestrian Crossing',fam:'tri',cat:'Warning',mean:'A marked crossing is ahead. Slow down — pedestrians have priority.',analogy:'People stripes = pedestrians first, always.'},
  {id:'cyclists',svg:'assets/signs/cyclists.svg',name:'Warning: Cyclists',fam:'tri',cat:'Warning',mean:'Cyclists may be on the road ahead. Give them space.',analogy:'Triangle = two wheels ahead.'},
  {id:'wildanimals',svg:'assets/signs/wildanimals.svg',name:'Warning: Wild Animals',fam:'tri',cat:'Warning',mean:'Wild animals may cross the road. Slow down and be ready to stop.',analogy:'Triangle = unexpected on the road.'},
  
  /* ===== CATEGORY 4: INFORMATION (Green/Blue Box = HELPFUL INFO) ===== */
  {id:'hospital',svg:'assets/signs/hospital.svg',name:'Info: Hospital',fam:'info',cat:'Information',mean:'A hospital is ahead or nearby.',analogy:'Green box = helpful info, like a map pin.'},
  {id:'parking',svg:'assets/signs/parking.svg',name:'Info: Parking',fam:'info',cat:'Information',mean:'A place to park is available here.',analogy:'Blue box = here is something useful.'},
  {id:'toll',svg:'assets/signs/toll.svg',name:'Info: Toll Road',fam:'info',cat:'Information',mean:'A toll road ahead. A free alternative route may be shown.',analogy:'Blue box with R = pay route, alt shown.'},
  {id:'direction',svg:'assets/signs/direction.svg',name:'Info: Direction',fam:'info',cat:'Information',mean:'Shows the direction and distance to a place or route.',analogy:'Blue box with arrow = follow this way.'},
  
  /* ===== CATEGORY 5: PEDESTRIAN/SIGNALS (Red/Green = Crossing Rules) ===== */
  {id:'greenman',svg:'assets/signs/greenman.svg',name:'Pedestrian Signal: Green Man',fam:'info',cat:'Signals',mean:'Pedestrians may cross carefully within the markings.',analogy:'Green man = walk when safe.'}
];

/* ENHANCED MARKINGS with 15 Granular Questions */
const MARKINGS_V2 = [
  {t:'Solid white line down the middle',d:'Stay in your lane. Do NOT cross to overtake.',tip:'Solid = stay put, like a wall.'},
  {t:'Broken (dashed) white line',d:'You MAY cross to pass, but only when safe.',tip:'Dashed = go ahead if clear.'},
  {t:'Yellow line on the roadside',d:'No parking allowed there.',tip:'Yellow = no park.'},
  {t:'Red line on the roadside',d:'No stopping at all — not even to drop someone off.',tip:'Red = do not stop.'},
  {t:'Zebra stripes (black & white blocks)',d:'Pedestrian crossing — stop for people walking.',tip:'Zebra = people first.'},
  {t:'Painted island (raised/flat)',d:'You may NOT drive on or over it. Go around it.',tip:'Island = no driving through.'},
  {t:'Box junction (yellow grid)',d:'Do NOT stop in it unless your exit is clear.',tip:'Grid = keep it moving.'},
  {t:'Bus/taxi lane marking',d:'Only that class of vehicle may drive or stop there.',tip:'Marked lane = reserved.'},
  {t:'No stopping red line (solid)',d:'No stopping at any time — emergency only.',tip:'Solid red = never stop.'},
  {t:'No parking yellow line (broken)',d:'No parking during the times shown on the plate.',tip:'Broken yellow = time-limited.'},
  {t:'Double white solid lines',d:'Do NOT cross or overtake in either direction.',tip:'Double solid = complete no-cross zone.'},
  {t:'White arrow on road (turn indication)',d:'You MUST follow the direction shown by the arrow.',tip:'Arrow = mandatory direction.'},
  {t:'Hatched white lines',d:'Area reserved, do not drive or park in it.',tip:'Hatching = keep out.'},
  {t:'Edge line (solid white)',d:'Marks the edge of the road — keep to your side.',tip:'Edge line = stay within bounds.'},
  {t:'Centre dividing line at night (reflectors)',d:'Reflectors help you see lane position in darkness.',tip:'Reflectors = night safety guide.'}
];
