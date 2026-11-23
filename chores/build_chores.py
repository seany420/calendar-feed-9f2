"""Builds the bar-prep chore plan: Specter events JSON, an .ics, and a printable chart.
Edit EVENTS / DAUGHTER below and re-run: python3 chores/build_chores.py
"""
import json, random, string, datetime as dt, html, os

HERE = os.path.dirname(os.path.abspath(__file__))
START = dt.date(2026, 11, 23)          # Mon, BarBri week 1
UNTIL = "2027-02-26"                   # Fri of exam week
IN_OFFICE_FRI = ["2026-12-11", "2027-01-08", "2027-01-22", "2027-02-05", "2027-02-19"]
DAYNAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

random.seed(20261123)
def new_id():
    return "mch" + "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(10))

def first_on_or_after(days):
    d = START
    while (d.isoweekday() % 7) not in days:
        d += dt.timedelta(days=1)
    return d.isoformat()

# (title, days[0=Sun], time, minutes, notes, until, excluded)
SEAN = [
    ("HOME · Sean · Morning reset + slow cooker", [1], "07:00", 15,
     "Office day. Unload dishwasher. Start the slow cooker (or pull leftovers to thaw). Coffee made before you leave.", UNTIL, []),
    ("HOME · Sean · Morning reset", [2, 3, 4, 5], "07:30", 15,
     "Unload dishwasher, coffee + breakfast out for her.\nTue: start laundry load (hers + shared).\nFri: strip beds, start sheets + towels.", UNTIL, ["2026-12-25", "2027-02-23", "2027-02-24"]),
    ("HOME · Sean · Laundry to dryer + quick pickup", [2], "12:00", 20,
     "Lunch break. Wash to dryer. 10-minute pickup of the living room.", UNTIL, []),
    ("HOME · Sean · Vacuum + grocery order", [3], "12:00", 40,
     "She's at the library: go loud. Vacuum every floor. Then place the grocery order for Thursday 5 PM pickup.", UNTIL, []),
    ("HOME · Sean · Kitchen deep wipe + fridge cleanout", [4], "12:00", 20,
     "Toss old leftovers before trash night. Wipe microwave, stovetop, fridge shelves.", UNTIL, ["2026-11-26"]),
    ("HOME · Sean · Sheets to dryer (quietly)", [5], "12:00", 15,
     "She's studying at home. Quiet chores only. On in-office Fridays this moves to 5 PM.", UNTIL, IN_OFFICE_FRI + ["2026-12-25"]),
    ("HOME · Sean · Fold + put away laundry", [2], "17:00", 20,
     "Before she gets home. She shouldn't walk in to a pile.", UNTIL, []),
    ("HOME · Sean · Grocery pickup + put away", [4], "17:00", 30, "", UNTIL, ["2026-11-26"]),
    ("HOME · Sean · Fold sheets + make beds", [5], "17:00", 30,
     "Her 5 PM check-in is happening. Keep it quiet. In-office Fridays: dryer at 5, fold at 6.", UNTIL, ["2026-12-25"]),
    ("HOME · Sean · Cook dinner", [2, 3, 4], "17:30", 45,
     "Dinner on the table by 6:15. Wed: daughter cooks with you if she's home.", UNTIL, ["2026-11-26", "2026-12-24", "2026-12-31"]),
    ("HOME · Sean · Dinner (slow cooker / leftovers)", [1], "18:00", 30, "", UNTIL, []),
    ("HOME · Sean · Easy Friday dinner", [5], "17:45", 30,
     "Takeout or something simple. Her week is done when the check-in is.", UNTIL, ["2026-12-25", "2027-01-29"]),
    ("HOME · Sean + daughter · Week huddle", [1], "20:30", 15,
     "Get her schedule for the week. Anything she can't cover, you take or you swap. Write it on the fridge chart.", UNTIL, []),
    ("HOME · Sean · Pack her bag for tomorrow", [1, 2, 3], "21:00", 10,
     "Lunch, snacks, water bottle, headphones, laptop charger. Tue = Forum, Wed/Thu = library.", "2027-02-17",
     ["2026-11-25", "2026-12-23", "2026-12-30", "2027-01-06"]),
]

DAUGHTER = {
    1: ("Kitchen close after dinner (load + run dishwasher, wipe counters, sweep)",
        "Empty every small trash can into the big bin",
        "Mom studies at home 9:30 to 5: quiet house"),
    2: ("Kitchen close after dinner",
        "Set the table before dinner",
        "Wipe down the dining table + coffee table"),
    3: ("Kitchen close after dinner",
        "Your own laundry, start to finish",
        "Help cook dinner if you're home"),
    4: ("Kitchen close after dinner",
        "Bathrooms: toilet, sink, mirror, fresh towels",
        "Trash + recycling to the curb"),
    5: ("Kitchen close after dinner",
        "Reset shared spaces for the weekend (shoes, bags, blankets)",
        "Mom studies at home till 5:30: quiet house"),
}

