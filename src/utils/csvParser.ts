interface CSVParseOptions {
  delimiter?: string;
  skipHeader?: boolean;
}

export interface Job {
  title: string;
  impact: number;
  tasks: number;
  aiModels: number;
  aiWorkloadRatio: number;
  domain: string;
  keySkillsToKeep: string[];
  howToBeAIProof: string;
  timeToDisruption: string;
  aiImpactAssessment: string;
}

/**
 * Parses CSV data into an array of objects
 * @param csvText The CSV text to parse
 * @param options Parsing options
 * @returns An array of objects, each representing a row in the CSV
 */
export const parseCSV = (csvText: string, options: CSVParseOptions = {}) => {
  const { delimiter = ',', skipHeader = false } = options;
  
  // Split the CSV text into lines
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return [];
  }
  
  // Extract headers from the first line
  const headers = lines[0].split(delimiter).map(header => 
    // Remove quotes if present
    header.replace(/^"(.*)"$/, '$1').trim()
  );
  
  // Start from index 1 if we're skipping the header
  const startIndex = skipHeader ? 1 : 0;
  
  // Parse each line into an object
  return lines.slice(startIndex).map(line => {
    // Handle quoted values that might contain commas
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Push the last value
    values.push(currentValue);
    
    // Create an object mapping each header to its value
    return headers.reduce((obj, header, index) => {
      let value = values[index] || '';
      
      // Remove quotes if present
      value = value.replace(/^"(.*)"$/, '$1').trim();
      
      obj[header] = value;
      return obj;
    }, {} as Record<string, string>);
  });
};

/**
 * Transforms CSV job data into the Job type
 */
export function transformJobData(csvData: any[]): Job[] {
  return csvData.map(row => ({
    title: row['Job Titles'],
    impact: parseFloat(row['AI Impact']),
    tasks: parseInt(row['Tasks']),
    aiModels: parseInt(row['AI models']),
    aiWorkloadRatio: parseFloat(row['AI_Workload_Ratio']),
    domain: row['Domain'],
    keySkillsToKeep: row['Key Skills to Maintain'].split(', '),
    howToBeAIProof: row['How to Be AI-Proof'],
    timeToDisruption: row['Time to Disruption'],
    aiImpactAssessment: row['AI Impact Assessment']
  }));
}

/**
 * Transforms CSV sector data into the required format
 */
export const transformSectorData = (sectorData: Record<string, string>[]) => {
  return sectorData.map(sector => ({
    label: sector.label,
    value: parseInt(sector.value),
    color: sector.color,
    description: sector.description
  }));
};

/**
 * Transforms CSV skills data into the required format
 */
export const transformSkillsData = (skillsData: Record<string, string>[]) => {
  // Group skills by category
  const groupedSkills = skillsData.reduce((acc, skill) => {
    const category = skill.category;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push({
      name: skill.skill_name,
      value: parseInt(skill.value)
    });
    
    return acc;
  }, {} as Record<string, { name: string; value: number }[]>);
  
  // Convert to array format
  return Object.entries(groupedSkills).map(([category, skills]) => ({
    category,
    skills
  }));
};

/**
 * Transforms CSV timeline events into the required format
 */
export const transformTimelineEvents = (timelineEvents: Record<string, string>[]) => {
  return timelineEvents.map(event => ({
    year: isNaN(parseInt(event.year)) ? event.year : parseInt(event.year),
    title: event.title,
    description: event.description,
    iconColor: event.iconColor,
    icon: event.icon
  }));
};

/**
 * Fetches and parses a CSV file
 */
export const fetchCSV = async (filePath: string, options?: CSVParseOptions) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filePath}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    return parseCSV(text, options);
  } catch (error) {
    console.error(`Error fetching CSV from ${filePath}:`, error);
    return [];
  }
};
