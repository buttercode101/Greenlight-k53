#!/usr/bin/env node
/**
 * Produces the application's self-contained K53 sign set. Each illustration is a
 * clean vector study aid based on the visual families used in the SADC Road
 * Traffic Signs Manual: regulatory red/blue circles, yellow warning triangles,
 * information boards and pedestrian signals. Keep this generator as the single
 * source of truth; do not download unverified thumbnails into assets/signs.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
const out = path.resolve('assets/signs');
const ink='#141414', red='#d8242f', blue='#075fba', yellow='#f7c843', green='#138a47', white='#fffdf8';
const svg=(body,label)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" role="img" aria-label="${label}"><title>${label}</title>${body}</svg>\n`;
const circle=(fill,inner)=>`<circle cx="80" cy="80" r="68" fill="${white}" stroke="${ink}" stroke-width="5"/><circle cx="80" cy="80" r="59" fill="${fill}"/>${inner}`;
const warning=(inner)=>`<path d="M80 10 151 141H9Z" fill="${ink}"/><path d="M80 20 140 132H20Z" fill="${yellow}"/>${inner}`;
const board=(fill,inner)=>`<rect x="13" y="22" width="134" height="116" rx="8" fill="${ink}"/><rect x="20" y="29" width="120" height="102" rx="4" fill="${fill}"/>${inner}`;
const slash='<path d="M37 123 123 37" stroke="#fffdf8" stroke-width="14"/><path d="M34 126 126 34" stroke="#d8242f" stroke-width="9"/>';
const human=(color)=>`<circle cx="80" cy="50" r="10" fill="${color}"/><path d="M80 62 65 88 76 88 69 119M80 62l15 26H84l7 31M72 69l-17 20M88 69l17 20" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
const car=(x,y,color=ink)=>`<path d="M${x} ${y+25}h46l-6-17H${x+12}z" fill="${color}"/><path d="M${x+3} ${y+25}h40v14H${x+3}z" fill="${color}"/><circle cx="${x+11}" cy="${y+40}" r="5" fill="${white}"/><circle cx="${x+35}" cy="${y+40}" r="5" fill="${white}"/>`;
const icons={
 stop:`<path d="M48 12h64l36 36v64l-36 36H48L12 112V48Z" fill="${red}" stroke="${ink}" stroke-width="5"/><text x="80" y="91" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="800" fill="#fff">STOP</text>`,
 giveway:`<path d="M80 11 151 143H9Z" fill="${red}" stroke="${ink}" stroke-width="5"/><path d="M80 29 133 128H27Z" fill="${white}"/>`,
 noentry:circle(red,`<rect x="37" y="71" width="86" height="18" rx="3" fill="#fff"/>`),
 robot:warning(`<rect x="62" y="43" width="36" height="74" rx="10" fill="${ink}"/><circle cx="80" cy="59" r="8" fill="${red}"/><circle cx="80" cy="80" r="8" fill="#f4be3f"/><circle cx="80" cy="101" r="8" fill="${green}"/>`),
 turnleft:circle(blue,`<path d="M105 42v43H65l17-17-10-10-34 34 34 34 10-10-17-17h52V42Z" fill="#fff"/>`),
 keepleft:circle(blue,`<path d="M84 37 48 73h21v48h22V73h21z" fill="#fff"/><path d="m62 65 22-28 22 28" fill="none" stroke="#fff" stroke-width="14"/><path d="M63 65h46" stroke="#fff" stroke-width="14"/>`),
 minspeed:circle(blue,`<text x="80" y="98" text-anchor="middle" font-family="Arial,sans-serif" font-size="50" font-weight="800" fill="#fff">60</text>`),
 headlightson:circle(blue,`<path d="M43 60h28v40H43zM72 60c25 2 34 17 34 20s-9 18-34 20z" fill="#fff"/><path d="M112 55v50M125 61v38M137 68v24" stroke="#fff" stroke-width="7"/>`),
 speed60:circle(red,`<circle cx="80" cy="80" r="48" fill="#fff"/><text x="80" y="98" text-anchor="middle" font-family="Arial,sans-serif" font-size="50" font-weight="800" fill="${ink}">60</text>`),
 noovertake:circle(red,`${car(42,57,blue)}${car(77,57,red)}${slash}`),
 nouturn:circle(red,`<path d="M105 112V71c0-18-15-29-31-29-17 0-29 11-29 27" fill="none" stroke="${ink}" stroke-width="12"/><path d="m30 65 15-15 15 15" fill="none" stroke="${ink}" stroke-width="10"/>${slash}`),
 noleft:circle(red,`<path d="M113 46v41H72l15-15-10-10-31 31 31 31 10-10-15-15h53V46Z" fill="${ink}"/>${slash}`),
 noright:circle(red,`<path d="M47 46v41h41L73 72l10-10 31 31-31 31-10-10 15-15H47V46Z" fill="${ink}"/>${slash}`),
 nopark:circle(red,`<text x="80" y="101" text-anchor="middle" font-family="Arial,sans-serif" font-size="76" font-weight="800" fill="${ink}">P</text>${slash}`),
 nostop:circle(red,`<path d="M45 45 115 115M115 45 45 115" stroke="${ink}" stroke-width="13"/>${slash}`),
 buslane:board(blue,`${car(43,62,'#fff')}<rect x="52" y="73" width="8" height="8" fill="${blue}"/><rect x="68" y="73" width="8" height="8" fill="${blue}"/><rect x="84" y="73" width="8" height="8" fill="${blue}"/>`),
 taxilane:board(blue,`<path d="M43 101h74l-9-30H52z" fill="#fff"/><path d="M64 72h32l9 18H55z" fill="#fff"/><rect x="70" y="78" width="20" height="10" fill="${blue}"/><text x="80" y="86" text-anchor="middle" font-size="10" font-weight="800" fill="#fff">TAXI</text><circle cx="60" cy="106" r="7" fill="${ink}"/><circle cx="101" cy="106" r="7" fill="${ink}"/>`),
 disablepark:board(blue,`<text x="80" y="107" text-anchor="middle" font-family="Arial,sans-serif" font-size="78" font-weight="800" fill="#fff">♿</text>`),
 children:warning(`${human(ink)}<circle cx="52" cy="56" r="7" fill="${ink}"/><path d="M52 64 43 85l8 1-5 22M52 64l10 19 8-1M45 69 34 84" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>`),
 curve:warning(`<path d="M75 119c-18-20 25-27 8-49-12-16 12-25 24-35" fill="none" stroke="${ink}" stroke-width="13" stroke-linecap="round"/>`),
 ped:warning(`<path d="M39 112h82" stroke="${ink}" stroke-width="7"/>${human(ink)}`),
 animal:warning(`<path d="M42 100c0-22 22-31 43-23l17-15 7 7-11 13c9 5 12 13 12 25H95v12H84v-13H63v13H52v-14h-10z" fill="${ink}"/><path d="m90 77 4-20 11 9" fill="${ink}"/>`),
 hill:warning(`<path d="M38 112 112 51" stroke="${ink}" stroke-width="10"/><path d="M38 112h75" stroke="${ink}" stroke-width="10"/><path d="M80 79h22l-4-12H84z" fill="${ink}"/><circle cx="87" cy="87" r="5" fill="${yellow}"/><circle cx="99" cy="87" r="5" fill="${yellow}"/>`),
 slippery:warning(`${car(48,49)}<path d="M48 112c8-11 17 11 25 0s17 11 25 0" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>`),
 speedbump:warning(`<path d="M38 111h84M47 111c6-31 60-31 66 0" fill="none" stroke="${ink}" stroke-width="10"/>`),
 railway:warning(`<path d="M43 113 117 43M43 43l74 70" stroke="${ink}" stroke-width="10"/><path d="M51 51 109 109M51 109 109 51" stroke="${ink}" stroke-width="4"/>`),
 narrow:warning(`<path d="M43 43h16l19 35 19-35h16L91 118H69z" fill="${ink}"/>`),
 rightofway:`<path d="M80 9 151 80 80 151 9 80Z" fill="${ink}"/><path d="M80 20 140 80 80 140 20 80Z" fill="${yellow}"/><path d="M80 35 125 80 80 125 35 80Z" fill="${white}"/>`,
 crossroad:warning(`<path d="M72 38h16v32h31v18H88v31H72V88H41V70h31z" fill="${ink}"/>`),
 tjunction:warning(`<path d="M40 45h80v18H89v57H71V63H40z" fill="${ink}"/>`),
 yjunction:warning(`<path d="M44 42 70 72v48h20V72l26-30-14-12-22 26-22-26z" fill="${ink}"/>`),
 roundabout:warning(`<path d="M80 42a38 38 0 1 1-32 18" fill="none" stroke="${ink}" stroke-width="12"/><path d="m47 62 2-22 19 11M104 112l20-9-2 22M112 61l-2 22-19-11" fill="${ink}"/>`),
 school:warning(`${human(ink)}<path d="M43 109h74" stroke="${ink}" stroke-width="7"/>`),
 pedcrossing:warning(`<path d="M39 109h82M48 100h14m13 0h14m13 0h14" stroke="${ink}" stroke-width="8"/>${human(ink)}`),
 cyclist:warning(`<circle cx="58" cy="106" r="13" fill="none" stroke="${ink}" stroke-width="7"/><circle cx="103" cy="106" r="13" fill="none" stroke="${ink}" stroke-width="7"/><circle cx="78" cy="52" r="8" fill="${ink}"/><path d="m78 62-13 24 23 1 15-22M65 86l-10-20M88 87l14 19" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>`),
 wild:warning(`<path d="M40 103c5-21 20-29 42-25l14-20 7 7-8 16c13 5 17 15 16 26H94v13H83v-13H63v13H51v-14H40z" fill="${ink}"/><path d="m70 78-10-17 17 8 6-17 6 20" fill="${ink}"/>`),
 hospital:board(blue,`<rect x="69" y="45" width="22" height="70" fill="#fff"/><rect x="45" y="69" width="70" height="22" fill="#fff"/>`),
 parking:board(blue,`<text x="80" y="108" text-anchor="middle" font-family="Arial,sans-serif" font-size="85" font-weight="800" fill="#fff">P</text>`),
 toll:board(blue,`<path d="M38 107h84M50 107V70h60v37M44 70h72" fill="none" stroke="#fff" stroke-width="9"/><path d="M80 43v35m0-35-13 13m13-13 13 13" stroke="#fff" stroke-width="8"/>`),
 dir:board(blue,`<path d="M36 80h61V59l30 21-30 21V80H36z" fill="#fff"/><text x="68" y="75" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" font-weight="800" fill="${blue}">N1</text>`),
 redman:board(ink,human(red)),
 greenman:board(ink,human(green)),
};
await mkdir(out,{recursive:true});
for (const [name, body] of Object.entries(icons)) await writeFile(path.join(out,`${name}.svg`),svg(body,`K53 ${name.replace(/([a-z])([A-Z])/g,'$1 $2')} road sign`));
// Failed Wikimedia HTML files are not sign assets. Remove them so they cannot be accidentally used.
for (const entry of await (await import('node:fs/promises')).readdir(out)) if (entry.endsWith('.png')) await rm(path.join(out,entry));
console.log(`Generated ${Object.keys(icons).length} self-contained vector sign assets.`);