ONE_OFFS = [
    ("2026-11-26", None, None, "HOME · Thanksgiving half day",
     "She studies 9:30 to 12:30. House stays quiet till then. Nobody asks her to cook."),
    ("2026-12-14", None, None, "HOME · Check in with her: still feeling good about Feb?",
     "Last day for the 60% exam refund. Just ask how she's doing. No pressure either way."),
    ("2027-01-05", None, None, "HOME · SIM MBE DAY: her pick for dinner",
     "200 questions over 2 days. Tonight: her favorite dinner, no questions about the house."),
    ("2027-01-07", None, None, "HOME · Mom + daughter day",
     "Her day off with your daughter. Daughter's Thursday chores move to Sean today."),
    ("2027-01-29", "19:00", 30, "HOME · Sean · Dinner after her mock exam",
     "ExamSoft mock at 5:30. House silent from 5:30. Dinner at 7."),
    ("2027-02-03", None, None, "HOME · SIM WRITTEN DAY: her pick for dinner",
     "Full-day written sim. Tonight is hers."),
    ("2027-02-10", None, None, "HOME · SIM HALF-DAY WRITTEN: her pick for dinner", ""),
    ("2027-02-16", None, None, "HOME · FINAL MBE PRACTICE: her pick for dinner", ""),
    ("2027-02-19", None, None, "HOME · Ask: ExamSoft mock done?",
     "Mandatory mock deadline is today. One gentle ask."),
    ("2027-02-22", "20:00", 20, "HOME · Sean · Pack exam bag with her",
     "Admittance ticket, photo ID, laptop + charger, earplugs if allowed, lunch, snacks, water, layers. Gas in the car."),
    ("2027-02-23", "06:30", 15, "HOME · Sean · Exam day 1: breakfast + coffee ready",
     "Essays + PT. You and your daughter cover every chore today and tomorrow."),
    ("2027-02-24", "06:30", 15, "HOME · Sean · Exam day 2: breakfast + coffee ready",
     "MBE day. Last one. Plan something for when she walks out."),
    ("2027-02-25", None, None, "HOME · She's done. Chore chart retires Friday.",
     "Talk about how chores split going forward."),
]

def build():
    events = []
    for title, days, time, dur, notes, until, excl in SEAN:
        e = {"id": new_id(), "title": title, "date": first_on_or_after(days), "time": time, "dur": dur,
             "rec": {"freq": "weekly", "days": days, "until": until}, "rem": "", "notes": notes}
        if excl:
            e["excluded"] = sorted(excl)
        events.append(e)
    for day, tasks in DAUGHTER.items():
        excl = ["2027-01-07"] if day == 4 else (["2026-12-25"] if day == 5 else [])
        e = {"id": new_id(), "title": f"HOME · Daughter · {DAYNAMES[day]} chores", "date": first_on_or_after([day]),
             "time": None, "dur": None, "rec": {"freq": "weekly", "days": [day], "until": UNTIL}, "rem": "",
             "notes": "Any time before 8 PM.\n" + "\n".join("- " + t for t in tasks) +
                      "\nSchedule clash? Swap it with Dad at Monday huddle."}
        if excl:
            e["excluded"] = excl
        events.append(e)
    for date, time, dur, title, notes in ONE_OFFS:
        events.append({"id": new_id(), "title": title, "date": date, "time": time, "dur": dur,
                       "rec": None, "rem": "", "notes": notes})
    todos = [
        {"id": new_id(), "title": "Get daughter's schedule + fill in the chore chart", "due": START.isoformat(), "done": False},
        {"id": new_id(), "title": "Confirm trash pickup night (chart says Thu)", "due": START.isoformat(), "done": False},
        {"id": new_id(), "title": "Print chore chart + put it on the fridge", "due": START.isoformat(), "done": False},
    ]
    return events, todos

def ics_escape(s):
    return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")

def fold(line):
    out, b = [], line.encode()
    while len(b) > 75:
        cut = 75
        while (b[cut] & 0xC0) == 0x80:
            cut -= 1
        out.append(b[:cut].decode()); b = b" " + b[cut:]
    out.append(b.decode())
    return "\r\n".join(out)

