
import { fetchCSV, transformJobData, transformSectorData, transformSkillsData, transformTimelineEvents } from '../utils/csvParser';

export interface Job {
  title: string;
  impact: number;
  tasks: number;
  aiModels: number;
  aiWorkloadRatio: number;
  domain: string;
  automationLevel: 'Low' | 'Medium' | 'High';
  augmentationPotential: 'Low' | 'Medium' | 'High';
  timeToDisruption: string;
  keySkillsToKeep: string[];
}

// Function to load job data from CSV
export const getJobData = async (): Promise<Job[]> => {
  try {
    const jobDataCSV = await fetchCSV('/data/job_data.csv');
    return transformJobData(jobDataCSV);
  } catch (error) {
    console.error('Error loading job data:', error);
    return [];
  }
};

// Function to load sector data from CSV
export const getSectorData = async () => {
  try {
    const sectorDataCSV = await fetchCSV('/data/sector_data.csv');
    return transformSectorData(sectorDataCSV);
  } catch (error) {
    console.error('Error loading sector data:', error);
    return [];
  }
};

// Function to load skills data from CSV
export const getSkillsData = async () => {
  try {
    const skillsDataCSV = await fetchCSV('/data/skills_data.csv');
    return transformSkillsData(skillsDataCSV);
  } catch (error) {
    console.error('Error loading skills data:', error);
    return [];
  }
};

// Function to load timeline events from CSV
export const getTimelineEvents = async () => {
  try {
    const timelineEventsCSV = await fetchCSV('/data/timeline_events.csv');
    return transformTimelineEvents(timelineEventsCSV);
  } catch (error) {
    console.error('Error loading timeline events:', error);
    return [];
  }
};

// Export default jobData for backward compatibility with any component that might be using it directly
// This will be loaded asynchronously when needed but provides fallback static data
let jobData: Job[] = [];

// Pre-load the data for components that directly import jobData
getJobData().then(data => {
  if (data.length > 0) {
    jobData = data;
  }
}).catch(error => {
  console.error('Failed to preload job data:', error);
});

export default jobData;

// Legacy data exports for backward compatibility
export const sectorData = [
  { label: 'Healthcare', value: 22, color: '#0EA5E9', description: 'Expected to add 3-4M jobs (U.S.)' },
  { label: 'STEM', value: 23, color: '#9381FF', description: '23% projected demand increase by 2030' },
  { label: 'Finance', value: 87, color: '#F87171', description: '87% of tasks could be automated' },
  { label: 'Retail', value: 80, color: '#F87171', description: 'Up to 80% automation potential' },
  { label: 'Manufacturing', value: 78, color: '#F87171', description: 'Up to 78% automation potential' },
  { label: 'Transportation', value: 65, color: '#F87171', description: 'Truck drivers face 65% automation risk' },
  { label: 'Education', value: 26, color: '#0EA5E9', description: 'Growing demand despite 26% automation' },
  { label: 'Creative Arts', value: 35, color: '#10B981', description: 'Human creativity still valued' }
];

export const skillsData = [
  { 
    category: "AI Complementary Skills", 
    skills: [
      { name: "Emotional Intelligence", value: 95 },
      { name: "Creative Problem Solving", value: 90 },
      { name: "Ethical Judgment", value: 88 },
      { name: "Critical Thinking", value: 85 },
      { name: "Interpersonal Communication", value: 92 },
      { name: "Adaptability", value: 87 }
    ] 
  },
  { 
    category: "Vulnerable Skills", 
    skills: [
      { name: "Data Entry", value: 10 },
      { name: "Rote Calculation", value: 5 },
      { name: "Document Search", value: 15 },
      { name: "Basic Translation", value: 20 },
      { name: "Text Generation", value: 25 },
      { name: "Image Classification", value: 30 }
    ] 
  }
];

export const timelineEvents = [
  {
    year: 2023,
    title: 'Generative AI Explosion',
    description: 'Large language models transform knowledge work across industries, with sophisticated AI assistants increasingly used for content generation, coding, and analytics.',
    iconColor: '#9381FF',
    icon: '🚀'
  },
  {
    year: 2025,
    title: 'Automation of Routine Tasks',
    description: 'Data entry, basic customer service, and routine analytical tasks become predominantly automated, with AI systems handling 80% of straightforward workflows.',
    iconColor: '#F87171',
    icon: '⚙️'
  },
  {
    year: 2027,
    title: 'New Job Categories Emerge',
    description: 'AI trainers, ethics specialists, human-AI collaboration experts, and AI system interpreters become mainstream professions with growing demand.',
    iconColor: '#0EA5E9',
    icon: '🌱'
  },
  {
    year: 2030,
    title: 'Workforce Transformation Complete',
    description: 'Over 50% of workers use AI tools daily, with 30% working in roles that didn\'t exist in 2023. Human-AI collaboration becomes the standard working model.',
    iconColor: '#10B981',
    icon: '🔄'
  }
];
