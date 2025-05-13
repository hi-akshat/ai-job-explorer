
# AI Job Explorer: How Fast Will AI Take Your Job?
An interactive visualization website for exploring AI's impact on different jobs and industries.

## Final Project
- INFO 247: Information Visualization and Presentation (Spring 2025)
- Professor: Dr. Marti Hearst

## Created by:
- Akshat Gupta (MIMS'25 Student, UC Berkeley, akshat.g@berkeley.edu)
- Vikramsingh Rathod (MIMS'26 Student, UC Berkeley, vikramsinghrathod@berkeley.edu)



## Overview

This project is an interactive data visualization website that helps users understand how artificial intelligence might impact various jobs and industries in the coming years. The site includes:

- Interactive job search to explore AI impact on specific roles
- Sector-level visualizations comparing different industries
- Timeline of future AI adoption trends
- Practical recommendations based on job type

## Setup & Running The Project

1. Clone this repository:
   ```
   git clone https://github.com/hi-akshat/ai-job-explorer
   cd ai-job-explorer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:8080)

## Integrating Your Data

### Job Data CSV

The site is designed to work with a CSV file containing job titles and their AI impact percentages. We already have one in place in the current repository. To integrate and work with your YOUR OWN data:

1. Place your CSV file in the `public` directory
2. Update the data loading in `src/components/JobSearch.tsx`:
   - Replace the mockJobs array with code to load your CSV file
   - Ensure your CSV has at least "title" and "impact" columns

Example CSV format:
```
title,impact,description
Software Developer,65,"AI will automate routine coding tasks but also create demand for developers who can work with AI systems."
Data Entry Clerk,85,"High risk of automation as AI can efficiently process and enter data with minimal human supervision."
```

### McKinsey/WEF Report Data

To integrate data from McKinsey and WEF reports:

1. Update the sector data in `src/pages/Index.tsx` by modifying the `sectorData` array
2. Update the timeline events in the same file by modifying the `timelineEvents` array
3. Update the statistics in the introduction section cards

## Usability Testing

Usability testing was conducted to imoprove the website and visualization design 

### Benchmark Tasks

Three benchmark tasks were included for testing:
1. Find the AI impact percentage for a specific job title
2. Compare sectors and identify growth potential
3. Identify an emerging job role from the Future Trends section

### Measurement Metrics

Key metrics to collect during testing:
- Time on task
- Task success rate
- Error rate
- Think-aloud comments
- Mouse movement patterns

### Questionnaire

A post-test questionnaire with Likert-scale questions was included to gather user feedback on:
- Navigation ease
- Visualization effectiveness
- Information finding
- Clarity of presentation
- Knowledge gain

## Project Structure

- `src/pages/Index.tsx` - Main page with all sections
- `src/components/` - Reusable visualization components:
  - `GaugeChart.tsx` - Semicircular gauge for showing percentages
  - `BarChart.tsx` - Bar chart for comparing sectors
  - `IsotypeChart.tsx` - Icon-based chart for showing percentages
  - `TimelineChart.tsx` - Timeline visualization
  - `JobSearch.tsx` - Interactive job search and results component
  - `Navigation.tsx` - Site navigation

## Design Principles Applied

This project applies several information visualization principles:

1. **Gestalt Principles**:
   - Proximity: Related information is grouped together
   - Similarity: Consistent color coding for similar data points
   - Continuity: Timeline and progress bars guide the eye
   - Figure-Ground: Clear contrast between data and background

2. **Visual Embellishment**: Icons and illustrations enhance data understanding without distraction

3. **Mnemonic Color Coding**: Consistent colors represent risk levels (red for high risk, green for low)

4. **Progressive Disclosure**: Information is revealed as users scroll and interact

## Customization

- Color scheme can be modified in `src/index.css` and `tailwind.config.ts`
- Visualizations can be customized in their respective component files
- Content can be updated in `src/pages/Index.tsx`

## Technologies Used

- React with TypeScript
- D3.js (via custom chart components)
- Tailwind CSS for styling
- Shadcn UI components

## Credits

- Data sourced from McKinsey Global Institute and World Economic Forum reports

## Data Sources

- Kaggle Dataset: From Data Entry to CEO: The AI Job Threat Index (https://www.kaggle.com/datasets/manavgupta92/from-data-entry-to-ceo-the-ai-job-threat-index)
- McKinsey Report: Superagency in the workplace: Empowering people to unlock AI’s full potential (https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/superagency-in-the-workplace-empowering-people-to-unlock-ais-full-potential-at-work)
- World Economic Forum (WEF) Report: The Future of Jobs Report 2025 (https://www.weforum.org/publications/the-future-of-jobs-report-2025/) 
