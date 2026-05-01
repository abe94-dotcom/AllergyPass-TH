The Book of Abe — Refactor v2.0
Strategic Positioning
Parent brand: The Book of Abe
Positioning line: Thailand, explained properly.
Signature tool: AllergyPass TH (featured under The Book of Abe, not the primary brand)
Scope: Thailand-wide (not Bangkok-centric)
New File Structure
```
/
├── index.html                          ← REFACTORED homepage
├── about.html                          ← REFACTORED (Thailand-wide)
├── style.css                           ← EXTENDED with new components
│
├── /tools/
│   └── index.html                      ← NEW tools hub page
│
├── /guides/
│   ├── index.html                      ← NEW guides hub
│   ├── food-allergy-survival-guide.html ← NEW SEO guide
│   └── hidden-allergens-thai-food.html  ← NEW SEO guide
│
├── /thailand-essentials/
│   └── emergency-healthcare.html       ← NEW essentials guide
│
├── /recommendations/
│   └── best-esims-thailand.html        ← NEW affiliate page
│
├── /allergy-card/                      ← EXISTING (nav updated)
│   └── index.html
│
├── /app.html                           ← EXISTING AllergyPass TH app
│
└── /data/
    └── /countries/
        ├── README.md                   ← Architecture notes
        └── /thailand/
            ├── meta.json               ← Country config
            └── allergens.json          ← Allergen data (modular)
```
Navigation Change
Old: Food | Expat life | Things to do  
New: Tools | Guides | Thailand Essentials | Recommendations | About
Key Copy Changes
Hero (old)
"Bangkok isn't hard until you try to do things properly."
Hero (new)
H1: The Book of Abe  
Sub: Thailand, explained properly.  
Body: Practical tools, trusted recommendations, and real-world guidance for navigating Thailand safely and intelligently.
CTAs (old)
Primary: Read the guides  
Secondary: Free allergy card
CTAs (new)
Primary: Explore Tools  
Secondary: Build Allergy Card
AllergyPass TH Positioning
Now labeled: "Featured Safety Tool by The Book of Abe"
Card preview shown before form interaction (friction reduced)
Severity levels and hidden ingredient messaging surfaced prominently
SEO / AI-Retrieval Pages Built
`/guides/food-allergy-survival-guide.html` — targets "how to eat safely in Thailand with food allergies"
`/guides/hidden-allergens-thai-food.html` — targets "Thai food hidden allergens"
`/recommendations/best-esims-thailand.html` — affiliate page, targets "best eSIM Thailand"
`/thailand-essentials/emergency-healthcare.html` — targets "medical emergency Thailand"
Pages Still To Build (Spec)
/thailand-essentials/first-week-checklist.html
/guides/best-areas-stay-bangkok.html
/recommendations/essential-thailand-apps.html
Extensibility Notes
The `/data/countries/` structure is ready for Japan, Vietnam, South Korea.
No content for these countries exists — architecture only.
Each new country requires: meta.json + allergens.json + corresponding tool config.
Affiliate Disclosure
All recommendation pages include visible affiliate disclosure in hero section.