def to_ics(events, todos):
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SPECTER//Bar Prep Chores//EN", "CALSCALE:GREGORIAN",
         "X-WR-CALNAME:Bar Prep Chores", "X-WR-TIMEZONE:America/Los_Angeles",
         "BEGIN:VTIMEZONE", "TZID:America/Los_Angeles",
         "BEGIN:DAYLIGHT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
         "TZOFFSETFROM:-0800", "TZOFFSETTO:-0700", "END:DAYLIGHT",
         "BEGIN:STANDARD", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
         "TZOFFSETFROM:-0700", "TZOFFSETTO:-0800", "END:STANDARD", "END:VTIMEZONE"]
    byday = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
    for e in events:
        d = e["date"].replace("-", "")
        L += ["BEGIN:VEVENT", f"UID:{e['id']}@specter", f"DTSTAMP:{stamp}", fold("SUMMARY:" + ics_escape(e["title"]))]
        if e["time"]:
            start = dt.datetime.strptime(e["date"] + e["time"], "%Y-%m-%d%H:%M")
            end = start + dt.timedelta(minutes=e["dur"] or 60)
            L += [f"DTSTART;TZID=America/Los_Angeles:{start:%Y%m%dT%H%M%S}",
                  f"DTEND;TZID=America/Los_Angeles:{end:%Y%m%dT%H%M%S}"]
        else:
            nxt = (dt.date.fromisoformat(e["date"]) + dt.timedelta(days=1)).strftime("%Y%m%d")
            L += [f"DTSTART;VALUE=DATE:{d}", f"DTEND;VALUE=DATE:{nxt}", "TRANSP:TRANSPARENT"]
        r = e["rec"]
        if r:
            u = dt.date.fromisoformat(r["until"])
            until = (u + dt.timedelta(days=1)).strftime("%Y%m%dT075959Z") if e["time"] else u.strftime("%Y%m%d")
            L.append(f"RRULE:FREQ=WEEKLY;BYDAY={','.join(byday[x] for x in r['days'])};UNTIL={until}")
            for x in e.get("excluded", []):
                xd = x.replace("-", "")
                L.append(f"EXDATE;TZID=America/Los_Angeles:{xd}T{e['time'].replace(':', '')}00" if e["time"]
                         else f"EXDATE;VALUE=DATE:{xd}")
        if e["notes"]:
            L.append(fold("DESCRIPTION:" + ics_escape(e["notes"])))
        L += ["CATEGORIES:HOME", "END:VEVENT"]
    for t in todos:
        L += ["BEGIN:VTODO", f"UID:{t['id']}@specter", f"DTSTAMP:{stamp}", fold("SUMMARY:" + ics_escape(t["title"])),
              f"DUE;VALUE=DATE:{t['due'].replace('-', '')}", "STATUS:NEEDS-ACTION", "END:VTODO"]
    L.append("END:VCALENDAR")
    return "\r\n".join(L) + "\r\n"

if __name__ == "__main__":
    events, todos = build()
    with open(os.path.join(HERE, "specter-chores.json"), "w") as f:
        json.dump({"app": "SPECTER", "note": "Append 'events' and 'todos' into specter-data.json",
                   "events": events, "todos": todos}, f, indent=2, ensure_ascii=False)
    with open(os.path.join(HERE, "chores.ics"), "w", newline="") as f:
        f.write(to_ics(events, todos))
    print(len(events), "events,", len(todos), "todos")


# ---------- printable fridge chart ----------
WHERE = {1: ("Home, studying", "Quiet 9:30 to 5"), 2: ("Forum, all day", "Out ~9 to 5"),
         3: ("Library, all day", "House is empty: go loud"), 4: ("Library, all day", "House is empty: go loud"),
         5: ("Home, studying", "Quiet 9:30 to 5:30 (check-in at 5)")}
SEAN_ROWS = {d: [] for d in range(1, 6)}
for title, days, time, dur, notes, until, excl in SEAN:
    for d in days:
        h, m = map(int, time.split(":"))
        label = f"{(h - 1) % 12 + 1}{':%02d' % m if m else ''}{'a' if h < 12 else 'p'}"
        SEAN_ROWS[d].append((time, label, title.split("· ", 2)[-1]))

