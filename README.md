# Career Compass: A Web-Based Career Guidance Tool

**Career Compass** is a simple yet effective web application designed to help students in India make informed decisions about their academic and professional futures after completing their 10th and 12th grades. It replaces confusion with clarity by using a carefully designed quiz to provide personalized stream and career path recommendations.

---

## Features

- **Dual Paths**  
  Separate, tailored questionnaires for students after 10th grade and 12th grade.

- **Intelligent Scoring System**  
  A weighted scoring logic provides nuanced and accurate recommendations based on all of the user's answers.

- **Detailed Results**  
  The results page displays a primary and a secondary recommendation, complete with an affinity score breakdown for all potential streams.

- **Comprehensive Guidance**  
  Each recommendation includes:
  - A detailed description of the stream.
  - An actionable "Expert Tip."
  - Lists of potential careers and top entrance exams.
  - Links to relevant courses and official portals.
  - Placeholder for a career path flowchart.

- **Progress Saver**  
  The application automatically saves quiz progress in the browser, allowing users to resume if they refresh the page.

- **Fully Responsive**  
  A clean, mobile-first design ensures a seamless experience on all devices, from desktops to smartphones.

---

## Project Structure

The project is organized with a clear separation of data, logic, and styling.

```
career-guidance/
├── index.html # Main landing page
├── quiz.html # Quiz interface page
├── results.html # Results display page
├── README.md # Project information (this file)
├── data/
│ └── paths.json # Core data: questions, options, scores, and results
├── css/
│ └── styles.css # All styling for the application
└── js/
├── data-loader.js # Helper script to fetch JSON data
└── app.js # Core application logic
```

---

## How It Works

1. **Path Selection**  
   The user starts at `index.html` and chooses either the "After 10th Grade" or "After 12th Grade" path.

2. **Quiz Initialization**  
   The user is directed to `quiz.html`. The `app.js` script reads the path parameter from the URL and fetches the corresponding questions from `data/paths.json`.

3. **Answering Questions**  
   As the user answers questions, their selections are saved to the browser's `localStorage` to prevent data loss on page refresh.

4. **Score Calculation**  
   Once the quiz is complete, the answers are passed as URL parameters to the `results.html` page.

5. **Dynamic Results**  
   On the results page, `app.js` reads the answers, calculates a total score for each potential stream based on the logic in `paths.json`, and then dynamically generates the entire results page, including the score breakdown and the detailed recommendation cards.

---

Feel free to contribute or provide feedback to improve this tool!
