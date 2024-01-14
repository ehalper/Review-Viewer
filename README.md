# App Store Review Viewer Web Application
## Demo: https://youtu.be/o85EHJnm4G0
The web application allows users to view recent reviews posted on the Apple App Store for different apps and from a selection of time periods.
Users can input the app id and time period (options are to show reviews from last 48 hours, 96 hours, or from the last week) of choice.
The reviews will then populate if there were any from the specified time period. The review data will persist to allow the reviews to be viewed later.

![vidShort](https://github.com/ehalper/Review-Viewer/assets/71235972/fa8d81aa-9fef-4945-b213-2d468ae42da5)

The application uses TypeScript, React, Node, Express, HTML, CSS, and the App Store Connect RSS Feed API.

<img width="1101" alt="Screen Shot 2024-01-14 at 3 55 29 PM" src="https://github.com/ehalper/Review-Viewer/assets/71235972/70147709-8269-4109-8e61-2b15a988f45f">

### How to find an app's ID?
Search for the app name in the Apple App Store: https://www.apple.com/app-store/

When you are on the app's page in the App Store, the url will be in the following format: https://apps.apple.com/us/app/{appName}/id{appId}

### Example using Game Pigeon App with id: 1124197642
<img width="934" alt="Screen Shot 2024-01-14 at 3 34 40 PM" src="https://github.com/ehalper/Review-Viewer/assets/71235972/76388ecc-ae72-48ce-a9d9-64eee89c7f57">

### Instructions to use
1. Run "npm install" in the _server_ and _frontend_ directories to install package dependencies
2. Run "npm start" in the _server_ directory to run the server application on port 4000
3. Run "npm start" in the _frontend_ directory to run the frontend application on port 3000
4. Visit http://localhost:3000/ to begin using the application!