def chart_html():
    cols = range(1, 6)
    def cell_list(items):
        return "".join(f'<li><span class="box"></span><span>{html.escape(t)}</span></li>' for t in items)
    head = "".join(f"<th>{['Monday','Tuesday','Wednesday','Thursday','Friday'][d-1]}</th>" for d in cols)
    where = "".join(f'<td><b>{WHERE[d][0]}</b><br><span class="sub">{WHERE[d][1]}</span></td>' for d in cols)
    sean = "".join("<td><ul>" + "".join(
        f'<li><span class="box"></span><span><span class="t">{lbl}</span> {html.escape(txt)}</span></li>'
        for _, lbl, txt in sorted(SEAN_ROWS[d])) + "</ul></td>" for d in cols)
    kid = "".join("<td><ul>" + cell_list(DAUGHTER[d]) + "</ul></td>" for d in cols)
    blank = "".join("<td class='blank'></td>" for d in cols)
    return f"""<!doctype html><html><head><meta charset="utf-8"><title>Bar Prep Chore Chart</title>
<style>
@page {{ size: letter landscape; margin: 0.35in; }}
* {{ box-sizing: border-box; }}
body {{ font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color:#1d1d1f; margin:0; font-size:9.6pt; }}
header {{ display:flex; justify-content:space-between; align-items:baseline; border-bottom:2px solid #1d1d1f; padding-bottom:4px; margin-bottom:6px; }}
h1 {{ font-size:17pt; margin:0; letter-spacing:-0.01em; }}
.meta {{ font-size:9pt; color:#555; }}
table {{ width:100%; border-collapse:collapse; table-layout:fixed; }}
th {{ background:#1d1d1f; color:#fff; font-size:10pt; padding:4px; }}
th.rowh, td.rowh {{ width:88px; }}
td {{ border:1px solid #bbb; vertical-align:top; padding:4px 5px; }}
td.rowh {{ font-weight:700; font-size:10pt; background:#f2f2f2; }}
tr.where td {{ background:#fafafa; font-size:9pt; }}
tr.where td.rowh {{ background:#f2f2f2; }}
.sub {{ color:#666; }}
ul {{ list-style:none; margin:0; padding:0; }}
li {{ display:flex; gap:5px; margin:0 0 3px; line-height:1.22; }}
.box {{ flex:0 0 10px; height:10px; border:1.3px solid #333; border-radius:2px; margin-top:2px; }}
.t {{ font-weight:700; }}
td.blank {{ height:34px; }}
.rowh small {{ display:block; font-weight:400; color:#666; font-size:8pt; }}
.foot {{ display:grid; grid-template-columns: 1.15fr 1fr; gap:14px; margin-top:7px; font-size:8.8pt; }}
.foot h2 {{ font-size:10pt; margin:0 0 3px; }}
.foot ul li {{ display:block; margin-bottom:2px; }}
.rule {{ background:#f2f2f2; border-left:4px solid #1d1d1f; padding:5px 8px; margin-top:6px; font-size:9.4pt; }}
</style></head><body>
<header><h1>Bar Prep Chore Chart</h1>
<div class="meta">Week of ________ &nbsp;·&nbsp; Nov 23 to Feb 26 &nbsp;·&nbsp; Exam: Tue-Wed, Feb 23-24</div></header>
<table>
<tr><th class="rowh"></th>{head}</tr>
<tr class="where"><td class="rowh">Mom is</td>{where}</tr>
<tr><td class="rowh">Dad<small>Mon is office day</small></td>{sean}</tr>
<tr><td class="rowh">Daughter<small>any time before 8p</small></td>{kid}</tr>
<tr><td class="rowh">Her schedule<small>fill in Mon huddle</small></td>{blank}</tr>
<tr><td class="rowh">Swaps</td>{blank}</tr>
</table>
<div class="rule">Mom's only job is the bar. If something's on this chart and it doesn't get done, Dad does it. Nobody hands it back to her.</div>
<div class="foot">
<div><h2>Dates that change the week</h2><ul>
<li><b>Thu Nov 26</b> Thanksgiving. She studies till 12:30. Quiet till then.</li>
<li><b>Dec 24, Dec 31, Jan 1</b> Her half days at home. Quiet till 12:30.</li>
<li><b>Fri Dec 25</b> Christmas. Chart off.</li>
<li><b>Tue Jan 5, Wed Feb 3, Wed Feb 10, Tue Feb 16</b> Practice exam days. Her pick for dinner.</li>
<li><b>Thu Jan 7</b> Mom + daughter day. Dad covers daughter's chores.</li>
<li><b>Fri Jan 29</b> ExamSoft mock at 5:30. Silent house, dinner at 7.</li>
<li><b>Mon Feb 22</b> Pack her exam bag together at 8p.</li>
<li><b>Tue-Wed Feb 23-24</b> Exam. Breakfast at 6:30. Dad + daughter do everything.</li>
</ul></div>
<div><h2>Dad's in-office Fridays</h2><ul>
<li>Dec 11, Jan 8, Jan 22, Feb 5, Feb 19: sheets go to the dryer at 5, fold at 6.</li></ul>
<h2 style="margin-top:6px">House rules for Mon + Fri</h2><ul>
<li>No vacuum, no blender, no loud calls 9:30 to 12:30 and 1:30 to 5.</li>
<li>Her lunch is 12:30 to 1:30. Leave her be unless she comes to you.</li>
<li>Trash night is set to Thursday. Change it if pickup is a different day.</li></ul></div>
</div></body></html>"""

if __name__ == "__main__":
    with open(os.path.join(HERE, "chore-chart.html"), "w") as f:
        f.write(chart_html())
