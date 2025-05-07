
interface CSVParseOptions {
  delimiter?: string;
  skipHeader?: boolean;
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
export const transformJobData = (jobData: Record<string, string>[]) => {
  return jobData.map(job => ({
    title: job.title,
    impact: parseInt(job.impact),
    tasks: parseInt(job.tasks),
    aiModels: parseInt(job.aiModels),
    aiWorkloadRatio: parseFloat(job.aiWorkloadRatio),
    domain: job.domain,
    automationLevel: job.automationLevel as 'Low' | 'Medium' | 'High',
    augmentationPotential: job.augmentationPotential as 'Low' | 'Medium' | 'High',
    timeToDisruption: job.timeToDisruption,
    keySkillsToKeep: job.keySkillsToKeep.split('|')
  }));
};

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
