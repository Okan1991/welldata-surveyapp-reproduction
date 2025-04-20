WellData SurveyApp reproduction

This project demonstrates a local reproduction of the `surveyapp` from the `solid-local-fresh` ecosystem, including full integration with a local Community Solid Server.

Objective
To show that the core components of the WellData ecosystem — particularly the `surveyapp` and Solid Pod interaction — can be run, tested, and extended in a local environment with full WebID-based authentication and personal pod control.

What was reproduced
- surveyapp running locally via npm run dev on http://localhost:5176
- Community Solid Server running locally on http://localhost:3000
- Solid account and WebID successfully created
- Pod created at: http://localhost:3000/Testpod/
- Login with WebID + authorization confirmed in the app
- Data integration confirmed (see SurveyTest.tsx for test marker)

How to reproduce

1. Clone the repository
   git clone https://github.com/Okan1991/welldata-surveyapp-reproduction.git
   cd welldata-surveyapp-reproduction

2. Install dependencies
   npm install
   cd surveyapp
   npm install
   cd ..

3. Start the Solid server
   npm run start:server

4. In a second terminal, start the surveyapp
   cd surveyapp
   npm run dev

5. Open in browser:
   - Survey App: http://localhost:5176
   - Solid Server: http://localhost:3000

   Create an account and pod (e.g., Testpod) and authorize the surveyapp.

Files and Folders
- Testpod/ — The Solid Pod created during this reproduction (contains WebID, profile, ACL)
- surveyapp/src/pages/SurveyTest.tsx — Custom test component confirming successful login
- .gitignore updated to include Pod directory .internal

Demo
A screen recording of the process is available (or can be provided upon request), showing:
- Terminal setup of server and app
- Browser-based login and authorization
- Pod creation and WebID usage
- SurveyApp access confirmation

Local environment
- OS: Windows 10
- Node.js: v22+
- Vite: v5.4.15
- Community Solid Server: via @solid/community-server

Author
Okan Kaya  
GitHub: https://github.com/Okan1991

Related
- WellData ecosystem: https://github.com/pvgorp/solid-local-fresh
- Solid Project: https://solidproject.org
